import prismadb from "@/lib/prismadb"
import { requireOwnedStoreById } from "@/lib/store-access"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  {
    params: rawParams,
  }: { params: Promise<{ colorId: string; storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    if (!params.colorId) {
      return new NextResponse("color id is required", { status: 400 })
    }

    const color = await prismadb.color.findUnique({
      where: {
        id: params.colorId,
      },
    })

    return NextResponse.json(color)
  } catch (error) {
    console.log("[COLOR_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  {
    params: rawParams,
  }: { params: Promise<{ colorId: string; storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    if (!params.colorId) {
      return new NextResponse("color id is required", { status: 400 })
    }

    const color = await prismadb.color.delete({
      where: {
        id: params.colorId,
      },
    })

    return NextResponse.json(color)
  } catch (error) {
    console.log("[COLOR_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  {
    params: rawParams,
  }: { params: Promise<{ colorId: string; storeId: string }> }
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

    if (!params.colorId) {
      return new NextResponse("color id is required", { status: 400 })
    }

    const color = await prismadb.color.update({
      where: {
        id: params.colorId,
      },
      data: {
        name,
        value,
      },
    })

    return NextResponse.json(color)
  } catch (error) {
    console.log("[COLOR_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
