"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  PlusCircle,
  MoreHorizontal,
  Play,
  Trash2,
  ExternalLink,
  Globe,
  Calendar,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  TestTube,
  Save,
  Zap,
  FileText,
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
  const [sources, setSources] = useState<ContentSource[]>([])
  const [campaigns, setCampaigns] = useState<ContentCampaign[]>([])
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})

  // Modal states
  const [showSourceModal, setShowSourceModal] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [editingSource, setEditingSource] = useState<ContentSource | null>(null)
  const [editingCampaign, setEditingCampaign] = useState<ContentCampaign | null>(
    null
  )

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
    is_active: true,
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

  const handleEditCampaign = (campaign: ContentCampaign) => {
    setEditingCampaign(campaign)
    setCampaignForm({
      name: campaign.name,
      source_ids: campaign.source_ids || [],
      keywords: (campaign.keywords || []).join(", "),
      category: campaign.category || "Misc",
      frequency: campaign.frequency || 6,
      frequency_unit: campaign.frequency_unit || "hours",
      max_posts: campaign.max_posts || 50,
      is_active: campaign.is_active,
      filters: {
        min_length: campaign.filters?.min_length || 100,
        max_length: campaign.filters?.max_length || 10000,
        required_words: (campaign.filters?.required_words || []).join(", "),
        banned_words: (campaign.filters?.banned_words || []).join(", "),
        skip_duplicates: campaign.filters?.skip_duplicates !== false,
      },
      ai_settings: {
        rewrite: campaign.ai_settings?.rewrite !== false,
        quality_check: campaign.ai_settings?.quality_check !== false,
        seo_optimize: campaign.ai_settings?.seo_optimize !== false,
        translate_to: campaign.ai_settings?.translate_to || "",
      },
    })
    setShowCampaignModal(true)
  }

  const handleEditSource = (source: ContentSource) => {
    setEditingSource(source)
    setSourceForm({
      ...source,
      keywords: (source.keywords || []).join(", "),
      // @ts-ignore
      scraping_config: source.scraping_config || {
        delay: 1000,
        max_pages: 10,
        selectors: { title: "", content: "", description: "" },
      },
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
      is_active: true,
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
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="campaigns">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="sources">Content Sources</TabsTrigger>
            <TabsTrigger value="analytics" disabled>
              Analytics
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 gap-1"
              onClick={() => {
                if (
                  document.querySelector<HTMLButtonElement>(
                    'button[value="sources"]'
                  )?.dataset.state === "active"
                ) {
                  resetSourceForm()
                  setShowSourceModal(true)
                } else {
                  resetCampaignForm()
                  setShowCampaignModal(true)
                }
              }}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add New
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
              <CardDescription>
                Manage and run your content campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Schedule
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Progress
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.length > 0 ? (
                    campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          {campaign.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              campaign.is_active ? "default" : "secondary"
                            }
                          >
                            {campaign.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          Every {campaign.frequency} {campaign.frequency_unit}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {campaign.current_posts}/{campaign.max_posts} items
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline">{campaign.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => runCampaign(campaign.id)}
                                disabled={loading || !campaign.is_active}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Run Now
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditCampaign(campaign)}
                              >
                                <Settings className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteCampaign(campaign.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center"
                      >
                        No campaigns created.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Content Sources</CardTitle>
              <CardDescription>
                Manage your content sources for scraping.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Posts
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Success Rate
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Last Scraped
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources.length > 0 ? (
                    sources.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell className="font-medium">
                          {source.name}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`https://${source.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {source.domain}
                            <ExternalLink className="inline-block ml-1 h-3 w-3" />
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={source.is_active ? "default" : "secondary"}
                          >
                            {source.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {source.posts_found}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {source.success_rate.toFixed(1)}%
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {source.last_scraped
                            ? new Date(source.last_scraped).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => testSource(source)}
                              >
                                <TestTube className="mr-2 h-4 w-4" />
                                Test
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditSource(source)}
                              >
                                <Settings className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteSource(source.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center"
                      >
                        No sources configured.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showSourceModal} onOpenChange={setShowSourceModal}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {editingSource ? "Edit Source" : "Add New Source"}
            </DialogTitle>
            <DialogDescription>
              {editingSource
                ? "Update the details of your content source."
                : "Configure a new source for content scraping."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                value={sourceForm.name}
                onChange={(e) =>
                  setSourceForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="col-span-3"
                placeholder="e.g., MIT Scholarships"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="domain" className="text-right">
                Domain
              </label>
              <Input
                id="domain"
                value={sourceForm.domain}
                onChange={(e) =>
                  setSourceForm((prev) => ({
                    ...prev,
                    domain: e.target.value,
                  }))
                }
                className="col-span-3"
                placeholder="e.g., scholarships.mit.edu"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="keywords" className="text-right">
                Keywords
              </label>
              <Textarea
                id="keywords"
                value={sourceForm.keywords}
                onChange={(e) =>
                  setSourceForm((prev) => ({
                    ...prev,
                    keywords: e.target.value,
                  }))
                }
                className="col-span-3"
                placeholder="scholarship, funding, grant (comma-separated)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Scraping</label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Delay (ms)"
                  value={sourceForm.scraping_config.delay}
                  onChange={(e) =>
                    setSourceForm((prev) => ({
                      ...prev,
                      scraping_config: {
                        ...prev.scraping_config,
                        delay: Number(e.target.value),
                      },
                    }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Max Pages"
                  value={sourceForm.scraping_config.max_pages}
                  onChange={(e) =>
                    setSourceForm((prev) => ({
                      ...prev,
                      scraping_config: {
                        ...prev.scraping_config,
                        max_pages: Number(e.target.value),
                      },
                    }))
                  }
                />
                <Input
                  className="col-span-2"
                  placeholder="Title selector (e.g., h1, .title)"
                  value={sourceForm.scraping_config.selectors.title}
                  onChange={(e) =>
                    setSourceForm((prev) => ({
                      ...prev,
                      scraping_config: {
                        ...prev.scraping_config,
                        selectors: {
                          ...prev.scraping_config.selectors,
                          title: e.target.value,
                        },
                      },
                    }))
                  }
                />
                <Input
                  className="col-span-2"
                  placeholder="Content selector (e.g., .content, main)"
                  value={sourceForm.scraping_config.selectors.content}
                  onChange={(e) =>
                    setSourceForm((prev) => ({
                      ...prev,
                      scraping_config: {
                        ...prev.scraping_config,
                        selectors: {
                          ...prev.scraping_config.selectors,
                          content: e.target.value,
                        },
                      },
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Switch
                id="is_active"
                checked={sourceForm.is_active}
                onCheckedChange={(checked) =>
                  setSourceForm((prev) => ({ ...prev, is_active: checked }))
                }
              />
              <label htmlFor="is_active">Active</label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => testSource(sourceForm)}
              disabled={!sourceForm.domain || loading}
            >
              <TestTube className="mr-2 h-4 w-4" />
              Test
            </Button>
            <Button
              onClick={saveSource}
              disabled={loading || !sourceForm.name || !sourceForm.domain}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSource ? "Update Source" : "Save Source"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
            </DialogTitle>
            <DialogDescription>
              {editingCampaign
                ? "Update your automated content campaign."
                : "Set up a new campaign to discover opportunities."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="campaign-name" className="text-right">
                Name
              </label>
              <Input
                id="campaign-name"
                value={campaignForm.name}
                onChange={(e) =>
                  setCampaignForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="col-span-3"
                placeholder="e.g., Tech Scholarships Weekly"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right">
                Category
              </label>
              <Select
                value={campaignForm.category}
                onValueChange={(value) =>
                  setCampaignForm((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
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
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Schedule</label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Frequency"
                  value={campaignForm.frequency}
                  onChange={(e) =>
                    setCampaignForm((prev) => ({
                      ...prev,
                      frequency: Number(e.target.value),
                    }))
                  }
                />
                <Select
                  value={campaignForm.frequency_unit}
                  onValueChange={(value: "minutes" | "hours" | "days") =>
                    setCampaignForm((prev) => ({
                      ...prev,
                      frequency_unit: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="keywords" className="text-right">
                Keywords
              </label>
              <Textarea
                id="keywords"
                value={campaignForm.keywords}
                onChange={(e) =>
                  setCampaignForm((prev) => ({
                    ...prev,
                    keywords: e.target.value,
                  }))
                }
                className="col-span-3"
                placeholder="scholarship, funding, grant (comma-separated)"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right pt-2">Sources</label>
              <div className="col-span-3 grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-2">
                {sources.map((source) => (
                  <label
                    key={source.id}
                    className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={campaignForm.source_ids.includes(source.id)}
                      onChange={(e) => {
                        const { checked } = e.target
                        setCampaignForm((prev) => ({
                          ...prev,
                          source_ids: checked
                            ? [...prev.source_ids, source.id]
                            : prev.source_ids.filter((id) => id !== source.id),
                        }))
                      }}
                    />
                    <span>{source.name}</span>
                  </label>
                ))}
              </div>
            </div>
             <div className="flex items-center justify-end space-x-2">
              <Switch
                id="is_active"
                checked={campaignForm.is_active}
                onCheckedChange={(checked) =>
                  setCampaignForm((prev) => ({ ...prev, is_active: checked }))
                }
              />
              <label htmlFor="is_active">Active</label>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={saveCampaign}
              disabled={
                loading ||
                !campaignForm.name ||
                campaignForm.source_ids.length === 0
              }
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCampaign ? "Update Campaign" : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
