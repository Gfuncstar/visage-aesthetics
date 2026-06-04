import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import Anthropic from '@anthropic-ai/sdk'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured, select } from '@/lib/assistant/db'
import { monthBounds, currentMonthKey, gbp, ukDate } from '@/lib/assistant/format'
import { monthSummary, revenueByTreatment } from '@/lib/assistant/finance'
import type { Appointment, Order } from '@/lib/assistant/types'

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

function lastMonday(): Date {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(d)
  monday.setDate(d.getDate() - diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

async function run() {
  if (!assistantConfigured()) {
    return NextResponse.json({ error: 'Clinic database not configured.' }, { status: 503 })
  }

  const month = currentMonthKey()
  const { start, end } = monthBounds(month)
  const monday = lastMonday()
  const mondayStr = monday.toISOString().slice(0, 10)

  const [monthAppts, monthOrders] = await Promise.all([
    select<Appointment>('appointments', {
      and: `(date.gte.${start},date.lte.${end})`,
      order: 'date.asc',
      limit: 5000,
    }),
    select<Order>('orders', {
      and: `(date.gte.${start},date.lte.${end})`,
      order: 'date.asc',
      limit: 5000,
    }),
  ])

  const summary = monthSummary(monthAppts, monthOrders)
  const revenue = revenueByTreatment(monthAppts)
  const top5 = revenue.slice(0, 5)

  const weekAppts = monthAppts.filter(
    (a) => a.status === 'completed' && a.date >= mondayStr,
  )
  const weekRevenue = weekAppts.reduce((s, a) => s + (Number(a.price) || 0), 0)

  const pendingOrders = monthOrders.filter((o) => o.status === 'pending').length

  let insight = ''
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const prompt = [
        `Write a single punchy sentence (max 20 words) summarising the month-to-date performance for a solo aesthetics clinic.`,
        `Month revenue: ${gbp(summary.revenue)}. Net profit: ${gbp(summary.netProfit)}. Margin: ${summary.marginPct.toFixed(0)}%.`,
        top5.length > 0
          ? `Top treatment: ${top5[0].service} (${gbp(top5[0].total)}).`
          : '',
        `Week revenue: ${gbp(weekRevenue)}.`,
        `Keep it factual and direct — no fluff.`,
      ]
        .filter(Boolean)
        .join(' ')
      const msg = await client.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 80,
        messages: [{ role: 'user', content: prompt }],
      })
      insight = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    } catch {
      // insight is optional
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: true, week_revenue: weekRevenue, month_revenue: summary.revenue, month_profit: summary.netProfit, insight })
  }

  const treatmentRows = top5
    .map(
      (r) => `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;">${r.service}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;text-align:right;">${r.count}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #D9CDBE;text-align:right;">${gbp(r.total)}</td>
      </tr>`,
    )
    .join('')

  const statBlock = (label: string, value: string, sub?: string) => `
    <td style="padding:12px 16px;text-align:center;">
      <div style="color:#8A807D;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:4px;">${label}</div>
      <div style="color:#1F1B1A;font-size:20px;font-weight:600;">${value}</div>
      ${sub ? `<div style="color:#A8895E;font-size:12px;margin-top:2px;">${sub}</div>` : ''}
    </td>`

  const html = `
    <div style="font-family:-apple-system,sans-serif;color:#1F1B1A;max-width:580px;">
      <h2 style="font-family:Georgia,serif;font-style:italic;color:#A8895E;font-weight:500;margin:0 0 4px;">
        Weekly summary
      </h2>
      <p style="color:#8A807D;font-size:13px;margin:0 0 24px;">w/c ${ukDate(mondayStr)}</p>

      <table style="border-collapse:collapse;width:100%;background:#F5F0EC;border-radius:6px;margin-bottom:24px;">
        <tr>
          ${statBlock('This week', gbp(weekRevenue), `${weekAppts.length} appts`)}
          ${statBlock('MTD revenue', gbp(summary.revenue))}
          ${statBlock('MTD profit', gbp(summary.netProfit), `${summary.marginPct.toFixed(0)}% margin`)}
        </tr>
      </table>

      ${
        top5.length > 0
          ? `<h3 style="font-size:13px;color:#8A807D;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px;">Top treatments (MTD)</h3>
        <table style="border-collapse:collapse;width:100%;font-size:13px;margin-bottom:24px;">
          <thead>
            <tr style="background:#F5F0EC;">
              <th style="padding:6px 12px;text-align:left;font-weight:500;color:#8A807D;">Treatment</th>
              <th style="padding:6px 12px;text-align:right;font-weight:500;color:#8A807D;">Appts</th>
              <th style="padding:6px 12px;text-align:right;font-weight:500;color:#8A807D;">Revenue</th>
            </tr>
          </thead>
          <tbody>${treatmentRows}</tbody>
        </table>`
          : ''
      }

      ${
        pendingOrders > 0
          ? `<p style="font-size:13px;color:#A8895E;margin:0 0 16px;">⚠ ${pendingOrders} order${pendingOrders > 1 ? 's' : ''} awaiting review in the orders queue.</p>`
          : ''
      }

      ${insight ? `<p style="font-size:14px;color:#5C4F44;font-style:italic;border-left:3px solid #A8895E;padding:4px 12px;margin:0;">${insight}</p>` : ''}
    </div>`

  const text = [
    `Weekly summary — w/c ${ukDate(mondayStr)}`,
    '',
    `This week: ${gbp(weekRevenue)} (${weekAppts.length} appointments)`,
    `Month to date: ${gbp(summary.revenue)} revenue, ${gbp(summary.netProfit)} profit, ${summary.marginPct.toFixed(0)}% margin`,
    '',
    top5.length > 0 ? 'Top treatments (MTD):' : '',
    ...top5.map((r) => `  ${r.service}: ${r.count} appts, ${gbp(r.total)}`),
    '',
    pendingOrders > 0 ? `${pendingOrders} orders awaiting review.` : '',
    insight ? `\n${insight}` : '',
  ]
    .filter((l) => l !== '')
    .join('\n')

  const resend = new Resend(apiKey)
  await resend.emails.send({
    from: 'Visage Aesthetics <enquiries@vaclinic.co.uk>',
    to: [process.env.CLINIC_EMAIL ?? 'info@vaclinic.co.uk'],
    subject: `Weekly summary — w/c ${ukDate(mondayStr)}`,
    html,
    text,
  })

  return NextResponse.json({
    ok: true,
    week_revenue: weekRevenue,
    month_revenue: summary.revenue,
    month_profit: summary.netProfit,
    insight,
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
