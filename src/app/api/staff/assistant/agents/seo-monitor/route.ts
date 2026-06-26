import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import Anthropic from '@anthropic-ai/sdk'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, insert, select } from '@/lib/assistant/db'
import { AGENT_MODEL } from '@/lib/assistant/model'
import { sendPush } from '@/lib/assistant/push'
import { CLINIC_PROFILE } from '@/lib/assistant/opportunities'
import { withHeartbeat } from '@/lib/assistant/heartbeat'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

async function authorised(req: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization') || ''
    if (auth === `Bearer ${cronSecret}`) return true
  }
  return isStaffAuthed()
}

// Essex location pages and target treatments — the core of Visage's local SEO
const TARGET_KEYWORDS = [
  'botox braintree',
  'lip filler braintree',
  'aesthetics clinic braintree',
  'anti wrinkle injections braintree',
  'profhilo braintree',
  'botox chelmsford',
  'aesthetics clinic chelmsford',
  'dermal filler chelmsford',
  'aesthetics clinic essex',
  'best aesthetics clinic essex',
  'non surgical clinic essex',
  'nurse led aesthetics essex',
]

type KeywordFinding = {
  keyword: string
  top_competitors: { name: string; website: string }[]
  visage_appears: boolean
  notes: string
}

type SeoReport = {
  keyword_findings: KeywordFinding[]
  competitor_alerts: string[]
  award_opportunities: string[]
  action_items: { priority: number; action: string; why: string }[]
  weekly_summary: string
}

type SeoReportRow = {
  id: string
  week_of: string
  summary: string
  action_items: string
  created_at: string
}

async function run() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'ANTHROPIC_API_KEY not set' })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const today = new Date().toISOString().slice(0, 10)
  const weekOf = today

  // Load previous report to detect changes
  let previousSummary = ''
  if (assistantConfigured()) {
    try {
      const prev = await select<SeoReportRow>('seo_reports', { order: 'created_at.desc', limit: 1 })
      if (prev[0]) previousSummary = prev[0].summary
    } catch { /* table may not exist yet */ }
  }

  const prompt = `You are an SEO analyst for ${CLINIC_PROFILE}

The clinic's key differentiator right now: **Best Non-Surgical Aesthetics Clinic 2026, Essex** (Health, Beauty & Wellness Awards / LUX Life). This award must be leveraged aggressively in every SEO opportunity.

Today's date: ${today}

Use up to 15 web searches to research the competitive SEO landscape for aesthetics clinics in Essex.

RESEARCH TASKS (in order):
1. Search each of these keyword groups and identify who ranks in the top 3-5 results:
   - Group A (Braintree): "botox braintree", "lip filler braintree", "aesthetics clinic braintree", "profhilo braintree"
   - Group B (Chelmsford): "botox chelmsford", "aesthetics clinic chelmsford", "dermal filler chelmsford"
   - Group C (Essex-wide): "best aesthetics clinic essex", "non surgical clinic essex", "nurse led aesthetics essex"

2. For the top 2-3 competitors you discover, check their websites:
   - What treatments do they offer that Visage doesn't advertise prominently?
   - Are they using award badges or accreditations?
   - How many Google reviews do they have and what is their rating?
   - Do they have location-specific pages?

3. Check if Visage Aesthetics (vaclinic.co.uk) appears for any of these terms.

4. Search for: "best non-surgical clinic essex 2026" and related award terms — is Visage being cited or mentioned in any press, directories, or third-party sites?

5. Identify any directory listings, local citation sites (Yell, Treatwell, Fresha, NHS choices, etc.) where competitors appear but Visage doesn't.

${previousSummary ? `Previous week's summary for comparison:\n${previousSummary}\n\nHighlight any changes since last week.` : ''}

Return ONLY valid JSON (no prose, no markdown):
{
  "keyword_findings": [
    {
      "keyword": "string",
      "top_competitors": [{"name": "string", "website": "string"}],
      "visage_appears": true/false,
      "notes": "one sentence on current situation"
    }
  ],
  "competitor_alerts": ["string — notable changes or threats discovered this week"],
  "award_opportunities": ["string — specific places to cite/submit the Best Clinic 2026 award"],
  "action_items": [
    {"priority": 1, "action": "string — specific, actionable task", "why": "string — expected SEO impact"}
  ],
  "weekly_summary": "2-3 sentence plain-English summary of the week's competitive picture"
}

Rules:
- Only include things you actually found via web search — no guesses
- action_items: rank 1=highest impact, max 5 items, be specific (e.g. "Add award badge to /botox-braintree page header")
- competitor_alerts: only if genuinely notable — new competitor, lost ranking, review surge etc.
- If Visage is already dominating a keyword, say so positively`

  let report: SeoReport | null = null

  try {
    const res = await client.messages.create({
      model: AGENT_MODEL,
      max_tokens: 4000,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 15 } as never],
      messages: [{ role: 'user', content: prompt }],
    })

    const text = res.content
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { type: string; text?: string }) => b.text ?? '')
      .join('\n')

    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start !== -1 && end !== -1) {
      report = JSON.parse(text.slice(start, end + 1)) as SeoReport
    }
  } catch (err) {
    console.error('[seo-monitor] Claude error:', err)
    return NextResponse.json({ ok: false, error: 'Analysis failed' }, { status: 502 })
  }

  if (!report) {
    return NextResponse.json({ ok: false, error: 'Could not parse report' }, { status: 502 })
  }

  // Store report
  if (assistantConfigured()) {
    try {
      await insert('seo_reports', {
        week_of: weekOf,
        summary: report.weekly_summary,
        action_items: JSON.stringify(report.action_items),
        keyword_count: report.keyword_findings.length,
        competitor_alerts: JSON.stringify(report.competitor_alerts),
        award_opportunities: JSON.stringify(report.award_opportunities),
        full_report: JSON.stringify(report),
        created_at: new Date().toISOString(),
      })
    } catch { /* table may not exist yet — continue to email */ }
  }

  // Build email
  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    const keywordRows = report.keyword_findings
      .map((f) => {
        const status = f.visage_appears
          ? `<span style="color:#27AE60">✓ Appearing</span>`
          : `<span style="color:#C0392B">✗ Not found</span>`
        const competitors = f.top_competitors.map((c) => c.name).join(', ') || '—'
        return `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;font-size:13px;">${f.keyword}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;font-size:13px;">${status}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;font-size:12px;color:#8A807D;">${competitors}</td>
        </tr>`
      })
      .join('')

    const actionRows = report.action_items
      .sort((a, b) => a.priority - b.priority)
      .map(
        (item) => `
        <div style="border-left:3px solid ${item.priority === 1 ? '#A8895E' : '#D9CDBE'};padding:8px 12px;margin-bottom:10px;">
          <div style="font-size:13px;font-weight:500;color:#1F1B1A;">${item.action}</div>
          <div style="font-size:12px;color:#8A807D;margin-top:2px;">${item.why}</div>
        </div>`,
      )
      .join('')

    const alertSection =
      report.competitor_alerts.length > 0
        ? `<div style="background:#FEF3CD;border:1px solid #FBBF24;border-radius:4px;padding:12px 16px;margin-bottom:20px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#92400E;margin-bottom:6px;">Competitor alerts</div>
          ${report.competitor_alerts.map((a) => `<div style="font-size:13px;color:#1F1B1A;margin-bottom:4px;">• ${a}</div>`).join('')}
        </div>`
        : ''

    const awardSection =
      report.award_opportunities.length > 0
        ? `<div style="margin-bottom:20px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#8A807D;margin-bottom:8px;">Award citation opportunities</div>
          ${report.award_opportunities.map((a) => `<div style="font-size:13px;color:#A8895E;margin-bottom:4px;">★ ${a}</div>`).join('')}
        </div>`
        : ''

    const html = `
      <div style="font-family:-apple-system,sans-serif;color:#1F1B1A;max-width:600px;">
        <h2 style="font-family:Georgia,serif;font-style:italic;color:#A8895E;font-weight:500;margin:0 0 4px;">SEO monitor</h2>
        <p style="color:#8A807D;font-size:13px;margin:0 0 20px;">Week of ${weekOf} &middot; ${report.keyword_findings.length} keywords tracked</p>

        <div style="background:#F5F0EC;border-radius:4px;padding:12px 16px;margin-bottom:20px;">
          <p style="font-size:14px;color:#5C4F44;line-height:1.6;margin:0;">${report.weekly_summary}</p>
        </div>

        ${alertSection}

        <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#8A807D;margin:0 0 8px;">This week's action list</h3>
        ${actionRows}

        <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#8A807D;margin:20px 0 8px;">Keyword overview</h3>
        <table style="border-collapse:collapse;width:100%;margin-bottom:20px;">
          <thead><tr style="background:#F5F0EC;">
            <th style="padding:6px 12px;text-align:left;font-weight:500;font-size:11px;color:#8A807D;">Keyword</th>
            <th style="padding:6px 12px;text-align:left;font-weight:500;font-size:11px;color:#8A807D;">Visage</th>
            <th style="padding:6px 12px;text-align:left;font-weight:500;font-size:11px;color:#8A807D;">Top competitors</th>
          </tr></thead>
          <tbody>${keywordRows}</tbody>
        </table>

        ${awardSection}
      </div>`

    const visageCount = report.keyword_findings.filter((f) => f.visage_appears).length
    const subject = `SEO monitor — ${visageCount}/${report.keyword_findings.length} keywords · ${report.action_items.length} action${report.action_items.length !== 1 ? 's' : ''}`

    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: 'Visage Aesthetics <enquiries@vaclinic.co.uk>',
      to: [process.env.CLINIC_EMAIL ?? 'ber.parsons@outlook.com'],
      subject,
      html,
      text: [
        `SEO monitor — week of ${weekOf}`,
        '',
        report.weekly_summary,
        '',
        'Action items:',
        ...report.action_items.sort((a, b) => a.priority - b.priority).map((i) => `${i.priority}. ${i.action}`),
        '',
        report.competitor_alerts.length > 0 ? 'Alerts:\n' + report.competitor_alerts.join('\n') : '',
      ]
        .filter(Boolean)
        .join('\n'),
    })
  }

  // Push to staff app
  const topAction = report.action_items.sort((a, b) => a.priority - b.priority)[0]
  await sendPush({
    title: 'SEO report ready',
    body: topAction ? `Top action: ${topAction.action.slice(0, 80)}` : `${report.keyword_findings.filter((f) => f.visage_appears).length}/${report.keyword_findings.length} keywords covered`,
    url: '/staff/assistant/agents',
  }).catch(() => {})

  return NextResponse.json({
    ok: true,
    week_of: weekOf,
    keywords_checked: report.keyword_findings.length,
    appearing: report.keyword_findings.filter((f) => f.visage_appears).length,
    action_items: report.action_items.length,
    competitor_alerts: report.competitor_alerts.length,
  })
}

export async function GET(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return withHeartbeat('seo-monitor', () => run())
}

export async function POST(req: Request) {
  if (!(await authorised(req))) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  return run()
}
