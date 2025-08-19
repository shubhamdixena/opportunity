import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ScrapingSource } from '@/lib/types/scraping';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: sources, error } = await supabase
      .from('scraping_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sources:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(sources || []);
  } catch (error) {
    console.error('Error in GET /api/scraping/sources:', error);
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

    const { name, url, max_posts, is_active, source_type } = body;

    // Validate required fields
    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    const { data: source, error } = await supabase
      .from('scraping_sources')
      .insert([
        {
          name,
          url,
          max_posts: max_posts || 10,
          is_active: is_active ?? true,
          source_type: source_type || 'website',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating source:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/scraping/sources:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
