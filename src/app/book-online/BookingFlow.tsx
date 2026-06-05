'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Calendar, Check, Clock } from 'lucide-react'
import MicButton, { appendText } from '@/components/ui/MicButton'

type Service = { slug: string; name: string; category: string | null; duration_min: number; price_from: number }
type Slot = { startsAtIso: string; label: string }

const inputClass =
  'w-full bg-cream border border-line rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]'

function gbp(n: number): string {
  return n > 0 ? `from £${n}` : 'Price on consultation'
}

function dayChipLabel(dateStr: string): { weekday: string; rest: string } {
  const d = new Date(`${dateStr}T12:00:00Z`)
  return {
    weekday: new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/London' }).format(d),
    rest: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'Europe/London' }).format(d),
  }
}

type Step = 'details' | 'service' | 'time' | 'done'

export default function BookingFlow() {
  const [step, setStep] = useState<Step>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [voucherCode, setVoucherCode] = useState('')

  const [services, setServices] = useState<Service[]>([])
  const [service, setService] = useState<Service | null>(null)

  const [calendar, setCalendar] = useState<Record<string, number>>({})
  const [day, setDay] = useState<string | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [slot, setSlot] = useState<Slot | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<'confirmed' | 'deposit' | 'waitlist' | null>(null)

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/book/services')
      if (res.ok) setServices((await res.json()).services ?? [])
    })()
  }, [])

  const identityQuery = useCallback(() => {
    const p = new URLSearchParams()
    if (email) p.set('email', email)
    if (phone) p.set('phone', phone)
    if (name) p.set('name', name)
    return p.toString()
  }, [email, phone, name])

  async function pickService(s: Service) {
    setService(s)
    setDay(null)
    setSlots([])
    setSlot(null)
    setStep('time')
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/book/availability?service=${s.slug}&days=90&${identityQuery()}`)
      const d = await res.json()
      setCalendar(d.calendar ?? {})
    } finally {
      setLoading(false)
    }
  }

  async function pickDay(ds: string) {
    setDay(ds)
    setSlot(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/book/availability?service=${service!.slug}&date=${ds}&${identityQuery()}`)
      const d = await res.json()
      setSlots(d.slots ?? [])
    } finally {
      setLoading(false)
    }
  }

  async function joinWaitlist() {
    if (!service) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/book/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: service.slug, name, email, phone, note: notes }),
      })
      if (!res.ok) { setError('Could not join the waitlist. Please call the clinic.'); return }
      setResult('waitlist')
      setStep('done')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function submit() {
    if (!service || !slot) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/book/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: service.slug, startsAt: slot.startsAtIso, name, email, phone, notes, voucherCode }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(d.error || 'Could not book that time. Please try another.')
        return
      }
      if (d.checkoutUrl) {
        window.location.href = d.checkoutUrl
        return
      }
      setResult(d.depositPending ? 'deposit' : 'confirmed')
      setStep('done')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const availableDays = Object.keys(calendar).filter((d) => calendar[d] > 0).sort()
  const detailsValid = name.trim().length > 1 && (email.trim().length > 3 || phone.trim().length > 6)

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-28 md:pt-32 pb-24">
        <div className="eyebrow text-gold mb-2">Visage Aesthetics &nbsp;·&nbsp; Braintree</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight mb-8">Book your appointment.</h1>

        {step !== 'details' && step !== 'done' && (
          <button onClick={() => setStep(step === 'time' ? 'service' : 'details')} className="eyebrow text-stone hover:text-gold-deep inline-flex items-center gap-2 mb-6">
            <ArrowLeft size={14} strokeWidth={1.75} /> Back
          </button>
        )}

        {/* Step 1 — details */}
        {step === 'details' && (
          <div className="space-y-4">
            <p className="text-ink-soft leading-relaxed">Let&apos;s start with your details so we can hold your appointment and send your confirmation.</p>
            <div>
              <label className="text-eyebrow text-ink-soft mb-1.5 block">Your name</label>
              <div className="relative">
                <input className={`${inputClass} pr-12`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                <MicButton onText={(t) => setName((v) => appendText(v, t))} className="absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label className="text-eyebrow text-ink-soft mb-1.5 block">Email</label>
              <div className="relative">
                <input className={`${inputClass} pr-12`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
                <MicButton onText={(t) => setEmail((v) => appendText(v, t))} className="absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label className="text-eyebrow text-ink-soft mb-1.5 block">Mobile</label>
              <div className="relative">
                <input className={`${inputClass} pr-12`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07…" />
                <MicButton onText={(t) => setPhone((v) => appendText(v, t))} className="absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <p className="text-xs text-ink-soft">Leave at least an email or a mobile number so we can reach you.</p>
            <button onClick={() => setStep('service')} disabled={!detailsValid} className="btn btn-primary disabled:opacity-50">
              <span className="inline-flex items-center gap-2">Continue <span className="btn-arrow">→</span></span>
            </button>
          </div>
        )}

        {/* Step 2 — service */}
        {step === 'service' && (
          <div>
            <p className="text-ink-soft leading-relaxed mb-5">Which treatment would you like to book?</p>
            <div className="grid grid-cols-1 gap-2.5">
              {services.map((s) => (
                <button key={s.slug} onClick={() => pickService(s)} className="text-left border border-line/50 bg-cream-soft rounded-sm px-4 py-3.5 hover:border-gold transition-colors flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base text-charcoal">{s.name}</div>
                    <div className="text-xs text-stone mt-0.5 inline-flex items-center gap-2"><Clock size={12} strokeWidth={1.75} /> {s.duration_min} min &nbsp;·&nbsp; {gbp(s.price_from)}</div>
                  </div>
                  <span className="text-stone">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — date + time */}
        {step === 'time' && service && (
          <div>
            <div className="mb-5">
              <div className="text-base font-medium text-charcoal">{service.name}</div>
              <div className="text-xs text-stone">{service.duration_min} min &nbsp;·&nbsp; {gbp(service.price_from)}</div>
            </div>

            {loading && !day ? (
              <p className="text-sm text-ink-soft">Finding availability…</p>
            ) : availableDays.length === 0 ? (
              <div className="border border-line/40 bg-cream-soft rounded-sm px-4 py-5 text-sm text-ink-soft leading-relaxed">
                <p>There is no online availability for this treatment in the next three months.</p>
                <button onClick={joinWaitlist} disabled={loading} className="btn btn-primary mt-4 disabled:opacity-50">
                  <span className="inline-flex items-center gap-2">{loading ? 'Joining…' : 'Join the waitlist'}</span>
                </button>
                <p className="mt-3 text-xs">We will text or email you the moment a suitable time opens up. You can also call the clinic and we will help.</p>
                {error && <p className="text-sm text-clay mt-2">{error}</p>}
              </div>
            ) : (
              <>
                <div className="eyebrow text-gold mb-2 flex items-center gap-2"><Calendar size={13} strokeWidth={1.75} /> Choose a day</div>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
                  {availableDays.map((ds) => {
                    const { weekday, rest } = dayChipLabel(ds)
                    const on = day === ds
                    return (
                      <button key={ds} onClick={() => pickDay(ds)} className={`shrink-0 rounded-sm border px-3.5 py-2.5 text-center transition-colors ${on ? 'border-gold bg-gold/10' : 'border-line/50 bg-cream-soft hover:border-gold/60'}`}>
                        <div className="text-xs text-stone">{weekday}</div>
                        <div className="text-sm text-charcoal">{rest}</div>
                        <div className="text-[10px] text-gold-deep mt-0.5">{calendar[ds]} free</div>
                      </button>
                    )
                  })}
                </div>

                {day && (
                  <>
                    <div className="eyebrow text-gold mb-2 flex items-center gap-2"><Clock size={13} strokeWidth={1.75} /> Choose a time</div>
                    {loading ? (
                      <p className="text-sm text-ink-soft">Loading times…</p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
                        {slots.map((s) => (
                          <button key={s.startsAtIso} onClick={() => setSlot(s)} className={`rounded-sm border px-2 py-2.5 text-sm transition-colors ${slot?.startsAtIso === s.startsAtIso ? 'border-gold bg-gold text-charcoal' : 'border-line/50 bg-cream-soft text-charcoal hover:border-gold/60'}`}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {slot && (
                  <div className="border border-gold/40 bg-gold/5 rounded-sm p-4">
                    <label className="text-eyebrow text-ink-soft mb-1.5 block">Anything we should know? (optional)</label>
                    <div className="relative mb-3">
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full bg-cream border border-line rounded-sm px-3 py-2.5 pr-10 text-sm text-charcoal focus:outline-none focus:border-gold" placeholder="First time, a question, anything helpful." />
                      <MicButton onText={(t) => setNotes((v) => appendText(v, t))} className="absolute right-2.5 top-2.5" />
                    </div>
                    <label className="text-eyebrow text-ink-soft mb-1.5 block">Gift voucher code (optional)</label>
                    <input
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      className="w-full bg-cream border border-line rounded-sm px-3 py-2.5 text-sm text-charcoal uppercase tracking-[0.1em] focus:outline-none focus:border-gold mb-3"
                      placeholder="GIFT-XXXX-XXXX"
                      autoComplete="off"
                    />
                    {error && <p className="text-sm text-clay mb-2">{error}</p>}
                    <button onClick={submit} disabled={loading} className="btn btn-primary btn-block disabled:opacity-50">
                      <span className="inline-flex items-center gap-2">{loading ? 'Booking…' : `Confirm ${service.name}`}</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 4 — done */}
        {step === 'done' && (
          <div className="border border-sage/40 bg-sage/10 rounded-sm p-6 text-center">
            <div className="inline-flex w-12 h-12 rounded-full bg-sage/20 text-sage items-center justify-center mb-4"><Check size={22} strokeWidth={2} /></div>
            {result === 'waitlist' ? (
              <>
                <h2 className="font-display italic text-2xl text-charcoal mb-2">You&apos;re on the list</h2>
                <p className="text-ink-soft leading-relaxed">We will be in touch the moment a suitable time opens up. First to book keeps it.</p>
              </>
            ) : result === 'deposit' ? (
              <>
                <h2 className="font-display italic text-2xl text-charcoal mb-2">Almost there</h2>
                <p className="text-ink-soft leading-relaxed">Your time is held. A small deposit secures it, and we will send you a payment link shortly. Once that is paid your booking is confirmed.</p>
              </>
            ) : (
              <>
                <h2 className="font-display italic text-2xl text-charcoal mb-2">You&apos;re booked in</h2>
                <p className="text-ink-soft leading-relaxed">A confirmation is on its way to your email, with a link to manage your booking. We look forward to seeing you.</p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
