"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { ArrowLeftRight, Store } from "lucide-react"
import { ButikLogo } from "@/components/ButikLogo"
import { Menu } from "@/static-data/menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

type AppSidebarProps = {
  storeName?: string
  businessId?: string | null
}

export function AppSidebar({ storeName, businessId }: AppSidebarProps) {
  const pathname = usePathname()
  const params = useParams()
  const storeId = String(params?.storeId ?? "")

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-2">
        <div className="flex h-12 w-full items-center px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <ButikLogo
            size="sm"
            href="/"
            className="text-sidebar-foreground group-data-[collapsible=icon]:hidden"
          />
          <span className="hidden size-8 items-center justify-center rounded-md font-display text-sm font-semibold tracking-tighter text-sidebar-foreground group-data-[collapsible=icon]:inline-flex">
            B
          </span>
        </div>

        <div className="px-1 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2.5 rounded-lg bg-sidebar-accent/60 px-2.5 py-2">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-teal-soft text-teal">
              <Store className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold tracking-tight text-sidebar-foreground">
                {storeName || "Untitled store"}
              </p>
              <p className="text-[11px] text-muted-foreground">Active store</p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {Menu.map((section) => (
          <SidebarGroup key={section.id} className="py-1">
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.menu.map((route) => {
                  const href = `/store/${storeId}${route.path}`
                  const isActive = pathname === href
                  const Icon = route.icon

                  return (
                    <SidebarMenuItem key={route.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={route.title}
                      >
                        <Link href={href}>
                          <Icon strokeWidth={1.6} />
                          <span>{route.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {businessId ? (
        <SidebarFooter className="gap-0">
          <SidebarSeparator className="mb-2" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Switch store">
                <Link href={`/business/${businessId}`}>
                  <ArrowLeftRight strokeWidth={1.6} />
                  <span>Switch store</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      ) : null}

      <SidebarRail />
    </Sidebar>
  )
}
