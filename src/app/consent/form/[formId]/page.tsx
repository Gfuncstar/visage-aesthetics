import type { Metadata } from 'next'
import { getConsentForm } from '@/lib/consent/forms'
import ConsentFormClient from '../../[token]/ConsentFormClient'

export const metadata: Metadata = {
  title: 'Your consent form | Visage Aesthetics',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-xl mx-auto px-5 md:px-8 py-24 text-center">
        <div className="eyebrow text-gold mb-2">Visage Aesthetics</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-4xl leading-tight">{title}</h1>
        <p className="text-ink-soft mt-4 leading-relaxed">{body}</p>
      </div>
    </section>
  )
}

// A consent form sent OUTSIDE the booking system — the generic per-form link
// staff share (e.g. when a form was not completed before the appointment). The
// form is chosen directly by id rather than resolved from a booking, and the
// client fills in their own details.
export default async function StandaloneConsentPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params
  const form = getConsentForm(formId)
  if (!form) {
    return <Notice title="This link is not valid." body="Please contact the clinic and we will send you the right form." />
  }

  return <ConsentFormClient form={form} submitUrl={`/api/consent/standalone/${form.id}`} />
}
