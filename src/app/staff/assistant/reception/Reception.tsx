'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { BellRing, CalendarDays, Check, Clock, ListPlus, LogOut, Mic, Sparkles, X } from 'lucide-react'

type Lite = { id: string; service_name: string; client_name: string; client_phone: string | null; starts_at: string; ends_at?: string; status: string; source: string; created_at: string }
type WaitRow = { id: string; client_name: string; service_name: string | null; client_phone: string | null }
type BusinessHour = { weekday: number; is_open: boolean; open_min: number; close_min: number }
type TimeOffRow = { id: string; starts_at: string; ends_at: string; reason: string | null }
type DayDiary = { bookings: Lite[]; timeOff: TimeOffRow[]; businessHours: BusinessHour[] }
type Data = {
  configured: boolean
  today: string
  stats: { todayCount: number; weekCount: number; waitlistCount: number; remindersPending: number; remindersSoon: number }
  todaysBookings: Lite[]
  justBooked: Lite[]
  waitlist: WaitRow[]
}

// ---- gap helpers -----------------------------------------------------------
function toLocalMin(iso: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date(iso))
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? '0')
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? '0')
  return h * 60 + m
}
type Interval = { start: number; end: number }
function subtractIntervals(free: Interval[], busy: Interval[]): Interval[] {
  let result = [...free]
  for (const b of busy) {
    result = result.flatMap((f) => {
      if (b.end <= f.start || b.start >= f.end) return [f]
      const parts: Interval[] = []
      if (b.start > f.start) parts.push({ start: f.start, end: b.start })
      if (b.end < f.end) parts.push({ start: b.end, end: f.end })
      return parts
    })
  }
  return result
}

function freeMinsForDay(
  date: string,
  bookings: Lite[],
  timeOff: TimeOffRow[],
  businessHours: BusinessHour[],
): number {
  const wday = new Date(`${date}T12:00:00Z`).getUTCDay()
  const bh = businessHours.find((h) => h.weekday === wday)
  if (!bh?.is_open) return 0
  const localDate = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date(iso))
  const busy: Interval[] = [
    ...bookings.filter((b) => localDate(b.starts_at) === date && b.ends_at).map((b) => ({ start: toLocalMin(b.starts_at), end: toLocalMin(b.ends_at!) })),
    ...timeOff.filter((t) => localDate(t.starts_at) <= date && localDate(t.ends_at) >= date).map((t) => ({ start: toLocalMin(t.starts_at), end: toLocalMin(t.ends_at) })),
  ]
  return subtractIntervals([{ start: bh.open_min, end: bh.close_min }], busy)
    .filter((g) => g.end - g.start >= 15)
    .reduce((s, g) => s + g.end - g.start, 0)
}

function freeLabel(mins: number): string {
  if (mins <= 0) return ''
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return [h > 0 ? `${h}h` : null, m > 0 ? `${m}m` : null].filter(Boolean).join(' ') + ' free'
}

const TZ = 'Europe/London'
function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso))
}
function dayTimeLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso))
}
function ago(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 60) return `${Math.max(1, mins)}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}
function todayStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
}
function addDays(ds: string, n: number): string {
  const d = new Date(`${ds}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
function weekStart(ds: string): string {
  const d = new Date(`${ds}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}
function monthBounds(ds: string): { from: string; to: string } {
  const [y, m] = ds.split('-').map(Number)
  return { from: `${ds.slice(0, 7)}-01`, to: new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10) }
}
function localDate(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(iso))
}
function dayLabelShort(ds: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${ds}T12:00:00Z`))
}

const statusTone: Record<string, string> = {
  confirmed: 'text-sage',
  pending: 'text-gold-deep',
  completed: 'text-stone',
  no_show: 'text-clay',
}

export default function Reception({ simple = false }: { simple?: boolean }) {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'day' | 'week' | 'month'>('day')
  const [range, setRange] = useState<Lite[]>([])
  const [rangeLoading, setRangeLoading] = useState(false)
  const [dayDiary, setDayDiary] = useState<DayDiary | null>(null)
  const [rangeExtra, setRangeExtra] = useState<{ timeOff: TimeOffRow[]; businessHours: BusinessHour[] } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [recRes, diaryRes] = await Promise.all([
      fetch('/api/staff/assistant/reception'),
      fetch(`/api/staff/assistant/diary?date=${todayStr()}`),
    ])
    if (recRes.ok) setData(await recRes.json())
    if (diaryRes.ok) setDayDiary(await diaryRes.json())
    setLoading(false)
  }, [])
  useEffect(() => { void load() }, [load])

  // Compute free gaps for the day view
  const dayGaps = useMemo<Interval[]>(() => {
    if (!dayDiary) return []
    const today = todayStr()
    const wday = new Date(`${today}T12:00:00Z`).getUTCDay()
    const bh = dayDiary.businessHours?.find((h) => h.weekday === wday)
    if (!bh?.is_open) return []
    const busySlots: Interval[] = [
      ...(dayDiary.bookings ?? [])
        .filter((b) => b.status !== 'cancelled' && b.ends_at)
        .map((b) => ({ start: toLocalMin(b.starts_at), end: toLocalMin(b.ends_at!) })),
      ...(dayDiary.timeOff ?? [])
        .map((t) => ({ start: toLocalMin(t.starts_at), end: toLocalMin(t.ends_at) })),
    ]
    return subtractIntervals([{ start: bh.open_min, end: bh.close_min }], busySlots).filter((g) => g.end - g.start >= 15)
  }, [dayDiary])

  useEffect(() => {
    if (view === 'day') return
    const today = todayStr()
    const { from, to } = view === 'week' ? { from: weekStart(today), to: addDays(weekStart(today), 6) } : monthBounds(today)
    setRangeLoading(true)
    fetch(`/api/staff/assistant/diary?from=${from}&to=${to}`)
      .then((r) => (r.ok ? r.json() : { bookings: [] }))
      .then((d) => {
        setRange((d.bookings ?? []).filter((b: Lite) => b.status !== 'cancelled'))
        setRangeExtra({ timeOff: d.timeOff ?? [], businessHours: d.businessHours ?? [] })
        setRangeLoading(false)
      })
      .catch(() => setRangeLoading(false))
  }, [view])

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  const s = data?.stats

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="eyebrow text-gold mb-2">
              Front desk
            </div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">The front desk.</h1>
            <p className="text-ink-soft mt-3 max-w-xl leading-relaxed">Everything happening around the chair, in one place. The clinical side stays with you.</p>
          </div>
          <button onClick={signOut} className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0 mt-2">
            <LogOut size={14} strokeWidth={1.75} /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <CommandBar onActioned={load} />

        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : !data?.configured ? (
          <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-4">The clinic database is not connected yet.</p>
        ) : (
          <>
            {!simple && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                <Stat n={s!.todayCount} label="In today" tone="ink" />
                <Stat n={s!.weekCount} label="Next 7 days" tone="ink" />
                <Stat n={s!.waitlistCount} label="On waitlist" tone={s!.waitlistCount > 0 ? 'gold' : 'mute'} />
              </div>
            )}

            {/* Reminders going out */}
            <div className={`flex items-center gap-3 rounded-sm border px-4 py-3 mb-8 ${s!.remindersPending > 0 ? 'border-gold/40 bg-gold/5' : 'border-sage/30 bg-sage/5'}`}>
              <BellRing size={16} strokeWidth={1.75} className={s!.remindersPending > 0 ? 'text-gold-deep' : 'text-sage'} />
              <div className="text-sm text-charcoal">
                {s!.remindersSoon === 0 ? 'No appointments in the next 24 hours.' : `${s!.remindersSoon} appointment${s!.remindersSoon === 1 ? '' : 's'} in the next 24 hours. ${s!.remindersPending} reminder${s!.remindersPending === 1 ? '' : 's'} still to send.`}
              </div>
            </div>

            <Section title={view === 'day' ? 'Today' : view === 'week' ? 'This week' : 'This month'} icon={CalendarDays} href="/staff/assistant/diary" cta="Open diary">
              <div className="flex mb-3">
                <div className="inline-flex rounded-full border border-line/50 bg-cream-soft p-0.5">
                  {(['day', 'week', 'month'] as const).map((v) => (
                    <button key={v} onClick={() => setView(v)} className={`text-sm rounded-full px-4 py-1.5 capitalize transition-colors ${view === v ? 'bg-gold text-charcoal' : 'text-ink-soft'}`}>{v}</button>
                  ))}
                </div>
              </div>
              {view === 'day' ? (
                (() => {
                  // Merge bookings and free gaps into a single sorted timeline
                  type TItem = { kind: 'booking'; b: Lite } | { kind: 'gap'; start: number; end: number }
                  const items: TItem[] = [
                    ...data.todaysBookings.map((b) => ({ kind: 'booking' as const, b })),
                    ...dayGaps.map((g) => ({ kind: 'gap' as const, ...g })),
                  ].sort((a, b) => {
                    const ta = a.kind === 'booking' ? toLocalMin(a.b.starts_at) : a.start
                    const tb = b.kind === 'booking' ? toLocalMin(b.b.starts_at) : b.start
                    return ta - tb
                  })
                  if (items.length === 0) return <Empty>Nothing booked today.</Empty>
                  return (
                    <div className="space-y-2">
                      {items.map((item, i) =>
                        item.kind === 'booking' ? (
                          <Row key={item.b.id} left={<span><span className="font-medium">{timeLabel(item.b.starts_at)}</span> &nbsp; {item.b.client_name}</span>} sub={item.b.service_name} right={<span className={`capitalize ${statusTone[item.b.status] ?? 'text-stone'}`}>{item.b.status.replace('_', ' ')}</span>} />
                        ) : (
                          <GapRow key={`gap-${i}`} startMin={item.start} endMin={item.end} />
                        )
                      )}
                    </div>
                  )
                })()
              ) : rangeLoading ? (
                <p className="text-sm text-ink-soft">Loading…</p>
              ) : range.length === 0 ? (
                <Empty>Nothing booked.</Empty>
              ) : (
                <div className="space-y-4">
                  {[...new Set(range.map((b) => localDate(b.starts_at)))].sort().map((day) => {
                    const dayB = range.filter((b) => localDate(b.starts_at) === day).sort((a, b) => a.starts_at.localeCompare(b.starts_at))
                    const free = rangeExtra ? freeMinsForDay(day, range, rangeExtra.timeOff, rangeExtra.businessHours) : 0
                    const freeStr = freeLabel(free)
                    return (
                      <div key={day}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-sm font-medium ${day === todayStr() ? 'text-gold-deep' : 'text-charcoal'}`}>{dayLabelShort(day)}{day === todayStr() ? ' · today' : ''}</span>
                          <div className="flex items-center gap-2">
                            {freeStr && <span className="text-xs text-stone/70 border border-dashed border-line/50 rounded-full px-2 py-0.5">{freeStr}</span>}
                            <span className="text-xs text-stone">{dayB.length} in</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {dayB.map((b) => (
                            <Row key={b.id} left={<span><span className="font-medium">{timeLabel(b.starts_at)}</span> &nbsp; {b.client_name}</span>} sub={b.service_name} right={<span className={`capitalize ${statusTone[b.status] ?? 'text-stone'}`}>{b.status.replace('_', ' ')}</span>} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Section>

            <Section title="Just booked online" icon={Sparkles}>
              {data.justBooked.length === 0 ? (
                <Empty>No online bookings in the last week.</Empty>
              ) : (
                <div className="space-y-2">
                  {data.justBooked.map((b) => (
                    <Row key={b.id} left={<span className="font-medium">{b.client_name}</span>} sub={`${b.service_name} · ${dayTimeLabel(b.starts_at)}`} right={<span className="text-stone text-xs">{ago(b.created_at)}</span>} />
                  ))}
                </div>
              )}
            </Section>

            <Section title="Waitlist" icon={ListPlus} href="/staff/assistant/diary" cta="In diary">
              {data.waitlist.length === 0 ? (
                <Empty>No one waiting.</Empty>
              ) : (
                <div className="space-y-2">
                  {data.waitlist.map((w) => (
                    <Row key={w.id} left={<span className="font-medium">{w.client_name}</span>} sub={[w.service_name, w.client_phone].filter(Boolean).join(' · ') || null} right={null} />
                  ))}
                </div>
              )}
            </Section>
          </>
        )}
      </div>
    </section>
  )
}

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
        // Looks like a question — fall through to the ask endpoint automatically
        const qRes = await fetch('/api/staff/assistant/ask', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
        })
        const qd = await qRes.json().catch(() => ({}))
        if (!qRes.ok) { setError(qd.error || 'Could not answer that.'); return }
        setAnswer(qd.answer || 'No answer.')
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
    <div className="border border-gold/40 bg-gold/5 rounded-sm p-5 mb-8">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-eyebrow text-gold-deep">What would you like me to do?</span>
        {micSupported && (
          <button type="button" onClick={toggleMic} className={`inline-flex items-center gap-2 text-sm rounded-full border px-3 py-1.5 transition-colors ${listening ? 'border-clay bg-clay/10 text-clay' : 'border-gold/50 text-gold-deep hover:bg-gold/10'}`}>
            <Mic size={15} strokeWidth={1.75} className={listening ? 'animate-pulse' : ''} />
            {listening ? 'Listening… tap to stop' : 'Tap to talk'}
          </button>
        )}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        className="w-full bg-cream border border-line rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold leading-relaxed"
        placeholder="e.g. Book Sarah in for Botox on Thursday at 2pm · Cancel John's appointment · Change Tuesday to 10 to 2 · Block this client for 3 months · When did Sarah last come in? · Who's on the waitlist?"
      />
      {error && <p className="text-sm text-clay mt-2">{error}</p>}
      {done && <p className="text-sm text-sage mt-2 inline-flex items-center gap-1.5"><Check size={14} strokeWidth={2} /> {done}</p>}
      {answer && <div className="text-sm text-charcoal mt-3 border border-line/40 bg-cream rounded-sm px-3 py-2.5">{answer}</div>}

      {proposal ? (
        <div className="mt-3 border border-gold/40 bg-cream rounded-sm p-3">
          <div className="text-sm text-charcoal mb-3">{proposal.summary}</div>
          <div className="flex items-center gap-2">
            <button onClick={confirm} disabled={busy} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 38 }}>
              <span className="inline-flex items-center gap-2"><Check size={14} strokeWidth={2} /> {busy ? 'Doing it…' : 'Do it'}</span>
            </button>
            <button onClick={() => setProposal(null)} className="btn btn-secondary" style={{ minHeight: 38 }}>
              <span className="inline-flex items-center gap-2"><X size={14} strokeWidth={1.75} /> Not that</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <button onClick={interpret} disabled={busy || !text.trim()} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 40 }}>
            <span className="inline-flex items-center gap-2"><Sparkles size={15} strokeWidth={1.75} /> {busy ? 'Working…' : 'Action this'}</span>
          </button>
          <button onClick={ask} disabled={busy || !text.trim()} className="btn btn-secondary disabled:opacity-50" style={{ minHeight: 40 }}>
            <span className="inline-flex items-center gap-2">Ask a question</span>
          </button>
        </div>
      )}
      <p className="text-xs text-ink-soft mt-2">Actions: book, cancel, block time, open/close days, flag a client, change hours. Questions: when did [name] last come in? What has [name] had? Who's on the waitlist? How many Botox last month?</p>
    </div>
  )
}

function Stat({ n, label, tone }: { n: number; label: string; tone: 'gold' | 'mute' | 'ink' }) {
  const color = tone === 'gold' ? 'text-gold-deep' : tone === 'mute' ? 'text-stone' : 'text-charcoal'
  return (
    <div className="bg-cream-soft border border-line/40 rounded-sm px-3 py-3 text-center">
      <div className={`font-display italic text-3xl leading-none ${color}`}>{n}</div>
      <div className="text-eyebrow text-ink-soft mt-1.5">{label}</div>
    </div>
  )
}

function Section({ title, icon: Icon, href, cta, children }: { title: string; icon: typeof Clock; href?: string; cta?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="eyebrow text-gold flex items-center gap-2"><Icon size={13} strokeWidth={1.75} /> {title}</div>
        {href && cta && <Link href={href} className="text-xs text-gold-deep hover:underline">{cta} →</Link>}
      </div>
      {children}
    </div>
  )
}

function Row({ left, sub, right }: { left: React.ReactNode; sub: string | null; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border border-line/40 bg-cream-soft rounded-sm px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm text-charcoal truncate">{left}</div>
        {sub && <div className="text-xs text-stone truncate mt-0.5">{sub}</div>}
      </div>
      {right && <div className="shrink-0 text-sm">{right}</div>}
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-3">{children}</p>
}

function gapClock(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  const suffix = h < 12 ? 'am' : 'pm'
  const h12 = h % 12 || 12
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, '0')}${suffix}`
}

function GapRow({ startMin, endMin }: { startMin: number; endMin: number }) {
  const duration = endMin - startMin
  const hrs = Math.floor(duration / 60)
  const mins = duration % 60
  const label = [hrs > 0 ? `${hrs}h` : null, mins > 0 ? `${mins}m` : null].filter(Boolean).join(' ')
  return (
    <div className="flex items-center justify-between gap-3 border border-dashed border-line/40 rounded-sm px-4 py-2.5 opacity-60">
      <div className="min-w-0">
        <div className="text-sm text-stone truncate"><span className="font-medium">{gapClock(startMin)}</span> &nbsp; Free</div>
        <div className="text-xs text-stone/70 mt-0.5">Until {gapClock(endMin)} · {label}</div>
      </div>
    </div>
  )
}
