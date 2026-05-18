'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

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
   * Tint behind the overlay text on the mobile full-bleed layout. Desktop
   * lays out as a contained card + text column and does NOT use overlay.
   */
  tint?: 'dark' | 'warm'
  /** Optional extra className for the section wrapper. */
  className?: string
}

/**
 * Two layouts in one component:
 *
 *  - **Mobile (`< md`)**: edge-to-edge full-bleed video with a gradient
 *    overlay and cream text floating over it.
 *  - **Desktop (`md+`)**: a contained card. Video sits in a rounded 4/5
 *    frame on the right, with the eyebrow / heading / subline / CTA in
 *    their own column to the left, in dark type on a cream background.
 *
 * Autoplay is muted + looped, respects `prefers-reduced-motion`, and the
 * video itself is lazy-loaded via IntersectionObserver — sources aren't
 * attached until the band is within ~400px of the viewport.
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
  const sectionRef = useRef<HTMLElement>(null)
  // Two refs because we render the <video> element once per layout —
  // mobile (display:none on md+) and desktop (display:none below md).
  // The browser dedupes the source fetch via HTTP cache.
  const mobileVideoRef = useRef<HTMLVideoElement>(null)
  const desktopVideoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded) return
    const section = sectionRef.current
    if (!section) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    if (typeof IntersectionObserver === 'undefined') {
      setLoaded(true)
      return
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setLoaded(true)
            obs.disconnect()
            break
          }
        }
      },
      { rootMargin: '400px 0px' },
    )
    obs.observe(section)
    return () => obs.disconnect()
  }, [loaded])

  useEffect(() => {
    if (!loaded) return
    for (const v of [mobileVideoRef.current, desktopVideoRef.current]) {
      if (!v) continue
      v.muted = true
      try { v.load() } catch { /* ignore */ }
      v.play().catch(() => { /* autoplay blocked, falls back to poster */ })
    }
  }, [loaded])

  const isExternal = !!cta && /^https?:\/\//.test(cta.href)

  // Gradient overlay only used on the mobile full-bleed layout.
  const overlay =
    tint === 'warm'
      ? 'linear-gradient(180deg, rgba(31,27,26,0.20) 0%, rgba(31,27,26,0.30) 35%, rgba(31,27,26,0.55) 70%, rgba(31,27,26,0.75) 100%)'
      : 'linear-gradient(180deg, rgba(31,27,26,0.20) 0%, rgba(31,27,26,0.35) 35%, rgba(31,27,26,0.60) 70%, rgba(31,27,26,0.80) 100%)'

  const makeVideo = (ref: React.RefObject<HTMLVideoElement | null>) => (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      className="absolute inset-0 w-full h-full object-cover"
    >
      {loaded && (
        <>
          <source src={desktopSrc} type="video/mp4" media="(min-width: 720px)" />
          <source src={mobileSrc} type="video/mp4" />
        </>
      )}
    </video>
  )

  const ctaInline = cta && (
    <div className="mt-7 md:mt-8">
      {isExternal ? (
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 group"
          style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500 }}
        >
          <span className="border-b border-current pb-1 transition-colors">{cta.label}</span>
          <span aria-hidden>→</span>
        </a>
      ) : (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-2 group"
          style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500 }}
        >
          <span className="border-b border-current pb-1 transition-colors">{cta.label}</span>
          <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  )

  return (
    <section
      ref={sectionRef}
      aria-label={heading}
      className={`relative w-full ${className}`}
    >
      {/* ─────────────────────────────────────────── MOBILE LAYOUT
          Full-bleed edge-to-edge with text overlay on video. Unchanged. */}
      <div
        className="md:hidden relative w-full overflow-hidden"
        style={{ height: 'clamp(340px, 60svh, 620px)' }}
      >
        {makeVideo(mobileVideoRef)}
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: overlay }} />
        <div className="relative h-full flex items-end px-5 py-12">
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
                className="mt-5 max-w-xl"
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
              <div className="mt-7" style={{ color: '#F5F0EC' }}>
                {isExternal ? (
                  <a
                    href={cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                    style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500 }}
                  >
                    <span className="border-b border-cream/60 pb-1">{cta.label}</span>
                    <span aria-hidden style={{ color: '#D4B89A' }}>→</span>
                  </a>
                ) : (
                  <Link
                    href={cta.href}
                    className="inline-flex items-center gap-2"
                    style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500 }}
                  >
                    <span className="border-b border-cream/60 pb-1">{cta.label}</span>
                    <span aria-hidden style={{ color: '#D4B89A' }}>→</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────── DESKTOP LAYOUT
          Contained card: video in a rounded 4/5 frame, text in its own
          column beside it. No overlay needed because text sits on cream. */}
      <div
        className="hidden md:block"
        style={{ background: '#EFE8E0', padding: 'var(--section-y) var(--pad-x)' }}
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="col-span-7 order-2">
              <div className="relative w-full aspect-[4/5] rounded-md overflow-hidden" style={{ boxShadow: '0 30px 80px -40px rgba(31, 27, 26, 0.35)' }}>
                {makeVideo(desktopVideoRef)}
              </div>
            </div>
            <div className="col-span-5 order-1">
              {eyebrow && (
                <div
                  className="mb-5"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: '#A8895E',
                    fontWeight: 500,
                  }}
                >
                  {eyebrow}
                </div>
              )}
              <h2
                className="font-display italic text-charcoal"
                style={{
                  fontSize: 'clamp(32px, 3.4vw, 48px)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.015em',
                  fontWeight: 400,
                }}
              >
                {heading}
              </h2>
              {subline && (
                <p
                  className="mt-6 max-w-xl text-ink-soft"
                  style={{ fontSize: 16.5, lineHeight: 1.65 }}
                >
                  {subline}
                </p>
              )}
              {cta && (
                <div className="mt-8 text-charcoal hover:text-gold-deep transition-colors">
                  {ctaInline}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
