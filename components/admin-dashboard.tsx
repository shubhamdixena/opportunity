"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import type { Opportunity } from "./opportunity-card"
import { TrendingUp, Users, Briefcase, Calendar, Plus, ArrowRight, AlertCircle } from "lucide-react"
import { useMemo } from "react"

interface AdminDashboardProps {
  opportunities: Opportunity[]
  onPageChange: (page: string) => void
}

export function AdminDashboard({ opportunities, onPageChange }: AdminDashboardProps) {
  const stats = useMemo(() => {
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

  const recentOpportunities = opportunities
    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())
    .slice(0, 3)

  return (
    <div className="p-8 space-y-8">
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
                <p className="text-2xl">{stats.total}</p>
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
                <p className="text-2xl">2,847</p>
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
                <p className="text-2xl">{stats.featured}</p>
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
                <p className="text-2xl text-orange-600">{stats.expiringSoon}</p>
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Opportunities */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Opportunities</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onPageChange("opportunities")} className="text-xs">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="flex items-start justify-between py-2">
                <div>
                  <p className="text-sm line-clamp-1">{opportunity.title}</p>
                  <p className="text-xs text-muted-foreground">{opportunity.organization}</p>
                </div>
                <div className="text-xs text-muted-foreground ml-4">
                  {new Date(opportunity.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm">System Operational</p>
                <p className="text-xs text-muted-foreground">All services running normally</p>
              </div>
            </div>

            {stats.expiringSoon > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-sm">{stats.expiringSoon} opportunities expiring soon</p>
                  <p className="text-xs text-muted-foreground">Review deadlines</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm">+12% user growth this month</p>
                <p className="text-xs text-muted-foreground">347 new registrations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
