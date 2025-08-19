export async function extractWebContent(url: string): Promise<{
  success: boolean;
  data?: {
    title: string;
    content: string;
    htmlContent: string;
    author?: string;
    publishedAt?: string;
    url: string;
    extractedAt: string;
  };
  error?: string;
}> {
  try {
    console.log(`Extracting content from: ${url}`);

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Fetched HTML length: ${html.length} characters`);

    // Extract title - simple approach
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/&[^;]+;/g, ' ').trim() : 'No title found';
    
    // Extract author - simple patterns
    const authorPatterns = [
      /Posted by\s+([^|\n<]+)/i,
      /By\s+([A-Za-z\s]+)/i,
      /Author[:\s]+([A-Za-z\s]+)/i
    ];
    
    let author = undefined;
    for (const pattern of authorPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        author = match[1].trim();
        break;
      }
    }

    // Extract content - very simple approach: remove scripts/styles, then extract all text
    let content = html;
    
    // Remove scripts and styles
    content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    content = content.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
    
    // Remove all HTML tags
    content = content.replace(/<[^>]*>/g, ' ');
    
    // Decode basic HTML entities
    content = content.replace(/&nbsp;/g, ' ');
    content = content.replace(/&amp;/g, '&');
    content = content.replace(/&lt;/g, '<');
    content = content.replace(/&gt;/g, '>');
    content = content.replace(/&quot;/g, '"');
    content = content.replace(/&#39;/g, "'");
    
    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim();

    console.log(`Final extracted content length: ${content.length} characters`);
    console.log(`Content preview: ${content.substring(0, 200)}...`);

    if (content.length === 0) {
      throw new Error('No content could be extracted from the page');
    }

    const extractedData = {
      title: title,
      content: content,
      htmlContent: html,
      author: author,
      publishedAt: undefined, // Simplified for now
      url: url,
      extractedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: extractedData
    };

  } catch (error) {
    console.error('Error extracting content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
