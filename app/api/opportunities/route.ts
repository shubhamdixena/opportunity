import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getConditionalCacheHeaders } from '@/lib/cache'

export async function getOpportunities({
  page = 1,
  limit = 10,
  category,
  search,
  status = "active",
  featured,
}: {
  page?: number
  limit?: number
  category?: string
  search?: string
  status?: string
  featured?: boolean
}) {
  const supabase = await createClient()

  let query = supabase
    .from("opportunities")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })

  if (category && category !== "all") {
    query = query.eq("category", category)
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,organization.ilike.%${search}%,about_opportunity.ilike.%${search}%`,
    )
  }

  if (featured) {
    query = query.eq("featured", true)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: opportunities, error, count } = await query.range(from, to)

  if (error) {
    console.error("Error fetching opportunities:", error)
    return { opportunities: [], pagination: {} }
  }

  return {
    opportunities: opportunities || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const status = searchParams.get("status") || "active"
    const featured = searchParams.has("featured")

    const { opportunities, pagination } = await getOpportunities({
      page,
      limit,
      category: category || undefined,
      search: search || undefined,
      status,
      featured,
    })

    const response = NextResponse.json({
      opportunities,
      pagination,
    })

    // Set conditional caching headers
    const hasFilters = category && category !== "all"
    response.headers.set(
      "Cache-Control",
      getConditionalCacheHeaders(!!search, hasFilters),
    )

    return response
  } catch (error) {
    console.error("Error in opportunities API:", error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Transform form data to database format
    const opportunityData = {
      title: body.title,
      organization: body.organization,
      category: body.category,
      location: body.location || null,
      funding_type: body.fundingType || null,
      eligible_countries: body.eligibleCountries ? body.eligibleCountries.split(',').map((c: string) => c.trim()) : [],
      tags: body.tags ? body.tags.split(',').map((t: string) => t.trim()) : [],
      featured: body.featured || false,
      about_opportunity: body.aboutOpportunity || null,
      requirements: body.requirements || null,
      how_to_apply: body.howToApply || null,
      what_you_get: body.whatYouGet || null,
      application_deadline: body.deadline ? new Date(body.deadline).toISOString() : null,
      start_date: body.programStartDate ? new Date(body.programStartDate).toISOString() : null,
      end_date: body.programEndDate ? new Date(body.programEndDate).toISOString() : null,
      contact_email: body.contactEmail || null,
      website_url: body.url || null,
      application_url: body.url || null,
      amounts: body.minAmount || body.maxAmount ? {
        min: body.minAmount ? parseFloat(body.minAmount) : null,
        max: body.maxAmount ? parseFloat(body.maxAmount) : null,
        currency: 'USD'
      } : {},
      status: 'active'
    }

    const { data, error } = await supabase
      .from('opportunities')
      .insert([opportunityData])
      .select()
      .single()

    if (error) {
      console.error('Error creating opportunity:', error)
      return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      opportunity: data,
      message: 'Opportunity created successfully' 
    })

  } catch (error) {
    console.error('Error in opportunity creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Opportunity ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('opportunities')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating opportunity:', error)
      return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      opportunity: data,
      message: 'Opportunity updated successfully' 
    })

  } catch (error) {
    console.error('Error in opportunity update:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Opportunity ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting opportunity:', error)
      return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Opportunity deleted successfully' 
    })

  } catch (error) {
    console.error('Error in opportunity deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
