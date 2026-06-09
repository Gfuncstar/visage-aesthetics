'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, Eye, FileText, Send, X } from 'lucide-react'
import { notifyDone } from '@/lib/staff-toast'

const inputClass =
  'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]'

type FormOption = { id: string; name: string }

const shortName = (name: string) => name.replace(/ Consent Form$/i, '').trim()

// One card per consent form, with everything staff need in one place:
//  · Send  — email a named client their own tracked link (shows in Outstanding
//            below until completed); falls back to a copyable link if email fails.
//  · View  — read-only preview of the form as the client sees it.
//  · Link  — copy a generic link to paste anywhere (untracked).
export default function ConsentForms({ forms }: { forms: FormOption[] }) {
  const [active, setActive] = useState<FormOption | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string; link?: string } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function openSend(form: FormOption) {
    setActive((cur) => (cur?.id === form.id ? null : form))
    setName('')
    setEmail('')
    setResult(null)
  }

  async function copyLink(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 2000)
    } catch {
      /* clipboard unavailable */
    }
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
      setResult({ ok: true, message: `Sent to ${email}.`, link: data.link })
      setName('')
      setEmail('')
      notifyDone(`Consent form sent to ${email}`)
    } catch {
      setResult({ ok: false, message: 'Network error while sending.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {forms.map((f) => {
        const genericLink = typeof window !== 'undefined' ? `${window.location.origin}/consent/form/${f.id}` : ''
        const isActive = active?.id === f.id
        return (
          <div
            key={f.id}
            className={`bg-cream-soft border rounded-sm p-4 sm:p-5 flex flex-col transition-colors ${isActive ? 'border-gold' : 'border-line/40'}`}
          >
            <div className="inline-flex w-10 h-10 rounded-full bg-charcoal text-cream items-center justify-center mb-3">
              <FileText size={16} strokeWidth={1.75} />
            </div>
            <h3 className="font-display italic text-lg text-charcoal leading-tight">{shortName(f.name)}</h3>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openSend(f)}
                className={`inline-flex items-center gap-1.5 text-xs rounded-sm px-3 py-2 transition-colors min-h-[40px] border ${
                  isActive ? 'border-gold bg-gold/10 text-charcoal' : 'border-line/50 text-charcoal hover:border-gold'
                }`}
              >
                <Send size={14} strokeWidth={1.75} /> Send
              </button>
              <Link
                href={`/staff/assistant/consent/preview/${f.id}`}
                className="inline-flex items-center gap-1.5 text-xs text-charcoal border border-line/50 hover:border-gold rounded-sm px-3 py-2 transition-colors min-h-[40px]"
              >
                <Eye size={14} strokeWidth={1.75} /> View
              </Link>
              <button
                type="button"
                onClick={() => copyLink(genericLink, f.id)}
                className="inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-gold-deep rounded-sm px-3 py-2 transition-colors min-h-[40px]"
              >
                {copiedId === f.id ? (
                  <>
                    <Check size={14} strokeWidth={2} className="text-sage" /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} strokeWidth={1.75} /> Link
                  </>
                )}
              </button>
            </div>

            {isActive && (
              <div className="mt-4 border-t border-line/30 pt-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-eyebrow text-gold-deep">Email this form to a client</span>
                  <button type="button" onClick={() => setActive(null)} className="text-stone hover:text-gold-deep" aria-label="Close">
                    <X size={15} strokeWidth={1.75} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label htmlFor={`cs-name-${f.id}`} className="text-eyebrow text-ink-soft mb-2 block">Client name</label>
                    <input id={`cs-name-${f.id}`} className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
                  </div>
                  <div>
                    <label htmlFor={`cs-email-${f.id}`} className="text-eyebrow text-ink-soft mb-2 block">Client email</label>
                    <input id={`cs-email-${f.id}`} type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
                  </div>
                  <button
                    type="button"
                    onClick={send}
                    disabled={sending || !name.trim() || !email.trim()}
                    className="btn btn-primary btn-block disabled:opacity-50"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Send size={15} strokeWidth={1.75} />
                      {sending ? 'Sending…' : 'Send form'}
                    </span>
                  </button>
                </div>
                {result && (
                  <div className={`mt-3 border rounded-sm px-4 py-3 text-sm ${result.ok ? 'border-sage/50 bg-sage/10' : 'border-gold/40 bg-gold/10'}`}>
                    <div className="flex items-start gap-2">
                      <Check size={16} strokeWidth={1.75} className={`mt-0.5 shrink-0 ${result.ok ? 'text-sage' : 'text-gold-deep'}`} />
                      <span className="text-charcoal">{result.message}</span>
                    </div>
                    {result.ok && result.link && (
                      <button
                        type="button"
                        onClick={() => copyLink(result.link as string, `sent-${f.id}`)}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-gold-deep"
                      >
                        {copiedId === `sent-${f.id}` ? (
                          <><Check size={13} strokeWidth={2} className="text-sage" /> Link copied</>
                        ) : (
                          <><Copy size={13} strokeWidth={1.75} /> Copy their link (if the email doesn&rsquo;t arrive)</>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
