import prismadb from "@/lib/prismadb"
import { requireOwnedStoreById } from "@/lib/store-access"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  {
    params: rawParams,
  }: { params: Promise<{ sizeId: string; storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    if (!params.sizeId) {
      return new NextResponse("Size id is required", { status: 400 })
    }

    const size = await prismadb.size.findUnique({
      where: {
        id: params.sizeId,
      },
    })

    return NextResponse.json(size)
  } catch (error) {
    console.log("[SIZE_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  {
    params: rawParams,
  }: { params: Promise<{ sizeId: string; storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    if (!params.sizeId) {
      return new NextResponse("Size id is required", { status: 400 })
    }

    const size = await prismadb.size.delete({
      where: {
        id: params.sizeId,
        storeId: auth.store.id,
      },
    })

    return NextResponse.json(size)
  } catch (error) {
    console.log("[SIZE_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  {
    params: rawParams,
  }: { params: Promise<{ sizeId: string; storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    const body = await req.json()
    const { name, value } = body

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 })
    }

    if (!params.sizeId) {
      return new NextResponse("Size id is required", { status: 400 })
    }

    const size = await prismadb.size.update({
      where: {
        id: params.sizeId,
      },
      data: {
        name,
        value,
      },
    })

    return NextResponse.json(size)
  } catch (error) {
    console.log("[SIZE_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
