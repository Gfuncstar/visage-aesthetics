'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import GoogleG from '@/components/ui/GoogleG'

export type GoogleReviewCardProps = {
  author: string
  profilePhoto?: string | null
  relativeTime: string
  rating: number
  text: string
  /** When set, the card adds a live "View on Google" link out to this URL. */
  href?: string
}

const COLLAPSED_LINE_CLAMP = 3

export default function GoogleReviewCard({ author, profilePhoto, relativeTime, rating, text, href }: GoogleReviewCardProps) {
  const [expanded, setExpanded] = useState(false)
  // Heuristic: only show "Read more" when text is long enough that 3 lines wouldn't fit it.
  const isLong = text.length > 160

  return (
    <article className="bg-cream-soft p-7 md:p-8 flex flex-col transition-colors hover:bg-cream">
      <div className="flex items-center gap-3 mb-5">
        {profilePhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profilePhoto}
            alt={author}
            className="w-9 h-9 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blush flex items-center justify-center text-charcoal" style={{ fontSize: 13, fontWeight: 500 }}>
            {author.charAt(0)}
          </div>
        )}
        <div className="flex flex-col leading-tight">
          <span className="text-charcoal text-[13px] font-medium">{author}</span>
          <span className="text-stone text-[11px] mt-0.5">{relativeTime}</span>
        </div>
        <div className="ml-auto">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${author}'s review on Google`}
              className="inline-flex items-center justify-center w-7 h-7 rounded-full -m-1.5 hover:bg-gold/10 transition-colors"
            >
              <GoogleG size={14} />
            </a>
          ) : (
            <GoogleG size={14} />
          )}
        </div>
      </div>
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: rating }).map((_, j) => (
          <Star key={j} size={12} className="fill-gold text-gold" />
        ))}
      </div>
      <p
        className="font-display italic text-charcoal flex-1"
        style={{
          fontSize: 17,
          lineHeight: 1.45,
          fontWeight: 300,
          display: expanded ? 'block' : '-webkit-box',
          WebkitLineClamp: expanded ? 'unset' : COLLAPSED_LINE_CLAMP,
          WebkitBoxOrient: 'vertical',
          overflow: expanded ? 'visible' : 'hidden',
        }}
      >
        &ldquo;{text}&rdquo;
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        {isLong ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-stone hover:text-gold-deep transition-colors"
            style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}
            aria-expanded={expanded}
          >
            {expanded ? 'Read less' : 'Read more'} &nbsp;→
          </button>
        ) : (
          <span aria-hidden />
        )}
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-stone hover:text-gold-deep transition-colors"
            style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}
          >
            <span>View on Google</span>
            <span aria-hidden>↗</span>
          </a>
        )}
      </div>
    </article>
  )
}
