import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Boxes, CalendarClock, ClipboardPen, ClipboardCheck, ReceiptText, TrendingUp, Users } from 'lucide-react'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../notes/StaffGate'
import { assistantConfigured } from '@/lib/assistant/db'
import { endOfDaySummary } from '@/lib/assistant/end-of-day'
import NotificationToggle from './NotificationToggle'

export const metadata: Metadata = {
  title: 'Assistant',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

const tools = [
  {
    href: '/staff/assistant/treatment',
    title: 'Treatment write-up',
    description: 'Clinical note + aftercare email from an appointment.',
    Icon: ClipboardPen,
  },
  {
    href: '/staff/assistant/clients',
    title: 'Client records',
    description: "Any client's history, notes, photos and spend.",
    Icon: Users,
  },
  {
    href: '/staff/assistant/squeeze-in',
    title: 'Squeeze-in',
    description: 'Fit someone in: best gap + to-book list.',
    Icon: CalendarClock,
  },
  {
    href: '/staff/assistant/stock',
    title: 'What to order',
    description: "What's booked and what to order by 3pm.",
    Icon: Boxes,
  },
  {
    href: '/staff/assistant/orders',
    title: 'Orders & expenses',
    description: 'Log supplier orders, costs and stock.',
    Icon: ReceiptText,
  },
  {
    href: '/staff/assistant/money',
    title: 'Profit & accountant pack',
    description: 'Revenue, margin and a month-end pack.',
    Icon: TrendingUp,
  },
]

export default async function AssistantIndex() {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />
  const configured = assistantConfigured()
  const today = configured ? await endOfDaySummary() : null

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-14 md:pt-24 pb-24">
        <Link
          href="/staff"
          className="eyebrow text-stone hover:text-gold-deep transition-colors inline-flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Staff
        </Link>
        <div className="eyebrow text-gold mb-2">Clinic staff &nbsp;·&nbsp; Assistant</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">
          Less admin, between clients.
        </h1>
        <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
          Write up a treatment, keep the order book tidy, and see where the month stands.
        </p>
        <div className="mt-4">
          <NotificationToggle />
        </div>

        {!configured && (
          <div className="mt-8 border border-gold/40 bg-gold/10 text-charcoal text-sm rounded-sm px-4 py-3 leading-relaxed">
            The clinic database is not connected yet. The treatment write-up still works (it saves
            to the patient-notes sheet and drafts the aftercare email). Orders and profit need the
            database. Add <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> in
            Vercel to switch them on.
          </div>
        )}

        {today && today.seen > 0 && (
          <div className={`mt-8 border rounded-sm p-5 ${today.toWrite.length > 0 ? 'border-gold/50 bg-gold/10' : 'border-sage/40 bg-sage/10'}`}>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck size={16} strokeWidth={1.75} className="text-gold-deep" />
              <span className="text-eyebrow text-gold-deep">End of day</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Tile n={today.seen} label="Seen today" />
              <Tile n={today.toWrite.length} label="To write up" tone={today.toWrite.length > 0 ? 'gold' : 'sage'} />
              <Tile n={today.squeezeIns} label="Squeeze-ins" tone={today.squeezeIns > 0 ? 'gold' : 'mute'} />
            </div>
            {today.toWrite.length > 0 ? (
              <>
                <p className="text-sm text-ink-soft mt-3">Still to write up: <span className="text-charcoal">{today.toWrite.map((c) => c.name).join(', ')}</span></p>
                <Link href="/staff/assistant/treatment" className="mt-3 btn btn-primary inline-flex" style={{ minHeight: 40 }}>
                  <span className="inline-flex items-center gap-2"><ClipboardPen size={15} strokeWidth={1.75} /> Write them up</span>
                </Link>
              </>
            ) : (
              <p className="text-sm text-sage mt-3">All caught up. Nice work.</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-8">
          {tools.map(({ href, title, description, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group bg-cream-soft border border-line/40 rounded-sm p-4 hover:border-gold transition-colors flex flex-col"
            >
              <div className="inline-flex w-10 h-10 rounded-full bg-charcoal text-cream items-center justify-center mb-3 group-hover:bg-gold-deep transition-colors">
                <Icon size={16} strokeWidth={1.75} />
              </div>
              <h2 className="font-display italic text-lg text-charcoal leading-tight">{title}</h2>
              <p className="text-xs text-ink-soft mt-1 leading-snug">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
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
