"use client"

import type React from "react"
import { AdminSidebar } from "../../components/admin-sidebar"
import { SidebarProvider } from "../../components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
