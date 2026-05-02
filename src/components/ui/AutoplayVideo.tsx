'use client'

import { useEffect, useRef } from 'react'

type AutoplayVideoProps = {
  src: string
  poster?: string
  className?: string
  style?: React.CSSProperties
  /**
   * The video autoplays muted and loops by default. If the user has
   * `prefers-reduced-motion: reduce` set, autoplay is skipped and the
   * poster image stays visible, the user can still play manually
   * if controls are enabled.
   */
  controls?: boolean
}

export default function AutoplayVideo({ src, poster, className, style, controls = false }: AutoplayVideoProps) {
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
    // Browsers may decline autoplay if not explicitly muted; ensure mute.
    v.muted = true
    v.play().catch(() => { /* ignore, falls back to poster */ })
  }, [])

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      controls={controls}
      className={className}
      style={style}
    />
  )
}
