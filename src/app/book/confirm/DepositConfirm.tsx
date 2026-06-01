'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, Clock } from 'lucide-react'

export default function DepositConfirm() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const sessionId = params.get('session_id') ?? ''
  const [state, setState] = useState<'working' | 'confirmed' | 'pending'>('working')

  useEffect(() => {
    void (async () => {
      if (!token || !sessionId) { setState('pending'); return }
      try {
        const res = await fetch('/api/book/deposit/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, sessionId }),
        })
        const d = await res.json().catch(() => ({}))
        setState(d.status === 'confirmed' ? 'confirmed' : 'pending')
      } catch {
        setState('pending')
      }
    })()
  }, [token, sessionId])

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-lg mx-auto px-5 md:px-8 pt-28 md:pt-32 pb-24 text-center">
        {state === 'working' ? (
          <p className="text-ink-soft">Confirming your booking…</p>
        ) : state === 'confirmed' ? (
          <div className="border border-sage/40 bg-sage/10 rounded-sm p-8">
            <div className="inline-flex w-12 h-12 rounded-full bg-sage/20 text-sage items-center justify-center mb-4"><Check size={22} strokeWidth={2} /></div>
            <h1 className="font-display italic text-2xl text-charcoal mb-2">You&apos;re booked in</h1>
            <p className="text-ink-soft leading-relaxed">Your deposit is received and your appointment is confirmed. A confirmation is on its way to your email.</p>
            <Link href={`/book/manage/${token}`} className="btn btn-secondary mt-5 inline-flex">Manage booking</Link>
          </div>
        ) : (
          <div className="border border-gold/40 bg-gold/5 rounded-sm p-8">
            <div className="inline-flex w-12 h-12 rounded-full bg-gold/15 text-gold-deep items-center justify-center mb-4"><Clock size={22} strokeWidth={2} /></div>
            <h1 className="font-display italic text-2xl text-charcoal mb-2">Almost there</h1>
            <p className="text-ink-soft leading-relaxed">Your time is held. If your deposit has not gone through yet, we will be in touch with a payment link to confirm it.</p>
          </div>
        )}
      </div>
    </section>
  )
}
