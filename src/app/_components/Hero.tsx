import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components"
import {
  ArrowLeftRight,
  ArrowUpRight,
  Home,
  ImageIcon,
  Package,
  Palette,
  PanelLeft,
  Receipt,
  Ruler,
  ShoppingBag,
  Sparkles,
  Store,
  Tags,
  Wallet,
} from "lucide-react"
import { ButikLogo } from "@/components/ButikLogo"

const sidebarSections = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", icon: Home, active: true }],
  },
  {
    label: "Catalog",
    items: [{ title: "Products", icon: Package, active: false }],
  },
  {
    label: "Images",
    items: [{ title: "Billboards", icon: ImageIcon, active: false }],
  },
  {
    label: "Attributes",
    items: [
      { title: "Categories", icon: Tags, active: false },
      { title: "Colors", icon: Palette, active: false },
      { title: "Sizes", icon: Ruler, active: false },
    ],
  },
]

const metrics = [
  {
    title: "Total revenue",
    value: "₦128,440",
    hint: "Gross sales",
    icon: Wallet,
  },
  {
    title: "Sales",
    value: "248",
    hint: "Completed orders",
    icon: ShoppingBag,
  },
  {
    title: "In stock",
    value: "96",
    hint: "Live products",
    icon: Package,
  },
  {
    title: "Avg. order",
    value: "₦518",
    hint: "Per completed sale",
    icon: Receipt,
  },
]

const barHeights = [38, 55, 42, 70, 48, 82, 60, 74, 52, 88, 66, 78]
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const quickActions = [
  { label: "Products", description: "Manage catalog", icon: Package },
  { label: "Billboards", description: "Update imagery", icon: ImageIcon },
  { label: "Categories", description: "Organize taxonomy", icon: Tags },
  { label: "Colors", description: "Define swatches", icon: Palette },
]

const catalogStats = [
  { label: "Products", value: "96", icon: Package },
  { label: "Featured", value: "12", icon: Sparkles },
  { label: "Categories", value: "8", icon: Tags },
  { label: "Billboards", value: "4", icon: ImageIcon },
  { label: "Colors", value: "14", icon: Palette },
  { label: "Sizes", value: "9", icon: Ruler },
]

const recentProducts = [
  { name: "Canvas Tote", category: "Bags", price: "₦18,500", tone: "bg-teal-soft" },
  { name: "Linen Shirt", category: "Apparel", price: "₦24,000", tone: "bg-secondary" },
  { name: "Studio Cap", category: "Accessories", price: "₦9,200", tone: "bg-muted" },
]

function DashboardMock() {
  return (
    <div className="motion-safe:animate-dash-enter flex h-full w-full overflow-hidden rounded-t-xl border border-ink/10 bg-background shadow-[0_40px_120px_-28px_rgba(12,18,25,0.28)] [animation-delay:180ms] dark:border-white/10 dark:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)] lg:rounded-tl-xl lg:rounded-tr-none">
      <div className="motion-safe:animate-dash-float flex h-full w-full [animation-delay:1.1s]">
      {/* Sidebar — mirrors AppSidebar */}
      <aside className="motion-safe:animate-dash-fade-up hidden w-[168px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar [animation-delay:320ms] md:flex">
        <div className="flex h-12 items-center px-3">
          <p className="font-display text-sm font-semibold tracking-tighter text-sidebar-foreground">
            BUTIK
          </p>
        </div>

        <div className="px-2 pb-2">
          <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/60 px-2 py-1.5">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-soft text-teal">
              <Store className="h-3 w-3" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold tracking-tight text-sidebar-foreground">
                North Atelier
              </p>
              <p className="text-[9px] text-muted-foreground">Active store</p>
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-3 overflow-hidden px-2 pb-2">
          {sidebarSections.map((section) => (
            <div key={section.label} className="space-y-0.5">
              <p className="px-2 py-1 text-[9px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {section.label}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${
                      item.active
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/75"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${
                        item.active ? "motion-safe:animate-dash-soft-pulse text-teal" : ""
                      }`}
                      strokeWidth={1.6}
                    />
                    <span className="truncate">{item.title}</span>
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border px-2 py-2">
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-sidebar-foreground/75">
            <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={1.6} />
            Switch store
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-background">
        {/* Inset header — mirrors StoreInsetHeader */}
        <div className="motion-safe:animate-dash-fade-up flex h-11 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur-md [animation-delay:380ms] sm:px-4">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground">
            <PanelLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
          </span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <div className="min-w-0 flex-1" />
          <span className="h-2.5 w-2.5 rounded-full border border-border" />
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal text-[9px] font-semibold text-white dark:text-surface-deep">
            NA
          </span>
          <span className="hidden text-[10px] font-medium text-muted-foreground sm:inline">
            Logout
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-3 py-3 sm:px-4 sm:py-4">
          <header className="motion-safe:animate-dash-fade-up mb-3 [animation-delay:420ms]">
            <h3 className="font-display text-[15px] font-medium tracking-tight text-foreground sm:text-base">
              Dashboard
            </h3>
            <p className="text-[10px] text-muted-foreground sm:text-[11px]">
              Store performance at a glance
            </p>
          </header>

          <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon
              return (
                <div
                  key={metric.title}
                  className="motion-safe:animate-dash-fade-up rounded-xl border border-border bg-card px-2.5 py-2.5 sm:px-3 sm:py-3"
                  style={{ animationDelay: `${480 + index * 70}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[9px] font-medium text-muted-foreground sm:text-[10px]">
                        {metric.title}
                      </p>
                      <p className="mt-1 font-display text-sm font-medium tracking-tight text-foreground sm:text-[15px]">
                        {metric.value}
                      </p>
                      <p className="mt-0.5 hidden text-[9px] text-muted-foreground sm:block">
                        {metric.hint}
                      </p>
                    </div>
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-soft text-teal">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-2.5 grid gap-2 sm:mt-3 lg:grid-cols-[1.7fr_1fr]">
            <div className="motion-safe:animate-dash-fade-up rounded-xl border border-border bg-card p-2.5 [animation-delay:760ms] sm:p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="font-display text-xs font-medium tracking-tight text-foreground sm:text-[13px]">
                    Revenue overview
                  </p>
                  <p className="hidden text-[9px] text-muted-foreground sm:block">
                    Monthly totals for this year
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-[2px] bg-teal" />
                  Revenue
                </span>
              </div>

              <div className="relative h-[88px] sm:h-[108px]">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-1 bottom-4 flex flex-col justify-between"
                >
                  {[0, 1, 2].map((line) => (
                    <div
                      key={line}
                      className="border-t border-dashed border-border/70"
                    />
                  ))}
                </div>
                <div className="absolute inset-x-0 top-1 bottom-4 flex items-end gap-1 px-0.5 sm:gap-1.5">
                  {barHeights.map((height, index) => (
                    <div
                      key={months[index]}
                      className="flex min-w-0 flex-1 flex-col items-center justify-end"
                    >
                      <div
                        className="motion-safe:animate-dash-bar w-full max-w-[11px] origin-bottom rounded-t-[3px] bg-teal"
                        style={{
                          height: `${height}%`,
                          animationDelay: `${820 + index * 45}ms`,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-x-0 bottom-0 flex justify-between">
                  {months.map((month, index) => (
                    <span
                      key={month}
                      className={`flex-1 text-center text-[7px] text-muted-foreground ${
                        index % 2 === 1 ? "hidden sm:inline" : ""
                      }`}
                    >
                      {month}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="motion-safe:animate-dash-fade-up hidden rounded-xl border border-border bg-card p-3 [animation-delay:840ms] lg:block">
              <p className="font-display text-[13px] font-medium tracking-tight text-foreground">
                Quick actions
              </p>
              <p className="mb-2 text-[9px] text-muted-foreground">
                Common store workflows
              </p>
              <div className="space-y-1.5">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <div
                      key={action.label}
                      className="motion-safe:animate-dash-fade-up flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2 py-1.5"
                      style={{ animationDelay: `${900 + index * 60}ms` }}
                    >
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
                        <Icon className="h-3 w-3" strokeWidth={1.6} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-semibold text-foreground">
                          {action.label}
                        </span>
                        <span className="block text-[8px] text-muted-foreground">
                          {action.description}
                        </span>
                      </span>
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-2.5 hidden gap-2 sm:mt-3 sm:grid lg:grid-cols-2">
            <div className="motion-safe:animate-dash-fade-up rounded-xl border border-border bg-card p-3 [animation-delay:980ms]">
              <p className="font-display text-[13px] font-medium tracking-tight text-foreground">
                Catalog snapshot
              </p>
              <p className="mb-2 text-[9px] text-muted-foreground">
                Inventory and attribute coverage
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {catalogStats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-border bg-muted/25 px-2 py-2"
                    >
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Icon className="h-2.5 w-2.5" strokeWidth={1.6} />
                        <span className="truncate text-[8px] font-medium">
                          {stat.label}
                        </span>
                      </div>
                      <p className="mt-1 font-display text-sm font-medium tracking-tight text-foreground">
                        {stat.value}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="motion-safe:animate-dash-fade-up rounded-xl border border-border bg-card p-3 [animation-delay:1040ms]">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-display text-[13px] font-medium tracking-tight text-foreground">
                    Recent products
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    Latest additions to your catalog
                  </p>
                </div>
                <span className="text-[9px] font-medium text-teal">View all</span>
              </div>
              <ul className="divide-y divide-border">
                {recentProducts.map((product, index) => (
                  <li
                    key={product.name}
                    className="motion-safe:animate-dash-fade-up flex items-center gap-2 py-2 first:pt-0 last:pb-0"
                    style={{ animationDelay: `${1100 + index * 70}ms` }}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-md border border-border ${product.tone}`}
                    >
                      <Package
                        className="h-3.5 w-3.5 text-muted-foreground"
                        strokeWidth={1.6}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold text-foreground">
                        {product.name}
                      </p>
                      <p className="truncate text-[9px] text-muted-foreground">
                        {product.category}
                      </p>
                    </div>
                    <p className="text-[10px] font-medium text-foreground">
                      {product.price}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

function HeroBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="landing-hero-bg absolute inset-0 animate-landing-pan" />
      <div className="landing-grid absolute inset-0 opacity-50 dark:opacity-35" />
      <div className="landing-grain absolute inset-0 z-[1]" />
    </div>
  )
}

function HeroCopy() {
  return (
    <div className="max-w-xl shrink-0">
      <div className="animate-landing-fade-up">
        <ButikLogo href={null} size="xl" className="text-ink" />
      </div>
      <h1 className="animate-landing-fade-up mt-4 max-w-[16ch] font-display text-[clamp(1.55rem,5.8vw,2.2rem)] leading-[1.18] font-medium tracking-[-0.03em] text-ink-soft sm:mt-6 [animation-delay:110ms]">
        Multi-vendor commerce infrastructure for operators who scale.
      </h1>
      <p className="animate-landing-fade-up mt-3 max-w-[34ch] text-[0.95rem] leading-relaxed text-ink-muted sm:mt-5 sm:text-lg [animation-delay:190ms]">
        Launch storefronts, manage catalogs, and ship store-scoped APIs from one
        control plane built for enterprise operations.
      </p>
      <div className="animate-landing-fade-up mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center [animation-delay:270ms]">
        <RegisterLink className="inline-flex h-11 w-full items-center justify-center rounded-md bg-ink px-6 text-sm font-semibold text-surface-raised transition-opacity hover:opacity-90 sm:h-12 sm:w-auto">
          Start building
        </RegisterLink>
        <a
          href="#platform"
          className="inline-flex h-11 w-full items-center justify-center rounded-md border border-ink/15 px-5 text-sm font-semibold text-ink-soft transition-colors hover:bg-ink/5 sm:h-12 sm:w-auto"
        >
          Explore platform
        </a>
      </div>
    </div>
  )
}

function MobileDashboardPreview() {
  return (
    <div
      className="relative mt-8 min-h-[220px] flex-1 overflow-hidden sm:mt-10 sm:min-h-[280px] lg:hidden"
      aria-hidden
    >
      <div className="absolute inset-x-0 top-2 bottom-0 origin-top scale-[0.96] sm:inset-x-2 sm:scale-100">
        <div className="h-[130%] w-full sm:h-[125%]">
          <DashboardMock />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-raised via-surface-raised/85 to-transparent dark:from-[#0c1219] dark:via-[#0c1219]/90" />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-surface-raised text-ink">
      <HeroBackdrop />

      {/* Desktop: absolute product preview on the right */}
      <div
        className="pointer-events-none absolute top-[14%] right-0 bottom-[-14%] left-[42%] z-1 hidden lg:block"
        aria-hidden
      >
        <DashboardMock />
      </div>

      {/* Softens copy over the product preview (top on mobile, left on lg+) */}
      <div className="landing-hero-veil pointer-events-none absolute inset-0 z-2" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col px-5 pt-20 pb-0 sm:px-8 sm:pt-24 lg:justify-center lg:pt-24 lg:pb-24">
        <HeroCopy />
        <MobileDashboardPreview />
      </div>
    </section>
  )
}

export default Hero
