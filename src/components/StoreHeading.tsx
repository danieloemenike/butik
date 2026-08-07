import React from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

type Props = {
  title: string
  subtitle: string
  handleClick?: () => void
  text?: string
  showButton: boolean
  plusIcon?: boolean
}

function Heading({
  title,
  subtitle,
  handleClick,
  text,
  showButton,
  plusIcon,
}: Props) {
  return (
    <header className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-[1.5rem] font-medium tracking-tight text-foreground capitalize md:text-[1.7rem]">
          {title}
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {showButton ? (
        <Button
          onClick={handleClick}
          size="sm"
          className="self-start font-semibold sm:self-auto"
        >
          {plusIcon ? <Plus className="mr-1.5 h-4 w-4" strokeWidth={1.75} /> : null}
          {text}
        </Button>
      ) : null}
    </header>
  )
}

export default Heading
