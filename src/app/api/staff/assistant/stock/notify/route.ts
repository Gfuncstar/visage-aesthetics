import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'
import { stockReview } from '@/lib/assistant/stock'
import { sendPush } from '@/lib/assistant/push'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Sends a push reminder when tomorrow's clients need stock ordering. Called
// daily by the scheduler (with ?key=<push_cron_secret>), or by signed-in staff
// (?test=1 sends a test push to confirm it works).
export async function GET(req: Request) {
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const url = new URL(req.url)
  const key = url.searchParams.get('key') ?? ''
  const isStaff = await isStaffAuthed()

  let secretOk = false
  try {
    const rows = await select<{ value: string }>('app_config', { key: 'eq.push_cron_secret', limit: 1 })
    secretOk = Boolean(rows[0]?.value) && key === rows[0].value
  } catch {
    /* ignore */
  }
  if (!secretOk && !isStaff) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })

  // A staff "send me a test" ping.
  if (isStaff && url.searchParams.get('test') === '1') {
    const res = await sendPush({ title: 'Visage Assistant', body: 'Notifications are working.', url: '/staff/assistant' })
    return NextResponse.json({ ok: true, test: true, ...res })
  }

  const review = await stockReview()
  if (!review || review.urgentItems.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, reason: 'nothing urgent' })
  }
  const res = await sendPush({
    title: 'Order before 3pm',
    body: `Tomorrow's clients need: ${review.urgentItems.join(', ')}. Order before 3pm for next-day delivery.`,
    url: '/staff/assistant/stock',
  })
  return NextResponse.json({ ok: true, items: review.urgentItems, ...res })
}
