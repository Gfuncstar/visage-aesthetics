import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { isStaffAuthed } from '@/lib/staff-auth'
import { CLINIC_PROFILE } from '@/lib/assistant/opportunities'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type Payload = {
  clientName?: unknown
  interest?: unknown
  notes?: unknown
  date?: unknown
}

function str(v: unknown, max = 2000): string {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, max)
}

export async function POST(req: Request) {
  if (!(await isStaffAuthed())) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 503 })
  }

  let body: Payload
  try { body = await req.json() as Payload } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const clientName = str(body.clientName, 100)
  const interest = str(body.interest, 300)
  const notes = str(body.notes, 3000)
  const date = str(body.date, 20)

  if (!clientName) return NextResponse.json({ error: 'Client name required' }, { status: 400 })

  const firstName = clientName.trim().split(/\s+/)[0] ?? clientName

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const prompt = `${CLINIC_PROFILE}

You are writing on behalf of Bernadette Tobin RGN. First person, warm, honest, British English, no marketing fluff.

A client just had a consultation. Details:
- Client first name: ${firstName}
- What they came in for: ${interest || 'not specified'}
- Date: ${date || 'today'}
- What was discussed: ${notes || 'not recorded'}

Do two things:

1. Write a consultation follow-up email to ${firstName}. Requirements:
   - Subject line (concise, specific to what they came in for)
   - Body: warm but professional, 3-4 paragraphs, first person as Bernadette
   - Reference specifically what was discussed — make it feel like a personal note, not a template
   - Be honest about timelines, costs, what to expect (no pressure, no pushy language)
   - End with: reassurance they can ask any questions, then sign off as Bernadette
   - If notes are sparse, write a warm general follow-up without inventing clinical details

2. Suggest 2-3 specific next steps for Bernadette (not the client) based on what was discussed. Short, actionable. For example: "Send Profhilo consent form", "Follow up in 2 weeks — they wanted to think it over", "Check if they're on blood thinners before booking".

Return valid JSON only:
{
  "email": {
    "subject": "string",
    "body": "string (plain text, use \\n\\n between paragraphs)"
  },
  "next_steps": ["string", "string", "string"]
}`

  try {
    const msg = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start === -1 || end === -1) {
      return NextResponse.json({ error: 'Could not parse AI response' }, { status: 502 })
    }

    const result = JSON.parse(raw.slice(start, end + 1)) as {
      email: { subject: string; body: string }
      next_steps: string[]
    }

    return NextResponse.json({ ok: true, email: result.email, next_steps: result.next_steps })
  } catch (err) {
    console.error('[consultation-ai]', err)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 502 })
  }
}
