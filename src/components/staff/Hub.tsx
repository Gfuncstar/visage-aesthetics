import Link from 'next/link'
import { ArrowLeft, type LucideIcon } from 'lucide-react'

export type HubCard = { href: string; title: string; description: string; Icon: LucideIcon; badge?: string }

// A simple section hub: a back link, a heading, an optional banner, and a grid
// of cards (two per row). Used by the Receptionist and Marketing sections.
export default function Hub({
  eyebrow,
  title,
  intro,
  backHref = '/staff',
  backLabel = 'Staff',
  cards,
  banner,
}: {
  eyebrow: string
  title: string
  intro?: string
  backHref?: string
  backLabel?: string
  cards: HubCard[]
  banner?: React.ReactNode
}) {
  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-24">
        <Link href={backHref} className="inline-flex items-center gap-2 mb-5 bg-charcoal text-cream rounded-sm px-4 py-3 text-sm font-medium hover:bg-gold-deep transition-colors">
          <ArrowLeft size={14} strokeWidth={1.75} /> {backLabel}
        </Link>
        <div className="eyebrow text-gold mb-2">{eyebrow}</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">{title}</h1>
        {intro && <p className="text-ink-soft mt-3 max-w-xl leading-relaxed">{intro}</p>}
        {banner && <div className="mt-6">{banner}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
          {cards.map(({ href, title: t, description, Icon, badge }) => (
            <Link key={href} href={href} className="group relative bg-cream-soft border border-line/40 rounded-sm p-5 hover:border-gold transition-colors flex flex-col">
              {badge && <span className="absolute top-3 right-3 text-[10px] tracking-[0.16em] uppercase rounded-full px-2 py-0.5 bg-gold/15 text-gold-deep border border-gold/40">{badge}</span>}
              <div className="inline-flex w-10 h-10 rounded-full bg-charcoal text-cream items-center justify-center mb-3 group-hover:bg-gold-deep transition-colors">
                <Icon size={16} strokeWidth={1.75} />
              </div>
              <h2 className="font-display italic text-lg text-charcoal leading-tight">{t}</h2>
              <p className="text-xs text-ink-soft mt-1 leading-snug">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
