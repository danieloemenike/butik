"use client"

import Link from "next/link"
import Image from "next/image"
import { useStorefrontCart } from "@/components/storefront/StorefrontCartProvider"
import { StorefrontEmptyState } from "@/components/storefront/StorefrontEmptyState"
import { formatNaira } from "@/lib/storefront"
import { storefrontHref } from "@/lib/store-identity"

export function CartClient({
  storeSlug,
  accentColor,
  primaryColor,
  currency = "NGN",
  isPreview,
}: {
  storeSlug: string
  accentColor: string
  primaryColor: string
  currency?: string
  isPreview: boolean
}) {
  const { lines, setQuantity, removeItem, hydrated } = useStorefrontCart()

  if (isPreview) {
    return (
      <StorefrontEmptyState
        title="Cart unavailable in preview"
        description="Publish the store to enable checkout for shoppers."
        actionHref={storefrontHref(storeSlug, "home", { preview: true })}
        actionLabel="Back to store"
        accentColor={accentColor}
        primaryColor={primaryColor}
      />
    )
  }

  if (!hydrated) {
    return <p className="text-sm opacity-60">Loading cart…</p>
  }

  if (!lines.length) {
    return (
      <StorefrontEmptyState
        title="Your cart is empty"
        description="Browse the shop and add products to place an order."
        actionHref={`/${storeSlug}/products`}
        actionLabel="Shop products"
        accentColor={accentColor}
        primaryColor={primaryColor}
      />
    )
  }

  const estimate = lines.reduce(
    (sum, l) => sum + (l.display?.unitPrice || 0) * l.quantity,
    0
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Cart</h1>
        <p className="mt-1 text-sm opacity-70">
          Prices are confirmed at checkout.
        </p>
      </div>

      <ul className="space-y-4">
        {lines.map((line) => (
          <li
            key={`${line.productId}-${line.productVariantId || ""}`}
            className="flex gap-3 rounded-lg border p-3 sm:gap-4 sm:p-4"
            style={{ borderColor: `${primaryColor}18` }}
          >
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-black/[0.04] sm:h-24 sm:w-20">
              {line.display?.imageUrl ? (
                <Image
                  src={line.display.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium tracking-tight">
                {line.display?.name || "Product"}
              </p>
              {line.display?.variantLabel ? (
                <p className="mt-0.5 text-xs opacity-60">
                  {line.display.variantLabel}
                </p>
              ) : null}
              {line.display?.unitPrice != null ? (
                <p className="mt-1 text-sm opacity-75">
                  {formatNaira(line.display.unitPrice, currency)}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={line.quantity}
                  onChange={(e) =>
                    setQuantity(
                      line.productId,
                      line.productVariantId,
                      Number(e.target.value) || 0
                    )
                  }
                  className="h-10 w-16 rounded-md border bg-transparent px-2 text-sm"
                />
                <button
                  type="button"
                  className="min-h-10 text-sm opacity-70 underline-offset-2 hover:underline"
                  onClick={() =>
                    removeItem(line.productId, line.productVariantId)
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div
        className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: `${primaryColor}18` }}
      >
        <p className="text-sm">
          Estimated total{" "}
          <span className="font-semibold">{formatNaira(estimate, currency)}</span>
        </p>
        <Link
          href={`/${storeSlug}/checkout`}
          className="inline-flex min-h-11 items-center justify-center rounded-md px-5 text-sm font-semibold text-white"
          style={{ backgroundColor: accentColor }}
        >
          Checkout
        </Link>
      </div>
    </div>
  )
}
