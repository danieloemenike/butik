import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatMoney } from "@/lib/currency"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
})

/** Format money for a specific ISO currency (admin tables, orders). */
export function formatStoreMoney(
  amount: number | string,
  currencyCode = "NGN"
) {
  return formatMoney(amount, currencyCode)
}
