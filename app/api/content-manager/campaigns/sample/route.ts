import { NextResponse } from 'next/server'
import { createContentCampaign, createContentSource } from '@/lib/content-manager'

export async function POST() {
  try {
    // Create sample sources for opportunities
    const sampleSources = [
      {
        name: 'Opportunity Desk',
        domain: 'opportunitydesk.org',
        is_active: true,
        keywords: ['scholarship', 'fellowship', 'grant', 'funding'],
        last_scraped: null,
        posts_found: 0,
        success_rate: 0
      },
      {
        name: 'Scholarship DB',
        domain: 'scholarshipdb.net',
        is_active: true,
        keywords: ['scholarship', 'education', 'funding', 'university'],
        last_scraped: null,
        posts_found: 0,
        success_rate: 0
      },
      {
        name: 'Study Portals',
        domain: 'studyportals.com',
        is_active: true,
        keywords: ['study abroad', 'scholarship', 'masters', 'phd'],
        last_scraped: null,
        posts_found: 0,
        success_rate: 0
      }
    ]

    const createdSources = []
    for (const source of sampleSources) {
      try {
        const createdSource = await createContentSource(source)
        createdSources.push(createdSource)
      } catch (error) {
        console.error('Failed to create source:', error)
      }
    }

    // Create sample campaigns
    const sampleCampaigns = [
      {
        name: 'Scholarship Opportunities',
        source_ids: createdSources.map(s => s.id),
        keywords: ['scholarship', 'funding', 'education', 'university', 'student'],
        category: 'Scholarships',
        frequency: 6,
        frequency_unit: 'hours' as const,
        is_active: true,
        max_posts: 20,
        current_posts: 0,
        filters: {
          min_length: 200,
          max_length: 5000,
          required_words: ['scholarship', 'apply'],
          banned_words: ['scam', 'fake', 'spam'],
          skip_duplicates: true
        },
        ai_settings: {
          rewrite: true,
          quality_check: true,
          seo_optimize: true,
          translate_to: undefined
        },
        post_template: {
          title_template: '{title} - {organization}',
          content_template: undefined,
          add_tags: true,
          set_category: true
        }
      },
      {
        name: 'Fellowship Programs',
        source_ids: createdSources.slice(0, 2).map(s => s.id),
        keywords: ['fellowship', 'research', 'academic', 'postdoc'],
        category: 'Fellowships',
        frequency: 12,
        frequency_unit: 'hours' as const,
        is_active: true,
        max_posts: 15,
        current_posts: 0,
        filters: {
          min_length: 300,
          max_length: 4000,
          required_words: ['fellowship', 'research'],
          banned_words: ['scam', 'fake'],
          skip_duplicates: true
        },
        ai_settings: {
          rewrite: true,
          quality_check: true,
          seo_optimize: true,
          translate_to: undefined
        },
        post_template: {
          title_template: '{title} - Research Fellowship',
          content_template: undefined,
          add_tags: true,
          set_category: true
        }
      },
      {
        name: 'Grant Opportunities',
        source_ids: createdSources.slice(1).map(s => s.id),
        keywords: ['grant', 'funding', 'startup', 'innovation', 'research'],
        category: 'Grants',
        frequency: 24,
        frequency_unit: 'hours' as const,
        is_active: false, // Start inactive
        max_posts: 10,
        current_posts: 0,
        filters: {
          min_length: 250,
          max_length: 3000,
          required_words: ['grant', 'funding'],
          banned_words: ['scam', 'fake', 'spam'],
          skip_duplicates: true
        },
        ai_settings: {
          rewrite: true,
          quality_check: true,
          seo_optimize: false,
          translate_to: undefined
        },
        post_template: {
          title_template: '{title} - Funding Opportunity',
          content_template: undefined,
          add_tags: true,
          set_category: true
        }
      }
    ]

    const createdCampaigns = []
    for (const campaign of sampleCampaigns) {
      try {
        const createdCampaign = await createContentCampaign(campaign)
        createdCampaigns.push(createdCampaign)
      } catch (error) {
        console.error('Failed to create campaign:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sample campaigns and sources created successfully',
      sources: createdSources.length,
      campaigns: createdCampaigns.length,
      data: {
        sources: createdSources,
        campaigns: createdCampaigns
      }
    })
  } catch (error) {
    console.error('Error creating sample data:', error)
    return NextResponse.json(
      { error: 'Failed to create sample campaigns' },
      { status: 500 }
    )
  }
}
