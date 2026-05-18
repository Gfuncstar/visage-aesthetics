'use client'

import { useEffect } from 'react'

export default function RevealRoot() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-stagger, .reveal-image')
    if (!els.length) return

    // Any element already inside (or above) the viewport at hydration time
    // must be revealed immediately — otherwise the IntersectionObserver may
    // never fire for it and it stays at opacity:0 forever. This was the root
    // cause of the "Reviews section loads empty" intermittent bug.
    const watch: Element[] = []
    els.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight) {
        el.classList.add('in')
      } else {
        watch.push(el)
      }
    })

    if (!watch.length) return

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })
    watch.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
