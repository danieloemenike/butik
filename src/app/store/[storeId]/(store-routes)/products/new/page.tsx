import { ProductForm } from "./_components/ProductForm"
import Heading from "@/components/StoreHeading"
import prismadb from "@/lib/prismadb"

export default async function page() {
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
        <ProductForm categories={categories} />
      </div>
    </main>
  )
}
