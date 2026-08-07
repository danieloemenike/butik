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
}

export default async function OnboardingLayout({ children }: OnBoardingProps) {
  const { getUser, isAuthenticated } = getKindeServerSession()
  const userInfo = await getUser()
  const userId = userInfo?.id
  const isAuth = await isAuthenticated()

  if (!isAuth || !userId) {
    redirect("/")
  }

  let business = null
  try {
    business = await prismadb.business.findFirst({
      where: {
        userId,
      },
    })
  } catch (e) {
    console.error("Database error", e)
  }

  // redirect() throws NEXT_REDIRECT — must stay outside try/catch
  if (business) {
    redirect(`/business/${business.id}`)
  }

  return <>{children}</>
}
