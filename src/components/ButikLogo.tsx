import Link from "next/link"
import { cn } from "@/lib/utils"

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-[1.75rem] leading-none",
  xl: "text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.9]",
} as const

type ButikLogoProps = {
  href?: string | null
  size?: keyof typeof sizeClasses
  className?: string
}

export function ButikLogo({
  href = "/",
  size = "md",
  className,
}: ButikLogoProps) {
  const mark = (
    <span
      className={cn(
        "inline-block font-display font-semibold tracking-tighter text-foreground",
        sizeClasses[size],
        className
      )}
    >
      BUTIK
    </span>
  )

  if (!href) {
    return mark
  }

  return (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {mark}
    </Link>
  )
}
