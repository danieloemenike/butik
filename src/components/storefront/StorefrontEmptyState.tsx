import Link from "next/link"

type Props = {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
  accentColor?: string
  primaryColor?: string
}

export function StorefrontEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  accentColor,
  primaryColor,
}: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-dashed px-5 py-14 text-center sm:px-8 sm:py-16"
      style={{
        borderColor: primaryColor ? `${primaryColor}22` : undefined,
      }}
    >
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed opacity-70">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: accentColor || "#0F172A" }}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
