import type { Metadata } from 'next'
import Link from 'next/link'
import { ClipboardList, Send } from 'lucide-react'
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
    href: '/staff/broadcasts',
    title: 'Broadcasts',
    description: 'Compose and send an email broadcast to a list of patients.',
    Icon: Send,
  },
]

export default async function StaffIndex() {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-20 md:pt-24 pb-24">
        <div className="eyebrow text-gold mb-2">Clinic staff</div>
        <h1 className="font-display italic text-charcoal text-4xl md:text-5xl leading-tight">
          What would you like to do?
        </h1>
        <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
          Choose a tool to continue.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
          {tools.map(({ href, title, description, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group bg-cream-soft border border-line/40 rounded-sm p-7 hover:border-gold transition-colors"
            >
              <div className="inline-flex w-11 h-11 rounded-full bg-charcoal text-cream items-center justify-center mb-5 group-hover:bg-gold-deep transition-colors">
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <h2 className="font-display italic text-2xl text-charcoal leading-tight">{title}</h2>
              <p className="text-sm text-ink-soft mt-2 leading-relaxed">{description}</p>
              <div className="mt-5 eyebrow text-gold inline-flex items-center gap-2">
                Open
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
