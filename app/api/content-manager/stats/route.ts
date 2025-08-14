import { NextResponse } from 'next/server'
import { getContentStats } from '@/lib/content-manager'

export async function GET() {
  try {
    const stats = await getContentStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching content stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content stats' },
      { status: 500 }
    )
  }
}
