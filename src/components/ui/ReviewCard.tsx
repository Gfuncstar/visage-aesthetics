import { Star } from 'lucide-react'

export type Review = {
  name: string
  rating: number
  text: string
  treatment: string
}

export default function ReviewCard({ name, rating, text, treatment }: Review) {
  return (
    <article className="bg-cream border border-line/25 rounded-md p-6 md:p-7 flex flex-col h-full">
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={14} className="fill-bronze text-gold" />
        ))}
      </div>
      <p className="font-display text-charcoal text-lg leading-snug flex-1">
        &ldquo;{text}&rdquo;
      </p>
      <div className="mt-6 pt-5 border-t border-line/25 flex items-center justify-between">
        <span className="text-sm text-charcoal">{name}</span>
        <span className="text-eyebrow text-gold">{treatment}</span>
      </div>
    </article>
  )
}
