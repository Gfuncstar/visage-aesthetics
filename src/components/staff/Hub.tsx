import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'

export type HubCard = { href: string; title: string; description: string; Icon: LucideIcon; badge?: string }

// A section hub: a slim brand header, a heading, an optional banner, and a grid
// of cards (two per row). Navigation between sections is handled by the
// persistent bottom bar, so there is no back button here.
export default function Hub({
  eyebrow,
  title,
  intro,
  cards,
  banner,
}: {
  eyebrow: string
  title: string
  intro?: string
  cards: HubCard[]
  banner?: React.ReactNode
}) {
  return (
    <section className="bg-cream text-charcoal min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-7 md:pt-10 pb-24">
        <div className="eyebrow text-gold mb-2">{eyebrow}</div>
        <h1 className="font-display italic text-charcoal text-3xl md:text-5xl leading-tight">{title}</h1>
        {intro && <p className="text-ink-soft mt-3 max-w-xl leading-relaxed">{intro}</p>}
        {banner && <div className="mt-6">{banner}</div>}

        <div className="grid grid-cols-2 gap-3 mt-8">
          {cards.map(({ href, title: t, description, Icon, badge }) => (
            <Link key={href} href={href} className="group relative bg-cream-soft border border-line/40 rounded-sm p-4 sm:p-5 hover:border-gold transition-colors flex flex-col">
              {badge && <span className="absolute top-2.5 right-2.5 text-[9px] tracking-[0.14em] uppercase rounded-full px-2 py-0.5 bg-gold/15 text-gold-deep border border-gold/40">{badge}</span>}
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
