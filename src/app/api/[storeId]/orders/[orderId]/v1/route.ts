import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import { requireOwnedStoreById } from "@/lib/store-access"
import {
  cancelPendingOrder,
  confirmPendingOrder,
} from "@/lib/commerce/place-order"

type RouteParams = {
  params: Promise<{ storeId: string; orderId: string }>
}

export async function GET(
  _req: Request,
  { params: rawParams }: RouteParams
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    const order = await prismadb.order.findFirst({
      where: { id: params.orderId, storeId: auth.store.id },
      include: {
        orderItems: {
          orderBy: { id: "asc" },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 })
    }

    return NextResponse.json({
      id: order.id,
      reference: order.reference,
      status: order.status,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      email: order.email,
      notes: order.notes,
      subtotal: Number(order.subtotal),
      currency: order.currency,
      isPaid: order.isPaid,
      createdAt: order.createdAt.toISOString(),
      confirmedAt: order.confirmedAt?.toISOString() ?? null,
      cancelledAt: order.cancelledAt?.toISOString() ?? null,
      items: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productVariantId: item.productVariantId,
        name: item.name,
        variantLabel: item.variantLabel,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      })),
    })
  } catch (error) {
    console.error("[ORDER_GET]", error)
    return NextResponse.json({ message: "Internal error" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params: rawParams }: RouteParams
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    const body = await req.json()
    const action = body?.action

    if (action === "confirm") {
      const result = await confirmPendingOrder({
        storeId: auth.store.id,
        orderId: params.orderId,
      })
      if (!result.ok) {
        return NextResponse.json(
          { message: result.message },
          { status: result.status }
        )
      }
      return NextResponse.json({ ok: true, status: "CONFIRMED" })
    }

    if (action === "cancel") {
      const result = await cancelPendingOrder({
        storeId: auth.store.id,
        orderId: params.orderId,
      })
      if (!result.ok) {
        return NextResponse.json(
          { message: result.message },
          { status: result.status }
        )
      }
      return NextResponse.json({ ok: true, status: "CANCELLED" })
    }

    return NextResponse.json(
      { message: "action must be confirm or cancel." },
      { status: 400 }
    )
  } catch (error) {
    console.error("[ORDER_PATCH]", error)
    return NextResponse.json({ message: "Internal error" }, { status: 500 })
  }
}
