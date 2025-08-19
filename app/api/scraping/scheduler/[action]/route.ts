import { type NextRequest, NextResponse } from "next/server"
import { ScrapingScheduler } from "@/lib/services/scraping-scheduler"

export async function POST(request: NextRequest, { params }: { params: { action: string } }) {
  try {
    const { action } = params
    const scheduler = ScrapingScheduler.getInstance()

    if (action === "start") {
      await scheduler.startScheduler()
      return NextResponse.json({ message: "Scheduler started successfully" })
    } else if (action === "stop") {
      scheduler.stopScheduler()
      return NextResponse.json({ message: "Scheduler stopped successfully" })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error(`Error in ${params.action} scheduler:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
