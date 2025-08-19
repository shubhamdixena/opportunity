import { NextRequest, NextResponse } from 'next/server';
import { ScrapingService } from '@/lib/services/scraping-service-v2';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const source = await ScrapingService.updateSource(params.id, body);
    return NextResponse.json({ success: true, data: source });
  } catch (error) {
    console.error('Error updating source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update source' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ScrapingService.deleteSource(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete source' },
      { status: 500 }
    );
  }
}
