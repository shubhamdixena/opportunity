import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: source, error } = await supabase.from("scraping_sources").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching source:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 })
    }

    return NextResponse.json(source)
  } catch (error) {
    console.error("Error in GET /api/scraping/sources/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { name, url, max_posts, is_active, source_type } = body

    const { data: source, error } = await supabase
      .from("scraping_sources")
      .update({
        name,
        url,
        max_posts,
        is_active,
        source_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating source:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 })
    }

    return NextResponse.json(source)
  } catch (error) {
    console.error("Error in PUT /api/scraping/sources/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: source, error } = await supabase
      .from("scraping_sources")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating source:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 })
    }

    return NextResponse.json(source)
  } catch (error) {
    console.error("Error in PATCH /api/scraping/sources/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("scraping_sources").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting source:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/scraping/sources/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
