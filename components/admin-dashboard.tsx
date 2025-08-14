"use client"

import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Opportunity } from "@/lib/data"
import { TrendingUp, Users, Briefcase, Calendar, Plus, ArrowRight } from "lucide-react"
import { useMemo } from "react"
import { useRouter } from "next/navigation"

interface AdminDashboardProps {
  opportunities: Opportunity[]
  onPageChange: (page: string) => void
  stats: {
    opportunities: {
      total: number
      active: number
      featured: number
      expiringSoon: number
    }
  } | null
}

export function AdminDashboard({
  opportunities,
  onPageChange,
  stats: adminStats,
}: AdminDashboardProps) {
  const router = useRouter()

  const stats = useMemo(() => {
    const total = opportunities.length
    const featured = opportunities.filter((opp) => opp.featured).length

    const expiringSoon = opportunities.filter((opp) => {
      if (!opp.application_deadline) return false
      const deadline = new Date(opp.application_deadline)
      const now = new Date()
      const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays > 0
    }).length

    return { total, featured, expiringSoon }
  }, [opportunities])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to OpportunityHub Admin</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Opportunities
                </p>
                <p className="text-2xl">
                  {adminStats?.opportunities.total ?? "..."}
                </p>
              </div>
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Expiring Soon
                </p>
                <p className="text-2xl text-orange-600 dark:text-orange-400">{stats.expiringSoon}</p>
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
            onClick={() => router.push("/admin/opportunities/add")}
          >
            <Plus className="h-4 w-4" />
            Add Opportunity
          </Button>

          <Button
            variant="outline"
            className="h-16 justify-between bg-transparent"
            onClick={() => router.push("/admin/opportunities")}
          >
            <span>Manage Opportunities</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
