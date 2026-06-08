import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured } from '@/lib/assistant/db'
import { londonToday } from '@/lib/booking-engine/time'
import { runReport, type ReportQuery } from '@/lib/assistant/reports'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// POST { text } — answer a natural-language question about the clinic's data.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI is not configured.' }, { status: 500 })

  let text = ''
  try {
    const b = (await req.json()) as { text?: unknown }
    if (typeof b.text === 'string') text = b.text.trim().slice(0, 500)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!text) return NextResponse.json({ error: 'Ask me something.' }, { status: 400 })

  try {
    const query = await parse(text, apiKey)
    const answer = await runReport(query)
    return NextResponse.json({ answer })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not answer' }, { status: 502 })
  }
}

async function parse(text: string, apiKey: string): Promise<ReportQuery> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey })
  const system = `You turn a clinic receptionist's question into ONE structured report query over their appointment data. Today is ${londonToday()} (UK clinic). Resolve relative dates ("last month", "this year", "since January") to YYYY-MM-DD from/to.

Return ONLY a JSON object, one of:
{"intent":"count_treatments","service":<treatment name or null>,"from":"YYYY-MM-DD"|null,"to":"YYYY-MM-DD"|null}
{"intent":"revenue","service":<treatment name or null>,"from":"YYYY-MM-DD"|null,"to":"YYYY-MM-DD"|null}
{"intent":"lapsed_clients","since":"YYYY-MM-DD"}
{"intent":"busy_day","which":"busiest"|"quietest","from":"YYYY-MM-DD"|null,"to":"YYYY-MM-DD"|null}
{"intent":"top_clients","by":"spend"|"visits","limit":number|null}
{"intent":"no_show_rate","from":"YYYY-MM-DD"|null,"to":"YYYY-MM-DD"|null}
{"intent":"count_upcoming"}
{"intent":"last_visit","clientName":string}
{"intent":"client_history","clientName":string,"limit":number|null}
{"intent":"next_appointment","clientName":string}
{"intent":"waitlist_check","service":string|null}
{"intent":"unknown","reason":string}

Rules:
- "service" is a treatment name like "Botox", "filler", "Profhilo", or null for all treatments.
- last_visit: "when did [name] last come in?", "when was [name]'s last appointment?", "has [name] been before?" → last_visit with clientName.
- client_history: "what has [name] had done?", "show me [name]'s history", "what treatments has [name] had?" → client_history.
- next_appointment: "when is [name] coming in?", "when is [name]'s next appointment?", "what time is [name]?" → next_appointment.
- waitlist_check: "who's on the waitlist?", "is anyone waiting for Profhilo?", "show me the waitlist" → waitlist_check.
- Use "unknown" with a short reason if the question cannot be answered from appointment data.
- Output the JSON only, no prose.`

  try {
    const res = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 300,
      system,
      messages: [{ role: 'user', content: text }],
    })
    const out = res.content.filter((b) => b.type === 'text').map((b) => (b as { text: string }).text).join('')
    const m = out.match(/\{[\s\S]*\}/)
    if (!m) return { intent: 'unknown', reason: 'I could not understand the question.' }
    return JSON.parse(m[0]) as ReportQuery
  } catch (err) {
    console.error('[ask] parse failed', err)
    return { intent: 'unknown', reason: 'I could not understand the question.' }
  }
}
