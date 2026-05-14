import type { Metadata } from 'next'
import CompareTemplate from '@/components/sections/CompareTemplate'

export const metadata: Metadata = {
  title: 'Profhilo vs Dermal Filler: Which One Do You Need? | Visage Aesthetics',
  description: 'Both contain hyaluronic acid. Only one adds volume. Profhilo improves skin quality; dermal filler restores structure. A clear, honest comparison from an awarded nurse-led clinic.',
  alternates: { canonical: '/compare/profhilo-vs-dermal-filler' },
  openGraph: {
    title: 'Profhilo vs Dermal Filler | Visage Aesthetics',
    description: 'Both contain hyaluronic acid; only one adds volume. The honest difference.',
    url: 'https://www.vaclinic.co.uk/compare/profhilo-vs-dermal-filler',
    images: [{ url: '/og?title=Profhilo+vs+Dermal+Filler&eyebrow=Treatment+Comparison', width: 1200, height: 630, alt: 'Profhilo vs Dermal Filler — Visage Aesthetics' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Profhilo vs Dermal Filler | Visage Aesthetics',
    description: 'Both contain hyaluronic acid; only one adds volume.',
    images: ['/og?title=Profhilo+vs+Dermal+Filler&eyebrow=Treatment+Comparison'],
  },
}

export default function ProfhiloVsFiller() {
  return (
    <CompareTemplate
      slug="profhilo-vs-dermal-filler"
      pageTitle="Profhilo vs Dermal Filler"
      intro="Both contain hyaluronic acid. Both are injected. They do completely different jobs. Many clients arrive at consultation thinking they want filler when what they actually need is Profhilo — and the other way round."
      left={{
        name: 'Profhilo',
        href: '/treatments/profhilo',
        tagline: 'Bio-remodels skin quality',
        whatItDoes: 'Profhilo is a high-concentration, ultra-pure hyaluronic acid that spreads through the skin and stimulates the body to produce its own collagen, elastin and hyaluronic acid. The result is hydration, bounce and texture improvement across the treated area. It never adds volume.',
        bestFor: [
          'Skin that has lost its bounce or glow',
          'Clients in their late 30s through 60s',
          'Crepey skin on the neck, décolletage or inner arms (Profhilo Body)',
          'Anyone who feels their underlying skin quality is the issue',
        ],
        notFor: [
          'Volume change (cheeks, lips, jawline) — that\'s a job for filler',
          'Movement lines (Botox is the right call)',
          'Anyone wanting a dramatic, immediate change — Profhilo is gradual',
        ],
        priceFrom: 'From £180 / session',
        lasts: '6–9 months from a course of two',
      }}
      right={{
        name: 'Dermal Filler',
        href: '/treatments/dermal-filler',
        tagline: 'Adds volume in a specific spot',
        whatItDoes: 'Dermal filler is a hyaluronic acid gel placed in a specific layer of tissue. It physically takes up space, restoring or adding volume exactly where the practitioner puts it. It does not improve overall skin quality outside the placement zone.',
        bestFor: [
          'Restoring cheek or jawline volume that has thinned',
          'Lip definition and balance',
          'Tear-trough shadow caused by volume loss',
          'Marionette lines and nasolabial folds',
          'Non-surgical chin and rhinoplasty work',
        ],
        notFor: [
          'Improving overall skin glow or texture',
          'Anyone whose actual concern is skin quality, not shape',
          'Movement lines (Botox is the right answer)',
        ],
        priceFrom: 'From £110 / 0.5ml',
        lasts: '9–18 months',
      }}
      chooseLeftWhen={[
        'Your skin feels less hydrated, bouncy or radiant than it used to',
        'You\'re happy with the shape of your face, but the quality of the canvas',
        'You\'re early in your aesthetics journey and don\'t want volume change',
        'Crepey skin on neck, décolletage or arms is what you\'d like to soften',
      ]}
      chooseRightWhen={[
        'A specific area has lost volume (cheeks, temples, jawline)',
        'You want subtle lip definition or balance',
        'You have visible nasolabial folds or marionette lines',
        'Tear-trough shadow has appeared over time',
      ]}
      chooseBothWhen={[
        'You have both volume loss and skin quality decline (most clients in their 40s+)',
        'You want a complete plan staged over a few months',
        'You\'ve had filler before and now want to address the canvas underneath',
      ]}
      faqs={[
        {
          question: 'Is Profhilo a filler?',
          answer: 'No, and this is the most important distinction. Filler adds volume in a specific area. Profhilo spreads through the skin and stimulates the body to produce its own collagen, elastin and hyaluronic acid. The result is hydration and texture, never volume.',
        },
        {
          question: 'Can I have both?',
          answer: 'Yes, often the right plan. Profhilo improves the canvas; filler can then sit on top to handle specific volume work. Many clients in their 40s and 50s benefit from both. We plan the sequence carefully — usually Profhilo first to optimise the skin, then filler if still needed at review.',
        },
        {
          question: 'Which is cheaper over time?',
          answer: 'Profhilo courses (two sessions at £380 total, lasting 6-9 months) work out at roughly £40-£50/month. Filler is higher up-front but lasts longer per area. They\'re not really comparable on price — they solve different problems.',
        },
        {
          question: 'Will I see results quickly?',
          answer: 'Filler results are visible immediately and settle over two weeks. Profhilo is gradual: a soft glow at 2-3 weeks, biggest visible change around 8 weeks after the second session. If you have an event in 4 weeks, filler is the more reliable timeline.',
        },
        {
          question: 'Which is safer?',
          answer: 'Both are very safe when done by a qualified medical professional. Profhilo arguably has a slightly simpler safety profile (no risk of vascular occlusion because it\'s spread through tissue rather than placed in a specific layer). HA filler is fully reversible. At Visage we keep reversal product on site as standard.',
        },
        {
          question: 'My friend had filler and it looked great. Do I need the same thing?',
          answer: 'Possibly not. The right treatment is dictated by your anatomy, not by what worked for someone else. At consultation we look at your face properly and tell you honestly whether filler, Profhilo, both, or neither is the right call this year.',
        },
      ]}
    />
  )
}
