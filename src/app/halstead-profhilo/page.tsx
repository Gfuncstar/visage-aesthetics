import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Profhilo Halstead | Award-Winning Nurse-Led | Visage Aesthetics',
  description: "Authentic Profhilo skin bio-remodelling for Halstead clients at Visage Aesthetics, Braintree — 12 minutes via the A131. Best Non-Surgical Aesthetics Clinic 2026 — Essex. From £300.",
  alternates: { canonical: '/halstead-profhilo' },
  openGraph: {
    title: 'Profhilo for Halstead Clients | Visage Aesthetics',
    description: 'Award-winning Profhilo treatment 12 minutes from Halstead. From £300.',
    url: 'https://www.vaclinic.co.uk/halstead-profhilo',
  },
}

export default function HalsteadProfhilo() {
  return (
    <GeoLandingTemplate
      slug="halstead-profhilo"
      town="Halstead"
      treatment="Profhilo"
      travel="12 minutes from Halstead via the A131 southbound"
      positioningLine="Profhilo is the treatment for Halstead clients whose skin has lost its bounce, glow or smoothness — but who don't want or need volume change. The closest award-winning clinic, 12 minutes down the A131."
      reasons={[
        { title: 'Twelve minutes from Halstead', body: "Closer than driving to Colchester or Chelmsford for the same treatment. Free on-site parking on Friars Lane." },
        { title: 'Award-winning local clinic', body: "Best Non-Surgical Aesthetics Clinic 2026 — Essex. The closest award-recognised clinic for Halstead, Earls Colne and Sible Hedingham." },
        { title: 'Authentic IBSA Profhilo', body: "Sourced direct from the manufacturer. Never diluted, never substituted. The same product the clinical evidence is based on." },
      ]}
      priceFrom="From £300 / single session"
      postcode="CM7 9BL"
      treatmentHref="/treatments/profhilo"
      faqs={[
        {
          question: 'How far is Visage from Halstead for Profhilo?',
          answer: 'Roughly 12 minutes by car via the A131 southbound. The same drive most Halstead residents already make to get to Braintree town centre.',
        },
        {
          question: 'How is Profhilo different from filler?',
          answer: 'Filler adds volume in a specific area. Profhilo spreads through the skin and stimulates your own collagen, elastin and hyaluronic acid — improving hydration and glow rather than volume. Many clients have both, planned together. /blog/profhilo-vs-dermal-filler walks through this in plain English.',
        },
        {
          question: 'How much does Profhilo cost?',
          answer: 'Single session £300. Recommended course of two sessions £550 (saves £50). Pricing transparent at /pricing.',
        },
        {
          question: 'When will I see results?',
          answer: 'Soft glow at 2-3 weeks; biggest change around 8 weeks after the second session. Profhilo builds gradually.',
        },
        {
          question: 'How long does Profhilo last?',
          answer: '6 to 9 months from a course of two sessions. Most clients return every six months for a maintenance session.',
        },
        {
          question: 'Is there any downtime?',
          answer: 'Minimal. Small bumps at the five injection points on each side settle within 12-24 hours. Most Halstead clients return to work the same day.',
        },
      ]}
      alsoServes={['Earls Colne', 'Sible Hedingham', 'Castle Hedingham', 'Gosfield', 'Greenstead Green', 'Pebmarsh', 'White Colne', 'Wakes Colne']}
    />
  )
}
