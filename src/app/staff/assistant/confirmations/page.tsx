import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured } from '@/lib/assistant/db'
import { confirmationReview } from '@/lib/assistant/confirmations'
import StaffGate from '../../notes/StaffGate'
import Confirmations from './Confirmations'

export const metadata: Metadata = {
  title: 'Appointment confirmations',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function ConfirmationsPage() {
  if (!(await isStaffAuthed())) return <StaffGate />

  const review = assistantConfigured() ? await confirmationReview() : null
  const items = review?.unconfirmed ?? []

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-7 md:pt-10 pb-24">
        <div className="eyebrow text-gold mb-2">Clinic staff &nbsp;·&nbsp; Confirmations</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">Who hasn’t confirmed.</h1>
        <p className="text-ink-soft mt-3 max-w-xl leading-relaxed">
          Everyone booked in the next day or so who was sent a “confirm you’re coming” message but hasn’t replied yet.
          Message them again, or mark them confirmed if they’ve let you know another way.
        </p>

        <div className="mt-8">
          <Confirmations items={items} />
        </div>
      </div>
    </section>
  )
}
