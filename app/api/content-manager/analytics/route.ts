import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const metric = url.searchParams.get('metric') || 'overview'
    const timeframe = url.searchParams.get('timeframe') || '7d'
    const campaignId = url.searchParams.get('campaignId')

    const supabase = await createClient()

    // Calculate date range
    const now = new Date()
    const timeRanges = {
      '1d': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    }
    const startDate = timeRanges[timeframe as keyof typeof timeRanges] || timeRanges['7d']

    switch (metric) {
      case 'overview':
        return await getOverviewMetrics(supabase, startDate, campaignId)
      
      case 'campaign_performance':
        return await getCampaignPerformance(supabase, startDate, campaignId)
      
      case 'source_analytics':
        return await getSourceAnalytics(supabase, startDate, campaignId)
      
      case 'ai_performance':
        return await getAIPerformance(supabase, startDate, campaignId)
      
      case 'queue_status':
        return await getQueueStatus(supabase)
      
      default:
        return NextResponse.json(
          { error: 'Invalid metric' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

async function getOverviewMetrics(supabase: any, startDate: Date, campaignId?: string) {
  const filters = { gte: { created_at: startDate.toISOString() } }
  const campaignFilter = campaignId ? { eq: { campaign_id: campaignId } } : {}

  const [
    totalCampaigns,
    activeCampaigns,
    totalRuns,
    completedRuns,
    totalScraped,
    successfullyScraped,
    totalProcessed,
    highConfidenceItems,
    opportunitiesCreated
  ] = await Promise.all([
    // Total campaigns
    supabase.from('content_campaigns').select('id', { count: 'exact' }),
    
    // Active campaigns
    supabase.from('content_campaigns').select('id', { count: 'exact' }).eq('is_active', true),
    
    // Campaign runs in timeframe
    supabase.from('campaign_runs').select('id', { count: 'exact' }).gte('started_at', startDate.toISOString()),
    
    // Completed runs
    supabase.from('campaign_runs').select('id', { count: 'exact' })
      .eq('status', 'completed')
      .gte('started_at', startDate.toISOString()),
    
    // Total scraped items
    supabase.from('content_items').select('id', { count: 'exact' })
      .gte('created_at', startDate.toISOString())
      .match(campaignFilter),
    
    // Successfully scraped items
    supabase.from('content_items').select('id', { count: 'exact' })
      .eq('ai_processed', true)
      .gte('created_at', startDate.toISOString())
      .match(campaignFilter),
    
    // Total AI processed
    supabase.from('ai_processing_jobs').select('id', { count: 'exact' })
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString()),
    
    // High confidence items
    supabase.from('content_items').select('id', { count: 'exact' })
      .gte('extraction_confidence', 0.7)
      .gte('created_at', startDate.toISOString())
      .match(campaignFilter),
    
    // Opportunities created
    supabase.from('opportunities').select('id', { count: 'exact' })
      .gte('created_at', startDate.toISOString())
  ])

  const metrics = {
    campaigns: {
      total: totalCampaigns.count || 0,
      active: activeCampaigns.count || 0,
      runs: totalRuns.count || 0,
      successRate: totalRuns.count ? ((completedRuns.count || 0) / totalRuns.count * 100).toFixed(1) : '0'
    },
    scraping: {
      totalItems: totalScraped.count || 0,
      successfulItems: successfullyScraped.count || 0,
      successRate: totalScraped.count ? ((successfullyScraped.count || 0) / totalScraped.count * 100).toFixed(1) : '0'
    },
    aiProcessing: {
      totalProcessed: totalProcessed.count || 0,
      highConfidenceItems: highConfidenceItems.count || 0,
      confidenceRate: totalProcessed.count ? ((highConfidenceItems.count || 0) / totalProcessed.count * 100).toFixed(1) : '0'
    },
    opportunities: {
      created: opportunitiesCreated.count || 0,
      conversionRate: totalScraped.count ? ((opportunitiesCreated.count || 0) / totalScraped.count * 100).toFixed(1) : '0'
    }
  }

  return NextResponse.json({ success: true, metrics })
}

async function getCampaignPerformance(supabase: any, startDate: Date, campaignId?: string) {
  let query = supabase
    .from('campaign_runs')
    .select(`
      *,
      content_campaigns!inner(name, category)
    `)
    .gte('started_at', startDate.toISOString())
    .order('started_at', { ascending: false })

  if (campaignId) {
    query = query.eq('campaign_id', campaignId)
  }

  const { data: runs, error } = await query.limit(50)

  if (error) {
    throw error
  }

  // Calculate performance metrics per campaign
  const campaignStats = runs?.reduce((acc: any, run: any) => {
    const campaignId = run.campaign_id
    if (!acc[campaignId]) {
      acc[campaignId] = {
        name: run.content_campaigns.name,
        category: run.content_campaigns.category,
        totalRuns: 0,
        completedRuns: 0,
        totalItems: 0,
        totalCreated: 0,
        totalErrors: 0,
        avgExecutionTime: 0,
        executionTimes: []
      }
    }

    acc[campaignId].totalRuns++
    if (run.status === 'completed') acc[campaignId].completedRuns++
    acc[campaignId].totalItems += run.items_found || 0
    acc[campaignId].totalCreated += run.items_created || 0
    acc[campaignId].totalErrors += run.errors_count || 0
    
    if (run.execution_time_ms) {
      acc[campaignId].executionTimes.push(run.execution_time_ms)
    }

    return acc
  }, {})

  // Calculate averages
  Object.values(campaignStats || {}).forEach((stats: any) => {
    if (stats.executionTimes.length > 0) {
      stats.avgExecutionTime = Math.round(
        stats.executionTimes.reduce((a: number, b: number) => a + b, 0) / stats.executionTimes.length
      )
    }
    delete stats.executionTimes
    
    stats.successRate = stats.totalRuns ? ((stats.completedRuns / stats.totalRuns) * 100).toFixed(1) : '0'
    stats.conversionRate = stats.totalItems ? ((stats.totalCreated / stats.totalItems) * 100).toFixed(1) : '0'
  })

  return NextResponse.json({
    success: true,
    runs: runs || [],
    campaignStats: Object.values(campaignStats || {})
  })
}

async function getSourceAnalytics(supabase: any, startDate: Date, campaignId?: string) {
  let query = supabase
    .from('scraping_logs')
    .select(`
      *,
      content_sources!inner(name, domain)
    `)
    .gte('scraped_at', startDate.toISOString())

  const { data: logs, error } = await query.limit(1000)

  if (error) {
    throw error
  }

  // Aggregate by source
  const sourceStats = logs?.reduce((acc: any, log: any) => {
    const sourceId = log.source_id
    if (!acc[sourceId]) {
      acc[sourceId] = {
        name: log.content_sources.name,
        domain: log.content_sources.domain,
        totalRequests: 0,
        successfulRequests: 0,
        totalResponseTime: 0,
        responseTimes: [],
        errors: 0
      }
    }

    acc[sourceId].totalRequests++
    if (log.status === 'success') {
      acc[sourceId].successfulRequests++
    } else {
      acc[sourceId].errors++
    }
    
    if (log.response_time_ms) {
      acc[sourceId].totalResponseTime += log.response_time_ms
      acc[sourceId].responseTimes.push(log.response_time_ms)
    }

    return acc
  }, {})

  // Calculate averages
  Object.values(sourceStats || {}).forEach((stats: any) => {
    stats.successRate = stats.totalRequests ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1) : '0'
    stats.avgResponseTime = stats.responseTimes.length ? Math.round(stats.totalResponseTime / stats.responseTimes.length) : 0
    delete stats.totalResponseTime
    delete stats.responseTimes
  })

  return NextResponse.json({
    success: true,
    sourceStats: Object.values(sourceStats || {})
  })
}

async function getAIPerformance(supabase: any, startDate: Date, campaignId?: string) {
  let contentQuery = supabase
    .from('content_items')
    .select('extraction_confidence, ai_processed, ai_model_version')
    .eq('ai_processed', true)
    .gte('created_at', startDate.toISOString())

  if (campaignId) {
    contentQuery = contentQuery.eq('campaign_id', campaignId)
  }

  const [
    { data: contentItems },
    { data: processingJobs }
  ] = await Promise.all([
    contentQuery,
    supabase.from('ai_processing_jobs')
      .select('status, processing_time_ms, model_used, confidence_score')
      .gte('created_at', startDate.toISOString())
  ])

  // Calculate confidence distribution
  const confidenceDistribution = {
    'high (>0.8)': 0,
    'medium (0.6-0.8)': 0,
    'low (<0.6)': 0
  }

  contentItems?.forEach((item: any) => {
    const confidence = item.extraction_confidence || 0
    if (confidence > 0.8) confidenceDistribution['high (>0.8)']++
    else if (confidence >= 0.6) confidenceDistribution['medium (0.6-0.8)']++
    else confidenceDistribution['low (<0.6)']++
  })

  // Calculate processing times
  const processingTimes = processingJobs?.filter((job: any) => job.processing_time_ms).map((job: any) => job.processing_time_ms) || []
  const avgProcessingTime = processingTimes.length ? Math.round(processingTimes.reduce((a: number, b: number) => a + b, 0) / processingTimes.length) : 0

  return NextResponse.json({
    success: true,
    aiMetrics: {
      totalProcessed: contentItems?.length || 0,
      avgConfidence: contentItems?.length ? 
        (contentItems.reduce((sum: number, item: any) => sum + (item.extraction_confidence || 0), 0) / contentItems.length).toFixed(2) : '0',
      confidenceDistribution,
      avgProcessingTime,
      jobsCompleted: processingJobs?.filter((job: any) => job.status === 'completed').length || 0,
      jobsFailed: processingJobs?.filter((job: any) => job.status === 'failed').length || 0
    }
  })
}

async function getQueueStatus(supabase: any) {
  const { data: queueItems, error } = await supabase
    .from('scraping_queue')
    .select('status, scheduled_for, attempts')

  if (error) {
    throw error
  }

  const statusCounts = queueItems?.reduce((acc: any, item: any) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {}) || {}

  const overdue = queueItems?.filter((item: any) => 
    item.status === 'queued' && new Date(item.scheduled_for) < new Date()
  ).length || 0

  const retryingItems = queueItems?.filter((item: any) => 
    item.status === 'retrying'
  ).length || 0

  return NextResponse.json({
    success: true,
    queueStatus: {
      ...statusCounts,
      overdue,
      retrying: retryingItems,
      total: queueItems?.length || 0
    }
  })
}
