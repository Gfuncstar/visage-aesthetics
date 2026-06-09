'use client'

import { useState } from 'react'
import { Check, Send, ShieldAlert } from 'lucide-react'
import { notifyDone } from '@/lib/staff-toast'

type Missing = { name: string; service: string; date: string }
type FormOption = { id: string; name: string }

const shortName = (name: string) => name.replace(/ Consent Form$/i, '').trim()

function dayLabel(d: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', day: 'numeric', month: 'short' })
    .format(new Date(`${d}T12:00:00Z`))
}

const inputClass =
  'w-full bg-cream border border-line/40 rounded-sm px-3 py-2.5 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[44px]'

// The clients who are booked in soon but have no consent form on file and none
// sent — so staff can see exactly who, and send each one their form on the spot.
export default function ConsentMissing({ missing, forms }: { missing: Missing[]; forms: FormOption[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [formId, setFormId] = useState(forms[0]?.id ?? '')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState<Record<string, string>>({})

  if (missing.length === 0) return null

  async function send(key: string, name: string) {
    if (!email.trim() || !formId) return
    setSending(true)
    setErr(null)
    try {
      const res = await fetch('/api/staff/assistant/consent/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, clientName: name, clientEmail: email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setErr(data.error || 'Could not send the form.'); return }
      setDone((prev) => ({ ...prev, [key]: `Sent to ${email}` }))
      setOpenKey(null)
      setEmail('')
      notifyDone(`Consent form sent to ${email}`)
    } catch {
      setErr('Network error while sending.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="border border-clay/40 bg-clay/5 rounded-sm p-5 mb-10">
      <div className="flex items-center gap-2 mb-1">
        <ShieldAlert size={16} strokeWidth={1.75} className="text-clay" />
        <span className="text-eyebrow text-clay">No consent on file · booked in the next 2 weeks</span>
      </div>
      <p className="text-sm text-ink-soft mb-4">
        {missing.length} {missing.length === 1 ? 'client has' : 'clients have'} an upcoming appointment with no
        consent form completed or sent. Send each one their form before they come in.
      </p>

      <div className="space-y-2">
        {missing.map((m) => {
          const key = `${m.name}-${m.date}`
          const sent = done[key]
          const open = openKey === key
          return (
            <div key={key} className="border border-line/40 bg-cream rounded-sm">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm text-charcoal truncate">{m.name}</div>
                  <div className="text-xs text-stone truncate">{m.service} · {dayLabel(m.date)}</div>
                </div>
                {sent ? (
                  <span className="text-xs text-sage inline-flex items-center gap-1.5 shrink-0">
                    <Check size={13} strokeWidth={2} /> {sent}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setOpenKey(open ? null : key); setEmail(''); setErr(null) }}
                    className={`inline-flex items-center gap-1.5 text-xs rounded-sm px-3 py-2 min-h-[40px] border shrink-0 transition-colors ${open ? 'border-gold bg-gold/10 text-charcoal' : 'border-line/50 text-charcoal hover:border-gold'}`}
                  >
                    <Send size={13} strokeWidth={1.75} /> Send form
                  </button>
                )}
              </div>

              {open && !sent && (
                <div className="border-t border-line/30 px-4 py-3 space-y-3">
                  <div>
                    <label className="text-eyebrow text-ink-soft mb-1.5 block">Form</label>
                    <select value={formId} onChange={(e) => setFormId(e.target.value)} className={inputClass}>
                      {forms.map((f) => <option key={f.id} value={f.id}>{shortName(f.name)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-eyebrow text-ink-soft mb-1.5 block">Client email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="off" placeholder="name@email.com" />
                  </div>
                  <button
                    type="button"
                    onClick={() => send(key, m.name)}
                    disabled={sending || !email.trim() || !formId}
                    className="btn btn-primary btn-block disabled:opacity-50"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Send size={15} strokeWidth={1.75} />
                      {sending ? 'Sending…' : `Send to ${m.name.split(/\s+/)[0]}`}
                    </span>
                  </button>
                  {err && <p className="text-sm text-clay">{err}</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
