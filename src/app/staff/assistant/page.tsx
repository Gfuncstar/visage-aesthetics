import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ClipboardPen, ReceiptText, TrendingUp } from 'lucide-react'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../notes/StaffGate'
import { assistantConfigured } from '@/lib/assistant/db'

export const metadata: Metadata = {
  title: 'Assistant',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

const tools = [
  {
    href: '/staff/assistant/treatment',
    title: 'Treatment write-up',
    description: 'Turn an appointment into a clinical note and a client aftercare email.',
    Icon: ClipboardPen,
  },
  {
    href: '/staff/assistant/orders',
    title: 'Orders & expenses',
    description: 'Log supplier orders and costs, with a review queue for unconfirmed parses.',
    Icon: ReceiptText,
  },
  {
    href: '/staff/assistant/money',
    title: 'Profit & accountant pack',
    description: 'Revenue, costs, margin and a copyable month-end pack with a CSV export.',
    Icon: TrendingUp,
  },
]

export default async function AssistantIndex() {
  const authed = await isStaffAuthed()
  if (!authed) return <StaffGate />
  const configured = assistantConfigured()

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-20 md:pt-24 pb-24">
        <Link
          href="/staff"
          className="eyebrow text-stone hover:text-gold-deep transition-colors inline-flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Staff
        </Link>
        <div className="eyebrow text-gold mb-2">Clinic staff &nbsp;·&nbsp; Assistant</div>
        <h1 className="font-display italic text-charcoal text-4xl md:text-5xl leading-tight">
          Less admin, between clients.
        </h1>
        <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
          Write up a treatment, keep the order book tidy, and see where the month stands.
        </p>

        {!configured && (
          <div className="mt-8 border border-gold/40 bg-gold/10 text-charcoal text-sm rounded-sm px-4 py-3 leading-relaxed">
            The clinic database is not connected yet. The treatment write-up still works (it saves
            to the patient-notes sheet and drafts the aftercare email). Orders and profit need the
            database. Add <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> in
            Vercel to switch them on.
          </div>
        )}

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
