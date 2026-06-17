'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Check, Clock, LogOut, Mail, Phone, Plus, Ban, Send, User, X } from 'lucide-react'
import MicButton, { appendText } from '@/components/ui/MicButton'
import { notifyDone, notifyError } from '@/lib/staff-toast'
import ConsentStatus from '@/components/staff/ConsentStatus'
import { NewClientBadge, ReminderLine } from '@/components/staff/BookingCard'
import DayTakingsCard from '@/components/staff/DayTakingsCard'
import DayComplianceCard from '@/components/staff/DayComplianceCard'

const STATUS_DONE: Record<string, string> = {
  completed: 'Marked as completed',
  no_show: 'Marked as no-show',
  confirmed: 'Booking confirmed',
  cancelled: 'Booking cancelled',
}

type Booking = {
  id: string
  service_name: string
  client_name: string
  client_phone: string | null
  client_email: string | null
  starts_at: string
  ends_at: string
  status: string
  source: string
  notes: string | null
  confirmed_at: string | null
  reminded_at: string | null
  is_new_client?: boolean
}
type TimeOff = { id: string; starts_at: string; ends_at: string; reason: string | null }
type Service = { slug: string; name: string; duration_min: number }
type WaitlistEntry = { id: string; client_name: string; service_name: string | null; client_phone: string | null; preferred_note: string | null }
type OpeningWindow = { open_min: number; close_min: number }
// Opening windows keyed by weekday (0=Sun..6=Sat). A weekday can have several
// windows (a split day), or none when the clinic is closed that day.
type WindowMap = Record<number, OpeningWindow[]>
type Interval = { start: number; end: number }

const TZ = 'Europe/London'

function todayStr(): string {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
  return p
}
function addDays(ds: string, n: number): string {
  const d = new Date(`${ds}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso))
}
function dayHeading(ds: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${ds}T12:00:00Z`))
}
function minToTime(m: number): string {
  return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`
}
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
function weekStart(ds: string): string {
  const d = new Date(`${ds}T12:00:00Z`)
  const offset = (d.getUTCDay() + 6) % 7 // days since Monday
  d.setUTCDate(d.getUTCDate() - offset)
  return d.toISOString().slice(0, 10)
}
function weekDays(ds: string): string[] {
  const s = weekStart(ds)
  return Array.from({ length: 7 }, (_, i) => addDays(s, i))
}
function localDate(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(iso))
}
function shortDay(ds: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'short' }).format(new Date(`${ds}T12:00:00Z`))
}
function weekHeading(ds: string): string {
  const s = weekStart(ds)
  const e = addDays(s, 6)
  const f = (x: string) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: 'numeric', month: 'short' }).format(new Date(`${x}T12:00:00Z`))
  return `${f(s)} to ${f(e)}`
}
function monthStart(ds: string): string {
  return `${ds.slice(0, 7)}-01`
}
function monthEnd(ds: string): string {
  const [y, m] = ds.split('-').map(Number)
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)
}
function addMonths(ds: string, n: number): string {
  const d = new Date(`${ds}T12:00:00Z`)
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() + n)
  return d.toISOString().slice(0, 10)
}
function monthHeading(ds: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, month: 'long', year: 'numeric' }).format(new Date(`${ds}T12:00:00Z`))
}

function useNowMin(): number {
  const [nowMin, setNowMin] = useState(() => toLocalMin(new Date().toISOString()))
  useEffect(() => {
    const id = setInterval(() => setNowMin(toLocalMin(new Date().toISOString())), 30_000)
    return () => clearInterval(id)
  }, [])
  return nowMin
}

const statusTone: Record<string, string> = {
  confirmed: 'text-sage',
  pending: 'text-gold-deep',
  completed: 'text-stone',
  cancelled: 'text-clay line-through',
  no_show: 'text-clay',
}

// A booking can be 'confirmed' (slot held) without the client having actually
// confirmed (confirmed_at). Keep the label honest so the diary reflects reality.
function statusLabel(status: string, confirmedAt: string | null): string {
  if (status === 'confirmed') return confirmedAt ? 'Confirmed' : 'Unconfirmed'
  if (status === 'no_show') return 'No show'
  return status.charAt(0).toUpperCase() + status.slice(1)
}
function statusToneFor(status: string, confirmedAt: string | null): string {
  if (status === 'confirmed' && !confirmedAt) return 'text-gold-deep'
  return statusTone[status] ?? 'text-stone'
}

function ConfirmedDot({ status, confirmedAt, onDark = false }: { status: string; confirmedAt: string | null; onDark?: boolean }) {
  if (onDark) return null
  if (status === 'confirmed' && confirmedAt) return <span title="Client confirmed" className="w-2 h-2 rounded-full bg-sage inline-block shrink-0" />
  if (status === 'confirmed' && !confirmedAt) return <span title="Awaiting confirmation" className="w-2 h-2 rounded-full bg-gold inline-block shrink-0" />
  if (status === 'pending') return <span title="Deposit pending" className="w-2 h-2 rounded-full bg-gold-deep inline-block shrink-0" />
  return null
}

// Green tick only when consent is genuinely on file; red when a booking needs a
// form; nothing when status is unknown (e.g. grandfathered) — never a tick we
// can't vouch for. See ConsentFlag in components/staff/BookingCard.tsx.
function ConsentFlag({ name, missing, onFile, onDark = false }: { name: string; missing: Set<string> | null; onFile: Set<string> | null; onDark?: boolean }) {
  if (missing === null) return null
  const key = name.trim().toLowerCase()
  if (missing.has(key)) {
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold shrink-0 whitespace-nowrap ${onDark ? 'text-cream' : 'text-avail'}`}>
        <X size={10} strokeWidth={3} /> Consent
      </span>
    )
  }
  if (onFile?.has(key)) {
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-normal shrink-0 whitespace-nowrap ${onDark ? 'text-cream/70' : 'text-sage/70'}`}>
        <Check size={9} strokeWidth={2.5} /> Consent
      </span>
    )
  }
  return null
}

function toLocalMin(iso: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date(iso))
  return Number(parts.find((p) => p.type === 'hour')?.value ?? '0') * 60 + Number(parts.find((p) => p.type === 'minute')?.value ?? '0')
}
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
// Merge overlapping/touching intervals into a tidy, sorted set.
function mergeIntervals(intervals: Interval[]): Interval[] {
  const sorted = [...intervals].sort((a, b) => a.start - b.start)
  const out: Interval[] = []
  for (const iv of sorted) {
    const last = out[out.length - 1]
    if (last && iv.start <= last.end) last.end = Math.max(last.end, iv.end)
    else out.push({ ...iv })
  }
  return out
}
// The opening windows for the weekday a date falls on, as {start,end} intervals
// (empty when the clinic is closed that day).
function winsForDay(day: string, windows: WindowMap): Interval[] {
  return (windows[new Date(`${day}T12:00:00Z`).getUTCDay()] ?? []).map((w) => ({ start: w.open_min, end: w.close_min }))
}
function busyForDay(day: string, allBookings: Booking[], allTimeOff: TimeOff[]): Interval[] {
  return [
    ...allBookings.filter((b) => localDate(b.starts_at) === day).map((b) => ({ start: toLocalMin(b.starts_at), end: toLocalMin(b.ends_at) })),
    ...allTimeOff.filter((t) => localDate(t.starts_at) === day).map((t) => ({ start: toLocalMin(t.starts_at), end: toLocalMin(t.ends_at) })),
  ].sort((a, b) => a.start - b.start)
}
function dayFreeGaps(day: string, allBookings: Booking[], allTimeOff: TimeOff[], windows: WindowMap): Interval[] {
  const wins = winsForDay(day, windows)
  const allBusy = busyForDay(day, allBookings, allTimeOff)
  const gaps: Interval[] = []
  // Open-but-unbooked time inside each opening window (handles split days).
  if (wins.length) gaps.push(...subtractIntervals(wins, allBusy))
  // Gaps strictly between two bookings — always shown, even outside set hours,
  // so a one-off appointment booked off-hours still reveals the space around it.
  for (let i = 0; i < allBusy.length - 1; i++) {
    if (allBusy[i + 1].start > allBusy[i].end) gaps.push({ start: allBusy[i].end, end: allBusy[i + 1].start })
  }
  return mergeIntervals(gaps).filter((g) => g.end - g.start >= 15)
}
function gapClock(min: number): string {
  const h = Math.floor(min / 60), m = min % 60
  const suffix = h < 12 ? 'am' : 'pm'
  const h12 = h % 12 || 12
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, '0')}${suffix}`
}
function gapLabel(mins: number): string {
  const h = Math.floor(mins / 60), m = mins % 60
  return [h > 0 ? `${h}h` : null, m > 0 ? `${m}m` : null].filter(Boolean).join(' ') + ' free'
}
function freeShort(mins: number): string {
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? `${h}h` : `${m}m`
}
// Total open-but-unbooked minutes on a day (≥15-min gaps only), across every
// opening window — so a split day counts both its sessions.
function dayFreeMins(day: string, bookings: Booking[], allTimeOff: TimeOff[], windows: WindowMap): number {
  const wins = winsForDay(day, windows)
  if (!wins.length) return 0
  const busy = busyForDay(day, bookings, allTimeOff)
  return subtractIntervals(wins, busy)
    .filter((g) => g.end - g.start >= 15)
    .reduce((s, g) => s + (g.end - g.start), 0)
}
// Calendar cells for the month: leading blanks (Monday-start) then each day.
function monthGridDays(ds: string): (string | null)[] {
  const first = monthStart(ds)
  const lead = (new Date(`${first}T12:00:00Z`).getUTCDay() + 6) % 7
  const total = Number(monthEnd(ds).slice(8, 10))
  const cells: (string | null)[] = Array.from({ length: lead }, () => null)
  for (let d = 1; d <= total; d++) cells.push(`${first.slice(0, 7)}-${String(d).padStart(2, '0')}`)
  return cells
}
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function MonthGrid({ date, bookings, timeOff, windows, onPick }: { date: string; bookings: Booking[]; timeOff: TimeOff[]; windows: WindowMap; onPick: (day: string) => void }) {
  const cells = monthGridDays(date)
  const today = todayStr()
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] uppercase tracking-wide text-stone/60 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`blank-${i}`} />
          const isOpen = winsForDay(day, windows).length > 0
          const count = bookings.filter((b) => localDate(b.starts_at) === day).length
          const free = dayFreeMins(day, bookings, timeOff, windows)
          const isToday = day === today
          const dayNum = Number(day.slice(8, 10))
          let tone = 'border-sage/30 bg-sage/[0.05]'
          if (!isOpen) tone = 'border-line/30 bg-cream-soft opacity-45'
          else if (count > 0 && free <= 0) tone = 'border-gold/45 bg-gold/15'
          else if (count > 0) tone = 'border-gold/30 bg-gold/[0.07]'
          return (
            <button
              key={day}
              onClick={() => onPick(day)}
              className={`relative rounded-sm border ${tone} ${isToday ? 'ring-2 ring-gold ring-offset-1 ring-offset-cream' : ''} aspect-square p-1.5 flex flex-col text-left transition-colors hover:border-gold/60`}
            >
              <span className={`text-xs font-medium ${isToday ? 'text-gold-deep' : 'text-charcoal'}`}>{dayNum}</span>
              <span className="mt-auto leading-tight w-full">
                {count > 0 && <span className="block text-[10px] text-charcoal">{count} in</span>}
                {isOpen && free > 0 && <span className="block text-[9px] text-sage">{freeShort(free)} free</span>}
                {!isOpen && <span className="block text-[9px] text-stone/50">Closed</span>}
              </span>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-ink-soft mt-3 leading-snug">Tap any day to open it and add a booking. <span className="text-sage">Green</span> = space free · <span className="text-gold-deep">gold</span> = booked.</p>
    </div>
  )
}

export default function Diary() {
  const searchParams = useSearchParams()
  const [date, setDate] = useState(() => searchParams.get('date') ?? todayStr())
  const [view, setView] = useState<'day' | 'week' | 'month'>('day')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [timeOff, setTimeOff] = useState<TimeOff[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [windows, setWindows] = useState<WindowMap>({})
  const [adding, setAdding] = useState<'booking' | 'time_off' | 'hours' | null>(null)
  const [consentMissing, setConsentMissing] = useState<Set<string> | null>(null)
  const [consentOnFile, setConsentOnFile] = useState<Set<string> | null>(null)
  const [detail, setDetail] = useState<Booking | null>(null)
  const [pendingCancel, setPendingCancel] = useState<Booking | null>(null)
  const nowMin = useNowMin()


  const load = useCallback(async (from: string, to: string) => {
    setLoading(true)
    const res = await fetch(`/api/staff/assistant/diary?from=${from}&to=${to}`)
    if (res.ok) {
      const d = await res.json()
      setBookings(d.bookings ?? [])
      setTimeOff(d.timeOff ?? [])
      setWaitlist(d.waitlist ?? [])
      if (d.windows) setWindows(d.windows)
    }
    setLoading(false)
  }, [])

  const reload = useCallback(() => {
    if (view === 'week') { const s = weekStart(date); void load(s, addDays(s, 6)) }
    else if (view === 'month') void load(monthStart(date), monthEnd(date))
    else void load(date, date)
  }, [view, date, load])

  useEffect(() => { reload() }, [reload])
  useEffect(() => {
    fetch('/api/staff/assistant/consent/flags')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setConsentMissing(new Set((d?.missing ?? []) as string[])); setConsentOnFile(new Set((d?.onFile ?? []) as string[])) })
      .catch(() => {})
  }, [])
  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/book/services')
      if (res.ok) setServices((await res.json()).services ?? [])
    })()
  }, [])

  async function setStatus(id: string, status: string) {
    // Optimistically reflect the change, but remember the previous state so we
    // can undo it if the server doesn't actually save. Without this, a failed
    // PATCH (a network blip, a Supabase hiccup) would silently hide the booking
    // and flash "done" — then it would reappear on the next reload because the
    // database never changed. (That's the "I X'd them off and they came back" bug.)
    const previous = bookings
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
    let ok = false
    try {
      const res = await fetch(`/api/staff/assistant/diary/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      ok = res.ok
    } catch {
      ok = false
    }
    if (ok) {
      notifyDone(STATUS_DONE[status] ?? 'Updated')
    } else {
      // Put the booking back exactly as it was and make the failure unmistakable,
      // so staff know it didn't save and can try again rather than trusting a
      // change that never happened.
      setBookings(previous)
      notifyError("That didn't save — please check your connection and try again.")
    }
  }

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  const live = bookings.filter((b) => b.status !== 'cancelled')

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="eyebrow text-gold mb-2">Reception &nbsp;·&nbsp; Diary</div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">The book.</h1>
          </div>
          <button onClick={signOut} className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0 mt-2">
            <LogOut size={14} strokeWidth={1.75} /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <div className="inline-flex rounded-full border border-line/50 bg-cream-soft p-0.5 shrink-0">
            {(['day', 'week', 'month'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`text-xs rounded-full px-2.5 py-1 capitalize transition-colors ${view === v ? 'bg-gold text-charcoal' : 'text-ink-soft'}`}>{v}</button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-1 flex-1 min-w-0">
            <button onClick={() => setDate(view === 'month' ? addMonths(date, -1) : addDays(date, view === 'week' ? -7 : -1))} className="w-7 h-7 inline-flex items-center justify-center rounded-sm border border-line/50 bg-cream-soft hover:border-gold/60 shrink-0"><ChevronLeft size={15} /></button>
            <div className="font-display italic text-sm text-charcoal text-center truncate">{view === 'month' ? monthHeading(date) : view === 'week' ? weekHeading(date) : dayHeading(date)}</div>
            <button onClick={() => setDate(view === 'month' ? addMonths(date, 1) : addDays(date, view === 'week' ? 7 : 1))} className="w-7 h-7 inline-flex items-center justify-center rounded-sm border border-line/50 bg-cream-soft hover:border-gold/60 shrink-0"><ChevronRight size={15} /></button>
          </div>
          <button onClick={() => setDate(todayStr())} className="text-xs text-gold-deep hover:underline shrink-0">Today</button>
        </div>

        <div className="flex gap-2 mb-5">
          <button onClick={() => setAdding(adding === 'booking' ? null : 'booking')} className="btn btn-secondary" style={{ minHeight: 38 }}>
            <span className="inline-flex items-center gap-2"><Plus size={14} strokeWidth={1.75} /> Add booking</span>
          </button>
          <button onClick={() => setAdding(adding === 'time_off' ? null : 'time_off')} className="btn btn-secondary" style={{ minHeight: 38 }}>
            <span className="inline-flex items-center gap-2"><Ban size={14} strokeWidth={1.75} /> Block time</span>
          </button>
          <button onClick={() => setAdding(adding === 'hours' ? null : 'hours')} className="btn btn-secondary" style={{ minHeight: 38 }}>
            <span className="inline-flex items-center gap-2"><Clock size={14} strokeWidth={1.75} /> Edit hours</span>
          </button>
        </div>
        <p className="text-xs text-ink-soft -mt-3 mb-4 leading-snug">Add a booking · block a slot · change when the clinic is open</p>

        {adding === 'booking' && <AddBooking date={date} services={services} onDone={() => { setAdding(null); reload() }} />}
        {adding === 'time_off' && <BlockTime date={date} onDone={() => { setAdding(null); reload() }} />}
        {adding === 'hours' && <EditHours initialWindows={windows} onDone={() => { setAdding(null); reload() }} />}

        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : view === 'month' ? (
          <div className="space-y-3">
            <div className="eyebrow text-gold">{live.length} booked this month</div>
            <MonthGrid date={date} bookings={live} timeOff={timeOff} windows={windows} onPick={(day) => { setDate(day); setView('day') }} />
          </div>
        ) : view === 'week' ? (
          <div className="space-y-4">
            {weekDays(date).map((day) => {
              const dayB = live.filter((b) => localDate(b.starts_at) === day).sort((a, b) => a.starts_at.localeCompare(b.starts_at))
              const dayT = timeOff.filter((t) => localDate(t.starts_at) === day)
              const isToday = day === todayStr()
              return (
                <div key={day}>
                  <button onClick={() => { setDate(day); setView('day') }} className="w-full flex items-center justify-between mb-1.5 text-left">
                    <span className={`text-sm font-medium ${isToday ? 'text-gold-deep' : 'text-charcoal'}`}>{shortDay(day)}{isToday ? ' · today' : ''}</span>
                    <span className="text-xs text-stone">{dayB.length ? `${dayB.length} in` : ''}</span>
                  </button>
                  <DayTakingsCard day={day} bookings={dayB} nowMin={nowMin} />
                  <DayComplianceCard day={day} bookings={dayB} nowMin={nowMin} />
                  {dayB.length || dayT.length ? (() => {
                    const gaps = dayFreeGaps(day, live, timeOff, windows)
                    const sorted = [
                      ...dayB.map((b) => ({ t: 'b' as const, b, min: toLocalMin(b.starts_at) })),
                      ...dayT.map((t) => ({ t: 'to' as const, to: t, min: toLocalMin(t.starts_at) })),
                      ...gaps.map((g) => ({ t: 'g' as const, g, min: g.start })),
                    ].sort((a, b) => a.min - b.min)
                    return (
                      <div className="space-y-1.5">
                        {sorted.map((item, i) => item.t === 'to' ? (
                          <div key={item.to.id} className="px-3.5 py-2 text-xs text-stone flex items-center gap-2 border border-line/40 bg-cream-soft rounded-sm"><Ban size={12} strokeWidth={1.75} /> {timeLabel(item.to.starts_at)} to {timeLabel(item.to.ends_at)} &nbsp;·&nbsp; {item.to.reason || 'Blocked'}</div>
                        ) : item.t === 'g' ? (
                          <div key={`gap-${i}`} className="px-3.5 py-1.5 flex items-center gap-1.5 select-none border border-dashed border-line/40 rounded-sm">
                            <span className="text-[11px] text-stone/50 tabular-nums whitespace-nowrap">{gapClock(item.g.start)}</span>
                            <span className="flex-1 border-t border-dashed border-stone/25" />
                            <span className="text-[11px] text-stone/50 whitespace-nowrap">{gapLabel(item.g.end - item.g.start)}</span>
                          </div>
                        ) : (
                          <DiaryBookingRow key={item.b.id} booking={item.b} nowMin={nowMin} missing={consentMissing} onFile={consentOnFile} onOpen={setDetail} onCancel={setPendingCancel} />
                        ))}
                      </div>
                    )
                  })() : (
                    <div className="text-xs text-stone/60 pb-0.5">Nothing booked</div>
                  )}
                </div>
              )
            })}
          </div>
        ) : live.length === 0 && timeOff.length === 0 ? (
          <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-5 text-center">Nothing booked this day.</p>
        ) : (
          <div className="space-y-2.5">
            <DayTakingsCard day={date} bookings={live} nowMin={nowMin} />
            <DayComplianceCard day={date} bookings={live} nowMin={nowMin} />
            {(() => {
              const gaps = dayFreeGaps(date, live, timeOff, windows)
              const sorted = [
                ...live.map((b) => ({ t: 'b' as const, b, min: toLocalMin(b.starts_at) })),
                ...timeOff.map((t) => ({ t: 'to' as const, to: t, min: toLocalMin(t.starts_at) })),
                ...gaps.map((g) => ({ t: 'g' as const, g, min: g.start })),
              ].sort((a, b) => a.min - b.min)
              return sorted.map((item, i) => item.t === 'to' ? (
                <div key={item.to.id} className="flex items-center gap-3 border border-line/40 bg-cream-deep/40 rounded-sm px-4 py-3 text-sm text-stone">
                  <Ban size={14} strokeWidth={1.75} /> {timeLabel(item.to.starts_at)} to {timeLabel(item.to.ends_at)} &nbsp;·&nbsp; {item.to.reason || 'Blocked'}
                </div>
              ) : item.t === 'g' ? (
                <div key={`gap-${i}`} className="border border-dashed border-line/40 rounded-sm px-4 py-2.5 flex items-center justify-between opacity-30">
                  <div>
                    <div className="text-sm text-stone"><span className="font-medium">{gapClock(item.g.start)}</span> &nbsp; Free</div>
                    <div className="text-xs text-stone/70 mt-0.5">Until {gapClock(item.g.end)} · {gapLabel(item.g.end - item.g.start)}</div>
                  </div>
                </div>
              ) : (
                <DiaryBookingRow key={item.b.id} booking={item.b} nowMin={nowMin} missing={consentMissing} onFile={consentOnFile} onOpen={setDetail} onCancel={setPendingCancel} />
              ))
            })()}
          </div>
        )}

        {waitlist.length > 0 && (
          <div className="mt-8">
            <div className="eyebrow text-gold mb-3">Waitlist ({waitlist.length})</div>
            <div className="space-y-2">
              {waitlist.map((w) => (
                <div key={w.id} className="border border-line/40 bg-cream-soft rounded-sm px-4 py-3 text-sm">
                  <span className="text-charcoal font-medium">{w.client_name}</span>
                  {w.service_name ? <span className="text-stone"> &nbsp;·&nbsp; {w.service_name}</span> : null}
                  {w.client_phone ? <span className="text-stone"> &nbsp;·&nbsp; {w.client_phone}</span> : null}
                  {w.preferred_note ? <div className="text-xs text-ink-soft mt-0.5">{w.preferred_note}</div> : null}
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-soft mt-2">When you cancel a booking, anyone waiting for that treatment is texted automatically.</p>
          </div>
        )}

        {detail && (
          <DiaryDetailModal
            booking={detail}
            onClose={() => setDetail(null)}
            onStatus={async (id, status) => { await setStatus(id, status); setDetail(null) }}
            onChanged={reload}
            onCancel={(b) => { setDetail(null); setPendingCancel(b) }}
          />
        )}
        {pendingCancel && (
          <DiaryCancelModal
            booking={pendingCancel}
            onConfirm={() => { void setStatus(pendingCancel.id, 'cancelled'); setPendingCancel(null) }}
            onClose={() => setPendingCancel(null)}
          />
        )}
      </div>
    </section>
  )
}

function AddBooking({ date, services, onDone }: { date: string; services: Service[]; onDone: () => void }) {
  const [slug, setSlug] = useState('')
  const [time, setTime] = useState('10:00')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function save() {
    if (!slug || !name.trim()) { setErr('Pick a service and enter a name.'); return }
    setBusy(true); setErr(null)
    const res = await fetch('/api/staff/assistant/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'booking', service: slug, date, startMinutes: timeToMinutes(time), name, phone }),
    })
    if (res.ok) { notifyDone('Added to the diary'); onDone() }
    else { const d = await res.json().catch(() => ({})); setErr(d.error || 'Could not save.'); setBusy(false) }
  }

  return (
    <div className="border border-gold/40 bg-gold/5 rounded-sm p-4 mb-5 space-y-2.5">
      <select value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-cream border border-line rounded-sm px-3 py-2.5 text-sm">
        <option value="">Choose a treatment…</option>
        {services.map((s) => <option key={s.slug} value={s.slug}>{s.name} ({s.duration_min} min)</option>)}
      </select>
      <div className="flex gap-2">
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-cream border border-line rounded-sm px-3 py-2.5 text-sm" />
        <div className="relative flex-1">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" className="w-full bg-cream border border-line rounded-sm px-3 py-2.5 pr-10 text-sm" />
          <MicButton onText={(t) => setName((v) => appendText(v, t))} className="absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>
      <div className="relative">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile (optional)" className="w-full bg-cream border border-line rounded-sm px-3 py-2.5 pr-10 text-sm" />
        <MicButton onText={(t) => setPhone((v) => appendText(v, t))} className="absolute right-2.5 top-1/2 -translate-y-1/2" />
      </div>
      {err && <p className="text-xs text-clay">{err}</p>}
      <button onClick={save} disabled={busy} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 38 }}>{busy ? 'Saving…' : 'Add to diary'}</button>
    </div>
  )
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

function EditHours({ initialWindows, onDone }: { initialWindows: WindowMap; onDone: () => void }) {
  // One editable list of sessions per weekday (index 0=Sun..6=Sat). An empty
  // list means closed; several entries mean a split day (e.g. a morning clinic
  // and an evening session with a break between).
  const [days, setDays] = useState<OpeningWindow[][]>(() =>
    Array.from({ length: 7 }, (_, wd) => (initialWindows[wd] ?? []).map((w) => ({ ...w })))
  )
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function setWins(wd: number, wins: OpeningWindow[]) {
    setDays((prev) => prev.map((d, i) => (i === wd ? wins : d)))
    setSaved(false); setErr(null)
  }
  function toggleOpen(wd: number) {
    const wins = days[wd]
    setWins(wd, wins.length ? [] : [{ open_min: 600, close_min: 1020 }])
  }
  function editWin(wd: number, idx: number, patch: Partial<OpeningWindow>) {
    setWins(wd, days[wd].map((w, i) => (i === idx ? { ...w, ...patch } : w)))
  }
  function addWin(wd: number) {
    const last = days[wd][days[wd].length - 1]
    // Start the next session after the previous one ends (a break between), or
    // default a first session to a 10–5 day.
    const open = last ? Math.min(last.close_min + 60, 1380) : 600
    setWins(wd, [...days[wd], { open_min: open, close_min: Math.min(open + 120, 1440) }])
  }
  function removeWin(wd: number, idx: number) {
    setWins(wd, days[wd].filter((_, i) => i !== idx))
  }

  async function save() {
    // Validate every day before sending anything.
    for (const wd of WEEK_ORDER) {
      const wins = [...days[wd]].sort((a, b) => a.open_min - b.open_min)
      for (const w of wins) {
        if (w.close_min <= w.open_min) { setErr(`${DAY_NAMES[wd]}: each session must close after it opens.`); return }
      }
      for (let i = 1; i < wins.length; i++) {
        if (wins[i].open_min < wins[i - 1].close_min) { setErr(`${DAY_NAMES[wd]}: those sessions overlap — give each a separate time.`); return }
      }
    }
    setBusy(true); setErr(null)
    try {
      await Promise.all(
        days.map((wins, wd) =>
          fetch('/api/staff/assistant/business-hours', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weekday: wd, windows: [...wins].sort((a, b) => a.open_min - b.open_min) }),
          })
        )
      )
      setSaved(true)
      notifyDone('Working hours saved')
      setTimeout(() => { setSaved(false); onDone() }, 900)
    } catch {
      setErr('Could not save. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="border border-gold/40 bg-gold/5 rounded-sm p-4 mb-5">
      <div className="eyebrow text-gold mb-3">Working hours</div>
      <div className="space-y-3">
        {WEEK_ORDER.map((wd) => {
          const wins = days[wd]
          const open = wins.length > 0
          return (
            <div key={wd} className="border-b border-line/30 last:border-0 pb-3 last:pb-0">
              <div className="flex items-center gap-2.5">
                <span className="text-sm text-charcoal w-24 shrink-0">{DAY_NAMES[wd]}</span>
                <button
                  onClick={() => toggleOpen(wd)}
                  className={`text-xs rounded-full px-3 py-1 border transition-colors shrink-0 ${open ? 'border-sage/60 bg-sage/10 text-sage' : 'border-line/50 bg-cream text-stone hover:border-gold/50'}`}
                >
                  {open ? 'Open' : 'Closed'}
                </button>
              </div>
              {open && (
                <div className="mt-2 space-y-2 sm:pl-[6.5rem]">
                  {wins.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={minToTime(w.open_min)}
                        onChange={(e) => editWin(wd, idx, { open_min: timeToMinutes(e.target.value) })}
                        className="bg-cream border border-line rounded-sm px-2.5 py-1.5 text-sm w-28"
                      />
                      <span className="text-xs text-stone">to</span>
                      <input
                        type="time"
                        value={minToTime(w.close_min)}
                        onChange={(e) => editWin(wd, idx, { close_min: timeToMinutes(e.target.value) })}
                        className="bg-cream border border-line rounded-sm px-2.5 py-1.5 text-sm w-28"
                      />
                      <button
                        onClick={() => removeWin(wd, idx)}
                        aria-label="Remove this session"
                        title="Remove this session"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-line/40 text-ink-soft hover:border-clay hover:text-clay transition-colors shrink-0"
                      >
                        <X size={14} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addWin(wd)}
                    className="inline-flex items-center gap-1.5 text-xs text-gold-deep hover:text-charcoal transition-colors"
                  >
                    <Plus size={13} strokeWidth={2} /> Add a session
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {err && <p className="text-xs text-clay mt-3">{err}</p>}
      <div className="flex items-center gap-2 mt-4">
        <button onClick={save} disabled={busy || saved} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 38 }}>
          {saved ? 'Saved ✓' : busy ? 'Saving…' : 'Save working hours'}
        </button>
        <button onClick={onDone} className="btn btn-secondary" style={{ minHeight: 38 }}>Cancel</button>
      </div>
      <p className="text-xs text-ink-soft mt-1.5 leading-snug">Open a day, then add a session for each block you work — split a day into, say, a morning and an evening with a break between. Changes take effect immediately; clients see the updated availability.</p>
    </div>
  )
}

function BlockTime({ date, onDone }: { date: string; onDone: () => void }) {
  const [start, setStart] = useState('13:00')
  const [end, setEnd] = useState('14:00')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function save() {
    setBusy(true); setErr(null)
    const res = await fetch('/api/staff/assistant/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'time_off', date, startMinutes: timeToMinutes(start), endMinutes: timeToMinutes(end), reason }),
    })
    if (res.ok) { notifyDone('Time blocked off'); onDone() }
    else { const d = await res.json().catch(() => ({})); setErr(d.error || 'Could not save.'); setBusy(false) }
  }

  return (
    <div className="border border-line/50 bg-cream-soft rounded-sm p-4 mb-5 space-y-2.5">
      <div className="flex items-center gap-2 text-sm text-stone">
        <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="bg-cream border border-line rounded-sm px-3 py-2.5" />
        <span>to</span>
        <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="bg-cream border border-line rounded-sm px-3 py-2.5" />
      </div>
      <div className="relative">
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional), e.g. lunch" className="w-full bg-cream border border-line rounded-sm px-3 py-2.5 pr-10 text-sm" />
        <MicButton onText={(t) => setReason((v) => appendText(v, t))} className="absolute right-2.5 top-1/2 -translate-y-1/2" />
      </div>
      {err && <p className="text-xs text-clay">{err}</p>}
      <button onClick={save} disabled={busy} className="btn btn-secondary disabled:opacity-50" style={{ minHeight: 38 }}>{busy ? 'Saving…' : 'Block this time'}</button>
    </div>
  )
}

// ---- Booking card — matches GapCalendar's BookingRow style ------------------
function DiaryBookingRow({ booking: b, nowMin, missing, onFile, onOpen, onCancel }: {
  booking: Booking; nowMin: number; missing: Set<string> | null; onFile: Set<string> | null
  onOpen: (b: Booking) => void; onCancel: (b: Booking) => void
}) {
  const start = toLocalMin(b.starts_at)
  const end = toLocalMin(b.ends_at)
  const bookingDay = localDate(b.starts_at)
  const today = todayStr()
  const isPast = bookingDay < today || (bookingDay === today && nowMin >= end)
  const isCurrent = bookingDay === today && nowMin >= start && nowMin < end
  const isConfirmed = b.status === 'confirmed' && !!b.confirmed_at
  const solid = isPast || isCurrent || isConfirmed
  const cardTone = isPast || isCurrent
    ? 'border-charcoal bg-charcoal'
    : isConfirmed
      ? 'border-gold bg-gold'
      : 'border-line/40 bg-cream'
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(b)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(b) } }}
      className={`flex items-center justify-between gap-3 border-2 rounded-sm px-4 py-3 transition cursor-pointer hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${cardTone}`}
    >
      <div className="min-w-0 flex-1">
        <div className={`text-sm truncate flex items-center gap-2 ${solid ? 'text-cream' : 'text-charcoal'}`}>
          {isCurrent && <span className="inline-block w-1.5 h-1.5 rounded-full bg-cream shrink-0" />}
          <span><span className="font-medium">{timeLabel(b.starts_at)}</span> &nbsp; {b.client_name}</span>
          {b.is_new_client && <NewClientBadge onSolid={solid} />}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <ConsentFlag name={b.client_name} missing={missing} onFile={onFile} onDark={solid} />
          <ConfirmedDot status={b.status} confirmedAt={b.confirmed_at} onDark={solid} />
          <span className={`text-xs ${solid ? 'text-cream/85' : statusToneFor(b.status, b.confirmed_at)}`}>{statusLabel(b.status, b.confirmed_at)}</span>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-3">
        <span className={`text-sm font-semibold truncate max-w-[8rem] text-right ${solid ? 'text-cream' : 'text-gold-deep'}`}>{b.service_name}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onCancel(b) }}
          className={`transition-colors ${solid ? 'text-cream/70 hover:text-cream' : 'text-stone/70 hover:text-clay'}`}
          title={`Cancel ${b.client_name}'s booking`}
          aria-label="Cancel booking"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

// ---- Booking detail modal — charcoal header, diary actions ------------------
function DiaryDetailModal({ booking: b, onClose, onStatus, onChanged, onCancel }: {
  booking: Booking
  onClose: () => void
  onStatus: (id: string, status: string) => Promise<void>
  onChanged: () => void
  onCancel: (b: Booking) => void
}) {
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const isConfirmed = b.status === 'confirmed' && !!b.confirmed_at
  const noContact = !b.client_email && !b.client_phone

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function act(action: 'remind' | 'confirm') {
    setBusy(action); setErr(null); setNote(null)
    try {
      const res = await fetch('/api/staff/assistant/confirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: b.id, action }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setErr(d.error || 'Could not do that.'); return }
      if (action === 'confirm') { notifyDone('Marked as confirmed'); onChanged(); onClose() }
      else { setNote(`Confirmation request sent by ${d.channel === 'sms' ? 'text' : 'email'}.`); onChanged() }
    } catch {
      setErr('Network error — please try again.')
    } finally {
      setBusy(null)
    }
  }

  async function markStatus(status: string) {
    setBusy(status)
    await onStatus(b.id, status)
  }

  const dayLabel = dayHeading(localDate(b.starts_at))
  const timeRange = `${timeLabel(b.starts_at)} – ${timeLabel(b.ends_at)}`

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/60 px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diary-detail-title"
      onClick={onClose}
    >
      <div className="bg-cream rounded-md shadow-xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-charcoal text-cream px-5 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.16em] text-cream/55">{dayLabel}</div>
            <div className="text-lg font-medium text-gold-soft leading-tight mt-0.5">{timeRange}</div>
            <h2 id="diary-detail-title" className="font-display italic text-2xl leading-tight truncate capitalize mt-2">{b.client_name}</h2>
            <div className="text-sm text-cream/75 mt-0.5 truncate">{b.service_name}</div>
          </div>
          <button onClick={onClose} className="text-cream/60 hover:text-cream shrink-0" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="px-5 py-4 space-y-3.5">
          {/* Status — the at-a-glance line, colour-coded so it reads instantly */}
          <div className="flex items-center justify-between gap-2">
            <span className={`inline-flex items-center gap-2 text-sm font-medium ${statusToneFor(b.status, b.confirmed_at)}`}>
              <ConfirmedDot status={b.status} confirmedAt={b.confirmed_at} />
              {statusLabel(b.status, b.confirmed_at)}
            </span>
            {b.source && <span className="text-xs text-stone shrink-0">via {b.source === 'ovatu' ? 'Ovatu' : b.source === 'online' ? 'online' : 'staff'}</span>}
          </div>

          <ReminderLine remindedAt={b.reminded_at} />

          <div className="text-sm text-charcoal space-y-2 border-t border-line/40 pt-3.5">
            <div className="flex items-center gap-2.5">
              <Phone size={14} className="text-stone shrink-0" />
              {b.client_phone ? <span className="text-charcoal">{b.client_phone}</span> : <span className="text-stone/60">No phone on file</span>}
            </div>
            <div className="flex items-center gap-2.5 min-w-0">
              <Mail size={14} className="text-stone shrink-0" />
              {b.client_email ? <a href={`mailto:${b.client_email}`} className="text-gold-deep hover:underline truncate">{b.client_email}</a> : <span className="text-stone/60">No email on file</span>}
            </div>
          </div>

          {b.notes && <div className="text-xs text-stone leading-relaxed whitespace-pre-wrap">{b.notes}</div>}

          <ConsentStatus clientName={b.client_name} serviceName={b.service_name} bookingId={b.id} clientEmail={b.client_email} />

          {note && <p className="text-xs text-sage">{note}</p>}
          {err && <p className="text-xs text-clay">{err}</p>}

          <div className="flex flex-col gap-2 pt-1">
            <Link href={`/staff/assistant/clients?client=${encodeURIComponent(b.client_name)}`} className="btn btn-secondary" style={{ minHeight: 40 }}>
              <span className="inline-flex items-center gap-2"><User size={15} strokeWidth={1.75} /> See client profile</span>
            </Link>
            {b.status !== 'completed' && (
              <button onClick={() => markStatus('completed')} disabled={busy !== null} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 40 }}>
                <span className="inline-flex items-center gap-2"><Check size={15} strokeWidth={2} /> {busy === 'completed' ? 'Saving…' : 'Mark as completed'}</span>
              </button>
            )}
            {b.status !== 'no_show' && b.status !== 'completed' && (
              <button onClick={() => markStatus('no_show')} disabled={busy !== null} className="btn btn-secondary disabled:opacity-50" style={{ minHeight: 40 }}>
                {busy === 'no_show' ? 'Saving…' : 'No show'}
              </button>
            )}
            {!isConfirmed && b.status !== 'completed' && b.status !== 'cancelled' && !noContact && (
              <button onClick={() => act('remind')} disabled={busy !== null} className="btn btn-secondary disabled:opacity-50" style={{ minHeight: 40 }}>
                <span className="inline-flex items-center gap-2"><Send size={14} strokeWidth={1.75} /> {busy === 'remind' ? 'Sending…' : 'Send confirmation request'}</span>
              </button>
            )}
            {noContact && !isConfirmed && b.status !== 'completed' && (
              <p className="text-xs text-clay leading-snug">No contact details — add a phone or email to send a confirmation.</p>
            )}
            <button onClick={() => onCancel(b)} className="text-sm text-clay border border-clay/30 hover:bg-clay/5 rounded-sm transition-colors" style={{ minHeight: 40 }}>
              Cancel &amp; release slot
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Cancel confirmation — dark brand pop-up --------------------------------
function DiaryCancelModal({ booking, onConfirm, onClose }: { booking: Booking; onConfirm: () => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/60 px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diary-cancel-title"
      onClick={onClose}
    >
      <div className="bg-charcoal text-cream border border-gold/45 rounded-md shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <span className="inline-flex w-12 h-12 rounded-full bg-clay/20 text-clay items-center justify-center mb-4">
          <X size={24} strokeWidth={2} />
        </span>
        <h2 id="diary-cancel-title" className="font-display italic text-2xl leading-tight">Cancel this booking?</h2>
        <p className="text-sm text-cream/85 mt-2 leading-relaxed">
          <span className="font-medium text-cream">{booking.client_name}</span>
          {' · '}{timeLabel(booking.starts_at)}{' · '}{booking.service_name}
        </p>
        <p className="text-xs text-cream/55 mt-2 leading-relaxed">This frees the slot and texts anyone on the waitlist for that treatment.</p>
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-clay text-cream font-medium px-4 hover:bg-clay/90 transition-colors"
            style={{ minHeight: 40 }}
            autoFocus
          >
            <X size={15} strokeWidth={2} /> Yes, cancel
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-sm border border-cream/30 text-cream px-4 hover:bg-cream/10 transition-colors"
            style={{ minHeight: 40 }}
          >
            Keep booking
          </button>
        </div>
      </div>
    </div>
  )
}
