'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Check, Clock, Mic, Phone, Sparkles, X } from 'lucide-react'

type Booking = {
  id: string
  service_name: string
  client_name: string
  client_phone: string | null
  starts_at: string
  ends_at?: string
  status: string
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

export default function StaffLandingHub() {
  const clock = useLiveClock()
  const nowMin = useNowMin()
  const [bookings, setBookings] = useState<Booking[] | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/staff/assistant/diary?date=${todayStr()}`)
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

  const live = useMemo(
    () =>
      (bookings ?? [])
        .filter((b) => b.status !== 'cancelled')
        .sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    [bookings],
  )

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
    <div className="mt-6 space-y-6">
      {/* Live clock */}
      <div className="flex items-center gap-3">
        <span className="font-display italic text-2xl text-charcoal tabular-nums">{clock}</span>
        <span className="inline-flex items-center gap-1.5 text-xs text-stone">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
          Live
        </span>
      </div>

      {/* Command bar */}
      <CommandBar onActioned={load} />

      {/* Today's diary mirror */}
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
        {live.length > 0 ? (
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
        ) : bookings !== null ? (
          <p className="text-sm text-stone/70 border border-line/40 rounded-sm bg-cream-soft px-4 py-3 text-center">
            Nothing booked today.
          </p>
        ) : (
          <p className="text-sm text-stone/60 px-1">Loading today…</p>
        )}
      </div>
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
        {done && (
          <p className="text-sm text-sage mt-2 inline-flex items-center gap-1.5">
            <Check size={14} strokeWidth={2} /> {done}
          </p>
        )}
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
                {busy ? 'Working…' : 'Action this'}
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
              Ask a question
            </button>
            <p className="text-xs text-ink-soft leading-snug">Last visit · treatment history · who&apos;s due · waitlist · stats</p>
          </div>
        </div>
      )}
    </div>
  )
}
