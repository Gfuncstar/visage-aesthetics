import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Bot, Boxes, ClipboardPen, FileCheck2, ReceiptText, Rocket, ShieldCheck, TrendingUp, Users } from 'lucide-react'
import { isStaffAuthed } from '@/lib/staff-auth'
import { isSimpleView } from '@/lib/staff-prefs'
import StaffGate from '../notes/StaffGate'
import { assistantConfigured } from '@/lib/assistant/db'
import { endOfDaySummary } from '@/lib/assistant/end-of-day'
import NotificationToggle from './NotificationToggle'
import WriteUpReminders from './WriteUpReminders'

export const metadata: Metadata = {
  title: 'Assistant',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

const tools = [
  {
    href: '/staff/assistant/treatment',
    title: 'Treatment write-up',
    description: 'Clinical note from an appointment.',
    Icon: ClipboardPen,
  },
  {
    href: '/staff/assistant/clients',
    title: 'Client records',
    description: "Any client's history, notes, photos and spend.",
    Icon: Users,
  },
  {
    href: '/staff/assistant/consent',
    title: 'Consent forms',
    description: 'Send a form, preview it, and read what comes back.',
    Icon: FileCheck2,
  },
  {
    href: '/staff/assistant/compliance',
    title: 'Insurance check',
    description: 'Check a new treatment against the clinic policy before you offer it.',
    Icon: ShieldCheck,
  },
  {
    href: '/staff/assistant/preflight',
    title: 'Go-live readiness',
    description: 'Check the Ovatu swap is ready, front to back, before you flip the switch.',
    Icon: Rocket,
    advanced: true,
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
    advanced: true,
  },
  {
    href: '/staff/assistant/money',
    title: 'Profit & accountant pack',
    description: 'Revenue, margin and a month-end pack.',
    Icon: TrendingUp,
    advanced: true,
  },
  {
    href: '/staff/assistant/agents',
    title: 'Agents',
    description: 'Background tasks: stock, finance, social, compliance and more.',
    Icon: Bot,
    advanced: true,
  },
]

export default async function AssistantIndex() {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />
  const configured = assistantConfigured()
  const simple = await isSimpleView()
  const today = configured ? await endOfDaySummary() : null
  const visibleTools = simple ? tools.filter((t) => !t.advanced) : tools

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

        {today && <WriteUpReminders today={today} simple={simple} />}

        <div className="grid grid-cols-2 gap-3 mt-8">
          {visibleTools.map(({ href, title, description, Icon }) => (
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

        {simple && (
          <p className="text-xs text-ink-soft mt-4 leading-relaxed">
            Orders, profit and the background agents are tucked away. Switch to full view at the
            top to bring them back.
          </p>
        )}
      </div>
    </section>
  )
}

