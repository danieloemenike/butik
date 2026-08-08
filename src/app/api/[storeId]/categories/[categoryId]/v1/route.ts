import prismadb from "@/lib/prismadb"
import { requireOwnedStoreById } from "@/lib/store-access"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  {
    params: rawParams,
  }: { params: Promise<{ categoryId: string; storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    if (!params.categoryId) {
      return new NextResponse("Category id is required", { status: 400 })
    }

    const category = await prismadb.category.findFirst({
      where: {
        id: params.categoryId,
      },
    })
    if (!category) {
      return new NextResponse("Category Not found", { status: 404 })
    }
    return NextResponse.json(category)
  } catch (error) {
    console.log("[CATEGORY_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  {
    params: rawParams,
  }: { params: Promise<{ categoryId: string; storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    if (!params.categoryId) {
      return new NextResponse("Category id is required", { status: 400 })
    }

    const category = await prismadb.category.delete({
      where: {
        id: params.categoryId,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.log("[CATEGORY_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  {
    params: rawParams,
  }: { params: Promise<{ categoryId: string; storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    const body = await req.json()
    const { name } = body

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!params.categoryId) {
      return new NextResponse("Category id is required", { status: 400 })
    }

    const category = await prismadb.category.update({
      where: {
        id: params.categoryId,
      },
      data: {
        name,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.log("[CATEGORY_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
