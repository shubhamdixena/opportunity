import { createClient } from "@/lib/supabase/client"
import type { ScrapingSource, ScheduleConfig, ScrapedOpportunity } from "@/lib/types/scraping"

const supabase = createClient()

export class ScrapingService {
  // Source management
  static async getSources(): Promise<ScrapingSource[]> {
    const { data, error } = await supabase
      .from("scraping_sources")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch sources: ${error.message}`)
    }

    return data || []
  }

  static async createSource(
    source: Omit<
      ScrapingSource,
      "id" | "created_at" | "updated_at" | "success_rate" | "total_attempts" | "successful_attempts"
    >,
  ): Promise<ScrapingSource> {
    const { data, error } = await supabase
      .from("scraping_sources")
      .insert({
        ...source,
        success_rate: 0,
        total_attempts: 0,
        successful_attempts: 0,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create source: ${error.message}`)
    }

    return data
  }

  static async updateSource(id: string, updates: Partial<ScrapingSource>): Promise<ScrapingSource> {
    const { data, error } = await supabase.from("scraping_sources").update(updates).eq("id", id).select().single()

    if (error) {
      throw new Error(`Failed to update source: ${error.message}`)
    }

    return data
  }

  static async deleteSource(id: string): Promise<void> {
    const { error } = await supabase.from("scraping_sources").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete source: ${error.message}`)
    }
  }

  // Schedule management
  static async getScheduleConfig(): Promise<ScheduleConfig | null> {
    const { data, error } = await supabase.from("scraping_schedule").select("*").single()

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch schedule config: ${error.message}`)
    }

    return data || null
  }

  static async updateScheduleConfig(config: Partial<ScheduleConfig>): Promise<ScheduleConfig> {
    // First try to update existing config
    const { data: existingData } = await supabase.from("scraping_schedule").select("id").single()

    if (existingData) {
      // Update existing
      const { data, error } = await supabase
        .from("scraping_schedule")
        .update(config)
        .eq("id", existingData.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update schedule config: ${error.message}`)
      }

      return data
    } else {
      // Create new
      const defaultConfig = {
        cron_expression: "0 */6 * * *", // Every 6 hours
        is_enabled: false,
        run_count: 0,
        total_sources_processed: 0,
        total_opportunities_found: 0,
        average_run_time_ms: 0,
        ...config,
      }

      const { data, error } = await supabase.from("scraping_schedule").insert(defaultConfig).select().single()

      if (error) {
        throw new Error(`Failed to create schedule config: ${error.message}`)
      }

      return data
    }
  }

  // Scraped opportunities management
  static async getScrapedOpportunities(
    page = 1,
    limit = 20,
    filters?: { source?: string; status?: string },
  ): Promise<{ data: ScrapedOpportunity[]; total: number }> {
    try {
      let query = supabase.from("scraped_opportunities").select("*", { count: "exact" })

      if (filters?.source) {
        query = query.eq("source_url", filters.source)
      }

      if (filters?.status) {
        query = query.eq("processing_status", filters.status)
      }

      const { data, count, error } = await query
        .order("scraped_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) {
        console.error("Supabase error details:", error)
        throw new Error(`Failed to fetch scraped opportunities: ${error.message || JSON.stringify(error)}`)
      }

      return {
        data: data || [],
        total: count || 0,
      }
    } catch (error) {
      console.error("Full error in getScrapedOpportunities:", error)
      throw error
    }
  }

  static async deleteScrapedOpportunity(id: string): Promise<void> {
    const { error } = await supabase.from("scraped_opportunities").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete scraped opportunity: ${error.message}`)
    }
  }

  static async clearAllScrapedOpportunities(): Promise<void> {
    try {
      const response = await fetch("/api/scraping/opportunities?clearAll=true", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(data.message)
    } catch (error) {
      console.error("Error clearing all scraped opportunities:", error)
      throw new Error(
        `Failed to clear all scraped opportunities: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  // Advanced scraping operations using Edge Functions
  static async discoverPosts(
    url: string,
    maxPosts = 10,
    strategy: "auto-detect" | "seed-first" | "rss-first" | "sitemap-first" = "auto-detect",
  ): Promise<{
    success: boolean
    posts: string[]
    methodUsed: string
    diagnostics: {
      seedCount: number
      rssCount: number
      sitemapCount: number
      seedCandidates: number
      rssCandidates: number
      sitemapCandidates: number
      sampleUrls: string[]
    }
    error?: string
  }> {
    try {
      const { data, error } = await supabase.functions.invoke("discover-posts", {
        body: { url, maxPosts, strategy },
      })

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error("Error discovering posts:", error)
      return {
        success: false,
        posts: [],
        methodUsed: "error",
        diagnostics: {
          seedCount: 0,
          rssCount: 0,
          sitemapCount: 0,
          seedCandidates: 0,
          rssCandidates: 0,
          sitemapCandidates: 0,
          sampleUrls: [],
        },
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  static async fetchPostContent(url: string): Promise<{
    success: boolean
    contentHtml?: string
    contentText?: string
    title?: string
    author?: string
    publishedAt?: string
    tags?: string[]
    error?: string
  }> {
    try {
      const { data, error } = await supabase.functions.invoke("fetch-post-content", {
        body: { url },
      })

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error("Error fetching post content:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  static async runScheduledScraper(
    urls?: string[],
    maxPosts = 10,
  ): Promise<{
    success: boolean
    totalOpportunities?: number
    sourcesProcessed?: number
    results?: any[]
    timestamp?: string
    message?: string
    skipped?: boolean
    error?: string
  }> {
    try {
      const urlsToScrape = urls && urls.length > 0 ? urls : ["https://opportunitiesforyouth.org/"]

      console.log(`Starting scraping for URLs: ${urlsToScrape} with maxPosts: ${maxPosts}`)

      const results = []
      let totalProcessed = 0
      let totalSkipped = 0
      let totalErrors = 0

      for (const baseUrl of urlsToScrape) {
        try {
          console.log(`Discovering posts from: ${baseUrl}`)

          const discoveryResult = await this.discoverPosts(baseUrl, maxPosts, "sitemap-first")

          if (!discoveryResult.success || discoveryResult.posts.length === 0) {
            console.error(`Failed to discover posts from ${baseUrl}:`, discoveryResult.error)
            continue
          }

          console.log(`Discovered ${discoveryResult.posts.length} posts using ${discoveryResult.methodUsed}`)

          // Step 2: Extract content from each discovered post URL
          for (const postUrl of discoveryResult.posts) {
            totalProcessed++
            try {
              console.log(`Extracting content from: ${postUrl}`)

              // Use server-side Edge Function to fetch content
              const contentResult = await this.fetchPostContent(postUrl)

              if (!contentResult.success) {
                console.error(`Failed to extract content from ${postUrl}:`, contentResult.error)
                totalErrors++
                continue
              }

              console.log("Content extracted successfully:", {
                title: contentResult.title?.substring(0, 50) + "...",
                contentLength: contentResult.contentText?.length || 0,
                author: contentResult.author,
              })

              if (!contentResult.contentText || contentResult.contentText.length < 100) {
                console.log("Skipping entry with insufficient content:", contentResult.title)
                totalSkipped++
                continue
              }

              const scrapedOpportunity = {
                name: contentResult.title || "Untitled Opportunity",
                source_url: new URL(baseUrl).origin,
                post_url: postUrl,
                content_html: contentResult.contentHtml || "",
                content_text: contentResult.contentText || "",
                details: contentResult.contentText || contentResult.contentHtml || "",
                author: contentResult.author || "Unknown",
                published_at: contentResult.publishedAt || new Date().toISOString(),
                tags: contentResult.tags || [],
                category: "Scholarship", // Default category
                scraped_at: new Date().toISOString(),
                processing_status: "raw" as const, // Start as raw for automatic processing
                ai_confidence_score: 0,
              }

              const { data: savedData, error: saveError } = await supabase
                .from("scraped_opportunities")
                .upsert([scrapedOpportunity], {
                  onConflict: "post_url",
                  ignoreDuplicates: false,
                })
                .select()

              if (saveError) {
                if (saveError.message.includes("duplicate key value violates unique constraint")) {
                  console.log("Opportunity already exists, skipped:", scrapedOpportunity.name)
                  totalSkipped++
                  continue
                } else {
                  console.error("Error saving scraped opportunity:", saveError)
                  totalErrors++
                  continue
                }
              }

              if (savedData && savedData.length > 0) {
                console.log("Successfully saved opportunity:", savedData[0]?.name)
                results.push(savedData[0])

                try {
                  const processResponse = await fetch("/api/scraped-content/process-ai", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: savedData[0].id,
                      title: savedData[0].name,
                      content: savedData[0].details,
                      sourceUrl: savedData[0].post_url,
                    }),
                  })

                  if (processResponse.ok) {
                    console.log("Successfully triggered AI processing for:", savedData[0].name)
                  } else {
                    console.error("Failed to trigger AI processing for:", savedData[0].name)
                  }
                } catch (processError) {
                  console.error("Failed to trigger AI processing:", processError)
                }
              } else {
                console.log("Opportunity already exists, skipped:", scrapedOpportunity.name)
                totalSkipped++
              }
            } catch (error) {
              console.error(`Error processing post URL ${postUrl}:`, error)
              totalErrors++
              continue
            }
          }
        } catch (error) {
          console.error(`Error processing base URL ${baseUrl}:`, error)
          totalErrors++
          continue
        }
      }

      const hasResults = results.length > 0
      const hasProcessedAny = totalProcessed > 0

      if (!hasProcessedAny) {
        throw new Error("No URLs could be processed - check if the sitemap URLs are accessible")
      }

      const message = hasResults
        ? `Successfully scraped ${results.length} new opportunities (${totalSkipped} duplicates skipped, ${totalErrors} errors) from ${urlsToScrape.length} sources`
        : `Processed ${totalProcessed} URLs but found no new opportunities (${totalSkipped} duplicates, ${totalErrors} errors)`

      return {
        success: hasResults || totalSkipped > 0, // Consider successful if we found new or existing opportunities
        totalOpportunities: results.length,
        sourcesProcessed: urlsToScrape.length,
        results: results,
        timestamp: new Date().toISOString(),
        message: message,
      }
    } catch (error) {
      console.error("Error running scheduled scraper:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Test scraping functionality
  static async testSource(url: string): Promise<{
    success: boolean
    discoveredPosts: number
    samplePosts: string[]
    contentSample?: {
      title?: string
      contentLength: number
      hasContent: boolean
    }
    error?: string
  }> {
    try {
      // Step 1: Test post discovery
      const discoveryResult = await this.discoverPosts(url, 5)

      if (!discoveryResult.success || discoveryResult.posts.length === 0) {
        return {
          success: false,
          discoveredPosts: 0,
          samplePosts: [],
          error: discoveryResult.error || "No posts discovered",
        }
      }

      // Step 2: Test content fetching with first post
      const firstPost = discoveryResult.posts[0]
      const contentResult = await this.fetchPostContent(firstPost)

      return {
        success: true,
        discoveredPosts: discoveryResult.posts.length,
        samplePosts: discoveryResult.posts.slice(0, 3),
        contentSample: {
          title: contentResult.title,
          contentLength: contentResult.contentText?.length || 0,
          hasContent: Boolean(contentResult.contentHtml || contentResult.contentText),
        },
      }
    } catch (error) {
      return {
        success: false,
        discoveredPosts: 0,
        samplePosts: [],
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Analytics and stats
  static async getScrapingStats(): Promise<{
    totalSources: number
    activeSources: number
    totalOpportunities: number
    recentOpportunities: number
    lastRunTime?: string
    avgSuccessRate: number
  }> {
    try {
      const [sourcesResult, opportunitiesResult, recentResult, scheduleResult] = await Promise.all([
        supabase.from("scraping_sources").select("is_active, success_rate"),
        supabase.from("scraped_opportunities").select("id", { count: "exact" }),
        supabase
          .from("scraped_opportunities")
          .select("id", { count: "exact" })
          .gte("scraped_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("scraping_schedule").select("last_run").single(),
      ])

      const sources = sourcesResult.data || []
      const totalSources = sources.length
      const activeSources = sources.filter((s: any) => s.is_active).length
      const avgSuccessRate =
        totalSources > 0 ? sources.reduce((sum: number, s: any) => sum + s.success_rate, 0) / totalSources : 0

      return {
        totalSources,
        activeSources,
        totalOpportunities: opportunitiesResult.count || 0,
        recentOpportunities: recentResult.count || 0,
        lastRunTime: scheduleResult.data?.last_run,
        avgSuccessRate,
      }
    } catch (error) {
      console.error("Error fetching scraping stats:", error)
      return {
        totalSources: 0,
        activeSources: 0,
        totalOpportunities: 0,
        recentOpportunities: 0,
        avgSuccessRate: 0,
      }
    }
  }
}

// Export singleton instance for convenience
export const scrapingService = new ScrapingService()
