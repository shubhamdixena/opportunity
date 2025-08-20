"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Sparkles,
  RefreshCw,
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

export function ScrapedContentManager() {
  const [scrapedContent, setScrapedContent] = useState<ScrapedOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    loadScrapedContent()
    const interval = setInterval(loadScrapedContent, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadScrapedContent = async () => {
    try {
      const response = await fetch(`/api/scraped-content?limit=20`)
      if (response.ok) {
        const result = await response.json()
        setScrapedContent(result.data || [])
      }
    } catch (error) {
      toast.error("Failed to load scraped content")
    } finally {
      setLoading(false)
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
        return <RefreshCw className="h-4 w-4 animate-spin" />
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
          <h1 className="text-2xl font-bold">Scraped Content</h1>
          <p className="text-muted-foreground">Monitor scraped opportunities and their processing status</p>
        </div>
        <Button onClick={loadScrapedContent} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Simple Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
            <p className="text-sm text-muted-foreground">Processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.posted}</div>
            <p className="text-sm text-muted-foreground">Posted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="raw">Raw ({stats.raw})</TabsTrigger>
          <TabsTrigger value="processed">Processed ({stats.processed})</TabsTrigger>
          <TabsTrigger value="posted">Posted ({stats.posted})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({stats.failed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredContent.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No content found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredContent.map((content) => (
                <Card key={content.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">{content.name}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{content.category}</Badge>
                          <Badge className={getStatusColor(content.processing_status)}>
                            {getStatusIcon(content.processing_status)}
                            <span className="ml-1 capitalize">{content.processing_status}</span>
                          </Badge>
                          {content.ai_confidence_score > 0 && (
                            <Badge variant="secondary">
                              {Math.round(content.ai_confidence_score * 100)}%
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {new Date(content.scraped_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={content.post_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        {content.processing_status === "posted" && content.opportunity_id && (
                          <a href={`/opportunity/${content.opportunity_id}`} target="_blank" rel="noreferrer">
                            <Button variant="outline" size="sm">
                              View Live
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {content.details ? content.details.substring(0, 150) : "No content available"}...
                    </p>
                    {content.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {content.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {content.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{content.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
