import type { StoreColorMode } from "@prisma/client"

export type ThemePalette = {
  primaryColor: string
  accentColor: string
  backgroundColor: string
}

export type StoreThemePreset = {
  id: string
  name: string
  description: string
  displayFont: string
  bodyFont: string
  light: ThemePalette
  dark: ThemePalette
}

/** Curated storefront themes — avoid generic purple and cream/terracotta clusters. */
export const STORE_THEME_PRESETS: StoreThemePreset[] = [
  {
    id: "atelier",
    name: "Atelier",
    description: "Warm paper with ink type and clay accent",
    displayFont: "Libre-Baskerville",
    bodyFont: "Source-Sans-3",
    light: {
      primaryColor: "#1C1917",
      accentColor: "#B45309",
      backgroundColor: "#F5F0E8",
    },
    dark: {
      primaryColor: "#F5F0E8",
      accentColor: "#F59E0B",
      backgroundColor: "#1C1917",
    },
  },
  {
    id: "harbor",
    name: "Harbor",
    description: "Cool slate with sea-green accents",
    displayFont: "Figtree",
    bodyFont: "Figtree",
    light: {
      primaryColor: "#0F172A",
      accentColor: "#0F766E",
      backgroundColor: "#F1F5F9",
    },
    dark: {
      primaryColor: "#E2E8F0",
      accentColor: "#2DD4BF",
      backgroundColor: "#0B1220",
    },
  },
  {
    id: "noir",
    name: "Noir",
    description: "High-contrast charcoal boutique",
    displayFont: "DM-Serif-Display",
    bodyFont: "DM-Sans",
    light: {
      primaryColor: "#111111",
      accentColor: "#B91C1C",
      backgroundColor: "#FFFFFF",
    },
    dark: {
      primaryColor: "#FAFAFA",
      accentColor: "#F87171",
      backgroundColor: "#0A0A0A",
    },
  },
  {
    id: "grove",
    name: "Grove",
    description: "Leafy greens on soft stone",
    displayFont: "Figtree",
    bodyFont: "Figtree",
    light: {
      primaryColor: "#14532D",
      accentColor: "#3F6212",
      backgroundColor: "#F4F6F1",
    },
    dark: {
      primaryColor: "#ECFDF5",
      accentColor: "#86EFAC",
      backgroundColor: "#052E16",
    },
  },
  {
    id: "citrus",
    name: "Citrus",
    description: "Bright daylight with zest accent",
    displayFont: "Outfit",
    bodyFont: "Outfit",
    light: {
      primaryColor: "#1E293B",
      accentColor: "#CA8A04",
      backgroundColor: "#FFFBEB",
    },
    dark: {
      primaryColor: "#FEF3C7",
      accentColor: "#FACC15",
      backgroundColor: "#1C1917",
    },
  },
  {
    id: "indigo_ink",
    name: "Indigo ink",
    description: "Deep blue editorial on cool gray",
    displayFont: "Playfair-Display",
    bodyFont: "Source-Sans-3",
    light: {
      primaryColor: "#1E3A5F",
      accentColor: "#1D4ED8",
      backgroundColor: "#F8FAFC",
    },
    dark: {
      primaryColor: "#DBEAFE",
      accentColor: "#60A5FA",
      backgroundColor: "#0B1220",
    },
  },
]

export function getThemePreset(id: string | null | undefined) {
  if (!id) return null
  return STORE_THEME_PRESETS.find((p) => p.id === id) ?? null
}

export type ResolvedStoreColors = ThemePalette & {
  mode: "light" | "dark"
}

export function resolveStoreColors(opts: {
  colorMode: StoreColorMode
  /** Explicit preference when colorMode is SYSTEM */
  prefersDark?: boolean
  light: ThemePalette
  dark: ThemePalette
}): ResolvedStoreColors {
  const useDark =
    opts.colorMode === "DARK" ||
    (opts.colorMode === "SYSTEM" && Boolean(opts.prefersDark))

  const palette = useDark ? opts.dark : opts.light
  return {
    ...palette,
    mode: useDark ? "dark" : "light",
  }
}

export function applyPresetToFormValues(preset: StoreThemePreset) {
  return {
    themePreset: preset.id,
    displayFont: preset.displayFont,
    bodyFont: preset.bodyFont,
    primaryColor: preset.light.primaryColor,
    accentColor: preset.light.accentColor,
    backgroundColor: preset.light.backgroundColor,
    darkPrimaryColor: preset.dark.primaryColor,
    darkAccentColor: preset.dark.accentColor,
    darkBackgroundColor: preset.dark.backgroundColor,
  }
}
