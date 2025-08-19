import { createClient } from '@/lib/supabase/client';
import { ScrapedOpportunity } from '@/lib/types/scraping';
import { ContentExtractor, ProcessedOpportunity } from './content-extractor';

export interface ScrapingProgress {
  currentUrl: string;
  completed: number;
  total: number;
  isRunning: boolean;
  errors: string[];
}

export interface ScrapingResult {
  success: boolean;
  scraped: ScrapedOpportunity[];
  processed: ProcessedOpportunity[];
  errors: string[];
  total: number;
}

export class ScraperService {
  private supabase = createClient();
  private progressCallback?: (progress: ScrapingProgress) => void;

  constructor(progressCallback?: (progress: ScrapingProgress) => void) {
    this.progressCallback = progressCallback;
  }

  async scrapeMultipleUrls(urls: string[]): Promise<ScrapingResult> {
    const scraped: ScrapedOpportunity[] = [];
    const processed: ProcessedOpportunity[] = [];
    const errors: string[] = [];
    let completed = 0;

    // Initialize progress
    this.updateProgress({
      currentUrl: '',
      completed: 0,
      total: urls.length,
      isRunning: true,
      errors: []
    });

    for (const url of urls) {
      try {
        this.updateProgress({
          currentUrl: url,
          completed,
          total: urls.length,
          isRunning: true,
          errors
        });

        // Use the existing Edge Function to scrape
        const scrapedData = await this.scrapeUrl(url);
        
        if (scrapedData) {
          scraped.push(scrapedData);
          
          // Process the scraped data with ContentExtractor
          const processedData = ContentExtractor.processOpportunity(scrapedData);
          processed.push(processedData);

          // Save to database
          await this.saveToDatabase(scrapedData);
        }
      } catch (error) {
        const errorMsg = `Error scraping ${url}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }

      completed++;
    }

    // Final progress update
    this.updateProgress({
      currentUrl: '',
      completed,
      total: urls.length,
      isRunning: false,
      errors
    });

    return {
      success: errors.length === 0,
      scraped,
      processed,
      errors,
      total: urls.length
    };
  }

  private async scrapeUrl(url: string): Promise<ScrapedOpportunity | null> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase configuration');
      }

      // Call the discover-posts Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/discover-posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_url: url,
          limit: 1
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        const post = result.data[0];
        
        // Get full content using fetch-post-content Edge Function
        const contentResponse = await fetch(`${supabaseUrl}/functions/v1/fetch-post-content`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: post.url
          })
        });

        if (contentResponse.ok) {
          const contentResult = await contentResponse.json();
          
          if (contentResult.success) {
            // Create ScrapedOpportunity object
            const scrapedOpportunity: ScrapedOpportunity = {
              id: `scraped-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: post.title || contentResult.data.title || 'Untitled',
              post_url: post.url,
              source_url: url,
              content_html: contentResult.data.html || '',
              content_text: contentResult.data.text || '',
              category: this.extractCategory(contentResult.data.text || ''),
              tags: this.extractTags(contentResult.data.text || ''),
              images: contentResult.data.images || [],
              scraped_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              processing_status: 'raw' as const,
              ai_confidence_score: 0.8,
            };

            return scrapedOpportunity;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error in scrapeUrl:', error);
      return null;
    }
  }

  private async saveToDatabase(opportunity: ScrapedOpportunity): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('scraped_opportunities')
        .insert([opportunity]);

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error saving to database:', error);
      throw error;
    }
  }

  private extractCategory(text: string): string | undefined {
    const categoryKeywords = {
      'Scholarships': /scholarship|study|education|university|academic/i,
      'Jobs': /job|employment|career|position|work|hiring/i,
      'Internships': /internship|intern|training|placement/i,
      'Fellowships': /fellowship|research|fellow/i,
      'Conferences': /conference|summit|event|workshop/i,
      'Volunteering': /volunteer|community|service/i,
      'Competitions': /competition|contest|award|prize/i,
    };

    for (const [category, pattern] of Object.entries(categoryKeywords)) {
      if (pattern.test(text)) {
        return category;
      }
    }

    return undefined;
  }

  private extractTags(text: string): string[] {
    const tags: string[] = [];
    
    // Extract common tags
    const tagPatterns = [
      /undergraduate/i,
      /graduate/i,
      /phd/i,
      /masters?/i,
      /bachelor/i,
      /full[- ]?time/i,
      /part[- ]?time/i,
      /remote/i,
      /international/i,
      /local/i,
      /funded/i,
      /free/i,
    ];

    tagPatterns.forEach(pattern => {
      const match = text.match(pattern);
      if (match) {
        tags.push(match[0].toLowerCase());
      }
    });

    return [...new Set(tags)]; // Remove duplicates
  }

  private updateProgress(progress: ScrapingProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  // Static methods for database operations
  static async getScrapedOpportunities(limit = 50): Promise<ScrapedOpportunity[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('scraped_opportunities')
      .select('*')
      .order('scraped_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching scraped opportunities:', error);
      return [];
    }

    return data || [];
  }

  static async deleteScrapedOpportunity(id: string): Promise<boolean> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('scraped_opportunities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting scraped opportunity:', error);
      return false;
    }

    return true;
  }

  static async clearAllScrapedOpportunities(): Promise<boolean> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('scraped_opportunities')
      .delete()
      .neq('id', ''); // Delete all records

    if (error) {
      console.error('Error clearing scraped opportunities:', error);
      return false;
    }

    return true;
  }

  static async getProcessedOpportunities(scrapedData: ScrapedOpportunity[]): Promise<ProcessedOpportunity[]> {
    return scrapedData.map(opportunity => ContentExtractor.processOpportunity(opportunity));
  }
}
