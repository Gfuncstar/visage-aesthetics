import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select, insert } from '@/lib/assistant/db'
import { AGENT_MODEL } from '@/lib/assistant/model'
import { sendPush } from '@/lib/assistant/push'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 180

async function authorised(req: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization') || ''
    if (auth === `Bearer ${cronSecret}`) return true
  }
  return isStaffAuthed()
}

type Enquiry = {
  id: string
  treatment: string | null
  message: string | null
  created_at: string
}

type FaqQuestion = {
  question: string
  answer: string
  treatment: string | null
}

async function run() {
  if (!assistantConfigured()) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'Clinic database not configured' })
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'ANTHROPIC_API_KEY not set' })
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  let enquiries: Enquiry[] = []
  try {
    enquiries = await select<Enquiry>('contact_enquiries', {
      created_at: `gte.${cutoffStr}`,
      order: 'created_at.desc',
      limit: 200,
    })
  } catch {
    return NextResponse.json({ ok: true, skipped: true, reason: 'contact_enquiries table not available' })
  }

  if (enquiries.length < 5) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: `Insufficient data (${enquiries.length} enquiries — need at least 5)`,
    })
  }

  // Strip PII before sending to Claude
  const anonymised = enquiries
    .filter((e) => e.message && e.message.trim().length > 20)
    .map((e) => ({ treatment: e.treatment || 'not specified', message: e.message!.slice(0, 400) }))

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const prompt = `You are helping a nurse-led aesthetics clinic improve their FAQ page. Analyse these anonymised client enquiry messages and identify 3–5 questions or concerns that recur across multiple messages. For each, write a suggested FAQ question and a draft answer in the voice of Bernadette Tobin RGN MSc (calm, honest, direct, British English — no marketing fluff).

Enquiries: ${JSON.stringify(anonymised)}

Return valid JSON only: {"questions":[{"question":"...","answer":"...","treatment":"... or null"}],"top_treatments":["..."]}`

  let questions: FaqQuestion[] = []
  let topTreatments: string[] = []

  try {
    const msg = await client.messages.create({
      model: AGENT_MODEL,
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { questions: FaqQuestion[]; top_treatments: string[] }
      questions = parsed.questions ?? []
      topTreatments = parsed.top_treatments ?? []
    }
  } catch {
    return NextResponse.json({ ok: false, error: 'Claude analysis failed' }, { status: 502 })
  }

  const now = new Date()
  const monthLabel = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  try {
    await insert('opportunities', {
      kind: 'faq_suggestion',
      title: `FAQ suggestions — ${monthLabel}`,
      body: JSON.stringify({ questions, top_treatments: topTreatments, enquiries_analysed: anonymised.length }),
      status: 'new',
      source: 'faq-updater-agent',
      created_at: now.toISOString(),
    })
  } catch {
    // non-fatal
  }

  await sendPush({
    title: 'FAQ suggestions ready',
    body: `${anonymised.length} enquiries analysed — ${questions.length} suggestions for ${monthLabel}`,
    url: '/staff/assistant/opportunities',
  })

  return NextResponse.json({
    ok: true,
    enquiries_analysed: anonymised.length,
    suggestions: questions.length,
    top_treatments: topTreatments,
  })
}

export async function GET(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}

export async function POST(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}
