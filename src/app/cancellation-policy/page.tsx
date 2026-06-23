import BookingCTA from '@/components/sections/BookingCTA'
import { buildMetadata } from '@/lib/metadata'

export const metadata = buildMetadata({
  title: 'Terms & Conditions, Visage Aesthetics',
  description: 'Our booking terms and conditions, including our 24-hour cancellation and rescheduling policy.',
  path: '/cancellation-policy',
  ogTitle: 'Terms & Conditions',
})

export default function CancellationPolicyPage() {
  return (
    <>
      <section className="bg-cream text-charcoal pt-24 md:pt-28 pb-6 md:pb-10 relative overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <div className="text-eyebrow text-stone mb-5">Legal</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">Terms &amp; conditions.</h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            A few simple terms so booking with us stays clear and fair for everyone.
          </p>
        </div>
      </section>

      <section className="py-5 md:py-8">
        <div className="max-w-3xl mx-auto px-5 md:px-8 prose prose-lg">
          <p className="text-eyebrow text-ink-soft">Last updated: June 2026</p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Cancelling or rescheduling</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            We ask for at least 24 hours&apos; notice if you need to cancel or rearrange your appointment. You can do this any time using the link in your booking confirmation, or by contacting the clinic directly. This gives us the chance to offer your time to someone else.
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Deposits</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            We do not normally take a deposit to book. The only exception is where an appointment has previously been missed without notice — in that case we may ask for a &pound;30 deposit to secure future bookings, which is then put towards your treatment on the day. The &pound;30 deposit stays refundable if you cancel or rearrange with at least 24 hours&apos; notice; within the final 24 hours before your appointment it becomes non-refundable.
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Missed appointments</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Appointments cancelled with less than 24 hours&apos; notice, or missed without warning, mean clinic time set aside especially for you cannot be offered to anyone else. Where this happens repeatedly, we may ask for a deposit to hold any future appointments.
          </p>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            We reserve the right, where an appointment has been missed, to decline to carry out the treatment on the day and to decline future bookings.
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Consultations</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Consultations are always free, with no booking fee and no obligation to proceed. We do ask for at least 24 hours&apos; notice if you need to rearrange — consultations cannot be rearranged with less than 24 hours&apos; notice.
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Running late</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            If you are running behind, please let us know. We will always do our best to see you, though occasionally we may need to shorten the appointment or find you another time.
          </p>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Arriving more than 10 minutes after your appointment time is treated as a missed appointment. Where this happens we reserve the right to cancel the appointment, and any deposit will not be refunded.
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Review appointments</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Review appointments are offered two to three weeks after anti-wrinkle treatments. This is a clinical assessment, not a guaranteed top-up — any further product is only given where it is judged clinically appropriate. Anything later than three weeks cannot be reviewed. It is the client&apos;s responsibility to book their review appointment.
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Making a change</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            The quickest way is the manage-booking link in your confirmation email, where you can reschedule or cancel yourself. If anything is unclear, contact the clinic at info@vaclinic.co.uk and we will sort it for you.
          </p>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
