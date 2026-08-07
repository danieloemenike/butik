"use client"

import { useState } from "react"
import Image from "next/image"
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { Building2, ChevronDown, PencilLine, Plus } from "lucide-react"
import { ModeToggle } from "@/components/ui/ModeToggle"
import { ButikLogo } from "@/components/ButikLogo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateStoreModal } from "./CreateStoreModal"
import {
  EditBusinessModal,
  type BusinessDetails,
} from "./EditBusinessModal"

type BusinessHeaderProps = Readonly<{
  business: BusinessDetails
  user?: {
    picture?: string | null
    given_name?: string | null
    family_name?: string | null
  } | null
}>

export default function BusinessHeader({
  business,
  user,
}: BusinessHeaderProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <ButikLogo />
            <span
              className="hidden text-muted-foreground/40 sm:inline"
              aria-hidden
            >
              /
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group hidden max-w-[220px] items-center gap-1.5 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-secondary sm:inline-flex md:max-w-[280px]"
                >
                  <span className="truncate text-sm font-medium text-muted-foreground group-hover:text-foreground group-data-[state=open]:text-foreground">
                    {business.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                      <Building2 className="h-4 w-4 text-foreground" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {business.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[business.city, business.country]
                          .filter(Boolean)
                          .join(", ") || "Business"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <PencilLine className="mr-2 h-4 w-4" />
                  Edit business
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create store
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile: icon button for business actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:hidden"
                  aria-label="Business menu"
                >
                  <Building2 className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {business.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <PencilLine className="mr-2 h-4 w-4" />
                  Edit business
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create store
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <ModeToggle />
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                {user?.given_name?.[0]}
                {user?.family_name?.[0]}
              </div>
            )}
            <LogoutLink className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Logout
            </LogoutLink>
          </div>
        </div>
      </header>

      <EditBusinessModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        business={business}
      />
      <CreateStoreModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        businessId={business.id}
      />
    </>
  )
}
