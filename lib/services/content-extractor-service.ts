export async function extractWebContent(url: string): Promise<{
  success: boolean
  data?: {
    title: string
    content: string
    htmlContent: string
    author?: string
    publishedAt?: string
    url: string
    extractedAt: string
  }
  error?: string
}> {
  try {
    console.log(`Extracting content from: ${url}`)

    const response = await fetch("/api/scraping/extract-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Content extraction failed")
    }

    return result
  } catch (error) {
    console.error("Error extracting content:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
