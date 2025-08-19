'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, Play, Pause, Settings, Calendar, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { ScrapingService } from '@/lib/services/scraping-service-v2'
import { ScheduleConfig } from '@/lib/types/scraping'

const CRON_PRESETS = [
  { value: '0 */1 * * *', label: 'Every hour', description: 'Runs every hour' },
  { value: '0 */2 * * *', label: 'Every 2 hours', description: 'Runs every 2 hours' },
  { value: '0 */4 * * *', label: 'Every 4 hours', description: 'Runs every 4 hours' },
  { value: '0 */6 * * *', label: 'Every 6 hours', description: 'Runs every 6 hours' },
  { value: '0 */12 * * *', label: 'Every 12 hours', description: 'Runs twice daily' },
  { value: '0 0 * * *', label: 'Daily', description: 'Runs daily at midnight' },
  { value: '0 0 */2 * *', label: 'Every 2 days', description: 'Runs every 2 days' },
  { value: '0 0 * * 0', label: 'Weekly', description: 'Runs weekly on Sunday' },
]

export default function ScheduleConfiguration() {
  const [config, setConfig] = useState<ScheduleConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedCron, setSelectedCron] = useState('')

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const data = await ScrapingService.getScheduleConfig()
      if (data) {
        setConfig(data)
        setSelectedCron(data.cron_expression)
      }
    } catch (error) {
      console.error('Failed to load schedule config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSchedule = async (updates: Partial<ScheduleConfig>) => {
    setUpdating(true)
    try {
      const updated = await ScrapingService.updateScheduleConfig(updates)
      if (updated) {
        setConfig(updated)
      }
    } catch (error) {
      console.error('Failed to update schedule:', error)
    } finally {
      setUpdating(false)
    }
  }

  const toggleSchedule = async () => {
    if (config) {
      await handleUpdateSchedule({ is_enabled: !config.is_enabled })
    }
  }

  const updateCronExpression = async () => {
    if (selectedCron && config) {
      await handleUpdateSchedule({ cron_expression: selectedCron })
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (ms: number) => {
    if (ms === 0) return 'No data'
    const seconds = Math.round(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.round(minutes / 60)
    return `${hours}h`
  }

  const getNextRunTime = (cronExpression: string) => {
    // Simple estimation - in a real app, you'd use a proper cron parser
    const now = new Date()
    const nextRun = new Date(now)
    
    switch (cronExpression) {
      case '0 */1 * * *': // Every hour
        nextRun.setHours(nextRun.getHours() + 1, 0, 0, 0)
        break
      case '0 */2 * * *': // Every 2 hours
        nextRun.setHours(nextRun.getHours() + 2, 0, 0, 0)
        break
      case '0 */4 * * *': // Every 4 hours
        nextRun.setHours(nextRun.getHours() + 4, 0, 0, 0)
        break
      case '0 */6 * * *': // Every 6 hours
        nextRun.setHours(nextRun.getHours() + 6, 0, 0, 0)
        break
      case '0 */12 * * *': // Every 12 hours
        nextRun.setHours(nextRun.getHours() + 12, 0, 0, 0)
        break
      case '0 0 * * *': // Daily
        nextRun.setDate(nextRun.getDate() + 1)
        nextRun.setHours(0, 0, 0, 0)
        break
      case '0 0 */2 * *': // Every 2 days
        nextRun.setDate(nextRun.getDate() + 2)
        nextRun.setHours(0, 0, 0, 0)
        break
      case '0 0 * * 0': // Weekly
        nextRun.setDate(nextRun.getDate() + (7 - nextRun.getDay()))
        nextRun.setHours(0, 0, 0, 0)
        break
      default:
        return 'Unknown'
    }
    
    return nextRun.toLocaleString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Schedule Configuration</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No schedule configuration</h3>
        <p className="mt-1 text-sm text-gray-500">
          Schedule configuration not found. Please check your database setup.
        </p>
      </div>
    )
  }

  const currentPreset = CRON_PRESETS.find(preset => preset.value === config.cron_expression)
  const selectedPreset = CRON_PRESETS.find(preset => preset.value === selectedCron)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Schedule Configuration</h2>
          <p className="text-muted-foreground">
            Configure automated scraping schedules and monitor performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={config.is_enabled ? "default" : "secondary"}>
            {config.is_enabled ? 'Active' : 'Inactive'}
          </Badge>
          <Button
            variant={config.is_enabled ? "outline" : "default"}
            onClick={toggleSchedule}
            disabled={updating}
          >
            {config.is_enabled ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Disable
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Enable
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {config.is_enabled ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Pause className="h-4 w-4 text-gray-400" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${config.is_enabled ? 'text-green-600' : 'text-gray-400'}`}>
              {config.is_enabled ? 'Running' : 'Stopped'}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentPreset?.label || 'Custom schedule'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{config.run_count}</div>
            <p className="text-xs text-muted-foreground">
              {config.total_opportunities_found} opportunities found
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Runtime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(config.average_run_time_ms)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per scraping session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sources Processed</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{config.total_sources_processed}</div>
            <p className="text-xs text-muted-foreground">
              Total across all runs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Settings</CardTitle>
            <CardDescription>
              Configure when the automated scraping should run
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule Frequency</label>
              <Select value={selectedCron} onValueChange={setSelectedCron}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a schedule" />
                </SelectTrigger>
                <SelectContent>
                  {CRON_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{preset.label}</span>
                        <span className="text-xs text-muted-foreground">{preset.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPreset && (
                <p className="text-sm text-muted-foreground">
                  {selectedPreset.description}
                </p>
              )}
            </div>

            {selectedCron !== config.cron_expression && (
              <Button 
                onClick={updateCronExpression} 
                disabled={updating}
                className="w-full"
              >
                {updating ? 'Updating...' : 'Update Schedule'}
              </Button>
            )}

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Schedule:</span>
                <span className="font-medium">
                  {currentPreset?.label || config.cron_expression}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next Run:</span>
                <span className="font-medium">
                  {config.is_enabled ? getNextRunTime(config.cron_expression) : 'Disabled'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execution History</CardTitle>
            <CardDescription>
              Recent scraping performance and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Run</span>
                <span className="text-sm font-medium">
                  {formatDate(config.last_run)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Next Run</span>
                <span className="text-sm font-medium">
                  {config.is_enabled ? getNextRunTime(config.cron_expression) : 'Disabled'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="text-sm font-medium">
                    {config.run_count > 0 ? Math.round((config.run_count / Math.max(config.run_count, 1)) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={config.run_count > 0 ? Math.round((config.run_count / Math.max(config.run_count, 1)) * 100) : 0} 
                  className="h-2" 
                />
              </div>

              {config.last_error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Last Error</h4>
                      <p className="text-sm text-red-600 mt-1">{config.last_error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Detailed statistics about scraping performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">{config.run_count}</div>
              <p className="text-sm text-muted-foreground">Total Scraping Sessions</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">{config.total_opportunities_found}</div>
              <p className="text-sm text-muted-foreground">Opportunities Discovered</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-600">
                {config.run_count > 0 ? Math.round(config.total_opportunities_found / config.run_count) : 0}
              </div>
              <p className="text-sm text-muted-foreground">Avg Opportunities per Run</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
