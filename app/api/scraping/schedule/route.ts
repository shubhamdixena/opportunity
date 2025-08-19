import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: schedules, error } = await supabase
      .from('scraping_schedule')
      .select(`
        *,
        source:scraping_sources(id, name, url, source_type)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching schedules:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(schedules || []);
  } catch (error) {
    console.error('Error in GET /api/scraping/schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { source_id, schedule_config, is_active } = body;

    // Validate required fields
    if (!source_id || !schedule_config) {
      return NextResponse.json(
        { error: 'Source ID and schedule config are required' },
        { status: 400 }
      );
    }

    // Validate schedule config structure
    if (!schedule_config.cron_expression) {
      return NextResponse.json(
        { error: 'CRON expression is required in schedule config' },
        { status: 400 }
      );
    }

    // Check if source exists
    const { data: source, error: sourceError } = await supabase
      .from('scraping_sources')
      .select('id')
      .eq('id', source_id)
      .single();

    if (sourceError || !source) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      );
    }

    const { data: schedule, error } = await supabase
      .from('scraping_schedule')
      .insert({
        source_id,
        schedule_config,
        is_active: is_active ?? true,
      })
      .select(`
        *,
        source:scraping_sources(id, name, url, source_type)
      `)
      .single();

    if (error) {
      console.error('Error creating schedule:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/scraping/schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
