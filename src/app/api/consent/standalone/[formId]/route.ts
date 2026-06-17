import { NextResponse } from 'next/server'
import { assistantConfigured, select, insert, audit } from '@/lib/assistant/db'
import { getConsentForm, sanitiseAnswers, TERMS_ACCEPTED_KEY, TERMS_ACCEPTED_NOTE } from '@/lib/consent/forms'
import { pushConsentToSheet } from '@/lib/consent/sheet'
import { notifyConsentSubmitted } from '@/lib/consent/notify'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST — a client submits a consent form that was sent to them OUTSIDE the
// booking system (the generic per-form link staff share when, for example, the
// form was not completed before the appointment). There is no booking to attach
// to, so the submission is stored standalone: client name + email come from the
// form's own Personal Details, and we still best-effort link it to a client
// record by email so it lands on the right person where one exists.
export async function POST(req: Request, ctx: { params: Promise<{ formId: string }> }) {
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Consent storage is not configured yet.' }, { status: 503 })
  }
  const { formId } = await ctx.params
  const form = getConsentForm(formId)
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>

  if (b.agreed !== true) {
    return NextResponse.json({ error: 'Please tick the box to confirm before submitting.' }, { status: 400 })
  }
  if (b.agreedTerms !== true) {
    return NextResponse.json({ error: 'Please tick the box to confirm you accept the Terms & Conditions.' }, { status: 400 })
  }

  const { answers, missing } = sanitiseAnswers(form, b.answers)
  if (missing.length > 0) {
    return NextResponse.json({ error: `Please complete: ${missing.join(', ')}` }, { status: 400 })
  }
  // Record the client's acceptance of the booking Terms & Conditions.
  answers[TERMS_ACCEPTED_KEY] = TERMS_ACCEPTED_NOTE

  try {
    // Identify the person from the form's own Personal Details.
    const first = (answers['First Name'] as string) || ''
    const last = (answers['Last Name'] as string) || ''
    const clientName = `${first} ${last}`.trim() || 'Unknown'
    const email = ((answers['E-mail'] as string) || '').trim().toLowerCase() || null

    // Best-effort link to an existing client record by email.
    let clientId: string | null = null
    if (email) {
      try {
        const clients = await select<{ id: string }>('clients', { email: `eq.${email}`, select: 'id', limit: 1 })
        clientId = clients[0]?.id ?? null
      } catch {
        /* clients table optional here */
      }
    }

    const saved = await insert<{ id: string }>('consent_submissions', {
      booking_id: null,
      manage_token: null,
      client_id: clientId,
      client_name: clientName,
      client_email: email,
      service_name: null,
      service_slug: null,
      form_id: form.id,
      form_name: form.name,
      answers,
      declaration: form.declaration,
      agreed: true,
    })
    await audit('create', 'consent_submission', saved.id, { form: form.id, standalone: true })

    await pushConsentToSheet({
      submittedAt: new Date().toISOString(),
      clientName,
      email,
      treatment: null,
      formName: form.name,
      answers,
      declaration: form.declaration,
    })

    await notifyConsentSubmitted({
      submissionId: saved.id,
      clientName,
      serviceName: null,
      formName: form.name,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not save your form.' }, { status: 502 })
  }
}
