import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  DEFAULT_BODY_FONT,
  STORE_FONTS,
  fontFaceCss,
  isValidStoreFontId,
  normalizeStoreFontId,
  resolveStoreFonts,
} from "./fonts"

describe("store public fonts", () => {
  it("catalog includes defaults from public/fonts", () => {
    assert.ok(STORE_FONTS.length > 50)
    assert.equal(isValidStoreFontId(DEFAULT_BODY_FONT), true)
    assert.equal(isValidStoreFontId("Libre-Baskerville"), true)
    assert.equal(isValidStoreFontId("not-a-font"), false)
  })

  it("resolves css stacks and @font-face rules", () => {
    const fonts = resolveStoreFonts({
      displayFont: "DM-Serif-Display",
      bodyFont: "DM-Sans",
    })
    assert.match(fonts.display, /DM Serif Display/)
    assert.match(fonts.body, /DM Sans/)
    const css = fontFaceCss([fonts.displayId, fonts.bodyId])
    assert.match(css, /@font-face/)
    assert.match(css, /\/fonts\/DM-Sans\.woff2/)
  })

  it("falls back for unknown ids", () => {
    assert.equal(normalizeStoreFontId("nope"), DEFAULT_BODY_FONT)
  })
})
