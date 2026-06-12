import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from './notes/StaffGate'
import { assistantConfigured } from '@/lib/assistant/db'
import { endOfDaySummary } from '@/lib/assistant/end-of-day'
import { stockReview } from '@/lib/assistant/stock'
import { consentReview } from '@/lib/assistant/consent'
import { confirmationReview } from '@/lib/assistant/confirmations'
import StaffLandingHub from './StaffLandingHub'
import AttentionList, { type AttentionItem } from './AttentionList'
import FaceIdSetup from './FaceIdSetup'

export const metadata: Metadata = {
  title: 'Staff',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function StaffIndex() {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />

  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', hour12: false }).format(new Date()),
  )
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateLabel = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  // The landing page is a "what needs you right now" view, not a menu — moving
  // between the sections is the job of the bottom bar. So we surface only the
  // things that actually need attention today, pulled straight from the clinic
  // data, and otherwise say it's all clear.
  const configured = assistantConfigured()
  const [today, stock, consent, confirmations] = configured
    ? await Promise.all([endOfDaySummary(), stockReview(), consentReview(), confirmationReview()])
    : [null, null, null, null]

  const items: AttentionItem[] = []

  // Consent leads the list — nobody should be treated without it on file.
  if (consent?.bookedMissing.length) {
    const n = consent.bookedMissing.length
    const names = consent.bookedMissing.map((c) => c.name).slice(0, 3).join(', ')
    items.push({
      key: 'consent-missing',
      href: '/staff/assistant/consent',
      icon: 'shield',
      tone: 'urgent',
      title: n === 1 ? '1 booked client has no consent form' : `${n} booked clients have no consent form`,
      detail: `Nothing on file yet for ${names}${n > 3 ? `, +${n - 3} more` : ''}. Send a form before they come in.`,
    })
  }

  // Booked in soon, asked to confirm, but no confirmation back yet — chase them
  // to head off no-shows.
  if (confirmations?.unconfirmed.length) {
    const n = confirmations.unconfirmed.length
    const names = confirmations.unconfirmed.map((c) => c.name.split(/\s+/)[0]).slice(0, 3).join(', ')
    items.push({
      key: 'unconfirmed',
      href: '/staff/assistant/confirmations',
      icon: 'confirm',
      tone: 'attention',
      title: n === 1 ? '1 client hasn’t confirmed' : `${n} clients haven’t confirmed`,
      detail: `${names}${n > 3 ? `, +${n - 3} more` : ''} booked soon with no confirmation yet. Message to check they’re coming.`,
    })
  }

  if (today?.overdue.length) {
    const n = today.overdue.length
    items.push({
      key: 'overdue',
      href: '/staff/assistant/treatment',
      icon: 'alert',
      tone: 'urgent',
      title: n === 1 ? 'A write-up is overdue' : `${n} write-ups are overdue`,
      detail: 'Clinical notes over 24 hours old. Tap to write them up.',
    })
  }

  if (today?.toWrite.length) {
    const n = today.toWrite.length
    const names = today.toWrite.map((t) => t.name).slice(0, 3).join(', ')
    items.push({
      key: 'to-write',
      href: '/staff/assistant/treatment',
      icon: 'clipboard',
      tone: 'attention',
      title: n === 1 ? '1 treatment to write up' : `${n} treatments to write up`,
      detail: `Seen today: ${names}${n > 3 ? `, +${n - 3} more` : ''}.`,
    })
  }

  if (stock) {
    const toOrder = stock.lines.filter((l) => l.needOrder)
    if (stock.urgentItems.length && stock.beforeCutoff) {
      items.push({
        key: 'order-urgent',
        href: '/staff/assistant/stock',
        icon: 'boxes',
        tone: 'urgent',
        title: 'Order before 3pm today',
        detail: `${stock.urgentItems.join(', ')} — needed for tomorrow’s bookings.`,
      })
    } else if (toOrder.length) {
      const n = toOrder.length
      items.push({
        key: 'order',
        href: '/staff/assistant/stock',
        icon: 'boxes',
        tone: 'attention',
        title: n === 1 ? '1 item to order' : `${n} items to order`,
        detail: `${toOrder.map((l) => l.item).slice(0, 3).join(', ')} for upcoming bookings.`,
      })
    }
  }

  if (today?.squeezeIns) {
    const n = today.squeezeIns
    items.push({
      key: 'squeeze',
      href: '/staff/assistant/squeeze-in',
      icon: 'calendar',
      tone: 'attention',
      title: n === 1 ? '1 person to fit in' : `${n} people to fit in`,
      detail: 'Find the best gap and get them booked.',
    })
  }

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-6 pb-24">
        <StaffLandingHub greeting={greeting} dateLabel={dateLabel} />

        <FaceIdSetup />

        <div className="mt-9">
          <div className="eyebrow text-gold mb-3">Needs your attention</div>
          <AttentionList items={items} configured={configured} />
        </div>
      </div>
    </section>
  )
}
