import { BOOKING_LINK_PROPS } from '@/lib/booking'

export default function BookingCTA() {
  return (
    <section className="reveal" style={{ background: '#1F1B1A', color: '#F5F0EC', padding: 'var(--section-y) var(--pad-x)' }}>
      <div className="max-w-[820px] mx-auto">
        <div className="section-num mb-8" style={{ color: 'rgba(245, 240, 236, 0.55)' }}>
          <span className="hairline" style={{ background: 'rgba(245, 240, 236, 0.4)' }} />
          06 &nbsp; Begin
        </div>
        <h2 className="text-h1 reveal" style={{ color: '#F5F0EC' }}>
          Ready when you are.
        </h2>
        <p className="reveal mt-8 max-w-xl" style={{ color: 'rgba(245, 240, 236, 0.7)', fontSize: 17, lineHeight: 1.7 }}>
          Book a no-obligation consultation with Bernadette. We&apos;ll talk through what you&apos;re hoping for, what&apos;s realistic, and what isn&apos;t needed.
        </p>
        <div className="reveal mt-14 flex flex-col md:flex-row gap-4">
          <a {...BOOKING_LINK_PROPS} className="btn btn-primary btn-md:auto">
            <span>Book a consultation</span>
            <span className="btn-arrow">→</span>
          </a>
          <a href="mailto:info@vaclinic.co.uk" className="btn btn-ghost-dark btn-md:auto">
            <span>Email the clinic</span>
            <span className="btn-arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
