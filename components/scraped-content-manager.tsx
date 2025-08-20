"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Eye,
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Sparkles,
  Zap,
  RefreshCw,
  Monitor,
  Activity,
} from "lucide-react"
import { toast } from "sonner"

interface ScrapedOpportunity {
  id: string
  name: string
  details: string
  post_url: string
  source_url: string
  category: string
  tags: string[]
  processing_status: "raw" | "processing" | "processed" | "posted" | "failed"
  ai_confidence_score: number
  scraped_at: string
  opportunity_id?: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function ScrapedContentManager() {
  const [scrapedContent, setScrapedContent] = useState<ScrapedOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedContent, setSelectedContent] = useState<ScrapedOpportunity | null>(null)
  const [activeTab, setActiveTab] = useState("raw")
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 3,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    loadScrapedContent()
    const interval = setInterval(loadScrapedContent, 30000)
    return () => clearInterval(interval)
  }, [pagination.page])

  const loadScrapedContent = async () => {
    try {
      const response = await fetch(`/api/scraped-content?page=${pagination.page}&limit=${pagination.limit}`)
      if (response.ok) {
        const result = await response.json()
        setScrapedContent(result.data || [])
        setPagination(result.pagination || pagination)
      }
    } catch (error) {
      toast.error("Failed to load scraped content")
    } finally {
      setLoading(false)
    }
  }

  const cleanupEmptyEntries = async () => {
    try {
      const response = await fetch("/api/scraped-content?action=cleanup-empty", {
        method: "DELETE",
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Deleted ${result.deletedCount} entries with empty details`)
        loadScrapedContent()
      } else {
        throw new Error("Cleanup failed")
      }
    } catch (error) {
      toast.error("Failed to cleanup empty entries")
    }
  }

  const processAllExistingContent = async () => {
    setProcessing(true)
    try {
      const response = await fetch("/api/scraped-content/auto-process-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Processing started for ${result.totalProcessed} items`)
        loadScrapedContent()
      } else {
        throw new Error("Processing failed")
      }
    } catch (error) {
      toast.error("Failed to start automatic processing")
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "raw":
        return "bg-gray-100 text-gray-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "processed":
        return "bg-green-100 text-green-800"
      case "posted":
        return "bg-purple-100 text-purple-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "raw":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Bot className="h-4 w-4 animate-spin" />
      case "processed":
        return <CheckCircle className="h-4 w-4" />
      case "posted":
        return <Sparkles className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredContent = scrapedContent.filter((item) => {
    if (activeTab === "raw") return item.processing_status === "raw"
    if (activeTab === "processed") return item.processing_status === "processed"
    if (activeTab === "posted") return item.processing_status === "posted"
    if (activeTab === "failed") return item.processing_status === "failed"
    return true
  })

  const stats = {
    total: scrapedContent.length,
    raw: scrapedContent.filter((item) => item.processing_status === "raw").length,
    processed: scrapedContent.filter((item) => item.processing_status === "processed").length,
    posted: scrapedContent.filter((item) => item.processing_status === "posted").length,
    failed: scrapedContent.filter((item) => item.processing_status === "failed").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scraped Content Monitor</h1>
          <p className="text-muted-foreground">
            Monitor automatic content processing pipeline - scraping → AI processing → opportunity posting
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2">
            <Activity className="h-4 w-4" />
            Auto-Processing Active
          </Badge>

          <Button onClick={cleanupEmptyEntries} variant="outline" className="gap-2 bg-transparent">
            <XCircle className="h-4 w-4" />
            Cleanup Empty
          </Button>

          <Button onClick={processAllExistingContent} disabled={processing || stats.raw === 0} className="gap-2">
            {processing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Process All Existing ({stats.raw})
          </Button>

          <Button variant="outline" onClick={loadScrapedContent} className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Scraped</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-gray-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.raw}</div>
            <p className="text-sm text-muted-foreground">Raw Content</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-green-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
            <p className="text-sm text-muted-foreground">AI Processed</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-purple-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.posted}</div>
            <p className="text-sm text-muted-foreground">Live Opportunities</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow border-red-200">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-sm text-muted-foreground">Processing Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="raw" className="gap-2">
            <Clock className="h-4 w-4" />
            Raw ({stats.raw})
          </TabsTrigger>
          <TabsTrigger value="processed" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Processed ({stats.processed})
          </TabsTrigger>
          <TabsTrigger value="posted" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Posted ({stats.posted})
          </TabsTrigger>
          <TabsTrigger value="failed" className="gap-2">
            <XCircle className="h-4 w-4" />
            Failed ({stats.failed})
          </TabsTrigger>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredContent.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No content found for this status</p>
                <p className="text-sm text-muted-foreground">
                  Content will appear here automatically as it gets scraped and processed
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4">
                {filteredContent.map((content) => (
                  <Card
                    key={content.id}
                    className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg line-clamp-2">{content.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">{content.category}</Badge>
                            <Badge className={getStatusColor(content.processing_status)}>
                              {getStatusIcon(content.processing_status)}
                              <span className="ml-1 capitalize">{content.processing_status}</span>
                            </Badge>
                            {content.ai_confidence_score > 0 && (
                              <Badge variant="secondary">
                                Confidence: {Math.round(content.ai_confidence_score * 100)}%
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {new Date(content.scraped_at).toLocaleDateString()}
                            </Badge>
                          </CardDescription>
                        </div>

                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh]">
                              <DialogHeader>
                                <DialogTitle>{content.name}</DialogTitle>
                                <DialogDescription>Scraped from: {content.source_url}</DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="h-[60vh]">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Content Details</h4>
                                    <div className="prose prose-sm max-w-none">
                                      {content.details || "No content available"}
                                    </div>
                                  </div>
                                  <Separator />
                                  <div className="flex gap-4 text-sm text-muted-foreground">
                                    <span>Category: {content.category}</span>
                                    <span>Scraped: {new Date(content.scraped_at).toLocaleDateString()}</span>
                                    <a
                                      href={content.post_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-blue-600 hover:underline"
                                    >
                                      View Original <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>

                          {content.processing_status === "posted" && content.opportunity_id && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/opportunity/${content.opportunity_id}`} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-4 w-4" />
                                View Live
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {content.details ? content.details.substring(0, 200) : "No content available"}...
                      </p>
                      {content.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {content.tags.slice(0, 5).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {content.tags.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{content.tags.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
