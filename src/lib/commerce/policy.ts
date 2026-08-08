import { createHash, randomBytes } from "node:crypto"
import type { OrderStatus, Prisma } from "@prisma/client"

export const MAX_CART_LINES = 30
export const MAX_QTY_PER_LINE = 50

export type CartLineInput = {
  productId: string
  productVariantId?: string | null
  quantity: number
}

export type ResolvedLine = {
  productId: string
  productVariantId: string | null
  quantity: number
  unitPrice: Prisma.Decimal | number
  lineTotal: number
  name: string
  variantLabel: string | null
  /** Inventory target for decrement/restore */
  inventory: {
    kind: "product" | "variant"
    id: string
    /** null = unlimited */
    available: number | null
  }
}

export function canTransitionOrder(
  from: OrderStatus,
  action: "confirm" | "cancel" | "expire"
): boolean {
  if (from !== "PENDING") return false
  return action === "confirm" || action === "cancel" || action === "expire"
}

export function nextOrderStatus(
  action: "confirm" | "cancel" | "expire"
): OrderStatus {
  if (action === "confirm") return "CONFIRMED"
  if (action === "expire") return "EXPIRED"
  return "CANCELLED"
}

/** Default unpaid hold length (24h). Override with ORDER_HOLD_TTL_MS. */
export const DEFAULT_ORDER_HOLD_TTL_MS = 24 * 60 * 60 * 1000

export function getOrderHoldTtlMs(): number {
  const raw = process.env.ORDER_HOLD_TTL_MS
  if (!raw) return DEFAULT_ORDER_HOLD_TTL_MS
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 60_000) return DEFAULT_ORDER_HOLD_TTL_MS
  return Math.floor(n)
}

export function computeHoldsUntil(from: Date = new Date()): Date {
  return new Date(from.getTime() + getOrderHoldTtlMs())
}

export function isHoldExpired(
  order: { status: OrderStatus; holdsUntil: Date },
  now: Date = new Date()
): boolean {
  if (order.status === "EXPIRED") return true
  if (order.status !== "PENDING") return false
  return order.holdsUntil.getTime() <= now.getTime()
}

/** Whole-number quantity for cart/API input. */
export function parseLineQuantity(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value >= 1) {
    return value
  }
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const n = Number(value)
    if (n >= 1) return n
  }
  return null
}

/**
 * Product.quantity is Decimal? in schema; treat as integer units.
 * null = unlimited; non-integer / negative = invalid (treat as 0 available).
 */
export function normalizeProductStock(
  quantity: Prisma.Decimal | number | null | undefined
): number | null {
  if (quantity === null || quantity === undefined) return null
  const n = typeof quantity === "number" ? quantity : Number(quantity)
  if (!Number.isFinite(n) || n < 0) return 0
  if (!Number.isInteger(n)) return Math.floor(n)
  return n
}

export function normalizeVariantStock(
  quantity: number | null | undefined
): number | null {
  if (quantity === null || quantity === undefined) return null
  if (!Number.isInteger(quantity) || quantity < 0) return 0
  return quantity
}

export function resolveUnitPrice(opts: {
  productPrice: Prisma.Decimal | number
  productDiscounted?: Prisma.Decimal | number | null
  variantPrice?: Prisma.Decimal | number | null
  variantDiscounted?: Prisma.Decimal | number | null
  useVariant: boolean
}): number {
  if (opts.useVariant) {
    const discounted = opts.variantDiscounted
    const base = opts.variantPrice
    if (discounted != null && Number(discounted) > 0) {
      return Number(discounted)
    }
    return Number(base ?? 0)
  }
  if (opts.productDiscounted != null && Number(opts.productDiscounted) > 0) {
    return Number(opts.productDiscounted)
  }
  return Number(opts.productPrice)
}

/** Collapse duplicate product+variant keys by summing quantity. */
export function dedupeCartLines(lines: CartLineInput[]): CartLineInput[] {
  const map = new Map<string, CartLineInput>()
  for (const line of lines) {
    const variantId = line.productVariantId || null
    const key = `${line.productId}::${variantId ?? ""}`
    const qty = parseLineQuantity(line.quantity)
    if (!qty) continue
    const existing = map.get(key)
    if (existing) {
      existing.quantity = Math.min(
        MAX_QTY_PER_LINE,
        existing.quantity + qty
      )
    } else {
      map.set(key, {
        productId: line.productId,
        productVariantId: variantId,
        quantity: Math.min(MAX_QTY_PER_LINE, qty),
      })
    }
  }
  return Array.from(map.values())
}

export function generateOrderReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let body = ""
  const bytes = randomBytes(8)
  for (let i = 0; i < 8; i++) {
    body += alphabet[bytes[i]! % alphabet.length]
  }
  return `BTK${body}`
}

export function generateConfirmationToken(): string {
  return randomBytes(32).toString("base64url")
}

export function hashConfirmationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export function verifyConfirmationToken(
  token: string,
  hash: string
): boolean {
  const computed = hashConfirmationToken(token)
  if (computed.length !== hash.length) return false
  // timing-safe-ish compare
  let mismatch = 0
  for (let i = 0; i < computed.length; i++) {
    mismatch |= computed.charCodeAt(i) ^ hash.charCodeAt(i)
  }
  return mismatch === 0
}

export function newIdempotencyKey(): string {
  return randomBytes(16).toString("hex")
}

/**
 * Admin write-path stock: null/empty = unlimited; otherwise non-negative integer.
 */
export function parseWritableStockQuantity(
  value: unknown
): { ok: true; quantity: number | null } | { ok: false; message: string } {
  if (value === null || value === undefined) {
    return { ok: true, quantity: null }
  }
  if (typeof value === "string" && value.trim() === "") {
    return { ok: true, quantity: null }
  }
  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
    const n = Number(value.trim())
    if (n < 0) {
      return {
        ok: false,
        message: "Stock quantity must be a whole number (≥ 0), or empty for unlimited.",
      }
    }
    return { ok: true, quantity: n }
  }
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return { ok: true, quantity: value }
  }
  return {
    ok: false,
    message: "Stock quantity must be a whole number (≥ 0), or empty for unlimited.",
  }
}

/**
 * Guest checkout phone → E.164 (+ and 8–15 digits).
 * Accepts `+234…`, bare international digits, or NG national `0…` (mapped to +234).
 */
export function normalizeCustomerPhone(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  let digits: string
  if (trimmed.startsWith("+")) {
    digits = trimmed.slice(1).replace(/\D/g, "")
  } else {
    const rawDigits = trimmed.replace(/\D/g, "")
    if (!rawDigits) return null
    if (rawDigits.startsWith("0")) {
      digits = `234${rawDigits.replace(/^0+/, "")}`
    } else {
      digits = rawDigits
    }
  }

  if (!/^[1-9]\d{7,14}$/.test(digits)) {
    return null
  }
  return `+${digits}`
}
