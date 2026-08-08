import { AppSidebar } from "@/components/app-sidebar"
import StoreInsetHeader from "@/components/StoreInsetHeader"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import prismadb from "@/lib/prismadb"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Butik — Store dashboard",
  description: "Operate your storefronts with Butik",
}

type BusinessProps = {
  children: React.ReactNode
  params: Promise<{
    storeId: string
  }>
}

export default async function StoreLayout({ children, params }: BusinessProps) {
  const { storeId } = await params
  const { getUser, isAuthenticated } = getKindeServerSession()
  const userInfo = await getUser()
  const userId = userInfo?.id
  const isAuth = await isAuthenticated()

  if (!isAuth || !userId) {
    redirect("/")
  }

  const store = await prismadb.store.findUnique({
    where: {
      userId,
      id: storeId,
    },
  })

  if (!store) {
    redirect("/register-business")
  }

  const storefrontHref = store.storeSlug
    ? store.status === "PUBLISHED"
      ? `/${store.storeSlug}`
      : `/${store.storeSlug}?preview=1`
    : null

  return (
    <SidebarProvider>
      <AppSidebar
        storeName={store.name}
        businessId={store.businessId}
        storeStatus={store.status}
        storeSlug={store.storeSlug}
        storefrontHref={storefrontHref}
      />
      <SidebarInset className="min-h-svh bg-background">
        <StoreInsetHeader />
        <div className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-5 md:px-6 md:py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
