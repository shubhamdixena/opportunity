"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Upload,
  Play,
  Search,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Bot,
  Calendar,
  ExternalLink,
  Settings,
  Globe,
  Target,
  Zap,
  Filter,
} from "lucide-react"

// Types
interface ContentSource {
  id: string
  name: string
  domain: string
  isActive: boolean
  keywords: string[]
  lastScraped: string
  postsFound: number
  successRate: number
}

interface Campaign {
  id: string
  name: string
  sources: string[]
  keywords: string[]
  category: string
  frequency: number
  frequencyUnit: "minutes" | "hours" | "days"
  isActive: boolean
  maxPosts: number
  currentPosts: number
  filters: {
    minLength: number
    maxLength: number
    requiredWords: string[]
    bannedWords: string[]
    skipDuplicates: boolean
  }
  aiSettings: {
    rewrite: boolean
    qualityCheck: boolean
    seoOptimize: boolean
    translateTo?: string
  }
  postTemplate: {
    titleTemplate: string
    contentTemplate: string
    addTags: boolean
    setCategory: boolean
  }
}

interface ContentItem {
  id: string
  title: string
  source: string
  sourceUrl: string
  campaign: string
  status: "pending" | "processing" | "scheduled" | "published" | "failed"
  scheduledTime?: string
  createdAt: string
  aiProcessed: boolean
  category: string
  estimatedTime?: string
  errorMessage?: string
}

interface QuickStats {
  total: number
  publishedThisWeek: number
  scheduled: number
  failed: number
  pending: number
  activeCampaigns: number
  activeSources: number
}

// Mock data
const mockContentSources: ContentSource[] = [
  {
    id: "1",
    name: "OpportunityDesk",
    domain: "opportunitydesk.org",
    isActive: true,
    keywords: ["internship", "scholarship", "fellowship", "competition"],
    lastScraped: "2024-08-12T14:30:00Z",
    postsFound: 25,
    successRate: 92,
  },
  {
    id: "2",
    name: "ScholarshipDB",
    domain: "scholarshipdb.net",
    isActive: true,
    keywords: ["scholarship", "grant", "funding", "education"],
    lastScraped: "2024-08-12T16:45:00Z",
    postsFound: 18,
    successRate: 88,
  },
  {
    id: "3",
    name: "TechCrunch Jobs",
    domain: "techcrunch.com",
    isActive: false,
    keywords: ["startup", "tech jobs", "fellowship", "accelerator"],
    lastScraped: "2024-08-11T09:15:00Z",
    postsFound: 12,
    successRate: 75,
  },
]

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Daily Scholarship Hunt",
    sources: ["1", "2"],
    keywords: ["scholarship", "grant", "funding"],
    category: "Scholarships",
    frequency: 2,
    frequencyUnit: "hours",
    isActive: true,
    maxPosts: 50,
    currentPosts: 23,
    filters: {
      minLength: 100,
      maxLength: 2000,
      requiredWords: ["deadline", "apply"],
      bannedWords: ["expired", "closed"],
      skipDuplicates: true,
    },
    aiSettings: {
      rewrite: true,
      qualityCheck: true,
      seoOptimize: true,
    },
    postTemplate: {
      titleTemplate: "[original_title] - Apply Now",
      contentTemplate: "[original_content]\n\nApply: [source_url]",
      addTags: true,
      setCategory: true,
    },
  },
  {
    id: "2",
    name: "Tech Opportunities Tracker",
    sources: ["1", "3"],
    keywords: ["internship", "tech", "software", "engineering"],
    category: "Internships",
    frequency: 6,
    frequencyUnit: "hours",
    isActive: true,
    maxPosts: 30,
    currentPosts: 15,
    filters: {
      minLength: 150,
      maxLength: 1500,
      requiredWords: ["apply", "requirements"],
      bannedWords: ["expired"],
      skipDuplicates: true,
    },
    aiSettings: {
      rewrite: true,
      qualityCheck: true,
      seoOptimize: false,
    },
    postTemplate: {
      titleTemplate: "[original_title]",
      contentTemplate: "[original_content]",
      addTags: false,
      setCategory: true,
    },
  },
]

const mockContentItems: ContentItem[] = [
  {
    id: "1",
    title: "Software Engineer Internship at Google",
    source: "OpportunityDesk",
    sourceUrl: "https://opportunitydesk.org/google-internship",
    campaign: "Tech Opportunities Tracker",
    status: "published",
    scheduledTime: "2024-08-10T14:00:00Z",
    createdAt: "2024-08-09T10:30:00Z",
    aiProcessed: true,
    category: "Internships",
  },
  {
    id: "2",
    title: "Microsoft Azure Scholarship Program 2024",
    source: "ScholarshipDB",
    sourceUrl: "https://scholarshipdb.net/microsoft-azure",
    campaign: "Daily Scholarship Hunt",
    status: "scheduled",
    scheduledTime: "2024-08-13T09:00:00Z",
    createdAt: "2024-08-12T16:45:00Z",
    aiProcessed: true,
    category: "Scholarships",
  },
  {
    id: "3",
    title: "Y Combinator Startup Fellowship",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com/yc-fellowship",
    campaign: "Tech Opportunities Tracker",
    status: "processing",
    createdAt: "2024-08-12T18:20:00Z",
    aiProcessed: false,
    category: "Fellowships",
    estimatedTime: "5 min",
  },
  {
    id: "4",
    title: "NASA Space Exploration Competition",
    source: "OpportunityDesk",
    sourceUrl: "https://opportunitydesk.org/nasa-competition",
    campaign: "Daily Scholarship Hunt",
    status: "failed",
    createdAt: "2024-08-12T12:15:00Z",
    aiProcessed: false,
    category: "Competitions",
    errorMessage: "Failed to extract content - source website blocked",
  },
  {
    id: "5",
    title: "OpenAI Research Grant Program",
    source: "AI Weekly",
    sourceUrl: "https://aiweekly.co/openai-grant",
    campaign: "Daily Scholarship Hunt",
    status: "pending",
    createdAt: "2024-08-12T20:30:00Z",
    aiProcessed: false,
    category: "Grants",
  },
]

const StatusBadge = ({ status }: { status: ContentItem["status"] }) => {
  const variants = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    scheduled: "bg-purple-100 text-purple-800 border-purple-200",
    published: "bg-green-100 text-green-800 border-green-200",
    failed: "bg-red-100 text-red-800 border-red-200",
  }

  const icons = {
    pending: Clock,
    processing: RefreshCw,
    scheduled: Calendar,
    published: CheckCircle,
    failed: XCircle,
  }

  const Icon = icons[status]

  return (
    <Badge variant="outline" className={`${variants[status]} border`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

export function AdminContentManager() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("queue")
  const [importSources, setImportSources] = useState("")
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [aiSettings, setAiSettings] = useState({
    autoRewrite: true,
    qualityCheck: true,
    seoOptimize: true,
  })

  // Mock processing state
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingQueue, setProcessingQueue] = useState(2)

  const contentItems = mockContentItems
  const contentSources = mockContentSources
  const campaigns = mockCampaigns

  // Calculate stats
  const stats: QuickStats = useMemo(() => {
    const total = contentItems.length
    const publishedThisWeek = contentItems.filter(
      (item) => item.status === "published" && 
      new Date(item.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
    const scheduled = contentItems.filter((item) => item.status === "scheduled").length
    const failed = contentItems.filter((item) => item.status === "failed").length
    const pending = contentItems.filter((item) => item.status === "pending").length
    const activeCampaigns = mockCampaigns.filter((campaign) => campaign.isActive).length
    const activeSources = mockContentSources.filter((source) => source.isActive).length

    return { total, publishedThisWeek, scheduled, failed, pending, activeCampaigns, activeSources }
  }, [contentItems])

  // Filter content items
  const filteredItems = useMemo(() => {
    return contentItems.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.source.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      const matchesSource = sourceFilter === "all" || item.source === sourceFilter
      return matchesSearch && matchesStatus && matchesSource
    })
  }, [contentItems, searchQuery, statusFilter, sourceFilter])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map((item) => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId])
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId))
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on items:`, selectedItems)
    // Implement bulk actions here
    setSelectedItems([])
  }

  const handleImportSources = () => {
    const sources = importSources.split('\n').filter((source: string) => source.trim() !== '')
    console.log('Importing Sources:', sources)
    // Implement source import logic here
    setImportSources("")
    setIsImportDialogOpen(false)
  }

  const handleProcessQueue = () => {
    setIsProcessing(true)
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      setProcessingQueue(0)
    }, 3000)
  }

  const getUniqueValues = (key: keyof ContentItem) => {
    return [...new Set(contentItems.map(item => item[key]))]
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Content Manager</h1>
        <p className="text-slate-600">
          Automate content discovery and publishing from various opportunity sources
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60">
        <div className="border-b border-slate-200/60">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: "queue", name: "Content Queue", icon: Clock },
              { id: "sources", name: "Sources", icon: Globe },
              { id: "campaigns", name: "Campaigns", icon: Target },
              { id: "settings", name: "AI Settings", icon: Bot },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? "border-slate-600 text-slate-800"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "queue" && (
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Zap className="w-5 h-5 text-slate-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                    {/* Stats Cards */}
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                      <div className="text-sm text-slate-600">Total Posts</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-green-600">{stats.publishedThisWeek}</div>
                      <div className="text-sm text-slate-600">Published This Week</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-purple-600">{stats.scheduled}</div>
                      <div className="text-sm text-slate-600">Scheduled</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                      <div className="text-sm text-slate-600">Failed</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-blue-600">{stats.activeCampaigns}</div>
                      <div className="text-sm text-slate-600">Active Campaigns</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-orange-600">{stats.activeSources}</div>
                      <div className="text-sm text-slate-600">Active Sources</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                      <div className="text-sm text-slate-600">Pending</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-slate-800 hover:bg-slate-700 text-white shadow-sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Post
                    </Button>

                    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                      <DialogTrigger>
                        <Button variant="outline" type="button" className="border-slate-300 hover:bg-slate-50">
                          <Globe className="w-4 h-4 mr-2" />
                          Add Sources
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add Content Sources</DialogTitle>
                          <p className="text-sm text-muted-foreground mt-2">
                            Enter website domains (one per line). The system will automatically discover and process relevant content from these sources.
                          </p>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="opportunitydesk.org&#10;scholarshipdb.net&#10;techcrunch.com/jobs"
                            value={importSources}
                            onChange={(e) => setImportSources(e.target.value)}
                            className="min-h-[120px]"
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleImportSources}>
                              <Upload className="w-4 h-4 mr-2" />
                              Import Sources
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="outline"
                      onClick={handleProcessQueue}
                      disabled={isProcessing || processingQueue === 0}
                      className="border-slate-300 hover:bg-slate-50"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Process Queue
                      {processingQueue > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {processingQueue}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Content Queue Table */}
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-800">Content Queue</CardTitle>
                    {selectedItems.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">
                          {selectedItems.length} selected
                        </span>
                        <Select onValueChange={handleBulkAction}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Bulk Actions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="publish">Publish Now</SelectItem>
                            <SelectItem value="schedule">Schedule</SelectItem>
                            <SelectItem value="delete">Delete</SelectItem>
                            <SelectItem value="retry">Retry Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
                      <Input
                        placeholder="Search content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-slate-300"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[130px] border-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                      <SelectTrigger className="w-[150px] border-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        {getUniqueValues('source').map((source) => (
                          <SelectItem key={String(source)} value={String(source)}>
                            {String(source)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="text-slate-700">Title</TableHead>
                        <TableHead className="text-slate-700">Source</TableHead>
                        <TableHead className="text-slate-700">Status</TableHead>
                        <TableHead className="text-slate-700">Scheduled</TableHead>
                        <TableHead className="text-slate-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium truncate max-w-[300px] text-slate-800" title={item.title}>
                                {item.title}
                              </div>
                              <div className="text-sm text-slate-600">
                                {item.category} • {item.campaign}
                                {item.aiProcessed && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    AI Processed
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-slate-800">{item.source}</div>
                              <a
                                href={item.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1"
                              >
                                View Source
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <StatusBadge status={item.status} />
                              {item.status === "processing" && item.estimatedTime && (
                                <div className="text-xs text-slate-600">
                                  ~{item.estimatedTime} remaining
                                </div>
                              )}
                              {item.status === "failed" && item.errorMessage && (
                                <div className="text-xs text-red-600" title={item.errorMessage}>
                                  {item.errorMessage.substring(0, 30)}...
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.scheduledTime ? (
                              <div className="text-sm">
                                {new Date(item.scheduledTime).toLocaleDateString()}
                                <br />
                                <span className="text-slate-600">
                                  {new Date(item.scheduledTime).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" className="hover:bg-slate-100">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="hover:bg-slate-100">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sources Tab */}
          {activeTab === "sources" && (
            <div className="space-y-6">
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Globe className="w-5 h-5 text-slate-600" />
                    Content Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contentSources.map((source) => (
                      <Card key={source.id} className="border-slate-200/60">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-slate-800">{source.name}</h3>
                            <Badge 
                              variant={source.isActive ? "default" : "secondary"}
                              className={source.isActive ? "bg-green-100 text-green-800 border-green-200" : ""}
                            >
                              {source.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm text-slate-600">
                            <div>Domain: {source.domain}</div>
                            <div>Posts Found: {source.postsFound}</div>
                            <div>Success Rate: {source.successRate}%</div>
                            <div>Last Scraped: {new Date(source.lastScraped).toLocaleDateString()}</div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" className="flex-1 border-slate-300">
                              <Settings className="w-3 h-3 mr-1" />
                              Configure
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-300">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === "campaigns" && (
            <div className="space-y-6">
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Target className="w-5 h-5 text-slate-600" />
                    Automated Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <Card key={campaign.id} className="border-slate-200/60">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-slate-800">{campaign.name}</h3>
                              <p className="text-sm text-slate-600">{campaign.category}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={campaign.isActive ? "default" : "secondary"}
                                className={campaign.isActive ? "bg-green-100 text-green-800 border-green-200" : ""}
                              >
                                {campaign.isActive ? "Active" : "Paused"}
                              </Badge>
                              <Button size="sm" variant="outline" className="border-slate-300">
                                <Settings className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-slate-600">Frequency</div>
                              <div className="font-medium text-slate-800">
                                Every {campaign.frequency} {campaign.frequencyUnit}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-600">Progress</div>
                              <div className="font-medium text-slate-800">
                                {campaign.currentPosts} / {campaign.maxPosts}
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-600">Keywords</div>
                              <div className="font-medium text-slate-800">
                                {campaign.keywords.length} terms
                              </div>
                            </div>
                            <div>
                              <div className="text-slate-600">Sources</div>
                              <div className="font-medium text-slate-800">
                                {campaign.sources.length} active
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <Card className="border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Bot className="w-5 h-5 text-slate-600" />
                    AI Processing Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-slate-800">Content Processing</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-slate-800">Auto-rewrite content</label>
                            <p className="text-xs text-slate-600">Automatically rewrite content to make it unique</p>
                          </div>
                          <Switch
                            checked={aiSettings.autoRewrite}
                            onCheckedChange={(checked) =>
                              setAiSettings({ ...aiSettings, autoRewrite: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-slate-800">Quality check</label>
                            <p className="text-xs text-slate-600">Validate content quality before publishing</p>
                          </div>
                          <Switch
                            checked={aiSettings.qualityCheck}
                            onCheckedChange={(checked) =>
                              setAiSettings({ ...aiSettings, qualityCheck: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-slate-800">SEO optimize</label>
                            <p className="text-xs text-slate-600">Optimize content for search engines</p>
                          </div>
                          <Switch
                            checked={aiSettings.seoOptimize}
                            onCheckedChange={(checked) =>
                              setAiSettings({ ...aiSettings, seoOptimize: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium text-slate-800">Processing Queue</h3>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-800">Current Queue</span>
                          {isProcessing && (
                            <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                          )}
                        </div>
                        <div className="text-2xl font-bold text-slate-800 mb-1">
                          {processingQueue} items
                        </div>
                        <div className="text-sm text-slate-600">
                          {isProcessing ? "Processing..." : "Ready to process"}
                        </div>
                        <Button 
                          className="w-full mt-4 bg-slate-800 hover:bg-slate-700" 
                          disabled={processingQueue === 0}
                          onClick={handleProcessQueue}
                        >
                          <Bot className="w-4 h-4 mr-2" />
                          {isProcessing ? "Processing..." : "Process Queue"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
