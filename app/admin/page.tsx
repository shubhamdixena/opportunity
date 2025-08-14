"use client"

import { useEffect, useState } from "react"
import { AdminDashboard } from "@/components/admin-dashboard"
import type { Opportunity } from "@/components/OpportunityCard"

interface AdminStats {
  opportunities: {
    total: number
    active: number
    featured: number
    expiringSoon: number
  }
  users: {
    total: number
    active: number
    pending: number
    suspended: number
    recentlyActive: number
  }
}

export default function AdminPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch opportunities and stats in parallel
        const [opportunitiesResponse, statsResponse] = await Promise.all([
          fetch('/api/opportunities?limit=50'),
          fetch('/api/admin/stats')
        ])

        if (opportunitiesResponse.ok) {
          const data = await opportunitiesResponse.json()
          // Transform data to match expected interface
          const transformedOpportunities = data.opportunities.map((opp: any) => ({
            id: opp.id,
            title: opp.title,
            organization: opp.organization,
            description: opp.about_opportunity || '',
            category: opp.category,
            location: opp.location || '',
            deadline: opp.application_deadline || '',
            url: opp.application_url || opp.website_url || '',
            featured: opp.featured || false,
            funding: opp.amounts?.min && opp.amounts?.max 
              ? `$${opp.amounts.min} - $${opp.amounts.max}`
              : opp.amounts?.min || opp.amounts?.max || 'Not specified',
            eligibility: opp.requirements || 'See details'
          }))
          setOpportunities(transformedOpportunities)
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          // Transform API response to match AdminStats interface
          const transformedStats: AdminStats = {
            opportunities: {
              total: statsData.totalOpportunities || 0,
              active: statsData.activeOpportunities || 0,
              featured: 0, // Will be calculated from opportunities data
              expiringSoon: 0 // Will be calculated from opportunities data
            },
            users: {
              total: statsData.totalUsers || 0,
              active: 0, // Not provided by current API
              pending: 0, // Not provided by current API
              suspended: 0, // Not provided by current API
              recentlyActive: 0 // Not provided by current API
            }
          }
          setStats(transformedStats)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
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
