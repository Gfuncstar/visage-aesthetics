'use client'

import type React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConciergeBell, Home, Megaphone, Sparkles } from 'lucide-react'
import UndoButton from './UndoButton'

// Persistent, mobile-first navigation for the staff back end, pinned to the
// top so the section you're in — and how to switch — is always obvious. Big
// tap targets, current section highlighted.
// Pages that belong to a section even though their URL does not sit under it.
const RECEPTION = ['/staff/assistant/reception', '/staff/assistant/diary', '/staff/assistant/squeeze-in', '/staff/assistant/rebook']
const MARKETING = ['/staff/assistant/marketing', '/staff/broadcasts', '/staff/assistant/visibility']

const inAny = (p: string, list: string[]) => list.some((x) => p === x || p.startsWith(x + '/'))

// Each section has its own accent colour so you can tell at a glance which area
// you're in — used on the active tab and the bar beneath the nav. Colours are
// chosen to read clearly on the dark charcoal nav.
const tabs = [
  { href: '/staff', label: 'Home', Icon: Home, accent: '#D2A85C', match: (p: string) => p === '/staff' || p.startsWith('/staff/notes') },
  { href: '/staff/assistant/reception', label: 'Reception', Icon: ConciergeBell, accent: '#33B0A4', match: (p: string) => inAny(p, RECEPTION) },
  { href: '/staff/assistant/marketing', label: 'Marketing', Icon: Megaphone, accent: '#E0739F', match: (p: string) => inAny(p, MARKETING) },
  {
    href: '/staff/assistant',
    label: 'Assistant',
    Icon: Sparkles,
    accent: '#8AA0EA',
    match: (p: string) => p.startsWith('/staff/assistant') && !inAny(p, RECEPTION) && !inAny(p, MARKETING),
  },
]

export default function StaffNav({ viewToggle }: { viewToggle?: React.ReactNode }) {
  const pathname = usePathname() || ''
  const activeAccent = tabs.find((t) => t.match(pathname))?.accent ?? '#A8895E'
  return (
    <nav
      className="sticky top-0 inset-x-0 z-50 bg-charcoal"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      aria-label="Staff sections"
    >
      <div className="max-w-3xl mx-auto flex items-stretch">
        <div className="flex-1 grid grid-cols-4">
          {tabs.map(({ href, label, Icon, accent, match }) => {
            const active = match(pathname)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 py-3 min-h-[60px] transition-colors ${active ? '' : 'text-cream/65 hover:text-cream'}`}
                style={active ? { color: accent } : undefined}
              >
                <Icon size={23} strokeWidth={active ? 2 : 1.6} />
                <span className="text-[11px] tracking-[0.04em]" style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
              </Link>
            )
          })}
        </div>
        <UndoButton />
        {viewToggle && (
          <div className="flex items-center px-3 border-l border-cream/10 shrink-0">
            {viewToggle}
          </div>
        )}
      </div>
      {/* Section accent bar — a persistent colour cue for the area you're in. */}
      <div aria-hidden style={{ height: 3, background: activeAccent }} />
    </nav>
  )
}
