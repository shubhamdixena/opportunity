import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const { data: opportunity, error } = await supabase
      .from('scraped_opportunities')
      .select(`
        *,
        source:scraping_sources(id, name, url, source_type),
        converted_opportunity:opportunities(id, title, slug)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching scraped opportunity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!opportunity) {
      return NextResponse.json({ error: 'Scraped opportunity not found' }, { status: 404 });
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Error in GET /api/scraping/opportunities/[id]:', error);
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

    const { 
      status, 
      title, 
      description, 
      url, 
      deadline,
      amount,
      location,
      organization,
      converted_opportunity_id,
      processing_notes 
    } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (url !== undefined) updateData.url = url;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline).toISOString() : null;
    if (amount !== undefined) updateData.amount = amount;
    if (location !== undefined) updateData.location = location;
    if (organization !== undefined) updateData.organization = organization;
    if (converted_opportunity_id !== undefined) updateData.converted_opportunity_id = converted_opportunity_id;
    if (processing_notes !== undefined) updateData.processing_notes = processing_notes;

    const { data: opportunity, error } = await supabase
      .from('scraped_opportunities')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        source:scraping_sources(id, name, url, source_type),
        converted_opportunity:opportunities(id, title, slug)
      `)
      .single();

    if (error) {
      console.error('Error updating scraped opportunity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!opportunity) {
      return NextResponse.json({ error: 'Scraped opportunity not found' }, { status: 404 });
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error('Error in PUT /api/scraping/opportunities/[id]:', error);
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
      .from('scraped_opportunities')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting scraped opportunity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/scraping/opportunities/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
