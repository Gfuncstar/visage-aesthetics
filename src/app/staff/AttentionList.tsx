'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { type LucideIcon, AlertTriangle, Boxes, CalendarCheck, CalendarClock, Check, ClipboardPen, ShieldAlert, X } from 'lucide-react'

type Tone = 'urgent' | 'attention'
type IconName = 'shield' | 'alert' | 'clipboard' | 'boxes' | 'calendar' | 'confirm'

export type AttentionItem = {
  key: string
  href: string
  icon: IconName
  tone: Tone
  title: string
  detail: string
}

const icons: Record<IconName, LucideIcon> = {
  shield: ShieldAlert,
  alert: AlertTriangle,
  clipboard: ClipboardPen,
  boxes: Boxes,
  calendar: CalendarClock,
  confirm: CalendarCheck,
}

const toneStyles: Record<Tone, { card: string; badge: string }> = {
  urgent: { card: 'border-clay/50 bg-clay/10 hover:border-clay', badge: 'bg-clay text-cream' },
  attention: { card: 'border-gold/50 bg-gold/10 hover:border-gold', badge: 'bg-gold-deep text-cream' },
}

const STORAGE_KEY = 'staff-dismissed-attention'

// Dismissals are scoped to the current day and to the card's content, so an
// alert re-appears the next morning, or sooner if it materially changes (e.g.
// the number of clients without consent goes up, or a new name is added).
function signature(item: AttentionItem): string {
  return `${item.key}|${item.title}|${item.detail}`
}

function today(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date())
}

type Stored = { date: string; ids: string[] }

function readDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as Stored
    if (parsed?.date !== today() || !Array.isArray(parsed.ids)) return new Set()
    return new Set(parsed.ids)
  } catch {
    return new Set()
  }
}

function writeDismissed(ids: Set<string>) {
  try {
    const stored: Stored = { date: today(), ids: [...ids] }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // localStorage unavailable (private mode / quota) — dismissal just won't persist.
  }
}

export default function AttentionList({ items, configured }: { items: AttentionItem[]; configured: boolean }) {
  // Start with nothing dismissed so the server and first client render match,
  // then reconcile from localStorage once mounted.
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setDismissed(readDismissed())
    setMounted(true)
  }, [])

  const dismiss = (item: AttentionItem) => {
    setDismissed((prev) => {
      const next = new Set(prev)
      next.add(signature(item))
      writeDismissed(next)
      return next
    })
  }

  const visible = mounted ? items.filter((item) => !dismissed.has(signature(item))) : items

  if (visible.length === 0) {
    return (
      <div className="flex items-center gap-3 border border-sage/40 bg-sage/10 rounded-sm px-5 py-5">
        <span className="inline-flex w-9 h-9 rounded-full bg-sage/20 text-sage items-center justify-center shrink-0">
          <Check size={16} strokeWidth={2} />
        </span>
        <div>
          <p className="text-charcoal font-medium leading-snug">All caught up.</p>
          <p className="text-sm text-ink-soft leading-snug mt-0.5">
            {configured
              ? 'Nothing needs you right now.'
              : 'Connect the clinic database to see write-ups and stock that need you.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {visible.map((item) => {
        const { key, href, icon, tone, title, detail } = item
        const Icon = icons[icon]
        const s = toneStyles[tone]
        return (
          <div key={key} className={`group relative border rounded-sm transition-colors ${s.card}`}>
            <Link href={href} className="flex items-start gap-3 px-3.5 py-3.5 pr-10">
              <span className={`inline-flex w-8 h-8 rounded-full items-center justify-center shrink-0 mt-0.5 ${s.badge}`}>
                <Icon size={15} strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display italic text-base text-charcoal leading-tight">{title}</span>
                <span className="block text-xs text-ink-soft mt-0.5 leading-snug">{detail}</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => dismiss(item)}
              aria-label={`Dismiss: ${title}`}
              className="absolute top-1.5 right-1.5 inline-flex w-7 h-7 rounded-full items-center justify-center text-ink-soft/70 hover:text-charcoal hover:bg-charcoal/5 transition-colors"
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
