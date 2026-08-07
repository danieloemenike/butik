import { Country } from "country-state-city"
import isMobilePhone from "validator/lib/isMobilePhone"

export function slugifyStoreName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
}

export function getDialCode(countryCode: string) {
  const country = Country.getCountryByCode(countryCode)
  if (!country?.phonecode) return ""
  return country.phonecode.replace(/^\+/, "").trim()
}

/** Digits only, strip leading zeros used as trunk prefixes. */
export function sanitizeNationalNumber(value: string) {
  return value.replace(/\D/g, "").replace(/^0+/, "")
}

export function buildInternationalPhone(
  countryCode: string,
  nationalNumber: string
) {
  const dial = getDialCode(countryCode)
  const national = sanitizeNationalNumber(nationalNumber)
  if (!dial || !national) return ""
  return `+${dial}${national}`
}

export function isValidStorePhone(countryCode: string, nationalNumber: string) {
  const international = buildInternationalPhone(countryCode, nationalNumber)
  if (!international) return false
  return isMobilePhone(international, "any", { strictMode: false })
}
