'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, CalendarPlus, Check, ChevronLeft, ChevronRight, Clock, ListPlus, LogOut, Mic, Phone, Sparkles, X } from 'lucide-react'
import { notifyDone } from '@/lib/staff-toast'
import { BookingRow, BookingDetailModal, CancelConfirmModal, type BookingLite } from '@/components/staff/BookingCard'

type Lite = { id: string; service_name: string; client_name: string; client_email?: string | null; client_phone: string | null; starts_at: string; ends_at?: string; status: string; source: string; created_at: string; notes?: string | null; confirmed_at: string | null }
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
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
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
function minToTime(m: number): string {
  return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`
}
function addMonths(ds: string, n: number): string {
  const d = new Date(`${ds}T12:00:00Z`)
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() + n)
  return d.toISOString().slice(0, 10)
}
function weekDays(ds: string): string[] {
  const s = weekStart(ds)
  return Array.from({ length: 7 }, (_, i) => addDays(s, i))
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
function freeShort(mins: number): string {
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? `${h}h` : `${m}m`
}
// Open-but-unbooked intervals on a day (≥15 min), each a bookable gap.
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
// Calendar cells for a month: leading blanks (Monday-start) then each day.
function monthGridDays(ds: string): (string | null)[] {
  const { from, to } = monthBounds(ds)
  const lead = (new Date(`${from}T12:00:00Z`).getUTCDay() + 6) % 7
  const total = Number(to.slice(8, 10))
  const cells: (string | null)[] = Array.from({ length: lead }, () => null)
  for (let d = 1; d <= total; d++) cells.push(`${from.slice(0, 7)}-${String(d).padStart(2, '0')}`)
  return cells
}
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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
  const [dayDiary, setDayDiary] = useState<DayDiary | null>(null)
  // Navigable schedule — day / week / month anchored on a date the desk can move.
  const [schedView, setSchedView] = useState<'day' | 'week' | 'month'>('day')
  const [anchor, setAnchor] = useState<string>(() => todayStr())
  const [schedData, setSchedData] = useState<{ bookings: Lite[]; timeOff: TimeOffRow[]; businessHours: BusinessHour[] }>({ bookings: [], timeOff: [], businessHours: [] })
  const [schedLoading, setSchedLoading] = useState(true)
  // Booking form opened by clicking a gap (seize a slot) or the New booking button.
  const [prefill, setPrefill] = useState<{ date: string; time: string } | null>(null)
  // Tap a card to open its detail; the X / "Cancel & release" opens a confirm.
  const [detail, setDetail] = useState<BookingLite | null>(null)
  const [pendingCancel, setPendingCancel] = useState<BookingLite | null>(null)
  const bookingRef = useRef<HTMLDivElement | null>(null)
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

  const [consentMissing, setConsentMissing] = useState<Set<string> | null>(null)
  useEffect(() => {
    fetch('/api/staff/assistant/consent/flags')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setConsentMissing(new Set((d?.missing ?? []) as string[])) })
      .catch(() => {})
  }, [])

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

  // Load the schedule for the current view + anchor (day / week / month range).
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
      const d = r.ok ? await r.json() : { bookings: [], timeOff: [], businessHours: [] }
      setSchedData({
        bookings: (d.bookings ?? []).filter((b: Lite) => b.status !== 'cancelled'),
        timeOff: d.timeOff ?? [],
        businessHours: d.businessHours ?? [],
      })
    } catch { /* keep last good data on a transient error */ }
    if (!silent) setSchedLoading(false)
  }, [schedView, anchor])

  useEffect(() => { void loadSchedule() }, [loadSchedule])

  // Silent auto-refresh every 45 seconds — keeps the desk and schedule current.
  useEffect(() => {
    const id = setInterval(() => { void load(true); void loadSchedule(true) }, 45_000)
    return () => clearInterval(id)
  }, [load, loadSchedule])

  // Seize a gap: open the booking form pre-filled to that slot and scroll to it.
  const bookSlot = useCallback((date: string, startMin: number) => {
    setPrefill({ date, time: minToTime(startMin) })
    requestAnimationFrame(() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }, [])

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

            {/* Now / Next — what's in the chair right now */}
            {(currentAppt || nextAppt) && (
              <NowNextCard current={currentAppt} next={nextAppt} nowMin={nowMin} />
            )}

            {/* Booking form — opens pre-filled the moment a gap is tapped */}
            <div ref={bookingRef} className="scroll-mt-6">
              {prefill ? (
                <NewBookingPanel
                  key={`${prefill.date}T${prefill.time}`}
                  initialDate={prefill.date}
                  initialTime={prefill.time}
                  onClose={() => setPrefill(null)}
                  onDone={() => { setPrefill(null); void load(true); void loadSchedule(true) }}
                />
              ) : (
                <button onClick={() => bookSlot(todayStr(), 600)} className="btn btn-primary mb-8" style={{ minHeight: 40 }}>
                  <span className="inline-flex items-center gap-2"><CalendarPlus size={15} strokeWidth={1.75} /> New booking</span>
                </button>
              )}
            </div>

            {/* Schedule — find a gap and book straight in */}
            <Section title="Book someone in" icon={CalendarDays} href="/staff/assistant/diary" cta="Open diary">
              <p className="text-sm text-ink-soft -mt-1 mb-3 leading-snug">Find a free gap and tap it to book the client in — day, week or month.</p>
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
                <ReceptionMonthGrid anchor={anchor} data={schedData} onPick={(day) => { setAnchor(day); setSchedView('day') }} />
              ) : schedView === 'week' ? (
                <div className="space-y-4">
                  {weekDays(anchor).map((day) => (
                    <DaySchedule key={day} day={day} data={schedData} nowMin={nowMin} missing={consentMissing} onBook={bookSlot} onOpen={setDetail} onCancel={setPendingCancel} heading />
                  ))}
                </div>
              ) : (
                <DaySchedule day={anchor} data={schedData} nowMin={nowMin} missing={consentMissing} onBook={bookSlot} onOpen={setDetail} onCancel={setPendingCancel} />
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

      {detail && (
        <BookingDetailModal
          booking={detail}
          onClose={() => setDetail(null)}
          onCancel={(b) => { setDetail(null); setPendingCancel(b) }}
          onChanged={() => void loadSchedule(true)}
        />
      )}
      {pendingCancel && (
        <CancelConfirmModal
          booking={pendingCancel}
          onConfirm={async () => {
            const b = pendingCancel
            setPendingCancel(null)
            setSchedData((prev) => ({ ...prev, bookings: prev.bookings.filter((x) => x.id !== b.id) }))
            try {
              const res = await fetch(`/api/staff/assistant/diary/${b.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled' }),
              })
              if (res.ok) notifyDone('Booking cancelled — slot released')
            } catch {
              /* network error — the reload below restores the row */
            }
            void loadSchedule(true)
          }}
          onClose={() => setPendingCancel(null)}
        />
      )}
    </section>
  )
}

// ---- Take a booking at the desk --------------------------------------------
type ServiceLite = { slug: string; name: string; duration_min: number }
type SchedData = { bookings: Lite[]; timeOff: TimeOffRow[]; businessHours: BusinessHour[] }

// Controlled by the parent: it mounts this with the slot's date + time already
// filled (from a tapped gap) and unmounts it on close/done.
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
    <div className="border border-gold/45 bg-gold/5 rounded-sm p-4 mb-8 space-y-2.5">
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

// ---- One day's bookings + tappable gaps ------------------------------------
function DaySchedule({ day, data, nowMin, missing, onBook, onOpen, onCancel, heading = false }: { day: string; data: SchedData; nowMin: number; missing: Set<string> | null; onBook: (date: string, startMin: number) => void; onOpen: (b: BookingLite) => void; onCancel: (b: BookingLite) => void; heading?: boolean }) {
  const dayB = data.bookings.filter((b) => localDate(b.starts_at) === day).sort((a, b) => a.starts_at.localeCompare(b.starts_at))
  const gaps = gapsForDay(day, data.bookings, data.timeOff, data.businessHours)
  const free = freeMinsForDay(day, data.bookings, data.timeOff, data.businessHours)
  const wday = new Date(`${day}T12:00:00Z`).getUTCDay()
  const isOpen = data.businessHours.find((h) => h.weekday === wday)?.is_open ?? false
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
          ? <BookingRow key={item.b.id} booking={item.b} nowMin={nowMin} missing={missing} onOpen={onOpen} onCancel={onCancel} />
          : <GapRow key={`gap-${i}`} date={day} startMin={item.start} endMin={item.end} onBook={onBook} />
        )}
      </div>
    )

  if (!heading) return body
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-sm font-medium ${day === todayStr() ? 'text-gold-deep' : 'text-charcoal'}`}>{dayLabelShort(day)}{day === todayStr() ? ' · today' : ''}</span>
        <div className="flex items-center gap-2">
          {free > 0 && <span className="text-xs text-sage border border-sage/30 rounded-full px-2 py-0.5">{freeShort(free)} free</span>}
          <span className="text-xs text-stone">{dayB.length} in</span>
        </div>
      </div>
      {body}
    </div>
  )
}

// ---- Month grid: tap a day to open it -------------------------------------
function ReceptionMonthGrid({ anchor, data, onPick }: { anchor: string; data: SchedData; onPick: (day: string) => void }) {
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

function GapRow({ date, startMin, endMin, onBook }: { date: string; startMin: number; endMin: number; onBook: (date: string, startMin: number) => void }) {
  const duration = endMin - startMin
  const hrs = Math.floor(duration / 60)
  const mins = duration % 60
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
