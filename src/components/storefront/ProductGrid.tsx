import Link from "next/link"
import Image from "next/image"
import {
  formatNaira,
  type StorefrontProduct,
} from "@/lib/storefront"
import { storefrontHref } from "@/lib/store-identity"
import { StorefrontEmptyState } from "@/components/storefront/StorefrontEmptyState"

type Props = {
  storeSlug: string
  products: StorefrontProduct[]
  emptyTitle?: string
  emptyMessage?: string
  emptyActionHref?: string
  emptyActionLabel?: string
  accentColor?: string
  primaryColor?: string
  currency?: string
  isPreview?: boolean
}

export function ProductGrid({
  storeSlug,
  products,
  emptyTitle = "Nothing here yet",
  emptyMessage = "No products yet.",
  emptyActionHref,
  emptyActionLabel,
  accentColor,
  primaryColor,
  currency = "NGN",
  isPreview = false,
}: Props) {
  if (!products.length) {
    return (
      <StorefrontEmptyState
        title={emptyTitle}
        description={emptyMessage}
        actionHref={emptyActionHref}
        actionLabel={emptyActionLabel}
        accentColor={accentColor}
        primaryColor={primaryColor}
      />
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6">
      {products.map((product) => {
        const image = product.images[0]?.url
        const price = product.discountedPrice ?? product.price
        const productSlug = product.slug
        if (!productSlug) return null

        return (
          <li key={product.id}>
            <Link
              href={storefrontHref(storeSlug, { productSlug }, { preview: isPreview })}
              className="group block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-black/[0.04] sm:aspect-[4/5]">
                {image ? (
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-2 text-center text-[11px] opacity-40 sm:text-xs">
                    No image
                  </div>
                )}
              </div>
              <div className="mt-2.5 space-y-0.5 sm:mt-3 sm:space-y-1">
                <p className="line-clamp-2 text-sm font-medium tracking-tight sm:text-base">
                  {product.name}
                </p>
                <p className="text-xs opacity-75 sm:text-sm">
                  {formatNaira(price, currency)}
                </p>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
