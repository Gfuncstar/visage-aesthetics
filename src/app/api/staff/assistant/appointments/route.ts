import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'
import type { Appointment } from '@/lib/assistant/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/staff/assistant/appointments?scope=today|recent
// Recent appointments for the treatment tool's quick-pick, so the clinician
// taps an appointment instead of typing the client, treatment and date.
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ appointments: [], configured: false })
  }
  const scope = new URL(req.url).searchParams.get('scope') ?? 'recent'
  try {
    const query: Record<string, string | number> = { order: 'date.desc', limit: 60 }
    if (scope === 'today') {
      const today = new Date().toISOString().slice(0, 10)
      query.date = `eq.${today}`
    } else {
      // last ~45 days, exclude cancellations
      const since = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      query.and = `(date.gte.${since},status.neq.cancelled)`
    }
    const appointments = await select<Appointment>('appointments', query)
    return NextResponse.json({ appointments, configured: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not load appointments'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
