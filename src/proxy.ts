/**
 * Enforce real HTTP 404 for inaccessible public storefront URLs.
 * Preview (`?preview=1`) is left to the page (owner auth).
 * App Router `notFound()` alone can stream as HTTP 200 when Suspense is involved.
 */
import { neon } from "@neondatabase/serverless"
import {
  RESERVED_STORE_SLUGS,
  isValidProductSlug,
  isValidStoreSlug,
} from "@/lib/store-identity"
import { NextResponse, type NextRequest } from "next/server"

const PUBLISHED_SEGMENTS = new Set(["products", "cart", "checkout", "order"])

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/store/") ||
    pathname.startsWith("/business/") ||
    pathname === "/explore" ||
    pathname === "/register-business" ||
    pathname === "/storefront-offline" ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  const parts = pathname.split("/").filter(Boolean)
  if (parts.length === 0 || parts.length > 3) {
    return NextResponse.next()
  }

  const storeSlug = parts[0]
  if (RESERVED_STORE_SLUGS.has(storeSlug)) {
    return NextResponse.next()
  }

  // Only treat underscore-grammar slugs as storefront candidates.
  if (!isValidStoreSlug(storeSlug)) {
    return NextResponse.next()
  }

  if (parts.length >= 2 && !PUBLISHED_SEGMENTS.has(parts[1]!)) {
    return NextResponse.next()
  }

  // Owner preview is authorized in RSC loaders.
  if (searchParams.get("preview") === "1") {
    return NextResponse.next()
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    return NextResponse.next()
  }

  try {
    const sql = neon(databaseUrl)
    const second = parts[1]
    const third = parts.length === 3 ? parts[2] : null

    // PDP: published store + live product slug
    if (second === "products" && third) {
      if (!isValidProductSlug(third)) {
        return offline404(request)
      }

      const rows = await sql`
        SELECT 1
        FROM "Store" s
        INNER JOIN "Product" p ON p."storeId" = s.id
        WHERE s."storeSlug" = ${storeSlug}
          AND s.status = 'PUBLISHED'
          AND p.slug = ${third}
          AND p."isArchived" = false
        LIMIT 1
      `
      if (rows.length === 0) {
        return offline404(request)
      }
      return NextResponse.next()
    }

    // Home, products index, cart, checkout, order confirmation:
    // store must be published. Token check for /order/{ref} is in the page.
    const rows = await sql`
      SELECT 1
      FROM "Store"
      WHERE "storeSlug" = ${storeSlug}
        AND status = 'PUBLISHED'
      LIMIT 1
    `
    if (rows.length === 0) {
      return offline404(request)
    }

    return NextResponse.next()
  } catch (error) {
    console.error("[storefront_proxy]", error)
    return NextResponse.next()
  }
}

function offline404(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = "/storefront-offline"
  url.search = ""
  return NextResponse.rewrite(url, { status: 404 })
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
