import type { Metadata } from 'next'
import TreatmentTemplate from '@/components/sections/TreatmentTemplate'
import { getTreatment } from '@/lib/treatments'

export const metadata: Metadata = {
  title: 'Anti-Wrinkle Injections | Visage Aesthetics Braintree',
  description:
    'Natural-looking anti-wrinkle injections for forehead lines, frown lines and crow\u2019s feet. Nurse-led botulinum toxin treatment in Braintree, Essex.',
}

export default function Page() {
  const treatment = getTreatment('anti-wrinkle-injections')!

  return (
    <TreatmentTemplate
      treatment={treatment}
      oneLineBenefit="Soften lines around the forehead, brow and eyes without losing your expression."
      overview="Anti-wrinkle injections use small, precise doses of botulinum toxin to relax the muscles that create dynamic lines on the forehead, between the brows and around the eyes. Treated well, you still look like yourself, just smoother and a little less tired. The appointment takes 10 to 15 minutes, there are no needles to fear and you can drive yourself home afterwards. Most clients return every three to four months to maintain results, and many start in their late twenties or early thirties as a preventative measure rather than waiting for deep lines to set in."
      benefits={[
        'Softens forehead lines, frown lines and crow\u2019s feet.',
        'Subtle, natural results with full expression preserved.',
        'No downtime, you can return to work straight away.',
        'Quick 10 to 15 minute appointment.',
        'Results typically last three to four months.',
        'Suitable as a preventative treatment from your late twenties.',
      ]}
      suitableFor={[
        'Adults aged 25 and over with moderate to severe dynamic wrinkles.',
        'Anyone wanting a preventative approach to early lines.',
        'Clients who have tried skincare and want a small clinical step further.',
        'Men and women looking for natural, refreshed results rather than a frozen look.',
      ]}
      notSuitableFor={[
        'Pregnant or breastfeeding women.',
        'Anyone with certain neuromuscular conditions such as myasthenia gravis.',
        'Active skin infection, rash or cold sore in the treatment area.',
        'Allergy to botulinum toxin or any of its ingredients.',
      ]}
      expect={{
        before:
          'A free consultation to assess your facial movement, discuss medical history and agree the dose. Avoid alcohol and blood-thinning supplements for 24 hours.',
        during:
          'A series of tiny injections into specific muscles, usually finished in 10 to 15 minutes. Most clients describe a brief pinch rather than pain.',
        after:
          'Stay upright for four hours and avoid the gym, sauna and lying flat. Results begin to appear from day three and settle by day fourteen.',
      }}
      pricingNote="From \u00a3150 for a single area, with sensible pricing for two or three areas at the same appointment. The fee covers your treatment, all product and a two-week review if you would like one."
      faqs={[
        {
          question: 'What is the difference between anti-wrinkle injections and dermal filler?',
          answer:
            'Anti-wrinkle injections relax the muscles that create movement lines, so they smooth wrinkles caused by expression such as frowning or squinting. Dermal filler is a gel that adds volume and structure to areas where you have lost fullness, like the cheeks or lips. They do completely different jobs and are often used together. In a consultation I will explain which one, or which combination, suits the concern you have raised, rather than recommending the same thing for everyone.',
        },
        {
          question: 'How long does it last?',
          answer:
            'Most clients see results lasting three to four months, with the muscles gradually returning to their normal movement after that. The first time you have treatment it sometimes wears off a little sooner, then settles into a longer pattern with regular top-ups. Heavy exercise, fast metabolism and stress can shorten the result, so the timing is slightly different for everyone. I usually suggest rebooking before you fully drop back to baseline so the muscles stay relaxed and lines stay softer.',
        },
        {
          question: 'Will it freeze my face or look obvious?',
          answer:
            'Not when it is done well. The frozen look comes from too much product, placed in the wrong spots, often by someone treating every face the same way. I dose conservatively at first and review you at two weeks, so we can add a small amount if needed rather than overshoot. The aim is for friends and family to say you look well rested, not that you look different. If you want a stronger result we can build to it gradually over a couple of cycles.',
        },
        {
          question: 'Can men have anti-wrinkle injections?',
          answer:
            'Yes, and an increasing number of men do. The technique is slightly different because male muscles are usually stronger and the brow shape needs to stay flatter rather than arched. Dosing is typically higher than for women, but the goal is the same: a softer, less tired look without anyone being able to point to what has changed. Many of my male clients come in before a big presentation, a wedding or simply because they are tired of the frown line that makes them look cross.',
        },
        {
          question: 'How often will I need top-ups?',
          answer:
            'A typical pattern is every three to four months for the first year, then some clients can stretch to four or five months as the muscles adapt and stay quieter for longer. I will not push you to come back sooner than you need to. At your review I will assess the result honestly and only recommend a repeat when there is a clear benefit. If you decide to stop entirely, your face will simply return to how it was, no withdrawal effect and no penalty.',
        },
      ]}
      practitionerNote="My approach to anti-wrinkle injections is simple: less is more, and you should still look like you. I would rather under-treat first and add a touch at your two-week review than risk a heavy result. Subtle, natural and yours."
    />
  )
}
