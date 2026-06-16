import { NextResponse } from 'next/server'
import { assistantConfigured, select, insert, update, audit } from '@/lib/assistant/db'
import { resolveConsent } from '@/lib/consent/resolve'
import { sanitiseAnswers } from '@/lib/consent/forms'
import { pushConsentToSheet } from '@/lib/consent/sheet'
import { notifyConsentSubmitted } from '@/lib/consent/notify'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f-]{36}$/i

// GET — what form is needed for this token and whether it is already done.
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Unavailable' }, { status: 503 })
  const { token } = await ctx.params
  if (!UUID_RE.test(token)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    const { context, alreadyDone } = await resolveConsent(token)
    if (!context) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({
      clientName: context.clientName,
      serviceName: context.serviceName,
      formId: context.form.id,
      alreadySubmitted: alreadyDone,
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}

// POST — a client submits their consent form (from a booking link or a
// manually-sent request). Stored against the booking/request and, where we can
// resolve it by email, the client record.
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
    const { context, alreadyDone } = await resolveConsent(token)
    if (!context) return NextResponse.json({ error: 'There is no consent form for this link.' }, { status: 422 })
    if (alreadyDone) return NextResponse.json({ ok: true, alreadySubmitted: true })

    if (b.agreed !== true) {
      return NextResponse.json({ error: 'Please tick the box to confirm before submitting.' }, { status: 400 })
    }

    let answers: Record<string, string | string[]>
    if (b.noChanges === true) {
      // Returning client confirming nothing has changed — carry their most recent
      // consent for this form forward, so a full, accurate record is kept for this
      // treatment without making them re-enter everything.
      const enc = context.clientName.replace(/[%,()]/g, ' ')
      let prior: { answers: Record<string, string | string[]>; submitted_at: string; booking_id: string | null }[] = []
      try {
        prior = await select('consent_submissions', {
          form_id: `eq.${context.form.id}`,
          client_name: `ilike.${enc}`,
          order: 'submitted_at.desc',
          select: 'answers,submitted_at,booking_id',
          limit: 5,
        })
      } catch {
        prior = []
      }
      const p = prior.find((x) => x.booking_id !== context.bookingId) ?? prior[0]
      if (!p) {
        return NextResponse.json({ error: 'We could not find your previous consent — please complete the full form.' }, { status: 422 })
      }
      answers = {
        ...(p.answers || {}),
        'Returning client': `Confirmed no changes to medical history or medications since previous consent (${(p.submitted_at || '').slice(0, 10)}).`,
      }
    } else {
      const result = sanitiseAnswers(context.form, b.answers)
      if (result.missing.length > 0) {
        return NextResponse.json({ error: `Please complete: ${result.missing.join(', ')}` }, { status: 400 })
      }
      answers = result.answers
    }

    // Best-effort link to an existing client record by email.
    let clientId: string | null = null
    const email = context.clientEmail?.trim().toLowerCase() || null
    if (email) {
      try {
        const clients = await select<{ id: string }>('clients', { email: `eq.${email}`, select: 'id', limit: 1 })
        clientId = clients[0]?.id ?? null
      } catch {
        /* clients table optional */
      }
    }

    const saved = await insert<{ id: string }>('consent_submissions', {
      booking_id: context.bookingId,
      request_id: context.requestId,
      manage_token: token,
      client_id: clientId,
      client_name: context.clientName,
      client_email: context.clientEmail,
      service_name: context.serviceName,
      service_slug: context.serviceSlug,
      form_id: context.form.id,
      form_name: context.form.name,
      answers,
      declaration: context.form.declaration,
      agreed: true,
    })

    // Mark a manually-sent request as completed so it drops off the outstanding list.
    if (context.requestId) {
      try {
        await update('consent_requests', { id: context.requestId }, { status: 'completed', completed_at: new Date().toISOString() })
      } catch {
        /* best effort */
      }
    }

    // A booking may have been sent the form more than once (an initial send plus
    // a pre-appointment chase). Clear ALL still-'sent' requests for this booking
    // so none linger on the outstanding list once the client has completed one.
    if (context.bookingId) {
      try {
        await update('consent_requests', { booking_id: context.bookingId, status: 'sent' }, { status: 'completed', completed_at: new Date().toISOString() })
      } catch {
        /* best effort */
      }
    }

    await audit('create', 'consent_submission', saved.id, { form: context.form.id, source: context.source })

    // Mirror it to the consent Google Sheet (no-op unless the webhook is set).
    await pushConsentToSheet({
      submittedAt: new Date().toISOString(),
      clientName: context.clientName,
      email: context.clientEmail,
      treatment: context.serviceName,
      formName: context.form.name,
      answers,
      declaration: context.form.declaration,
    })

    // Let Bernadette know it's done, with a link straight to the submission.
    await notifyConsentSubmitted({
      submissionId: saved.id,
      clientName: context.clientName,
      serviceName: context.serviceName,
      formName: context.form.name,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not save your form.' }, { status: 502 })
  }
}
