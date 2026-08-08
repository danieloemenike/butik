import type { Metadata } from "next"
import { StorefrontShell } from "@/components/storefront/StorefrontShell"
import { CartClient } from "./CartClient"
import { resolveStorefront } from "@/lib/storefront"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ storeSlug: string }>
  searchParams: Promise<{ preview?: string }>
}

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
}

export default async function CartPage({ params, searchParams }: PageProps) {
  const { storeSlug } = await params
  const sp = await searchParams
  const { store, isPreview } = await resolveStorefront(
    storeSlug,
    sp.preview === "1"
  )

  return (
    <StorefrontShell store={store} isPreview={isPreview}>
      <CartClient
        storeSlug={store.storeSlug!}
        accentColor={store.accentColor}
        primaryColor={store.primaryColor}
        currency={store.currency}
        isPreview={isPreview}
      />
    </StorefrontShell>
  )
}
