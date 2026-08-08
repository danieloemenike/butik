import { placeStorefrontOrder } from "@/lib/commerce/place-order"
import { takeRateLimit } from "@/lib/commerce/rate-limit"
import { NextResponse } from "next/server"

type RouteParams = {
  params: Promise<{ storeSlug: string }>
}

export async function POST(request: Request, { params: rawParams }: RouteParams) {
  try {
    const { storeSlug } = await rawParams
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    const limited = takeRateLimit({
      key: `order:${storeSlug}:${ip}`,
      limit: 8,
      windowMs: 60_000,
    })
    if (!limited.ok) {
      return NextResponse.json(
        { message: "Too many orders. Try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        }
      )
    }

    const body = await request.json()
    if (body?.preview === true || body?.preview === "1") {
      return NextResponse.json(
        { message: "Checkout is not available in preview." },
        { status: 403 }
      )
    }

    const result = await placeStorefrontOrder({
      storeSlug,
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      email: body.email,
      notes: body.notes,
      idempotencyKey: body.idempotencyKey,
      items: Array.isArray(body.items) ? body.items : [],
    })

    if (!result.ok) {
      return NextResponse.json(
        { message: result.message, field: result.field },
        { status: result.status }
      )
    }

    return NextResponse.json({
      reference: result.reference,
      confirmationToken: result.confirmationToken || undefined,
      alreadyCreated: result.alreadyCreated,
      subtotal: result.subtotal,
    })
  } catch (error) {
    console.error("[STOREFRONT_ORDER_POST]", error)
    return NextResponse.json({ message: "Internal error" }, { status: 500 })
  }
}
