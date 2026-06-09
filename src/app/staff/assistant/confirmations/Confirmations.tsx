'use client'

import { useState } from 'react'
import { Check, MailQuestion, Send } from 'lucide-react'

type Item = { id: string; name: string; service: string; startsAt: string; phone: string | null; email: string | null }

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

export default function Confirmations({ items }: { items: Item[] }) {
  // Locally hide rows once they've been confirmed, and remember per-row status.
  const [busy, setBusy] = useState<string | null>(null)
  const [done, setDone] = useState<Record<string, string>>({})
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({})
  const [err, setErr] = useState<Record<string, string>>({})

  const remaining = items.filter((i) => !confirmed[i.id])

  if (items.length === 0 || remaining.length === 0) {
    return (
      <div className="flex items-center gap-3 border border-sage/40 bg-sage/10 rounded-sm px-5 py-5">
        <span className="inline-flex w-9 h-9 rounded-full bg-sage/20 text-sage items-center justify-center shrink-0">
          <Check size={16} strokeWidth={2} />
        </span>
        <div>
          <p className="text-charcoal font-medium leading-snug">Everyone’s confirmed.</p>
          <p className="text-sm text-ink-soft leading-snug mt-0.5">
            No one booked in the next day or so is still waiting to confirm.
          </p>
        </div>
      </div>
    )
  }

  async function act(id: string, action: 'remind' | 'confirm') {
    setBusy(`${id}:${action}`)
    setErr((p) => ({ ...p, [id]: '' }))
    try {
      const res = await fetch('/api/staff/assistant/confirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id, action }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr((p) => ({ ...p, [id]: data.error || 'Could not do that.' }))
        return
      }
      if (action === 'confirm') {
        setConfirmed((p) => ({ ...p, [id]: true }))
      } else {
        setDone((p) => ({ ...p, [id]: data.channel === 'sms' ? 'Text sent' : 'Email sent' }))
      }
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
                ) : (
                  <button
                    type="button"
                    onClick={() => act(m.id, 'remind')}
                    disabled={busy === `${m.id}:remind`}
                    className="inline-flex items-center gap-1.5 text-xs rounded-sm px-3 py-2 min-h-[40px] border border-line/50 text-charcoal hover:border-gold transition-colors disabled:opacity-50"
                  >
                    <Send size={13} strokeWidth={1.75} />
                    {busy === `${m.id}:remind` ? 'Sending…' : 'Message again'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => act(m.id, 'confirm')}
                  disabled={busy === `${m.id}:confirm`}
                  className="inline-flex items-center gap-1.5 text-xs rounded-sm px-3 py-2 min-h-[40px] border border-sage/50 text-sage hover:bg-sage/10 transition-colors disabled:opacity-50"
                >
                  <Check size={13} strokeWidth={2} />
                  {busy === `${m.id}:confirm` ? 'Saving…' : 'Mark confirmed'}
                </button>
              </div>
            </div>
            {err[m.id] && <p className="text-sm text-clay mt-2">{err[m.id]}</p>}
          </div>
        )
      })}

      <p className="flex items-center gap-2 text-xs text-stone pt-2">
        <MailQuestion size={13} strokeWidth={1.75} />
        “Message again” re-sends the confirm email (or a text if there’s no email). “Mark confirmed” clears them if
        they’ve told you another way.
      </p>
    </div>
  )
}
