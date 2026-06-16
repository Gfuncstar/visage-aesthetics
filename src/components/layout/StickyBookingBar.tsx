'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn, MessageCircle, ArrowUpRight } from 'lucide-react'
import { BOOKING_URL, whatsappLink } from '@/lib/booking'

const WHATSAPP_PREFILL = "Hi, I'd like to ask about "

/**
 * Mobile-only sticky booking bar — three equal segments:
 *  ⇥ Login · 💬 WhatsApp · → Book
 *
 * Renders from the root layout, but hides itself on /contact (where the
 * Ovatu iframe is the page) so it doesn't double-up the booking entry.
 */
export default function StickyBookingBar() {
  const pathname = usePathname()
  // Opt out on the Visit / booking page itself, and across the staff area.
  if (pathname === '/contact' || pathname?.startsWith('/staff')) return null

  return (
    <div
      className="sticky-booking-bar fixed bottom-0 inset-x-0 z-30 lg:hidden"
      style={{
        background: '#1F1B1A',
        borderTop: '1px solid #A8895E',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="grid grid-cols-3 h-[60px] divide-x" style={{ borderColor: 'rgba(245, 240, 236, 0.12)' }}>
        <Link
          href="/account"
          className="flex items-center justify-center gap-2 text-cream"
          style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, borderRight: '1px solid rgba(245, 240, 236, 0.12)' }}
          aria-label="Member login"
        >
          <LogIn size={14} strokeWidth={1.5} />
          <span>Login</span>
        </Link>
        <a
          href={whatsappLink(WHATSAPP_PREFILL)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-cream"
          style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, borderRight: '1px solid rgba(245, 240, 236, 0.12)' }}
          aria-label="Message on WhatsApp"
        >
          <MessageCircle size={14} strokeWidth={1.5} />
          <span>WhatsApp</span>
        </a>
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2"
          style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, color: '#1F1B1A', background: '#A8895E' }}
          aria-label="Book a consultation"
        >
          <span>Book</span>
          <ArrowUpRight size={14} strokeWidth={1.75} />
        </a>
      </div>
    </div>
  )
}
