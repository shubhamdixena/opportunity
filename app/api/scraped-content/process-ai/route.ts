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

    // Update status to processed with AI data
    await supabase
      .from("scraped_opportunities")
      .update({
        processing_status: "processed",
        ai_confidence_score: result.confidence || 0,
      })
      .eq("id", id)

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
