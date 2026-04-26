import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Botox Witham | Award-Winning Nurse-Led Clinic | Visage Aesthetics',
  description: "Anti-wrinkle (Botox) injections for Witham clients at Visage Aesthetics, Braintree — 12 minutes away. Best Non-Surgical Aesthetics Clinic 2026 — Essex. Bernadette Tobin RGN, MSc. From £120.",
  alternates: { canonical: '/witham-botox' },
  openGraph: {
    title: 'Botox for Witham Clients | Visage Aesthetics',
    description: 'Award-winning nurse-led Botox clinic 12 minutes from Witham. From £120.',
    url: 'https://www.vaclinic.co.uk/witham-botox',
  },
}

export default function WithamBotox() {
  return (
    <GeoLandingTemplate
      slug="witham-botox"
      town="Witham"
      treatment="Botox"
      travel="12 minutes from Witham via the B1018"
      positioningLine="A short drive up the B1018 from Witham brings you to the only Essex clinic awarded Best Non-Surgical Aesthetics Clinic 2026. Worth the trip for anti-wrinkle work that genuinely looks like nothing has happened."
      reasons={[
        { title: 'Closer than you think', body: "12 minutes door-to-door from central Witham. Free on-site parking, discreet entrance, no crowded waiting room." },
        { title: 'Award-winning local clinic', body: "Best Non-Surgical Aesthetics Clinic 2026 — Essex. Few clinics within a 12-minute drive of Witham can say the same." },
        { title: 'Truly medical', body: "Performed by a registered nurse with an MSc in Advanced Practice (Level 7) — the highest postgraduate nursing qualification. Twenty years of clinical experience." },
      ]}
      priceFrom="From £120 / 1 area"
      postcode="CM7 9BL"
      treatmentHref="/treatments/anti-wrinkle-injections"
      faqs={[
        {
          question: 'How far is Visage from Witham?',
          answer: 'Roughly 12 minutes by car via the B1018 from central Witham. Free parking on site, so no need to use the Witham High Street car parks.',
        },
        {
          question: 'Why come to Visage from Witham?',
          answer: "It is the closest award-winning aesthetics clinic to Witham. Bernadette holds an MSc Advanced Practice (Level 7) — rare in Essex aesthetics, where most practitioners are Level 4-5 trained.",
        },
        {
          question: 'Can I be seen this week?',
          answer: 'Most consultations can be scheduled within the same week. As a strictly private clinic with one appointment in the room at a time, you will not encounter other clients during your visit.',
        },
        {
          question: 'How much does Botox cost?',
          answer: '£120 for one area, £170 for two, £220 for three. The free consultation is included. Pricing is transparent — see /pricing for the full table.',
        },
        {
          question: 'Will it hurt?',
          answer: 'Anti-wrinkle injections use very fine needles. Most Witham clients describe it as a small pinch — surprisingly comfortable. Numbing cream is available on request, though most people do not feel it is needed.',
        },
        {
          question: 'How long until I see results?',
          answer: 'Results begin to show at 7-10 days, fully developed by 14 days. We include a complimentary two-week review to fine-tune any unevenness.',
        },
      ]}
      alsoServes={['Hatfield Peverel', 'Great Notley', 'Black Notley', 'Cressing', 'Rivenhall', 'Silver End', 'Boreham', 'Wickham Bishops']}
    />
  )
}
