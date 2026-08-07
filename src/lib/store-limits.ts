const DEFAULT_MAX_STORES = 10

export function getMaxStores(): number {
  const raw =
    process.env.NEXT_PUBLIC_MAX_STORES ?? process.env.MAX_STORES ?? ""
  const parsed = Number.parseInt(raw, 10)

  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed
  }

  return DEFAULT_MAX_STORES
}

export const MAX_STORES = getMaxStores()
