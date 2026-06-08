'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, LogOut, Plus, Ban } from 'lucide-react'
import MicButton, { appendText } from '@/components/ui/MicButton'
import { notifyDone } from '@/lib/staff-toast'

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
  starts_at: string
  ends_at: string
  status: string
  source: string
  notes: string | null
}
type TimeOff = { id: string; starts_at: string; ends_at: string; reason: string | null }
type Service = { slug: string; name: string; duration_min: number }
type WaitlistEntry = { id: string; client_name: string; service_name: string | null; client_phone: string | null; preferred_note: string | null }
type BusinessHours = { weekday: number; is_open: boolean; open_min: number; close_min: number }
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

const statusTone: Record<string, string> = {
  confirmed: 'text-sage',
  pending: 'text-gold-deep',
  completed: 'text-stone',
  cancelled: 'text-clay line-through',
  no_show: 'text-clay',
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
function dayFreeGaps(day: string, allBookings: Booking[], allTimeOff: TimeOff[], bh: BusinessHours[]): Interval[] {
  const wday = new Date(`${day}T12:00:00Z`).getUTCDay()
  const hours = bh.find((h) => h.weekday === wday)
  // Sort all busy items together
  const allBusy = [
    ...allBookings.filter((b) => localDate(b.starts_at) === day).map((b) => ({ start: toLocalMin(b.starts_at), end: toLocalMin(b.ends_at) })),
    ...allTimeOff.filter((t) => localDate(t.starts_at) === day).map((t) => ({ start: toLocalMin(t.starts_at), end: toLocalMin(t.ends_at) })),
  ].sort((a, b) => a.start - b.start)
  if (allBusy.length === 0) return []
  const gaps: Interval[] = []
  // Gap before first booking — only if business hours are known
  if (hours?.is_open && hours.open_min < allBusy[0].start && allBusy[0].start - hours.open_min >= 15) {
    gaps.push({ start: hours.open_min, end: allBusy[0].start })
  }
  // Gaps between bookings — always computed, no business hours needed
  for (let i = 0; i < allBusy.length - 1; i++) {
    const gapStart = allBusy[i].end
    const gapEnd = allBusy[i + 1].start
    if (gapEnd - gapStart >= 15) gaps.push({ start: gapStart, end: gapEnd })
  }
  // Gap after last booking — only if business hours are known
  if (hours?.is_open && allBusy[allBusy.length - 1].end < hours.close_min && hours.close_min - allBusy[allBusy.length - 1].end >= 15) {
    gaps.push({ start: allBusy[allBusy.length - 1].end, end: hours.close_min })
  }
  return gaps
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

export default function Diary() {
  const [date, setDate] = useState(todayStr())
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [timeOff, setTimeOff] = useState<TimeOff[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([])
  const [adding, setAdding] = useState<'booking' | 'time_off' | 'hours' | null>(null)

  const load = useCallback(async (from: string, to: string) => {
    setLoading(true)
    const res = await fetch(`/api/staff/assistant/diary?from=${from}&to=${to}`)
    if (res.ok) {
      const d = await res.json()
      setBookings(d.bookings ?? [])
      setTimeOff(d.timeOff ?? [])
      setWaitlist(d.waitlist ?? [])
      if (d.businessHours) setBusinessHours(d.businessHours)
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
    void (async () => {
      const res = await fetch('/api/book/services')
      if (res.ok) setServices((await res.json()).services ?? [])
    })()
  }, [])

  async function setStatus(id: string, status: string) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
    await fetch(`/api/staff/assistant/diary/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    notifyDone(STATUS_DONE[status] ?? 'Updated')
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

        <div className="flex justify-center mb-3">
          <div className="inline-flex rounded-full border border-line/50 bg-cream-soft p-0.5">
            {(['day', 'week', 'month'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`text-sm rounded-full px-5 py-1.5 capitalize transition-colors ${view === v ? 'bg-gold text-charcoal' : 'text-ink-soft'}`}>{v}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mb-5">
          <button onClick={() => setDate(view === 'month' ? addMonths(date, -1) : addDays(date, view === 'week' ? -7 : -1))} className="w-10 h-10 inline-flex items-center justify-center rounded-sm border border-line/50 bg-cream-soft hover:border-gold/60"><ChevronLeft size={18} /></button>
          <div className="text-center">
            <div className="font-display italic text-xl text-charcoal">{view === 'month' ? monthHeading(date) : view === 'week' ? weekHeading(date) : dayHeading(date)}</div>
            <button onClick={() => setDate(todayStr())} className="text-xs text-gold-deep">Jump to today</button>
          </div>
          <button onClick={() => setDate(view === 'month' ? addMonths(date, 1) : addDays(date, view === 'week' ? 7 : 1))} className="w-10 h-10 inline-flex items-center justify-center rounded-sm border border-line/50 bg-cream-soft hover:border-gold/60"><ChevronRight size={18} /></button>
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
        {adding === 'hours' && <EditHours initialHours={businessHours} onDone={() => { setAdding(null); reload() }} />}

        {loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : view === 'month' ? (
          (() => {
            const keys = Array.from(new Set([...live.map((b) => localDate(b.starts_at)), ...timeOff.map((t) => localDate(t.starts_at))])).sort()
            if (keys.length === 0) return <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-5 text-center">Nothing booked this month.</p>
            return (
              <div className="space-y-4">
                <div className="eyebrow text-gold">{live.length} booked this month</div>
                {keys.map((day) => {
                  const dayB = live.filter((b) => localDate(b.starts_at) === day).sort((a, b) => a.starts_at.localeCompare(b.starts_at))
                  const dayT = timeOff.filter((t) => localDate(t.starts_at) === day)
                  const isToday = day === todayStr()
                  return (
                    <div key={day}>
                      <button onClick={() => { setDate(day); setView('day') }} className="w-full flex items-center justify-between mb-1.5 text-left">
                        <span className={`text-sm font-medium ${isToday ? 'text-gold-deep' : 'text-charcoal'}`}>{shortDay(day)}{isToday ? ' · today' : ''}</span>
                        <span className="text-xs text-stone">{dayB.length ? `${dayB.length} in` : ''}</span>
                      </button>
                      {(() => {
                        const gaps = dayFreeGaps(day, live, timeOff, businessHours)
                        const sorted = [
                          ...dayB.map((b) => ({ t: 'b' as const, b, min: toLocalMin(b.starts_at) })),
                          ...dayT.map((t) => ({ t: 'to' as const, to: t, min: toLocalMin(t.starts_at) })),
                          ...gaps.map((g) => ({ t: 'g' as const, g, min: g.start })),
                        ].sort((a, b) => a.min - b.min)
                        return (
                          <div className="border border-line/40 bg-cream-soft rounded-sm divide-y divide-line/30">
                            {sorted.map((item, i) => item.t === 'to' ? (
                              <div key={item.to.id} className="px-3.5 py-2 text-xs text-stone flex items-center gap-2"><Ban size={12} strokeWidth={1.75} /> {timeLabel(item.to.starts_at)} to {timeLabel(item.to.ends_at)} &nbsp;·&nbsp; {item.to.reason || 'Blocked'}</div>
                            ) : item.t === 'g' ? (
                              <div key={`gap-${i}`} className="px-3.5 py-1.5 flex items-center gap-1.5 select-none opacity-30">
                                <span className="text-[11px] text-stone/50 tabular-nums whitespace-nowrap">{gapClock(item.g.start)}</span>
                                <span className="flex-1 border-t border-dashed border-stone/25" />
                                <span className="text-[11px] text-stone/50 whitespace-nowrap">{gapLabel(item.g.end - item.g.start)}</span>
                              </div>
                            ) : (
                              <div key={item.b.id} className="px-3.5 py-2.5 flex items-center justify-between gap-2 bg-gold/[0.07]">
                                <span className="text-sm text-charcoal truncate min-w-0"><span className="text-stone">{timeLabel(item.b.starts_at)}</span> &nbsp; {item.b.client_name}</span>
                                <span className="text-xs text-stone truncate shrink-0 ml-2">{item.b.service_name}</span>
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </div>
                  )
                })}
              </div>
            )
          })()
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
                  {dayB.length || dayT.length ? (() => {
                    const gaps = dayFreeGaps(day, live, timeOff, businessHours)
                    const sorted = [
                      ...dayB.map((b) => ({ t: 'b' as const, b, min: toLocalMin(b.starts_at) })),
                      ...dayT.map((t) => ({ t: 'to' as const, to: t, min: toLocalMin(t.starts_at) })),
                      ...gaps.map((g) => ({ t: 'g' as const, g, min: g.start })),
                    ].sort((a, b) => a.min - b.min)
                    return (
                      <div className="border border-line/40 bg-cream-soft rounded-sm divide-y divide-line/30">
                        {sorted.map((item, i) => item.t === 'to' ? (
                          <div key={item.to.id} className="px-3.5 py-2 text-xs text-stone flex items-center gap-2"><Ban size={12} strokeWidth={1.75} /> {timeLabel(item.to.starts_at)} to {timeLabel(item.to.ends_at)} &nbsp;·&nbsp; {item.to.reason || 'Blocked'}</div>
                        ) : item.t === 'g' ? (
                          <div key={`gap-${i}`} className="px-3.5 py-1.5 flex items-center gap-1.5 select-none">
                            <span className="text-[11px] text-stone/50 tabular-nums whitespace-nowrap">{gapClock(item.g.start)}</span>
                            <span className="flex-1 border-t border-dashed border-stone/25" />
                            <span className="text-[11px] text-stone/50 whitespace-nowrap">{gapLabel(item.g.end - item.g.start)}</span>
                          </div>
                        ) : (
                          <div key={item.b.id} className="px-3.5 py-2.5 flex items-center justify-between gap-2 bg-gold/[0.07]">
                            <span className="text-sm text-charcoal truncate min-w-0"><span className="text-stone">{timeLabel(item.b.starts_at)}</span> &nbsp; {item.b.client_name}</span>
                            <span className="text-xs text-stone truncate shrink-0 ml-2">{item.b.service_name}</span>
                          </div>
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
            {(() => {
              const gaps = dayFreeGaps(date, live, timeOff, businessHours)
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
                <div key={item.b.id} className="border border-gold/35 bg-gold/[0.07] rounded-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-charcoal"><span className="font-medium">{timeLabel(item.b.starts_at)}</span> &nbsp; {item.b.client_name}</div>
                      <div className="text-sm text-stone mt-0.5">{item.b.service_name}{item.b.source === 'online' ? ' · online' : ''}{item.b.client_phone ? ` · ${item.b.client_phone}` : ''}</div>
                      {item.b.notes && <div className="text-xs text-ink-soft mt-1">{item.b.notes}</div>}
                    </div>
                    <span className={`text-xs capitalize ${statusTone[item.b.status] ?? 'text-stone'}`}>{item.b.status.replace('_', ' ')}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.b.status !== 'completed' && <button onClick={() => setStatus(item.b.id, 'completed')} className="text-xs rounded-full border border-line/50 px-3 py-1.5 text-charcoal hover:border-gold/60">Completed</button>}
                    {item.b.status !== 'no_show' && <button onClick={() => setStatus(item.b.id, 'no_show')} className="text-xs rounded-full border border-line/50 px-3 py-1.5 text-charcoal hover:border-gold/60">No show</button>}
                    {item.b.status === 'pending' && <button onClick={() => setStatus(item.b.id, 'confirmed')} className="text-xs rounded-full border border-line/50 px-3 py-1.5 text-charcoal hover:border-gold/60">Confirm</button>}
                    <button onClick={() => setStatus(item.b.id, 'cancelled')} className="text-xs rounded-full border border-clay/40 px-3 py-1.5 text-clay hover:bg-clay/5 ml-auto">Cancel</button>
                  </div>
                </div>
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

function EditHours({ initialHours, onDone }: { initialHours: BusinessHours[]; onDone: () => void }) {
  const [rows, setRows] = useState<BusinessHours[]>(() =>
    Array.from({ length: 7 }, (_, i) => initialHours.find((h) => h.weekday === i) ?? { weekday: i, is_open: false, open_min: 540, close_min: 1020 })
  )
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function patch(weekday: number, changes: Partial<BusinessHours>) {
    setRows((prev) => prev.map((r) => (r.weekday === weekday ? { ...r, ...changes } : r)))
  }

  async function save() {
    setBusy(true); setErr(null)
    try {
      await Promise.all(
        rows.map((r) =>
          fetch('/api/staff/assistant/business-hours', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(r),
          })
        )
      )
      setSaved(true)
      setTimeout(() => { setSaved(false); onDone() }, 900)
    } catch {
      setErr('Could not save. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="border border-gold/40 bg-gold/5 rounded-sm p-4 mb-5">
      <div className="eyebrow text-gold mb-3">Working hours</div>
      <div className="space-y-2">
        {WEEK_ORDER.map((wd) => {
          const row = rows[wd]
          return (
            <div key={wd} className="flex items-center gap-2.5 flex-wrap">
              <span className="text-sm text-charcoal w-24 shrink-0">{DAY_NAMES[wd]}</span>
              <button
                onClick={() => patch(wd, { is_open: !row.is_open })}
                className={`text-xs rounded-full px-3 py-1 border transition-colors shrink-0 ${row.is_open ? 'border-sage/60 bg-sage/10 text-sage' : 'border-line/50 bg-cream text-stone hover:border-gold/50'}`}
              >
                {row.is_open ? 'Open' : 'Closed'}
              </button>
              {row.is_open && (
                <>
                  <input
                    type="time"
                    value={minToTime(row.open_min)}
                    onChange={(e) => patch(wd, { open_min: timeToMinutes(e.target.value) })}
                    className="bg-cream border border-line rounded-sm px-2.5 py-1.5 text-sm w-28"
                  />
                  <span className="text-xs text-stone">to</span>
                  <input
                    type="time"
                    value={minToTime(row.close_min)}
                    onChange={(e) => patch(wd, { close_min: timeToMinutes(e.target.value) })}
                    className="bg-cream border border-line rounded-sm px-2.5 py-1.5 text-sm w-28"
                  />
                </>
              )}
            </div>
          )
        })}
      </div>
      {err && <p className="text-xs text-clay mt-2">{err}</p>}
      <div className="flex items-center gap-2 mt-4">
        <button onClick={save} disabled={busy || saved} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 38 }}>
          {saved ? 'Saved ✓' : busy ? 'Saving…' : 'Save working hours'}
        </button>
        <button onClick={onDone} className="btn btn-secondary" style={{ minHeight: 38 }}>Cancel</button>
      </div>
      <p className="text-xs text-ink-soft mt-1.5 leading-snug">Changes take effect immediately. Clients will see the updated availability.</p>
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
