import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Botox Chelmsford | Award-Winning Nurse-Led Clinic | Visage Aesthetics',
  description: "Anti-wrinkle (Botox) injections for Chelmsford clients at Visage Aesthetics, Braintree. Best Non-Surgical Aesthetics Clinic 2026, Essex. Bernadette Tobin RGN, MSc. From £120.",
  alternates: { canonical: '/chelmsford-botox' },
  openGraph: {
    title: 'Botox for Chelmsford Clients | Visage Aesthetics, Braintree',
    description: 'Award-winning nurse-led Botox clinic 25 minutes from Chelmsford. From £120.',
    url: 'https://www.vaclinic.co.uk/chelmsford-botox',
  },
}

export default function ChelmsfordBotox() {
  return (
    <GeoLandingTemplate
      slug="chelmsford-botox"
      town="Chelmsford"
      treatment="Botox"
      travel="25 minutes from Chelmsford via the A131"
      positioningLine="Chelmsford has plenty of aesthetic clinics. Visage is the one Chelmsford clients drive to when they want a quieter, more medically-led approach. Best Non-Surgical Aesthetics Clinic 2026, Essex."
      reasons={[
        { title: 'Worth the 25-minute drive', body: "A discreet private clinic with one client in the room at a time. The opposite of a busy high-street salon, and award-winning for it." },
        { title: 'Conservative, never overdone', body: "Lots of Chelmsford clients arrive having had over-treatment elsewhere. We start small. We listen. We let the result speak." },
        { title: 'A nurse with an MSc', body: "Bernadette holds a Level 7 MSc in Advanced Practice, the highest postgraduate qualification a nurse can hold. Most Chelmsford aestheticians are Level 4-5." },
      ]}
      priceFrom="From £120 / 1 area"
      postcode="CM7 9BL"
      treatmentHref="/treatments/anti-wrinkle-injections"
      faqs={[
        {
          question: 'How long does it take to drive from Chelmsford?',
          answer: 'Roughly 25 minutes via the A131 northbound, depending on traffic. Free on-site parking at the clinic, no central-Chelmsford parking faff.',
        },
        {
          question: 'Why drive to Braintree from Chelmsford for Botox?',
          answer: "Two reasons. First, this is the only clinic in Essex awarded Best Non-Surgical Aesthetics Clinic 2026. Second, Bernadette's MSc Advanced Practice (Level 7) is rare in Essex aesthetics, most Chelmsford practitioners are Level 4-5 trained. Many Chelmsford clients tell us the 25-minute drive is the best value-for-time decision they made.",
        },
        {
          question: 'How much does Botox cost?',
          answer: 'Anti-wrinkle injections start from £120 for one area, £170 for two, £220 for three. No consultation fee. A complimentary two-week review is included with every treatment to fine-tune any unevenness.',
        },
        {
          question: 'How quickly can I be seen?',
          answer: 'Most consultations can be booked within the same week. As a strictly private clinic with one appointment in the room at a time, you will not encounter other clients during your visit.',
        },
        {
          question: 'Will it look natural?',
          answer: 'Yes, that is the entire point of the approach. Conservative dosing, careful muscle assessment, full expression preserved. Your colleagues should not notice; only mirrors and photos should.',
        },
        {
          question: 'How long do results last?',
          answer: 'Typically 3 to 4 months. Most Chelmsford clients return every 12-16 weeks once they find a rhythm, but there is no obligation to book on a fixed schedule.',
        },
      ]}
      alsoServes={['Great Baddow', 'Galleywood', 'Writtle', 'Broomfield', 'Springfield', 'Boreham', 'Hatfield Peverel', 'Little Waltham']}
    />
  )
}
