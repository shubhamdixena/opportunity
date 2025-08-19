import { NextResponse } from 'next/server';
import { ScrapingService } from '@/lib/services/scraping-service-v2';

export async function GET() {
  try {
    const scheduleConfig = await ScrapingService.getScheduleConfig();
    return NextResponse.json({ success: true, data: scheduleConfig });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schedule configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const scheduleConfig = await ScrapingService.updateScheduleConfig(body);
    return NextResponse.json({ success: true, data: scheduleConfig });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update schedule configuration' },
      { status: 500 }
    );
  }
}
