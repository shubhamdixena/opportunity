import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sourceId = searchParams.get('source_id');
    const status = searchParams.get('status');
    
    const offset = (page - 1) * limit;

    let query = supabase
      .from('scraped_opportunities')
      .select(`
        *,
        source:scraping_sources(id, name, url, source_type)
      `, { count: 'exact' })
      .order('scraped_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (sourceId) {
      query = query.eq('source_id', sourceId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: opportunities, error, count } = await query;

    if (error) {
      console.error('Error fetching scraped opportunities:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      opportunities: opportunities || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error in GET /api/scraping/opportunities:', error);
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

    const { 
      source_id, 
      raw_data, 
      title, 
      description, 
      url, 
      deadline,
      amount,
      location,
      organization 
    } = body;

    // Validate required fields
    if (!source_id || !raw_data) {
      return NextResponse.json(
        { error: 'Source ID and raw data are required' },
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

    const { data: opportunity, error } = await supabase
      .from('scraped_opportunities')
      .insert({
        source_id,
        raw_data,
        title,
        description,
        url,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        amount,
        location,
        organization,
        status: 'new',
      })
      .select(`
        *,
        source:scraping_sources(id, name, url, source_type)
      `)
      .single();

    if (error) {
      console.error('Error creating scraped opportunity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/scraping/opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll) {
      // Clear all scraped opportunities
      const { error } = await supabase
        .from('scraped_opportunities')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        console.error('Error clearing all opportunities:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        message: 'All scraped opportunities cleared successfully' 
      });
    }

    return NextResponse.json(
      { error: 'Invalid delete operation' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/scraping/opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
