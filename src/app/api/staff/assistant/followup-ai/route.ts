import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { isStaffAuthed } from '@/lib/staff-auth'
import { AGENT_MODEL } from '@/lib/assistant/model'
import { CLINIC_PROFILE } from '@/lib/assistant/opportunities'
import { getTreatmentType } from '@/lib/assistant/treatment-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type Payload = {
  clientName?: unknown
  treatmentTypeId?: unknown
  treatmentName?: unknown
  interest?: unknown
  notes?: unknown
  details?: unknown
  date?: unknown
}

function str(v: unknown, max = 2000): string {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, max)
}

function friendlyName(name: string): string {
  return name.replace(/\s*\(.*?\)\s*/g, ' ').trim().toLowerCase()
}

/** Prompt for the consultation follow-up (a summary of what was discussed). */
function consultationPrompt(firstName: string, interest: string, notes: string, date: string): string {
  return `${CLINIC_PROFILE}

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
}

/** Prompt for a post-treatment follow-up (a client-friendly summary of the visit). */
function treatmentPrompt(
  firstName: string,
  treatmentName: string,
  details: string,
  notes: string,
  aftercare: string[],
  followUp: string,
  date: string,
): string {
  return `${CLINIC_PROFILE}

You are writing on behalf of Bernadette Tobin RGN. First person, warm, honest, British English, no marketing fluff.

A client has just had a treatment with Bernadette. Details:
- Client first name: ${firstName}
- Treatment: ${treatmentName}
- Date: ${date || 'today'}
- What was done today (areas / product, if recorded): ${details || 'not recorded'}
- Clinician's notes (internal shorthand — for your understanding, NOT to be quoted verbatim): ${notes || 'not recorded'}
- Approved aftercare guidance for this treatment (you may reword warmly, but do not contradict or invent new clinical advice):
${aftercare.length ? aftercare.map((a) => `  - ${a}`).join('\n') : '  - (none on file)'}
- Follow-up plan: ${followUp || 'not specified'}

Do two things:

1. Write a follow-up email to ${firstName} that gives them a warm, personal summary of today. Requirements:
   - Subject line (concise, specific to the treatment)
   - Body: warm but professional, 3-4 short paragraphs, first person as Bernadette
   - Open by thanking them for coming in for their ${friendlyName(treatmentName)}
   - Give a short, friendly summary of what was done today, drawn from the notes — translate any clinical shorthand into plain, reassuring language. Do NOT expose internal/clinical jargon, and do NOT invent details that are not there
   - Fold in the key aftercare points so they know how to look after the area over the next few days
   - Include the follow-up / review plan where relevant
   - End with reassurance they can contact you any time if anything does not feel right, then sign off as Bernadette
   - If notes are sparse, write a warm general aftercare follow-up from the approved guidance without inventing specifics

2. Suggest 2-3 specific next steps for Bernadette (not the client) based on the treatment and notes. Short, actionable. For example: "Book the two-week review", "Send the next-session reminder in 4 weeks", "Check the bruising settled before the next area".

Return valid JSON only:
{
  "email": {
    "subject": "string",
    "body": "string (plain text, use \\n\\n between paragraphs)"
  },
  "next_steps": ["string", "string", "string"]
}`
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
  const treatmentTypeId = str(body.treatmentTypeId, 50)
  const treatmentName = str(body.treatmentName, 100)
  const interest = str(body.interest, 300)
  const notes = str(body.notes, 3000)
  const details = str(body.details, 500)
  const date = str(body.date, 20)

  if (!clientName) return NextResponse.json({ error: 'Client name required' }, { status: 400 })

  const firstName = clientName.trim().split(/\s+/)[0] ?? clientName
  const type = getTreatmentType(treatmentTypeId)
  const isConsult = treatmentTypeId === 'consultation'

  const prompt = isConsult
    ? consultationPrompt(firstName, interest, notes, date)
    : treatmentPrompt(
        firstName,
        // The write-up tool always passes a known type; the notes form passes a
        // free-text treatment name, so prefer that when given.
        treatmentName || type?.name || treatmentTypeId || 'treatment',
        details,
        notes,
        type?.aftercare ?? [],
        type?.followUp ?? '',
        date,
      )

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const msg = await client.messages.create({
      model: AGENT_MODEL,
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
    console.error('[followup-ai]', err)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 502 })
  }
}
