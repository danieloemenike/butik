import prismadb from "@/lib/prismadb"
import {
  findOwnedStoreBySlug,
  getSessionUserId,
} from "@/lib/store-access"
import { isValidProductSlug } from "@/lib/store-identity"
import { formatMoney } from "@/lib/currency"
import {
  LEGACY_FONT_PAIRING_MAP,
  resolveStoreFonts,
} from "@/lib/storefront/fonts"
import type { Prisma } from "@prisma/client"
import { notFound } from "next/navigation"

export const storefrontStoreSelect = {
  id: true,
  name: true,
  storeSlug: true,
  status: true,
  phoneNumber: true,
  city: true,
  country: true,
  tagline: true,
  logoUrl: true,
  primaryColor: true,
  accentColor: true,
  backgroundColor: true,
  darkPrimaryColor: true,
  darkAccentColor: true,
  darkBackgroundColor: true,
  themePreset: true,
  colorMode: true,
  displayFont: true,
  bodyFont: true,
  publishedAt: true,
  userId: true,
  currency: true,
} satisfies Prisma.StoreSelect

export type StorefrontStore = Prisma.StoreGetPayload<{
  select: typeof storefrontStoreSelect
}>

export const storefrontProductSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  discountedPrice: true,
  quantity: true,
  isFeatured: true,
  images: {
    select: { id: true, url: true },
    where: { productVariantId: null },
    orderBy: { createdAt: "asc" as const },
    take: 8,
  },
  category: { select: { id: true, name: true } },
  color: { select: { id: true, name: true, value: true } },
  size: { select: { id: true, name: true, value: true } },
  productVariant: {
    select: {
      id: true,
      price: true,
      discountedPrice: true,
      quantity: true,
      color: { select: { id: true, name: true, value: true } },
      size: { select: { id: true, name: true, value: true } },
      images: { select: { id: true, url: true }, take: 4 },
    },
  },
} satisfies Prisma.ProductSelect

export type StorefrontProduct = Prisma.ProductGetPayload<{
  select: typeof storefrontProductSelect
}>

export const storefrontBillboardSelect = {
  id: true,
  label: true,
  imageUrl: true,
  promotionText: true,
} satisfies Prisma.BillboardSelect

/** Prisma where for publicly listable products (slug presence checked in JS for grammar). */
export function publicProductWhere(storeId: string): Prisma.ProductWhereInput {
  return {
    storeId,
    isArchived: false,
    NOT: [{ slug: null }, { slug: "" }],
  }
}

export function filterPublicProducts<T extends { slug: string | null }>(
  products: T[]
): T[] {
  return products.filter((p) => isValidProductSlug(p.slug))
}

export type ResolvedStorefront = {
  store: StorefrontStore
  isPreview: boolean
}

/**
 * Soft lookup — returns null when the storefront is not accessible.
 * Prefer this in generateMetadata so notFound() is never swallowed.
 */
export async function lookupStorefront(
  storeSlug: string,
  previewRequested: boolean
): Promise<ResolvedStorefront | null> {
  if (!storeSlug || storeSlug.includes("/")) {
    return null
  }

  if (previewRequested) {
    const userId = await getSessionUserId()
    if (userId) {
      const owned = await findOwnedStoreBySlug(storeSlug, userId)
      if (owned) {
        const store = await prismadb.store.findUnique({
          where: { id: owned.id },
          select: storefrontStoreSelect,
        })
        if (!store) return null
        return { store, isPreview: store.status !== "PUBLISHED" }
      }
    }
  }

  const store = await prismadb.store.findFirst({
    where: {
      storeSlug,
      status: "PUBLISHED",
    },
    select: storefrontStoreSelect,
  })

  if (!store) return null

  return { store, isPreview: false }
}

/**
 * Resolve a storefront by slug, or trigger an HTTP 404.
 * Public: PUBLISHED only.
 * Preview (?preview=1): owner can view non-published stores.
 */
export async function resolveStorefront(
  storeSlug: string,
  previewRequested: boolean
): Promise<ResolvedStorefront> {
  const resolved = await lookupStorefront(storeSlug, previewRequested)
  if (!resolved) notFound()
  return resolved
}

export async function listPublishedStores(search?: string) {
  const q = search?.trim()
  const stores = await prismadb.store.findMany({
    where: {
      status: "PUBLISHED",
      storeSlug: { not: null },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { storeSlug: { contains: q, mode: "insensitive" } },
              { tagline: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      storeSlug: true,
      tagline: true,
      logoUrl: true,
      city: true,
      country: true,
      primaryColor: true,
      accentColor: true,
      backgroundColor: true,
    },
    orderBy: [{ publishedAt: "desc" }, { name: "asc" }],
    take: 60,
  })

  return stores.filter((s) => s.storeSlug)
}

export async function loadStorefrontHome(storeId: string) {
  const [billboards, featuredRaw, productsRaw] = await Promise.all([
    prismadb.billboard.findMany({
      where: { storeId },
      select: storefrontBillboardSelect,
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prismadb.product.findMany({
      where: { ...publicProductWhere(storeId), isFeatured: true },
      select: storefrontProductSelect,
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
    prismadb.product.findMany({
      where: publicProductWhere(storeId),
      select: {
        ...storefrontProductSelect,
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 48,
    }),
  ])

  const featured = filterPublicProducts(featuredRaw)
  const products = filterPublicProducts(productsRaw)

  const categoryMap = new Map<string, { id: string; name: string; count: number }>()
  for (const p of products) {
    if (!p.category) continue
    const existing = categoryMap.get(p.category.id)
    if (existing) {
      existing.count += 1
    } else {
      categoryMap.set(p.category.id, {
        id: p.category.id,
        name: p.category.name,
        count: 1,
      })
    }
  }

  return {
    billboards,
    featured,
    products: products.slice(0, 8),
    categories: Array.from(categoryMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
  }
}

export async function loadStorefrontCatalog(
  storeId: string,
  opts: { categoryId?: string; featured?: boolean }
) {
  const productsRaw = await prismadb.product.findMany({
    where: {
      ...publicProductWhere(storeId),
      ...(opts.categoryId ? { categoryId: opts.categoryId } : {}),
      ...(opts.featured ? { isFeatured: true } : {}),
    },
    select: storefrontProductSelect,
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const products = filterPublicProducts(productsRaw)

  const categoryMap = new Map<string, { id: string; name: string; count: number }>()
  const allForCats = await prismadb.product.findMany({
    where: publicProductWhere(storeId),
    select: {
      slug: true,
      category: { select: { id: true, name: true } },
    },
    take: 200,
  })
  for (const p of filterPublicProducts(allForCats)) {
    if (!p.category) continue
    const existing = categoryMap.get(p.category.id)
    if (existing) existing.count += 1
    else
      categoryMap.set(p.category.id, {
        id: p.category.id,
        name: p.category.name,
        count: 1,
      })
  }

  return {
    products,
    categories: Array.from(categoryMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
  }
}

export async function loadStorefrontProduct(
  storeId: string,
  productSlug: string
) {
  if (!isValidProductSlug(productSlug)) {
    return null
  }

  const product = await prismadb.product.findFirst({
    where: {
      storeId,
      slug: productSlug,
      isArchived: false,
    },
    select: storefrontProductSelect,
  })

  return product
}

/** Resolve heading/body stacks from public/fonts ids (or legacy pairing names). */
export function fontPairingCss(displayOrPairing: string, bodyFont?: string): {
  display: string
  body: string
} {
  if (
    !bodyFont &&
    (displayOrPairing === "MODERN" ||
      displayOrPairing === "CLASSIC" ||
      displayOrPairing === "EDITORIAL")
  ) {
    return resolveStoreFonts(
      LEGACY_FONT_PAIRING_MAP[
        displayOrPairing as keyof typeof LEGACY_FONT_PAIRING_MAP
      ]
    )
  }
  return resolveStoreFonts({
    displayFont: displayOrPairing,
    bodyFont: bodyFont ?? displayOrPairing,
  })
}

export { resolveStoreFonts } from "@/lib/storefront/fonts"

export function formatNaira(
  amount: Prisma.Decimal | number | string,
  currencyCode = "NGN"
) {
  return formatMoney(
    typeof amount === "number" ? amount : Number(amount),
    currencyCode
  )
}
