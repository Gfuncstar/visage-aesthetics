// Clinic audio briefing — the "what's happening" voice note that opens the
// staff day. Three angles, each a short list of spoken segments:
//
//   • Today      — where the day stands: who's in, what's taken, what needs you.
//   • Looking ahead — the week's moves: who's coming, gaps, who's due back.
//   • Blue sky   — bigger-picture ideas to lift the numbers.
//
// Everything is composed server-side from the live clinic data the rest of the
// Assistant already reads (end-of-day, finance, stock, confirmations, consent,
// rebookings). If the database isn't connected it degrades to a short, honest
// segment per tab rather than crashing — matching how the other tools behave.
//
// The segments are plain sentences. The player reads them aloud with the
// browser's own speech engine and shows them on screen, so there is no audio
// file to generate and no third-party voice key to pay for.

import { endOfDaySummary } from './end-of-day'
import { stockReview } from './stock'
import { confirmationReview } from './confirmations'
import { consentReview } from './consent'
import { dueRebookings } from './rebook'
import { monthSummary } from './finance'
import { assistantConfigured, select } from './db'
import { gbp, monthBounds, currentMonthKey } from './format'
import type { Appointment, Order } from './types'

export type BriefingTabKey = 'today' | 'ahead' | 'bluesky'

export type BriefingTab = {
  key: BriefingTabKey
  label: string
  /** One-line preview shown next to the player, before you press play. */
  lead: string
  /** The spoken segments, in order. Always at least one. */
  segments: string[]
}

export type Briefing = {
  /** Warm opener spoken before the first segment of the active tab. */
  greeting: string
  /** Short headline shown above the player (the "one thing worth your eye"). */
  headline: string
  tabs: BriefingTab[]
  /** Whether this was built from live data or the not-connected fallback. */
  live: boolean
  generatedAt: string
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function longDate(): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
}

/** Greeting that tracks the clock, so an early start reads differently to a late one. */
function timeGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ---- Today -----------------------------------------------------------------

async function buildToday(): Promise<{ headline: string; segments: string[] }> {
  const iso = todayIso()
  const segments: string[] = []
  let headline = 'All quiet so far today.'

  // Today's book and takings, straight from the appointments table.
  let booked = 0
  let completedToday = 0
  let takings = 0
  try {
    const appts = await select<Appointment>('appointments', {
      date: `eq.${iso}`,
      select: 'service_name,price,status',
      limit: 200,
    })
    for (const a of appts) {
      if (a.status === 'cancelled' || a.status === 'no_show') continue
      booked += 1
      if (a.status === 'completed') {
        completedToday += 1
        takings += Number(a.price) || 0
      }
    }
  } catch {
    /* leave the counts at zero and carry on */
  }

  if (booked === 0) {
    segments.push(`It's ${longDate()}, and there's nothing in the book today — a clear chair to catch up or get ahead.`)
  } else {
    segments.push(
      `It's ${longDate()}. You've got ${booked} ${booked === 1 ? 'appointment' : 'appointments'} in the book today.`,
    )
  }

  if (completedToday > 0) {
    segments.push(
      `So far you've taken ${gbp(takings)} across ${completedToday} completed ${completedToday === 1 ? 'treatment' : 'treatments'}.`,
    )
    headline = `${gbp(takings)} taken so far today.`
  } else if (booked > 0) {
    segments.push("Nothing's been marked complete yet, so today's takings are still to come.")
  }

  // Write-ups owed — the thing most likely to need the principal's own hand.
  const eod = await endOfDaySummary().catch(() => null)
  if (eod) {
    if (eod.overdue.length) {
      const n = eod.overdue.length
      segments.push(
        `${n} clinical ${n === 1 ? 'write-up is' : 'write-ups are'} overdue, some more than a day old. They're the first thing only you can finish.`,
      )
      headline = n === 1 ? 'A write-up is overdue.' : `${n} write-ups are overdue.`
    }
    if (eod.toWrite.length) {
      const names = eod.toWrite.map((t) => t.name).slice(0, 3).join(', ')
      segments.push(
        `${eod.toWrite.length} ${eod.toWrite.length === 1 ? 'treatment' : 'treatments'} from today still ${eod.toWrite.length === 1 ? 'needs' : 'need'} writing up — ${names}.`,
      )
    }
    if (eod.squeezeIns) {
      segments.push(
        `${eod.squeezeIns} ${eod.squeezeIns === 1 ? 'person is' : 'people are'} waiting to be fitted in. There may be a gap for them today.`,
      )
    }
  }

  // Consent before treatment, then stock that can't wait — both day-critical.
  const consent = await consentReview().catch(() => null)
  if (consent?.bookedMissing.length) {
    const n = consent.bookedMissing.length
    segments.push(
      `Watch this one: ${n} booked ${n === 1 ? 'client has' : 'clients have'} no consent form on file yet. Send one before they're in the chair.`,
    )
    headline = `${n} booked ${n === 1 ? 'client has' : 'clients have'} no consent on file.`
  }

  const stock = await stockReview().catch(() => null)
  if (stock?.urgentItems.length && stock.beforeCutoff) {
    segments.push(
      `Order before 3pm: ${stock.urgentItems.join(', ')} — needed for tomorrow's bookings.`,
    )
  }

  if (segments.length === 1) {
    segments.push('Nothing else is pressing right now. A good moment to get ahead.')
  }
  segments.push('That’s where today stands. Tap Looking ahead when you want the week.')

  return { headline, segments }
}

// ---- Looking ahead ---------------------------------------------------------

async function buildAhead(): Promise<string[]> {
  const iso = todayIso()
  const segments: string[] = ['Let’s think ahead. A few moves for the days to come.']

  // The week's book: count and value of what's booked over the next seven days.
  try {
    const end = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)
    const appts = await select<Appointment>('appointments', {
      and: `(date.gt.${iso},date.lte.${end},status.eq.booked)`,
      select: 'price',
      limit: 300,
    })
    if (appts.length) {
      const value = appts.reduce((s, a) => s + (Number(a.price) || 0), 0)
      segments.push(
        `The next seven days hold ${appts.length} ${appts.length === 1 ? 'booking' : 'bookings'}, worth about ${gbp(value)} if they all complete.`,
      )
    } else {
      segments.push('The next seven days are light on bookings — room to fill if you want to push.')
    }
  } catch {
    /* skip the forward-book line */
  }

  const confirmations = await confirmationReview().catch(() => null)
  if (confirmations?.unconfirmed.length) {
    const n = confirmations.unconfirmed.length
    const names = confirmations.unconfirmed.map((c) => c.name.split(/\s+/)[0]).slice(0, 3).join(', ')
    segments.push(
      `${n} ${n === 1 ? 'client hasn’t' : 'clients haven’t'} confirmed yet — ${names}. A quick message now heads off the no-shows.`,
    )
  }

  const rebookings = await dueRebookings().catch(() => null)
  if (rebookings && rebookings.length) {
    const overdue = rebookings.filter((r) => r.overdueDays > 0).length
    segments.push(
      `${rebookings.length} past ${rebookings.length === 1 ? 'client is' : 'clients are'} due back${overdue ? `, ${overdue} of them overdue` : ''}. A gentle recall keeps the chair full.`,
    )
  }

  const consent = await consentReview().catch(() => null)
  if (consent?.bookedMissing.length) {
    segments.push(
      `${consent.bookedMissing.length} upcoming ${consent.bookedMissing.length === 1 ? 'client still needs' : 'clients still need'} a consent form sent ahead of time.`,
    )
  }

  const stock = await stockReview().catch(() => null)
  if (stock) {
    const toOrder = stock.lines.filter((l) => l.needOrder).map((l) => l.item)
    if (toOrder.length) {
      segments.push(`To keep the week stocked, you'll want to order ${toOrder.slice(0, 4).join(', ')}.`)
    }
  }

  if (segments.length === 1) {
    segments.push('The week ahead looks steady — nothing that needs chasing right now.')
  }
  segments.push('That’s the week. Blue sky next, for the bigger picture.')

  return segments
}

// ---- Blue sky --------------------------------------------------------------

async function buildBluesky(): Promise<string[]> {
  const segments: string[] = [
    'Now the blue sky — a few ideas to lift the numbers, not jobs for today.',
  ]

  // Month-to-date profit picture and the average ticket, both real.
  let avgTicket = 0
  try {
    const { start, end } = monthBounds(currentMonthKey())
    const [appts, orders] = await Promise.all([
      select<Appointment>('appointments', {
        and: `(date.gte.${start},date.lte.${end})`,
        limit: 1000,
      }),
      select<Order>('orders', {
        and: `(date.gte.${start},date.lte.${end})`,
        limit: 500,
      }).catch(() => [] as Order[]),
    ])
    const s = monthSummary(appts, orders)
    if (s.appointmentsCount > 0) {
      avgTicket = s.revenue / s.appointmentsCount
      segments.push(
        `This month you've completed ${s.appointmentsCount} ${s.appointmentsCount === 1 ? 'treatment' : 'treatments'} for ${gbp(s.revenue)}, at a margin of ${s.marginPct.toFixed(0)} percent. The average client is worth about ${gbp(avgTicket)}.`,
      )
    }
    if (s.unpaidTotal > 0) {
      segments.push(
        `${gbp(s.unpaidTotal)} of supplier invoices are still unpaid. Settling them tidies the cash picture before month end.`,
      )
    }
  } catch {
    /* no month line if the figures can't be read */
  }

  // The biggest grounded lever: clients due back, valued at the real average ticket.
  const rebookings = await dueRebookings().catch(() => null)
  if (rebookings && rebookings.length) {
    const ticket = avgTicket > 0 ? avgTicket : 180
    // Assume a conservative half of recalled clients actually rebook.
    const potential = rebookings.length * ticket * 0.5
    segments.push(
      `There are ${rebookings.length} clients due a recall. If even half came back at the average ticket, that's roughly ${gbp(potential)} already sitting in your own list — cheaper to win than any new lead.`,
    )
  }

  // Two evergreen strategic prompts, framed against the clinic's own numbers.
  if (avgTicket > 0) {
    segments.push(
      `One lever on the average ticket: offer a considered add-on at the end of each visit — a skin booster after anti-wrinkle, say. A small lift per client compounds fast across a full book.`,
    )
  }
  segments.push(
    'And the quiet multiplier: every happy client who leaves a Google review lowers what the next booking costs you. Worth asking, every time the result lands well.',
  )

  segments.push('That’s the blue sky. The day itself is back under Today.')

  return segments
}

// ---- Compose ---------------------------------------------------------------

/**
 * Build the three-tab briefing. Safe to call whether or not the clinic database
 * is connected: with no database it returns a short, honest fallback per tab.
 */
export async function buildBriefing(): Promise<Briefing> {
  const greeting = `${timeGreeting()}.`
  const generatedAt = new Date().toISOString()

  if (!assistantConfigured()) {
    return {
      greeting,
      headline: 'Briefing runs on the clinic database.',
      live: false,
      generatedAt,
      tabs: [
        {
          key: 'today',
          label: 'Today',
          lead: 'Where the day stands once the clinic database is connected.',
          segments: [
            `It's ${longDate()}.`,
            'The day’s book, takings and write-ups appear here once the clinic database is connected.',
          ],
        },
        {
          key: 'ahead',
          label: 'Looking ahead',
          lead: 'The week’s bookings, gaps and recalls.',
          segments: [
            'Looking ahead, this is where the week’s bookings, confirmations and clients due back will read out.',
          ],
        },
        {
          key: 'bluesky',
          label: 'Blue sky',
          lead: 'Ideas to lift the numbers.',
          segments: [
            'Blue sky thinking on lifting the numbers appears here once there are figures to work from.',
          ],
        },
      ],
    }
  }

  const [today, ahead, bluesky] = await Promise.all([
    buildToday().catch(() => ({ headline: 'Today’s briefing is unavailable.', segments: ['Today’s briefing couldn’t be built just now.'] })),
    buildAhead().catch(() => ['The week’s briefing couldn’t be built just now.']),
    buildBluesky().catch(() => ['The blue-sky briefing couldn’t be built just now.']),
  ])

  return {
    greeting,
    headline: today.headline,
    live: true,
    generatedAt,
    tabs: [
      { key: 'today', label: 'Today', lead: 'Where the day stands — who’s in, what’s taken, what needs you.', segments: today.segments },
      { key: 'ahead', label: 'Looking ahead', lead: 'The week’s moves — who’s coming, the gaps, who’s due back.', segments: ahead },
      { key: 'bluesky', label: 'Blue sky', lead: 'The bigger picture — ideas to lift the numbers.', segments: bluesky },
    ],
  }
}
