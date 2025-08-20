"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Trash2, Play, Pause, Plus, Globe } from "lucide-react"

interface ScrapingSource {
  id?: string
  name: string
  url: string
  max_posts: number
  is_active: boolean
  source_type: "sitemap" | "rss" | "manual"
}

export default function ScrapingSchedulerUI() {
  const [sources, setSources] = useState<ScrapingSource[]>([])
  const [newSource, setNewSource] = useState<ScrapingSource>({
    name: "",
    url: "",
    max_posts: 10,
    is_active: true,
    source_type: "sitemap",
  })
  const [isSchedulerRunning, setIsSchedulerRunning] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSavedSources()
  }, [])

  const loadSavedSources = async () => {
    try {
      const response = await fetch("/api/scraping/sources")
      if (response.ok) {
        const data = await response.json()
        setSources(data)
      }
    } catch (error) {
      console.error("Error loading sources:", error)
    }
  }

  const saveSource = async () => {
    if (!newSource.name || !newSource.url) return

    setLoading(true)
    try {
      const response = await fetch("/api/scraping/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSource),
      })

      if (response.ok) {
        await loadSavedSources()
        setNewSource({
          name: "",
          url: "",
          max_posts: 10,
          is_active: true,
          source_type: "sitemap",
        })
      }
    } catch (error) {
      console.error("Error saving source:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteSource = async (id: string) => {
    try {
      const response = await fetch(`/api/scraping/sources/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadSavedSources()
      }
    } catch (error) {
      console.error("Error deleting source:", error)
    }
  }

  const toggleSourceActive = async (id: string, is_active: boolean) => {
    try {
      const response = await fetch(`/api/scraping/sources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active }),
      })

      if (response.ok) {
        await loadSavedSources()
      }
    } catch (error) {
      console.error("Error updating source:", error)
    }
  }

  const toggleScheduler = async () => {
    try {
      const action = isSchedulerRunning ? "stop" : "start"
      const response = await fetch(`/api/scraping/scheduler/${action}`, {
        method: "POST",
      })

      if (response.ok) {
        setIsSchedulerRunning(!isSchedulerRunning)
      }
    } catch (error) {
      console.error("Error toggling scheduler:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Scheduler Control */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Automatic Scraping</CardTitle>
              <CardDescription>Schedule automatic scraping of saved sources</CardDescription>
            </div>
            <Button onClick={toggleScheduler} variant={isSchedulerRunning ? "destructive" : "default"}>
              {isSchedulerRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge variant={isSchedulerRunning ? "default" : "secondary"} className="text-sm px-3 py-1">
              {isSchedulerRunning ? "Running - checks sources every hour" : "Stopped"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {sources.filter(s => s.is_active).length} active sources
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add New Source */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Source
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sourceName">Name</Label>
              <Input
                id="sourceName"
                placeholder="Source name"
                value={newSource.name}
                onChange={(e) => setNewSource((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="sourceUrl">URL</Label>
              <Input
                id="sourceUrl"
                placeholder="https://example.com/sitemap.xml"
                value={newSource.url}
                onChange={(e) => setNewSource((prev) => ({ ...prev, url: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="sourceType">Type</Label>
              <Select
                value={newSource.source_type}
                onValueChange={(value) =>
                  setNewSource((prev) => ({ ...prev, source_type: value as "sitemap" | "rss" | "manual" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sitemap">Sitemap</SelectItem>
                  <SelectItem value="rss">RSS Feed</SelectItem>
                  <SelectItem value="manual">Manual URL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Label htmlFor="sourceMaxPosts">Max Posts</Label>
              <Input
                id="sourceMaxPosts"
                type="number"
                min="1"
                max="100"
                value={newSource.max_posts}
                onChange={(e) =>
                  setNewSource((prev) => ({
                    ...prev,
                    max_posts: Number.parseInt(e.target.value) || 10,
                  }))
                }
              />
            </div>
          </div>

          <Button onClick={saveSource} disabled={loading || !newSource.name || !newSource.url}>
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </CardContent>
      </Card>

      {/* Saved Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Sources ({sources.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No sources added yet</p>
          ) : (
            <div className="space-y-3">
              {sources.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{source.name}</h4>
                      <Badge variant={source.is_active ? "default" : "secondary"} className="text-xs">
                        {source.is_active ? "Active" : "Off"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{source.source_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{source.url}</p>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-xs text-muted-foreground">Max: {source.max_posts}</span>
                    <Switch
                      checked={source.is_active}
                      onCheckedChange={(checked) => source.id && toggleSourceActive(source.id, checked)}
                    />
                    <Button variant="outline" size="sm" onClick={() => source.id && deleteSource(source.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
