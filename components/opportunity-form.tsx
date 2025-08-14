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
      url: opportunity?.url || "",
      tags: opportunity?.tags || [],
      featured: opportunity?.featured || false,
    })
  }, [opportunity])

  const categories = ["Scholarships", "Fellowships", "Grants", "Conferences", "Competitions"]

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
                  value={Array.isArray(formData.tags) ? formData.tags.join(", ") : ""}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map((t) => t.trim()) })}
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
