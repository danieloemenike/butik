import prismadb from "@/lib/prismadb"
import {
  isValidProductSlug,
  isValidStoreSlug,
} from "@/lib/store-identity"
import type { Store, StoreStatus } from "@prisma/client"

export type PublicationAction =
  | "publish"
  | "unpublish"
  | "archive"
  | "restore"

export type PublicationReadiness = {
  ok: boolean
  errors: Array<{ field: string; message: string }>
  warnings: {
    productsMissingSlug: number
    productsHidden: Array<{ id: string; name: string }>
  }
}

const ALLOWED: Record<PublicationAction, StoreStatus[]> = {
  publish: ["DRAFT"],
  unpublish: ["PUBLISHED"],
  archive: ["DRAFT", "PUBLISHED"],
  restore: ["ARCHIVED"],
}

const RESULT_STATUS: Record<PublicationAction, StoreStatus> = {
  publish: "PUBLISHED",
  unpublish: "DRAFT",
  archive: "ARCHIVED",
  restore: "DRAFT",
}

export function canTransition(
  status: StoreStatus,
  action: PublicationAction
): boolean {
  return ALLOWED[action].includes(status)
}

export function nextStatusForAction(action: PublicationAction): StoreStatus {
  return RESULT_STATUS[action]
}

export async function assessPublishReadiness(
  store: Store
): Promise<PublicationReadiness> {
  const errors: Array<{ field: string; message: string }> = []

  const name = store.name?.trim()
  if (!name) {
    errors.push({ field: "storeName", message: "Store name is required." })
  }

  const slug = store.storeSlug?.trim() ?? ""
  if (!slug) {
    errors.push({
      field: "storeSlug",
      message: "A public store URL slug is required before going live.",
    })
  } else if (!isValidStoreSlug(slug)) {
    errors.push({
      field: "storeSlug",
      message:
        "Store slug is invalid or reserved. Use lowercase letters, numbers, and underscores.",
    })
  }

  const candidates = await prismadb.product.findMany({
    where: {
      storeId: store.id,
      isArchived: false,
    },
    select: { id: true, name: true, slug: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  })

  const productsHidden = candidates.filter(
    (p) => !isValidProductSlug(p.slug)
  )

  return {
    ok: errors.length === 0,
    errors,
    warnings: {
      productsMissingSlug: productsHidden.length,
      productsHidden: productsHidden.map((p) => ({
        id: p.id,
        name: p.name,
      })),
    },
  }
}

export function storeStatusLabel(status: StoreStatus): string {
  switch (status) {
    case "PUBLISHED":
      return "Live"
    case "ARCHIVED":
      return "Archived"
    case "DRAFT":
    default:
      return "Not live"
  }
}

export function isPubliclyVisible(status: StoreStatus): boolean {
  return status === "PUBLISHED"
}
