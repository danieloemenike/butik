"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export type SearchableOption = {
  value: string
  label: string
  keywords?: string
  meta?: string
}

type SearchableSelectProps = Readonly<{
  value: string
  onChange: (value: string) => void
  options: SearchableOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}>

type MenuCoords = {
  top: number
  left: number
  width: number
  maxHeight: number
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results.",
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [coords, setCoords] = useState<MenuCoords | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find((option) => option.value === value)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return options
    return options.filter((option) => {
      const haystack =
        `${option.label} ${option.keywords ?? ""} ${option.meta ?? ""}`.toLowerCase()
      return haystack.includes(needle)
    })
  }, [options, query])

  const updateCoords = () => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const gap = 8
    const preferredMax = 240
    const spaceBelow = window.innerHeight - rect.bottom - gap - 12
    const spaceAbove = rect.top - gap - 12
    const openUp = spaceBelow < 180 && spaceAbove > spaceBelow
    const maxHeight = Math.min(
      preferredMax,
      Math.max(openUp ? spaceAbove : spaceBelow, 140)
    )
    const top = openUp
      ? Math.max(12, rect.top - gap - maxHeight)
      : rect.bottom + gap

    setCoords({
      top,
      left: rect.left,
      width: rect.width,
      maxHeight,
    })
  }

  useLayoutEffect(() => {
    if (!open) return
    updateCoords()
  }, [open])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
      setQuery("")
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        setQuery("")
      }
    }

    const onReposition = () => updateCoords()

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    window.addEventListener("resize", onReposition)
    window.addEventListener("scroll", onReposition, true)

    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())

    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("resize", onReposition)
      window.removeEventListener("scroll", onReposition, true)
    }
  }, [open])

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          if (disabled) return
          setOpen((prev) => !prev)
        }}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-left text-sm transition-colors",
          "hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-foreground/30 ring-2 ring-foreground/10",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="truncate">
          {selected ? (
            <span className="text-foreground">
              {selected.label}
              {selected.meta ? (
                <span className="ml-1.5 text-muted-foreground">
                  {selected.meta}
                </span>
              ) : null}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && coords && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              role="listbox"
              style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
                maxHeight: coords.maxHeight,
              }}
              className="fixed z-[60] flex flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl"
            >
              <div className="flex shrink-0 items-center gap-2 border-b border-border px-3">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-1">
                {filtered.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    {emptyText}
                  </p>
                ) : (
                  filtered.map((option) => {
                    const isActive = option.value === value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          onChange(option.value)
                          setOpen(false)
                          setQuery("")
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-foreground transition-colors",
                          "hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none",
                          isActive && "bg-secondary"
                        )}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {option.label}
                        </span>
                        {option.meta ? (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {option.meta}
                          </span>
                        ) : null}
                      </button>
                    )
                  })
                )}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}
