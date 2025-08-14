import { NextRequest, NextResponse } from 'next/server'
import { processContentWithAI, generateContentSuggestions, extractKeywords, generateMetaDescription } from '@/lib/ai/gemini'
import { createAIProcessingJob, updateAIProcessingJob, getContentItems, updateContentItem } from '@/lib/content-manager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'process_content':
        return await processContent(data)
      case 'generate_suggestions':
        return await generateSuggestions(data)
      case 'extract_keywords':
        return await extractContentKeywords(data)
      case 'generate_meta':
        return await generateContentMeta(data)
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in AI processing:', error)
    return NextResponse.json(
      { error: 'AI processing failed' },
      { status: 500 }
    )
  }
}

async function processContent(data: {
  contentItemId: string
  options: {
    rewrite?: boolean
    qualityCheck?: boolean
    seoOptimize?: boolean
    translateTo?: string
  }
}) {
  const { contentItemId, options } = data

  // Get content item
  const contentItems = await getContentItems({ limit: 1 })
  const contentItem = contentItems.find(item => item.id === contentItemId)
  
  if (!contentItem) {
    return NextResponse.json(
      { error: 'Content item not found' },
      { status: 404 }
    )
  }

  // Create AI processing job
  const job = await createAIProcessingJob({
    content_item_id: contentItemId,
    job_type: 'rewrite', // Primary job type
    input_data: {
      title: contentItem.title,
      content: contentItem.content || '',
      options
    },
    status: 'processing'
  })

  try {
    // Update content item status
    await updateContentItem(contentItemId, {
      status: 'processing',
      estimated_time: '2-5 min'
    })

    // Process with AI
    const result = await processContentWithAI(
      contentItem.content || '',
      contentItem.title,
      options
    )

    if (result.success && result.data) {
      // Update job with results
      await updateAIProcessingJob(job.id, {
        status: 'completed',
        output_data: result.data,
        processing_time_ms: result.processingTime,
        model_used: 'gemini-1.5-flash'
      })

      // Update content item with processed content
      const updates: any = {
        status: 'scheduled',
        ai_processed: true,
        estimated_time: undefined
      }

      if (result.data.rewrittenContent) {
        updates.content = result.data.rewrittenContent
      }

      await updateContentItem(contentItemId, updates)

      return NextResponse.json({
        success: true,
        data: result.data,
        jobId: job.id
      })
    } else {
      // Update job with error
      await updateAIProcessingJob(job.id, {
        status: 'failed',
        error_message: result.error,
        processing_time_ms: result.processingTime
      })

      // Update content item status
      await updateContentItem(contentItemId, {
        status: 'failed',
        error_message: result.error,
        estimated_time: undefined
      })

      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    // Update job with error
    await updateAIProcessingJob(job.id, {
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    })

    // Update content item status
    await updateContentItem(contentItemId, {
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      estimated_time: undefined
    })

    throw error
  }
}

async function generateSuggestions(data: {
  topic: string
  category: string
  targetAudience?: string
}) {
  const { topic, category, targetAudience } = data
  const result = await generateContentSuggestions(topic, category, targetAudience)
  
  return NextResponse.json(result)
}

async function extractContentKeywords(data: {
  content: string
}) {
  const { content } = data
  const result = await extractKeywords(content)
  
  return NextResponse.json(result)
}

async function generateContentMeta(data: {
  title: string
  content: string
}) {
  const { title, content } = data
  const result = await generateMetaDescription(title, content)
  
  return NextResponse.json(result)
}
