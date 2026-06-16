'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, CalendarPlus, Check, Clock, FileText, Gift, LogOut, Mail, MessageCircle, Phone, Plus, RotateCcw } from 'lucide-react'

type PortalBooking = {
  id: string
  serviceName: string
  serviceSlug: string | null
  startsAt: string
  endsAt: string | null
  status: string
  manageToken: string
  past: boolean
  needsConsent: boolean
}

type PortalData = { name: string; email: string; phone: string; bookings: PortalBooking[] }

type AuthMode = 'login' | 'register' | 'forgot'

const WHATSAPP = 'https://wa.me/447931395246'

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

function dateLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${iso}T12:00:00Z`))
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'there'
}

function icsStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

// Build and download a calendar (.ics) file so the appointment drops straight
// into Apple / Google / Outlook calendars.
function addToCalendar(b: PortalBooking) {
  const endIso = b.endsAt ?? new Date(new Date(b.startsAt).getTime() + 60 * 60 * 1000).toISOString()
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Visage Aesthetics//Booking//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${b.id}@vaclinic.co.uk`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(b.startsAt)}`,
    `DTEND:${icsStamp(endIso)}`,
    `SUMMARY:Visage Aesthetics: ${b.serviceName}`,
    'LOCATION:17A Friars Lane, Braintree, Essex CM7 9BL',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `visage-${b.serviceSlug ?? 'appointment'}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Stable page shell — kept at module scope so it is NOT re-created on every
// render (doing so would remount the inputs and drop focus / the keyboard).
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-24">
        <div className="eyebrow text-gold mb-2">Visage Aesthetics</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">Your appointments</h1>
        {children}
      </div>
    </section>
  )
}

export default function Account() {
  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)

  // Auth form state
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [forgotSent, setForgotSent] = useState(false)

  // Details state
  const [phone, setPhone] = useState('')
  const [savingPhone, setSavingPhone] = useState(false)
  const [phoneSaved, setPhoneSaved] = useState(false)

  // Soonest availability for the client's most recent treatment
  const [nextAvail, setNextAvail] = useState<{ slug: string; name: string; date: string } | null>(null)

  const loadPortal = useCallback(async () => {
    try {
      const res = await fetch('/api/book/portal', { cache: 'no-store' })
      if (res.ok) {
        const d = (await res.json()) as PortalData
        setData(d)
        setPhone(d.phone || '')
        return true
      }
    } catch {
      /* fall through to login */
    }
    setData(null)
    return false
  }, [])

  useEffect(() => {
    // Older email links arrive as /account?token=... — hand them to the bridge,
    // which sets a session cookie and bounces back here logged in.
    const token = new URLSearchParams(window.location.search).get('token')
    if (token) {
      window.location.replace(`/api/account/from-link?token=${encodeURIComponent(token)}`)
      return
    }
    void (async () => {
      await loadPortal()
      setLoading(false)
    })()
  }, [loadPortal])

  // Once we have bookings, look up the soonest free date for the most recent
  // treatment so the client can see when they could next come in.
  useEffect(() => {
    const anchor = data?.bookings.find((b) => b.serviceSlug)
    if (!anchor?.serviceSlug) { setNextAvail(null); return }
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/book/availability?service=${encodeURIComponent(anchor.serviceSlug!)}&days=60`)
        if (!res.ok) return
        const d = (await res.json()) as { calendar?: Record<string, number> }
        const firstFree = Object.keys(d.calendar ?? {}).filter((k) => (d.calendar![k] ?? 0) > 0).sort()[0]
        if (!cancelled && firstFree) setNextAvail({ slug: anchor.serviceSlug!, name: anchor.serviceName, date: firstFree })
      } catch {
        /* availability is best-effort */
      }
    })()
    return () => { cancelled = true }
  }, [data])

  const submitAuth = useCallback(async () => {
    setAuthError(null)
    setBusy(true)
    try {
      if (mode === 'forgot') {
        await fetch('/api/account/forgot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        })
        setForgotSent(true)
        return
      }
      const endpoint = mode === 'register' ? '/api/account/register' : '/api/account/login'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, remember }),
      })
      if (res.ok) {
        setPassword('')
        await loadPortal()
      } else {
        const d = await res.json().catch(() => ({}))
        setAuthError(d.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setAuthError('Network error. Please try again.')
    } finally {
      setBusy(false)
    }
  }, [mode, email, password, remember, loadPortal])

  async function logout() {
    await fetch('/api/account/logout', { method: 'POST' })
    setData(null)
    setMode('login')
    setPassword('')
  }

  async function savePhone() {
    setSavingPhone(true)
    setPhoneSaved(false)
    try {
      const res = await fetch('/api/book/portal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      if (res.ok) setPhoneSaved(true)
    } finally {
      setSavingPhone(false)
    }
  }

  if (loading) {
    return (
      <Shell>
        <p className="text-ink-soft mt-6 text-sm">Loading…</p>
      </Shell>
    )
  }

  // ---- Not logged in: login / register / forgot-password forms --------------
  if (!data) {
    const inputClass = 'w-full border border-line/60 rounded-sm px-4 py-2.5 text-sm bg-cream-soft focus:border-gold outline-none'

    if (mode === 'forgot' && forgotSent) {
      return (
        <Shell>
          <div className="mt-6 border border-green-300 bg-green-50 text-green-800 text-sm rounded-sm px-4 py-4 leading-relaxed">
            <Check className="inline mr-1" size={16} /> If that email matches a booking or account with us, a link to
            set your password is on its way. Check your inbox (and spam, just in case). The link lasts one hour.
          </div>
          <button onClick={() => { setMode('login'); setForgotSent(false) }} className="text-sm text-gold-deep underline mt-6">
            Back to log in
          </button>
        </Shell>
      )
    }

    return (
      <Shell>
        <p className="text-ink-soft mt-4 leading-relaxed">
          {mode === 'login' && 'Log in to see your upcoming and past appointments.'}
          {mode === 'register' && 'Create an account with the email you booked with, and choose a password.'}
          {mode === 'forgot' && 'Enter your email and we will send you a link to set a new password.'}
        </p>

        {mode === 'login' && (
          <div className="mt-4 border border-line/60 bg-cream-soft text-ink-soft text-sm rounded-sm px-4 py-3 leading-relaxed">
            Booked with us but never set up a password? Enter your email and press{' '}
            <button onClick={() => { setMode('forgot'); setAuthError(null) }} className="text-gold-deep underline">Set a password</button>{' '}
            — we will email you a link to create one.
          </div>
        )}

        <div className="mt-5 space-y-3">
          <label className="block text-sm">
            <span className="text-ink-soft flex items-center gap-2 mb-1"><Mail size={14} /> Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              className={inputClass}
              onKeyDown={(e) => e.key === 'Enter' && mode === 'forgot' && void submitAuth()}
            />
          </label>

          {mode !== 'forgot' && (
            <label className="block text-sm">
              <span className="text-ink-soft mb-1 block">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className={inputClass}
                onKeyDown={(e) => e.key === 'Enter' && void submitAuth()}
              />
            </label>
          )}

          {mode !== 'forgot' && (
            <label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer select-none">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-gold-deep" />
              Remember me on this device
            </label>
          )}

          {authError && <p className="text-sm text-clay">{authError}</p>}

          <button
            onClick={() => void submitAuth()}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 bg-charcoal text-cream text-sm rounded-sm px-5 py-2.5 hover:bg-gold-deep transition-colors disabled:opacity-50 w-full"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : mode === 'register' ? 'Create account' : 'Send my link'}
          </button>
        </div>

        <div className="mt-6 text-sm text-ink-soft space-y-2">
          {mode === 'login' && (
            <>
              <p>
                Forgot your password, or never set one?{' '}
                <button onClick={() => { setMode('forgot'); setAuthError(null) }} className="text-gold-deep underline">
                  Set a password
                </button>
              </p>
              <p>
                New here?{' '}
                <button onClick={() => { setMode('register'); setAuthError(null) }} className="text-gold-deep underline">
                  Create an account
                </button>
              </p>
            </>
          )}
          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setAuthError(null) }} className="text-gold-deep underline">
                Log in
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <button onClick={() => { setMode('login'); setAuthError(null) }} className="text-gold-deep underline">
              Back to log in
            </button>
          )}
        </div>

        <p className="text-xs text-ink-soft mt-8">
          Want to book something new?{' '}
          <Link href="/book-online" className="text-gold-deep underline">See available times</Link>.
        </p>
      </Shell>
    )
  }

  // ---- Logged in: appointments ---------------------------------------------
  const upcoming = data.bookings.filter((b) => !b.past && b.status !== 'cancelled')
  const past = data.bookings.filter((b) => b.past || b.status === 'cancelled')
  const consentNeeded = upcoming.filter((b) => b.needsConsent)

  return (
    <Shell>
      <div className="mt-4 flex items-start justify-between gap-4">
        <p className="text-ink-soft leading-relaxed">Hi {firstName(data.name)}, here is everything you have with us.</p>
        <button onClick={() => void logout()} className="shrink-0 inline-flex items-center gap-1.5 text-sm text-stone hover:text-gold-deep transition-colors">
          <LogOut size={14} /> Log out
        </button>
      </div>

      {/* Outstanding consent forms */}
      {consentNeeded.length > 0 && (
        <div className="mt-6 border border-gold/50 bg-gold/10 rounded-sm p-4">
          <div className="flex items-center gap-2 text-charcoal font-medium text-sm"><FileText size={15} /> Before your visit</div>
          {consentNeeded.map((b) => (
            <p key={b.id} className="text-sm text-ink-soft mt-2 leading-relaxed">
              Please complete your consent form for <span className="text-charcoal">{b.serviceName}</span>.{' '}
              <Link href={`/consent/${b.manageToken}`} className="text-gold-deep underline">Open the form</Link>
            </p>
          ))}
        </div>
      )}

      {/* Book a new appointment + soonest availability */}
      <div className="mt-6">
        <Link href="/book-online" className="btn btn-primary btn-block">
          <span className="inline-flex items-center gap-2"><Plus size={16} /> Book a new appointment</span>
        </Link>
        {nextAvail && (
          <p className="text-sm text-ink-soft mt-2 text-center">
            Soonest {nextAvail.name}:{' '}
            <Link href={`/book-online?service=${nextAvail.slug}`} className="text-gold-deep underline">{dateLabel(nextAvail.date)}</Link>
          </p>
        )}
      </div>

      <h2 className="font-display italic text-xl text-charcoal mt-10 mb-2">Coming up</h2>
      {upcoming.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Nothing booked at the moment.{' '}
          <Link href="/book-online" className="text-gold-deep underline">Find a time</Link>.
        </p>
      ) : (
        <div className="space-y-3">
          {upcoming.map((b) => (
            <div key={b.id} className="bg-cream-soft border border-line/40 rounded-sm p-4">
              <div className="font-display italic text-lg text-charcoal">{b.serviceName}</div>
              <div className="text-sm text-ink-soft mt-1 flex items-center gap-2">
                <Calendar size={14} /> {whenLabel(b.startsAt)}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/book/manage/${b.manageToken}`}
                  className="inline-flex items-center gap-2 text-sm text-charcoal border border-charcoal/30 rounded-sm px-3 py-1.5 hover:border-gold hover:text-gold-deep transition-colors"
                >
                  <RotateCcw size={13} /> Change or cancel
                </Link>
                <button
                  onClick={() => addToCalendar(b)}
                  className="inline-flex items-center gap-2 text-sm text-charcoal border border-charcoal/30 rounded-sm px-3 py-1.5 hover:border-gold hover:text-gold-deep transition-colors"
                >
                  <CalendarPlus size={13} /> Add to calendar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <h2 className="font-display italic text-xl text-charcoal mt-10 mb-2">Helpful links</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Link href="/aftercare" className="flex items-center gap-2 text-sm text-charcoal border border-line/50 bg-cream-soft rounded-sm px-3 py-2.5 hover:border-gold hover:text-gold-deep transition-colors">
          <FileText size={14} /> Aftercare advice
        </Link>
        <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-charcoal border border-line/50 bg-cream-soft rounded-sm px-3 py-2.5 hover:border-gold hover:text-gold-deep transition-colors">
          <MessageCircle size={14} /> WhatsApp the clinic
        </a>
        <Link href="/gift" className="flex items-center gap-2 text-sm text-charcoal border border-line/50 bg-cream-soft rounded-sm px-3 py-2.5 hover:border-gold hover:text-gold-deep transition-colors">
          <Gift size={14} /> Gift vouchers
        </Link>
      </div>

      {/* Contact details */}
      <h2 className="font-display italic text-xl text-charcoal mt-10 mb-2">Your details</h2>
      <div className="bg-cream-soft border border-line/40 rounded-sm p-4 space-y-3">
        <div className="text-sm text-ink-soft flex items-center gap-2">
          <Mail size={14} /> {data.email}
        </div>
        <label className="block text-sm">
          <span className="text-ink-soft flex items-center gap-2 mb-1">
            <Phone size={14} /> Mobile number
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setPhoneSaved(false) }}
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
              <div key={b.id} className="flex items-center justify-between gap-3 text-sm border-b border-line/30 py-2">
                <span className="text-charcoal">{b.serviceName}</span>
                <span className="flex items-center gap-3 shrink-0">
                  <span className="text-ink-soft">
                    {whenLabel(b.startsAt)}
                    {b.status === 'cancelled' && ' · cancelled'}
                  </span>
                  {b.serviceSlug && (
                    <Link href={`/book-online?service=${b.serviceSlug}`} className="text-gold-deep underline whitespace-nowrap">
                      Book again
                    </Link>
                  )}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Shell>
  )
}
