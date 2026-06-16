'use client'

import { useEffect, useState } from 'react'
import { Calendar, Check, Clock, RotateCcw, X } from 'lucide-react'

type Booking = { serviceName: string; serviceSlug: string | null; clientName: string; startsAt: string; status: string; canChange?: boolean }
type Slot = { startsAtIso: string; label: string }

function dayChip(dateStr: string): string {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/London' }).format(new Date(`${dateStr}T12:00:00Z`))
}

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
  const [rescheduling, setRescheduling] = useState(false)
  const [calendar, setCalendar] = useState<Record<string, number>>({})
  const [day, setDay] = useState<string | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [moving, setMoving] = useState(false)

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

  async function startReschedule() {
    if (!booking?.serviceSlug) return
    setRescheduling(true)
    setDay(null)
    setSlots([])
    const res = await fetch(`/api/book/availability?service=${booking.serviceSlug}&days=90`)
    if (res.ok) setCalendar((await res.json()).calendar ?? {})
  }

  async function pickDay(ds: string) {
    setDay(ds)
    const res = await fetch(`/api/book/availability?service=${booking!.serviceSlug}&date=${ds}`)
    if (res.ok) setSlots((await res.json()).slots ?? [])
  }

  async function moveTo(iso: string) {
    setMoving(true)
    const res = await fetch(`/api/book/manage/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reschedule', startsAt: iso }),
    })
    const d = await res.json().catch(() => ({}))
    if (res.ok && d.startsAt) {
      setBooking((b) => (b ? { ...b, startsAt: d.startsAt } : b))
      setRescheduling(false)
    }
    setMoving(false)
  }

  const availableDays = Object.keys(calendar).filter((k) => calendar[k] > 0).sort()

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
            {booking.status !== 'cancelled' && !rescheduling && booking.canChange && (
              <div className="mt-6 flex flex-wrap gap-2">
                <button onClick={startReschedule} className="btn btn-primary" style={{ minHeight: 40 }}>
                  <span className="inline-flex items-center gap-2"><RotateCcw size={14} strokeWidth={1.75} /> Reschedule</span>
                </button>
                <button onClick={cancel} disabled={cancelling} className="btn btn-secondary disabled:opacity-50" style={{ minHeight: 40 }}>
                  <span className="inline-flex items-center gap-2"><X size={14} strokeWidth={1.75} /> {cancelling ? 'Cancelling…' : 'Cancel'}</span>
                </button>
              </div>
            )}

            {booking.status !== 'cancelled' && booking.canChange === false && (
              <div className="mt-6 border border-gold/40 bg-gold/10 rounded-sm px-4 py-3 text-sm text-ink-soft leading-relaxed">
                Your appointment is within 24 hours, so it can no longer be changed online. If something has come up, please call the clinic and we will help.
              </div>
            )}

            {rescheduling && (
              <div className="mt-6 border-t border-line/40 pt-5">
                <div className="eyebrow text-gold mb-2 flex items-center gap-2"><Calendar size={13} strokeWidth={1.75} /> Pick a new day</div>
                {availableDays.length === 0 ? (
                  <p className="text-sm text-ink-soft">Finding availability…</p>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                    {availableDays.map((ds) => (
                      <button key={ds} onClick={() => pickDay(ds)} className={`shrink-0 rounded-sm border px-3 py-2 text-sm transition-colors ${day === ds ? 'border-gold bg-gold/10' : 'border-line/50 bg-cream-soft hover:border-gold/60'}`}>{dayChip(ds)}</button>
                    ))}
                  </div>
                )}
                {day && (
                  <>
                    <div className="eyebrow text-gold mb-2 flex items-center gap-2"><Clock size={13} strokeWidth={1.75} /> Pick a time</div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {slots.map((s) => (
                        <button key={s.startsAtIso} onClick={() => moveTo(s.startsAtIso)} disabled={moving} className="rounded-sm border border-line/50 bg-cream-soft px-2 py-2.5 text-sm text-charcoal hover:border-gold/60 disabled:opacity-50">{s.label}</button>
                      ))}
                    </div>
                  </>
                )}
                <button onClick={() => setRescheduling(false)} className="text-xs text-stone mt-4">Keep my current time</button>
              </div>
            )}
            {!rescheduling && <p className="text-xs text-ink-soft mt-4 leading-relaxed">Need help? Call the clinic and we will sort it for you.</p>}
          </div>
        )}
      </div>
    </section>
  )
}
