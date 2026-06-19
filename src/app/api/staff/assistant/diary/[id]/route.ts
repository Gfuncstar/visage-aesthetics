import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, update, audit } from '@/lib/assistant/db'
import { sendReviewRequest, fillGap, applyNoShowDeposit } from '@/lib/booking-engine/notify'
import { getService } from '@/lib/booking-engine/availability'
import { mirrorBookingAppointment } from '@/lib/booking-engine/appointments-mirror'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const UUID_RE = /^[0-9a-f-]{36}$/i
const STATUSES = new Set(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])

// PATCH { status } — update a booking's status from the diary, and trigger the
// matching follow-up: completed -> review request, no_show -> auto deposit,
// cancelled -> waitlist alert.
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const { id } = await ctx.params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 })
  let status = ''
  try {
    const b = (await req.json()) as { status?: unknown }
    if (typeof b.status === 'string' && STATUSES.has(b.status)) status = b.status
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!status) return NextResponse.json({ error: 'Bad status' }, { status: 400 })
  try {
    // Lock a cancellation so the Ovatu sync can't quietly revive it; clear the
    // lock on any other status, which is also how the top-nav Undo restores a
    // booking (status set back with the lock released).
    const rows = await update<Booking>('bookings', { id }, { status, cancel_locked: status === 'cancelled' })
    await audit('update', 'booking', id, { status })

    const booking = rows[0]
    if (booking) {
      // Keep the reporting table in step with the diary (completed sets revenue).
      const svc = await getService(booking.service_slug ?? '')
      await mirrorBookingAppointment({
        bookingId: booking.id,
        clientName: booking.client_name,
        startsAt: booking.starts_at,
        serviceName: booking.service_name,
        status: booking.status,
        price: svc?.price_from,
      })
      try {
        if (status === 'completed') await sendReviewRequest(booking)
        else if (status === 'no_show') await applyNoShowDeposit(booking)
        else if (status === 'cancelled') await fillGap(booking)
      } catch (err) {
        console.error('[diary] follow-up failed', err)
      }
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Update failed' }, { status: 502 })
  }
}
