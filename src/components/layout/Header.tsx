'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { treatments } from '@/lib/treatments'
import { BOOKING_LINK_PROPS } from '@/lib/booking'

const primaryNav = [
  { label: 'Treatments', href: '/treatments', dropdown: true },
  { label: 'Prices', href: '/pricing' },
  { label: 'Approach', href: '/about' },
  { label: 'Awards', href: '/awards' },
  { label: 'Blog', href: '/blog' },
  { label: 'Visit', href: '/contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [treatmentsOpen, setTreatmentsOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
          scrolled || mobileOpen
            ? 'bg-cream/90 backdrop-blur-md border-b'
            : 'bg-transparent'
        }`}
        style={{ borderColor: scrolled || mobileOpen ? 'rgba(217, 205, 190, 0.6)' : 'transparent' }}
      >
        <div className="max-w-[1400px] mx-auto" style={{ padding: '18px var(--pad-x)' }}>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex flex-col" aria-label="Visage Aesthetics home">
              <span className="font-display text-charcoal" style={{ fontSize: 19, fontWeight: 400, letterSpacing: '0.01em' }}>Visage Aesthetics</span>
              <span className="eyebrow" style={{ fontSize: 9.5, marginTop: 2 }}>Private clinic · Braintree</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-10">
              {primaryNav.map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setTreatmentsOpen(true)}
                  onMouseLeave={() => item.dropdown && setTreatmentsOpen(false)}
                >
                  <Link
                    href={item.href}
                    className="text-charcoal hover:text-gold-deep transition-colors"
                    style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}
                  >
                    {item.label}
                  </Link>
                  {item.dropdown && treatmentsOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-5 z-50">
                      <div className="bg-cream border border-line p-7 w-[560px] grid grid-cols-2 gap-x-10 gap-y-4" style={{ boxShadow: '0 12px 40px rgba(31, 27, 26, 0.06)' }}>
                        {treatments.map((t) => (
                          <Link key={t.slug} href={t.href} className="block group/link">
                            <div className="eyebrow group-hover/link:text-gold-deep transition-colors">{t.name}</div>
                            <div className="text-stone mt-1" style={{ fontSize: 11 }}>{t.tagline}</div>
                          </Link>
                        ))}
                        <Link href="/treatments" className="col-span-2 mt-2 pt-4 border-t border-line eyebrow text-gold hover:text-gold-deep transition-colors">
                          View all treatments &nbsp;→
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <a
                {...BOOKING_LINK_PROPS}
                className="hidden md:inline-block text-charcoal hover:text-gold-deep transition-colors pb-1.5 border-b border-charcoal hover:border-gold-deep"
                style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}
              >
                Book
              </a>
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 text-charcoal"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-30 lg:hidden bg-cream transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="pt-[80px] pb-32 px-5 h-full overflow-y-auto">
          <div className="pt-6">
            <a
              {...BOOKING_LINK_PROPS}
              onClick={() => setMobileOpen(false)}
              className="btn btn-primary btn-block"
            >
              <span>Book a consultation</span>
              <span className="btn-arrow">→</span>
            </a>
          </div>
          <nav className="flex flex-col pt-8">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="font-display italic text-charcoal py-3.5 border-b"
                style={{ fontSize: 28, fontWeight: 300, borderColor: '#D9CDBE' }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="pt-10">
            <div className="eyebrow mb-4">Treatments</div>
            <div className="grid grid-cols-1">
              {treatments.map((t) => (
                <Link
                  key={t.slug}
                  href={t.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-baseline justify-between py-3 border-b"
                  style={{ borderColor: 'rgba(217, 205, 190, 0.6)' }}
                >
                  <span className="text-charcoal" style={{ fontSize: 15 }}>{t.name}</span>
                  <span className="eyebrow">{t.price}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="pt-10">
            <a
              href="mailto:info@vaclinic.co.uk"
              className="block text-center mt-5 eyebrow"
            >
              info@vaclinic.co.uk
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
