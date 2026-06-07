import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { assistantConfigured, select } from '@/lib/assistant/db'
import { portalConfigured, makePortalToken, normaliseEmail } from '@/lib/booking-engine/portal-token'
import { portalLoginEmail } from '@/lib/booking-email'
import { isSuppressed } from '@/lib/assistant/suppression'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const SITE = 'https://www.vaclinic.co.uk'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

// Public: a client asks for their account link. We always answer the same way,
// whether or not the email is on file, so this cannot be used to discover who
// is a client. A link is only ever sent to an address that actually has
// bookings, and only by email (never returned in the response).
export async function POST(req: Request) {
  const ok = NextResponse.json({ ok: true })
  if (!assistantConfigured() || !portalConfigured()) return ok

  let email = ''
  try {
    const b = (await req.json()) as { email?: unknown }
    if (typeof b.email === 'string') email = normaliseEmail(b.email).slice(0, 160)
  } catch {
    return ok
  }
  if (!email || !EMAIL_RE.test(email)) return ok

  try {
    // Find the most recent booking for this email to greet them by name.
    const rows = await select<Booking>('bookings', {
      client_email: `ilike.${email}`,
      order: 'created_at.desc',
      limit: 1,
    })
    const booking = rows[0]
    if (!booking) return ok // no account: stay silent, same response

    if (await isSuppressed(booking.client_name, email)) return ok

    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const token = makePortalToken(email)
      const url = `${SITE}/account?token=${encodeURIComponent(token)}`
      const mail = portalLoginEmail({ name: booking.client_name, url })
      try {
        await new Resend(apiKey).emails.send({
          from: FROM_EMAIL,
          to: [email],
          replyTo: REPLY_TO,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
        })
      } catch (err) {
        console.error('[portal] login email failed', err)
      }
    }
  } catch (err) {
    console.error('[portal] request failed', err)
  }
  return ok
}
