import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Botox Colchester | Award-Winning Nurse-Led Clinic | Visage Aesthetics',
  description: "Anti-wrinkle (Botox) injections for Colchester clients at Visage Aesthetics, Braintree — 25 minutes. Best Non-Surgical Aesthetics Clinic 2026 — Essex. Bernadette Tobin RGN, MSc. From £150.",
  alternates: { canonical: '/colchester-botox' },
  openGraph: {
    title: 'Botox for Colchester Clients | Visage Aesthetics, Braintree',
    description: 'Award-winning nurse-led Botox 25 minutes from Colchester. From £150.',
    url: 'https://www.vaclinic.co.uk/colchester-botox',
  },
}

export default function ColchesterBotox() {
  return (
    <GeoLandingTemplate
      slug="colchester-botox"
      town="Colchester"
      treatment="Botox"
      travel="25 minutes from Colchester via the A12/A120"
      positioningLine="Colchester has plenty of clinics — Visage is the one Colchester clients drive to when they want medically-led, naturally subtle anti-wrinkle work. Best Non-Surgical Aesthetics Clinic 2026 — Essex."
      reasons={[
        { title: 'Worth the 25-minute drive', body: "Free parking, one client in the room at a time, no high-street salon vibe. Many Colchester clients tell us the drive is the easiest part." },
        { title: 'A nurse with an MSc', body: "Bernadette holds a Level 7 MSc in Advanced Practice — the highest postgraduate nursing qualification. Most Colchester aesthetic practitioners are trained at Level 4-5." },
        { title: 'Award-winning clinic', body: "Best Non-Surgical Aesthetics Clinic 2026 — Essex. The closest award-recognised clinic for the Colchester area." },
      ]}
      priceFrom="From £150 / 1 area"
      postcode="CM7 9BL"
      treatmentHref="/treatments/anti-wrinkle-injections"
      faqs={[
        {
          question: 'How long is the drive from Colchester?',
          answer: 'Approximately 25 minutes via the A12 then A120. Free on-site parking — no Colchester city-centre parking faff.',
        },
        {
          question: 'Why come to Visage from Colchester?',
          answer: 'Two reasons: this is the only Essex clinic awarded Best Non-Surgical Aesthetics Clinic 2026, and Bernadette holds an MSc Advanced Practice (Level 7) — rare in Essex aesthetics. Many Colchester clients drive past local options to come here.',
        },
        {
          question: 'How much does Botox cost?',
          answer: 'From £150 for one area, £190 for two, £220 for three. Free consultation included. Pricing transparent at /pricing.',
        },
        {
          question: 'Will it look natural?',
          answer: 'Conservative dosing is the entire approach. Full expression preserved. Most Colchester clients tell us their colleagues do not notice — only mirrors do.',
        },
        {
          question: 'How long do results last?',
          answer: 'Typically 3 to 4 months. Most clients return every 12-16 weeks once they find a rhythm.',
        },
        {
          question: 'How quickly can I be seen?',
          answer: 'Most consultations available within the same week. Strictly private — one appointment at a time, no shared waiting room.',
        },
      ]}
      alsoServes={['Stanway', 'Marks Tey', 'Tiptree', 'West Mersea', 'Wivenhoe', 'Lexden', 'Mile End', 'Earls Colne']}
    />
  )
}
