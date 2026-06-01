'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, LogOut, Plus, Ban } from 'lucide-react'

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

export default function Diary() {
  const [date, setDate] = useState(todayStr())
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [timeOff, setTimeOff] = useState<TimeOff[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<'booking' | 'time_off' | null>(null)

  const load = useCallback(async (from: string, to: string) => {
    setLoading(true)
    const res = await fetch(`/api/staff/assistant/diary?from=${from}&to=${to}`)
    if (res.ok) {
      const d = await res.json()
      setBookings(d.bookings ?? [])
      setTimeOff(d.timeOff ?? [])
      setWaitlist(d.waitlist ?? [])
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
        </div>

        {adding === 'booking' && <AddBooking date={date} services={services} onDone={() => { setAdding(null); reload() }} />}
        {adding === 'time_off' && <BlockTime date={date} onDone={() => { setAdding(null); reload() }} />}

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
                      <div className="border border-line/40 bg-cream-soft rounded-sm divide-y divide-line/30">
                        {dayT.map((t) => (
                          <div key={t.id} className="px-3.5 py-2 text-xs text-stone flex items-center gap-2"><Ban size={12} strokeWidth={1.75} /> {timeLabel(t.starts_at)} to {timeLabel(t.ends_at)} &nbsp;·&nbsp; {t.reason || 'Blocked'}</div>
                        ))}
                        {dayB.map((b) => (
                          <div key={b.id} className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                            <span className="text-sm text-charcoal truncate min-w-0"><span className="text-stone">{timeLabel(b.starts_at)}</span> &nbsp; {b.client_name}</span>
                            <span className="text-xs text-stone truncate shrink-0 ml-2">{b.service_name}</span>
                          </div>
                        ))}
                      </div>
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
                  {dayB.length || dayT.length ? (
                    <div className="border border-line/40 bg-cream-soft rounded-sm divide-y divide-line/30">
                      {dayT.map((t) => (
                        <div key={t.id} className="px-3.5 py-2 text-xs text-stone flex items-center gap-2"><Ban size={12} strokeWidth={1.75} /> {timeLabel(t.starts_at)} to {timeLabel(t.ends_at)} &nbsp;·&nbsp; {t.reason || 'Blocked'}</div>
                      ))}
                      {dayB.map((b) => (
                        <div key={b.id} className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                          <span className="text-sm text-charcoal truncate min-w-0"><span className="text-stone">{timeLabel(b.starts_at)}</span> &nbsp; {b.client_name}</span>
                          <span className="text-xs text-stone truncate shrink-0 ml-2">{b.service_name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
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
            {timeOff.map((t) => (
              <div key={t.id} className="flex items-center gap-3 border border-line/40 bg-cream-deep/40 rounded-sm px-4 py-3 text-sm text-stone">
                <Ban size={14} strokeWidth={1.75} /> {timeLabel(t.starts_at)} to {timeLabel(t.ends_at)} &nbsp;·&nbsp; {t.reason || 'Blocked'}
              </div>
            ))}
            {live.map((b) => (
              <div key={b.id} className="border border-line/40 bg-cream-soft rounded-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-charcoal"><span className="font-medium">{timeLabel(b.starts_at)}</span> &nbsp; {b.client_name}</div>
                    <div className="text-sm text-stone mt-0.5">{b.service_name}{b.source === 'online' ? ' · online' : ''}{b.client_phone ? ` · ${b.client_phone}` : ''}</div>
                    {b.notes && <div className="text-xs text-ink-soft mt-1">{b.notes}</div>}
                  </div>
                  <span className={`text-xs capitalize ${statusTone[b.status] ?? 'text-stone'}`}>{b.status.replace('_', ' ')}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {b.status !== 'completed' && <button onClick={() => setStatus(b.id, 'completed')} className="text-xs rounded-full border border-line/50 px-3 py-1.5 text-charcoal hover:border-gold/60">Completed</button>}
                  {b.status !== 'no_show' && <button onClick={() => setStatus(b.id, 'no_show')} className="text-xs rounded-full border border-line/50 px-3 py-1.5 text-charcoal hover:border-gold/60">No show</button>}
                  {b.status === 'pending' && <button onClick={() => setStatus(b.id, 'confirmed')} className="text-xs rounded-full border border-line/50 px-3 py-1.5 text-charcoal hover:border-gold/60">Confirm</button>}
                  <button onClick={() => setStatus(b.id, 'cancelled')} className="text-xs rounded-full border border-clay/40 px-3 py-1.5 text-clay hover:bg-clay/5 ml-auto">Cancel</button>
                </div>
              </div>
            ))}
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
    if (res.ok) onDone()
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
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" className="flex-1 bg-cream border border-line rounded-sm px-3 py-2.5 text-sm" />
      </div>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile (optional)" className="w-full bg-cream border border-line rounded-sm px-3 py-2.5 text-sm" />
      {err && <p className="text-xs text-clay">{err}</p>}
      <button onClick={save} disabled={busy} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 38 }}>{busy ? 'Saving…' : 'Add to diary'}</button>
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
    if (res.ok) onDone()
    else { const d = await res.json().catch(() => ({})); setErr(d.error || 'Could not save.'); setBusy(false) }
  }

  return (
    <div className="border border-line/50 bg-cream-soft rounded-sm p-4 mb-5 space-y-2.5">
      <div className="flex items-center gap-2 text-sm text-stone">
        <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="bg-cream border border-line rounded-sm px-3 py-2.5" />
        <span>to</span>
        <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="bg-cream border border-line rounded-sm px-3 py-2.5" />
      </div>
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional), e.g. lunch" className="w-full bg-cream border border-line rounded-sm px-3 py-2.5 text-sm" />
      {err && <p className="text-xs text-clay">{err}</p>}
      <button onClick={save} disabled={busy} className="btn btn-secondary disabled:opacity-50" style={{ minHeight: 38 }}>{busy ? 'Saving…' : 'Block this time'}</button>
    </div>
  )
}
