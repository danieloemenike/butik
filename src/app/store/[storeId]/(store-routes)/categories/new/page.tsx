import Heading from "@/components/StoreHeading"
import { CategoryForm } from "./_components/CategoryForm"

export default function page() {
  return (
    <main className="space-y-1">
      <Heading
        title="Create category"
        subtitle="Add a new product category"
        showButton={false}
      />
      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        <CategoryForm />
      </div>
    </main>
  )
}
