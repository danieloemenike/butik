import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  applyPresetToFormValues,
  getThemePreset,
  resolveStoreColors,
  STORE_THEME_PRESETS,
} from "./themes"

describe("store theme presets", () => {
  it("ships named presets with light and dark palettes", () => {
    assert.ok(STORE_THEME_PRESETS.length >= 4)
    for (const preset of STORE_THEME_PRESETS) {
      assert.match(preset.light.primaryColor, /^#/)
      assert.match(preset.dark.backgroundColor, /^#/)
      assert.notEqual(preset.light.backgroundColor, preset.dark.backgroundColor)
    }
  })

  it("resolves LIGHT / DARK / SYSTEM", () => {
    const preset = getThemePreset("harbor")!
    assert.equal(
      resolveStoreColors({
        colorMode: "LIGHT",
        light: preset.light,
        dark: preset.dark,
      }).mode,
      "light"
    )
    assert.equal(
      resolveStoreColors({
        colorMode: "DARK",
        light: preset.light,
        dark: preset.dark,
      }).accentColor,
      preset.dark.accentColor
    )
    assert.equal(
      resolveStoreColors({
        colorMode: "SYSTEM",
        prefersDark: true,
        light: preset.light,
        dark: preset.dark,
      }).mode,
      "dark"
    )
  })

  it("applyPresetToFormValues maps both palettes", () => {
    const preset = getThemePreset("noir")!
    const values = applyPresetToFormValues(preset)
    assert.equal(values.themePreset, "noir")
    assert.equal(values.primaryColor, preset.light.primaryColor)
    assert.equal(values.darkAccentColor, preset.dark.accentColor)
    assert.equal(values.displayFont, preset.displayFont)
    assert.equal(values.bodyFont, preset.bodyFont)
  })
})
