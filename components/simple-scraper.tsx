"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Globe,
  Clock,
  CheckCircle2,
  Loader2,
  Database,
  Activity,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react"
import { ScrapingService } from "@/lib/services/scraping-service-v2"
import type { ScrapedOpportunity as ImportedScrapedOpportunity } from "@/lib/types/scraping"
import { createClient } from "@/lib/supabase/client"

interface UrlEntry {
  id: string
  url: string
}

interface ScrapedOpportunity {
  id: string
  name?: string
  source_url: string
  post_url?: string
  scraped_at: string
  processing_status?: "raw" | "processed" | "converted" | "rejected"
  ai_confidence_score?: number
  category?: string
  author?: string
  content_html?: string
  content_text?: string
}

export default function SimpleScraper() {
  const [urls, setUrls] = useState<UrlEntry[]>([{ id: "1", url: "" }])
  const [maxPosts, setMaxPosts] = useState<number>(10)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentUrl, setCurrentUrl] = useState<string>()
  const [results, setResults] = useState<ScrapedOpportunity[]>([])
  const [totalUrls, setTotalUrls] = useState(0)
  const [processedUrls, setProcessedUrls] = useState(0)
  const [totalResults, setTotalResults] = useState(0)
  const [startTime, setStartTime] = useState<Date>()
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const itemsPerPage = 3

  // Load recent results on mount and set up real-time subscription
  useEffect(() => {
    loadRecentResults()

    // Set up real-time subscription for scraped opportunities
    const supabase = createClient()
    const channel = supabase
      .channel("scraped_opportunities_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scraped_opportunities",
        },
        (payload: any) => {
          console.log("Real-time update received:", payload)
          // Reload results when data changes
          loadRecentResults()
        },
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadRecentResults = async () => {
    try {
      setIsLoading(true)
      setError("")
      console.log("Starting to load recent results...")

      const data = await ScrapingService.getScrapedOpportunities(1, 50)
      console.log("Received data:", data)

      setResults(
        data.data.map((item: ImportedScrapedOpportunity) => ({
          id: item.id,
          name: item.name,
          source_url: item.source_url || "",
          post_url: item.post_url,
          scraped_at: item.scraped_at,
          processing_status: item.processing_status,
          ai_confidence_score: item.ai_confidence_score,
          category: item.category,
          author: item.author,
          content_html: item.content_html,
          content_text: item.content_text,
        })),
      )
      setTotalResults(data.data.length)
      setCurrentPage(1) // Reset to first page when loading new results
    } catch (error) {
      console.error("Error loading results:", error)
      setError(error instanceof Error ? error.message : "Failed to load results")
      setResults([])
      setTotalResults(0)
    } finally {
      setIsLoading(false)
    }
  }

  const addUrl = () => {
    const newUrl: UrlEntry = {
      id: Date.now().toString(),
      url: "",
    }
    setUrls([...urls, newUrl])
  }

  const removeUrl = (id: string) => {
    setUrls((prev) => {
      const next = prev.filter((url) => url.id !== id)
      return next.length > 0 ? next : [{ id: Date.now().toString(), url: "" }]
    })
  }

  const updateUrl = (id: string, newUrl: string) => {
    setUrls(urls.map((url) => (url.id === id ? { ...url, url: newUrl } : url)))
  }

  const handleMaxPostsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "") {
      setMaxPosts(1) // Default to 1 when empty
    } else {
      const parsed = Number.parseInt(value)
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
        setMaxPosts(parsed)
      }
    }
  }

  const handleStartScraping = async (e: React.FormEvent) => {
    e.preventDefault()

    setError("")
    const urlsToUse = urls.map((u) => u.url.trim()).filter((u) => u.length > 0)

    if (urlsToUse.length === 0) {
      setError("Please add at least one valid URL")
      return
    }

    if (maxPosts < 1 || maxPosts > 100) {
      setError("Maximum posts must be between 1 and 100")
      return
    }

    setIsRunning(true)
    setProgress(0)
    setProcessedUrls(0)
    setTotalUrls(urlsToUse.length)
    setStartTime(new Date())

    console.log(`Starting to scrape ${urlsToUse.length} URL(s) for up to ${maxPosts} posts each`)

    try {
      // Pass the actual URLs to the scraper
      setCurrentUrl(`Scraping ${urlsToUse.length} URL(s)...`)
      setProgress(25)

      const result = await ScrapingService.runScheduledScraper(urlsToUse, maxPosts)

      if (result.success) {
        console.log("Scraping completed:", result)
        setProgress(100)
        setProcessedUrls(urlsToUse.length)

        // Reload results after scraping
        await loadRecentResults()

        if (result.totalOpportunities && result.totalOpportunities > 0) {
          setError("")
        } else {
          setError(`Scraping completed but no new opportunities found. ${result.message || ""}`)
        }
      } else {
        throw new Error(result.error || "Scraping failed")
      }
    } catch (error) {
      console.error("Scraping error:", error)
      setError(`Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsRunning(false)
      setCurrentUrl(undefined)
    }
  }

  const handleStopScraping = () => {
    setIsRunning(false)
    setCurrentUrl(undefined)
    console.log("Scraping process has been stopped by user")
  }

  const clearResults = async () => {
    if (!window.confirm("Are you sure you want to clear all scraped opportunities? This action cannot be undone.")) {
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // Clear from database
      await ScrapingService.clearAllScrapedOpportunities()

      // Clear local state
      setResults([])
      setTotalResults(0)
      setCurrentPage(1)

      console.log("All scraped opportunities cleared from database.")
    } catch (error) {
      console.error("Error clearing results:", error)
      setError(`Failed to clear database: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const formatElapsedTime = () => {
    if (!startTime) return "0s"
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
  }

  // Pagination logic
  const totalPages = Math.ceil(results.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedResults = results.slice(startIndex, startIndex + itemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const truncateText = (text: string, maxLength = 200) => {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Scraper Configuration */}
      <Card>
        <CardContent>
          <form onSubmit={handleStartScraping} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">URLs to Scrape</div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addUrl}
                    disabled={isRunning}
                    className="h-8 bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add URL
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {urls.map((urlEntry, index) => (
                  <div key={urlEntry.id} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="url"
                        value={urlEntry.url}
                        onChange={(e) => updateUrl(urlEntry.id, e.target.value)}
                        placeholder={`Enter URL ${index + 1}`}
                        disabled={isRunning}
                        className="transition-all duration-200"
                      />
                    </div>
                    {urls.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeUrl(urlEntry.id)}
                        disabled={isRunning}
                        className="h-10 w-10 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Maximum Posts per URL</div>
                <Input
                  id="maxPosts"
                  type="number"
                  min={1}
                  max={100}
                  value={maxPosts.toString()} // Ensure value is always a string
                  onChange={handleMaxPostsChange} // Use new handler to prevent NaN
                  disabled={isRunning}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {!isRunning ? (
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-all duration-200"
                  disabled={isLoading}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isLoading ? "Loading..." : "Start Scraping"}
                </Button>
              ) : (
                <Button type="button" variant="destructive" onClick={handleStopScraping} className="flex-1">
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Scraping
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Progress Section */}
      {(isRunning || progress > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : progress === 100 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                Scraping Progress
              </div>
              <Badge variant="outline">{isRunning ? "Running" : progress === 100 ? "Completed" : "Stopped"}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full h-2" />
            </div>

            {/* Current Status */}
            {currentUrl && isRunning && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Currently scraping:</span>
                </div>
                <div className="text-sm font-mono bg-muted/50 p-2 rounded border truncate">{currentUrl}</div>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">{processedUrls}</div>
                <div className="text-xs text-muted-foreground">Base URLs Processed</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">{totalUrls}</div>
                <div className="text-xs text-muted-foreground">Total Base URLs</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">{totalResults}</div>
                <div className="text-xs text-muted-foreground">Posts Found</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">{startTime ? formatElapsedTime() : "0s"}</div>
                <div className="text-xs text-muted-foreground">Elapsed Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Scraped Opportunities ({results.length})
            </CardTitle>
            <CardDescription>
              Recent opportunities discovered from your sources
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadRecentResults}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex items-center gap-2 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {results.length > 0 && (
              <Button
                onClick={clearResults}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Database
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Loading...</h3>
              <p className="mt-1 text-sm text-gray-500">Fetching scraped opportunities from the database.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No opportunities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by adding URLs and clicking 'Start Scraping' to discover opportunities.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto border rounded-lg">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-[20%]">Title</TableHead>
                      <TableHead className="w-[10%]">Status</TableHead>
                      <TableHead className="w-[12%]">Published</TableHead>
                      <TableHead className="w-[12%]">Scraped</TableHead>
                      <TableHead className="w-[46%]">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResults.map((opportunity) => {
                      const scrapedDate = formatDate(opportunity.scraped_at)
                      const content = opportunity.content_text || opportunity.content_html || "No content available"

                      return (
                        <TableRow key={opportunity.id}>
                          <TableCell className="w-[20%]">
                            <div className="space-y-1">
                              {opportunity.post_url ? (
                                <a
                                  href={opportunity.post_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {opportunity.name || "Untitled Opportunity"}
                                </a>
                              ) : (
                                <div className="font-medium">{opportunity.name || "Untitled Opportunity"}</div>
                              )}
                              {opportunity.category && (
                                <div className="text-xs text-muted-foreground">{opportunity.category}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="w-[10%]">
                            <Badge variant="outline" className="capitalize">
                              {opportunity.processing_status || "raw"}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-[12%]">
                            <div className="text-sm text-muted-foreground">
                              {opportunity.author ? <div>{opportunity.author}</div> : <div>Unknown</div>}
                            </div>
                          </TableCell>
                          <TableCell className="w-[12%]">
                            <div className="text-sm">
                              {scrapedDate.date}
                              <br />
                              <span className="text-xs text-muted-foreground">{scrapedDate.time}</span>
                            </div>
                          </TableCell>
                          <TableCell className="w-[46%]">
                            <div className="max-h-[120px] overflow-y-auto text-sm text-muted-foreground pr-2">
                              <div className="whitespace-pre-wrap break-words">
                                {content.replace(/<[^>]*>/g, "") || "No content available"}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, results.length)} of{" "}
                    {results.length} opportunities
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page)}
                          className="min-w-[32px]"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
