import prismadb from "@/lib/prismadb"
import { requireOwnedStoreForBusiness, jsonError } from "@/lib/store-access"
import { getThemePreset } from "@/lib/storefront/themes"
import {
  isValidStoreFontId,
  normalizeStoreFontId,
  DEFAULT_BODY_FONT,
  DEFAULT_DISPLAY_FONT,
} from "@/lib/storefront/fonts"
import { StoreColorMode } from "@prisma/client"
import { NextResponse } from "next/server"

type RouteParams = {
  params: Promise<{ businessId: string; storeId: string }>
}

const COLOR_MODES = new Set<string>(Object.values(StoreColorMode))

const HEX_COLOR = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/

function requireColor(value: unknown, field: string): string | NextResponse {
  if (typeof value !== "string" || !HEX_COLOR.test(value.trim())) {
    return jsonError("Enter a valid hex color (e.g. #0F172A).", 400, field)
  }
  return value.trim().toUpperCase().length === 4
    ? expandShortHex(value.trim())
    : value.trim().toUpperCase()
}

function expandShortHex(hex: string) {
  const h = hex.slice(1)
  return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toUpperCase()
}

export async function PATCH(request: Request, { params: rawParams }: RouteParams) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreForBusiness(
      params.businessId,
      params.storeId
    )
    if (auth.error) return auth.error

    const body = await request.json()
    const {
      logoUrl,
      primaryColor,
      accentColor,
      backgroundColor,
      darkPrimaryColor,
      darkAccentColor,
      darkBackgroundColor,
      themePreset,
      colorMode,
      displayFont,
      bodyFont,
      tagline,
    } = body

    const preset =
      typeof themePreset === "string" ? getThemePreset(themePreset) : null

    const primary = requireColor(
      primaryColor ?? preset?.light.primaryColor,
      "primaryColor"
    )
    if (primary instanceof NextResponse) return primary

    const accent = requireColor(
      accentColor ?? preset?.light.accentColor,
      "accentColor"
    )
    if (accent instanceof NextResponse) return accent

    const background = requireColor(
      backgroundColor ?? preset?.light.backgroundColor,
      "backgroundColor"
    )
    if (background instanceof NextResponse) return background

    const darkPrimary = requireColor(
      darkPrimaryColor ?? preset?.dark.primaryColor ?? auth.store.darkPrimaryColor,
      "darkPrimaryColor"
    )
    if (darkPrimary instanceof NextResponse) return darkPrimary

    const darkAccent = requireColor(
      darkAccentColor ?? preset?.dark.accentColor ?? auth.store.darkAccentColor,
      "darkAccentColor"
    )
    if (darkAccent instanceof NextResponse) return darkAccent

    const darkBackground = requireColor(
      darkBackgroundColor ??
        preset?.dark.backgroundColor ??
        auth.store.darkBackgroundColor,
      "darkBackgroundColor"
    )
    if (darkBackground instanceof NextResponse) return darkBackground

    let resolvedDisplay = auth.store.displayFont || DEFAULT_DISPLAY_FONT
    if (displayFont !== undefined) {
      if (typeof displayFont !== "string" || !isValidStoreFontId(displayFont)) {
        return jsonError(
          "Choose a heading font from the available store fonts.",
          400,
          "displayFont"
        )
      }
      resolvedDisplay = displayFont
    } else if (preset?.displayFont) {
      resolvedDisplay = normalizeStoreFontId(
        preset.displayFont,
        DEFAULT_DISPLAY_FONT
      )
    }

    let resolvedBody = auth.store.bodyFont || DEFAULT_BODY_FONT
    if (bodyFont !== undefined) {
      if (typeof bodyFont !== "string" || !isValidStoreFontId(bodyFont)) {
        return jsonError(
          "Choose a body font from the available store fonts.",
          400,
          "bodyFont"
        )
      }
      resolvedBody = bodyFont
    } else if (preset?.bodyFont) {
      resolvedBody = normalizeStoreFontId(preset.bodyFont, DEFAULT_BODY_FONT)
    }

    let resolvedMode: StoreColorMode = auth.store.colorMode
    if (colorMode !== undefined) {
      if (typeof colorMode !== "string" || !COLOR_MODES.has(colorMode)) {
        return jsonError("Choose Light, Dark, or System.", 400, "colorMode")
      }
      resolvedMode = colorMode as StoreColorMode
    }

    let logo: string | null = auth.store.logoUrl
    if (logoUrl !== undefined) {
      if (logoUrl === null || logoUrl === "") {
        logo = null
      } else if (typeof logoUrl !== "string") {
        return jsonError("Invalid logo URL.", 400, "logoUrl")
      } else {
        const trimmed = logoUrl.trim()
        if (!trimmed.startsWith("https://res.cloudinary.com/")) {
          return jsonError(
            "Logo must be uploaded via Cloudinary.",
            400,
            "logoUrl"
          )
        }
        logo = trimmed
      }
    }

    let taglineValue: string | null = auth.store.tagline
    if (tagline !== undefined) {
      if (typeof tagline === "string" && tagline.trim()) {
        taglineValue = tagline.trim().slice(0, 160)
      } else {
        taglineValue = null
      }
    }

    let presetId: string | null = auth.store.themePreset
    if (themePreset !== undefined) {
      if (themePreset === null || themePreset === "") {
        presetId = null
      } else if (typeof themePreset === "string") {
        presetId = getThemePreset(themePreset) ? themePreset : themePreset
      }
    }

    const store = await prismadb.store.update({
      where: { id: auth.store.id },
      data: {
        logoUrl: logo,
        primaryColor: primary,
        accentColor: accent,
        backgroundColor: background,
        darkPrimaryColor: darkPrimary,
        darkAccentColor: darkAccent,
        darkBackgroundColor: darkBackground,
        themePreset: presetId,
        colorMode: resolvedMode,
        displayFont: resolvedDisplay,
        bodyFont: resolvedBody,
        tagline: taglineValue,
      },
      select: {
        id: true,
        logoUrl: true,
        primaryColor: true,
        accentColor: true,
        backgroundColor: true,
        darkPrimaryColor: true,
        darkAccentColor: true,
        darkBackgroundColor: true,
        themePreset: true,
        colorMode: true,
        displayFont: true,
        bodyFont: true,
        tagline: true,
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.log("[STORE_APPEARANCE_PATCH]", error)
    return jsonError("Something went wrong while updating appearance.", 500)
  }
}
