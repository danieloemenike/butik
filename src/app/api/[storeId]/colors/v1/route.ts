import prismadb from "@/lib/prismadb"
import { requireOwnedStoreById } from "@/lib/store-access"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params: rawParams }: { params: Promise<{ storeId: string }> }
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

    const color = await prismadb.color.create({
      data: {
        name,
        value,
        storeId: auth.store.id,
      },
    })

    return NextResponse.json(color)
  } catch (error) {
    console.log("[COLORS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(
  _req: Request,
  { params: rawParams }: { params: Promise<{ storeId: string }> }
) {
  try {
    const params = await rawParams
    const auth = await requireOwnedStoreById(params.storeId)
    if (auth.error) return auth.error

    const colors = await prismadb.color.findMany({
      where: {
        OR: [{ storeId: auth.store.id }, { storeId: null }],
      },
    })

    return NextResponse.json(colors)
  } catch (error) {
    console.log("[COLORS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
