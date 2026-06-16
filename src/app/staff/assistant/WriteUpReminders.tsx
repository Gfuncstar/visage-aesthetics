'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, ClipboardCheck, ClipboardPen, X } from 'lucide-react'
import type { EndOfDay, OverdueWriteUp } from '@/lib/assistant/end-of-day'

const STORAGE_KEY = 'va_dismissed_writeups'

function loadDismissed(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function saveDismissed(s: Set<string>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...s]))
  } catch { /* */ }
}

function overdueKey(o: OverdueWriteUp): string {
  return `${o.date}|${o.name.trim().toLowerCase()}`
}

export default function WriteUpReminders({ today, simple = false }: { today: EndOfDay; simple?: boolean }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    setDismissed(loadDismissed())
  }, [])

  function dismiss(key: string) {
    setDismissed((prev) => {
      const next = new Set(prev)
      next.add(key)
      saveDismissed(next)
      return next
    })
  }

  const visibleOverdue = today.overdue.filter((o) => !dismissed.has(overdueKey(o)))
  const visibleToWrite = today.toWrite.filter((c) => !dismissed.has(`today|${c.name.trim().toLowerCase()}`))

  return (
    <>
      {visibleOverdue.length > 0 && (
        <div className="mt-8 border border-clay/50 bg-clay/10 rounded-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} strokeWidth={1.75} className="text-clay" />
            <span className="text-eyebrow text-clay">Write-ups overdue &nbsp;·&nbsp; over 24 hours</span>
          </div>
          <p className="text-sm text-ink-soft">
            {visibleOverdue.length === 1 ? 'One earlier visit has' : `${visibleOverdue.length} earlier visits have`} no
            clinical note yet. Please write them up.
          </p>
          <ul className="mt-3 space-y-1.5">
            {visibleOverdue.slice(0, 8).map((o) => (
              <li key={overdueKey(o)} className="text-sm flex items-baseline justify-between gap-3 group">
                <span className="truncate">
                  <span className="text-charcoal">{o.name}</span>{' '}
                  <span className="text-ink-soft">&middot; {o.service}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-clay whitespace-nowrap">
                    {o.daysAgo === 1 ? '1 day' : `${o.daysAgo} days`} ago
                  </span>
                  <button
                    onClick={() => dismiss(overdueKey(o))}
                    title={`Dismiss ${o.name} — written up another way`}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-sm border border-line/40 text-ink-soft hover:border-clay hover:text-clay transition-colors"
                    aria-label={`Dismiss ${o.name}`}
                  >
                    <X size={13} strokeWidth={2} />
                  </button>
                </div>
              </li>
            ))}
            {visibleOverdue.length > 8 && (
              <p className="text-xs text-ink-soft mt-2">+{visibleOverdue.length - 8} more</p>
            )}
          </ul>
          <Link href="/staff/assistant/treatment" className="mt-4 btn btn-primary inline-flex" style={{ minHeight: 40 }}>
            <span className="inline-flex items-center gap-2">
              <ClipboardPen size={15} strokeWidth={1.75} /> Write them up
            </span>
          </Link>
        </div>
      )}

      {today.seen > 0 && (
        <div className={`mt-8 border rounded-sm p-5 ${visibleToWrite.length > 0 ? 'border-gold/50 bg-gold/10' : 'border-sage/40 bg-sage/10'}`}>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardCheck size={16} strokeWidth={1.75} className="text-gold-deep" />
            <span className="text-eyebrow text-gold-deep">End of day</span>
          </div>
          {!simple && (
            <div className="grid grid-cols-3 gap-3">
              <Tile n={today.seen} label="Seen today" />
              <Tile n={visibleToWrite.length} label="To write up" tone={visibleToWrite.length > 0 ? 'gold' : 'sage'} />
              <Tile n={today.squeezeIns} label="Squeeze-ins" tone={today.squeezeIns > 0 ? 'gold' : 'mute'} />
            </div>
          )}
          {visibleToWrite.length > 0 ? (
            <>
              <ul className="mt-3 space-y-1.5">
                {visibleToWrite.map((c) => {
                  const key = `today|${c.name.trim().toLowerCase()}`
                  return (
                    <li key={key} className="text-sm flex items-baseline justify-between gap-3 group">
                      <span className="text-charcoal">{c.name}</span>
                      <button
                        onClick={() => dismiss(key)}
                        title={`Dismiss ${c.name} — written up another way`}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-sm border border-line/40 text-ink-soft hover:border-clay hover:text-clay transition-colors shrink-0"
                        aria-label={`Dismiss ${c.name}`}
                      >
                        <X size={13} strokeWidth={2} />
                      </button>
                    </li>
                  )
                })}
              </ul>
              <Link href="/staff/assistant/treatment" className="mt-3 btn btn-primary inline-flex" style={{ minHeight: 40 }}>
                <span className="inline-flex items-center gap-2"><ClipboardPen size={15} strokeWidth={1.75} /> Write them up</span>
              </Link>
            </>
          ) : (
            <p className="text-sm text-sage mt-3">All caught up. Nice work.</p>
          )}
        </div>
      )}
    </>
  )
}

function Tile({ n, label, tone = 'ink' }: { n: number; label: string; tone?: 'gold' | 'sage' | 'mute' | 'ink' }) {
  const color =
    tone === 'gold' ? 'text-gold-deep' : tone === 'sage' ? 'text-sage' : tone === 'mute' ? 'text-stone' : 'text-charcoal'
  return (
    <div className="bg-cream border border-line/40 rounded-sm px-3 py-3 text-center">
      <div className={`font-display italic text-3xl leading-none ${color}`}>{n}</div>
      <div className="text-eyebrow text-ink-soft mt-1.5">{label}</div>
    </div>
  )
}
