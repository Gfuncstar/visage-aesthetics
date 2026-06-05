import { NextResponse } from 'next/server'
import { assistantConfigured, insert } from '@/lib/assistant/db'
import { createGiftCheckout, stripeConfigured } from '@/lib/booking-engine/stripe'
import { poundsToPence, type GiftVoucher } from '@/lib/gift/vouchers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PENCE = 2500 // £25
const MAX_PENCE = 100000 // £1,000

// Public: start a gift-voucher purchase. Creates a pending voucher and returns
// a Stripe Checkout URL. The voucher is only activated/emailed once paid.
export async function POST(req: Request) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Gift vouchers are not available right now.' }, { status: 503 })
  if (!stripeConfigured()) return NextResponse.json({ error: 'Payments are not set up yet.' }, { status: 503 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>

  const amountPence = poundsToPence(Number(b.amount))
  const buyerName = String(b.buyerName ?? '').trim().slice(0, 200)
  const buyerEmail = String(b.buyerEmail ?? '').trim().toLowerCase().slice(0, 200)
  const recipientName = String(b.recipientName ?? '').trim().slice(0, 200)
  const recipientEmail = String(b.recipientEmail ?? '').trim().toLowerCase().slice(0, 200)
  const message = String(b.message ?? '').trim().slice(0, 600)

  if (!Number.isFinite(amountPence) || amountPence < MIN_PENCE || amountPence > MAX_PENCE) {
    return NextResponse.json({ error: 'Please choose an amount between £25 and £1,000.' }, { status: 400 })
  }
  if (!buyerName) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
  if (!EMAIL_RE.test(buyerEmail)) return NextResponse.json({ error: 'Please enter your email address.' }, { status: 400 })
  if (!recipientName) return NextResponse.json({ error: "Please enter the recipient's name." }, { status: 400 })
  if (!EMAIL_RE.test(recipientEmail)) return NextResponse.json({ error: "Please enter the recipient's email address." }, { status: 400 })

  try {
    const voucher = await insert<GiftVoucher>('gift_vouchers', {
      amount_pence: amountPence,
      balance_pence: amountPence,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      message: message || null,
      status: 'pending',
    })

    const url = await createGiftCheckout({ amountPence, voucherId: voucher.id, buyerEmail })
    if (!url) return NextResponse.json({ error: 'Could not start checkout.' }, { status: 502 })
    return NextResponse.json({ ok: true, url })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not start the purchase.' }, { status: 502 })
  }
}
