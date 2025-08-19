import { NextRequest, NextResponse } from 'next/server';
import { ScrapingService } from '@/lib/services/scraping-service-v2';

// GET /api/scraping - Get all scraping sources
export async function GET() {
  try {
    const sources = await ScrapingService.getSources();
    return NextResponse.json({ success: true, data: sources });
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }
}

// POST /api/scraping - Create new scraping source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const source = await ScrapingService.createSource(body);
    return NextResponse.json({ success: true, data: source });
  } catch (error) {
    console.error('Error creating source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create source' },
      { status: 500 }
    );
  }
}
