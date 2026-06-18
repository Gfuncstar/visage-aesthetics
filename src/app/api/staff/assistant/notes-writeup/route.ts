import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { isStaffAuthed } from '@/lib/staff-auth'
import { CLINIC_PROFILE } from '@/lib/assistant/opportunities'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type Payload = {
  transcript?: unknown
  treatment?: unknown
  specificArea?: unknown
  existing?: unknown
}

function str(v: unknown, max = 4000): string {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, max)
}

/**
 * Turn a spoken, dictated transcript into a concise, professional clinical
 * treatment note matching the house style of the patient notes sheet
 * (factual, British English, no marketing language).
 */
function writeupPrompt(transcript: string, treatment: string, specificArea: string, existing: string): string {
  const context = [
    treatment ? `- Treatment: ${treatment}` : '',
    specificArea ? `- Specific area: ${specificArea}` : '',
    existing ? `- Notes already typed (keep these, add to them, do not repeat):\n${existing}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return `${CLINIC_PROFILE}

You are tidying up a clinical note for the patient treatment record. The practitioner has just dictated additional notes out loud, and the speech has been transcribed. The raw transcript is messy: it may have filler words, false starts, repetition, and no punctuation.

${context ? `Context:\n${context}\n` : ''}
Raw dictation:
"""
${transcript}
"""

Rewrite this as a clear, professional clinical note for the "Additional notes" field of the patient record. Requirements:
- Factual, concise, objective clinical record style (like "Consultation form completed, contraindications and risks discussed, patient consented." not a letter or an email).
- British English. Plain, professional language. No marketing words, no flourish.
- Keep every clinical fact, observation, instruction and outcome that was dictated. Do not invent anything that was not said, and do not add advice that was not given.
- Fix grammar, remove filler and repetition, and order the points logically. Use short sentences or, where it reads better, semicolon-separated clauses.
- If several distinct points were dictated, you may use them as separate sentences in a single short paragraph.
- Do not address the patient. Do not sign off. Do not add a heading.
- If notes were already typed, fold the dictation in with them into one coherent note rather than duplicating.

Return valid JSON only:
{
  "notes": "string (the finished note, plain text)"
}`
}

export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 503 })
  }

  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const transcript = str(body.transcript, 4000)
  const treatment = str(body.treatment, 100)
  const specificArea = str(body.specificArea, 200)
  const existing = str(body.existing, 2000)

  if (!transcript) return NextResponse.json({ error: 'Nothing was recorded' }, { status: 400 })

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const msg = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 800,
      messages: [{ role: 'user', content: writeupPrompt(transcript, treatment, specificArea, existing) }],
    })

    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) {
      return NextResponse.json({ error: 'Could not parse AI response' }, { status: 502 })
    }

    const result = JSON.parse(raw.slice(start, end + 1)) as { notes?: string }
    const notes = (result.notes ?? '').trim()
    if (!notes) return NextResponse.json({ error: 'Could not write up the note' }, { status: 502 })

    return NextResponse.json({ ok: true, notes })
  } catch (err) {
    console.error('[notes-writeup]', err)
    return NextResponse.json({ error: 'AI write-up failed' }, { status: 502 })
  }
}
