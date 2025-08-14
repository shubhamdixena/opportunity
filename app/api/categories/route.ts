import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCacheHeaders } from '@/lib/cache'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get category counts from opportunities
    const { data: categories, error } = await supabase
      .from('opportunities')
      .select('category')
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    // Count opportunities by category
    const categoryCounts: { [key: string]: number } = {}
    categories?.forEach((item) => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
    })

    // Define category metadata
    const categoryMetadata = {
      "Scholarships": {
        description: "Educational funding opportunities for students worldwide",
        icon: "BookOpen",
        href: "/categories/scholarships",
        featured: true,
      },
      "Competitions": {
        description: "Innovation and skill-based competitions",
        icon: "Trophy", 
        href: "/categories/competitions",
        featured: true,
      },
      "Internships": {
        description: "Professional development and work experience",
        icon: "Briefcase",
        href: "/categories/internships", 
        featured: true,
      },
      "Fellowships": {
        description: "Research and leadership development programs",
        icon: "Users",
        href: "/categories/fellowships",
        featured: false,
      },
      "Exchange Program": {
        description: "Cultural and academic exchange opportunities",
        icon: "Globe",
        href: "/categories/exchange",
        featured: false,
      },
      "Conferences": {
        description: "Academic and professional conferences",
        icon: "Calendar",
        href: "/categories/conferences",
        featured: false,
      },
      "Forum": {
        description: "Discussion forums and networking events",
        icon: "MessageSquare",
        href: "/categories/forum",
        featured: false,
      },
      "Misc": {
        description: "Other opportunities and miscellaneous programs",
        icon: "Zap",
        href: "/categories/misc",
        featured: false,
      }
    }

    // Combine counts with metadata
    const categoriesWithCounts = Object.entries(categoryMetadata).map(([name, meta]) => ({
      name,
      count: categoryCounts[name] || 0,
      ...meta,
    }))

    const response = NextResponse.json({
      categories: categoriesWithCounts,
      total: categories?.length || 0
    })

    // Categories change infrequently - use longer cache
    response.headers.set('Cache-Control', getCacheHeaders('CATEGORIES'))
    
    return response

  } catch (error) {
    console.error('Error in categories API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
