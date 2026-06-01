'use client'

import { useEffect, useState } from 'react'
import { Calendar, Check, X } from 'lucide-react'

type Booking = { serviceName: string; clientName: string; startsAt: string; status: string }

function whenLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}

export default function ManageBooking({ token }: { token: string }) {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/book/manage/${token}`)
      if (res.ok) setBooking((await res.json()).booking ?? null)
      else setNotFound(true)
      setLoading(false)
    })()
  }, [token])

  async function cancel() {
    if (!window.confirm('Cancel this appointment?')) return
    setCancelling(true)
    const res = await fetch(`/api/book/manage/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    })
    if (res.ok) setBooking((b) => (b ? { ...b, status: 'cancelled' } : b))
    setCancelling(false)
  }

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-lg mx-auto px-5 md:px-8 pt-28 md:pt-32 pb-24">
        <div className="eyebrow text-gold mb-2">Visage Aesthetics</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-4xl leading-tight mb-8">Your booking.</h1>

        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : notFound || !booking ? (
          <div className="border border-line/40 bg-cream-soft rounded-sm px-4 py-5 text-sm text-ink-soft">
            We could not find that booking. The link may have expired.
          </div>
        ) : (
          <div className="border border-line/40 bg-cream-soft rounded-sm p-6">
            <div className="text-base font-medium text-charcoal">{booking.serviceName}</div>
            <div className="text-sm text-stone mt-1 inline-flex items-center gap-2"><Calendar size={14} strokeWidth={1.75} /> {whenLabel(booking.startsAt)}</div>
            <div className="mt-4">
              {booking.status === 'cancelled' ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-clay"><X size={15} strokeWidth={2} /> Cancelled</span>
              ) : booking.status === 'pending' ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-gold-deep">Awaiting deposit</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm text-sage"><Check size={15} strokeWidth={2} /> Confirmed</span>
              )}
            </div>
            {booking.status !== 'cancelled' && (
              <button onClick={cancel} disabled={cancelling} className="btn btn-secondary mt-6 disabled:opacity-50">
                <span className="inline-flex items-center gap-2"><X size={14} strokeWidth={1.75} /> {cancelling ? 'Cancelling…' : 'Cancel appointment'}</span>
              </button>
            )}
            <p className="text-xs text-ink-soft mt-4 leading-relaxed">To move your appointment, cancel here and rebook, or call the clinic and we will sort it for you.</p>
          </div>
        )}
      </div>
    </section>
  )
}
