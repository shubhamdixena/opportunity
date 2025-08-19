import { NextRequest, NextResponse } from 'next/server'
import { ScrapingService } from '@/lib/services/scraping-service-v2'

export async function GET() {
  try {
    // Test the connection by trying to fetch sources
    const sources = await ScrapingService.getSources()
    const scheduleConfig = await ScrapingService.getScheduleConfig()
    const recentOpportunities = await ScrapingService.getScrapedOpportunities(1, 10)

    return NextResponse.json({
      success: true,
      data: {
        sources: sources.length,
        schedule: scheduleConfig?.is_enabled ? 'enabled' : 'disabled',
        recentOpportunities: recentOpportunities.data.length,
        connectionStatus: 'connected'
      }
    })
  } catch (error) {
    console.error('API test error:', error)
    return NextResponse.json(
      { error: 'Service error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'create_source':
        const newSource = await ScrapingService.createSource(data)
        return NextResponse.json({ success: true, data: newSource })

      case 'update_schedule':
        const updatedSchedule = await ScrapingService.updateScheduleConfig(data)
        return NextResponse.json({ success: true, data: updatedSchedule })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Service error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
