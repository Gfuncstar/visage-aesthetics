// Single source of truth for the Ovatu booking system.
// Update this URL if the Ovatu account ever changes.
export const BOOKING_URL = 'https://visage-aesthetics.book.app/book-now'

export const BOOKING_LINK_PROPS = {
  href: BOOKING_URL,
  target: '_blank' as const,
  rel: 'noopener noreferrer',
}

/** WhatsApp number in international format (no '+' / spaces) for wa.me links */
export const WHATSAPP_NUMBER = '447931395246'

/** Build a wa.me link with an optional pre-filled message */
export const whatsappLink = (message?: string) => {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}
