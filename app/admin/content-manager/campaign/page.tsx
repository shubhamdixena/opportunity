"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Loader2, 
  Save, 
  ArrowLeft, 
  Settings, 
  Play,
  Eye,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  FileText
} from "lucide-react"

interface Campaign {
  id: string
  name: string
  sourceUrl: string
  frequency: string
  status: string
}

const initialCampaignFormData = {
  name: "",
  sourceUrl: "",
  frequency: 6,
  frequencyUnit: "daily",
  maxPosts: 10,
  postStatus: "draft",
  enabled: true,
  isPublic: false,
  isActive: true,
}

function CampaignForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignId = searchParams.get("id")

  const [campaignForm, setCampaignForm] = useState(initialCampaignFormData)
  const [loading, setLoading] = useState(false)
  const [isNew, setIsNew] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [runResults, setRunResults] = useState<any[]>([])
  const [runStats, setRunStats] = useState({ found: 0, processed: 0, errors: 0 })
  const [runLogs, setRunLogs] = useState<string[]>([])
  const [activeView, setActiveView] = useState<'settings' | 'run'>('settings')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState('')
  
  useEffect(() => {
    if (campaignId) {
      setIsNew(false)
      setLoading(true)
      fetch(`/api/content-manager/campaigns/${campaignId}`)
        .then((res) => res.json())
        .then((data) => {
          if(data.campaign) {
            setCampaignForm(data.campaign)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [campaignId])

  const handleSave = async () => {
    setSaveStatus('saving')
    setSaveMessage('')
    setLoading(true)
    try {
      const url = isNew
        ? "/api/content-manager/campaigns"
        : `/api/content-manager/campaigns/${campaignId}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignForm),
      })

      if (response.ok) {
        const data = await response.json()
        setSaveStatus('saved')
        setSaveMessage(isNew ? 'Campaign created successfully!' : 'Campaign updated successfully!')
        
        // If it's a new campaign, update the form with the returned ID
        if (isNew && data.campaign?.id) {
          setIsNew(false)
          // Update URL to include the campaign ID without full page reload
          window.history.replaceState({}, '', `/admin/content-manager/campaign?id=${data.campaign.id}`)
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle')
          setSaveMessage('')
        }, 3000)
      } else {
        const error = await response.json()
        setSaveStatus('error')
        setSaveMessage(`Failed to save campaign: ${error.error}`)
      }
    } catch (error) {
      setSaveStatus('error')
      setSaveMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRunCampaign = async () => {
    if (!campaignForm.name || !campaignForm.sourceUrl) {
      alert("Please fill in campaign name and source URL first")
      return
    }

    // TODO: Update to use new Edge Functions-based scraping system
    // For now, redirect users to the main scraping dashboard
    alert('Campaign feature is being updated. Please use the Scraping Dashboard for now.');
    window.location.href = '/admin/scraping';
    return;
  }

  const simulateScrapingProcess = () => {
    let step = 0
    const steps = [
      "Connecting to source URL...",
      "Fetching page content...",
      "Extracting links...",
      "Processing content...",
      "Creating posts...",
      "Campaign completed!"
    ]

    const interval = setInterval(() => {
      if (step < steps.length) {
        addLog(steps[step])
        
        if (step === 2) {
          setRunStats(prev => ({ ...prev, found: 5 }))
        }
        if (step === 4) {
          setRunStats(prev => ({ ...prev, processed: 3 }))
          setRunResults([
            { id: 1, title: "Sample Article 1", url: "https://example.com/1", status: "processed" },
            { id: 2, title: "Sample Article 2", url: "https://example.com/2", status: "processed" },
            { id: 3, title: "Sample Article 3", url: "https://example.com/3", status: "processing" },
          ])
        }
        
        step++
      } else {
        setIsRunning(false)
        clearInterval(interval)
      }
    }, 2000)
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setRunLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  if (loading && !isNew) {
    return (
       <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
       </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isNew ? "Create New Campaign" : `Edit Campaign: ${campaignForm.name}`}
              </h1>
              <p className="text-muted-foreground">
                Configure and run your automated content campaign
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveView('settings')}
              className={activeView === 'settings' ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' : ''}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveView('run')}
              className={activeView === 'run' ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : ''}
            >
              <Play className="mr-2 h-4 w-4" />
              Run Campaign
            </Button>
          </div>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <div className="w-80 bg-card border-r border-border overflow-y-auto">
          <div className="p-6">
            <div className="space-y-6">
              {/* Campaign Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Campaign Configuration</h3>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="campaign-name" className="text-sm font-medium text-foreground block mb-1">
                      Campaign Name *
                    </label>
                    <Input
                      id="campaign-name"
                      value={campaignForm.name}
                      onChange={(e) =>
                        setCampaignForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g., TechCrunch AI News"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="source-url" className="text-sm font-medium text-foreground block mb-1">
                      Source URL *
                    </label>
                    <Input
                      id="source-url"
                      value={campaignForm.sourceUrl}
                      onChange={(e) =>
                        setCampaignForm((prev) => ({ ...prev, sourceUrl: e.target.value }))
                      }
                      placeholder="https://example.com/blog"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Automation Settings</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">
                      Run Frequency
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="6"
                        value={campaignForm.frequency}
                        onChange={(e) =>
                          setCampaignForm((prev) => ({
                            ...prev,
                            frequency: Number(e.target.value),
                          }))
                        }
                      />
                      <Select
                        value={campaignForm.frequencyUnit}
                        onValueChange={(value) =>
                          setCampaignForm((prev) => ({
                            ...prev,
                            frequencyUnit: value as "minutes" | "hours" | "days",
                          }))
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
                  </div>

                  <div>
                    <label htmlFor="max-posts" className="text-sm font-medium text-foreground block mb-1">
                      Max Posts per Run
                    </label>
                    <Input
                      id="max-posts"
                      type="number"
                      min="1"
                      value={campaignForm.maxPosts}
                      onChange={(e) =>
                        setCampaignForm((prev) => ({ 
                          ...prev, 
                          maxPosts: Number(e.target.value) 
                        }))
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="post-status" className="text-sm font-medium text-foreground block mb-1">
                      Post Status
                    </label>
                    <Select
                      value={campaignForm.postStatus}
                      onValueChange={(value) =>
                        setCampaignForm((prev) => ({ ...prev, postStatus: value as "draft" | "published" }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status for new posts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Save as Draft</SelectItem>
                        <SelectItem value="published">Publish Immediately</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div>
                      <label htmlFor="is_active" className="text-sm font-medium text-foreground">
                        Active Campaign
                      </label>
                      <p className="text-xs text-muted-foreground">Enable this campaign</p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={campaignForm.isActive}
                      onCheckedChange={(checked) =>
                        setCampaignForm((prev) => ({ ...prev, isActive: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Save Status Message */}
              {saveMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  saveStatus === 'saved' 
                    ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                    : saveStatus === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {saveStatus === 'saved' && <CheckCircle className="h-4 w-4" />}
                    {saveStatus === 'error' && <AlertCircle className="h-4 w-4" />}
                    {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saveMessage}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleSave}
                  disabled={loading || !campaignForm.name || !campaignForm.sourceUrl}
                  className={`w-full transition-all ${
                    saveStatus === 'saved' 
                      ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800' 
                      : ''
                  }`}
                >
                  {saveStatus === 'saving' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saveStatus === 'saved' ? (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {saveStatus === 'saving' 
                    ? 'Saving...' 
                    : saveStatus === 'saved' 
                    ? 'Saved!' 
                    : isNew 
                    ? "Save Campaign" 
                    : "Update Campaign"}
                </Button>
                
                <Button
                  onClick={handleRunCampaign}
                  disabled={isRunning || !campaignForm.name || !campaignForm.sourceUrl}
                  variant="outline"
                  className="w-full"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Campaign Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-background">
          {activeView === 'settings' ? (
            <div className="p-6">
              <div className="max-w-4xl">
                <Card className="shadow-sm">
                  <CardHeader className="bg-card border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Campaign Overview
                    </CardTitle>
                    <CardDescription>
                      Review your campaign configuration. Use the sidebar to make changes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 bg-card">
                    <div className="space-y-6">
                      {/* Status Card */}
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {campaignForm.name || "Untitled Campaign"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {campaignForm.sourceUrl ? (
                              <>Scraping from: <span className="font-mono text-blue-600 dark:text-blue-400">{campaignForm.sourceUrl}</span></>
                            ) : (
                              "No source URL configured"
                            )}
                          </p>
                        </div>
                        <Badge 
                          variant={campaignForm.isActive ? "default" : "secondary"}
                          className="text-sm px-3 py-1"
                        >
                          {campaignForm.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {/* Configuration Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-foreground">{campaignForm.frequency}</div>
                          <div className="text-sm text-muted-foreground capitalize">{campaignForm.frequencyUnit}</div>
                          <div className="text-xs text-muted-foreground mt-1">Frequency</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-foreground">{campaignForm.maxPosts}</div>
                          <div className="text-sm text-muted-foreground">Posts</div>
                          <div className="text-xs text-muted-foreground mt-1">Max per run</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold text-foreground capitalize">{campaignForm.postStatus}</div>
                          <div className="text-xs text-muted-foreground mt-1">Post Status</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="max-w-6xl space-y-6">
                {/* Campaign Run Header */}
                <Card className="shadow-sm">
                  <CardHeader className="bg-card border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Campaign Execution: {campaignForm.name || "Untitled Campaign"}
                    </CardTitle>
                    <CardDescription>
                      Monitor your campaign's scraping progress and results in real-time.
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Run Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Items Found</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{runStats.found}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Processed</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{runStats.processed}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Errors</CardTitle>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{runStats.errors}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Live Activity Log */}
                  <Card className="shadow-sm">
                    <CardHeader className="bg-card border-b">
                      <CardTitle className="flex items-center gap-2">
                        <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
                        Live Activity Log
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-80 w-full p-4">
                        <div className="space-y-2">
                          {runLogs.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                              No activity yet. Click "Run Campaign Now" to start.
                            </p>
                          ) : (
                            runLogs.map((log, index) => (
                              <div key={index} className="text-sm font-mono p-2 bg-muted/50 rounded">
                                {log}
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Scraped Content */}
                  <Card className="shadow-sm">
                    <CardHeader className="bg-card border-b">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Scraped Content ({runResults.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-80 w-full">
                        {runResults.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No content scraped yet</p>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {runResults.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="font-medium truncate max-w-[200px]">
                                        {item.title}
                                      </div>
                                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {item.url}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={item.status === 'processed' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {item.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button size="sm" variant="outline">
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CampaignPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <CampaignForm />
    </Suspense>
  )
}
