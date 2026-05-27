import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { isStaffAuthed } from '@/lib/staff-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MODEL = 'claude-opus-4-7'

const SYSTEM_PROMPT = `You write short patient broadcast emails for Visage Aesthetics, a small private clinic in Braintree, Essex. They are bylined by Bernadette Tobin, a registered nurse with 20+ years of clinical experience.

Voice (Bernadette's):
- Calm, clinical, conservative. Past needing to prove anything.
- First person where natural ("I", "in the clinic"). Never breathy or self-promotional.
- British English spelling (colour, realised, organisation).
- No exclamation marks. No emojis.
- HARD BAN: no em-dashes (—) anywhere. No en-dashes (–). Use commas, full stops, colons, or parentheses. Restructure sentences if they pull toward an em-dash.
- HARD BAN on AI-tells: "delve", "navigate", "tapestry", "landscape", "in today's", "it's worth noting", "moreover", "furthermore", "robust", "leverage", "underscores", "highlights the importance of", "in the realm of".
- HARD BAN on marketing words: "amazing", "transformative", "game-changing", "stunning", "absolutely", "truly", "luxurious", "journey", "transformation".
- Concrete numbers (3 to 4 months, 0.5ml, two-week review) beat vague language ("a while").
- Honest about the industry — aesthetics is largely unregulated, casual training is common. Bernadette positions Visage by genuinely high standards, never by attacking competitors.

Format:
- Output a single JSON object, nothing else (no markdown fence, no commentary).
- Fields:
  - subject (string, under 60 chars): inbox subject line, calm and specific, no clickbait.
  - preheader (string, under 90 chars): the inbox preview text under the subject.
  - headline (string, under 70 chars): the large italic headline at the top of the email — a sentence, not a label.
  - body (string, 80 to 170 words): the body text. Plain paragraphs separated by blank lines. May use **bold**, *italic*, [text](url), > pullquote, --- divider. Open with a warm, specific line, then earn the read.
  - imageQuery (string, 2 to 4 words): a short photo search term for Unsplash that captures the mood of the email. Avoid clinical photos of patients receiving treatment. Prefer atmospheric or lifestyle imagery (e.g. "linen morning light", "spring english garden", "warm bathroom mirror").

Do not write a sign-off, closing line, or Bernadette's name at the end of the body. A standard signature image (a note from Bernadette and her handwritten signature) is appended automatically by the email template, so the body should end on its last substantive sentence. Never include a literal CTA button or link in the body — that's added separately by the system.`

type DraftResult = {
  subject: string
  preheader: string
  headline: string
  body: string
  imageQuery: string
}

const REQUIRED_KEYS: (keyof DraftResult)[] = [
  'subject',
  'preheader',
  'headline',
  'body',
  'imageQuery',
]

function extractJson(raw: string): unknown {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = (fenced ? fenced[1] : trimmed).trim()
  return JSON.parse(candidate)
}

function isValidDraft(value: unknown): value is DraftResult {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return REQUIRED_KEYS.every((k) => typeof v[k] === 'string' && (v[k] as string).length > 0)
}

export async function POST(req: Request) {
  if (!(await isStaffAuthed())) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI drafting is not configured (ANTHROPIC_API_KEY missing).' },
      { status: 500 },
    )
  }

  let topic = ''
  try {
    const body = (await req.json()) as { topic?: unknown }
    if (typeof body.topic === 'string') topic = body.topic.trim().slice(0, 600)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!topic) {
    return NextResponse.json({ error: 'Topic is required.' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Topic: ${topic}\n\nWrite the broadcast email now. Return only the JSON object.`,
        },
      ],
    })

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()

    if (!text) {
      return NextResponse.json({ error: 'Model returned no content.' }, { status: 502 })
    }

    let parsed: unknown
    try {
      parsed = extractJson(text)
    } catch {
      return NextResponse.json(
        { error: 'Model did not return valid JSON.', raw: text.slice(0, 600) },
        { status: 502 },
      )
    }

    if (!isValidDraft(parsed)) {
      return NextResponse.json(
        { error: 'Model output missing required fields.', raw: parsed },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true, draft: parsed })
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'Invalid Anthropic API key.' }, { status: 500 })
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: 'Rate limited by Claude API. Try again in a minute.' },
        { status: 429 },
      )
    }
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[broadcasts/draft] failed', message)
    return NextResponse.json({ error: `Drafting failed: ${message}` }, { status: 502 })
  }
}
