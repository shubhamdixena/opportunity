/**
 * Cache utility functions for visitor-focused application
 * Optimized for high-traffic, low-personalization scenarios
 */

// Cache durations in seconds
export const CACHE_DURATIONS = {
  OPPORTUNITIES: 300, // 5 minutes - moderate freshness for content updates
  CATEGORIES: 1800,   // 30 minutes - rarely change
  SEARCH_RESULTS: 60, // 1 minute - shorter for search relevance
  STATIC_CONTENT: 3600, // 1 hour - for images, assets
} as const

// CDN cache durations (typically longer than browser cache)
export const CDN_CACHE_DURATIONS = {
  OPPORTUNITIES: 600,  // 10 minutes
  CATEGORIES: 3600,    // 1 hour
  SEARCH_RESULTS: 120, // 2 minutes
  STATIC_CONTENT: 86400, // 24 hours
} as const

/**
 * Generate Cache-Control header for API responses
 */
export function getCacheHeaders(type: keyof typeof CACHE_DURATIONS): string {
  const browserCache = CACHE_DURATIONS[type]
  const cdnCache = CDN_CACHE_DURATIONS[type]
  
  return `public, max-age=${browserCache}, s-maxage=${cdnCache}`
}

/**
 * Generate Next.js revalidate config for pages
 */
export function getRevalidateConfig(type: keyof typeof CACHE_DURATIONS) {
  return {
    next: { revalidate: CACHE_DURATIONS[type] }
  }
}

/**
 * Conditional caching based on request type
 */
export function getConditionalCacheHeaders(hasSearch: boolean, hasFilters: boolean): string {
  if (hasSearch || hasFilters) {
    return getCacheHeaders('SEARCH_RESULTS')
  }
  return getCacheHeaders('OPPORTUNITIES')
}
