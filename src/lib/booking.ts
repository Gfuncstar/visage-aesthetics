// Single source of truth for the public "Book" link.
//
// Before go-live it points at the Ovatu widget. Once the cutover switch is set
// (NEXT_PUBLIC_CUTOVER=go) it swaps to the in-house booking flow automatically,
// so every "Book" button across the site moves over in one go. Absolute URL so
// it works in links, the iframe embed, JSON-LD and SMS/email text alike.
import { cutoverLive } from '@/lib/assistant/go-live'

const OVATU_BOOKING_URL = 'https://visage-aesthetics.book.app/book-now'
const INHOUSE_BOOKING_URL = 'https://www.vaclinic.co.uk/book-online'

export const BOOKING_URL = cutoverLive() ? INHOUSE_BOOKING_URL : OVATU_BOOKING_URL

// In-house booking is same-origin and opens in the same tab; the Ovatu widget
// is external and opens in a new tab.
export const BOOKING_LINK_PROPS = cutoverLive()
  ? ({ href: INHOUSE_BOOKING_URL } as const)
  : ({ href: OVATU_BOOKING_URL, target: '_blank' as const, rel: 'noopener noreferrer' })

/** WhatsApp number in international format (no '+' / spaces) for wa.me links */
export const WHATSAPP_NUMBER = '447931395246'

/** Build a wa.me link with an optional pre-filled message */
export const whatsappLink = (message?: string) => {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
