'use client'

import { useEffect, useState } from 'react'
import { Check, Send, X } from 'lucide-react'
import { consentFormForService } from '@/lib/consent/forms'

type Status = { completed: boolean; completedAt: string | null; sent: boolean; sentAt: string | null }

function shortDate(value: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', timeZone: 'Europe/London' }).format(d)
}

// Shows whether the consent form for this booking's treatment has been filled
// in — completed, sent-but-not-completed, or nothing on file — and lets staff
// send it if it hasn't been. Renders nothing for treatments that need no form
// (e.g. a consultation).
export default function ConsentStatus({
  clientName,
  serviceName,
  serviceSlug,
  bookingId,
  clientEmail,
}: {
  clientName: string
  serviceName: string | null
  serviceSlug?: string | null
  bookingId?: string | null
  clientEmail?: string | null
}) {
  const form = consentFormForService(serviceSlug ?? null, serviceName ?? null)
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!form) {
      setLoading(false)
      return
    }
    let cancel = false
    fetch(`/api/staff/assistant/consent/status?name=${encodeURIComponent(clientName)}&formId=${form.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancel && d) setStatus(d)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancel) setLoading(false)
      })
    return () => {
      cancel = true
    }
  }, [clientName, form])

  if (!form) return null

  const label = form.name.replace(/ Consent Form$/i, '').trim()

  async function send() {
    if (!form || !clientEmail) return
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch('/api/staff/assistant/consent/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: form.id, clientName, clientEmail, bookingId: bookingId ?? null }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErr(d.error || 'Could not send the consent form.')
        return
      }
      setStatus((s) => ({ completed: s?.completed ?? false, completedAt: s?.completedAt ?? null, sent: true, sentAt: new Date().toISOString() }))
    } catch {
      setErr('Network error — please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border-t border-line/40 pt-3.5">
      {loading ? (
        <span className="text-xs text-stone">Checking consent…</span>
      ) : status?.completed ? (
        <span className="inline-flex items-center gap-2 text-sm font-medium text-sage">
          <Check size={15} strokeWidth={2.5} className="shrink-0" />
          {label} consent completed{status.completedAt ? ` · ${shortDate(status.completedAt)}` : ''}
        </span>
      ) : (
        <div className="space-y-2">
          {status?.sent ? (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-gold-deep">
              <span className="w-2.5 h-2.5 rounded-full bg-gold shrink-0" />
              {label} consent sent — not filled in yet
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-clay">
              <X size={15} strokeWidth={2.5} className="shrink-0" />
              No {label} consent on file
            </span>
          )}
          {clientEmail ? (
            <button onClick={send} disabled={busy} className="btn btn-secondary disabled:opacity-50" style={{ minHeight: 40 }}>
              <span className="inline-flex items-center gap-2">
                <Send size={14} strokeWidth={1.75} /> {busy ? 'Sending…' : status?.sent ? 'Resend consent form' : 'Send consent form'}
              </span>
            </button>
          ) : (
            <p className="text-xs text-stone leading-snug">Add an email to send the {label} consent form.</p>
          )}
          {err && <p className="text-xs text-clay">{err}</p>}
        </div>
      )}
    </div>
  )
}
