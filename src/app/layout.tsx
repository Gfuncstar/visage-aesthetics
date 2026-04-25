import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import RevealRoot from '@/components/ui/Reveal'

const themeScript = `(function(){try{var k='visage-theme';var s=localStorage.getItem(k);var d=s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})()`

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
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
    default: "Visage Aesthetics | Naturally yours. Nurse-led clinic, Braintree Essex",
    template: '%s | Visage Aesthetics',
  },
  description:
    "Beautifully balanced, naturally subtle aesthetic treatments. Performed by Bernadette Tobin RGN, MSc, in a small considered clinic on Friars Lane, Braintree.",
  keywords: ['aesthetics braintree', 'botox essex', 'dermal filler braintree', 'profhilo essex', 'nurse-led aesthetics', 'visage aesthetics'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Visage Aesthetics',
    title: "Visage Aesthetics | Naturally yours.",
    description: "A small, considered aesthetics clinic on Friars Lane, Braintree. Led by Bernadette Tobin, RGN MSc.",
    url: 'https://www.vaclinic.co.uk',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Visage Aesthetics | Naturally yours.",
    description: "A small, considered aesthetics clinic on Friars Lane, Braintree. Led by Bernadette Tobin, RGN MSc.",
  },
  themeColor: '#F5F0EC',
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
  geo: { '@type': 'GeoCoordinates', latitude: 51.8779, longitude: 0.5494 },
  email: 'info@vaclinic.co.uk',
  openingHours: ['Tu-Sa 09:00-18:00'],
  medicalSpecialty: 'Aesthetic Medicine',
  employee: {
    '@type': 'Person',
    name: 'Bernadette Tobin',
    jobTitle: 'Aesthetic Practitioner',
    description: 'Registered nurse with MSc in Advanced Practice and 20+ years clinical experience',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <Script id="visage-theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <Script
          id="visage-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify(jsonLd)}
        </Script>
        <RevealRoot />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
