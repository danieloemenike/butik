import prismadb from "@/lib/prismadb"
import {
  MAX_CART_LINES,
  computeHoldsUntil,
  dedupeCartLines,
  generateConfirmationToken,
  generateOrderReference,
  hashConfirmationToken,
  normalizeCustomerPhone,
  normalizeProductStock,
  normalizeVariantStock,
  resolveUnitPrice,
  type CartLineInput,
  type ResolvedLine,
} from "@/lib/commerce/policy"
import { isValidProductSlug } from "@/lib/store-identity"
import { Prisma } from "@prisma/client"
import { timingSafeEqual } from "node:crypto"

export type PlaceOrderInput = {
  storeSlug: string
  customerName: string
  phone: string
  address: string
  email?: string | null
  notes?: string | null
  idempotencyKey: string
  items: CartLineInput[]
}

export type PlaceOrderResult =
  | {
      ok: true
      reference: string
      confirmationToken: string
      alreadyCreated: boolean
      subtotal: number
    }
  | {
      ok: false
      status: number
      message: string
      field?: string
    }

function money(n: number) {
  return new Prisma.Decimal(n.toFixed(2))
}

export async function placeStorefrontOrder(
  input: PlaceOrderInput
): Promise<PlaceOrderResult> {
  const store = await prismadb.store.findFirst({
    where: { storeSlug: input.storeSlug, status: "PUBLISHED" },
    select: { id: true, status: true, currency: true },
  })

  if (!store) {
    return {
      ok: false,
      status: 404,
      message: "Store is not available.",
    }
  }

  // Free due holds before taking new stock.
  await expireDueOrders({ storeId: store.id, limit: 20 })

  const existing = await prismadb.order.findUnique({
    where: {
      storeId_idempotencyKey: {
        storeId: store.id,
        idempotencyKey: input.idempotencyKey,
      },
    },
    select: { reference: true, subtotal: true },
  })

  if (existing) {
    return {
      ok: true,
      reference: existing.reference,
      confirmationToken: "",
      alreadyCreated: true,
      subtotal: Number(existing.subtotal),
    }
  }

  const name = input.customerName?.trim()
  const phone = normalizeCustomerPhone(input.phone || "")
  const address = input.address?.trim()
  if (!name || name.length < 2) {
    return { ok: false, status: 400, message: "Name is required.", field: "customerName" }
  }
  if (!phone) {
    return {
      ok: false,
      status: 400,
      message: "Enter a valid phone number with country code (E.164).",
      field: "phone",
    }
  }
  if (!address || address.length < 5) {
    return { ok: false, status: 400, message: "Address is required.", field: "address" }
  }
  if (!input.idempotencyKey || input.idempotencyKey.length < 8) {
    return {
      ok: false,
      status: 400,
      message: "Idempotency key is required.",
      field: "idempotencyKey",
    }
  }

  const lines = dedupeCartLines(input.items)
  if (!lines.length) {
    return { ok: false, status: 400, message: "Cart is empty.", field: "items" }
  }
  if (lines.length > MAX_CART_LINES) {
    return { ok: false, status: 400, message: "Too many line items.", field: "items" }
  }

  const productIds = [...new Set(lines.map((l) => l.productId))]
  const products = await prismadb.product.findMany({
    where: {
      id: { in: productIds },
      storeId: store.id,
      isArchived: false,
    },
    include: {
      productVariant: {
        include: {
          color: { select: { name: true } },
          size: { select: { name: true } },
        },
      },
      color: { select: { name: true } },
      size: { select: { name: true } },
    },
  })

  const productMap = new Map(products.map((p) => [p.id, p]))
  const resolved: ResolvedLine[] = []

  for (const line of lines) {
    const product = productMap.get(line.productId)
    if (!product || !isValidProductSlug(product.slug)) {
      return {
        ok: false,
        status: 400,
        message: "One or more products are unavailable.",
        field: "items",
      }
    }

    const variantId = line.productVariantId || null
    if (variantId) {
      const variant = product.productVariant.find((v) => v.id === variantId)
      if (!variant) {
        return {
          ok: false,
          status: 400,
          message: "Invalid product option.",
          field: "items",
        }
      }
      const available = normalizeVariantStock(variant.quantity)
      if (available !== null && available < line.quantity) {
        return {
          ok: false,
          status: 409,
          message: `Not enough stock for ${product.name}.`,
          field: "items",
        }
      }
      const unitPrice = resolveUnitPrice({
        productPrice: product.price,
        productDiscounted: product.discountedPrice,
        variantPrice: variant.price,
        variantDiscounted: variant.discountedPrice,
        useVariant: true,
      })
      const variantLabel = [variant.color?.name, variant.size?.name]
        .filter(Boolean)
        .join(" · ")
      resolved.push({
        productId: product.id,
        productVariantId: variant.id,
        quantity: line.quantity,
        unitPrice,
        lineTotal: unitPrice * line.quantity,
        name: product.name,
        variantLabel: variantLabel || null,
        inventory: { kind: "variant", id: variant.id, available },
      })
    } else {
      const available = normalizeProductStock(product.quantity)
      if (available !== null && available < line.quantity) {
        return {
          ok: false,
          status: 409,
          message: `Not enough stock for ${product.name}.`,
          field: "items",
        }
      }
      const unitPrice = resolveUnitPrice({
        productPrice: product.price,
        productDiscounted: product.discountedPrice,
        useVariant: false,
      })
      resolved.push({
        productId: product.id,
        productVariantId: null,
        quantity: line.quantity,
        unitPrice,
        lineTotal: unitPrice * line.quantity,
        name: product.name,
        variantLabel: null,
        inventory: { kind: "product", id: product.id, available },
      })
    }
  }

  const subtotal = resolved.reduce((sum, l) => sum + l.lineTotal, 0)
  const confirmationToken = generateConfirmationToken()
  const confirmationTokenHash = hashConfirmationToken(confirmationToken)
  let reference = generateOrderReference()
  const holdsUntil = computeHoldsUntil()

  try {
    const order = await prismadb.$transaction(async (tx) => {
      const again = await tx.order.findUnique({
        where: {
          storeId_idempotencyKey: {
            storeId: store.id,
            idempotencyKey: input.idempotencyKey,
          },
        },
        select: { reference: true, subtotal: true },
      })
      if (again) {
        return {
          kind: "idempotent" as const,
          reference: again.reference,
          subtotal: Number(again.subtotal),
        }
      }

      for (const line of resolved) {
        if (line.inventory.available === null) continue
        if (line.inventory.kind === "variant") {
          const updated = await tx.productVariant.updateMany({
            where: {
              id: line.inventory.id,
              quantity: { gte: line.quantity },
            },
            data: { quantity: { decrement: line.quantity } },
          })
          if (updated.count !== 1) {
            throw new StockConflictError(line.name)
          }
        } else {
          const rows = await tx.$queryRaw<{ id: string }[]>`
            UPDATE "Product"
            SET quantity = quantity - ${line.quantity},
                "updatedAt" = NOW()
            WHERE id = ${line.inventory.id}
              AND quantity IS NOT NULL
              AND quantity >= ${line.quantity}
            RETURNING id
          `
          if (rows.length !== 1) {
            throw new StockConflictError(line.name)
          }
        }
      }

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const created = await tx.order.create({
            data: {
              reference,
              storeId: store.id,
              status: "PENDING",
              customerName: name,
              phone,
              address,
              email: input.email?.trim() || null,
              notes: input.notes?.trim() || null,
              currency: store.currency || "NGN",
              subtotal: money(subtotal),
              isPaid: false,
              confirmationTokenHash,
              idempotencyKey: input.idempotencyKey,
              holdsUntil,
              orderItems: {
                create: resolved.map((line) => ({
                  productId: line.productId,
                  productVariantId: line.productVariantId,
                  quantity: line.quantity,
                  unitPrice: money(Number(line.unitPrice)),
                  lineTotal: money(line.lineTotal),
                  name: line.name,
                  variantLabel: line.variantLabel,
                  stockHeld: line.inventory.available !== null,
                })),
              },
            },
            select: { reference: true, subtotal: true },
          })
          return {
            kind: "created" as const,
            reference: created.reference,
            subtotal: Number(created.subtotal),
          }
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            const target = Array.isArray(error.meta?.target)
              ? (error.meta?.target as string[])
              : []
            if (
              target.includes("idempotencyKey") ||
              target.includes("storeId_idempotencyKey")
            ) {
              const hit = await tx.order.findUnique({
                where: {
                  storeId_idempotencyKey: {
                    storeId: store.id,
                    idempotencyKey: input.idempotencyKey,
                  },
                },
                select: { reference: true, subtotal: true },
              })
              if (hit) {
                return {
                  kind: "idempotent" as const,
                  reference: hit.reference,
                  subtotal: Number(hit.subtotal),
                }
              }
            }
            if (target.includes("reference")) {
              reference = generateOrderReference()
              continue
            }
          }
          throw error
        }
      }
      throw new Error("Could not allocate order reference.")
    })

    if (order.kind === "idempotent") {
      return {
        ok: true,
        reference: order.reference,
        confirmationToken: "",
        alreadyCreated: true,
        subtotal: order.subtotal,
      }
    }

    return {
      ok: true,
      reference: order.reference,
      confirmationToken,
      alreadyCreated: false,
      subtotal: order.subtotal,
    }
  } catch (error) {
    if (error instanceof StockConflictError) {
      return {
        ok: false,
        status: 409,
        message: `Not enough stock for ${error.productName}.`,
        field: "items",
      }
    }
    console.error("[placeStorefrontOrder]", error)
    return {
      ok: false,
      status: 500,
      message: "Could not place order.",
    }
  }
}

class StockConflictError extends Error {
  productName: string
  constructor(productName: string) {
    super("stock_conflict")
    this.productName = productName
  }
}

type ReleaseTo = "CANCELLED" | "EXPIRED"

/**
 * Atomically release a PENDING order: restore stockHeld lines once, set terminal status.
 */
export async function releasePendingOrder(opts: {
  orderId: string
  storeId?: string
  to: ReleaseTo
}) {
  return prismadb.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        id: opts.orderId,
        ...(opts.storeId ? { storeId: opts.storeId } : {}),
      },
      include: { orderItems: true },
    })
    if (!order) {
      return { ok: false as const, status: 404, message: "Order not found." }
    }
    if (order.status !== "PENDING") {
      return {
        ok: false as const,
        status: 409,
        message:
          opts.to === "EXPIRED"
            ? "Only pending orders can be expired."
            : "Only pending orders can be cancelled.",
      }
    }

    const now = new Date()
    const updated = await tx.order.updateMany({
      where: { id: order.id, status: "PENDING" },
      data:
        opts.to === "EXPIRED"
          ? { status: "EXPIRED", expiredAt: now }
          : { status: "CANCELLED", cancelledAt: now },
    })
    if (updated.count !== 1) {
      return {
        ok: false as const,
        status: 409,
        message: "Order was already updated.",
      }
    }

    for (const item of order.orderItems) {
      if (!item.stockHeld) continue
      if (item.productVariantId) {
        await tx.productVariant.updateMany({
          where: { id: item.productVariantId, quantity: { not: null } },
          data: { quantity: { increment: item.quantity } },
        })
      } else {
        await tx.$executeRaw`
          UPDATE "Product"
          SET quantity = quantity + ${item.quantity},
              "updatedAt" = NOW()
          WHERE id = ${item.productId}
            AND quantity IS NOT NULL
        `
      }
    }

    return { ok: true as const, status: opts.to }
  })
}

export async function cancelPendingOrder(opts: {
  storeId: string
  orderId: string
}) {
  return releasePendingOrder({
    storeId: opts.storeId,
    orderId: opts.orderId,
    to: "CANCELLED",
  })
}

export async function expirePendingOrder(opts: {
  orderId: string
  storeId?: string
}) {
  return releasePendingOrder({
    orderId: opts.orderId,
    storeId: opts.storeId,
    to: "EXPIRED",
  })
}

/**
 * Expire due PENDING holds. Each order is released in its own transaction.
 */
export async function expireDueOrders(opts?: {
  storeId?: string
  limit?: number
  now?: Date
}) {
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200)
  const now = opts?.now ?? new Date()

  const due = await prismadb.order.findMany({
    where: {
      status: "PENDING",
      holdsUntil: { lte: now },
      ...(opts?.storeId ? { storeId: opts.storeId } : {}),
    },
    select: { id: true, storeId: true },
    orderBy: { holdsUntil: "asc" },
    take: limit,
  })

  let expired = 0
  for (const row of due) {
    const result = await releasePendingOrder({
      orderId: row.id,
      storeId: row.storeId,
      to: "EXPIRED",
    })
    if (result.ok) expired += 1
  }

  return { scanned: due.length, expired }
}

export async function confirmPendingOrder(opts: {
  storeId: string
  orderId: string
}) {
  await expireDueOrders({ storeId: opts.storeId, limit: 20 })

  const updated = await prismadb.order.updateMany({
    where: { id: opts.orderId, storeId: opts.storeId, status: "PENDING" },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  })
  if (updated.count !== 1) {
    return {
      ok: false as const,
      status: 409,
      message: "Only pending orders can be confirmed.",
    }
  }
  return { ok: true as const }
}

export function tokensMatch(a: string, b: string) {
  try {
    const ba = Buffer.from(a)
    const bb = Buffer.from(b)
    if (ba.length !== bb.length) return false
    return timingSafeEqual(ba, bb)
  } catch {
    return false
  }
}
