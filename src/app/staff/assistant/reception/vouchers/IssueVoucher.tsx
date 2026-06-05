'use client'

import { useState } from 'react'
import { Check, Send } from 'lucide-react'

const inputClass =
  'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]'

const gbp = (pence: number) => (Number.isInteger(pence / 100) ? `£${pence / 100}` : `£${(pence / 100).toFixed(2)}`)

export default function IssueVoucher() {
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [amount, setAmount] = useState(50)
  const [fromName, setFromName] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string; code?: string } | null>(null)

  const amountPence = Math.round(amount * 100)
  const valid = recipientName.trim() && recipientEmail.trim() && amount >= 1 && amount <= 1000

  async function send() {
    setBusy(true)
    setResult(null)
    try {
      const res = await fetch('/api/staff/assistant/vouchers/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientName, recipientEmail, amountPence, message, fromName }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setResult({ ok: false, message: data.error || 'Could not send the voucher.' }); return }
      setResult({ ok: true, message: data.message || 'Voucher sent.', code: data.code })
      setRecipientName(''); setRecipientEmail(''); setMessage('')
    } catch {
      setResult({ ok: false, message: 'Network error while sending.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="vrn" className="text-eyebrow text-ink-soft mb-2 block">Recipient&rsquo;s name</label>
            <input id="vrn" className={inputClass} value={recipientName} onChange={(e) => setRecipientName(e.target.value)} autoComplete="off" />
          </div>
          <div>
            <label htmlFor="vre" className="text-eyebrow text-ink-soft mb-2 block">Recipient&rsquo;s email</label>
            <input id="vre" type="email" className={inputClass} value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} autoComplete="off" />
          </div>
        </div>

        <div>
          <label htmlFor="vamt" className="text-eyebrow text-ink-soft mb-2 block">Value</label>
          <div className="flex items-center gap-2 max-w-[200px]">
            <span className="text-charcoal text-lg">£</span>
            <input id="vamt" type="number" inputMode="numeric" min={1} max={1000} className={inputClass} value={Number.isFinite(amount) ? amount : ''} onChange={(e) => setAmount(Math.round(Number(e.target.value)))} />
          </div>
        </div>

        <div>
          <label htmlFor="vfrom" className="text-eyebrow text-ink-soft mb-2 block">From (optional)</label>
          <input id="vfrom" className={inputClass} value={fromName} onChange={(e) => setFromName(e.target.value)} autoComplete="off" placeholder="e.g. Bernadette, or leave blank" />
        </div>

        <div>
          <label htmlFor="vmsg" className="text-eyebrow text-ink-soft mb-2 block">Message (optional)</label>
          <textarea id="vmsg" rows={2} maxLength={600} className={inputClass} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="With our compliments — enjoy x" />
        </div>

        <button type="button" onClick={send} disabled={busy || !valid} className="btn btn-primary btn-block disabled:opacity-50">
          <span className="inline-flex items-center gap-2"><Send size={15} strokeWidth={1.75} /> {busy ? 'Sending…' : `Send ${gbp(amountPence)} voucher`}</span>
        </button>

        {result && (
          <div className={`border rounded-sm px-4 py-3 text-sm ${result.ok ? 'border-sage/50 bg-sage/10' : 'border-clay/50 bg-clay/10'}`}>
            <div className="flex items-start gap-2">
              {result.ok && <Check size={16} strokeWidth={1.75} className="text-sage mt-0.5 shrink-0" />}
              <span className="text-charcoal">{result.message}</span>
            </div>
            {result.ok && result.code && <div className="mt-1.5 text-xs text-stone">Code: <span className="tracking-[0.18em] text-charcoal">{result.code}</span></div>}
          </div>
        )}
      </div>

      <div>
        <span className="text-eyebrow text-ink-soft mb-2 block">Preview</span>
        <div className="border border-gold/70 bg-cream-soft rounded-sm px-6 py-8 text-center">
          <div className="eyebrow text-stone mb-2">Gift voucher</div>
          <div className="font-display italic text-charcoal leading-none" style={{ fontSize: 46 }}>{gbp(amountPence)}</div>
          <div className="text-xs text-ink-soft mt-2">to spend at Visage Aesthetics</div>
          {fromName.trim() && <div className="text-xs text-ink-soft mt-1">A gift from {fromName.trim()}</div>}
          <div className="inline-block border border-dashed border-gold bg-cream rounded-sm px-6 py-3 mt-6">
            <div className="text-[10px] tracking-[0.24em] uppercase text-stone mb-1">Voucher code</div>
            <div className="text-charcoal font-semibold tracking-[0.22em]" style={{ fontSize: 18 }}>GIFT-XXXX-XXXX</div>
          </div>
        </div>
        <p className="text-xs text-ink-soft mt-3 leading-snug">A real code is generated and emailed on send. Valid 12 months, usable over more than one visit.</p>
      </div>
    </div>
  )
}
