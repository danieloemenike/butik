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

    const size = await prismadb.size.create({
      data: {
        name,
        value,
        storeId: auth.store.id,
      },
    })

    return NextResponse.json(size)
  } catch (error) {
    console.log("[SIZES_POST]", error)
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

    const sizes = await prismadb.size.findMany({
      where: {
        OR: [{ storeId: auth.store.id }, { storeId: null }],
      },
    })

    return NextResponse.json(sizes)
  } catch (error) {
    console.log("[SIZES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
