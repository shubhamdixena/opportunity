import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

export interface AIProcessingOptions {
  rewrite?: boolean
  qualityCheck?: boolean
  seoOptimize?: boolean
  translateTo?: string
}

export interface AIProcessingResult {
  success: boolean
  data?: {
    rewrittenContent?: string
    qualityScore?: number
    qualityFeedback?: string
    seoSuggestions?: string[]
    translatedContent?: string
    improvements?: string[]
  }
  error?: string
  processingTime?: number
}

export async function processContentWithAI(
  content: string,
  title: string,
  options: AIProcessingOptions
): Promise<AIProcessingResult> {
  const startTime = Date.now()

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const results: any = {}

    // Content Rewriting
    if (options.rewrite) {
      const rewritePrompt = `
        Rewrite the following content to be more engaging, clear, and professional while maintaining the original meaning and key information:
        
        Title: ${title}
        Content: ${content}
        
        Requirements:
        - Keep all important details and facts
        - Make it more engaging and readable
        - Maintain professional tone
        - Ensure clarity and flow
        - Return only the rewritten content without any additional text or formatting
      `

      const rewriteResult = await model.generateContent(rewritePrompt)
      const rewrittenText = rewriteResult.response.text()
      results.rewrittenContent = rewrittenText.trim()
    }

    // Quality Check
    if (options.qualityCheck) {
      const qualityPrompt = `
        Analyze the quality of this content and provide a score from 1-10 and detailed feedback:
        
        Title: ${title}
        Content: ${content}
        
        Evaluate based on:
        - Clarity and readability
        - Completeness of information
        - Professional tone
        - Grammar and spelling
        - Structure and organization
        
        Respond in JSON format:
        {
          "score": <number from 1-10>,
          "feedback": "<detailed feedback>",
          "improvements": ["<suggestion 1>", "<suggestion 2>", ...]
        }
      `

      const qualityResult = await model.generateContent(qualityPrompt)
      try {
        const qualityData = JSON.parse(qualityResult.response.text())
        results.qualityScore = qualityData.score
        results.qualityFeedback = qualityData.feedback
        results.improvements = qualityData.improvements || []
      } catch (parseError) {
        results.qualityScore = 7 // Default score if parsing fails
        results.qualityFeedback = qualityResult.response.text()
        results.improvements = []
      }
    }

    // SEO Optimization
    if (options.seoOptimize) {
      const seoPrompt = `
        Provide SEO optimization suggestions for this content:
        
        Title: ${title}
        Content: ${content}
        
        Analyze and suggest improvements for:
        - Title optimization
        - Meta description
        - Keyword optimization
        - Content structure
        - Readability
        
        Respond with a JSON array of specific, actionable suggestions:
        ["<suggestion 1>", "<suggestion 2>", ...]
      `

      const seoResult = await model.generateContent(seoPrompt)
      try {
        results.seoSuggestions = JSON.parse(seoResult.response.text())
      } catch (parseError) {
        // Fallback: split text into suggestions
        results.seoSuggestions = seoResult.response.text()
          .split('\n')
          .filter(line => line.trim().length > 0)
          .slice(0, 5) // Limit to 5 suggestions
      }
    }

    // Translation
    if (options.translateTo) {
      const translatePrompt = `
        Translate the following content to ${options.translateTo}. Maintain the original meaning, tone, and formatting:
        
        Title: ${title}
        Content: ${content}
        
        Return only the translated content without any additional text.
      `

      const translateResult = await model.generateContent(translatePrompt)
      results.translatedContent = translateResult.response.text().trim()
    }

    const processingTime = Date.now() - startTime

    return {
      success: true,
      data: results,
      processingTime
    }
  } catch (error) {
    const processingTime = Date.now() - startTime
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      processingTime
    }
  }
}

export async function generateContentSuggestions(
  topic: string,
  category: string,
  targetAudience?: string
): Promise<{
  success: boolean
  suggestions?: string[]
  error?: string
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `
      Generate 5 engaging content suggestions for the following:
      
      Topic: ${topic}
      Category: ${category}
      ${targetAudience ? `Target Audience: ${targetAudience}` : ''}
      
      Requirements:
      - Relevant to the topic and category
      - Engaging and clickable titles
      - Suitable for the target audience
      - Unique and creative approaches
      
      Return as a JSON array of strings:
      ["<suggestion 1>", "<suggestion 2>", ...]
    `

    const result = await model.generateContent(prompt)
    
    try {
      const suggestions = JSON.parse(result.response.text())
      return {
        success: true,
        suggestions
      }
    } catch (parseError) {
      // Fallback: split text into suggestions
      const suggestions = result.response.text()
        .split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 5)
      
      return {
        success: true,
        suggestions
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function extractKeywords(content: string): Promise<{
  success: boolean
  keywords?: string[]
  error?: string
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `
      Extract the most important keywords and phrases from this content:
      
      ${content}
      
      Requirements:
      - Extract 10-15 most relevant keywords
      - Include both single words and key phrases
      - Focus on main topics and concepts
      - Avoid common words (the, and, or, etc.)
      
      Return as a JSON array of strings:
      ["keyword1", "keyword2", "key phrase", ...]
    `

    const result = await model.generateContent(prompt)
    
    try {
      const keywords = JSON.parse(result.response.text())
      return {
        success: true,
        keywords
      }
    } catch (parseError) {
      // Fallback: split text and clean up
      const keywords = result.response.text()
        .split('\n')
        .map(line => line.trim().replace(/^[-•*]\s*/, ''))
        .filter(line => line.length > 0)
        .slice(0, 15)
      
      return {
        success: true,
        keywords
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function generateMetaDescription(title: string, content: string): Promise<{
  success: boolean
  metaDescription?: string
  error?: string
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `
      Generate a compelling meta description for this content:
      
      Title: ${title}
      Content: ${content.substring(0, 500)}...
      
      Requirements:
      - 150-160 characters maximum
      - Engaging and click-worthy
      - Includes main keywords
      - Summarizes the content value
      - No quotation marks or special formatting
      
      Return only the meta description text.
    `

    const result = await model.generateContent(prompt)
    const metaDescription = result.response.text().trim()
    
    return {
      success: true,
      metaDescription: metaDescription.substring(0, 160) // Ensure max length
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export interface OpportunityExtractionResult {
  success: boolean
  data?: any
  error?: string
  confidence?: number
  validationErrors?: string[]
  extractedFields?: string[]
  processingTime?: number
}

export async function extractOpportunityData(
  title: string,
  content: string,
  sourceUrl: string
): Promise<OpportunityExtractionResult> {
  const startTime = Date.now()
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `
Extract structured opportunity information from this content and format it as JSON according to our opportunity schema.

CONTENT TO ANALYZE:
Title: ${title}
URL: ${sourceUrl}
Content: ${content}

REQUIRED OUTPUT FORMAT (JSON only, no additional text):
{
  "title": "Clear, engaging title (max 100 chars)",
  "organization": "Organization/Company name",
  "description": "Brief 2-3 sentence description (max 300 chars)",
  "category": "Scholarships|Fellowships|Grants|Conferences|Competitions|Exchange Program|Forum|Misc",
  "location": "Location or 'Global'",
  "deadline": "YYYY-MM-DD format or descriptive text",
  "amount": "Funding amount with currency or 'Variable'",
  "tags": "comma,separated,relevant,keywords",
  "url": "${sourceUrl}",
  "featured": false,
  "aboutOpportunity": "Detailed description (200-1000 words)",
  "requirements": "Detailed eligibility requirements",
  "howToApply": "Step-by-step application process",
  "whatYouGet": "Benefits, funding details, what recipients receive",
  "programStartDate": "YYYY-MM-DD or empty",
  "programEndDate": "YYYY-MM-DD or empty", 
  "contactEmail": "Contact email if found or empty",
  "eligibilityAge": "Age requirements if specified or empty",
  "languageRequirements": "Language requirements if any or empty",
  "fundingType": "Full Funding|Partial Funding|Prize Money|Stipend|Grant|Variable Amount",
  "eligibleCountries": "Countries/regions eligible or 'Global'",
  "minAmount": "Minimum amount if range specified or empty",
  "maxAmount": "Maximum amount if range specified or empty"
}

EXTRACTION RULES:
1. Use ONLY information present in the content - never make up information
2. Choose the most appropriate category from the provided options
3. Format dates as YYYY-MM-DD when possible, otherwise use descriptive text
4. Extract comprehensive information for aboutOpportunity, requirements, howToApply, whatYouGet
5. If information is missing, use empty string ""
6. Ensure all text is clean, professional, and well-formatted
7. Tags should be 5-10 relevant keywords separated by commas
8. Amount should include currency symbol when available
9. Description should be concise but informative
10. aboutOpportunity should be detailed and comprehensive

Return ONLY the JSON object, no markdown formatting or additional text.
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text().trim()
    
    try {
      // Clean up the response to ensure it's valid JSON
      const jsonText = responseText
        .replace(/```json\n?|\n?```/g, '')
        .replace(/^[^{]*{/, '{')
        .replace(/}[^}]*$/, '}')
        .trim()
      
      const extractedData = JSON.parse(jsonText)
      
      // Validate and calculate confidence
      const { validateExtractionData } = await import('@/lib/validation')
      const validation = validateExtractionData(extractedData)
      
      // Ensure URL is preserved
      extractedData.url = sourceUrl
      
      // Set default values for missing fields
      extractedData.featured = extractedData.featured || false
      extractedData.category = extractedData.category || 'Misc'
      extractedData.fundingType = extractedData.fundingType || 'Variable Amount'
      extractedData.eligibleCountries = extractedData.eligibleCountries || 'Global'
      extractedData.location = extractedData.location || 'Global'
      
      const processingTime = Date.now() - startTime
      
      return {
        success: validation.isValid,
        data: extractedData,
        confidence: validation.confidence,
        validationErrors: validation.errors,
        extractedFields: validation.extractedFields,
        processingTime
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', responseText)
      
      const processingTime = Date.now() - startTime
      
      return {
        success: false,
        error: `Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`,
        processingTime
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
