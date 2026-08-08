import prismadb from "@/lib/prismadb"
import { requireOwnedStoreById } from "@/lib/store-access"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  {
    params: rawParams,
  }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 })
    }

    const billboard = await prismadb.billboard.findFirst({
      where: {
        id: params.billboardId,
        storeId: auth.store.id,
      },
      select: {
        id: true,
        label: true,
        imageUrl: true,
      },
    })

    if (!billboard) {
      return new NextResponse("Billboard Not found", { status: 404 })
    }

    return NextResponse.json(billboard)
  } catch (error) {
    console.log(`[GET_BILLBOARD_BY_ID] ${error}`)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  {
    params: rawParams,
  }: { params: Promise<{ billboardId: string; storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 })
    }

    const billboard = await prismadb.billboard.delete({
      where: {
        id: params.billboardId,
        storeId: auth.store.id,
      },
    })

    return NextResponse.json(billboard)
  } catch (error) {
    console.log("[BILLBOARD_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  {
    params: rawParams,
  }: { params: Promise<{ billboardId: string; storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    const body = await req.json()
    const { label, imageUrl } = body

    if (!label) {
      return new NextResponse("Label is required", { status: 400 })
    }

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 })
    }

    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 })
    }

    const billboard = await prismadb.billboard.update({
      where: {
        id: params.billboardId,
        storeId: auth.store.id,
      },
      data: {
        label,
        imageUrl,
      },
    })

    return NextResponse.json(billboard)
  } catch (error) {
    console.log("[BILLBOARD_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
