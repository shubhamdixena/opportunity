'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrapingService } from '@/lib/services/scraping-service-v2';
import { Loader2, CheckCircle, AlertCircle, Globe, FileText } from 'lucide-react';

export default function EdgeFunctionTestPage() {
  const [testUrl, setTestUrl] = useState('https://opportunitydesk.org');
  const [maxPosts, setMaxPosts] = useState(5);
  const [loading, setLoading] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<any>(null);
  const [contentResult, setContentResult] = useState<any>(null);
  const [runResult, setRunResult] = useState<any>(null);

  const testDiscovery = async () => {
    setLoading(true);
    try {
      const result = await ScrapingService.discoverPosts(testUrl, maxPosts);
      setDiscoveryResult(result);
    } catch (error) {
      setDiscoveryResult({ success: false, error: 'Failed to test discovery' });
    } finally {
      setLoading(false);
    }
  };

  const testContentFetch = async () => {
    if (!discoveryResult?.posts?.length) return;
    
    setLoading(true);
    try {
      const result = await ScrapingService.fetchPostContent(discoveryResult.posts[0]);
      setContentResult(result);
    } catch (error) {
      setContentResult({ success: false, error: 'Failed to fetch content' });
    } finally {
      setLoading(false);
    }
  };

  const testFullRun = async () => {
    setLoading(true);
    try {
      const result = await ScrapingService.runScheduledScraper();
      setRunResult(result);
    } catch (error) {
      setRunResult({ success: false, error: 'Failed to run full scraper' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Edge Functions Test</h1>
        <p className="text-muted-foreground">
          Test the advanced scraping capabilities powered by Supabase Edge Functions
        </p>
      </div>

      {/* Test Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Test Configuration
          </CardTitle>
          <CardDescription>
            Configure the test parameters for the scraping functions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test URL</label>
            <Input
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Enter URL to test..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Posts</label>
            <Input
              type="number"
              value={maxPosts}
              onChange={(e) => setMaxPosts(parseInt(e.target.value) || 5)}
              min="1"
              max="20"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={testDiscovery} disabled={loading} className="flex items-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
              Test Discovery
            </Button>
            <Button 
              onClick={testContentFetch} 
              disabled={loading || !discoveryResult?.posts?.length}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Test Content Fetch
            </Button>
            <Button 
              onClick={testFullRun} 
              disabled={loading}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Run Full Scraper
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Discovery Results */}
      {discoveryResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {discoveryResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Post Discovery Results
            </CardTitle>
            <CardDescription>
              Results from the discover-posts Edge Function
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {discoveryResult.success ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Posts Found</p>
                    <p className="text-2xl font-bold">{discoveryResult.posts?.length || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Method Used</p>
                    <Badge variant="secondary">{discoveryResult.methodUsed}</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Candidates</p>
                    <p className="text-lg font-semibold">
                      {(discoveryResult.diagnostics?.seedCandidates || 0) +
                       (discoveryResult.diagnostics?.rssCandidates || 0) +
                       (discoveryResult.diagnostics?.sitemapCandidates || 0)}
                    </p>
                  </div>
                </div>
                
                {discoveryResult.posts?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Sample URLs:</p>
                    <div className="space-y-1">
                      {discoveryResult.posts.slice(0, 5).map((url: string, index: number) => (
                        <div key={index} className="text-xs p-2 bg-muted rounded font-mono">
                          {url}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-red-600">
                Error: {discoveryResult.error || 'Unknown error occurred'}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Fetch Results */}
      {contentResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {contentResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Content Extraction Results
            </CardTitle>
            <CardDescription>
              Results from the fetch-post-content Edge Function
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contentResult.success ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{contentResult.title || 'No title found'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Author</p>
                    <p>{contentResult.author || 'No author found'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Content Preview (first 500 chars)</p>
                  <Textarea
                    value={contentResult.contentText?.substring(0, 500) + '...' || 'No content extracted'}
                    readOnly
                    rows={5}
                  />
                </div>
                
                {contentResult.tags?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {contentResult.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-red-600">
                Error: {contentResult.error || 'Unknown error occurred'}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Full Run Results */}
      {runResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {runResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Full Scraper Results
            </CardTitle>
            <CardDescription>
              Results from the scheduled-scraper Edge Function
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {runResult.success ? (
              <>
                {runResult.skipped ? (
                  <div className="text-amber-600">
                    Skipped: {runResult.message}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total Opportunities</p>
                        <p className="text-2xl font-bold">{runResult.totalOpportunities || 0}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Sources Processed</p>
                        <p className="text-2xl font-bold">{runResult.sourcesProcessed || 0}</p>
                      </div>
                    </div>
                    
                    {runResult.results?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Source Results:</p>
                        <div className="space-y-2">
                          {runResult.results.map((result: any, index: number) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{result.source}</p>
                                  <p className="text-sm text-muted-foreground">{result.url}</p>
                                </div>
                                <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                                  {result.status}
                                </Badge>
                              </div>
                              {result.status === 'success' && (
                                <div className="mt-2 text-sm">
                                  <p>Opportunities found: {result.opportunities}</p>
                                  <p>Posts discovered: {result.postsDiscovered}</p>
                                  <p>New posts: {result.newPosts}</p>
                                </div>
                              )}
                              {result.error && (
                                <div className="mt-2 text-sm text-red-600">
                                  Error: {result.error}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="text-red-600">
                Error: {runResult.error || 'Unknown error occurred'}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
