import prismadb from "@/lib/prismadb";
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
    const { getUser, isAuthenticated } = getKindeServerSession()
    
    const userInfo = await getUser()
        const userId = userInfo?.id
        const email = userInfo?.email
        const isAuth = await isAuthenticated()
        const body = await request.json()
        const {businessName, businessPhoneNumber,businessAddress,businessCity,businessCountry, businessSlug} = body
        if (!isAuth) {
            return new NextResponse("unauthorized", {status: 401})
        }

        if (!userId) {
            return new NextResponse("UnAuthorized", {status: 403})
        }
        if (!businessName || !businessPhoneNumber || !businessAddress || !businessCity || !businessCountry) {
            return new NextResponse("All Fields are Required!", {status: 400})
        }
        const business = await prismadb.business.create({
            data: {
                userId,
                email,
                name: businessName,
                phoneNumber: businessPhoneNumber,
                address: businessAddress,
                city: businessCity,
                country: businessCountry,
               
            },
            select : {
                id: true,
            },
        });
        
        return NextResponse.json(business)
    } catch (error) {
        console.log('[BUSINESS_CREATION', error);
        return new NextResponse("Internal error", {status: 501})
    }
    


}