import Link from 'next/link'
import Image from 'next/image'

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

const links = [
  { label: 'Treatments', href: '/treatments' },
  { label: 'Prices', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Awards', href: '/awards' },
  { label: 'Blog', href: '/blog' },
  { label: 'Results', href: '/results' },
  { label: 'Aftercare', href: '/aftercare' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Visit', href: '/contact' },
  { label: 'Privacy', href: '/privacy' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer
      className="pb-24 lg:pb-12"
      style={{
        background: '#1F1B1A',
        color: 'rgba(245, 240, 236, 0.6)',
        padding: '60px var(--pad-x) 24px',
        borderTop: '1px solid rgba(245, 240, 236, 0.06)',
      }}
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 pb-14 border-b" style={{ borderColor: 'rgba(245, 240, 236, 0.08)' }}>
          <div className="md:col-span-5">
            <div className="flex items-start gap-4">
              <Image
                src="/logo.webp"
                alt="Visage Aesthetics"
                width={72}
                height={72}
                className="w-[60px] h-[60px] md:w-[72px] md:h-[72px] object-contain"
                style={{ filter: 'brightness(0) invert(1)', opacity: 0.85 }}
              />
              <div className="flex flex-col">
                <span className="font-display" style={{ color: '#F5F0EC', fontSize: 22, fontWeight: 400 }}>Visage</span>
                <span className="eyebrow" style={{ color: 'rgba(245, 240, 236, 0.45)', marginTop: 2 }}>Aesthetics &nbsp;·&nbsp; Braintree</span>
              </div>
            </div>
            <p className="mt-7 max-w-xs text-[14px] leading-relaxed" style={{ color: 'rgba(245, 240, 236, 0.55)' }}>
              A small, considered aesthetics clinic on Friars Lane. Beautifully balanced, naturally subtle results.
            </p>
          </div>
          <div className="md:col-span-3">
            <div className="eyebrow mb-5" style={{ color: 'rgba(245, 240, 236, 0.45)' }}>Visit</div>
            <a href="https://maps.google.com/?q=CM7+9BL" className="block text-[14px] leading-relaxed" style={{ color: 'rgba(245, 240, 236, 0.7)' }}>
              17A Friars Lane<br/>Braintree, Essex<br/>CM7 9BL
            </a>
            <a href="mailto:info@vaclinic.co.uk" className="mt-5 inline-block border-b text-[14px]" style={{ color: '#F5F0EC', borderColor: 'rgba(245, 240, 236, 0.3)' }}>
              info@vaclinic.co.uk
            </a>
            <a
              href="tel:+447931395246"
              className="mt-3 block text-[14px] hover:text-cream transition-colors"
              style={{ color: 'rgba(245, 240, 236, 0.7)' }}
              aria-label="Call Visage Aesthetics"
            >
              +44 7931 395246
            </a>
            <a
              href="https://www.instagram.com/visageaestheticclinic"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visage Aesthetics on Instagram"
              className="mt-5 inline-flex items-center gap-2 text-[13px] hover:text-cream transition-colors"
              style={{ color: 'rgba(245, 240, 236, 0.7)' }}
            >
              <InstagramIcon size={16} />
              <span>@visageaestheticclinic</span>
            </a>
          </div>
          <div className="md:col-span-4">
            <div className="eyebrow mb-5" style={{ color: 'rgba(245, 240, 236, 0.45)' }}>Site</div>
            <ul className="grid grid-cols-2 gap-y-2.5 gap-x-6">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14px] hover:text-cream transition-colors" style={{ color: 'rgba(245, 240, 236, 0.65)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-7 flex flex-col md:flex-row gap-3 md:items-end md:justify-between" style={{ fontSize: 11, color: 'rgba(245, 240, 236, 0.4)' }}>
          <div className="flex flex-col gap-1">
            <span>Visage Aesthetics &middot; Bernadette Tobin RGN, MSc Advanced Practice</span>
            <span>NMC PIN 05G1755E &middot; Registered with the Royal College of Nursing</span>
            <span>A private aesthetics clinic &middot; Strictly by appointment</span>
            <span>© {year} Visage Aesthetics. All rights reserved.</span>
          </div>
          <a
            href="https://ebdesignagency.co.uk/"
            target="_blank"
            rel="noopener"
            className="hover:text-cream transition-colors"
            style={{ color: 'rgba(245, 240, 236, 0.4)' }}
          >
            Brand by EB Design Agency
          </a>
        </div>
      </div>
    </footer>
  )
}
