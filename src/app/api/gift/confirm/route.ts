import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { assistantConfigured, select, update, audit } from '@/lib/assistant/db'
import { checkoutSessionPaid } from '@/lib/booking-engine/stripe'
import { buildBroadcastHtml, buildBroadcastText } from '@/lib/broadcast-email'
import {
  generateVoucherCode,
  voucherExpiry,
  formatGBP,
  type GiftVoucher,
} from '@/lib/gift/vouchers'
import { giftFeatureHtml, giftRecipientBody, giftBuyerReceiptBody } from '@/lib/gift-email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const UUID_RE = /^[0-9a-f-]{36}$/i
const FROM_EMAIL = process.env.BROADCAST_FROM_EMAIL ?? 'Bernadette | Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

// Public: called on return from Stripe. Verifies payment, activates the voucher
// (assigns a code), and emails it to the recipient + a receipt to the buyer.
export async function POST(req: Request) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Unavailable' }, { status: 503 })

  let id = ''
  let sessionId = ''
  try {
    const b = (await req.json()) as { id?: unknown; sessionId?: unknown }
    if (typeof b.id === 'string') id = b.id
    if (typeof b.sessionId === 'string') sessionId = b.sessionId.slice(0, 200)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!UUID_RE.test(id) || !sessionId) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  try {
    const rows = await select<GiftVoucher>('gift_vouchers', { id: `eq.${id}`, limit: 1 })
    const voucher = rows[0]
    if (!voucher) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Idempotent: if already activated, just report success.
    if (voucher.status !== 'pending' && voucher.code) {
      return NextResponse.json({ ok: true, status: voucher.status, code: voucher.code, recipientName: voucher.recipient_name })
    }

    const paid = await checkoutSessionPaid(sessionId)
    if (!paid) return NextResponse.json({ error: 'Payment not completed', status: 'pending' }, { status: 402 })

    const code = generateVoucherCode()
    await update('gift_vouchers', { id: voucher.id }, {
      status: 'active',
      code,
      stripe_session_id: sessionId,
      paid_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
      expires_at: voucherExpiry(),
    })

    // Best-effort emails — the voucher is valid regardless of delivery.
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const resend = new Resend(apiKey)
      const recipShared = {
        preheader: `A ${formatGBP(voucher.amount_pence)} gift voucher for Visage Aesthetics`,
        headline: 'A gift for you',
        body: giftRecipientBody(voucher.recipient_name, voucher.buyer_name),
        recipientEmail: voucher.recipient_email ?? undefined,
      }
      try {
        if (voucher.recipient_email) {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: [voucher.recipient_email],
            replyTo: REPLY_TO,
            subject: `You've been gifted ${formatGBP(voucher.amount_pence)} at Visage Aesthetics`,
            html: buildBroadcastHtml({ ...recipShared, featureHtml: giftFeatureHtml({ amountPence: voucher.amount_pence, code, fromName: voucher.buyer_name, message: voucher.message }) }),
            text: buildBroadcastText({ ...recipShared, body: `${recipShared.body}\n\nVoucher code: ${code}` }),
          })
        }
        if (voucher.buyer_email) {
          const buyerBody = giftBuyerReceiptBody(voucher.buyer_name, voucher.recipient_name, voucher.amount_pence, code)
          await resend.emails.send({
            from: FROM_EMAIL,
            to: [voucher.buyer_email],
            replyTo: REPLY_TO,
            subject: `Your Visage Aesthetics gift voucher — receipt`,
            html: buildBroadcastHtml({ headline: 'Thank you', body: buyerBody, recipientEmail: voucher.buyer_email }),
            text: buildBroadcastText({ headline: 'Thank you', body: buyerBody, recipientEmail: voucher.buyer_email }),
          })
        }
      } catch {
        /* delivery best-effort */
      }
    }

    await audit('gift_voucher_activated', 'gift_voucher', voucher.id, { amount_pence: voucher.amount_pence })
    return NextResponse.json({ ok: true, status: 'active', code, recipientName: voucher.recipient_name })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not confirm.' }, { status: 502 })
  }
}
