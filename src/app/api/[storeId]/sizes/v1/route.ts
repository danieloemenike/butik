
import prismadb from "@/lib/prismadb";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";



export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
  ) {
    try {
      const { getUser, isAuthenticated } = getKindeServerSession()
    
      const userInfo = await getUser()
          const userId = userInfo?.id
   
          const isAuth = await isAuthenticated()
     
      if (!isAuth) {
          return new NextResponse("unauthorized", {status: 401})
      }
  
      const body = await req.json();
  
        const { name, value } = body;
        
      
        if (!userId) {
            return new NextResponse("UnAuthorized", {status: 403})
        }
  
  
      if (!name) {
        return new NextResponse("Name is required", { status: 400 });
      }
  
      if (!value) {
        return new NextResponse("Value is required", { status: 400 });
      }
  
      if (!params.storeId) {
        return new NextResponse("Store id is required", { status: 400 });
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
  
      const size = await prismadb.size.create({
        data: {
          name,
          value,
          storeId: params.storeId
        }
      });
    
      return NextResponse.json(size);
    } catch (error) {
      console.log('[SIZES_POST]', error);
      return new NextResponse("Internal error", { status: 500 });
    }
  };
  
  export async function GET(
    req: Request,
    { params }: { params: { storeId?: string } }
  ) {
      try {
        const { getUser, isAuthenticated } = getKindeServerSession()
    
        const userInfo = await getUser()
            const userId = userInfo?.id
     
            const isAuth = await isAuthenticated()
       
        if (!isAuth) {
            return new NextResponse("unauthorized", {status: 401})
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
  
      const sizes = await prismadb.size.findMany({
        where:{
          OR: [
            {
            storeId: params.storeId
            },
            {
              storeId: null
            }
          ]
        }
      });
    
      return NextResponse.json(sizes);
    } catch (error) {
      console.log('[SIZES_GET]', error);
      return new NextResponse("Internal error", { status: 500 });
    }
  };
  