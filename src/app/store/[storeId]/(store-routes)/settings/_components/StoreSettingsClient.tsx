"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useRouter } from "next/navigation"
import { City, Country } from "country-state-city"
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
import { SearchableSelect } from "@/components/SearchableSelect"
import {
  buildInternationalPhone,
  getDialCode,
  isValidStorePhone,
  sanitizeNationalNumber,
  slugifyStoreName,
} from "@/lib/store-form"
import { currencyOptions, normalizeCurrencyCode } from "@/lib/currency"
import type { StoreStatus } from "@prisma/client"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

const formSchema = z
  .object({
    storeName: z
      .string()
      .min(3, { message: "Store name must be at least 3 characters" })
      .max(30),
    storeSlug: z.string().min(1),
    storePhoneNumber: z.string().min(1),
    storeAddress: z.string().min(3).max(80),
    storeCity: z.string().min(1),
    storeCountry: z.string().min(1),
    countryCode: z.string().min(2).max(2),
    currency: z.string().length(3),
  })
  .superRefine((values, ctx) => {
    if (!slugifyStoreName(values.storeName)) {
      ctx.addIssue({
        code: "custom",
        path: ["storeName"],
        message: "Store name must produce a valid slug",
      })
    }
    if (!isValidStorePhone(values.countryCode, values.storePhoneNumber)) {
      ctx.addIssue({
        code: "custom",
        path: ["storePhoneNumber"],
        message: "Phone number is not valid for the selected country",
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

type StorePayload = {
  id: string
  businessId: string
  name: string
  storeSlug: string | null
  phoneNumber: string | null
  address: string | null
  city: string | null
  country: string | null
  currency: string
  status: StoreStatus
  publishedAt: string | null
}

function resolveCountryCode(countryName: string) {
  const match = Country.getAllCountries().find(
    (country) => country.name.toLowerCase() === countryName.trim().toLowerCase()
  )
  return match?.isoCode ?? ""
}

function nationalFromStoredPhone(phone: string | null, countryCode: string) {
  if (!phone) return ""
  const digits = phone.replace(/\D/g, "")
  const dial = getDialCode(countryCode)
  if (dial && digits.startsWith(dial)) {
    return digits.slice(dial.length)
  }
  return sanitizeNationalNumber(phone)
}

function statusLabel(status: StoreStatus) {
  if (status === "PUBLISHED") return "Live"
  if (status === "ARCHIVED") return "Archived"
  return "Not live"
}

type Props = {
  store: StorePayload
  productsMissingSlug: number
  productsHidden: Array<{ id: string; name: string }>
}

const countries = Country.getAllCountries()

export function StoreSettingsClient({
  store,
  productsMissingSlug,
  productsHidden,
}: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [acting, setActing] = useState<string | null>(null)
  const [status, setStatus] = useState(store.status)

  const countryCodeDefault = resolveCountryCode(store.country ?? "")
  const slugLocked = status === "PUBLISHED"

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: store.name,
      storeSlug: store.storeSlug || slugifyStoreName(store.name),
      storePhoneNumber: nationalFromStoredPhone(
        store.phoneNumber,
        countryCodeDefault
      ),
      storeAddress: store.address ?? "",
      storeCity: store.city ?? "",
      storeCountry: store.country ?? "",
      countryCode: countryCodeDefault,
      currency: normalizeCurrencyCode(store.currency),
    },
  })

  const storeName = useWatch({ control: form.control, name: "storeName" })
  const countryCode = useWatch({ control: form.control, name: "countryCode" })
  const dialCode = getDialCode(countryCode)

  useEffect(() => {
    if (slugLocked || !storeName) return
    const next = slugifyStoreName(storeName)
    if (next && form.getValues("storeSlug") !== next) {
      form.setValue("storeSlug", next, { shouldValidate: true })
    }
  }, [storeName, slugLocked, form])

  const countryOptions = useMemo(
    () =>
      countries.map((country) => ({
        value: country.isoCode,
        label: country.name,
        keywords: `${country.isoCode} ${country.phonecode}`,
        meta: `+${country.phonecode.replace(/^\+/, "")}`,
      })),
    []
  )

  const cityOptions = useMemo(() => {
    if (!countryCode) return []
    const cities = City.getCitiesOfCountry(countryCode) ?? []
    const seen = new Set<string>()
    return cities
      .filter((city) => {
        if (seen.has(city.name)) return false
        seen.add(city.name)
        return true
      })
      .map((city) => ({ value: city.name, label: city.name }))
  }, [countryCode])

  const publicPath = store.storeSlug ? `/${store.storeSlug}` : null
  const previewPath = store.storeSlug ? `/${store.storeSlug}?preview=1` : null

  async function onSaveIdentity(values: FormValues) {
    setSaving(true)
    try {
      const country = countries.find((c) => c.isoCode === values.countryCode)
      await axios.patch(
        `/api/business/${store.businessId}/stores/${store.id}/v1`,
        {
          storeName: values.storeName.trim(),
          storeSlug: slugifyStoreName(values.storeName),
          storePhoneNumber: buildInternationalPhone(
            values.countryCode,
            values.storePhoneNumber
          ),
          storeAddress: values.storeAddress.trim(),
          storeCity: values.storeCity.trim(),
          storeCountry: country?.name ?? values.storeCountry,
          currency: normalizeCurrencyCode(values.currency),
        }
      )
      toast({ title: "Store details saved" })
      router.refresh()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message
        : undefined
      toast({
        title: "Could not save",
        description: message || "Try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  async function runAction(
    action: "publish" | "unpublish" | "archive" | "restore"
  ) {
    setActing(action)
    try {
      const { data } = await axios.post(
        `/api/business/${store.businessId}/stores/${store.id}/publication/v1`,
        { action }
      )
      setStatus(data.store.status)
      const warningCount = data.warnings?.productsMissingSlug
      toast({
        title:
          action === "publish"
            ? "Store is live"
            : action === "unpublish"
              ? "Store taken offline"
              : action === "archive"
                ? "Store archived"
                : "Store restored",
        description:
          warningCount > 0
            ? `${warningCount} product${warningCount === 1 ? "" : "s"} hidden on the storefront until they have a URL slug.`
            : undefined,
      })
      router.refresh()
    } catch (error) {
      const payload = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })
        : undefined
      toast({
        title: "Action failed",
        description: payload?.message || "Try again.",
        variant: "destructive",
      })
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border bg-card p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Storefront status
            </p>
            <p className="mt-1 font-display text-xl font-medium tracking-tight">
              {statusLabel(status)}
            </p>
            {publicPath ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Public URL:{" "}
                <span className="font-medium text-foreground">{publicPath}</span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Set a store name to generate a public URL.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {status === "PUBLISHED" && publicPath ? (
              <Button asChild variant="outline" size="sm">
                <Link href={publicPath} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  View storefront
                </Link>
              </Button>
            ) : null}
            {status !== "PUBLISHED" && previewPath ? (
              <Button asChild variant="outline" size="sm">
                <Link href={previewPath} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Preview
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        {productsMissingSlug > 0 ? (
          <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-3 text-sm">
            <p className="font-medium text-foreground">
              {productsMissingSlug} product
              {productsMissingSlug === 1 ? " is" : "s are"} hidden from the
              storefront
            </p>
            <p className="mt-1 text-muted-foreground">
              Non-archived products need a valid URL slug to appear publicly.
              Dashboard catalog still shows them; shoppers will not see them
              until fixed.
            </p>
            {productsHidden.length > 0 ? (
              <ul className="mt-2 list-inside list-disc text-muted-foreground">
                {productsHidden.slice(0, 8).map((product) => (
                  <li key={product.id} className="truncate">
                    {product.name}
                  </li>
                ))}
                {productsHidden.length > 8 ? (
                  <li>and {productsHidden.length - 8} more…</li>
                ) : null}
              </ul>
            ) : null}
            <Link
              href={`/store/${store.id}/products`}
              className="mt-2 inline-block font-medium text-foreground underline-offset-4 hover:underline"
            >
              Fix product slugs →
            </Link>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {status === "DRAFT" ? (
            <Button
              size="sm"
              disabled={!!acting}
              onClick={() => runAction("publish")}
            >
              {acting === "publish" ? "Publishing…" : "Go live"}
            </Button>
          ) : null}
          {status === "PUBLISHED" ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={!!acting}
              onClick={() => runAction("unpublish")}
            >
              {acting === "unpublish" ? "Updating…" : "Take store offline"}
            </Button>
          ) : null}
          {status === "ARCHIVED" ? (
            <Button
              size="sm"
              disabled={!!acting}
              onClick={() => runAction("restore")}
            >
              {acting === "restore" ? "Restoring…" : "Restore store"}
            </Button>
          ) : null}
          {status !== "ARCHIVED" ? (
            <Button
              size="sm"
              variant="outline"
              disabled={!!acting}
              onClick={() => runAction("archive")}
            >
              {acting === "archive" ? "Archiving…" : "Archive store"}
            </Button>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 md:p-6">
        <h2 className="font-display text-lg font-medium tracking-tight">
          Store identity
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Name, contact details, and public URL slug.
          {slugLocked
            ? " Public URL is locked while the store is live."
            : null}
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSaveIdentity)}
            className="mt-5 grid gap-4 sm:grid-cols-2"
          >
            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Store name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="storeSlug"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Public URL slug</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={slugLocked} readOnly={!slugLocked} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value)
                        const country = countries.find((c) => c.isoCode === value)
                        form.setValue("storeCountry", country?.name ?? "")
                        form.setValue("storeCity", "")
                      }}
                      options={countryOptions}
                      placeholder="Select country"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="storeCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={cityOptions}
                      placeholder="Select city"
                      disabled={!countryCode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="storePhoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone {dialCode ? `(+${dialCode})` : ""}</FormLabel>
                  <FormControl>
                    <Input {...field} inputMode="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="storeAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Store currency</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={currencyOptions()}
                      placeholder="Select currency"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save details"}
              </Button>
            </div>
          </form>
        </Form>
      </section>
    </div>
  )
}
