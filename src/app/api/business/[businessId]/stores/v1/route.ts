import prismadb from "@/lib/prismadb"
import { getMaxStores } from "@/lib/store-limits"
import { sanitizeNationalNumber } from "@/lib/store-form"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import isMobilePhone from "validator/lib/isMobilePhone"

function jsonError(message: string, status: number, field?: string) {
  return NextResponse.json(field ? { message, field } : { message }, { status })
}

function requireTrimmed(
  value: unknown,
  message: string,
  field: string
): string | NextResponse {
  if (!value || typeof value !== "string" || !value.trim()) {
    return jsonError(message, 400, field)
  }
  return value.trim()
}

function normalizePhone(value: string) {
  const trimmed = value.trim()
  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`
  }
  return `+${sanitizeNationalNumber(trimmed)}`
}

function mapUniqueConstraintError(error: Prisma.PrismaClientKnownRequestError) {
  const target = Array.isArray(error.meta?.target)
    ? (error.meta?.target as string[])
    : []

  if (target.includes("phoneNumber")) {
    return jsonError(
      "This phone number is already used by another store.",
      409,
      "storePhoneNumber"
    )
  }
  if (target.includes("storeSlug")) {
    return jsonError(
      "A store with this name/slug already exists. Choose a different store name.",
      409,
      "storeSlug"
    )
  }
  return jsonError("A store with these details already exists.", 409)
}

export async function POST(
  request: Request,
  { params: rawParams }: { params: Promise<{ businessId: string }> }
) {
  try {
    const params = await rawParams
    const { getUser, isAuthenticated } = getKindeServerSession()

    const userInfo = await getUser()
    const userId = userInfo?.id
    const isAuth = await isAuthenticated()
    const body = await request.json()
    const {
      storeName,
      storePhoneNumber,
      storeAddress,
      storeCity,
      storeCountry,
      storeSlug,
    } = body

    if (!isAuth) {
      return jsonError("You must be signed in to create a store.", 401)
    }
    if (!userId) {
      return jsonError("Unauthorized.", 403)
    }
    if (!params.businessId) {
      return jsonError("Business ID is required.", 400)
    }

    const name = requireTrimmed(storeName, "Store name is required.", "storeName")
    if (name instanceof NextResponse) return name

    const slug = requireTrimmed(
      storeSlug,
      "Store slug is required. Try a different store name.",
      "storeSlug"
    )
    if (slug instanceof NextResponse) return slug

    const rawPhone = requireTrimmed(
      storePhoneNumber,
      "Phone number is required.",
      "storePhoneNumber"
    )
    if (rawPhone instanceof NextResponse) return rawPhone

    const phone = normalizePhone(rawPhone)
    if (!isMobilePhone(phone, "any", { strictMode: false })) {
      return jsonError("Enter a valid phone number.", 400, "storePhoneNumber")
    }

    const address = requireTrimmed(
      storeAddress,
      "Address is required.",
      "storeAddress"
    )
    if (address instanceof NextResponse) return address

    const city = requireTrimmed(storeCity, "City is required.", "storeCity")
    if (city instanceof NextResponse) return city

    const country = requireTrimmed(
      storeCountry,
      "Country is required.",
      "storeCountry"
    )
    if (country instanceof NextResponse) return country

    const existingStoreCount = await prismadb.store.count({
      where: {
        businessId: params.businessId,
        userId,
      },
    })

    const maxStores = getMaxStores()
    if (existingStoreCount >= maxStores) {
      return jsonError(
        `Store limit reached. You can create up to ${maxStores} stores.`,
        403
      )
    }

    const [existingPhone, existingSlug] = await Promise.all([
      prismadb.store.findFirst({
        where: { phoneNumber: phone },
        select: { id: true },
      }),
      prismadb.store.findFirst({
        where: { storeSlug: slug },
        select: { id: true },
      }),
    ])

    if (existingPhone) {
      return jsonError(
        "This phone number is already used by another store.",
        409,
        "storePhoneNumber"
      )
    }
    if (existingSlug) {
      return jsonError(
        "A store with this name/slug already exists. Choose a different store name.",
        409,
        "storeSlug"
      )
    }

    const store = await prismadb.store.create({
      data: {
        userId,
        storeSlug: slug,
        businessId: params.businessId,
        name,
        phoneNumber: phone,
        address,
        city,
        country,
      },
      select: { id: true },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.log("[store_CREATION]", error)

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return mapUniqueConstraintError(error)
    }

    return jsonError("Something went wrong while creating your store.", 500)
  }
}

export async function GET(
  req: Request,
  { params: rawParams }: { params: Promise<{ businessId: string }> }
) {
  const params = await rawParams
  const { businessId } = params
  try {
    if (!businessId) {
      return jsonError("Business ID is required.", 400)
    }

    const stores = await prismadb.store.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(stores)
  } catch (error) {
    console.log("[STORES_GET] : ", error)
    return jsonError("Internal error", 500)
  }
}
