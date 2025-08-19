import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get scraping statistics
    const [
      { count: totalSources },
      { count: activeSources },
      { count: totalSchedules },
      { count: activeSchedules },
      { count: totalScraped },
      { count: newOpportunities },
      { count: convertedOpportunities },
      { count: errorOpportunities }
    ] = await Promise.all([
      supabase.from('scraping_sources').select('*', { count: 'exact', head: true }),
      supabase.from('scraping_sources').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('scraping_schedule').select('*', { count: 'exact', head: true }),
      supabase.from('scraping_schedule').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('scraped_opportunities').select('*', { count: 'exact', head: true }),
      supabase.from('scraped_opportunities').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('scraped_opportunities').select('*', { count: 'exact', head: true }).eq('status', 'converted'),
      supabase.from('scraped_opportunities').select('*', { count: 'exact', head: true }).eq('status', 'error'),
    ]);

    // Get recent scraping activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentActivity, error: activityError } = await supabase
      .from('scraped_opportunities')
      .select('scraped_at, status, source:scraping_sources(name)')
      .gte('scraped_at', sevenDaysAgo.toISOString())
      .order('scraped_at', { ascending: false })
      .limit(100);

    if (activityError) {
      console.error('Error fetching recent activity:', activityError);
    }

    // Get source statistics
    const { data: sourceStats, error: sourceStatsError } = await supabase
      .from('scraping_sources')
      .select(`
        id,
        name,
        source_type,
        is_active,
        scraped_opportunities(count)
      `);

    if (sourceStatsError) {
      console.error('Error fetching source stats:', sourceStatsError);
    }

    // Process activity data for charts (group by date)
    const activityByDate: Record<string, { new: number; converted: number; error: number }> = {};
    
    if (recentActivity) {
      recentActivity.forEach(item => {
        const date = new Date(item.scraped_at).toISOString().split('T')[0];
        if (!activityByDate[date]) {
          activityByDate[date] = { new: 0, converted: 0, error: 0 };
        }
        activityByDate[date][item.status as keyof typeof activityByDate[string]]++;
      });
    }

    const chartData = Object.entries(activityByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({
        date,
        ...counts,
      }));

    return NextResponse.json({
      overview: {
        total_sources: totalSources || 0,
        active_sources: activeSources || 0,
        total_schedules: totalSchedules || 0,
        active_schedules: activeSchedules || 0,
        total_scraped: totalScraped || 0,
        new_opportunities: newOpportunities || 0,
        converted_opportunities: convertedOpportunities || 0,
        error_opportunities: errorOpportunities || 0,
      },
      source_stats: sourceStats || [],
      activity_chart_data: chartData,
      recent_activity: recentActivity?.slice(0, 20) || [], // Limit to 20 most recent
    });

  } catch (error) {
    console.error('Error in GET /api/scraping/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
