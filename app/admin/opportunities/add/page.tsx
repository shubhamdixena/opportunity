"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"

interface OpportunityForm {
  title: string
  organization: string
  description: string
  category: string
  location: string
  deadline: string
  amounts: { type: string; value: string }[]
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
}

const initialForm: OpportunityForm = {
  title: "",
  organization: "",
  description: "",
  category: "Scholarships",
  location: "",
  deadline: "",
  amounts: [{ type: "Prize Amount", value: "" }],
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

  const fundingTypes = ["Full Funding", "Partial Funding", "No Funding", "Stipend", "Travel Grant", "Equipment Grant"]
  const amountTypes = [
    "Prize Amount",
    "Funding Amount",
    "Stipend",
    "Travel Allowance",
    "Equipment Budget",
    "Living Allowance",
  ]

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // TODO: Implement actual API call to save opportunity
    console.log("Creating opportunity:", formData)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    router.push("/admin/opportunities")
  }

  const handleCancel = () => {
    router.push("/admin/opportunities")
  }

  const addAmount = () => {
    setFormData({
      ...formData,
      amounts: [...formData.amounts, { type: "Prize Amount", value: "" }],
    })
  }

  const removeAmount = (index: number) => {
    if (formData.amounts.length > 1) {
      setFormData({
        ...formData,
        amounts: formData.amounts.filter((_, i) => i !== index),
      })
    }
  }

  const updateAmount = (index: number, field: "type" | "value", value: string) => {
    const newAmounts = [...formData.amounts]
    newAmounts[index][field] = value
    setFormData({ ...formData, amounts: newAmounts })
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/opportunities">
          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-slate-100">
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

      <Card className="border border-slate-200 shadow-xl bg-white">
        <CardContent className="p-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-100 p-1 rounded-lg">
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
                    className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Organization *</label>
                  <Input
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Tech for Good Foundation"
                    className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
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
                  className="resize-none border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500">
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
                    className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Funding Type</label>
                  <Select
                    value={formData.fundingType}
                    onValueChange={(value) => setFormData({ ...formData, fundingType: value })}
                  >
                    <SelectTrigger className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500">
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
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Amounts</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAmount}
                    className="h-8 px-3 text-xs bg-transparent"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Amount
                  </Button>
                </div>
                {formData.amounts.map((amount, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Select value={amount.type} onValueChange={(value) => updateAmount(index, "type", value)}>
                        <SelectTrigger className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {amountTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        value={amount.value}
                        onChange={(e) => updateAmount(index, "value", e.target.value)}
                        placeholder="$50,000 or $10,000 - $50,000"
                        className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                      />
                    </div>
                    {formData.amounts.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAmount(index)}
                        className="h-12 w-12 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Application URL</label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://apply.example.com"
                    className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Tags (comma separated)</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Technology, Climate, Innovation"
                    className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Eligible Countries/Nations</label>
                <Input
                  value={formData.eligibleCountries}
                  onChange={(e) => setFormData({ ...formData, eligibleCountries: e.target.value })}
                  placeholder="Global, USA, EU, Developing Countries, etc."
                  className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
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
                  className="resize-none border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">How to Apply</label>
                <Textarea
                  value={formData.howToApply}
                  onChange={(e) => setFormData({ ...formData, howToApply: e.target.value })}
                  placeholder="Submit your application through our online portal including your team information, project proposal..."
                  rows={5}
                  className="resize-none border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">What You'll Get</label>
                <Textarea
                  value={formData.whatYouGet}
                  onChange={(e) => setFormData({ ...formData, whatYouGet: e.target.value })}
                  placeholder="$50,000 grand prize, Mentorship from industry leaders, Access to investor network..."
                  rows={5}
                  className="resize-none border-slate-300 focus:border-slate-500 focus:ring-slate-500"
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
                    className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Program Start Date</label>
                  <Input
                    type="date"
                    value={formData.programStartDate}
                    onChange={(e) => setFormData({ ...formData, programStartDate: e.target.value })}
                    className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Program End Date</label>
                  <Input
                    type="date"
                    value={formData.programEndDate}
                    onChange={(e) => setFormData({ ...formData, programEndDate: e.target.value })}
                    className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
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
                  className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
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
                  className="resize-none border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Age Eligibility</label>
                  <Input
                    value={formData.eligibilityAge}
                    onChange={(e) => setFormData({ ...formData, eligibilityAge: e.target.value })}
                    placeholder="18-35 years old"
                    className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Language Requirements</label>
                  <Input
                    value={formData.languageRequirements}
                    onChange={(e) => setFormData({ ...formData, languageRequirements: e.target.value })}
                    placeholder="English proficiency required"
                    className="h-12 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4 pt-8 mt-8 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-8 h-12 border-slate-300 hover:bg-slate-50 bg-transparent"
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
