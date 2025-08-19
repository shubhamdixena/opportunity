'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Search, 
  ArrowUpDown,
  ExternalLink,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { ScrapingService } from '@/lib/services/scraping-service-v2'
import { ScrapedOpportunity } from '@/lib/types/scraping'

type ProcessingStatus = 'raw' | 'processed' | 'converted' | 'rejected'

const STATUS_CONFIG = {
  raw: {
    label: 'Raw',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
    description: 'Recently scraped, not yet processed'
  },
  processed: {
    label: 'Processed',
    color: 'bg-blue-100 text-blue-800',
    icon: Activity,
    description: 'Processed by AI, ready for review'
  },
  converted: {
    label: 'Converted',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
    description: 'Successfully converted to opportunity'
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Rejected during processing'
  }
}

export default function ScrapingProgress() {
  const [opportunities, setOpportunities] = useState<ScrapedOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredOpportunities, setFilteredOpportunities] = useState<ScrapedOpportunity[]>([])
  const [statusFilter, setStatusFilter] = useState<ProcessingStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof ScrapedOpportunity>('scraped_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadOpportunities()
  }, [])

  useEffect(() => {
    filterAndSortOpportunities()
  }, [opportunities, statusFilter, searchTerm, sortField, sortDirection])

  const loadOpportunities = async () => {
    setLoading(true)
    try {
      const result = await ScrapingService.getScrapedOpportunities(100)
      setOpportunities(result.data)
    } catch (error) {
      console.error('Failed to load scraped opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortOpportunities = () => {
    let filtered = [...opportunities]

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(opp => opp.processing_status === statusFilter)
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(opp => 
        opp.name?.toLowerCase().includes(term) ||
        opp.category?.toLowerCase().includes(term) ||
        opp.source_url?.toLowerCase().includes(term)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      let comparison = 0
      if (aValue && bValue) {
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue)
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue
        } else {
          comparison = String(aValue).localeCompare(String(bValue))
        }
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })

    setFilteredOpportunities(filtered)
  }

  const handleSort = (field: keyof ScrapedOpportunity) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getStatusStats = () => {
    const stats = {
      raw: opportunities.filter(o => o.processing_status === 'raw').length,
      processed: opportunities.filter(o => o.processing_status === 'processed').length,
      converted: opportunities.filter(o => o.processing_status === 'converted').length,
      rejected: opportunities.filter(o => o.processing_status === 'rejected').length,
      total: opportunities.length
    }

    const conversionRate = stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0
    const avgConfidence = opportunities.length > 0 ? 
      Math.round(opportunities.reduce((sum, o) => sum + (o.ai_confidence_score || 0), 0) / opportunities.length) : 0

    return { ...stats, conversionRate, avgConfidence }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const truncateText = (text: string | null | undefined, length: number = 50) => {
    if (!text) return 'N/A'
    return text.length > length ? text.substring(0, length) + '...' : text
  }

  const stats = getStatusStats()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Scraping Progress</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Scraping Progress</h2>
          <p className="text-muted-foreground">
            Monitor scraped opportunities and their processing status
          </p>
        </div>
        <Button onClick={loadOpportunities} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>





      {/* Opportunities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scraped Opportunities</CardTitle>
          <CardDescription>
            Detailed view of all scraped opportunities and their processing status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredOpportunities.length} of {opportunities.length} opportunities
          </div>

          {/* Table */}
          {filteredOpportunities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No opportunities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {opportunities.length === 0 
                  ? 'No opportunities have been scraped yet.'
                  : 'No opportunities match your current filters.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Opportunity
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('processing_status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('ai_confidence_score')}
                    >
                      <div className="flex items-center gap-2">
                        Confidence
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('scraped_at')}
                    >
                      <div className="flex items-center gap-2">
                        Scraped At
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOpportunities.map((opportunity) => {
                    const status = STATUS_CONFIG[opportunity.processing_status]
                    const StatusIcon = status.icon
                    const scrapedDate = formatDate(opportunity.scraped_at)

                    return (
                      <TableRow key={opportunity.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {truncateText(opportunity.name, 40) || 'Untitled'}
                            </div>
                            {opportunity.category && (
                              <div className="text-xs text-muted-foreground">
                                Category: {opportunity.category}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={opportunity.ai_confidence_score || 0} 
                              className="w-12 h-2"
                            />
                            <span className="text-sm">
                              {Math.round(opportunity.ai_confidence_score || 0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {scrapedDate.date}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {scrapedDate.time}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {truncateText(opportunity.source_url, 30)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            {opportunity.post_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(opportunity.post_url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => console.log('View details:', opportunity)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
