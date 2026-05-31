'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { ukDate } from '@/lib/assistant/format'

// A booked client on the "what to order" card. Imminent (tomorrow) shows red.
// Tap to mark that individual's stock as ordered (tap again to undo).
export default function ClientChip({
  itemKey,
  name,
  date,
  ordered,
  days,
}: {
  itemKey: string
  name: string
  date: string
  ordered: boolean
  days: number
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const key = `${itemKey}|${name}|${date}`

  async function toggle() {
    setBusy(true)
    try {
      await fetch('/api/staff/assistant/stock/ordered', {
        method: ordered ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: key }),
      })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const cls = ordered
    ? 'border-sage/50 bg-sage/10 text-sage'
    : days <= 1
      ? 'border-clay/60 bg-clay/15 text-clay font-medium'
      : days <= 3
        ? 'border-gold/50 bg-gold/10 text-gold-deep'
        : 'border-line/40 bg-cream text-ink-soft'

  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={ordered ? 'Ordered — tap to undo' : 'Tap when ordered'}
      className={`text-xs border rounded-full px-2.5 py-1 inline-flex items-center gap-1 transition-colors disabled:opacity-50 ${cls}`}
    >
      {ordered && <Check size={11} strokeWidth={2.5} />}
      {name} · {ukDate(date)}
    </button>
  )
}
