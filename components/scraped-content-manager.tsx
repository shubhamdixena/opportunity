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
import { Eye, Bot, CheckCircle, XCircle, Clock, ExternalLink, Sparkles, ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface ScrapedOpportunity {
  id: string
  name: string
  details: string
  post_url: string
  source_url: string
  category: string
  tags: string[]
  processing_status: "pending" | "processing" | "processed" | "converted" | "failed"
  ai_confidence_score: number
  scraped_at: string
  opportunity_id?: string
}

interface ProcessedOpportunity {
  title: string
  organization: string
  description: string
  category: string
  location: string
  deadline: string
  amount: string
  tags: string
  aboutOpportunity: string
  requirements: string
  howToApply: string
  whatYouGet: string
  fundingType: string
  eligibleCountries: string
  confidence: number
}

export function ScrapedContentManager() {
  const [scrapedContent, setScrapedContent] = useState<ScrapedOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [selectedContent, setSelectedContent] = useState<ScrapedOpportunity | null>(null)
  const [processedData, setProcessedData] = useState<ProcessedOpportunity | null>(null)
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    loadScrapedContent()
  }, [])

  const loadScrapedContent = async () => {
    try {
      const response = await fetch("/api/scraped-content")
      if (response.ok) {
        const data = await response.json()
        setScrapedContent(data)
      }
    } catch (error) {
      toast.error("Failed to load scraped content")
    } finally {
      setLoading(false)
    }
  }

  const processWithAI = async (content: ScrapedOpportunity) => {
    setProcessing(content.id)
    try {
      const response = await fetch("/api/scraped-content/process-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: content.id,
          title: content.name,
          content: content.details,
          sourceUrl: content.post_url,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setProcessedData(result.data)
        setSelectedContent(content)

        // Update the content status
        setScrapedContent((prev) =>
          prev.map((item) =>
            item.id === content.id
              ? { ...item, processing_status: "processed", ai_confidence_score: result.confidence }
              : item,
          ),
        )

        toast.success("Content processed successfully with AI")
      } else {
        throw new Error("Processing failed")
      }
    } catch (error) {
      toast.error("Failed to process content with AI")
      setScrapedContent((prev) =>
        prev.map((item) => (item.id === content.id ? { ...item, processing_status: "failed" } : item)),
      )
    } finally {
      setProcessing(null)
    }
  }

  const convertToOpportunity = async (content: ScrapedOpportunity, processedData: ProcessedOpportunity) => {
    try {
      const response = await fetch("/api/scraped-content/convert-opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scrapedId: content.id,
          opportunityData: processedData,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        // Update the content status
        setScrapedContent((prev) =>
          prev.map((item) =>
            item.id === content.id
              ? { ...item, processing_status: "converted", opportunity_id: result.opportunityId }
              : item,
          ),
        )

        toast.success("Successfully converted to opportunity!")
        setSelectedContent(null)
        setProcessedData(null)
      } else {
        throw new Error("Conversion failed")
      }
    } catch (error) {
      toast.error("Failed to convert to opportunity")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "processed":
        return "bg-green-100 text-green-800"
      case "converted":
        return "bg-purple-100 text-purple-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Bot className="h-4 w-4 animate-spin" />
      case "processed":
        return <CheckCircle className="h-4 w-4" />
      case "converted":
        return <Sparkles className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredContent = scrapedContent.filter((item) => {
    if (activeTab === "pending") return item.processing_status === "pending"
    if (activeTab === "processed") return item.processing_status === "processed"
    if (activeTab === "converted") return item.processing_status === "converted"
    if (activeTab === "failed") return item.processing_status === "failed"
    return true
  })

  const stats = {
    total: scrapedContent.length,
    pending: scrapedContent.filter((item) => item.processing_status === "pending").length,
    processed: scrapedContent.filter((item) => item.processing_status === "processed").length,
    converted: scrapedContent.filter((item) => item.processing_status === "converted").length,
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
      <div>
        <h1 className="text-3xl font-bold">Scraped Content Manager</h1>
        <p className="text-muted-foreground">Process and convert scraped content into opportunities using AI</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Content</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
            <p className="text-sm text-muted-foreground">Processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.converted}</div>
            <p className="text-sm text-muted-foreground">Converted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="processed">Processed ({stats.processed})</TabsTrigger>
          <TabsTrigger value="converted">Converted ({stats.converted})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({stats.failed})</TabsTrigger>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredContent.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No content found for this status</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredContent.map((content) => (
                <Card key={content.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg line-clamp-2">{content.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
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
                                  <div className="prose prose-sm max-w-none">{content.details}</div>
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

                        {content.processing_status === "pending" && (
                          <Button onClick={() => processWithAI(content)} disabled={processing === content.id} size="sm">
                            {processing === content.id ? (
                              <Bot className="h-4 w-4 animate-spin" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                            Process with AI
                          </Button>
                        )}

                        {content.processing_status === "converted" && content.opportunity_id && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/opportunity/${content.opportunity_id}`} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-4 w-4" />
                              View Opportunity
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{content.details.substring(0, 200)}...</p>
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
          )}
        </TabsContent>
      </Tabs>

      {/* AI Processing Result Dialog */}
      {selectedContent && processedData && (
        <Dialog
          open={true}
          onOpenChange={() => {
            setSelectedContent(null)
            setProcessedData(null)
          }}
        >
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>AI Processed Opportunity</DialogTitle>
              <DialogDescription>Review the AI-processed content and convert to opportunity</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[70vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original Content */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Original Content</h3>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{selectedContent.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none text-sm">
                        {selectedContent.details.substring(0, 500)}...
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Processed Content */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">AI Processed Content</h3>
                    <Badge variant="secondary">Confidence: {Math.round(processedData.confidence * 100)}%</Badge>
                  </div>
                  <Card>
                    <CardContent className="space-y-4 p-4">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <p className="text-sm">{processedData.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Organization</label>
                        <p className="text-sm">{processedData.organization}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <p className="text-sm">{processedData.category}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Amount</label>
                        <p className="text-sm">{processedData.amount}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Deadline</label>
                        <p className="text-sm">{processedData.deadline}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">About Opportunity</label>
                        <p className="text-sm line-clamp-4">{processedData.aboutOpportunity}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Requirements</label>
                        <p className="text-sm line-clamp-3">{processedData.requirements}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedContent(null)
                  setProcessedData(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => convertToOpportunity(selectedContent, processedData)}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Convert to Opportunity
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
