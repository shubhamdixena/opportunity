import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const { data: schedule, error } = await supabase
      .from('scraping_schedule')
      .select(`
        *,
        source:scraping_sources(id, name, url, source_type)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching schedule:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error in GET /api/scraping/schedule/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { schedule_config, is_active } = body;

    // Validate schedule config if provided
    if (schedule_config && !schedule_config.cron_expression) {
      return NextResponse.json(
        { error: 'CRON expression is required in schedule config' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (schedule_config !== undefined) updateData.schedule_config = schedule_config;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: schedule, error } = await supabase
      .from('scraping_schedule')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        source:scraping_sources(id, name, url, source_type)
      `)
      .single();

    if (error) {
      console.error('Error updating schedule:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error in PUT /api/scraping/schedule/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('scraping_schedule')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting schedule:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/scraping/schedule/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
