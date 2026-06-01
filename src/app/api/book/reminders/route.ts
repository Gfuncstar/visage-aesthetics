import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, update } from '@/lib/assistant/db'
import { londonParts, dayLabel, clockLabel } from '@/lib/booking-engine/time'
import { sendSms, smsConfigured } from '@/lib/assistant/sms'
import { isSuppressed } from '@/lib/assistant/suppression'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SITE = 'https://www.vaclinic.co.uk'
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

// Sends appointment reminders for confirmed bookings starting in the next ~24h
// that have not been reminded yet. Called hourly by the scheduler with
// ?key=<push_cron_secret>, or by signed-in staff (?test=1 reports the count).
export async function GET(req: Request) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const url = new URL(req.url)
  const key = url.searchParams.get('key') ?? ''
  const isStaff = await isStaffAuthed()

  let secretOk = false
  try {
    const rows = await select<{ value: string }>('app_config', { key: 'eq.push_cron_secret', limit: 1 })
    secretOk = Boolean(rows[0]?.value) && key === rows[0].value
  } catch {
    /* ignore */
  }
  if (!secretOk && !isStaff) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })

  const now = new Date()
  const windowEnd = new Date(now.getTime() + 24 * 3600_000)

  const due = await select<Booking>('bookings', {
    status: 'eq.confirmed',
    reminded_at: 'is.null',
    and: `(starts_at.gt.${now.toISOString()},starts_at.lte.${windowEnd.toISOString()})`,
    order: 'starts_at.asc',
    limit: 200,
  })

  if (url.searchParams.get('test') === '1' && isStaff) {
    return NextResponse.json({ ok: true, test: true, dueCount: due.length, smsConfigured: smsConfigured() })
  }

  const apiKey = process.env.RESEND_API_KEY
  const resend = apiKey ? new Resend(apiKey) : null
  let sms = 0
  let email = 0

  for (const b of due) {
    const p = londonParts(new Date(b.starts_at))
    const when = `${dayLabel(p.dateStr)} at ${clockLabel(p.minutes)}`
    const first = b.client_name.trim().split(/\s+/)[0] || 'there'
    const manageUrl = `${SITE}/book/manage/${b.manage_token}`

    // Honour the do-not-contact marker even for reminders.
    const suppressed = await isSuppressed(b.client_name, b.client_email)

    if (!suppressed) {
      const text = `Hi ${first}, a reminder of your ${b.service_name} at Visage Aesthetics on ${when}. To change it: ${manageUrl}`
      let delivered = false
      if (b.client_phone && smsConfigured()) {
        delivered = await sendSms(b.client_phone, text)
        if (delivered) sms++
      }
      if (!delivered && b.client_email && resend) {
        try {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: [b.client_email],
            replyTo: REPLY_TO,
            subject: `Reminder: your ${b.service_name} on ${dayLabel(p.dateStr)}`,
            text,
          })
          email++
        } catch (err) {
          console.error('[reminders] email failed', err)
        }
      }
    }

    // Mark reminded regardless, so we never double-send.
    await update('bookings', { id: b.id }, { reminded_at: now.toISOString() })
  }

  return NextResponse.json({ ok: true, dueCount: due.length, sms, email })
}
