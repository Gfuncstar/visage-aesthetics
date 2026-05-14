import type { Metadata } from 'next'
import BookLandingTemplate from '@/components/sections/BookLandingTemplate'

export const metadata: Metadata = {
  title: 'Book Profhilo in Essex | Winner — Best Non-Surgical Aesthetics Clinic 2026',
  description: 'Free consultation for authentic IBSA Profhilo skin bio-remodelling at Visage Aesthetics, Braintree. Winner of Best Non-Surgical Aesthetics Clinic 2026, Essex.',
  alternates: { canonical: '/book/profhilo' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Book Profhilo — Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex',
    description: 'Authentic IBSA Profhilo. Free consultation in Braintree.',
    url: 'https://www.vaclinic.co.uk/book/profhilo',
    images: [{
      url: '/og?title=Book+Profhilo+in+Essex&eyebrow=Winner+2026+Best+Non-Surgical+Clinic',
      width: 1200,
      height: 630,
      alt: 'Book Profhilo at Visage Aesthetics, Braintree',
    }],
  },
}

export default function BookProfhiloPage() {
  return (
    <BookLandingTemplate
      slug="profhilo"
      treatment="Profhilo"
      heroHeadline="Profhilo by the winner of Essex 2026."
      heroSubhead="Free consultation. Authentic IBSA Profhilo at Visage Aesthetics, Braintree — winner of Best Non-Surgical Aesthetics Clinic 2026, Essex. Hydration, bounce and glow, never volume."
      priceLine="From £180 / session · £380 for a course of two"
      trustBullets={[
        'Authentic IBSA Profhilo — sourced direct from the manufacturer, never relabelled or repackaged. The same product the peer-reviewed clinical evidence is based on.',
        'Profhilo is not filler. It spreads through the skin and stimulates your own collagen, elastin and hyaluronic acid — texture and glow, never volume change.',
        'Performed by an NMC-registered nurse with MSc Advanced Practice (Level 7), twenty years clinical experience. Award verifiable.',
      ]}
      faqs={[
        {
          question: 'Is Profhilo a filler?',
          answer: 'No. Filler adds volume in a specific area. Profhilo spreads through the skin and stimulates the body to produce its own collagen, elastin and hyaluronic acid — the result is hydration and texture, never volume.',
        },
        {
          question: 'How much does Profhilo cost?',
          answer: 'Single session £180. Recommended course of two sessions (four weeks apart) £380. Free consultation, no booking pressure.',
        },
        {
          question: 'When will I see results?',
          answer: 'Most clients notice a soft glow at 2-3 weeks. The biggest visible change is around 8 weeks after the second session. Profhilo improves gradually, never dramatically — friends say you look well rested, not that you look different.',
        },
        {
          question: 'How long does it last?',
          answer: 'A course of two sessions typically gives 6 to 9 months of visible benefit before maintenance is recommended. Many clients return every six months.',
        },
        {
          question: 'Why does the award matter?',
          answer: "Aesthetics in the UK is largely unregulated. The Health, Beauty & Wellness Awards are independently judged by industry peers. Visage Aesthetics was named Best Non-Surgical Aesthetics Clinic 2026 for Essex — verifiable on the awarding body's public winners listing.",
        },
      ]}
      whatsappMessage="Hi, I'd like to ask about Profhilo at Visage Aesthetics."
    />
  )
}
