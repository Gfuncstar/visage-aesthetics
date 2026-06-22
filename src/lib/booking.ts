// Single source of truth for the public "Book" link.
//
// Every public "Book" button goes to the in-house booking flow. This is no
// longer gated behind the cutover env var — the in-house system is the only
// booking channel clients ever see. (Ovatu is retained solely as an internal
// emergency fallback during the transition window and is never linked from the
// public site.) Absolute URL so it works in links, the iframe embed, JSON-LD
// and SMS/email text alike.
const INHOUSE_BOOKING_URL = 'https://www.vaclinic.co.uk/book-online'

export const BOOKING_URL = INHOUSE_BOOKING_URL

// In-house booking is same-origin and opens in the same tab.
export const BOOKING_LINK_PROPS = { href: INHOUSE_BOOKING_URL } as const

/** WhatsApp number in international format (no '+' / spaces) for wa.me links */
export const WHATSAPP_NUMBER = '447931395246'

/** Build a wa.me link with an optional pre-filled message */
export const whatsappLink = (message?: string) => {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
