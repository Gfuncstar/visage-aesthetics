'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConciergeBell, Home, Megaphone, Sparkles } from 'lucide-react'

// Persistent, mobile-first bottom navigation for the staff back end. Always
// visible, big tap targets, and the current section is highlighted so it is
// always obvious where you are and how to move between the arms.
// Pages that belong to a section even though their URL does not sit under it.
const RECEPTION = ['/staff/assistant/reception', '/staff/assistant/diary', '/staff/assistant/squeeze-in', '/staff/assistant/rebook']
const MARKETING = ['/staff/assistant/marketing', '/staff/broadcasts', '/staff/assistant/visibility']

const inAny = (p: string, list: string[]) => list.some((x) => p === x || p.startsWith(x + '/'))

const tabs = [
  { href: '/staff', label: 'Home', Icon: Home, match: (p: string) => p === '/staff' || p.startsWith('/staff/notes') },
  { href: '/staff/assistant/reception', label: 'Reception', Icon: ConciergeBell, match: (p: string) => inAny(p, RECEPTION) },
  { href: '/staff/assistant/marketing', label: 'Marketing', Icon: Megaphone, match: (p: string) => inAny(p, MARKETING) },
  {
    href: '/staff/assistant',
    label: 'Assistant',
    Icon: Sparkles,
    match: (p: string) => p.startsWith('/staff/assistant') && !inAny(p, RECEPTION) && !inAny(p, MARKETING),
  },
]

export default function StaffNav() {
  const pathname = usePathname() || ''
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-charcoal border-t border-cream/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Staff sections"
    >
      <div className="max-w-3xl mx-auto grid grid-cols-4">
        {tabs.map(({ href, label, Icon, match }) => {
          const active = match(pathname)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 py-3 min-h-[60px] transition-colors ${active ? 'text-gold' : 'text-cream/65 hover:text-cream'}`}
            >
              <Icon size={23} strokeWidth={active ? 2 : 1.6} />
              <span className="text-[11px] tracking-[0.04em]" style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
