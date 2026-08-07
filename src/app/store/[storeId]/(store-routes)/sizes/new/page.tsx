import { NewSizeForm } from "./_components/SizeForm"
import Heading from "@/components/StoreHeading"

export default function page() {
  return (
    <main className="space-y-1">
      <Heading
        title="Create size"
        subtitle="Add a product size option"
        showButton={false}
      />
      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        <NewSizeForm />
      </div>
    </main>
  )
}
