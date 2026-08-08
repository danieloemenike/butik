import { StorefrontCartProvider } from "@/components/storefront/StorefrontCartProvider"

type Props = {
  children: React.ReactNode
  params: Promise<{ storeSlug: string }>
}

export default async function StoreSlugLayout({ children, params }: Props) {
  const { storeSlug } = await params
  return (
    <StorefrontCartProvider storeSlug={storeSlug}>
      {children}
    </StorefrontCartProvider>
  )
}
