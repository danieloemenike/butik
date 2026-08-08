export type CartLine = {
  productId: string
  productVariantId?: string | null
  quantity: number
  /** Display-only cache — never trusted by the server */
  display?: {
    name?: string
    unitPrice?: number
    imageUrl?: string
    variantLabel?: string | null
  }
}

export type CartState = {
  storeSlug: string
  lines: CartLine[]
  updatedAt: number
}

const PREFIX = "butik:cart:v1:"

export function cartStorageKey(storeSlug: string) {
  return `${PREFIX}${storeSlug}`
}

export function readCart(storeSlug: string): CartState {
  if (typeof window === "undefined") {
    return { storeSlug, lines: [], updatedAt: 0 }
  }
  try {
    const raw = window.localStorage.getItem(cartStorageKey(storeSlug))
    if (!raw) return { storeSlug, lines: [], updatedAt: 0 }
    const parsed = JSON.parse(raw) as CartState
    if (!parsed || parsed.storeSlug !== storeSlug || !Array.isArray(parsed.lines)) {
      return { storeSlug, lines: [], updatedAt: 0 }
    }
    const lines = parsed.lines
      .filter(
        (l) =>
          l &&
          typeof l.productId === "string" &&
          typeof l.quantity === "number" &&
          Number.isInteger(l.quantity) &&
          l.quantity >= 1
      )
      .map((l) => ({
        productId: l.productId,
        productVariantId: l.productVariantId || null,
        quantity: Math.min(50, l.quantity),
        display: l.display,
      }))
    return { storeSlug, lines, updatedAt: parsed.updatedAt || Date.now() }
  } catch {
    return { storeSlug, lines: [], updatedAt: 0 }
  }
}

export function writeCart(state: CartState) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(
    cartStorageKey(state.storeSlug),
    JSON.stringify({ ...state, updatedAt: Date.now() })
  )
  window.dispatchEvent(
    new CustomEvent("butik:cart", { detail: { storeSlug: state.storeSlug } })
  )
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.quantity, 0)
}

export function lineKey(line: Pick<CartLine, "productId" | "productVariantId">) {
  return `${line.productId}::${line.productVariantId || ""}`
}
