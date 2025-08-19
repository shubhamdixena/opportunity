'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Settings, 
  Database, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Activity,
  Globe
} from 'lucide-react';
import { ScrapingService } from '@/lib/services/scraping-service-v2';
import SourceManagementInterface from '@/components/source-management';
import ScheduleConfiguration from '@/components/schedule-configuration';
import ScrapingProgress from '@/components/scraping-progress';

interface ScrapingStats {
  totalSources: number;
  activeSources: number;
  totalOpportunities: number;
  recentOpportunities: number;
  lastRunTime?: string;
  avgSuccessRate: number;
}

export default function ScrapingDashboard() {
  const [stats, setStats] = useState<ScrapingStats>({
    totalSources: 0,
    activeSources: 0,
    totalOpportunities: 0,
    recentOpportunities: 0,
    avgSuccessRate: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await ScrapingService.getScrapingStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const runScraper = async () => {
    setIsRunning(true);
    try {
      const result = await ScrapingService.runScheduledScraper();
      if (result.success) {
        await fetchStats(); // Refresh stats after successful run
        console.log('Scraping completed:', result);
      } else {
        console.error('Scraping failed:', result.error);
      }
    } catch (error) {
      console.error('Error running scraper:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Scraping Dashboard</h1>
          <p className="text-muted-foreground">
            Manage web scraping operations with advanced discovery and content extraction
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={runScraper} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Scraper
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalSources}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSources} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunities Found</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recentOpportunities} in last 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : Math.round(stats.avgSuccessRate)}%</div>
            <Progress value={stats.avgSuccessRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.lastRunTime ? 'Recently' : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.lastRunTime 
                ? new Date(stats.lastRunTime).toLocaleDateString()
                : 'Not yet run'
              }
            </p>
          </CardContent>
        </Card>
      </div>



      {/* Main Tabs */}
      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Source Management</span>
            <span className="sm:hidden">Sources</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule Config</span>
            <span className="sm:hidden">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Progress Monitor</span>
            <span className="sm:hidden">Progress</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <SourceManagementInterface />
        </TabsContent>

        <TabsContent value="schedule">
          <ScheduleConfiguration />
        </TabsContent>

        <TabsContent value="progress">
          <ScrapingProgress />
        </TabsContent>
      </Tabs>
    </div>
  );
}
