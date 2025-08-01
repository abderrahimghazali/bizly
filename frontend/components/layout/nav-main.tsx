"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type Icon } from "@tabler/icons-react"
import { IconChevronRight } from "@tabler/icons-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-expand parent menu items when their sub-items are active
  useEffect(() => {
    if (!isMounted) return
    
    setOpenItems(prev => {
      const itemsToOpen = new Set(prev) // Preserve manually opened items
      
      items.forEach((item) => {
        const hasSubItems = item.items && item.items.length > 0
        if (hasSubItems) {
          // Check if any sub-item matches the current pathname
          const hasActiveSubItem = item.items?.some(subItem => pathname === subItem.url)
          if (hasActiveSubItem) {
            itemsToOpen.add(item.title)
          }
        }
      })
      
      return Array.from(itemsToOpen)
    })
  }, [pathname, items, isMounted])

  const toggleItem = (title: string) => {
    setOpenItems(prev => {
      const isCurrentlyOpen = prev.includes(title)
      
      if (isCurrentlyOpen) {
        // Only allow closing if no sub-item is currently active
        const item = items.find(item => item.title === title)
        const hasActiveSubItem = item?.items?.some(subItem => pathname === subItem.url)
        
        if (hasActiveSubItem) {
          // Don't close if a sub-item is active
          return prev
        }
        
        return prev.filter(item => item !== title)
      } else {
        return [...prev, title]
      }
    })
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} asChild isActive={false}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const hasSubItems = item.items && item.items.length > 0
            const isOpen = openItems.includes(item.title)
            const isActive = pathname === item.url || (hasSubItems && item.items?.some(subItem => pathname === subItem.url))

            if (hasSubItems) {
              return (
                <Collapsible
                  key={item.title}
                  asChild
                  open={isOpen}
                  onOpenChange={() => toggleItem(item.title)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <IconChevronRight className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} asChild isActive={pathname === item.url}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
