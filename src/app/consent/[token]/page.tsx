import type { Metadata } from 'next'
import { assistantConfigured, select } from '@/lib/assistant/db'
import { consentFormForService } from '@/lib/consent/forms'
import type { Booking } from '@/lib/booking-engine/types'
import ConsentFormClient from './ConsentFormClient'

export const metadata: Metadata = {
  title: 'Your consent form | Visage Aesthetics',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f-]{36}$/i

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

export default async function ConsentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  if (!assistantConfigured()) {
    return <Notice title="This link is not available." body="Please contact the clinic and we will help you complete your form." />
  }
  if (!UUID_RE.test(token)) {
    return <Notice title="This link is not valid." body="Please use the link from your confirmation email, or contact the clinic." />
  }

  let booking: Booking | null = null
  try {
    const rows = await select<Booking>('bookings', { manage_token: `eq.${token}`, limit: 1 })
    booking = rows[0] ?? null
  } catch {
    return <Notice title="Something went wrong." body="Please try again shortly, or contact the clinic." />
  }
  if (!booking) {
    return <Notice title="We could not find that booking." body="Please use the link from your confirmation email, or contact the clinic." />
  }

  const form = consentFormForService(booking.service_slug, booking.service_name)
  if (!form) {
    return (
      <Notice
        title="No form needed."
        body={`There is no form to complete for your ${booking.service_name} appointment. We look forward to seeing you.`}
      />
    )
  }

  // Already completed? Don't let it be filled in twice.
  let alreadySubmitted = false
  try {
    const done = await select<{ id: string }>('consent_submissions', {
      booking_id: `eq.${booking.id}`,
      select: 'id',
      limit: 1,
    })
    alreadySubmitted = done.length > 0
  } catch {
    /* table may not exist yet; allow the form to render */
  }
  if (alreadySubmitted) {
    return (
      <Notice
        title="Thank you — your form is complete."
        body="We have your consent form on file. There is nothing more to do before your appointment."
      />
    )
  }

  return (
    <ConsentFormClient
      form={form}
      submitUrl={`/api/book/consent/${token}`}
      clientName={booking.client_name}
      serviceName={booking.service_name}
    />
  )
}
