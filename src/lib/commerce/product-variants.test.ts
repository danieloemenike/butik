import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  buildSizeVariants,
  resolveSizeSelection,
} from "./product-variants"

describe("buildSizeVariants", () => {
  it("skips auto variants when only one size and no manual variants", () => {
    const result = buildSizeVariants({
      sizeIds: ["s1"],
      colorId: "c1",
      price: 100,
      quantity: 5,
      images: [{ url: "https://example.com/a.jpg" }],
    })
    assert.deepEqual(result, [])
  })

  it("creates one variant per size when multiple sizes selected", () => {
    const result = buildSizeVariants({
      sizeIds: ["s1", "s2"],
      colorId: "c1",
      price: 100,
      discountedPrice: 80,
      quantity: 5,
      images: [{ url: "https://example.com/a.jpg" }],
    })
    assert.equal(result.length, 2)
    assert.equal(result[0]?.sizeId, "s1")
    assert.equal(result[1]?.sizeId, "s2")
    assert.equal(result[0]?.colorId, "c1")
    assert.equal(result[0]?.price, 100)
  })

  it("drops deselected sizes and regenerates base-color price from args", () => {
    const result = buildSizeVariants({
      sizeIds: ["s2"],
      colorId: "c1",
      price: 120,
      quantity: 3,
      images: [{ url: "https://example.com/a.jpg" }],
      manualVariants: [
        {
          colorId: "c1",
          sizeId: "s1",
          quantity: 2,
          price: 90,
          images: [{ url: "https://example.com/old.jpg" }],
        },
        {
          colorId: "c1",
          sizeId: "s2",
          quantity: 2,
          price: 90,
          images: [{ url: "https://example.com/old.jpg" }],
        },
      ],
    })
    // Single size after deselect + no custom colors → product-level only
    assert.deepEqual(result, [])
  })

  it("keeps custom color manuals for selected sizes and refreshes base sizes", () => {
    const result = buildSizeVariants({
      sizeIds: ["s1", "s2"],
      colorId: "c1",
      price: 150,
      quantity: 8,
      images: [{ url: "https://example.com/base.jpg" }],
      manualVariants: [
        {
          colorId: "c2",
          sizeId: "s1",
          quantity: 1,
          price: 160,
          images: [{ url: "https://example.com/red.jpg" }],
        },
        {
          colorId: "c2",
          sizeId: "s3",
          quantity: 1,
          price: 160,
          images: [{ url: "https://example.com/gone.jpg" }],
        },
      ],
    })
    assert.equal(result.length, 3)
    const custom = result.find((v) => v.colorId === "c2")
    assert.equal(custom?.sizeId, "s1")
    assert.equal(custom?.price, 160)
    const autoS2 = result.find((v) => v.sizeId === "s2" && v.colorId === "c1")
    assert.equal(autoS2?.price, 150)
    assert.equal(autoS2?.quantity, 8)
    assert.ok(!result.some((v) => v.sizeId === "s3"))
  })
})

describe("resolveSizeSelection", () => {
  it("prefers sizeIds and derives sizeId", () => {
    const result = resolveSizeSelection({
      sizeId: "s1",
      sizeIds: ["s2", "s1"],
    })
    assert.ok(!("error" in result))
    if ("error" in result) return
    assert.equal(result.sizeId, "s1")
    assert.deepEqual(result.sizeIds, ["s2", "s1"])
  })

  it("errors when empty", () => {
    const result = resolveSizeSelection({})
    assert.ok("error" in result)
  })
})
