"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Zap,
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
  post_template?: any
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
      } else {
        console.error("Failed to load sources:", response.statusText)
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
      } else {
        console.error("Failed to load campaigns:", response.statusText)
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

  const editCampaign = (campaign: ContentCampaign) => {
    setEditingCampaign(campaign)
    setCampaignForm({
      name: campaign.name,
      source_ids: campaign.source_ids || [],
      keywords: (campaign.keywords || []).join(", "),
      category: campaign.category || "Misc",
      frequency: campaign.frequency || 6,
      frequency_unit: campaign.frequency_unit || "hours",
      max_posts: campaign.max_posts || 50,
      filters: campaign.filters || {},
      ai_settings: campaign.ai_settings || {},
      post_template: campaign.post_template || {},
    })
    setShowCampaignModal(true)
  }

  const editSource = (source: ContentSource) => {
    setEditingSource(source)
    setSourceForm({
      name: source.name,
      domain: source.domain,
      keywords: (source.keywords || []).join(", "),
      scraping_config: source.scraping_config || {},
    })
    setShowSourceModal(true)
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
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Manager</h1>
            <p className="text-gray-600">Automate content discovery and opportunity creation</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">{sources.length}</div>
              <div className="text-sm text-gray-600">Active Sources</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="text-2xl font-bold text-green-600">{campaigns.length}</div>
              <div className="text-sm text-gray-600">Campaigns</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "sources", label: "Content Sources", icon: Globe },
            { id: "campaigns", label: "Campaigns", icon: Zap },
            { id: "queue", label: "Processing Queue", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "sources" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Content Sources</h2>
            <Button
              onClick={() => {
                resetSourceForm()
                setShowSourceModal(true)
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl px-6 py-3 rounded-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Source
            </Button>
          </div>

          {sources.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sources configured</h3>
              <p className="text-gray-600 mb-4">Add your first content source to start discovering opportunities</p>
              <Button
                onClick={() => {
                  resetSourceForm()
                  setShowSourceModal(true)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Source
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-7">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h4 className="font-semibold text-lg text-gray-900">{source.name}</h4>
                          <Badge variant={source.is_active ? "default" : "secondary"} className="font-medium">
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
                        <div className="text-sm text-gray-600 space-y-3">
                          <div>
                            <span className="font-semibold text-gray-800">Domain:</span> {source.domain}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">Keywords:</span>{" "}
                            {source.keywords.slice(0, 5).join(", ")}
                            {source.keywords.length > 5 && ` +${source.keywords.length - 5} more`}
                          </div>
                          <div className="flex gap-6">
                            <div>
                              <span className="font-semibold text-gray-800">Posts Found:</span> {source.posts_found}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800">Success Rate:</span>{" "}
                              {source.success_rate.toFixed(1)}%
                            </div>
                            {source.last_scraped && (
                              <div>
                                <span className="font-semibold text-gray-800">Last Scraped:</span>{" "}
                                {new Date(source.last_scraped).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testSource(source)}
                          disabled={loading}
                          className="hover:bg-green-50 hover:border-green-300 p-3 rounded-xl shadow-sm"
                          title={`Test ${source.name}`}
                        >
                          <TestTube className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editSource(source)}
                          className="hover:bg-blue-50 hover:border-blue-300 p-3 rounded-xl shadow-sm"
                          title={`Edit ${source.name} settings`}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSource(source.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 p-3 rounded-xl shadow-sm"
                          title={`Delete ${source.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Test Results for existing sources */}
                    {testResults[source.id] && (
                      <div className="mt-6 p-6 border rounded-2xl bg-white shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                          {testResults[source.id].success ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600" />
                          )}
                          <span className="font-medium text-gray-900 text-lg">
                            {testResults[source.id].success ? "Test Successful" : "Test Failed"}
                          </span>
                        </div>
                        {testResults[source.id].success ? (
                          <div className="text-sm space-y-3">
                            <div>
                              <span className="font-semibold text-gray-800">Title:</span> {testResults[source.id].title}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800">Content Preview:</span>{" "}
                              {testResults[source.id].content}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-red-600">
                            <span className="font-semibold">Error:</span> {testResults[source.id].error}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "campaigns" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Content Campaigns</h2>
            <Button
              onClick={() => {
                resetCampaignForm()
                setShowCampaignModal(true)
              }}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl px-6 py-3 rounded-xl transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Campaign
            </Button>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns created</h3>
              <p className="text-gray-600 mb-4">Create your first campaign to automate content discovery</p>
              <Button
                onClick={() => {
                  resetCampaignForm()
                  setShowCampaignModal(true)
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Campaign
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <Card
                    key={campaign.id}
                    className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-gradient-to-r from-white to-blue-50"
                  >
                    <CardHeader className="pb-6 bg-white">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-gray-900">{campaign.name}</div>
                              <Badge
                                variant={campaign.is_active ? "default" : "secondary"}
                                className={`mt-1 ${campaign.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                              >
                                {campaign.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </CardTitle>
                          <div className="flex items-center gap-8 text-sm text-gray-600">
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">
                                Every {campaign.frequency} {campaign.frequency_unit}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                              <TrendingUp className="w-4 h-4" />
                              <span className="font-medium">
                                {campaign.current_posts}/{campaign.max_posts} items
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs font-medium px-3 py-1">
                              {campaign.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editCampaign(campaign)}
                            className="hover:bg-blue-50 hover:border-blue-300 p-3 rounded-xl shadow-sm"
                            title={`Edit ${campaign.name} settings`}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => runCampaign(campaign.id)}
                            disabled={loading || !campaign.is_active}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg p-3 rounded-xl"
                            title={`Run ${campaign.name} now`}
                          >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteCampaign(campaign.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 p-3 rounded-xl shadow-sm"
                            title={`Delete ${campaign.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 bg-white">
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <span className="font-semibold text-gray-800 block mb-2">Sources:</span>
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
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <span className="font-semibold text-gray-800 block mb-2">Keywords:</span>
                          <span className="text-gray-600">
                            {campaign.keywords.slice(0, 3).join(", ")}
                            {campaign.keywords.length > 3 && ` +${campaign.keywords.length - 3} more`}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ... existing code for modals and other content ... */}
      <Dialog open={showSourceModal} onOpenChange={setShowSourceModal}>
        <DialogTrigger asChild>
          <Button
            onClick={resetSourceForm}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-base font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Source
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="border-b border-gray-200 pb-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 px-6 -mt-6 pt-6 rounded-t-2xl">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              {editingSource ? (
                <>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Settings className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-gray-900">Edit Source</div>
                    <div className="text-lg font-medium text-blue-600">{editingSource.name}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-gray-900">Add New Source</div>
                </>
              )}
            </DialogTitle>
            {editingSource && (
              <p className="text-gray-600 mt-2 text-base">Configure website scraping settings for this source</p>
            )}
          </DialogHeader>

          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-800">Source Name</label>
                  <Input
                    value={sourceForm.name}
                    onChange={(e) => setSourceForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., MIT Scholarships"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-800">Domain</label>
                  <Input
                    value={sourceForm.domain}
                    onChange={(e) => setSourceForm((prev) => ({ ...prev, domain: e.target.value }))}
                    placeholder="e.g., scholarships.mit.edu"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-8 rounded-2xl border border-yellow-200 shadow-sm">
              <label className="block text-sm font-semibold mb-3 text-gray-800">Target Keywords</label>
              <Textarea
                value={sourceForm.keywords}
                onChange={(e) => setSourceForm((prev) => ({ ...prev, keywords: e.target.value }))}
                placeholder="scholarship, funding, grant, education"
                className="border-gray-300 focus:border-blue-500 min-h-[100px] text-base rounded-xl shadow-sm"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-2">
                Separate keywords with commas. These will be used to filter relevant content.
              </p>
            </div>

            {/* Scraping Configuration */}
            <div className="space-y-6 bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                Scraping Configuration
              </h4>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-800">Delay (ms)</label>
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
                    className="border-gray-300 focus:border-blue-500 h-12 text-base rounded-xl shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-800">Max Pages</label>
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
                    className="border-gray-300 focus:border-blue-500 h-12 text-base rounded-xl shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <label className="block text-sm font-semibold text-gray-800">Custom Selectors (optional)</label>
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
                  className="border-gray-300 focus:border-blue-500 h-12 text-base rounded-xl shadow-sm"
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
                  className="border-gray-300 focus:border-blue-500 h-12 text-base rounded-xl shadow-sm"
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
                  className="border-gray-300 focus:border-blue-500 h-12 text-base rounded-xl shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Switch
                checked={sourceForm.is_active}
                onCheckedChange={(checked) => setSourceForm((prev) => ({ ...prev, is_active: checked }))}
                className="border-gray-300 text-blue-600 focus:ring-blue-500 h-6 w-11 rounded-full"
              />
              <span className="text-sm text-gray-700 font-medium">Active source</span>
            </div>

            {/* Test Results */}
            {testResults["test"] && (
              <div className="p-6 border rounded-2xl bg-white shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  {testResults["test"].success ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <span className="font-medium text-gray-900 text-lg">
                    {testResults["test"].success ? "Test Successful" : "Test Failed"}
                  </span>
                </div>
                {testResults["test"].success ? (
                  <div className="text-sm space-y-3">
                    <div>
                      <span className="font-semibold text-gray-800">Title:</span> {testResults["test"].title}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Content Preview:</span>{" "}
                      {testResults["test"].content}
                    </div>
                    {testResults["test"].responseTime && (
                      <div>
                        <span className="font-semibold text-gray-800">Response Time:</span>{" "}
                        {testResults["test"].responseTime}ms
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    <span className="font-semibold">Error:</span> {testResults["test"].error}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 -mx-6 px-8 -mb-6 pb-8 rounded-b-2xl">
              <Button
                variant="outline"
                onClick={() => testSource(sourceForm)}
                disabled={!sourceForm.domain}
                className="border-gray-300 hover:bg-gray-50 px-6 py-3 text-base font-medium rounded-xl"
              >
                <TestTube className="w-5 h-5 mr-2" />
                Test Source
              </Button>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSourceModal(false)}
                  className="border-gray-300 hover:bg-gray-50 px-6 py-3 text-base font-medium rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveSource}
                  disabled={loading || !sourceForm.name || !sourceForm.domain}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl px-8 py-3 text-base font-medium rounded-xl transition-all duration-200"
                >
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  {editingSource ? "Update Source" : "Add Source"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
        <DialogTrigger asChild>
          <Button
            onClick={resetCampaignForm}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-base font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Campaign
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="border-b border-gray-200 pb-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 px-6 -mt-6 pt-6 rounded-t-2xl">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              {editingCampaign ? (
                <>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Settings className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-gray-900">Edit Campaign</div>
                    <div className="text-lg font-medium text-blue-600">{editingCampaign.name}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-gray-900">Create New Campaign</div>
                </>
              )}
            </DialogTitle>
            {editingCampaign && (
              <p className="text-gray-600 mt-2 text-base">
                Configure automated content scraping settings for this campaign
              </p>
            )}
          </DialogHeader>

          <div className="space-y-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-800">Campaign Name</label>
                  <Input
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Tech Scholarships Weekly"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-800">Category</label>
                  <Select
                    value={campaignForm.category}
                    onValueChange={(value) => setCampaignForm((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 h-12 rounded-xl shadow-sm">
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

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-700" />
                </div>
                Schedule & Automation
              </h4>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-800">Run Every</label>
                  <Input
                    type="number"
                    value={campaignForm.frequency}
                    onChange={(e) =>
                      setCampaignForm((prev) => ({ ...prev, frequency: Number.parseInt(e.target.value) }))
                    }
                    min="1"
                    className="border-gray-300 focus:border-blue-500 h-12 text-base rounded-xl shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-800">Time Unit</label>
                  <Select
                    value={campaignForm.frequency_unit}
                    onValueChange={(value: any) => setCampaignForm((prev) => ({ ...prev, frequency_unit: value }))}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 h-12 rounded-xl shadow-sm">
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
                  <label className="block text-sm font-semibold mb-3 text-gray-800">Max Items per Run</label>
                  <Input
                    type="number"
                    value={campaignForm.max_posts}
                    onChange={(e) =>
                      setCampaignForm((prev) => ({ ...prev, max_posts: Number.parseInt(e.target.value) }))
                    }
                    min="1"
                    className="border-gray-300 focus:border-blue-500 h-12 text-base rounded-xl shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-8 rounded-2xl border border-green-200 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="w-5 h-5 text-green-700" />
                </div>
                Content Sources
              </h4>
              <div className="grid grid-cols-2 gap-6 max-h-52 overflow-y-auto border rounded-2xl p-5 bg-white">
                {sources.map((source) => (
                  <label
                    key={source.id}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors duration-200"
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
                      className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                    />
                    <span className="text-sm font-medium text-gray-800">{source.name}</span>
                    <Badge variant={source.is_active ? "default" : "secondary"} className="text-xs font-medium">
                      {source.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </label>
                ))}
              </div>
              {sources.length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                  <Globe className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    No sources available. Create sources first in the Sources tab.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-8 rounded-2xl border border-yellow-200 shadow-sm">
              <label className="block text-sm font-semibold mb-3 text-gray-800">Target Keywords</label>
              <Textarea
                value={campaignForm.keywords}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, keywords: e.target.value }))}
                placeholder="scholarship, funding, education, grant, fellowship, opportunity"
                className="border-gray-300 focus:border-blue-500 min-h-[100px] text-base rounded-xl shadow-sm"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-2">
                Separate keywords with commas. These will be used to filter relevant content.
              </p>
            </div>

            {/* Content Filters */}
            <div className="space-y-6 bg-gradient-to-r from-yellow-50 to-yellow-100 p-8 rounded-2xl border border-yellow-200 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Settings className="w-5 h-5 text-yellow-600" />
                </div>
                Content Filters
              </h4>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-800">Min Content Length</label>
                  <Input
                    type="number"
                    value={campaignForm.filters.min_length}
                    onChange={(e) =>
                      setCampaignForm((prev) => ({
                        ...prev,
                        filters: { ...prev.filters, min_length: Number.parseInt(e.target.value) },
                      }))
                    }
                    className="border-gray-300 focus:border-blue-500 h-12 text-base rounded-xl shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-800">Max Content Length</label>
                  <Input
                    type="number"
                    value={campaignForm.filters.max_length}
                    onChange={(e) =>
                      setCampaignForm((prev) => ({
                        ...prev,
                        filters: { ...prev.filters, max_length: Number.parseInt(e.target.value) },
                      }))
                    }
                    className="border-gray-300 focus:border-blue-500 h-12 text-base rounded-xl shadow-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-800">Required Words</label>
                  <Input
                    value={campaignForm.filters.required_words}
                    onChange={(e) =>
                      setCampaignForm((prev) => ({
                        ...prev,
                        filters: { ...prev.filters, required_words: e.target.value },
                      }))
                    }
                    placeholder="must, contain, these"
                    className="border-gray-300 focus:border-blue-500 h-12 text-base rounded-xl shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-800">Banned Words</label>
                  <Input
                    value={campaignForm.filters.banned_words}
                    onChange={(e) =>
                      setCampaignForm((prev) => ({
                        ...prev,
                        filters: { ...prev.filters, banned_words: e.target.value },
                      }))
                    }
                    placeholder="spam, scam, fake"
                    className="border-gray-300 focus:border-blue-500 h-12 text-base rounded-xl shadow-sm"
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
                  className="border-gray-300 text-blue-600 focus:ring-blue-500 h-6 w-11 rounded-full"
                />
                <span className="text-sm text-gray-700 font-medium">Skip duplicate content</span>
              </label>
            </div>

            {/* AI Settings */}
            <div className="space-y-6 bg-gradient-to-r from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TestTube className="w-5 h-5 text-purple-600" />
                </div>
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
                    className="border-gray-300 text-blue-600 focus:ring-blue-500 h-6 w-11 rounded-full"
                  />
                  <span className="text-sm text-gray-700 font-medium">Rewrite content</span>
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
                    className="border-gray-300 text-blue-600 focus:ring-blue-500 h-6 w-11 rounded-full"
                  />
                  <span className="text-sm text-gray-700 font-medium">Quality check</span>
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
                    className="border-gray-300 text-blue-600 focus:ring-blue-500 h-6 w-11 rounded-full"
                  />
                  <span className="text-sm text-gray-700 font-medium">SEO optimization</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 -mx-6 px-8 -mb-6 pb-8 rounded-b-2xl">
              <div className="text-gray-700 font-medium">
                {editingCampaign ? "Update campaign settings to apply changes" : "Create new automated campaign"}
              </div>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCampaignModal(false)}
                  className="border-gray-300 hover:bg-gray-50 px-6 py-3 text-base font-medium rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveCampaign}
                  disabled={loading || !campaignForm.name || campaignForm.source_ids.length === 0}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl px-8 py-3 text-base font-medium rounded-xl transition-all duration-200"
                >
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  {editingCampaign ? "Update Campaign" : "Create Campaign"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
