import { NextResponse } from 'next/server'
import { assistantConfigured, select, insert, update, audit } from '@/lib/assistant/db'
import { resolveConsent } from '@/lib/consent/resolve'
import type { ConsentForm, ConsentField } from '@/lib/consent/forms'

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

function isAnswered(field: ConsentField, value: unknown): boolean {
  if (field.type === 'multi-choice') return Array.isArray(value) && value.length > 0
  return typeof value === 'string' ? value.trim().length > 0 : value != null && value !== ''
}

function sanitiseAnswers(form: ConsentForm, raw: unknown): { answers: Record<string, string | string[]>; missing: string[] } {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const answers: Record<string, string | string[]> = {}
  const missing: string[] = []
  for (const field of form.fields) {
    if (field.type === 'heading' || field.type === 'info') continue
    const v = input[field.label]
    if (field.type === 'multi-choice') {
      const arr = Array.isArray(v) ? v.map((x) => String(x).slice(0, 300)).filter(Boolean) : []
      const allowed = field.options ?? []
      answers[field.label] = arr.filter((x) => allowed.includes(x))
    } else {
      answers[field.label] = typeof v === 'string' ? v.slice(0, 4000) : ''
    }
    if (field.required && !isAnswered(field, answers[field.label])) missing.push(field.label)
  }
  return { answers, missing }
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
    const { answers, missing } = sanitiseAnswers(context.form, b.answers)
    if (missing.length > 0) {
      return NextResponse.json({ error: `Please complete: ${missing.join(', ')}` }, { status: 400 })
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

    await audit('create', 'consent_submission', saved.id, { form: context.form.id, source: context.source })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not save your form.' }, { status: 502 })
  }
}
