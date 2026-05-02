import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import RevealRoot from '@/components/ui/Reveal'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
  preload: true,
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.vaclinic.co.uk'),
  title: {
    default: "Visage Aesthetics | Nurse-Led Clinic, Braintree",
    template: '%s | Visage Aesthetics',
  },
  description:
    "Best Non-Surgical Aesthetics Clinic 2026, Essex. A private nurse-led clinic on Friars Lane, Braintree. Naturally subtle treatments by Bernadette Tobin RGN, MSc (NMC PIN 05G1755E). Strictly by appointment.",
  keywords: ['private aesthetics clinic essex', 'aesthetics braintree', 'botox essex', 'dermal filler braintree', 'profhilo essex', 'nurse-led aesthetics', 'visage aesthetics', 'discreet clinic braintree'],
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'uTMrXn2KgQQ5g-Ot3B_jvJu81K9pVCHGhZbL6MIAODE',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Visage Aesthetics',
    title: "Visage Aesthetics | A private nurse-led clinic in Braintree.",
    description: "A small, private aesthetics clinic on Friars Lane, Braintree. Led by Bernadette Tobin, RGN MSc, strictly by appointment.",
    url: 'https://www.vaclinic.co.uk',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Visage Aesthetics | A private nurse-led clinic in Braintree.",
    description: "A small, private aesthetics clinic on Friars Lane, Braintree. Led by Bernadette Tobin, RGN MSc, strictly by appointment.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport = {
  themeColor: '#F5F0EC',
  width: 'device-width',
  initialScale: 1,
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: 'Visage Aesthetics',
  url: 'https://www.vaclinic.co.uk',
  description: 'Nurse-led aesthetics clinic in Braintree, Essex',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '17A Friars Lane',
    addressLocality: 'Braintree',
    addressRegion: 'Essex',
    postalCode: 'CM7 9BL',
    addressCountry: 'GB',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 51.885914, longitude: 0.555411 },
  email: 'info@vaclinic.co.uk',
  telephone: '+44 7931 395246',
  openingHours: ['Tu-Sa 09:00-18:00'],
  medicalSpecialty: 'Aesthetic Medicine',
  award: [
    'Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards)',
    'Educator of the Year 2026, Nominee (Beauty & Aesthetics Awards)',
  ],
  employee: {
    '@type': 'Person',
    name: 'Bernadette Tobin',
    jobTitle: 'Registered Nurse, MSc Advanced Practice',
    description: 'Registered nurse (NMC PIN 05G1755E) with MSc Advanced Practice (Level 7) and 20+ years clinical experience. Member of the Royal College of Nursing.',
    identifier: [
      { '@type': 'PropertyValue', propertyID: 'NMC PIN', value: '05G1755E' },
    ],
    memberOf: [
      { '@type': 'Organization', name: 'Nursing and Midwifery Council', url: 'https://www.nmc.org.uk/' },
      { '@type': 'Organization', name: 'Royal College of Nursing', url: 'https://www.rcn.org.uk/' },
    ],
    hasCredential: [
      { '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: 'MSc Advanced Practice (Level 7)' },
      { '@type': 'EducationalOccupationalCredential', credentialCategory: 'professional registration', name: 'NMC Registered Nurse', identifier: '05G1755E' },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <link rel="preload" as="image" href="/images/hero-poster.jpg" fetchPriority="high" />
        <link rel="dns-prefetch" href="https://www.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://visage-aesthetics.book.app" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="alternate" type="application/rss+xml" title="Visage Aesthetics, Insights & Advice" href="/blog/rss.xml" />
        <link rel="search" type="application/opensearchdescription+xml" title="Visage Aesthetics" href="/opensearch.xml" />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-charcoal focus:text-cream focus:px-4 focus:py-2 focus:rounded-sm focus:outline-2 focus:outline-gold"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <RevealRoot />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
