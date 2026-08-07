import Heading from "@/components/StoreHeading"
import { EditCategoryForm } from "./_component/EditCategoryData"

export default function page() {
  return (
    <main className="space-y-1">
      <Heading
        title="Edit category"
        subtitle="Update category details"
        showButton={false}
      />
      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        <EditCategoryForm />
      </div>
    </main>
  )
}
