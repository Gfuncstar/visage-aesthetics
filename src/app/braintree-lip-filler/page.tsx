import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Lip Filler Braintree | Award-Winning Nurse-Led Clinic | Visage Aesthetics',
  description: "Subtle, balanced lip filler in Braintree, Essex by Bernadette Tobin RGN, MSc (NMC PIN 05G1755E). Best Non-Surgical Aesthetics Clinic 2026. From £110. Hyaluronic acid filler, fully reversible.",
  alternates: { canonical: '/braintree-lip-filler' },
  openGraph: {
    title: 'Lip Filler in Braintree | Visage Aesthetics',
    description: 'Award-winning nurse-led lip filler clinic on Friars Lane, Braintree. From £110.',
    url: 'https://www.vaclinic.co.uk/braintree-lip-filler',
  },
}

export default function BraintreeLipFiller() {
  return (
    <GeoLandingTemplate
      slug="braintree-lip-filler"
      town="Braintree"
      treatment="Lip Filler"
      travel="On the doorstep, Friars Lane, central Braintree (CM7 9BL)"
      positioningLine="Naturally balanced lip filler in central Braintree. Performed by a registered nurse with twenty years' clinical experience and an MSc in Advanced Practice. The opposite of the overdone look."
      reasons={[
        { title: 'Conservative, never overdone', body: "We start with 0.5ml or 1ml, never more in one sitting. Build slowly, look like yourself, no duck lips. Most Braintree clients tell us they wish they'd come here first." },
        { title: 'Award-winning local clinic', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. Hyaluronic acid fillers from regulated, reputable manufacturers. Fully reversible at any time." },
        { title: 'Built-in numbing', body: "All filler products contain lidocaine for comfort. We numb the area first when you'd like extra. Most Braintree clients describe the procedure as easier than they expected." },
      ]}
      priceFrom="From £110 / 0.5ml"
      postcode="CM7 9BL"
      treatmentHref="/treatments/dermal-filler"
      faqs={[
        {
          question: 'What size lip filler should I have?',
          answer: 'For most first-time clients in Braintree we recommend 0.5ml, it is enough to create subtle definition without being noticeable. If you would like more after the two-week settle, we can add another 0.5ml. Going slowly is always the right move with lips.',
        },
        {
          question: 'How much does lip filler cost in Braintree?',
          answer: 'Lip filler at Visage starts from £110 for 0.5ml and £200 for 1ml. Pricing is transparent, see /pricing for the full table. The free consultation is included.',
        },
        {
          question: 'Will my lips look obvious?',
          answer: 'Not if treatment is done conservatively, which is the entire approach at Visage. We aim for "your lips on a good day", naturally balanced, hydrated and slightly defined. No tray-table profile, no cartoon shapes, no "duck lips".',
        },
        {
          question: 'Is lip filler reversible?',
          answer: 'Yes. We use hyaluronic acid filler exclusively, which can be dissolved with hyaluronidase if you change your mind or experience an issue. It is one of the safest cosmetic injectables available.',
        },
        {
          question: 'How long does lip filler last?',
          answer: 'Typically 9 to 12 months for lips, though it varies by individual metabolism. Your lips do not snap back to "deflated", they gradually return to baseline.',
        },
        {
          question: 'How quickly will I look normal again?',
          answer: 'Some swelling for 24-48 hours is normal. Most Braintree clients are presentable for work the next day, fully settled within 7-10 days. We always recommend not having lip filler within two weeks of a wedding or event.',
        },
      ]}
      alsoServes={['Bocking', 'Rayne', 'Coggeshall', 'Cressing', 'Felsted', 'Great Notley', 'High Garrett', 'Black Notley']}
    />
  )
}
