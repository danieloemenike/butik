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
    const { label, imageUrl } = body

    if (!label) {
      return new NextResponse("Label is required", { status: 400 })
    }

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 })
    }

    const billboardCreated = await prismadb.billboard.create({
      data: {
        label,
        imageUrl,
        storeId: auth.store.id,
      },
    })

    return NextResponse.json(billboardCreated)
  } catch (error) {
    console.log("[BILLBOARDS_POST]", error)
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

    const billboards = await prismadb.billboard.findMany({
      where: {
        storeId: auth.store.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(billboards)
  } catch (error) {
    console.log("BILLBOARDS_GET", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
