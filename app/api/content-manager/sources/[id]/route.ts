import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateSourceConfig } from '@/lib/validation'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const sourceId = params.id
    
    // Validate the source configuration
    const validation = validateSourceConfig(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: `Validation failed: ${validation.errors.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Check if domain already exists for a different source
    const { data: existingSource } = await supabase
      .from('content_sources')
      .select('id')
      .eq('domain', body.domain)
      .neq('id', sourceId)
      .single()

    if (existingSource) {
      return NextResponse.json(
        { error: 'A source with this domain already exists' },
        { status: 409 }
      )
    }

    // Update the source
    const { data: source, error } = await supabase
      .from('content_sources')
      .update({
        name: body.name,
        domain: body.domain,
        is_active: body.is_active ?? true,
        keywords: body.keywords || [],
        scraping_config: body.scraping_config || {},
        updated_at: new Date().toISOString()
      })
      .eq('id', sourceId)
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
    console.error('Error updating source:', error)
    return NextResponse.json(
      { error: 'Failed to update source' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sourceId = params.id
    const supabase = await createClient()

    // Check if source is being used in any campaigns
    const { data: campaigns } = await supabase
      .from('content_campaigns')
      .select('id, name')
      .contains('source_ids', [sourceId])

    if (campaigns && campaigns.length > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete source. It is being used in ${campaigns.length} campaign(s): ${campaigns.map(c => c.name).join(', ')}` 
        },
        { status: 409 }
      )
    }

    // Delete the source
    const { error } = await supabase
      .from('content_sources')
      .delete()
      .eq('id', sourceId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Source deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting source:', error)
    return NextResponse.json(
      { error: 'Failed to delete source' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sourceId = params.id
    const supabase = await createClient()

    const { data: source, error } = await supabase
      .from('content_sources')
      .select('*')
      .eq('id', sourceId)
      .single()

    if (error) {
      throw error
    }

    if (!source) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      source
    })

  } catch (error) {
    console.error('Error fetching source:', error)
    return NextResponse.json(
      { error: 'Failed to fetch source' },
      { status: 500 }
    )
  }
}
