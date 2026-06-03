import { NextResponse } from 'next/server'
import { assistantConfigured, select, insert, audit } from '@/lib/assistant/db'
import { consentFormForService, sanitiseAnswers } from '@/lib/consent/forms'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f-]{36}$/i

type ConsentSubmission = {
  id: string
  booking_id: string
  submitted_at: string
}

async function loadBooking(token: string): Promise<Booking | null> {
  const rows = await select<Booking>('bookings', { manage_token: `eq.${token}`, limit: 1 })
  return rows[0] ?? null
}

async function existingSubmission(bookingId: string): Promise<ConsentSubmission | null> {
  try {
    const rows = await select<ConsentSubmission>('consent_submissions', {
      booking_id: `eq.${bookingId}`,
      select: 'id,booking_id,submitted_at',
      order: 'submitted_at.desc',
      limit: 1,
    })
    return rows[0] ?? null
  } catch {
    // Table may not exist yet (migration not run). Treat as "no submission".
    return null
  }
}

// GET — booking + which form is needed + whether it is already done. Powers the
// public consent page. Token-gated; returns only a minimal public view.
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Unavailable' }, { status: 503 })
  const { token } = await ctx.params
  if (!UUID_RE.test(token)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    const booking = await loadBooking(token)
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const form = consentFormForService(booking.service_slug, booking.service_name)
    const done = await existingSubmission(booking.id)
    return NextResponse.json({
      clientName: booking.client_name,
      serviceName: booking.service_name,
      startsAt: booking.starts_at,
      formId: form?.id ?? null,
      alreadySubmitted: Boolean(done),
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}

// POST — a client submits their consent form. Stored against the booking (and,
// where we can resolve it by email, the client record) in the clinic database.
export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Consent storage is not configured yet.' }, { status: 503 })
  }
  const { token } = await ctx.params
  if (!UUID_RE.test(token)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>

  try {
    const booking = await loadBooking(token)
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const form = consentFormForService(booking.service_slug, booking.service_name)
    if (!form) {
      return NextResponse.json({ error: 'There is no consent form for this appointment.' }, { status: 422 })
    }

    if (b.agreed !== true) {
      return NextResponse.json({ error: 'Please tick the box to confirm before submitting.' }, { status: 400 })
    }

    const { answers, missing } = sanitiseAnswers(form, b.answers)
    if (missing.length > 0) {
      return NextResponse.json({ error: `Please complete: ${missing.join(', ')}` }, { status: 400 })
    }

    // Best-effort link to an existing client record by email.
    let clientId: string | null = null
    const email = booking.client_email?.trim().toLowerCase() || null
    if (email) {
      try {
        const clients = await select<{ id: string }>('clients', { email: `eq.${email}`, select: 'id', limit: 1 })
        clientId = clients[0]?.id ?? null
      } catch {
        /* clients table optional here */
      }
    }

    const saved = await insert<{ id: string }>('consent_submissions', {
      booking_id: booking.id,
      manage_token: token,
      client_id: clientId,
      client_name: booking.client_name,
      client_email: booking.client_email,
      service_name: booking.service_name,
      service_slug: booking.service_slug,
      form_id: form.id,
      form_name: form.name,
      answers,
      declaration: form.declaration,
      agreed: true,
    })
    await audit('create', 'consent_submission', saved.id, { form: form.id, booking: booking.id })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not save your form.' }, { status: 502 })
  }
}
