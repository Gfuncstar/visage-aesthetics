import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import { CONSENT_FORMS } from '@/lib/consent/forms'
import StaffGate from '../../notes/StaffGate'
import ConsentForms from './ConsentForms'
import ConsentSubmissions from './ConsentSubmissions'

export const metadata: Metadata = {
  title: 'Consent forms',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function ConsentBackendPage() {
  if (!(await isStaffAuthed())) return <StaffGate />

  const forms = CONSENT_FORMS.map((f) => ({ id: f.id, name: f.name }))

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

        {/* One card per form: Send (tracked email) · View (preview) · Link (generic). */}
        <div className="mt-8">
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
