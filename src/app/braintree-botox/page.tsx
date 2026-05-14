import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Botox in Braintree, from £120 | Visage Aesthetics',
  description: "Anti-wrinkle (Botox) injections in Braintree, Essex by Bernadette Tobin RGN, MSc (NMC PIN 05G1755E). Awarded Best Non-Surgical Aesthetics Clinic 2026, Essex. Free consultation, naturally subtle results from £120.",
  alternates: { canonical: '/braintree-botox' },
  openGraph: {
    title: 'Botox in Braintree, Essex | Visage Aesthetics',
    description: 'Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex. Nurse-led Botox clinic on Friars Lane, Braintree. From £120.',
    url: 'https://www.vaclinic.co.uk/braintree-botox',
  },
}

export default function BraintreeBotox() {
  return (
    <GeoLandingTemplate
      slug="braintree-botox"
      town="Braintree"
      treatment="Botox"
      travel="On the doorstep, Friars Lane, central Braintree (CM7 9BL)"
      positioningLine="A small, considered nurse-led clinic in the heart of Braintree. Anti-wrinkle injections by a registered nurse with 20+ years clinical experience, never overdone, never rushed, never sold to."
      reasons={[
        { title: '2026 Winner — Best Non-Surgical Aesthetics Clinic, Essex', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. Most Braintree clinics aren't. We're proud to be the one that is." },
        { title: 'Medical, not beauty-counter', body: "Performed by an NMC-registered nurse with an MSc in Advanced Practice, Level 7, the highest postgraduate qualification a nurse can hold. Most local clinics are Level 4-5." },
        { title: 'Naturally subtle', body: "Conservative dosing means you still look like yourself, just refreshed. Colleagues won't notice. Mirrors will." },
      ]}
      priceFrom="From £120 / 1 area"
      postcode="CM7 9BL"
      treatmentHref="/treatments/anti-wrinkle-injections"
      faqs={[
        {
          question: 'How quickly can I get an appointment in Braintree?',
          answer: 'Most consultations can be scheduled within the same week. As a strictly-by-appointment private clinic, you will not be sat in a waiting room with other clients, every booking has the room to itself.',
        },
        {
          question: 'Where exactly are you located in Braintree?',
          answer: '17A Friars Lane, Braintree, Essex CM7 9BL, central Braintree, with discreet entrance and free on-site parking. Five minutes\' walk from the Braintree town centre and a short drive from Bocking, Rayne, Coggeshall and Halstead.',
        },
        {
          question: 'Why choose Visage over other Braintree clinics?',
          answer: 'We are the only Braintree clinic awarded Best Non-Surgical Aesthetics Clinic in Essex 2026. I am one of very few aesthetic practitioners in the area with an MSc in Advanced Practice. We treat aesthetics as a clinical discipline, not a beauty service, and only offer treatments we believe are genuinely in your best interest.',
        },
        {
          question: 'How much does Botox cost in Braintree?',
          answer: 'Anti-wrinkle injections at Visage start from £120 for one area, £170 for two areas, and £220 for three areas. Pricing is transparent, no consultation fee, no hidden costs, and a complimentary two-week review is included.',
        },
        {
          question: 'How long does Botox last?',
          answer: 'Typically 3 to 4 months for most clients. Many people in Braintree return every 12-16 weeks once they find a rhythm that suits them. There is no obligation to book on a fixed schedule.',
        },
        {
          question: 'Is Botox safe?',
          answer: 'When carried out by a qualified medical professional with regulated products, yes. At Visage every treatment is performed by an NMC-registered nurse (PIN 05G1755E) with an MSc in Advanced Practice. We take a full medical history, assess your suitability honestly, and only proceed when it is in your best interest.',
        },
      ]}
      alsoServes={['Bocking', 'Rayne', 'Coggeshall', 'Cressing', 'Felsted', 'Great Notley', 'High Garrett', 'Stisted', 'Black Notley']}
    />
  )
}
