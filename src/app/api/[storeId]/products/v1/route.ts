import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import { requireOwnedStoreById } from "@/lib/store-access"
import { parseWritableStockQuantity } from "@/lib/commerce/policy"
import { isValidProductSlug } from "@/lib/store-identity"
import {
  buildSizeVariants,
  resolveSizeSelection,
} from "@/lib/commerce/product-variants"
import { Prisma } from "@prisma/client"

type ManualVariantBody = {
  colorId: string
  sizeId: string
  quantity?: number | null
  price: number
  discountedPrice?: number | null
  images?: { url: string }[]
}

function slugConflictResponse() {
  return NextResponse.json(
    {
      message: "A product with this URL slug already exists. Choose another.",
      field: "slug",
    },
    { status: 409 }
  )
}

function isSlugUniqueViolation(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    (error.meta?.target as string[]).includes("slug")
  )
}

export async function POST(
  req: Request,
  { params: rawParams }: { params: Promise<{ storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    const body = await req.json()
    const {
      name,
      slug,
      price,
      discountedPrice,
      description,
      categoryId,
      subcategoryId,
      colorId,
      images,
      isFeatured,
      isArchived,
      productVariant,
      quantity: rawQuantity,
    } = body

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }
    if (!slug) {
      return new NextResponse("Slug is required", { status: 400 })
    }
    if (!isValidProductSlug(slug)) {
      return NextResponse.json(
        {
          message:
            "Slug must use lowercase letters, numbers, and underscores (e.g. air_jordan_13).",
          field: "slug",
        },
        { status: 400 }
      )
    }
    if (!description) {
      return new NextResponse("Description is required", { status: 400 })
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 })
    }

    if (!price) {
      return new NextResponse("Price is required", { status: 400 })
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 })
    }

    if (!subcategoryId) {
      return new NextResponse("Subcategory id is required", { status: 400 })
    }

    if (!colorId) {
      return new NextResponse("Color id is required", { status: 400 })
    }

    const sizes = resolveSizeSelection(body)
    if ("error" in sizes) {
      return NextResponse.json(
        { message: sizes.error, field: "sizeIds" },
        { status: 400 }
      )
    }

    const stock = parseWritableStockQuantity(rawQuantity)
    if (!stock.ok) {
      return NextResponse.json(
        { message: stock.message, field: "quantity" },
        { status: 400 }
      )
    }

    const manualVariants: ManualVariantBody[] = []
    for (const variant of (productVariant || []) as ManualVariantBody[]) {
      const vStock = parseWritableStockQuantity(variant.quantity)
      if (!vStock.ok) {
        return NextResponse.json(
          { message: vStock.message, field: "productVariant.quantity" },
          { status: 400 }
        )
      }
      manualVariants.push({ ...variant, quantity: vStock.quantity })
    }

    const resolvedVariants = buildSizeVariants({
      sizeIds: sizes.sizeIds,
      colorId,
      price: Number(price),
      discountedPrice:
        discountedPrice != null ? Number(discountedPrice) : undefined,
      quantity: stock.quantity,
      images,
      manualVariants: manualVariants.map((variant) => ({
        colorId: variant.colorId,
        sizeId: variant.sizeId,
        quantity: variant.quantity ?? null,
        price: Number(variant.price),
        discountedPrice:
          variant.discountedPrice != null
            ? Number(variant.discountedPrice)
            : undefined,
        images: variant.images || [],
      })),
    })

    const createdProducts = await prismadb.$transaction(async (tx) => {
      const productCreated = await tx.product.create({
        data: {
          name,
          slug,
          description,
          price,
          discountedPrice,
          quantity: stock.quantity,
          isFeatured,
          isArchived,
          categoryId,
          subcategoryId,
          colorId,
          sizeId: sizes.sizeId,
          storeId: auth.store.id,
          images: {
            createMany: {
              data: images.map((image: { url: string }) => ({
                url: image.url,
              })),
            },
          },
        },
      })

      const productVariantCreated = await Promise.all(
        resolvedVariants.map(async (variant) => {
          return tx.productVariant.create({
            data: {
              productId: productCreated.id,
              colorId: variant.colorId,
              sizeId: variant.sizeId,
              quantity: variant.quantity,
              price: variant.price,
              discountedPrice: variant.discountedPrice,
              images: {
                createMany: {
                  data: (variant.images || []).map((image) => ({
                    url: image.url,
                    productId: productCreated.id,
                  })),
                },
              },
            },
          })
        })
      )

      return [productCreated, ...productVariantCreated]
    })

    return NextResponse.json(createdProducts)
  } catch (error) {
    console.log("[PRODUCTS_POST]", error)
    if (isSlugUniqueViolation(error)) {
      return slugConflictResponse()
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params: rawParams }: { params: Promise<{ storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get("categoryId") || undefined
    const colorId = searchParams.get("colorId") || undefined
    const sizeId = searchParams.get("sizeId") || undefined
    const isFeatured = searchParams.get("isFeatured")

    const products = await prismadb.product.findMany({
      where: {
        storeId: auth.store.id,
        categoryId,
        colorId,
        sizeId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: {
          where: { productVariantId: null },
          orderBy: { createdAt: "asc" },
        },
        category: true,
        color: true,
        size: true,
        productVariant: {
          include: {
            size: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.log("[PRODUCTS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
