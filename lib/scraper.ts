import { processContentWithAI } from '@/lib/ai/gemini'
import * as cheerio from 'cheerio'

// Types for scraping
export interface ScrapingConfig {
  source_id: string
  url: string
  selectors: {
    title?: string
    content?: string
    deadline?: string
    organization?: string
    description?: string
    url?: string
    location?: string
    amount?: string
    requirements?: string
    apply_info?: string
  }
  filters: {
    keywords?: string[]
    excluded_keywords?: string[]
    min_length?: number
    max_age_days?: number
  }
}

export interface ScrapedContent {
  title: string
  url: string
  content: string
  metadata: {
    organization?: string
    deadline?: string
    location?: string
    amount?: string
    description?: string
    requirements?: string
    apply_info?: string
    raw_html?: string
    scraped_at: string
    source_url: string
  }
}

export interface OpportunityData {
  title: string
  organization: string
  description: string
  category: string
  location: string
  deadline: string
  amount: string
  tags: string
  url: string
  featured: boolean
  aboutOpportunity: string
  requirements: string
  howToApply: string
  whatYouGet: string
  programStartDate: string
  programEndDate: string
  contactEmail: string
  eligibilityAge: string
  languageRequirements: string
  fundingType: string
  eligibleCountries: string
  minAmount: string
  maxAmount: string
}

// Web scraping function compatible with Vercel
export async function scrapeWebpage(url: string, config?: Partial<ScrapingConfig>): Promise<ScrapedContent | null> {
  try {
    // Use a scraping service API or implement basic scraping
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OpportunityBot/1.0; +https://yoursite.com/bot)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    
    // Basic HTML parsing (in production, you might want to use a service like ScrapingBee or Browserless)
    const content = extractContent(html, config?.selectors)
    
    if (!content.title || !content.content) {
      return null
    }

    return {
      title: content.title,
      url,
      content: content.content,
      metadata: {
        organization: content.organization,
        deadline: content.deadline,
        location: content.location,
        amount: content.amount,
        description: content.description,
        requirements: content.requirements,
        apply_info: content.apply_info,
        raw_html: html,
        scraped_at: new Date().toISOString(),
        source_url: url
      }
    }
  } catch (error) {
    console.error('Scraping error:', error)
    return null
  }
}

// Basic content extraction using regex and simple parsing
function extractContent(html: string, selectors?: ScrapingConfig['selectors']) {
  const $ = cheerio.load(html)

  // Extract title
  const title = selectors?.title ? $(selectors.title).first().text().trim() : $('title').first().text().trim()

  // Extract meta description
  const description = selectors?.description ? $(selectors.description).first().text().trim() : $('meta[name="description"]').attr('content') || ''

  // Extract content
  const content = selectors?.content ? $(selectors.content).text().trim() : $('body').text().trim()

  // Remove scripts and styles from content
  const cleanContent = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Look for common opportunity-related patterns
  const opportunityInfo = extractOpportunityInfo(cleanContent)

  return {
    title,
    content: cleanContent.slice(0, 5000), // Limit content length
    description,
    organization: selectors?.organization ? $(selectors.organization).first().text().trim() : opportunityInfo.organization,
    deadline: selectors?.deadline ? $(selectors.deadline).first().text().trim() : opportunityInfo.deadline,
    location: selectors?.location ? $(selectors.location).first().text().trim() : opportunityInfo.location,
    amount: selectors?.amount ? $(selectors.amount).first().text().trim() : opportunityInfo.amount,
    requirements: selectors?.requirements ? $(selectors.requirements).first().text().trim() : opportunityInfo.requirements,
    apply_info: selectors?.apply_info ? $(selectors.apply_info).first().text().trim() : opportunityInfo.apply_info
  }
}

// Extract opportunity-specific information
function extractOpportunityInfo(text: string) {
  const info: any = {}

  // Deadline patterns
  const deadlinePatterns = [
    /deadline[:\s]+([^.!?\n]{1,50})/i,
    /due[:\s]+([^.!?\n]{1,50})/i,
    /apply by[:\s]+([^.!?\n]{1,50})/i,
    /closing date[:\s]+([^.!?\n]{1,50})/i
  ]
  
  for (const pattern of deadlinePatterns) {
    const match = text.match(pattern)
    if (match) {
      info.deadline = match[1].trim()
      break
    }
  }

  // Amount patterns
  const amountPatterns = [
    /\$[\d,]+(?:\.\d{2})?/g,
    /€[\d,]+(?:\.\d{2})?/g,
    /£[\d,]+(?:\.\d{2})?/g,
    /award[:\s]+([^.!?\n]*[\d,]+[^.!?\n]*)/i,
    /scholarship[:\s]+([^.!?\n]*[\d,]+[^.!?\n]*)/i,
    /funding[:\s]+([^.!?\n]*[\d,]+[^.!?\n]*)/i
  ]

  for (const pattern of amountPatterns) {
    const match = text.match(pattern)
    if (match) {
      info.amount = match[0] || match[1]
      break
    }
  }

  // Organization patterns
  const orgPatterns = [
    /offered by[:\s]+([^.!?\n]{1,100})/i,
    /sponsored by[:\s]+([^.!?\n]{1,100})/i,
    /foundation[:\s]+([^.!?\n]{1,100})/i,
    /university[:\s]+([^.!?\n]{1,100})/i
  ]

  for (const pattern of orgPatterns) {
    const match = text.match(pattern)
    if (match) {
      info.organization = match[1].trim()
      break
    }
  }

  // Location patterns
  const locationPatterns = [
    /location[:\s]+([^.!?\n]{1,50})/i,
    /country[:\s]+([^.!?\n]{1,50})/i,
    /eligible[:\s]+([^.!?\n]*countries?[^.!?\n]*)/i
  ]

  for (const pattern of locationPatterns) {
    const match = text.match(pattern)
    if (match) {
      info.location = match[1].trim()
      break
    }
  }

  return info
}

// AI-powered content processing to extract structured opportunity data
export async function processScrapedContentWithAI(scrapedContent: ScrapedContent): Promise<{
  success: boolean
  data?: Partial<OpportunityData>
  error?: string
}> {
  try {
    // Use the new extractOpportunityData function
    const { extractOpportunityData } = await import('@/lib/ai/gemini')
    
    const result = await extractOpportunityData(
      scrapedContent.title,
      scrapedContent.content,
      scrapedContent.url
    )

    if (!result.success && result.error?.includes('Invalid JSON')) {
      // Fallback: create basic opportunity data
      return {
        success: true,
        data: {
          title: scrapedContent.title,
          organization: scrapedContent.metadata.organization || 'Unknown',
          description: scrapedContent.metadata.description || scrapedContent.content.slice(0, 200),
          category: 'Misc',
          location: scrapedContent.metadata.location || 'Global',
          deadline: scrapedContent.metadata.deadline || '',
          amount: scrapedContent.metadata.amount || 'Variable',
          url: scrapedContent.url,
          aboutOpportunity: scrapedContent.content.slice(0, 1000),
          requirements: scrapedContent.metadata.requirements || '',
          howToApply: scrapedContent.metadata.apply_info || 'Visit the website for application details',
          tags: 'opportunity,funding',
          fundingType: 'Variable Amount',
          eligibleCountries: 'Global',
          featured: false
        }
      }
    }

    return result
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Batch scraping function for campaigns
export async function runScrapingCampaign(
  sources: string[], 
  keywords: string[] = [],
  maxResults: number = 10
): Promise<{
  success: boolean
  results: ScrapedContent[]
  errors: string[]
}> {
  const results: ScrapedContent[] = []
  const errors: string[] = []

  for (const sourceUrl of sources.slice(0, 5)) { // Limit to 5 sources to avoid timeouts
    try {
      // Create search URLs based on keywords
      const searchUrls = keywords.length > 0 
        ? keywords.map(keyword => `${sourceUrl}?search=${encodeURIComponent(keyword)}`)
        : [sourceUrl]

      for (const url of searchUrls.slice(0, 2)) { // Max 2 searches per source
        try {
          const scrapedContent = await scrapeWebpage(url)
          if (scrapedContent && scrapedContent.title && scrapedContent.content) {
            results.push(scrapedContent)
            
            if (results.length >= maxResults) {
              break
            }
          }
        } catch (error) {
          errors.push(`Failed to scrape ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      if (results.length >= maxResults) {
        break
      }

      // Add delay to be respectful to servers
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      errors.push(`Failed to process source ${sourceUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return {
    success: results.length > 0,
    results,
    errors
  }
}

// RSS/Sitemap discovery and scraping
export async function discoverContentUrls(siteUrl: string): Promise<{
  success: boolean
  urls: string[]
  source: 'rss' | 'sitemap' | 'links'
  error?: string
}> {
  try {
    const baseUrl = new URL(siteUrl).origin
    const urlsFound: string[] = []
    let source: 'rss' | 'sitemap' | 'links' = 'links'

    // Try RSS feeds first
    const rssUrls = await tryDiscoverRSS(baseUrl)
    if (rssUrls.length > 0) {
      urlsFound.push(...rssUrls)
      source = 'rss'
    }

    // Try sitemap if no RSS found
    if (urlsFound.length === 0) {
      const sitemapUrls = await tryDiscoverSitemap(baseUrl)
      if (sitemapUrls.length > 0) {
        urlsFound.push(...sitemapUrls)
        source = 'sitemap'
      }
    }

    // Fallback to scraping the main page for links
    if (urlsFound.length === 0) {
      const pageUrls = await scrapePageLinks(siteUrl)
      urlsFound.push(...pageUrls)
      source = 'links'
    }

    return {
      success: true,
      urls: urlsFound.slice(0, 50), // Limit to 50 URLs
      source
    }
  } catch (error) {
    return {
      success: false,
      urls: [],
      source: 'links',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function tryDiscoverRSS(baseUrl: string): Promise<string[]> {
  const rssUrls = [
    `${baseUrl}/feed`,
    `${baseUrl}/rss`,
    `${baseUrl}/feed.xml`,
    `${baseUrl}/rss.xml`,
    `${baseUrl}/atom.xml`,
    `${baseUrl}/index.xml`
  ]

  for (const rssUrl of rssUrls) {
    try {
      const response = await fetch(rssUrl)
      if (response.ok) {
        const xml = await response.text()
        if (xml.includes('<rss') || xml.includes('<feed') || xml.includes('<atom')) {
          return await parseRSSFeed(xml, baseUrl)
        }
      }
    } catch (error) {
      continue
    }
  }

  return []
}

async function parseRSSFeed(xml: string, baseUrl: string): Promise<string[]> {
  const urls: string[] = []
  
  // Simple RSS/Atom parsing using regex (in production, use a proper XML parser)
  const linkMatches = xml.match(/<link[^>]*>([^<]+)<\/link>/g) || 
                     xml.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/g) ||
                     xml.match(/<guid[^>]*>([^<]+)<\/guid>/g)

  if (linkMatches) {
    for (const match of linkMatches) {
      let url = match.replace(/<[^>]+>/g, '').trim()
      
      // Handle relative URLs
      if (url.startsWith('/')) {
        url = baseUrl + url
      } else if (!url.startsWith('http')) {
        continue
      }

      // Filter for opportunity-related content
      if (isOpportunityUrl(url)) {
        urls.push(url)
      }
    }
  }

  return [...new Set(urls)].slice(0, 30) // Remove duplicates and limit
}

async function tryDiscoverSitemap(baseUrl: string): Promise<string[]> {
  const sitemapUrls = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/sitemaps/sitemap.xml`
  ]

  for (const sitemapUrl of sitemapUrls) {
    try {
      const response = await fetch(sitemapUrl)
      if (response.ok) {
        const xml = await response.text()
        if (xml.includes('<urlset') || xml.includes('<sitemapindex')) {
          return await parseSitemap(xml, baseUrl)
        }
      }
    } catch (error) {
      continue
    }
  }

  return []
}

async function parseSitemap(xml: string, baseUrl: string): Promise<string[]> {
  const urls: string[] = []
  
  // Extract URLs from sitemap
  const urlMatches = xml.match(/<loc>([^<]+)<\/loc>/g)
  
  if (urlMatches) {
    for (const match of urlMatches) {
      const url = match.replace(/<\/?loc>/g, '').trim()
      
      if (url.startsWith('http') && isOpportunityUrl(url)) {
        urls.push(url)
      }
    }
  }

  return [...new Set(urls)].slice(0, 30)
}

async function scrapePageLinks(pageUrl: string): Promise<string[]> {
  try {
    const response = await fetch(pageUrl)
    if (!response.ok) return []

    const html = await response.text()
    const baseUrl = new URL(pageUrl).origin
    const urls: string[] = []

    // Extract links using regex
    const linkMatches = html.match(/href=["']([^"']+)["']/g)
    
    if (linkMatches) {
      for (const match of linkMatches) {
        let url = match.replace(/href=["']|["']/g, '').trim()
        
        // Handle relative URLs
        if (url.startsWith('/')) {
          url = baseUrl + url
        } else if (!url.startsWith('http')) {
          continue
        }

        if (isOpportunityUrl(url)) {
          urls.push(url)
        }
      }
    }

    return [...new Set(urls)].slice(0, 20)
  } catch (error) {
    return []
  }
}

function isOpportunityUrl(url: string): boolean {
  const opportunityKeywords = [
    'scholarship', 'fellowship', 'grant', 'funding', 'opportunity',
    'internship', 'conference', 'competition', 'exchange', 'program',
    'award', 'bursary', 'stipend', 'research', 'study'
  ]

  const urlLower = url.toLowerCase()
  return opportunityKeywords.some(keyword => urlLower.includes(keyword))
}

// Bulk scraping function for discovered URLs
export async function bulkScrapeUrls(urls: string[]): Promise<{
  success: boolean
  results: ScrapedContent[]
  failed: string[]
  summary: {
    total: number
    scraped: number
    failed: number
  }
}> {
  const results: ScrapedContent[] = []
  const failed: string[] = []
  
  // Process URLs in batches to avoid overwhelming the server
  const batchSize = 5
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize)
    
    const batchPromises = batch.map(async (url) => {
      try {
        const content = await scrapeWebpage(url)
        if (content && content.title && content.content) {
          return content
        }
        return null
      } catch (error) {
        failed.push(url)
        return null
      }
    })

    const batchResults = await Promise.all(batchPromises)
    
    for (const result of batchResults) {
      if (result) {
        results.push(result)
      }
    }

    // Add delay between batches
    if (i + batchSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  return {
    success: results.length > 0,
    results,
    failed,
    summary: {
      total: urls.length,
      scraped: results.length,
      failed: failed.length
    }
  }
}

// Alternative: Use a scraping service API (recommended for production)
export async function scrapeWithService(url: string): Promise<ScrapedContent | null> {
  try {
    // Example integration with ScrapingBee (you would need to add their API key)
    const apiKey = process.env.SCRAPINGBEE_API_KEY
    if (!apiKey) {
      return scrapeWebpage(url) // Fallback to basic scraping
    }

    const response = await fetch(`https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(url)}&render_js=false`)
    
    if (!response.ok) {
      throw new Error(`ScrapingBee API error: ${response.status}`)
    }

    const html = await response.text()
    const content = extractContent(html)
    
    if (!content.title || !content.content) {
      return null
    }

    return {
      title: content.title,
      url,
      content: content.content,
      metadata: {
        organization: content.organization,
        deadline: content.deadline,
        location: content.location,
        amount: content.amount,
        description: content.description,
        requirements: content.requirements,
        apply_info: content.apply_info,
        scraped_at: new Date().toISOString(),
        source_url: url
      }
    }
  } catch (error) {
    console.error('ScrapingBee error:', error)
    return scrapeWebpage(url) // Fallback to basic scraping
  }
}
