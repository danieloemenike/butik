import Heading from "@/components/StoreHeading"
import { BillboardForm } from "./_components/BillboardForm"

export default function NewBillboard() {
  return (
    <main className="space-y-1">
      <Heading
        title="Create billboard"
        subtitle="Add a new storefront banner"
        showButton={false}
      />
      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        <BillboardForm />
      </div>
    </main>
  )
}
