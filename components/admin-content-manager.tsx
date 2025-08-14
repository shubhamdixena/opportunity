"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Plus,
  Play,
  Trash2,
  ExternalLink,
  Globe,
  Calendar,
  TrendingUp,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  TestTube,
  Save,
  AlertCircle,
} from "lucide-react"

// Types
interface ContentSource {
  id: string
  name: string
  domain: string
  is_active: boolean
  keywords: string[]
  last_scraped: string | null
  posts_found: number
  success_rate: number
  scraping_config?: {
    selectors?: {
      title?: string
      content?: string
      description?: string
    }
    delay?: number
    max_pages?: number
  }
  created_at?: string
  updated_at?: string
}

interface ContentCampaign {
  id: string
  name: string
  source_ids: string[]
  keywords: string[]
  category: string
  frequency: number
  frequency_unit: "minutes" | "hours" | "days"
  is_active: boolean
  max_posts: number
  current_posts: number
  filters: {
    min_length?: number
    max_length?: number
    required_words?: string[]
    banned_words?: string[]
    skip_duplicates?: boolean
  }
  ai_settings: {
    rewrite?: boolean
    quality_check?: boolean
    seo_optimize?: boolean
    translate_to?: string
  }
  created_at?: string
  updated_at?: string
}

interface TestResult {
  success: boolean
  title?: string
  content?: string
  error?: string
  url?: string
  responseTime?: number
}

export function AdminContentManager() {
  const [activeTab, setActiveTab] = useState("campaigns")
  const [sources, setSources] = useState<ContentSource[]>([])
  const [campaigns, setCampaigns] = useState<ContentCampaign[]>([])
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})

  // Modal states
  const [showSourceModal, setShowSourceModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [editingSource, setEditingSource] = useState<ContentSource | null>(null)
  const [editingCampaign, setEditingCampaign] = useState<ContentCampaign | null>(null)

  // Form states
  const [sourceForm, setSourceForm] = useState({
    name: "",
    domain: "",
    keywords: "",
    is_active: true,
    scraping_config: {
      delay: 1000,
      max_pages: 10,
      selectors: {
        title: "",
        content: "",
        description: "",
      },
    },
  })

  const [campaignForm, setCampaignForm] = useState({
    name: "",
    category: "Scholarships",
    frequency: 6,
    frequency_unit: "hours" as const,
    max_posts: 50,
    keywords: "",
    source_ids: [] as string[],
    filters: {
      min_length: 100,
      max_length: 10000,
      required_words: "",
      banned_words: "",
      skip_duplicates: true,
    },
    ai_settings: {
      rewrite: true,
      quality_check: true,
      seo_optimize: true,
      translate_to: "",
    },
  })

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

  useEffect(() => {
    loadSources()
    loadCampaigns()
  }, [])

  const loadSources = async () => {
    try {
      const response = await fetch("/api/content-manager/sources")
      if (response.ok) {
        const data = await response.json()
        setSources(data.sources || [])
      }
    } catch (error) {
      console.error("Failed to load sources:", error)
    }
  }

  const loadCampaigns = async () => {
    try {
      const response = await fetch("/api/content-manager/campaigns")
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error("Failed to load campaigns:", error)
    }
  }

  const testSource = async (source: ContentSource | typeof sourceForm) => {
    const sourceId = "id" in source ? source.id : "test"
    setTestResults((prev) => ({ ...prev, [sourceId]: { success: false } }))

    try {
      const testUrl = `https://${source.domain}`
      const response = await fetch("/api/content-manager/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "scrape_single",
          url: testUrl,
          config: "scraping_config" in source ? source.scraping_config : sourceForm.scraping_config,
        }),
      })

      const result = await response.json()

      setTestResults((prev) => ({
        ...prev,
        [sourceId]: {
          success: result.success,
          title: result.scrapedContent?.title,
          content: result.scrapedContent?.content?.slice(0, 200) + "...",
          error: result.error,
          url: testUrl,
          responseTime: result.responseTime,
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [sourceId]: {
          success: false,
          error: error instanceof Error ? error.message : "Test failed",
        },
      }))
    }
  }

  const saveSource = async () => {
    setLoading(true)
    try {
      const url = editingSource ? `/api/content-manager/sources/${editingSource.id}` : "/api/content-manager/sources"

      const method = editingSource ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sourceForm,
          keywords: sourceForm.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        }),
      })

      if (response.ok) {
        await loadSources()
        resetSourceForm()
        setShowSourceModal(false)
      } else {
        const error = await response.json()
        alert(`Failed to save source: ${error.error}`)
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const saveCampaign = async () => {
    setLoading(true)
    try {
      const url = editingCampaign
        ? `/api/content-manager/campaigns/${editingCampaign.id}`
        : "/api/content-manager/campaigns"

      const method = editingCampaign ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...campaignForm,
          keywords: campaignForm.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          filters: {
            ...campaignForm.filters,
            required_words: campaignForm.filters.required_words
              .split(",")
              .map((w) => w.trim())
              .filter(Boolean),
            banned_words: campaignForm.filters.banned_words
              .split(",")
              .map((w) => w.trim())
              .filter(Boolean),
          },
        }),
      })

      if (response.ok) {
        await loadCampaigns()
        resetCampaignForm()
        setShowCampaignModal(false)
      } else {
        const error = await response.json()
        alert(`Failed to save campaign: ${error.error}`)
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const runCampaign = async (campaignId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/content-manager/campaigns/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, action: "start" }),
      })

      const result = await response.json()

      if (result.success) {
        alert(`Campaign started successfully! Run ID: ${result.runId}`)
        await loadCampaigns()
      } else {
        alert(`Failed to start campaign: ${result.error}`)
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const deleteSource = async (sourceId: string) => {
    if (!confirm("Are you sure you want to delete this source?")) return

    try {
      const response = await fetch(`/api/content-manager/sources/${sourceId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadSources()
      } else {
        alert("Failed to delete source")
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return

    try {
      const response = await fetch(`/api/content-manager/campaigns/${campaignId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadCampaigns()
      } else {
        alert("Failed to delete campaign")
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const editSource = (source: ContentSource) => {
    setEditingSource(source)
    setSourceForm({
      name: source.name,
      domain: source.domain,
      keywords: source.keywords.join(", "),
      is_active: source.is_active,
      scraping_config: source.scraping_config || {
        delay: 1000,
        max_pages: 10,
        selectors: { title: "", content: "", description: "" },
      },
    })
    setShowSourceModal(true)
  }

  const editCampaign = (campaign: ContentCampaign) => {
    setEditingCampaign(campaign)
    setCampaignForm({
      name: campaign.name,
      category: campaign.category,
      frequency: campaign.frequency,
      frequency_unit: campaign.frequency_unit,
      max_posts: campaign.max_posts,
      keywords: campaign.keywords.join(", "),
      source_ids: campaign.source_ids,
      filters: {
        ...campaign.filters,
        required_words: campaign.filters.required_words?.join(", ") || "",
        banned_words: campaign.filters.banned_words?.join(", ") || "",
      },
      ai_settings: campaign.ai_settings,
    })
    setShowCampaignModal(true)
  }

  const resetSourceForm = () => {
    setSourceForm({
      name: "",
      domain: "",
      keywords: "",
      is_active: true,
      scraping_config: {
        delay: 1000,
        max_pages: 10,
        selectors: { title: "", content: "", description: "" },
      },
    })
    setEditingSource(null)
  }

  const resetCampaignForm = () => {
    setCampaignForm({
      name: "",
      category: "Scholarships",
      frequency: 6,
      frequency_unit: "hours",
      max_posts: 50,
      keywords: "",
      source_ids: [],
      filters: {
        min_length: 100,
        max_length: 10000,
        required_words: "",
        banned_words: "",
        skip_duplicates: true,
      },
      ai_settings: {
        rewrite: true,
        quality_check: true,
        seo_optimize: true,
        translate_to: "",
      },
    })
    setEditingCampaign(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Manager</h2>
          <p className="text-gray-600">Manage automated content scraping campaigns</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="sources" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Sources
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Scraping Campaigns</h3>
            <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
              <DialogTrigger asChild>
                <Button onClick={resetCampaignForm} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto border-0 shadow-2xl">
                <DialogHeader className="border-b pb-4 mb-6">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    {editingCampaign ? (
                      <>
                        <Settings className="w-5 h-5 text-blue-600" />
                        Edit Campaign: {editingCampaign.name}
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-blue-600" />
                        Create New Campaign
                      </>
                    )}
                  </DialogTitle>
                  {editingCampaign && (
                    <p className="text-sm text-gray-600 mt-1">
                      Configure automated content scraping settings for this campaign
                    </p>
                  )}
                </DialogHeader>

                <div className="space-y-8">
                  <div className="bg-gray-50 p-6 rounded-lg border">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Campaign Name</label>
                        <Input
                          value={campaignForm.name}
                          onChange={(e) => setCampaignForm((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Tech Scholarships Weekly"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
                        <Select
                          value={campaignForm.category}
                          onValueChange={(value) => setCampaignForm((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Schedule & Automation
                    </h4>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Run Every</label>
                        <Input
                          type="number"
                          value={campaignForm.frequency}
                          onChange={(e) =>
                            setCampaignForm((prev) => ({ ...prev, frequency: Number.parseInt(e.target.value) }))
                          }
                          min="1"
                          className="border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Time Unit</label>
                        <Select
                          value={campaignForm.frequency_unit}
                          onValueChange={(value: any) =>
                            setCampaignForm((prev) => ({ ...prev, frequency_unit: value }))
                          }
                        >
                          <SelectTrigger className="border-gray-300 focus:border-blue-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Max Items per Run</label>
                        <Input
                          type="number"
                          value={campaignForm.max_posts}
                          onChange={(e) =>
                            setCampaignForm((prev) => ({ ...prev, max_posts: Number.parseInt(e.target.value) }))
                          }
                          min="1"
                          className="border-gray-300 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-green-600" />
                      Content Sources
                    </h4>
                    <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto border rounded-lg p-4 bg-white">
                      {sources.map((source) => (
                        <label
                          key={source.id}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={campaignForm.source_ids.includes(source.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCampaignForm((prev) => ({
                                  ...prev,
                                  source_ids: [...prev.source_ids, source.id],
                                }))
                              } else {
                                setCampaignForm((prev) => ({
                                  ...prev,
                                  source_ids: prev.source_ids.filter((id) => id !== source.id),
                                }))
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">{source.name}</span>
                          <Badge variant={source.is_active ? "default" : "secondary"} className="text-xs">
                            {source.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </label>
                      ))}
                    </div>
                    {sources.length === 0 && (
                      <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                        <Globe className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          No sources available. Create sources first in the Sources tab.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Target Keywords</label>
                    <Textarea
                      value={campaignForm.keywords}
                      onChange={(e) => setCampaignForm((prev) => ({ ...prev, keywords: e.target.value }))}
                      placeholder="scholarship, funding, education, grant, fellowship, opportunity"
                      className="border-gray-300 focus:border-blue-500 min-h-[80px]"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate keywords with commas. These will be used to filter relevant content.
                    </p>
                  </div>

                  {/* Content Filters */}
                  <div className="space-y-6 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-yellow-600" />
                      Content Filters
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Min Content Length</label>
                        <Input
                          type="number"
                          value={campaignForm.filters.min_length}
                          onChange={(e) =>
                            setCampaignForm((prev) => ({
                              ...prev,
                              filters: { ...prev.filters, min_length: Number.parseInt(e.target.value) },
                            }))
                          }
                          className="border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Max Content Length</label>
                        <Input
                          type="number"
                          value={campaignForm.filters.max_length}
                          onChange={(e) =>
                            setCampaignForm((prev) => ({
                              ...prev,
                              filters: { ...prev.filters, max_length: Number.parseInt(e.target.value) },
                            }))
                          }
                          className="border-gray-300 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Required Words</label>
                        <Input
                          value={campaignForm.filters.required_words}
                          onChange={(e) =>
                            setCampaignForm((prev) => ({
                              ...prev,
                              filters: { ...prev.filters, required_words: e.target.value },
                            }))
                          }
                          placeholder="must, contain, these"
                          className="border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Banned Words</label>
                        <Input
                          value={campaignForm.filters.banned_words}
                          onChange={(e) =>
                            setCampaignForm((prev) => ({
                              ...prev,
                              filters: { ...prev.filters, banned_words: e.target.value },
                            }))
                          }
                          placeholder="spam, scam, fake"
                          className="border-gray-300 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <label className="flex items-center space-x-3">
                      <Switch
                        checked={campaignForm.filters.skip_duplicates}
                        onCheckedChange={(checked) =>
                          setCampaignForm((prev) => ({
                            ...prev,
                            filters: { ...prev.filters, skip_duplicates: checked },
                          }))
                        }
                        className="border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Skip duplicate content</span>
                    </label>
                  </div>

                  {/* AI Settings */}
                  <div className="space-y-6 bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <TestTube className="w-4 h-4 text-purple-600" />
                      AI Processing Settings
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <label className="flex items-center space-x-3">
                        <Switch
                          checked={campaignForm.ai_settings.rewrite}
                          onCheckedChange={(checked) =>
                            setCampaignForm((prev) => ({
                              ...prev,
                              ai_settings: { ...prev.ai_settings, rewrite: checked },
                            }))
                          }
                          className="border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Rewrite content</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <Switch
                          checked={campaignForm.ai_settings.quality_check}
                          onCheckedChange={(checked) =>
                            setCampaignForm((prev) => ({
                              ...prev,
                              ai_settings: { ...prev.ai_settings, quality_check: checked },
                            }))
                          }
                          className="border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Quality check</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <Switch
                          checked={campaignForm.ai_settings.seo_optimize}
                          onCheckedChange={(checked) =>
                            setCampaignForm((prev) => ({
                              ...prev,
                              ai_settings: { ...prev.ai_settings, seo_optimize: checked },
                            }))
                          }
                          className="border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">SEO optimization</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t bg-gray-50 -mx-6 px-6 -mb-6 pb-6">
                    <div className="text-sm text-gray-600">
                      {editingCampaign ? "Update campaign settings" : "Create new automated campaign"}
                    </div>
                    <div className="flex space-x-3">
                      <Button variant="outline" onClick={() => setShowCampaignModal(false)} className="border-gray-300">
                        Cancel
                      </Button>
                      <Button
                        onClick={saveCampaign}
                        disabled={loading || !campaignForm.name || campaignForm.source_ids.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {editingCampaign ? "Update Campaign" : "Create Campaign"}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {campaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {campaign.name}
                        <Badge variant={campaign.is_active ? "default" : "secondary"} className="ml-2">
                          {campaign.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Every {campaign.frequency} {campaign.frequency_unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>
                            {campaign.current_posts}/{campaign.max_posts} items
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {campaign.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editCampaign(campaign)}
                        className="hover:bg-blue-50 hover:border-blue-300"
                        title={`Edit ${campaign.name} settings`}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => runCampaign(campaign.id)}
                        disabled={loading || !campaign.is_active}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                        title={`Run ${campaign.name} now`}
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                        title={`Delete ${campaign.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Sources: </span>
                      <span className="text-gray-600">
                        {campaign.source_ids
                          .map((sourceId) => {
                            const source = sources.find((s) => s.id === sourceId)
                            return source?.name
                          })
                          .filter(Boolean)
                          .join(", ") || "No sources"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Keywords: </span>
                      <span className="text-gray-600">
                        {campaign.keywords.slice(0, 3).join(", ")}
                        {campaign.keywords.length > 3 && ` +${campaign.keywords.length - 3} more`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {campaigns.length === 0 && (
              <Card className="shadow-sm">
                <CardContent className="text-center py-10">
                  <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first scraping campaign to automate content discovery
                  </p>
                  <Button
                    onClick={() => setShowCampaignModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Content Sources</h3>
            <Dialog open={showSourceModal} onOpenChange={setShowSourceModal}>
              <DialogTrigger asChild>
                <Button onClick={resetSourceForm} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Source
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
                <DialogHeader className="border-b pb-4 mb-6">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    {editingSource ? (
                      <>
                        <Settings className="w-5 h-5 text-blue-600" />
                        Edit Source: {editingSource.name}
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-blue-600" />
                        Add New Source
                      </>
                    )}
                  </DialogTitle>
                  {editingSource && (
                    <p className="text-sm text-gray-600 mt-1">Configure website scraping settings for this source</p>
                  )}
                </DialogHeader>

                <div className="space-y-8">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-6 rounded-lg border">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Source Name</label>
                        <Input
                          value={sourceForm.name}
                          onChange={(e) => setSourceForm((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., MIT Scholarships"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Domain</label>
                        <Input
                          value={sourceForm.domain}
                          onChange={(e) => setSourceForm((prev) => ({ ...prev, domain: e.target.value }))}
                          placeholder="e.g., scholarships.mit.edu"
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Target Keywords</label>
                    <Textarea
                      value={sourceForm.keywords}
                      onChange={(e) => setSourceForm((prev) => ({ ...prev, keywords: e.target.value }))}
                      placeholder="scholarship, funding, grant, education"
                      className="border-gray-300 focus:border-blue-500 min-h-[80px]"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate keywords with commas. These will be used to filter relevant content.
                    </p>
                  </div>

                  {/* Scraping Configuration */}
                  <div className="space-y-6 bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-blue-600" />
                      Scraping Configuration
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Delay (ms)</label>
                        <Input
                          type="number"
                          value={sourceForm.scraping_config.delay}
                          onChange={(e) =>
                            setSourceForm((prev) => ({
                              ...prev,
                              scraping_config: { ...prev.scraping_config, delay: Number.parseInt(e.target.value) },
                            }))
                          }
                          min="100"
                          className="border-gray-300 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Max Pages</label>
                        <Input
                          type="number"
                          value={sourceForm.scraping_config.max_pages}
                          onChange={(e) =>
                            setSourceForm((prev) => ({
                              ...prev,
                              scraping_config: { ...prev.scraping_config, max_pages: Number.parseInt(e.target.value) },
                            }))
                          }
                          min="1"
                          className="border-gray-300 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">Custom Selectors (optional)</label>
                      <Input
                        placeholder="Title selector (e.g., h1, .title)"
                        value={sourceForm.scraping_config.selectors.title}
                        onChange={(e) =>
                          setSourceForm((prev) => ({
                            ...prev,
                            scraping_config: {
                              ...prev.scraping_config,
                              selectors: { ...prev.scraping_config.selectors, title: e.target.value },
                            },
                          }))
                        }
                        className="border-gray-300 focus:border-blue-500"
                      />
                      <Input
                        placeholder="Content selector (e.g., .content, main)"
                        value={sourceForm.scraping_config.selectors.content}
                        onChange={(e) =>
                          setSourceForm((prev) => ({
                            ...prev,
                            scraping_config: {
                              ...prev.scraping_config,
                              selectors: { ...prev.scraping_config.selectors, content: e.target.value },
                            },
                          }))
                        }
                        className="border-gray-300 focus:border-blue-500"
                      />
                      <Input
                        placeholder="Description selector (e.g., .description, .summary)"
                        value={sourceForm.scraping_config.selectors.description}
                        onChange={(e) =>
                          setSourceForm((prev) => ({
                            ...prev,
                            scraping_config: {
                              ...prev.scraping_config,
                              selectors: { ...prev.scraping_config.selectors, description: e.target.value },
                            },
                          }))
                        }
                        className="border-gray-300 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={sourceForm.is_active}
                      onCheckedChange={(checked) => setSourceForm((prev) => ({ ...prev, is_active: checked }))}
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Active source</span>
                  </div>

                  {/* Test Results */}
                  {testResults["test"] && (
                    <div className="p-4 border rounded-lg bg-white shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        {testResults["test"].success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium text-gray-900">
                          {testResults["test"].success ? "Test Successful" : "Test Failed"}
                        </span>
                      </div>
                      {testResults["test"].success ? (
                        <div className="text-sm space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">Title:</span> {testResults["test"].title}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Content Preview:</span>{" "}
                            {testResults["test"].content}
                          </div>
                          {testResults["test"].responseTime && (
                            <div>
                              <span className="font-medium text-gray-700">Response Time:</span>{" "}
                              {testResults["test"].responseTime}ms
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">
                          <span className="font-medium">Error:</span> {testResults["test"].error}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-6 border-t bg-gray-50 -mx-6 px-6 -mb-6 pb-6">
                    <Button
                      variant="outline"
                      onClick={() => testSource(sourceForm)}
                      disabled={!sourceForm.domain}
                      className="border-gray-300"
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      Test Source
                    </Button>
                    <div className="flex space-x-3">
                      <Button variant="outline" onClick={() => setShowSourceModal(false)} className="border-gray-300">
                        Cancel
                      </Button>
                      <Button
                        onClick={saveSource}
                        disabled={loading || !sourceForm.name || !sourceForm.domain}
                        className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {editingSource ? "Update Source" : "Add Source"}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Sources List */}
          <div className="grid gap-6">
            {sources.map((source) => (
              <Card
                key={source.id}
                className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-medium text-lg">{source.name}</h4>
                        <Badge variant={source.is_active ? "default" : "secondary"}>
                          {source.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <a
                          href={`https://${source.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title={`Visit ${source.name}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <div className="text-sm text-gray-600 space-y-2">
                        <div>
                          <span className="font-medium text-gray-700">Domain:</span> {source.domain}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Keywords:</span>{" "}
                          {source.keywords.slice(0, 5).join(", ")}
                          {source.keywords.length > 5 && ` +${source.keywords.length - 5} more`}
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <span className="font-medium text-gray-700">Posts Found:</span> {source.posts_found}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Success Rate:</span>{" "}
                            {source.success_rate.toFixed(1)}%
                          </div>
                          {source.last_scraped && (
                            <div>
                              <span className="font-medium text-gray-700">Last Scraped:</span>{" "}
                              {new Date(source.last_scraped).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testSource(source)}
                        disabled={loading}
                        className="hover:bg-green-50 hover:border-green-300"
                        title={`Test ${source.name}`}
                      >
                        <TestTube className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editSource(source)}
                        className="hover:bg-blue-50 hover:border-blue-300"
                        title={`Edit ${source.name} settings`}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSource(source.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                        title={`Delete ${source.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Test Results for existing sources */}
                  {testResults[source.id] && (
                    <div className="mt-4 p-4 border rounded-lg bg-white shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        {testResults[source.id].success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium text-gray-900">
                          {testResults[source.id].success ? "Test Successful" : "Test Failed"}
                        </span>
                      </div>
                      {testResults[source.id].success ? (
                        <div className="text-sm space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">Title:</span> {testResults[source.id].title}
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Content Preview:</span>{" "}
                            {testResults[source.id].content}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">
                          <span className="font-medium">Error:</span> {testResults[source.id].error}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {sources.length === 0 && (
              <Card className="shadow-sm">
                <CardContent className="text-center py-10">
                  <Globe className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sources configured</h3>
                  <p className="text-gray-600 mb-4">Add websites to scrape content from</p>
                  <Button onClick={() => setShowSourceModal(true)} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Source
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
