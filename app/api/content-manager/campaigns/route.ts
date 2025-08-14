import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateCampaignConfig } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: campaigns, error } = await supabase
      .from('content_campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns || []
    })

  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the campaign configuration
    const validation = validateCampaignConfig(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: `Validation failed: ${validation.errors.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Verify all source IDs exist and are active
    if (body.source_ids && body.source_ids.length > 0) {
      const { data: sources, error: sourcesError } = await supabase
        .from('content_sources')
        .select('id, name, is_active')
        .in('id', body.source_ids)

      if (sourcesError) {
        throw sourcesError
      }

      if (!sources || sources.length !== body.source_ids.length) {
        return NextResponse.json(
          { error: 'One or more source IDs are invalid' },
          { status: 400 }
        )
      }

      const inactiveSources = sources.filter(s => !s.is_active)
      if (inactiveSources.length > 0) {
        return NextResponse.json(
          { error: `Cannot use inactive sources: ${inactiveSources.map(s => s.name).join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Create the campaign
    const { data: campaign, error } = await supabase
      .from('content_campaigns')
      .insert([{
        name: body.name,
        source_ids: body.source_ids || [],
        keywords: body.keywords || [],
        category: body.category || 'Misc',
        frequency: body.frequency || 6,
        frequency_unit: body.frequency_unit || 'hours',
        is_active: true,
        max_posts: body.max_posts || 50,
        current_posts: 0,
        filters: body.filters || {},
        ai_settings: body.ai_settings || {},
        post_template: body.post_template || {}
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      campaign
    })

  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}