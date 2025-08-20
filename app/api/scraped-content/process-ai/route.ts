import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { extractOpportunityData } from "@/lib/ai/gemini"

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
      // Create opportunity from AI-processed data
      const opportunityData = {
        title: result.data.title || title,
        organization: result.data.organization || "Unknown Organization",
        about_opportunity: result.data.description || content.substring(0, 1000),
        requirements: result.data.requirements || "Please check the original source for requirements",
        how_to_apply: result.data.applicationProcess || "Please visit the original source to apply",
        what_you_get: result.data.benefits || "Please check the original source for benefits",
        category: result.data.category || "Scholarship",
        location: result.data.location || "Various",
        funding_type: result.data.fundingType || "Full Funding",
        amounts: result.data.amounts || { type: "full", value: "TBD" },
        eligible_countries: result.data.eligibleCountries || ["Global"],
        tags: result.data.tags || [],
        application_deadline: result.data.deadline ? new Date(result.data.deadline).toISOString() : null,
        application_url: result.data.applicationUrl || sourceUrl,
        website_url: sourceUrl,
        contact_email: result.data.contactEmail || null,
        contact_phone: result.data.contactPhone || null,
        featured: false,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

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
