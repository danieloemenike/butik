import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { categoryId: string , storeId?: string} }
) {
    try {
      

     
    // if (!params.storeId) {
    //     return new NextResponse("Store id is required", { status: 400 });
    //   }
    const category = await prismadb.category.findFirst({
      where: {
            id: params.categoryId,
      },
    
    });
        if (!category) {
            return new NextResponse("Category Not found", {status: 404})
    }
    return NextResponse.json(category);
  } catch (error) {
    console.log('[CATEGORY_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
    req: Request,
    { params }: { params: { categoryId: string, storeId: string } }
  ) {
    try {
      const { getUser, isAuthenticated } = getKindeServerSession()
    
      const userInfo = await getUser()
          const userId = userInfo?.id
   
          const isAuth = await isAuthenticated()
     
      if (!isAuth) {
          return new NextResponse("unauthorized", {status: 401})
      }
     
  
      if (!params.categoryId) {
        return new NextResponse("Category id is required", { status: 400 });
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
  
      const category = await prismadb.category.delete({
        where: {
          id: params.categoryId,
        }
      });
    
      return NextResponse.json(category);
    } catch (error) {
      console.log('[CATEGORY_DELETE]', error);
      return new NextResponse("Internal error", { status: 500 });
    }
  };

  export async function PATCH(
    req: Request,
    { params }: { params: { categoryId: string, storeId: string } }
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
      
      const { name, billboardId } = body;
      
      if (!userId) {
        return new NextResponse("Unauthenticated", { status: 403 });
      }
  
      if (!billboardId) {
        return new NextResponse("Billboard ID is required", { status: 400 });
      }
  
      if (!name) {
        return new NextResponse("Name is required", { status: 400 });
      }
  
      if (!params.categoryId) {
        return new NextResponse("Category id is required", { status: 400 });
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
  
      const category = await prismadb.category.update({
        where: {
          id: params.categoryId,
        },
        data: {
          name,
          
        }
      });
        if (!category) {
            return new NextResponse("Category not found", { status: 404 });
        }
    
      return NextResponse.json(category);
    } catch (error) {
      console.log('[CATEGORY_PATCH]', error);
      return new NextResponse("Internal error", { status: 500 });
    }
  };
  