// TypeScript types for the advanced scraping system
export interface ScrapingSource {
  id: string;
  name: string;
  url: string;
  max_posts: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  source_type: 'website' | 'rss' | 'sitemap' | 'api';
  last_scraped_at?: string;
  success_rate: number;
  total_attempts: number;
  successful_attempts: number;
}

export interface ScheduleConfig {
  id: string;
  cron_expression: string;
  is_enabled: boolean;
  last_run?: string;
  next_run?: string;
  created_at: string;
  updated_at: string;
  run_count: number;
  total_sources_processed: number;
  total_opportunities_found: number;
  average_run_time_ms: number;
  last_error?: string;
}

export interface ScrapedOpportunity {
  id: string;
  name?: string;
  post_url?: string;
  source_url?: string;
  content_html?: string;
  content_text?: string;
  category?: string;
  tags?: string[];
  images?: string[];
  benefits?: string;
  eligibility?: string;
  eligible_countries?: string;
  deadline?: string;
  application_url?: string;
  official_link?: string;
  other_details?: string;
  author?: string;
  published_at?: string;
  scraped_at: string;
  created_at: string;
  updated_at: string;
  opportunity_id?: string;
  processing_status: 'raw' | 'processed' | 'converted' | 'rejected';
  ai_confidence_score: number;
}

export interface ScrapingProgress {
  isRunning: boolean;
  currentUrl?: string;
  progress: number;
  totalUrls: number;
  processedUrls: number;
  totalResults: number;
  startTime?: Date;
  estimatedTimeRemaining?: string;
  status: 'idle' | 'discovering' | 'scraping' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export interface DiscoveryRequest {
  url: string;
  maxPosts: number;
  strategy?: 'auto-detect' | 'rss-first' | 'sitemap-first' | 'seed-first';
}

export interface DiscoveryResponse {
  success: boolean;
  posts: string[];
  methodUsed: 'seed' | 'rss' | 'sitemap';
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
}

// Cron expression presets
export const CRON_PRESETS = {
  '0 */1 * * *': 'Every hour',
  '0 */2 * * *': 'Every 2 hours',
  '0 */4 * * *': 'Every 4 hours',
  '0 */6 * * *': 'Every 6 hours',
  '0 */12 * * *': 'Every 12 hours',
  '0 0 * * *': 'Daily at midnight',
  '0 0 */2 * *': 'Every 2 days',
  '0 0 * * 0': 'Weekly on Sunday',
} as const;

export type CronExpression = keyof typeof CRON_PRESETS;

// Source types
export const SOURCE_TYPES = {
  website: 'Website',
  rss: 'RSS Feed',
  sitemap: 'Sitemap',
  api: 'API Endpoint',
} as const;

// Processing status types
export const PROCESSING_STATUS = {
  raw: 'Raw',
  processed: 'Processed',
  converted: 'Converted',
  rejected: 'Rejected',
} as const;
