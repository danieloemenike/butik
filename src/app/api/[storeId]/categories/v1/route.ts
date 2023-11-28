
import prismadb from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";



export async function POST(req: Request,
    { params }: { params: { storeId: string} }) {
    try {
        const { getUser, isAuthenticated } = getKindeServerSession()
    
        const userInfo = await getUser()
            const userId = userInfo?.id
     
            const isAuth = await isAuthenticated()
       
        if (!isAuth) {
            return new NextResponse("unauthorized", {status: 401})
        }

      const body = await req.json();
  
      const { name, billboardId } = body;

       
        if (!userId) {
            return new NextResponse("UnAuthorized", {status: 403})
        }
        if (!params.storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }

    if (!name) {
        return new NextResponse("Category Name is required", { status: 400 });
      }

      if (!billboardId) {
        return new NextResponse("Billboard ID is required", { status: 400 });
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

        const categoryCreated = await prismadb.category.create({
            data: {
                name,
               
                
            }
        })

        console.log(`category has been created: ${categoryCreated}`)
        return NextResponse.json(categoryCreated)

    } catch (error) {
        console.log('[CATEGORY_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
    
}


export async function GET(req:Request,{ params }: { params: { storeId: string } } ) {
    try {
        const { getUser, isAuthenticated } = getKindeServerSession()
    
        const userInfo = await getUser()
            const userId = userInfo?.id
     
            const isAuth = await isAuthenticated()
       
        if (!isAuth) {
            return new NextResponse("unauthorized", {status: 401})
        }
        if (!userId) {
            return new NextResponse("UnAuthorized", {status: 403})
        }

        const signUpUrl = new URL('/register-business',req.url)
        if (!params.storeId) {
            return NextResponse.redirect(signUpUrl)
        }
        const categories = await prismadb.category.findMany({
             orderBy: {
                createdAt: 'desc'
              }
        })
        return NextResponse.json(categories);
    } catch (error) {
        console.log("CATEGORIES_GET",error)
        return NextResponse.json({error:"Internal Server Error"}, {status: 500})
    }
}