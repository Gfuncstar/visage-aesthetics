'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { CalendarPlus, Check, Clock, Mic, Phone, Sparkles, X } from 'lucide-react'

type Booking = {
  id: string
  service_name: string
  client_name: string
  client_phone: string | null
  starts_at: string
  ends_at?: string
  status: string
}

type JustBooked = {
  id: string
  client_name: string
  service_name: string
  starts_at: string
  created_at: string
}

const TZ = 'Europe/London'

function toLocalMin(iso: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(iso))
  return (
    Number(parts.find((p) => p.type === 'hour')?.value ?? 0) * 60 +
    Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  )
}

function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso))
}

function minLabel(mins: number): string {
  if (mins <= 0) return '0m'
  const h = Math.floor(mins / 60), m = mins % 60
  return [h > 0 ? `${h}h` : null, m > 0 ? `${m}m` : null].filter(Boolean).join(' ')
}

function todayStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
}

function tomorrowStr(): string {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d)
}

function shortDayLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso))
}

function localDate(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(iso))
}

function agoLabel(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

function apptLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(iso))
}

function useLiveClock(): string {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date())
  const [clock, setClock] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setClock(fmt()), 10_000)
    return () => clearInterval(id)
  }, [])
  return clock
}

function useNowMin(): number {
  const [nowMin, setNowMin] = useState(() => toLocalMin(new Date().toISOString()))
  useEffect(() => {
    const id = setInterval(() => setNowMin(toLocalMin(new Date().toISOString())), 30_000)
    return () => clearInterval(id)
  }, [])
  return nowMin
}

export default function StaffLandingHub({ greeting, dateLabel }: { greeting: string; dateLabel: string }) {
  const clock = useLiveClock()
  const nowMin = useNowMin()
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [justBooked, setJustBooked] = useState<JustBooked[] | null>(null)
  const [dismissedBookings, setDismissedBookings] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    const res = await fetch(`/api/staff/assistant/diary?from=${todayStr()}&to=${tomorrowStr()}`)
    if (res.ok) {
      const d = await res.json()
      setBookings(d.bookings ?? [])
    }
  }, [])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    const id = setInterval(() => void load(), 45_000)
    return () => clearInterval(id)
  }, [load])

  useEffect(() => {
    fetch('/api/staff/assistant/just-booked')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setJustBooked(d.bookings ?? []) })
      .catch(() => {})
  }, [])

  const today = todayStr()

  const live = useMemo(
    () =>
      (bookings ?? [])
        .filter((b) => {
          if (b.status === 'cancelled') return false
          const localD = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(b.starts_at))
          return localD === today
        })
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [bookings, today],
  )

  const next24h = useMemo(() => {
    const now = Date.now()
    const cutoff = now + 24 * 60 * 60 * 1000
    return (bookings ?? [])
      .filter((b) => {
        if (b.status === 'cancelled') return false
        const t = new Date(b.starts_at).getTime()
        return t > now && t <= cutoff
      })
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
  }, [bookings])

  const current = useMemo(
    () =>
      live.find((b) => {
        const s = toLocalMin(b.starts_at)
        const e = b.ends_at ? toLocalMin(b.ends_at) : s + 60
        return nowMin >= s && nowMin < e
      }) ?? null,
    [live, nowMin],
  )

  const next = useMemo(
    () => live.find((b) => toLocalMin(b.starts_at) > nowMin) ?? null,
    [live, nowMin],
  )

  return (
    <div className="mt-3 space-y-5">
      {/* Greeting + date/clock on one line */}
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-display italic text-charcoal text-4xl md:text-5xl leading-tight shrink-0">
          {greeting}.
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-stone text-right flex-wrap justify-end">
          <span className="whitespace-nowrap">{dateLabel}</span>
          <span className="text-stone/40">·</span>
          <span className="tabular-nums font-medium text-charcoal whitespace-nowrap">{clock}</span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
            <span>Live</span>
          </span>
        </div>
      </div>

      {/* Command bar */}
      <CommandBar onActioned={load} />

      {/* Today — only shown when there are live bookings */}
      {(live.length > 0 || current || next) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="eyebrow text-gold flex items-center gap-2">
              <Clock size={13} strokeWidth={1.75} /> Today
            </div>
            <Link href="/staff/assistant/reception" className="text-xs text-gold-deep hover:underline">
              Full front desk →
            </Link>
          </div>

          {/* Now / Next */}
          {(current || next) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className={`rounded-sm border px-4 py-3 ${current ? 'border-sage/40 bg-sage/5' : 'border-line/40 bg-cream-soft'}`}>
                <div className={`eyebrow mb-1.5 flex items-center gap-2 ${current ? 'text-sage' : 'text-stone'}`}>
                  {current && <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />}
                  {current ? 'In chair now' : 'Chair is free'}
                </div>
                {current ? (
                  <>
                    <div className="text-sm font-medium text-charcoal">{current.client_name}</div>
                    <div className="text-xs text-stone mt-0.5">{current.service_name}</div>
                    <div className="text-xs text-stone/70 mt-1.5">
                      {timeLabel(current.starts_at)} · {minLabel(nowMin - toLocalMin(current.starts_at))} in
                      {current.ends_at && ` · until ${timeLabel(current.ends_at)}`}
                    </div>
                    {current.client_phone && (
                      <a href={`tel:${current.client_phone}`} className="inline-flex items-center gap-1.5 text-xs text-gold-deep mt-2 hover:underline">
                        <Phone size={11} strokeWidth={2} /> {current.client_phone}
                      </a>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-stone mt-1">
                    {next ? `Free until ${timeLabel(next.starts_at)}.` : 'Nothing more today.'}
                  </div>
                )}
              </div>

              {next && (
                <div className="rounded-sm border border-line/40 bg-cream-soft px-4 py-3">
                  <div className="eyebrow text-gold mb-1.5">Up next · {timeLabel(next.starts_at)}</div>
                  <div className="text-sm font-medium text-charcoal">{next.client_name}</div>
                  <div className="text-xs text-stone mt-0.5">{next.service_name}</div>
                  <div className="text-xs text-stone/70 mt-1.5">In {minLabel(toLocalMin(next.starts_at) - nowMin)}</div>
                  {next.client_phone && (
                    <a href={`tel:${next.client_phone}`} className="inline-flex items-center gap-1.5 text-xs text-gold-deep mt-2 hover:underline">
                      <Phone size={11} strokeWidth={2} /> {next.client_phone}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Today's full list */}
          {live.length > 0 && (
            <div className="border border-line/40 rounded-sm bg-cream-soft divide-y divide-line/30">
              {live.map((b) => {
                const s = toLocalMin(b.starts_at)
                const e = b.ends_at ? toLocalMin(b.ends_at) : s + 60
                const isCurrent = nowMin >= s && nowMin < e
                return (
                  <div key={b.id} className={`flex items-center gap-3 px-4 py-2.5 ${isCurrent ? 'bg-sage/5' : ''}`}>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-charcoal flex items-center gap-2">
                        {isCurrent && <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage shrink-0" />}
                        <span>
                          <span className="font-medium">{timeLabel(b.starts_at)}</span> &nbsp; {b.client_name}
                        </span>
                      </div>
                      <div className="text-xs text-stone truncate">{b.service_name}</div>
                    </div>
                    {b.client_phone && (
                      <a href={`tel:${b.client_phone}`} className="text-stone hover:text-gold-deep shrink-0" title={`Call ${b.client_name}`}>
                        <Phone size={13} strokeWidth={1.75} />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Next 24h + Just booked — always side by side including mobile */}
      {(next24h.length > 0 || (justBooked !== null && justBooked.length > 0)) && (
        <div className="grid grid-cols-2 gap-3 items-start">
          {/* Next 24 hours */}
          {next24h.length > 0 && (
            <div>
              <div className="eyebrow text-stone mb-3 flex items-center gap-2">
                <Clock size={13} strokeWidth={1.75} />
                Next 24 h · {next24h.length} {next24h.length === 1 ? 'appt' : 'appts'}
              </div>
              <div className="border border-line/40 rounded-sm bg-cream-soft divide-y divide-line/30 overflow-hidden">
                {next24h.map((b) => {
                  const isToday = b.starts_at.startsWith(today)
                  return (
                    <Link key={b.id} href={`/staff/assistant/diary?date=${localDate(b.starts_at)}`} className="flex items-center gap-3 px-4 py-2 hover:bg-gold/5 transition-colors">
                      <div className="min-w-[72px] shrink-0">
                        <div className="text-xs font-medium text-charcoal tabular-nums">{timeLabel(b.starts_at)}</div>
                        {!isToday && <div className="text-[10px] text-stone/70">{shortDayLabel(b.starts_at)}</div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-charcoal truncate">{b.client_name}</div>
                        <div className="text-[10px] text-stone/60 truncate">{b.service_name}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Just booked */}
          {justBooked !== null && justBooked.filter((b) => !dismissedBookings.has(b.id)).length > 0 && (
            <div>
              <div className="eyebrow text-gold mb-3 flex items-center gap-2">
                <CalendarPlus size={13} strokeWidth={1.75} /> Just booked
              </div>
              <div className="border border-line/40 rounded-sm bg-cream-soft divide-y divide-line/30 overflow-hidden">
                {justBooked.filter((b) => !dismissedBookings.has(b.id)).map((b) => (
                  <div key={b.id} className="relative flex items-start">
                    <Link href={`/staff/assistant/diary?date=${localDate(b.starts_at)}`} className="flex items-start gap-3 px-4 py-3 hover:bg-gold/5 transition-colors flex-1 min-w-0 pr-10">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-charcoal truncate">{b.client_name}</div>
                        <div className="text-xs text-stone truncate">{b.service_name}</div>
                        <div className="text-xs text-stone/70 mt-0.5">{apptLabel(b.starts_at)}</div>
                      </div>
                      <span className="text-xs text-stone/60 shrink-0 pt-0.5">{agoLabel(b.created_at)}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDismissedBookings((prev) => new Set([...prev, b.id]))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-sm text-ink-soft hover:text-clay transition-colors"
                    >
                      <X size={13} strokeWidth={1.75} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---- Command bar -----------------------------------------------------------
type ParsedAction = { type: string; [k: string]: unknown }

function CommandBar({ onActioned }: { onActioned: () => void }) {
  const [text, setText] = useState('')
  const [listening, setListening] = useState(false)
  const [micSupported, setMicSupported] = useState(false)
  const [busy, setBusy] = useState(false)
  const [proposal, setProposal] = useState<{ action: ParsedAction; summary: string } | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setMicSupported(Boolean(SR))
  }, [])

  // Let Escape dismiss the confirmation pop-up that appears after an action runs.
  useEffect(() => {
    if (!done) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDone(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done])

  function toggleMic() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    if (listening) { recRef.current?.stop(); return }
    const rec = new SR()
    rec.lang = 'en-GB'
    rec.continuous = true
    rec.interimResults = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let said = ''
      for (let i = e.resultIndex; i < e.results.length; i++) said += e.results[i][0].transcript
      setText((prev) => (prev ? `${prev} ${said}` : said).trim())
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
    rec.start()
    setListening(true)
  }

  async function ask() {
    if (!text.trim()) return
    if (listening) recRef.current?.stop()
    setBusy(true); setError(null); setDone(null); setProposal(null); setAnswer(null)
    try {
      const res = await fetch('/api/staff/assistant/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setError(d.error || 'Could not answer that.'); return }
      setAnswer(d.answer || 'No answer.')
    } catch { setError('Network error.') } finally { setBusy(false) }
  }

  async function interpret() {
    if (!text.trim()) return
    if (listening) recRef.current?.stop()
    setBusy(true); setError(null); setDone(null); setProposal(null); setAnswer(null)
    try {
      const res = await fetch('/api/staff/assistant/command', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setError(d.error || 'Could not read that.'); return }
      if (d.action?.type === 'unknown') {
        setError('That looks like a question — hit "Ask a question" to look that up.')
        return
      }
      setProposal({ action: d.action, summary: d.summary })
    } catch { setError('Network error.') } finally { setBusy(false) }
  }

  async function confirm() {
    if (!proposal) return
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/staff/assistant/command/execute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: proposal.action }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok || d.ok === false) { setError(d.message || d.error || 'Could not do that.'); return }
      setDone(d.message || 'Done.')
      setProposal(null); setText('')
      onActioned()
    } catch { setError('Network error.') } finally { setBusy(false) }
  }

  return (
    <div className="space-y-3">
      <div className="border border-gold/40 bg-gold/5 rounded-sm p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="eyebrow text-gold-deep">How can I help?</span>
          {micSupported && (
            <button
              type="button"
              onClick={toggleMic}
              className={`inline-flex items-center gap-2 text-sm rounded-full border px-3 py-1.5 transition-colors ${
                listening ? 'border-clay bg-clay/10 text-clay' : 'border-gold/50 text-gold-deep hover:bg-gold/10'
              }`}
            >
              <Mic size={15} strokeWidth={1.75} className={listening ? 'animate-pulse' : ''} />
              {listening ? 'Listening…' : 'Talk'}
            </button>
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="w-full bg-cream border border-line rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold leading-relaxed"
          placeholder="Type what you want to do or ask, then choose below…"
        />
        {error && <p className="text-sm text-clay mt-2">{error}</p>}
        {answer && (
          <div className="text-sm text-charcoal mt-3 border border-line/40 bg-cream rounded-sm px-3 py-2.5 leading-relaxed">
            {answer}
          </div>
        )}
        {proposal && (
          <div className="mt-3 border border-gold/40 bg-cream rounded-sm p-3">
            <div className="text-sm text-charcoal mb-3">{proposal.summary}</div>
            <div className="flex items-center gap-2">
              <button onClick={confirm} disabled={busy} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 38 }}>
                <span className="inline-flex items-center gap-2">
                  <Check size={14} strokeWidth={2} /> {busy ? 'Doing it…' : 'Do it'}
                </span>
              </button>
              <button onClick={() => setProposal(null)} className="btn btn-secondary" style={{ minHeight: 38 }}>
                <span className="inline-flex items-center gap-2"><X size={14} strokeWidth={1.75} /> Not that</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {!proposal && (
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-gold/40 bg-gold/5 rounded-sm px-4 py-3">
            <button
              onClick={interpret}
              disabled={busy || !text.trim()}
              className="btn btn-primary w-full disabled:opacity-50 mb-2"
              style={{ minHeight: 40 }}
            >
              <span className="inline-flex items-center gap-2">
                <Sparkles size={14} strokeWidth={1.75} />
                {busy ? 'Working…' : 'Action'}
              </span>
            </button>
            <p className="text-xs text-ink-soft leading-snug">Book · cancel · block time · change hours · flag a client</p>
          </div>
          <div className="border border-line/40 bg-cream-soft rounded-sm px-4 py-3">
            <button
              onClick={ask}
              disabled={busy || !text.trim()}
              className="btn btn-secondary w-full disabled:opacity-50 mb-2"
              style={{ minHeight: 40 }}
            >
              Question
            </button>
            <p className="text-xs text-ink-soft leading-snug">Last visit · treatment history · who&apos;s due · waitlist · stats</p>
          </div>
        </div>
      )}

      {/* Confirmation pop-up — shown after an action is approved and has run, so
          it's impossible to miss that the change went through. */}
      {done && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/40 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="action-done-title"
          onClick={() => setDone(null)}
        >
          <div
            className="bg-cream border border-gold/40 rounded-md shadow-xl max-w-sm w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="inline-flex w-12 h-12 rounded-full bg-sage/15 text-sage items-center justify-center mb-4">
              <Check size={24} strokeWidth={2} />
            </span>
            <h2 id="action-done-title" className="font-display italic text-2xl text-charcoal leading-tight">
              Done
            </h2>
            <p className="text-sm text-charcoal/80 mt-2 leading-relaxed">{done}</p>
            <button
              onClick={() => setDone(null)}
              className="btn btn-primary mt-5"
              style={{ minHeight: 40 }}
              autoFocus
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
