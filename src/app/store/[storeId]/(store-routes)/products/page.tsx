import ProductPage from "./_components/productpage"
import prismadb from "@/lib/prismadb"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ storeId: string }>
}

export default async function Page({ params }: PageProps) {
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
    select: { currency: true },
  })

  if (!store) {
    redirect("/register-business")
  }

  return (
    <main>
      <ProductPage storeCurrency={store.currency} />
    </main>
  )
}
