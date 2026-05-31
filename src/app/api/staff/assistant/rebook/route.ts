import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, insertMany, audit } from '@/lib/assistant/db'
import { dueRebookings, recallDays } from '@/lib/assistant/rebook'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// GET — clients about due to come back, most overdue first.
export async function GET() {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ items: [], configured: false })
  try {
    const items = await dueRebookings()
    return NextResponse.json({ items, configured: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}

// POST { markKey, action } — mark a nudge contacted (reappears next cycle) or
// dismissed (hidden for a year). The snooze window is derived server-side.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  let markKey = ''
  let action = ''
  try {
    const b = (await req.json()) as { markKey?: unknown; action?: unknown }
    if (typeof b.markKey === 'string') markKey = b.markKey.slice(0, 300)
    if (b.action === 'contacted' || b.action === 'dismissed') action = b.action
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!markKey || !action) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  // Snooze: contacted -> until the next recall cycle; dismissed -> a year.
  const group = markKey.split('|')[1] ?? ''
  const days = action === 'contacted' ? recallDays(group) ?? 120 : 365
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + days)
  const snoozeUntil = d.toISOString().slice(0, 10)

  try {
    await insertMany('rebook_marks', [{ mark_key: markKey, action, snooze_until: snoozeUntil }], {
      onConflict: 'mark_key',
    })
    await audit('update', 'rebook_mark', markKey, { action, snoozeUntil })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Save failed' }, { status: 502 })
  }
}
