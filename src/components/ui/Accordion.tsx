'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

export type AccordionItem = { question: string; answer: string }

export default function Accordion({ items, defaultOpen }: { items: AccordionItem[]; defaultOpen?: number }) {
  const [open, setOpen] = useState<number | null>(defaultOpen ?? null)
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="border-t border-line/25 first:border-t-0">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="w-full flex items-start justify-between gap-6 py-5 md:py-6 text-left group"
          >
            <span className="font-display text-charcoal text-lg md:text-xl leading-snug">
              {item.question}
            </span>
            <span className="shrink-0 mt-1.5 text-gold">
              {open === i ? <Minus size={16} strokeWidth={1.5} /> : <Plus size={16} strokeWidth={1.5} />}
            </span>
          </button>
          {open === i && (
            <div className="pb-6 text-ink-soft text-body leading-relaxed max-w-2xl">
              {item.answer}
            </div>
          )}
        </div>
      ))}
      <div className="border-t border-line/25" />
    </div>
  )
}
