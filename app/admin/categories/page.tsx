import { Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminHeader, AdminStatsCard, AdminSearch } from "@/components/admin-layout"

const categories = [
  {
    id: 1,
    name: "Scholarships",
    description: "Educational funding opportunities for students",
    count: 78,
    status: "Active",
    color: "bg-purple-500/10 text-purple-600",
    lastUpdated: "January 12, 2025",
  },
  {
    id: 2,
    name: "Competitions",
    description: "Innovation and skill-based competitions",
    count: 45,
    status: "Active",
    color: "bg-blue-500/10 text-blue-600",
    lastUpdated: "January 10, 2025",
  },
  {
    id: 3,
    name: "Fellowships",
    description: "Professional development and research fellowships",
    count: 32,
    status: "Active",
    color: "bg-green-500/10 text-green-600",
    lastUpdated: "January 8, 2025",
  },
  {
    id: 4,
    name: "Grants",
    description: "Funding opportunities for projects and research",
    count: 23,
    status: "Active",
    color: "bg-orange-500/10 text-orange-600",
    lastUpdated: "January 5, 2025",
  },
  {
    id: 5,
    name: "Accelerators",
    description: "Business and startup acceleration programs",
    count: 15,
    status: "Active",
    color: "bg-pink-500/10 text-pink-600",
    lastUpdated: "December 28, 2024",
  },
]

export default function CategoriesManagementPage() {
  return (
    <div className="p-6">
      <AdminHeader
        title="Categories Management"
        description="Organize and manage opportunity categories"
        buttonText="Add New Category"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <AdminStatsCard value="5" label="Total Categories" />
        <AdminStatsCard value="193" label="Total Opportunities" color="text-green-600" />
        <AdminStatsCard value="78" label="Most Popular" color="text-purple-600" />
        <AdminStatsCard value="5" label="Active Categories" color="text-blue-600" />
      </div>

      <div className="mb-6">
        <div className="max-w-md">
          <AdminSearch placeholder="Search categories..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {categories.map((category) => (
          <Card key={category.id} className="glass-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Badge className={`${category.color} border-0`}>{category.name}</Badge>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">{category.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-semibold text-slate-800">{category.count}</p>
                  <p className="text-xs text-slate-500">opportunities</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-700 border-0 text-xs mb-1">{category.status}</Badge>
                  <p className="text-xs text-slate-500">Updated {category.lastUpdated}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200/60">
                <TableHead className="font-medium text-slate-700">Category</TableHead>
                <TableHead className="font-medium text-slate-700">Description</TableHead>
                <TableHead className="font-medium text-slate-700">Opportunities</TableHead>
                <TableHead className="font-medium text-slate-700">Status</TableHead>
                <TableHead className="font-medium text-slate-700">Last Updated</TableHead>
                <TableHead className="font-medium text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} className="border-slate-200/60">
                  <TableCell>
                    <Badge className={`${category.color} border-0`}>{category.name}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm max-w-xs">{category.description}</TableCell>
                  <TableCell className="text-slate-600 font-medium">{category.count}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">{category.status}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">{category.lastUpdated}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
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
