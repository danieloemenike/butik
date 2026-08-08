import Heading from "@/components/StoreHeading"
import prismadb from "@/lib/prismadb"
import { ProductForm } from "./_components/ProductForm"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ storeId: string }>
}

export default async function page({ params }: PageProps) {
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
    select: { id: true, currency: true },
  })

  if (!store) {
    redirect("/register-business")
  }

  const categories = await prismadb.category.findMany({
    include: {
      subcategories: true,
    },
  })

  return (
    <main className="space-y-1">
      <Heading
        title="Create product"
        subtitle="Add a new item to your store catalog"
        showButton={false}
      />
      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        <ProductForm
          categories={categories}
          storeCurrency={store.currency}
        />
      </div>
    </main>
  )
}
