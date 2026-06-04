import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'
import { sendPush } from '@/lib/assistant/push'
import { ukDate } from '@/lib/assistant/format'
import type { TreatmentRecord } from '@/lib/assistant/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

async function authorised(req: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization') || ''
    if (auth === `Bearer ${cronSecret}`) return true
  }
  return isStaffAuthed()
}

type ExpiringItem = {
  product: string
  batchNumber: string
  expiry: string
  daysLeft: number
}

async function run() {
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const cutoff = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const records = await select<TreatmentRecord>('treatment_records', {
    order: 'expiry.asc',
    limit: 500,
  })

  // Filter to non-null expiry within window
  const inWindow = records.filter(
    (r) => r.expiry && r.expiry >= todayStr && r.expiry <= cutoffStr,
  )

  // Deduplicate by batch_number
  const seen = new Set<string>()
  const items: ExpiringItem[] = []
  for (const r of inWindow) {
    const key = r.batch_number || `${r.product}:${r.expiry}`
    if (seen.has(key)) continue
    seen.add(key)
    const daysLeft = Math.ceil(
      (new Date(r.expiry!).getTime() - now.getTime()) / 86400000,
    )
    items.push({
      product: r.product || r.treatment_type || 'Unknown',
      batchNumber: r.batch_number || '—',
      expiry: r.expiry!,
      daysLeft,
    })
  }

  if (items.length === 0) {
    return NextResponse.json({ ok: true, expiring: 0 })
  }

  await sendPush({
    title: `Stock expiry alert — ${items.length} item${items.length > 1 ? 's' : ''}`,
    body: items.map((i) => `${i.product} (${i.daysLeft}d)`).join(', '),
    url: '/staff/assistant/stock',
  })

  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    const rows = items
      .map(
        (i) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #D9CDBE;">${i.product}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #D9CDBE;color:#8A807D;">${i.batchNumber}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #D9CDBE;">${ukDate(i.expiry)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #D9CDBE;color:${i.daysLeft <= 7 ? '#C0392B' : '#A8895E'};font-weight:600;">${i.daysLeft}d</td>
        </tr>`,
      )
      .join('')

    const html = `
      <div style="font-family:-apple-system,sans-serif;color:#1F1B1A;max-width:560px;">
        <h2 style="font-family:Georgia,serif;font-style:italic;color:#A8895E;font-weight:500;margin:0 0 16px;">
          Stock expiry alert
        </h2>
        <p style="color:#5C4F44;margin:0 0 20px;">
          ${items.length} batch${items.length > 1 ? 'es' : ''} expiring within 30 days.
        </p>
        <table style="border-collapse:collapse;width:100%;font-size:14px;">
          <thead>
            <tr style="background:#F5F0EC;">
              <th style="padding:8px 12px;text-align:left;color:#8A807D;font-weight:500;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Product</th>
              <th style="padding:8px 12px;text-align:left;color:#8A807D;font-weight:500;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Batch</th>
              <th style="padding:8px 12px;text-align:left;color:#8A807D;font-weight:500;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Expiry</th>
              <th style="padding:8px 12px;text-align:left;color:#8A807D;font-weight:500;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Days left</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`

    const text = [
      `Stock expiry alert — ${items.length} item(s) expiring within 30 days`,
      '',
      ...items.map((i) => `${i.product} | Batch: ${i.batchNumber} | Expires: ${ukDate(i.expiry)} | ${i.daysLeft} days`),
    ].join('\n')

    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: 'Visage Aesthetics <enquiries@vaclinic.co.uk>',
      to: [process.env.CLINIC_EMAIL ?? 'info@vaclinic.co.uk'],
      subject: `Stock expiry alert — ${items.length} item${items.length > 1 ? 's' : ''} expiring within 30 days`,
      html,
      text,
    })
  }

  return NextResponse.json({ ok: true, expiring: items.length, items })
}

export async function GET(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}

export async function POST(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}
