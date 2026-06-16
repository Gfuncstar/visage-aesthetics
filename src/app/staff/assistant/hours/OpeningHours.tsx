'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Clock, LogOut } from 'lucide-react'
import { notifyDone } from '@/lib/staff-toast'

type Hours = { weekday: number; is_open: boolean; open_min: number; close_min: number }

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
  const [hours, setHours] = useState<Hours[]>([])
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
        // Ensure all 7 days exist, defaulting any missing to closed 10–5.
        const byDay = new Map<number, Hours>((d.hours ?? []).map((h: Hours) => [h.weekday, h]))
        setHours(ORDER.map((wd) => byDay.get(wd) ?? { weekday: wd, is_open: false, open_min: 600, close_min: 1020 }))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  function edit(weekday: number, patch: Partial<Hours>) {
    setHours((prev) => prev.map((h) => (h.weekday === weekday ? { ...h, ...patch } : h)))
    setSavedDay(null)
    setError(null)
  }

  async function save(day: Hours) {
    if (day.is_open && day.close_min <= day.open_min) {
      setError(`${DAY_NAME[day.weekday]}: the closing time must be after the opening time.`)
      return
    }
    setSavingDay(day.weekday)
    setError(null)
    try {
      const res = await fetch('/api/staff/assistant/business-hours', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekday: day.weekday, is_open: day.is_open, open_min: day.open_min, close_min: day.close_min }),
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
              Set the days and times you are open. Opening a day or widening its hours releases those slots straight away,
              so clients and the front desk can book into them. Closing a day hides its slots from new bookings.
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
            {hours.map((day) => {
              const saving = savingDay === day.weekday
              const saved = savedDay === day.weekday
              return (
                <div key={day.weekday} className="border border-line/40 bg-cream-soft rounded-sm px-4 py-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-[7.5rem]">
                      <Clock size={15} strokeWidth={1.75} className={day.is_open ? 'text-gold-deep' : 'text-stone/50'} />
                      <span className="text-charcoal font-medium">{DAY_NAME[day.weekday]}</span>
                    </div>

                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={day.is_open}
                        onChange={(e) => edit(day.weekday, { is_open: e.target.checked })}
                        className="accent-gold-deep w-4 h-4"
                      />
                      <span className="text-sm text-ink-soft">{day.is_open ? 'Open' : 'Closed'}</span>
                    </label>

                    {day.is_open ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={toTime(day.open_min)}
                          onChange={(e) => edit(day.weekday, { open_min: toMin(e.target.value) })}
                          className="bg-cream border border-line rounded-sm px-2.5 py-2 text-sm"
                        />
                        <span className="text-ink-soft text-sm">to</span>
                        <input
                          type="time"
                          value={toTime(day.close_min)}
                          onChange={(e) => edit(day.weekday, { close_min: toMin(e.target.value) })}
                          className="bg-cream border border-line rounded-sm px-2.5 py-2 text-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-stone/70 flex-1">No appointments this day</span>
                    )}

                    <button
                      onClick={() => void save(day)}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-1.5 bg-charcoal text-cream text-sm rounded-sm px-4 py-2 hover:bg-gold-deep transition-colors disabled:opacity-50 shrink-0"
                    >
                      {saved ? <Check size={14} /> : null}
                      {saving ? 'Saving…' : saved ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              )
            })}
            {error && <p className="text-sm text-clay">{error}</p>}
            <p className="text-xs text-ink-soft pt-2 leading-relaxed">
              Tip: you can also just tell the assistant, e.g. &ldquo;open Thursdays 9 to 5&rdquo; or &ldquo;close Saturdays&rdquo;.
              A one-off appointment outside these hours can still be added from the front desk &ldquo;New booking&rdquo;.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
