"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useRouter } from "next/navigation"
import { City, Country } from "country-state-city"
import { CircleDotDashed } from "lucide-react"
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
import { AppModal } from "@/components/AppModal"
import { SearchableSelect } from "@/components/SearchableSelect"
import {
  buildInternationalPhone,
  getDialCode,
  isValidStorePhone,
  sanitizeNationalNumber,
  slugifyStoreName,
} from "@/lib/store-form"
import { cn } from "@/lib/utils"
import { storeApi } from "@/reduxStore/services/storeApiSlice"
import { useDispatch } from "react-redux"

const formSchema = z
  .object({
    storeName: z
      .string()
      .min(3, { message: "Store name must be at least 3 characters" })
      .max(30, { message: "Store name cannot be more than 30 characters" })
      .regex(/^[a-zA-Z0-9][a-zA-Z0-9\s_-]*$/, {
        message: "Use letters, numbers, spaces, hyphens, or underscores",
      }),
    storeSlug: z.string().min(1, { message: "Store slug is required" }),
    storePhoneNumber: z.string().min(1, {
      message: "Enter a phone number",
    }),
    storeAddress: z
      .string()
      .min(3, { message: "Address must be at least 3 characters" })
      .max(80, { message: "Address cannot be more than 80 characters" }),
    storeCity: z.string().min(1, { message: "Please select a city" }),
    storeCountry: z.string().min(1, { message: "Please select a country" }),
    countryCode: z
      .string()
      .min(2, { message: "Please select a country" })
      .max(2),
  })
  .superRefine((values, ctx) => {
    const name = values.storeName.trim()
    const slug = slugifyStoreName(name)
    if (!slug) {
      ctx.addIssue({
        code: "custom",
        path: ["storeName"],
        message: "Store name must produce a valid slug",
      })
    }

    if (!values.storeCity.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["storeCity"],
        message: "Please select a city",
      })
    }

    if (!values.storeCountry.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["storeCountry"],
        message: "Please select a country",
      })
    }

    const national = sanitizeNationalNumber(values.storePhoneNumber)
    if (national.length < 6 || national.length > 15) {
      ctx.addIssue({
        code: "custom",
        path: ["storePhoneNumber"],
        message: "Enter a valid local phone number without country code",
      })
      return
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

type ApiErrorBody = {
  message?: string
  field?: string
}

export type StoreDetails = {
  id: string
  name: string
  phoneNumber: string | null
  address: string | null
  city: string | null
  country: string | null
  storeSlug?: string | null
}

type CreateStoreModalProps = Readonly<{
  open: boolean
  onClose: () => void
  businessId: string
  /** When set, modal opens in edit mode with these values pre-filled. */
  store?: StoreDetails | null
}>

function getErrorPayload(error: unknown): ApiErrorBody {
  if (!axios.isAxiosError(error)) return {}
  const data = error.response?.data
  if (typeof data === "string") return { message: data }
  if (data && typeof data === "object") return data as ApiErrorBody
  return {}
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

function emptyDefaults(): FormValues {
  return {
    storeName: "",
    storePhoneNumber: "",
    storeAddress: "",
    storeCity: "",
    storeCountry: "",
    countryCode: "",
    storeSlug: "",
  }
}

function defaultsFromStore(store: StoreDetails): FormValues {
  const countryCode = resolveCountryCode(store.country ?? "")
  return {
    storeName: store.name,
    storePhoneNumber: nationalFromStoredPhone(store.phoneNumber, countryCode),
    storeAddress: store.address ?? "",
    storeCity: store.city ?? "",
    storeCountry: store.country ?? "",
    countryCode,
    storeSlug: store.storeSlug || slugifyStoreName(store.name),
  }
}

const countries = Country.getAllCountries()

export function CreateStoreModal({
  open,
  onClose,
  businessId,
  store = null,
}: CreateStoreModalProps) {
  const { toast } = useToast()
  const router = useRouter()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const isEditing = Boolean(store?.id)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyDefaults(),
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const storeName = useWatch({ control: form.control, name: "storeName" })
  const countryCode = useWatch({ control: form.control, name: "countryCode" })
  const dialCode = getDialCode(countryCode)

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
    return cities.flatMap((city) => {
      const value = city.name
      if (seen.has(value)) return []
      seen.add(value)
      return [
        {
          value,
          label: city.name,
          keywords: city.stateCode,
          meta: city.stateCode || undefined,
        },
      ]
    })
  }, [countryCode])

  useEffect(() => {
    if (!open) {
      form.reset(emptyDefaults())
      setLoading(false)
      return
    }

    form.reset(store ? defaultsFromStore(store) : emptyDefaults())
  }, [open, store, form])

  useEffect(() => {
    if (!open) return
    form.setValue("storeSlug", slugifyStoreName(storeName), {
      shouldValidate: false,
    })
  }, [storeName, form, open])

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true)
      const internationalPhone = buildInternationalPhone(
        values.countryCode,
        values.storePhoneNumber
      )
      const payload = {
        storeName: values.storeName.trim(),
        storeSlug: slugifyStoreName(values.storeName),
        storePhoneNumber: internationalPhone,
        storeAddress: values.storeAddress.trim(),
        storeCity: values.storeCity.trim(),
        storeCountry: values.storeCountry.trim(),
      }

      if (isEditing && store) {
        await axios.patch(
          `/api/business/${businessId}/stores/${store.id}/v1`,
          payload
        )
        dispatch(storeApi.util.invalidateTags(["Post"]))
        toast({
          title: "Store updated",
          description: "Your store details have been saved.",
        })
        onClose()
        router.refresh()
        return
      }

      const response = await axios.post(
        `/api/business/${businessId}/stores/v1`,
        payload
      )

      toast({
        title: "Store created",
        description: "Your storefront is ready.",
      })
      onClose()
      router.push(`/store/${response.data.id}/dashboard`)
      router.refresh()
    } catch (error) {
      const { message, field } = getErrorPayload(error)
      const description =
        message || "There was a problem with your request. Please try again."

      if (
        field &&
        [
          "storeName",
          "storeSlug",
          "storePhoneNumber",
          "storeAddress",
          "storeCity",
          "storeCountry",
        ].includes(field)
      ) {
        form.setError(field as keyof FormValues, { message: description })
      }

      toast({
        variant: "destructive",
        title: isEditing ? "Couldn't update store" : "Couldn't create store",
        description,
      })
    } finally {
      setLoading(false)
    }
  }

  let submitLabel = "Create store"
  if (loading && isEditing) submitLabel = "Saving…"
  else if (loading) submitLabel = "Creating…"
  else if (isEditing) submitLabel = "Save changes"

  return (
    <AppModal
      open={open}
      onClose={() => {
        if (!loading) onClose()
      }}
      title={isEditing ? "Edit store" : "Create store"}
      description={
        isEditing
          ? "Update name, contact, and location for this storefront."
          : "Name, contact, and location for your new storefront."
      }
      size="xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 [&_input]:autofill:shadow-[inset_0_0_0_1000px_hsl(var(--background))]">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Identity
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Northside Boutique"
                        disabled={loading}
                        className="h-11 rounded-lg focus-visible:ring-foreground/15 focus-visible:ring-offset-0"
                        {...field}
                        onChange={(event) => {
                          field.onChange(event)
                          form.clearErrors("storeSlug")
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storeSlug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <div className="flex h-11 items-center rounded-lg border border-border bg-secondary/40 px-3 text-sm">
                        <span className="text-muted-foreground">@</span>
                        <span className="truncate font-medium text-foreground">
                          {field.value || "store_slug"}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-5">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Location
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <SearchableSelect
                      value={field.value}
                      disabled={loading}
                      placeholder="Select country"
                      searchPlaceholder="Search country…"
                      emptyText="No country found."
                      options={countryOptions}
                      onChange={(isoCode) => {
                        const country = Country.getCountryByCode(isoCode)
                        form.setValue("countryCode", isoCode, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                        form.setValue("storeCountry", country?.name ?? "", {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                        form.setValue("storeCity", "", {
                          shouldDirty: true,
                          shouldTouch: false,
                          shouldValidate: false,
                        })
                        form.clearErrors("storeCity")
                        form.clearErrors("storePhoneNumber")
                        field.onBlur()
                      }}
                    />
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
                    <SearchableSelect
                      value={field.value}
                      disabled={loading || !countryCode}
                      placeholder={
                        countryCode
                          ? "Select city"
                          : "Select a country first"
                      }
                      searchPlaceholder="Search city…"
                      emptyText="No city found."
                      options={cityOptions}
                      onChange={(city) => {
                        form.setValue("storeCity", city, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                        form.clearErrors("storeCity")
                        field.onBlur()
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storeAddress"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Street, building, area"
                        disabled={loading}
                        className="h-11 rounded-lg focus-visible:ring-foreground/15 focus-visible:ring-offset-0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-5">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Contact
            </p>
            <FormField
              control={form.control}
              name="storePhoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "flex h-11 overflow-hidden rounded-lg border border-border bg-background",
                        "focus-within:ring-2 focus-within:ring-foreground/15"
                      )}
                    >
                      <div className="flex shrink-0 items-center border-r border-border bg-secondary/50 px-3 text-sm font-medium text-foreground">
                        {dialCode ? `+${dialCode}` : "+—"}
                      </div>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder={
                          countryCode
                            ? "8012345678"
                            : "Select a country first"
                        }
                        disabled={loading || !countryCode}
                        className="h-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        {...field}
                        onChange={(event) => {
                          const next = event.target.value.replace(/[^\d\s()-]/g, "")
                          field.onChange(next)
                        }}
                        onBlur={(event) => {
                          field.onChange(
                            sanitizeNationalNumber(event.target.value)
                          )
                          field.onBlur()
                        }}
                      />
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Enter the local number. Leading zeros are removed
                    automatically.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={onClose}
              className="font-semibold"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="font-semibold">
              {loading && (
                <CircleDotDashed className="mr-2 h-4 w-4 animate-spin" />
              )}
              {submitLabel}
            </Button>
          </div>
        </form>
      </Form>
    </AppModal>
  )
}
