import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { AGENT_MODEL } from '@/lib/assistant/model'
import { assistantConfigured, select, insertMany, audit } from '@/lib/assistant/db'
import { describeAvailability, firstFreeStart, friendlyTime, type DayAppt } from '@/lib/assistant/slots'
import { ukDate } from '@/lib/assistant/format'
import { BOOKING_URL } from '@/lib/booking'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type BookingRequest = {
  id: string
  client_name: string
  treatment: string | null
  contact: string | null
  preferred_date: string | null
  preferred_note: string | null
  suggested: string | null
  draft_reply: string | null
  status: string
  created_at: string
}

// A warm, ready-to-send reply offering the client a time + the self-booking
// link, so they book it themselves in Ovatu (no entry needed from the clinic).
function buildReply(p: Parsed, proposedStart: number | null): string {
  const first = p.clientName.split(/\s+/)[0] || 'there'
  if (p.preferredDate && proposedStart != null) {
    const day = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(
      new Date(`${p.preferredDate}T12:00:00`),
    )
    return `Hi ${first}, I can fit you in on ${day} at ${friendlyTime(proposedStart)}. Book it here to confirm: ${BOOKING_URL}`
  }
  if (p.preferredDate) {
    const day = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(
      new Date(`${p.preferredDate}T12:00:00`),
    )
    return `Hi ${first}, ${day} is full I'm afraid, but you can grab another time that suits here: ${BOOKING_URL}`
  }
  return `Hi ${first}, I'd love to fit you in. Pick a time that suits you here: ${BOOKING_URL}`
}

// GET — the current to-book list.
export async function GET() {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ requests: [], configured: false })
  try {
    const requests = await select<BookingRequest>('booking_requests', {
      status: 'eq.to_book',
      order: 'created_at.desc',
      limit: 100,
    })
    return NextResponse.json({ requests, configured: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Load failed' }, { status: 502 })
  }
}

type Parsed = {
  clientName: string
  treatment: string | null
  contact: string | null
  preferredDate: string | null
  preferredNote: string | null
}

// POST { text } — parse a voice/typed note into one or more booking requests,
// suggest the best free slot for each from the live diary, and save them.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI is not configured (ANTHROPIC_API_KEY missing).' }, { status: 500 })

  let text = ''
  try {
    const b = (await req.json()) as { text?: unknown }
    if (typeof b.text === 'string') text = b.text.trim().slice(0, 4000)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!text) return NextResponse.json({ error: 'Nothing to read.' }, { status: 400 })

  const today = new Date().toISOString().slice(0, 10)
  const parsed = await parseRequests(text, today, apiKey)
  if (parsed.length === 0) {
    return NextResponse.json({ error: 'Could not pick out a booking request. Try again with a name and rough time.' }, { status: 422 })
  }

  // For each request: check the diary, propose a slot, and draft a client reply.
  const enriched = await Promise.all(parsed.map(async (p) => {
    let suggested: string | null = null
    let proposedStart: number | null = null
    if (p.preferredDate) {
      try {
        const day = await select<DayAppt>('appointments', {
          date: `eq.${p.preferredDate}`,
          status: 'neq.cancelled',
          select: 'starts_at,ends_at,status',
          limit: 100,
        })
        suggested = `${ukDate(p.preferredDate)}: ${describeAvailability(day)}`
        proposedStart = firstFreeStart(day)
      } catch {
        /* ignore */
      }
    }
    return { ...p, suggested, draftReply: buildReply(p, proposedStart) }
  }))

  try {
    const rows = await insertMany<BookingRequest>('booking_requests', enriched.map((p) => ({
      client_name: p.clientName,
      treatment: p.treatment,
      contact: p.contact,
      preferred_date: p.preferredDate,
      preferred_note: p.preferredNote,
      suggested: p.suggested,
      draft_reply: p.draftReply,
      raw_text: text,
      status: 'to_book',
    })))
    await audit('create', 'booking_request', undefined, { count: rows.length })
    return NextResponse.json({ ok: true, requests: rows })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Save failed' }, { status: 502 })
  }
}

async function parseRequests(text: string, today: string, apiKey: string): Promise<Parsed[]> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey })
  const system = `You turn a clinic owner's quick note (often dictated) about people wanting to "squeeze in" for an appointment into structured booking requests. Today is ${today} (a UK clinic). Return ONLY a JSON array; each item:
{"clientName": string, "treatment": string|null, "contact": string|null, "preferredDate": "YYYY-MM-DD"|null, "preferredNote": string|null}
Rules:
- One object per person mentioned. If only one person, an array of one.
- Resolve relative dates against today (e.g. "Thursday next week", "tomorrow afternoon") to a concrete preferredDate when you reasonably can; otherwise null.
- preferredNote keeps their raw timing words ("Thursday afternoon", "any morning") and any useful context.
- treatment is the treatment they asked for, or null.
- contact is a phone/email if present, else null.
- Do not invent details that are not in the note.`
  try {
    const res = await client.messages.create({
      model: AGENT_MODEL,
      max_tokens: 1200,
      system,
      messages: [{ role: 'user', content: text }],
    })
    const out = res.content.filter((b) => b.type === 'text').map((b) => (b as { text: string }).text).join('\n')
    const match = out.match(/\[[\s\S]*\]/)
    if (!match) return []
    const arr = JSON.parse(match[0]) as Record<string, unknown>[]
    return arr
      .map((o) => ({
        clientName: String(o.clientName ?? '').trim().slice(0, 200),
        treatment: o.treatment ? String(o.treatment).slice(0, 120) : null,
        contact: o.contact ? String(o.contact).slice(0, 120) : null,
        preferredDate: /^\d{4}-\d{2}-\d{2}$/.test(String(o.preferredDate)) ? String(o.preferredDate) : null,
        preferredNote: o.preferredNote ? String(o.preferredNote).slice(0, 300) : null,
      }))
      .filter((p) => p.clientName)
  } catch (err) {
    console.error('[squeeze-in] parse failed', err)
    return []
  }
}
