import SideBar from '@/components/Sidebar';
import StoreHeader from '@/components/StoreHeader';
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
      
        storeId: string
    }
}

export default async function StoreLayout({ children, params }: BusinessProps) {
    const { getUser, isAuthenticated } = getKindeServerSession()
    const userInfo = await getUser()
    const userId = userInfo?.id
    const isAuth = await isAuthenticated()
    if (!isAuth || !userId) {
        redirect("/")
    }
 
        const store = await prismadb?.store?.findUnique({
            where: {
             
                userId,
                id: params?.storeId
            }
    
        })
    
        if (!store) {
            redirect('/register-business')
        }

 
 
   
    
  

  
    
    return (
        <>
        <div className="">
        <SideBar storeName = {store?.name} />
        <div className='w-full h-full'>

        <StoreHeader />
                    <div className='max-w-6xl md:ml-[230px] mx-auto mr-[50px] mt-[4px] p-3 '>
                       
  { children }

</div>

                </div>
                </div>
    </>
        
    )
}