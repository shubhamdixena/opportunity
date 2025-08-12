import { Edit, Trash2, Eye, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminHeader, AdminStatsCard, AdminSearch } from "@/components/admin-layout"

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
    datePosted: "January 10, 2025",
    featured: true,
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
    datePosted: "January 8, 2025",
    featured: false,
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
    datePosted: "January 5, 2025",
    featured: true,
  },
  {
    id: 4,
    title: "Healthcare Innovation Grant",
    organization: "Medical Research Foundation",
    type: "Grant",
    status: "Active",
    deadline: "February 15, 2025",
    applications: 78,
    views: 445,
    datePosted: "December 20, 2024",
    featured: false,
  },
  {
    id: 5,
    title: "Digital Arts Residency Program",
    organization: "Creative Hub",
    type: "Residency",
    status: "Closed",
    deadline: "January 30, 2025",
    applications: 234,
    views: 1100,
    datePosted: "November 15, 2024",
    featured: false,
  },
]

export default function OpportunitiesManagementPage() {
  return (
    <div className="p-6">
      <AdminHeader
        title="Posted Opportunities"
        description="Manage all posted opportunities and their performance"
        buttonText="Add New Opportunity"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <AdminStatsCard value="5" label="Total Posted" />
        <AdminStatsCard value="3" label="Active" color="text-green-600" />
        <AdminStatsCard value="1" label="Draft" color="text-yellow-600" />
        <AdminStatsCard value="1" label="Closed" color="text-red-600" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <AdminSearch placeholder="Search posted opportunities..." />
        <Button variant="outline" className="glass-input bg-transparent">
          <Filter className="h-4 w-4 mr-2" />
          Filter by Status
        </Button>
      </div>

      <Card className="glass-card">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200/60">
              <TableHead className="font-medium text-slate-700">Opportunity</TableHead>
              <TableHead className="font-medium text-slate-700">Type</TableHead>
              <TableHead className="font-medium text-slate-700">Status</TableHead>
              <TableHead className="font-medium text-slate-700">Posted Date</TableHead>
              <TableHead className="font-medium text-slate-700">Deadline</TableHead>
              <TableHead className="font-medium text-slate-700">Applications</TableHead>
              <TableHead className="font-medium text-slate-700">Views</TableHead>
              <TableHead className="font-medium text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((opportunity) => (
              <TableRow key={opportunity.id} className="border-slate-200/60">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-slate-800">{opportunity.title}</p>
                      <p className="text-sm text-slate-500">{opportunity.organization}</p>
                    </div>
                    {opportunity.featured && (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Featured</Badge>
                    )}
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
                        ? "bg-green-100 text-green-700 border-0"
                        : opportunity.status === "Draft"
                          ? "bg-yellow-100 text-yellow-700 border-0"
                          : "bg-red-100 text-red-700 border-0"
                    }
                  >
                    {opportunity.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-600 text-sm">{opportunity.datePosted}</TableCell>
                <TableCell className="text-slate-600 text-sm">{opportunity.deadline}</TableCell>
                <TableCell className="text-slate-600 font-medium">{opportunity.applications}</TableCell>
                <TableCell className="text-slate-600">{opportunity.views}</TableCell>
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
      </Card>
    </div>
  )
}
