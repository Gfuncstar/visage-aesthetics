import type { Metadata } from 'next'
import CompareTemplate from '@/components/sections/CompareTemplate'

export const metadata: Metadata = {
  title: 'Botox vs Profhilo: Which Treats Your Concern? | Visage Aesthetics',
  description: 'Botox relaxes muscles to soften lines. Profhilo bio-remodels skin quality. Different treatments, different problems, sometimes both together. Honest comparison from an awarded nurse-led clinic.',
  alternates: { canonical: '/compare/botox-vs-profhilo' },
  openGraph: {
    title: 'Botox vs Profhilo | Visage Aesthetics',
    description: 'Botox treats movement; Profhilo treats skin quality. The honest difference.',
    url: 'https://www.vaclinic.co.uk/compare/botox-vs-profhilo',
    images: [{ url: '/og?title=Botox+vs+Profhilo&eyebrow=Treatment+Comparison', width: 1200, height: 630, alt: 'Botox vs Profhilo — Visage Aesthetics' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Botox vs Profhilo | Visage Aesthetics',
    description: 'Botox treats movement; Profhilo treats skin quality.',
    images: ['/og?title=Botox+vs+Profhilo&eyebrow=Treatment+Comparison'],
  },
}

export default function BotoxVsProfhilo() {
  return (
    <CompareTemplate
      slug="botox-vs-profhilo"
      pageTitle="Botox vs Profhilo"
      intro="Different molecules. Different jobs. Botox relaxes muscles to soften movement lines. Profhilo improves skin quality across an area. Many clients benefit from both — at different times of life, or together."
      left={{
        name: 'Botox',
        href: '/treatments/anti-wrinkle-injections',
        tagline: 'Relaxes muscles',
        whatItDoes: 'Anti-wrinkle injections use botulinum toxin to temporarily relax the muscles that create dynamic lines on the forehead, between the brows and around the eyes. Lines soften because the muscle pulling at the skin has been quieted.',
        bestFor: [
          'Forehead lines, frown lines, crow\'s feet',
          'Movement lines, not static ones',
          'Hyperhidrosis (excessive sweating) and bruxism (jaw clenching)',
          'Preventative use in late 20s / 30s',
        ],
        notFor: [
          'Skin texture, hydration or glow',
          'Crepey skin on neck, décolletage or arms',
          'Loss of bounce or radiance overall',
        ],
        priceFrom: 'From £120 / 1 area',
        lasts: '3–4 months',
      }}
      right={{
        name: 'Profhilo',
        href: '/treatments/profhilo',
        tagline: 'Bio-remodels skin',
        whatItDoes: 'Profhilo is a high-concentration ultra-pure hyaluronic acid placed via the BAP technique (five small injection points each side). It spreads through the skin and stimulates the body to produce its own collagen, elastin and hyaluronic acid.',
        bestFor: [
          'Skin that has lost bounce, hydration or glow',
          'Crepey skin on the neck, décolletage and inner arms (Profhilo Body)',
          'Overall texture improvement, not localised correction',
          'Clients who want gradual, never-dramatic results',
        ],
        notFor: [
          'Movement lines from frowning or squinting',
          'Anyone wanting volume change',
          'Anyone wanting a dramatic, fast result',
        ],
        priceFrom: 'From £180 / session',
        lasts: '6–9 months from a course of two',
      }}
      chooseLeftWhen={[
        'The issue is lines that appear when you frown, squint or raise your brows',
        'You want a fast, predictable result with minimal downtime',
        'You want preventative work on early dynamic lines',
        'You\'ve been told (or noticed) that your face reads as tense or tired',
      ]}
      chooseRightWhen={[
        'The issue is skin quality — bounce, glow, hydration, texture',
        'You\'re happy with how your face moves, but not how the skin looks',
        'You have crepey skin on the neck or chest',
        'You want gradual, never-obvious improvement that compounds over a course',
      ]}
      chooseBothWhen={[
        'You have both movement lines AND skin quality decline (most clients in 40s+)',
        'You want a plan that addresses muscle AND canvas',
        'You\'ve had Botox for years and the skin underneath now needs help too',
      ]}
      faqs={[
        {
          question: 'Can I have Botox and Profhilo together?',
          answer: 'Yes, often the right plan for clients in their 40s and 50s. They treat different problems and combine well. We usually schedule Profhilo and Botox at separate appointments two weeks apart so we can see each working on its own first.',
        },
        {
          question: 'Which one should I start with?',
          answer: 'Depends entirely on what\'s bothering you. If it\'s lines that appear with movement, Botox. If it\'s skin that looks dull or crepey, Profhilo. Honest answer: bring photos of yourself you like and don\'t like, and the practitioner can tell you which one will move the needle most.',
        },
        {
          question: 'Will Profhilo soften my forehead lines?',
          answer: 'Slightly, over time, by improving skin quality — but not the way Botox will. If movement lines are the main concern, Botox is the directly-targeted treatment. Profhilo is for the underlying skin quality.',
        },
        {
          question: 'How often will I need each?',
          answer: 'Botox every 3-4 months for ongoing effect. Profhilo: a course of two sessions four weeks apart, then maintenance every 6 months. Many clients sit on a rhythm of Botox every 4 months and Profhilo twice a year.',
        },
        {
          question: 'Are both safe?',
          answer: 'Yes, both are well-studied and safe when performed by a qualified medical professional with regulated product. At Visage, Bernadette is NMC registered with an MSc in Advanced Practice and full medical indemnity insurance.',
        },
      ]}
    />
  )
}
