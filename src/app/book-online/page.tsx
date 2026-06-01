import type { Metadata } from 'next'
import BookingFlow from './BookingFlow'

export const metadata: Metadata = {
  title: 'Book online | Visage Aesthetics',
  description: 'Book your appointment at Visage Aesthetics, Braintree.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/book-online' },
}

export const dynamic = 'force-dynamic'

export default function BookOnlinePage() {
  return <BookingFlow />
}
