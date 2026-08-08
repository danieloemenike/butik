"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useRouter } from "next/navigation"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import ImageUpload from "@/components/ui/ImageUpload"
import { SearchableSelect } from "@/components/SearchableSelect"
import type { StoreColorMode } from "@prisma/client"
import {
  STORE_THEME_PRESETS,
  applyPresetToFormValues,
  type StoreThemePreset,
} from "@/lib/storefront/themes"
import {
  DEFAULT_BODY_FONT,
  DEFAULT_DISPLAY_FONT,
  fontFaceCss,
  getStoreFont,
  isValidStoreFontId,
  resolveStoreFonts,
  storeFontOptions,
} from "@/lib/storefront/fonts"
import { cn } from "@/lib/utils"

const hex = z.string().regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)
const storeFontId = z.string().refine(isValidStoreFontId, {
  message: "Choose a font from the store library",
})
const fontOptions = storeFontOptions()

const formSchema = z.object({
  logoUrl: z.string().nullable(),
  primaryColor: hex,
  accentColor: hex,
  backgroundColor: hex,
  darkPrimaryColor: hex,
  darkAccentColor: hex,
  darkBackgroundColor: hex,
  themePreset: z.string().nullable(),
  colorMode: z.enum(["LIGHT", "DARK", "SYSTEM"]),
  displayFont: storeFontId,
  bodyFont: storeFontId,
  tagline: z.string().max(160).optional(),
})

type FormValues = z.infer<typeof formSchema>

type Props = {
  store: {
    id: string
    businessId: string
    name: string
    logoUrl: string | null
    primaryColor: string
    accentColor: string
    backgroundColor: string
    darkPrimaryColor: string
    darkAccentColor: string
    darkBackgroundColor: string
    themePreset: string | null
    colorMode: StoreColorMode
    displayFont: string
    bodyFont: string
    tagline: string | null
  }
}

const FALLBACK_COLORS = {
  primaryColor: "#0F172A",
  accentColor: "#C45C26",
  backgroundColor: "#FAFAF8",
  darkPrimaryColor: "#F8FAFC",
  darkAccentColor: "#E07A3D",
  darkBackgroundColor: "#0B1220",
} as const

export function AppearanceClient({ store }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState<"light" | "dark">(() =>
    store.colorMode === "DARK" ? "dark" : "light"
  )
  const [, startTransition] = useTransition()
  const saveSeq = useRef(0)
  const previewStyleRef = useRef<HTMLStyleElement | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logoUrl: store.logoUrl,
      primaryColor: store.primaryColor || FALLBACK_COLORS.primaryColor,
      accentColor: store.accentColor || FALLBACK_COLORS.accentColor,
      backgroundColor: store.backgroundColor || FALLBACK_COLORS.backgroundColor,
      darkPrimaryColor:
        store.darkPrimaryColor || FALLBACK_COLORS.darkPrimaryColor,
      darkAccentColor: store.darkAccentColor || FALLBACK_COLORS.darkAccentColor,
      darkBackgroundColor:
        store.darkBackgroundColor || FALLBACK_COLORS.darkBackgroundColor,
      themePreset: store.themePreset,
      colorMode: store.colorMode ?? "SYSTEM",
      displayFont: store.displayFont || DEFAULT_DISPLAY_FONT,
      bodyFont: store.bodyFont || DEFAULT_BODY_FONT,
      tagline: store.tagline ?? "",
    },
  })

  const values = form.watch()
  const displayFontId = values.displayFont || DEFAULT_DISPLAY_FONT
  const bodyFontId = values.bodyFont || DEFAULT_BODY_FONT
  const colorMode = values.colorMode ?? "SYSTEM"
  const previewFontCss = useMemo(
    () => fontFaceCss([displayFontId, bodyFontId]),
    [displayFontId, bodyFontId]
  )
  const fonts = resolveStoreFonts({
    displayFont: displayFontId,
    bodyFont: bodyFontId,
  })
  const displayLabel =
    getStoreFont(displayFontId)?.label ?? displayFontId
  const bodyLabel = getStoreFont(bodyFontId)?.label ?? bodyFontId

  async function persist(data: FormValues, opts?: { silent?: boolean }) {
    const seq = ++saveSeq.current
    setSaving(true)
    try {
      await axios.patch(
        `/api/business/${store.businessId}/stores/${store.id}/appearance/v1`,
        {
          logoUrl: data.logoUrl,
          primaryColor: data.primaryColor,
          accentColor: data.accentColor,
          backgroundColor: data.backgroundColor,
          darkPrimaryColor: data.darkPrimaryColor,
          darkAccentColor: data.darkAccentColor,
          darkBackgroundColor: data.darkBackgroundColor,
          themePreset: data.themePreset,
          colorMode: data.colorMode,
          displayFont: data.displayFont,
          bodyFont: data.bodyFont,
          tagline: data.tagline || null,
        }
      )
      if (seq !== saveSeq.current) return
      if (!opts?.silent) {
        toast({ title: "Appearance updated" })
      }
      startTransition(() => router.refresh())
    } catch (error) {
      if (seq !== saveSeq.current) return
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message
        : undefined
      toast({
        title: "Could not save",
        description: message || "Try again.",
        variant: "destructive",
      })
    } finally {
      if (seq === saveSeq.current) setSaving(false)
    }
  }

  async function applyPreset(preset: StoreThemePreset) {
    const next = {
      ...form.getValues(),
      ...applyPresetToFormValues(preset),
    }
    form.reset(next)
    await persist(next, { silent: true })
    toast({ title: `${preset.name} theme applied` })
  }

  async function onColorModeChange(mode: FormValues["colorMode"]) {
    form.setValue("colorMode", mode)
    const next = { ...form.getValues(), colorMode: mode }
    await persist(next, { silent: true })
    toast({
      title:
        mode === "SYSTEM"
          ? "Store follows visitor system theme"
          : mode === "DARK"
            ? "Store locked to dark"
            : "Store locked to light",
    })
  }

  const previewPalette =
    previewMode === "dark"
      ? {
          primary:
            values.darkPrimaryColor || FALLBACK_COLORS.darkPrimaryColor,
          accent: values.darkAccentColor || FALLBACK_COLORS.darkAccentColor,
          bg:
            values.darkBackgroundColor || FALLBACK_COLORS.darkBackgroundColor,
        }
      : {
          primary: values.primaryColor || FALLBACK_COLORS.primaryColor,
          accent: values.accentColor || FALLBACK_COLORS.accentColor,
          bg: values.backgroundColor || FALLBACK_COLORS.backgroundColor,
        }

  useEffect(() => {
    const el = document.createElement("style")
    el.dataset.appearancePreviewFonts = "true"
    el.textContent = previewFontCss
    document.head.appendChild(el)
    previewStyleRef.current = el
    return () => {
      el.remove()
      if (previewStyleRef.current === el) previewStyleRef.current = null
    }
  }, [previewFontCss])

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5 md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-medium tracking-tight">
              Themes
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a preset — light and dark palettes update the live storefront
              immediately.
            </p>
          </div>
          {saving ? (
            <p className="text-xs text-muted-foreground">Saving…</p>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STORE_THEME_PRESETS.map((preset) => {
            const selected = values.themePreset === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "border-foreground ring-1 ring-foreground"
                    : "border-border"
                )}
              >
                <div className="flex h-14 overflow-hidden rounded-lg">
                  <span
                    className="w-1/2"
                    style={{ backgroundColor: preset.light.backgroundColor }}
                  />
                  <span
                    className="flex w-1/2 items-end justify-end p-2"
                    style={{ backgroundColor: preset.dark.backgroundColor }}
                  >
                    <span
                      className="h-3 w-8 rounded-full"
                      style={{ backgroundColor: preset.dark.accentColor }}
                    />
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: preset.light.accentColor }}
                  />
                  <span
                    className="h-3 w-3 rounded-full border"
                    style={{ backgroundColor: preset.light.primaryColor }}
                  />
                  <span className="text-sm font-medium">{preset.name}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {preset.description}
                </p>
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-sm font-medium">Storefront mode</p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["LIGHT", "Light"],
                ["DARK", "Dark"],
                ["SYSTEM", "System"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={colorMode === value ? "default" : "outline"}
                onClick={() => onColorModeChange(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => persist(data))}
            className="space-y-5 rounded-lg border border-border bg-card p-5 md:p-6"
          >
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value ? [field.value] : []}
                      onChange={(url) => field.onChange(url)}
                      onRemove={() => field.onChange(null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tagline</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Short line under your store name"
                      maxLength={160}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <p className="mb-3 text-sm font-medium">Light palette</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {(
                  [
                    ["primaryColor", "Primary"],
                    ["accentColor", "Accent"],
                    ["backgroundColor", "Background"],
                  ] as const
                ).map(([name, label]) => (
                  <ColorField key={name} form={form} name={name} label={label} />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">Dark palette</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {(
                  [
                    ["darkPrimaryColor", "Primary"],
                    ["darkAccentColor", "Accent"],
                    ["darkBackgroundColor", "Background"],
                  ] as const
                ).map(([name, label]) => (
                  <ColorField key={name} form={form} name={name} label={label} />
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="displayFont"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heading font</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={fontOptions}
                        placeholder="Choose heading font"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bodyFont"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body font</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={fontOptions}
                        placeholder="Choose body font"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save fine-tuning"}
            </Button>
          </form>
        </Form>

        <aside
          className="overflow-hidden rounded-lg border border-border p-5"
          style={{ backgroundColor: previewPalette.bg }}
        >
          <div className="flex items-center justify-between gap-2">
            <p
              className="text-xs font-medium uppercase tracking-wide opacity-60"
              style={{ color: previewPalette.primary }}
            >
              Preview
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                className={cn(
                  "rounded px-2 py-1 text-[11px] font-medium",
                  previewMode === "light" ? "bg-black/10" : "opacity-60"
                )}
                style={{ color: previewPalette.primary }}
                onClick={() => setPreviewMode("light")}
              >
                Light
              </button>
              <button
                type="button"
                className={cn(
                  "rounded px-2 py-1 text-[11px] font-medium",
                  previewMode === "dark" ? "bg-white/15" : "opacity-60"
                )}
                style={{ color: previewPalette.primary }}
                onClick={() => setPreviewMode("dark")}
              >
                Dark
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <p
              className="text-2xl font-semibold tracking-tight"
              style={{
                color: previewPalette.primary,
                fontFamily: fonts.display,
              }}
            >
              {store.name}
            </p>
            {values.tagline ? (
              <p
                className="text-sm"
                style={{
                  color: previewPalette.primary,
                  opacity: 0.75,
                  fontFamily: fonts.body,
                }}
              >
                {values.tagline}
              </p>
            ) : null}
            <div
              className="inline-flex rounded-md px-3 py-2 text-sm font-semibold text-white"
              style={{
                backgroundColor: previewPalette.accent,
                fontFamily: fonts.body,
              }}
            >
              Shop collection
            </div>
            <p
              className="text-xs opacity-50"
              style={{ color: previewPalette.primary }}
            >
              {displayLabel} / {bodyLabel} · {colorMode.toLowerCase()}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ColorField({
  form,
  name,
  label,
}: {
  form: ReturnType<typeof useForm<FormValues>>
  name:
    | "primaryColor"
    | "accentColor"
    | "backgroundColor"
    | "darkPrimaryColor"
    | "darkAccentColor"
    | "darkBackgroundColor"
  label: string
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-9 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
                value={field.value}
                onChange={(e) => {
                  field.onChange(e.target.value)
                  form.setValue("themePreset", null)
                }}
              />
              <Input
                {...field}
                className="font-mono text-sm"
                onChange={(e) => {
                  field.onChange(e.target.value)
                  form.setValue("themePreset", null)
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
