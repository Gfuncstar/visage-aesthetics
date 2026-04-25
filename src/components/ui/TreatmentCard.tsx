import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

type Props = {
  name: string
  tagline: string
  href: string
  image?: string
  price?: string
}

export default function TreatmentCard({ name, tagline, href, image, price }: Props) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden bg-cream-soft border border-line/25 rounded-md transition-colors hover:border-gold/60"
    >
      {image && (
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(min-width: 1024px) 28vw, (min-width: 640px) 48vw, 92vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/45 via-transparent to-transparent" />
          {price && (
            <div className="absolute top-4 right-4 text-eyebrow text-charcoal bg-charcoal/60 backdrop-blur-sm px-2.5 py-1 rounded-sm">
              {price}
            </div>
          )}
        </div>
      )}
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl md:text-2xl text-charcoal">{name}</h3>
            <p className="text-sm text-ink-soft mt-1.5">{tagline}</p>
          </div>
          <ArrowUpRight size={18} strokeWidth={1.5} className="text-gold shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  )
}
