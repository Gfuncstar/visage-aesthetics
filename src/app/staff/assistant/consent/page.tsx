import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { isStaffAuthed } from '@/lib/staff-auth'
import StaffGate from '../../notes/StaffGate'
import { CONSENT_FORMS } from '@/lib/consent/forms'
import ConsentSender from './ConsentSender'
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
          Send a form to a client at any time, and read everything they have completed, saved against their record.
        </p>

        <ConsentSender forms={forms} />
        <ConsentSubmissions />
      </div>
    </section>
  )
}
