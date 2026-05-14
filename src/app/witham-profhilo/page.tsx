import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Profhilo in Witham, from £180 | Visage Aesthetics',
  description: "Authentic Profhilo skin bio-remodelling for Witham clients at Visage Aesthetics, Braintree, 12 minutes away. Awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. Bernadette Tobin RGN, MSc. From £180.",
  alternates: { canonical: '/witham-profhilo' },
  openGraph: {
    title: 'Profhilo for Witham Clients | Visage Aesthetics',
    description: 'Officially awarded Profhilo treatment 12 minutes from Witham. From £180.',
    url: 'https://www.vaclinic.co.uk/witham-profhilo',
  },
}

export default function WithamProfhilo() {
  return (
    <GeoLandingTemplate
      slug="witham-profhilo"
      town="Witham"
      treatment="Profhilo"
      travel="12 minutes from central Witham, free on-site parking"
      positioningLine="Authentic IBSA Profhilo twelve minutes from Witham. Skin bio-remodelling that hydrates from within and stimulates collagen. Not filler, entirely different result."
      reasons={[
        { title: 'A short, calm appointment', body: "Profhilo uses the BAP injection technique, five small points each side. Around 30 minutes total. Most Witham clients are back to work the same day, no visible signs." },
        { title: 'Authentic IBSA Profhilo', body: "Never relabelled, never repackaged, sourced direct from the manufacturer. The same product the clinical evidence is based on." },
        { title: 'Awarded local clinic', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. NMC registered, MSc Advanced Practice (Level 7), 20+ years clinical experience." },
      ]}
      priceFrom="From £180 / single session"
      postcode="CM7 9BL"
      treatmentHref="/treatments/profhilo"
      faqs={[
        {
          question: 'How long is the drive from Witham?',
          answer: 'Twelve minutes via the A12 and B1018 / A131. Free parking on Friars Lane, discreet entrance, strictly one client at a time.',
        },
        {
          question: 'Is Profhilo a filler?',
          answer: 'No. Filler adds volume in a specific area. Profhilo spreads through the skin and stimulates the body to produce its own collagen, elastin and hyaluronic acid. The result is hydration, glow and texture improvement, never volume change.',
        },
        {
          question: 'How much does Profhilo cost?',
          answer: 'Single session £180. Course of two sessions (four weeks apart) £380. The fee includes the genuine IBSA Profhilo product. Profhilo Body priced separately at consultation.',
        },
        {
          question: 'How quickly will I see results?',
          answer: 'Most clients notice a soft glow at 2-3 weeks after the first session. The biggest visible change is around 8 weeks after the second session. Profhilo improves gradually rather than dramatically.',
        },
        {
          question: 'How long does Profhilo last?',
          answer: 'A course of two sessions typically gives 6 to 9 months of visible benefit. Maintenance every six months is common.',
        },
      ]}
      alsoServes={['Hatfield Peverel', 'Wickham Bishops', 'Tiptree', 'Kelvedon', 'Feering', 'Silver End', 'Terling']}
    />
  )
}
