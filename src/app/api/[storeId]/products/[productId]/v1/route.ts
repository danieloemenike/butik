import prismadb from "@/lib/prismadb"
import { requireOwnedStoreById } from "@/lib/store-access"
import { parseWritableStockQuantity } from "@/lib/commerce/policy"
import { isValidProductSlug } from "@/lib/store-identity"
import {
  buildSizeVariants,
  resolveSizeSelection,
} from "@/lib/commerce/product-variants"
import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

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

export async function GET(
  _req: Request,
  {
    params: rawParams,
  }: { params: Promise<{ productId: string; storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 })
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId,
        storeId: auth.store.id,
      },
      include: {
        images: {
          where: { productVariantId: null },
          orderBy: { createdAt: "asc" },
        },
        category: true,
        size: true,
        color: true,
        productVariant: {
          include: {
            images: true,
            size: true,
            color: true,
          },
        },
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.log("[PRODUCT_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  {
    params: rawParams,
  }: { params: Promise<{ productId: string; storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 })
    }

    const product = await prismadb.product.delete({
      where: {
        id: params.productId,
        storeId: auth.store.id,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  {
    params: rawParams,
  }: { params: Promise<{ productId: string; storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    const body = await req.json()

    const {
      name,
      price,
      categoryId,
      subcategoryId,
      images,
      colorId,
      isFeatured,
      isArchived,
      quantity: rawQuantity,
      discountedPrice,
      description,
      slug,
      productVariant,
    } = body

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 })
    }

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

    const existing = await prismadb.product.findFirst({
      where: { id: params.productId, storeId: auth.store.id },
      select: { id: true },
    })
    if (!existing) {
      return new NextResponse("Product not found", { status: 404 })
    }

    const product = await prismadb.$transaction(async (tx) => {
      const variantIds = (
        await tx.productVariant.findMany({
          where: { productId: params.productId },
          select: { id: true },
        })
      ).map((v) => v.id)

      if (variantIds.length > 0) {
        await tx.image.deleteMany({
          where: { productVariantId: { in: variantIds } },
        })
        await tx.productVariant.deleteMany({
          where: { productId: params.productId },
        })
      }

      await tx.image.deleteMany({
        where: { productId: params.productId, productVariantId: null },
      })

      const updated = await tx.product.update({
        where: {
          id: params.productId,
          storeId: auth.store.id,
        },
        data: {
          name,
          price,
          discountedPrice,
          description,
          slug,
          quantity: stock.quantity,
          categoryId,
          subcategoryId,
          colorId,
          sizeId: sizes.sizeId,
          isFeatured,
          isArchived,
          images: {
            createMany: {
              data: images.map((image: { url: string }) => ({
                url: image.url,
              })),
            },
          },
        },
      })

      for (const variant of resolvedVariants) {
        await tx.productVariant.create({
          data: {
            productId: updated.id,
            colorId: variant.colorId,
            sizeId: variant.sizeId,
            quantity: variant.quantity,
            price: variant.price,
            discountedPrice: variant.discountedPrice,
            images: {
              createMany: {
                data: (variant.images || []).map((image) => ({
                  url: image.url,
                  productId: updated.id,
                })),
              },
            },
          },
        })
      }

      return updated
    })

    return NextResponse.json(product)
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error)
    if (isSlugUniqueViolation(error)) {
      return slugConflictResponse()
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}
