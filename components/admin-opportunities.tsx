"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { ScrollArea } from "./ui/scroll-area"
import type { Opportunity } from "./OpportunityCard"
import { Plus, Edit, Trash2, Star, MapPin, ExternalLink, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

interface AdminOpportunitiesProps {
  opportunities: Opportunity[]
  onUpdateOpportunities: (opportunities: Opportunity[]) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

interface OpportunityForm {
  title: string
  organization: string
  description: string
  category: string
  location: string
  deadline: string
  amount: string
  tags: string
  url: string
  featured: boolean
}

const initialForm: OpportunityForm = {
  title: "",
  organization: "",
  description: "",
  category: "Scholarships",
  location: "",
  deadline: "",
  amount: "",
  tags: "",
  url: "",
  featured: false,
}

export function AdminOpportunities({
  opportunities,
  onUpdateOpportunities,
  searchQuery,
  onSearchChange,
}: AdminOpportunitiesProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [formData, setFormData] = useState<OpportunityForm>(initialForm)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Filter and search opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesSearch =
        searchQuery === "" ||
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.organization.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = categoryFilter === "all" || opp.category.toLowerCase() === categoryFilter.toLowerCase()

      return matchesSearch && matchesCategory
    })
  }, [opportunities, searchQuery, categoryFilter])

  const categories = ["Scholarships", "Fellowships", "Grants", "Conferences", "Competitions"]

  const handleAddOpportunity = () => {
    const newOpportunity: Opportunity = {
      id: Date.now().toString(),
      title: formData.title,
      organization: formData.organization,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      deadline: formData.deadline,
      amount: formData.amount || undefined,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      url: formData.url,
      featured: formData.featured,
    }

    onUpdateOpportunities([...opportunities, newOpportunity])
    setFormData(initialForm)
    setIsAddModalOpen(false)
  }

  const handleEditOpportunity = () => {
    if (!selectedOpportunity) return

    const updatedOpportunity: Opportunity = {
      ...selectedOpportunity,
      title: formData.title,
      organization: formData.organization,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      deadline: formData.deadline,
      amount: formData.amount || undefined,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      url: formData.url,
      featured: formData.featured,
    }

    const updatedOpportunities = opportunities.map((opp) =>
      opp.id === selectedOpportunity.id ? updatedOpportunity : opp,
    )

    onUpdateOpportunities(updatedOpportunities)
    setFormData(initialForm)
    setSelectedOpportunity(null)
    setIsEditModalOpen(false)
  }

  const handleDeleteOpportunity = (id: string) => {
    if (confirm("Are you sure you want to delete this opportunity?")) {
      const updatedOpportunities = opportunities.filter((opp) => opp.id !== id)
      onUpdateOpportunities(updatedOpportunities)
    }
  }

  const handleEditClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity)
    setFormData({
      title: opportunity.title,
      organization: opportunity.organization,
      description: opportunity.description,
      category: opportunity.category,
      location: opportunity.location,
      deadline: opportunity.deadline,
      amount: opportunity.amount || "",
      tags: opportunity.tags.join(", "),
      url: opportunity.url,
      featured: opportunity.featured || false,
    })
    setIsEditModalOpen(true)
  }

  const toggleFeatured = (id: string) => {
    const updatedOpportunities = opportunities.map((opp) => (opp.id === id ? { ...opp, featured: !opp.featured } : opp))
    onUpdateOpportunities(updatedOpportunities)
  }

  const OpportunityForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <ScrollArea className="max-h-[70vh]">
      <div className="space-y-6 pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Opportunity title"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Organization</label>
            <Input
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              placeholder="Organization name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm">Category</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Location"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">Deadline</label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm">Amount (optional)</label>
            <Input
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g., $50,000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">URL</label>
            <Input
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm">Tags (comma separated)</label>
          <Input
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Graduate, Research, International"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="featured" className="text-sm">
            Feature this opportunity
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setFormData(initialForm)
              isEdit ? setIsEditModalOpen(false) : setIsAddModalOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={isEdit ? handleEditOpportunity : handleAddOpportunity}
            disabled={!formData.title || !formData.organization || !formData.description}
          >
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </ScrollArea>
  )

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-2">Opportunities</h1>
          <p className="text-muted-foreground">Manage all opportunity listings</p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Opportunity</DialogTitle>
            </DialogHeader>
            <OpportunityForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Opportunities Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {filteredOpportunities.length} {filteredOpportunities.length === 1 ? "opportunity" : "opportunities"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOpportunities.map((opportunity) => (
                  <TableRow key={opportunity.id} className="border-b">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {opportunity.featured && <Star className="w-4 h-4 text-amber-500 fill-current" />}
                        <div className="min-w-0">
                          <p className="truncate">{opportunity.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{opportunity.organization}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {opportunity.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {opportunity.location}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(opportunity.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const deadline = new Date(opportunity.deadline)
                        const now = new Date()
                        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                        if (diffDays < 0) {
                          return <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        } else if (diffDays <= 7) {
                          return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        } else {
                          return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        }
                      })()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(opportunity.url, "_blank")}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(opportunity)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleFeatured(opportunity.id)}>
                            <Star className="w-4 h-4 mr-2" />
                            {opportunity.featured ? "Unfeature" : "Feature"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteOpportunity(opportunity.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Opportunity</DialogTitle>
          </DialogHeader>
          <OpportunityForm isEdit={true} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
