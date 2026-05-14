import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Profhilo in Colchester, from £180 | Visage Aesthetics',
  description: "Authentic Profhilo skin bio-remodelling for Colchester clients at Visage Aesthetics, Braintree, 25 minutes away. Awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. Bernadette Tobin RGN, MSc. From £180.",
  alternates: { canonical: '/colchester-profhilo' },
  openGraph: {
    title: 'Profhilo for Colchester Clients | Visage Aesthetics',
    description: 'Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex. Profhilo treatment 25 minutes from Colchester. From £180.',
    url: 'https://www.vaclinic.co.uk/colchester-profhilo',
  },
}

export default function ColchesterProfhilo() {
  return (
    <GeoLandingTemplate
      slug="colchester-profhilo"
      town="Colchester"
      treatment="Profhilo"
      travel="25 minutes from central Colchester, free on-site parking"
      positioningLine="Authentic IBSA Profhilo twenty-five minutes from Colchester. Hydration, glow and texture improvement, never volume change. Performed by an awarded registered nurse."
      reasons={[
        { title: 'Worth the 25-minute drive', body: "Free parking on Friars Lane, one client at a time, no salon vibe. Many Colchester clients prefer the quieter experience to the busier salons on their side." },
        { title: 'Authentic IBSA Profhilo', body: "Never relabelled, never repackaged. Sourced direct from the manufacturer. The same product the peer-reviewed clinical evidence is based on." },
        { title: 'Winner — Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards)', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. RGN, MSc Advanced Practice (Level 7), twenty years of clinical experience. Most Colchester injectors are Level 4-5." },
      ]}
      priceFrom="From £180 / single session"
      postcode="CM7 9BL"
      treatmentHref="/treatments/profhilo"
      faqs={[
        {
          question: 'How long is the drive from Colchester?',
          answer: 'About twenty-five minutes via the A12 and A120. Free on-site parking on Friars Lane. Many Colchester clients combine the trip with lunch or shopping in central Braintree.',
        },
        {
          question: 'Is Profhilo a filler?',
          answer: 'No. Filler adds volume; Profhilo spreads through the skin and stimulates the body to produce its own collagen, elastin and hyaluronic acid. The result is texture and glow, never volume change.',
        },
        {
          question: 'How much does Profhilo cost?',
          answer: 'Single session £180. Course of two sessions (four weeks apart) £380. Includes the genuine IBSA Profhilo product.',
        },
        {
          question: 'When will I see results?',
          answer: 'Most clients notice a soft glow at 2-3 weeks after the first session. The biggest visible change is around 8 weeks after the second session. Profhilo improves gradually rather than dramatically.',
        },
        {
          question: 'How long does Profhilo last?',
          answer: 'A course of two sessions typically gives 6 to 9 months of visible benefit before maintenance is recommended.',
        },
      ]}
      alsoServes={['Stanway', 'Marks Tey', 'Lexden', 'Tiptree', 'West Bergholt', 'Wivenhoe', 'Highwoods']}
    />
  )
}
