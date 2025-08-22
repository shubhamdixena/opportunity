import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { extractOpportunityData } from "@/lib/ai/gemini"

function formatArrayField(value: any): string[] {
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    // Handle comma-separated strings and convert to array
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  }
  return []
}

function formatDateField(dateValue: any): string | null {
  if (!dateValue) return null

  try {
    // Try parsing as ISO date first
    const date = new Date(dateValue)
    if (!isNaN(date.getTime())) {
      return date.toISOString()
    }
  } catch (error) {
    // If parsing fails, return null instead of invalid date
    console.warn("Invalid date format:", dateValue)
  }

  return null
}

function formatAmountsField(aiData: any): any {
  // Handle different amount formats from AI
  if (aiData.minAmount && aiData.maxAmount) {
    return {
      type: "range",
      min: aiData.minAmount,
      max: aiData.maxAmount,
    }
  } else if (aiData.amount) {
    return {
      type: "single",
      value: aiData.amount,
    }
  }
  return { type: "single", value: "TBD" }
}

function normalizeFundingType(fundingType: string): string {
  if (!fundingType) return "Variable Amount"

  const normalized = fundingType.toLowerCase().trim()

  // Map common AI responses to valid database values
  if (normalized.includes("full") || normalized.includes("fully")) {
    return "Fully Funded"
  } else if (normalized.includes("partial")) {
    return "Partially Funded"
  } else if (normalized.includes("scholarship")) {
    return "Scholarship"
  } else if (normalized.includes("stipend")) {
    return "Stipend"
  } else if (normalized.includes("prize") || normalized.includes("award")) {
    return "Prize Money"
  } else if (normalized.includes("grant")) {
    return "Grant"
  } else {
    return "Variable Amount"
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, title, content, sourceUrl } = await request.json()

    if (!id || !title || !content || !sourceUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Update status to processing
    await supabase.from("scraped_opportunities").update({ processing_status: "processing" }).eq("id", id)

    // Process with AI
    const result = await extractOpportunityData(title, content, sourceUrl)

    if (!result.success) {
      // Update status to failed
      await supabase
        .from("scraped_opportunities")
        .update({
          processing_status: "failed",
          other_details: result.error,
        })
        .eq("id", id)

      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    try {
      const opportunityData = {
        title: result.data.title || title,
        organization: result.data.organization || "Unknown Organization",
        about_opportunity: result.data.aboutOpportunity || result.data.description || content.substring(0, 1000),
        requirements: result.data.requirements || "Please check the original source for requirements",
        how_to_apply: result.data.howToApply || "Please visit the original source to apply",
        what_you_get: result.data.whatYouGet || "Please check the original source for benefits",
        category: result.data.category || "Misc",
        location: result.data.location || "Global",
        funding_type: normalizeFundingType(result.data.fundingType || result.data.funding_type || "Variable Amount"),
        amounts: formatAmountsField(result.data),
        eligible_countries: formatArrayField(result.data.eligibleCountries || "Global"),
        tags: formatArrayField(result.data.tags || ""),
        application_deadline: formatDateField(result.data.deadline),
        program_start_date: formatDateField(result.data.programStartDate),
        program_end_date: formatDateField(result.data.programEndDate),
        application_url: result.data.url || sourceUrl,
        website_url: sourceUrl,
        contact_email: result.data.contactEmail || null,
        contact_phone: result.data.contactPhone || null,
        eligibility_age: result.data.eligibilityAge || null,
        language_requirements: result.data.languageRequirements || null,
        featured: false,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("[v0] Formatted opportunity data:", JSON.stringify(opportunityData, null, 2))

      const { data: opportunityResult, error: opportunityError } = await supabase
        .from("opportunities")
        .insert([opportunityData])
        .select()
        .single()

      if (opportunityError) {
        console.error("Error creating opportunity:", opportunityError)
        // Update status to processed but note the posting error
        await supabase
          .from("scraped_opportunities")
          .update({
            processing_status: "processed",
            ai_confidence_score: result.confidence || 0,
            other_details: `AI processed successfully but failed to post: ${opportunityError.message}`,
          })
          .eq("id", id)
      } else {
        // Update status to posted with opportunity ID
        await supabase
          .from("scraped_opportunities")
          .update({
            processing_status: "posted",
            ai_confidence_score: result.confidence || 0,
            opportunity_id: opportunityResult.id,
          })
          .eq("id", id)

        console.log("Successfully created and posted opportunity:", opportunityResult.title)
      }
    } catch (postError) {
      console.error("Error posting opportunity:", postError)
      // Update status to processed if posting fails
      await supabase
        .from("scraped_opportunities")
        .update({
          processing_status: "processed",
          ai_confidence_score: result.confidence || 0,
          other_details: `AI processed successfully but failed to post: ${postError}`,
        })
        .eq("id", id)
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      confidence: result.confidence || 0,
      processingTime: result.processingTime,
    })
  } catch (error) {
    console.error("Error processing content with AI:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
