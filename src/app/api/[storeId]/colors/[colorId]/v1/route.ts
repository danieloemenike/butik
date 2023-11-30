
import prismadb from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";



export async function GET(
    req: Request,
    { params }: { params: { sizeId: string, storeId?: string } }
  ) {
    try {
     
      if (!params.sizeId) {
        return new NextResponse("color id is required", { status: 400 });
        }
     
  
      const color = await prismadb.color.findUnique({
        where: {
              id: params.sizeId,
            
          }
      });
    
      return NextResponse.json(color);
    } catch (error) {
      console.log('[SIZE_GET]', error);
      return new NextResponse("Internal error", { status: 500 });
    }
  };
  
  export async function DELETE(
    req: Request,
    { params }: { params: { sizeId: string, storeId: string } }
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
            return new NextResponse("UnAuthorized", {status: 403})
        }
  
      if (!params.sizeId) {
        return new NextResponse("color id is required", { status: 400 });
        }
        
        
      if (!params.storeId) {
        return new NextResponse("Store id is required", { status: 400 });
      }
  

  
      const color = await prismadb.color.delete({
        where: {
              id: params.sizeId,
         
        }
      });

        if (!color) {
            return new NextResponse("Unauthorized", { status: 405 });
        }
    
      return NextResponse.json(color);
    } catch (error) {
      console.log('[SIZE_DELETE]', error);
      return new NextResponse("Internal error", { status: 500 });
    }
  };
  
  
  export async function PATCH(
    req: Request,
    { params }: { params: { sizeId: string, storeId: string } }
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
            return new NextResponse("UnAuthorized", {status: 403})
        }
  
      const body = await req.json();
  
      const { name, value } = body;
  
  
      if (!name) {
        return new NextResponse("Name is required", { status: 400 });
      }
  
      if (!value) {
        return new NextResponse("Value is required", { status: 400 });
      }
  
  
      if (!params.sizeId) {
        return new NextResponse("color id is required", { status: 400 });
      }
  
      const storeByUserId = await prismadb.store.findFirst({
        where: {
          id: params.storeId,
          userId
        }
      });
  
      if (!storeByUserId) {
        return new NextResponse("Unauthorized", { status: 405 });
      }
  
      const color = await prismadb.color.update({
        where: {
          id: params.sizeId
        },
        data: {
          name,
          value
        }
      });
    
      return NextResponse.json(color);
    } catch (error) {
      console.log('[SIZE_PATCH]', error);
      return new NextResponse("Internal error", { status: 500 });
    }
  };
  