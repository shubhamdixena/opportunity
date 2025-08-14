import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateSourceConfig } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: sources, error } = await supabase
      .from('content_sources')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      sources: sources || []
    })

  } catch (error) {
    console.error('Error fetching sources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the source configuration
    const validation = validateSourceConfig(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: `Validation failed: ${validation.errors.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Check if domain already exists
    const { data: existingSource } = await supabase
      .from('content_sources')
      .select('id')
      .eq('domain', body.domain)
      .single()

    if (existingSource) {
      return NextResponse.json(
        { error: 'A source with this domain already exists' },
        { status: 409 }
      )
    }

    // Create the source
    const { data: source, error } = await supabase
      .from('content_sources')
      .insert([{
        name: body.name,
        domain: body.domain,
        is_active: body.is_active ?? true,
        keywords: body.keywords || [],
        scraping_config: body.scraping_config || {},
        posts_found: 0,
        success_rate: 0
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      source
    })

  } catch (error) {
    console.error('Error creating source:', error)
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 }
    )
  }
}
