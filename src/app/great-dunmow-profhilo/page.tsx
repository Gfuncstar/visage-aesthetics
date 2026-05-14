import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Profhilo in Great Dunmow, from £180 | Visage Aesthetics',
  description: "Authentic Profhilo skin bio-remodelling for Great Dunmow clients at Visage Aesthetics, Braintree, 15 minutes via the A120. Awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. From £180.",
  alternates: { canonical: '/great-dunmow-profhilo' },
  openGraph: {
    title: 'Profhilo for Great Dunmow Clients | Visage Aesthetics',
    description: 'Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex. Profhilo treatment 15 minutes from Great Dunmow. From £180.',
    url: 'https://www.vaclinic.co.uk/great-dunmow-profhilo',
  },
}

export default function GreatDunmowProfhilo() {
  return (
    <GeoLandingTemplate
      slug="great-dunmow-profhilo"
      town="Great Dunmow"
      treatment="Profhilo"
      travel="15 minutes via the A120, free on-site parking"
      positioningLine="Authentic IBSA Profhilo fifteen minutes from Great Dunmow. Skin bio-remodelling that hydrates and stimulates the body's own collagen. The opposite of filler."
      reasons={[
        { title: 'A quick drive across the A120', body: "Fifteen minutes door-to-door. Free parking on Friars Lane, discreet entrance, no shared waiting room." },
        { title: 'Awarded local clinic', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. The closest award-recognised Profhilo clinic for the Great Dunmow, Felsted and Takeley area." },
        { title: 'Authentic IBSA product', body: "Never relabelled or repackaged. Sourced direct from the manufacturer. Performed by a registered nurse with an MSc in Advanced Practice." },
      ]}
      priceFrom="From £180 / single session"
      postcode="CM7 9BL"
      treatmentHref="/treatments/profhilo"
      faqs={[
        {
          question: 'How long is the drive from Great Dunmow?',
          answer: 'Fifteen minutes via the A120. Free parking on Friars Lane. A calmer experience than crossing into Chelmsford or Bishop\'s Stortford.',
        },
        {
          question: 'Is Profhilo a filler?',
          answer: 'No. Filler adds volume; Profhilo spreads through the skin and stimulates the body to produce its own collagen and elastin. The result is hydration, glow and texture, never volume change.',
        },
        {
          question: 'How much does Profhilo cost?',
          answer: 'Single session £180. Course of two sessions (four weeks apart) £380. Includes the genuine IBSA Profhilo product. Profhilo Body priced separately at consultation.',
        },
        {
          question: 'When will I see results?',
          answer: 'Most clients notice a soft glow at 2-3 weeks. The biggest visible change is around 8 weeks after the second session. Improvements compound over a course.',
        },
        {
          question: 'How long does Profhilo last?',
          answer: 'A course of two sessions typically gives 6 to 9 months of visible benefit. Many clients return every six months for a single maintenance session.',
        },
      ]}
      alsoServes={['Felsted', 'Takeley', 'Hatfield Broad Oak', 'Little Dunmow', 'Stebbing', 'Thaxted', 'High Easter']}
    />
  )
}
