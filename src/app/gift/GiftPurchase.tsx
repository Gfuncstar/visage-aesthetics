'use client'

import { useState } from 'react'

const inputClass =
  'w-full bg-cream-soft border border-line/50 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]'

const PRESETS = [50, 100, 150, 200]

export default function GiftPurchase() {
  const [amount, setAmount] = useState(100)
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const valid = amount >= 25 && amount <= 1000 && buyerName.trim() && buyerEmail.trim() && recipientName.trim() && recipientEmail.trim()

  async function buy() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/gift/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, buyerName, buyerEmail, recipientName, recipientEmail, message }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) { setError(data.error || 'Something went wrong. Please try again.'); setBusy(false); return }
      window.location.href = data.url as string
    } catch {
      setError('Network error. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <span className="eyebrow text-ink-soft mb-3 block">Amount</span>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(p)}
              className={`rounded-sm border px-5 py-2.5 transition-colors ${amount === p ? 'border-gold bg-gold text-charcoal' : 'border-line/60 bg-cream-soft text-ink-soft hover:border-gold'}`}
            >
              £{p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 max-w-[200px]">
          <span className="text-charcoal text-lg">£</span>
          <input
            type="number"
            inputMode="numeric"
            min={25}
            max={1000}
            value={Number.isFinite(amount) ? amount : ''}
            onChange={(e) => setAmount(Math.round(Number(e.target.value)))}
            className={inputClass}
            aria-label="Custom amount in pounds"
          />
        </div>
        <p className="text-xs text-ink-soft mt-1.5">Any amount between £25 and £1,000.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="rn" className="eyebrow text-ink-soft mb-2 block">Recipient&rsquo;s name</label>
          <input id="rn" className={inputClass} value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="re" className="eyebrow text-ink-soft mb-2 block">Recipient&rsquo;s email</label>
          <input id="re" type="email" className={inputClass} value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
        </div>
      </div>

      <div>
        <label htmlFor="msg" className="eyebrow text-ink-soft mb-2 block">Your message (optional)</label>
        <textarea id="msg" rows={3} maxLength={600} className={inputClass} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Happy birthday — enjoy a treat on me x" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 border-t border-line/40 pt-6">
        <div>
          <label htmlFor="bn" className="eyebrow text-ink-soft mb-2 block">Your name</label>
          <input id="bn" className={inputClass} value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="be" className="eyebrow text-ink-soft mb-2 block">Your email (receipt)</label>
          <input id="be" type="email" className={inputClass} value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-clay">{error}</p>}

      <button type="button" onClick={buy} disabled={busy || !valid} className="btn btn-primary btn-block disabled:opacity-50">
        {busy ? 'Taking you to checkout…' : `Pay £${Number.isFinite(amount) ? amount : 0} & send gift`}
      </button>
      <p className="text-xs text-ink-soft text-center">Secure payment by card. The voucher is emailed the moment payment completes.</p>
    </div>
  )
}
