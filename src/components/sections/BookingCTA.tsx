import Link from 'next/link'
import { Award as AwardIcon, CalendarClock } from 'lucide-react'
import { BOOKING_LINK_PROPS } from '@/lib/booking'
import { AWARD } from '@/lib/award'

export default function BookingCTA({ sectionNumber = '06' }: { sectionNumber?: string } = {}) {
  return (
    <section style={{ background: '#1F1B1A', color: '#F5F0EC', padding: 'var(--section-y) var(--pad-x)' }}>
      <div className="max-w-[820px] mx-auto">
        <div className="section-num mb-8" style={{ color: 'rgba(245, 240, 236, 0.55)' }}>
          <span className="hairline" style={{ background: 'rgba(245, 240, 236, 0.4)' }} />
          {sectionNumber} &nbsp; Begin
        </div>
        <h2 className="text-h1" style={{ color: '#F5F0EC' }}>
          Ready when you are.
        </h2>
        <p className="mt-8 max-w-xl" style={{ color: 'rgba(245, 240, 236, 0.7)', fontSize: 17, lineHeight: 1.7 }}>
          Book a no-obligation consultation with me. We&apos;ll talk through what you&apos;re hoping for, what&apos;s realistic, and what isn&apos;t needed.
        </p>
        <div className="mt-14 flex flex-col md:flex-row gap-4">
          <a {...BOOKING_LINK_PROPS} className="btn btn-primary btn-md:auto">
            <span>Book a consultation</span>
            <span className="btn-arrow">→</span>
          </a>
          <a
            href="https://wa.me/447931395246"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost-dark btn-md:auto"
          >
            <span>Chat on WhatsApp</span>
            <span className="btn-arrow">→</span>
          </a>
          <a href="mailto:info@vaclinic.co.uk" className="btn btn-ghost-dark btn-md:auto">
            <span>Email the clinic</span>
            <span className="btn-arrow">→</span>
          </a>
        </div>
        <Link href="/manage" className="btn btn-ghost-dark btn-md:auto mt-4">
          <span>Manage my appointment</span>
          <span className="btn-arrow">→</span>
        </Link>
        <p
          className="mt-5 inline-flex items-center gap-2"
          style={{ color: 'rgba(245, 240, 236, 0.6)', fontSize: 12, letterSpacing: '0.04em' }}
        >
          <CalendarClock size={13} strokeWidth={1.5} style={{ color: '#C09F6E' }} />
          <span>Most weeks book a few days out &middot; strictly by appointment, one client in the clinic at a time</span>
        </p>
        <Link
          href={AWARD.detailPath}
          className="mt-8 inline-flex items-center gap-2 group"
          style={{ color: '#C09F6E', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}
        >
          <AwardIcon size={14} strokeWidth={1.5} />
          <span className="border-b border-transparent group-hover:border-current pb-0.5 transition-colors">
            Book with the awarded clinic · {AWARD.shortName}
          </span>
        </Link>
      </div>
    </section>
  )
}
