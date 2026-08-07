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
} from "@/lib/store-form"
import { cn } from "@/lib/utils"

export type BusinessDetails = {
  id: string
  name: string
  phoneNumber: string | null
  address: string
  city: string
  country: string
}

const formSchema = z
  .object({
    businessName: z
      .string()
      .min(2, { message: "Business name must be at least 2 characters" })
      .max(60, { message: "Business name cannot be more than 60 characters" }),
    businessPhoneNumber: z.string().min(1, { message: "Enter a phone number" }),
    businessAddress: z
      .string()
      .min(3, { message: "Address must be at least 3 characters" })
      .max(80, { message: "Address cannot be more than 80 characters" }),
    businessCity: z.string().min(1, { message: "Please select a city" }),
    businessCountry: z.string().min(1, { message: "Please select a country" }),
    countryCode: z
      .string()
      .min(2, { message: "Please select a country" })
      .max(2),
  })
  .superRefine((values, ctx) => {
    if (!values.businessCity.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["businessCity"],
        message: "Please select a city",
      })
    }
    if (!values.businessCountry.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["businessCountry"],
        message: "Please select a country",
      })
    }

    const national = sanitizeNationalNumber(values.businessPhoneNumber)
    if (national.length < 6 || national.length > 15) {
      ctx.addIssue({
        code: "custom",
        path: ["businessPhoneNumber"],
        message: "Enter a valid local phone number without country code",
      })
      return
    }

    if (!isValidStorePhone(values.countryCode, values.businessPhoneNumber)) {
      ctx.addIssue({
        code: "custom",
        path: ["businessPhoneNumber"],
        message: "Phone number is not valid for the selected country",
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

type ApiErrorBody = {
  message?: string
  field?: string
}

type EditBusinessModalProps = Readonly<{
  open: boolean
  onClose: () => void
  business: BusinessDetails
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

const countries = Country.getAllCountries()

export function EditBusinessModal({
  open,
  onClose,
  business,
}: EditBusinessModalProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const initialCountryCode = resolveCountryCode(business.country)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: business.name,
      businessPhoneNumber: nationalFromStoredPhone(
        business.phoneNumber,
        initialCountryCode
      ),
      businessAddress: business.address,
      businessCity: business.city,
      businessCountry: business.country,
      countryCode: initialCountryCode,
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

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
      if (seen.has(city.name)) return []
      seen.add(city.name)
      return [
        {
          value: city.name,
          label: city.name,
          keywords: city.stateCode,
          meta: city.stateCode || undefined,
        },
      ]
    })
  }, [countryCode])

  useEffect(() => {
    if (!open) {
      setLoading(false)
      return
    }

    const code = resolveCountryCode(business.country)
    form.reset({
      businessName: business.name,
      businessPhoneNumber: nationalFromStoredPhone(business.phoneNumber, code),
      businessAddress: business.address,
      businessCity: business.city,
      businessCountry: business.country,
      countryCode: code,
    })
  }, [open, business, form])

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true)
      const payload = {
        businessName: values.businessName.trim(),
        businessPhoneNumber: buildInternationalPhone(
          values.countryCode,
          values.businessPhoneNumber
        ),
        businessAddress: values.businessAddress.trim(),
        businessCity: values.businessCity.trim(),
        businessCountry: values.businessCountry.trim(),
      }

      await axios.patch(`/api/business/${business.id}/v1`, payload)

      toast({
        title: "Business updated",
        description: "Your business details have been saved.",
      })
      onClose()
      router.refresh()
    } catch (error) {
      const { message, field } = getErrorPayload(error)
      const description =
        message || "There was a problem saving your business details."

      if (
        field &&
        [
          "businessName",
          "businessPhoneNumber",
          "businessAddress",
          "businessCity",
          "businessCountry",
        ].includes(field)
      ) {
        form.setError(field as keyof FormValues, { message: description })
      }

      toast({
        variant: "destructive",
        title: "Couldn't update business",
        description,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppModal
      open={open}
      onClose={() => {
        if (!loading) onClose()
      }}
      title="Edit business"
      description="Update your business name, contact, and location."
      size="xl"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 [&_input]:autofill:shadow-[inset_0_0_0_1000px_hsl(var(--background))]"
        >
          <div className="space-y-4">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Profile
            </p>
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your business name"
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
                        form.setValue("businessCountry", country?.name ?? "", {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                        form.setValue("businessCity", "", {
                          shouldDirty: true,
                          shouldValidate: false,
                        })
                        form.clearErrors("businessCity")
                        form.clearErrors("businessPhoneNumber")
                        field.onBlur()
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessCity"
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
                        form.setValue("businessCity", city, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                        form.clearErrors("businessCity")
                        field.onBlur()
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessAddress"
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
              name="businessPhoneNumber"
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
                          field.onChange(
                            event.target.value.replace(/[^\d\s()-]/g, "")
                          )
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
              {loading ? (
                <>
                  <CircleDotDashed className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </AppModal>
  )
}
