import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SimpleCampaign {
  id?: string
  name: string
  sources: string[] // Array of URLs
  ai_prompt: string
  frequency: number
  frequency_unit: 'hours' | 'days'
  category: string
  is_active: boolean
  created_at?: string
  updated_at?: string
  last_run?: string
}

// Get the single campaign
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: campaign, error } = await supabase
      .from('simple_campaign')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error
    }

    // If no campaign exists, return default structure
    if (!campaign) {
      return NextResponse.json({
        success: true,
        campaign: {
          name: 'Content Discovery Campaign',
          sources: [],
          ai_prompt: 'Summarize the following content and extract key information.',
          frequency: 6,
          frequency_unit: 'hours',
          category: 'General',
          is_active: false
        }
      })
    }

    return NextResponse.json({
      success: true,
      campaign
    })

  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

// Create or update the single campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // Validate required fields
    if (!body.name || !body.ai_prompt) {
      return NextResponse.json(
        { error: 'Name and AI prompt are required' },
        { status: 400 }
      )
    }

    // Check if campaign exists
    const { data: existingCampaign } = await supabase
      .from('simple_campaign')
      .select('id')
      .single()

    const campaignData = {
      name: body.name,
      sources: body.sources || [],
      ai_prompt: body.ai_prompt,
      frequency: body.frequency || 6,
      frequency_unit: body.frequency_unit || 'hours',
      category: body.category || 'General',
      is_active: body.is_active || false,
      updated_at: new Date().toISOString()
    }

    let campaign
    if (existingCampaign) {
      // Update existing campaign
      const { data, error } = await supabase
        .from('simple_campaign')
        .update(campaignData)
        .eq('id', existingCampaign.id)
        .select()
        .single()

      if (error) throw error
      campaign = data
    } else {
      // Create new campaign
      const { data, error } = await supabase
        .from('simple_campaign')
        .insert([{
          ...campaignData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      campaign = data
    }

    return NextResponse.json({
      success: true,
      campaign
    })

  } catch (error) {
    console.error('Error saving campaign:', error)
    return NextResponse.json(
      { error: 'Failed to save campaign' },
      { status: 500 }
    )
  }
}
