import { createClient } from "@/lib/supabase/server"
import { HomePage } from "@/components/home-page"
import { Navigation } from "@/components/navigation"
import type { Opportunity } from "@/components/opportunity-card"
import { getCategories } from "@/lib/data"

async function getOpportunities(): Promise<Opportunity[]> {
  try {
    const supabase = await createClient()

    console.log("[v0] Fetching opportunities from database...")

    const { data: opportunities, error } = await supabase
      .from("opportunities")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("[v0] Error fetching opportunities:", error)
      return []
    }

    console.log("[v0] Found opportunities in database:", opportunities?.length || 0)
    if (opportunities && opportunities.length > 0) {
      console.log("[v0] Sample opportunity:", {
        title: opportunities[0].title,
        organization: opportunities[0].organization,
        created_at: opportunities[0].created_at,
      })
    }

    // Transform database data to match Opportunity interface
    return (
      opportunities?.map((opp: any) => ({
        id: opp.id.toString(),
        title: opp.title,
        organization: opp.organization,
        description: opp.about_opportunity || opp.details || "No description available",
        category: opp.category,
        location: opp.location,
        deadline: opp.application_deadline,
        amount:
          opp.amounts?.min && opp.amounts?.max
            ? `${opp.amounts.min} - ${opp.amounts.max}`
            : opp.amounts?.value || "Not specified",
        tags: opp.tags || [],
        url: opp.application_url || opp.website_url,
        featured: opp.featured || false,
      })) || []
    )
  } catch (error) {
    console.error("[v0] Error in getOpportunities:", error)
    return []
  }
}

// Enable static generation with revalidation for better performance
export const revalidate = 300 // 5 minutes

export default async function Page() {
  const opportunities = await getOpportunities()
  const featuredOpportunities = opportunities.filter((opp) => opp.featured).slice(0, 3)
  const categories = await getCategories()

  console.log("[v0] Passing to homepage:", {
    totalOpportunities: opportunities.length,
    featuredCount: featuredOpportunities.length,
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="home" showSearch={false} />
      <HomePage
        featuredOpportunities={featuredOpportunities}
        categories={categories}
        allOpportunities={opportunities}
      />
    </div>
  )
}
