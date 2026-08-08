import type { Metadata } from "next"
import type { StorefrontProduct, StorefrontStore } from "@/lib/storefront"

const siteUrl = () =>
  (process.env.NEXT_PUBLIC_URL || "http://localhost:3000").replace(/\/$/, "")

export function storefrontRobots(isPreview: boolean): Metadata["robots"] {
  if (isPreview) {
    return { index: false, follow: false }
  }
  return { index: true, follow: true }
}

export function buildStoreMetadata(opts: {
  store: StorefrontStore
  isPreview: boolean
  title?: string
  description?: string
  path?: string
}): Metadata {
  const { store, isPreview } = opts
  const slug = store.storeSlug!
  const path = opts.path ?? `/${slug}`
  const title = opts.title ?? store.name
  const description =
    opts.description ||
    store.tagline ||
    `Shop ${store.name}${store.city ? ` in ${store.city}` : ""} on Butik.`
  const url = `${siteUrl()}${path}`
  const images = store.logoUrl
    ? [{ url: store.logoUrl, alt: store.name }]
    : undefined

  return {
    title,
    description,
    robots: storefrontRobots(isPreview),
    alternates: isPreview ? undefined : { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "Butik",
      images,
    },
    twitter: {
      card: images ? "summary" : "summary",
      title,
      description,
      images: images?.map((i) => i.url),
    },
  }
}

export function buildProductMetadata(opts: {
  store: StorefrontStore
  product: StorefrontProduct
  isPreview: boolean
}): Metadata {
  const { store, product, isPreview } = opts
  const slug = store.storeSlug!
  const productSlug = product.slug!
  const path = `/${slug}/products/${productSlug}`
  const title = `${product.name} · ${store.name}`
  const description =
    product.description?.trim() ||
    store.tagline ||
    `${product.name} from ${store.name}`
  const url = `${siteUrl()}${path}`
  const imageUrl = product.images[0]?.url || store.logoUrl || undefined
  const images = imageUrl
    ? [{ url: imageUrl, alt: product.name }]
    : undefined

  return {
    title,
    description,
    robots: storefrontRobots(isPreview),
    alternates: isPreview ? undefined : { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: store.name,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images?.map((i) => i.url),
    },
  }
}

export function buildExploreMetadata(): Metadata {
  const url = `${siteUrl()}/explore`
  const title = "Explore stores · Butik"
  const description =
    "Browse live storefronts published on Butik — independent shops across the platform."

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "Butik",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}
