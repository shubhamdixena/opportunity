"use client"

import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import type { Opportunity } from "./OpportunityCard"
import { TrendingUp, Users, Briefcase, Calendar, Plus, ArrowRight } from "lucide-react"
import { useMemo } from "react"

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

interface AdminDashboardProps {
  opportunities: Opportunity[]
  stats?: AdminStats | null
  onPageChange: (page: string) => void
}

export function AdminDashboard({ opportunities, stats: adminStats, onPageChange }: AdminDashboardProps) {
  const opportunityStats = useMemo(() => {
    const total = opportunities.length
    const featured = opportunities.filter((opp) => opp.featured).length

    const expiringSoon = opportunities.filter((opp) => {
      const deadline = new Date(opp.deadline)
      const now = new Date()
      const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays > 0
    }).length

    return { total, featured, expiringSoon }
  }, [opportunities])

  // Use admin stats if available, otherwise use calculated stats
  const displayStats = adminStats || {
    opportunities: opportunityStats,
    users: { total: 0, active: 0, pending: 0, suspended: 0, recentlyActive: 0 }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to OpportunityHub Admin</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Opportunities</p>
                <p className="text-2xl">{displayStats.opportunities.total}</p>
              </div>
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                <p className="text-2xl">{displayStats.users.recentlyActive}</p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Featured</p>
                <p className="text-2xl">{displayStats.opportunities.featured}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Expiring Soon</p>
                <p className="text-2xl text-orange-600">{displayStats.opportunities.expiringSoon}</p>
              </div>
              <Calendar className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-16 justify-start gap-3 border-dashed bg-transparent"
            onClick={() => onPageChange("opportunities")}
          >
            <Plus className="h-4 w-4" />
            Add Opportunity
          </Button>

          <Button
            variant="outline"
            className="h-16 justify-between bg-transparent"
            onClick={() => onPageChange("opportunities")}
          >
            <span>Manage Opportunities</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="h-16 justify-between bg-transparent"
            onClick={() => onPageChange("users")}
          >
            <span>User Management</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="h-16 justify-between bg-transparent"
            onClick={() => onPageChange("analytics")}
          >
            <span>View Analytics</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
