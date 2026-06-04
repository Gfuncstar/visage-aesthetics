import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import Anthropic from '@anthropic-ai/sdk'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, audit } from '@/lib/assistant/db'
import { monthBounds, ukDate, gbp } from '@/lib/assistant/format'
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

function lastMonthKey(): string {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return d.toISOString().slice(0, 7)
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

async function run() {
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }

  const monthKey = lastMonthKey()
  const { start, end } = monthBounds(monthKey)
  const todayStr = new Date().toISOString().slice(0, 10)

  const records = await select<TreatmentRecord>('treatment_records', {
    and: `(date.gte.${start},date.lte.${end})`,
    order: 'date.asc',
    limit: 2000,
  })

  // Compliance flags
  const noConsent = records.filter((r) => !r.consent)
  const expiredProduct = records.filter((r) => r.expiry && r.expiry < r.date)
  const noBatch = records.filter((r) => !r.batch_number)
  const noDose = records.filter((r) => r.total_dose === null)
  const overdueReview = records.filter((r) => r.review_date && r.review_date < todayStr)

  const flagCount = noConsent.length + expiredProduct.length + noBatch.length + noDose.length + overdueReview.length

  // Treatment summary
  const treatmentMap = new Map<string, { count: number; totalDose: number }>()
  for (const r of records) {
    const key = r.treatment_type || 'Unspecified'
    const entry = treatmentMap.get(key) ?? { count: 0, totalDose: 0 }
    entry.count += 1
    entry.totalDose += Number(r.total_dose ?? 0)
    treatmentMap.set(key, entry)
  }
  const treatmentSummary = Array.from(treatmentMap.entries()).sort((a, b) => b[1].count - a[1].count)

  // Batch tracking
  const batchMap = new Map<string, { product: string; expiry: string | null }>()
  for (const r of records) {
    if (!r.batch_number) continue
    if (!batchMap.has(r.batch_number)) {
      batchMap.set(r.batch_number, { product: r.product || r.treatment_type || '—', expiry: r.expiry || null })
    }
  }
  const batches = Array.from(batchMap.entries()).map(([batch, info]) => ({ batch, ...info }))

  // Claude narrative
  let narrative = ''
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const dataJson = JSON.stringify({
        month: monthLabel(monthKey),
        totalRecords: records.length,
        flagCount,
        flags: {
          noConsent: noConsent.length,
          expiredProduct: expiredProduct.length,
          noBatch: noBatch.length,
          noDose: noDose.length,
          overdueReview: overdueReview.length,
        },
        treatmentCounts: Object.fromEntries(treatmentMap),
        uniqueBatches: batches.length,
      })
      const prompt = `You are writing a monthly clinical audit note for Bernadette Tobin RGN MSc, NMC PIN 05G1755E, a solo nurse prescriber running a private aesthetics clinic. Write 2 concise paragraphs in the first person: (1) overall compliance summary for the month, noting any flags, (2) treatment activity and batch traceability. Professional, factual, NMC-standard language. Data: ${dataJson}`
      const msg = await client.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      })
      narrative = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    } catch {
      // narrative is optional
    }
  }

  await audit('clinical_audit_sent', 'treatment_records', monthKey, {
    records_reviewed: records.length,
    flags: flagCount,
  })

  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    const flagSection = (label: string, items: TreatmentRecord[]) =>
      items.length > 0
        ? `<tr><td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;color:#C0392B;">${label}</td><td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;color:#C0392B;font-weight:600;">${items.length}</td></tr>`
        : `<tr><td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;">${label}</td><td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;color:#27AE60;">✓ 0</td></tr>`

    const html = `
      <div style="font-family:-apple-system,sans-serif;color:#1F1B1A;max-width:600px;">
        <h2 style="font-family:Georgia,serif;font-style:italic;color:#A8895E;font-weight:500;margin:0 0 4px;">Clinical audit</h2>
        <p style="color:#8A807D;font-size:13px;margin:0 0 24px;">${monthLabel(monthKey)} — ${records.length} records reviewed</p>

        <h3 style="font-size:12px;color:#8A807D;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px;">Compliance flags</h3>
        <table style="border-collapse:collapse;width:100%;font-size:13px;margin-bottom:24px;">
          <tbody>
            ${flagSection('No consent recorded', noConsent)}
            ${flagSection('Expired product used', expiredProduct)}
            ${flagSection('No batch number', noBatch)}
            ${flagSection('No dose recorded', noDose)}
            ${flagSection('Overdue review dates', overdueReview)}
          </tbody>
        </table>

        <h3 style="font-size:12px;color:#8A807D;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px;">Treatment summary</h3>
        <table style="border-collapse:collapse;width:100%;font-size:13px;margin-bottom:24px;">
          <thead><tr style="background:#F5F0EC;">
            <th style="padding:6px 12px;text-align:left;font-weight:500;color:#8A807D;">Treatment</th>
            <th style="padding:6px 12px;text-align:right;font-weight:500;color:#8A807D;">Records</th>
          </tr></thead>
          <tbody>${treatmentSummary.map(([t, d]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;">${t}</td><td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;text-align:right;">${d.count}</td></tr>`).join('')}</tbody>
        </table>

        <h3 style="font-size:12px;color:#8A807D;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px;">Batch tracking (${batches.length} unique batches)</h3>
        <table style="border-collapse:collapse;width:100%;font-size:13px;margin-bottom:24px;">
          <thead><tr style="background:#F5F0EC;">
            <th style="padding:6px 12px;text-align:left;font-weight:500;color:#8A807D;">Product</th>
            <th style="padding:6px 12px;text-align:left;font-weight:500;color:#8A807D;">Batch</th>
            <th style="padding:6px 12px;text-align:left;font-weight:500;color:#8A807D;">Expiry</th>
          </tr></thead>
          <tbody>${batches.map((b) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;">${b.product}</td><td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;color:#8A807D;">${b.batch}</td><td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;">${ukDate(b.expiry)}</td></tr>`).join('')}</tbody>
        </table>

        ${narrative ? `<div style="border-left:3px solid #A8895E;padding:4px 16px;"><p style="font-size:14px;color:#5C4F44;line-height:1.7;white-space:pre-wrap;margin:0;">${narrative.replace(/</g, '&lt;')}</p></div>` : ''}
      </div>`

    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: 'Visage Aesthetics <enquiries@vaclinic.co.uk>',
      to: [process.env.CLINIC_EMAIL ?? 'info@vaclinic.co.uk'],
      subject: `Clinical audit — ${monthLabel(monthKey)}${flagCount > 0 ? ` ⚠ ${flagCount} flag${flagCount > 1 ? 's' : ''}` : ''}`,
      html,
      text: `Clinical audit — ${monthLabel(monthKey)}\n${records.length} records reviewed, ${flagCount} flags\n\n${narrative}`,
    })
  }

  return NextResponse.json({ ok: true, month: monthKey, records: records.length, flags: flagCount })
}

export async function GET(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}

export async function POST(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}
