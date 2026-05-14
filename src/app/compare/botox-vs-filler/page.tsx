import type { Metadata } from 'next'
import CompareTemplate from '@/components/sections/CompareTemplate'

export const metadata: Metadata = {
  title: 'Botox vs Dermal Filler: What\'s the Real Difference? | Visage Aesthetics',
  description: 'Honest, jargon-free comparison of Botox and dermal filler by Bernadette Tobin RGN, MSc. They are both injectable, they do completely different jobs. Which one (if either) is right for you.',
  alternates: { canonical: '/compare/botox-vs-filler' },
  openGraph: {
    title: 'Botox vs Dermal Filler | Visage Aesthetics',
    description: 'They are both injectable. They do completely different jobs. A clear comparison from an awarded nurse-led clinic.',
    url: 'https://www.vaclinic.co.uk/compare/botox-vs-filler',
    images: [{ url: '/og?title=Botox+vs+Dermal+Filler&eyebrow=Treatment+Comparison', width: 1200, height: 630, alt: 'Botox vs Dermal Filler — Visage Aesthetics' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Botox vs Dermal Filler | Visage Aesthetics',
    description: 'They are both injectable. They do completely different jobs.',
    images: ['/og?title=Botox+vs+Dermal+Filler&eyebrow=Treatment+Comparison'],
  },
}

export default function BotoxVsFiller() {
  return (
    <CompareTemplate
      slug="botox-vs-filler"
      pageTitle="Botox vs Dermal Filler"
      intro="Both are injectable. Both are common. They do completely different jobs and treat completely different problems. Mixing them up is the single most common mistake first-time clients make at consultation."
      left={{
        name: 'Botox',
        href: '/treatments/anti-wrinkle-injections',
        tagline: 'Relaxes muscles',
        whatItDoes: 'Anti-wrinkle injections (botulinum toxin) relax the muscles that create dynamic lines on the forehead, between the brows and around the eyes. The skin smooths because the muscle pulling at it has been quieted. They do not fill, plump or add volume anywhere.',
        bestFor: [
          'Forehead lines, frown lines, crow\'s feet',
          'Movement lines (lines that appear when you frown or squint)',
          'Preventative use in late 20s / early 30s',
          'Hyperhidrosis (excessive sweating) and bruxism (jaw clenching)',
        ],
        notFor: [
          'Lost volume — Botox cannot add volume',
          'Static lines etched in even at rest (those usually need a combination)',
          'Tear-trough shadow caused by anatomy, not movement',
        ],
        priceFrom: 'From £120 / 1 area',
        lasts: '3–4 months',
      }}
      right={{
        name: 'Dermal Filler',
        href: '/treatments/dermal-filler',
        tagline: 'Adds volume',
        whatItDoes: 'Dermal filler is a hyaluronic acid gel placed in a specific layer of tissue where it takes up space and physically supports the surrounding structures. It does not change muscle behaviour; it adds volume, structure or definition exactly where placed.',
        bestFor: [
          'Cheek and jawline volume restoration',
          'Lip definition and balance',
          'Marionette lines and nasolabial folds',
          'Non-surgical chin or rhinoplasty refinement',
          'Tear-trough shadow caused by volume loss',
        ],
        notFor: [
          'Movement lines (Botox is the right call here)',
          'Skin quality, glow or texture (consider Profhilo)',
          'Anyone wanting a permanent change (HA filler is reversible by design)',
        ],
        priceFrom: 'From £110 / 0.5ml',
        lasts: '9–18 months',
      }}
      chooseLeftWhen={[
        'You\'ve noticed lines appearing when you frown, squint or raise your brows',
        'You want a preventative approach to early dynamic lines',
        'You are looking to soften an expression that reads as cross or tired',
        'You want minimal downtime, short appointment, no swelling',
      ]}
      chooseRightWhen={[
        'You\'ve lost cheek or jawline volume with age',
        'You want subtle lip definition',
        'A specific feature has changed in proportion (chin, profile, balance)',
        'Tear-trough shadows that worsen when you smile or lose weight',
      ]}
      chooseBothWhen={[
        'You have a combination — some movement lines and some volume loss',
        'You\'re in your 40s or 50s and the face benefits from both layers',
        'You want a complete plan staged over a few months, not a one-shot result',
      ]}
      faqs={[
        {
          question: 'Can I have Botox and filler in the same appointment?',
          answer: 'Yes, often the right call. They treat different problems and can be combined at the same visit with no extra recovery. We plan the combination carefully — usually Botox first to relax the muscle, then filler placed knowing the muscle will be quieter.',
        },
        {
          question: 'Which one is cheaper?',
          answer: 'Botox starts lower (£120 per area) but needs more frequent maintenance (every 3-4 months). Filler is higher up-front (£110-£250 per area) but lasts 9-18 months. Over a 12-month horizon the costs typically even out; the better question is which one solves the actual concern.',
        },
        {
          question: 'Is one safer than the other?',
          answer: 'Both are extremely safe when performed by a qualified medical professional with regulated products. The risk lives in the practitioner, not the product. Both are reversible: Botox simply wears off over 3-4 months; HA filler can be dissolved within 24-48 hours using hyaluronidase if needed.',
        },
        {
          question: 'I\'ve been told I need filler but I think I want Botox. How do I know?',
          answer: 'Honestly, by sitting in front of someone who has no incentive to sell you either. At Visage the consultation is free and Bernadette will tell you when neither is the right answer, or when the actual fix is skincare, a different treatment, or simply waiting another year.',
        },
        {
          question: 'Will Botox stop me getting wrinkles later?',
          answer: 'Used preventatively from your late 20s or 30s, regular Botox can slow the development of static lines (the lines that stay even when your face is relaxed). It does not stop ageing. It quietens one of the contributors to it.',
        },
        {
          question: 'Will filler make my face look "done"?',
          answer: 'Only if it\'s overdosed or placed badly. Conservative dosing, the right viscosity for the area, and an experienced injector are the difference between subtle restoration and the overfilled look. At Visage we dose at the low end, review at two weeks, and add only if needed.',
        },
      ]}
    />
  )
}
