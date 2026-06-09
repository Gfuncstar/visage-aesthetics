import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarCheck, CalendarX, CircleCheck } from 'lucide-react'
import { assistantConfigured, select, update, audit } from '@/lib/assistant/db'
import { londonParts, dayLabel, clockLabel } from '@/lib/booking-engine/time'
import type { Booking } from '@/lib/booking-engine/types'

export const metadata: Metadata = {
  title: 'Confirm your appointment | Visage Aesthetics',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f-]{36}$/i

type Outcome = 'confirmed' | 'already' | 'cancelled' | 'notfound' | 'error'

function whenLine(startsAtIso: string): string {
  const p = londonParts(new Date(startsAtIso))
  return `${dayLabel(p.dateStr)} at ${clockLabel(p.minutes)}`
}

// Marking confirmed on load keeps the link a single tap from the email/SMS. It
// is idempotent: a second visit just reports "already confirmed".
async function resolve(token: string): Promise<{ outcome: Outcome; booking?: Booking }> {
  if (!assistantConfigured() || !UUID_RE.test(token)) return { outcome: 'notfound' }
  try {
    const rows = await select<Booking>('bookings', { manage_token: `eq.${token}`, limit: 1 })
    const booking = rows[0]
    if (!booking) return { outcome: 'notfound' }
    if (booking.status === 'cancelled') return { outcome: 'cancelled', booking }
    if (booking.confirmed_at) return { outcome: 'already', booking }
    await update('bookings', { id: booking.id }, { confirmed_at: new Date().toISOString() })
    await audit('confirm', 'booking', booking.id, { via: 'confirm-link' })
    return { outcome: 'confirmed', booking }
  } catch {
    return { outcome: 'error' }
  }
}

export default async function ConfirmPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const { outcome, booking } = await resolve(token)

  const positive = outcome === 'confirmed' || outcome === 'already'
  const Icon = outcome === 'cancelled' ? CalendarX : outcome === 'confirmed' ? CircleCheck : outcome === 'already' ? CalendarCheck : CalendarX

  const heading =
    outcome === 'confirmed'
      ? 'You’re confirmed'
      : outcome === 'already'
        ? 'Already confirmed'
        : outcome === 'cancelled'
          ? 'This appointment was cancelled'
          : outcome === 'notfound'
            ? 'We couldn’t find that appointment'
            : 'Something went wrong'

  const message =
    outcome === 'confirmed'
      ? 'Thank you — we’ve let the clinic know to expect you. We look forward to seeing you.'
      : outcome === 'already'
        ? 'Thanks — you’ve already confirmed this appointment. There’s nothing more to do.'
        : outcome === 'cancelled'
          ? 'This booking is no longer active. If you’d like to come in, please book a new time.'
          : outcome === 'notfound'
            ? 'This confirmation link doesn’t match an appointment. It may have expired or already been changed.'
            : 'We couldn’t confirm your appointment just now. Please try the link again shortly, or call the clinic.'

  return (
    <section className="bg-cream text-charcoal min-h-screen flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md text-center">
        <div className="eyebrow text-gold mb-4">Visage Aesthetics</div>

        <span
          className={`inline-flex w-14 h-14 rounded-full items-center justify-center mb-5 ${
            positive ? 'bg-sage/15 text-sage' : 'bg-clay/15 text-clay'
          }`}
        >
          <Icon size={26} strokeWidth={1.75} />
        </span>

        <h1 className="font-display italic text-charcoal text-3xl md:text-4xl leading-tight">{heading}.</h1>

        {positive && booking && (
          <div className="mt-6 border border-line/40 bg-cream-soft rounded-sm px-5 py-5 text-left">
            <div className="font-display italic text-xl text-charcoal leading-tight">{booking.service_name}</div>
            <div className="text-sm text-ink-soft mt-1">{whenLine(booking.starts_at)}</div>
            <div className="text-sm text-ink-soft">17A Friars Lane, Braintree, Essex CM7 9BL</div>
          </div>
        )}

        <p className="text-ink-soft mt-5 leading-relaxed">{message}</p>

        {booking && booking.status !== 'cancelled' && (
          <p className="text-sm text-stone mt-6">
            Need to change or cancel?{' '}
            <Link href={`/book/manage/${token}`} className="text-gold underline">
              Manage your booking
            </Link>
            .
          </p>
        )}

        <p className="text-sm text-stone mt-8">
          <Link href="/" className="text-gold underline">
            vaclinic.co.uk
          </Link>
        </p>
      </div>
    </section>
  )
}
