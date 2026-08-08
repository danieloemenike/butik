import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ExternalLink,
  Store,
} from "lucide-react"

const stores = [
  {
    name: "North Atelier",
    slug: "north_atelier",
    status: "Live" as const,
    tone: "bg-teal-soft text-teal",
  },
  {
    name: "Harbor Goods",
    slug: "harbor_goods",
    status: "Draft" as const,
    tone: "bg-secondary text-muted-foreground",
  },
  {
    name: "Studio Lane",
    slug: "studio_lane",
    status: "Live" as const,
    tone: "bg-teal-soft text-teal",
  },
]

export function OnboardingVisual() {
  return (
    <aside
      className="sticky top-20 hidden min-h-128 w-full self-start lg:block"
      aria-hidden
    >
      <div className="absolute inset-0 overflow-hidden rounded-4xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_10%,var(--landing-teal-soft),transparent_52%),radial-gradient(ellipse_at_90%_90%,hsl(var(--secondary)),transparent_48%),linear-gradient(165deg,hsl(var(--card))_0%,transparent_72%)]" />
        <div className="landing-grid absolute inset-0 opacity-35" />
        <div className="landing-grain absolute inset-0 opacity-45" />
        <div className="absolute -left-10 top-20 h-48 w-48 rounded-full bg-teal/12 blur-3xl" />
        <div className="absolute -right-8 bottom-16 h-52 w-52 rounded-full bg-ink/5 blur-3xl dark:bg-white/5" />
      </div>

      <div className="relative z-10 flex h-full min-h-128 flex-col justify-center gap-5 px-5 py-8 xl:px-6">
        <div className="motion-safe:animate-dash-fade-up max-w-sm">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-teal uppercase">
            Multi-store ops
          </p>
          <h2 className="mt-2 font-display text-[1.65rem] leading-[1.15] font-medium tracking-tight text-foreground">
            One business.
            <br />
            Multiple storefronts.
          </h2>
          <p className="mt-2.5 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">
            Register once, then launch branded shops with shared ops and
            store-scoped APIs.
          </p>
        </div>

        <div className="relative w-full max-w-104">
          <div className="motion-safe:animate-dash-enter overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-[0_40px_100px_-36px_rgba(12,18,25,0.42)] backdrop-blur-sm [animation-delay:120ms] dark:border-white/10 dark:shadow-[0_40px_100px_-28px_rgba(0,0,0,0.75)]">
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-teal-soft text-teal">
                  <Building2 className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="font-display text-[15px] font-medium tracking-tight text-foreground">
                    Butik Commerce
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Parent business
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-2 py-1 text-[10px] font-semibold text-foreground">
                <span className="motion-safe:animate-dash-soft-pulse h-1.5 w-1.5 rounded-full bg-teal" />
                Active
              </span>
            </div>

            <div className="space-y-4 p-4">
              <div className="motion-safe:animate-dash-fade-up rounded-xl border border-border bg-background p-3 [animation-delay:220ms]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-soft text-teal">
                    <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                    {stores.map((store) => (
                      <span
                        key={store.slug}
                        className="inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border border-border bg-secondary/50 px-1.5"
                      >
                        <Store
                          className="h-3 w-3 shrink-0 text-teal"
                          strokeWidth={1.75}
                        />
                        <span className="truncate text-[9px] font-semibold text-foreground">
                          {store.name.split(" ")[0]}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
                  One profile powers every storefront under your business.
                </p>
              </div>

              <div className="motion-safe:animate-dash-fade-up space-y-2 [animation-delay:320ms]">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    Storefronts
                  </p>
                  <span className="text-[10px] font-medium text-teal">
                    3 connected
                  </span>
                </div>
                {stores.map((store, index) => (
                  <div
                    key={store.slug}
                    className="motion-safe:animate-dash-fade-up flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5"
                    style={{ animationDelay: `${380 + index * 70}ms` }}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary font-display text-[11px] font-semibold tracking-tight text-foreground">
                        {store.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium tracking-tight text-foreground">
                          {store.name}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          @{store.slug}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${store.tone}`}
                    >
                      {store.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="motion-safe:animate-dash-float absolute -right-1 top-6 z-20 w-44 rounded-xl border border-border bg-card/95 p-3 shadow-[0_18px_40px_-20px_rgba(12,18,25,0.45)] backdrop-blur-md [animation-delay:520ms] dark:border-white/10 xl:-right-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[9px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Public URL
                </p>
                <p className="mt-1 font-display text-sm font-medium tracking-tight text-foreground">
                  /north_atelier
                </p>
              </div>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-teal-soft text-teal">
                <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[10px]">
              <span className="font-medium text-teal">Published</span>
              <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                Open
                <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
