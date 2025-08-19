'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit2, Trash2, Globe, Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { ScrapingService } from '@/lib/services/scraping-service-v2'
import { ScrapingSource } from '@/lib/types/scraping'

export default function SourceManagementInterface() {
  const [sources, setSources] = useState<ScrapingSource[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<ScrapingSource | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    url: string
    source_type: 'website' | 'rss' | 'sitemap' | 'api'
    max_posts: number
    is_active: boolean
  }>({
    name: '',
    url: '',
    source_type: 'website',
    max_posts: 10,
    is_active: true
  })

  useEffect(() => {
    loadSources()
  }, [])

  const loadSources = async () => {
    setLoading(true)
    try {
      const data = await ScrapingService.getSources()
      setSources(data)
    } catch (error) {
      console.error('Failed to load sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingSource) {
        // Update existing source
        await ScrapingService.updateSource(editingSource.id, formData)
      } else {
        // Create new source
        await ScrapingService.createSource(formData)
      }
      
      await loadSources()
      resetForm()
    } catch (error) {
      console.error('Failed to save source:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this source?')) {
      try {
        await ScrapingService.deleteSource(id)
        await loadSources()
      } catch (error) {
        console.error('Failed to delete source:', error)
      }
    }
  }

  const toggleSourceStatus = async (source: ScrapingSource) => {
    try {
      await ScrapingService.updateSource(source.id, {
        is_active: !source.is_active
      })
      await loadSources()
    } catch (error) {
      console.error('Failed to toggle source status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      source_type: 'website',
      max_posts: 10,
      is_active: true
    })
    setEditingSource(null)
    setDialogOpen(false)
  }

  const openEditDialog = (source: ScrapingSource) => {
    setEditingSource(source)
    setFormData({
      name: source.name,
      url: source.url,
      source_type: source.source_type,
      max_posts: source.max_posts,
      is_active: source.is_active
    })
    setDialogOpen(true)
  }

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'rss': return '📡'
      case 'sitemap': return '🗺️'
      case 'api': return '🔌'
      default: return '🌐'
    }
  }

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case 'rss': return 'bg-blue-100 text-blue-800'
      case 'sitemap': return 'bg-green-100 text-green-800'
      case 'api': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (successRate: number) => {
    if (successRate >= 80) return 'text-green-600'
    if (successRate >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Calculate summary stats
  const stats = {
    total: sources.length,
    active: sources.filter(s => s.is_active).length,
    avgSuccessRate: sources.length > 0 ? 
      Math.round(sources.reduce((sum, s) => sum + s.success_rate, 0) / sources.length) : 0
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Source Management</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
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
          <h2 className="text-2xl font-bold tracking-tight">Source Management</h2>
          <p className="text-muted-foreground">
            Manage your scraping sources and monitor their performance
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSource ? 'Edit Source' : 'Add New Source'}
                </DialogTitle>
                <DialogDescription>
                  {editingSource 
                    ? 'Update the source configuration below.'
                    : 'Add a new source to start scraping opportunities.'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Source Name
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Opportunity Desk"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="url" className="text-sm font-medium">
                    Source URL
                  </label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Source Type
                  </label>
                  <Select
                    value={formData.source_type}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, source_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">🌐 Website</SelectItem>
                      <SelectItem value="rss">📡 RSS Feed</SelectItem>
                      <SelectItem value="sitemap">🗺️ Sitemap</SelectItem>
                      <SelectItem value="api">🔌 API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="max_posts" className="text-sm font-medium">
                    Max Posts per Scrape
                  </label>
                  <Input
                    id="max_posts"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.max_posts}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_posts: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    Active
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSource ? 'Update Source' : 'Add Source'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active sources
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total - stats.active} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(stats.avgSuccessRate)}`}>
              {stats.avgSuccessRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all sources
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scraping Sources</CardTitle>
          <CardDescription>
            Manage and monitor your configured scraping sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No sources configured</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first scraping source.
              </p>
              <div className="mt-6">
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Max Posts</TableHead>
                    <TableHead>Last Scraped</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{source.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {source.url}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getSourceTypeColor(source.source_type)}>
                          {getSourceTypeIcon(source.source_type)} {source.source_type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={source.is_active}
                            onCheckedChange={() => toggleSourceStatus(source)}
                          />
                          <span className="text-sm">
                            {source.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={source.success_rate} 
                            className="w-16 h-2"
                          />
                          <span className={`text-sm ${getStatusColor(source.success_rate)}`}>
                            {source.success_rate}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {source.successful_attempts}/{source.total_attempts} attempts
                        </div>
                      </TableCell>
                      <TableCell>{source.max_posts}</TableCell>
                      <TableCell>
                        {source.last_scraped_at ? (
                          <div className="text-sm">
                            {new Date(source.last_scraped_at).toLocaleDateString()}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {new Date(source.last_scraped_at).toLocaleTimeString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(source)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(source.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
