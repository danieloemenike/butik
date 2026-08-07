import { EditSizeForm } from "./_component/EditSizeData"
import Heading from "@/components/StoreHeading"

export default function page() {
  return (
    <main className="space-y-1">
      <Heading
        title="Edit size"
        subtitle="Update size option details"
        showButton={false}
      />
      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        <EditSizeForm />
      </div>
    </main>
  )
}
