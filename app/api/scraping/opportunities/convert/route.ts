import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Batch convert scraped opportunities to regular opportunities
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { scraped_opportunity_ids, category_id, auto_approve = false } = body;

    // Validate required fields
    if (!scraped_opportunity_ids || !Array.isArray(scraped_opportunity_ids) || scraped_opportunity_ids.length === 0) {
      return NextResponse.json(
        { error: 'Array of scraped opportunity IDs is required' },
        { status: 400 }
      );
    }

    if (!category_id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Fetch the scraped opportunities
    const { data: scrapedOpportunities, error: fetchError } = await supabase
      .from('scraped_opportunities')
      .select('*')
      .in('id', scraped_opportunity_ids)
      .eq('status', 'new');

    if (fetchError) {
      console.error('Error fetching scraped opportunities:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!scrapedOpportunities || scrapedOpportunities.length === 0) {
      return NextResponse.json(
        { error: 'No new scraped opportunities found with provided IDs' },
        { status: 404 }
      );
    }

    // Convert each scraped opportunity to a regular opportunity
    const conversions = [];
    const errors = [];

    for (const scrapedOpp of scrapedOpportunities) {
      try {
        // Create slug from title
        const slug = scrapedOpp.title
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `opportunity-${Date.now()}`;

        // Create the opportunity
        const { data: newOpportunity, error: createError } = await supabase
          .from('opportunities')
          .insert({
            title: scrapedOpp.title || 'Untitled Opportunity',
            description: scrapedOpp.description || '',
            url: scrapedOpp.url,
            deadline: scrapedOpp.deadline,
            amount: scrapedOpp.amount,
            location: scrapedOpp.location,
            organization: scrapedOpp.organization,
            category_id,
            slug,
            is_featured: false,
            status: auto_approve ? 'published' : 'draft',
          })
          .select()
          .single();

        if (createError) {
          console.error(`Error creating opportunity for scraped ID ${scrapedOpp.id}:`, createError);
          errors.push({ scraped_id: scrapedOpp.id, error: createError.message });
          continue;
        }

        // Update the scraped opportunity status
        const { error: updateError } = await supabase
          .from('scraped_opportunities')
          .update({
            status: 'converted',
            converted_opportunity_id: newOpportunity.id,
            processing_notes: `Converted to opportunity ID: ${newOpportunity.id}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', scrapedOpp.id);

        if (updateError) {
          console.error(`Error updating scraped opportunity ${scrapedOpp.id}:`, updateError);
          errors.push({ scraped_id: scrapedOpp.id, error: updateError.message });
        } else {
          conversions.push({
            scraped_opportunity_id: scrapedOpp.id,
            new_opportunity_id: newOpportunity.id,
            title: newOpportunity.title,
            slug: newOpportunity.slug,
          });
        }
      } catch (error) {
        console.error(`Error processing scraped opportunity ${scrapedOpp.id}:`, error);
        errors.push({ 
          scraped_id: scrapedOpp.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      conversions,
      errors,
      total_requested: scraped_opportunity_ids.length,
      total_converted: conversions.length,
      total_errors: errors.length,
    });

  } catch (error) {
    console.error('Error in POST /api/scraping/opportunities/convert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
