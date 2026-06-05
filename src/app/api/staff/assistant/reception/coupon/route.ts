import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isAuthedFromRequest } from '@/lib/staff-auth'
import { buildBroadcastHtml, buildBroadcastText } from '@/lib/broadcast-email'
import { couponAmountLabel, couponEmailBody, couponFeatureHtml, type CouponKind } from '@/lib/coupon-email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FROM_EMAIL =
  process.env.BROADCAST_FROM_EMAIL ?? 'Bernadette | Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'there'
}

// POST { code, amount, kind, clientName, clientEmail } — email a client a
// branded, visual discount voucher.
export async function POST(req: Request) {
  if (!isAuthedFromRequest(req)) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Mail service not configured (RESEND_API_KEY missing).' }, { status: 500 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>

  const code = String(b.code ?? '').trim().toUpperCase().slice(0, 40)
  const amount = Math.round(Number(b.amount))
  const kind: CouponKind = b.kind === '%' ? '%' : '£'
  const clientName = String(b.clientName ?? '').trim().slice(0, 200)
  const clientEmail = String(b.clientEmail ?? '').trim().toLowerCase().slice(0, 200)

  if (!code) return NextResponse.json({ error: 'Please enter a coupon code.' }, { status: 400 })
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: 'Please enter a discount amount.' }, { status: 400 })
  if (kind === '%' && amount > 100) return NextResponse.json({ error: 'A percentage discount can’t be over 100%.' }, { status: 400 })
  if (!EMAIL_RE.test(clientEmail)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })

  const label = couponAmountLabel(amount, kind)
  const emailBody = couponEmailBody(firstName(clientName), amount, kind)
  const shared = {
    preheader: `${label} your next treatment at Visage Aesthetics`,
    headline: 'A little something for you',
    body: emailBody,
    recipientEmail: clientEmail,
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [clientEmail],
      replyTo: REPLY_TO,
      subject: `${label} at Visage Aesthetics — your code: ${code}`,
      html: buildBroadcastHtml({ ...shared, featureHtml: couponFeatureHtml({ amount, kind, code }) }),
      text: buildBroadcastText({ ...shared, body: `${emailBody}\n\nYour code: ${code}` }),
    })
    if (error) {
      return NextResponse.json({ error: error.message || 'Could not send the coupon.' }, { status: 502 })
    }
    return NextResponse.json({ ok: true, message: `${label} sent to ${clientEmail}.` })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not send the coupon.' }, { status: 502 })
  }
}
