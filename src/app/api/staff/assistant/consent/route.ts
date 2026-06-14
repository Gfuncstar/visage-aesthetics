import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export type ConsentSubmissionRow = {
  id: string
  booking_id: string | null
  client_id: string | null
  client_name: string
  client_email: string | null
  service_name: string | null
  form_id: string
  form_name: string
  answers: Record<string, string | string[]>
  declaration: string
  agreed: boolean
  submitted_at: string
}

export type ConsentRequestSummary = {
  id: string
  form_id: string
  form_name: string
  client_name: string
  client_email: string | null
  booking_id: string | null
  status: string
  created_at: string
}

// GET /api/staff/assistant/consent?q=...  or  ?client_id=...
// Lists completed consent forms plus any outstanding (sent, not yet completed)
// requests for the staff backend, newest first.
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ submissions: [], outstanding: [], configured: false })
  }
  const params = new URL(req.url).searchParams
  const q = params.get('q')?.trim()
  const clientId = params.get('client_id')?.trim()

  let submissions: ConsentSubmissionRow[] = []
  let outstanding: ConsentRequestSummary[] = []
  let error: string | undefined

  try {
    const query: Record<string, string | number> = { order: 'submitted_at.desc', limit: 300 }
    if (clientId) query.client_id = `eq.${clientId}`
    else if (q) query.client_name = `ilike.*${q}*`
    submissions = await select<ConsentSubmissionRow>('consent_submissions', query)
  } catch (err) {
    error = err instanceof Error ? err.message : 'Could not load consent forms'
  }

  // Outstanding manually-sent forms (only when not filtering by a single client).
  if (!clientId) {
    try {
      const rq: Record<string, string | number> = { status: 'eq.sent', order: 'created_at.desc', limit: 300 }
      if (q) rq.client_name = `ilike.*${q}*`
      const rows = await select<ConsentRequestSummary>('consent_requests', rq)
      // A booking can have more than one outstanding 'sent' request (an initial
      // send plus a pre-appointment chase). Show each booking once — the newest,
      // since rows are ordered created_at desc — so the list isn't doubled up.
      // Requests with no booking (ad-hoc manual sends) are always kept.
      const seenBooking = new Set<string>()
      outstanding = rows.filter((r) => {
        if (!r.booking_id) return true
        if (seenBooking.has(r.booking_id)) return false
        seenBooking.add(r.booking_id)
        return true
      })
    } catch {
      /* table may not exist yet */
    }
  }

  return NextResponse.json({ submissions, outstanding, configured: true, error })
}
