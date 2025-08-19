import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    console.log("[v0] Extracting content from:", url)

    // Fetch the HTML content with proper headers
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      timeout: 30000,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Remove unwanted elements
    $("script, style, nav, header, footer, aside, .sidebar, .menu, .navigation, .ads, .advertisement").remove()

    const extractedData = {
      title: "",
      content: "",
      excerpt: "",
      author: "",
      publishedDate: "",
      category: "",
      tags: [],
      url: url,
    }

    // Extract title - try multiple selectors
    const titleSelectors = [
      "h1.entry-title",
      "h1.post-title",
      "h1.article-title",
      ".entry-header h1",
      ".post-header h1",
      "article h1",
      "h1",
      "title",
    ]

    for (const selector of titleSelectors) {
      const title = $(selector).first().text().trim()
      if (title && title.length > 0) {
        extractedData.title = title
        break
      }
    }

    // Extract content - try multiple selectors for opportunitiescircle.com and similar sites
    const contentSelectors = [
      ".entry-content",
      ".post-content",
      ".article-content",
      ".content",
      "article .content",
      "article p",
      ".post-body",
      ".entry-body",
      "main article",
      "main .content",
      '[class*="content"]',
      "article",
    ]

    let content = ""
    for (const selector of contentSelectors) {
      const contentEl = $(selector)
      if (contentEl.length > 0) {
        // Get text content and preserve some structure
        content = contentEl
          .map((i, el) => {
            return $(el)
              .find("p, h1, h2, h3, h4, h5, h6, li, div")
              .map((j, child) => {
                return $(child).text().trim()
              })
              .get()
              .filter((text) => text.length > 20)
              .join("\n\n")
          })
          .get()
          .join("\n\n")

        if (content && content.length > 100) {
          break
        }
      }
    }

    // If no content found, try getting all paragraphs
    if (!content || content.length < 100) {
      content = $("p")
        .map((i, el) => $(el).text().trim())
        .get()
        .filter((text) => text.length > 20)
        .join("\n\n")
    }

    extractedData.content = content

    // Extract excerpt (first paragraph or meta description)
    let excerpt = $('meta[name="description"]').attr("content") || ""
    if (!excerpt) {
      const firstParagraph = $("p").first().text().trim()
      excerpt = firstParagraph.length > 160 ? firstParagraph.substring(0, 160) + "..." : firstParagraph
    }
    extractedData.excerpt = excerpt

    // Extract author
    const authorSelectors = [".author", ".post-author", ".entry-author", '[rel="author"]', ".byline", ".author-name"]

    for (const selector of authorSelectors) {
      const author = $(selector).first().text().trim()
      if (author && author.length > 0) {
        extractedData.author = author
        break
      }
    }

    // Extract published date
    const dateSelectors = ["time[datetime]", ".published", ".post-date", ".entry-date", ".date"]

    for (const selector of dateSelectors) {
      const dateEl = $(selector).first()
      const date = dateEl.attr("datetime") || dateEl.text().trim()
      if (date && date.length > 0) {
        extractedData.publishedDate = date
        break
      }
    }

    // Extract category
    const categorySelectors = [".category", ".post-category", ".entry-category", ".categories a", '[rel="category"]']

    for (const selector of categorySelectors) {
      const category = $(selector).first().text().trim()
      if (category && category.length > 0) {
        extractedData.category = category
        break
      }
    }

    // Extract tags
    const tagSelectors = [".tags a", ".post-tags a", ".entry-tags a", '[rel="tag"]']

    for (const selector of tagSelectors) {
      const tags = $(selector)
        .map((i, el) => $(el).text().trim())
        .get()
      if (tags.length > 0) {
        extractedData.tags = tags
        break
      }
    }

    console.log("[v0] Extracted data:", {
      title: extractedData.title.substring(0, 100),
      contentLength: extractedData.content.length,
      author: extractedData.author,
      category: extractedData.category,
    })

    // Validate that we got meaningful content
    if (!extractedData.title || extractedData.content.length < 50) {
      throw new Error("Could not extract meaningful content from the page")
    }

    return NextResponse.json(extractedData)
  } catch (error) {
    console.error("[v0] Content extraction error:", error)
    return NextResponse.json({ error: `Failed to extract content: ${error.message}` }, { status: 500 })
  }
}
