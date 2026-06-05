'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type State =
  | { kind: 'loading' }
  | { kind: 'done'; code: string; recipientName: string | null }
  | { kind: 'pending' }
  | { kind: 'error'; message: string }

export default function GiftConfirm() {
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id') ?? ''
    const sessionId = params.get('session_id') ?? ''
    if (!id || !sessionId) {
      setState({ kind: 'error', message: 'This link is missing some details.' })
      return
    }
    fetch('/api/gift/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, sessionId }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (res.ok && data.ok) {
          setState({ kind: 'done', code: data.code, recipientName: data.recipientName ?? null })
        } else if (res.status === 402) {
          setState({ kind: 'pending' })
        } else {
          setState({ kind: 'error', message: data.error || 'We could not confirm your purchase.' })
        }
      })
      .catch(() => setState({ kind: 'error', message: 'Network error confirming your purchase.' }))
  }, [])

  if (state.kind === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <div className="w-6 h-6 rounded-full border-2 border-gold/40 border-t-gold animate-spin" />
        <p className="text-ink-soft text-sm">Confirming your gift…</p>
      </div>
    )
  }

  if (state.kind === 'done') {
    return (
      <div>
        <div className="eyebrow text-gold mb-2">Gift sent</div>
        <h1 className="font-display italic text-charcoal text-4xl md:text-5xl leading-tight">Thank you.</h1>
        <p className="text-ink-soft mt-4 leading-relaxed">
          {state.recipientName ? `${state.recipientName} has` : 'They have'} been emailed their gift voucher,
          and a receipt is on its way to you.
        </p>
        <div className="inline-block border border-dashed border-gold bg-cream-soft rounded-sm px-8 py-4 mt-8">
          <div className="text-[10px] tracking-[0.24em] uppercase text-stone mb-1">Voucher code</div>
          <div className="text-charcoal font-semibold tracking-[0.22em]" style={{ fontSize: 22 }}>{state.code}</div>
        </div>
        <p className="text-xs text-ink-soft mt-6">Valid for 12 months · usable over more than one visit.</p>
        <div className="mt-10">
          <Link href="/" className="btn btn-secondary">Back to the clinic</Link>
        </div>
      </div>
    )
  }

  if (state.kind === 'pending') {
    return (
      <div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-4xl leading-tight">Payment not completed</h1>
        <p className="text-ink-soft mt-4 leading-relaxed">It looks like the payment didn&rsquo;t go through. No charge has been made.</p>
        <div className="mt-8"><Link href="/gift" className="btn btn-primary">Try again</Link></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display italic text-charcoal text-3xl md:text-4xl leading-tight">Something went wrong</h1>
      <p className="text-ink-soft mt-4 leading-relaxed">{state.message}</p>
      <p className="text-sm text-ink-soft mt-3">If you were charged, please reply to your receipt email and we&rsquo;ll sort it straight away.</p>
      <div className="mt-8"><Link href="/gift" className="btn btn-secondary">Back to gift vouchers</Link></div>
    </div>
  )
}
