import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, insert } from '@/lib/assistant/db'
import { AGENT_MODEL } from '@/lib/assistant/model'
import { sendPush } from '@/lib/assistant/push'
import { withHeartbeat } from '@/lib/assistant/heartbeat'
import { blogPosts } from '@/lib/blog-posts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

async function authorised(req: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization') || ''
    if (auth === `Bearer ${cronSecret}`) return true
  }
  return isStaffAuthed()
}

type SocialDraft = {
  platform: 'instagram' | 'facebook'
  caption: string
  hashtags: string
  source_slug: string
  source_title: string
}

async function run() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'ANTHROPIC_API_KEY not set' })
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 14)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const sorted = [...blogPosts].sort((a, b) => b.datePublished.localeCompare(a.datePublished))
  const recent = sorted.filter((p) => p.datePublished >= cutoffStr)
  const posts = (recent.length > 0 ? recent : sorted).slice(0, 3)

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const drafts: SocialDraft[] = []
  const failedSlugs: string[] = []

  for (const post of posts) {
    try {
      const prompt = `You are writing social media captions for Visage Aesthetics, a nurse-led aesthetics clinic in Braintree, Essex run by Bernadette Tobin RGN MSc. British English. Clinical but warm. Educational, not salesy.

Blog post title: "${post.title}"
Excerpt: "${post.excerpt}"
Category: ${post.category}

Write:
1. An Instagram caption (max 140 characters, not counting hashtags). End with "Book at vaclinic.co.uk".
2. Five relevant Instagram hashtags.
3. A Facebook caption (max 250 characters). End with "Book a consultation at vaclinic.co.uk".

Return valid JSON only:
{"instagram":{"caption":"...","hashtags":["#tag1","#tag2","#tag3","#tag4","#tag5"]},"facebook":{"caption":"..."}}`

      const msg = await client.messages.create({
        model: AGENT_MODEL,
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      })

      const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) { failedSlugs.push(post.slug); continue }

      const parsed = JSON.parse(jsonMatch[0]) as {
        instagram: { caption: string; hashtags: string[] }
        facebook: { caption: string }
      }

      drafts.push({
        platform: 'instagram',
        caption: parsed.instagram.caption,
        hashtags: parsed.instagram.hashtags.join(', '),
        source_slug: post.slug,
        source_title: post.title,
      })
      drafts.push({
        platform: 'facebook',
        caption: parsed.facebook.caption,
        hashtags: '',
        source_slug: post.slug,
        source_title: post.title,
      })
    } catch {
      failedSlugs.push(post.slug)
    }
  }

  let saved = 0
  const unsaved: SocialDraft[] = []

  if (assistantConfigured()) {
    for (const draft of drafts) {
      try {
        await insert('social_drafts', {
          ...draft,
          status: 'draft',
          created_at: new Date().toISOString(),
        })
        saved++
      } catch {
        unsaved.push(draft)
      }
    }
  } else {
    unsaved.push(...drafts)
  }

  if (saved > 0) {
    await sendPush({
      title: `${saved} social draft${saved > 1 ? 's' : ''} ready`,
      body: `Captions drafted from ${posts.length} blog posts — review and approve`,
      url: '/staff/assistant/social',
    })
  }

  return NextResponse.json({
    ok: true,
    drafts_created: saved,
    posts: posts.map((p) => p.slug),
    ...(unsaved.length > 0 ? { unsaved_drafts: unsaved } : {}),
    ...(failedSlugs.length > 0 ? { failed: failedSlugs } : {}),
  })
}

export async function GET(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return withHeartbeat('social-content', () => run())
}

export async function POST(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}
