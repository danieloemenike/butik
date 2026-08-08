import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  canTransitionOrder,
  computeHoldsUntil,
  dedupeCartLines,
  generateOrderReference,
  hashConfirmationToken,
  isHoldExpired,
  normalizeCustomerPhone,
  normalizeProductStock,
  normalizeVariantStock,
  parseLineQuantity,
  parseWritableStockQuantity,
  resolveUnitPrice,
  verifyConfirmationToken,
  generateConfirmationToken,
} from "./policy"

describe("parseLineQuantity", () => {
  it("accepts positive integers only", () => {
    assert.equal(parseLineQuantity(2), 2)
    assert.equal(parseLineQuantity("3"), 3)
    assert.equal(parseLineQuantity(0), null)
    assert.equal(parseLineQuantity(1.5), null)
    assert.equal(parseLineQuantity("-1"), null)
  })
})

describe("stock normalization", () => {
  it("treats null as unlimited and floors decimals", () => {
    assert.equal(normalizeProductStock(null), null)
    assert.equal(normalizeProductStock(4.9), 4)
    assert.equal(normalizeProductStock(-1), 0)
    assert.equal(normalizeVariantStock(null), null)
    assert.equal(normalizeVariantStock(3), 3)
  })
})

describe("resolveUnitPrice", () => {
  it("prefers discounted then base; variant when selected", () => {
    assert.equal(
      resolveUnitPrice({
        productPrice: 100,
        productDiscounted: 80,
        useVariant: false,
      }),
      80
    )
    assert.equal(
      resolveUnitPrice({
        productPrice: 100,
        variantPrice: 120,
        variantDiscounted: 90,
        useVariant: true,
      }),
      90
    )
  })
})

describe("dedupeCartLines", () => {
  it("sums quantities for the same product/variant", () => {
    const lines = dedupeCartLines([
      { productId: "a", quantity: 2 },
      { productId: "a", quantity: 3 },
      { productId: "a", productVariantId: "v1", quantity: 1 },
    ])
    assert.equal(lines.length, 2)
    const base = lines.find((l) => !l.productVariantId)
    assert.equal(base?.quantity, 5)
  })
})

describe("order transitions", () => {
  it("only allows confirm/cancel/expire from PENDING", () => {
    assert.equal(canTransitionOrder("PENDING", "confirm"), true)
    assert.equal(canTransitionOrder("PENDING", "cancel"), true)
    assert.equal(canTransitionOrder("PENDING", "expire"), true)
    assert.equal(canTransitionOrder("CONFIRMED", "cancel"), false)
    assert.equal(canTransitionOrder("CANCELLED", "confirm"), false)
    assert.equal(canTransitionOrder("EXPIRED", "expire"), false)
  })
})

describe("hold expiry helpers", () => {
  it("computes holdsUntil in the future", () => {
    const from = new Date("2026-01-01T00:00:00.000Z")
    const until = computeHoldsUntil(from)
    assert.ok(until.getTime() > from.getTime())
  })

  it("detects expired PENDING holds", () => {
    const past = new Date(Date.now() - 60_000)
    const future = new Date(Date.now() + 60_000)
    assert.equal(
      isHoldExpired({ status: "PENDING", holdsUntil: past }),
      true
    )
    assert.equal(
      isHoldExpired({ status: "PENDING", holdsUntil: future }),
      false
    )
    assert.equal(
      isHoldExpired({ status: "EXPIRED", holdsUntil: future }),
      true
    )
    assert.equal(
      isHoldExpired({ status: "CONFIRMED", holdsUntil: past }),
      false
    )
  })
})

describe("confirmation token", () => {
  it("hashes and verifies", () => {
    const token = generateConfirmationToken()
    const hash = hashConfirmationToken(token)
    assert.equal(verifyConfirmationToken(token, hash), true)
    assert.equal(verifyConfirmationToken("nope", hash), false)
  })

  it("generates BTK references", () => {
    assert.match(generateOrderReference(), /^BTK[A-Z0-9]{8}$/)
  })
})

describe("parseWritableStockQuantity", () => {
  it("accepts integers, null/empty as unlimited, rejects floats", () => {
    assert.deepEqual(parseWritableStockQuantity(3), { ok: true, quantity: 3 })
    assert.deepEqual(parseWritableStockQuantity(0), { ok: true, quantity: 0 })
    assert.deepEqual(parseWritableStockQuantity(null), {
      ok: true,
      quantity: null,
    })
    assert.deepEqual(parseWritableStockQuantity(""), {
      ok: true,
      quantity: null,
    })
    assert.equal(parseWritableStockQuantity(1.5).ok, false)
    assert.equal(parseWritableStockQuantity(-1).ok, false)
  })
})

describe("normalizeCustomerPhone", () => {
  it("normalizes to E.164 and rejects short/invalid", () => {
    assert.equal(normalizeCustomerPhone("+234 801 234 5678"), "+2348012345678")
    assert.equal(normalizeCustomerPhone("2348012345678"), "+2348012345678")
    assert.equal(normalizeCustomerPhone("08012345678"), "+2348012345678")
    assert.equal(normalizeCustomerPhone("123"), null)
    assert.equal(normalizeCustomerPhone(""), null)
  })
})
