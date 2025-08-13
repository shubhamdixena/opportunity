"use client"

import { Home, Briefcase, Users, BarChart3, Settings, Shield, Bot } from "lucide-react"
import Link from "next/link"
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
    <Sidebar className="border-r border-slate-200/60 bg-gradient-to-b from-slate-50 to-white shadow-sm flex-shrink-0 w-64 h-screen flex flex-col">
      <SidebarHeader className="border-b border-slate-200/60 p-6 bg-white/80 backdrop-blur-sm flex-shrink-0">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Admin</h2>
            <p className="text-sm text-slate-500">OpportunityHub</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-4 flex-1 flex flex-col">
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const isActive = currentPage === item.id
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onPageChange(item.id)}
                      className={`
                        w-full justify-start px-4 py-3 rounded-xl transition-all duration-200 group
                        ${
                          isActive
                            ? "bg-gradient-to-r from-slate-100 to-slate-50 text-slate-800 shadow-sm border border-slate-200/60"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:shadow-sm"
                        }
                      `}
                    >
                      <item.icon
                        className={`w-5 h-5 mr-3 transition-colors ${
                          isActive ? "text-slate-700" : "text-slate-500 group-hover:text-slate-600"
                        }`}
                      />
                      <span className="text-sm font-medium truncate">{item.title}</span>
                      {isActive && <div className="ml-auto w-2 h-2 bg-slate-600 rounded-full"></div>}
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
