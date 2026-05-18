'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import Watermark from '@/components/ui/Watermark'
import { beforeAfter, availableTreatmentLabels, type BeforeAfter } from '@/lib/before-after'
import { treatments } from '@/lib/treatments'

const FILTER_ALL = 'All'

const aspectClass: Record<string, string> = {
  '4/5': 'aspect-[4/5]',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '3/4': 'aspect-[3/4]',
}

const treatmentHrefBySlug: Record<string, string> = Object.fromEntries(
  treatments.map((t) => [t.slug, t.href]),
)

export default function ResultsGallery() {
  const labels = [FILTER_ALL, ...availableTreatmentLabels()]
  const [filter, setFilter] = useState<string>(FILTER_ALL)
  const visible: BeforeAfter[] = filter === FILTER_ALL ? beforeAfter : beforeAfter.filter((b) => b.treatmentLabel === filter)

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-10 md:mb-12" role="tablist" aria-label="Filter results by treatment">
        {labels.map((f) => {
          const selected = filter === f
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(f)}
              className={`text-eyebrow px-4 py-2 rounded-sm border transition-colors ${
                selected
                  ? 'bg-gold text-charcoal border-gold'
                  : 'bg-transparent text-charcoal border-line/30 hover:border-gold hover:text-gold'
              }`}
            >
              {f}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {visible.map((b) => {
          const href = treatmentHrefBySlug[b.treatmentSlug]
          const tile = (
            <figure className="bg-cream-soft border border-line/25 rounded-md overflow-hidden h-full flex flex-col">
              <div className={`relative w-full ${aspectClass[b.aspect] ?? 'aspect-[4/3]'}`}>
                <Image
                  src={b.src}
                  alt={b.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 90vw"
                  className="object-cover"
                />
                <span
                  className="absolute top-3 left-3 bg-charcoal/85 text-cream text-eyebrow px-2.5 py-1 rounded-sm"
                  style={{ fontSize: 10, letterSpacing: '0.18em', fontWeight: 500 }}
                >
                  {b.treatmentLabel}
                </span>
                <span
                  aria-hidden
                  className="absolute top-3 right-3 bg-cream/85 text-charcoal px-2 py-1 rounded-sm"
                  style={{ fontSize: 9.5, letterSpacing: '0.18em', fontWeight: 500, textTransform: 'uppercase' }}
                >
                  Before / After
                </span>
                <Watermark />
              </div>
              <figcaption className="p-5 flex-1 flex flex-col">
                <p className="text-sm text-charcoal leading-snug">{b.caption}</p>
                <p className="mt-2 text-stone" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500 }}>
                  Photographed at Visage · Consented
                </p>
                {href && (
                  <span className="mt-3 inline-flex items-center gap-1.5 text-gold" style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}>
                    Read about {b.treatmentLabel.toLowerCase()} <span aria-hidden>→</span>
                  </span>
                )}
              </figcaption>
            </figure>
          )
          return href ? (
            <Link key={b.id} href={href} aria-label={`${b.alt} Read about ${b.treatmentLabel}.`} className="block focus:outline-none focus:ring-2 focus:ring-gold rounded-md">
              {tile}
            </Link>
          ) : (
            <div key={b.id}>{tile}</div>
          )
        })}
      </div>
    </>
  )
}
