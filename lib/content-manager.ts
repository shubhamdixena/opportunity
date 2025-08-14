import { createClient } from '@/lib/supabase/server'

// Types
export interface ContentSource {
  id: string
  name: string
  domain: string
  is_active: boolean
  keywords: string[]
  last_scraped: string | null
  posts_found: number
  success_rate: number
  scraping_config?: any
  created_at?: string
  updated_at?: string
}

export interface ContentCampaign {
  id: string
  name: string
  source_ids: string[]
  keywords: string[]
  category: string
  frequency: number
  frequency_unit: 'minutes' | 'hours' | 'days'
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
  post_template: {
    title_template?: string
    content_template?: string
    add_tags?: boolean
    set_category?: boolean
  }
  created_at?: string
  updated_at?: string
}

export interface ContentItem {
  id: string
  title: string
  content?: string
  raw_html?: string
  source_name?: string
  source_url?: string
  campaign_id?: string
  status: 'pending' | 'processing' | 'scheduled' | 'published' | 'failed'
  scheduled_time?: string
  created_at: string
  updated_at?: string
  ai_processed: boolean
  extraction_confidence?: number
  ai_model_version?: string
  extraction_metadata?: any
  category?: string
  estimated_time?: string
  error_message?: string
  opportunity_id?: string
}

export interface AIProcessingJob {
  id: string
  content_item_id: string
  job_type: 'rewrite' | 'quality_check' | 'seo_optimize' | 'translate'
  input_data: any
  output_data?: any
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
  processing_time_ms?: number
  model_used?: string
  created_at: string
  updated_at?: string
}

// Content Sources Functions
export async function getContentSources(): Promise<ContentSource[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_sources')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createContentSource(source: Omit<ContentSource, 'id' | 'created_at' | 'updated_at'>): Promise<ContentSource> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_sources')
    .insert([source])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateContentSource(id: string, updates: Partial<ContentSource>): Promise<ContentSource> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_sources')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteContentSource(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_sources')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Content Campaigns Functions
export async function getContentCampaigns(): Promise<ContentCampaign[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createContentCampaign(campaign: Omit<ContentCampaign, 'id' | 'created_at' | 'updated_at'>): Promise<ContentCampaign> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_campaigns')
    .insert([campaign])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateContentCampaign(id: string, updates: Partial<ContentCampaign>): Promise<ContentCampaign> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_campaigns')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteContentCampaign(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_campaigns')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Content Items Functions
export async function getContentItems(filters?: {
  status?: string
  source_name?: string
  campaign_id?: string
  limit?: number
  offset?: number
}): Promise<ContentItem[]> {
  const supabase = await createClient()
  let query = supabase
    .from('content_items')
    .select('*')

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.source_name && filters.source_name !== 'all') {
    query = query.eq('source_name', filters.source_name)
  }

  if (filters?.campaign_id) {
    query = query.eq('campaign_id', filters.campaign_id)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function createContentItem(item: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>): Promise<ContentItem> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_items')
    .insert([item])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateContentItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteContentItem(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function bulkUpdateContentItems(ids: string[], updates: Partial<ContentItem>): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('content_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .in('id', ids)

  if (error) throw error
}

// AI Processing Jobs Functions
export async function createAIProcessingJob(job: Omit<AIProcessingJob, 'id' | 'created_at' | 'updated_at'>): Promise<AIProcessingJob> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ai_processing_jobs')
    .insert([job])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAIProcessingJobs(contentItemId?: string): Promise<AIProcessingJob[]> {
  const supabase = await createClient()
  let query = supabase
    .from('ai_processing_jobs')
    .select('*')

  if (contentItemId) {
    query = query.eq('content_item_id', contentItemId)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function updateAIProcessingJob(id: string, updates: Partial<AIProcessingJob>): Promise<AIProcessingJob> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ai_processing_jobs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Stats and Analytics
export async function getContentStats() {
  const supabase = await createClient()
  
  const [
    contentItemsCount,
    publishedThisWeek,
    scheduled,
    failed,
    pending,
    activeCampaigns,
    activeSources
  ] = await Promise.all([
    supabase.from('content_items').select('id', { count: 'exact' }),
    supabase
      .from('content_items')
      .select('id', { count: 'exact' })
      .eq('status', 'published')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('content_items').select('id', { count: 'exact' }).eq('status', 'scheduled'),
    supabase.from('content_items').select('id', { count: 'exact' }).eq('status', 'failed'),
    supabase.from('content_items').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('content_campaigns').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('content_sources').select('id', { count: 'exact' }).eq('is_active', true)
  ])

  return {
    total: contentItemsCount.count || 0,
    publishedThisWeek: publishedThisWeek.count || 0,
    scheduled: scheduled.count || 0,
    failed: failed.count || 0,
    pending: pending.count || 0,
    activeCampaigns: activeCampaigns.count || 0,
    activeSources: activeSources.count || 0
  }
}

// Utility function to convert opportunities to content items
export async function createContentItemFromOpportunity(opportunityId: string): Promise<ContentItem> {
  // Get opportunity data
  const supabase = await createClient()
  const { data: opportunity, error: oppError } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', opportunityId)
    .single()

  if (oppError) throw oppError

  // Create content item
  const contentItem: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'> = {
    title: opportunity.title,
    content: opportunity.about_opportunity || '',
    source_name: opportunity.organization,
    source_url: opportunity.website_url || opportunity.application_url,
    status: 'pending',
    ai_processed: false,
    category: opportunity.category,
    opportunity_id: opportunityId
  }

  return await createContentItem(contentItem)
}
