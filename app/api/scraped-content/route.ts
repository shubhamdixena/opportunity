import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: scrapedContent, error } = await supabase
      .from("scraped_opportunities")
      .select("*")
      .order("scraped_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Error fetching scraped content:", error)
      return NextResponse.json({ error: "Failed to fetch scraped content" }, { status: 500 })
    }

    return NextResponse.json(scrapedContent)
  } catch (error) {
    console.error("Error in scraped content API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
