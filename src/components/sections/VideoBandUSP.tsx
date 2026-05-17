'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

type CTA = { label: string; href: string }

type VideoBandUSPProps = {
  eyebrow?: string
  heading: string
  subline?: string
  cta?: CTA
  /** Desktop video source. Defaults to approach.mp4 (lightweight, ~680KB). */
  desktopSrc?: string
  /**
   * Mobile video source. Defaults to approach.mp4 (no mobile-specific
   * version exists for the approach clip — file is small enough to use on
   * mobile too).
   */
  mobileSrc?: string
  /** Poster image shown before the video buffers / when motion is reduced. */
  poster?: string
  /**
   * Tint behind the overlay text. "dark" keeps the cream text legible
   * over the footage. "warm" uses a cream-tinted bottom fade — useful
   * when the band sits between two cream-toned sections.
   */
  tint?: 'dark' | 'warm'
  /** Optional extra className for the section wrapper. */
  className?: string
}

/**
 * Edge-to-edge full-bleed video band used to break up long pages and
 * carry a single, clinic-level USP. Autoplay is muted + looped and
 * respects `prefers-reduced-motion`.
 */
export default function VideoBandUSP({
  eyebrow,
  heading,
  subline,
  cta,
  desktopSrc = '/video/usp/imagine-d74dac63.mp4',
  mobileSrc = '/video/usp/imagine-d74dac63.mp4',
  poster,
  tint = 'dark',
  className = '',
}: VideoBandUSPProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      v.pause()
      try { v.currentTime = 0 } catch {}
      return
    }
    v.muted = true
    v.play().catch(() => { /* autoplay blocked, falls back to poster */ })
  }, [])

  const isExternal = !!cta && /^https?:\/\//.test(cta.href)

  // 20% baseline tint across the whole band, smoothly deepening to ~80%
  // at the bottom so text reads crisply over busy footage.
  const overlay =
    tint === 'warm'
      ? 'linear-gradient(180deg, rgba(31,27,26,0.20) 0%, rgba(31,27,26,0.30) 35%, rgba(31,27,26,0.55) 70%, rgba(31,27,26,0.75) 100%)'
      : 'linear-gradient(180deg, rgba(31,27,26,0.20) 0%, rgba(31,27,26,0.35) 35%, rgba(31,27,26,0.60) 70%, rgba(31,27,26,0.80) 100%)'

  return (
    <section
      aria-label={heading}
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: 'clamp(340px, 60svh, 620px)' }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={desktopSrc} type="video/mp4" media="(min-width: 720px)" />
        <source src={mobileSrc} type="video/mp4" />
      </video>

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: overlay }}
      />

      <div className="relative h-full flex items-end md:items-center px-5 md:px-12 lg:px-20 py-12 md:py-16">
        <div className="max-w-[1280px] w-full mx-auto">
          <div className="max-w-2xl">
            {eyebrow && (
              <div
                className="mb-4"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#D4B89A',
                  fontWeight: 500,
                }}
              >
                {eyebrow}
              </div>
            )}
            <h2
              className="font-display italic"
              style={{
                color: '#F5F0EC',
                fontSize: 'clamp(34px, 5vw, 60px)',
                lineHeight: 1.05,
                letterSpacing: '-0.015em',
                fontWeight: 400,
                textShadow: '0 2px 18px rgba(0,0,0,0.35)',
              }}
            >
              {heading}
            </h2>
            {subline && (
              <p
                className="mt-5 md:mt-6 max-w-xl"
                style={{
                  color: 'rgba(245,240,236,0.92)',
                  fontSize: 'clamp(15px, 1.25vw, 18px)',
                  lineHeight: 1.6,
                  textShadow: '0 1px 8px rgba(0,0,0,0.35)',
                }}
              >
                {subline}
              </p>
            )}
            {cta && (
              <div className="mt-7 md:mt-8">
                {isExternal ? (
                  <a
                    href={cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 group"
                    style={{
                      color: '#F5F0EC',
                      fontSize: 12,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                    }}
                  >
                    <span className="border-b border-cream/60 group-hover:border-gold-soft transition-colors pb-1">
                      {cta.label}
                    </span>
                    <span aria-hidden style={{ color: '#D4B89A' }}>→</span>
                  </a>
                ) : (
                  <Link
                    href={cta.href}
                    className="inline-flex items-center gap-2 group"
                    style={{
                      color: '#F5F0EC',
                      fontSize: 12,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                    }}
                  >
                    <span className="border-b border-cream/60 group-hover:border-gold-soft transition-colors pb-1">
                      {cta.label}
                    </span>
                    <span aria-hidden style={{ color: '#D4B89A' }}>→</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
