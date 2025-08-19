import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { scrapedId, opportunityData } = await request.json()

    if (!scrapedId || !opportunityData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Create new opportunity
    const { data: opportunity, error: opportunityError } = await supabase
      .from("opportunities")
      .insert([
        {
          title: opportunityData.title,
          organization: opportunityData.organization,
          details: opportunityData.description,
          category: opportunityData.category,
          location: opportunityData.location,
          application_deadline: opportunityData.deadline !== "" ? opportunityData.deadline : null,
          amounts: opportunityData.amount ? { single: opportunityData.amount } : null,
          tags: opportunityData.tags ? opportunityData.tags.split(",").map((tag: string) => tag.trim()) : [],
          about_opportunity: opportunityData.aboutOpportunity,
          requirements: opportunityData.requirements,
          how_to_apply: opportunityData.howToApply,
          what_you_get: opportunityData.whatYouGet,
          funding_type: opportunityData.fundingType,
          eligible_countries: opportunityData.eligibleCountries ? [opportunityData.eligibleCountries] : [],
          min_amount: opportunityData.minAmount || null,
          max_amount: opportunityData.maxAmount || null,
          language_requirements: opportunityData.languageRequirements || null,
          eligibility_age: opportunityData.eligibilityAge || null,
          program_start_date: opportunityData.programStartDate || null,
          program_end_date: opportunityData.programEndDate || null,
          contact_email: opportunityData.contactEmail || null,
          application_url: opportunityData.url,
          website_url: opportunityData.url,
          featured: false,
          status: "active",
        },
      ])
      .select()
      .single()

    if (opportunityError) {
      console.error("Error creating opportunity:", opportunityError)
      return NextResponse.json({ error: "Failed to create opportunity" }, { status: 500 })
    }

    // Update scraped content status
    await supabase
      .from("scraped_opportunities")
      .update({
        processing_status: "converted",
        opportunity_id: opportunity.id,
      })
      .eq("id", scrapedId)

    return NextResponse.json({
      success: true,
      opportunityId: opportunity.id,
      message: "Successfully converted to opportunity",
    })
  } catch (error) {
    console.error("Error converting to opportunity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
