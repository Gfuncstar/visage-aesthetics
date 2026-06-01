import { NextResponse } from 'next/server'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'
import { londonToday } from '@/lib/booking-engine/time'
import { summariseAction, type Action } from '@/lib/assistant/command'
import type { Service } from '@/lib/booking-engine/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// POST { text } — parse a dictated/typed instruction into a structured action.
// Returns the action plus a plain-English summary to confirm before executing.
export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  if (!assistantConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI is not configured.' }, { status: 500 })

  let text = ''
  try {
    const b = (await req.json()) as { text?: unknown }
    if (typeof b.text === 'string') text = b.text.trim().slice(0, 1000)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!text) return NextResponse.json({ error: 'Nothing to do.' }, { status: 400 })

  const services = await select<Service>('services', { active: 'eq.true', order: 'display_order.asc', limit: 100 })
  const action = await parse(text, services, apiKey)
  return NextResponse.json({ action, summary: summariseAction(action) })
}

async function parse(text: string, services: Service[], apiKey: string): Promise<Action> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey })
  const serviceList = services.map((s) => `${s.slug} (${s.name})`).join(', ')
  const system = `You convert a clinic owner's quick instruction (often dictated) into ONE structured action for a booking system. Today is ${londonToday()} (a UK clinic, Europe/London). Resolve relative dates ("Thursday", "tomorrow", "next week") to YYYY-MM-DD. Times are 24h "HH:MM".

Available treatments (use the slug on the left): ${serviceList}

Return ONLY a JSON object, one of:
{"type":"book","service":<slug>,"date":"YYYY-MM-DD","time":"HH:MM","clientName":string,"phone":string|null}
{"type":"cancel","clientName":string,"date":"YYYY-MM-DD"|null}
{"type":"block_time","date":"YYYY-MM-DD","startTime":"HH:MM","endTime":"HH:MM","reason":string|null}
{"type":"waitlist","clientName":string,"service":<slug>|null,"phone":string|null}
{"type":"flag","clientName":string,"flag":"block"|"deposit"|"do_not_contact","value":true|false}
{"type":"unknown","reason":string}

Rules:
- Pick the single best-matching treatment slug. If none fits a booking, use "unknown".
- "block out", "I'm away", "lunch", "day off" -> block_time (for a whole day use startTime 09:00 endTime 17:00 unless stated).
- "difficult", "block this client", "stop them booking" -> flag block true. "needs to pay a deposit" -> flag deposit true. "do not contact" -> flag do_not_contact true.
- If you are missing something essential (no name, no time for a booking), use "unknown" with a short reason saying what is missing.
- Output the JSON only, no prose.`

  try {
    const res = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 400,
      system,
      messages: [{ role: 'user', content: text }],
    })
    const out = res.content.filter((b) => b.type === 'text').map((b) => (b as { text: string }).text).join('')
    const m = out.match(/\{[\s\S]*\}/)
    if (!m) return { type: 'unknown', reason: 'I could not understand that.' }
    return JSON.parse(m[0]) as Action
  } catch (err) {
    console.error('[command] parse failed', err)
    return { type: 'unknown', reason: 'I could not understand that.' }
  }
}
