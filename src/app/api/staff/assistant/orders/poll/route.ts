import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured } from '@/lib/assistant/db'
import { graphConfigured, inboxConnection, fetchRecentMessages, looksLikeOrder } from '@/lib/assistant/graph-inbox'
import { ingestOrderEmail, htmlToText } from '@/lib/assistant/order-ingest'
import { withHeartbeat } from '@/lib/assistant/heartbeat'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120

// Polls the clinic inbox via Microsoft Graph and ingests any new supplier
// order emails into the review queue. Runs on a schedule (Vercel cron) and can
// also be triggered manually by signed-in staff ("Check inbox now").
//
// Auth: a signed-in staff member, OR a cron call carrying the CRON_SECRET
// (Authorization: Bearer <CRON_SECRET>).
async function authorised(req: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization') || ''
    if (auth === `Bearer ${cronSecret}`) return true
  }
  return isStaffAuthed()
}

async function run() {
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }
  if (!graphConfigured()) {
    return NextResponse.json(
      { error: 'Inbox monitoring is not configured (MS_GRAPH_CLIENT_ID / MS_GRAPH_CLIENT_SECRET missing).' },
      { status: 503 },
    )
  }
  const conn = await inboxConnection()
  if (!conn.connected) {
    return NextResponse.json(
      { error: 'The order inbox is not connected yet. Use "Connect inbox" on the Orders page.' },
      { status: 409 },
    )
  }

  // Look back over the last 3 days each run; dedupe handles overlap.
  const since = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  let messages
  try {
    messages = await fetchRecentMessages({ sinceIso: since, top: 40 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Graph fetch failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  let created = 0
  let duplicates = 0
  let skipped = 0
  let errors = 0

  for (const m of messages) {
    const text = (m.bodyText || htmlToText(m.bodyHtml)).slice(0, 20000)
    if (!looksLikeOrder(m.subject, m.from, text)) {
      skipped++
      continue
    }
    const outcome = await ingestOrderEmail(
      { from: m.from, subject: m.subject, text, date: m.receivedDateTime },
      m.internetMessageId || m.id,
    )
    if (outcome.status === 'created') created++
    else if (outcome.status === 'duplicate') duplicates++
    else errors++
  }

  return NextResponse.json({
    ok: true,
    scanned: messages.length,
    created,
    duplicates,
    skipped,
    errors,
  })
}

export async function GET(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return withHeartbeat('orders-poll', () => run())
}

export async function POST(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}
