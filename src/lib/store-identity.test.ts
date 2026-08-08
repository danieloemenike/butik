import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  buildSlugSuggestions,
  isReservedStoreSlug,
  isValidProductSlug,
  isValidStoreSlug,
  normalizeStoreSlug,
  RESERVED_STORE_SLUGS,
  storefrontHref,
} from "./store-identity"

describe("normalizeStoreSlug", () => {
  it("preserves underscore grammar from names", () => {
    assert.equal(normalizeStoreSlug("Richly Store"), "richly_store")
    assert.equal(normalizeStoreSlug("  Hello World  "), "hello_world")
  })

  it("strips invalid characters", () => {
    assert.equal(normalizeStoreSlug("Café! Shop"), "caf_shop")
  })
})

describe("isValidStoreSlug", () => {
  it("accepts underscore slugs", () => {
    assert.equal(isValidStoreSlug("richly"), true)
    assert.equal(isValidStoreSlug("richly_store"), true)
    assert.equal(isValidStoreSlug("a1_b2"), true)
  })

  it("rejects reserved and invalid forms", () => {
    assert.equal(isValidStoreSlug("explore"), false)
    assert.equal(isValidStoreSlug("api"), false)
    assert.equal(isValidStoreSlug("store"), false)
    assert.equal(isValidStoreSlug("_richly"), false)
    assert.equal(isValidStoreSlug("richly_"), false)
    assert.equal(isValidStoreSlug("Richly"), false)
    assert.equal(isValidStoreSlug("richly-store"), false)
    assert.equal(isValidStoreSlug(""), false)
  })
})

describe("isReservedStoreSlug", () => {
  it("flags known app path segments", () => {
    for (const slug of ["api", "business", "explore", "register-business"]) {
      assert.equal(isReservedStoreSlug(slug), true)
      assert.ok(RESERVED_STORE_SLUGS.has(slug))
    }
  })
})

describe("buildSlugSuggestions", () => {
  it("returns free alternate slugs when the base is taken", () => {
    const suggestions = buildSlugSuggestions("north_atelier", [
      "north_atelier",
      "north_atelier_store",
    ])
    assert.ok(suggestions.length > 0)
    assert.ok(!suggestions.includes("north_atelier"))
    assert.ok(!suggestions.includes("north_atelier_store"))
    for (const suggestion of suggestions) {
      assert.equal(isValidStoreSlug(suggestion), true)
    }
  })
})

describe("isValidProductSlug", () => {
  it("requires a public slug and rejects empty/null", () => {
    assert.equal(isValidProductSlug(null), false)
    assert.equal(isValidProductSlug(""), false)
    assert.equal(isValidProductSlug("blue_shirt"), true)
    assert.equal(isValidProductSlug("Blue"), false)
  })

  it("rejects leading or trailing underscores", () => {
    assert.equal(isValidProductSlug("_air_jordan_13"), false)
    assert.equal(isValidProductSlug("air_jordan_13_"), false)
    assert.equal(isValidProductSlug("air_jordan_13"), true)
  })
})

describe("storefrontHref", () => {
  it("preserves preview across home, catalog, and product paths", () => {
    assert.equal(
      storefrontHref("richly", "home", { preview: true }),
      "/richly?preview=1"
    )
    assert.equal(
      storefrontHref("richly", "products", { preview: true }),
      "/richly/products?preview=1"
    )
    assert.equal(
      storefrontHref("richly", "products", {
        preview: true,
        categoryId: "cat1",
      }),
      "/richly/products?preview=1&categoryId=cat1"
    )
    assert.equal(
      storefrontHref("richly", { productSlug: "blue_shirt" }, { preview: true }),
      "/richly/products/blue_shirt?preview=1"
    )
    assert.equal(storefrontHref("richly", "home"), "/richly")
  })
})
