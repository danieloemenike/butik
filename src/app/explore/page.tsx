import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { listPublishedStores } from "@/lib/storefront"
import { buildExploreMetadata } from "@/lib/storefront/metadata"
import MarketingHeader from "@/app/_components/MarketingHeader"

export const dynamic = "force-dynamic"

export const metadata: Metadata = buildExploreMetadata()

type PageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const stores = await listPublishedStores(sp.q)
  const hasQuery = Boolean(sp.q?.trim())

  return (
    <div className="min-h-svh bg-surface text-ink">
      <MarketingHeader />
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
            Explore stores
          </h1>
          <p className="mt-2 text-ink-muted">
            Live storefronts published on Butik.
          </p>
        </div>

        <form className="mt-8 max-w-md" method="get" role="search">
          <label className="sr-only" htmlFor="q">
            Search stores
          </label>
          <div className="flex gap-2">
            <input
              id="q"
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Search by name, city, or slug"
              className="h-11 w-full rounded-md border border-ink/15 bg-surface-raised px-3 text-sm outline-none ring-teal focus:ring-2"
            />
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 items-center rounded-md bg-ink px-4 text-sm font-semibold text-surface-raised"
            >
              Search
            </button>
          </div>
        </form>

        {stores.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-ink/15 px-5 py-14 text-center">
            <h2 className="font-display text-lg font-medium tracking-tight">
              {hasQuery ? "No matching stores" : "No live stores yet"}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
              {hasQuery
                ? "Try another name, city, or slug."
                : "When merchants go live, their shops will appear here."}
            </p>
            {hasQuery ? (
              <Link
                href="/explore"
                className="mt-6 inline-flex min-h-11 items-center rounded-md border border-ink/15 px-4 text-sm font-semibold"
              >
                Clear search
              </Link>
            ) : null}
          </div>
        ) : (
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {stores.map((store) => (
              <li key={store.id}>
                <Link
                  href={`/${store.storeSlug}`}
                  className="flex h-full flex-col rounded-lg border border-ink/10 bg-surface-raised p-4 transition-colors hover:border-ink/25 sm:p-5"
                >
                  <div className="flex items-center gap-3">
                    {store.logoUrl ? (
                      <span className="relative h-10 w-10 overflow-hidden rounded-md bg-ink/5">
                        <Image
                          src={store.logoUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </span>
                    ) : (
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold text-white"
                        style={{ backgroundColor: store.accentColor }}
                      >
                        {store.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold tracking-tight">
                        {store.name}
                      </p>
                      {(store.city || store.country) && (
                        <p className="truncate text-xs text-ink-muted">
                          {[store.city, store.country].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  {store.tagline ? (
                    <p className="mt-3 line-clamp-2 text-sm text-ink-muted">
                      {store.tagline}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
