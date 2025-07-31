"use client"

import * as React from "react"
import {
  IconDashboard,
  IconFileDescription,
  IconFolder,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import { Logo } from "@/components/logo"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Contacts",
      url: "/contacts",
      icon: IconUsers,
    },
    {
      title: "Documents",
      url: "/documents",
      icon: IconFileDescription,
      items: [
        {
          title: "All Documents",
          url: "/documents",
        },
        {
          title: "Contracts",
          url: "/documents/contracts",
        },
        {
          title: "Invoices",
          url: "/documents/invoices",
        },
        {
          title: "Reports",
          url: "/documents/reports",
        },
        {
          title: "Templates",
          url: "/documents/templates",
        },
      ],
    },
    {
      title: "Companies",
      url: "/companies",
      icon: IconFolder,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
                               <SidebarMenuButton
                     asChild
                     className="data-[slot=sidebar-menu-button]:!p-1.5"
                   >
                     <a href="/dashboard">
                       <Logo width={20} height={26} />
                       <span className="text-base font-semibold">Bizly</span>
                     </a>
                   </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
                  <SidebarFooter>
              <NavUser />
            </SidebarFooter>
    </Sidebar>
  )
}
