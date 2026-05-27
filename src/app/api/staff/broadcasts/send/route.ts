import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isStaffAuthed } from '@/lib/staff-auth'
import {
  buildBroadcastHtml,
  buildBroadcastText,
  type CtaKind,
} from '@/lib/broadcast-email'
import { customerEmails } from '@/lib/customers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const FROM_EMAIL =
  process.env.BROADCAST_FROM_EMAIL ??
  process.env.CONTACT_FROM_EMAIL ??
  'Visage Aesthetics <enquiries@vaclinic.co.uk>'

const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'
const BATCH_SIZE = 100
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Payload = {
  subject?: unknown
  preheader?: unknown
  headline?: unknown
  imageUrl?: unknown
  body?: unknown
  cta?: unknown
  recipients?: unknown
  audience?: unknown
  mode?: unknown
  testEmail?: unknown
}

function str(v: unknown, max: number): string {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, max)
}

function parseRecipients(input: unknown): { valid: string[]; invalid: string[] } {
  const valid = new Set<string>()
  const invalid: string[] = []
  if (typeof input !== 'string') return { valid: [], invalid: [] }
  const tokens = input
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter(Boolean)
  for (const token of tokens) {
    const lower = token.toLowerCase()
    if (EMAIL_RE.test(lower)) {
      valid.add(lower)
    } else {
      invalid.push(token)
    }
  }
  return { valid: Array.from(valid), invalid }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export async function POST(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Mail service not configured (RESEND_API_KEY missing).' },
      { status: 500 },
    )
  }

  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const subject = str(body.subject, 200)
  const preheader = str(body.preheader, 200)
  const headline = str(body.headline, 200)
  const imageUrl = str(body.imageUrl, 1000)
  const bodyText = str(body.body, 20000)
  const cta: CtaKind =
    body.cta === 'book' || body.cta === 'contact' ? body.cta : 'none'
  const mode = body.mode === 'test' ? 'test' : 'send'

  if (!subject) {
    return NextResponse.json({ error: 'Subject is required.' }, { status: 400 })
  }
  if (!bodyText && !headline) {
    return NextResponse.json(
      { error: 'Add a headline or some body text.' },
      { status: 400 },
    )
  }
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    return NextResponse.json(
      { error: 'Image URL must start with http:// or https://' },
      { status: 400 },
    )
  }

  let targets: string[]
  if (mode === 'test') {
    const testEmail = str(body.testEmail, 200).toLowerCase()
    if (!EMAIL_RE.test(testEmail)) {
      return NextResponse.json(
        { error: 'Provide a valid test email.' },
        { status: 400 },
      )
    }
    targets = [testEmail]
  } else {
    if (body.audience === 'customers') {
      targets = customerEmails()
    } else {
      const { valid, invalid } = parseRecipients(body.recipients)
      if (valid.length === 0) {
        return NextResponse.json(
          {
            error:
              invalid.length > 0
                ? `No valid recipients (${invalid.length} entries could not be parsed).`
                : 'No recipients provided.',
          },
          { status: 400 },
        )
      }
      targets = valid
    }
  }

  if (targets.length === 0) {
    return NextResponse.json({ error: 'No recipients to send to.' }, { status: 400 })
  }

  const resend = new Resend(apiKey)
  const batches = chunk(targets, BATCH_SIZE)

  let sent = 0
  const failures: Array<{ error: string }> = []

  for (const batch of batches) {
    const payload = batch.map((to) => ({
      from: FROM_EMAIL,
      to: [to],
      replyTo: REPLY_TO,
      subject: mode === 'test' ? `[TEST] ${subject}` : subject,
      html: buildBroadcastHtml({
        preheader,
        headline,
        imageUrl,
        body: bodyText,
        cta,
        recipientEmail: to,
      }),
      text: buildBroadcastText({
        headline,
        imageUrl,
        body: bodyText,
        cta,
        recipientEmail: to,
      }),
      headers: {
        'List-Unsubscribe': `<mailto:${REPLY_TO}?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }))

    try {
      const { data, error } = await resend.batch.send(payload)
      if (error) {
        console.error('[broadcasts] Resend error', {
          mode,
          batchSize: batch.length,
          firstRecipient: batch[0],
          error,
        })
        failures.push({ error: error.message || 'Batch send failed' })
        continue
      }
      const ids = data?.data?.map((e) => e.id) ?? []
      console.log('[broadcasts] Resend accepted', {
        mode,
        batchSize: batch.length,
        firstRecipient: batch[0],
        ids,
      })
      sent += ids.length || batch.length
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown send error'
      console.error('[broadcasts] send threw', {
        mode,
        batchSize: batch.length,
        firstRecipient: batch[0],
        error: msg,
      })
      failures.push({ error: msg })
    }
  }

  return NextResponse.json({
    ok: failures.length === 0,
    sent,
    total: targets.length,
    failures: failures.slice(0, 5),
  })
}
