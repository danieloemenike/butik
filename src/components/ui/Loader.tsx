import { ButikLogo } from "@/components/ButikLogo"
import { cn } from "@/lib/utils"

type LoaderProps = {
  className?: string
  fullScreen?: boolean
  size?: "sm" | "md" | "lg" | "xl"
}

export default function Loader({
  className,
  fullScreen = false,
  size = "lg",
}: LoaderProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "flex items-center justify-center",
        fullScreen ? "min-h-screen w-full bg-background" : "h-[70dvh] w-full",
        className
      )}
    >
      <ButikLogo
        href={null}
        size={size}
        className="animate-logo-breathe"
      />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
