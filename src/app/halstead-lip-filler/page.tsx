import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Lip Filler in Halstead, from £110 | Visage Aesthetics',
  description: "Subtle, balanced lip filler for Halstead clients at Visage Aesthetics, Braintree, 12 minutes via the A131. Awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. Bernadette Tobin RGN, MSc. From £110, fully reversible.",
  alternates: { canonical: '/halstead-lip-filler' },
  openGraph: {
    title: 'Lip Filler for Halstead Clients | Visage Aesthetics',
    description: 'Officially awarded nurse-led lip filler clinic 12 minutes from Halstead. From £110, fully reversible.',
    url: 'https://www.vaclinic.co.uk/halstead-lip-filler',
  },
}

export default function HalsteadLipFiller() {
  return (
    <GeoLandingTemplate
      slug="halstead-lip-filler"
      town="Halstead"
      treatment="Lip Filler"
      travel="12 minutes via the A131, free on-site parking"
      positioningLine="Naturally balanced lip filler twelve minutes from Halstead. Performed by a registered nurse with an MSc in Advanced Practice. Conservative dosing, fully reversible, never overdone."
      reasons={[
        { title: 'Closer than you think', body: "Twelve minutes door-to-door via the A131. Free on-site parking, discreet entrance, no shared waiting room. Most Halstead clients tell us the drive is the easiest part." },
        { title: 'Awarded in your district', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. The closest award-recognised lip filler clinic for Halstead, Earls Colne, Sible Hedingham and Castle Hedingham." },
        { title: 'Conservative, reversible', body: "0.5ml or 1ml at a time, never more in one sitting. Hyaluronic acid filler with built-in lidocaine for comfort. Fully dissolvable if you change your mind." },
      ]}
      priceFrom="From £110 / 0.5ml"
      postcode="CM7 9BL"
      treatmentHref="/treatments/dermal-filler"
      faqs={[
        {
          question: 'How long is the drive from Halstead to Friars Lane?',
          answer: 'Twelve minutes via the A131. Free on-site parking on Friars Lane, no parking meter scramble. Most Halstead clients prefer the drive to the busy clinics on the high street back home.',
        },
        {
          question: 'How much does lip filler cost?',
          answer: 'Lip filler at Visage starts from £110 for 0.5ml and £200 for 1ml. Pricing is transparent, no consultation fee. The complimentary two-week review is included.',
        },
        {
          question: 'Will my lips look obviously done?',
          answer: 'Not if treatment is done conservatively, which is the entire approach at Visage. We aim for "your lips on a good day", naturally balanced, hydrated and slightly defined. No tray-table profile, no "duck lips".',
        },
        {
          question: 'Is lip filler reversible?',
          answer: 'Yes. We use hyaluronic acid filler exclusively, which can be dissolved with hyaluronidase if you change your mind or experience an issue. One of the safest cosmetic injectables available.',
        },
        {
          question: 'How long does lip filler last?',
          answer: 'Typically 9 to 12 months for lips, though it varies by metabolism. Your lips do not snap back to "deflated"; they gradually return to baseline.',
        },
      ]}
      alsoServes={['Earls Colne', 'Sible Hedingham', 'Castle Hedingham', 'Gosfield', 'Greenstead Green', 'Pebmarsh', 'Toppesfield']}
    />
  )
}
