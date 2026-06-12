'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, ChevronDown, Send, ShieldCheck } from 'lucide-react'
import { consentFormForService } from '@/lib/consent/forms'
import { notifyDone } from '@/lib/staff-toast'

const TZ = 'Europe/London'
function todayStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date())
}
function toLocalMin(iso: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date(iso))
  return Number(parts.find((p) => p.type === 'hour')?.value ?? '0') * 60 + Number(parts.find((p) => p.type === 'minute')?.value ?? '0')
}

type DayBooking = { service_name: string; service_slug?: string | null; status: string; starts_at: string; ends_at?: string }
type Item = { bookingId: string; clientName: string; clientEmail: string | null; serviceName: string; formId: string; formName: string; sent: boolean }
type Data = { percent: number; total: number; compliant: number; outstanding: Item[] }

// The day's compliance wash-up: one percentage (consent forms completed or taken
// in clinic for the treatments that need them). Tap it to see what's outstanding,
// then send the form, or mark it done if it was taken on paper in clinic. Shown
// once the clinic day is done, alongside the takings.
export default function DayComplianceCard({ day, bookings, nowMin }: { day: string; bookings: DayBooking[]; nowMin: number }) {
  const live = bookings.filter((b) => b.status !== 'cancelled')
  const needsAny = live.some((b) => consentFormForService(b.service_slug ?? null, b.service_name))

  const today = todayStr()
  let complete = day < today
  if (day === today) {
    const ends = live.map((b) => (b.ends_at ? toLocalMin(b.ends_at) : toLocalMin(b.starts_at) + 60))
    complete = ends.length > 0 && nowMin >= Math.max(...ends)
  }

  const [data, setData] = useState<Data | null>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/staff/assistant/compliance/day?date=${day}`)
      if (res.ok) setData(await res.json())
    } catch {
      /* leave as-is */
    }
  }, [day])

  useEffect(() => {
    if (complete && needsAny) void fetchData()
  }, [complete, needsAny, fetchData])

  if (!complete || !needsAny || !data || data.total === 0) return null

  const pct = data.percent
  const pctColor = pct >= 100 ? 'text-sage' : pct >= 80 ? 'text-gold-deep' : 'text-clay'
  const borderTone = pct >= 100 ? 'border-sage/40 bg-sage/[0.06]' : 'border-gold/45 bg-gold/[0.06]'
  const outstanding = data.outstanding

  async function waive(item: Item) {
    setBusy(item.bookingId)
    try {
      await fetch('/api/staff/assistant/consent/waive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: item.clientName }),
      })
      notifyDone(`${item.clientName} — consent marked done`)
      await fetchData()
    } catch {
      /* */
    } finally {
      setBusy(null)
    }
  }

  async function send(item: Item) {
    if (!item.clientEmail) return
    setBusy(item.bookingId)
    try {
      const res = await fetch('/api/staff/assistant/consent/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: item.formId, clientName: item.clientName, clientEmail: item.clientEmail, bookingId: item.bookingId }),
      })
      if (res.ok) {
        notifyDone(`Consent form sent to ${item.clientName}`)
        await fetchData()
      }
    } catch {
      /* */
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className={`mt-2 rounded-sm border ${borderTone}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3"
        disabled={outstanding.length === 0}
      >
        <span className="text-eyebrow text-stone inline-flex items-center gap-2">
          <ShieldCheck size={13} strokeWidth={1.75} /> Compliance
        </span>
        <span className="inline-flex items-center gap-2">
          <span className={`font-display italic text-lg ${pctColor}`}>{pct}%</span>
          {outstanding.length > 0 && <ChevronDown size={15} className={`text-stone transition-transform ${open ? 'rotate-180' : ''}`} />}
        </span>
      </button>

      {open && outstanding.length > 0 && (
        <div className="px-4 pb-3 pt-1 space-y-2 border-t border-line/30">
          {outstanding.map((item) => (
            <div key={item.bookingId} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm text-charcoal truncate capitalize">{item.clientName}</div>
                <div className="text-xs text-stone">
                  {item.formName.replace(/ Consent Form$/i, '').trim()} consent {item.sent ? 'sent — not signed yet' : 'not on file'}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {item.clientEmail && (
                  <button onClick={() => send(item)} disabled={busy === item.bookingId} className="text-xs inline-flex items-center gap-1 border border-line/60 rounded-sm px-2 py-1 text-charcoal hover:border-gold/60 disabled:opacity-50">
                    <Send size={11} strokeWidth={1.75} /> {item.sent ? 'Resend' : 'Send'}
                  </button>
                )}
                <button onClick={() => waive(item)} disabled={busy === item.bookingId} title="Mark done — taken in clinic (e.g. on paper)" className="text-xs inline-flex items-center gap-1 border border-sage/50 rounded-sm px-2 py-1 text-sage hover:bg-sage/10 disabled:opacity-50">
                  <Check size={11} strokeWidth={2} /> Done
                </button>
              </div>
            </div>
          ))}
          <p className="text-[11px] text-stone/80 leading-snug pt-0.5">&ldquo;Done&rdquo; marks consent as taken in clinic (e.g. a paper form) so it clears here.</p>
        </div>
      )}
    </div>
  )
}
