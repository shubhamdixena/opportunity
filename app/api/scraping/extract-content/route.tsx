export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 })
    }

    console.log(`Server-side content extraction for: ${url}`)

    // Fetch the webpage content server-side to avoid CORS issues
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OpportunityBot/1.0; +https://opportunityhub.com/bot)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    console.log(`Fetched HTML length: ${html.length} characters`)

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].replace(/&[^;]+;/g, " ").trim() : "No title found"

    // Extract author - improved patterns
    const authorPatterns = [
      /Posted by\s+([^|\n<]+)/i,
      /By\s+([A-Za-z\s]+)/i,
      /Author[:\s]+([A-Za-z\s]+)/i,
      /<meta\s+name=["']author["']\s+content=["']([^"']+)["']/i,
      /<span[^>]*class[^>]*author[^>]*>([^<]+)</i,
    ]

    let author = undefined
    for (const pattern of authorPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        author = match[1].trim()
        break
      }
    }

    // Extract main content - improved approach
    let content = html

    // Remove scripts, styles, and other non-content elements
    content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    content = content.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    content = content.replace(/<!--[\s\S]*?-->/g, "")

    // Try to extract main content areas first
    const contentSelectors = [
      /<main[^>]*>([\s\S]*?)<\/main>/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*class[^>]*content[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class[^>]*post[^>]*>([\s\S]*?)<\/div>/i,
    ]

    let mainContent = null
    for (const selector of contentSelectors) {
      const match = content.match(selector)
      if (match && match[1] && match[1].length > 200) {
        mainContent = match[1]
        break
      }
    }

    // Use main content if found, otherwise use full body
    if (mainContent) {
      content = mainContent
    }

    // Remove all HTML tags
    content = content.replace(/<[^>]*>/g, " ")

    // Decode HTML entities
    content = content.replace(/&nbsp;/g, " ")
    content = content.replace(/&amp;/g, "&")
    content = content.replace(/&lt;/g, "<")
    content = content.replace(/&gt;/g, ">")
    content = content.replace(/&quot;/g, '"')
    content = content.replace(/&#39;/g, "'")
    content = content.replace(/&[a-zA-Z0-9#]+;/g, " ") // Remove other entities

    // Clean up whitespace
    content = content.replace(/\s+/g, " ").trim()

    console.log(`Final extracted content length: ${content.length} characters`)

    if (content.length < 50) {
      throw new Error("Insufficient content could be extracted from the page")
    }

    const extractedData = {
      title: title,
      content: content,
      htmlContent: html,
      author: author,
      publishedAt: undefined,
      url: url,
      extractedAt: new Date().toISOString(),
    }

    return Response.json({
      success: true,
      data: extractedData,
    })
  } catch (error) {
    console.error("Server-side content extraction error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
