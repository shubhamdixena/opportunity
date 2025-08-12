import { TrendingUp, Users, Eye, Calendar, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const analyticsData = {
  overview: [
    { label: "Total Views", value: "12,847", change: "+15.2%", trend: "up", icon: Eye },
    { label: "Applications", value: "2,456", change: "+8.7%", trend: "up", icon: Users },
    { label: "Conversion Rate", value: "19.1%", change: "+2.3%", trend: "up", icon: TrendingUp },
    { label: "Avg. Time on Site", value: "4m 32s", change: "-0.8%", trend: "down", icon: Calendar },
  ],
  topCategories: [
    { name: "Scholarships", applications: 1247, views: 5632, conversion: "22.1%" },
    { name: "Competitions", applications: 892, views: 3421, conversion: "26.1%" },
    { name: "Fellowships", applications: 567, views: 2156, conversion: "26.3%" },
    { name: "Grants", applications: 234, views: 1089, conversion: "21.5%" },
    { name: "Accelerators", applications: 156, views: 549, conversion: "28.4%" },
  ],
  recentActivity: [
    { action: "New application", opportunity: "Global Innovation Challenge", time: "2 minutes ago" },
    { action: "Opportunity viewed", opportunity: "Young Leaders Fellowship", time: "5 minutes ago" },
    { action: "New application", opportunity: "Healthcare Innovation Grant", time: "12 minutes ago" },
    { action: "Opportunity shared", opportunity: "Digital Arts Residency", time: "18 minutes ago" },
    { action: "New application", opportunity: "Sustainable Business Accelerator", time: "25 minutes ago" },
  ],
}

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">Analytics Dashboard</h1>
        <p className="text-slate-600 mt-1">Track platform performance and user engagement</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {analyticsData.overview.map((stat, index) => (
          <Card key={index} className="bg-white/60 backdrop-blur-sm border-slate-200/60 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-slate-800 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    {stat.trend === "up" ? (
                      <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <p className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
                <div className="p-2 bg-slate-100/80 rounded-lg">
                  <stat.icon className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Top Performing Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50/80 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">{category.name}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-slate-600">{category.applications} applications</span>
                      <span className="text-xs text-slate-600">{category.views} views</span>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-0 text-xs">{category.conversion}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50/80 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                    <p className="text-sm text-slate-600 truncate">{activity.opportunity}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">User Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Page Views</span>
                <span className="font-semibold text-slate-800">12,847</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Unique Visitors</span>
                <span className="font-semibold text-slate-800">8,234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Bounce Rate</span>
                <span className="font-semibold text-slate-800">34.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Return Visitors</span>
                <span className="font-semibold text-slate-800">42.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Application Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Applications</span>
                <span className="font-semibold text-slate-800">2,456</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">This Month</span>
                <span className="font-semibold text-slate-800">387</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Success Rate</span>
                <span className="font-semibold text-slate-800">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Avg. per Day</span>
                <span className="font-semibold text-slate-800">67</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/60 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Platform Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Active Opportunities</span>
                <Badge className="bg-green-100 text-green-700 border-0 text-xs">147</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Draft Opportunities</span>
                <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">23</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Expired This Month</span>
                <Badge className="bg-red-100 text-red-700 border-0 text-xs">12</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">System Status</span>
                <Badge className="bg-green-100 text-green-700 border-0 text-xs">Healthy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
