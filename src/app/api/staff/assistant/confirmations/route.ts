import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, update, audit } from '@/lib/assistant/db'
import { sendConfirmRequest } from '@/lib/booking-engine/confirm-request'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const UUID_RE = /^[0-9a-f-]{36}$/i

// POST { bookingId, action } where action is:
//   'remind'  — re-send the "please confirm" request (email, or SMS fallback)
//   'confirm' — mark the booking confirmed manually (e.g. they phoned to say so)
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'The clinic database is not configured.' }, { status: 503 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const bookingId = String(b.bookingId ?? '')
  const action = b.action === 'confirm' ? 'confirm' : b.action === 'remind' ? 'remind' : ''
  if (!UUID_RE.test(bookingId)) return NextResponse.json({ error: 'Unknown booking.' }, { status: 400 })
  if (!action) return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })

  try {
    const rows = await select<Booking>('bookings', { id: `eq.${bookingId}`, limit: 1 })
    const booking = rows[0]
    if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
    if (booking.status === 'cancelled') return NextResponse.json({ error: 'This booking was cancelled.' }, { status: 409 })

    if (action === 'confirm') {
      await update('bookings', { id: booking.id }, { confirmed_at: new Date().toISOString() })
      await audit('confirm', 'booking', booking.id, { via: 'staff-manual' })
      return NextResponse.json({ ok: true, action })
    }

    // remind
    const result = await sendConfirmRequest(booking)
    if (!result.delivered) {
      const reason = result.suppressed
        ? 'This client is marked do-not-contact.'
        : 'No email or mobile on file to message this client.'
      return NextResponse.json({ error: reason }, { status: 422 })
    }
    // Stamp reminded_at just like the hourly cron does, so the booking's detail
    // card shows "Reminder sent · …" and the unconfirmed-bookings query treats it
    // as already chased. Without this a staff-sent reminder left reminded_at null.
    await update('bookings', { id: booking.id }, { reminded_at: new Date().toISOString() })
    await audit('remind', 'booking', booking.id, { via: 'staff-manual', channel: result.channel })
    return NextResponse.json({ ok: true, action, channel: result.channel })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Update failed' }, { status: 502 })
  }
}
