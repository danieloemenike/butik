import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { StorefrontShell } from "@/components/storefront/StorefrontShell"
import { ProductPurchasePanel } from "@/components/storefront/ProductPurchasePanel"
import {
  resolveStoreFonts,
  formatNaira,
  loadStorefrontProduct,
  lookupStorefront,
  resolveStorefront,
} from "@/lib/storefront"
import { normalizeProductStock } from "@/lib/commerce/policy"
import { buildProductMetadata } from "@/lib/storefront/metadata"
import { storefrontHref } from "@/lib/store-identity"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ storeSlug: string; productSlug: string }>
  searchParams: Promise<{ preview?: string }>
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { storeSlug, productSlug } = await params
  const sp = await searchParams
  const resolved = await lookupStorefront(storeSlug, sp.preview === "1")
  if (!resolved) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    }
  }

  const product = await loadStorefrontProduct(resolved.store.id, productSlug)
  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false, follow: false },
    }
  }

  return buildProductMetadata({
    store: resolved.store,
    product,
    isPreview: resolved.isPreview || sp.preview === "1",
  })
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { storeSlug, productSlug } = await params
  const sp = await searchParams
  const { store, isPreview } = await resolveStorefront(
    storeSlug,
    sp.preview === "1"
  )
  const product = await loadStorefrontProduct(store.id, productSlug)
  if (!product) notFound()

  const fonts = resolveStoreFonts({ displayFont: store.displayFont, bodyFont: store.bodyFont })
  const slug = store.storeSlug!
  const price = product.discountedPrice ?? product.price
  const images = product.images

  return (
    <StorefrontShell store={store} isPreview={isPreview}>
      <Link
        href={storefrontHref(slug, "products", { preview: isPreview })}
        className="mb-5 inline-flex min-h-10 items-center text-sm font-medium opacity-75 hover:opacity-100 sm:mb-6"
      >
        ← Shop
      </Link>

      <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-black/[0.04] sm:aspect-[4/5]">
            {images[0] ? (
              <Image
                src={images[0].url}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm opacity-40">
                No image
              </div>
            )}
          </div>
          {images.length > 1 ? (
            <ul className="grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((img) => (
                <li
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-md bg-black/[0.04]"
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="md:pt-1">
          {product.category ? (
            <p className="text-sm opacity-60">{product.category.name}</p>
          ) : null}
          <h1
            className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl"
            style={{ fontFamily: fonts.display }}
          >
            {product.name}
          </h1>
          <p className="mt-3 text-xl font-medium">{formatNaira(price, store.currency)}</p>
          {product.discountedPrice &&
          Number(product.discountedPrice) < Number(product.price) ? (
            <p className="mt-1 text-sm line-through opacity-50">
              {formatNaira(product.price, store.currency)}
            </p>
          ) : null}

          {product.description ? (
            <p className="mt-5 text-sm leading-relaxed opacity-80 sm:mt-6">
              {product.description}
            </p>
          ) : null}

          <dl className="mt-6 space-y-3 text-sm">
            {product.color ? (
              <div className="flex items-center gap-2">
                <dt className="opacity-60">Color</dt>
                <dd className="flex items-center gap-2 font-medium">
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full border"
                    style={{
                      backgroundColor: product.color.value,
                      borderColor: `${store.primaryColor}22`,
                    }}
                  />
                  {product.color.name}
                </dd>
              </div>
            ) : null}
            {product.size && product.productVariant.length === 0 ? (
              <div className="flex gap-2">
                <dt className="opacity-60">Size</dt>
                <dd className="font-medium">{product.size.name}</dd>
              </div>
            ) : null}
          </dl>

          {store.phoneNumber ? (
            <a
              href={`tel:${store.phoneNumber}`}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md border px-4 text-sm font-semibold sm:w-auto"
              style={{ borderColor: `${store.primaryColor}22` }}
            >
              Contact store
            </a>
          ) : null}

          <ProductPurchasePanel
            productId={product.id}
            productName={product.name}
            baseUnitPrice={Number(price)}
            baseQuantity={normalizeProductStock(product.quantity)}
            imageUrl={images[0]?.url}
            accentColor={store.accentColor}
            primaryColor={store.primaryColor}
            currency={store.currency}
            disabled={isPreview}
            disabledReason="Checkout is disabled while previewing a store that is not live."
            variants={product.productVariant.map((v) => ({
              id: v.id,
              price: Number(v.price),
              discountedPrice:
                v.discountedPrice != null ? Number(v.discountedPrice) : null,
              quantity: v.quantity,
              label: [v.color?.name, v.size?.name].filter(Boolean).join(" · "),
              imageUrl: v.images[0]?.url,
            }))}
          />
        </div>
      </div>
    </StorefrontShell>
  )
}
