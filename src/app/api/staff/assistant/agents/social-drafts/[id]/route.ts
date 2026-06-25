import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, update, insert, audit } from '@/lib/assistant/db'
import { CLINIC } from '@/lib/clinic'

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
}

const UUID_RE = /^[0-9a-f-]{36}$/i
const ALLOWED_STATUSES = new Set(['approved', 'posted', 'dismissed'])

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const { id } = await ctx.params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 })

  let body: { status?: unknown; caption?: unknown; hashtags?: unknown; image?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  // Build the patch — staff can edit the copy, set the image, change the status, or any mix.
  const patch: Record<string, unknown> = {}

  if (typeof body.caption === 'string') {
    const caption = body.caption.trim().slice(0, 2000)
    if (!caption) return NextResponse.json({ error: 'Caption cannot be empty' }, { status: 400 })
    patch.caption = caption
  }
  if (typeof body.hashtags === 'string') {
    patch.hashtags = body.hashtags.trim().slice(0, 500)
  }
  // Same-origin asset path only (e.g. /images/profhilo.jpg) — this is composited
  // into the branded image that gets published.
  if (typeof body.image === 'string' && body.image.startsWith('/')) {
    patch.image = body.image.slice(0, 300)
  }
  if (typeof body.status === 'string') {
    if (!ALLOWED_STATUSES.has(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    patch.status = body.status
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  // The `image` column is added by a migration that may not have run yet. Persist
  // it best-effort: try the full patch, and if the column is missing fall back to
  // the rest, so approval never breaks while the migration is pending.
  let rows: SocialDraft[]
  try {
    rows = await update<SocialDraft>('social_drafts', { id }, patch)
  } catch (err) {
    if ('image' in patch) {
      delete patch.image
      rows = Object.keys(patch).length ? await update<SocialDraft>('social_drafts', { id }, patch) : []
    } else {
      throw err
    }
  }
  const draft = rows[0]

  // When a draft is approved, mirror it into the marketing activity log so it
  // surfaces under Marketing → Social posts. Best-effort: a logging failure must
  // not fail the approval. 'approved' needs the widened status CHECK (same
  // migration); fall back to 'logged' (always allowed) if it hasn't run yet.
  if (patch.status === 'approved' && draft) {
    const caption = draft.caption ?? ''
    const detail = [caption, draft.hashtags].filter(Boolean).join('\n\n')
    const row = {
      channel: 'social',
      title: caption.slice(0, 120) || draft.source_title,
      detail,
      url: draft.source_slug ? `${CLINIC.url}/blog/${draft.source_slug}` : null,
    }
    try {
      await insert('marketing_activity', { ...row, status: 'approved' })
      await audit('create', 'social_post', draft.id)
    } catch {
      try {
        await insert('marketing_activity', { ...row, status: 'logged' })
        await audit('create', 'social_post', draft.id)
      } catch (err) {
        console.error('[agents] mirror approved draft to marketing failed', err)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
