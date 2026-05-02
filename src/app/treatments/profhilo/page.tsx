import type { Metadata } from 'next'
import TreatmentTemplate from '@/components/sections/TreatmentTemplate'
import { getTreatment } from '@/lib/treatments'

export const metadata: Metadata = {
  alternates: { canonical: '/treatments/profhilo' },
  title: 'Profhilo Braintree | Award-Winning Nurse-Led | Visage Aesthetics',
  description:
    'Authentic Profhilo skin bio-remodelling in Braintree, Essex by Bernadette Tobin RGN, MSc (NMC PIN 05G1755E). Best Non-Surgical Aesthetics Clinic 2026. Hydration, glow, no fill. From £180.',
}

export default function Page() {
  const treatment = getTreatment('profhilo')!

  return (
    <TreatmentTemplate
      treatment={treatment}
      oneLineBenefit="Deep skin bio-remodelling that hydrates from within and stimulates your own collagen. Not filler, entirely different result."
      overview="Profhilo is not a filler. That distinction is the single most important thing to understand about this treatment. Filler adds volume in a specific area; Profhilo spreads through the skin and stimulates the body to produce its own collagen, elastin and hyaluronic acid. The result is hydration, glow and texture improvement, never volume change. It is made by IBSA, an Italian pharmaceutical company, and contains a high concentration of pure ultra-stabilised hyaluronic acid. The product is delivered using the BAP injection technique, five small points on each side of the face, placed in specific anatomical zones where the gel can spread evenly. Around 30 minutes per session. Most Braintree clients walk in on their lunch break and back out without any visible signs of having been there. The standard course is two sessions, four weeks apart. Results begin to appear at 2-3 weeks, with the biggest visible change around 8 weeks. A course typically gives 6-9 months of visible benefit before maintenance is recommended; many clients return every six months. Profhilo Body is the licensed extension for use on the upper arms (particularly effective for crepey skin on the inner upper arm), neck, décolletage and abdomen. Authentic Profhilo only at Visage, never relabelled, never repackaged, sourced direct from IBSA. The clinic was named Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards) for exactly this kind of conservative, evidence-based work. Bernadette holds an MSc in Advanced Practice (Level 7), the highest postgraduate nursing qualification available, and has been performing Profhilo since shortly after its UK launch. The treatment is particularly suited to clients in their late 30s through to their 60s who feel their skin has lost its bounce, glow or smoothness, but who don't want or need volume change."
      benefits={[
        'Improves skin hydration, bounce and glow across the entire treated area.',
        'Stimulates your own collagen and elastin production, natural, gradual improvement.',
        'No volume change, your face shape stays the same.',
        'Quick 30-minute appointment, minimal injection points (5 per side using the BAP technique).',
        'Visible results from 2-3 weeks, peaking around 8 weeks.',
        'A course of two sessions lasts 6-9 months.',
        'Licensed for face, neck, décolletage, upper arms (Profhilo Body) and abdomen.',
        'Particularly effective on crepey skin and lost glow.',
        'Authentic IBSA Profhilo only, never relabelled or repackaged.',
        'Performed by an NMC-registered nurse with MSc Advanced Practice (Level 7).',
      ]}
      suitableFor={[
        'Adults aged 30+ noticing reduced skin bounce, hydration or glow.',
        'Anyone in their 40s, 50s or 60s wanting skin quality improvement without volume change.',
        'Clients who do not want filler but feel their skin needs help.',
        'People with crepey skin on the neck, décolletage or inner upper arms (Profhilo Body).',
        'Anyone who has had filler elsewhere but feels the underlying skin is the real issue.',
        'Clients seeking gradual, non-dramatic improvement they can build on.',
      ]}
      notSuitableFor={[
        'Pregnant or breastfeeding women.',
        'Active skin infection, rash or autoimmune flare in the treatment area.',
        'Allergy to hyaluronic acid.',
        'Active acne in the treatment area (we may suggest treating that first).',
        'Anyone wanting volume change, Profhilo is the wrong treatment for that goal.',
        'Recent (within 4 weeks) facial laser, peels or surgery in the treatment area.',
      ]}
      expect={{
        before:
          'A free consultation to assess your skin quality, take a full medical history, photograph with consent, and confirm Profhilo is the right treatment for what you want to address. Avoid alcohol and blood-thinning supplements for 24 hours before to minimise bruising at the five injection points.',
        during:
          'Skin is cleansed; numbing cream applied if you would like it (most clients do not feel it is needed). The BAP technique uses 5 small injection points on each side of the face, placed in specific anatomical zones for even spread. Total appointment time is around 30 minutes.',
        after:
          'Small bumps at the five injection points on each side are normal for 12-24 hours and settle quickly. Most clients return to work the same day. Avoid the gym, sauna and hot yoga for 24 hours. Visible improvement begins at 2-3 weeks; a second session is scheduled at four weeks; full settle around 8 weeks after the second session.',
      }}
      pricingNote="Single session £180. Recommended course of two sessions (four weeks apart) £380. The fee includes the genuine IBSA Profhilo product. Profhilo Body (upper arms, neck, décolletage) priced separately at consultation. See /pricing for the full transparent table."
      faqs={[
        {
          question: "Is Profhilo a filler?",
          answer:
            "No, and this is the most important distinction to understand. Filler is placed in a specific area to add volume in that area. Profhilo spreads through the skin and stimulates the body to produce its own collagen, elastin and hyaluronic acid. The result is hydration, glow and texture improvement across the whole treated area, never volume change. Many clients have both Profhilo and filler, they do completely different jobs and the combination can be beautiful when planned correctly. The /blog/profhilo-vs-dermal-filler article walks through this in plain English.",
        },
        {
          question: 'How quickly will I see results?',
          answer:
            'Most clients begin to notice a soft glow at 2-3 weeks after the first session. The biggest visible change is around 8 weeks after the second session, when the collagen and elastin stimulation has had time to work. Profhilo improves gradually rather than dramatically, that is the entire appeal. Friends and family will tell you you look well rested, not that you look different.',
        },
        {
          question: 'How long does Profhilo last?',
          answer:
            'A course of two sessions four weeks apart typically gives 6 to 9 months of visible benefit before maintenance is recommended. Many clients return every six months for a single maintenance session. The collagen and elastin you have stimulated does not disappear when the product is fully metabolised, so each course builds on the last, most clients find the result becomes more apparent and longer-lasting over time.',
        },
        {
          question: 'Is there any downtime?',
          answer:
            'Minimal. Small bumps at the five injection points on each side are normal for 12-24 hours and settle quickly. Most clients return to work the same day. We recommend avoiding the gym, sauna, hot yoga and aggressive skincare actives for 24 hours, but ordinary daily life is fine.',
        },
        {
          question: 'Can Profhilo be used on the body?',
          answer:
            'Yes, Profhilo Body is the licensed extension for use on upper arms, neck, décolletage and abdomen. It is particularly effective for the crepey skin sometimes seen on the inner upper arm and the décolletage as we age. The technique is similar, small injection points spread across the area, though dosing varies by region. Discuss at consultation.',
        },
        {
          question: 'Will it work on younger skin?',
          answer:
            'It can, but it is not always the best treatment. For clients in their 20s, the underlying skin is usually still hydrated and bouncy on its own; Profhilo would be money spent for marginal benefit. We will say so honestly. From the late 30s onwards, when natural collagen and elastin production starts to slow, Profhilo becomes much more visible. There is no point in starting too early.',
        },
        {
          question: 'How is it different from filler or skin boosters?',
          answer:
            'Skin boosters (other HA-based hydration treatments) generally do not have the same collagen and elastin stimulation as Profhilo, and tend to last shorter. Profhilo has its own peer-reviewed clinical evidence, and at the dose used per session covers a wider treatment area than most skin boosters. It is also not filler, see the FAQ above. We can discuss whether Profhilo, a skin booster or filler is right for your specific goals at consultation.',
        },
        {
          question: 'Is Profhilo safe?',
          answer:
            'Profhilo is one of the most studied injectable hydrators on the market, with peer-reviewed safety and efficacy data behind it. The active ingredient is hyaluronic acid, naturally occurring in your own tissue. Like all injectable treatments, the safety depends on the practitioner: regulated product, qualified injector, full consent process, indemnity insurance. Bernadette is an NMC-registered nurse (PIN 05G1755E) with twenty years of clinical experience and an MSc in Advanced Practice.',
        },
        {
          question: 'Do you treat Profhilo clients from outside Braintree?',
          answer:
            'Yes, Profhilo clients travel to Friars Lane from Chelmsford, Colchester, Halstead, Witham and across Essex. Dedicated travel pages: /braintree-profhilo, /chelmsford-profhilo, /halstead-profhilo. Free on-site parking, discreet entrance, strictly by appointment.',
        },
      ]}
      practitionerNote="Profhilo is the treatment I most often recommend to clients who arrive asking about filler when what they actually need is skin quality. It is gentler, more honest, and the results compound over time. Not glamorous, but quietly transformative."
    />
  )
}
