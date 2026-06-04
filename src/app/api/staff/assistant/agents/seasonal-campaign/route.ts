import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, insert } from '@/lib/assistant/db'
import { sendPush } from '@/lib/assistant/push'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120

async function authorised(req: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization') || ''
    if (auth === `Bearer ${cronSecret}`) return true
  }
  return isStaffAuthed()
}

function mothersDay(year: number): Date {
  const mar1 = new Date(year, 2, 1)
  const dow = mar1.getDay()
  const firstSun = new Date(year, 2, dow === 0 ? 1 : 8 - dow)
  return new Date(year, 2, firstSun.getDate() + 14)
}

function blackFriday(year: number): Date {
  const nov1 = new Date(year, 10, 1)
  const dow = nov1.getDay()
  const firstFriOffset = dow <= 5 ? 5 - dow : 12 - dow
  const firstFri = new Date(year, 10, 1 + firstFriOffset)
  return new Date(year, 10, firstFri.getDate() + 21)
}

type Campaign = {
  name: string
  date: Date
  treatment: string
  angle: string
}

function campaigns(year: number): Campaign[] {
  return [
    {
      name: "Valentine's Day",
      date: new Date(year, 1, 14),
      treatment: 'lip filler and skin quality treatments',
      angle: 'feeling confident and radiant for Valentine\'s Day',
    },
    {
      name: "Mother's Day",
      date: mothersDay(year),
      treatment: 'Profhilo and skin quality treatments',
      angle: 'a gift of natural-looking rejuvenation for Mother\'s Day',
    },
    {
      name: 'Summer',
      date: new Date(year, 5, 1),
      treatment: 'AQUALYX fat-dissolving and micro-needling',
      angle: 'feeling your best for summer',
    },
    {
      name: 'Autumn Refresh',
      date: new Date(year, 8, 1),
      treatment: 'anti-wrinkle injections and Profhilo',
      angle: 'refreshing your look for autumn',
    },
    {
      name: 'Christmas Party Season',
      date: new Date(year, 10, 10),
      treatment: 'anti-wrinkle injections and dermal filler',
      angle: 'looking and feeling your best for the Christmas party season',
    },
    {
      name: 'Black Friday',
      date: blackFriday(year),
      treatment: 'starter treatments like B12 injections and CryoPen',
      angle: 'accessible entry points to aesthetic treatments',
    },
  ]
}

async function run() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const year = today.getFullYear()

  const triggered = campaigns(year).find((c) => {
    const campaignDay = new Date(c.date.getFullYear(), c.date.getMonth(), c.date.getDate())
    const diff = Math.round((campaignDay.getTime() - today.getTime()) / 86400000)
    return diff === 42
  })

  if (!triggered) {
    return NextResponse.json({ ok: true, triggered: false })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: true, triggered: true, campaign: triggered.name, skipped: true, reason: 'ANTHROPIC_API_KEY not set' })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const prompt = `Write a campaign email draft for Visage Aesthetics, a nurse-led aesthetics clinic in Braintree, Essex run by Bernadette Tobin RGN. Campaign: ${triggered.name}. Featured treatments: ${triggered.treatment}. Angle: ${triggered.angle}.

Requirements:
- Subject line: concise, warm, not clickbait
- Body: 2-3 short paragraphs in Bernadette's voice (first person, calm, honest, British)
- Not salesy — educational and reassuring
- Clear single CTA at the end: "Book your consultation at vaclinic.co.uk"
- No bullet points in the body

Return valid JSON only: {"subject":"...","body":"..."}`

  let subject = `${triggered.name} campaign`
  let body = ''

  try {
    const msg = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { subject: string; body: string }
      subject = parsed.subject || subject
      body = parsed.body || ''
    }
  } catch {
    // proceed with empty body — still log the opportunity
  }

  if (assistantConfigured()) {
    try {
      await insert('opportunities', {
        kind: 'campaign',
        title: subject,
        body,
        status: 'new',
        source: 'seasonal-agent',
        created_at: new Date().toISOString(),
      })
    } catch {
      // opportunities table insert failure is non-fatal
    }

    await sendPush({
      title: `Campaign draft: ${triggered.name}`,
      body: `42 days to go — email draft ready to review`,
      url: '/staff/assistant/opportunities',
    })
  }

  return NextResponse.json({ ok: true, triggered: true, campaign: triggered.name, days_until: 42, subject })
}

export async function GET(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}

export async function POST(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}
