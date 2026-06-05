import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isAuthedFromRequest } from '@/lib/staff-auth'
import { assistantConfigured, insert, audit } from '@/lib/assistant/db'
import { buildBroadcastHtml, buildBroadcastText } from '@/lib/broadcast-email'
import { generateVoucherCode, voucherExpiry, formatGBP, type GiftVoucher } from '@/lib/gift/vouchers'
import { giftFeatureHtml, giftRecipientBody } from '@/lib/gift-email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PENCE = 100 // £1
const MAX_PENCE = 100000 // £1,000
const FROM_EMAIL = process.env.BROADCAST_FROM_EMAIL ?? 'Bernadette | Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

// POST { recipientName, recipientEmail, amountPence, message, fromName } —
// staff issue a gift voucher (no payment) and email it to the recipient.
export async function POST(req: Request) {
  if (!isAuthedFromRequest(req)) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>

  const recipientName = String(b.recipientName ?? '').trim().slice(0, 200)
  const recipientEmail = String(b.recipientEmail ?? '').trim().toLowerCase().slice(0, 200)
  const amountPence = Math.round(Number(b.amountPence))
  const message = String(b.message ?? '').trim().slice(0, 600)
  const fromName = String(b.fromName ?? '').trim().slice(0, 120) || null

  if (!recipientName) return NextResponse.json({ error: "Please enter the recipient's name." }, { status: 400 })
  if (!EMAIL_RE.test(recipientEmail)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  if (!Number.isFinite(amountPence) || amountPence < MIN_PENCE || amountPence > MAX_PENCE) {
    return NextResponse.json({ error: 'Please enter an amount between £1 and £1,000.' }, { status: 400 })
  }

  try {
    const code = generateVoucherCode()
    const now = new Date().toISOString()
    const voucher = await insert<GiftVoucher>('gift_vouchers', {
      code,
      amount_pence: amountPence,
      balance_pence: amountPence,
      buyer_name: fromName,
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      message: message || null,
      status: 'active',
      paid_at: now,
      delivered_at: now,
      expires_at: voucherExpiry(),
    })

    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const shared = {
        preheader: `A ${formatGBP(amountPence)} gift voucher for Visage Aesthetics`,
        headline: 'A gift for you',
        body: giftRecipientBody(recipientName, fromName),
        recipientEmail,
      }
      try {
        await new Resend(apiKey).emails.send({
          from: FROM_EMAIL,
          to: [recipientEmail],
          replyTo: REPLY_TO,
          subject: `You've been gifted ${formatGBP(amountPence)} at Visage Aesthetics`,
          html: buildBroadcastHtml({ ...shared, featureHtml: giftFeatureHtml({ amountPence, code, fromName, message: message || null }) }),
          text: buildBroadcastText({ ...shared, body: `${shared.body}\n\nVoucher code: ${code}` }),
        })
      } catch {
        /* delivery best-effort; the voucher is valid regardless */
      }
    }

    await audit('gift_voucher_issued', 'gift_voucher', voucher.id, { amount_pence: amountPence, by: 'staff' })
    return NextResponse.json({ ok: true, code, message: `${formatGBP(amountPence)} voucher sent to ${recipientEmail}.` })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not issue the voucher.' }, { status: 502 })
  }
}
