import Heading from "@/components/StoreHeading"
import prismadb from "@/lib/prismadb"
import { ProductForm } from "../new/_components/ProductForm"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { isValidProductSlug } from "@/lib/store-identity"
import { slugifyStoreName } from "@/lib/store-form"
import { notFound, redirect } from "next/navigation"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ storeId: string; productId: string }>
}

export default async function EditProductPage({ params }: PageProps) {
  const { storeId, productId } = await params
  const { getUser, isAuthenticated } = getKindeServerSession()
  const userInfo = await getUser()
  const userId = userInfo?.id
  const isAuth = await isAuthenticated()

  if (!isAuth || !userId) {
    redirect("/")
  }

  const store = await prismadb.store.findFirst({
    where: { id: storeId, userId },
    select: { id: true, currency: true },
  })

  if (!store) {
    redirect("/register-business")
  }

  const [categories, product] = await Promise.all([
    prismadb.category.findMany({
      include: { subcategories: true },
    }),
    prismadb.product.findFirst({
      where: { id: productId, storeId: store.id },
      include: {
        images: {
          where: { productVariantId: null },
          orderBy: { createdAt: "asc" },
        },
        productVariant: {
          include: { images: true },
        },
      },
    }),
  ])

  if (!product) {
    notFound()
  }

  const repairedSlug = isValidProductSlug(product.slug)
    ? product.slug!
    : slugifyStoreName(product.name)

  // Persist slug repairs so storefront visibility recovers without a manual save.
  if (repairedSlug && repairedSlug !== product.slug) {
    try {
      await prismadb.product.update({
        where: { id: product.id },
        data: { slug: repairedSlug },
      })
    } catch {
      // Unique collision — leave the form value for the merchant to resolve.
    }
  }

  // Only surface true custom variants (other colors) in the advanced section.
  // Base-color size variants are regenerated from sizeIds + base price on save.
  const customVariants = product.productVariant.filter(
    (variant) => variant.colorId !== product.colorId
  )

  return (
    <main className="space-y-1">
      <Heading
        title="Edit product"
        subtitle="Update catalog details, sizes, and pricing"
        showButton={false}
      />
      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        <ProductForm
          categories={categories}
          storeCurrency={store.currency}
          initialData={{
            id: product.id,
            name: product.name,
            slug: repairedSlug,
            description: product.description,
            price: Number(product.price),
            discountedPrice:
              product.discountedPrice != null
                ? Number(product.discountedPrice)
                : null,
            quantity:
              product.quantity != null ? Number(product.quantity) : null,
            categoryId: product.categoryId,
            subcategoryId: product.subcategoryId,
            colorId: product.colorId,
            sizeId: product.sizeId,
            isFeatured: product.isFeatured,
            isArchived: product.isArchived,
            images: product.images.map((image) => ({ url: image.url })),
            productVariant: customVariants.map((variant) => ({
              colorId: variant.colorId,
              sizeId: variant.sizeId,
              quantity: variant.quantity,
              price: Number(variant.price),
              discountedPrice:
                variant.discountedPrice != null
                  ? Number(variant.discountedPrice)
                  : null,
              images: variant.images.map((image) => ({ url: image.url })),
            })),
          }}
        />
      </div>
    </main>
  )
}
