import { EditColorForm } from "./_component/EditColorData"
import Heading from "@/components/StoreHeading"

export default function page() {
  return (
    <main className="space-y-1">
      <Heading
        title="Edit color"
        subtitle="Update color swatch details"
        showButton={false}
      />
      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        <EditColorForm />
      </div>
    </main>
  )
}
