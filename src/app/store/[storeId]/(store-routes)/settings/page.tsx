import Heading from "@/components/StoreHeading"
import prismadb from "@/lib/prismadb"
import { assessPublishReadiness } from "@/lib/store-publication"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"
import { StoreSettingsClient } from "./_components/StoreSettingsClient"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ storeId: string }>
}

export default async function StoreSettingsPage({ params }: PageProps) {
  const { storeId } = await params
  const { getUser, isAuthenticated } = getKindeServerSession()
  const userInfo = await getUser()
  const userId = userInfo?.id
  const isAuth = await isAuthenticated()

  if (!isAuth || !userId) {
    redirect("/")
  }

  const store = await prismadb.store.findFirst({
    where: { id: storeId, userId },
  })

  if (!store) {
    redirect("/register-business")
  }

  const readiness = await assessPublishReadiness(store)

  return (
    <div>
      <Heading
        title="Settings"
        subtitle="Store identity, public URL, and whether your storefront is live."
        showButton={false}
      />
      <StoreSettingsClient
        store={{
          id: store.id,
          businessId: store.businessId,
          name: store.name,
          storeSlug: store.storeSlug,
          phoneNumber: store.phoneNumber,
          address: store.address,
          city: store.city,
          country: store.country,
          currency: store.currency,
          status: store.status,
          publishedAt: store.publishedAt?.toISOString() ?? null,
        }}
        productsMissingSlug={readiness.warnings.productsMissingSlug}
        productsHidden={readiness.warnings.productsHidden}
      />
    </div>
  )
}
