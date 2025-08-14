"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { ScrollArea } from "./ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import type { Opportunity } from "./OpportunityCard"
import { Plus, Edit, Trash2, Star, MapPin, ExternalLink, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import Link from "next/link"

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
  aboutOpportunity: string
  requirements: string
  howToApply: string
  whatYouGet: string
  programStartDate: string
  programEndDate: string
  contactEmail: string
  eligibilityAge: string
  teamSize: string
  languageRequirements: string
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
  aboutOpportunity: "",
  requirements: "",
  howToApply: "",
  whatYouGet: "",
  programStartDate: "",
  programEndDate: "",
  contactEmail: "",
  eligibilityAge: "",
  teamSize: "",
  languageRequirements: "",
}

export function AdminOpportunities({
  opportunities,
  onUpdateOpportunities,
  searchQuery,
  onSearchChange,
}: AdminOpportunitiesProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [formData, setFormData] = useState<OpportunityForm>(initialForm)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

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
      aboutOpportunity: opportunity.aboutOpportunity || "",
      requirements: opportunity.requirements || "",
      howToApply: opportunity.howToApply || "",
      whatYouGet: opportunity.whatYouGet || "",
      programStartDate: opportunity.programStartDate || "",
      programEndDate: opportunity.programEndDate || "",
      contactEmail: opportunity.contactEmail || "",
      eligibilityAge: opportunity.eligibilityAge || "",
      teamSize: opportunity.teamSize || "",
      languageRequirements: opportunity.languageRequirements || "",
    })
    setIsEditModalOpen(true)
  }

  const toggleFeatured = (id: string) => {
    const updatedOpportunities = opportunities.map((opp) => (opp.id === id ? { ...opp, featured: !opp.featured } : opp))
    onUpdateOpportunities(updatedOpportunities)
  }

  const OpportunityForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <ScrollArea className="max-h-[80vh]">
      <div className="space-y-6 pr-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="dates">Dates & Contact</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Global Innovation Challenge 2025"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Organization *</label>
                <Input
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Tech for Good Foundation"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Brief Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief overview of the opportunity"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
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
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Global"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prize/Amount</label>
                <Input
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="$50,000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Application URL</label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://apply.example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Technology, Climate, Innovation"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="featured" className="text-sm font-medium">
                Feature this opportunity
              </label>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6 mt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">About This Opportunity</label>
              <Textarea
                value={formData.aboutOpportunity}
                onChange={(e) => setFormData({ ...formData, aboutOpportunity: e.target.value })}
                placeholder="Join the world's most prestigious innovation challenge focused on developing cutting-edge solutions for climate change..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">How to Apply</label>
              <Textarea
                value={formData.howToApply}
                onChange={(e) => setFormData({ ...formData, howToApply: e.target.value })}
                placeholder="Submit your application through our online portal including your team information, project proposal..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">What You'll Get</label>
              <Textarea
                value={formData.whatYouGet}
                onChange={(e) => setFormData({ ...formData, whatYouGet: e.target.value })}
                placeholder="$50,000 grand prize, Mentorship from industry leaders, Access to investor network..."
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="dates" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Application Deadline *</label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Program Start Date</label>
                <Input
                  type="date"
                  value={formData.programStartDate}
                  onChange={(e) => setFormData({ ...formData, programStartDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Program End Date</label>
                <Input
                  type="date"
                  value={formData.programEndDate}
                  onChange={(e) => setFormData({ ...formData, programEndDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Email</label>
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="innovation@techforgood.org"
              />
            </div>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-6 mt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Requirements</label>
              <Textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Must be 18-35 years old, Team of 2-5 members, Working prototype required..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Age Eligibility</label>
                <Input
                  value={formData.eligibilityAge}
                  onChange={(e) => setFormData({ ...formData, eligibilityAge: e.target.value })}
                  placeholder="18-35 years old"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Size</label>
                <Input
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                  placeholder="2-5 members"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Language Requirements</label>
                <Input
                  value={formData.languageRequirements}
                  onChange={(e) => setFormData({ ...formData, languageRequirements: e.target.value })}
                  placeholder="English proficiency required"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setFormData(initialForm)
              setIsEditModalOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditOpportunity}
            disabled={!formData.title || !formData.organization || !formData.description}
          >
            Update
          </Button>
        </div>
      </div>
    </ScrollArea>
  )

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-2">Opportunities</h1>
          <p className="text-muted-foreground">Manage all opportunity listings</p>
        </div>

        <Link href="/admin/opportunities/add">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Opportunity
          </Button>
        </Link>
      </div>

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
