import type { Metadata } from 'next'
import BookLandingTemplate from '@/components/sections/BookLandingTemplate'

export const metadata: Metadata = {
  title: 'Book Lip & Dermal Filler in Essex | Winner — Best Non-Surgical Clinic 2026',
  description: 'Free consultation for hyaluronic acid filler at Visage Aesthetics, Braintree. Subtle, balanced, fully reversible. Winner of Best Non-Surgical Aesthetics Clinic 2026, Essex.',
  alternates: { canonical: '/book/filler' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Book Filler — Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex',
    description: 'Subtle, reversible lip & dermal filler. Free consultation in Braintree.',
    url: 'https://www.vaclinic.co.uk/book/filler',
    images: [{
      url: '/og?title=Book+Filler+in+Essex&eyebrow=Winner+2026+Best+Non-Surgical+Clinic',
      width: 1200,
      height: 630,
      alt: 'Book lip and dermal filler at Visage Aesthetics, Braintree',
    }],
  },
}

export default function BookFillerPage() {
  return (
    <BookLandingTemplate
      slug="filler"
      treatment="filler"
      heroHeadline="Filler by the winner of Essex 2026."
      heroSubhead="Free consultation. Subtle, balanced, fully reversible hyaluronic acid filler by Bernadette Tobin RGN, MSc — winner of Best Non-Surgical Aesthetics Clinic 2026, Essex."
      priceLine="From £110 / 0.5ml lips · £200 / 1ml cheek"
      trustBullets={[
        'Conservative by default — we start at 0.5ml, never more in one sitting. Lots of clients arrive after over-treatment elsewhere. The fix is rarely more product.',
        'Hyaluronic acid only, fully reversible with hyaluronidase if you change your mind. Reversal product kept on site. No permanent or semi-permanent filler at Visage.',
        'Performed by an NMC-registered nurse with MSc Advanced Practice (Level 7), twenty years clinical experience. Award verifiable.',
      ]}
      faqs={[
        {
          question: 'Will my lips look obvious or "duck-like"?',
          answer: 'Not when dosed conservatively, which is the entire approach at Visage. We aim for "your lips on a good day" — naturally balanced, hydrated, slightly defined. No tray-table profile.',
        },
        {
          question: 'How much does filler cost?',
          answer: '£110 for 0.5ml lips, £200 for 1ml lips, £200 per ml cheek, £250 per ml jawline or chin. Free consultation, written quote, no booking pressure.',
        },
        {
          question: 'Is it reversible?',
          answer: 'Yes. We only use hyaluronic acid filler, which can be dissolved within 24-48 hours using hyaluronidase if needed. We keep reversal product on site as standard.',
        },
        {
          question: 'How long does it last?',
          answer: 'Lips typically 9-12 months, cheeks and jawline 12-18 months. The product metabolises gradually — your face returns smoothly to baseline, never below.',
        },
        {
          question: 'Why does the award matter?',
          answer: "Aesthetics in the UK is largely unregulated. The Health, Beauty & Wellness Awards are independently judged. Visage was named Best Non-Surgical Aesthetics Clinic 2026 for Essex — verifiable on the awarding body's public winners listing.",
        },
      ]}
      whatsappMessage="Hi, I'd like to ask about filler at Visage Aesthetics."
    />
  )
}
