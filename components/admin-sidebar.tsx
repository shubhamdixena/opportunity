"use client"

import { Home, Briefcase, Settings, Shield, Globe } from "lucide-react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: Home,
    href: "/admin",
  },
  {
    id: "opportunities",
    title: "Opportunities",
    icon: Briefcase,
    href: "/admin/opportunities",
  },
  {
    id: "scraping",
    title: "Web Scraping",
    icon: Globe,
    href: "/admin/scraping",
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="flex h-screen w-64 flex-shrink-0 flex-col border-r border-border bg-sidebar shadow-sm">
      <SidebarHeader className="flex-shrink-0 border-b border-border p-6">
        <Link href="/" className="flex items-center space-x-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 shadow-md">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">Admin</h2>
            <p className="text-sm text-muted-foreground">OpportunityHub</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex flex-1 flex-col p-4">
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                return (
                  <SidebarMenuItem key={item.id}>
                    <Link
                      href={item.href}
                      className={`
                        group flex w-full justify-start rounded-xl px-4 py-3
                        transition-all duration-200
                        ${
                          isActive
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }
                      `}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 transition-colors ${
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                        }`}
                      />
                      <span className="truncate text-sm font-medium">{item.title}</span>
                      {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-primary"></div>}
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
