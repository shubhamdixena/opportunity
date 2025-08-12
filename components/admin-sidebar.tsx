"use client"

import { Home, Briefcase, Users, BarChart3, Settings, Shield, Bot } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

interface AdminSidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

const menuItems = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: Home,
  },
  {
    id: "opportunities",
    title: "Opportunities",
    icon: Briefcase,
  },
  {
    id: "content-manager",
    title: "Content Manager",
    icon: Bot,
  },
  {
    id: "users",
    title: "Users",
    icon: Users,
  },
  {
    id: "analytics",
    title: "Analytics",
    icon: BarChart3,
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
  },
]

export function AdminSidebar({ currentPage, onPageChange }: AdminSidebarProps) {
  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar flex-shrink-0">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-sidebar-primary rounded-lg">
            <Shield className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg text-sidebar-foreground">Admin</h2>
            <p className="text-sm text-sidebar-foreground/60">OpportunityHub</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = currentPage === item.id
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onPageChange(item.id)}
                      className={`
                        w-full justify-start px-3 py-2 rounded-md transition-colors
                        ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      <span className="text-sm truncate">{item.title}</span>
                    </SidebarMenuButton>
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
