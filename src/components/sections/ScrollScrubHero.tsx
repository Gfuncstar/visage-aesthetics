'use client'

import { useEffect, useRef } from 'react'
import GoogleG from '@/components/ui/GoogleG'
import { BOOKING_LINK_PROPS } from '@/lib/booking'

export default function ScrollScrubHero() {
  const heroRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const panel1Ref = useRef<HTMLDivElement>(null)
  const panel2Ref = useRef<HTMLDivElement>(null)
  const cueRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    const video = videoRef.current
    const panel1 = panel1Ref.current
    const panel2 = panel2Ref.current
    const cue = cueRef.current
    if (!hero || !video) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      try { video.currentTime = 0 } catch {}
      if (panel1) panel1.style.opacity = '1'
      if (panel2) panel2.style.opacity = '1'
      return
    }

    let videoDuration = 0
    let targetTime = 0
    let displayedTime = 0
    let rafId = 0
    let rafScheduled = false

    const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1)

    const computeTarget = () => {
      const rect = hero.getBoundingClientRect()
      const total = hero.offsetHeight - window.innerHeight
      const progress = clamp01(-rect.top / total)

      if (panel1) {
        const p1 = 1 - clamp01((progress - 0.65) / 0.20)
        panel1.style.opacity = String(p1)
        panel1.style.transform = `translateY(${-progress * 30}px)`
      }
      if (panel2) {
        // Trust signals: visible from start, fade out only at the very end
        const p2Out = 1 - clamp01((progress - 0.88) / 0.12)
        panel2.style.opacity = String(p2Out)
      }
      if (cue) cue.style.opacity = String(Math.max(0, 1 - progress * 5))

      if (videoDuration > 0) targetTime = progress * videoDuration
    }

    const tick = () => {
      const diff = targetTime - displayedTime
      displayedTime += diff * 0.18
      if (Math.abs(diff) < 0.001) displayedTime = targetTime
      try {
        if (videoDuration > 0 && Math.abs(video.currentTime - displayedTime) > 0.01) {
          video.currentTime = displayedTime
        }
      } catch {}
      rafId = requestAnimationFrame(tick)
    }

    let unlocked = false
    const unlock = () => {
      if (unlocked) return
      unlocked = true
      video.play().then(() => video.pause()).catch(() => {})
    }
    const events: (keyof DocumentEventMap)[] = ['touchstart', 'pointerdown', 'click', 'wheel', 'keydown']
    events.forEach((evt) => document.addEventListener(evt, unlock, { once: true, passive: true }))
    video.play().then(() => video.pause()).catch(() => {})

    const onMeta = () => {
      videoDuration = video.duration || 0
      computeTarget()
      if (!rafId) tick()
    }
    if (video.readyState >= 1) onMeta()
    else video.addEventListener('loadedmetadata', onMeta)

    const onScroll = () => {
      if (!rafScheduled) {
        rafScheduled = true
        requestAnimationFrame(() => { rafScheduled = false; computeTarget() })
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    computeTarget()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <section ref={heroRef} className="scrub-hero" id="hero">
      <div className="scrub-sticky">
        <video
          ref={videoRef}
          className="scrub-video"
          muted
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
          tabIndex={-1}
        >
          <source src="/video/walkthrough.mp4" type="video/mp4" media="(min-width: 720px)" />
          <source src="/video/walkthrough-mobile.mp4" type="video/mp4" />
        </video>
        <div className="scrub-overlay" aria-hidden />
        <div className="award-stack">
          <div className="award-badge" aria-label="Best Non-Surgical Aesthetics Clinic 2026, Essex">
            <span className="award-eyebrow">Awarded</span>
            <span className="award-laurel" aria-hidden>
              <span className="laurel-l">❦</span>
              <span className="award-title">
                Best Non-Surgical
                <br />
                Aesthetics Clinic
              </span>
              <span className="laurel-r">❦</span>
            </span>
            <span className="award-meta">2026 &nbsp;·&nbsp; Essex</span>
          </div>
          <div className="award-badge award-badge-nominee" aria-label="Educator of the Year 2026 Nominee">
            <span className="award-eyebrow">Nominated</span>
            <span className="award-laurel" aria-hidden>
              <span className="laurel-l">❦</span>
              <span className="award-title">
                Educator of
                <br />
                the Year
              </span>
              <span className="laurel-r">❦</span>
            </span>
            <span className="award-meta">2026 &nbsp;·&nbsp; Nominee</span>
          </div>
        </div>
        <div className="scrub-content" style={{ padding: '120px var(--pad-x) 160px', justifyContent: 'flex-end', gap: 32 }}>
          <div ref={panel1Ref} className="scrub-panel">
            <div className="max-w-[1280px] mx-auto">
              <div
                className="eyebrow eyebrow-no-glow mb-8"
                style={{
                  animation: 'fadeUp 1s 0.2s var(--ease) forwards',
                  opacity: 0,
                  lineHeight: 1.6,
                  color: '#FFFFFF',
                  textShadow: '0 2px 24px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.15)',
                }}
              >
                Private nurse-led clinic
                <br />
                By appointment · Braintree
              </div>
              <h1 className="text-h1" style={{ color: '#F5F0EC', fontWeight: 300, textShadow: '0 4px 32px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.15)' }}>
                <span className="block">
                  <span className="word-rise"><span style={{ animationDelay: '0.30s' }}>Enhancing what&apos;s</span></span>
                </span>
                <span className="block">
                  <span className="word-rise"><span style={{ animationDelay: '0.45s' }}>naturally yours.</span></span>
                </span>
              </h1>
            </div>
          </div>

          <div ref={panel2Ref} className="scrub-panel">
            <div className="max-w-[1280px] mx-auto">
              <div
                className="flex items-end justify-between gap-6 flex-wrap"
                style={{ opacity: 0, animation: 'fadeUp 1.1s 1.2s var(--ease) forwards' }}
              >
                <a
                  {...BOOKING_LINK_PROPS}
                  className="btn btn-primary !min-h-[24px] !px-3.5 !py-2"
                  style={{ minWidth: 110, fontSize: 9.5, letterSpacing: '0.15em', gap: 8 }}
                >
                  <span>Book a free consultation</span>
                  <span className="btn-arrow">→</span>
                </a>
                <div className="hidden sm:flex items-center gap-5 lg:gap-7 text-stone">
                  <MiniSignal icon={<GoogleG size={14} />} label="5.0" />
                  <Dot />
                  <MiniSignal label="MSc" />
                  <Dot />
                  <MiniSignal label="RN" />
                  <Dot />
                  <MiniSignal label="20+ years" />
                  <Dot />
                  <MiniSignal label="Accredited" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          ref={cueRef}
          className="absolute bottom-8 right-[var(--pad-x)] flex items-center gap-2.5 z-10"
          style={{
            fontSize: 10,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            fontWeight: 600,
            textShadow: '0 1px 2px rgba(31, 27, 26, 0.45)',
            opacity: 0,
            animation: 'fadeUp 1s 1.6s var(--ease) forwards',
          }}
        >
          Scroll
          <span className="block w-px h-9" style={{ background: '#FFFFFF', boxShadow: '0 1px 2px rgba(31, 27, 26, 0.35)' }} />
        </div>
      </div>
    </section>
  )
}

function MiniSignal({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-charcoal" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
      {icon}
      {label}
    </span>
  )
}

function Dot() {
  return <span className="inline-block w-px h-3 bg-line" aria-hidden />
}
