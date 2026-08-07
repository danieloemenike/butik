import prismadb from "@/lib/prismadb"
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

type RouteParams = {
  params: Promise<{ businessId: string; storeId: string }>
}

async function authorizeStore(businessId: string, storeId: string) {
  const { getUser, isAuthenticated } = getKindeServerSession()
  const userInfo = await getUser()
  const userId = userInfo?.id
  const isAuth = await isAuthenticated()

  if (!isAuth || !userId) {
    return { error: jsonError("Unauthorized.", 401) }
  }

  if (!businessId) {
    return { error: jsonError("Business ID is required.", 400) }
  }

  if (!storeId) {
    return { error: jsonError("Store ID is required.", 400) }
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      userId,
      businessId,
    },
    select: { id: true },
  })

  if (!store) {
    return { error: jsonError("Store not found.", 404) }
  }

  return { userId, store }
}

export async function PATCH(request: Request, { params: rawParams }: RouteParams) {
  try {
    const params = await rawParams
    const auth = await authorizeStore(params.businessId, params.storeId)
    if ("error" in auth && auth.error) return auth.error

    const body = await request.json()
    const {
      storeName,
      storePhoneNumber,
      storeAddress,
      storeCity,
      storeCountry,
      storeSlug,
    } = body

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

    const [existingPhone, existingSlug] = await Promise.all([
      prismadb.store.findFirst({
        where: {
          phoneNumber: phone,
          NOT: { id: params.storeId },
        },
        select: { id: true },
      }),
      prismadb.store.findFirst({
        where: {
          storeSlug: slug,
          NOT: { id: params.storeId },
        },
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

    const store = await prismadb.store.update({
      where: { id: params.storeId },
      data: {
        storeSlug: slug,
        name,
        phoneNumber: phone,
        address,
        city,
        country,
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.log("[STORE_PATCH]", error)

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return mapUniqueConstraintError(error)
    }

    return jsonError("Something went wrong while updating your store.", 500)
  }
}

export async function DELETE(
  _req: Request,
  { params: rawParams }: RouteParams
) {
  try {
    const params = await rawParams
    const auth = await authorizeStore(params.businessId, params.storeId)
    if ("error" in auth && auth.error) return auth.error

    const store = await prismadb.store.delete({
      where: { id: params.storeId },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.log("[STORE_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
