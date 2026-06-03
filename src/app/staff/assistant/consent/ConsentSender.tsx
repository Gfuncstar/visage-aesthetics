'use client'

import { useState } from 'react'
import { Check, FileText, Send, X } from 'lucide-react'

const inputClass =
  'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]'

type FormOption = { id: string; name: string }

export default function ConsentSender({ forms }: { forms: FormOption[] }) {
  const [active, setActive] = useState<FormOption | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  function open(form: FormOption) {
    setActive(form)
    setName('')
    setEmail('')
    setResult(null)
  }

  async function send() {
    if (!active) return
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/staff/assistant/consent/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: active.id, clientName: name, clientEmail: email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setResult({ ok: false, message: data.error || 'Could not send the form.' })
        return
      }
      setResult({ ok: true, message: `Sent to ${email}.` })
      setName('')
      setEmail('')
    } catch {
      setResult({ ok: false, message: 'Network error while sending.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="font-display italic text-2xl text-charcoal">Send a form</h2>
      <p className="text-ink-soft mt-1 text-sm leading-relaxed">
        Send any consent form to a client outside the booking system, for example when it was not completed.
        They get a secure link, and it appears below once done.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
        {forms.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => open(f)}
            className={`group text-left bg-cream-soft border rounded-sm p-4 transition-colors flex flex-col ${
              active?.id === f.id ? 'border-gold bg-gold/10' : 'border-line/40 hover:border-gold'
            }`}
          >
            <span className="inline-flex w-9 h-9 rounded-full bg-charcoal text-cream items-center justify-center mb-3 group-hover:bg-gold-deep transition-colors">
              <FileText size={15} strokeWidth={1.75} />
            </span>
            <span className="text-sm text-charcoal leading-snug">{f.name.replace(/ Consent Form$/i, '')}</span>
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-5 border border-gold/40 bg-gold/5 rounded-sm p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="text-eyebrow text-gold-deep">Send: {active.name}</span>
            <button type="button" onClick={() => setActive(null)} className="text-stone hover:text-gold-deep" aria-label="Close">
              <X size={16} strokeWidth={1.75} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="cs-name" className="text-eyebrow text-ink-soft mb-2 block">Client name</label>
              <input id="cs-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
            </div>
            <div>
              <label htmlFor="cs-email" className="text-eyebrow text-ink-soft mb-2 block">Client email</label>
              <input id="cs-email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
            </div>
          </div>
          <div className="mt-4">
            <button type="button" onClick={send} disabled={sending || !name.trim() || !email.trim()} className="btn btn-primary disabled:opacity-50">
              <span className="inline-flex items-center gap-2">
                <Send size={15} strokeWidth={1.75} />
                {sending ? 'Sending…' : 'Send form'}
              </span>
            </button>
          </div>
          {result && (
            <div className={`mt-3 border rounded-sm px-4 py-3 text-sm flex items-start gap-3 ${result.ok ? 'border-sage/50 bg-sage/10' : 'border-gold/40 bg-gold/10'}`}>
              <Check size={16} strokeWidth={1.75} className="text-gold-deep mt-0.5 shrink-0" />
              <span>{result.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
