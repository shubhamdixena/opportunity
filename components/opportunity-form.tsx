"use client"

import { useState, useEffect } from "react"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import type { Opportunity } from "./opportunity-card"

interface OpportunityFormProps {
  opportunity?: Opportunity
  onSubmit: (opportunity: Opportunity) => void
  onCancel: () => void
}

export default function OpportunityForm({ opportunity, onSubmit, onCancel }: OpportunityFormProps) {
  const [formData, setFormData] = useState<Opportunity>({
    title: opportunity?.title || "",
    organization: opportunity?.organization || "",
    description: opportunity?.description || "",
    category: opportunity?.category || "",
    location: opportunity?.location || "",
    amount: opportunity?.amount || "",
    fundingType: opportunity?.fundingType || "Full Funding",
    singleAmount: opportunity?.singleAmount || "",
    minAmount: opportunity?.minAmount || "",
    maxAmount: opportunity?.maxAmount || "",
    eligibleRegions: opportunity?.eligibleRegions || "",
    about: opportunity?.about || "",
    applyLink: opportunity?.applyLink || "",
    whatYouGet: opportunity?.whatYouGet || "",
    deadline: opportunity?.deadline || "",
    startDate: opportunity?.startDate || "",
    endDate: opportunity?.endDate || "",
    contactEmail: opportunity?.contactEmail || "",
    eligibility: opportunity?.eligibility || "",
    ageRequirement: opportunity?.ageRequirement || "",
    languageRequirement: opportunity?.languageRequirement || "",
    url: opportunity?.url || "",
    tags: opportunity?.tags || [],
    featured: opportunity?.featured || false,
  })

  useEffect(() => {
    setFormData({
      title: opportunity?.title || "",
      organization: opportunity?.organization || "",
      description: opportunity?.description || "",
      category: opportunity?.category || "",
      location: opportunity?.location || "",
      amount: opportunity?.amount || "",
      fundingType: opportunity?.fundingType || "Full Funding",
      singleAmount: opportunity?.singleAmount || "",
      minAmount: opportunity?.minAmount || "",
      maxAmount: opportunity?.maxAmount || "",
      eligibleRegions: opportunity?.eligibleRegions || "",
      about: opportunity?.about || "",
      applyLink: opportunity?.applyLink || "",
      whatYouGet: opportunity?.whatYouGet || "",
      deadline: opportunity?.deadline || "",
      startDate: opportunity?.startDate || "",
      endDate: opportunity?.endDate || "",
      contactEmail: opportunity?.contactEmail || "",
      eligibility: opportunity?.eligibility || "",
      ageRequirement: opportunity?.ageRequirement || "",
      languageRequirement: opportunity?.languageRequirement || "",
      url: opportunity?.url || "",
      tags: opportunity?.tags || [],
      featured: opportunity?.featured || false,
    })
  }, [opportunity])

  const categories = ["Scholarships", "Fellowships", "Grants", "Conferences", "Competitions"]
  const fundingTypes = ["Full Funding", "Partial Funding", "Stipend", "Travel Grant"]

  const handleSubmit = () => {
    onSubmit(formData)
  }

  return (
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
                <label className="text-sm font-medium">Funding Type</label>
                <Select
                  value={formData.fundingType}
                  onValueChange={(value) => setFormData({ ...formData, fundingType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fundingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount Details</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  value={formData.singleAmount}
                  onChange={(e) => setFormData({ ...formData, singleAmount: e.target.value })}
                  placeholder="Single Amount"
                />
                <Input
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                  placeholder="Minimum Amount"
                />
                <Input
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                  placeholder="Maximum Amount"
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
                  value={Array.isArray(formData.tags) ? formData.tags.join(", ") : ""}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map((t) => t.trim()) })}
                  placeholder="Technology, Climate, Innovation"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Eligible Countries/Regions</label>
              <Input
                value={formData.eligibleRegions}
                onChange={(e) => setFormData({ ...formData, eligibleRegions: e.target.value })}
                placeholder="Global, USA, EU, Asia-Pacific, etc."
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
              <label htmlFor="featured" className="text-sm font-medium">
                Feature this opportunity on the homepage
              </label>
            </div>
          </TabsContent>
          <TabsContent value="details" className="space-y-6 mt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">About This Opportunity</label>
              <Textarea
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                placeholder="Join the world's most prestigious innovation challenge focused on developing cutting-edge solutions for climate change..."
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">How to Apply</label>
              <Textarea
                value={formData.applyLink}
                onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                placeholder="Submit your application through our online portal including your team information, project proposal..."
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">What You'll Get</label>
              <Textarea
                value={formData.whatYouGet}
                onChange={(e) => setFormData({ ...formData, whatYouGet: e.target.value })}
                placeholder="$50,000 grand prize, Mentorship from industry leaders, Access to investor network..."
                rows={5}
              />
            </div>
          </TabsContent>
          <TabsContent value="dates" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Application Deadline *</label>
                <Input
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  placeholder="dd/mm/yyyy"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Program Start Date</label>
                <Input
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  placeholder="dd/mm/yyyy"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Program End Date</label>
                <Input
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Email</label>
              <Input
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
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                placeholder="Must be 18-35 years old, Working prototype required..."
                rows={5}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Age Eligibility</label>
                <Input
                  value={formData.ageRequirement}
                  onChange={(e) => setFormData({ ...formData, ageRequirement: e.target.value })}
                  placeholder="18-35 years old"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Language Requirements</label>
                <Input
                  value={formData.languageRequirement}
                  onChange={(e) => setFormData({ ...formData, languageRequirement: e.target.value })}
                  placeholder="English proficiency required"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title || !formData.organization || !formData.description}>
            {opportunity ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}
