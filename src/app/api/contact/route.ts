import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'info@vaclinic.co.uk'
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? 'Visage Aesthetics <enquiries@vaclinic.co.uk>'

type Payload = {
  firstName?: unknown
  lastName?: unknown
  email?: unknown
  phone?: unknown
  treatment?: unknown
  contactMethod?: unknown
  message?: unknown
  hearAbout?: unknown
  consent?: unknown
  website?: unknown
}

function str(v: unknown, max = 500): string {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, max)
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/

export async function POST(req: Request) {
  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }

  if (str(body.website)) {
    return NextResponse.json({ ok: true })
  }

  const firstName = str(body.firstName, 80)
  const lastName = str(body.lastName, 80)
  const email = str(body.email, 200)
  const phone = str(body.phone, 40)
  const treatment = str(body.treatment, 80) || 'not-sure'
  const contactMethod = str(body.contactMethod, 20)
  const message = str(body.message, 3000)
  const hearAbout = str(body.hearAbout, 80)
  const consent = body.consent === true

  if (!firstName || !lastName) {
    return NextResponse.json({ ok: false, error: 'Please provide your name.' }, { status: 400 })
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Please provide a valid email.' }, { status: 400 })
  }
  if (!phone) {
    return NextResponse.json({ ok: false, error: 'Please provide a phone number.' }, { status: 400 })
  }
  if (!consent) {
    return NextResponse.json({ ok: false, error: 'Please tick the consent box.' }, { status: 400 })
  }
  if (!['phone', 'whatsapp', 'email'].includes(contactMethod)) {
    return NextResponse.json({ ok: false, error: 'Please choose a contact method.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not set')
    return NextResponse.json(
      { ok: false, error: 'Mail service not configured.' },
      { status: 500 },
    )
  }

  const fullName = `${firstName} ${lastName}`
  const subject = `New enquiry — ${fullName}${treatment !== 'not-sure' ? ` (${treatment})` : ''}`

  const rows: Array<[string, string]> = [
    ['Name', fullName],
    ['Email', email],
    ['Phone', phone],
    ['Treatment', treatment],
    ['Preferred contact', contactMethod],
    ['Heard about us via', hearAbout || '—'],
  ]

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#1F1B1A; max-width: 560px;">
      <h2 style="font-family: Georgia, serif; font-style: italic; color:#A8895E; font-weight: 500; margin: 0 0 16px;">New website enquiry</h2>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding: 8px 12px 8px 0; color:#8A807D; font-size: 13px; vertical-align: top; width: 140px;">${escapeHtml(label)}</td>
            <td style="padding: 8px 0; color:#1F1B1A; font-size: 14px;">${escapeHtml(value)}</td>
          </tr>`,
          )
          .join('')}
      </table>
      ${
        message
          ? `<div style="border-left: 3px solid #A8895E; padding: 4px 16px; margin-top: 8px;">
              <div style="color:#8A807D; font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 6px;">Message</div>
              <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</div>
            </div>`
          : ''
      }
      <p style="margin-top: 28px; font-size: 12px; color:#8A807D;">
        Reply directly to this email to respond to ${escapeHtml(firstName)}.
      </p>
    </div>
  `

  const text = [
    'New website enquiry',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    message ? `Message:\n${message}` : '',
    '',
    `Reply directly to this email to respond to ${firstName}.`,
  ].join('\n')

  const resend = new Resend(apiKey)

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: email,
      subject,
      html,
      text,
    })
    if (error) {
      console.error('[contact] Resend error:', error)
      return NextResponse.json({ ok: false, error: 'Could not send. Please try again.' }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact] send threw:', err)
    return NextResponse.json({ ok: false, error: 'Could not send. Please try again.' }, { status: 502 })
  }
}
