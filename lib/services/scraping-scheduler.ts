export interface SchedulerConfig {
  frequency: number
  frequencyUnit: "minutes" | "hours' | days"
  maxPosts: number
  isEnabled: boolean
}

export interface ScrapingSource {
  id?: string
  name: string
  url: string
  maxPosts: number
  isActive: boolean
  sourceType: "sitemap" | "rss" | "manual"
}

export class ScrapingScheduler {
  private static instance: ScrapingScheduler
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false

  static getInstance(): ScrapingScheduler {
    if (!ScrapingScheduler.instance) {
      ScrapingScheduler.instance = new ScrapingScheduler()
    }
    return ScrapingScheduler.instance
  }

  // Save a scraping source for future use
  async saveScrapingSource(source: ScrapingSource): Promise<string> {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("scraping_sources")
      .insert([
        {
          name: source.name,
          url: source.url,
          max_posts: source.maxPosts,
          is_active: source.isActive,
          source_type: source.sourceType,
          success_rate: 0,
          total_attempts: 0,
          successful_attempts: 0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error saving scraping source:", error)
      throw new Error(`Failed to save scraping source: ${error.message}`)
    }

    return data.id
  }

  // Get all saved scraping sources
  async getSavedSources(): Promise<ScrapingSource[]> {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("scraping_sources")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching scraping sources:", error)
      return []
    }

    return data.map((source) => ({
      id: source.id,
      name: source.name,
      url: source.url,
      maxPosts: source.max_posts,
      isActive: source.is_active,
      sourceType: source.source_type as "sitemap" | "rss" | "manual",
    }))
  }

  // Create or update scraping schedule
  async createSchedule(config: SchedulerConfig): Promise<void> {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    // Convert frequency to cron expression
    const cronExpression = this.generateCronExpression(config.frequency, config.frequencyUnit)
    const nextRun = this.calculateNextRun(config.frequency, config.frequencyUnit)

    const { error } = await supabase.from("scraping_schedule").upsert([
      {
        cron_expression: cronExpression,
        next_run: nextRun.toISOString(),
        is_enabled: config.isEnabled,
        run_count: 0,
        total_opportunities_found: 0,
        total_sources_processed: 0,
      },
    ])

    if (error) {
      console.error("Error creating schedule:", error)
      throw new Error(`Failed to create schedule: ${error.message}`)
    }
  }

  // Start the scheduler
  async startScheduler(): Promise<void> {
    if (this.isRunning) {
      console.log("Scheduler is already running")
      return
    }

    const schedule = await this.getActiveSchedule()
    if (!schedule) {
      console.log("No active schedule found")
      return
    }

    this.isRunning = true
    console.log("Starting scraping scheduler...")

    // Check every minute if it's time to run
    this.intervalId = setInterval(async () => {
      try {
        await this.checkAndRunScheduledScraping()
      } catch (error) {
        console.error("Error in scheduled scraping:", error)
      }
    }, 60000) // Check every minute
  }

  // Stop the scheduler
  stopScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log("Scraping scheduler stopped")
  }

  // Check if it's time to run and execute scraping
  private async checkAndRunScheduledScraping(): Promise<void> {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data: schedule } = await supabase.from("scraping_schedule").select("*").eq("is_enabled", true).single()

    if (!schedule) return

    const now = new Date()
    const nextRun = new Date(schedule.next_run)

    if (now >= nextRun) {
      console.log("Running scheduled scraping...")
      await this.executeScheduledScraping(schedule.id)
    }
  }

  // Execute the actual scraping
  private async executeScheduledScraping(scheduleId: string): Promise<void> {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    try {
      // Get active sources
      const sources = await this.getSavedSources()
      const activeSources = sources.filter((source) => source.isActive)

      if (activeSources.length === 0) {
        console.log("No active sources found for scheduled scraping")
        return
      }

      // Import scraping service
      const { ScrapingService } = await import("./scraping-service-v2")
      const scrapingService = new ScrapingService()

      let totalOpportunities = 0
      let sourcesProcessed = 0

      // Process each active source
      for (const source of activeSources) {
        try {
          console.log(`Scraping source: ${source.name} (${source.url})`)

          const results = await scrapingService.runScheduledScraper([source.url], source.maxPosts)
          totalOpportunities += results.length
          sourcesProcessed++

          // Update source statistics
          await supabase
            .from("scraping_sources")
            .update({
              last_scraped_at: new Date().toISOString(),
              total_attempts: supabase.raw("total_attempts + 1"),
              successful_attempts: supabase.raw("successful_attempts + 1"),
              success_rate: supabase.raw("(successful_attempts::float / total_attempts) * 100"),
            })
            .eq("id", source.id)
        } catch (error) {
          console.error(`Error scraping source ${source.name}:`, error)

          // Update failed attempt
          await supabase
            .from("scraping_sources")
            .update({
              total_attempts: supabase.raw("total_attempts + 1"),
              success_rate: supabase.raw("(successful_attempts::float / total_attempts) * 100"),
            })
            .eq("id", source.id)
        }
      }

      // Update schedule statistics and next run time
      const nextRun = this.calculateNextRun(1, "hours") // Default to 1 hour for now

      await supabase
        .from("scraping_schedule")
        .update({
          last_run: new Date().toISOString(),
          next_run: nextRun.toISOString(),
          run_count: supabase.raw("run_count + 1"),
          total_opportunities_found: supabase.raw(`total_opportunities_found + ${totalOpportunities}`),
          total_sources_processed: supabase.raw(`total_sources_processed + ${sourcesProcessed}`),
        })
        .eq("id", scheduleId)

      console.log(
        `Scheduled scraping completed: ${totalOpportunities} opportunities found from ${sourcesProcessed} sources`,
      )
    } catch (error) {
      console.error("Error in scheduled scraping execution:", error)

      // Update schedule with error
      await supabase
        .from("scraping_schedule")
        .update({
          last_error: error instanceof Error ? error.message : "Unknown error",
          last_run: new Date().toISOString(),
        })
        .eq("id", scheduleId)
    }
  }

  // Get active schedule
  private async getActiveSchedule() {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data } = await supabase.from("scraping_schedule").select("*").eq("is_enabled", true).single()

    return data
  }

  // Generate cron expression from frequency
  private generateCronExpression(frequency: number, unit: string): string {
    switch (unit) {
      case "minutes":
        return `*/${frequency} * * * *`
      case "hours":
        return `0 */${frequency} * * *`
      case "days":
        return `0 0 */${frequency} * *`
      default:
        return "0 */1 * * *" // Default to every hour
    }
  }

  // Calculate next run time
  private calculateNextRun(frequency: number, unit: string): Date {
    const now = new Date()
    switch (unit) {
      case "minutes":
        return new Date(now.getTime() + frequency * 60 * 1000)
      case "hours":
        return new Date(now.getTime() + frequency * 60 * 60 * 1000)
      case "days":
        return new Date(now.getTime() + frequency * 24 * 60 * 60 * 1000)
      default:
        return new Date(now.getTime() + 60 * 60 * 1000) // Default to 1 hour
    }
  }
}
