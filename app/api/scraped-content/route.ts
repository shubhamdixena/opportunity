import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "3")
    const offset = (page - 1) * limit

    const supabase = await createClient()

    const { data: scrapedContent, error } = await supabase
      .from("scraped_opportunities")
      .select("*")
      .order("scraped_at", { ascending: false })
      .range(offset, offset + limit - 1)

    const { count, error: countError } = await supabase
      .from("scraped_opportunities")
      .select("*", { count: "exact", head: true })

    if (error || countError) {
      console.error("Error fetching scraped content:", error || countError)
      return NextResponse.json({ error: "Failed to fetch scraped content" }, { status: 500 })
    }

    return NextResponse.json({
      data: scrapedContent,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error in scraped content API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    const supabase = await createClient()

    if (action === "cleanup-empty") {
      const { data: deletedItems, error } = await supabase
        .from("scraped_opportunities")
        .delete()
        .or("details.is.null,details.eq.")
        .select()

      if (error) {
        console.error("Error cleaning up empty entries:", error)
        return NextResponse.json({ error: "Failed to cleanup entries" }, { status: 500 })
      }

      return NextResponse.json({
        message: `Deleted ${deletedItems?.length || 0} entries with empty details`,
        deletedCount: deletedItems?.length || 0,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in cleanup API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
