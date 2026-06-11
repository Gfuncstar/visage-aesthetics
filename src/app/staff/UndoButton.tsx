'use client'

import { useCallback, useEffect, useState } from 'react'
import { Undo2 } from 'lucide-react'
import { notifyDone } from '@/lib/staff-toast'
import { clearUndo, readUndo, UNDO_CHANGE_EVENT, UNDO_DONE_EVENT, type UndoAction } from '@/lib/staff-undo'

// The "undo the last action" control in the top nav. Stays hidden until there's
// something to roll back (e.g. a booking just cancelled), then offers a one-tap
// reversal. The page that made the change stashes it via recordUndo().
export default function UndoButton() {
  const [action, setAction] = useState<UndoAction | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const sync = () => setAction(readUndo())
    sync()
    window.addEventListener(UNDO_CHANGE_EVENT, sync)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener(UNDO_CHANGE_EVENT, sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  const run = useCallback(async () => {
    const a = readUndo()
    if (!a || busy) return
    setBusy(true)
    try {
      if (a.kind === 'restore-booking') {
        const res = await fetch(`/api/staff/assistant/diary/${a.bookingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: a.status }),
        })
        if (!res.ok) throw new Error('restore failed')
      }
      clearUndo()
      notifyDone('Last action undone')
      window.dispatchEvent(new Event(UNDO_DONE_EVENT))
    } catch {
      /* leave the undo in place so it can be retried */
    } finally {
      setBusy(false)
    }
  }, [busy])

  if (!action) return null

  return (
    <div className="flex items-center border-l border-cream/10 shrink-0">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        title={action.label}
        aria-label={action.label}
        className="flex flex-col items-center gap-1 py-3 min-h-[60px] justify-center px-3 text-gold hover:text-gold-soft disabled:opacity-60 transition-colors"
      >
        <Undo2 size={22} strokeWidth={1.9} className={busy ? 'animate-pulse' : ''} />
        <span className="text-[10px] tracking-[0.04em]">Undo</span>
      </button>
    </div>
  )
}
