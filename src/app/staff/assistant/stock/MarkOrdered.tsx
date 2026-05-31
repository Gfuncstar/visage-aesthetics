'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ShoppingCart } from 'lucide-react'

export default function MarkOrdered({ itemKey, ordered }: { itemKey: string; ordered: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function set(method: 'POST' | 'DELETE') {
    setBusy(true)
    try {
      await fetch('/api/staff/assistant/stock/ordered', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: itemKey }),
      })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  if (ordered) {
    return (
      <button onClick={() => set('DELETE')} disabled={busy} className="text-xs eyebrow text-stone hover:text-gold-deep transition-colors disabled:opacity-50">
        Undo
      </button>
    )
  }
  return (
    <button onClick={() => set('POST')} disabled={busy} className="btn btn-primary disabled:opacity-50" style={{ minHeight: 34, padding: '0 14px' }}>
      <span className="inline-flex items-center gap-1.5">
        {busy ? <Check size={13} strokeWidth={2} /> : <ShoppingCart size={13} strokeWidth={1.75} />}
        {busy ? 'Marking…' : 'Mark ordered'}
      </span>
    </button>
  )
}
