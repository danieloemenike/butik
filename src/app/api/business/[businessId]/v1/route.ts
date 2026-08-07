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

export async function GET(
  _request: Request,
  { params: rawParams }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await rawParams
    const { getUser, isAuthenticated } = getKindeServerSession()
    const user = await getUser()
    const isAuth = await isAuthenticated()

    if (!isAuth || !user?.id) {
      return jsonError("Unauthorized.", 401)
    }

    const business = await prismadb.business.findFirst({
      where: { id: businessId, userId: user.id },
    })

    if (!business) {
      return jsonError("Business not found.", 404)
    }

    return NextResponse.json(business)
  } catch (error) {
    console.log("[BUSINESS_GET]", error)
    return jsonError("Something went wrong.", 500)
  }
}

export async function PATCH(
  request: Request,
  { params: rawParams }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await rawParams
    const { getUser, isAuthenticated } = getKindeServerSession()
    const user = await getUser()
    const isAuth = await isAuthenticated()
    const body = await request.json()
    const {
      businessName,
      businessPhoneNumber,
      businessAddress,
      businessCity,
      businessCountry,
    } = body

    if (!isAuth || !user?.id) {
      return jsonError("Unauthorized.", 401)
    }

    const existing = await prismadb.business.findFirst({
      where: { id: businessId, userId: user.id },
      select: { id: true },
    })

    if (!existing) {
      return jsonError("Business not found.", 404)
    }

    const name = requireTrimmed(
      businessName,
      "Business name is required.",
      "businessName"
    )
    if (name instanceof NextResponse) return name

    const rawPhone = requireTrimmed(
      businessPhoneNumber,
      "Phone number is required.",
      "businessPhoneNumber"
    )
    if (rawPhone instanceof NextResponse) return rawPhone

    const phone = normalizePhone(rawPhone)
    if (!isMobilePhone(phone, "any", { strictMode: false })) {
      return jsonError(
        "Enter a valid phone number.",
        400,
        "businessPhoneNumber"
      )
    }

    const address = requireTrimmed(
      businessAddress,
      "Address is required.",
      "businessAddress"
    )
    if (address instanceof NextResponse) return address

    const city = requireTrimmed(
      businessCity,
      "City is required.",
      "businessCity"
    )
    if (city instanceof NextResponse) return city

    const country = requireTrimmed(
      businessCountry,
      "Country is required.",
      "businessCountry"
    )
    if (country instanceof NextResponse) return country

    const business = await prismadb.business.update({
      where: { id: businessId },
      data: {
        name,
        phoneNumber: phone,
        address,
        city,
        country,
      },
    })

    return NextResponse.json(business)
  } catch (error) {
    console.log("[BUSINESS_PATCH]", error)

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError(
        "A business with this name already exists in that country.",
        409,
        "businessName"
      )
    }

    return jsonError("Something went wrong while updating your business.", 500)
  }
}
