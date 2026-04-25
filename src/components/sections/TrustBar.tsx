import { Star, Award, Stethoscope, Clock, ShieldCheck } from 'lucide-react'

const signals = [
  { Icon: Star, label: '5.0 Google rating', sub: '50+ reviews', filled: true },
  { Icon: Award, label: 'MSc Advanced Practice', sub: 'University qualified' },
  { Icon: Stethoscope, label: 'RN Registered Nurse', sub: 'NMC regulated' },
  { Icon: Clock, label: '20+ years experience', sub: 'Clinical expertise' },
  { Icon: ShieldCheck, label: 'Accredited practitioner', sub: 'Safety certified' },
]

export default function TrustBar() {
  return (
    <section className="bg-cream-soft border-y border-line/25 py-7 md:py-8">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-6">
          {signals.map(({ Icon, label, sub, filled }, i) => (
            <div key={i} className="flex flex-col items-start md:items-center text-left md:text-center gap-1.5">
              <Icon
                size={16}
                strokeWidth={1.5}
                className={filled ? 'fill-bronze text-gold' : 'text-gold'}
              />
              <div className="text-eyebrow text-charcoal">{label}</div>
              <div className="text-xs text-ink-soft">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
