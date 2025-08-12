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
} from "lucide-react"

// Types
interface ContentItem {
  id: string
  title: string
  source: string
  sourceUrl: string
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
}

// Mock data
const mockContentItems: ContentItem[] = [
  {
    id: "1",
    title: "Software Engineer Internship at Google",
    source: "OpportunityDesk",
    sourceUrl: "https://opportunitydesk.org/google-internship",
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
  const [importUrls, setImportUrls] = useState("")
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

    return { total, publishedThisWeek, scheduled, failed, pending }
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

  const handleImportUrls = () => {
    const urls = importUrls.split('\n').filter(url => url.trim() !== '')
    console.log('Importing URLs:', urls)
    // Implement URL import logic here
    setImportUrls("")
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2">Content Manager</h1>
        <p className="text-muted-foreground">
          Automate content discovery and publishing from various opportunity sources
        </p>
      </div>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Stats Cards */}
            <div className="space-y-2">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">{stats.publishedThisWeek}</div>
              <div className="text-sm text-muted-foreground">Published This Week</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-600">{stats.scheduled}</div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Post
            </Button>

            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger>
                <Button variant="outline" type="button">
                  <Upload className="w-4 h-4 mr-2" />
                  Import from URLs
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Import Content from URLs</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enter one URL per line. The system will automatically extract and process the content.
                  </p>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="https://opportunitydesk.org/example-1&#10;https://scholarshipdb.net/example-2&#10;https://techcrunch.com/example-3"
                    value={importUrls}
                    onChange={(e) => setImportUrls(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleImportUrls}>
                      <Upload className="w-4 h-4 mr-2" />
                      Import URLs
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline"
              onClick={handleProcessQueue}
              disabled={isProcessing || processingQueue === 0}
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

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Content Queue Table */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content Queue</CardTitle>
                {selectedItems.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
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
                  <SelectTrigger className="w-[150px]">
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
                    <TableHead>Title</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium truncate max-w-[300px]" title={item.title}>
                            {item.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.category}
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
                          <div className="font-medium">{item.source}</div>
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
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
                            <div className="text-xs text-muted-foreground">
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
                            <span className="text-muted-foreground">
                              {new Date(item.scheduledTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600">
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

        {/* AI Processing Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Queue Status</span>
                  {isProcessing && (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  )}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {processingQueue} items
                </div>
                <div className="text-sm text-muted-foreground">
                  {isProcessing ? "Processing..." : "Ready to process"}
                </div>
              </div>

              {/* Processing Settings */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Processing Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Auto-rewrite content</label>
                    <Switch
                      checked={aiSettings.autoRewrite}
                      onCheckedChange={(checked) =>
                        setAiSettings({ ...aiSettings, autoRewrite: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Quality check</label>
                    <Switch
                      checked={aiSettings.qualityCheck}
                      onCheckedChange={(checked) =>
                        setAiSettings({ ...aiSettings, qualityCheck: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">SEO optimize</label>
                    <Switch
                      checked={aiSettings.seoOptimize}
                      onCheckedChange={(checked) =>
                        setAiSettings({ ...aiSettings, seoOptimize: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Manual Process Button */}
              <Button 
                className="w-full" 
                variant="outline"
                disabled={selectedItems.length === 0}
                onClick={() => handleBulkAction('process')}
              >
                <Bot className="w-4 h-4 mr-2" />
                Process Selected
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contentItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()} · {item.source}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
