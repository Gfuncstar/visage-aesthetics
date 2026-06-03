import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { isStaffAuthed } from '@/lib/staff-auth'
import { CONSENT_FORMS } from '@/lib/consent/forms'
import StaffGate from '../../notes/StaffGate'
import ConsentSubmissions from './ConsentSubmissions'
import FormSendCards from './FormSendCards'

export const metadata: Metadata = {
  title: 'Consent forms',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function ConsentBackendPage() {
  if (!(await isStaffAuthed())) return <StaffGate />

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
          Send a client a form to fill in, and read everything that comes back. Forms normally go out with the
          booking confirmation — use the cards below to send one separately when it was missed.
        </p>

        <div className="mt-10">
          <h2 className="eyebrow text-gold-deep mb-1">Send a form</h2>
          <p className="text-sm text-ink-soft mb-4 max-w-xl leading-relaxed">
            For when a form needs to go out on its own — for example if a client didn&rsquo;t complete it before
            their appointment. Copy the link and send it however you like; the completed form appears below.
          </p>
          <FormSendCards forms={CONSENT_FORMS.map((f) => ({ id: f.id, name: f.name }))} />
        </div>

        <div className="mt-12">
          <h2 className="eyebrow text-gold-deep mb-4">Completed forms</h2>
          <ConsentSubmissions />
        </div>
      </div>
    </section>
  )
}
