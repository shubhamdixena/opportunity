import { createClient } from '@/lib/supabase/client';
import { ScrapingSource, ScheduleConfig, ScrapedOpportunity } from '@/lib/types/scraping';
import { extractWebContent } from './content-extractor-service';

const supabase = createClient();

export class ScrapingService {
  // Source management
  static async getSources(): Promise<ScrapingSource[]> {
    const { data, error } = await supabase
      .from('scraping_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch sources: ${error.message}`);
    }

    return data || [];
  }

  static async createSource(source: Omit<ScrapingSource, 'id' | 'created_at' | 'updated_at' | 'success_rate' | 'total_attempts' | 'successful_attempts'>): Promise<ScrapingSource> {
    const { data, error } = await supabase
      .from('scraping_sources')
      .insert({
        ...source,
        success_rate: 0,
        total_attempts: 0,
        successful_attempts: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create source: ${error.message}`);
    }

    return data;
  }

  static async updateSource(id: string, updates: Partial<ScrapingSource>): Promise<ScrapingSource> {
    const { data, error } = await supabase
      .from('scraping_sources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update source: ${error.message}`);
    }

    return data;
  }

  static async deleteSource(id: string): Promise<void> {
    const { error } = await supabase
      .from('scraping_sources')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete source: ${error.message}`);
    }
  }

  // Schedule management
  static async getScheduleConfig(): Promise<ScheduleConfig | null> {
    const { data, error } = await supabase
      .from('scraping_schedule')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch schedule config: ${error.message}`);
    }

    return data || null;
  }

  static async updateScheduleConfig(config: Partial<ScheduleConfig>): Promise<ScheduleConfig> {
    // First try to update existing config
    const { data: existingData } = await supabase
      .from('scraping_schedule')
      .select('id')
      .single();

    if (existingData) {
      // Update existing
      const { data, error } = await supabase
        .from('scraping_schedule')
        .update(config)
        .eq('id', existingData.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update schedule config: ${error.message}`);
      }

      return data;
    } else {
      // Create new
      const defaultConfig = {
        cron_expression: '0 */6 * * *', // Every 6 hours
        is_enabled: false,
        run_count: 0,
        total_sources_processed: 0,
        total_opportunities_found: 0,
        average_run_time_ms: 0,
        ...config,
      };

      const { data, error } = await supabase
        .from('scraping_schedule')
        .insert(defaultConfig)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create schedule config: ${error.message}`);
      }

      return data;
    }
  }

  // Scraped opportunities management
  static async getScrapedOpportunities(
    page = 1,
    limit = 20,
    filters?: { source?: string; status?: string }
  ): Promise<{ data: ScrapedOpportunity[]; total: number }> {
    try {
      let query = supabase
        .from('scraped_opportunities')
        .select('*', { count: 'exact' });

      if (filters?.source) {
        query = query.eq('source_url', filters.source);
      }

      if (filters?.status) {
        query = query.eq('processing_status', filters.status);
      }

      const { data, count, error } = await query
        .order('scraped_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(`Failed to fetch scraped opportunities: ${error.message || JSON.stringify(error)}`);
      }

      return {
        data: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Full error in getScrapedOpportunities:', error);
      throw error;
    }
  }

  static async deleteScrapedOpportunity(id: string): Promise<void> {
    const { error } = await supabase
      .from('scraped_opportunities')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete scraped opportunity: ${error.message}`);
    }
  }

  static async clearAllScrapedOpportunities(): Promise<void> {
    try {
      const response = await fetch('/api/scraping/opportunities?clearAll=true', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Error clearing all scraped opportunities:', error);
      throw new Error(`Failed to clear all scraped opportunities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Advanced scraping operations using Edge Functions
  static async discoverPosts(
    url: string,
    maxPosts: number = 10,
    strategy: 'auto-detect' | 'seed-first' | 'rss-first' | 'sitemap-first' = 'auto-detect'
  ): Promise<{
    success: boolean;
    posts: string[];
    methodUsed: string;
    diagnostics: {
      seedCount: number;
      rssCount: number;
      sitemapCount: number;
      seedCandidates: number;
      rssCandidates: number;
      sitemapCandidates: number;
      sampleUrls: string[];
    };
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('discover-posts', {
        body: { url, maxPosts, strategy },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error discovering posts:', error);
      return {
        success: false,
        posts: [],
        methodUsed: 'error',
        diagnostics: {
          seedCount: 0,
          rssCount: 0,
          sitemapCount: 0,
          seedCandidates: 0,
          rssCandidates: 0,
          sitemapCandidates: 0,
          sampleUrls: [],
        },
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async fetchPostContent(url: string): Promise<{
    success: boolean;
    contentHtml?: string;
    contentText?: string;
    title?: string;
    author?: string;
    publishedAt?: string;
    tags?: string[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-post-content', {
        body: { url },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching post content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static async runScheduledScraper(urls?: string[]): Promise<{
    success: boolean;
    totalOpportunities?: number;
    sourcesProcessed?: number;
    results?: any[];
    timestamp?: string;
    message?: string;
    skipped?: boolean;
    error?: string;
  }> {
    try {
      // Use provided URLs or fall back to test URL
      const urlsToScrape = urls && urls.length > 0 ? urls : [
        'https://opportunitiesforyouth.org/2025/01/11/unhcr-internship-program-2022-fully-funded/'
      ];
      
      console.log('Starting scraping for URLs:', urlsToScrape);
      
      const results = [];
      
      for (const url of urlsToScrape) {
        try {
          console.log(`Scraping URL: ${url}`);
          
          // Extract content directly using our content extraction service
          const contentResult = await extractWebContent(url);
          
          if (!contentResult.success || !contentResult.data) {
            console.error(`Failed to extract content from ${url}:`, contentResult.error);
            continue;
          }

          const contentData = contentResult.data;
          
          console.log('Content extracted successfully:', {
            title: contentData.title?.substring(0, 50) + '...',
            contentLength: contentData.content.length,
            author: contentData.author
          });

          // Create scraped opportunity record
          const scrapedOpportunity = {
            name: contentData.title,
            source_url: new URL(url).origin,
            post_url: url,
            content_html: contentData.htmlContent,
            content_text: contentData.content,
            author: contentData.author,
            scraped_at: new Date().toISOString(),
            processing_status: 'raw' as const,
            ai_confidence_score: 0.85,
          };

          // Save to database
          const { data: savedData, error: saveError } = await supabase
            .from('scraped_opportunities')
            .insert([scrapedOpportunity])
            .select()
            .single();

          if (saveError) {
            console.error('Error saving scraped opportunity:', saveError);
            continue;
          }

          console.log('Successfully saved opportunity:', savedData?.name);
          results.push(savedData);
          
        } catch (error) {
          console.error(`Error processing URL ${url}:`, error);
          continue;
        }
      }

      if (results.length === 0) {
        throw new Error('No opportunities were successfully scraped');
      }

      return {
        success: true,
        totalOpportunities: results.length,
        sourcesProcessed: urlsToScrape.length,
        results: results,
        timestamp: new Date().toISOString(),
        message: `Successfully scraped ${results.length} opportunities`,
      };
    } catch (error) {
      console.error('Error running scheduled scraper:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Test scraping functionality
  static async testSource(url: string): Promise<{
    success: boolean;
    discoveredPosts: number;
    samplePosts: string[];
    contentSample?: {
      title?: string;
      contentLength: number;
      hasContent: boolean;
    };
    error?: string;
  }> {
    try {
      // Step 1: Test post discovery
      const discoveryResult = await this.discoverPosts(url, 5);
      
      if (!discoveryResult.success || discoveryResult.posts.length === 0) {
        return {
          success: false,
          discoveredPosts: 0,
          samplePosts: [],
          error: discoveryResult.error || 'No posts discovered',
        };
      }

      // Step 2: Test content fetching with first post
      const firstPost = discoveryResult.posts[0];
      const contentResult = await this.fetchPostContent(firstPost);

      return {
        success: true,
        discoveredPosts: discoveryResult.posts.length,
        samplePosts: discoveryResult.posts.slice(0, 3),
        contentSample: {
          title: contentResult.title,
          contentLength: contentResult.contentText?.length || 0,
          hasContent: Boolean(contentResult.contentHtml || contentResult.contentText),
        },
      };
    } catch (error) {
      return {
        success: false,
        discoveredPosts: 0,
        samplePosts: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Analytics and stats
  static async getScrapingStats(): Promise<{
    totalSources: number;
    activeSources: number;
    totalOpportunities: number;
    recentOpportunities: number;
    lastRunTime?: string;
    avgSuccessRate: number;
  }> {
    try {
      const [sourcesResult, opportunitiesResult, recentResult, scheduleResult] = await Promise.all([
        supabase.from('scraping_sources').select('is_active, success_rate'),
        supabase.from('scraped_opportunities').select('id', { count: 'exact' }),
        supabase
          .from('scraped_opportunities')
          .select('id', { count: 'exact' })
          .gte('scraped_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('scraping_schedule').select('last_run').single(),
      ]);

      const sources = sourcesResult.data || [];
      const totalSources = sources.length;
      const activeSources = sources.filter((s: any) => s.is_active).length;
      const avgSuccessRate = totalSources > 0 
        ? sources.reduce((sum: number, s: any) => sum + s.success_rate, 0) / totalSources 
        : 0;

      return {
        totalSources,
        activeSources,
        totalOpportunities: opportunitiesResult.count || 0,
        recentOpportunities: recentResult.count || 0,
        lastRunTime: scheduleResult.data?.last_run,
        avgSuccessRate,
      };
    } catch (error) {
      console.error('Error fetching scraping stats:', error);
      return {
        totalSources: 0,
        activeSources: 0,
        totalOpportunities: 0,
        recentOpportunities: 0,
        avgSuccessRate: 0,
      };
    }
  }
}

// Export singleton instance for convenience
export const scrapingService = new ScrapingService();
