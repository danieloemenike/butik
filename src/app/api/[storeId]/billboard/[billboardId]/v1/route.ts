import prismadb from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { storeId: string, billboardId: string } }) {
    try {
    
        if (!params.billboardId) {
            return new NextResponse("Billboard id is required", { status: 400 });
          }
          if (!params.storeId) {
            return new NextResponse("Store id is required", { status: 400 });
          }
      

   
    const billboardByUserId = await prismadb.billboard.findFirst({
        where: {
          id: params.billboardId,
          storeId: params.storeId,
      },
      select: {
        id: true,
        label: true,
        imageUrl: true
      }
    });
        
        
        if (!billboardByUserId) {
          return new NextResponse("Billboard Not found", {status: 404})
          }

          return NextResponse.json(billboardByUserId);
      
    } catch (error) {
        console.log(`[GET_BILLBOARD_BY_ID] ${error}`)
    }
}


export async function DELETE(
    req: Request,
    { params }: { params: { billboardId: string, storeId: string } }
  ) {
    try {
      const { getUser, isAuthenticated } = getKindeServerSession()
    
      const userInfo = await getUser()
          const userId = userInfo?.id
   
          const isAuth = await isAuthenticated()
     
      if (!isAuth) {
          return new NextResponse("unauthorized", {status: 401})
      }
      if (!userId) {
        return new NextResponse("Unauthenticated", { status: 403 });
      }
  
      if (!params.billboardId) {
        return new NextResponse("Billboard id is required", { status: 400 });
        }
        
        if (!params.storeId) {
            return new NextResponse("Store id is required", { status: 400 });
          }
  
      const storeByUserId = await prismadb.store.findFirst({
        where: {
          id: params.storeId,
          userId,
        }
      });
  
      if (!storeByUserId) {
        return new NextResponse("Unauthorized", { status: 405 });
      }
  
      const billboard = await prismadb.billboard.delete({
        where: {
              id: params.billboardId,
            storeId:params.storeId
        }
      });
    
      return NextResponse.json(billboard);
    } catch (error) {
      console.log('[BILLBOARD_DELETE]', error);
      return new NextResponse("Internal error", { status: 500 });
    }
  };
  
  
  export async function PATCH(
    req: Request,
    { params }: { params: { billboardId: string, storeId: string } }
  ) {
    try {   
      const { getUser, isAuthenticated } = getKindeServerSession()
    
      const userInfo = await getUser()
          const userId = userInfo?.id
   
          const isAuth = await isAuthenticated()
     
      if (!isAuth) {
          return new NextResponse("unauthorized", {status: 401})
      }
  
      if (!userId) {
        return new NextResponse("Unauthenticated", { status: 403 });
      }
  
      const body = await req.json();
      
      const { label, imageUrl } = body;
      
     
  
      if (!label) {
        return new NextResponse("Label is required", { status: 400 });
      }
  
      if (!imageUrl) {
        return new NextResponse("Image URL is required", { status: 400 });
      }
  
      if (!params.billboardId) {
        return new NextResponse("Billboard id is required", { status: 400 });
      }

        
      if (!params.storeId) {
        return new NextResponse("Store id is required", { status: 400 });
      }
      
      const storeByUserId = await prismadb.store.findFirst({
        where: {
          id: params.storeId,
          userId,
        }
      });
  
      if (!storeByUserId) {
        return new NextResponse("Unauthorized", { status: 405 });
      }
  
      const billboard = await prismadb.billboard.update({
        where: {
              id: params.billboardId,
            storeId: params.storeId
        },
        data: {
          label,
          imageUrl
        }
      });
    
      return NextResponse.json(billboard);
    } catch (error) {
      console.log('[BILLBOARD_PATCH]', error);
      return new NextResponse("Internal error", { status: 500 });
    }
  };
  