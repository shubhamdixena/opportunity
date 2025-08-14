import { NextResponse } from 'next/server'
import { createContentItemFromOpportunity } from '@/lib/content-manager'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createClient()
    
    // Get some recent opportunities
    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select('id, title, organization, category, about_opportunity, website_url, application_url')
      .eq('status', 'active')
      .limit(5)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    const results = []
    
    for (const opportunity of opportunities) {
      try {
        const contentItem = await createContentItemFromOpportunity(opportunity.id)
        results.push({
          opportunityId: opportunity.id,
          contentItemId: contentItem.id,
          title: opportunity.title,
          success: true
        })
      } catch (err) {
        results.push({
          opportunityId: opportunity.id,
          title: opportunity.title,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: 'Conversion completed',
      results,
      converted: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    })
  } catch (error) {
    console.error('Error converting opportunities:', error)
    return NextResponse.json(
      { error: 'Failed to convert opportunities' },
      { status: 500 }
    )
  }
}
