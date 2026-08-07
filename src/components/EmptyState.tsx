"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  loading?: boolean
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  loading,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center",
        className
      )}
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-soft text-teal">
        <Icon className="h-6 w-6" strokeWidth={1.6} />
      </span>
      <h2 className="mt-4 font-display text-xl font-medium tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button
          className="mt-5 font-semibold"
          onClick={onAction}
          disabled={loading}
          size="sm"
        >
          {loading ? "Processing…" : actionLabel}
        </Button>
      ) : null}
    </section>
  )
}
