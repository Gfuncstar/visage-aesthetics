'use client'

import { useEffect } from 'react'

export default function RevealRoot() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-stagger, .reveal-image')
    if (!els.length) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
