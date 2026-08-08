import { slugifyStoreName } from "@/lib/store-form"

/**
 * First path segments reserved for the Next.js app.
 * Prevents creating store slugs that collide with static routes.
 */
export const RESERVED_STORE_SLUGS = new Set([
  "api",
  "auth",
  "business",
  "explore",
  "register-business",
  "store",
  "login",
  "logout",
  "dashboard",
  "settings",
  "admin",
  "account",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "storefront-offline",
])

/** Preserve underscore slug grammar used by slugifyStoreName. */
export function normalizeStoreSlug(value: string): string {
  return slugifyStoreName(value)
}

export function isReservedStoreSlug(slug: string): boolean {
  return RESERVED_STORE_SLUGS.has(slug.toLowerCase())
}

export function isValidStoreSlug(slug: string): boolean {
  if (!slug) return false
  if (isReservedStoreSlug(slug)) return false
  // Underscore grammar: lowercase letters, digits, underscores; no leading/trailing _
  return /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(slug)
}

/**
 * Build alternate slugs when the preferred one is taken or reserved.
 * `taken` should include the original slug and any known collisions.
 */
export function buildSlugSuggestions(
  baseSlug: string,
  taken: Iterable<string> = [],
  limit = 4
): string[] {
  const base = normalizeStoreSlug(baseSlug)
  if (!base) return []

  const takenSet = new Set(
    [...taken, ...RESERVED_STORE_SLUGS].map((value) => value.toLowerCase())
  )

  const suggestions: string[] = []
  const tryAdd = (candidate: string) => {
    const normalized = normalizeStoreSlug(candidate)
    if (!isValidStoreSlug(normalized)) return
    if (takenSet.has(normalized)) return
    if (suggestions.includes(normalized)) return
    suggestions.push(normalized)
  }

  for (const suffix of ["store", "shop", "hq", "co", "ng", "1", "2", "3"]) {
    tryAdd(`${base}_${suffix}`)
    if (suggestions.length >= limit) return suggestions
  }

  let n = 4
  while (suggestions.length < limit && n < 60) {
    tryAdd(`${base}_${n}`)
    n += 1
  }

  return suggestions
}

export function isValidProductSlug(slug: string | null | undefined): boolean {
  if (!slug) return false
  return /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(slug)
}

export function getStorePublicPath(storeSlug: string): string {
  return `/${storeSlug}`
}

export function getStorePreviewPath(storeSlug: string): string {
  return `/${storeSlug}?preview=1`
}

export function getStoreProductsPath(storeSlug: string): string {
  return `/${storeSlug}/products`
}

export function getStoreProductPath(
  storeSlug: string,
  productSlug: string
): string {
  return `/${storeSlug}/products/${productSlug}`
}

type StorefrontHrefOpts = {
  preview?: boolean
  categoryId?: string
  featured?: boolean
}

/** Build storefront hrefs and preserve `?preview=1` across navigation. */
export function storefrontHref(
  storeSlug: string,
  path:
    | "home"
    | "products"
    | { productSlug: string },
  opts: StorefrontHrefOpts = {}
): string {
  let base: string
  if (path === "home") {
    base = `/${storeSlug}`
  } else if (path === "products") {
    base = `/${storeSlug}/products`
  } else {
    base = `/${storeSlug}/products/${path.productSlug}`
  }

  const params = new URLSearchParams()
  if (opts.preview) params.set("preview", "1")
  if (opts.categoryId) params.set("categoryId", opts.categoryId)
  if (opts.featured) params.set("featured", "1")

  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}
