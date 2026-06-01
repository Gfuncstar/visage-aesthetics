import type { Metadata } from 'next'
import Link from 'next/link'
import { ClipboardList, ConciergeBell, Megaphone, Sparkles } from 'lucide-react'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from './notes/StaffGate'

export const metadata: Metadata = {
  title: 'Staff',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

const tools = [
  {
    href: '/staff/notes',
    title: 'Patient notes',
    description: 'Record a treatment straight into the clinic notes sheet.',
    Icon: ClipboardList,
  },
  {
    href: '/staff/assistant',
    title: 'Assistant',
    description: 'Write up treatments, log orders, and see profit and an accountant pack.',
    Icon: Sparkles,
  },
  {
    href: '/staff/assistant/reception',
    title: 'Receptionist',
    description: 'Online booking, diary, reminders, waitlist and a voice command desk. Mirrors Ovatu, ready to take over.',
    Icon: ConciergeBell,
    badge: 'PAUSED',
  },
  {
    href: '/staff/assistant/marketing',
    title: 'Marketing',
    description: 'Everything going out: blogs, email broadcasts, social posts to Meta and advertising, in one view.',
    Icon: Megaphone,
  },
]

export default async function StaffIndex() {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />

  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', hour12: false }).format(new Date()),
  )
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateLabel = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-24">
        <header className="flex items-center justify-between gap-4 pb-5 mb-8 border-b border-line/50">
          <div className="flex flex-col">
            <span className="font-display text-charcoal" style={{ fontSize: 20, letterSpacing: '0.01em' }}>Visage Aesthetics</span>
            <span className="eyebrow text-stone" style={{ fontSize: 9.5, marginTop: 2 }}>Private clinic &nbsp;·&nbsp; Braintree</span>
          </div>
          <span className="eyebrow text-gold text-right" style={{ fontSize: 9.5 }}>{dateLabel}</span>
        </header>

        <div className="eyebrow text-gold mb-2">Clinic staff</div>
        <h1 className="font-display italic text-charcoal text-4xl md:text-5xl leading-tight">
          {greeting}.
        </h1>
        <p className="text-ink-soft mt-3 max-w-xl leading-relaxed">
          What would you like to do?
        </p>

        <div className="grid grid-cols-2 gap-3 mt-8">
          {tools.map(({ href, title, description, Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className="group relative bg-cream-soft border border-line/40 rounded-sm p-4 sm:p-5 hover:border-gold transition-colors flex flex-col"
            >
              {badge && (
                <span className="absolute top-2.5 right-2.5 text-[9px] font-medium tracking-[0.14em] uppercase rounded-full px-2 py-0.5 bg-gold/15 text-gold-deep border border-gold/40">
                  {badge}
                </span>
              )}
              <div className="inline-flex w-10 h-10 rounded-full bg-charcoal text-cream items-center justify-center mb-3 group-hover:bg-gold-deep transition-colors">
                <Icon size={16} strokeWidth={1.75} />
              </div>
              <h2 className="font-display italic text-lg sm:text-xl text-charcoal leading-tight">{title}</h2>
              <p className="text-xs text-ink-soft mt-1 leading-snug">{description}</p>
              <div className="mt-3 eyebrow text-gold inline-flex items-center gap-2">
                {badge === 'PAUSED' ? 'Preview' : 'Open'}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
