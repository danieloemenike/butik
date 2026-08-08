import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { StorefrontShell } from "@/components/storefront/StorefrontShell"
import { formatNaira, resolveStorefront } from "@/lib/storefront"
import {
  isHoldExpired,
  verifyConfirmationToken,
} from "@/lib/commerce/policy"
import { expireDueOrders } from "@/lib/commerce/place-order"
import prismadb from "@/lib/prismadb"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ storeSlug: string; reference: string }>
  searchParams: Promise<{ t?: string; preview?: string }>
}

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: PageProps) {
  const { storeSlug, reference } = await params
  const sp = await searchParams
  const token = typeof sp.t === "string" ? sp.t : ""

  // Capability check must not leak order existence.
  if (!token) {
    notFound()
  }

  const { store } = await resolveStorefront(storeSlug, false)

  await expireDueOrders({ storeId: store.id, limit: 20 })

  const order = await prismadb.order.findFirst({
    where: {
      reference,
      storeId: store.id,
    },
    include: {
      orderItems: {
        orderBy: { id: "asc" },
      },
    },
  })

  if (!order || !verifyConfirmationToken(token, order.confirmationTokenHash)) {
    notFound()
  }

  const expired =
    order.status === "EXPIRED" ||
    order.status === "CANCELLED" ||
    isHoldExpired(order)

  if (expired) {
    // Valid capability + expired/cancelled: non-PII message only.
    return (
      <StorefrontShell store={store} isPreview={false}>
        <div className="mx-auto max-w-xl space-y-4">
          <p className="text-sm font-medium opacity-70">Order hold ended</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {order.reference}
          </h1>
          <p className="text-sm leading-relaxed opacity-70">
            This order hold has expired
            {order.status === "CANCELLED" ? " or was cancelled" : ""}. Contact
            the store if you still want the items.
          </p>
        </div>
      </StorefrontShell>
    )
  }

  return (
    <StorefrontShell store={store} isPreview={false}>
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <p className="text-sm font-medium opacity-70">Order placed</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {order.reference}
          </h1>
          <p className="mt-2 text-sm opacity-70">
            Keep this page or copy the link — it is your order confirmation.
            The store will contact you at the phone number you provided.
          </p>
        </div>

        <dl
          className="space-y-3 rounded-lg border p-4 text-sm"
          style={{ borderColor: `${store.primaryColor}18` }}
        >
          <div className="flex justify-between gap-4">
            <dt className="opacity-70">Status</dt>
            <dd className="font-medium">{order.status}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="opacity-70">Hold until</dt>
            <dd className="text-right font-medium">
              {order.holdsUntil.toLocaleString()}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="opacity-70">Customer</dt>
            <dd className="text-right font-medium">{order.customerName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="opacity-70">Phone</dt>
            <dd className="text-right font-medium">{order.phone}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="opacity-70">Address</dt>
            <dd className="max-w-[60%] text-right font-medium">
              {order.address}
            </dd>
          </div>
          <div
            className="flex justify-between gap-4 border-t pt-3"
            style={{ borderColor: `${store.primaryColor}12` }}
          >
            <dt className="opacity-70">Total</dt>
            <dd className="font-semibold">
              {formatNaira(Number(order.subtotal), order.currency || store.currency)}
            </dd>
          </div>
        </dl>

        <ul className="space-y-3">
          {order.orderItems.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{item.name}</p>
                {item.variantLabel ? (
                  <p className="text-xs opacity-60">{item.variantLabel}</p>
                ) : null}
                <p className="text-xs opacity-60">Qty {item.quantity}</p>
              </div>
              <p className="shrink-0 font-medium">
                {formatNaira(Number(item.lineTotal), order.currency || store.currency)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </StorefrontShell>
  )
}
