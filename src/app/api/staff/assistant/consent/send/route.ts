import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured } from '@/lib/assistant/db'
import { getConsentForm } from '@/lib/consent/forms'
import { sendConsentForm } from '@/lib/consent/send'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// POST { formId, clientName, clientEmail, bookingId? } — send a consent form to
// a client outside the booking system (e.g. when it was not completed). Creates
// a tracked request and emails the client a secure link.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'The clinic database is not configured.' }, { status: 503 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>

  const form = getConsentForm(String(b.formId ?? ''))
  if (!form) return NextResponse.json({ error: 'Unknown consent form.' }, { status: 400 })

  const result = await sendConsentForm({
    form,
    clientName: String(b.clientName ?? ''),
    clientEmail: String(b.clientEmail ?? ''),
    bookingId: typeof b.bookingId === 'string' && b.bookingId ? b.bookingId : null,
  })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  // Return the link so staff can copy it as a fallback if the email doesn't arrive.
  return NextResponse.json({ ok: true, link: result.link })
}
