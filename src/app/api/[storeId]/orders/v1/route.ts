import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import { requireOwnedStoreById } from "@/lib/store-access"

type RouteParams = {
  params: Promise<{ storeId: string }>
}

export async function GET(
  _req: Request,
  { params: rawParams }: RouteParams
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    const orders = await prismadb.order.findMany({
      where: { storeId: auth.store.id },
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          select: { id: true, quantity: true },
        },
      },
    })

    return NextResponse.json(
      orders.map((o) => ({
        id: o.id,
        reference: o.reference,
        status: o.status,
        customerName: o.customerName,
        phone: o.phone,
        address: o.address,
        email: o.email,
        subtotal: Number(o.subtotal),
        currency: o.currency,
        isPaid: o.isPaid,
        itemCount: o.orderItems.reduce((n, i) => n + i.quantity, 0),
        createdAt: o.createdAt.toISOString(),
        confirmedAt: o.confirmedAt?.toISOString() ?? null,
        cancelledAt: o.cancelledAt?.toISOString() ?? null,
      }))
    )
  } catch (error) {
    console.error("[ORDERS_GET]", error)
    return NextResponse.json({ message: "Internal error" }, { status: 500 })
  }
}
