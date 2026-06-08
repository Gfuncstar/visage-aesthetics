// Stripe webhook endpoint — handles checkout.session.completed events.
//
// This is the robust confirmation path for deposits and gift voucher purchases.
// It runs server-side and is independent of whether the client's browser
// completes the return redirect, so payments are never lost.
//
// Set up in the Stripe dashboard:
//   Endpoint URL:  https://www.vaclinic.co.uk/api/stripe/webhook
//   Events:        checkout.session.completed
//   Signing secret → STRIPE_WEBHOOK_SECRET in Vercel

import { NextResponse } from 'next/server'
import { assistantConfigured, select, update, audit } from '@/lib/assistant/db'
import { verifyWebhookEvent } from '@/lib/booking-engine/stripe'
import { getService } from '@/lib/booking-engine/availability'
import { mirrorBookingAppointment } from '@/lib/booking-engine/appointments-mirror'
import type { Booking } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Stripe sends the raw body — must NOT be parsed by Next.js before we verify
// the signature. Read as text, then parse manually.
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: { type: string; data: { object: Record<string, unknown> } }
  try {
    const rawBody = await req.text()
    event = await verifyWebhookEvent(rawBody, sig)
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (!assistantConfigured()) {
    // Return 200 so Stripe doesn't retry — the database isn't configured.
    return NextResponse.json({ ok: true, skipped: true })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ ok: true, ignored: true })
  }

  const session = event.data.object
  const paymentStatus = session['payment_status'] as string | undefined
  if (paymentStatus !== 'paid') {
    return NextResponse.json({ ok: true, unpaid: true })
  }

  const metadata = (session['metadata'] ?? {}) as Record<string, string>

  // ---- Booking deposit confirmation ----------------------------------------
  const manageToken = metadata['manage_token']
  if (manageToken) {
    try {
      const rows = await select<Booking>('bookings', { manage_token: `eq.${manageToken}`, limit: 1 })
      const booking = rows[0]
      if (booking && booking.status !== 'confirmed') {
        await update('bookings', { id: booking.id }, { status: 'confirmed' })
        await audit('confirm', 'booking', booking.id, { via: 'stripe-webhook' })

        const svc = await getService(booking.service_slug ?? '')
        await mirrorBookingAppointment({
          bookingId: booking.id,
          clientName: booking.client_name,
          startsAt: booking.starts_at,
          serviceName: booking.service_name,
          status: 'confirmed',
          price: svc?.price_from,
        })
      }
    } catch (err) {
      console.error('[stripe-webhook] booking confirmation failed', err)
      // Return 500 so Stripe retries — transient DB errors should retry.
      return NextResponse.json({ error: 'Booking confirmation failed' }, { status: 500 })
    }
    return NextResponse.json({ ok: true, confirmed: 'booking' })
  }

  // ---- Gift voucher payment confirmation -----------------------------------
  const voucherId = metadata['gift_voucher_id']
  if (voucherId) {
    try {
      const rows = await select<{ id: string; status: string }>('gift_vouchers', {
        id: `eq.${voucherId}`,
        limit: 1,
      })
      const voucher = rows[0]
      if (voucher && voucher.status !== 'active') {
        await update('gift_vouchers', { id: voucher.id }, { status: 'active' })
        await audit('confirm', 'gift_voucher', voucher.id, { via: 'stripe-webhook' })
      }
    } catch (err) {
      console.error('[stripe-webhook] gift voucher confirmation failed', err)
      return NextResponse.json({ error: 'Voucher confirmation failed' }, { status: 500 })
    }
    return NextResponse.json({ ok: true, confirmed: 'gift_voucher' })
  }

  return NextResponse.json({ ok: true, unrecognised: true })
}
