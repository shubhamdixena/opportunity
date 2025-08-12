import { Edit, Eye, Users, Target, Calendar, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { AdminHeader } from "@/components/admin-layout"

const opportunities = [
  {
    id: 1,
    title: "Global Innovation Challenge 2025",
    organization: "Tech for Good Foundation",
    type: "Competition",
    status: "Active",
    deadline: "March 15, 2025",
    applications: 245,
    views: 1250,
  },
  {
    id: 2,
    title: "Young Leaders Fellowship",
    organization: "Future Leaders Institute",
    type: "Fellowship",
    status: "Draft",
    deadline: "February 28, 2025",
    applications: 89,
    views: 567,
  },
  {
    id: 3,
    title: "Sustainable Business Accelerator",
    organization: "Green Ventures",
    type: "Accelerator",
    status: "Active",
    deadline: "April 10, 2025",
    applications: 156,
    views: 892,
  },
]

const categories = [
  { name: "Competition", count: 45, color: "bg-blue-500/10 text-blue-600" },
  { name: "Fellowship", count: 32, color: "bg-green-500/10 text-green-600" },
  { name: "Scholarship", count: 78, color: "bg-purple-500/10 text-purple-600" },
  { name: "Grant", count: 23, color: "bg-orange-500/10 text-orange-600" },
  { name: "Accelerator", count: 15, color: "bg-pink-500/10 text-pink-600" },
]

const stats = [
  { label: "Total Opportunities", value: "193", change: "+12%", icon: Target },
  { label: "Active Applications", value: "1,247", change: "+8%", icon: Users },
  { label: "This Month", value: "89", change: "+23%", icon: Calendar },
  { label: "Success Rate", value: "94%", change: "+2%", icon: TrendingUp },
]

export default function AdminPage() {
  return (
    <div className="p-6">
      <AdminHeader
        title="Dashboard Overview"
        description="Monitor platform performance and manage content"
        buttonText="Add Opportunity"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-slate-800 mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className="p-2 bg-slate-100/80 rounded-lg">
                  <stat.icon className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="glass-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800">Posted Opportunities</CardTitle>
              <Link href="/admin/opportunities">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800 text-sm">Global Innovation Challenge</p>
                  <p className="text-xs text-slate-600">245 applications</p>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0 text-xs">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800 text-sm">Young Leaders Fellowship</p>
                  <p className="text-xs text-slate-600">89 applications</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">Draft</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800 text-sm">Sustainable Business Accelerator</p>
                  <p className="text-xs text-slate-600">156 applications</p>
                </div>
                <Badge className="bg-green-100 text-green-700 border-0 text-xs">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Categories Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <div key={index} className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/60 text-center">
                  <Badge className={`${category.color} border-0 text-xs mb-2`}>{category.name}</Badge>
                  <p className="text-lg font-semibold text-slate-800">{category.count}</p>
                  <p className="text-xs text-slate-500">opportunities</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-800">Recent Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200/60">
                <TableHead className="font-medium text-slate-700">Opportunity</TableHead>
                <TableHead className="font-medium text-slate-700">Type</TableHead>
                <TableHead className="font-medium text-slate-700">Status</TableHead>
                <TableHead className="font-medium text-slate-700">Applications</TableHead>
                <TableHead className="font-medium text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.slice(0, 3).map((opportunity) => (
                <TableRow key={opportunity.id} className="border-slate-200/60">
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{opportunity.title}</p>
                      <p className="text-xs text-slate-500">{opportunity.organization}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-slate-200 text-slate-600 text-xs">
                      {opportunity.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        opportunity.status === "Active"
                          ? "bg-green-100 text-green-700 border-0 text-xs"
                          : "bg-yellow-100 text-yellow-700 border-0 text-xs"
                      }
                    >
                      {opportunity.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">{opportunity.applications}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
