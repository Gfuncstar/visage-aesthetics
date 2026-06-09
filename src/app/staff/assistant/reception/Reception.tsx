'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { BellRing, CalendarDays, Check, Clock, ListPlus, LogOut, Mic, Phone, Sparkles, X } from 'lucide-react'
import { notifyDone } from '@/lib/staff-toast'

type Lite = { id: string; service_name: string; client_name: string; client_phone: string | null; starts_at: string; ends_at?: string; status: string; source: string; created_at: string; confirmed_at: string | null }
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
  const ld = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date(iso))
  const busy: Interval[] = [
    ...bookings.filter((b) => ld(b.starts_at) === date && b.ends_at).map((b) => ({ start: toLocalMin(b.starts_at), end: toLocalMin(b.ends_at!) })),
    ...timeOff.filter((t) => ld(t.starts_at) <= date && ld(t.ends_at) >= date).map((t) => ({ start: toLocalMin(t.starts_at), end: toLocalMin(t.ends_at) })),
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

function minLabel(mins: number): string {
  if (mins <= 0) return '0m'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return [h > 0 ? `${h}h` : null, m > 0 ? `${m}m` : null].filter(Boolean).join(' ')
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

// ---- live hooks ------------------------------------------------------------
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

// ---- main component --------------------------------------------------------
export default function Reception({ simple = false }: { simple?: boolean }) {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'day' | 'week' | 'month'>('day')
  const [range, setRange] = useState<Lite[]>([])
  const [rangeLoading, setRangeLoading] = useState(false)
  const [dayDiary, setDayDiary] = useState<DayDiary | null>(null)
  const [rangeExtra, setRangeExtra] = useState<{ timeOff: TimeOffRow[]; businessHours: BusinessHour[] } | null>(null)
  const clock = useLiveClock()
  const nowMin = useNowMin()

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    const [recRes, diaryRes] = await Promise.all([
      fetch('/api/staff/assistant/reception'),
      fetch(`/api/staff/assistant/diary?date=${todayStr()}`),
    ])
    if (recRes.ok) setData(await recRes.json())
    if (diaryRes.ok) setDayDiary(await diaryRes.json())
    if (!silent) setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  // Silent auto-refresh every 45 seconds
  useEffect(() => {
    const id = setInterval(() => void load(true), 45_000)
    return () => clearInterval(id)
  }, [load])

  // Current appointment (in chair right now)
  const currentAppt = useMemo(() => {
    if (!dayDiary?.bookings) return null
    return (
      dayDiary.bookings.find((b) => {
        if (b.status === 'cancelled') return false
        const start = toLocalMin(b.starts_at)
        const end = b.ends_at ? toLocalMin(b.ends_at) : start + 60
        return nowMin >= start && nowMin < end
      }) ?? null
    )
  }, [dayDiary, nowMin])

  // Next upcoming appointment
  const nextAppt = useMemo(() => {
    if (!dayDiary?.bookings) return null
    return (
      [...dayDiary.bookings]
        .filter((b) => b.status !== 'cancelled' && toLocalMin(b.starts_at) > nowMin)
        .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0] ?? null
    )
  }, [dayDiary, nowMin])

  // Free gaps for the day timeline
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

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="eyebrow text-gold mb-2">Front desk</div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">The front desk.</h1>
            <p className="text-ink-soft mt-3 max-w-xl leading-relaxed">Everything happening around the chair, in one place.</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0 mt-2">
            <div className="font-display italic text-2xl md:text-3xl text-charcoal tabular-nums">{clock}</div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-stone">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
                Live
              </span>
              <button onClick={signOut} className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2">
                <LogOut size={14} strokeWidth={1.75} /><span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>

        <CommandBar onActioned={() => void load(true)} />

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

            {/* Now / Next — only when relevant */}
            {(currentAppt || nextAppt) && (
              <NowNextCard current={currentAppt} next={nextAppt} nowMin={nowMin} />
            )}

            {/* Reminders */}
            <div className={`flex items-center gap-3 rounded-sm border px-4 py-3 mb-8 ${s!.remindersPending > 0 ? 'border-gold/40 bg-gold/5' : 'border-sage/30 bg-sage/5'}`}>
              <BellRing size={16} strokeWidth={1.75} className={s!.remindersPending > 0 ? 'text-gold-deep' : 'text-sage'} />
              <div className="text-sm text-charcoal">
                {s!.remindersSoon === 0
                  ? 'No appointments in the next 24 hours.'
                  : `${s!.remindersSoon} appointment${s!.remindersSoon === 1 ? '' : 's'} in the next 24 hours. ${s!.remindersPending} reminder${s!.remindersPending === 1 ? '' : 's'} still to send.`}
              </div>
            </div>

            {/* Schedule */}
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
                  // Use dayDiary.bookings so we have ends_at and client_phone
                  const todayBookings = (dayDiary?.bookings ?? []).filter((b) => b.status !== 'cancelled')
                  type TItem = { kind: 'booking'; b: Lite } | { kind: 'gap'; start: number; end: number }
                  const items: TItem[] = [
                    ...todayBookings.map((b) => ({ kind: 'booking' as const, b })),
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
                          <BookingRow key={item.b.id} booking={item.b} nowMin={nowMin} />
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
                            <Row key={b.id} left={<span><span className="font-medium">{timeLabel(b.starts_at)}</span> &nbsp; {b.client_name}</span>} sub={b.service_name} right={<span className="inline-flex items-center gap-1.5"><ConfirmedDot status={b.status} confirmedAt={b.confirmed_at} /><span className={`capitalize ${statusTone[b.status] ?? 'text-stone'}`}>{b.status.replace('_', ' ')}</span></span>} phone={b.client_phone} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Section>

            {/* Just booked online */}
            <Section title="Just booked online" icon={Sparkles}>
              {data.justBooked.length === 0 ? (
                <Empty>No online bookings in the last week.</Empty>
              ) : (
                <div className="space-y-2">
                  {data.justBooked.map((b) => {
                    const isRecent = Date.now() - new Date(b.created_at).getTime() < 30 * 60_000
                    return (
                      <Row
                        key={b.id}
                        left={
                          <span className="font-medium flex items-center gap-2">
                            {b.client_name}
                            {isRecent && <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-pulse shrink-0" />}
                          </span>
                        }
                        sub={`${b.service_name} · ${dayTimeLabel(b.starts_at)}`}
                        right={<span className="text-stone text-xs">{ago(b.created_at)}</span>}
                        phone={b.client_phone}
                      />
                    )
                  })}
                </div>
              )}
            </Section>

            {/* Waitlist */}
            <Section title="Waitlist" icon={ListPlus} href="/staff/assistant/diary" cta="In diary">
              {data.waitlist.length === 0 ? (
                <Empty>No one waiting.</Empty>
              ) : (
                <div className="space-y-2">
                  {data.waitlist.map((w) => (
                    <Row
                      key={w.id}
                      left={<span className="font-medium">{w.client_name}</span>}
                      sub={w.service_name || null}
                      right={null}
                      phone={w.client_phone}
                    />
                  ))}
                </div>
              )}
            </Section>

            <QuickTools />
          </>
        )}
      </div>
    </section>
  )
}

// ---- Now / Next card -------------------------------------------------------
function NowNextCard({ current, next, nowMin }: { current: Lite | null; next: Lite | null; nowMin: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
      {/* In chair */}
      <div className={`rounded-sm border px-4 py-4 ${current ? 'border-sage/40 bg-sage/5' : 'border-line/40 bg-cream-soft'}`}>
        <div className={`eyebrow mb-2 flex items-center gap-2 ${current ? 'text-sage' : 'text-stone'}`}>
          {current && <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />}
          {current ? 'In chair now' : 'Chair is free'}
        </div>
        {current ? (
          <>
            <div className="font-medium text-charcoal">{current.client_name}</div>
            <div className="text-sm text-stone mt-0.5">{current.service_name}</div>
            <div className="text-xs text-stone/70 mt-2">
              Started {timeLabel(current.starts_at)} · {minLabel(nowMin - toLocalMin(current.starts_at))} in
              {current.ends_at && ` · until ${timeLabel(current.ends_at)}`}
            </div>
            {current.client_phone && (
              <a href={`tel:${current.client_phone}`} className="inline-flex items-center gap-1.5 text-xs text-gold-deep mt-3 hover:underline">
                <Phone size={11} strokeWidth={2} /> {current.client_phone}
              </a>
            )}
          </>
        ) : (
          <div className="text-sm text-stone mt-1">
            {next ? `Free until ${timeLabel(next.starts_at)}.` : 'Nothing more today.'}
          </div>
        )}
      </div>

      {/* Up next */}
      {next && (
        <div className="rounded-sm border border-line/40 bg-cream-soft px-4 py-4">
          <div className="eyebrow text-gold mb-2">Up next · {timeLabel(next.starts_at)}</div>
          <div className="font-medium text-charcoal">{next.client_name}</div>
          <div className="text-sm text-stone mt-0.5">{next.service_name}</div>
          <div className="text-xs text-stone/70 mt-2">In {minLabel(toLocalMin(next.starts_at) - nowMin)}</div>
          {next.client_phone && (
            <a href={`tel:${next.client_phone}`} className="inline-flex items-center gap-1.5 text-xs text-gold-deep mt-3 hover:underline">
              <Phone size={11} strokeWidth={2} /> {next.client_phone}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// ---- Quick tools strip -----------------------------------------------------
function QuickTools() {
  const tools = [
    { label: 'Find a slot', href: '/staff/assistant/squeeze-in' },
    { label: "Who's due back", href: '/staff/assistant/rebook' },
    { label: 'Send a coupon', href: '/staff/assistant/reception/coupon' },
    { label: 'Gift vouchers', href: '/staff/assistant/reception/vouchers' },
    { label: 'Consent forms', href: '/staff/assistant/consent' },
    { label: 'Clients', href: '/staff/assistant/clients' },
  ]
  return (
    <div className="mb-8">
      <div className="eyebrow text-stone mb-3">Quick tools</div>
      <div className="flex flex-wrap gap-2">
        {tools.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="text-sm border border-line/50 rounded-full px-4 py-1.5 text-stone hover:border-gold/50 hover:text-gold-deep transition-colors bg-cream-soft"
          >
            {t.label}
          </Link>
        ))}
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
        setError('That looks like a question rather than an action — hit "Ask a question" to look that up.')
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
      notifyDone(d.message || 'Done.')
      setProposal(null); setText('')
      onActioned()
    } catch { setError('Network error.') } finally { setBusy(false) }
  }

  return (
    <div className="mb-8 space-y-3">
      {/* Shared input */}
      <div className="border border-gold/40 bg-gold/5 rounded-sm p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-eyebrow text-gold-deep">Assistant</span>
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
          placeholder="Type what you want to do or ask, then choose below…"
        />
        {error && <p className="text-sm text-clay mt-2">{error}</p>}
        {done && <p className="text-sm text-sage mt-2 inline-flex items-center gap-1.5"><Check size={14} strokeWidth={2} /> {done}</p>}
        {answer && <div className="text-sm text-charcoal mt-3 border border-line/40 bg-cream rounded-sm px-3 py-2.5 leading-relaxed">{answer}</div>}
        {proposal && (
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
        )}
      </div>

      {/* Two mode buttons */}
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

// ---- Sub-components --------------------------------------------------------
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

function ConfirmedDot({ status, confirmedAt }: { status: string; confirmedAt: string | null }) {
  if (status === 'confirmed' && confirmedAt) return <span title="Client confirmed" className="w-2 h-2 rounded-full bg-sage inline-block shrink-0" />
  if (status === 'confirmed' && !confirmedAt) return <span title="Awaiting confirmation" className="w-2 h-2 rounded-full bg-gold inline-block shrink-0" />
  if (status === 'pending') return <span title="Deposit pending" className="w-2 h-2 rounded-full bg-gold-deep inline-block shrink-0" />
  return null
}

// Generic row (week/month views, just-booked, waitlist)
function Row({ left, sub, right, phone }: { left: React.ReactNode; sub: string | null; right: React.ReactNode; phone?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3 border border-line/40 bg-cream-soft rounded-sm px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm text-charcoal truncate">{left}</div>
        {sub && <div className="text-xs text-stone truncate mt-0.5">{sub}</div>}
      </div>
      <div className="shrink-0 flex items-center gap-3">
        {phone && (
          <a href={`tel:${phone}`} className="text-stone hover:text-gold-deep transition-colors" title="Call">
            <Phone size={14} strokeWidth={1.75} />
          </a>
        )}
        {right && <div className="text-sm">{right}</div>}
      </div>
    </div>
  )
}

// Booking row for day view — highlights the current appointment
function BookingRow({ booking: b, nowMin }: { booking: Lite; nowMin: number }) {
  const start = toLocalMin(b.starts_at)
  const end = b.ends_at ? toLocalMin(b.ends_at) : start + 60
  const isCurrent = nowMin >= start && nowMin < end
  return (
    <div className={`flex items-center justify-between gap-3 border rounded-sm px-4 py-3 transition-colors ${isCurrent ? 'border-sage/40 bg-sage/5' : 'border-line/40 bg-cream-soft'}`}>
      <div className="min-w-0 flex-1">
        <div className="text-sm text-charcoal truncate flex items-center gap-2">
          {isCurrent && <span className="inline-block w-1.5 h-1.5 rounded-full bg-sage shrink-0" />}
          <span><span className="font-medium">{timeLabel(b.starts_at)}</span> &nbsp; {b.client_name}</span>
        </div>
        <div className="text-xs text-stone truncate mt-0.5">{b.service_name}</div>
      </div>
      <div className="shrink-0 flex items-center gap-3">
        {b.client_phone && (
          <a href={`tel:${b.client_phone}`} className="text-stone hover:text-gold-deep transition-colors" title={`Call ${b.client_name}`}>
            <Phone size={14} strokeWidth={1.75} />
          </a>
        )}
        <span className="inline-flex items-center gap-1.5">
          <ConfirmedDot status={b.status} confirmedAt={b.confirmed_at} />
          <span className={`text-sm capitalize ${statusTone[b.status] ?? 'text-stone'}`}>{b.status.replace('_', ' ')}</span>
        </span>
      </div>
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
