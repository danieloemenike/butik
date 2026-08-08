import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { StorefrontShell } from "@/components/storefront/StorefrontShell"
import { CheckoutClient } from "./CheckoutClient"
import { resolveStorefront } from "@/lib/storefront"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ storeSlug: string }>
  searchParams: Promise<{ preview?: string }>
}

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
}

export default async function CheckoutPage({ params, searchParams }: PageProps) {
  const { storeSlug } = await params
  const sp = await searchParams
  if (sp.preview === "1") {
    redirect(`/${storeSlug}?preview=1`)
  }
  const { store, isPreview } = await resolveStorefront(storeSlug, false)
  if (isPreview) {
    redirect(`/${store.storeSlug}?preview=1`)
  }

  return (
    <StorefrontShell store={store} isPreview={false}>
      <CheckoutClient
        storeSlug={store.storeSlug!}
        accentColor={store.accentColor}
        primaryColor={store.primaryColor}
        currency={store.currency}
      />
    </StorefrontShell>
  )
}
