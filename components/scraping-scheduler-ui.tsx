"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Trash2, Play, Pause, Plus, Globe, Settings } from "lucide-react"

interface ScrapingSource {
  id?: string
  name: string
  url: string
  max_posts: number
  is_active: boolean
  source_type: "sitemap" | "rss" | "manual"
}

interface SchedulerConfig {
  frequency: number
  frequencyUnit: "minutes" | "hours" | "days"
  maxPosts: number
  isEnabled: boolean
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
  const [schedulerConfig, setSchedulerConfig] = useState<SchedulerConfig>({
    frequency: 1,
    frequencyUnit: "hours",
    maxPosts: 50,
    isEnabled: false,
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

  const saveSchedulerConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/scraping/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedulerConfig),
      })

      if (response.ok) {
        console.log("Scheduler configuration saved")
      }
    } catch (error) {
      console.error("Error saving scheduler config:", error)
    } finally {
      setLoading(false)
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
      {/* Scheduler Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automatic Scraping Scheduler
          </CardTitle>
          <CardDescription>Configure automatic scraping intervals for saved sources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                type="number"
                min="1"
                value={schedulerConfig.frequency}
                onChange={(e) =>
                  setSchedulerConfig((prev) => ({
                    ...prev,
                    frequency: Number.parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="frequencyUnit">Unit</Label>
              <Select
                value={schedulerConfig.frequencyUnit}
                onValueChange={(value: "minutes" | "hours" | "days") =>
                  setSchedulerConfig((prev) => ({ ...prev, frequencyUnit: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxPosts">Max Posts per Run</Label>
              <Input
                id="maxPosts"
                type="number"
                min="1"
                value={schedulerConfig.maxPosts}
                onChange={(e) =>
                  setSchedulerConfig((prev) => ({
                    ...prev,
                    maxPosts: Number.parseInt(e.target.value) || 10,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="scheduler-enabled"
                checked={schedulerConfig.isEnabled}
                onCheckedChange={(checked) => setSchedulerConfig((prev) => ({ ...prev, isEnabled: checked }))}
              />
              <Label htmlFor="scheduler-enabled">Enable Scheduler</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveSchedulerConfig} disabled={loading}>
                Save Configuration
              </Button>
              <Button onClick={toggleScheduler} variant={isSchedulerRunning ? "destructive" : "default"}>
                {isSchedulerRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Scheduler
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Scheduler
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Source */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Scraping Source
          </CardTitle>
          <CardDescription>Save URLs for automatic scraping</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sourceName">Source Name</Label>
              <Input
                id="sourceName"
                placeholder="e.g., Opportunities Circle"
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
            <div>
              <Label htmlFor="sourceType">Source Type</Label>
              <Select
                value={newSource.source_type}
                onValueChange={(value: "sitemap" | "rss" | "manual") =>
                  setNewSource((prev) => ({ ...prev, source_type: value }))
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
            <div>
              <Label htmlFor="sourceMaxPosts">Max Posts</Label>
              <Input
                id="sourceMaxPosts"
                type="number"
                min="1"
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
            Save Source
          </Button>
        </CardContent>
      </Card>

      {/* Saved Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Saved Sources ({sources.length})
          </CardTitle>
          <CardDescription>Manage your saved scraping sources</CardDescription>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No saved sources yet. Add your first source above.</p>
          ) : (
            <div className="space-y-3">
              {sources.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{source.name}</h4>
                      <Badge variant={source.is_active ? "default" : "secondary"}>
                        {source.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{source.source_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{source.url}</p>
                    <p className="text-xs text-muted-foreground">Max posts: {source.max_posts}</p>
                  </div>

                  <div className="flex items-center gap-2">
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
