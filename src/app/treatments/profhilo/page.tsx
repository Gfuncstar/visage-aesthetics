import type { Metadata } from 'next'
import TreatmentTemplate from '@/components/sections/TreatmentTemplate'
import { getTreatment } from '@/lib/treatments'

export const metadata: Metadata = {
  title: 'Profhilo | Visage Aesthetics Braintree',
  description:
    'Profhilo bio-remodelling injections for hydrated, firmer, glowing skin on face, neck and hands. Nurse-led treatment in Braintree, Essex.',
}

export default function Page() {
  const treatment = getTreatment('profhilo')!

  return (
    <TreatmentTemplate
      treatment={treatment}
      oneLineBenefit="A bio-remodelling injection that hydrates skin from within and improves quality, not volume."
      overview="Profhilo is not a filler. It is a high-concentration form of pure hyaluronic acid that spreads slowly through the skin once injected, drawing in water and gently stimulating collagen and elastin. The result is skin that looks more hydrated, smoother and firmer, with a natural glow rather than added volume. A standard course is two sessions four weeks apart, usually on the lower face, neck or hands. It works beautifully on its own or alongside anti-wrinkle injections and filler as part of a broader plan, especially for clients who feel their skin looks tired even when there is little they want to change."
      benefits={[
        'Deeply hydrates dehydrated, dull skin from within.',
        'Stimulates new collagen and elastin over six to eight weeks.',
        'Improves skin texture, firmness and bounce.',
        'Treats face, neck, decolletage, knees and hands.',
        'No volume added, so the face shape stays the same.',
        'Just two short appointments four weeks apart.',
      ]}
      suitableFor={[
        'Anyone with dull, dehydrated or crepey skin.',
        'Clients aged 30 and above wanting natural skin quality improvement.',
        'Those who do not want filler but feel their skin looks tired.',
        'Pre-event preparation when you want a glow rather than a change.',
      ]}
      notSuitableFor={[
        'Pregnant or breastfeeding women.',
        'Active autoimmune conditions or current flare-ups.',
        'Allergy to hyaluronic acid.',
        'Active skin infection or inflammation in the treatment area.',
      ]}
      expect={{
        before:
          'A short consultation to confirm Profhilo suits your concerns. Avoid blood-thinning supplements and alcohol for 24 hours to reduce bruising risk.',
        during:
          'Five small injection points on each side of the face, finished in around 20 minutes. The product feels firm at first and softens within hours.',
        after:
          'Small bumps at the injection sites disappear within a few hours. Avoid makeup, exercise and saunas for 24 hours. Real glow appears at four to eight weeks.',
      }}
      pricingNote="From \u00a3300 for the recommended course of two sessions four weeks apart. Single top-up sessions every six months keep the result, and pricing for additional zones such as neck or hands is agreed at consultation."
      faqs={[
        {
          question: 'How is Profhilo different from dermal filler?',
          answer:
            'Both are made from hyaluronic acid, but they behave very differently. Filler is a structured gel that stays where it is placed and adds volume, perfect for cheeks, lips or jawline. Profhilo is a much thinner formula designed to spread under the skin like a layer of moisture, then gently stimulate your own collagen. It does not change your shape, it improves the quality of the skin itself. Many clients have both, with filler giving structure and Profhilo giving the glow that sits on top.',
        },
        {
          question: 'How many sessions will I need?',
          answer:
            'A standard course is two sessions four weeks apart, which works for most clients. After the second session, results continue to develop for around eight weeks as your collagen rebuilds. Most people then have a single maintenance session every six months to hold the result. If your skin is particularly dehydrated or sun damaged, I sometimes suggest a third session in the first course. We can plan that together once we have seen how your skin responds.',
        },
        {
          question: 'When will I see results?',
          answer:
            'Some clients notice extra hydration within the first two weeks, but the real change is visible from four weeks after the second session. That is when the collagen and elastin response really shows: skin looks smoother, firmer and more reflective. Final results sit around the eight to ten week mark. Photos taken before treatment are useful here because change happens gradually, and it is easy to forget how skin looked before until you compare side by side.',
        },
        {
          question: 'Can Profhilo be combined with anti-wrinkle injections?',
          answer:
            'Yes, and it often is. Anti-wrinkle injections relax the muscles that cause expression lines, while Profhilo improves the quality of the skin draped over them. The two treatments solve different problems and work very well together. For most clients I prefer to space the appointments at least a week apart and start with whichever treatment is the priority. In your consultation we can map out a sensible order for the next few months rather than doing everything in one go.',
        },
        {
          question: 'Is there any downtime?',
          answer:
            'Very little. You will see five small bumps on each side of the face right after treatment, which usually flatten within a few hours and almost always within 24. A small bruise is possible but uncommon. Avoid makeup, the gym, saunas and facials for the first 24 hours, then carry on as normal. Most clients book a session over their lunch break with no obvious sign by the next morning, which makes Profhilo a popular pre-event treatment.',
        },
      ]}
      practitionerNote="Profhilo is one of the treatments I recommend most often, especially for clients who say they do not want to look different, they just want their skin to look like it used to. It quietly does the work, and the glow at six weeks is always worth the wait."
    />
  )
}
