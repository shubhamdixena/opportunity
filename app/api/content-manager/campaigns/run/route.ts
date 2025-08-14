import { NextRequest, NextResponse } from 'next/server'
import { campaignScheduler } from '@/lib/campaign-scheduler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, action = 'start' } = body

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'start':
        const campaignRun = await campaignScheduler.startCampaignRun(campaignId)
        
        return NextResponse.json({
          success: true,
          message: 'Campaign started successfully',
          campaignRun,
          runId: campaignRun.id
        })

      case 'status':
        const runs = await campaignScheduler.getCampaignRuns(campaignId)
        const queueStatus = await campaignScheduler.getQueueStatus()
        
        return NextResponse.json({
          success: true,
          runs: runs.slice(0, 5), // Last 5 runs
          queueStatus
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "start" or "status"' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error running campaign:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to run campaign' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const campaignId = url.searchParams.get('campaignId')

    if (campaignId) {
      const runs = await campaignScheduler.getCampaignRuns(campaignId)
      return NextResponse.json({ success: true, runs })
    } else {
      const queueStatus = await campaignScheduler.getQueueStatus()
      return NextResponse.json({ success: true, queueStatus })
    }

  } catch (error) {
    console.error('Error getting campaign status:', error)
    return NextResponse.json(
      { error: 'Failed to get campaign status' },
      { status: 500 }
    )
  }
}
