'use client'

import { useState } from 'react'
import { CalendarClock, Check, Send, X } from 'lucide-react'
import { notifyDone } from '@/lib/staff-toast'

type Result = { sent: number; resent: number; alreadyDone: number; recentlySent: number; noEmail: string[] }

// One-click chase: email today's still-upcoming clients their consent form if
// they haven't completed it. Two-step (Send → confirm) because it emails real
// clients; the endpoint itself won't re-send a form already sent in the last
// hour, so an accidental double-tap is harmless.
export default function SendTodayConsent() {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function run() {
    setBusy(true)
    setErr(null)
    setResult(null)
    try {
      const res = await fetch('/api/staff/assistant/consent/send-today', { method: 'POST' })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr(d.error || "Could not send today's forms.")
        return
      }
      setResult(d as Result)
      const total = (d.sent ?? 0) + (d.resent ?? 0)
      notifyDone(total ? `Sent ${total} consent form${total === 1 ? '' : 's'}` : 'No forms needed sending')
    } catch {
      setErr('Network error — please try again.')
    } finally {
      setBusy(false)
      setConfirming(false)
    }
  }

  return (
    <div className="bg-cream-soft border border-line/40 rounded-sm p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="inline-flex w-10 h-10 rounded-full bg-charcoal text-cream items-center justify-center shrink-0">
          <CalendarClock size={16} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display italic text-lg text-charcoal leading-tight">Today&rsquo;s outstanding consent</h3>
          <p className="text-sm text-ink-soft mt-1 leading-relaxed">
            Email every client still coming in today their consent form if they haven&rsquo;t completed it. Anyone sent one in
            the last hour is skipped, so it&rsquo;s safe to use more than once.
          </p>

          {!confirming ? (
            <button type="button" onClick={() => { setConfirming(true); setResult(null); setErr(null) }} disabled={busy} className="btn btn-primary mt-4 disabled:opacity-50">
              <span className="inline-flex items-center gap-2"><Send size={15} strokeWidth={1.75} /> Send today&rsquo;s forms</span>
            </button>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-charcoal">Email today&rsquo;s clients now?</span>
              <button type="button" onClick={run} disabled={busy} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 40 }}>
                <span className="inline-flex items-center gap-2"><Send size={14} strokeWidth={1.75} /> {busy ? 'Sending…' : 'Yes, send now'}</span>
              </button>
              <button type="button" onClick={() => setConfirming(false)} disabled={busy} className="inline-flex items-center gap-1.5 text-sm text-stone hover:text-gold-deep rounded-sm px-3 transition-colors" style={{ minHeight: 40 }}>
                <X size={14} strokeWidth={1.75} /> Cancel
              </button>
            </div>
          )}

          {result && (
            <div className="mt-3 border border-sage/50 bg-sage/10 rounded-sm px-4 py-3 text-sm text-charcoal">
              <div className="flex items-start gap-2">
                <Check size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-sage" />
                <div>
                  <div>
                    {result.sent + result.resent > 0
                      ? `Sent ${result.sent} new and resent ${result.resent} form${result.sent + result.resent === 1 ? '' : 's'}.`
                      : 'Nothing to send — everyone today is already covered.'}
                  </div>
                  {(result.alreadyDone > 0 || result.recentlySent > 0) && (
                    <div className="text-ink-soft mt-0.5">
                      {result.alreadyDone > 0 && `${result.alreadyDone} already completed. `}
                      {result.recentlySent > 0 && `${result.recentlySent} were emailed within the last hour.`}
                    </div>
                  )}
                </div>
              </div>
              {result.noEmail.length > 0 && (
                <p className="mt-2 text-clay leading-snug">
                  No email on file, so couldn&rsquo;t be sent — chase by phone: {result.noEmail.join(', ')}
                </p>
              )}
            </div>
          )}
          {err && <p className="mt-3 text-sm text-clay">{err}</p>}
        </div>
      </div>
    </div>
  )
}
