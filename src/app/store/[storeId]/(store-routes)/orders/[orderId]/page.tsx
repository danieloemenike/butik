import Heading from "@/components/StoreHeading"
import { expireDueOrders } from "@/lib/commerce/place-order"
import prismadb from "@/lib/prismadb"
import { formatStoreMoney } from "@/lib/utils"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { format } from "date-fns"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { OrderActions } from "./_components/OrderActions"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ storeId: string; orderId: string }>
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { storeId, orderId } = await params
  const { getUser, isAuthenticated } = getKindeServerSession()
  const userInfo = await getUser()
  const userId = userInfo?.id
  const isAuth = await isAuthenticated()

  if (!isAuth || !userId) {
    redirect("/")
  }

  const store = await prismadb.store.findFirst({
    where: { id: storeId, userId },
    select: { id: true },
  })
  if (!store) {
    redirect("/register-business")
  }

  await expireDueOrders({ storeId, limit: 20 })

  const order = await prismadb.order.findFirst({
    where: { id: orderId, storeId },
    include: { orderItems: { orderBy: { id: "asc" } } },
  })
  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/store/${storeId}/orders`}
            className="text-sm text-muted-foreground underline-offset-2 hover:underline"
          >
            ← Orders
          </Link>
          <Heading
            title={order.reference}
            subtitle={`Placed ${format(order.createdAt, "PPP · p")}`}
            showButton={false}
          />
        </div>
        <OrderActions
          storeId={storeId}
          orderId={order.id}
          status={order.status}
        />
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2 md:p-5">
        <div className="space-y-2 text-sm">
          <p className="font-medium">Customer</p>
          <p>{order.customerName}</p>
          <p className="text-muted-foreground">{order.phone}</p>
          {order.email ? (
            <p className="text-muted-foreground">{order.email}</p>
          ) : null}
          <p className="pt-2">{order.address}</p>
          {order.notes ? (
            <p className="pt-2 text-muted-foreground">Notes: {order.notes}</p>
          ) : null}
        </div>
        <div className="space-y-2 text-sm">
          <p>
            Status: <span className="font-semibold">{order.status}</span>
          </p>
          {order.status === "PENDING" ? (
            <p className="text-muted-foreground">
              Hold until {format(order.holdsUntil, "PPP · p")}
            </p>
          ) : null}
          {order.status === "EXPIRED" && order.expiredAt ? (
            <p className="text-muted-foreground">
              Expired {format(order.expiredAt, "PPP · p")} — stock released.
            </p>
          ) : null}
          <p>Paid online: {order.isPaid ? "Yes" : "No"}</p>
          <p className="text-lg font-semibold">
            {formatStoreMoney(Number(order.subtotal), order.currency)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <p className="mb-3 text-sm font-medium">Line items</p>
        <ul className="divide-y divide-border">
          {order.orderItems.map((item) => (
            <li
              key={item.id}
              className="flex justify-between gap-3 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                {item.variantLabel ? (
                  <p className="text-muted-foreground">{item.variantLabel}</p>
                ) : null}
                <p className="text-muted-foreground">
                  {item.quantity} ×{" "}
                  {formatStoreMoney(Number(item.unitPrice), order.currency)}
                </p>
              </div>
              <p className="font-medium">
                {formatStoreMoney(Number(item.lineTotal), order.currency)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
