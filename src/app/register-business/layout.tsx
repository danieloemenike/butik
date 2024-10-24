
import prismadb from '@/lib/prismadb'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'






export const metadata: Metadata = {
  title: 'butik - Onboarding Business Registration',
  description: 'Business Registration With butik',
}

type OnBoardingProps = {
  children: React.ReactNode
  params: {
    businessId: string,
   
    
  }
}

export default async function OnboardingLayout({ children, params }: OnBoardingProps) {
    const { getUser, isAuthenticated } = getKindeServerSession()
    const userInfo = await getUser()
    const userId = userInfo?.id
    const isAuth = await isAuthenticated()
   
    if (!isAuth || !userId) {
        redirect("/")
    }
  try {
    const business = await prismadb.business.findFirst({
      where: {
          id: params.businessId,
        userId,
   
      }

  })

  if (business) {
    redirect(`business/${business.id}`)
    }
  } catch (e) {
    console.log("Database error", e)
}
  
  return (
  
      <>

         
        { children }
      
      </>
  
   
  )
}
