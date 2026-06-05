import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import { assistantConfigured } from '@/lib/assistant/db'
import { consentReview } from '@/lib/assistant/consent'
import { CONSENT_FORMS } from '@/lib/consent/forms'
import StaffGate from '../../notes/StaffGate'
import ConsentForms from './ConsentForms'
import ConsentMissing from './ConsentMissing'
import ConsentSubmissions from './ConsentSubmissions'

export const metadata: Metadata = {
  title: 'Consent forms',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function ConsentBackendPage() {
  if (!(await isStaffAuthed())) return <StaffGate />

  const forms = CONSENT_FORMS.map((f) => ({ id: f.id, name: f.name }))
  const review = assistantConfigured() ? await consentReview() : null

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-7 md:pt-10 pb-24">
        <div className="eyebrow text-gold mb-2">Clinic staff &nbsp;·&nbsp; Consent forms</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">
          Consent forms.
        </h1>
        <p className="text-ink-soft mt-3 max-w-xl leading-relaxed">
          Send any form to a client, preview it, and read everything they have completed — saved against their record.
        </p>

        {/* Booked clients with nothing on file — who needs a form, with a send button each. */}
        <div className="mt-8">
          <ConsentMissing missing={review?.bookedMissing ?? []} forms={forms} />
        </div>

        {/* One card per form: Send (tracked email) · View (preview) · Link (generic). */}
        <div>
          <ConsentForms forms={forms} />
        </div>

        {/* Outstanding (sent, not completed) + completed submissions. */}
        <div className="mt-12">
          <ConsentSubmissions />
        </div>
      </div>
    </section>
  )
}
