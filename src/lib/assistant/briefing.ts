// The owner's briefing — a short spoken update on the clinic, in three angles:
// Today (what's happening now), Looking ahead (what's coming up), and Blue sky
// (a few moves to lift profit). It's read aloud in the browser with the Web
// Speech API, so this module produces plain narrated text in numbered segments
// rather than an audio file.
//
// Everything is pulled from the same clinic data the rest of the Assistant
// uses. With the database not connected it still returns a sensible briefing
// that explains what would be here once it is — matching how the rest of the
// back end degrades gracefully.

import { assistantConfigured, select } from './db'
import { endOfDaySummary, type EndOfDay } from './end-of-day'
import { stockReview, type StockReview } from './stock'
import { confirmationReview, type ConfirmationReview } from './confirmations'
import { consentReview, type ConsentReview } from './consent'
import { monthSummary, revenueByTreatment, type MonthSummary, type RevenueGroup } from './finance'
import { gbp, monthBounds, currentMonthKey, monthLabel } from './format'
import type { Appointment, Order } from './types'

export type BriefingTabId = 'today' | 'ahead' | 'bluesky'

export type BriefingTab = {
  id: BriefingTabId
  label: string
  /** One-line summary shown under the tab before play. */
  intro: string
  /** Ordered lines, read one after another. */
  segments: string[]
}

export type Briefing = {
  configured: boolean
  generatedAt: string
  /** The single thing most worth the owner's eye, shown above the player. */
  headline: string
  headlineDetail: string
  tabs: BriefingTab[]
  /** The few things that genuinely need the owner — not done for them. */
  tasks: string[]
}

const DAY_MS = 24 * 60 * 60 * 1000
const isoIn = (days: number) => new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10)

function todayPhrase(): string {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
}

function list(names: string[], max = 3): string {
  const shown = names.slice(0, max)
  const extra = names.length - shown.length
  const joined =
    shown.length <= 1
      ? shown.join('')
      : `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}`
  return extra > 0 ? `${joined}, plus ${extra} more` : joined
}

const firstName = (n: string) => n.trim().split(/\s+/)[0]

// ---------------------------------------------------------------------------

export async function buildBriefing(): Promise<Briefing> {
  const generatedAt = new Date().toISOString()

  if (!assistantConfigured()) {
    return notConfiguredBriefing(generatedAt)
  }

  // Pull every angle's data at once. Each helper already swallows its own
  // errors and returns null, so one missing table never sinks the briefing.
  const month = currentMonthKey()
  const { start, end } = monthBounds(month)
  const [today, stock, confirmations, consent, finance, upcoming] = await Promise.all([
    endOfDaySummary(),
    stockReview(),
    confirmationReview(),
    consentReview(),
    monthFinance(start, end),
    upcomingCount(),
  ])

  const tabs: BriefingTab[] = [
    todayTab(today, consent, confirmations, finance),
    aheadTab(upcoming, stock, confirmations),
    blueSkyTab(finance),
  ]

  const { headline, headlineDetail } = pickHeadline(today, consent, finance)
  const tasks = ownerTasks(today, consent, confirmations, finance)

  return { configured: true, generatedAt, headline, headlineDetail, tabs, tasks }
}

// ---- Data helpers ----------------------------------------------------------

type Finance = { summary: MonthSummary; revenue: RevenueGroup[]; monthKey: string } | null

async function monthFinance(start: string, end: string): Promise<Finance> {
  try {
    const [appts, orders] = await Promise.all([
      select<Appointment>('appointments', { and: `(date.gte.${start},date.lte.${end})`, limit: 5000 }),
      select<Order>('orders', { and: `(date.gte.${start},date.lte.${end})`, limit: 5000 }),
    ])
    return { summary: monthSummary(appts, orders), revenue: revenueByTreatment(appts), monthKey: currentMonthKey() }
  } catch {
    return null
  }
}

async function upcomingCount(): Promise<number | null> {
  try {
    const rows = await select<{ id: string }>('appointments', {
      and: `(date.gte.${isoIn(1)},date.lte.${isoIn(14)},status.neq.cancelled)`,
      select: 'id',
      limit: 1000,
    })
    return rows.length
  } catch {
    return null
  }
}

// ---- Tabs ------------------------------------------------------------------

function todayTab(
  today: EndOfDay | null,
  consent: ConsentReview | null,
  confirmations: ConfirmationReview | null,
  finance: Finance,
): BriefingTab {
  const seg: string[] = []
  seg.push(`Here's where today stands — ${todayPhrase()}.`)

  if (today) {
    if (today.seen === 0) {
      seg.push('No one has been marked as seen yet today, so the chair is still ahead of you.')
    } else if (today.toWrite.length === 0) {
      seg.push(`You've seen ${today.seen} ${today.seen === 1 ? 'client' : 'clients'}, and every one is written up. Nothing hanging over you there.`)
    } else {
      seg.push(
        `You've seen ${today.seen} ${today.seen === 1 ? 'client' : 'clients'} today. ${today.toWrite.length} still ${today.toWrite.length === 1 ? 'needs' : 'need'} writing up — ${list(today.toWrite.map((t) => firstName(t.name)))}.`,
      )
    }
    if (today.overdue.length) {
      const oldest = today.overdue[0]
      seg.push(
        `${today.overdue.length} ${today.overdue.length === 1 ? 'write-up is' : 'write-ups are'} now overdue — the oldest is ${firstName(oldest.name)} from ${oldest.daysAgo} days ago. Those are the ones to clear first.`,
      )
    }
  }

  if (consent?.bookedMissing.length) {
    const n = consent.bookedMissing.length
    seg.push(
      `${n} booked ${n === 1 ? 'client has' : 'clients have'} no consent form on file yet — ${list(consent.bookedMissing.map((c) => firstName(c.name)))}. Worth getting a form out before they come in.`,
    )
  }

  if (confirmations?.unconfirmed.length) {
    const n = confirmations.unconfirmed.length
    seg.push(`${n} ${n === 1 ? 'client hasn’t' : 'clients haven’t'} confirmed yet for their next visit. A quick nudge heads off the no-shows.`)
  }

  if (finance) {
    const s = finance.summary
    if (s.unpaid.length) {
      seg.push(`On the money side, ${s.unpaid.length} supplier ${s.unpaid.length === 1 ? 'invoice is' : 'invoices are'} unpaid — ${gbp(s.unpaidTotal)} outstanding.`)
    }
    seg.push(`This month so far: ${gbp(s.revenue)} in from ${s.appointmentsCount} completed ${s.appointmentsCount === 1 ? 'appointment' : 'appointments'}.`)
  }

  if (seg.length === 1) seg.push('It’s quiet — nothing today is asking for your attention. A good day to get ahead.')
  seg.push('That’s today.')

  return { id: 'today', label: 'Today', intro: 'What’s happening in the clinic today.', segments: seg }
}

function aheadTab(
  upcoming: number | null,
  stock: StockReview | null,
  confirmations: ConfirmationReview | null,
): BriefingTab {
  const seg: string[] = []
  seg.push('Now a look at what’s coming up.')

  if (upcoming != null) {
    seg.push(
      upcoming === 0
        ? 'The next two weeks are open — nothing booked in yet, so there’s room to fill.'
        : `You’ve got ${upcoming} ${upcoming === 1 ? 'appointment' : 'appointments'} booked over the next two weeks.`,
    )
  }

  if (stock) {
    const toOrder = stock.lines.filter((l) => l.needOrder)
    if (stock.urgentItems.length && stock.beforeCutoff) {
      seg.push(`Order before 3pm today: ${list(stock.urgentItems)} — ${stock.urgentItems.length === 1 ? 'it’s' : 'they’re'} needed for tomorrow’s bookings.`)
    } else if (toOrder.length) {
      seg.push(`${toOrder.length} ${toOrder.length === 1 ? 'item' : 'items'} to order soon for upcoming bookings — ${list(toOrder.map((l) => l.item))}.`)
    } else {
      seg.push('Stock is in good shape for everything booked — nothing to order right now.')
    }
  }

  if (confirmations?.unconfirmed.length) {
    seg.push(`${confirmations.unconfirmed.length} of those coming up still need to confirm. Chasing them now keeps the diary honest.`)
  }

  if (seg.length === 1) seg.push('Nothing on the horizon needs setting up yet. The path ahead is clear.')
  seg.push('That’s the week ahead.')

  return { id: 'ahead', label: 'Looking ahead', intro: 'What’s coming up over the next two weeks.', segments: seg }
}

function blueSkyTab(finance: Finance): BriefingTab {
  const seg: string[] = []
  seg.push('Let’s think ahead. A few moves that would make the business stronger — none urgent, all worth a thought.')

  if (finance) {
    const s = finance.summary
    const top = finance.revenue[0]

    if (top) {
      seg.push(
        `${top.service} is your earner this month — ${gbp(top.total)} across ${top.count} ${top.count === 1 ? 'booking' : 'bookings'}. A small package or a recall list around it would compound nicely.`,
      )
    }

    if (s.marginPct > 0) {
      seg.push(
        s.marginPct >= 60
          ? `Your margin is healthy at ${s.marginPct.toFixed(0)}%. The lever now isn’t cost — it’s volume and rebooking, not discounting.`
          : `Margin is sitting at ${s.marginPct.toFixed(0)}%. Worth a look at where stock and other costs are going before chasing more bookings.`,
      )
    }

    if (s.unpaidTotal > 0) {
      seg.push(`There’s ${gbp(s.unpaidTotal)} of supplier invoices still to settle — clearing those tidies the picture and avoids late-payment friction.`)
    }
  }

  seg.push('A short, warm recall to clients last seen three to four months ago tends to bring the quietest weeks back to life — a Profhilo or top-up reminder works well.')
  seg.push('And the awards and press you already hold are an asset most clinics don’t have. Leaning on them in your next campaign is free credibility.')
  seg.push('That’s the blue-sky thinking. Pick one, leave the rest.')

  return { id: 'bluesky', label: 'Blue sky', intro: 'Ideas to grow and lift profit.', segments: seg }
}

// ---- Headline + tasks ------------------------------------------------------

function pickHeadline(
  today: EndOfDay | null,
  consent: ConsentReview | null,
  finance: Finance,
): { headline: string; headlineDetail: string } {
  if (finance?.summary.unpaid.length) {
    const s = finance.summary
    return {
      headline: `${s.unpaid.length} supplier ${s.unpaid.length === 1 ? 'invoice' : 'invoices'} unpaid — ${gbp(s.unpaidTotal)} outstanding.`,
      headlineDetail: `${monthLabel(finance.monthKey)} revenue is ${gbp(s.revenue)} so far at ${s.marginPct.toFixed(0)}% margin. The unpaid invoices are the one loose thread.`,
    }
  }
  if (consent?.bookedMissing.length) {
    const n = consent.bookedMissing.length
    return {
      headline: `${n} booked ${n === 1 ? 'client has' : 'clients have'} no consent form on file.`,
      headlineDetail: `Nobody should be treated without consent recorded. ${list(consent.bookedMissing.map((c) => firstName(c.name)))} — send a form before they’re in the chair.`,
    }
  }
  if (today?.overdue.length) {
    return {
      headline: `${today.overdue.length} ${today.overdue.length === 1 ? 'write-up is' : 'write-ups are'} overdue.`,
      headlineDetail: `Clinical notes over 24 hours old. The oldest is ${firstName(today.overdue[0].name)}, ${today.overdue[0].daysAgo} days ago.`,
    }
  }
  if (finance) {
    const s = finance.summary
    return {
      headline: `${monthLabel(finance.monthKey)} is at ${gbp(s.revenue)} from ${s.appointmentsCount} ${s.appointmentsCount === 1 ? 'appointment' : 'appointments'}.`,
      headlineDetail: `Margin ${s.marginPct.toFixed(0)}%, net profit ${gbp(s.netProfit)}. Nothing’s on fire — the briefing below is where to push next.`,
    }
  }
  return {
    headline: 'All clear — nothing is asking for your attention.',
    headlineDetail: 'No overdue notes, no missing consent, no money loose. A good day to get ahead of the week.',
  }
}

function ownerTasks(
  today: EndOfDay | null,
  consent: ConsentReview | null,
  confirmations: ConfirmationReview | null,
  finance: Finance,
): string[] {
  const tasks: string[] = []
  if (today?.overdue.length) tasks.push(`Write up ${today.overdue.length} overdue ${today.overdue.length === 1 ? 'note' : 'notes'} — start with ${firstName(today.overdue[0].name)}.`)
  if (today?.toWrite.length) tasks.push(`Finish ${today.toWrite.length} of today’s write-${today.toWrite.length === 1 ? 'up' : 'ups'}.`)
  if (consent?.bookedMissing.length) tasks.push(`Send a consent form to ${list(consent.bookedMissing.map((c) => firstName(c.name)))}.`)
  if (confirmations?.unconfirmed.length) tasks.push(`Chase ${confirmations.unconfirmed.length} unconfirmed ${confirmations.unconfirmed.length === 1 ? 'booking' : 'bookings'}.`)
  if (finance?.summary.unpaid.length) tasks.push(`Settle ${finance.summary.unpaid.length} supplier ${finance.summary.unpaid.length === 1 ? 'invoice' : 'invoices'} (${gbp(finance.summary.unpaidTotal)}).`)
  return tasks
}

// ---- Not-configured fallback ----------------------------------------------

function notConfiguredBriefing(generatedAt: string): Briefing {
  return {
    configured: false,
    generatedAt,
    headline: 'The briefing turns on once the clinic database is connected.',
    headlineDetail:
      'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel and this fills with the day’s real numbers — who’s booked, what’s owed, and where to push.',
    tabs: [
      {
        id: 'today',
        label: 'Today',
        intro: 'What’s happening in the clinic today.',
        segments: [
          `Here's where today stands — ${todayPhrase()}.`,
          'Once the database is connected, this is where you’ll hear who you’ve seen, what still needs writing up, any missing consent, and the money side of the day.',
          'For now it’s a preview — the structure is here, the numbers follow.',
        ],
      },
      {
        id: 'ahead',
        label: 'Looking ahead',
        intro: 'What’s coming up over the next two weeks.',
        segments: [
          'Now a look at what’s coming up.',
          'This angle will cover the next two weeks of bookings, what to order and by when, and who still needs to confirm.',
          'It’s the part that keeps the diary and the stock cupboard honest.',
        ],
      },
      {
        id: 'bluesky',
        label: 'Blue sky',
        intro: 'Ideas to grow and lift profit.',
        segments: [
          'Let’s think ahead. A few moves that would make the business stronger.',
          'With the numbers connected, this becomes tailored — your best earner to build on, where margin is leaking, and recall ideas timed to your quiet weeks.',
          'Pick one, leave the rest.',
        ],
      },
    ],
    tasks: [],
  }
}
