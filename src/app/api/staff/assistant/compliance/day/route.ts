import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured } from '@/lib/assistant/db'
import { dayCompliance } from '@/lib/assistant/day-compliance'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// GET ?date=YYYY-MM-DD — the day's consent-compliance wash-up: a percentage and
// the outstanding items to action.
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ percent: 100, total: 0, compliant: 0, outstanding: [] })

  const date = new URL(req.url).searchParams.get('date') ?? ''
  if (!DATE_RE.test(date)) return NextResponse.json({ error: 'Bad date' }, { status: 400 })

  try {
    const result = await dayCompliance(date)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not check' }, { status: 502 })
  }
}
