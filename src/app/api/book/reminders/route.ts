import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, update } from '@/lib/assistant/db'
import { sendConfirmRequest } from '@/lib/booking-engine/confirm-request'
import { smsConfigured } from '@/lib/assistant/sms'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Sends the "please confirm you're coming" request for confirmed bookings
// starting in the next ~24h that have not been reminded yet. The client gets a
// branded email with a one-click "Confirm your appointment" button (or an SMS
// with the same link if there's no email on file). Called hourly by the
// scheduler with ?key=<push_cron_secret>, or by signed-in staff (?test=1
// reports the count).
export async function GET(req: Request) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const url = new URL(req.url)
  const key = url.searchParams.get('key') ?? ''
  const isStaff = await isStaffAuthed()

  // Vercel cron calls this with an Authorization: Bearer <CRON_SECRET> header
  // (same pattern as the agent crons). Also accept the app_config push secret
  // via ?key=, or a signed-in staff session.
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

  let sms = 0
  let email = 0

  for (const b of due) {
    const result = await sendConfirmRequest(b)
    if (result.channel === 'sms') sms++
    if (result.channel === 'email') email++

    // Mark reminded regardless, so we never double-send.
    await update('bookings', { id: b.id }, { reminded_at: now.toISOString() })
  }

  return NextResponse.json({ ok: true, dueCount: due.length, sms, email })
}
