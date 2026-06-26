import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, insert, audit } from '@/lib/assistant/db'
import { londonToday } from '@/lib/booking-engine/time'
import { dayTakings } from '@/lib/assistant/treatment-pricing'
import { buildBroadcastHtml, buildBroadcastText } from '@/lib/broadcast-email'
import { gbp } from '@/lib/assistant/format'
import { withHeartbeat } from '@/lib/assistant/heartbeat'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'
// Bernadette's clinic inbox (same as the other staff summaries).
const TO_EMAIL = process.env.CLINIC_EMAIL ?? process.env.BOOKING_NOTIFY_EMAIL ?? 'ber.parsons@outlook.com'

// Wait this long after the last appointment ends before sending the wrap-up,
// in case of a late finish or a squeeze-in.
const SETTLE_MS = 30 * 60 * 1000

function londonDate(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date(iso))
}

// End-of-day wrap-up: ~30 min after the last client of the day has finished,
// email Bernadette what she did today and the day's takings (website treatment
// value, not card payments). Sent once per day. Called every 30 min by the
// scheduler; silent until the day is done. ?test=1 (signed-in staff) reports
// without sending.
export async function GET(req: Request) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const url = new URL(req.url)
  const key = url.searchParams.get('key') ?? ''
  const isStaff = await isStaffAuthed()
  const cronSecret = process.env.CRON_SECRET
  const bearerOk = Boolean(cronSecret) && req.headers.get('authorization') === `Bearer ${cronSecret}`
  let secretOk = false
  try {
    const rows = await select<{ value: string }>('app_config', { key: 'eq.push_cron_secret', limit: 1 })
    secretOk = Boolean(rows[0]?.value) && key === rows[0].value
  } catch {
    /* ignore */
  }
  if (!bearerOk && !secretOk && !isStaff) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })

  return withHeartbeat('end-of-day-email', async () => {
  const now = new Date()
  const today = londonToday()
  const since = new Date(now.getTime() - 24 * 3600_000).toISOString()

  const recent = await select<Booking>('bookings', {
    and: `(starts_at.gte.${since},starts_at.lte.${now.toISOString()})`,
    status: 'neq.cancelled',
    order: 'starts_at.asc',
    limit: 200,
  })
  const todays = recent.filter((b) => londonDate(b.starts_at) === today)
  const attendedRows = todays.filter((b) => b.status !== 'no_show')

  if (attendedRows.length === 0) {
    return NextResponse.json({ ok: true, today, reason: 'No clinic today' })
  }

  // Only once the last appointment has finished + settled.
  const lastEnd = Math.max(...todays.map((b) => new Date(b.ends_at).getTime()))
  const ready = now.getTime() >= lastEnd + SETTLE_MS

  const { total, attended, lines } = dayTakings(todays)

  if (url.searchParams.get('test') === '1' && isStaff) {
    return NextResponse.json({ ok: true, test: true, today, ready, total, attended, lines })
  }

  if (!ready) return NextResponse.json({ ok: true, today, waiting: true })

  // Send once per day.
  const sentKey = `eod_email:${today}`
  try {
    const existing = await select<{ key: string }>('app_config', { key: `eq.${sentKey}`, limit: 1 })
    if (existing.length > 0) return NextResponse.json({ ok: true, today, alreadySent: true })
  } catch {
    /* table read failed — fall through and try to send */
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Mail not configured' }, { status: 500 })

  const lineText = lines.map((l) => `- ${l.service} ×${l.count} — ${gbp(l.total)}`).join('\n')
  const body = `Hi Bernadette, here's your day at the clinic.

**Clients seen:** ${attended}
**Day's takings:** ${gbp(total)}

${lineText}

These figures are the website value of the treatments seen today — an honest estimate of the day's work, not card payments.`

  const opts = { preheader: `${attended} seen · ${gbp(total)}`, headline: 'Today at the clinic', body, cta: 'none' as const }
  try {
    await new Resend(apiKey).emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: REPLY_TO,
      subject: `Today at the clinic — ${gbp(total)}`,
      html: buildBroadcastHtml(opts),
      text: buildBroadcastText({ headline: opts.headline, body, cta: 'none' }),
    })
  } catch (err) {
    console.error('[end-of-day-email] send failed', err)
    return NextResponse.json({ error: 'Send failed' }, { status: 502 })
  }

  try {
    await insert('app_config', { key: sentKey, value: now.toISOString() })
  } catch {
    /* best effort — the email already went */
  }
  await audit('end-of-day-email', 'day', today, { attended, total })

  return NextResponse.json({ ok: true, today, sent: true, attended, total })
  })
}
