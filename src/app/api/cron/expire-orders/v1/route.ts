import { expireDueOrders } from "@/lib/commerce/place-order"
import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"

/**
 * Sweep expired PENDING holds.
 * Auth: Authorization: Bearer <.e>
 * Schedule via Railway cron / external scheduler hitting this route.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json(
      { message: "CRON_SECRET is not configured." },
      { status: 503 }
    )
  }

  const header = request.headers.get("authorization") || ""
  const expected = `Bearer ${secret}`
  const ok =
    header.length === expected.length &&
    timingSafeEqual(Buffer.from(header), Buffer.from(expected))

  if (!ok) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const limit =
      typeof body?.limit === "number" && Number.isInteger(body.limit)
        ? body.limit
        : 100

    const result = await expireDueOrders({ limit })
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("[CRON_EXPIRE_ORDERS]", error)
    return NextResponse.json({ message: "Internal error" }, { status: 500 })
  }
}
