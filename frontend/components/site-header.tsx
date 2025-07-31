"use client"

import { usePathname } from "next/navigation"
import { IconBell, IconHelp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  const pathname = usePathname()
  
  // Get page title based on current path
  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard"
      case "/contacts":
        return "Contacts"
      case "/documents":
        return "Documents"
      case "/companies":
        return "Companies"
      case "/settings":
        return "Settings"
      default:
        return "Dashboard"
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{getPageTitle()}</h1>
        
        {/* Right side icons */}
        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <IconBell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-3 py-2 text-sm font-medium border-b">
                Notifications
              </div>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="font-medium text-sm">New contact added</div>
                <div className="text-xs text-muted-foreground">John Doe was added to your contacts</div>
                <div className="text-xs text-muted-foreground">2 minutes ago</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="font-medium text-sm">Document uploaded</div>
                <div className="text-xs text-muted-foreground">Contract.pdf has been uploaded successfully</div>
                <div className="text-xs text-muted-foreground">1 hour ago</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <div className="font-medium text-sm">Company profile updated</div>
                <div className="text-xs text-muted-foreground">ABC Corp profile has been updated</div>
                <div className="text-xs text-muted-foreground">3 hours ago</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <IconHelp className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <span>Documentation</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Keyboard Shortcuts</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Contact Support</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Report a Bug</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
