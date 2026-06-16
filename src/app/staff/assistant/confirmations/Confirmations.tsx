'use client'

import { useEffect, useState } from 'react'
import { Check, MailQuestion, Send, X } from 'lucide-react'
import { notifyDone } from '@/lib/staff-toast'

type Item = { id: string; name: string; service: string; startsAt: string; phone: string | null; email: string | null }

// Day-scoped dismissals: an x'd-off row stays hidden for the rest of today (e.g.
// the client confirmed by phone or it was handled another way), then the list
// resets the next morning.
const DISMISS_KEY = 'staff-dismissed-confirmations'
function todayKey(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date())
}
function readDismissed(): Set<string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(DISMISS_KEY) ?? 'null') as { date: string; ids: string[] } | null
    if (!parsed || parsed.date !== todayKey() || !Array.isArray(parsed.ids)) return new Set()
    return new Set(parsed.ids)
  } catch {
    return new Set()
  }
}
function writeDismissed(ids: Set<string>) {
  try {
    localStorage.setItem(DISMISS_KEY, JSON.stringify({ date: todayKey(), ids: [...ids] }))
  } catch { /* localStorage unavailable */ }
}

function whenLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'there'
}

export default function Confirmations({ items }: { items: Item[] }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [done, setDone] = useState<Record<string, string>>({})
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({})
  const [err, setErr] = useState<Record<string, string>>({})
  const [previewing, setPreviewing] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setDismissed(readDismissed())
    setMounted(true)
  }, [])

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev)
      next.add(id)
      writeDismissed(next)
      return next
    })
  }

  const remaining = items.filter((i) => !confirmed[i.id] && !(mounted && dismissed.has(i.id)))

  if (items.length === 0 || remaining.length === 0) {
    return (
      <div className="flex items-center gap-3 border border-sage/40 bg-sage/10 rounded-sm px-5 py-5">
        <span className="inline-flex w-9 h-9 rounded-full bg-sage/20 text-sage items-center justify-center shrink-0">
          <Check size={16} strokeWidth={2} />
        </span>
        <div>
          <p className="text-charcoal font-medium leading-snug">Everyone&apos;s confirmed.</p>
          <p className="text-sm text-ink-soft leading-snug mt-0.5">
            No one booked in the next day or so is still waiting to confirm.
          </p>
        </div>
      </div>
    )
  }

  async function sendReminder(id: string) {
    setPreviewing(null)
    setBusy(`${id}:remind`)
    setErr((p) => ({ ...p, [id]: '' }))
    try {
      const res = await fetch('/api/staff/assistant/confirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id, action: 'remind' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr((p) => ({ ...p, [id]: data.error || 'Could not do that.' }))
        return
      }
      const label = data.channel === 'sms' ? 'Text sent' : 'Email sent'
      setDone((p) => ({ ...p, [id]: label }))
      notifyDone(label)
    } catch {
      setErr((p) => ({ ...p, [id]: 'Network error.' }))
    } finally {
      setBusy(null)
    }
  }

  async function markConfirmed(id: string) {
    setBusy(`${id}:confirm`)
    setErr((p) => ({ ...p, [id]: '' }))
    try {
      const res = await fetch('/api/staff/assistant/confirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id, action: 'confirm' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr((p) => ({ ...p, [id]: data.error || 'Could not do that.' }))
        return
      }
      setConfirmed((p) => ({ ...p, [id]: true }))
    } catch {
      setErr((p) => ({ ...p, [id]: 'Network error.' }))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-2">
      {remaining.map((m) => {
        const sent = done[m.id]
        const isPreview = previewing === m.id
        const channel = m.email ? 'email' : m.phone ? 'text' : null
        const contact = m.email || m.phone
        return (
          <div key={m.id} className="border border-line/40 bg-cream rounded-sm px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm text-charcoal truncate">{m.name}</div>
                <div className="text-xs text-stone truncate">
                  {m.service} · {whenLabel(m.startsAt)}
                </div>
                <div className="text-xs text-stone/80 truncate mt-0.5">
                  {m.email || m.phone || 'No contact on file'}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {sent ? (
                  <span className="text-xs text-sage inline-flex items-center gap-1.5">
                    <Check size={13} strokeWidth={2} /> {sent}
                  </span>
                ) : isPreview ? (
                  <>
                    <button
                      type="button"
                      onClick={() => sendReminder(m.id)}
                      disabled={busy === `${m.id}:remind`}
                      className="inline-flex items-center gap-1.5 text-xs rounded-sm px-3 py-2 min-h-[40px] border border-gold bg-gold/10 text-charcoal hover:bg-gold/20 transition-colors disabled:opacity-50"
                    >
                      <Send size={13} strokeWidth={1.75} />
                      {busy === `${m.id}:remind` ? 'Sending…' : 'Send now'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewing(null)}
                      className="text-stone hover:text-clay"
                      aria-label="Cancel"
                    >
                      <X size={15} strokeWidth={1.75} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setPreviewing(m.id); setErr((p) => ({ ...p, [m.id]: '' })) }}
                    disabled={!channel || busy !== null}
                    className="inline-flex items-center gap-1.5 text-xs rounded-sm px-3 py-2 min-h-[40px] border border-line/50 text-charcoal hover:border-gold transition-colors disabled:opacity-50"
                  >
                    <Send size={13} strokeWidth={1.75} />
                    Message again
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => markConfirmed(m.id)}
                  disabled={busy === `${m.id}:confirm`}
                  className="inline-flex items-center gap-1.5 text-xs rounded-sm px-3 py-2 min-h-[40px] border border-sage/50 text-sage hover:bg-sage/10 transition-colors disabled:opacity-50"
                >
                  <Check size={13} strokeWidth={2} />
                  {busy === `${m.id}:confirm` ? 'Saving…' : 'Mark confirmed'}
                </button>
                <button
                  type="button"
                  onClick={() => dismiss(m.id)}
                  title="Dismiss for today — handled another way"
                  aria-label={`Dismiss ${m.name}`}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-line/40 text-ink-soft hover:border-clay hover:text-clay transition-colors"
                >
                  <X size={14} strokeWidth={1.75} />
                </button>
              </div>
            </div>

            {isPreview && channel && contact && (
              <div className="mt-2.5 pt-2.5 border-t border-line/30 text-xs text-stone leading-relaxed">
                Will send {firstName(m.name)} a confirmation reminder for their {m.service} on {whenLabel(m.startsAt)}{' '}
                by {channel} to <span className="text-charcoal">{contact}</span>.
              </div>
            )}
            {err[m.id] && <p className="text-sm text-clay mt-2">{err[m.id]}</p>}
          </div>
        )
      })}

      <p className="flex items-center gap-2 text-xs text-stone pt-2">
        <MailQuestion size={13} strokeWidth={1.75} />
        &ldquo;Message again&rdquo; re-sends the confirm email (or a text if there&apos;s no email). &ldquo;Mark confirmed&rdquo; clears them if
        they&apos;ve told you another way. The &times; just hides a row for today without recording a confirmation.
      </p>
    </div>
  )
}
