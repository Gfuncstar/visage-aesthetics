import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { assistantConfigured, select, update, audit } from '@/lib/assistant/db'
import { bookingCancellationEmail, bookingConfirmationEmail } from '@/lib/booking-email'
import { isSuppressed } from '@/lib/assistant/suppression'
import { notifyWaitlistForService } from '@/lib/booking-engine/notify'
import { getService, computeDay } from '@/lib/booking-engine/availability'
import { londonParts } from '@/lib/booking-engine/time'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const UUID_RE = /^[0-9a-f-]{36}$/i
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

function publicView(b: Booking) {
  return {
    serviceName: b.service_name,
    serviceSlug: b.service_slug,
    clientName: b.client_name,
    startsAt: b.starts_at,
    status: b.status,
  }
}

async function sendConfirmation(booking: Booking, startsAtIso: string) {
  if (!booking.client_email || (await isSuppressed(booking.client_name, booking.client_email))) return
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  const mail = bookingConfirmationEmail({
    name: booking.client_name,
    serviceName: booking.service_name,
    startsAtIso,
    manageToken: booking.manage_token,
  })
  try {
    await new Resend(apiKey).emails.send({
      from: FROM_EMAIL,
      to: [booking.client_email],
      replyTo: REPLY_TO,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    })
  } catch (err) {
    console.error('[book] reschedule email failed', err)
  }
}

// Public (token-gated): view a booking.
export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Unavailable' }, { status: 503 })
  const { token } = await ctx.params
  if (!UUID_RE.test(token)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    const rows = await select<Booking>('bookings', { manage_token: `eq.${token}`, limit: 1 })
    if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ booking: publicView(rows[0]) })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}

// Public (token-gated): cancel a booking.
export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Unavailable' }, { status: 503 })
  const { token } = await ctx.params
  if (!UUID_RE.test(token)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let action = ''
  let newStartsAt = ''
  try {
    const b = (await req.json()) as { action?: unknown; startsAt?: unknown }
    if (b.action === 'cancel' || b.action === 'reschedule') action = b.action
    if (typeof b.startsAt === 'string') newStartsAt = b.startsAt
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!action) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  try {
    const rows = await select<Booking>('bookings', { manage_token: `eq.${token}`, limit: 1 })
    const booking = rows[0]
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (action === 'reschedule') {
      if (booking.status === 'cancelled') return NextResponse.json({ error: 'This booking was cancelled.' }, { status: 409 })
      const startDate = new Date(newStartsAt)
      if (Number.isNaN(startDate.getTime())) return NextResponse.json({ error: 'Bad time' }, { status: 400 })
      const service = await getService(booking.service_slug ?? '')
      if (!service) return NextResponse.json({ error: 'Service unavailable' }, { status: 409 })

      // The new time must be a genuinely free slot.
      const dateStr = londonParts(startDate).dateStr
      const slots = await computeDay(service, dateStr)
      const slot = slots.find((s) => s.startsAtIso === startDate.toISOString())
      if (!slot) return NextResponse.json({ error: 'Sorry, that time is no longer free. Please pick another.' }, { status: 409 })

      await update('bookings', { id: booking.id }, {
        starts_at: slot.startsAtIso,
        ends_at: slot.endsAtIso,
        reminded_at: null, // let a fresh reminder fire for the new time
      })
      await audit('reschedule', 'booking', booking.id, { to: slot.startsAtIso })
      await sendConfirmation(booking, slot.startsAtIso)
      // The vacated slot may suit a waitlisted client.
      await notifyWaitlistForService(booking.service_slug)
      return NextResponse.json({ ok: true, status: booking.status, startsAt: slot.startsAtIso })
    }

    // cancel
    if (booking.status === 'cancelled') return NextResponse.json({ ok: true, status: 'cancelled' })
    await update('bookings', { id: booking.id }, { status: 'cancelled' })
    await audit('cancel', 'booking', booking.id, { via: 'manage-link' })

    if (booking.client_email && !(await isSuppressed(booking.client_name, booking.client_email))) {
      const apiKey = process.env.RESEND_API_KEY
      if (apiKey) {
        const mail = bookingCancellationEmail({
          name: booking.client_name,
          serviceName: booking.service_name,
          startsAtIso: booking.starts_at,
        })
        try {
          await new Resend(apiKey).emails.send({
            from: FROM_EMAIL,
            to: [booking.client_email],
            replyTo: REPLY_TO,
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
          })
        } catch (err) {
          console.error('[book] cancellation email failed', err)
        }
      }
    }
    // Alert anyone waiting for this service that a slot just opened.
    await notifyWaitlistForService(booking.service_slug)
    return NextResponse.json({ ok: true, status: 'cancelled' })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Update failed' }, { status: 502 })
  }
}
