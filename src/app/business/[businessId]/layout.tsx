import prismadb from '@/lib/prismadb';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import type { Metadata } from 'next';
import { redirect, } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Butik - E-commerce Website',
  description: 'The Future of E-commerce',
}

type BusinessProps = {
    children: React.ReactNode
    params: {
      
        businessId: string
    }
}

export default async function BusinessLayout({ children, params }: BusinessProps) {
    const { getUser, isAuthenticated } = getKindeServerSession()
    const userInfo = await getUser()
    const userId = userInfo?.id
    const isAuth = await isAuthenticated()
    if (!isAuth || !userId) {
        redirect("/")
    }
 
        const business = await prismadb?.business?.findUnique({
            where: {
             
                userId,
                id: params?.businessId
            }
    
        })
    
        if (!business) {
            redirect('/register-business')
        }

 
 
   
    
  

  
    
    return (
        <>      
        {children}
    </>
        
    )
}