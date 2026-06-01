import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, insertMany, audit } from '@/lib/assistant/db'
import { dueRebookings, rebookEmail, recallDays } from '@/lib/assistant/rebook'
import { isSuppressed } from '@/lib/assistant/suppression'
import { recordMessage } from '@/lib/assistant/messages'
import { buildBroadcastHtml, buildBroadcastText } from '@/lib/broadcast-email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Same sender identity as the Broadcasts tool, so rebooking emails match.
const FROM_EMAIL =
  process.env.BROADCAST_FROM_EMAIL ?? 'Bernadette | Visage Aesthetics <enquiries@vaclinic.co.uk>'
const REPLY_TO = process.env.BROADCAST_REPLY_TO ?? 'info@vaclinic.co.uk'

// POST { markKey } — email the due-back nudge to the matched client using the
// shared broadcast template, then mark the nudge contacted. The recipient
// address is resolved server-side (never trusted from the client).
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Mail service not configured (RESEND_API_KEY missing).' }, { status: 500 })
  }

  let markKey = ''
  try {
    const b = (await req.json()) as { markKey?: unknown }
    if (typeof b.markKey === 'string') markKey = b.markKey.slice(0, 300)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!markKey) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  // Re-derive the list so the recipient and content are trusted server-side.
  const item = (await dueRebookings()).find((i) => i.markKey === markKey)
  if (!item) return NextResponse.json({ error: 'That client is no longer on the due list.' }, { status: 409 })
  if (!item.email) return NextResponse.json({ error: 'No email on file for this client.' }, { status: 422 })
  // Defence in depth: never email a suppressed client.
  if (await isSuppressed(item.clientName, item.email)) {
    return NextResponse.json({ error: 'This client is marked do-not-contact.' }, { status: 403 })
  }

  const { subject, preheader, headline, body } = rebookEmail(item)
  const resend = new Resend(apiKey)
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [item.email],
      replyTo: REPLY_TO,
      subject,
      html: buildBroadcastHtml({ preheader, headline, body, cta: 'book', recipientEmail: item.email }),
      text: buildBroadcastText({ headline, body, cta: 'book', recipientEmail: item.email }),
      headers: {
        'List-Unsubscribe': `<mailto:${REPLY_TO}?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })
    if (error) return NextResponse.json({ error: error.message || 'Send failed' }, { status: 502 })
    await recordMessage({ clientName: item.clientName, email: item.email, channel: 'email', kind: 'rebook', subject, body })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Send failed' }, { status: 502 })
  }

  // Mark contacted so the client drops off until the next recall cycle.
  const group = markKey.split('|')[1] ?? ''
  const days = recallDays(group) ?? 120
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + days)
  try {
    await insertMany('rebook_marks', [{ mark_key: markKey, action: 'contacted', snooze_until: d.toISOString().slice(0, 10) }], {
      onConflict: 'mark_key',
    })
    await audit('send', 'rebook_email', markKey, { email: item.email })
  } catch {
    /* email already sent; marking is best-effort */
  }

  return NextResponse.json({ ok: true })
}
