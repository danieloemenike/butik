import prismadb from "@/lib/prismadb"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"
import BusinessHeader from "./_components/BusinessHeader"
import StoreList from "./_components/storeList"

type Props = {
  params: Promise<{
    businessId: string
  }>
}

async function BusinessPage({ params }: Props) {
  const { businessId } = await params
  const { getUser, isAuthenticated } = getKindeServerSession()
  const user = await getUser()
  const isAuth = await isAuthenticated()

  if (!isAuth || !user?.id) {
    redirect("/")
  }

  const business = await prismadb.business.findUnique({
    where: {
      id: businessId,
      userId: user.id,
    },
  })

  if (!business) {
    redirect("/register-business")
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,hsl(var(--foreground)_/_0.06),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,hsl(var(--foreground)_/_0.08),transparent_55%)]"
      />
      <div className="relative">
        <BusinessHeader
          business={{
            id: business.id,
            name: business.name,
            phoneNumber: business.phoneNumber,
            address: business.address,
            city: business.city,
            country: business.country,
          }}
          user={user}
        />
        <StoreList
          businessName={business.name}
          userName={user.given_name}
        />
      </div>
    </main>
  )
}

export default BusinessPage
