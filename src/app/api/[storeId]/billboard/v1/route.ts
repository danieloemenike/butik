
import prismadb from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";



export async function POST(req: Request,
    { params }: { params: { storeId: string } }) {
    try {
        const { getUser, isAuthenticated } = getKindeServerSession()
    
        const userInfo = await getUser()
            const userId = userInfo?.id
          
            const isAuth = await isAuthenticated()

      const body = await req.json();
  
      const { label, imageUrl } = body;

        if (!isAuth) {
            return new NextResponse("unauthorized", {status: 401})
        }
        if (!userId) {
            return new NextResponse("UnAuthorized", {status: 403})
        }
        if (!params.storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }

    if (!label) {
        return new NextResponse("Label is required", { status: 400 });
      }
  
      if (!imageUrl) {
        return new NextResponse("Image URL is required", { status: 400 });
      }
  
        //To validate that the user owns a store
        const storeOwned = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        });

        if (!storeOwned) {
            return new NextResponse("Unauthorized", { status: 405 });
        }

        const billboardCreated = await prismadb.billboard.create({
            data: {
                label,
                imageUrl,
                storeId: params.storeId
            }
        })

        console.log(`billboard has been created: ${billboardCreated}`)
        return NextResponse.json(billboardCreated)

    } catch (error) {
        console.log('[BILLBOARDS_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
    
}


export async function GET(req:Request,{ params }: { params: { storeId: string } } ) {
    try {
       


        if (!params.storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }
        const billboards = await prismadb.billboard.findMany({
            where: {
                storeId: params.storeId
            }, orderBy: {
                createdAt: 'desc'
              }
        })
        if (!billboards) {
            return new NextResponse("Not found", {status: 404})
        }
        return NextResponse.json(billboards);
    } catch (error) {
        console.log("BILLBOARDS_GET",error)
        return NextResponse.json({error:"Internal Server Error"}, {status: 500})
    }
}