import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    const supabase = await createClient()

    if (action === 'start') {
      // Get the campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('simple_campaign')
        .select('*')
        .single()

      if (campaignError || !campaign) {
        return NextResponse.json(
          { error: 'Campaign not found or not configured' },
          { status: 404 }
        )
      }

      if (!campaign.is_active) {
        return NextResponse.json(
          { error: 'Campaign is not active' },
          { status: 400 }
        )
      }

      if (!campaign.sources || campaign.sources.length === 0) {
        return NextResponse.json(
          { error: 'No sources configured for campaign' },
          { status: 400 }
        )
      }

      // Create a run record
      const runId = `run_${Date.now()}`
      const { data: run, error: runError } = await supabase
        .from('campaign_runs')
        .insert([{
          id: runId,
          campaign_id: campaign.id,
          status: 'running',
          sources: campaign.sources,
          started_at: new Date().toISOString(),
          total_sources: campaign.sources.length,
          processed_sources: 0,
          items_found: 0,
          items_created: 0
        }])
        .select()
        .single()

      if (runError) {
        throw runError
      }

      // Update campaign last_run
      await supabase
        .from('simple_campaign')
        .update({ last_run: new Date().toISOString() })
        .eq('id', campaign.id)

      // Here you would typically queue background jobs to process each source
      // For now, we'll return success with the run ID
      
      return NextResponse.json({
        success: true,
        message: 'Campaign started successfully',
        runId: run.id,
        sources: campaign.sources
      })

    } else if (action === 'stop') {
      // Stop any running campaigns
      const { error } = await supabase
        .from('campaign_runs')
        .update({
          status: 'stopped',
          completed_at: new Date().toISOString()
        })
        .eq('status', 'running')

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        message: 'Campaign stopped successfully'
      })

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error running campaign:', error)
    return NextResponse.json(
      { error: 'Failed to run campaign' },
      { status: 500 }
    )
  }
}

// Get campaign run status
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: currentRun, error } = await supabase
      .from('campaign_runs')
      .select('*')
      .eq('status', 'running')
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({
      success: true,
      currentRun: currentRun || null
    })

  } catch (error) {
    console.error('Error getting run status:', error)
    return NextResponse.json(
      { error: 'Failed to get run status' },
      { status: 500 }
    )
  }
}
