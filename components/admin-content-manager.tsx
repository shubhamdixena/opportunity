"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  X,
  Save,
  Play,
  Square,
  Loader2,
  ExternalLink,
  Globe,
  Clock,
  Settings
} from "lucide-react"

interface SimpleCampaign {
  id?: string
  name: string
  sources: string[]
  ai_prompt: string
  frequency: number
  frequency_unit: 'hours' | 'days'
  category: string
  is_active: boolean
  last_run?: string
}

interface CampaignRun {
  id: string
  status: 'running' | 'completed' | 'stopped' | 'failed'
  sources: string[]
  started_at: string
  total_sources: number
  processed_sources: number
  items_found: number
  items_created: number
}

export function AdminContentManager() {
  const [campaign, setCampaign] = useState<SimpleCampaign>({
    name: '',
    sources: [],
    ai_prompt: '',
    frequency: 6,
    frequency_unit: 'hours',
    category: 'General',
    is_active: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSource, setNewSource] = useState('')
  const [currentRun, setCurrentRun] = useState<CampaignRun | null>(null)
  const [saveMessage, setSaveMessage] = useState('')

  const categories = [
    "General",
    "Scholarships",
    "Fellowships", 
    "Grants",
    "Conferences",
    "Competitions",
    "Exchange Program",
    "Tech News",
    "Research",
    "Misc"
  ]

  useEffect(() => {
    loadCampaign()
    loadRunStatus()
    
    // Poll for run status every 5 seconds if there's an active run
    const interval = setInterval(() => {
      if (currentRun?.status === 'running') {
        loadRunStatus()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [currentRun?.status])

  const loadCampaign = async () => {
    try {
      const response = await fetch('/api/campaign')
      if (response.ok) {
        const data = await response.json()
        setCampaign(data.campaign)
      }
    } catch (error) {
      console.error('Failed to load campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRunStatus = async () => {
    try {
      const response = await fetch('/api/campaign/run')
      if (response.ok) {
        const data = await response.json()
        setCurrentRun(data.currentRun)
      }
    } catch (error) {
      console.error('Failed to load run status:', error)
    }
  }

  const saveCampaign = async () => {
    setSaving(true)
    setSaveMessage('')
    
    try {
      const response = await fetch('/api/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign)
      })

      if (response.ok) {
        const data = await response.json()
        setCampaign(data.campaign)
        setSaveMessage('Campaign saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        const error = await response.json()
        setSaveMessage(`Error: ${error.error}`)
      }
    } catch (error) {
      setSaveMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const addSource = () => {
    if (newSource.trim() && !campaign.sources.includes(newSource.trim())) {
      setCampaign(prev => ({
        ...prev,
        sources: [...prev.sources, newSource.trim()]
      }))
      setNewSource('')
    }
  }

  const removeSource = (index: number) => {
    setCampaign(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index)
    }))
  }

  const startCampaign = async () => {
    try {
      const response = await fetch('/api/campaign/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      })

      const result = await response.json()
      if (result.success) {
        await loadRunStatus()
        setSaveMessage('Campaign started successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setSaveMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const stopCampaign = async () => {
    try {
      const response = await fetch('/api/campaign/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      })

      const result = await response.json()
      if (result.success) {
        await loadRunStatus()
        setSaveMessage('Campaign stopped successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setSaveMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Campaign</h1>
          <p className="text-muted-foreground">
            Manage your automated content discovery from multiple sources
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {currentRun?.status === 'running' ? (
            <Button onClick={stopCampaign} variant="destructive">
              <Square className="h-4 w-4 mr-2" />
              Stop Campaign
            </Button>
          ) : (
            <Button 
              onClick={startCampaign} 
              disabled={!campaign.is_active || campaign.sources.length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Campaign
            </Button>
          )}
          
          <Button onClick={saveCampaign} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Campaign
          </Button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-3 rounded-md text-sm ${
          saveMessage.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Current Run Status */}
      {currentRun && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Campaign Status
              <Badge variant={currentRun.status === 'running' ? 'default' : 'secondary'}>
                {currentRun.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Sources</div>
                <div className="text-muted-foreground">{currentRun.processed_sources}/{currentRun.total_sources}</div>
              </div>
              <div>
                <div className="font-medium">Items Found</div>
                <div className="text-muted-foreground">{currentRun.items_found}</div>
              </div>
              <div>
                <div className="font-medium">Items Created</div>
                <div className="text-muted-foreground">{currentRun.items_created}</div>
              </div>
              <div>
                <div className="font-medium">Started</div>
                <div className="text-muted-foreground">{new Date(currentRun.started_at).toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Campaign Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Campaign Settings
            </CardTitle>
            <CardDescription>
              Configure your campaign name, AI processing, and schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Campaign Name</label>
              <Input
                value={campaign.name}
                onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Daily Content Discovery"
              />
            </div>

            <div>
              <label className="text-sm font-medium">AI Prompt</label>
              <Textarea
                value={campaign.ai_prompt}
                onChange={(e) => setCampaign(prev => ({ ...prev, ai_prompt: e.target.value }))}
                placeholder="Describe how you want the AI to process the content..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Frequency</label>
                <Input
                  type="number"
                  value={campaign.frequency}
                  onChange={(e) => setCampaign(prev => ({ ...prev, frequency: parseInt(e.target.value) || 1 }))}
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <Select
                  value={campaign.frequency_unit}
                  onValueChange={(value) => 
                    setCampaign(prev => ({ ...prev, frequency_unit: value as 'hours' | 'days' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={campaign.category}
                onValueChange={(value) => setCampaign(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Campaign Active</label>
              <Switch
                checked={campaign.is_active}
                onCheckedChange={(checked) => setCampaign(prev => ({ ...prev, is_active: checked }))}
              />
            </div>

            {campaign.last_run && (
              <div className="text-sm text-muted-foreground">
                Last run: {new Date(campaign.last_run).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sources Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Content Sources
            </CardTitle>
            <CardDescription>
              Add websites and URLs to discover content from
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="https://example.com"
                onKeyPress={(e) => e.key === 'Enter' && addSource()}
              />
              <Button onClick={addSource} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {campaign.sources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No sources added yet</p>
                  <p className="text-sm">Add URLs above to get started</p>
                </div>
              ) : (
                campaign.sources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{source}</span>
                    </div>
                    <Button
                      onClick={() => removeSource(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {campaign.sources.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {campaign.sources.length} source{campaign.sources.length !== 1 ? 's' : ''} configured
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
