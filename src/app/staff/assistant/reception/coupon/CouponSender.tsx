'use client'

import { useState } from 'react'
import { Check, Send } from 'lucide-react'

const inputClass =
  'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]'

type Kind = '£' | '%'

function amountLabel(amount: number, kind: Kind): string {
  if (!Number.isFinite(amount) || amount <= 0) return kind === '%' ? '—% off' : '£— off'
  return kind === '%' ? `${amount}% off` : `£${amount} off`
}

export default function CouponSender() {
  const [code, setCode] = useState('VISAGE20')
  const [amount, setAmount] = useState(20)
  const [kind, setKind] = useState<Kind>('£')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const label = amountLabel(amount, kind)
  const previewCode = (code.trim() || 'YOUR-CODE').toUpperCase()

  async function send() {
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/staff/assistant/reception/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, amount, kind, clientName, clientEmail }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setResult({ ok: false, message: data.error || 'Could not send the coupon.' }); return }
      setResult({ ok: true, message: data.message || 'Coupon sent.' })
    } catch {
      setResult({ ok: false, message: 'Network error while sending.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Editable details */}
      <div className="space-y-4">
        <div>
          <label htmlFor="code" className="text-eyebrow text-ink-soft mb-2 block">Coupon code</label>
          <input
            id="code"
            className={`${inputClass} uppercase tracking-[0.12em]`}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoComplete="off"
            placeholder="VISAGE20"
          />
        </div>

        <div>
          <span className="text-eyebrow text-ink-soft mb-2 block">Discount amount</span>
          <div className="flex gap-2">
            <div className="inline-flex rounded-sm border border-line/50 bg-cream-soft p-0.5 shrink-0">
              {(['£', '%'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`text-sm rounded-sm px-4 min-h-[44px] transition-colors ${kind === k ? 'bg-gold text-charcoal' : 'text-ink-soft'}`}
                >
                  {k === '£' ? '£ off' : '% off'}
                </button>
              ))}
            </div>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={kind === '%' ? 100 : 100000}
              className={inputClass}
              value={Number.isFinite(amount) ? amount : ''}
              onChange={(e) => setAmount(Math.round(Number(e.target.value)))}
            />
          </div>
        </div>

        <div>
          <label htmlFor="cname" className="text-eyebrow text-ink-soft mb-2 block">Client name (optional)</label>
          <input id="cname" className={inputClass} value={clientName} onChange={(e) => setClientName(e.target.value)} autoComplete="off" placeholder="For a personal greeting" />
        </div>

        <div>
          <label htmlFor="cemail" className="text-eyebrow text-ink-soft mb-2 block">Send to</label>
          <input id="cemail" type="email" className={inputClass} value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} autoComplete="off" placeholder="client@email.com" />
        </div>

        <button
          type="button"
          onClick={send}
          disabled={sending || !code.trim() || !(amount > 0) || !clientEmail.trim()}
          className="btn btn-primary btn-block disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-2">
            <Send size={15} strokeWidth={1.75} />
            {sending ? 'Sending…' : 'Send coupon'}
          </span>
        </button>

        {result && (
          <div className={`border rounded-sm px-4 py-3 text-sm flex items-start gap-2 ${result.ok ? 'border-sage/50 bg-sage/10' : 'border-clay/50 bg-clay/10'}`}>
            {result.ok && <Check size={16} strokeWidth={1.75} className="text-sage mt-0.5 shrink-0" />}
            <span className="text-charcoal">{result.message}</span>
          </div>
        )}
      </div>

      {/* Live preview of the voucher as it lands */}
      <div>
        <span className="text-eyebrow text-ink-soft mb-2 block">Preview</span>
        <div className="border border-gold/70 bg-cream-soft rounded-sm px-6 py-8 text-center">
          <div className="eyebrow text-stone mb-2">A gift for you</div>
          <div className="font-display italic text-charcoal leading-none" style={{ fontSize: 44 }}>{label}</div>
          <div className="text-xs text-ink-soft mt-2">your next treatment at Visage Aesthetics</div>
          <div className="inline-block border border-dashed border-gold bg-cream rounded-sm px-6 py-3 mt-6">
            <div className="text-[10px] tracking-[0.24em] uppercase text-stone mb-1">Your code</div>
            <div className="text-charcoal font-semibold tracking-[0.22em]" style={{ fontSize: 20 }}>{previewCode}</div>
          </div>
        </div>
        <p className="text-xs text-ink-soft mt-3 leading-snug">
          Sent on-brand with the clinic header, Bernadette’s sign-off and footer.
        </p>
      </div>
    </div>
  )
}
