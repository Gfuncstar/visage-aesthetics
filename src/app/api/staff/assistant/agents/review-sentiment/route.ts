import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import Anthropic from '@anthropic-ai/sdk'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, insert } from '@/lib/assistant/db'
import { AGENT_MODEL } from '@/lib/assistant/model'
import { reviews as staticReviews } from '@/lib/reviews'

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

type ReviewInput = { rating: number; text: string; treatment?: string }

type SentimentResult = {
  positive_themes: string[]
  concern_themes: string[]
  summary: string
  action: string | null
}

async function fetchLiveReviews(): Promise<ReviewInput[]> {
  const placeId = process.env.GOOGLE_PLACE_ID
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!placeId || !apiKey) return []

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { result?: { reviews?: Array<{ rating: number; text: string }> } }
    return (data.result?.reviews ?? []).map((r) => ({ rating: r.rating, text: r.text }))
  } catch {
    return []
  }
}

function dedupeReviews(a: ReviewInput[], b: ReviewInput[]): ReviewInput[] {
  const seen = new Set(a.map((r) => r.text.slice(0, 60)))
  return [...a, ...b.filter((r) => !seen.has(r.text.slice(0, 60)))]
}

async function run() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'ANTHROPIC_API_KEY not set' })
  }

  const liveReviews = await fetchLiveReviews()
  const allReviews = dedupeReviews(
    staticReviews.map((r) => ({ rating: r.rating, text: r.text, treatment: r.treatment })),
    liveReviews,
  )

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const prompt = `Analyse these Google reviews for a nurse-led aesthetics clinic. Identify: (1) top 3 recurring positive themes, (2) any recurring concerns (return empty array if none), (3) a 2-sentence sentiment summary, (4) one actionable suggestion if concern found, otherwise null.

Reviews: ${JSON.stringify(allReviews.map((r) => ({ rating: r.rating, text: r.text.slice(0, 300), treatment: r.treatment })))}

Return valid JSON only: {"positive_themes":["..."],"concern_themes":["..."],"summary":"...","action":"..." or null}`

  let result: SentimentResult = {
    positive_themes: [],
    concern_themes: [],
    summary: '',
    action: null,
  }

  try {
    const msg = await client.messages.create({
      model: AGENT_MODEL,
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) result = JSON.parse(jsonMatch[0]) as SentimentResult
  } catch {
    return NextResponse.json({ ok: false, error: 'Claude analysis failed' }, { status: 502 })
  }

  // Log to sentiment table (graceful if missing)
  if (assistantConfigured()) {
    try {
      await insert('review_sentiment_log', {
        analyzed_at: new Date().toISOString(),
        total_reviews: allReviews.length,
        themes_positive: JSON.stringify(result.positive_themes),
        themes_concern: JSON.stringify(result.concern_themes),
        summary: result.summary,
        action_needed: result.concern_themes.length > 0,
      })
    } catch {
      // table may not exist yet
    }
  }

  const today = new Date()
  const isFirstMonday = today.getDate() <= 7
  const hasConcerns = result.concern_themes.length > 0
  const shouldEmail = isFirstMonday || hasConcerns

  if (shouldEmail && process.env.RESEND_API_KEY) {
    const subject = hasConcerns
      ? `Review alert — concern themes identified`
      : `Review sentiment — ${today.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`

    const html = `
      <div style="font-family:-apple-system,sans-serif;color:#1F1B1A;max-width:560px;">
        <h2 style="font-family:Georgia,serif;font-style:italic;color:#A8895E;font-weight:500;margin:0 0 4px;">Review sentiment</h2>
        <p style="color:#8A807D;font-size:13px;margin:0 0 20px;">${allReviews.length} reviews analysed</p>

        <h3 style="font-size:12px;color:#8A807D;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px;">Positive themes</h3>
        <ul style="margin:0 0 20px;padding-left:20px;color:#27AE60;">
          ${result.positive_themes.map((t) => `<li style="margin-bottom:4px;">${t}</li>`).join('')}
        </ul>

        ${
          hasConcerns
            ? `<h3 style="font-size:12px;color:#C0392B;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px;">Concerns</h3>
            <ul style="margin:0 0 20px;padding-left:20px;color:#C0392B;">
              ${result.concern_themes.map((t) => `<li style="margin-bottom:4px;">${t}</li>`).join('')}
            </ul>`
            : ''
        }

        <div style="border-left:3px solid #A8895E;padding:4px 12px;margin-bottom:16px;">
          <p style="font-size:14px;color:#5C4F44;line-height:1.6;margin:0;">${result.summary}</p>
        </div>

        ${result.action ? `<p style="font-size:13px;color:#1F1B1A;"><strong>Suggestion:</strong> ${result.action}</p>` : ''}
      </div>`

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Visage Aesthetics <enquiries@vaclinic.co.uk>',
      to: [process.env.CLINIC_EMAIL ?? 'ber.parsons@outlook.com'],
      subject,
      html,
      text: `${subject}\n\nPositive themes: ${result.positive_themes.join(', ')}\n${hasConcerns ? `Concerns: ${result.concern_themes.join(', ')}\n` : ''}\n${result.summary}\n${result.action ? `\nSuggestion: ${result.action}` : ''}`,
    })
  }

  return NextResponse.json({
    ok: true,
    total: allReviews.length,
    positive_themes: result.positive_themes,
    concern_themes: result.concern_themes,
    summary: result.summary,
    emailed: shouldEmail,
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
