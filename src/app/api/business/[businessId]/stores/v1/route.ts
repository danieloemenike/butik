import prismadb from "@/lib/prismadb";
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";
import {  NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { businessId: string } }) {
    try {
    const { getUser, isAuthenticated } = getKindeServerSession()
    
    const userInfo = await getUser()
    const userId = userInfo?.id
  
    const isAuth = await isAuthenticated()
        const body = await request.json()
        const { storeName, storePhoneNumber, storeAddress, storeCity, storeCountry, storeSlug } = body
        
        if (!isAuth) {
            return new NextResponse("unauthorized", {status: 401})
        }

        if (!userId) {
            return new NextResponse("UnAuthorized", {status: 403})
        }
        if (!storeName) {
            return new NextResponse("Store Name is Required!", {status: 400})
        }
        if (!params.businessId) {
            return new NextResponse("Business Id is required", { status: 400 });
          }
        const store = await prismadb.store.create({
            data: {
                userId,
                storeSlug,
                businessId: params.businessId,
                name: storeName,
                phoneNumber: storePhoneNumber,
                address: storeAddress,
                city: storeCity,
                country : storeCountry
            },
            select: {
                id:true
            }
        })
        
        return NextResponse.json(store)
    } catch (error) {
        console.log('[store_CREATION', error);
        return new NextResponse("Internal error", {status: 501})
    }
    


}



export async function GET(
    req: Request,
    { params }: { params: { businessId: string } }) {
   
    const {businessId} = params
    try {
      

        if (!businessId) {
            return new NextResponse("Business ID is required", { status: 400 })
        }

        const stores = await prismadb.store.findMany({
            where: {
                businessId
            },
            
            orderBy: {
                createdAt: 'desc'
              }
        })


        return NextResponse.json(stores)
    
        
        
    } catch (error) {
        console.log('[STORES_GET] : ', error);
        return new NextResponse("Internal error", { status: 500 });
      }
}


export async function DELETE(req: Request, { params }: { params: { storeId: string, businessId: string } }) {
    try {
        const {getUser, isAuthenticated } = getKindeServerSession();
        const userInfo = await getUser()
    const userId = userInfo?.id
  
    const isAuth = await isAuthenticated()
  
      if (!userId || !isAuth) {
        return new NextResponse("Unauthenticated", { status: 403 });
      }
      
      if (!params.businessId) {
        return new NextResponse("Business id is required", { status: 400 });
        }
        
        if (!params.storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }
        
        const StoreByUser =  await prismadb.store.findFirst({
            where: {
              id: params.storeId,
                userId,
              businessId:params.businessId
            }
        });          
        return NextResponse.json(StoreByUser)
  
    } catch (error) {
        console.log('[Store_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
      }
}