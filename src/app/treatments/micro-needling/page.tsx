import type { Metadata } from 'next'
import TreatmentTemplate from '@/components/sections/TreatmentTemplate'
import { getTreatment } from '@/lib/treatments'

export const metadata: Metadata = {
  title: 'Micro-Needling | Visage Aesthetics Braintree',
  description:
    'Medical micro-needling for acne scarring, texture, pores and skin rejuvenation. Nurse-led collagen induction therapy in Braintree, Essex.',
}

export default function Page() {
  const treatment = getTreatment('micro-needling')!

  return (
    <TreatmentTemplate
      treatment={treatment}
      oneLineBenefit="Tiny controlled channels prompt your skin to repair, smooth and rebuild collagen naturally."
      overview="Medical micro-needling, sometimes called collagen induction therapy, uses an electronic device with very fine sterile needles to create thousands of tiny controlled channels in the skin. Your body reads these as a small injury and responds by producing fresh collagen and elastin, which over the following weeks softens scarring, evens texture, refines pores and improves overall tone. It is one of the most evidence-backed treatments for acne scarring and stretch marks, but it is equally useful as a general skin-quality treatment for clients who want results without injectables. A typical course is three to six sessions spaced four to six weeks apart."
      benefits={[
        'Stimulates your own collagen and elastin production.',
        'Softens acne scarring, texture and surgical scars.',
        'Refines visible pores and evens skin tone.',
        'Improves stretch marks on body and face.',
        'Helps active skincare penetrate more effectively.',
        'Suitable for most skin types and tones.',
      ]}
      suitableFor={[
        'Acne scarring, ice pick scars and post-acne texture.',
        'Uneven skin tone, sun damage and early ageing.',
        'Stretch marks on stomach, thighs or arms.',
        'Anyone wanting natural skin rejuvenation without injectables.',
      ]}
      notSuitableFor={[
        'Active acne breakouts, eczema or psoriasis in the treatment area.',
        'Pregnant or breastfeeding women.',
        'Recent sunburn or use of strong retinoids in the past week.',
        'Bleeding disorders or current blood-thinning medication.',
      ]}
      expect={{
        before:
          'Avoid retinoids, strong acids and sun exposure for a week. Numbing cream is applied for 30 minutes before treatment to keep the session comfortable.',
        during:
          'The device is passed methodically across each zone of the face for around 30 minutes. Most clients describe a buzzing pressure rather than pain.',
        after:
          'Skin looks pink and feels warm for 12 to 24 hours, similar to mild sunburn. Avoid makeup for 24 hours and SPF is essential for the following week.',
      }}
      pricingNote="From \u00a3150 per session, with a course of three usually offered as a package. Each session includes a calming post-treatment serum and aftercare guidance for the week that follows."
      faqs={[
        {
          question: 'How many sessions will I need?',
          answer:
            'For general skin rejuvenation, three sessions four to six weeks apart usually gives a noticeable improvement, with a maintenance session every six to twelve months thereafter. For acne scarring or stretch marks, plan for four to six sessions to see real change, because we are remodelling deeper tissue. I will assess your skin honestly at consultation and tell you what is realistic. Some concerns respond beautifully to micro-needling alone, others are better tackled alongside a course of skincare or another treatment.',
        },
        {
          question: 'How much downtime should I plan for?',
          answer:
            'Most clients look noticeably pink and feel slightly tight for 12 to 24 hours, then return to a mild flush by day two. Makeup can usually go back on at the 24-hour mark, although the skin can feel a little dry or grainy for a few days as it settles. SPF is non-negotiable for the following week. I usually book sessions on a Friday so clients have the weekend to settle, but it is genuinely a low-downtime treatment compared to lasers or peels.',
        },
        {
          question: 'Is it painful?',
          answer:
            'It is uncomfortable rather than painful. Numbing cream is applied for around half an hour before we start, which takes the edge off completely on most areas. The forehead, hairline and around the nose can feel sharper because the skin is thinner over bone, but no part of the treatment should be unbearable. If anything ever feels too much, we slow down or pause. Most clients are surprised at how manageable it is and almost all return for the next session in the course.',
        },
        {
          question: 'When will I see results?',
          answer:
            'Skin looks plumper and more reflective within the first week, but the real collagen response unfolds over the following four to six weeks. That is why sessions are spaced a month apart, so each appointment lands while the previous one is still building. Final improvement from a full course is usually visible at three months after the last session. Photos taken before treatment make this easier to see, because the change is gradual and easy to forget without a comparison.',
        },
        {
          question: 'What skincare should I use afterwards?',
          answer:
            'For the first 48 hours keep things simple: a gentle cleanser, a calming hyaluronic acid serum and a fragrance-free moisturiser. SPF 30 or higher every morning for the following two weeks is essential. From day four or five you can return to your usual routine, but pause retinoids, strong acids and active brightening agents for a full week. I will give you a written aftercare sheet at the appointment so there is no guesswork.',
        },
      ]}
      practitionerNote="Micro-needling is a quietly brilliant treatment. There is no product going into the skin, no shape change and no chance of looking overdone, just your own collagen doing the work. For the right client it gives some of the most natural and lasting results in the clinic."
    />
  )
}
