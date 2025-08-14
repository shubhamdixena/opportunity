import { NextRequest, NextResponse } from 'next/server'
import { scrapeWebpage, runScrapingCampaign, processScrapedContentWithAI, discoverContentUrls, bulkScrapeUrls } from '@/lib/scraper'
import { createContentItem, getContentSources } from '@/lib/content-manager'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'scrape_single':
        return await scrapeSingle(data)
      case 'scrape_campaign':
        return await scrapeCampaign(data)
      case 'scrape_campaign_bulk':
        return await scrapeCampaignBulk(data)
      case 'process_scraped':
        return await processScraped(data)
      case 'scrape_and_convert':
        return await scrapeAndConvert(data)
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in scraping:', error)
    return NextResponse.json(
      { error: 'Scraping failed' },
      { status: 500 }
    )
  }
}

async function scrapeSingle(data: { url: string; sourceId?: string; config?: any }) {
  const { url, sourceId, config } = data
  
  try {
    const startTime = Date.now()
    const scrapedContent = await scrapeWebpage(url, config)
    const responseTime = Date.now() - startTime
    
    if (!scrapedContent) {
      return NextResponse.json(
        { error: 'Failed to scrape content from URL' },
        { status: 400 }
      )
    }

    // Create content item
    const contentItem = await createContentItem({
      title: scrapedContent.title,
      content: scrapedContent.content,
      source_name: scrapedContent.metadata.organization || 'Manual Scrape',
      source_url: url,
      status: 'pending',
      ai_processed: false,
      category: 'Misc'
    })

    return NextResponse.json({
      success: true,
      scrapedContent,
      contentItem,
      responseTime
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scraping failed' },
      { status: 500 }
    )
  }
}

async function scrapeCampaign(data: {
  sources: string[]
  keywords?: string[]
  maxResults?: number
  createContentItems?: boolean
}) {
  const { sources, keywords = [], maxResults = 10, createContentItems = true } = data
  
  try {
    const results = await runScrapingCampaign(sources, keywords, maxResults)
    
    if (!results.success || results.results.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No content was successfully scraped',
        errors: results.errors
      })
    }

    const contentItems = []
    
    if (createContentItems) {
      // Create content items for each scraped result
      for (const scrapedContent of results.results) {
        try {
          const contentItem = await createContentItem({
            title: scrapedContent.title,
            content: scrapedContent.content,
            source_name: scrapedContent.metadata.organization || 'Campaign Scrape',
            source_url: scrapedContent.url,
            status: 'pending',
            ai_processed: false,
            category: 'Misc'
          })
          contentItems.push(contentItem)
        } catch (error) {
          console.error('Failed to create content item:', error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      scraped: results.results.length,
      errors: results.errors,
      contentItems: contentItems.length,
      results: results.results.map(r => ({
        title: r.title,
        url: r.url,
        organization: r.metadata.organization,
        deadline: r.metadata.deadline,
        amount: r.metadata.amount
      }))
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Campaign scraping failed' },
      { status: 500 }
    )
  }
}

async function processScraped(data: { contentItemId: string }) {
  const { contentItemId } = data
  
  try {
    // Get content item
    const supabase = createClient()
    const { data: contentItem, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', contentItemId)
      .single()

    if (error || !contentItem) {
      return NextResponse.json(
        { error: 'Content item not found' },
        { status: 404 }
      )
    }

    // Create scraped content object
    const scrapedContent = {
      title: contentItem.title,
      url: contentItem.source_url || '',
      content: contentItem.content || '',
      metadata: {
        organization: contentItem.source_name,
        scraped_at: contentItem.created_at,
        source_url: contentItem.source_url || ''
      }
    }

    // Process with AI
    const result = await processScrapedContentWithAI(scrapedContent)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      extractedData: result.data
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    )
  }
}

async function scrapeAndConvert(data: { url: string; autoProcess?: boolean }) {
  const { url, autoProcess = true } = data
  
  try {
    // Step 1: Scrape the webpage
    const scrapedContent = await scrapeWebpage(url)
    
    if (!scrapedContent) {
      return NextResponse.json(
        { error: 'Failed to scrape content from URL' },
        { status: 400 }
      )
    }

    // Step 2: Process with AI to extract opportunity data
    const processResult = await processScrapedContentWithAI(scrapedContent)
    
    if (!processResult.success) {
      return NextResponse.json({
        success: false,
        error: processResult.error,
        scrapedContent // Return scraped content even if AI processing fails
      })
    }

    // Step 3: Optionally create opportunity directly
    let opportunityId = null
    if (autoProcess && processResult.data) {
      try {
        const supabase = createClient()
        const { data: opportunity, error: createError } = await supabase
          .from('opportunities')
          .insert([{
            ...processResult.data,
            status: 'draft', // Create as draft for review
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (!createError && opportunity) {
          opportunityId = opportunity.id
        }
      } catch (error) {
        console.error('Failed to create opportunity:', error)
      }
    }

    return NextResponse.json({
      success: true,
      scrapedContent,
      extractedData: processResult.data,
      opportunityId,
      message: opportunityId 
        ? 'Successfully scraped, processed, and created opportunity'
        : 'Successfully scraped and processed content'
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scrape and convert failed' },
      { status: 500 }
    )
  }
}

async function scrapeCampaignBulk(data: {
  sources: string[]
  maxResults?: number
}) {
  const { sources, maxResults = 20 } = data
  
  try {
    const allResults: any[] = []
    let totalFound = 0
    let totalProcessed = 0
    let totalFailed = 0

    for (const sourceUrl of sources) {
      try {
        console.log(`Discovering URLs from: ${sourceUrl}`)
        
        // Discover URLs from the source
        const discovery = await discoverContentUrls(sourceUrl)
        
        if (!discovery.success || discovery.urls.length === 0) {
          console.log(`No URLs found for ${sourceUrl}`)
          continue
        }

        console.log(`Found ${discovery.urls.length} URLs from ${sourceUrl} via ${discovery.source}`)
        totalFound += discovery.urls.length

        // Limit URLs to scrape
        const urlsToScrape = discovery.urls.slice(0, Math.min(maxResults, 15))
        
        // Bulk scrape the discovered URLs
        const scrapeResult = await bulkScrapeUrls(urlsToScrape)
        
        console.log(`Scraped ${scrapeResult.results.length} pages from ${sourceUrl}`)

        // Process each scraped result with AI
        for (const scrapedContent of scrapeResult.results) {
          try {
            const processResult = await processScrapedContentWithAI(scrapedContent)
            
            const result = {
              id: Date.now().toString() + Math.random().toString(36),
              title: scrapedContent.title,
              url: scrapedContent.url,
              source: new URL(sourceUrl).hostname,
              status: processResult.success ? 'completed' : 'failed',
              deadline: processResult.data?.deadline || '',
              amount: processResult.data?.amount || '',
              organization: processResult.data?.organization || scrapedContent.metadata.organization || '',
              category: processResult.data?.category || 'Misc',
              scraped_at: scrapedContent.metadata.scraped_at,
              ai_processed: processResult.success,
              opportunity_data: processResult.success ? processResult.data : null,
              error_message: processResult.success ? undefined : processResult.error
            }

            allResults.push(result)
            
            if (processResult.success) {
              totalProcessed++
            } else {
              totalFailed++
            }
          } catch (error) {
            console.error('Failed to process scraped content:', error)
            totalFailed++
            
            allResults.push({
              id: Date.now().toString() + Math.random().toString(36),
              title: scrapedContent.title,
              url: scrapedContent.url,
              source: new URL(sourceUrl).hostname,
              status: 'failed',
              scraped_at: scrapedContent.metadata.scraped_at,
              ai_processed: false,
              error_message: 'AI processing failed'
            })
          }
        }

        totalFailed += scrapeResult.failed.length

      } catch (error) {
        console.error(`Failed to process source ${sourceUrl}:`, error)
        totalFailed++
      }
    }

    return NextResponse.json({
      success: allResults.length > 0,
      results: allResults,
      total_found: totalFound,
      total_processed: totalProcessed,
      total_failed: totalFailed,
      summary: {
        sources_processed: sources.length,
        opportunities_found: allResults.length,
        ai_processed: totalProcessed,
        failed: totalFailed
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Bulk scraping failed' },
      { status: 500 }
    )
  }
}

// GET endpoint to list recent scraping activity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const supabase = createClient()
    
    // Get recent content items that were scraped
    const { data: items, error } = await supabase
      .from('content_items')
      .select('*')
      .not('source_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({
      success: true,
      items: items || []
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch scraping history' },
      { status: 500 }
    )
  }
}
