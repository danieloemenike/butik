import Image from "next/image"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { ModeToggle } from "@/components/ui/ModeToggle"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default async function StoreInsetHeader() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <div className="min-w-0 flex-1" />

      <div className="flex items-center gap-1.5 md:gap-2">
        <ModeToggle />
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
    </header>
  )
}
