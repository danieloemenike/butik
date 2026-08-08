import prismadb from "@/lib/prismadb"
import { requireOwnedStoreForBusiness, jsonError } from "@/lib/store-access"
import {
  assessPublishReadiness,
  canTransition,
  nextStatusForAction,
  type PublicationAction,
} from "@/lib/store-publication"
import { NextResponse } from "next/server"

type RouteParams = {
  params: Promise<{ businessId: string; storeId: string }>
}

const ACTIONS = new Set<PublicationAction>([
  "publish",
  "unpublish",
  "archive",
  "restore",
])

export async function POST(request: Request, { params: rawParams }: RouteParams) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreForBusiness(
      params.businessId,
      params.storeId
    )
    if (auth.error) return auth.error

    const body = await request.json()
    const action = body?.action as PublicationAction

    if (!ACTIONS.has(action)) {
      return jsonError(
        "Invalid action. Use publish, unpublish, archive, or restore.",
        400,
        "action"
      )
    }

    if (!canTransition(auth.store.status, action)) {
      return jsonError(
        `Cannot ${action} a store that is currently ${auth.store.status.toLowerCase()}.`,
        400,
        "action"
      )
    }

    let warnings:
      | {
          productsMissingSlug: number
          productsHidden: Array<{ id: string; name: string }>
        }
      | undefined

    if (action === "publish") {
      const readiness = await assessPublishReadiness(auth.store)
      if (!readiness.ok) {
        return NextResponse.json(
          {
            message: readiness.errors[0]?.message ?? "Store is not ready to publish.",
            field: readiness.errors[0]?.field,
            errors: readiness.errors,
            warnings: readiness.warnings,
          },
          { status: 400 }
        )
      }
      warnings = readiness.warnings
    }

    const nextStatus = nextStatusForAction(action)
    const data: {
      status: typeof nextStatus
      publishedAt?: Date
    } = { status: nextStatus }

    if (action === "publish" && !auth.store.publishedAt) {
      data.publishedAt = new Date()
    }

    const store = await prismadb.store.update({
      where: { id: auth.store.id },
      data,
      select: {
        id: true,
        name: true,
        storeSlug: true,
        status: true,
        publishedAt: true,
      },
    })

    return NextResponse.json({
      store,
      warnings: warnings
        ? {
            productsMissingSlug: warnings.productsMissingSlug,
            productsHidden: warnings.productsHidden,
          }
        : undefined,
    })
  } catch (error) {
    console.log("[STORE_PUBLICATION_POST]", error)
    return jsonError("Something went wrong while updating store status.", 500)
  }
}
