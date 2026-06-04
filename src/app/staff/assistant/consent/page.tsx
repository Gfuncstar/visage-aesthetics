import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { isStaffAuthed } from '@/lib/staff-auth'
import { CONSENT_FORMS } from '@/lib/consent/forms'
import StaffGate from '../../notes/StaffGate'
import ConsentSender from './ConsentSender'
import ConsentSubmissions from './ConsentSubmissions'
import FormSendCards from './FormSendCards'

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
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-14 md:pt-24 pb-24">
        <Link
          href="/staff/assistant"
          className="eyebrow text-stone hover:text-gold-deep transition-colors inline-flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Assistant
        </Link>
        <div className="eyebrow text-gold mb-2">Clinic staff &nbsp;·&nbsp; Consent forms</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">
          Consent forms.
        </h1>
        <p className="text-ink-soft mt-4 max-w-xl leading-relaxed">
          Send a form to a client at any time, preview any form, and read everything they have completed —
          saved against their record.
        </p>

        {/* Send a named client their own tracked link. */}
        <ConsentSender forms={forms} />

        {/* Preview any form, or grab a generic link to send. */}
        <div className="mt-12">
          <h2 className="eyebrow text-gold-deep mb-1">All forms</h2>
          <p className="text-sm text-ink-soft mb-4 max-w-xl leading-relaxed">
            View any form as the client sees it, or copy a generic link to send when you don&rsquo;t need it tied to
            a specific person.
          </p>
          <FormSendCards forms={forms} />
        </div>

        {/* Completed submissions, searchable. */}
        <div className="mt-12">
          <h2 className="eyebrow text-gold-deep mb-4">Completed forms</h2>
          <ConsentSubmissions />
        </div>
      </div>
    </section>
  )
}
