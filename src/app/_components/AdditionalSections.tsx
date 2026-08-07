import {
  Boxes,
  KeyRound,
  LineChart,
  ShieldCheck,
  Store,
  Workflow,
} from "lucide-react"

const capabilities = [
  {
    icon: Store,
    title: "Multi-store architecture",
    description:
      "Operate independent storefronts under one business with isolated catalogs, billboards, and settings.",
  },
  {
    icon: KeyRound,
    title: "Store-scoped APIs",
    description:
      "Every store exposes its own API surface so frontend teams can ship without shared-data collisions.",
  },
  {
    icon: Boxes,
    title: "Catalog operations",
    description:
      "Products, categories, sizes, and colors are structured for high-SKU teams that need speed and precision.",
  },
  {
    icon: LineChart,
    title: "Revenue visibility",
    description:
      "Track sales, product volume, and graph revenue across stores without stitching spreadsheets together.",
  },
  {
    icon: Workflow,
    title: "Operator workflows",
    description:
      "From business registration to store provisioning, the path is designed for teams—not one-off builders.",
  },
  {
    icon: ShieldCheck,
    title: "Access-aware control",
    description:
      "Authenticated ownership across business and store routes keeps operations secure as you grow.",
  },
]

const operatingModel = [
  {
    step: "01",
    title: "Register the business",
    copy: "Create your operating entity and establish ownership for every store that follows.",
  },
  {
    step: "02",
    title: "Provision storefronts",
    copy: "Spin up branded stores with dedicated inventory domains, media, and storefront configuration.",
  },
  {
    step: "03",
    title: "Connect and scale",
    copy: "Use store-scoped APIs and analytics to power client apps and expand without re-platforming.",
  },
]

function PlatformSection() {
  return (
    <section id="platform" className="scroll-mt-24 border-t border-ink/8 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-[0.16em] text-teal uppercase">
            Platform
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium leading-tight tracking-[-0.03em] text-ink md:text-4xl">
            Built for commerce teams that run more than one brand.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            Butik is the operational layer between your business, your stores,
            and the experiences you ship to customers.
          </p>
        </div>

        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item) => (
            <div key={item.title} className="group">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-teal-soft text-teal transition-transform duration-300 group-hover:-translate-y-0.5">
                <item.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-xl font-medium tracking-[-0.02em] text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function OperationsSection() {
  return (
    <section
      id="operations"
      className="scroll-mt-24 border-t border-ink/8 bg-surface-deep py-24 text-surface-raised md:py-32 dark:bg-surface-raised dark:text-ink"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-[#9ad9d1] uppercase dark:text-teal">
              Operations
            </p>
            <h2 className="mt-4 font-display text-3xl font-medium leading-tight tracking-[-0.03em] md:text-4xl">
              A clear path from business setup to production APIs.
            </h2>
            <p className="mt-4 max-w-[40ch] text-lg leading-relaxed text-surface-raised/65 dark:text-ink-muted">
              Enterprise teams need predictability. Butik sequences the work so
              every store lands ready for catalog, media, and integration.
            </p>
          </div>

          <ol className="space-y-0">
            {operatingModel.map((item, index) => (
              <li
                key={item.step}
                className={`grid grid-cols-[4.5rem_1fr] gap-4 py-8 md:gap-8 ${
                  index !== operatingModel.length - 1
                    ? "border-b border-surface-raised/10 dark:border-ink/10"
                    : ""
                }`}
              >
                <span className="font-display text-2xl font-medium tracking-tight text-[#9ad9d1] dark:text-teal">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-display text-xl font-medium tracking-[-0.02em]">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-surface-raised/60 dark:text-ink-muted">
                    {item.copy}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function TrustSection() {
  return (
    <section className="border-t border-ink/8 py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            {
              value: "Store isolation",
              label: "Data and APIs scoped per storefront by design",
            },
            {
              value: "Operator ready",
              label: "Business → store → catalog flows without rework",
            },
            {
              value: "API-first",
              label: "Build storefronts and clients on stable endpoints",
            },
          ].map((item) => (
            <div
              key={item.value}
              className="md:border-l md:border-ink/10 md:pl-8 first:md:border-l-0 first:md:pl-0"
            >
              <p className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
                {item.value}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AdditionalSections() {
  return (
    <>
      <PlatformSection />
      <OperationsSection />
      <TrustSection />
    </>
  )
}

export default AdditionalSections
