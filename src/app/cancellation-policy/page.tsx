import type { Metadata } from 'next'
import BookingCTA from '@/components/sections/BookingCTA'

export const metadata: Metadata = {
  title: 'Cancellation Policy, Visage Aesthetics',
  description: 'Our appointment cancellation and rescheduling policy, including notice periods and deposits.',
}

export default function CancellationPolicyPage() {
  return (
    <>
      <section className="bg-cream text-charcoal pt-24 md:pt-28 pb-6 md:pb-10 relative overflow-hidden">
        <div className="arc-bg" aria-hidden />
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 relative">
          <div className="text-eyebrow text-stone mb-5">Legal</div>
          <h1 className="font-display italic text-hero text-charcoal max-w-3xl">Cancellation policy.</h1>
          <p className="mt-6 text-body-lg text-ink-soft max-w-2xl">
            We understand that plans change. Here is how cancelling or rescheduling works, so it stays fair for everyone.
          </p>
        </div>
      </section>

      <section className="py-5 md:py-8">
        <div className="max-w-3xl mx-auto px-5 md:px-8 prose prose-lg">
          <p className="text-eyebrow text-ink-soft">Last updated: June 2026</p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Giving notice</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Please give us at least 24 hours&apos; notice if you need to cancel or rearrange your appointment. You can do this any time using the link in your booking confirmation, or by contacting the clinic directly.
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Consultations</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Consultations are always free. There is no booking fee, no deposit and no obligation to proceed, so you are welcome to rearrange whenever you need to.
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Deposits</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Some treatments require a small deposit to secure your appointment. When you give at least 24 hours&apos; notice, your deposit is held and moved across to your new time in full.
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Late cancellations and missed appointments</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            Cancellations made with less than 24 hours&apos; notice, and appointments that are missed without warning, may forfeit the deposit. This reflects the clinic time set aside especially for you, which we are then unable to offer to someone else.
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Running late</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            If you are running behind, please let us know. We will always do our best to see you, though occasionally we may need to shorten the appointment or find you another time.
          </p>

          <h2 className="font-display text-2xl md:text-3xl text-charcoal mt-10 mb-4">Need to make a change?</h2>
          <p className="text-body-lg text-ink-soft leading-relaxed mb-5">
            The quickest way is the manage-booking link in your confirmation email, where you can reschedule or cancel yourself. If anything is unclear, contact the clinic at info@vaclinic.co.uk and we will sort it for you.
          </p>
        </div>
      </section>

      <BookingCTA />
    </>
  )
}
