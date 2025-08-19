import { NextRequest, NextResponse } from 'next/server';
import { ScrapingService } from '@/lib/services/scraping-service-v2';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    const result = await ScrapingService.testSource(url);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test source' },
      { status: 500 }
    );
  }
}
