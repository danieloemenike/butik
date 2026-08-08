#!/usr/bin/env node
/**
 * Regenerates src/lib/storefront/fonts-catalog.ts from public/fonts/*.woff2
 *
 * Only curated families are included. Drop unused files from public/fonts
 * (or move them to R2) to keep deploy size small.
 */
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const dir = path.join(root, "public/fonts")
const outPath = path.join(root, "src/lib/storefront/fonts-catalog.ts")

/** Families allowed in the store appearance picker. */
export const CURATED_STORE_FONT_IDS = new Set([
  // Theme / legacy defaults
  "Figtree",
  "Libre-Baskerville",
  "Source-Sans-3",
  "DM-Serif-Display",
  "DM-Sans",
  "Outfit",
  "Playfair-Display",
  // Sans
  "Manrope",
  "Public-Sans",
  "Geist",
  "Sora",
  "Onest",
  "Karla",
  "Josefin-Sans",
  "Albert-Sans",
  "Hanken-Grotesk",
  "Urbanist",
  "Mulish",
  "Libre-Franklin",
  "Quicksand",
  "Cabin",
  "Jost",
  "Lexend",
  "Barlow",
  // Serif
  "Lora",
  "Instrument-Serif",
  "Young-Serif",
  "Domine",
  "Crimson-Pro",
  "Gilda-Display",
  "Libre-Bodoni",
  "Volkhov",
  "Frank-Ruhl-Libre",
  "Petrona",
  // Display
  "Bebas-Neue",
  "Anton",
  "Syne",
  "Oswald",
  "League-Gothic",
  "Big-Shoulders-Display",
  "Abril-Fatface",
  "Yeseva-One",
  "Alfa-Slab-One",
  "Fjalla-One",
  // Script
  "Dancing-Script",
  "Satisfy",
  "Sacramento",
  "Allura",
  // Mono
  "Geist-Mono",
  "DM-Mono",
  "Space-Mono",
])

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".woff2"))

function parse(file) {
  const base = file.replace(/\.woff2$/, "")
  let weight = 400
  let style = "normal"
  let familyKey = base
  if (/-Bold$/i.test(base)) {
    weight = 700
    familyKey = base.replace(/-Bold$/i, "")
  } else if (/-Regular$/i.test(base)) {
    weight = 400
    familyKey = base.replace(/-Regular$/i, "")
  } else if (/-Italic$/i.test(base)) {
    style = "italic"
    familyKey = base.replace(/-Italic$/i, "")
  }
  return {
    id: familyKey,
    label: familyKey.replace(/-/g, " "),
    weight,
    style,
    file,
  }
}

const map = new Map()
const skipped = new Set()
for (const file of files) {
  const p = parse(file)
  if (!CURATED_STORE_FONT_IDS.has(p.id)) {
    skipped.add(p.id)
    continue
  }
  if (!map.has(p.id)) {
    map.set(p.id, { id: p.id, label: p.label, files: [] })
  }
  map.get(p.id).files.push({
    path: `/fonts/${p.file}`,
    weight: p.weight,
    style: p.style,
  })
}

const missing = [...CURATED_STORE_FONT_IDS].filter((id) => !map.has(id))
if (missing.length) {
  console.warn(
    `Warning: curated fonts missing from public/fonts: ${missing.join(", ")}`
  )
}
if (skipped.size) {
  console.warn(
    `Skipping ${skipped.size} non-curated families in public/fonts (delete or move to R2)`
  )
}

const fonts = [...map.values()].sort((a, b) => a.label.localeCompare(b.label))
for (const font of fonts) {
  font.files.sort(
    (a, b) => a.weight - b.weight || a.style.localeCompare(b.style)
  )
}

const serialized = JSON.stringify(fonts, null, 2)
  .replaceAll('"style": "normal"', '"style": "normal" as const')
  .replaceAll('"style": "italic"', '"style": "italic" as const')

const out = `/* Auto-generated from public/fonts — do not edit by hand.
 * Re-run: node scripts/generate-store-fonts.mjs
 */
export type StoreFontFace = {
  path: string
  weight: number
  style: "normal" | "italic"
}

export type StoreFont = {
  id: string
  label: string
  files: StoreFontFace[]
}

export const STORE_FONTS: StoreFont[] = ${serialized}

export const DEFAULT_DISPLAY_FONT = "Figtree"
export const DEFAULT_BODY_FONT = "Figtree"

export const STORE_FONT_IDS = new Set(STORE_FONTS.map((font) => font.id))
`

fs.writeFileSync(outPath, out)
console.log(`Wrote ${fonts.length} fonts → ${path.relative(root, outPath)}`)
