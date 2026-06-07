// Go-live readiness check — proves the Ovatu-to-in-house swap will be clean
// before you flip the switch, end to end.
//
// "Front and back" means this checks both sides of the swap:
//   FRONT END  — can a real client actually book? (services seeded, opening
//                hours set, live slots free in the next 14 days, consent form
//                attached to each treatment).
//   BACK END   — will the clinic side keep working? (database connected, card
//                deposits, email + text confirmations, the cron secret that
//                fires reminders, and a reminder to turn Ovatu's own booking
//                widget off so nothing double-books).
//
// Run it from /staff/assistant/preflight. It is read-only and best-effort: it
// never changes anything and never throws. Flip NEXT_PUBLIC_CUTOVER=go only
// once this page is all green.

import { assistantConfigured, select } from '@/lib/assistant/db'
import { listBookableServices, computeDay } from './availability'
import { londonToday } from './time'
import { consentFormForService } from '@/lib/consent/forms'
import { stripeConfigured } from './stripe'
import { smsConfigured } from '@/lib/assistant/sms'
import { ovatuConfigured } from '@/lib/assistant/ovatu'
import { cutoverLive } from '@/lib/assistant/go-live'
import type { BusinessHours } from './types'

export type CheckStatus = 'pass' | 'warn' | 'fail'

export type Check = {
  id: string
  side: 'front' | 'back'
  label: string
  status: CheckStatus
  detail: string
  fix?: string
  // A failing blocker means the swap would NOT be clean. Warnings still let
  // you go live, but something runs in a degraded way until you set it.
  blocker: boolean
}

export type PreflightReport = {
  ready: boolean // no blocker is failing
  cutoverLive: boolean
  generatedAt: string
  blockers: number // failing blockers
  warnings: number // non-blocking warnings
  checks: Check[]
}

const HORIZON_DAYS = 14

function plusDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Run every readiness check and return a single report. Never throws. */
export async function runPreflight(): Promise<PreflightReport> {
  const checks: Check[] = []

  // ---- BACK END: database connection ---------------------------------------
  const dbOk = assistantConfigured()
  checks.push({
    id: 'database',
    side: 'back',
    label: 'Clinic database connected',
    status: dbOk ? 'pass' : 'fail',
    detail: dbOk
      ? 'Supabase is configured, so bookings, clients and notes have somewhere to live.'
      : 'No database connection. Bookings cannot be stored and the booking page returns an error.',
    fix: dbOk ? undefined : 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.',
    blocker: true,
  })

  // If the database is down, the front-end checks below cannot run. Return what
  // we have rather than guessing.
  if (!dbOk) {
    return finalise(checks)
  }

  // ---- FRONT END: services that clients can book ---------------------------
  let services: Awaited<ReturnType<typeof listBookableServices>> = []
  try {
    services = await listBookableServices()
  } catch {
    /* leave empty; reported below */
  }
  const servicesOk = services.length > 0
  checks.push({
    id: 'services',
    side: 'front',
    label: 'Bookable treatments set up',
    status: servicesOk ? 'pass' : 'fail',
    detail: servicesOk
      ? `${services.length} treatment${services.length === 1 ? '' : 's'} are active and bookable online.`
      : 'No active, online-bookable treatments. The booking page would show nothing to book.',
    fix: servicesOk ? undefined : 'Add rows to the services table (active = true, online_bookable = true).',
    blocker: true,
  })

  // ---- FRONT END: opening hours -------------------------------------------
  let openDays = 0
  try {
    const hours = await select<BusinessHours>('business_hours', { limit: 14 })
    openDays = hours.filter((h) => h.is_open).length
  } catch {
    /* leave 0 */
  }
  const hoursOk = openDays > 0
  checks.push({
    id: 'hours',
    side: 'front',
    label: 'Opening hours set',
    status: hoursOk ? 'pass' : 'fail',
    detail: hoursOk
      ? `Open on ${openDays} day${openDays === 1 ? '' : 's'} of the week.`
      : 'No open days configured. Every day computes as closed, so no slots ever appear.',
    fix: hoursOk ? undefined : 'Add rows to business_hours (one per weekday, is_open = true with open_min / close_min).',
    blocker: true,
  })

  // ---- FRONT END: real, live availability (the proof anyone can book) ------
  // Only worth running if both services and hours are in place.
  if (servicesOk && hoursOk) {
    const today = londonToday()
    const unbookable: string[] = []
    let totalSlots = 0
    for (const svc of services) {
      let svcSlots = 0
      for (let i = 0; i < HORIZON_DAYS; i++) {
        try {
          const slots = await computeDay(svc, plusDays(today, i))
          svcSlots += slots.length
          if (svcSlots > 0) break // one free slot is enough to prove it books
        } catch {
          /* skip the day */
        }
      }
      totalSlots += svcSlots
      if (svcSlots === 0) unbookable.push(svc.name)
    }
    const availOk = totalSlots > 0 && unbookable.length === 0
    checks.push({
      id: 'availability',
      side: 'front',
      label: 'Live slots in the next 14 days',
      status: availOk ? 'pass' : totalSlots > 0 ? 'warn' : 'fail',
      detail: availOk
        ? 'Every bookable treatment has at least one free slot a client could take right now.'
        : totalSlots > 0
          ? `These have no free slot in the next 14 days: ${unbookable.join(', ')}.`
          : 'No treatment has a single free slot in the next 14 days. Nobody could book.',
      fix: availOk
        ? undefined
        : 'Check opening hours cover these treatments, that time-off is not blocking the whole window, and durations are not longer than the open day.',
      blocker: totalSlots === 0,
    })
  }

  // ---- FRONT END: consent form attached to each treatment ------------------
  const noConsent = services.filter((s) => !consentFormForService(s.slug, s.name)).map((s) => s.name)
  const consentOk = services.length > 0 && noConsent.length === 0
  checks.push({
    id: 'consent',
    side: 'front',
    label: 'Consent form for every treatment',
    status: consentOk ? 'pass' : 'warn',
    detail: consentOk
      ? 'Every bookable treatment maps to a consent form, so the right form is sent at booking.'
      : `No consent form is mapped for: ${noConsent.join(', ')}. These book fine but send no consent link.`,
    fix: consentOk ? undefined : 'Add a matching form in src/lib/consent/forms.ts (consentFormForService).',
    blocker: false,
  })

  // ---- FRONT END: in-flight Ovatu bookings (the swap-day pain point) -------
  // Clients already booked in Ovatu for upcoming dates do not exist in the
  // bookings table, so they cannot change or cancel in the new system. They
  // need either migrating across or Ovatu's own manage links kept reachable.
  try {
    const today = londonToday()
    const upcomingOvatu = await select<{ ovatu_id: string | null }>('appointments', {
      date: `gte.${today}`,
      status: 'eq.booked',
      select: 'ovatu_id',
      limit: 1000,
    })
    const inFlight = upcomingOvatu.filter((a) => !(a.ovatu_id ?? '').startsWith('booking:')).length
    checks.push({
      id: 'inflight',
      side: 'front',
      label: 'Clients already booked in Ovatu',
      status: inFlight > 0 ? 'warn' : 'pass',
      detail:
        inFlight > 0
          ? `${inFlight} upcoming appointment${inFlight === 1 ? '' : 's'} were booked in Ovatu. Those clients cannot change them in the new system until they are migrated across.`
          : 'No upcoming Ovatu-only bookings found. Everyone booked is in the new system.',
      fix:
        inFlight > 0
          ? 'Migrate upcoming Ovatu bookings into the new system, and keep Ovatu manage links reachable until the last one has passed.'
          : undefined,
      blocker: false,
    })
  } catch {
    /* appointments table may be empty pre-import; skip */
  }

  // ---- BACK END: card deposits --------------------------------------------
  const stripeOk = stripeConfigured()
  checks.push({
    id: 'stripe',
    side: 'back',
    label: 'Card deposits (Stripe)',
    status: stripeOk ? 'pass' : 'warn',
    detail: stripeOk
      ? 'Deposit-required clients pay on booking via Stripe Checkout.'
      : 'No Stripe key. Deposit-required clients hold as pending and pay manually. Everyone else books fine.',
    fix: stripeOk ? undefined : 'Set STRIPE_SECRET_KEY in Vercel.',
    blocker: false,
  })

  // ---- BACK END: email confirmations --------------------------------------
  const emailOk = Boolean(process.env.RESEND_API_KEY)
  checks.push({
    id: 'email',
    side: 'back',
    label: 'Email confirmations and reminders',
    status: emailOk ? 'pass' : 'warn',
    detail: emailOk
      ? 'Confirmations, reminders and consent links go out by email.'
      : 'No email key. Bookings still record, but no confirmation, reminder or consent email is sent.',
    fix: emailOk ? undefined : 'Set RESEND_API_KEY in Vercel.',
    blocker: false,
  })

  // ---- BACK END: text confirmations (optional) ----------------------------
  const smsOk = smsConfigured()
  checks.push({
    id: 'sms',
    side: 'back',
    label: 'Text confirmations (optional)',
    status: smsOk ? 'pass' : 'warn',
    detail: smsOk
      ? 'Confirmations and reminders also go out by SMS when a mobile is on file.'
      : 'No SMS credentials. Texts are skipped and email is used instead. Optional.',
    fix: smsOk ? undefined : 'Set the TWILIO_* variables in Vercel to switch texting on.',
    blocker: false,
  })

  // ---- BACK END: cron secret (fires reminders + parallel sync) ------------
  const cronOk = Boolean(process.env.CRON_SECRET)
  checks.push({
    id: 'cron',
    side: 'back',
    label: 'Scheduler secret set',
    status: cronOk ? 'pass' : 'warn',
    detail: cronOk
      ? 'The hourly reminder run and the daily sync can authenticate.'
      : 'No CRON_SECRET. The reminder and sync crons return 401, so reminders never fire.',
    fix: cronOk ? undefined : 'Set CRON_SECRET in Vercel (it is sent automatically on the scheduled calls).',
    blocker: false,
  })

  // ---- BACK END: Ovatu widget reminder ------------------------------------
  // After cutover the app stops pointing at Ovatu, but Ovatu itself keeps
  // taking bookings until it is switched off on their side. That is the one
  // double-booking risk the code cannot close on its own.
  const ovatuStillOn = ovatuConfigured()
  checks.push({
    id: 'ovatu',
    side: 'back',
    label: 'Ovatu booking turned off on their side',
    status: ovatuStillOn ? 'warn' : 'pass',
    detail: ovatuStillOn
      ? 'Ovatu is still connected. Turn its online booking off in Ovatu so the old link cannot take a clashing booking.'
      : 'Ovatu is not connected here, so there is no second booking path.',
    fix: ovatuStillOn ? 'Disable online booking in the Ovatu dashboard once you flip the switch.' : undefined,
    blocker: false,
  })

  return finalise(checks)
}

function finalise(checks: Check[]): PreflightReport {
  const blockers = checks.filter((c) => c.blocker && c.status === 'fail').length
  const warnings = checks.filter((c) => c.status === 'warn').length
  return {
    ready: blockers === 0,
    cutoverLive: cutoverLive(),
    generatedAt: new Date().toISOString(),
    blockers,
    warnings,
    checks,
  }
}
