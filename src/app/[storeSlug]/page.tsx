import Link from "next/link"
import type { Metadata } from "next"
import { StorefrontShell } from "@/components/storefront/StorefrontShell"
import { BillboardHero } from "@/components/storefront/BillboardHero"
import { ProductGrid } from "@/components/storefront/ProductGrid"
import { StorefrontEmptyState } from "@/components/storefront/StorefrontEmptyState"
import {
  loadStorefrontHome,
  lookupStorefront,
  resolveStorefront,
  resolveStoreFonts,
} from "@/lib/storefront"
import { buildStoreMetadata } from "@/lib/storefront/metadata"
import { storefrontHref } from "@/lib/store-identity"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ storeSlug: string }>
  searchParams: Promise<{ preview?: string }>
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { storeSlug } = await params
  const sp = await searchParams
  const preview = sp.preview === "1"
  const resolved = await lookupStorefront(storeSlug, preview)

  if (!resolved) {
    return {
      title: "Store not found",
      robots: { index: false, follow: false },
    }
  }

  return buildStoreMetadata({
    store: resolved.store,
    isPreview: resolved.isPreview || preview,
  })
}

export default async function StoreHomePage({ params, searchParams }: PageProps) {
  const { storeSlug } = await params
  const sp = await searchParams
  const { store, isPreview } = await resolveStorefront(
    storeSlug,
    sp.preview === "1"
  )
  const data = await loadStorefrontHome(store.id)
  const fonts = resolveStoreFonts({ displayFont: store.displayFont, bodyFont: store.bodyFont })
  const slug = store.storeSlug!
  const hasCatalog =
    data.products.length > 0 ||
    data.featured.length > 0 ||
    data.billboards.length > 0

  return (
    <StorefrontShell store={store} isPreview={isPreview}>
      <div className="mb-6 sm:mb-8">
        <h1
          className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl"
          style={{ fontFamily: fonts.display }}
        >
          {store.name}
        </h1>
        {store.tagline ? (
          <p className="mt-2 max-w-xl text-sm opacity-75 sm:text-base">
            {store.tagline}
          </p>
        ) : null}
      </div>

      <BillboardHero billboards={data.billboards} />

      {!hasCatalog ? (
        <StorefrontEmptyState
          title="This shop is getting ready"
          description="Products and promotions will show up here once the store adds them."
          actionHref={
            store.phoneNumber ? `tel:${store.phoneNumber}` : undefined
          }
          actionLabel={store.phoneNumber ? "Contact store" : undefined}
          accentColor={store.accentColor}
          primaryColor={store.primaryColor}
        />
      ) : (
        <>
          {data.categories.length > 0 ? (
            <section className="mb-8 sm:mb-10">
              <h2
                className="mb-3 text-base font-semibold tracking-tight sm:mb-4 sm:text-lg"
                style={{ fontFamily: fonts.display }}
              >
                Browse
              </h2>
              <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                {data.categories.map((cat) => (
                  <li key={cat.id} className="shrink-0">
                    <Link
                      href={storefrontHref(slug, "products", {
                        preview: isPreview,
                        categoryId: cat.id,
                      })}
                      className="inline-flex min-h-10 items-center rounded-md border px-3.5 text-sm transition-opacity hover:opacity-80"
                      style={{ borderColor: `${store.primaryColor}22` }}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mb-6 sm:mb-10">
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2
                className="text-base font-semibold tracking-tight sm:text-lg"
                style={{ fontFamily: fonts.display }}
              >
                {data.featured.length ? "Featured" : "Latest"}
              </h2>
              <Link
                href={storefrontHref(slug, "products", { preview: isPreview })}
                className="min-h-10 inline-flex items-center text-sm font-medium opacity-75 hover:opacity-100"
              >
                View all
              </Link>
            </div>
            <ProductGrid
              storeSlug={slug}
              products={data.featured.length ? data.featured : data.products}
              emptyTitle="No products yet"
              emptyMessage="This store hasn’t published any products to the storefront."
              emptyActionHref={
                store.phoneNumber ? `tel:${store.phoneNumber}` : undefined
              }
              emptyActionLabel={store.phoneNumber ? "Contact store" : undefined}
              accentColor={store.accentColor}
              primaryColor={store.primaryColor}
              currency={store.currency}
              isPreview={isPreview}
            />
          </section>
        </>
      )}
    </StorefrontShell>
  )
}
