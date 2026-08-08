/**
 * Focused adversarial checks for commerce helpers.
 * DB-backed cases run when DATABASE_URL is set; otherwise skip.
 * Temporarily publishes a DRAFT store that already has catalog data.
 */
import assert from "node:assert/strict"
import { after, before, describe, it } from "node:test"
import { config } from "dotenv"
import path from "node:path"

config({ path: path.resolve(process.cwd(), ".env") })

import {
  canTransitionOrder,
  hashConfirmationToken,
  newIdempotencyKey,
  verifyConfirmationToken,
} from "./policy"

describe("adversarial policy guards", () => {
  it("never transitions non-PENDING", () => {
    for (const status of ["CONFIRMED", "CANCELLED"] as const) {
      assert.equal(canTransitionOrder(status, "confirm"), false)
      assert.equal(canTransitionOrder(status, "cancel"), false)
    }
  })

  it("rejects wrong confirmation tokens", () => {
    const hash = hashConfirmationToken("correct-token-value")
    assert.equal(verifyConfirmationToken("correct-token-value", hash), true)
    assert.equal(verifyConfirmationToken("wrong", hash), false)
    assert.equal(verifyConfirmationToken("", hash), false)
  })
})

const hasDb = Boolean(process.env.DATABASE_URL)

describe("place-order transaction (db)", { skip: !hasDb }, () => {
  let prismadb: typeof import("@/lib/prismadb").default
  let placeStorefrontOrder: typeof import("./place-order").placeStorefrontOrder
  let cancelPendingOrder: typeof import("./place-order").cancelPendingOrder
  let confirmPendingOrder: typeof import("./place-order").confirmPendingOrder
  let expireDueOrders: typeof import("./place-order").expireDueOrders
  let releasePendingOrder: typeof import("./place-order").releasePendingOrder

  let storeId = ""
  let storeSlug = ""
  let previousStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED" = "DRAFT"
  let productId = ""
  let variantId = ""
  const createdOrderIds: string[] = []

  before(async (t) => {
    prismadb = (await import("@/lib/prismadb")).default
    const place = await import("./place-order")
    placeStorefrontOrder = place.placeStorefrontOrder
    cancelPendingOrder = place.cancelPendingOrder
    confirmPendingOrder = place.confirmPendingOrder
    expireDueOrders = place.expireDueOrders
    releasePendingOrder = place.releasePendingOrder

    const store = await prismadb.store.findFirst({
      where: {
        storeSlug: { not: null },
        products: { some: {} },
      },
      select: { id: true, storeSlug: true, status: true },
      orderBy: { updatedAt: "desc" },
    })
    if (!store?.storeSlug) {
      t.skip("Need a store with catalog data for DB tests")
      return
    }
    storeId = store.id
    storeSlug = store.storeSlug
    previousStatus = store.status

    await prismadb.store.update({
      where: { id: storeId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    })

    const template = await prismadb.product.findFirst({
      where: { storeId },
      select: {
        categoryId: true,
        subcategoryId: true,
        sizeId: true,
        colorId: true,
      },
    })
    if (!template) {
      t.skip("Need an existing product for FK template")
      return
    }

    const product = await prismadb.product.create({
      data: {
        storeId,
        name: "P2 Adversarial Product",
        slug: `p2_adv_${Date.now()}`,
        description: "test",
        price: 1000,
        quantity: 1,
        categoryId: template.categoryId,
        subcategoryId: template.subcategoryId,
        sizeId: template.sizeId,
        colorId: template.colorId,
        isArchived: false,
        isFeatured: false,
        images: {
          create: [{ url: "https://placehold.co/100x100" }],
        },
        productVariant: {
          create: {
            quantity: 1,
            price: 1200,
            sizeId: template.sizeId,
            colorId: template.colorId,
          },
        },
      },
      include: { productVariant: true },
    })
    productId = product.id
    variantId = product.productVariant[0]!.id
  })

  after(async () => {
    if (!prismadb) return
    if (productId) {
      const itemOrders = await prismadb.orderItem.findMany({
        where: { productId },
        select: { orderId: true },
      })
      const orderIds = [
        ...new Set([...createdOrderIds, ...itemOrders.map((i) => i.orderId)]),
      ]
      for (const id of orderIds) {
        await prismadb.orderItem.deleteMany({ where: { orderId: id } })
        await prismadb.order.deleteMany({ where: { id } })
      }
      await prismadb.productVariant.deleteMany({ where: { productId } })
      await prismadb.image.deleteMany({ where: { productId } })
      await prismadb.product.deleteMany({ where: { id: productId } })
    }
    if (storeId) {
      await prismadb.store.update({
        where: { id: storeId },
        data: {
          status: previousStatus,
          publishedAt: previousStatus === "PUBLISHED" ? undefined : null,
        },
      })
    }
  })

  it("last-unit race: exactly one order succeeds", async () => {
    await prismadb.product.update({
      where: { id: productId },
      data: { quantity: 1 },
    })

    const keyA = newIdempotencyKey()
    const keyB = newIdempotencyKey()
    const payload = {
      storeSlug,
      customerName: "Race Tester",
      phone: "+2348012345678",
      address: "12 Test Street, Lagos",
      items: [{ productId, quantity: 1 }],
    }

    const [a, b] = await Promise.all([
      placeStorefrontOrder({ ...payload, idempotencyKey: keyA }),
      placeStorefrontOrder({ ...payload, idempotencyKey: keyB }),
    ])

    const wins = [a, b].filter((r) => r.ok)
    const losses = [a, b].filter((r) => !r.ok)
    assert.equal(wins.length, 1)
    assert.equal(losses.length, 1)
    if (losses[0]!.ok === false) {
      assert.equal(losses[0].status, 409)
    }

    const winner = wins[0]!
    assert.equal(winner.ok, true)
    if (winner.ok) {
      const order = await prismadb.order.findUnique({
        where: { reference: winner.reference },
      })
      if (order) createdOrderIds.push(order.id)
    }

    const stock = await prismadb.product.findUnique({
      where: { id: productId },
      select: { quantity: true },
    })
    assert.equal(Number(stock?.quantity), 0)
  })

  it("same idempotencyKey twice creates one order", async () => {
    await prismadb.product.update({
      where: { id: productId },
      data: { quantity: 5 },
    })
    const key = newIdempotencyKey()
    const payload = {
      storeSlug,
      customerName: "Idem Buyer",
      phone: "+2348012345678",
      address: "12 Test Street, Lagos",
      idempotencyKey: key,
      items: [{ productId, quantity: 1 }],
    }
    const first = await placeStorefrontOrder(payload)
    const second = await placeStorefrontOrder(payload)
    assert.equal(first.ok, true)
    assert.equal(second.ok, true)
    if (first.ok && second.ok) {
      assert.equal(first.reference, second.reference)
      assert.equal(second.alreadyCreated, true)
      assert.equal(second.confirmationToken, "")
      const order = await prismadb.order.findUnique({
        where: { reference: first.reference },
      })
      if (order) createdOrderIds.push(order.id)
    }
    const stock = await prismadb.product.findUnique({
      where: { id: productId },
      select: { quantity: true },
    })
    assert.equal(Number(stock?.quantity), 4)
  })

  it("variant line decrements variant only", async () => {
    await prismadb.product.update({
      where: { id: productId },
      data: { quantity: 9 },
    })
    await prismadb.productVariant.update({
      where: { id: variantId },
      data: { quantity: 2 },
    })
    const result = await placeStorefrontOrder({
      storeSlug,
      customerName: "Variant Buyer",
      phone: "+2348012345678",
      address: "12 Test Street, Lagos",
      idempotencyKey: newIdempotencyKey(),
      items: [{ productId, productVariantId: variantId, quantity: 1 }],
    })
    assert.equal(result.ok, true)
    if (result.ok) {
      const order = await prismadb.order.findUnique({
        where: { reference: result.reference },
      })
      if (order) createdOrderIds.push(order.id)
    }
    const product = await prismadb.product.findUnique({
      where: { id: productId },
      select: { quantity: true },
    })
    const variant = await prismadb.productVariant.findUnique({
      where: { id: variantId },
      select: { quantity: true },
    })
    assert.equal(Number(product?.quantity), 9)
    assert.equal(variant?.quantity, 1)
  })

  it("cancel once restores; cancel twice does not double restore", async () => {
    await prismadb.product.update({
      where: { id: productId },
      data: { quantity: 3 },
    })
    const placed = await placeStorefrontOrder({
      storeSlug,
      customerName: "Cancel Buyer",
      phone: "+2348012345678",
      address: "12 Test Street, Lagos",
      idempotencyKey: newIdempotencyKey(),
      items: [{ productId, quantity: 2 }],
    })
    assert.equal(placed.ok, true)
    if (!placed.ok) return
    const order = await prismadb.order.findUniqueOrThrow({
      where: { reference: placed.reference },
      include: { orderItems: true },
    })
    createdOrderIds.push(order.id)
    assert.equal(order.orderItems[0]?.stockHeld, true)

    const mid = await prismadb.product.findUnique({
      where: { id: productId },
      select: { quantity: true },
    })
    assert.equal(Number(mid?.quantity), 1)

    const firstCancel = await cancelPendingOrder({
      storeId,
      orderId: order.id,
    })
    assert.equal(firstCancel.ok, true)

    const restored = await prismadb.product.findUnique({
      where: { id: productId },
      select: { quantity: true },
    })
    assert.equal(Number(restored?.quantity), 3)

    const secondCancel = await cancelPendingOrder({
      storeId,
      orderId: order.id,
    })
    assert.equal(secondCancel.ok, false)
    if (!secondCancel.ok) {
      assert.equal(secondCancel.status, 409)
    }

    const still = await prismadb.product.findUnique({
      where: { id: productId },
      select: { quantity: true },
    })
    assert.equal(Number(still?.quantity), 3)
  })

  it("unlimited stock orders do not restore on cancel", async () => {
    await prismadb.product.update({
      where: { id: productId },
      data: { quantity: null },
    })
    const placed = await placeStorefrontOrder({
      storeSlug,
      customerName: "Unlimited Buyer",
      phone: "+2348012345678",
      address: "12 Test Street, Lagos",
      idempotencyKey: newIdempotencyKey(),
      items: [{ productId, quantity: 2 }],
    })
    assert.equal(placed.ok, true)
    if (!placed.ok) return
    const order = await prismadb.order.findUniqueOrThrow({
      where: { reference: placed.reference },
      include: { orderItems: true },
    })
    createdOrderIds.push(order.id)
    assert.equal(order.orderItems[0]?.stockHeld, false)

    // Merchant later sets finite stock — cancel must not invent units
    await prismadb.product.update({
      where: { id: productId },
      data: { quantity: 10 },
    })
    const cancelled = await cancelPendingOrder({
      storeId,
      orderId: order.id,
    })
    assert.equal(cancelled.ok, true)
    const stock = await prismadb.product.findUnique({
      where: { id: productId },
      select: { quantity: true },
    })
    assert.equal(Number(stock?.quantity), 10)
  })

  it("confirm does not change stock; rejects second confirm", async () => {
    await prismadb.product.update({
      where: { id: productId },
      data: { quantity: 4 },
    })
    const placed = await placeStorefrontOrder({
      storeSlug,
      customerName: "Confirm Buyer",
      phone: "+2348012345678",
      address: "12 Test Street, Lagos",
      idempotencyKey: newIdempotencyKey(),
      items: [{ productId, quantity: 1 }],
    })
    assert.equal(placed.ok, true)
    if (!placed.ok) return
    const order = await prismadb.order.findUniqueOrThrow({
      where: { reference: placed.reference },
    })
    createdOrderIds.push(order.id)

    const ok = await confirmPendingOrder({ storeId, orderId: order.id })
    assert.equal(ok.ok, true)
    const stock = await prismadb.product.findUnique({
      where: { id: productId },
      select: { quantity: true },
    })
    assert.equal(Number(stock?.quantity), 3)

    const again = await confirmPendingOrder({ storeId, orderId: order.id })
    assert.equal(again.ok, false)
  })

  it("rejects draft/unpublished store checkout", async () => {
    const result = await placeStorefrontOrder({
      storeSlug: "definitely_not_a_real_store_xyz",
      customerName: "Nope",
      phone: "+2348012345678",
      address: "12 Test Street, Lagos",
      idempotencyKey: newIdempotencyKey(),
      items: [{ productId, quantity: 1 }],
    })
    assert.equal(result.ok, false)
    if (!result.ok) assert.equal(result.status, 404)
  })

  it("due PENDING expires once and restores stockHeld", async () => {
    await prismadb.product.update({
      where: { id: productId },
      data: { quantity: 5 },
    })
    const placed = await placeStorefrontOrder({
      storeSlug,
      customerName: "Expire Buyer",
      phone: "+2348012345678",
      address: "12 Test Street, Lagos",
      idempotencyKey: newIdempotencyKey(),
      items: [{ productId, quantity: 2 }],
    })
    assert.equal(placed.ok, true)
    if (!placed.ok) return
    const order = await prismadb.order.findUniqueOrThrow({
      where: { reference: placed.reference },
      include: { orderItems: true },
    })
    createdOrderIds.push(order.id)
    assert.equal(order.orderItems[0]?.stockHeld, true)

    await prismadb.order.update({
      where: { id: order.id },
      data: { holdsUntil: new Date(Date.now() - 1000) },
    })

    const mid = await prismadb.product.findUnique({
      where: { id: productId },
      select: { quantity: true },
    })
    assert.equal(Number(mid?.quantity), 3)

    const sweep = await expireDueOrders({ storeId, limit: 10 })
    assert.ok(sweep.expired >= 1)

    const expired = await prismadb.order.findUniqueOrThrow({
      where: { id: order.id },
    })
    assert.equal(expired.status, "EXPIRED")
    assert.ok(expired.expiredAt)

    const restored = await prismadb.product.findUnique({
      where: { id: productId },
      select: { quantity: true },
    })
    assert.equal(Number(restored?.quantity), 5)

    const again = await releasePendingOrder({
      orderId: order.id,
      storeId,
      to: "EXPIRED",
    })
    assert.equal(again.ok, false)
    if (!again.ok) assert.equal(again.status, 409)

    const still = await prismadb.product.findUnique({
      where: { id: productId },
      select: { quantity: true },
    })
    assert.equal(Number(still?.quantity), 5)
  })

  it("not-yet-due PENDING is untouched by expire sweep", async () => {
    await prismadb.product.update({
      where: { id: productId },
      data: { quantity: 4 },
    })
    const placed = await placeStorefrontOrder({
      storeSlug,
      customerName: "Fresh Hold",
      phone: "+2348012345678",
      address: "12 Test Street, Lagos",
      idempotencyKey: newIdempotencyKey(),
      items: [{ productId, quantity: 1 }],
    })
    assert.equal(placed.ok, true)
    if (!placed.ok) return
    const order = await prismadb.order.findUniqueOrThrow({
      where: { reference: placed.reference },
    })
    createdOrderIds.push(order.id)

    const sweep = await expireDueOrders({
      storeId,
      limit: 50,
      now: new Date(Date.now() - 60_000),
    })
    assert.equal(sweep.expired, 0)

    const still = await prismadb.order.findUniqueOrThrow({
      where: { id: order.id },
    })
    assert.equal(still.status, "PENDING")
  })

  it("CONFIRMED orders are never expired", async () => {
    await prismadb.product.update({
      where: { id: productId },
      data: { quantity: 4 },
    })
    const placed = await placeStorefrontOrder({
      storeSlug,
      customerName: "Confirm Then Expire",
      phone: "+2348012345678",
      address: "12 Test Street, Lagos",
      idempotencyKey: newIdempotencyKey(),
      items: [{ productId, quantity: 1 }],
    })
    assert.equal(placed.ok, true)
    if (!placed.ok) return
    const order = await prismadb.order.findUniqueOrThrow({
      where: { reference: placed.reference },
    })
    createdOrderIds.push(order.id)

    const confirmed = await confirmPendingOrder({
      storeId,
      orderId: order.id,
    })
    assert.equal(confirmed.ok, true)

    await prismadb.order.update({
      where: { id: order.id },
      data: { holdsUntil: new Date(Date.now() - 1000) },
    })

    const sweep = await expireDueOrders({ storeId, limit: 20 })
    void sweep
    const still = await prismadb.order.findUniqueOrThrow({
      where: { id: order.id },
    })
    assert.equal(still.status, "CONFIRMED")
  })

  it("unlimited stockHeld false does not invent stock on expire", async () => {
    await prismadb.product.update({
      where: { id: productId },
      data: { quantity: null },
    })
    const placed = await placeStorefrontOrder({
      storeSlug,
      customerName: "Unlimited Expire",
      phone: "+2348012345678",
      address: "12 Test Street, Lagos",
      idempotencyKey: newIdempotencyKey(),
      items: [{ productId, quantity: 2 }],
    })
    assert.equal(placed.ok, true)
    if (!placed.ok) return
    const order = await prismadb.order.findUniqueOrThrow({
      where: { reference: placed.reference },
      include: { orderItems: true },
    })
    createdOrderIds.push(order.id)
    assert.equal(order.orderItems[0]?.stockHeld, false)

    await prismadb.product.update({
      where: { id: productId },
      data: { quantity: 7 },
    })
    await prismadb.order.update({
      where: { id: order.id },
      data: { holdsUntil: new Date(Date.now() - 1000) },
    })

    const sweep = await expireDueOrders({ storeId, limit: 10 })
    assert.ok(sweep.expired >= 1)

    const stock = await prismadb.product.findUnique({
      where: { id: productId },
      select: { quantity: true },
    })
    assert.equal(Number(stock?.quantity), 7)
  })
})
