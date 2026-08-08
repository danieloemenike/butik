"use client"

import { useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { City, Country } from "country-state-city"
import { CircleDotDashed } from "lucide-react"
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
import { SearchableSelect } from "@/components/SearchableSelect"
import {
  buildInternationalPhone,
  getDialCode,
  isValidStorePhone,
  sanitizeNationalNumber,
} from "@/lib/store-form"
import { cn } from "@/lib/utils"
import { useAddBusinessMutation } from "@/reduxStore/services/businessApiSlice"

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

const countries = Country.getAllCountries()

export default function BusinessForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [addBusiness] = useAddBusinessMutation()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      businessPhoneNumber: "",
      businessAddress: "",
      businessCity: "",
      businessCountry: "",
      countryCode: "",
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

      const response = await addBusiness({ data: payload }).unwrap()
      if (!response) return

      toast({
        title: "Business created",
        description: "Your business profile is ready.",
      })
      router.push(`/business/${response.id}`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Couldn't create business",
        description: "There was a problem with your request. Please try again.",
      })
      console.error("Business creation failed", error)
    } finally {
      setLoading(false)
    }
  }

  return (
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
                      countryCode ? "Select city" : "Select a country first"
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
                <p className="text-xs text-muted-foreground">
                  Enter the local number. Leading zeros are removed
                  automatically.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="border-t border-border pt-5">
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full font-semibold sm:w-auto"
          >
            {loading ? (
              <>
                <CircleDotDashed className="mr-2 h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create business"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
