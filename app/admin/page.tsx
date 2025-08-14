"use client"

import { useEffect, useState } from "react"
import { AdminDashboard } from "@/components/admin-dashboard"
import type { Opportunity } from "@/lib/data"

interface AdminStats {
  opportunities: {
    total: number
    active: number
    featured: number
    expiringSoon: number
  }
}

export default function AdminPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const opportunitiesResponse = await fetch("/api/opportunities?limit=50")

        if (opportunitiesResponse.ok) {
          const data = await opportunitiesResponse.json()
          setOpportunities(data.opportunities)

          // Manually construct stats from the opportunities data
          const featuredCount = data.opportunities.filter(
            (opp: Opportunity) => opp.featured,
          ).length
          const expiringSoonCount = data.opportunities.filter(
            (opp: Opportunity) => {
              if (!opp.application_deadline) return false
              const deadline = new Date(opp.application_deadline)
              const now = new Date()
              const diffDays = Math.ceil(
                (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
              )
              return diffDays <= 7 && diffDays > 0
            },
          ).length

          setStats({
            opportunities: {
              total: data.opportunities.length,
              active: data.opportunities.length, // Assuming all fetched are active
              featured: featuredCount,
              expiringSoon: expiringSoonCount,
            },
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handlePageChange = (page: string) => {
    // This can be used for any navigation logic if needed
    console.log("Navigate to:", page)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <h1 className="text-2xl mb-2">Dashboard</h1>
          <p className="text-muted-foreground mb-6">Loading...</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return <AdminDashboard opportunities={opportunities} stats={stats} onPageChange={handlePageChange} />
}
