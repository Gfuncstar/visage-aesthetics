import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'
import type { Appointment } from '@/lib/assistant/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/staff/assistant/appointments?date=YYYY-MM-DD   (a single day, default today)
//   or ?scope=recent                                       (last 45 days)
// Powers the treatment tool's quick-pick: at the end of clinic, pick the day
// (today by default) and tap who came in.
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ appointments: [], configured: false })
  }
  const params = new URL(req.url).searchParams
  const scope = params.get('scope')
  const dateParam = params.get('date')?.trim()
  try {
    const query: Record<string, string | number> = { limit: 100 }
    if (scope === 'recent') {
      const since = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      query.and = `(date.gte.${since},status.neq.cancelled)`
      query.order = 'date.desc'
    } else {
      // A single day (default today). Exclude cancellations; order by client.
      const day =
        dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
          ? dateParam
          : new Date().toISOString().slice(0, 10)
      query.date = `eq.${day}`
      query.status = 'neq.cancelled'
      query.order = 'client_name.asc'
    }
    const appointments = await select<Appointment>('appointments', query)
    return NextResponse.json({ appointments, configured: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not load appointments'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
