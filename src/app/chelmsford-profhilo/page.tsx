import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Profhilo in Chelmsford, from £180 | Visage Aesthetics',
  description: "Authentic Profhilo skin bio-remodelling for Chelmsford clients at Visage Aesthetics, Braintree, 25 minutes. Best Non-Surgical Aesthetics Clinic 2026, Essex. Bernadette Tobin RGN, MSc. From £180.",
  alternates: { canonical: '/chelmsford-profhilo' },
  openGraph: {
    title: 'Profhilo for Chelmsford Clients | Visage Aesthetics',
    description: 'Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex. Profhilo treatment 25 minutes from Chelmsford. From £180.',
    url: 'https://www.vaclinic.co.uk/chelmsford-profhilo',
  },
}

export default function ChelmsfordProfhilo() {
  return (
    <GeoLandingTemplate
      slug="chelmsford-profhilo"
      town="Chelmsford"
      treatment="Profhilo"
      travel="25 minutes from Chelmsford via the A131 northbound"
      positioningLine="Profhilo is not filler, it is a deep skin bio-remodeller that hydrates from within and stimulates your own collagen. Chelmsford clients drive 25 minutes for the closest Best Non-Surgical Aesthetics Clinic 2026, Essex winner offering authentic IBSA Profhilo from a nurse-led practitioner."
      reasons={[
        { title: 'Authentic IBSA Profhilo', body: "Never relabelled or repackaged. Sourced direct from the manufacturer. Many Chelmsford clinics dilute or substitute, we don't." },
        { title: 'Winner of Best Non-Surgical Aesthetics Clinic 2026, Essex. Nurse-led', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. RGN, MSc Advanced Practice (Level 7), twenty years clinical experience." },
        { title: 'Worth the 25-minute drive', body: "Free on-site parking on Friars Lane. One client in the room at a time. The drive is the easiest part." },
      ]}
      priceFrom="From £180 / single session"
      postcode="CM7 9BL"
      treatmentHref="/treatments/profhilo"
      faqs={[
        {
          question: 'Is Profhilo the same as filler?',
          answer: 'No. Filler adds volume in a specific area. Profhilo spreads through the skin and stimulates the body to produce its own collagen, elastin and hyaluronic acid, improving hydration and texture, never volume. Many Chelmsford clients have both, planned together. The /blog/profhilo-vs-dermal-filler article walks through the distinction in plain English.',
        },
        {
          question: 'How long is the drive from Chelmsford?',
          answer: 'About 25 minutes via the A131 northbound. Free on-site parking, no central-Chelmsford parking faff.',
        },
        {
          question: 'How much does Profhilo cost?',
          answer: 'Single session £180. Recommended course of two sessions four weeks apart £380. Pricing transparent at /pricing.',
        },
        {
          question: 'How quickly will I see results?',
          answer: 'A soft glow appears at 2-3 weeks. The biggest visible change is around 8 weeks after the second session. Profhilo improves gradually rather than dramatically, that is the appeal.',
        },
        {
          question: 'How long does Profhilo last?',
          answer: 'A course of two sessions typically gives 6 to 9 months of visible benefit. Many clients return every six months for a single maintenance session.',
        },
        {
          question: 'Is there any downtime?',
          answer: 'Minimal. Small bumps at the five injection points on each side settle in 12-24 hours. Most Chelmsford clients return to work the same day.',
        },
      ]}
      alsoServes={['Great Baddow', 'Galleywood', 'Writtle', 'Broomfield', 'Springfield', 'Boreham', 'Hatfield Peverel', 'Little Waltham']}
    />
  )
}
