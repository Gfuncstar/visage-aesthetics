import type { Metadata } from 'next'
import GeoLandingTemplate from '@/components/sections/GeoLandingTemplate'

export const metadata: Metadata = {
  title: 'Botox Halstead | Award-Winning Nurse-Led Clinic | Visage Aesthetics',
  description: "Anti-wrinkle (Botox) injections for Halstead clients at Visage Aesthetics, Braintree, 12 minutes away. Best Non-Surgical Aesthetics Clinic 2026, Essex. Bernadette Tobin RGN, MSc. From £120.",
  alternates: { canonical: '/halstead-botox' },
  openGraph: {
    title: 'Botox for Halstead Clients | Visage Aesthetics, Braintree',
    description: 'Award-winning nurse-led Botox clinic 12 minutes from Halstead. From £120.',
    url: 'https://www.vaclinic.co.uk/halstead-botox',
  },
}

export default function HalsteadBotox() {
  return (
    <GeoLandingTemplate
      slug="halstead-botox"
      town="Halstead"
      treatment="Botox"
      travel="12 minutes from Halstead via the A131"
      positioningLine="Halstead is a quick drive down the A131. Visage Aesthetics is the only Essex clinic awarded Best Non-Surgical Aesthetics Clinic 2026, and easily the closest if you live anywhere from CO9 through to Earls Colne."
      reasons={[
        { title: 'Twelve minutes door-to-door', body: "Closer than most Halstead salons by car. Free on-site parking, discreet entrance, no waiting room shared with other clients." },
        { title: 'Award-winning in your district', body: "Best Non-Surgical Aesthetics Clinic 2026, Essex. The closest award-recognised clinic for the Halstead, Earls Colne and Sible Hedingham area." },
        { title: 'Genuinely medical-grade', body: "Performed by a registered nurse with an MSc in Advanced Practice. Twenty years of clinical experience. Aesthetics treated as a clinical discipline, not a beauty service." },
      ]}
      priceFrom="From £120 / 1 area"
      postcode="CM7 9BL"
      treatmentHref="/treatments/anti-wrinkle-injections"
      faqs={[
        {
          question: 'How far is Visage from Halstead?',
          answer: 'About 12 minutes by car via the A131, the same road most Halstead residents already use to get to Braintree. Free parking on site so you do not need to use the High Street car parks.',
        },
        {
          question: 'Why come to Visage from Halstead?',
          answer: "The closest award-winning aesthetics clinic to Halstead. Most CO9 residents are within 15 minutes' drive. I am one of the very few aesthetic practitioners in the area with an MSc Advanced Practice (Level 7), the highest postgraduate nursing qualification.",
        },
        {
          question: 'Will it hurt?',
          answer: 'Anti-wrinkle uses very fine needles. Most clients describe it as a small pinch, surprisingly comfortable. We can apply numbing cream on request, though most people do not feel it is needed.',
        },
        {
          question: 'How much does it cost?',
          answer: 'Anti-wrinkle injections start from £120 for one area, £170 for two, £220 for three. Your consultation is free. A complimentary two-week review is included.',
        },
        {
          question: 'How long do results last?',
          answer: 'Typically 3 to 4 months. Most Halstead clients return every 12-16 weeks once they find their rhythm. There is no obligation to book on a fixed schedule.',
        },
        {
          question: 'How do I book?',
          answer: 'Online via the booking link on this page. Most consultations can be scheduled within the same week. If you would rather speak first, the contact page has WhatsApp and email options.',
        },
      ]}
      alsoServes={['Earls Colne', 'Sible Hedingham', 'Castle Hedingham', 'Gosfield', 'Greenstead Green', 'Pebmarsh', 'White Colne', 'Wakes Colne']}
    />
  )
}
