'use client'

import { useState } from 'react'
import { Check, Search, Ticket } from 'lucide-react'

const inputClass =
  'w-full bg-cream border border-line/40 rounded-sm px-4 py-3 text-base text-charcoal placeholder:text-ink-soft/60 focus:outline-none focus:border-gold min-h-[48px]'

type Voucher = {
  code: string
  status: 'pending' | 'active' | 'redeemed' | 'cancelled'
  amount_pence: number
  balance_pence: number
  recipient_name: string | null
  buyer_name: string | null
  expires_at: string | null
}

const gbp = (pence: number) => `£${(pence / 100).toFixed(2).replace(/\.00$/, '')}`

const statusLabel: Record<Voucher['status'], string> = {
  pending: 'Awaiting payment',
  active: 'Active',
  redeemed: 'Fully redeemed',
  cancelled: 'Cancelled',
}

export default function Vouchers() {
  const [code, setCode] = useState('')
  const [voucher, setVoucher] = useState<Voucher | null>(null)
  const [redeemAmount, setRedeemAmount] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  async function lookup() {
    setBusy(true); setError(null); setDone(null); setVoucher(null)
    try {
      const res = await fetch(`/api/staff/assistant/vouchers?code=${encodeURIComponent(code.trim())}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || 'Could not find that voucher.'); return }
      setVoucher(data.voucher)
      setRedeemAmount(((data.voucher.balance_pence ?? 0) / 100).toString())
    } catch { setError('Network error.') } finally { setBusy(false) }
  }

  async function redeem() {
    if (!voucher) return
    const amountPence = Math.round(Number(redeemAmount) * 100)
    if (!Number.isFinite(amountPence) || amountPence <= 0) { setError('Enter an amount to redeem.'); return }
    setBusy(true); setError(null); setDone(null)
    try {
      const res = await fetch('/api/staff/assistant/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucher.code, amountPence, note }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || 'Could not redeem.'); return }
      setVoucher({ ...voucher, balance_pence: data.balance_pence, status: data.status })
      setRedeemAmount((data.balance_pence / 100).toString())
      setNote('')
      setDone(`Redeemed. ${data.balance_pence > 0 ? `${gbp(data.balance_pence)} left.` : 'Voucher fully used.'}`)
    } catch { setError('Network error.') } finally { setBusy(false) }
  }

  const canRedeem = voucher && (voucher.status === 'active') && voucher.balance_pence > 0

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex gap-2">
        <input
          className={`${inputClass} uppercase tracking-[0.12em]`}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="GIFT-XXXX-XXXX"
          onKeyDown={(e) => { if (e.key === 'Enter') void lookup() }}
        />
        <button type="button" onClick={lookup} disabled={busy || !code.trim()} className="btn btn-secondary shrink-0 disabled:opacity-50">
          <span className="inline-flex items-center gap-2"><Search size={15} strokeWidth={1.75} /> Find</span>
        </button>
      </div>

      {error && <p className="text-sm text-clay">{error}</p>}

      {voucher && (
        <div className="border border-line/40 bg-cream-soft rounded-sm p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex w-10 h-10 rounded-full bg-charcoal text-cream items-center justify-center mb-3">
                <Ticket size={16} strokeWidth={1.75} />
              </div>
              <div className="font-display italic text-2xl text-charcoal leading-none">{gbp(voucher.balance_pence)} <span className="text-stone text-base not-italic">left</span></div>
              <div className="text-xs text-stone mt-1">of {gbp(voucher.amount_pence)} · {statusLabel[voucher.status]}</div>
              {voucher.recipient_name && <div className="text-xs text-ink-soft mt-1">For {voucher.recipient_name}{voucher.buyer_name ? ` · from ${voucher.buyer_name}` : ''}</div>}
              {voucher.expires_at && <div className="text-xs text-stone mt-1">Expires {new Date(voucher.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
            </div>
          </div>

          {canRedeem ? (
            <div className="mt-5 border-t border-line/30 pt-5 space-y-3">
              <div>
                <label className="text-eyebrow text-ink-soft mb-2 block">Amount to take off the bill</label>
                <div className="flex items-center gap-2 max-w-[200px]">
                  <span className="text-charcoal text-lg">£</span>
                  <input type="number" inputMode="decimal" min="0" step="0.01" className={inputClass} value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-eyebrow text-ink-soft mb-2 block">Note (optional)</label>
                <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Profhilo, in clinic" />
              </div>
              <button type="button" onClick={redeem} disabled={busy} className="btn btn-primary disabled:opacity-50">
                <span className="inline-flex items-center gap-2"><Check size={15} strokeWidth={1.75} /> {busy ? 'Redeeming…' : 'Redeem'}</span>
              </button>
            </div>
          ) : (
            <p className="text-sm text-ink-soft mt-4 border-t border-line/30 pt-4">
              {voucher.status === 'redeemed' ? 'This voucher has been fully used.' : voucher.status === 'pending' ? 'This voucher has not been paid for yet.' : 'This voucher cannot be redeemed.'}
            </p>
          )}

          {done && <p className="text-sm text-sage mt-3 inline-flex items-center gap-1.5"><Check size={14} strokeWidth={2} /> {done}</p>}
        </div>
      )}
    </div>
  )
}
