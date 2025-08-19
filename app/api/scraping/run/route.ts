import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Call the scheduled-scraper Edge Function directly
    const { data, error } = await supabase.functions.invoke('scheduled-scraper', {
      body: {}
    });

    if (error) {
      console.error('Edge function error:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to run scheduled scraper' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error running scheduled scraper:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run scheduled scraper' },
      { status: 500 }
    );
  }
}
