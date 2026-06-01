import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, update, audit } from '@/lib/assistant/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f-]{36}$/i
const STATUSES = new Set(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])

// PATCH { status } — update a booking's status from the diary.
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const { id } = await ctx.params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 })
  let status = ''
  try {
    const b = (await req.json()) as { status?: unknown }
    if (typeof b.status === 'string' && STATUSES.has(b.status)) status = b.status
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!status) return NextResponse.json({ error: 'Bad status' }, { status: 400 })
  try {
    await update('bookings', { id }, { status })
    await audit('update', 'booking', id, { status })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Update failed' }, { status: 502 })
  }
}
