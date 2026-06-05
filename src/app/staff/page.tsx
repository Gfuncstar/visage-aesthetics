import type { Metadata } from 'next'
import Link from 'next/link'
import { type LucideIcon, AlertTriangle, Boxes, CalendarClock, Check, ClipboardPen, FileCheck2, ShieldAlert } from 'lucide-react'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from './notes/StaffGate'
import { assistantConfigured } from '@/lib/assistant/db'
import { endOfDaySummary } from '@/lib/assistant/end-of-day'
import { stockReview } from '@/lib/assistant/stock'
import { consentReview } from '@/lib/assistant/consent'

export const metadata: Metadata = {
  title: 'Staff',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

type Tone = 'urgent' | 'attention'
type AttentionItem = { key: string; href: string; Icon: LucideIcon; tone: Tone; title: string; detail: string }

const toneStyles: Record<Tone, { card: string; badge: string }> = {
  urgent: { card: 'border-clay/50 bg-clay/10 hover:border-clay', badge: 'bg-clay text-cream' },
  attention: { card: 'border-gold/50 bg-gold/10 hover:border-gold', badge: 'bg-gold-deep text-cream' },
}

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
  const [today, stock, consent] = configured
    ? await Promise.all([endOfDaySummary(), stockReview(), consentReview()])
    : [null, null, null]

  const items: AttentionItem[] = []

  // Consent leads the list — nobody should be treated without it on file.
  if (consent?.bookedMissing.length) {
    const n = consent.bookedMissing.length
    const names = consent.bookedMissing.map((c) => c.name).slice(0, 3).join(', ')
    items.push({
      key: 'consent-missing',
      href: '/staff/assistant/consent',
      Icon: ShieldAlert,
      tone: 'urgent',
      title: n === 1 ? '1 booked client has no consent form' : `${n} booked clients have no consent form`,
      detail: `Nothing on file yet for ${names}${n > 3 ? `, +${n - 3} more` : ''}. Send a form before they come in.`,
    })
  }

  if (consent?.outstanding.length) {
    const n = consent.outstanding.length
    const names = consent.outstanding.map((c) => c.name).slice(0, 3).join(', ')
    items.push({
      key: 'consent-outstanding',
      href: '/staff/assistant/consent',
      Icon: FileCheck2,
      tone: 'attention',
      title: n === 1 ? '1 consent form not returned' : `${n} consent forms not returned`,
      detail: `Sent but not completed by ${names}${n > 3 ? `, +${n - 3} more` : ''}. Give them a nudge.`,
    })
  }

  if (today?.overdue.length) {
    const n = today.overdue.length
    items.push({
      key: 'overdue',
      href: '/staff/assistant/treatment',
      Icon: AlertTriangle,
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
      Icon: ClipboardPen,
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
        Icon: Boxes,
        tone: 'urgent',
        title: 'Order before 3pm today',
        detail: `${stock.urgentItems.join(', ')} — needed for tomorrow’s bookings.`,
      })
    } else if (toOrder.length) {
      const n = toOrder.length
      items.push({
        key: 'order',
        href: '/staff/assistant/stock',
        Icon: Boxes,
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
      Icon: CalendarClock,
      tone: 'attention',
      title: n === 1 ? '1 person to fit in' : `${n} people to fit in`,
      detail: 'Find the best gap and get them booked.',
    })
  }

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-24">
        <header className="flex items-center justify-between gap-4 pb-5 mb-8 border-b border-line/50">
          <div className="flex flex-col">
            <span className="font-display text-charcoal" style={{ fontSize: 20, letterSpacing: '0.01em' }}>Visage Aesthetics</span>
            <span className="eyebrow text-stone" style={{ fontSize: 9.5, marginTop: 2 }}>Private clinic &nbsp;·&nbsp; Braintree</span>
          </div>
          <span className="eyebrow text-gold text-right" style={{ fontSize: 9.5 }}>{dateLabel}</span>
        </header>

        <div className="eyebrow text-gold mb-2">Clinic staff</div>
        <h1 className="font-display italic text-charcoal text-4xl md:text-5xl leading-tight">
          {greeting}.
        </h1>

        <div className="mt-9">
          <div className="eyebrow text-gold mb-3">Needs your attention</div>

          {items.length === 0 ? (
            <div className="flex items-center gap-3 border border-sage/40 bg-sage/10 rounded-sm px-5 py-5">
              <span className="inline-flex w-9 h-9 rounded-full bg-sage/20 text-sage items-center justify-center shrink-0">
                <Check size={16} strokeWidth={2} />
              </span>
              <div>
                <p className="text-charcoal font-medium leading-snug">All caught up.</p>
                <p className="text-sm text-ink-soft leading-snug mt-0.5">
                  {configured
                    ? 'Nothing needs you right now.'
                    : 'Connect the clinic database to see write-ups and stock that need you.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(({ key, href, Icon, tone, title, detail }) => {
                const s = toneStyles[tone]
                return (
                  <Link
                    key={key}
                    href={href}
                    className={`group flex items-center gap-4 border rounded-sm px-4 py-4 transition-colors ${s.card}`}
                  >
                    <span className={`inline-flex w-10 h-10 rounded-full items-center justify-center shrink-0 ${s.badge}`}>
                      <Icon size={17} strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display italic text-lg text-charcoal leading-tight">{title}</span>
                      <span className="block text-xs text-ink-soft mt-0.5 leading-snug">{detail}</span>
                    </span>
                    <span className="ml-auto text-gold-deep shrink-0 transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
