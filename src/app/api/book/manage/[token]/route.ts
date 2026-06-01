import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { assistantConfigured, select, update, audit } from '@/lib/assistant/db'
import { bookingCancellationEmail } from '@/lib/booking-email'
import { isSuppressed } from '@/lib/assistant/suppression'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f-]{36}$/i
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

function publicView(b: Booking) {
  return {
    serviceName: b.service_name,
    clientName: b.client_name,
    startsAt: b.starts_at,
    status: b.status,
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
  try {
    const b = (await req.json()) as { action?: unknown }
    if (b.action === 'cancel') action = 'cancel'
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (action !== 'cancel') return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  try {
    const rows = await select<Booking>('bookings', { manage_token: `eq.${token}`, limit: 1 })
    const booking = rows[0]
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
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
    return NextResponse.json({ ok: true, status: 'cancelled' })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Cancel failed' }, { status: 502 })
  }
}
