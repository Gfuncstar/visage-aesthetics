// Single source of truth for the Ovatu booking system.
// Update this URL if the Ovatu account ever changes.
export const BOOKING_URL = 'https://visage-aesthetics.book.app/book-now'

export const BOOKING_LINK_PROPS = {
  href: BOOKING_URL,
  target: '_blank' as const,
  rel: 'noopener noreferrer',
}
