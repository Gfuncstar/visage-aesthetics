import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import Anthropic from '@anthropic-ai/sdk'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, audit } from '@/lib/assistant/db'
import { AGENT_MODEL } from '@/lib/assistant/model'
import { ukDate } from '@/lib/assistant/format'
import { withHeartbeat } from '@/lib/assistant/heartbeat'
import type { TreatmentRecord } from '@/lib/assistant/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

async function authorised(req: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization') || ''
    if (auth === `Bearer ${cronSecret}`) return true
  }
  return isStaffAuthed()
}

type ConsentSub = { client_name: string; submitted_at: string }
type BookingRow = { client_name: string; service_name: string; starts_at: string; status: string; source: string }

function todayStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date())
}

async function run() {
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }

  const today = todayStr()

  const [records, consentSubs, todayBookings] = await Promise.all([
    select<TreatmentRecord>('treatment_records', {
      date: `eq.${today}`,
      order: 'created_at.asc',
      limit: 200,
    }),
    select<ConsentSub>('consent_submissions', {
      select: 'client_name,submitted_at',
      limit: 2000,
    }).catch(() => [] as ConsentSub[]),
    select<BookingRow>('bookings', {
      and: `(starts_at.gte.${today}T00:00:00Z,starts_at.lte.${today}T23:59:59Z,status.neq.cancelled)`,
      select: 'client_name,service_name,starts_at,status,source',
      order: 'starts_at.asc',
      limit: 100,
    }).catch(() => [] as BookingRow[]),
  ])

  // If no treatment records today, nothing to audit clinically — still send a
  // clear-green report so Bernadette knows the check ran.
  const norm = (n: string) => n.trim().toLowerCase()
  const consented = new Set(consentSubs.map((s) => norm(s.client_name ?? '')).filter(Boolean))

  // Per-record compliance checks
  const noConsent = records.filter((r) => !r.consent && !consented.has(norm(r.client_name ?? '')))
  const noBatch = records.filter((r) => !r.batch_number)
  const noDose = records.filter((r) => r.total_dose === null)
  const expiredProduct = records.filter((r) => r.expiry && r.expiry < today)
  const noProduct = records.filter((r) => !r.product)
  const overdueReview = records.filter((r) => r.review_date && r.review_date < today)

  // Bookings with no matching treatment record (treated but not documented)
  const recordedNames = new Set(records.map((r) => norm(r.client_name ?? '')).filter(Boolean))
  const undocumented = todayBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'completed',
  ).filter((b) => !recordedNames.has(norm(b.client_name ?? '')))

  const totalFlags =
    noConsent.length +
    noBatch.length +
    noDose.length +
    expiredProduct.length +
    noProduct.length +
    overdueReview.length +
    undocumented.length

  const allClear = records.length === 0 || totalFlags === 0

  // Claude legal narrative
  let narrative = ''
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const dataJson = JSON.stringify({
        date: today,
        treatmentRecords: records.length,
        bookingsToday: todayBookings.length,
        allClear,
        flags: {
          missingConsent: noConsent.map((r) => ({ client: r.client_name, treatment: r.treatment_type })),
          noBatchNumber: noBatch.map((r) => ({ client: r.client_name, treatment: r.treatment_type })),
          noDoseRecorded: noDose.map((r) => ({ client: r.client_name, treatment: r.treatment_type })),
          expiredProductUsed: expiredProduct.map((r) => ({ client: r.client_name, product: r.product, expiry: r.expiry })),
          noProductRecorded: noProduct.map((r) => ({ client: r.client_name, treatment: r.treatment_type })),
          overdueReviewDate: overdueReview.map((r) => ({ client: r.client_name, reviewDate: r.review_date })),
          undocumentedAppointments: undocumented.map((b) => ({ client: b.client_name, service: b.service_name })),
        },
      })
      const prompt = `You are writing an end-of-clinic health, safety, and legal compliance check for Bernadette Tobin RGN MSc, NMC PIN 05G1753E, a solo nurse prescriber running a private UK aesthetics clinic.

Write a concise, professional end-of-clinic compliance summary (2–3 short paragraphs):
1. Overall legal/safety status for today — is the clinic fully covered, or are there gaps?
2. Any specific flags that need immediate action before the next clinic, with the exact legal/regulatory risk (NMC Code, CQC standards, UK product liability, MHRA batch traceability, GDPR consent records).
3. If all clear: a brief confirmation that documentation is complete and the clinic is legally protected.

Do NOT use generic disclaimers. Be specific about what needs to be done and why it matters legally. Write in the first person as Bernadette's compliance advisor. Data: ${dataJson}`

      const msg = await client.messages.create({
        model: AGENT_MODEL,
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      })
      narrative = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    } catch {
      // narrative is optional — send the report anyway
    }
  }

  await audit('health_safety_check', 'treatment_records', today, {
    records_reviewed: records.length,
    flags: totalFlags,
    all_clear: allClear,
  })

  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    const flagRow = (label: string, items: { client_name?: string | null; client?: string | null }[], risk: string) => {
      const ok = items.length === 0
      const names = items.slice(0, 5).map((i) => i.client_name || i.client || '—').join(', ')
      const overflow = items.length > 5 ? ` +${items.length - 5} more` : ''
      return `<tr>
        <td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;${ok ? '' : 'color:#C0392B;font-weight:600;'}">${label}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;text-align:center;${ok ? 'color:#27AE60;' : 'color:#C0392B;font-weight:600;'}">${ok ? '✓' : items.length}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;font-size:12px;color:#8A807D;">${ok ? '' : names + overflow}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;font-size:11px;color:#8A807D;">${ok ? '' : risk}</td>
      </tr>`
    }

    const statusColour = allClear ? '#27AE60' : '#C0392B'
    const statusLabel = allClear
      ? records.length === 0 ? 'No clinic today' : 'All clear'
      : `${totalFlags} flag${totalFlags !== 1 ? 's' : ''} — action required`

    const html = `
      <div style="font-family:-apple-system,sans-serif;color:#1F1B1A;max-width:640px;">
        <h2 style="font-family:Georgia,serif;font-style:italic;color:#A8895E;font-weight:500;margin:0 0 4px;">
          End-of-clinic compliance check
        </h2>
        <p style="color:#8A807D;font-size:13px;margin:0 0 6px;">${ukDate(today)} · ${records.length} treatment record${records.length !== 1 ? 's' : ''} · ${todayBookings.length} appointment${todayBookings.length !== 1 ? 's' : ''}</p>
        <p style="font-size:14px;font-weight:600;color:${statusColour};margin:0 0 24px;">${statusLabel}</p>

        <h3 style="font-size:12px;color:#8A807D;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px;">Compliance checks</h3>
        <table style="border-collapse:collapse;width:100%;font-size:13px;margin-bottom:24px;">
          <thead>
            <tr style="background:#F5F0EC;">
              <th style="padding:6px 12px;text-align:left;font-weight:500;color:#8A807D;">Check</th>
              <th style="padding:6px 12px;text-align:center;font-weight:500;color:#8A807D;">Count</th>
              <th style="padding:6px 12px;text-align:left;font-weight:500;color:#8A807D;">Clients</th>
              <th style="padding:6px 12px;text-align:left;font-weight:500;color:#8A807D;">Risk</th>
            </tr>
          </thead>
          <tbody>
            ${flagRow('Consent not on file', noConsent, 'NMC Code 4.2 / GDPR Art.9')}
            ${flagRow('No batch number recorded', noBatch, 'MHRA traceability requirement')}
            ${flagRow('No dose recorded', noDose, 'NMC prescribing record standard')}
            ${flagRow('Expired product used', expiredProduct, 'Product liability / MHRA')}
            ${flagRow('No product name recorded', noProduct, 'Clinical record completeness')}
            ${flagRow('Overdue review dates', overdueReview, 'NMC duty of care')}
            ${flagRow('Appointments with no treatment record', undocumented, 'CQC documentation standard')}
          </tbody>
        </table>

        ${narrative ? `
        <h3 style="font-size:12px;color:#8A807D;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px;">Compliance advisory</h3>
        <div style="border-left:3px solid ${allClear ? '#27AE60' : '#C0392B'};padding:4px 16px;margin-bottom:24px;">
          <p style="font-size:14px;color:#5C4F44;line-height:1.7;white-space:pre-wrap;margin:0;">${narrative.replace(/</g, '&lt;')}</p>
        </div>` : ''}

        <p style="font-size:11px;color:#8A807D;border-top:1px solid #D9CDBE;padding-top:12px;margin:0;">
          Automated end-of-clinic check · Visage Aesthetics · ${ukDate(today)}
        </p>
      </div>`

    const resend = new Resend(apiKey)
    const toEmail = process.env.CLINIC_EMAIL ?? 'bernadette.parsons@outlook.com'
    await resend.emails.send({
      from: 'Visage Aesthetics <enquiries@vaclinic.co.uk>',
      to: [toEmail],
      subject: `End-of-clinic compliance · ${ukDate(today)}${totalFlags > 0 ? ` · ⚠ ${totalFlags} flag${totalFlags !== 1 ? 's' : ''}` : ' · ✓ All clear'}`,
      html,
      text: `End-of-clinic compliance check — ${ukDate(today)}\n${records.length} records, ${totalFlags} flags\n\n${narrative}`,
    })
  }

  return NextResponse.json({ ok: true, date: today, records: records.length, flags: totalFlags, allClear })
}

export async function GET(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return withHeartbeat('health-safety', () => run())
}

export async function POST(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}
