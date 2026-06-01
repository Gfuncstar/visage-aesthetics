'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

// A sticky breadcrumb bar so it is always clear where you are within a section
// and how to step back up. Section switching is handled by the bottom bar; this
// handles up-navigation and context. Derived from the route, so every page gets
// it for free.
const SECTIONS = {
  reception: { label: 'Reception', href: '/staff/assistant/reception' },
  marketing: { label: 'Marketing', href: '/staff/assistant/marketing' },
  assistant: { label: 'Assistant', href: '/staff/assistant' },
} as const

type Sec = keyof typeof SECTIONS

const ROUTES: Record<string, { sec?: Sec; page: string; back: string }> = {
  '/staff/notes': { page: 'Patient notes', back: '/staff' },
  '/staff/broadcasts': { sec: 'marketing', page: 'Email broadcasts', back: '/staff/assistant/marketing' },
  '/staff/assistant': { page: 'Assistant', back: '/staff' },
  '/staff/assistant/reception': { page: 'Receptionist', back: '/staff' },
  '/staff/assistant/reception/desk': { sec: 'reception', page: 'Front desk', back: '/staff/assistant/reception' },
  '/staff/assistant/diary': { sec: 'reception', page: 'Diary', back: '/staff/assistant/reception' },
  '/staff/assistant/squeeze-in': { sec: 'reception', page: 'Squeeze-in', back: '/staff/assistant/reception' },
  '/staff/assistant/rebook': { sec: 'reception', page: "Who's due back", back: '/staff/assistant/reception' },
  '/staff/assistant/marketing': { page: 'Marketing', back: '/staff' },
  '/staff/assistant/marketing/overview': { sec: 'marketing', page: 'Overview', back: '/staff/assistant/marketing' },
  '/staff/assistant/visibility': { sec: 'marketing', page: 'Awards & press', back: '/staff/assistant/marketing' },
  '/staff/assistant/treatment': { sec: 'assistant', page: 'Treatment write-up', back: '/staff/assistant' },
  '/staff/assistant/clients': { sec: 'assistant', page: 'Client records', back: '/staff/assistant' },
  '/staff/assistant/stock': { sec: 'assistant', page: 'What to order', back: '/staff/assistant' },
  '/staff/assistant/orders': { sec: 'assistant', page: 'Orders & expenses', back: '/staff/assistant' },
  '/staff/assistant/money': { sec: 'assistant', page: 'Profit & pack', back: '/staff/assistant' },
}

export default function StaffTopBar() {
  const pathname = usePathname() || ''
  if (pathname === '/staff') return null
  const info = ROUTES[pathname]
  if (!info) return null
  const sec = info.sec ? SECTIONS[info.sec] : null

  const dateLabel = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date())

  return (
    <div className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-line/60">
      <div className="max-w-3xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-3">
        <Link href={info.back} className="inline-flex items-center gap-1.5 min-w-0 group" aria-label="Back">
          <span className="inline-flex items-center justify-center w-8 h-8 -ml-1 rounded-full text-gold-deep group-hover:bg-gold/10 transition-colors shrink-0">
            <ChevronLeft size={20} strokeWidth={2} />
          </span>
          <span className="truncate text-sm">
            {sec ? (
              <>
                <span className="text-stone">{sec.label}</span>
                <span className="text-stone"> / </span>
                <span className="font-medium text-charcoal">{info.page}</span>
              </>
            ) : (
              <span className="font-medium text-charcoal">{info.page}</span>
            )}
          </span>
        </Link>
        <span className="text-stone text-xs whitespace-nowrap shrink-0">{dateLabel}</span>
      </div>
    </div>
  )
}
