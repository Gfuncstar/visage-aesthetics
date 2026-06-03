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

// GET /api/staff/assistant/consent?q=...  or  ?client_id=...
// Lists completed consent forms for the staff backend, newest first.
export async function GET(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }
  if (!assistantConfigured()) {
    return NextResponse.json({ submissions: [], configured: false })
  }
  const params = new URL(req.url).searchParams
  const q = params.get('q')?.trim()
  const clientId = params.get('client_id')?.trim()

  try {
    const query: Record<string, string | number> = { order: 'submitted_at.desc', limit: 300 }
    if (clientId) query.client_id = `eq.${clientId}`
    else if (q) query.client_name = `ilike.*${q}*`
    const submissions = await select<ConsentSubmissionRow>('consent_submissions', query)
    return NextResponse.json({ submissions, configured: true })
  } catch (err) {
    // Most likely the table has not been created yet (migration not run).
    const msg = err instanceof Error ? err.message : 'Could not load consent forms'
    return NextResponse.json({ submissions: [], configured: true, error: msg })
  }
}
