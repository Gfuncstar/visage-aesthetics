import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Profhilo in Braintree, from £180 | Visage Aesthetics',
  description: "Profhilo skin bio-remodelling in Braintree, Essex by Bernadette Tobin RGN, MSc (NMC PIN 05G1755E). Best Non-Surgical Aesthetics Clinic 2026. From £180. Hyaluronic acid, deep hydration, no fill.",
  alternates: { canonical: '/braintree-profhilo' },
  openGraph: {
    title: 'Profhilo in Braintree | Visage Aesthetics',
    description: 'Officially awarded Profhilo treatment on Friars Lane, Braintree. From £180.',
    url: 'https://www.vaclinic.co.uk/braintree-profhilo',
  },
}

export default function BraintreeProfhilo() {
  return (
    <GeoLandingTemplate
      slug="braintree-profhilo"
      town="Braintree"
      treatment="Profhilo"
      travel="Central Braintree, Friars Lane (CM7 9BL)"
      positioningLine="Profhilo is not filler, it is a deep skin bio-remodeller. Performed in Braintree by a registered nurse with twenty years' clinical experience and an MSc in Advanced Practice."
      reasons={[
        { title: 'Hydration, not fill', body: "Profhilo deeply hydrates from within and stimulates collagen and elastin. The result is glow, bounce and texture, never volume change. Subtler and more natural than filler." },
        { title: 'Officially awarded local clinic', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. Authentic Profhilo from IBSA, never relabelled or repackaged. Two sessions, four weeks apart, included in the course price." },
        { title: 'A short, calm appointment', body: "Profhilo uses the BAP injection technique, five small points on each side. Around 30 minutes. Most Braintree clients walk in on their lunch break and back out without any visible signs." },
      ]}
      priceFrom="From £180 / single session"
      postcode="CM7 9BL"
      treatmentHref="/treatments/profhilo"
      faqs={[
        {
          question: 'Is Profhilo the same as filler?',
          answer: 'No, and the distinction matters. Filler adds volume in a specific area (lips, cheeks). Profhilo spreads through the skin and stimulates the body to produce its own collagen, elastin and hyaluronic acid. The result is hydration and texture improvement across the whole treated area, never a volume change. Many of our Braintree clients have both, they do completely different jobs.',
        },
        {
          question: 'How much does Profhilo cost in Braintree?',
          answer: 'A single session is £180. The recommended course of two sessions (four weeks apart) is £380. See the full pricing page for all treatments.',
        },
        {
          question: 'How quickly will I see results?',
          answer: 'Most clients begin to see a soft glow at 2-3 weeks, with the biggest visible change around 8 weeks. Profhilo improves gradually rather than dramatically, that is the appeal.',
        },
        {
          question: 'How long does Profhilo last?',
          answer: 'A course of two sessions typically gives 6 to 9 months of visible benefit before maintenance is suggested. Many clients return every six months.',
        },
        {
          question: 'Is there any downtime?',
          answer: 'Minimal. There can be small bumps at the five injection points on each side for 12-24 hours which settle quickly. Most clients return to work the same day.',
        },
        {
          question: 'Can Profhilo be used on the body?',
          answer: 'Yes, Profhilo Body is licensed for use on the upper arms, neck, décolletage and abdomen. Particularly effective for the crepey skin sometimes seen on the inner upper arm. Ask at consultation.',
        },
      ]}
      alsoServes={['Bocking', 'Rayne', 'Coggeshall', 'Cressing', 'Felsted', 'Great Notley', 'Black Notley', 'Stisted']}
    />
  )
}
