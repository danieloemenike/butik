import Heading from "@/components/StoreHeading"
import { EditBillboardForm } from "./_component/EditBillBoard"

export default function page() {
  return (
    <main className="space-y-1">
      <Heading
        title="Edit billboard"
        subtitle="Update storefront banner details"
        showButton={false}
      />
      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        <EditBillboardForm />
      </div>
    </main>
  )
}
