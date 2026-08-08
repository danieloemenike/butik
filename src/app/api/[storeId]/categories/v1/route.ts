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
    const { name } = body

    if (!name) {
      return new NextResponse("Category Name is required", { status: 400 })
    }

    const categoryCreated = await prismadb.category.create({
      data: {
        name,
      },
    })

    return NextResponse.json(categoryCreated)
  } catch (error) {
    console.log("[CATEGORY_POST]", error)
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

    const categories = await prismadb.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.log("CATEGORIES_GET", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
