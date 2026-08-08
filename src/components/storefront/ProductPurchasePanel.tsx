"use client"

import { useMemo, useState } from "react"
import { AddToCartButton } from "@/components/storefront/AddToCartButton"
import { formatNaira } from "@/lib/storefront"

export type PurchaseVariant = {
  id: string
  price: number
  discountedPrice: number | null
  quantity: number | null
  label: string
  imageUrl?: string | null
}

type Props = {
  productId: string
  productName: string
  baseUnitPrice: number
  /** null = unlimited; 0 = out of stock */
  baseQuantity: number | null
  imageUrl?: string | null
  variants: PurchaseVariant[]
  accentColor: string
  primaryColor: string
  currency?: string
  disabled?: boolean
  disabledReason?: string
}

function isOutOfStock(qty: number | null) {
  return qty !== null && qty <= 0
}

export function ProductPurchasePanel({
  productId,
  productName,
  baseUnitPrice,
  baseQuantity,
  imageUrl,
  variants,
  accentColor,
  primaryColor,
  currency = "NGN",
  disabled,
  disabledReason,
}: Props) {
  const hasVariants = variants.length > 0
  const [selectedId, setSelectedId] = useState<string | null>(
    hasVariants ? variants.find((v) => !isOutOfStock(v.quantity))?.id ?? variants[0]!.id : null
  )

  const selected = useMemo(
    () => variants.find((v) => v.id === selectedId) ?? null,
    [variants, selectedId]
  )

  const unitPrice = selected
    ? selected.discountedPrice != null && selected.discountedPrice > 0
      ? selected.discountedPrice
      : selected.price
    : baseUnitPrice

  const stock = selected ? selected.quantity : baseQuantity
  const outOfStock = isOutOfStock(stock)

  if (disabled) {
    return (
      <p className="mt-8 text-sm opacity-70">
        {disabledReason || "Adding to cart is unavailable."}
      </p>
    )
  }

  return (
    <div className="mt-8 space-y-4">
      {hasVariants ? (
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Choose an option</h2>
          <ul className="mt-3 space-y-2">
            {variants.map((v) => {
              const price =
                v.discountedPrice != null && v.discountedPrice > 0
                  ? v.discountedPrice
                  : v.price
              const soldOut = isOutOfStock(v.quantity)
              const active = selectedId === v.id
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    disabled={soldOut}
                    onClick={() => setSelectedId(v.id)}
                    className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                    style={{
                      borderColor: active ? accentColor : `${primaryColor}18`,
                      boxShadow: active ? `inset 0 0 0 1px ${accentColor}` : undefined,
                    }}
                  >
                    <span className="font-medium">
                      {v.label}
                      {soldOut ? (
                        <span className="ml-2 text-xs font-normal opacity-60">
                          Sold out
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-medium">{formatNaira(price, currency)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {outOfStock ? (
        <p className="text-sm opacity-70">This item is currently out of stock.</p>
      ) : (
        <AddToCartButton
          productId={productId}
          productVariantId={selected?.id ?? null}
          name={productName}
          unitPrice={unitPrice}
          imageUrl={selected?.imageUrl || imageUrl}
          variantLabel={selected?.label ?? null}
          accentColor={accentColor}
          currency={currency}
          disabled={hasVariants && !selected}
          disabledReason="Select an option to add to cart."
        />
      )}
    </div>
  )
}
