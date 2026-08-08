import prismadb from "@/lib/prismadb"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import type { Store } from "@prisma/client"

export function jsonError(message: string, status: number, field?: string) {
  return NextResponse.json(field ? { message, field } : { message }, { status })
}

type OwnerStoreResult =
  | { store: Store; userId: string; error?: never }
  | { store?: never; userId?: never; error: NextResponse }

/**
 * Require an authenticated Kinde user who owns the store identified by storeId.
 * Used by all /api/[storeId]/... dashboard routes.
 */
export async function requireOwnedStoreById(
  storeId: string | undefined
): Promise<OwnerStoreResult> {
  const { getUser, isAuthenticated } = getKindeServerSession()
  const userInfo = await getUser()
  const userId = userInfo?.id
  const isAuth = await isAuthenticated()

  if (!isAuth || !userId) {
    return { error: jsonError("Unauthorized.", 401) }
  }

  if (!storeId) {
    return { error: jsonError("Store id is required.", 400, "storeId") }
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  })

  if (!store) {
    return { error: jsonError("Store not found.", 404) }
  }

  return { store, userId }
}

/**
 * Require ownership of a store under a specific business.
 */
export async function requireOwnedStoreForBusiness(
  businessId: string | undefined,
  storeId: string | undefined
): Promise<OwnerStoreResult> {
  const { getUser, isAuthenticated } = getKindeServerSession()
  const userInfo = await getUser()
  const userId = userInfo?.id
  const isAuth = await isAuthenticated()

  if (!isAuth || !userId) {
    return { error: jsonError("Unauthorized.", 401) }
  }

  if (!businessId) {
    return { error: jsonError("Business ID is required.", 400, "businessId") }
  }

  if (!storeId) {
    return { error: jsonError("Store ID is required.", 400, "storeId") }
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      userId,
      businessId,
    },
  })

  if (!store) {
    return { error: jsonError("Store not found.", 404) }
  }

  return { store, userId }
}

export async function getSessionUserId(): Promise<string | null> {
  const { getUser, isAuthenticated } = getKindeServerSession()
  const isAuth = await isAuthenticated()
  if (!isAuth) return null
  const userInfo = await getUser()
  return userInfo?.id ?? null
}

export async function findOwnedStoreBySlug(
  storeSlug: string,
  userId: string
) {
  return prismadb.store.findFirst({
    where: {
      storeSlug,
      userId,
    },
  })
}
