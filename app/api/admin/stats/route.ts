import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get total counts
    const [opportunitiesCount, usersCount, categoriesCount] = await Promise.all([
      supabase.from('opportunities').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('opportunities').select('category').eq('status', 'active')
    ])

    // Get recent opportunities (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: recentOpportunities } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    // Get active vs inactive opportunities
    const [activeOpps, inactiveOpps] = await Promise.all([
      supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'inactive')
    ])

    // Count unique categories
    const uniqueCategories = new Set(categoriesCount.data?.map(item => item.category) || []).size

    const stats = {
      totalOpportunities: opportunitiesCount.count || 0,
      totalUsers: usersCount.count || 0,
      totalCategories: uniqueCategories,
      recentOpportunities: recentOpportunities?.count || 0,
      activeOpportunities: activeOpps.count || 0,
      inactiveOpportunities: inactiveOpps.count || 0,
      lastUpdated: new Date().toISOString()
    }

    const response = NextResponse.json(stats)
    
    // Admin stats can be cached briefly - 2 minutes
    response.headers.set('Cache-Control', 'private, max-age=120')
    
    return response

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}