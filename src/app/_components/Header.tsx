import Link from "next/link"
import Image from "next/image"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components"
import { ModeToggle } from "@/components/ui/ModeToggle"
import { Button } from "@/components/ui/button"
import { ButikLogo } from "@/components/ButikLogo"

type Props = {
  dashboardButton?: boolean
}

async function Header({ dashboardButton }: Props) {
  const { getUser, isAuthenticated } = getKindeServerSession()
  const user = await getUser()
  const isAuth = await isAuthenticated()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <ButikLogo />
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <ModeToggle />
          {!isAuth ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <LoginLink>Sign in</LoginLink>
              </Button>
              <Button size="sm">
                <RegisterLink>Get Started</RegisterLink>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {dashboardButton ? (
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  <Link href="/register-business">Dashboard</Link>
                </Button>
              ) : null}
              {user?.picture ? (
                <Image
                  className="h-7 w-7 rounded-full object-cover"
                  src={user.picture}
                  width={28}
                  height={28}
                  alt="User profile"
                  priority
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-[10px] font-semibold text-white dark:text-surface-deep">
                  {user?.given_name?.[0]}
                  {user?.family_name?.[0]}
                </div>
              )}
              <LogoutLink className="hidden rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline">
                Logout
              </LogoutLink>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
