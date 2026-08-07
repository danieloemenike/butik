"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type Props = {
  data: { name: string; total: number }[]
}

function ChartOverview({ data }: Props) {
  const hasRevenue = data.some((point) => point.total > 0)

  if (!hasRevenue) {
    return (
      <div className="relative flex h-[280px] flex-col justify-end">
        <div
          aria-hidden
          className="absolute inset-0 flex items-end gap-2 px-1 pb-8 pt-2"
        >
          {[28, 44, 36, 58, 42, 64, 48, 72, 50, 68, 54, 62].map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-muted/70 dark:bg-muted/40"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="relative z-10 mx-auto mb-10 max-w-xs rounded-xl border border-border bg-card/95 px-4 py-3 text-center shadow-sm backdrop-blur-sm">
          <p className="text-sm font-medium text-foreground">
            No revenue recorded yet
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Completed orders will appear here as a monthly overview.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, left: -8, bottom: 0 }}
        barSize={14}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--border))"
        />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          dy={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          width={40}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--secondary))" }}
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "10px",
            color: "hsl(var(--foreground))",
            boxShadow: "0 12px 40px -20px rgba(0,0,0,0.35)",
          }}
        />
        <Bar
          dataKey="total"
          name="Revenue"
          fill="var(--landing-teal)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default ChartOverview
