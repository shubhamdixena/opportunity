import { createClient } from "@/lib/supabase/server"
import { HomePage } from "@/components/home-page"
import { Navigation } from "@/components/navigation"
import type { Opportunity } from "@/components/opportunity-card"

async function getOpportunities(): Promise<Opportunity[]> {
  try {
    const supabase = await createClient()
    const { data: opportunities, error } = await supabase
      .from("opportunities")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching opportunities:", error)
      return []
    }

    // Transform database data to match Opportunity interface
    return (
      opportunities?.map((opp: any) => ({
        id: opp.id.toString(),
        title: opp.title,
        organization: opp.organization,
        description: opp.description,
        category: opp.category,
        location: opp.location,
        deadline: opp.deadline,
        amount:
          opp.amount_min && opp.amount_max
            ? `${opp.amount_min} - ${opp.amount_max}`
            : opp.amount_min || opp.amount_max || "Not specified",
        tags: opp.tags || [],
        url: opp.url,
        featured: opp.featured || false,
      })) || []
    )
  } catch (error) {
    console.error("Error in getOpportunities:", error)
    return []
  }
}

export default async function App() {
  const opportunities = await getOpportunities()

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage="home" showSearch={false} />
      <HomePage featuredOpportunities={opportunities} />
    </div>
  )
}
