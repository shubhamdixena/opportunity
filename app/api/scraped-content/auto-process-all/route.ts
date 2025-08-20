import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get all raw scraped content
    const { data: rawContent, error: fetchError } = await supabase
      .from("scraped_opportunities")
      .select("*")
      .eq("processing_status", "raw")
      .limit(50) // Process max 50 at a time

    if (fetchError) {
      throw new Error(`Failed to fetch raw content: ${fetchError.message}`)
    }

    if (!rawContent || rawContent.length === 0) {
      return NextResponse.json({ message: "No raw content to process", totalProcessed: 0 })
    }

    let processed = 0
    let posted = 0

    for (const content of rawContent) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = `
        Extract structured opportunity data from this scraped content. Return ONLY valid JSON:

        {
          "title": "extracted title",
          "organization": "extracted organization name",
          "description": "brief description (max 300 chars)",
          "category": "Scholarship|Fellowship|Grant|Competition|Internship|Exchange Program|Forum|Misc",
          "location": "extracted location or 'Global'",
          "deadline": "YYYY-MM-DD format or 'Ongoing'",
          "amount": "extracted amount or 'Varies'",
          "tags": "comma-separated relevant tags",
          "aboutOpportunity": "detailed description",
          "requirements": "eligibility requirements",
          "howToApply": "application process",
          "whatYouGet": "benefits and rewards",
          "fundingType": "Full Funding|Partial Funding|No Funding|Varies",
          "eligibleCountries": "eligible countries or 'All Countries'"
        }

        Content to process:
        Title: ${content.name}
        Content: ${content.content_text || content.details || ""}
        Source: ${content.post_url}
        `

        const result = await model.generateContent(prompt)
        const responseText = result.response.text()

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error("No valid JSON found in AI response")
        }

        const processedData = JSON.parse(jsonMatch[0])

        // Create opportunity directly
        const { data: opportunity, error: opportunityError } = await supabase
          .from("opportunities")
          .insert({
            title: processedData.title,
            organization: processedData.organization,
            description: processedData.description,
            category: processedData.category,
            location: processedData.location,
            deadline: processedData.deadline === "Ongoing" ? null : processedData.deadline,
            amount: processedData.amount,
            url: content.post_url,
            tags: processedData.tags.split(",").map((tag: string) => tag.trim()),
            about_opportunity: processedData.aboutOpportunity,
            requirements: processedData.requirements,
            how_to_apply: processedData.howToApply,
            what_you_get: processedData.whatYouGet,
            funding_type: processedData.fundingType,
            eligible_countries: processedData.eligibleCountries,
            featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (opportunityError) {
          throw new Error(`Failed to create opportunity: ${opportunityError.message}`)
        }

        // Update scraped content status to posted
        await supabase
          .from("scraped_opportunities")
          .update({
            processing_status: "posted",
            ai_confidence_score: 0.85,
            opportunity_id: opportunity.id,
          })
          .eq("id", content.id)

        processed++
        posted++
      } catch (error) {
        console.error(`Failed to process content ${content.id}:`, error)

        // Mark as failed
        await supabase.from("scraped_opportunities").update({ processing_status: "failed" }).eq("id", content.id)
      }
    }

    return NextResponse.json({
      message: `Processed ${processed} items, posted ${posted} opportunities`,
      totalProcessed: processed,
      totalPosted: posted,
    })
  } catch (error) {
    console.error("Error in auto-process-all:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
