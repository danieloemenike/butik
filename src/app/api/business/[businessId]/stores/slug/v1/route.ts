import prismadb from "@/lib/prismadb"
import {
  buildSlugSuggestions,
  isReservedStoreSlug,
  isValidStoreSlug,
  normalizeStoreSlug,
} from "@/lib/store-identity"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params: rawParams }: { params: Promise<{ businessId: string }> }
) {
  try {
    const params = await rawParams
    const { getUser, isAuthenticated } = getKindeServerSession()
    const userInfo = await getUser()
    const userId = userInfo?.id
    const isAuth = await isAuthenticated()

    if (!isAuth || !userId) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 })
    }
    if (!params.businessId) {
      return NextResponse.json(
        { message: "Business ID is required." },
        { status: 400 }
      )
    }

    const business = await prismadb.business.findFirst({
      where: { id: params.businessId, userId },
      select: { id: true },
    })
    if (!business) {
      return NextResponse.json({ message: "Business not found." }, { status: 404 })
    }

    const rawSlug = request.nextUrl.searchParams.get("slug") ?? ""
    const excludeStoreId =
      request.nextUrl.searchParams.get("excludeStoreId") ?? undefined
    const slug = normalizeStoreSlug(rawSlug)

    if (!slug) {
      return NextResponse.json({
        slug: "",
        available: false,
        reason: "empty",
        message: "Enter a store name to generate a slug.",
        suggestions: [] as string[],
      })
    }

    const candidatePool = buildSlugSuggestions(slug, [slug], 10)
    const existing = await prismadb.store.findMany({
      where: {
        storeSlug: { in: [slug, ...candidatePool] },
        ...(excludeStoreId ? { NOT: { id: excludeStoreId } } : {}),
      },
      select: { storeSlug: true },
    })

    const taken = new Set(
      existing
        .map((row) => row.storeSlug)
        .filter((value): value is string => Boolean(value))
    )

    if (isReservedStoreSlug(slug) || !isValidStoreSlug(slug)) {
      return NextResponse.json({
        slug,
        available: false,
        reason: "invalid",
        message: "This slug is invalid or reserved. Try one of these:",
        suggestions: buildSlugSuggestions(slug, taken, 4),
      })
    }

    if (!taken.has(slug)) {
      return NextResponse.json({
        slug,
        available: true,
        reason: "available",
        message: "Slug is available.",
        suggestions: [] as string[],
      })
    }

    return NextResponse.json({
      slug,
      available: false,
      reason: "taken",
      message: "This slug is already taken. Try one of these:",
      suggestions: buildSlugSuggestions(slug, taken, 4),
    })
  } catch (error) {
    console.error("[STORE_SLUG_CHECK]", error)
    return NextResponse.json(
      { message: "Could not check slug availability." },
      { status: 500 }
    )
  }
}
