import { createClient } from '@/lib/supabase/server'
import {
  scrapeWebpage,
  processScrapedContentWithAI,
  discoverContentUrls,
} from '@/lib/scraper'
import { createContentItem, updateContentItem } from '@/lib/content-manager'

export interface CampaignRun {
  id: string
  campaign_id: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  started_at: string
  completed_at?: string
  sources_processed: number
  items_found: number
  items_created: number
  errors_count: number
  error_details: Record<string, any>
  execution_time_ms?: number
  next_scheduled_run?: string
}

export interface ScrapingQueueItem {
  id: string
  campaign_id: string
  source_id: string
  url: string
  priority: number
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'retrying'
  attempts: number
  max_attempts: number
  scheduled_for: string
  started_at?: string
  completed_at?: string
  error_message?: string
  metadata: Record<string, any>
}

export class CampaignScheduler {

  /**
   * Create a new campaign run and queue scraping tasks
   */
  async startCampaignRun(campaignId: string): Promise<CampaignRun> {
    const startTime = Date.now()

    try {
      const supabase = await createClient()
      // Get campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from('content_campaigns')
        .select('*, source_ids')
        .eq('id', campaignId)
        .eq('is_active', true)
        .single()

      if (campaignError || !campaign) {
        throw new Error('Campaign not found or inactive')
      }

      // Create campaign run record
      const { data: campaignRun, error: runError } = await supabase
        .from('campaign_runs')
        .insert([{
          campaign_id: campaignId,
          status: 'running',
          started_at: new Date().toISOString(),
          sources_processed: 0,
          items_found: 0,
          items_created: 0,
          errors_count: 0,
          error_details: {}
        }])
        .select()
        .single()

      if (runError) {
        throw new Error(`Failed to create campaign run: ${runError.message}`)
      }

      // Get active sources for this campaign
      const { data: sources, error: sourcesError } = await supabase
        .from('content_sources')
        .select('*')
        .in('id', campaign.source_ids || [])
        .eq('is_active', true)

      if (sourcesError) {
        throw new Error(`Failed to get sources: ${sourcesError.message}`)
      }

      // Discover and queue scraping tasks for each source
      const allQueueItems = []
      for (const source of sources) {
        const discoveryResult = await discoverContentUrls(
          `https://${source.domain}`
        )
        if (discoveryResult.success && discoveryResult.urls.length > 0) {
          const queueItems = discoveryResult.urls.map((url) => ({
            campaign_id: campaignId,
            source_id: source.id,
            url: url, // Use discovered URL
            priority: 0,
            status: 'queued' as const,
            attempts: 0,
            max_attempts: 3,
            scheduled_for: new Date().toISOString(),
            metadata: {
              campaign_run_id: campaignRun.id,
              source_keywords: source.keywords,
              scraping_config: source.scraping_config,
            },
          }))
          allQueueItems.push(...queueItems)
        } else {
          console.warn(
            `No URLs discovered for source: ${source.name} (${source.domain})`
          )
        }
      }

      if (allQueueItems.length > 0) {
        const { error: queueError } = await supabase
          .from('scraping_queue')
          .insert(allQueueItems)

        if (queueError) {
          throw new Error(
            `Failed to queue scraping tasks: ${queueError.message}`
          )
        }
      }

      // Process the queue
      await this.processScrapingQueue(campaignRun.id)

      return campaignRun

    } catch (error) {
      console.error('Campaign run failed:', error)
      throw error
    }
  }

  /**
   * Process items in the scraping queue
   */
  async processScrapingQueue(campaignRunId: string): Promise<void> {
    const supabase = await createClient()
    const { data: queueItems, error } = await supabase
      .from('scraping_queue')
      .select('*')
      .eq('status', 'queued')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10) // Process in batches

    if (error) {
      console.error('Failed to get queue items:', error)
      return
    }

    for (const item of queueItems || []) {
      await this.processQueueItem(item, campaignRunId)
    }
  }

  /**
   * Process a single queue item
   */
  async processQueueItem(item: ScrapingQueueItem, campaignRunId: string): Promise<void> {
    const startTime = Date.now()

    try {
      const supabase = await createClient()
      // Mark as processing
      await supabase
        .from('scraping_queue')
        .update({
          status: 'processing',
          started_at: new Date().toISOString(),
          attempts: item.attempts + 1
        })
        .eq('id', item.id)

      // Scrape the webpage
      const scrapedContent = await scrapeWebpage(item.url, item.metadata.scraping_config)

      if (!scrapedContent) {
        throw new Error('Failed to scrape content')
      }

      // Log the scraping result
      await this.logScrapingResult(campaignRunId, item, 'success', Date.now() - startTime, {
        content_length: scrapedContent.content.length,
        title: scrapedContent.title
      })

      // Create content item with enhanced data
      const contentItem = await createContentItem({
        title: scrapedContent.title,
        content: scrapedContent.content,
        raw_html: scrapedContent.metadata.raw_html || '',
        source_name: scrapedContent.metadata.organization || 'Unknown',
        source_url: scrapedContent.url,
        campaign_id: item.campaign_id,
        status: 'pending',
        ai_processed: false,
        category: 'Misc',
        extraction_metadata: {
          scraped_at: new Date().toISOString(),
          scraping_method: 'campaign',
          campaign_run_id: campaignRunId,
          source_id: item.source_id
        }
      })

      // Process with AI
      const aiResult = await processScrapedContentWithAI(scrapedContent)
      
      if (aiResult.success && aiResult.data) {
        // Update content item with AI results and confidence
        await updateContentItem(contentItem.id, {
          ai_processed: true,
          extraction_confidence: this.calculateConfidence(aiResult.data),
          ai_model_version: 'gemini-1.5-flash',
          extraction_metadata: {
            ...contentItem.extraction_metadata,
            ai_processed_at: new Date().toISOString(),
            ai_success: true
          }
        })

        // Create opportunity if confidence is high enough
        const confidence = this.calculateConfidence(aiResult.data)
        if (confidence >= 0.1) {
          await this.createOpportunityFromAI(aiResult.data, contentItem.id)
        }
      }

      // Mark queue item as completed
      await supabase
        .from('scraping_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', item.id)

      // Update campaign run stats
      await this.updateCampaignRunStats(campaignRunId, {
        items_found: 1,
        items_created: aiResult.success ? 1 : 0
      })

    } catch (error) {
      console.error(`Failed to process queue item ${item.id}:`, error)

      // Log the error
      await this.logScrapingResult(campaignRunId, item, 'failed', Date.now() - startTime, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      // Update queue item
      const shouldRetry = item.attempts < item.max_attempts
      await supabase
        .from('scraping_queue')
        .update({
          status: shouldRetry ? 'retrying' : 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          scheduled_for: shouldRetry ? 
            new Date(Date.now() + (item.attempts * 30000)).toISOString() : // Exponential backoff
            undefined
        })
        .eq('id', item.id)

      // Update campaign run error count
      await this.updateCampaignRunStats(campaignRunId, {
        errors_count: 1
      })
    }
  }

  /**
   * Calculate confidence score from AI extracted data
   */
  private calculateConfidence(data: any): number {
    let score = 0
    const fields = [
      'title', 'organization', 'description', 'deadline', 
      'aboutOpportunity', 'requirements', 'howToApply'
    ]

    fields.forEach(field => {
      if (data[field] && data[field].trim().length > 0) {
        score += 1
      }
    })

    // Bonus points for specific fields
    if (data.deadline && data.deadline !== '') score += 0.5
    if (data.amount && data.amount !== 'Variable') score += 0.5
    if (data.contactEmail) score += 0.5

    return Math.min(score / fields.length, 1)
  }

  /**
   * Create opportunity from AI extracted data
   */
  private async createOpportunityFromAI(aiData: any, contentItemId: string): Promise<void> {
    try {
      const supabase = await createClient()

      // Convert camelCase keys from AI to snake_case for the database
      const snakeCaseData = Object.keys(aiData).reduce((acc, key) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        acc[snakeKey] = aiData[key];
        return acc;
      }, {} as any);

      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .insert([{
          ...snakeCaseData,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error(`Error creating opportunity for content item ${contentItemId}:`, error)
      }

      if (!error && opportunity) {
        // Link content item to opportunity
        await updateContentItem(contentItemId, {
          opportunity_id: opportunity.id,
          status: 'published'
        })
      }
    } catch (error) {
      console.error('Failed to create opportunity:', error)
    }
  }

  /**
   * Log scraping result
   */
  private async logScrapingResult(
    campaignRunId: string,
    item: ScrapingQueueItem,
    status: string,
    responseTime: number,
    metadata: Record<string, any>
  ): Promise<void> {
    const supabase = await createClient()
    await supabase
      .from('scraping_logs')
      .insert([{
        campaign_run_id: campaignRunId,
        source_id: item.source_id,
        url: item.url,
        status,
        response_time_ms: responseTime,
        content_length: metadata.content_length,
        http_status_code: metadata.http_status_code,
        error_message: metadata.error,
        metadata
      }])
  }

  /**
   * Update campaign run statistics
   */
  private async updateCampaignRunStats(
    campaignRunId: string,
    updates: {
      sources_processed?: number
      items_found?: number
      items_created?: number
      errors_count?: number
    }
  ): Promise<void> {
    const supabase = await createClient()
    const { data: currentRun } = await supabase
      .from('campaign_runs')
      .select('*')
      .eq('id', campaignRunId)
      .single()

    if (currentRun) {
      await supabase
        .from('campaign_runs')
        .update({
          sources_processed: (currentRun.sources_processed || 0) + (updates.sources_processed || 0),
          items_found: (currentRun.items_found || 0) + (updates.items_found || 0),
          items_created: (currentRun.items_created || 0) + (updates.items_created || 0),
          errors_count: (currentRun.errors_count || 0) + (updates.errors_count || 0)
        })
        .eq('id', campaignRunId)
    }
  }

  /**
   * Complete a campaign run
   */
  async completeCampaignRun(campaignRunId: string): Promise<void> {
    const completedAt = new Date().toISOString()

    const supabase = await createClient()
    const { data: run } = await supabase
      .from('campaign_runs')
      .select('*')
      .eq('id', campaignRunId)
      .single()

    if (run) {
      const executionTime = new Date(completedAt).getTime() - new Date(run.started_at).getTime()

      await supabase
        .from('campaign_runs')
        .update({
          status: 'completed',
          completed_at: completedAt,
          execution_time_ms: executionTime
        })
        .eq('id', campaignRunId)
    }
  }

  /**
   * Get campaign runs with stats
   */
  async getCampaignRuns(campaignId?: string): Promise<CampaignRun[]> {
    const supabase = await createClient()
    let query = supabase
      .from('campaign_runs')
      .select('*')

    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    const { data, error } = await query
      .order('started_at', { ascending: false })
      .limit(50)

    if (error) {
      throw new Error(`Failed to get campaign runs: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get scraping queue status
   */
  async getQueueStatus(): Promise<{
    queued: number
    processing: number
    completed: number
    failed: number
  }> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('scraping_queue')
      .select('status')

    if (error) {
      throw error
    }

    const stats = { queued: 0, processing: 0, completed: 0, failed: 0 }
    data?.forEach(item => {
      if (item.status in stats) {
        stats[item.status as keyof typeof stats]++
      }
    })

    return stats
  }
}

export const campaignScheduler = new CampaignScheduler()
