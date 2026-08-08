import Heading from "@/components/StoreHeading"
import prismadb from "@/lib/prismadb"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"
import { AppearanceClient } from "./_components/AppearanceClient"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ storeId: string }>
}

export default async function AppearancePage({ params }: PageProps) {
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

  return (
    <div>
      <Heading
        title="Store appearance"
        subtitle="Themes, light/dark mode, logo, and typography for your public storefront."
        showButton={false}
      />
      <AppearanceClient
        store={{
          id: store.id,
          businessId: store.businessId,
          name: store.name,
          logoUrl: store.logoUrl,
          primaryColor: store.primaryColor,
          accentColor: store.accentColor,
          backgroundColor: store.backgroundColor,
          darkPrimaryColor: store.darkPrimaryColor,
          darkAccentColor: store.darkAccentColor,
          darkBackgroundColor: store.darkBackgroundColor,
          themePreset: store.themePreset,
          colorMode: store.colorMode,
          displayFont: store.displayFont,
          bodyFont: store.bodyFont,
          tagline: store.tagline,
        }}
      />
    </div>
  )
}
