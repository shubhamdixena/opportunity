"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import type { Opportunity } from "./OpportunityCard"
import { TrendingUp, Users, Eye, Target, Award, Globe } from "lucide-react"
import { useMemo } from "react"

interface AdminAnalyticsProps {
  opportunities: Opportunity[]
}

export function AdminAnalytics({ opportunities }: AdminAnalyticsProps) {
  const analytics = useMemo(() => {
    const totalOpportunities = opportunities.length
    const featuredOpportunities = opportunities.filter((opp) => opp.featured).length

    // Category distribution
    const categoryStats = opportunities.reduce(
      (acc, opp) => {
        acc[opp.category] = (acc[opp.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Location distribution (top 5)
    const locationStats = opportunities.reduce(
      (acc, opp) => {
        acc[opp.location] = (acc[opp.location] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topLocations = Object.entries(locationStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    return {
      totalOpportunities,
      featuredOpportunities,
      categoryStats,
      topLocations,
    }
  }, [opportunities])

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Analytics</h1>
        <p className="text-muted-foreground">Platform insights and performance metrics</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Opportunities</p>
                    <p className="text-2xl">{analytics.totalOpportunities}</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +8.2% this month
                    </p>
                  </div>
                  <Award className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                    <p className="text-2xl">1,923</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +12.5% this month
                    </p>
                  </div>
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Page Views</p>
                    <p className="text-2xl">45.2K</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +15.3% this week
                    </p>
                  </div>
                  <Eye className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Applications</p>
                    <p className="text-2xl">5,623</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +22.1% this month
                    </p>
                  </div>
                  <Target className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">User Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Session Duration</span>
                    <span className="text-sm">8m 34s</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "68%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Bounce Rate</span>
                    <span className="text-sm">23.4%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: "23%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="text-sm">8.7%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "8.7%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Platform Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-xl text-green-600">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl text-blue-600">1.2s</div>
                    <div className="text-sm text-muted-foreground">Load Time</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-xl text-purple-600">4.8/5</div>
                    <div className="text-sm text-muted-foreground">User Rating</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-xl text-orange-600">0.1%</div>
                    <div className="text-sm text-muted-foreground">Error Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">By Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analytics.categoryStats).map(([category, count], index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full bg-primary"
                        style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                      ></div>
                      <span className="text-sm">{category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{count}</span>
                      <Badge variant="secondary" className="text-xs">
                        {((count / analytics.totalOpportunities) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Top Locations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.topLocations.map(([location, count], index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{location}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl">2,847</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl text-green-600">1,923</div>
                <div className="text-sm text-muted-foreground">Active This Month</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl text-blue-600">347</div>
                <div className="text-sm text-muted-foreground">New This Month</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl text-purple-600">+12.5%</div>
                <div className="text-sm text-muted-foreground">Growth Rate</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
