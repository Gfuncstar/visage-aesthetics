import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, update, audit } from '@/lib/assistant/db'
import { instagramConfigured, postToInstagram } from '@/lib/assistant/meta'
import { CLINIC } from '@/lib/clinic'
import { blogPosts } from '@/lib/blog-posts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type SocialDraft = {
  id: string
  platform: string
  caption: string
  hashtags: string | null
  source_slug: string | null
  source_title: string | null
  status: string
  image: string | null
}

const UUID_RE = /^[0-9a-f-]{36}$/i
const CATEGORY_BY_SLUG: Record<string, string> = Object.fromEntries(
  blogPosts.map((p) => [p.slug, p.category]),
)

/** The branded /og image (photo + copy) as a public, absolute URL for Meta to fetch. */
function brandedImageUrl(draft: SocialDraft): string {
  const params = new URLSearchParams({
    title: draft.source_title || CLINIC.name,
    eyebrow: (draft.source_slug && CATEGORY_BY_SLUG[draft.source_slug]) || `${CLINIC.name}, ${CLINIC.addressLocality}`,
    img: draft.image || '/images/clinic-wide.jpg',
  })
  return `${CLINIC.url}/og?${params.toString()}`
}

// POST — publish an already-approved draft live to Instagram. The "confirm" half
// of the stage-then-confirm flow: approval signs the post off; this publishes it.
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  if (!instagramConfigured()) return NextResponse.json({ error: 'Instagram is not connected.' }, { status: 503 })

  const { id } = await ctx.params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 })

  const rows = await select<SocialDraft>('social_drafts', { id: `eq.${id}`, limit: 1 })
  const draft = rows[0]
  if (!draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
  if (draft.status === 'posted') return NextResponse.json({ error: 'Already posted' }, { status: 409 })
  if (draft.status !== 'approved') return NextResponse.json({ error: 'Only approved drafts can be published' }, { status: 409 })

  const caption = [draft.caption, draft.hashtags].filter(Boolean).join('\n\n')
  const result = await postToInstagram(caption, brandedImageUrl(draft))
  if (!result.ok) {
    return NextResponse.json({ error: result.error || 'Instagram post failed' }, { status: 502 })
  }

  await update('social_drafts', { id }, { status: 'posted' })
  // Reflect the live publish in the marketing log (best-effort).
  try {
    await update(
      'marketing_activity',
      { channel: 'social', title: (draft.caption || draft.source_title || '').slice(0, 120), status: 'approved' },
      { status: 'posted' },
    )
    await audit('publish', 'social_post', draft.id, { platform: 'instagram', media_id: result.id })
  } catch (err) {
    console.error('[agents] post-publish bookkeeping failed', err)
  }

  return NextResponse.json({ ok: true, id: result.id })
}
