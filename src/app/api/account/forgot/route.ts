import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { assistantConfigured, select, audit } from '@/lib/assistant/db'
import { accountsConfigured, normaliseEmail, makeResetToken } from '@/lib/account/session'
import { passwordResetEmail } from '@/lib/booking-email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SITE = 'https://www.vaclinic.co.uk'
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

// Public: "forgot password" — which also doubles as "set up your account" for an
// existing client who booked with this email but never chose a password. We send
// the link when the email either has an account OR has a booking on file; either
// way the same one-hour link lets them set a password (reset/route upserts the
// account). We always reply with the same success message so the form never
// reveals who is a client.
export async function POST(req: Request) {
  if (!assistantConfigured() || !accountsConfigured()) {
    return NextResponse.json({ error: 'Accounts are not available right now.' }, { status: 503 })
  }

  let body: { email?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const email = typeof body.email === 'string' ? normaliseEmail(body.email) : ''
  const ok = NextResponse.json({ ok: true })
  if (!email) return ok

  try {
    const account = await select<{ email: string }>('client_accounts', { email: `eq.${email}`, select: 'email', limit: 1 })
    const bookings = await select<{ client_name: string }>('bookings', {
      client_email: `ilike.${email}`,
      select: 'client_name',
      order: 'starts_at.desc',
      limit: 1,
    })
    const hasAccount = account.length > 0
    const hasBooking = bookings.length > 0
    if (!hasAccount && !hasBooking) return ok // unknown email — say nothing, do nothing

    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const url = `${SITE}/account/reset?token=${encodeURIComponent(makeResetToken(email))}`
      const mail = passwordResetEmail({ name: bookings[0]?.client_name ?? '', url, isNew: !hasAccount })
      await new Resend(apiKey).emails.send({
        from: FROM_EMAIL,
        to: [email],
        replyTo: REPLY_TO,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      })
      await audit('request', 'client_account', undefined, { via: 'forgot', isNew: !hasAccount })
    }
    return ok
  } catch {
    // Never leak failure detail back to the form.
    return ok
  }
}
