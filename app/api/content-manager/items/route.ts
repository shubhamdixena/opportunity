import { NextRequest, NextResponse } from 'next/server'
import { getContentItems, createContentItem, updateContentItem, bulkUpdateContentItems } from '@/lib/content-manager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const source_name = searchParams.get('source_name') || undefined
    const campaign_id = searchParams.get('campaign_id') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined

    const filters = {
      status,
      source_name,
      campaign_id,
      limit,
      offset
    }

    const items = await getContentItems(filters)
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching content items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const item = await createContentItem(body)
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating content item:', error)
    return NextResponse.json(
      { error: 'Failed to create content item' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Content item ID is required' },
        { status: 400 }
      )
    }
    
    const item = await updateContentItem(id, updates)
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating content item:', error)
    return NextResponse.json(
      { error: 'Failed to update content item' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, updates } = body
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Content item IDs are required' },
        { status: 400 }
      )
    }
    
    await bulkUpdateContentItems(ids, updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error bulk updating content items:', error)
    return NextResponse.json(
      { error: 'Failed to bulk update content items' },
      { status: 500 }
    )
  }
}
