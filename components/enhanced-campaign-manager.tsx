"use client"

import { useState, useEffect, useCallback, useMemo, memo, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, RotateCcw, Rss } from "lucide-react"

interface OpportunityItem {
  id: string // Add unique id for better key prop
  title: string
  link: string
  pubDate: string
  deadline: string
  type: string
}

interface FeedSource {
  id: string
  url: string
  name: string
}

// Utility functions - memoized to prevent recreation
const inferType = (title: string): string => {
  const t = title.toLowerCase()
  if (t.includes('scholar')) return 'Scholarship'
  if (t.includes('fellow')) return 'Fellowship'
  if (t.includes('intern')) return 'Internship'
  if (t.includes('conference') || t.includes('summit')) return 'Conference'
  if (t.includes('exchange')) return 'Exchange'
  return 'Other'
}

const parseDeadline = (text: string): string => {
  const match = text.match(/\b(\d{1,2}\s+\w+\s+\d{4}|\w+\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})\b/i)
  return match ? match[0] : 'Not specified'
}

const getTypeVariant = (type: string) => {
  switch (type) {
    case 'Scholarship': return 'default'
    case 'Fellowship': return 'secondary'
    case 'Conference': return 'outline'
    default: return 'outline'
  }
}

// Memoized Table Row Component
const OpportunityTableRow = memo(({ 
  row, 
  index, 
  startIndex 
}: { 
  row: OpportunityItem
  index: number
  startIndex: number 
}) => (
  <TableRow className="hover:bg-muted/50">
    <TableCell className="text-sm">{startIndex + index + 1}</TableCell>
    <TableCell className="text-sm">
      <a 
        href={row.link} 
        target="_blank" 
        rel="noopener" 
        className="text-primary hover:underline font-medium line-clamp-2"
      >
        {row.title}
      </a>
    </TableCell>
    <TableCell className="text-sm">
      <Badge variant={getTypeVariant(row.type)} className="text-xs">
        {row.type}
      </Badge>
    </TableCell>
    <TableCell className="text-sm text-muted-foreground">{row.deadline}</TableCell>
    <TableCell className="text-sm text-muted-foreground">{row.pubDate}</TableCell>
  </TableRow>
))

OpportunityTableRow.displayName = 'OpportunityTableRow'

export function EnhancedCampaignManager() {
  const [items, setItems] = useState<OpportunityItem[]>([])
  const [page, setPage] = useState(1)
  const [feedSources, setFeedSources] = useState<FeedSource[]>([
    { id: '1', url: 'https://opportunitiescorners.com/feed', name: 'OpportunitiesCorners' }
  ])
  const [newFeedUrl, setNewFeedUrl] = useState('')
  const [newFeedName, setNewFeedName] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [useProxy, setUseProxy] = useState("on")
  const [status, setStatus] = useState("Idle")
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Memoized current time - only updates once on mount
  const currentTime = useMemo(() => new Date().toLocaleString(), [])

  // Add new feed source
  const addFeedSource = useCallback(() => {
    if (newFeedUrl.trim() && newFeedName.trim()) {
      const newSource: FeedSource = {
        id: Date.now().toString(),
        url: newFeedUrl.trim(),
        name: newFeedName.trim()
      }
      setFeedSources(prev => [...prev, newSource])
      setNewFeedUrl('')
      setNewFeedName('')
    }
  }, [newFeedUrl, newFeedName])

  // Remove feed source
  const removeFeedSource = useCallback((id: string) => {
    setFeedSources(prev => prev.filter(source => source.id !== id))
  }, [])

  // Load RSS feed from multiple sources
  const loadAllFeeds = useCallback(async () => {
    setLoading(true)
    setStatus("Loading RSS feeds...")
    
    const allItems: OpportunityItem[] = []

    const promises = feedSources.map(async (source) => {
      try {
        const url = useProxy === 'on' 
          ? `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}` 
          : source.url

        const res = await fetch(url)
        if (!res.ok) return []
        
        const data = await res.json()
        const rawItems = data.items || data.entries || []
        
        return rawItems.map((x: any) => {
          const title = x.title || ''
          const link = x.link || x.guid || ''
          const pubDate = x.pubDate || x.published || ''
          const content = x.content || x.description || ''
          const deadline = parseDeadline(content)
          const type = inferType(title)
          
          return { 
            id: `${Date.now()}-${Math.random()}`, // Add unique id
            title, 
            link, 
            pubDate, 
            deadline, 
            type 
          }
        })
      } catch (e) {
        console.error(`Failed to load ${source.name}:`, e)
        return []
      }
    })

    const results = await Promise.all(promises)
    results.forEach(items => allItems.push(...items))

    if (allItems.length === 0) {
      // Demo data if all feeds fail
      const demoItems: OpportunityItem[] = [
        { id: '1', title: 'Chevening Scholarships 2025', link: 'https://www.chevening.org', pubDate: '2024-08-20', deadline: 'Nov 2024', type: 'Scholarship' },
        { id: '2', title: 'DAAD EPOS 2025', link: 'https://daad.de', pubDate: '2024-03-10', deadline: 'Mar 2024', type: 'Scholarship' },
        { id: '3', title: 'UNESCO Youth Hackathon 2025', link: '#', pubDate: '2025-01-05', deadline: 'Not specified', type: 'Conference' },
        { id: '4', title: 'Vanier Canada Graduate Scholarship 2025', link: 'https://vanier.gc.ca', pubDate: '2024-07-01', deadline: '2024-10-30', type: 'Scholarship' },
        { id: '5', title: 'Australia Awards 2025', link: 'https://www.australiaawards.gov.au', pubDate: '2025-02-01', deadline: 'Feb 2025', type: 'Scholarship' },
        { id: '6', title: 'Mandela Impact Forum 2025', link: '#', pubDate: '2025-03-03', deadline: 'Not specified', type: 'Conference' }
      ]
      allItems.push(...demoItems)
      setStatus('Load failed, showing demo data')
    } else {
      setStatus(`Loaded ${allItems.length} items from ${feedSources.length} sources`)
    }
    
    setItems(allItems)
    setPage(1)
    setShowResults(true)
    setLoading(false)
  }, [feedSources, useProxy])

  // Handle pagination - memoized with proper dependencies and transitions
  const handlePageChange = useCallback((newPage: number) => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
    if (newPage >= 1 && newPage <= totalPages) {
      startTransition(() => {
        setPage(newPage)
      })
    }
  }, [items.length, pageSize])

  // Calculate pagination data - memoized for performance
  const paginationData = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
    const start = (page - 1) * pageSize
    const end = Math.min(start + pageSize, items.length)
    const pageRows = items.slice(start, end)
    return { totalPages, start, end, pageRows }
  }, [items, page, pageSize])

  // Calculate summary stats - memoized for performance
  const summaryStats = useMemo(() => ({
    total: items.length,
    scholarship: items.filter((r: OpportunityItem) => r.type === 'Scholarship').length,
    fellowship: items.filter((r: OpportunityItem) => r.type === 'Fellowship').length,
    other: items.filter((r: OpportunityItem) => !['Scholarship', 'Fellowship'].includes(r.type)).length
  }), [items])

  // Get badge variant for type - removed since it's now a standalone function

  // Load data on mount - optimized with proper dependencies
  useEffect(() => {
    loadAllFeeds()
  }, [loadAllFeeds])

  // Debounced page size change to prevent excessive re-renders
  const handlePageSizeChange = useCallback((value: string) => {
    startTransition(() => {
      setPageSize(parseInt(value))
      setPage(1) // Reset to first page when changing page size
    })
  }, [])

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-4 flex-1 flex flex-col min-h-0">
        {/* Compact Header */}
        <Card className="mb-4 flex-shrink-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <Rss className="h-5 w-5 text-primary mr-2" />
                Campaign Manager
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {currentTime}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Compact Control Section */}
        <Card className="mb-4 flex-shrink-0">
          <CardContent className="p-4">
            {/* Feed Sources Management */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">RSS Feed Sources</label>
              <ScrollArea className="h-32 border rounded p-2 bg-muted/20">
                <div className="space-y-1">
                  {feedSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-2 bg-background rounded text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{source.name}</span>
                        <span className="text-muted-foreground ml-2 text-xs truncate block">{source.url}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeFeedSource(source.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Add New Feed */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
              <div className="md:col-span-2">
                <Input 
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  placeholder="RSS Feed URL"
                  className="text-sm"
                />
              </div>
              <div>
                <Input 
                  value={newFeedName}
                  onChange={(e) => setNewFeedName(e.target.value)}
                  placeholder="Source Name"
                  className="text-sm"
                />
              </div>
              <div>
                <Button 
                  onClick={addFeedSource}
                  disabled={!newFeedUrl.trim() || !newFeedName.trim()}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              <div>
                <Button 
                  onClick={() => { setPage(1); loadAllFeeds(); }}
                  disabled={loading}
                  size="sm"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RotateCcw className="h-3 w-3 mr-1 animate-spin" />
                      Loading
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Load All
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Settings Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Use proxy</label>
                <Select value={useProxy} onValueChange={setUseProxy}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on">On (rss2json)</SelectItem>
                    <SelectItem value="off">Off (direct)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Items per page</label>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-muted-foreground w-full">
                  {loading && <RotateCcw className="inline h-3 w-3 mr-1 animate-spin" />}
                  {status}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {showResults && (
          <Card className="mb-4 flex-shrink-0">
            <CardContent className="p-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded">
                  <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{summaryStats.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded">
                  <div className="text-xl font-bold text-green-700 dark:text-green-300">{summaryStats.scholarship}</div>
                  <div className="text-xs text-muted-foreground">Scholarships</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded">
                  <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{summaryStats.fellowship}</div>
                  <div className="text-xs text-muted-foreground">Fellowships</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-950 rounded">
                  <div className="text-xl font-bold text-gray-700 dark:text-gray-300">{summaryStats.other}</div>
                  <div className="text-xs text-muted-foreground">Other</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Directory Table with Scroll */}
        {showResults && (
          <Card className="flex-1 flex flex-col min-h-0 relative">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Directory</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Page {page} of {paginationData.totalPages}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-0">
              {isPending && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                  <RotateCcw className="h-4 w-4 animate-spin" />
                </div>
              )}
              <ScrollArea className="flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="w-24">Type</TableHead>
                      <TableHead className="w-28">Deadline</TableHead>
                      <TableHead className="w-28">Published</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginationData.pageRows.map((row: OpportunityItem, i: number) => (
                      <OpportunityTableRow 
                        key={row.id}
                        row={row}
                        index={i}
                        startIndex={paginationData.start}
                      />
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              
              <Separator />
              <div className="flex items-center justify-between p-4 bg-muted/20">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  {paginationData.start + 1} to {paginationData.end} of {items.length}
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= paginationData.totalPages}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
