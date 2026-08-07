import { NewColorForm } from "./_components/ColorForm"
import Heading from "@/components/StoreHeading"

export default function page() {
  return (
    <main className="space-y-1">
      <Heading
        title="Create color"
        subtitle="Add a product color swatch"
        showButton={false}
      />
      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        <NewColorForm />
      </div>
    </main>
  )
}
