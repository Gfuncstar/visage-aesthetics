import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Lip Filler Chelmsford | Award-Winning Nurse-Led Clinic | Visage Aesthetics',
  description: "Subtle, balanced lip filler for Chelmsford clients at Visage Aesthetics, Braintree (25 mins). Best Non-Surgical Aesthetics Clinic 2026 — Essex. Bernadette Tobin RGN, MSc. From £200.",
  alternates: { canonical: '/chelmsford-lip-filler' },
  openGraph: {
    title: 'Lip Filler for Chelmsford Clients | Visage Aesthetics',
    description: 'Award-winning nurse-led lip filler 25 minutes from Chelmsford. From £200.',
    url: 'https://www.vaclinic.co.uk/chelmsford-lip-filler',
  },
}

export default function ChelmsfordLipFiller() {
  return (
    <GeoLandingTemplate
      slug="chelmsford-lip-filler"
      town="Chelmsford"
      treatment="Lip Filler"
      travel="25 minutes from Chelmsford via the A131"
      positioningLine="Chelmsford has a lot of clinics offering lip filler. Visage is the one Chelmsford clients drive to when they want subtle, naturally balanced lips — never overdone. Best Non-Surgical Aesthetics Clinic 2026 — Essex."
      reasons={[
        { title: 'Conservative by default', body: "We start with 0.5ml — never more in one sitting. Lots of Chelmsford clients arrive after over-treatment elsewhere. The fix is rarely more product. It is patience." },
        { title: 'Worth the 25-minute drive', body: "Free parking, one client in the room at a time, no salon vibe. The opposite of a busy high-street experience." },
        { title: 'Reversible and safe', body: "Hyaluronic acid filler with built-in lidocaine for comfort. Fully dissolvable with hyaluronidase if you change your mind. Performed by a registered nurse with an MSc Advanced Practice." },
      ]}
      priceFrom="From £200 / 0.5ml"
      postcode="CM7 9BL"
      treatmentHref="/treatments/dermal-filler"
      faqs={[
        {
          question: 'How long does it take to drive from Chelmsford to Visage?',
          answer: 'About 25 minutes via the A131 northbound. Free on-site parking — no central-Chelmsford parking charges or stress.',
        },
        {
          question: 'Why drive from Chelmsford for lip filler?',
          answer: "Two reasons: this is the only Essex clinic awarded Best Non-Surgical Aesthetics Clinic 2026, and Bernadette's MSc Advanced Practice (Level 7) is rare in Essex aesthetics — most Chelmsford practitioners are Level 4-5 trained. Many Chelmsford clients drive past several local clinics to get here.",
        },
        {
          question: 'How much filler should I have?',
          answer: 'For most first-time clients we recommend 0.5ml — enough for subtle definition without anyone noticing. After the two-week settle you can decide if you want another 0.5ml. Going slowly is always the right move with lips, especially if it is your first time.',
        },
        {
          question: 'How much does lip filler cost?',
          answer: '£200 for 0.5ml, £260 for 1ml. Free consultation included. See the pricing page for the full table — no hidden costs.',
        },
        {
          question: 'How long does lip filler last?',
          answer: '9 to 12 months in lips for most people. Lips do not snap back to "deflated" — they gradually return to baseline as the filler is metabolised.',
        },
        {
          question: 'Will I look bruised?',
          answer: 'Some swelling for 24-48 hours is normal. Bruising is not guaranteed but possible — there are blood vessels in lips. Most Chelmsford clients are presentable for work the next day, fully settled within 7-10 days.',
        },
      ]}
      alsoServes={['Great Baddow', 'Galleywood', 'Writtle', 'Broomfield', 'Springfield', 'Boreham', 'Hatfield Peverel', 'Little Waltham']}
    />
  )
}
