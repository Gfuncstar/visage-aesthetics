import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, insert, audit } from '@/lib/assistant/db'
import { blogPosts } from '@/lib/blog-posts'
import { metaConfigured, postToFacebook } from '@/lib/assistant/meta'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type Activity = { id: string; channel: string; title: string | null; detail: string | null; url: string | null; count: number | null; status: string; created_at: string }

// GET — the marketing arm overview: blogs published, emails sent, social posts,
// ads logged, plus whether Meta is connected.
export async function GET() {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ configured: false })

  try {
    const activity = await select<Activity>('marketing_activity', { order: 'created_at.desc', limit: 100 })
    const blogs = [...blogPosts]
      .sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1))
      .slice(0, 12)
      .map((p) => ({ slug: p.slug, title: p.title, category: p.category, datePublished: p.datePublished }))

    const emails = activity.filter((a) => a.channel === 'email')
    const social = activity.filter((a) => a.channel === 'social')
    const ads = activity.filter((a) => a.channel === 'ad')

    return NextResponse.json({
      configured: true,
      metaConnected: metaConfigured(),
      stats: { blogs: blogPosts.length, emails: emails.length, social: social.length, ads: ads.length },
      blogs,
      emails,
      social,
      ads,
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}

// POST — compose a social post to Meta, or log an advertising activity.
//   { kind: 'social', message, link? }
//   { kind: 'ad', title, detail?, url? }
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    if (body.kind === 'social') {
      const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : ''
      const link = typeof body.link === 'string' ? body.link.trim().slice(0, 500) : ''
      if (!message) return NextResponse.json({ error: 'Write something to post.' }, { status: 400 })

      if (metaConfigured()) {
        const r = await postToFacebook(message, link || null)
        await insert('marketing_activity', {
          channel: 'social', title: message.slice(0, 120), detail: message, url: link || null,
          status: r.ok ? 'done' : 'failed',
        })
        if (!r.ok) return NextResponse.json({ error: r.error || 'Post failed' }, { status: 502 })
        await audit('create', 'social_post', r.id)
        return NextResponse.json({ ok: true, posted: true })
      }
      // Not connected yet: save as a draft so nothing is lost.
      await insert('marketing_activity', { channel: 'social', title: message.slice(0, 120), detail: message, url: link || null, status: 'draft' })
      return NextResponse.json({ ok: true, posted: false, draft: true })
    }

    if (body.kind === 'ad') {
      const title = typeof body.title === 'string' ? body.title.trim().slice(0, 160) : ''
      if (!title) return NextResponse.json({ error: 'Give the advert a name.' }, { status: 400 })
      await insert('marketing_activity', {
        channel: 'ad', title,
        detail: typeof body.detail === 'string' ? body.detail.slice(0, 1000) : null,
        url: typeof body.url === 'string' ? body.url.slice(0, 500) : null,
        status: 'logged',
      })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Nothing to do.' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Save failed' }, { status: 502 })
  }
}
