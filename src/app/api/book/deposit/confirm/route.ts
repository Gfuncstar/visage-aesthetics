import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { assistantConfigured, select, update, audit } from '@/lib/assistant/db'
import { checkoutSessionPaid } from '@/lib/booking-engine/stripe'
import { bookingConfirmationEmail } from '@/lib/booking-email'
import { consentFormForService } from '@/lib/consent/forms'
import { isSuppressed } from '@/lib/assistant/suppression'
import type { Booking } from '@/lib/booking-engine/types'

const SITE = 'https://www.vaclinic.co.uk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f-]{36}$/i
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

// Public: called on return from Stripe Checkout. Confirms the booking if the
// deposit session is paid.
export async function POST(req: Request) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Unavailable' }, { status: 503 })
  let token = ''
  let sessionId = ''
  try {
    const b = (await req.json()) as { token?: unknown; sessionId?: unknown }
    if (typeof b.token === 'string') token = b.token
    if (typeof b.sessionId === 'string') sessionId = b.sessionId.slice(0, 200)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!UUID_RE.test(token) || !sessionId) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  try {
    const rows = await select<Booking>('bookings', { manage_token: `eq.${token}`, limit: 1 })
    const booking = rows[0]
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (booking.status === 'confirmed') return NextResponse.json({ ok: true, status: 'confirmed' })

    const paid = await checkoutSessionPaid(sessionId)
    if (!paid) return NextResponse.json({ ok: false, status: booking.status, paid: false })

    await update('bookings', { id: booking.id }, { status: 'confirmed' })
    await audit('confirm', 'booking', booking.id, { via: 'deposit' })

    if (booking.client_email && !(await isSuppressed(booking.client_name, booking.client_email))) {
      const apiKey = process.env.RESEND_API_KEY
      if (apiKey) {
        const consentUrl =
          process.env.CONSENT_FORMS_ENABLED === 'true' && consentFormForService(booking.service_slug, booking.service_name)
            ? `${SITE}/consent/${booking.manage_token}`
            : undefined
        const mail = bookingConfirmationEmail({
          name: booking.client_name,
          serviceName: booking.service_name,
          startsAtIso: booking.starts_at,
          manageToken: booking.manage_token,
          consentUrl,
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
          console.error('[book] deposit confirmation email failed', err)
        }
      }
    }
    return NextResponse.json({ ok: true, status: 'confirmed', paid: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Confirm failed' }, { status: 502 })
  }
}
