"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  cartCount,
  lineKey,
  readCart,
  writeCart,
  type CartLine,
  type CartState,
} from "@/lib/storefront/cart"

type CartContextValue = {
  storeSlug: string
  lines: CartLine[]
  count: number
  hydrated: boolean
  addItem: (line: CartLine) => void
  setQuantity: (
    productId: string,
    productVariantId: string | null | undefined,
    quantity: number
  ) => void
  removeItem: (
    productId: string,
    productVariantId?: string | null
  ) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function StorefrontCartProvider({
  storeSlug,
  children,
}: {
  storeSlug: string
  children: ReactNode
}) {
  const [state, setState] = useState<CartState>({
    storeSlug,
    lines: [],
    updatedAt: 0,
  })
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(readCart(storeSlug))
    setHydrated(true)
    const onStorage = (event: StorageEvent) => {
      if (event.key === `butik:cart:v1:${storeSlug}`) {
        setState(readCart(storeSlug))
      }
    }
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent).detail as { storeSlug?: string }
      if (detail?.storeSlug === storeSlug) {
        setState(readCart(storeSlug))
      }
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener("butik:cart", onCustom)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("butik:cart", onCustom)
    }
  }, [storeSlug])

  const persist = useCallback(
    (next: CartState) => {
      setState(next)
      writeCart(next)
    },
    []
  )

  const addItem = useCallback(
    (line: CartLine) => {
      const qty = Math.min(50, Math.max(1, Math.floor(line.quantity || 1)))
      const key = lineKey(line)
      const lines = [...state.lines]
      const idx = lines.findIndex((l) => lineKey(l) === key)
      if (idx >= 0) {
        lines[idx] = {
          ...lines[idx]!,
          quantity: Math.min(50, lines[idx]!.quantity + qty),
          display: line.display || lines[idx]!.display,
        }
      } else {
        lines.push({
          productId: line.productId,
          productVariantId: line.productVariantId || null,
          quantity: qty,
          display: line.display,
        })
      }
      persist({ storeSlug, lines, updatedAt: Date.now() })
    },
    [persist, state.lines, storeSlug]
  )

  const setQuantity = useCallback(
    (
      productId: string,
      productVariantId: string | null | undefined,
      quantity: number
    ) => {
      const key = lineKey({ productId, productVariantId })
      if (!Number.isInteger(quantity) || quantity < 1) {
        persist({
          storeSlug,
          lines: state.lines.filter((l) => lineKey(l) !== key),
          updatedAt: Date.now(),
        })
        return
      }
      const lines = state.lines.map((l) =>
        lineKey(l) === key
          ? { ...l, quantity: Math.min(50, quantity) }
          : l
      )
      persist({ storeSlug, lines, updatedAt: Date.now() })
    },
    [persist, state.lines, storeSlug]
  )

  const removeItem = useCallback(
    (productId: string, productVariantId?: string | null) => {
      const key = lineKey({ productId, productVariantId })
      persist({
        storeSlug,
        lines: state.lines.filter((l) => lineKey(l) !== key),
        updatedAt: Date.now(),
      })
    },
    [persist, state.lines, storeSlug]
  )

  const clear = useCallback(() => {
    persist({ storeSlug, lines: [], updatedAt: Date.now() })
  }, [persist, storeSlug])

  const value = useMemo(
    () => ({
      storeSlug,
      lines: state.lines,
      count: cartCount(state.lines),
      hydrated,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [
      storeSlug,
      state.lines,
      hydrated,
      addItem,
      setQuantity,
      removeItem,
      clear,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useStorefrontCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useStorefrontCart must be used within StorefrontCartProvider")
  }
  return ctx
}
