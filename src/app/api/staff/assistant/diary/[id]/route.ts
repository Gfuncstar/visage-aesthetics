import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, update, audit } from '@/lib/assistant/db'
import { sendReviewRequest, fillGap, applyNoShowDeposit } from '@/lib/booking-engine/notify'
import { getService } from '@/lib/booking-engine/availability'
import { mirrorBookingAppointment } from '@/lib/booking-engine/appointments-mirror'
import { londonWallToUtc } from '@/lib/booking-engine/time'
import { bookingMovedEmail } from '@/lib/booking-email'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const UUID_RE = /^[0-9a-f-]{36}$/i
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const STATUSES = new Set(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])

const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

// PATCH — update a booking from the diary. Two shapes:
//
//   { status }            — change status, and trigger the matching follow-up:
//                           completed -> review request, no_show -> auto deposit,
//                           cancelled -> waitlist alert.
//
//   { date, startMinutes } — MOVE the booking to a new time (a manual override).
//                           Allowed at ANY time, including outside opening hours
//                           and on a "full" day, so staff can fit a client in
//                           after hours. It does NOT cancel anything or text the
//                           waitlist. The database overlap guard still blocks a
//                           clash with another active booking. The client is
//                           emailed the new time and asked to re-confirm.
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const { id } = await ctx.params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 })

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // ---- Move / reschedule to any time --------------------------------------
  if (body.date !== undefined || body.startMinutes !== undefined) {
    const date = String(body.date ?? '')
    const startMin = Number(body.startMinutes)
    if (!DATE_RE.test(date) || !Number.isFinite(startMin) || startMin < 0 || startMin > 1439) {
      return NextResponse.json({ error: 'Bad date or time' }, { status: 400 })
    }
    const existing = (await select<Booking>('bookings', { id: `eq.${id}`, limit: 1 }))[0]
    if (!existing) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (existing.status === 'cancelled') {
      return NextResponse.json({ error: 'That booking is cancelled — it cannot be moved.' }, { status: 409 })
    }
    // Keep the same treatment length; just shift the start.
    const durationMin = Math.max(
      5,
      Math.round((new Date(existing.ends_at).getTime() - new Date(existing.starts_at).getTime()) / 60000),
    )
    const startsAt = londonWallToUtc(date, startMin)
    const endsAt = londonWallToUtc(date, startMin + durationMin)

    let moved: Booking | undefined
    try {
      // Moving a confirmed appointment makes the old confirmation stale, so clear
      // it (and the reminder flags) — the client re-confirms the new time.
      const rows = await update<Booking>(
        'bookings',
        { id },
        {
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          confirmed_at: null,
          reminded_at: null,
          confirm48_at: null,
        },
      )
      moved = rows[0]
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Move failed'
      // The overlap guard raises a unique_violation (HTTP 409) when the new time
      // clashes with another active booking.
      if (/just been taken|unique|409|23505/i.test(msg)) {
        return NextResponse.json(
          { error: 'That time overlaps another booking. Pick a free time.' },
          { status: 409 },
        )
      }
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    // No row came back: the overlap guard skipped the update (an Ovatu-sourced
    // booking moved onto a slot already held by a website/staff booking).
    if (!moved) {
      return NextResponse.json(
        { error: 'That time overlaps another booking. Pick a free time.' },
        { status: 409 },
      )
    }
    await audit('update', 'booking', id, { movedTo: startsAt.toISOString() })

    // Keep the reporting table in step with the new time.
    try {
      const svc = await getService(moved.service_slug ?? '')
      await mirrorBookingAppointment({
        bookingId: moved.id,
        clientName: moved.client_name,
        startsAt: moved.starts_at,
        endsAt: moved.ends_at,
        serviceName: moved.service_name,
        status: moved.status,
        price: svc?.price_from,
      })
    } catch (err) {
      console.error('[diary] move mirror failed', err)
    }

    // Tell the client straight away, with a one-tap confirm link.
    let emailed = false
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey && moved.client_email) {
      try {
        const mail = bookingMovedEmail({
          name: moved.client_name,
          serviceName: moved.service_name,
          startsAtIso: moved.starts_at,
          manageToken: moved.manage_token,
        })
        await new Resend(apiKey).emails.send({
          from: FROM_EMAIL,
          to: [moved.client_email],
          replyTo: REPLY_TO,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
        })
        emailed = true
      } catch (err) {
        console.error('[diary] move email failed', err)
      }
    }
    return NextResponse.json({ ok: true, emailed })
  }

  // ---- Status change ------------------------------------------------------
  const status = typeof body.status === 'string' && STATUSES.has(body.status) ? body.status : ''
  if (!status) return NextResponse.json({ error: 'Bad status' }, { status: 400 })
  try {
    const rows = await update<Booking>('bookings', { id }, { status })
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
