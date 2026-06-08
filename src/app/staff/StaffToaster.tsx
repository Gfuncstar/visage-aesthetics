'use client'

import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { STAFF_DONE_EVENT, STAFF_DONE_KEY } from '@/lib/staff-toast'

// App-wide confirmation toast for the staff back end. Mounted once in the staff
// layout; it listens for notifyDone() events (and picks up a message stashed
// before a reload) and shows a brief "done" toast that auto-dismisses.
export default function StaffToaster() {
  const [msg, setMsg] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const show = (m: string) => {
      setMsg(m || 'Done.')
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setMsg(null), 3200)
    }

    // A message stashed just before the page reloaded.
    try {
      const stored = sessionStorage.getItem(STAFF_DONE_KEY)
      if (stored) {
        sessionStorage.removeItem(STAFF_DONE_KEY)
        show(stored)
      }
    } catch {
      /* sessionStorage unavailable */
    }

    const onDone = (e: Event) => show((e as CustomEvent<string>).detail)
    window.addEventListener(STAFF_DONE_EVENT, onDone)
    return () => {
      window.removeEventListener(STAFF_DONE_EVENT, onDone)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  if (!msg) return null

  return (
    <div
      className="fixed inset-x-0 z-[200] flex justify-center px-5 pointer-events-none"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex items-center gap-2.5 bg-charcoal text-cream rounded-full pl-2.5 pr-4 py-2.5 shadow-xl max-w-[90vw] animate-[fadeUp_180ms_ease-out]">
        <span className="inline-flex w-6 h-6 rounded-full bg-sage/25 text-sage items-center justify-center shrink-0">
          <Check size={14} strokeWidth={2.5} />
        </span>
        <span className="text-sm leading-snug">{msg}</span>
      </div>
    </div>
  )
}
