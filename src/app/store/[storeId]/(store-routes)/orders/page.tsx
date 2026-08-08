import Heading from "@/components/StoreHeading"
import { EmptyState } from "@/components/EmptyState"
import { expireDueOrders } from "@/lib/commerce/place-order"
import prismadb from "@/lib/prismadb"
import { formatStoreMoney } from "@/lib/utils"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { format } from "date-fns"
import { ClipboardList } from "lucide-react"
import { redirect } from "next/navigation"
import { OrdersTable } from "./_components/OrdersTable"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ storeId: string }>
}

export default async function OrdersPage({ params }: PageProps) {
  const { storeId } = await params
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

  const orders = await prismadb.order.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: { select: { quantity: true } },
    },
  })

  const pendingCount = orders.filter((o) => o.status === "PENDING").length

  const rows = orders.map((o) => ({
    id: o.id,
    reference: o.reference,
    status: o.status,
    customerName: o.customerName,
    phone: o.phone,
    itemCount: o.orderItems.reduce((n, i) => n + i.quantity, 0),
    subtotal: formatStoreMoney(Number(o.subtotal), o.currency),
    createdAt: format(o.createdAt, "MMM d, yyyy · HH:mm"),
  }))

  return (
    <div className="space-y-1">
      <Heading
        title="Orders"
        subtitle={
          pendingCount
            ? `${pendingCount} pending order${pendingCount === 1 ? "" : "s"} need attention`
            : "Guest checkout orders from your live storefront"
        }
        showButton={false}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="When shoppers place guest orders on your published storefront, they will show up here."
        />
      ) : (
        <div className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-5">
          {pendingCount > 0 ? (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {pendingCount} pending — confirm or cancel to free or finalize
              inventory holds. Unconfirmed holds expire after 24 hours.
            </p>
          ) : null}
          <OrdersTable storeId={storeId} data={rows} />
          <p className="text-xs text-muted-foreground">
            Tip: open an order to confirm or cancel. Cancelling a pending order
            restores stock once. Expired holds release stock automatically.
          </p>
        </div>
      )}
    </div>
  )
}
