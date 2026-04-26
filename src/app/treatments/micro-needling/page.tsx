import type { Metadata } from 'next'
import TreatmentTemplate from '@/components/sections/TreatmentTemplate'
import { getTreatment } from '@/lib/treatments'

export const metadata: Metadata = {
  alternates: { canonical: '/treatments/micro-needling' },
  title: 'Micro-Needling Braintree | Award-Winning Nurse-Led | Visage Aesthetics',
  description:
    'Medical-grade micro-needling in Braintree, Essex by Bernadette Tobin RGN, MSc (NMC PIN 05G1755E). Best Non-Surgical Aesthetics Clinic 2026. Collagen induction therapy from £150. Course of 3 from £400.',
}

export default function Page() {
  const treatment = getTreatment('micro-needling')!

  return (
    <TreatmentTemplate
      treatment={treatment}
      oneLineBenefit="Stimulate your skin's own collagen with controlled micro-channels. Smoother, firmer, more even-toned skin — gradually built over a course."
      overview="Micro-needling — also called collagen induction therapy — uses a medical-grade device with very fine sterile needles to create thousands of microscopic, controlled channels in the skin. Each tiny channel triggers the skin's natural healing response: new collagen and elastin production, accelerated cell turnover, and improved penetration of any active serum applied during the treatment. The result over a course is smoother texture, firmer skin, more even tone, and visible improvement in the appearance of acne scarring, fine lines, large pores and stretch marks. Unlike a one-off treatment that gives instant gratification, micro-needling builds gradually — collagen continues to develop for 3 to 6 months after a course completes. We recommend three sessions, four weeks apart, to give the collagen response time to build between treatments. The device used at Visage is medical grade — not a beauty-counter dermaroller; the difference matters because depth, speed and consistency of needle insertion are what determine the clinical effect (and what determine whether you bruise, scar or develop pigmentation issues). The clinic was named Best Non-Surgical Aesthetics Clinic 2026 — Essex (Health, Beauty & Wellness Awards) for exactly this kind of conservative, evidence-based skin work. Bernadette holds an MSc in Advanced Practice (Level 7) and twenty years of clinical experience. Micro-needling pairs particularly well with Profhilo for clients wanting maximum skin quality improvement, and is one of the few treatments that can meaningfully address old acne scarring without surgery or laser."
      benefits={[
        'Smoother skin texture and refined pores after a full course.',
        'Visible reduction in fine lines, particularly around eyes and mouth.',
        'Improvement in old acne scarring (boxcar, rolling, ice-pick types).',
        'More even skin tone and reduction in pigmentation marks.',
        'Tighter, firmer skin — particularly visible on the lower face and neck.',
        'Stretch mark improvement on the body when treated as a course.',
        'Stimulates your own collagen — natural, gradual results.',
        'Suitable for almost all skin types and tones.',
        'No injectables, no botulinum toxin, no filler.',
        'Performed by an NMC-registered nurse with MSc Advanced Practice (Level 7).',
      ]}
      suitableFor={[
        'Adults wanting smoother skin texture and reduced fine lines.',
        'Anyone with old acne scarring (3+ months post-active acne).',
        'Clients with enlarged pores or uneven skin tone.',
        'People wanting tighter skin without injectables.',
        'Clients seeking stretch mark improvement on the body.',
        'Anyone unable or unwilling to have anti-wrinkle injections or filler.',
        'People wanting a treatment that pairs with Profhilo for maximum skin quality.',
      ]}
      notSuitableFor={[
        'Pregnant or breastfeeding women.',
        'Active acne, eczema, psoriasis or skin infection in the treatment area.',
        'Active cold sores or herpes simplex outbreak.',
        'History of keloid scarring (we may need to test patch first).',
        'Recent (within 4 weeks) sunburn, laser, peels or aggressive exfoliation.',
        'Currently on isotretinoin (Accutane / Roaccutane) — wait 6 months after stopping.',
        'Bleeding disorders or anticoagulant therapy without GP review.',
      ]}
      expect={{
        before:
          'A free consultation to assess your skin, take a full medical history, photograph with consent, and confirm micro-needling is right for the concern you have raised. We discuss any active skin conditions, your skincare routine and any sensitivity. Avoid retinoids and aggressive actives for 5 days before treatment.',
        during:
          'Skin is cleansed thoroughly. Numbing cream is applied for 30 minutes before the device is used. The treatment itself takes 30-45 minutes depending on the area. A clinical-grade serum is applied during the procedure to enhance penetration. Skin will be pink/red afterwards — similar in look to mild sunburn.',
        after:
          'Redness usually settles within 24-48 hours; some clients experience minor flaking around days 3-5 as cell turnover accelerates. Avoid the gym, sauna, hot yoga, makeup, swimming and direct sun for 48 hours. Sun protection (SPF50) is essential for 4 weeks afterwards. Visible improvement begins at 4-6 weeks; full collagen response 3-6 months after the final session.',
      }}
      pricingNote="Single session £150. Recommended course of three sessions (four weeks apart) £400 — saving £50 vs booking individually. The fee includes the procedure, all serums applied, and post-treatment skincare guidance. There is no consultation fee. See /pricing for the full transparent table."
      faqs={[
        {
          question: 'How is medical micro-needling different from a dermaroller I can buy?',
          answer:
            "Hugely different — and this matters. The home dermarollers sold online use shorter, less consistent needles, can't reach the depth required to trigger the collagen response, and are extremely difficult to keep sterile between uses. They can also cause micro-tears that worsen pigmentation and texture rather than improve it. Medical-grade devices use precise needle depth, controlled speed, and sterile single-use cartridges. The clinical effect depends entirely on the device and the operator. If you have used a dermaroller at home, that is fine — but the result you saw is not the result you should expect from a clinical course.",
        },
        {
          question: 'How many sessions do I need?',
          answer:
            'For most concerns, three sessions four weeks apart give the best return. For old acne scarring or stretch marks, four to six sessions may be recommended at consultation. The interval matters — collagen takes time to mature, and treating again too soon does not accelerate the result; if anything it can interrupt the healing cascade you triggered last time. We will be honest if we think you need fewer or more than the standard course.',
        },
        {
          question: 'When will I see results?',
          answer:
            'Initial brightening and smoother texture is often visible at 1-2 weeks. The bigger collagen-driven improvements appear from week 4 onwards and continue building for 3-6 months after your final session. This treatment rewards patience — the result you have at the day-30 photo is not the final result; it is the floor.',
        },
        {
          question: 'Will it hurt?',
          answer:
            "Most clients describe it as a mild prickling sensation rather than pain. Numbing cream is applied for 30 minutes before the device is used, which makes a significant difference. Some areas — around the nose, the upper lip and the forehead — are slightly more sensitive than others. We work at a pace you're comfortable with and you can always ask to pause.",
        },
        {
          question: 'Can micro-needling treat acne scarring?',
          answer:
            'Yes — it is one of the few treatments that can meaningfully address old acne scarring without surgery or aggressive laser. Boxcar, rolling and shallow ice-pick scars typically respond best. Deep ice-pick scars may need additional treatments alongside (TCA cross, subcision) which we can discuss at consultation. We do not treat active acne — wait at least 3 months from the last active breakout before booking.',
        },
        {
          question: 'Is there any downtime?',
          answer:
            'Some — but less than most clients expect. Skin is pink/red afterwards (similar to mild sunburn) and usually settles within 24-48 hours. There may be minor flaking around days 3-5 as the skin cell turnover accelerates. Most clients return to work the next day; some prefer to schedule the day after as a "no plans" day. SPF50 is essential for 4 weeks afterwards — direct sun on freshly treated skin can cause hyperpigmentation.',
        },
        {
          question: 'Can I do it before a wedding or event?',
          answer:
            'Yes, but the timing matters. For best results before an event, complete your course at least 4 weeks before. The skin needs to settle, and the collagen response builds gradually rather than peaking at one defined moment. We can plan back from your event date at consultation.',
        },
        {
          question: 'Does it work alongside Profhilo or filler?',
          answer:
            "Yes — beautifully. Many clients have a course of micro-needling alongside Profhilo for maximum skin quality, and we space them out by at least 2 weeks so the treated skin is fully settled before the next intervention. Filler should be done at least 2 weeks before or after micro-needling on the same area.",
        },
        {
          question: 'Is micro-needling safe for darker skin tones?',
          answer:
            'Yes — micro-needling is one of the safest collagen-stimulating treatments for darker Fitzpatrick skin types because it does not use heat or light energy. The risk of post-inflammatory hyperpigmentation is much lower than with laser. We always discuss your specific skin type and history at consultation and adjust the protocol accordingly.',
        },
      ]}
      practitionerNote="Micro-needling is a quietly underrated treatment. Less talked about than filler or Botox, more visible in the long run for clients whose underlying skin is the real concern. I almost always pair it with proper sun protection and a sensible skincare routine — both matter as much as the procedure itself."
    />
  )
}
