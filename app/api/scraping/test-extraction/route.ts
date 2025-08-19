import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const testUrl = 'https://opportunitiesforyouth.org/2025/01/11/unhcr-internship-program-2022-fully-funded/';
    
    // Test our content extraction API
    const response = await fetch('http://localhost:3000/api/scraping/fetch-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: testUrl }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      url: testUrl,
      success: data.success,
      titleLength: data.data?.title?.length || 0,
      contentLength: data.data?.content?.length || 0,
      author: data.data?.author,
      title: data.data?.title,
      contentPreview: data.data?.content?.substring(0, 500) + '...',
      error: data.error
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
