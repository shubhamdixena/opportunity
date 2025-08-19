'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Play, Trash2, ExternalLink, Database, RotateCcw } from 'lucide-react';
import { ScraperService, ScrapingProgress, ScrapingResult } from '@/lib/services/scraper-service';
import { ScrapedOpportunity } from '@/lib/types/scraping';
import { ProcessedOpportunity } from '@/lib/services/content-extractor';

export function OpportunityScraperUI() {
  const [urls, setUrls] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ScrapingProgress | null>(null);
  const [results, setResults] = useState<ScrapingResult | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedOpportunity[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedOpportunity[]>([]);
  const [selectedTab, setSelectedTab] = useState<'scraped' | 'processed'>('scraped');

  // Load existing scraped opportunities on mount
  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const existingData = await ScraperService.getScrapedOpportunities();
      setScrapedData(existingData);
      
      const processed = await ScraperService.getProcessedOpportunities(existingData);
      setProcessedData(processed);
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  };

  const handleProgressUpdate = useCallback((progressData: ScrapingProgress) => {
    setProgress(progressData);
  }, []);

  const handleScrape = async () => {
    if (!urls.trim()) return;

    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && url.startsWith('http'));

    if (urlList.length === 0) {
      alert('Please enter valid URLs (must start with http/https)');
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const scraperService = new ScraperService(handleProgressUpdate);
      const result = await scraperService.scrapeMultipleUrls(urlList);
      
      setResults(result);
      
      // Update local state with new data
      const allScrapedData = [...scrapedData, ...result.scraped];
      const allProcessedData = [...processedData, ...result.processed];
      
      setScrapedData(allScrapedData);
      setProcessedData(allProcessedData);
      
      // Clear URLs on successful scrape
      if (result.success) {
        setUrls('');
      }
    } catch (error) {
      console.error('Scraping error:', error);
      alert('An error occurred while scraping. Please check the console for details.');
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  const handleDelete = async (id: string, type: 'scraped' | 'processed') => {
    if (type === 'scraped') {
      try {
        const success = await ScraperService.deleteScrapedOpportunity(id);
        if (success) {
          setScrapedData(prev => prev.filter(item => item.id !== id));
          // Also remove corresponding processed data
          setProcessedData(prev => prev.filter(item => item.id !== `processed-${id}`));
        }
      } catch (error) {
        console.error('Error deleting scraped opportunity:', error);
      }
    } else {
      // For processed data, just remove from local state
      setProcessedData(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all scraped data? This cannot be undone.')) {
      try {
        const success = await ScraperService.clearAllScrapedOpportunities();
        if (success) {
          setScrapedData([]);
          setProcessedData([]);
          setResults(null);
        }
      } catch (error) {
        console.error('Error clearing all data:', error);
      }
    }
  };

  const exportData = (data: any[], filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const progressPercentage = progress ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Opportunity Scraper
          </CardTitle>
          <CardDescription>
            Enter URLs to scrape opportunities. Each URL should be on a new line.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="urls" className="text-sm font-medium">
              URLs to Scrape:
            </label>
            <Textarea
              id="urls"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder={`https://example.com/opportunities
https://another-site.com/jobs
https://university.edu/scholarships`}
              rows={6}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              {urls.split('\n').filter(url => url.trim() && url.startsWith('http')).length} valid URLs detected
            </p>
          </div>

          {progress && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Scraping Progress</span>
                <span>{progress.completed}/{progress.total}</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
              {progress.currentUrl && (
                <p className="text-xs text-muted-foreground truncate">
                  Current: {progress.currentUrl}
                </p>
              )}
              {progress.errors.length > 0 && (
                <div className="text-xs text-red-600">
                  {progress.errors.length} errors occurred
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleScrape} 
              disabled={isLoading || !urls.trim()}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Start Scraping
                </>
              )}
            </Button>
            
            {(scrapedData.length > 0 || processedData.length > 0) && (
              <Button variant="outline" onClick={handleClearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              Scraping Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{results.total}</div>
                <div className="text-sm text-muted-foreground">Total URLs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{results.scraped.length}</div>
                <div className="text-sm text-muted-foreground">Successfully Scraped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{results.processed.length}</div>
                <div className="text-sm text-muted-foreground">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{results.errors.length}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-red-600 mb-2">Errors:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {results.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(scrapedData.length > 0 || processedData.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              View scraped raw data and processed opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'scraped' | 'processed')}>
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="scraped" className="flex items-center gap-2">
                    Raw Data ({scrapedData.length})
                  </TabsTrigger>
                  <TabsTrigger value="processed" className="flex items-center gap-2">
                    Processed ({processedData.length})
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportData(
                      selectedTab === 'scraped' ? scrapedData : processedData,
                      `${selectedTab}-opportunities-${new Date().toISOString().split('T')[0]}.json`
                    )}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export {selectedTab === 'scraped' ? 'Raw' : 'Processed'}
                  </Button>
                </div>
              </div>

              <TabsContent value="scraped">
                <ScrapedDataTable data={scrapedData} onDelete={(id) => handleDelete(id, 'scraped')} />
              </TabsContent>

              <TabsContent value="processed">
                <ProcessedDataTable data={processedData} onDelete={(id) => handleDelete(id, 'processed')} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ScrapedDataTable({ data, onDelete }: { data: ScrapedOpportunity[], onDelete: (id: string) => void }) {
  return (
    <div className="overflow-auto max-h-[600px] border rounded-md">
      <Table>
        <TableHeader className="sticky top-0 bg-background">
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[150px]">Category</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[120px]">Scraped At</TableHead>
            <TableHead className="w-[300px]">Details</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((opportunity) => (
            <TableRow key={opportunity.id}>
              <TableCell>
                <div>
                  <div className="font-medium truncate max-w-[180px]" title={opportunity.name}>
                    {opportunity.name || 'Untitled'}
                  </div>
                  {opportunity.post_url && (
                    <a 
                      href={opportunity.post_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Original
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {opportunity.category && (
                  <Badge variant="secondary">{opportunity.category}</Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={opportunity.processing_status === 'processed' ? 'default' : 'secondary'}
                >
                  {opportunity.processing_status}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(opportunity.scraped_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="space-y-2 text-xs">
                  {opportunity.content_text && (
                    <div>
                      <strong>Content:</strong>
                      <div className="max-w-[280px] max-h-[100px] overflow-auto bg-muted p-2 rounded text-xs">
                        {opportunity.content_text.substring(0, 500)}
                        {opportunity.content_text.length > 500 && '...'}
                      </div>
                    </div>
                  )}
                  {opportunity.eligibility && (
                    <div>
                      <strong>Eligibility:</strong> {opportunity.eligibility.substring(0, 100)}
                      {opportunity.eligibility.length > 100 && '...'}
                    </div>
                  )}
                  {opportunity.benefits && (
                    <div>
                      <strong>Benefits:</strong> {opportunity.benefits.substring(0, 100)}
                      {opportunity.benefits.length > 100 && '...'}
                    </div>
                  )}
                  {opportunity.deadline && (
                    <div>
                      <strong>Deadline:</strong> {opportunity.deadline}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(opportunity.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ProcessedDataTable({ data, onDelete }: { data: ProcessedOpportunity[], onDelete: (id: string) => void }) {
  return (
    <div className="overflow-auto max-h-[600px] border rounded-md">
      <Table>
        <TableHeader className="sticky top-0 bg-background">
          <TableRow>
            <TableHead className="w-[200px]">Title</TableHead>
            <TableHead className="w-[120px]">Type</TableHead>
            <TableHead className="w-[150px]">Organization</TableHead>
            <TableHead className="w-[100px]">Location</TableHead>
            <TableHead className="w-[120px]">Deadline</TableHead>
            <TableHead className="w-[300px]">Details</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((opportunity) => (
            <TableRow key={opportunity.id}>
              <TableCell>
                <div>
                  <div className="font-medium truncate max-w-[180px]" title={opportunity.title}>
                    {opportunity.title}
                  </div>
                  {opportunity.originalUrl && (
                    <a 
                      href={opportunity.originalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Original
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {opportunity.type && (
                  <Badge variant="outline">{opportunity.type}</Badge>
                )}
              </TableCell>
              <TableCell className="truncate max-w-[140px]" title={opportunity.organization}>
                {opportunity.organization}
              </TableCell>
              <TableCell className="truncate max-w-[90px]" title={opportunity.location}>
                {opportunity.location}
              </TableCell>
              <TableCell className="text-xs">
                {opportunity.deadline}
              </TableCell>
              <TableCell>
                <div className="space-y-2 text-xs">
                  {opportunity.eligibility && (
                    <div>
                      <strong>Eligibility:</strong>
                      <div className="max-w-[280px] max-h-[60px] overflow-auto bg-muted p-2 rounded text-xs">
                        {opportunity.eligibility}
                      </div>
                    </div>
                  )}
                  {opportunity.benefits && (
                    <div>
                      <strong>Benefits:</strong>
                      <div className="max-w-[280px] max-h-[60px] overflow-auto bg-muted p-2 rounded text-xs">
                        {opportunity.benefits}
                      </div>
                    </div>
                  )}
                  {opportunity.howToApply && (
                    <div>
                      <strong>How to Apply:</strong>
                      <div className="max-w-[280px] max-h-[60px] overflow-auto bg-muted p-2 rounded text-xs">
                        {opportunity.howToApply}
                      </div>
                    </div>
                  )}
                  {opportunity.salaryStipend && (
                    <div>
                      <strong>Salary/Stipend:</strong> {opportunity.salaryStipend}
                    </div>
                  )}
                  {opportunity.additionalInfo && (
                    <div>
                      <strong>Additional Info:</strong>
                      <div className="max-w-[280px] max-h-[40px] overflow-auto bg-muted p-2 rounded text-xs">
                        {opportunity.additionalInfo}
                      </div>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(opportunity.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
