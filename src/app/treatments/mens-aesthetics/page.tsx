import type { Metadata } from 'next'
import TreatmentTemplate from '@/components/sections/TreatmentTemplate'
import { getTreatment } from '@/lib/treatments'

export const metadata: Metadata = {
  title: 'Men\u2019s Aesthetics | Visage Aesthetics Braintree',
  description:
    'Discreet, clinical aesthetic treatments for men in Braintree, Essex. Anti-wrinkle, jawline filler, Profhilo and AQUALYX tailored to male anatomy.',
}

export default function Page() {
  const treatment = getTreatment('mens-aesthetics')!

  return (
    <TreatmentTemplate
      treatment={treatment}
      oneLineBenefit="Direct, clinical aesthetic treatments tailored to male anatomy and how men actually want to look."
      overview="Men\u2019s aesthetics is one of the fastest growing parts of the clinic. Anti-wrinkle injections to soften the eleven between the brows, jawline filler for definition, Profhilo for skin quality and AQUALYX for a softer chin or flank line are now sensible, mainstream options for men who want to look well without looking different. The technique is not the same as for women: stronger muscles, heavier brow, broader jaw and different priorities all matter. Treated properly the result should be impossible to spot and easy to live with. Discreet booking, no pressure, no upselling and a clear plan before any treatment starts."
      benefits={[
        'Softens frown lines and crow\u2019s feet without changing your face.',
        'Sharpens jawline and chin definition with sensible filler placement.',
        'Improves skin quality, hydration and tone with Profhilo.',
        'Targets stubborn under-chin or flank fat with AQUALYX.',
        'Discreet booking and no waiting in a busy reception.',
        'Honest plan, fixed prices, no upselling.',
      ]}
      suitableFor={[
        'Men aged 25 and over with frown lines, tiredness or jaw definition concerns.',
        'Professionals who want a clinical approach with discretion.',
        'Anyone considering aesthetics for the first time and unsure where to start.',
        'Men referred by a partner or friend who has had treatment with the clinic.',
      ]}
      notSuitableFor={[
        'Pregnant or breastfeeding partners attending in someone else\u2019s place.',
        'Active skin infection, rash or open wound in the treatment area.',
        'Certain neuromuscular conditions or known allergy to the products used.',
        'Anyone seeking dramatic surgical-style change rather than refinement.',
      ]}
      expect={{
        before:
          'A free consultation, ideally a week or two before any treatment, to map facial anatomy, agree the goal and the price in writing.',
        during:
          'Most appointments take 15 to 30 minutes depending on the treatment. Numbing cream is used where needed and you can drive home straight away.',
        after:
          'Mild redness or small bruising is possible for a few days. Avoid the gym and saunas for 24 hours, then return to normal life with no obvious change.',
      }}
      pricingNote="From \u00a3150 for anti-wrinkle treatment, from \u00a3200 per ml for filler. Combined plans across multiple treatments are quoted in full at consultation, with no surprise add-ons on the day."
      faqs={[
        {
          question: 'Will anyone be able to tell?',
          answer:
            'When the work is done well, no. The biggest worry I hear from male clients is the fear of looking obviously treated, and I share it. My approach is to dose conservatively, preserve full expression and place filler where it supports your existing structure rather than reinventing it. Friends, partners and colleagues should think you look well rested or in good shape, not different. If you ever feel something is too much, we review at two weeks and adjust together rather than carrying on regardless.',
        },
        {
          question: 'Which treatments are most popular with men?',
          answer:
            'Anti-wrinkle injections for the frown line and crow\u2019s feet are usually the starting point because they tackle the tired or cross look that bothers most men first. Jawline filler is the next most requested, particularly for clients in their late thirties who feel definition has softened. Profhilo for skin quality and AQUALYX for a small under-chin or flank pocket round out the most common requests. We can plan a combination across a few months rather than rushing everything into one appointment.',
        },
        {
          question: 'How painful is it?',
          answer:
            'Honestly, less than most men expect. Anti-wrinkle injections feel like a series of small pinches and are over in minutes. Filler appointments take longer and use a numbing cream and built-in anaesthetic in the product. Most clients describe the sensation as firm pressure rather than pain. AQUALYX is the most uncomfortable on this list, with a sting during injection and a few days of tenderness afterwards. I will warn you in advance and pace any session at a speed that works for you.',
        },
        {
          question: 'How do I book discreetly?',
          answer:
            'Appointments can be booked under your initials only and scheduled at a time when reception is quiet, including early morning or evening slots on certain days of the week. We do not call your name out, we do not share your details with anyone and we do not send marketing texts unless you actively opt in. Many of my male clients prefer to pay by card on the day rather than receive an emailed invoice, which is no problem. Just say what suits you when you book.',
        },
        {
          question: 'Do I need to take time off work?',
          answer:
            'Almost never. Anti-wrinkle injections, B12, CryoPen and a single Profhilo session can all be done over a long lunch break with no obvious sign by the next morning. Filler appointments may show small swelling or a tiny bruise for a day or two, particularly around the lips or jaw, but most clients carry on as normal the same evening. AQUALYX is the only treatment where I would suggest planning around a public-facing meeting for a few days, just in case of swelling.',
        },
      ]}
      practitionerNote="Treating men is the same clinical work as treating women, just with different anatomy and different priorities. The standard does not change: subtle results, honest advice and a plan you understand before anything starts. That is true whether you are 32 or 62."
    />
  )
}
