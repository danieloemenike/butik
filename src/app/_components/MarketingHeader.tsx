import Link from "next/link"
import Image from "next/image"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components"
import { ModeToggle } from "@/components/ui/ModeToggle"
import { ButikLogo } from "@/components/ButikLogo"

async function MarketingHeader() {
  const { getUser, isAuthenticated } = getKindeServerSession()
  const user = await getUser()
  const isAuth = await isAuthenticated()

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-surface-raised/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 md:px-8">
        <ButikLogo className="text-ink" />

        <nav className="hidden items-center gap-8 text-sm text-ink-muted md:flex">
          <a href="#platform" className="transition-colors hover:text-ink">
            Platform
          </a>
          <a href="#operations" className="transition-colors hover:text-ink">
            Operations
          </a>
          <Link href="/explore" className="transition-colors hover:text-ink">
            Explore
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <ModeToggle />
          {!isAuth ? (
            <>
              <LoginLink className="hidden rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:inline-flex">
                Sign in
              </LoginLink>
              <RegisterLink className="inline-flex h-10 items-center rounded-md bg-ink px-4 text-sm font-semibold text-surface-raised transition-opacity hover:opacity-90">
                Start building
              </RegisterLink>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/register-business"
                className="hidden rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink/5 sm:inline-flex"
              >
                Dashboard
              </Link>
              {user?.picture ? (
                <Image
                  className="h-8 w-8 rounded-full object-cover"
                  src={user.picture}
                  width={32}
                  height={32}
                  alt="User profile"
                  priority
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-xs font-semibold text-white dark:text-surface-deep">
                  {user?.given_name?.[0]}
                  {user?.family_name?.[0]}
                </div>
              )}
              <LogoutLink className="rounded-md px-2 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink">
                Logout
              </LogoutLink>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default MarketingHeader
