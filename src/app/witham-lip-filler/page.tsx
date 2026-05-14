import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Lip Filler in Witham, from £110 | Visage Aesthetics',
  description: "Subtle, balanced lip filler for Witham clients at Visage Aesthetics, Braintree, 12 minutes away. Awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. Bernadette Tobin RGN, MSc. From £110, fully reversible.",
  alternates: { canonical: '/witham-lip-filler' },
  openGraph: {
    title: 'Lip Filler for Witham Clients | Visage Aesthetics',
    description: 'Officially awarded nurse-led lip filler 12 minutes from Witham. From £110.',
    url: 'https://www.vaclinic.co.uk/witham-lip-filler',
  },
}

export default function WithamLipFiller() {
  return (
    <GeoLandingTemplate
      slug="witham-lip-filler"
      town="Witham"
      treatment="Lip Filler"
      travel="12 minutes from central Witham, free on-site parking"
      positioningLine="Naturally balanced lip filler twelve minutes from Witham. Performed by a registered nurse with two decades of clinical experience. Subtle, considered, fully reversible."
      reasons={[
        { title: 'Closer than you think', body: "Twelve minutes door-to-door from central Witham. Free on-site parking on Friars Lane, no crowded waiting room, no shared treatment day." },
        { title: 'Awarded local clinic', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. Few clinics within a twelve-minute drive of Witham can say the same." },
        { title: 'Conservative dosing', body: "We start with 0.5ml, never more in one sitting. Lots of Witham clients arrive after over-treatment elsewhere; the fix is rarely more product." },
      ]}
      priceFrom="From £110 / 0.5ml"
      postcode="CM7 9BL"
      treatmentHref="/treatments/dermal-filler"
      faqs={[
        {
          question: 'How long is the drive from Witham?',
          answer: 'Twelve minutes via the A12 and B1018 / A131. Free on-site parking, discreet entrance. Many Witham clients prefer the drive to the busier clinics on their local high street.',
        },
        {
          question: 'How much does lip filler cost?',
          answer: 'Lip filler at Visage starts from £110 for 0.5ml and £200 for 1ml. The consultation is free; no consultation fee, no booking pressure.',
        },
        {
          question: 'Will my lips look natural?',
          answer: 'That is the aim. Conservative dosing, two-week review, hyaluronic acid filler with built-in lidocaine. Your lips on a good day, not someone else\'s lips on yours.',
        },
        {
          question: 'Is lip filler safe and reversible?',
          answer: 'Yes. Hyaluronic acid filler is fully dissolvable with hyaluronidase if you change your mind or experience a complication. We keep reversal product on site. Performed by an NMC-registered nurse with an MSc in Advanced Practice.',
        },
        {
          question: 'How long does it last?',
          answer: 'Typically 9 to 12 months. The product gradually metabolises so lips return smoothly to baseline rather than snapping back.',
        },
      ]}
      alsoServes={['Hatfield Peverel', 'Wickham Bishops', 'Tiptree', 'Kelvedon', 'Feering', 'Silver End', 'Terling']}
    />
  )
}
