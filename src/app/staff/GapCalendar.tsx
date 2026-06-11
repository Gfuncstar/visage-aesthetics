'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, CalendarPlus, Check, ChevronLeft, ChevronRight, Clock, Phone, X } from 'lucide-react'
import { notifyDone } from '@/lib/staff-toast'

// A self-contained "see the gaps, tap one, book someone in" calendar for the
// landing page. Mirrors the front-desk schedule so the desk can rebook a client
// the moment they get up from the chair, without leaving the home screen.

type Lite = { id: string; service_name: string; client_name: string; client_phone: string | null; starts_at: string; ends_at?: string; status: string; confirmed_at: string | null }
type TimeOffRow = { id: string; starts_at: string; ends_at: string; reason: string | null }
type BusinessHour = { weekday: number; is_open: boolean; open_min: number; close_min: number }
type ServiceLite = { slug: string; name: string; duration_min: number }
type SchedData = { bookings: Lite[]; timeOff: TimeOffRow[]; businessHours: BusinessHour[] }
type Interval = { start: number; end: number }

const TZ = 'Europe/London'

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
function weekDays(ds: string): string[] {
  const s = weekStart(ds)
  return Array.from({ length: 7 }, (_, i) => addDays(s, i))
}
function monthBounds(ds: string): { from: string; to: string } {
  const [y, m] = ds.split('-').map(Number)
  return { from: `${ds.slice(0, 7)}-01`, to: new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10) }
}
function addMonths(ds: string, n: number): string {
  const d = new Date(`${ds}T12:00:00Z`)
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() + n)
  return d.toISOString().slice(0, 10)
}
function localDate(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(iso))
}
function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso))
}
function dayLabelShort(ds: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${ds}T12:00:00Z`))
}
function dayHeadingFull(ds: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${ds}T12:00:00Z`))
}
function weekHeading(ds: string): string {
  const s = weekStart(ds), e = addDays(s, 6)
  const f = (x: string) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: 'numeric', month: 'short' }).format(new Date(`${x}T12:00:00Z`))
  return `${f(s)} – ${f(e)}`
}
function monthHeading(ds: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, month: 'long', year: 'numeric' }).format(new Date(`${ds}T12:00:00Z`))
}
function minToTime(m: number): string {
  return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`
}
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
function gapClock(min: number): string {
  const h = Math.floor(min / 60), m = min % 60
  const suffix = h < 12 ? 'am' : 'pm'
  const h12 = h % 12 || 12
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, '0')}${suffix}`
}
function freeShort(mins: number): string {
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? `${h}h` : `${m}m`
}
function freeMinsForDay(date: string, bookings: Lite[], timeOff: TimeOffRow[], businessHours: BusinessHour[]): number {
  return gapsForDay(date, bookings, timeOff, businessHours).reduce((s, g) => s + (g.end - g.start), 0)
}
// Open-but-unbooked intervals on a day (≥15 min) — each is a bookable gap.
function gapsForDay(day: string, bookings: Lite[], timeOff: TimeOffRow[], businessHours: BusinessHour[]): Interval[] {
  const wday = new Date(`${day}T12:00:00Z`).getUTCDay()
  const bh = businessHours.find((h) => h.weekday === wday)
  if (!bh?.is_open) return []
  const busy: Interval[] = [
    ...bookings.filter((b) => localDate(b.starts_at) === day && b.ends_at).map((b) => ({ start: toLocalMin(b.starts_at), end: toLocalMin(b.ends_at!) })),
    ...timeOff.filter((t) => localDate(t.starts_at) <= day && localDate(t.ends_at) >= day).map((t) => ({ start: toLocalMin(t.starts_at), end: toLocalMin(t.ends_at) })),
  ]
  return subtractIntervals([{ start: bh.open_min, end: bh.close_min }], busy).filter((g) => g.end - g.start >= 15)
}
function monthGridDays(ds: string): (string | null)[] {
  const { from, to } = monthBounds(ds)
  const lead = (new Date(`${from}T12:00:00Z`).getUTCDay() + 6) % 7
  const total = Number(to.slice(8, 10))
  const cells: (string | null)[] = Array.from({ length: lead }, () => null)
  for (let d = 1; d <= total; d++) cells.push(`${from.slice(0, 7)}-${String(d).padStart(2, '0')}`)
  return cells
}
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const statusTone: Record<string, string> = {
  confirmed: 'text-sage',
  pending: 'text-gold-deep',
  completed: 'text-stone',
  cancelled: 'text-clay line-through',
  no_show: 'text-clay',
}

function useNowMin(): number {
  const [nowMin, setNowMin] = useState(() => toLocalMin(new Date().toISOString()))
  useEffect(() => {
    const id = setInterval(() => setNowMin(toLocalMin(new Date().toISOString())), 30_000)
    return () => clearInterval(id)
  }, [])
  return nowMin
}

export default function GapCalendar() {
  const [schedView, setSchedView] = useState<'day' | 'week' | 'month'>('week')
  const [anchor, setAnchor] = useState<string>(() => todayStr())
  const [schedData, setSchedData] = useState<SchedData>({ bookings: [], timeOff: [], businessHours: [] })
  const [schedLoading, setSchedLoading] = useState(true)
  const [prefill, setPrefill] = useState<{ date: string; time: string } | null>(null)
  const [nextOpen, setNextOpen] = useState(false)
  const [consentMissing, setConsentMissing] = useState<Set<string> | null>(null)
  const bookingRef = useRef<HTMLDivElement | null>(null)
  const nowMin = useNowMin()

  const loadSchedule = useCallback(async (silent = false) => {
    if (!silent) setSchedLoading(true)
    let url: string
    if (schedView === 'day') {
      url = `/api/staff/assistant/diary?date=${anchor}`
    } else {
      const { from, to } = schedView === 'week'
        ? { from: weekStart(anchor), to: addDays(weekStart(anchor), 6) }
        : monthBounds(anchor)
      url = `/api/staff/assistant/diary?from=${from}&to=${to}`
    }
    try {
      const r = await fetch(url)
      const d = r.ok ? await r.json() : null
      if (d) {
        setSchedData({
          bookings: (d.bookings ?? []).filter((b: Lite) => b.status !== 'cancelled'),
          timeOff: d.timeOff ?? [],
          businessHours: d.businessHours ?? [],
        })
      }
    } catch { /* keep last good data on a transient error */ }
    if (!silent) setSchedLoading(false)
  }, [schedView, anchor])

  useEffect(() => { void loadSchedule() }, [loadSchedule])

  useEffect(() => {
    const id = setInterval(() => { void loadSchedule(true) }, 45_000)
    return () => clearInterval(id)
  }, [loadSchedule])

  useEffect(() => {
    fetch('/api/staff/assistant/consent/flags')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { setConsentMissing(new Set((d?.missing ?? []) as string[])) })
      .catch(() => {})
  }, [])

  // Seize a gap: open the booking form pre-filled to that slot and scroll to it.
  const bookSlot = useCallback((date: string, startMin: number) => {
    setPrefill({ date, time: minToTime(startMin) })
    requestAnimationFrame(() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="eyebrow text-gold flex items-center gap-2"><CalendarDays size={13} strokeWidth={1.75} /> Find a gap &amp; book</div>
        <Link href="/staff/assistant/diary" className="text-xs text-gold-deep hover:underline">Open diary →</Link>
      </div>
      <p className="text-sm text-ink-soft mb-3 leading-snug">See where there&apos;s space and tap a gap to book the client straight in — day, week or month.</p>

      {/* Booking form — opens pre-filled the moment a gap is tapped */}
      <div ref={bookingRef} className="scroll-mt-6">
        {prefill ? (
          <NewBookingPanel
            key={`${prefill.date}T${prefill.time}`}
            initialDate={prefill.date}
            initialTime={prefill.time}
            onClose={() => setPrefill(null)}
            onDone={() => { setPrefill(null); void loadSchedule(true) }}
          />
        ) : (
          <div className="mb-5">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => bookSlot(todayStr(), 600)} className="btn btn-primary" style={{ minHeight: 40 }}>
                <span className="inline-flex items-center gap-2"><CalendarPlus size={15} strokeWidth={1.75} /> New booking</span>
              </button>
              <button onClick={() => setNextOpen((o) => !o)} className="btn btn-secondary" style={{ minHeight: 40 }}>
                <span className="inline-flex items-center gap-2"><Clock size={15} strokeWidth={1.75} /> Next available booking</span>
              </button>
            </div>
            {nextOpen && <NextAvailable onPick={(d, m) => { setNextOpen(false); bookSlot(d, m) }} onClose={() => setNextOpen(false)} />}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="inline-flex rounded-full border border-line/50 bg-cream-soft p-0.5">
          {(['day', 'week', 'month'] as const).map((v) => (
            <button key={v} onClick={() => setSchedView(v)} className={`text-sm rounded-full px-4 py-1.5 capitalize transition-colors ${schedView === v ? 'bg-gold text-charcoal' : 'text-ink-soft'}`}>{v}</button>
          ))}
        </div>
        <button onClick={() => setAnchor(todayStr())} className="text-xs text-gold-deep hover:underline">Today</button>
      </div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <button onClick={() => setAnchor(schedView === 'month' ? addMonths(anchor, -1) : addDays(anchor, schedView === 'week' ? -7 : -1))} className="w-9 h-9 inline-flex items-center justify-center rounded-sm border border-line/50 bg-cream-soft hover:border-gold/60"><ChevronLeft size={17} /></button>
        <div className="font-display italic text-lg text-charcoal text-center">{schedView === 'month' ? monthHeading(anchor) : schedView === 'week' ? weekHeading(anchor) : dayHeadingFull(anchor)}</div>
        <button onClick={() => setAnchor(schedView === 'month' ? addMonths(anchor, 1) : addDays(anchor, schedView === 'week' ? 7 : 1))} className="w-9 h-9 inline-flex items-center justify-center rounded-sm border border-line/50 bg-cream-soft hover:border-gold/60"><ChevronRight size={17} /></button>
      </div>

      {schedLoading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : schedView === 'month' ? (
        <MonthGrid anchor={anchor} data={schedData} onPick={(day) => { setAnchor(day); setSchedView('day') }} />
      ) : schedView === 'week' ? (
        <div className="space-y-4">
          {weekDays(anchor).map((day) => (
            <DaySchedule key={day} day={day} data={schedData} nowMin={nowMin} missing={consentMissing} onBook={bookSlot} heading />
          ))}
        </div>
      ) : (
        <DaySchedule day={anchor} data={schedData} nowMin={nowMin} missing={consentMissing} onBook={bookSlot} />
      )}
    </div>
  )
}

// ---- One day's bookings + tappable gaps ------------------------------------
function DaySchedule({ day, data, nowMin, missing, onBook, heading = false }: { day: string; data: SchedData; nowMin: number; missing: Set<string> | null; onBook: (date: string, startMin: number) => void; heading?: boolean }) {
  const dayB = data.bookings.filter((b) => localDate(b.starts_at) === day).sort((a, b) => a.starts_at.localeCompare(b.starts_at))
  const gaps = gapsForDay(day, data.bookings, data.timeOff, data.businessHours)
  const free = freeMinsForDay(day, data.bookings, data.timeOff, data.businessHours)
  const wday = new Date(`${day}T12:00:00Z`).getUTCDay()
  const isOpen = data.businessHours.find((h) => h.weekday === wday)?.is_open ?? false
  const fullyBooked = isOpen && gaps.length === 0 && dayB.length > 0
  type TItem = { kind: 'booking'; b: Lite } | { kind: 'gap'; start: number; end: number }
  const items: TItem[] = [
    ...dayB.map((b) => ({ kind: 'booking' as const, b })),
    ...gaps.map((g) => ({ kind: 'gap' as const, start: g.start, end: g.end })),
  ].sort((a, b) => (a.kind === 'booking' ? toLocalMin(a.b.starts_at) : a.start) - (b.kind === 'booking' ? toLocalMin(b.b.starts_at) : b.start))

  const body = items.length === 0
    ? <Empty>{isOpen ? 'No open hours set for this day.' : 'Clinic closed.'}</Empty>
    : (
      <div className="space-y-2">
        {items.map((item, i) => item.kind === 'booking'
          ? <BookingRow key={item.b.id} booking={item.b} nowMin={nowMin} missing={missing} />
          : <GapRow key={`gap-${i}`} date={day} startMin={item.start} endMin={item.end} onBook={onBook} />
        )}
      </div>
    )

  if (!heading) return (
    <>
      {fullyBooked && <p className="text-xs text-stone/70 mb-2">Fully booked — every slot is taken, no gaps on this day.</p>}
      {body}
    </>
  )
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-sm font-medium ${day === todayStr() ? 'text-gold-deep' : 'text-charcoal'}`}>{dayLabelShort(day)}{day === todayStr() ? ' · today' : ''}</span>
        <div className="flex items-center gap-2">
          {free > 0 ? <span className="text-xs text-sage border border-sage/30 rounded-full px-2 py-0.5">{freeShort(free)} free</span>
            : fullyBooked ? <span className="text-xs text-stone/70 border border-line/50 rounded-full px-2 py-0.5">Fully booked</span>
            : null}
          <span className="text-xs text-stone">{dayB.length} in</span>
        </div>
      </div>
      {body}
    </div>
  )
}

// ---- Next available · slots across the next six weeks ----------------------
function NextAvailable({ onPick, onClose }: { onPick: (date: string, startMin: number) => void; onClose: () => void }) {
  const [data, setData] = useState<SchedData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const from = todayStr(), to = addDays(from, 42)
    fetch(`/api/staff/assistant/diary?from=${from}&to=${to}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setData({ bookings: (d.bookings ?? []).filter((b: Lite) => b.status !== 'cancelled'), timeOff: d.timeOff ?? [], businessHours: d.businessHours ?? [] })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const today = todayStr()
  const nowMin = toLocalMin(new Date().toISOString())
  // Walk the next six weeks; turn each free gap into 30-minute start slots.
  const days: { day: string; slots: number[] }[] = []
  if (data) {
    for (let i = 0; i <= 42 && days.length < 14; i++) {
      const day = addDays(today, i)
      let gaps = gapsForDay(day, data.bookings, data.timeOff, data.businessHours)
      if (i === 0) gaps = gaps.map((g) => ({ start: Math.max(g.start, nowMin), end: g.end })).filter((g) => g.end - g.start >= 15)
      const slots: number[] = []
      for (const g of gaps) for (let m = g.start; m <= g.end - 15 && slots.length < 16; m += 30) slots.push(m)
      if (slots.length) days.push({ day, slots })
    }
  }

  return (
    <div className="mt-3 border border-gold/45 bg-gold/5 rounded-sm p-4">
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="text-eyebrow text-gold-deep inline-flex items-center gap-2"><Clock size={14} strokeWidth={1.75} /> Next available · next 6 weeks</span>
        <button onClick={onClose} className="text-stone hover:text-clay" title="Close"><X size={16} strokeWidth={1.75} /></button>
      </div>
      {loading ? (
        <p className="text-sm text-ink-soft">Finding free slots…</p>
      ) : days.length === 0 ? (
        <p className="text-sm text-ink-soft">No free slots in the next 6 weeks — the diary is fully booked.</p>
      ) : (
        <>
          <p className="text-xs text-ink-soft mb-3">Soonest first. Tap a time to book the client straight in.</p>
          <div className="space-y-3 max-h-[22rem] overflow-y-auto pr-1">
            {days.map(({ day, slots }) => (
              <div key={day}>
                <div className="text-sm font-medium text-charcoal mb-1.5">{dayLabelShort(day)}{day === today ? ' · today' : ''}</div>
                <div className="flex flex-wrap gap-1.5">
                  {slots.map((m) => (
                    <button key={m} onClick={() => onPick(day, m)} className="text-sm rounded-sm border border-gold/40 bg-cream px-3 py-1.5 text-charcoal hover:border-gold hover:bg-gold/10 active:bg-gold/15 transition-colors">{gapClock(m)}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ---- Month grid: tap a day to open it -------------------------------------
function MonthGrid({ anchor, data, onPick }: { anchor: string; data: SchedData; onPick: (day: string) => void }) {
  const cells = monthGridDays(anchor)
  const today = todayStr()
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5">
        {WEEKDAY_LABELS.map((d) => <div key={d} className="text-center text-[10px] uppercase tracking-wide text-stone/60 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`blank-${i}`} />
          const wday = new Date(`${day}T12:00:00Z`).getUTCDay()
          const isOpen = data.businessHours.find((h) => h.weekday === wday)?.is_open ?? false
          const count = data.bookings.filter((b) => localDate(b.starts_at) === day).length
          const free = freeMinsForDay(day, data.bookings, data.timeOff, data.businessHours)
          const isToday = day === today
          const dayNum = Number(day.slice(8, 10))
          let tone = 'border-sage/30 bg-sage/[0.05]'
          if (!isOpen) tone = 'border-line/30 bg-cream-soft opacity-45'
          else if (count > 0 && free <= 0) tone = 'border-gold/45 bg-gold/15'
          else if (count > 0) tone = 'border-gold/30 bg-gold/[0.07]'
          return (
            <button key={day} onClick={() => onPick(day)} className={`relative rounded-sm border ${tone} ${isToday ? 'ring-2 ring-gold ring-offset-1 ring-offset-cream' : ''} aspect-square p-1.5 flex flex-col text-left transition-colors hover:border-gold/60`}>
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
      <p className="text-xs text-ink-soft mt-3 leading-snug">Tap a day to open it, then tap a gap to book. <span className="text-sage">Green</span> = space free · <span className="text-gold-deep">gold</span> = booked.</p>
    </div>
  )
}

// ---- Booking form — controlled by the parent (mounts pre-filled) -----------
function NewBookingPanel({ initialDate, initialTime, onClose, onDone }: { initialDate: string; initialTime: string; onClose: () => void; onDone: () => void }) {
  const [services, setServices] = useState<ServiceLite[]>([])
  const [slug, setSlug] = useState('')
  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState(initialTime)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/book/services')
      .then((r) => (r.ok ? r.json() : { services: [] }))
      .then((d) => setServices(d.services ?? []))
      .catch(() => {})
  }, [])

  async function save() {
    if (!slug || !name.trim()) { setErr('Pick a treatment and enter a name.'); return }
    setBusy(true); setErr(null)
    const res = await fetch('/api/staff/assistant/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'booking', service: slug, date, startMinutes: timeToMinutes(time), name, phone }),
    })
    if (res.ok) {
      notifyDone('Added to the diary')
      onDone()
    } else {
      const d = await res.json().catch(() => ({}))
      setErr(d.error || 'Could not save.'); setBusy(false)
    }
  }

  return (
    <div className="border border-gold/45 bg-gold/5 rounded-sm p-4 mb-5 space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-eyebrow text-gold-deep inline-flex items-center gap-2"><CalendarPlus size={14} strokeWidth={1.75} /> Booking into {dayLabelShort(date)} · {timeLabel(`${date}T${time}:00`)}</span>
        <button onClick={onClose} className="text-stone hover:text-clay" title="Close"><X size={16} strokeWidth={1.75} /></button>
      </div>
      <select value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-cream border border-line rounded-sm px-3 py-2.5 text-sm">
        <option value="">Choose a treatment…</option>
        {services.map((s) => <option key={s.slug} value={s.slug}>{s.name} ({s.duration_min} min)</option>)}
      </select>
      <div className="flex gap-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-cream border border-line rounded-sm px-3 py-2.5 text-sm" />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-cream border border-line rounded-sm px-3 py-2.5 text-sm" />
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" className="w-full bg-cream border border-line rounded-sm px-3 py-2.5 text-sm" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile (optional)" className="w-full bg-cream border border-line rounded-sm px-3 py-2.5 text-sm" />
      {err && <p className="text-xs text-clay">{err}</p>}
      <button onClick={save} disabled={busy} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 38 }}>{busy ? 'Saving…' : 'Add to diary'}</button>
    </div>
  )
}

// ---- Small shared bits -----------------------------------------------------
function GapRow({ date, startMin, endMin, onBook }: { date: string; startMin: number; endMin: number; onBook: (date: string, startMin: number) => void }) {
  const duration = endMin - startMin
  const hrs = Math.floor(duration / 60), mins = duration % 60
  const label = [hrs > 0 ? `${hrs}h` : null, mins > 0 ? `${mins}m` : null].filter(Boolean).join(' ')
  return (
    <button onClick={() => onBook(date, startMin)} className="w-full text-left flex items-center justify-between gap-3 border border-dashed border-gold/50 bg-gold/[0.05] rounded-sm px-4 py-2.5 hover:border-gold hover:bg-gold/10 active:bg-gold/15 transition-colors">
      <div className="min-w-0">
        <div className="text-sm text-charcoal truncate"><span className="font-medium">{gapClock(startMin)}</span> &nbsp; Free until {gapClock(endMin)} · {label}</div>
        <div className="text-xs text-gold-deep mt-0.5 inline-flex items-center gap-1"><CalendarPlus size={11} strokeWidth={2} /> Tap to book someone in</div>
      </div>
      <span className="shrink-0 text-xs text-gold-deep font-medium border border-gold/40 rounded-full px-2.5 py-1">Book</span>
    </button>
  )
}

function BookingRow({ booking: b, nowMin, missing }: { booking: Lite; nowMin: number; missing: Set<string> | null }) {
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
          <ConsentFlag name={b.client_name} missing={missing} />
          <ConfirmedDot status={b.status} confirmedAt={b.confirmed_at} />
          <span className={`text-sm capitalize ${statusTone[b.status] ?? 'text-stone'}`}>{b.status.replace('_', ' ')}</span>
        </span>
      </div>
    </div>
  )
}

function ConfirmedDot({ status, confirmedAt }: { status: string; confirmedAt: string | null }) {
  if (status === 'confirmed' && confirmedAt) return <span title="Client confirmed" className="w-2 h-2 rounded-full bg-sage inline-block shrink-0" />
  if (status === 'confirmed' && !confirmedAt) return <span title="Awaiting confirmation" className="w-2 h-2 rounded-full bg-gold inline-block shrink-0" />
  if (status === 'pending') return <span title="Deposit pending" className="w-2 h-2 rounded-full bg-gold-deep inline-block shrink-0" />
  return null
}

function ConsentFlag({ name, missing }: { name: string; missing: Set<string> | null }) {
  if (missing === null) return null
  if (missing.has(name.trim().toLowerCase())) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-clay shrink-0 whitespace-nowrap">
        <X size={9} strokeWidth={2.5} /> Consent
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-sage shrink-0 whitespace-nowrap">
      <Check size={9} strokeWidth={2.5} /> Consent
    </span>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-3">{children}</p>
}
