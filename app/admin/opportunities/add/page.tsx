"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

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
  languageRequirements: string
  fundingType: string
  eligibleCountries: string
  minAmount: string
  maxAmount: string
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
  languageRequirements: "",
  fundingType: "Full Funding",
  eligibleCountries: "",
  minAmount: "",
  maxAmount: "",
}

export default function AddOpportunityPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<OpportunityForm>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    "Scholarships",
    "Fellowships",
    "Grants",
    "Conferences",
    "Competitions",
    "Exchange Program",
    "Forum",
    "Misc",
  ]

  const fundingTypes = ["Full Funding", "Partial Funding", "Prize Money", "Stipend", "Grant", "Variable Amount"]

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create opportunity')
      }

      const result = await response.json()
      
      if (result.success) {
        router.push("/admin/opportunities")
      } else {
        throw new Error(result.error || 'Failed to create opportunity')
      }
    } catch (error) {
      console.error("Error creating opportunity:", error)
      alert("Failed to create opportunity. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/admin/opportunities")
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/opportunities">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Add New Opportunity
          </h1>
          <p className="text-slate-600 mt-1">Create a comprehensive opportunity listing</p>
        </div>
      </div>

      <Card className="border border-slate-200/60 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardContent className="p-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-100/80 p-1 rounded-lg">
              <TabsTrigger value="basic" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Details
              </TabsTrigger>
              <TabsTrigger value="dates" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Dates & Contact
              </TabsTrigger>
              <TabsTrigger value="requirements" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Requirements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Global Innovation Challenge 2025"
                    className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Organization *</label>
                  <Input
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Tech for Good Foundation"
                    className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Brief Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief overview of the opportunity"
                  rows={4}
                  className="resize-none border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="h-12 border-slate-200 focus:border-slate-400">
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
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Global"
                    className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Funding Type</label>
                  <Select
                    value={formData.fundingType}
                    onValueChange={(value) => setFormData({ ...formData, fundingType: value })}
                  >
                    <SelectTrigger className="h-12 border-slate-200 focus:border-slate-400">
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

              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700">Amount Details</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-600">Single Amount</label>
                    <Input
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="$50,000"
                      className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-600">Minimum Amount</label>
                    <Input
                      value={formData.minAmount}
                      onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                      placeholder="$10,000"
                      className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-600">Maximum Amount</label>
                    <Input
                      value={formData.maxAmount}
                      onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                      placeholder="$100,000"
                      className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Application URL</label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://apply.example.com"
                    className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Tags (comma separated)</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Technology, Climate, Innovation"
                    className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Eligible Countries/Regions</label>
                <Input
                  value={formData.eligibleCountries}
                  onChange={(e) => setFormData({ ...formData, eligibleCountries: e.target.value })}
                  placeholder="Global, USA, EU, Asia-Pacific, etc."
                  className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-slate-600 focus:ring-slate-400/20"
                />
                <label htmlFor="featured" className="text-sm font-medium text-slate-700">
                  Feature this opportunity on the homepage
                </label>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">About This Opportunity</label>
                <Textarea
                  value={formData.aboutOpportunity}
                  onChange={(e) => setFormData({ ...formData, aboutOpportunity: e.target.value })}
                  placeholder="Join the world's most prestigious innovation challenge focused on developing cutting-edge solutions for climate change..."
                  rows={5}
                  className="resize-none border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">How to Apply</label>
                <Textarea
                  value={formData.howToApply}
                  onChange={(e) => setFormData({ ...formData, howToApply: e.target.value })}
                  placeholder="Submit your application through our online portal including your team information, project proposal..."
                  rows={5}
                  className="resize-none border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">What You'll Get</label>
                <Textarea
                  value={formData.whatYouGet}
                  onChange={(e) => setFormData({ ...formData, whatYouGet: e.target.value })}
                  placeholder="$50,000 grand prize, Mentorship from industry leaders, Access to investor network..."
                  rows={5}
                  className="resize-none border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                />
              </div>
            </TabsContent>

            <TabsContent value="dates" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Application Deadline *</label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Program Start Date</label>
                  <Input
                    type="date"
                    value={formData.programStartDate}
                    onChange={(e) => setFormData({ ...formData, programStartDate: e.target.value })}
                    className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Program End Date</label>
                  <Input
                    type="date"
                    value={formData.programEndDate}
                    onChange={(e) => setFormData({ ...formData, programEndDate: e.target.value })}
                    className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Contact Email</label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="innovation@techforgood.org"
                  className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                />
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Requirements</label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Must be 18-35 years old, Working prototype required..."
                  rows={5}
                  className="resize-none border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Age Eligibility</label>
                  <Input
                    value={formData.eligibilityAge}
                    onChange={(e) => setFormData({ ...formData, eligibilityAge: e.target.value })}
                    placeholder="18-35 years old"
                    className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Language Requirements</label>
                  <Input
                    value={formData.languageRequirements}
                    onChange={(e) => setFormData({ ...formData, languageRequirements: e.target.value })}
                    placeholder="English proficiency required"
                    className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4 pt-8 mt-8 border-t border-slate-200/60">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-8 h-12 border-slate-200 hover:bg-slate-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.organization || !formData.description || isSubmitting}
              className="px-8 h-12 bg-slate-900 hover:bg-slate-800"
            >
              {isSubmitting ? "Creating..." : "Create Opportunity"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
