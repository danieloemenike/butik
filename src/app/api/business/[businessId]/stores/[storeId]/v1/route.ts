import prismadb from "@/lib/prismadb"
import { requireOwnedStoreForBusiness, jsonError } from "@/lib/store-access"
import {
  isValidStoreSlug,
  normalizeStoreSlug,
} from "@/lib/store-identity"
import { sanitizeNationalNumber } from "@/lib/store-form"
import {
  isValidCurrencyCode,
  normalizeCurrencyCode,
} from "@/lib/currency"
import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import isMobilePhone from "validator/lib/isMobilePhone"

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

export async function PATCH(request: Request, { params: rawParams }: RouteParams) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreForBusiness(
      params.businessId,
      params.storeId
    )
    if (auth.error) return auth.error

    const body = await request.json()
    const {
      storeName,
      storePhoneNumber,
      storeAddress,
      storeCity,
      storeCountry,
      storeSlug,
      currency: rawCurrency,
    } = body

    const name = requireTrimmed(storeName, "Store name is required.", "storeName")
    if (name instanceof NextResponse) return name

    const rawSlug = requireTrimmed(
      storeSlug,
      "Store slug is required. Try a different store name.",
      "storeSlug"
    )
    if (rawSlug instanceof NextResponse) return rawSlug

    const slug = normalizeStoreSlug(rawSlug)
    if (!isValidStoreSlug(slug)) {
      return jsonError(
        "Store slug is invalid or reserved. Use lowercase letters, numbers, and underscores.",
        400,
        "storeSlug"
      )
    }

    if (
      auth.store.status === "PUBLISHED" &&
      slug !== auth.store.storeSlug
    ) {
      return jsonError(
        "Public URL cannot be changed while the store is live. Take the store offline first.",
        400,
        "storeSlug"
      )
    }

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

    let currency = auth.store.currency || "NGN"
    if (rawCurrency != null && rawCurrency !== "") {
      if (typeof rawCurrency !== "string" || !isValidCurrencyCode(rawCurrency)) {
        return jsonError("Select a valid ISO currency code.", 400, "currency")
      }
      currency = normalizeCurrencyCode(rawCurrency)
    }

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
        currency,
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
    const auth = await requireOwnedStoreForBusiness(
      params.businessId,
      params.storeId
    )
    if (auth.error) return auth.error

    const store = await prismadb.store.delete({
      where: { id: params.storeId },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.log("[STORE_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
