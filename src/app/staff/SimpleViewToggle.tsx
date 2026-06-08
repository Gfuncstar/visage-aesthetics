'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SIMPLE_VIEW_COOKIE } from '@/lib/staff-view'

// A slim, always-present bar that flips the whole staff area between a
// pared-back "Simple view" (just the everyday tools, no stats or deep admin)
// and the full thing. The choice is stored in a cookie and read by the server
// pages, so a refresh re-renders each hub with the right set of cards.
export default function SimpleViewToggle({ initialSimple, compact = false }: { initialSimple: boolean; compact?: boolean }) {
  const router = useRouter()
  const [simple, setSimple] = useState(initialSimple)
  const [pending, setPending] = useState(false)

  function set(next: boolean) {
    setSimple(next)
    setPending(true)
    document.cookie = `${SIMPLE_VIEW_COOKIE}=${next ? '1' : '0'}; path=/staff; max-age=31536000; samesite=lax`
    router.refresh()
    window.setTimeout(() => setPending(false), 500)
  }

  if (compact) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={simple}
        aria-label={simple ? 'Switch to full view' : 'Switch to simple view'}
        onClick={() => set(!simple)}
        disabled={pending}
        className="flex flex-col items-center gap-1 py-3 min-h-[60px] justify-center disabled:opacity-60 text-cream/65 hover:text-cream transition-colors"
        title={simple ? 'Full view' : 'Simple view'}
      >
        <span
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${simple ? 'bg-gold' : 'bg-cream/25'}`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-cream shadow-sm transition-transform ${simple ? 'translate-x-[18px]' : 'translate-x-0.5'}`}
          />
        </span>
        <span className="text-[10px] tracking-[0.04em]">{simple ? 'Simple' : 'Full'}</span>
      </button>
    )
  }

  return (
    <div className="bg-cream border-b border-line/40">
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-2 flex items-center justify-between gap-3">
        <span className="eyebrow text-stone">
          {simple ? 'Simple view' : 'Full view'}
          <span className="text-ink-soft/70 normal-case tracking-normal ml-2 hidden sm:inline" style={{ fontSize: 11 }}>
            {simple ? 'the everyday essentials' : 'every tool and number'}
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={simple}
          aria-label="Simple view"
          onClick={() => set(!simple)}
          disabled={pending}
          className="inline-flex items-center gap-2 shrink-0 disabled:opacity-60"
        >
          <span className="eyebrow text-stone hidden sm:inline">Simpler</span>
          <span
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${simple ? 'bg-gold' : 'bg-stone/35'}`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-cream shadow-sm transition-transform ${simple ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
            />
          </span>
        </button>
      </div>
    </div>
  )
}
