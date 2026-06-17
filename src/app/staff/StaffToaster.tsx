'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, AlertTriangle } from 'lucide-react'
import { STAFF_DONE_EVENT, STAFF_DONE_KEY, type StaffToastDetail, type StaffToastTone } from '@/lib/staff-toast'

// App-wide confirmation toast for the staff back end. Mounted once in the staff
// layout; it listens for notifyDone()/notifyError() events (and picks up a
// message stashed before a reload) and shows a brief toast that auto-dismisses.
// Errors stay a little longer and use a clay warning style so a failed action is
// unmistakable from a success.
export default function StaffToaster() {
  const [toast, setToast] = useState<{ message: string; tone: StaffToastTone } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const show = (message: string, tone: StaffToastTone) => {
      setToast({ message: message || (tone === 'error' ? 'Something went wrong.' : 'Done.'), tone })
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setToast(null), tone === 'error' ? 5000 : 3200)
    }

    // A message stashed just before the page reloaded (always a success note).
    try {
      const stored = sessionStorage.getItem(STAFF_DONE_KEY)
      if (stored) {
        sessionStorage.removeItem(STAFF_DONE_KEY)
        show(stored, 'done')
      }
    } catch {
      /* sessionStorage unavailable */
    }

    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<StaffToastDetail | string>).detail
      // Back-compat: older callers dispatched a plain string (always a success).
      if (typeof detail === 'string') show(detail, 'done')
      else show(detail.message, detail.tone)
    }
    window.addEventListener(STAFF_DONE_EVENT, onToast)
    return () => {
      window.removeEventListener(STAFF_DONE_EVENT, onToast)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  if (!toast) return null

  const isError = toast.tone === 'error'

  return (
    <div
      className="fixed inset-x-0 z-[200] flex justify-center px-5 pointer-events-none"
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
      role="status"
      aria-live={isError ? 'assertive' : 'polite'}
    >
      <div className="pointer-events-auto flex items-center gap-2.5 bg-charcoal text-cream rounded-full pl-2.5 pr-4 py-2.5 shadow-xl max-w-[90vw] animate-[fadeUp_180ms_ease-out]">
        <span
          className={`inline-flex w-6 h-6 rounded-full items-center justify-center shrink-0 ${
            isError ? 'bg-clay/25 text-clay' : 'bg-sage/25 text-sage'
          }`}
        >
          {isError ? <AlertTriangle size={14} strokeWidth={2.5} /> : <Check size={14} strokeWidth={2.5} />}
        </span>
        <span className="text-sm leading-snug">{toast.message}</span>
      </div>
    </div>
  )
}
