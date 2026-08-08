import Link from "next/link"
import Image from "next/image"
import type { StorefrontStore } from "@/lib/storefront"
import { storefrontHref } from "@/lib/store-identity"
import { resolveStoreFonts } from "@/lib/storefront/fonts"
import { StorefrontCartLink } from "@/components/storefront/StorefrontCartLink"
import { StorefrontThemeScope } from "@/components/storefront/StorefrontThemeScope"

type Props = {
  store: StorefrontStore
  isPreview?: boolean
  children: React.ReactNode
}

export function StorefrontShell({ store, isPreview, children }: Props) {
  const slug = store.storeSlug!
  const preview = Boolean(isPreview)
  const fonts = resolveStoreFonts({
    displayFont: store.displayFont,
    bodyFont: store.bodyFont,
  })

  return (
    <StorefrontThemeScope
      scopeKey={store.id}
      className="flex min-h-svh flex-col"
      theme={{
        primaryColor: store.primaryColor,
        accentColor: store.accentColor,
        backgroundColor: store.backgroundColor,
        darkPrimaryColor: store.darkPrimaryColor,
        darkAccentColor: store.darkAccentColor,
        darkBackgroundColor: store.darkBackgroundColor,
        colorMode: store.colorMode,
        displayFont: store.displayFont,
        bodyFont: store.bodyFont,
      }}
    >
      {isPreview ? (
        <div
          className="px-4 py-2.5 text-center text-xs font-medium text-white sm:text-sm"
          style={{ backgroundColor: "var(--sf-accent)" }}
        >
          Preview — this storefront is not live yet
        </div>
      ) : null}

      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{
          borderColor: "color-mix(in srgb, var(--sf-primary) 12%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--sf-bg) 93%, transparent)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 md:px-6">
          <Link
            href={storefrontHref(slug, "home", { preview })}
            className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={
              {
                ["--tw-ring-color" as string]: "var(--sf-accent)",
              } as React.CSSProperties
            }
          >
            {store.logoUrl ? (
              <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md sm:h-9 sm:w-9">
                <Image
                  src={store.logoUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              </span>
            ) : null}
            <span
              className="truncate text-base font-semibold tracking-tight sm:text-lg"
              style={{ fontFamily: fonts.display }}
            >
              {store.name}
            </span>
          </Link>
          <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              href={storefrontHref(slug, "products", { preview })}
              className="inline-flex min-h-10 items-center rounded-md px-3 text-sm font-medium opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2"
            >
              Shop
            </Link>
            {store.phoneNumber ? (
              <a
                href={`tel:${store.phoneNumber}`}
                className="inline-flex min-h-10 items-center rounded-md px-3 text-sm font-medium opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2"
              >
                Contact
              </a>
            ) : null}
            <StorefrontCartLink storeSlug={slug} preview={preview} />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8 md:px-6 md:py-10">
        {children}
      </main>

      <footer
        className="mt-auto border-t py-8 sm:py-10"
        style={{
          borderColor: "color-mix(in srgb, var(--sf-primary) 12%, transparent)",
        }}
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 text-sm opacity-70 md:px-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              style={{ fontFamily: fonts.display }}
              className="font-medium opacity-100"
            >
              {store.name}
            </p>
            {(store.city || store.country) && (
              <p className="mt-1">
                {[store.city, store.country].filter(Boolean).join(", ")}
              </p>
            )}
            {store.phoneNumber ? (
              <p className="mt-1">
                <a
                  href={`tel:${store.phoneNumber}`}
                  className="underline-offset-2 hover:underline"
                >
                  {store.phoneNumber}
                </a>
              </p>
            ) : null}
          </div>
          <Link
            href={storefrontHref(slug, "products", { preview })}
            className="text-sm font-medium opacity-90 underline-offset-4 hover:underline"
          >
            Browse products
          </Link>
        </div>
      </footer>
    </StorefrontThemeScope>
  )
}
