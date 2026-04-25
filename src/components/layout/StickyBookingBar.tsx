'use client'

import { BOOKING_LINK_PROPS } from '@/lib/booking'

export default function StickyBookingBar() {
  return (
    <div
      className="fixed bottom-0 inset-x-0 z-30 lg:hidden"
      style={{ background: '#1F1B1A', borderTop: '1px solid #A8895E', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <a
        {...BOOKING_LINK_PROPS}
        className="flex items-center justify-between h-[60px] px-5 text-cream"
        style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}
      >
        <span>Book a consultation</span>
        <span className="text-gold">→</span>
      </a>
    </div>
  )
}
