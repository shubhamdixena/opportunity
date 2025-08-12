"use client"

import type React from "react"

import { useState } from "react"
import { AdminSidebar } from "../../components/admin-sidebar"
import { AdminDashboard } from "../../components/admin-dashboard"
import { AdminOpportunities } from "../../components/admin-opportunities"
import { AdminUsers } from "../../components/admin-users"
import { AdminAnalytics } from "../../components/admin-analytics"
import { AdminSettings } from "../../components/admin-settings"
import { SidebarProvider } from "../../components/ui/sidebar"

// Mock data for opportunities
const mockOpportunities = [
  {
    id: "1",
    title: "Global Innovation Scholarship",
    organization: "Tech Foundation",
    description: "A comprehensive scholarship program for innovative students pursuing technology degrees.",
    category: "Scholarships",
    location: "Global",
    deadline: "2024-12-15",
    amount: "$50,000",
    tags: ["Technology", "Innovation", "Global"],
    url: "https://example.com/scholarship1",
    featured: true,
  },
  {
    id: "2",
    title: "Research Fellowship Program",
    organization: "Science Institute",
    description: "Fellowship opportunity for graduate students in scientific research.",
    category: "Fellowships",
    location: "USA",
    deadline: "2025-01-30",
    amount: "$75,000",
    tags: ["Research", "Science", "Graduate"],
    url: "https://example.com/fellowship1",
    featured: false,
  },
  {
    id: "3",
    title: "Startup Competition 2024",
    organization: "Entrepreneur Hub",
    description: "Annual competition for innovative startup ideas with funding opportunities.",
    category: "Competitions",
    location: "San Francisco, CA",
    deadline: "2024-11-20",
    amount: "$100,000",
    tags: ["Startup", "Competition", "Funding"],
    url: "https://example.com/competition1",
    featured: true,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [opportunities, setOpportunities] = useState(mockOpportunities)

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <AdminDashboard opportunities={opportunities} onPageChange={setCurrentPage} />
      case "opportunities":
        return (
          <AdminOpportunities
            opportunities={opportunities}
            onUpdateOpportunities={setOpportunities}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )
      case "users":
        return <AdminUsers />
      case "analytics":
        return <AdminAnalytics opportunities={opportunities} />
      case "settings":
        return <AdminSettings />
      default:
        return <AdminDashboard opportunities={opportunities} onPageChange={setCurrentPage} />
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar currentPage={currentPage} onPageChange={setCurrentPage} />

        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">{renderContent()}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
