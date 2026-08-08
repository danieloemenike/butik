"use client"

import { useState } from "react"
import { useStorefrontCart } from "@/components/storefront/StorefrontCartProvider"
import { formatNaira } from "@/lib/storefront"

type Props = {
  productId: string
  productVariantId?: string | null
  name: string
  unitPrice: number
  imageUrl?: string | null
  variantLabel?: string | null
  accentColor: string
  currency?: string
  disabled?: boolean
  disabledReason?: string
}

export function AddToCartButton({
  productId,
  productVariantId,
  name,
  unitPrice,
  imageUrl,
  variantLabel,
  accentColor,
  currency = "NGN",
  disabled,
  disabledReason,
}: Props) {
  const { addItem } = useStorefrontCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  if (disabled) {
    return (
      <p className="mt-8 text-sm opacity-70">
        {disabledReason || "Adding to cart is unavailable."}
      </p>
    )
  }

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="flex items-center gap-2 text-sm">
        <span className="opacity-70">Qty</span>
        <input
          type="number"
          min={1}
          max={50}
          value={qty}
          onChange={(e) =>
            setQty(Math.min(50, Math.max(1, Number(e.target.value) || 1)))
          }
          className="h-11 w-20 rounded-md border bg-transparent px-2"
        />
      </label>
      <button
        type="button"
        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md px-4 text-sm font-semibold text-white sm:flex-none"
        style={{ backgroundColor: accentColor }}
        onClick={() => {
          addItem({
            productId,
            productVariantId: productVariantId || null,
            quantity: qty,
            display: {
              name,
              unitPrice,
              imageUrl: imageUrl || undefined,
              variantLabel,
            },
          })
          setAdded(true)
          window.setTimeout(() => setAdded(false), 1600)
        }}
      >
        {added ? "Added" : `Add to cart · ${formatNaira(unitPrice, currency)}`}
      </button>
    </div>
  )
}
