import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'
import { instagramConfigured } from '@/lib/assistant/meta'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type SocialDraft = {
  id: string
  platform: string
  caption: string
  hashtags: string
  source_slug: string
  source_title: string
  status: string
  created_at: string
  image: string | null
}

type SentimentLog = {
  id: string
  analyzed_at: string
  total_reviews: number
  themes_positive: string
  themes_concern: string
  summary: string
  action_needed: boolean
}

type SeoReport = {
  id: string
  week_of: string
  summary: string
  action_items: string
  keyword_count: number
  competitor_alerts: string
  award_opportunities: string
  created_at: string
}

export async function GET() {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) {
    return NextResponse.json({ social_drafts: [], approved_drafts: [], sentiment: null, seo_report: null, configured: false, instagram_connected: false })
  }

  const [draftsResult, approvedResult, sentimentResult, seoResult] = await Promise.allSettled([
    select<SocialDraft>('social_drafts', { status: 'eq.draft', order: 'created_at.desc', limit: 20 }),
    select<SocialDraft>('social_drafts', { status: 'eq.approved', order: 'created_at.desc', limit: 20 }),
    select<SentimentLog>('review_sentiment_log', { order: 'analyzed_at.desc', limit: 1 }),
    select<SeoReport>('seo_reports', { order: 'created_at.desc', limit: 1 }),
  ])

  return NextResponse.json({
    social_drafts: draftsResult.status === 'fulfilled' ? draftsResult.value : [],
    approved_drafts: approvedResult.status === 'fulfilled' ? approvedResult.value : [],
    sentiment: sentimentResult.status === 'fulfilled' ? (sentimentResult.value[0] ?? null) : null,
    seo_report: seoResult.status === 'fulfilled' ? (seoResult.value[0] ?? null) : null,
    configured: true,
    instagram_connected: instagramConfigured(),
  })
}
