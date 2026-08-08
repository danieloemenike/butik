"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { useStorefrontCart } from "@/components/storefront/StorefrontCartProvider"
import { StorefrontEmptyState } from "@/components/storefront/StorefrontEmptyState"
import { formatNaira } from "@/lib/storefront"

function newCheckoutIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `idem_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function CheckoutClient({
  storeSlug,
  accentColor,
  primaryColor,
  currency = "NGN",
}: {
  storeSlug: string
  accentColor: string
  primaryColor: string
  currency?: string
}) {
  const router = useRouter()
  const { lines, clear, hydrated } = useStorefrontCart()
  const [customerName, setCustomerName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [idempotencyKey] = useState(() => newCheckoutIdempotencyKey())

  const estimate = useMemo(
    () =>
      lines.reduce(
        (sum, l) => sum + (l.display?.unitPrice || 0) * l.quantity,
        0
      ),
    [lines]
  )

  useEffect(() => {
    if (hydrated && lines.length === 0) {
      // stay on empty state
    }
  }, [hydrated, lines.length])

  if (!hydrated) {
    return <p className="text-sm opacity-60">Loading…</p>
  }

  if (!lines.length) {
    return (
      <StorefrontEmptyState
        title="Nothing to check out"
        description="Add products to your cart before placing an order."
        actionHref={`/${storeSlug}/products`}
        actionLabel="Shop products"
        accentColor={accentColor}
        primaryColor={primaryColor}
      />
    )
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const { data } = await axios.post(
        `/api/storefront/${storeSlug}/orders/v1`,
        {
          customerName,
          phone,
          address,
          email: email || undefined,
          notes: notes || undefined,
          idempotencyKey,
          items: lines.map((l) => ({
            productId: l.productId,
            productVariantId: l.productVariantId || null,
            quantity: l.quantity,
          })),
        }
      )

      if (data.confirmationToken) {
        try {
          sessionStorage.setItem(
            `butik:order-token:${data.reference}`,
            data.confirmationToken
          )
        } catch {
          // ignore
        }
        clear()
        router.push(
          `/${storeSlug}/order/${data.reference}?t=${encodeURIComponent(data.confirmationToken)}`
        )
        return
      }

      // Idempotent retry without token — try sessionStorage
      const saved =
        typeof window !== "undefined"
          ? sessionStorage.getItem(`butik:order-token:${data.reference}`)
          : null
      if (saved) {
        clear()
        router.push(
          `/${storeSlug}/order/${data.reference}?t=${encodeURIComponent(saved)}`
        )
        return
      }

      setError(
        `Order ${data.reference} was already created. Open the confirmation link from your previous successful checkout.`
      )
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message
        : undefined
      setError(message || "Could not place order.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-1 text-sm opacity-70">
          Place an order — the store will contact you. No payment is taken online
          yet.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Full name" value={customerName} onChange={setCustomerName} required />
        <Field
          label="Phone (with country code)"
          value={phone}
          onChange={setPhone}
          required
          inputMode="tel"
          placeholder="+2348012345678"
        />
        <Field label="Delivery address" value={address} onChange={setAddress} required />
        <Field label="Email (optional)" value={email} onChange={setEmail} type="email" />
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Notes (optional)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border bg-transparent px-3 py-2"
          />
        </label>

        <div
          className="rounded-lg border p-4 text-sm"
          style={{ borderColor: `${primaryColor}18` }}
        >
          <p>
            {lines.length} line{lines.length === 1 ? "" : "s"} · estimated{" "}
            <span className="font-semibold">{formatNaira(estimate, currency)}</span>
          </p>
          <p className="mt-1 opacity-70">Final total is calculated on the server.</p>
        </div>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md px-4 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: accentColor }}
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
          <Link
            href={`/${storeSlug}/cart`}
            className="inline-flex min-h-11 items-center justify-center rounded-md border px-4 text-sm font-medium"
            style={{ borderColor: `${primaryColor}22` }}
          >
            Back to cart
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  inputMode,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  placeholder?: string
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border bg-transparent px-3"
      />
    </label>
  )
}
