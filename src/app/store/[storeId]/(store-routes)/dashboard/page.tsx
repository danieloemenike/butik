import Heading from "@/components/StoreHeading"
import { getProductCount } from "@/actions/getProductCount"
import { getTotalRevenue } from "@/actions/getTotalRevenue"
import { getSalesCount } from "@/actions/getSalesCount"
import { getGraphRevenue } from "@/actions/getGraphRevenue"
import { formatStoreMoney } from "@/lib/utils"
import ChartOverview from "@/components/ChartOverview"
import prismadb from "@/lib/prismadb"
import {
  ArrowUpRight,
  ImageIcon,
  Package,
  Palette,
  Receipt,
  Ruler,
  ShoppingBag,
  Sparkles,
  Tags,
  Wallet,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type Props = {
  params: Promise<{
    storeId: string
  }>
}

async function DashboardPage({ params }: Props) {
  const { storeId } = await params
  const [
    store,
    totalRevenue,
    totalSalesCount,
    totalProducts,
    totalGraphRevenue,
    categoryCount,
    billboardCount,
    colorCount,
    sizeCount,
    featuredCount,
    recentProducts,
  ] = await Promise.all([
    prismadb.store.findUnique({
      where: { id: storeId },
      select: { currency: true },
    }),
    getTotalRevenue(storeId),
    getSalesCount(storeId),
    getProductCount(storeId),
    getGraphRevenue(storeId),
    prismadb.category.count({
      where: { products: { some: { storeId } } },
    }),
    prismadb.billboard.count({ where: { storeId } }),
    prismadb.color.count({ where: { storeId } }),
    prismadb.size.count({ where: { storeId } }),
    prismadb.product.count({
      where: { storeId, isFeatured: true, isArchived: false },
    }),
    prismadb.product.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        images: {
          where: { productVariantId: null },
          take: 1,
        },
        category: true,
      },
    }),
  ])

  const currency = store?.currency || "NGN"
  const money = (amount: number) => formatStoreMoney(amount, currency)

  const avgOrderValue =
    totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0

  const metrics = [
    {
      title: "Total revenue",
      value: money(totalRevenue),
      hint: "Gross sales",
      icon: Wallet,
    },
    {
      title: "Sales",
      value: String(totalSalesCount),
      hint: "Completed orders",
      icon: ShoppingBag,
    },
    {
      title: "In stock",
      value: String(totalProducts),
      hint: "Live products",
      icon: Package,
    },
    {
      title: "Avg. order",
      value: money(avgOrderValue),
      hint: "Per completed sale",
      icon: Receipt,
    },
  ]

  const actions = [
    {
      label: "Products",
      description: "Manage catalog",
      href: `/store/${storeId}/products`,
      icon: Package,
    },
    {
      label: "Billboards",
      description: "Update imagery",
      href: `/store/${storeId}/billboards`,
      icon: ImageIcon,
    },
    {
      label: "Categories",
      description: "Organize taxonomy",
      href: `/store/${storeId}/categories`,
      icon: Tags,
    },
    {
      label: "Colors",
      description: "Define swatches",
      href: `/store/${storeId}/colors`,
      icon: Palette,
    },
  ]

  const catalogStats = [
    { label: "Products", value: totalProducts, icon: Package },
    { label: "Featured", value: featuredCount, icon: Sparkles },
    { label: "Categories", value: categoryCount, icon: Tags },
    { label: "Billboards", value: billboardCount, icon: ImageIcon },
    { label: "Colors", value: colorCount, icon: Palette },
    { label: "Sizes", value: sizeCount, icon: Ruler },
  ]

  return (
    <section className="space-y-5">
      <Heading
        title="Dashboard"
        subtitle="Store performance at a glance"
        showButton={false}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.title}
            className="rounded-xl border border-border bg-card px-4 py-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <p className="mt-2 font-display text-[1.55rem] leading-none font-medium tracking-tight text-foreground">
                  {metric.value}
                </p>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {metric.hint}
                </p>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-teal-soft text-teal">
                <metric.icon className="h-4 w-4" strokeWidth={1.6} />
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.7fr_1fr]">
        <article className="rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-medium tracking-tight text-foreground">
                Revenue overview
              </h2>
              <p className="text-[12px] text-muted-foreground">
                Monthly totals for this year
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-2 w-2 rounded-[2px] bg-teal" />
              Revenue
            </span>
          </div>
          <ChartOverview data={totalGraphRevenue} />
        </article>

        <article className="rounded-xl border border-border bg-card p-4 md:p-5">
          <h2 className="font-display text-base font-medium tracking-tight text-foreground">
            Quick actions
          </h2>
          <p className="mb-4 text-[12px] text-muted-foreground">
            Common store workflows
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5 transition-colors hover:border-teal/30 hover:bg-teal-soft/40"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors group-hover:border-teal/30 group-hover:text-teal">
                  <action.icon className="h-4 w-4" strokeWidth={1.6} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-foreground">
                    {action.label}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {action.description}
                  </span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-teal" />
              </Link>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-border bg-card p-4 md:p-5">
          <h2 className="font-display text-base font-medium tracking-tight text-foreground">
            Catalog snapshot
          </h2>
          <p className="mb-4 text-[12px] text-muted-foreground">
            Inventory and attribute coverage
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {catalogStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-muted/25 px-3 py-3"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <stat.icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                  <span className="text-[11px] font-medium">{stat.label}</span>
                </div>
                <p className="mt-2 font-display text-xl font-medium tracking-tight text-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-medium tracking-tight text-foreground">
                Recent products
              </h2>
              <p className="text-[12px] text-muted-foreground">
                Latest additions to your catalog
              </p>
            </div>
            <Link
              href={`/store/${storeId}/products`}
              className="text-[12px] font-medium text-teal hover:underline"
            >
              View all
            </Link>
          </div>

          {recentProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-soft text-teal">
                <Package className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <p className="mt-3 text-sm font-medium text-foreground">
                No products yet
              </p>
              <p className="mt-1 max-w-xs text-[12px] text-muted-foreground">
                Add your first product to start building the catalog.
              </p>
              <Link
                href={`/store/${storeId}/products/new`}
                className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-teal hover:underline"
              >
                Add product
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentProducts.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/store/${storeId}/products`}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border border-border bg-muted">
                      {product.images[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package className="h-4 w-4" strokeWidth={1.6} />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-foreground">
                        {product.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {product.category?.name || "Uncategorized"}
                      </p>
                    </div>
                    <p className="text-[12px] font-medium text-foreground">
                      {money(Number(product.price))}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  )
}

export default DashboardPage
