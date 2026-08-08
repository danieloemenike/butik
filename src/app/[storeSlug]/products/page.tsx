import Link from "next/link"
import type { Metadata } from "next"
import { StorefrontShell } from "@/components/storefront/StorefrontShell"
import { ProductGrid } from "@/components/storefront/ProductGrid"
import {
  resolveStoreFonts,
  loadStorefrontCatalog,
  lookupStorefront,
  resolveStorefront,
} from "@/lib/storefront"
import { buildStoreMetadata } from "@/lib/storefront/metadata"
import { storefrontHref } from "@/lib/store-identity"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ storeSlug: string }>
  searchParams: Promise<{
    preview?: string
    categoryId?: string
    featured?: string
  }>
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { storeSlug } = await params
  const sp = await searchParams
  const resolved = await lookupStorefront(storeSlug, sp.preview === "1")

  if (!resolved) {
    return {
      title: "Store not found",
      robots: { index: false, follow: false },
    }
  }

  return buildStoreMetadata({
    store: resolved.store,
    isPreview: resolved.isPreview || sp.preview === "1",
    title: `Shop · ${resolved.store.name}`,
    description:
      resolved.store.tagline ||
      `Browse products from ${resolved.store.name} on Butik.`,
    path: `/${resolved.store.storeSlug}/products`,
  })
}

export default async function StoreCatalogPage({
  params,
  searchParams,
}: PageProps) {
  const { storeSlug } = await params
  const sp = await searchParams
  const { store, isPreview } = await resolveStorefront(
    storeSlug,
    sp.preview === "1"
  )
  const data = await loadStorefrontCatalog(store.id, {
    categoryId: sp.categoryId,
    featured: sp.featured === "1",
  })
  const fonts = resolveStoreFonts({ displayFont: store.displayFont, bodyFont: store.bodyFont })
  const slug = store.storeSlug!
  const filtered = Boolean(sp.categoryId || sp.featured === "1")

  return (
    <StorefrontShell store={store} isPreview={isPreview}>
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ fontFamily: fonts.display }}
          >
            Shop
          </h1>
          <p className="mt-1 text-sm opacity-70">
            {data.products.length} product
            {data.products.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href={storefrontHref(slug, "home", { preview: isPreview })}
          className="inline-flex min-h-10 items-center text-sm font-medium opacity-75 hover:opacity-100"
        >
          ← Back to store
        </Link>
      </div>

      {data.categories.length > 0 ? (
        <ul className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mb-8 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <li className="shrink-0">
            <Link
              href={storefrontHref(slug, "products", { preview: isPreview })}
              className="inline-flex min-h-10 items-center rounded-md border px-3.5 text-sm"
              style={{
                borderColor: `${store.primaryColor}22`,
                backgroundColor: !sp.categoryId
                  ? `${store.accentColor}18`
                  : undefined,
              }}
            >
              All
            </Link>
          </li>
          {data.categories.map((cat) => (
            <li key={cat.id} className="shrink-0">
              <Link
                href={storefrontHref(slug, "products", {
                  preview: isPreview,
                  categoryId: cat.id,
                })}
                className="inline-flex min-h-10 items-center rounded-md border px-3.5 text-sm"
                style={{
                  borderColor: `${store.primaryColor}22`,
                  backgroundColor:
                    sp.categoryId === cat.id
                      ? `${store.accentColor}18`
                      : undefined,
                }}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <ProductGrid
        storeSlug={slug}
        products={data.products}
        emptyTitle={filtered ? "No matches" : "No products yet"}
        emptyMessage={
          filtered
            ? "Nothing matches this filter. Try another category or view all products."
            : "This store hasn’t published any products to the storefront."
        }
        emptyActionHref={
          filtered
            ? storefrontHref(slug, "products", { preview: isPreview })
            : store.phoneNumber
              ? `tel:${store.phoneNumber}`
              : undefined
        }
        emptyActionLabel={
          filtered ? "View all products" : store.phoneNumber ? "Contact store" : undefined
        }
        accentColor={store.accentColor}
        primaryColor={store.primaryColor}
        currency={store.currency}
        isPreview={isPreview}
      />
    </StorefrontShell>
  )
}
