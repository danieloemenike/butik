"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useStorefrontCart } from "@/components/storefront/StorefrontCartProvider"
import { storefrontHref } from "@/lib/store-identity"

export function StorefrontCartLink({
  storeSlug,
  preview,
  accentColor = "var(--sf-accent)",
}: {
  storeSlug: string
  preview: boolean
  accentColor?: string
}) {
  const { count, hydrated } = useStorefrontCart()

  return (
    <Link
      href={
        preview
          ? storefrontHref(storeSlug, "products", { preview: true })
          : `/${storeSlug}/cart`
      }
      aria-label={preview ? "Cart unavailable in preview" : "Cart"}
      className="relative inline-flex min-h-10 min-w-10 items-center justify-center rounded-md opacity-80 transition-opacity hover:opacity-100"
      title={preview ? "Checkout is disabled in preview" : "Cart"}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
      {hydrated && count > 0 && !preview ? (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  )
}
