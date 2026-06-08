'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Check, Clock, Mail, Phone, RotateCcw } from 'lucide-react'

type PortalBooking = {
  id: string
  serviceName: string
  serviceSlug: string | null
  startsAt: string
  status: string
  manageToken: string
  past: boolean
}

type PortalData = { name: string; email: string; phone: string; bookings: PortalBooking[] }

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

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'there'
}

export default function Account() {
  const [token, setToken] = useState<string | null>(null)
  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expired, setExpired] = useState(false)

  // Email-request state
  const [email, setEmail] = useState('')
  const [requested, setRequested] = useState(false)
  const [sending, setSending] = useState(false)

  // Details state
  const [phone, setPhone] = useState('')
  const [savingPhone, setSavingPhone] = useState(false)
  const [phoneSaved, setPhoneSaved] = useState(false)

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token')
    setToken(t)
    if (!t) {
      setLoading(false)
      return
    }
    void (async () => {
      try {
        const res = await fetch(`/api/book/portal?token=${encodeURIComponent(t)}`, { cache: 'no-store' })
        if (res.status === 401) {
          setExpired(true)
        } else if (res.ok) {
          const d = (await res.json()) as PortalData
          setData(d)
          setPhone(d.phone || '')
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const requestLink = useCallback(async () => {
    if (!email.trim()) return
    setSending(true)
    try {
      await fetch('/api/book/portal/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      setRequested(true)
    } finally {
      setSending(false)
    }
  }, [email])

  async function savePhone() {
    if (!token) return
    setSavingPhone(true)
    setPhoneSaved(false)
    try {
      const res = await fetch(`/api/book/portal?token=${encodeURIComponent(token)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      if (res.ok) setPhoneSaved(true)
    } finally {
      setSavingPhone(false)
    }
  }

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-24">
        <div className="eyebrow text-gold mb-2">Visage Aesthetics</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">
          Your appointments
        </h1>
        {children}
      </div>
    </section>
  )

  // No token, or expired: show the email-request form.
  if (!loading && (!token || expired)) {
    return (
      <Shell>
        {expired && (
          <div className="mt-4 border border-amber-300 bg-amber-50 text-amber-800 text-sm rounded-sm px-4 py-3">
            That link has expired. Pop your email in below and we will send a fresh one.
          </div>
        )}
        {requested ? (
          <div className="mt-6 border border-green-300 bg-green-50 text-green-800 text-sm rounded-sm px-4 py-4 leading-relaxed">
            <Check className="inline mr-1" size={16} /> If that email is in our system, your link is on
            its way. Check your inbox (and spam, just in case).
          </div>
        ) : (
          <>
            <p className="text-ink-soft mt-4 leading-relaxed">
              Enter your email and we will send you a private link to see and change your bookings. No
              password needed.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 border border-line/60 rounded-sm px-4 py-2.5 text-sm bg-cream-soft focus:border-gold outline-none"
                onKeyDown={(e) => e.key === 'Enter' && void requestLink()}
              />
              <button
                onClick={() => void requestLink()}
                disabled={sending}
                className="inline-flex items-center justify-center gap-2 bg-charcoal text-cream text-sm rounded-sm px-5 py-2.5 hover:bg-gold-deep transition-colors disabled:opacity-50"
              >
                <Mail size={14} />
                {sending ? 'Sending…' : 'Send my link'}
              </button>
            </div>
          </>
        )}
        <p className="text-xs text-ink-soft mt-8">
          Want to book something new?{' '}
          <Link href="/book-online" className="text-gold-deep underline">
            See available times
          </Link>
          .
        </p>
      </Shell>
    )
  }

  if (loading) {
    return (
      <Shell>
        <p className="text-ink-soft mt-6 text-sm">Loading your appointments…</p>
      </Shell>
    )
  }

  const upcoming = (data?.bookings ?? []).filter((b) => !b.past && b.status !== 'cancelled')
  const past = (data?.bookings ?? []).filter((b) => b.past || b.status === 'cancelled')

  return (
    <Shell>
      <p className="text-ink-soft mt-4 leading-relaxed">Hi {firstName(data?.name ?? '')}, here is everything you have with us.</p>

      <h2 className="font-display italic text-xl text-charcoal mt-8 mb-2">Coming up</h2>
      {upcoming.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Nothing booked at the moment.{' '}
          <Link href="/book-online" className="text-gold-deep underline">
            Find a time
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-3">
          {upcoming.map((b) => (
            <div key={b.id} className="bg-cream-soft border border-line/40 rounded-sm p-4">
              <div className="font-display italic text-lg text-charcoal">{b.serviceName}</div>
              <div className="text-sm text-ink-soft mt-1 flex items-center gap-2">
                <Calendar size={14} /> {whenLabel(b.startsAt)}
              </div>
              <Link
                href={`/book/manage/${b.manageToken}`}
                className="mt-3 inline-flex items-center gap-2 text-sm text-charcoal border border-charcoal/30 rounded-sm px-3 py-1.5 hover:border-gold hover:text-gold-deep transition-colors"
              >
                <RotateCcw size={13} /> Change or cancel
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Contact details */}
      <h2 className="font-display italic text-xl text-charcoal mt-10 mb-2">Your details</h2>
      <div className="bg-cream-soft border border-line/40 rounded-sm p-4 space-y-3">
        <div className="text-sm text-ink-soft flex items-center gap-2">
          <Mail size={14} /> {data?.email}
        </div>
        <label className="block text-sm">
          <span className="text-ink-soft flex items-center gap-2 mb-1">
            <Phone size={14} /> Mobile number
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setPhoneSaved(false)
              }}
              placeholder="07…"
              className="flex-1 border border-line/60 rounded-sm px-3 py-2 text-sm bg-cream focus:border-gold outline-none"
            />
            <button
              onClick={() => void savePhone()}
              disabled={savingPhone}
              className="inline-flex items-center justify-center gap-2 bg-charcoal text-cream text-sm rounded-sm px-4 py-2 hover:bg-gold-deep transition-colors disabled:opacity-50"
            >
              {phoneSaved ? <Check size={14} /> : <Clock size={14} />}
              {savingPhone ? 'Saving…' : phoneSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </label>
      </div>

      {past.length > 0 && (
        <>
          <h2 className="font-display italic text-xl text-charcoal mt-10 mb-2">Past and cancelled</h2>
          <div className="space-y-2">
            {past.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm border-b border-line/30 py-2">
                <span className="text-charcoal">{b.serviceName}</span>
                <span className="text-ink-soft">
                  {whenLabel(b.startsAt)}
                  {b.status === 'cancelled' && ' · cancelled'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Shell>
  )
}
