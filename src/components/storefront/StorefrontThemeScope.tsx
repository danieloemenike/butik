import type { CSSProperties, ReactNode } from "react"
import type { StoreColorMode } from "@prisma/client"
import {
  fontFaceCss,
  resolveStoreFonts,
} from "@/lib/storefront/fonts"

export type StorefrontThemeTokens = {
  primaryColor: string
  accentColor: string
  backgroundColor: string
  darkPrimaryColor: string
  darkAccentColor: string
  darkBackgroundColor: string
  colorMode: StoreColorMode
  displayFont: string
  bodyFont: string
}

type Props = {
  theme: StorefrontThemeTokens
  /** Stable key for SYSTEM prefers-color-scheme CSS scope (e.g. store id). */
  scopeKey: string
  className?: string
  children: ReactNode
}

/**
 * Applies store light/dark tokens. SYSTEM uses prefers-color-scheme via CSS
 * (no hydration flash). LIGHT/DARK lock a single palette.
 *
 * Server component — keep `<style>` here so client trees don't warn / fail.
 */
export function StorefrontThemeScope({
  theme,
  scopeKey,
  className,
  children,
}: Props) {
  const scopeClassName = `sf-theme-${scopeKey.replace(/[^a-zA-Z0-9_-]/g, "")}`
  const fonts = resolveStoreFonts({
    displayFont: theme.displayFont,
    bodyFont: theme.bodyFont,
  })
  const faces = fontFaceCss([theme.displayFont, theme.bodyFont])

  const lockedDark = theme.colorMode === "DARK"
  const lockedLight = theme.colorMode === "LIGHT"
  const system = theme.colorMode === "SYSTEM"

  const active = lockedDark
    ? {
        primaryColor: theme.darkPrimaryColor,
        accentColor: theme.darkAccentColor,
        backgroundColor: theme.darkBackgroundColor,
      }
    : {
        primaryColor: theme.primaryColor,
        accentColor: theme.accentColor,
        backgroundColor: theme.backgroundColor,
      }

  const style = {
    backgroundColor: active.backgroundColor,
    color: active.primaryColor,
    colorScheme: lockedDark ? "dark" : lockedLight ? "light" : "light dark",
    fontFamily: fonts.body,
    "--sf-primary": active.primaryColor,
    "--sf-accent": active.accentColor,
    "--sf-bg": active.backgroundColor,
    "--sf-primary-light": theme.primaryColor,
    "--sf-accent-light": theme.accentColor,
    "--sf-bg-light": theme.backgroundColor,
    "--sf-primary-dark": theme.darkPrimaryColor,
    "--sf-accent-dark": theme.darkAccentColor,
    "--sf-bg-dark": theme.darkBackgroundColor,
  } as CSSProperties

  const modeAttr = system ? "system" : lockedDark ? "dark" : "light"
  const wrapperClass = [className, system ? scopeClassName : null]
    .filter(Boolean)
    .join(" ")

  return (
    <>
      {faces ? (
        <style dangerouslySetInnerHTML={{ __html: faces }} />
      ) : null}
      {system ? (
        <style
          dangerouslySetInnerHTML={{
            __html: `
.${scopeClassName} {
  color-scheme: light dark;
  background-color: var(--sf-bg-light);
  color: var(--sf-primary-light);
  --sf-primary: var(--sf-primary-light);
  --sf-accent: var(--sf-accent-light);
  --sf-bg: var(--sf-bg-light);
}
@media (prefers-color-scheme: dark) {
  .${scopeClassName} {
    background-color: var(--sf-bg-dark);
    color: var(--sf-primary-dark);
    --sf-primary: var(--sf-primary-dark);
    --sf-accent: var(--sf-accent-dark);
    --sf-bg: var(--sf-bg-dark);
  }
}`,
          }}
        />
      ) : null}
      <div className={wrapperClass} data-sf-mode={modeAttr} style={style}>
        {children}
      </div>
    </>
  )
}
