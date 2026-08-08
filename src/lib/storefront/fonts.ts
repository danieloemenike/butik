import {
  DEFAULT_BODY_FONT,
  DEFAULT_DISPLAY_FONT,
  STORE_FONT_IDS,
  STORE_FONTS,
  type StoreFont,
} from "@/lib/storefront/fonts-catalog"

export {
  DEFAULT_BODY_FONT,
  DEFAULT_DISPLAY_FONT,
  STORE_FONTS,
  STORE_FONT_IDS,
  type StoreFont,
} from "@/lib/storefront/fonts-catalog"

/** Map legacy FontPairing enum values to public/fonts ids. */
export const LEGACY_FONT_PAIRING_MAP = {
  MODERN: { displayFont: "Figtree", bodyFont: "Figtree" },
  CLASSIC: { displayFont: "Libre-Baskerville", bodyFont: "Source-Sans-3" },
  EDITORIAL: { displayFont: "DM-Serif-Display", bodyFont: "DM-Sans" },
} as const

export function isValidStoreFontId(id: string | null | undefined): boolean {
  if (!id) return false
  return STORE_FONT_IDS.has(id)
}

export function normalizeStoreFontId(
  id: string | null | undefined,
  fallback: string = DEFAULT_BODY_FONT
): string {
  if (id && STORE_FONT_IDS.has(id)) return id
  if (fallback && STORE_FONT_IDS.has(fallback)) return fallback
  return STORE_FONTS[0]?.id ?? "Figtree"
}

export function getStoreFont(id: string | null | undefined): StoreFont | null {
  if (!id) return null
  return STORE_FONTS.find((font) => font.id === id) ?? null
}

export function storeFontOptions() {
  return STORE_FONTS.map((font) => ({
    value: font.id,
    label: font.label,
    keywords: font.id.replace(/-/g, " "),
  }))
}

export function cssFontFamilyName(font: StoreFont): string {
  return `"${font.label}"`
}

export function fontFaceCss(ids: Array<string | null | undefined>): string {
  const seen = new Set<string>()
  const chunks: string[] = []

  for (const id of ids) {
    const font = getStoreFont(id)
    if (!font || seen.has(font.id)) continue
    seen.add(font.id)
    const family = cssFontFamilyName(font)
    for (const face of font.files) {
      chunks.push(`@font-face {
  font-family: ${family};
  src: url("${face.path}") format("woff2");
  font-weight: ${face.weight};
  font-style: ${face.style};
  font-display: swap;
}`)
    }
  }

  return chunks.join("\n")
}

export function resolveStoreFonts(opts: {
  displayFont?: string | null
  bodyFont?: string | null
}): { display: string; body: string; displayId: string; bodyId: string } {
  const displayId = normalizeStoreFontId(
    opts.displayFont,
    DEFAULT_DISPLAY_FONT
  )
  const bodyId = normalizeStoreFontId(opts.bodyFont, DEFAULT_BODY_FONT)
  const displayFont = getStoreFont(displayId)!
  const bodyFont = getStoreFont(bodyId)!

  return {
    displayId,
    bodyId,
    display: `${cssFontFamilyName(displayFont)}, system-ui, sans-serif`,
    body: `${cssFontFamilyName(bodyFont)}, system-ui, sans-serif`,
  }
}
