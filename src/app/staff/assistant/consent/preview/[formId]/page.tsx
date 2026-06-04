import type { Metadata } from 'next'
import { isStaffAuthed } from '@/lib/staff-auth'
import { getConsentForm } from '@/lib/consent/forms'
import StaffGate from '../../../../notes/StaffGate'
import ConsentFormView from '../../ConsentFormView'

export const metadata: Metadata = {
  title: 'Preview consent form',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

export default async function ConsentFormPreviewPage({ params }: { params: Promise<{ formId: string }> }) {
  if (!(await isStaffAuthed())) return <StaffGate />
  const { formId } = await params
  const form = getConsentForm(formId)

  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-7 md:pt-10 pb-24">
        {!form ? (
          <>
            <div className="eyebrow text-gold mb-2">Clinic staff &nbsp;·&nbsp; Preview</div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-4xl leading-tight">
              Form not found.
            </h1>
            <p className="text-ink-soft mt-4 leading-relaxed">That form does not exist. Go back and pick one of the cards.</p>
          </>
        ) : (
          <>
            <div className="eyebrow text-gold mb-2">Clinic staff &nbsp;·&nbsp; Preview</div>
            <h1 className="font-display italic text-charcoal text-3xl md:text-4xl leading-tight">{form.name}</h1>
            <p className="text-ink-soft mt-3 leading-relaxed">
              This is the form as the client sees it — read-only here. Use{' '}
              <span className="text-charcoal">Send</span> on the card to email it to a client.
            </p>
            <ConsentFormView form={form} />
          </>
        )}
      </div>
    </section>
  )
}
