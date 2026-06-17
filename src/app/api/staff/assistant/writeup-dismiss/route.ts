import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { recordDismissal } from '@/lib/assistant/writeup-dismissals'
import { audit } from '@/lib/assistant/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Persist a dismissed write-up reminder so it stays gone. Body: { name, date }.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  let body: { name?: unknown; date?: unknown }
  try {
    body = (await req.json()) as { name?: unknown; date?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 200) : ''
  const date = typeof body.date === 'string' ? body.date.slice(0, 10) : ''
  if (!name || !DATE_RE.test(date)) {
    return NextResponse.json({ error: 'A client name and visit date are required.' }, { status: 400 })
  }

  try {
    await recordDismissal(name, date)
    await audit('dismiss', 'writeup_dismissals', `${date}|${name.toLowerCase()}`)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not save the dismissal.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
