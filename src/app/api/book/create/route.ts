import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { assistantConfigured, insert, select, audit } from '@/lib/assistant/db'
import { getService, computeDay } from '@/lib/booking-engine/availability'
import { londonParts, dayLabel, clockLabel } from '@/lib/booking-engine/time'
import { bookingConfirmationEmail } from '@/lib/booking-email'
import { consentFormForService } from '@/lib/consent/forms'
import { consentAtBooking } from '@/lib/assistant/go-live'
import { isSuppressed } from '@/lib/assistant/suppression'
import { lookupClientFlags } from '@/lib/booking-engine/client-flags'
import { mirrorBookingAppointment } from '@/lib/booking-engine/appointments-mirror'
import { stripeConfigured, depositPence, createDepositCheckout } from '@/lib/booking-engine/stripe'
import { sendSms, smsConfigured } from '@/lib/assistant/sms'
import { recordMessage } from '@/lib/assistant/messages'
import { sendPush } from '@/lib/assistant/push'
import { notifyClinicOfBooking } from '@/lib/booking-engine/clinic-alert'
import type { Booking } from '@/lib/booking-engine/types'

const SITE = 'https://www.vaclinic.co.uk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

// Public: create a booking. The chosen slot is re-validated against live
// availability so a stale page cannot double-book or pick an arbitrary time.
export async function POST(req: Request) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Booking is not available right now.' }, { status: 503 })

  let b: { service?: unknown; startsAt?: unknown; name?: unknown; email?: unknown; phone?: unknown; notes?: unknown; voucherCode?: unknown }
  try {
    b = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const slug = typeof b.service === 'string' ? b.service.trim().slice(0, 80) : ''
  const startsAt = typeof b.startsAt === 'string' ? b.startsAt : ''
  const name = typeof b.name === 'string' ? b.name.trim().slice(0, 120) : ''
  const email = typeof b.email === 'string' ? b.email.trim().slice(0, 160) : ''
  const phone = typeof b.phone === 'string' ? b.phone.trim().slice(0, 40) : ''
  const notes = typeof b.notes === 'string' ? b.notes.trim().slice(0, 600) : ''
  const voucherCode = typeof b.voucherCode === 'string' ? b.voucherCode.trim().toUpperCase().slice(0, 40) : ''

  if (!slug || !startsAt || !name) return NextResponse.json({ error: 'Please fill in your name and a time.' }, { status: 400 })
  if (!email && !phone) return NextResponse.json({ error: 'Please leave an email or phone number.' }, { status: 400 })
  if (email && !EMAIL_RE.test(email)) return NextResponse.json({ error: 'That email does not look right.' }, { status: 400 })

  const startDate = new Date(startsAt)
  if (Number.isNaN(startDate.getTime())) return NextResponse.json({ error: 'Bad time' }, { status: 400 })

  try {
    const service = await getService(slug)
    if (!service) return NextResponse.json({ error: 'Unknown service' }, { status: 404 })

    // Per-client flags. A blocked client is turned away discreetly, exactly as
    // if the diary were full, with no hint they are blocked.
    const flags = await lookupClientFlags({ name, email, phone })
    if (flags.blocked) {
      return NextResponse.json({ error: 'Sorry, there is no availability to book online right now.' }, { status: 409 })
    }

    // Re-validate: the chosen instant must still be a free slot today.
    const dateStr = londonParts(startDate).dateStr
    const slots = await computeDay(service, dateStr)
    const slot = slots.find((s) => s.startsAtIso === startDate.toISOString())
    if (!slot) {
      return NextResponse.json({ error: 'Sorry, that time has just been taken. Please pick another.' }, { status: 409 })
    }

    // If the client entered a gift voucher code, validate it and flag it on the
    // booking so reception applies it in clinic. Never blocks the booking.
    let finalNotes = notes
    if (voucherCode) {
      try {
        const vrows = await select<{ code: string; status: string; balance_pence: number; expires_at: string | null }>(
          'gift_vouchers',
          { code: `eq.${voucherCode}`, select: 'code,status,balance_pence,expires_at', limit: 1 },
        )
        const v = vrows[0]
        const live = v && v.status === 'active' && v.balance_pence > 0 && (!v.expires_at || new Date(v.expires_at) > new Date())
        const tag = live
          ? `🎁 Gift voucher ${v!.code} — £${(v!.balance_pence / 100).toFixed(2).replace(/\.00$/, '')} balance, apply in clinic`
          : `Gift voucher entered: ${voucherCode} (please check — not active)`
        finalNotes = finalNotes ? `${tag}\n${finalNotes}` : tag
      } catch {
        /* voucher lookup is best-effort */
      }
    }

    // A deposit-required client, or any service with a configured deposit
    // amount, books as pending until the deposit is paid.
    const needsDeposit = flags.requiresDeposit || service.deposit > 0
    const booking = await insert<Booking>('bookings', {
      service_id: service.id,
      service_name: service.name,
      service_slug: service.slug,
      client_name: name,
      client_email: email || null,
      client_phone: phone || null,
      starts_at: slot.startsAtIso,
      ends_at: slot.endsAtIso,
      status: needsDeposit ? 'pending' : 'confirmed',
      notes: finalNotes || null,
      source: 'online',
    })
    await audit('create', 'booking', booking.id, { service: service.slug, source: 'online', needsDeposit })

    // Mirror confirmed bookings into the reporting table. Deposit-pending ones
    // are mirrored later, once the deposit is paid (see deposit/confirm).
    if (!needsDeposit) {
      await mirrorBookingAppointment({
        bookingId: booking.id,
        clientName: name,
        startsAt: slot.startsAtIso,
        serviceName: service.name,
        status: 'confirmed',
        price: service.price_from,
      })
    }

    // Tell the clinic a booking just came in (before any payment redirect).
    const np = londonParts(startDate)
    try {
      await sendPush({
        title: needsDeposit ? 'Booking (deposit pending)' : 'New booking',
        body: `${name}, ${service.name}, ${dayLabel(np.dateStr)} at ${clockLabel(np.minutes)}`,
        url: '/staff/assistant/diary',
      })
    } catch {
      /* push is best effort */
    }

    if (needsDeposit) {
      // Hand off to Stripe Checkout when configured; otherwise hold as pending
      // and let the clinic request the deposit manually.
      if (stripeConfigured()) {
        try {
          const url = await createDepositCheckout({
            amountPence: depositPence(service.deposit),
            serviceName: service.name,
            manageToken: booking.manage_token,
            email: email || null,
          })
          if (url) return NextResponse.json({ ok: true, deposit: true, checkoutUrl: url, manageToken: booking.manage_token })
        } catch (err) {
          console.error('[book] deposit checkout failed', err)
        }
      }
      return NextResponse.json({ ok: true, deposit: true, depositPending: true, manageToken: booking.manage_token })
    }

    // Confirmation email, unless the client is on the do-not-contact list.
    if (email && !(await isSuppressed(name, email))) {
      const apiKey = process.env.RESEND_API_KEY
      if (apiKey) {
        // Send the consent form automatically at booking, for treatments we
        // have a form for. Driven by the single cutover switch (on at go-live);
        // CONSENT_FORMS_ENABLED can force it on or off independently.
        const consentUrl =
          consentAtBooking() && consentFormForService(service.slug, service.name)
            ? `${SITE}/consent/${booking.manage_token}`
            : undefined
        const mail = bookingConfirmationEmail({
          name,
          serviceName: service.name,
          startsAtIso: slot.startsAtIso,
          manageToken: booking.manage_token,
          consentUrl,
        })
        try {
          await new Resend(apiKey).emails.send({
            from: FROM_EMAIL,
            to: [email],
            replyTo: REPLY_TO,
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
          })
          await recordMessage({ clientName: name, email, channel: 'email', kind: 'confirmation', subject: mail.subject, body: mail.text, bookingId: booking.id })
        } catch (err) {
          console.error('[book] confirmation email failed', err)
        }
      }
    }

    // Text confirmation too, when we have a mobile and SMS is switched on.
    if (phone && smsConfigured() && !(await isSuppressed(name, email))) {
      const cp = londonParts(startDate)
      const sms = `Hi ${name.split(/\s+/)[0] || 'there'}, your ${service.name} at Visage Aesthetics on ${dayLabel(cp.dateStr)} at ${clockLabel(cp.minutes)} is confirmed. Manage: ${SITE}/book/manage/${booking.manage_token}`
      if (await sendSms(phone, sms)) {
        await recordMessage({ clientName: name, phone, channel: 'sms', kind: 'confirmation', body: sms, bookingId: booking.id })
      }
    }

    // Email the clinic owner the new booking details. Deposit-pending bookings
    // are not yet real, so they are alerted later, once the deposit clears (see
    // deposit/confirm). Best-effort: never blocks the client's booking.
    try {
      await notifyClinicOfBooking({
        clientName: name,
        serviceName: service.name,
        startsAtIso: slot.startsAtIso,
        clientEmail: email || null,
        clientPhone: phone || null,
        notes: finalNotes || null,
        source: 'online',
      })
    } catch {
      /* clinic alert is best effort */
    }

    return NextResponse.json({ ok: true, manageToken: booking.manage_token })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not book' }, { status: 502 })
  }
}
