'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Clock, LogOut, Plus, X } from 'lucide-react'
import { notifyDone } from '@/lib/staff-toast'

type Window = { open_min: number; close_min: number }
type Day = { weekday: number; windows: Window[] }

// Mon-first display order over the 0=Sun..6=Sat data.
const ORDER = [1, 2, 3, 4, 5, 6, 0]
const DAY_NAME: Record<number, string> = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' }

function toTime(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export default function OpeningHours() {
  const [days, setDays] = useState<Day[]>([])
  const [loading, setLoading] = useState(true)
  const [configured, setConfigured] = useState(true)
  const [savingDay, setSavingDay] = useState<number | null>(null)
  const [savedDay, setSavedDay] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/staff/assistant/business-hours')
      if (res.ok) {
        const d = await res.json()
        setConfigured(d.configured !== false)
        const windows: Record<number, Window[]> = d.windows ?? {}
        setDays(
          ORDER.map((wd) => ({
            weekday: wd,
            windows: (windows[wd] ?? []).map((w) => ({ open_min: w.open_min, close_min: w.close_min })),
          })),
        )
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  function update(weekday: number, windows: Window[]) {
    setDays((prev) => prev.map((d) => (d.weekday === weekday ? { ...d, windows } : d)))
    setSavedDay(null)
    setError(null)
  }

  function setOpen(day: Day, open: boolean) {
    update(day.weekday, open ? (day.windows.length ? day.windows : [{ open_min: 600, close_min: 1020 }]) : [])
  }

  function editWindow(day: Day, idx: number, patch: Partial<Window>) {
    update(day.weekday, day.windows.map((w, i) => (i === idx ? { ...w, ...patch } : w)))
  }

  function addWindow(day: Day) {
    const last = day.windows[day.windows.length - 1]
    // Default a new session to start after the previous one ends (or 6–7:30pm).
    const open = last ? Math.min(last.close_min, 1380) : 1080
    update(day.weekday, [...day.windows, { open_min: open, close_min: Math.min(open + 90, 1440) }])
  }

  function removeWindow(day: Day, idx: number) {
    update(day.weekday, day.windows.filter((_, i) => i !== idx))
  }

  async function save(day: Day) {
    const windows = [...day.windows].sort((a, b) => a.open_min - b.open_min)
    for (const w of windows) {
      if (w.close_min <= w.open_min) {
        setError(`${DAY_NAME[day.weekday]}: each session must close after it opens.`)
        return
      }
    }
    for (let i = 1; i < windows.length; i++) {
      if (windows[i].open_min < windows[i - 1].close_min) {
        setError(`${DAY_NAME[day.weekday]}: the sessions overlap. Give each a separate time.`)
        return
      }
    }
    setSavingDay(day.weekday)
    setError(null)
    try {
      const res = await fetch('/api/staff/assistant/business-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekday: day.weekday, windows }),
      })
      if (res.ok) {
        setSavedDay(day.weekday)
        notifyDone(`${DAY_NAME[day.weekday]} hours saved`)
      } else {
        const d = await res.json().catch(() => ({}))
        setError(d.error || 'Could not save.')
      }
    } catch {
      setError('Network error while saving.')
    } finally {
      setSavingDay(null)
    }
  }

  async function signOut() {
    await fetch('/api/staff/logout', { method: 'POST' })
    window.location.reload()
  }

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="eyebrow text-gold mb-2">Front desk &nbsp;·&nbsp; Opening hours</div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">Opening hours.</h1>
            <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
              Set the days and times you are open. Add more than one session to a day if you split it, for example a
              daytime clinic and an evening session. Opening a day or widening its hours releases those slots straight
              away; closing a day hides its slots from new bookings.
            </p>
          </div>
          <button onClick={signOut} className="eyebrow text-stone hover:text-gold-deep transition-colors flex items-center gap-2 shrink-0 mt-2">
            <LogOut size={14} strokeWidth={1.75} /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        {!configured ? (
          <p className="text-sm text-ink-soft border border-line/40 rounded-sm bg-cream-soft px-4 py-4">
            The clinic database is not connected, so opening hours cannot be edited here yet.
          </p>
        ) : loading ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : (
          <div className="space-y-2.5">
            {days.map((day) => {
              const saving = savingDay === day.weekday
              const saved = savedDay === day.weekday
              const isOpen = day.windows.length > 0
              return (
                <div key={day.weekday} className="border border-line/40 bg-cream-soft rounded-sm px-4 py-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-[7.5rem]">
                      <Clock size={15} strokeWidth={1.75} className={isOpen ? 'text-gold-deep' : 'text-stone/50'} />
                      <span className="text-charcoal font-medium">{DAY_NAME[day.weekday]}</span>
                    </div>

                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isOpen}
                        onChange={(e) => setOpen(day, e.target.checked)}
                        className="accent-gold-deep w-4 h-4"
                      />
                      <span className="text-sm text-ink-soft">{isOpen ? 'Open' : 'Closed'}</span>
                    </label>

                    <button
                      onClick={() => void save(day)}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-1.5 bg-charcoal text-cream text-sm rounded-sm px-4 py-2 hover:bg-gold-deep transition-colors disabled:opacity-50 shrink-0"
                    >
                      {saved ? <Check size={14} /> : null}
                      {saving ? 'Saving…' : saved ? 'Saved' : 'Save'}
                    </button>
                  </div>

                  {isOpen ? (
                    <div className="mt-3 space-y-2 pl-1">
                      {day.windows.map((w, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="time"
                            value={toTime(w.open_min)}
                            onChange={(e) => editWindow(day, idx, { open_min: toMin(e.target.value) })}
                            className="bg-cream border border-line rounded-sm px-2.5 py-2 text-sm"
                          />
                          <span className="text-ink-soft text-sm">to</span>
                          <input
                            type="time"
                            value={toTime(w.close_min)}
                            onChange={(e) => editWindow(day, idx, { close_min: toMin(e.target.value) })}
                            className="bg-cream border border-line rounded-sm px-2.5 py-2 text-sm"
                          />
                          <button
                            onClick={() => removeWindow(day, idx)}
                            aria-label="Remove this session"
                            title="Remove this session"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-line/40 text-ink-soft hover:border-clay hover:text-clay transition-colors"
                          >
                            <X size={14} strokeWidth={2} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addWindow(day)}
                        className="inline-flex items-center gap-1.5 text-sm text-gold-deep hover:text-charcoal transition-colors"
                      >
                        <Plus size={14} strokeWidth={2} /> Add a session
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-stone/70 pl-1">No appointments this day</p>
                  )}
                </div>
              )
            })}
            {error && <p className="text-sm text-clay">{error}</p>}
            <p className="text-xs text-ink-soft pt-2 leading-relaxed">
              Tip: you can also just tell the assistant, e.g. &ldquo;open Thursdays 9 to 5&rdquo; or &ldquo;close Saturdays&rdquo;
              (that sets a single session). Use the sessions above to split a day. A one-off appointment outside these
              hours can still be added from the front desk &ldquo;New booking&rdquo;.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
