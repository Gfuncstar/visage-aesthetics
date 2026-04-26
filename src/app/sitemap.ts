import type { MetadataRoute } from 'next'
import { treatments } from '@/lib/treatments'

const SITE = 'https://www.vaclinic.co.uk'

/**
 * Per-route lastModified dates. Update these when the corresponding page
 * has substantive content changes — Google uses this signal to prioritise
 * recrawl. Bumping every page on every deploy (the old behaviour) trains
 * Google to ignore the signal.
 */
const PAGE_DATES: Record<string, string> = {
  '/': '2026-04-26',
  '/about': '2026-04-26',
  '/awards': '2026-04-26',
  '/pricing': '2026-04-26',
  '/treatments': '2026-04-26',
  '/results': '2026-04-26',
  '/aftercare': '2026-04-26',
  '/faq': '2026-04-26',
  '/contact': '2026-04-26',
  '/blog': '2026-04-26',
  '/privacy': '2025-09-01',
  // Geo landing pages (local SEO)
  '/braintree-botox': '2026-04-26',
  '/chelmsford-botox': '2026-04-26',
  '/halstead-botox': '2026-04-26',
  // Treatments
  '/treatments/anti-wrinkle-injections': '2026-04-26',
  '/treatments/dermal-filler': '2026-04-26',
  '/treatments/profhilo': '2026-04-26',
  '/treatments/harmonyca': '2026-04-26',
  '/treatments/micro-needling': '2026-04-26',
  '/treatments/aqualyx': '2026-04-26',
  '/treatments/cryopen': '2026-04-26',
  '/treatments/hyperhidrosis-migraines': '2026-04-26',
  '/treatments/vitamin-b12': '2026-04-26',
  '/treatments/mens-aesthetics': '2026-04-26',
  // Blog posts
  '/blog/first-botox-appointment': '2026-04-01',
  '/blog/natural-looking-filler': '2026-04-01',
  '/blog/profhilo-vs-dermal-filler': '2026-04-01',
}

const dateOf = (path: string) => new Date(PAGE_DATES[path] ?? '2026-04-26')

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,                changeFrequency: 'weekly',  priority: 1.0,  lastModified: dateOf('/') },
    { url: `${SITE}/about`,           changeFrequency: 'monthly', priority: 0.9,  lastModified: dateOf('/about') },
    { url: `${SITE}/awards`,          changeFrequency: 'monthly', priority: 0.85, lastModified: dateOf('/awards') },
    { url: `${SITE}/pricing`,         changeFrequency: 'monthly', priority: 0.9,  lastModified: dateOf('/pricing') },
    { url: `${SITE}/treatments`,      changeFrequency: 'weekly',  priority: 0.95, lastModified: dateOf('/treatments') },
    { url: `${SITE}/results`,         changeFrequency: 'monthly', priority: 0.7,  lastModified: dateOf('/results') },
    { url: `${SITE}/aftercare`,       changeFrequency: 'monthly', priority: 0.6,  lastModified: dateOf('/aftercare') },
    { url: `${SITE}/faq`,             changeFrequency: 'monthly', priority: 0.6,  lastModified: dateOf('/faq') },
    { url: `${SITE}/contact`,         changeFrequency: 'monthly', priority: 0.85, lastModified: dateOf('/contact') },
    { url: `${SITE}/blog`,            changeFrequency: 'weekly',  priority: 0.8,  lastModified: dateOf('/blog') },
    { url: `${SITE}/privacy`,         changeFrequency: 'yearly',  priority: 0.2,  lastModified: dateOf('/privacy') },
    // Geo landing pages
    { url: `${SITE}/braintree-botox`, changeFrequency: 'monthly', priority: 0.9,  lastModified: dateOf('/braintree-botox') },
    { url: `${SITE}/chelmsford-botox`,changeFrequency: 'monthly', priority: 0.85, lastModified: dateOf('/chelmsford-botox') },
    { url: `${SITE}/halstead-botox`,  changeFrequency: 'monthly', priority: 0.85, lastModified: dateOf('/halstead-botox') },
  ]

  const treatmentRoutes: MetadataRoute.Sitemap = treatments.map((t) => ({
    url: `${SITE}${t.href}`,
    changeFrequency: 'monthly',
    priority: 0.85,
    lastModified: dateOf(t.href),
  }))

  const blogRoutes: MetadataRoute.Sitemap = [
    'first-botox-appointment',
    'natural-looking-filler',
    'profhilo-vs-dermal-filler',
  ].map((slug) => ({
    url: `${SITE}/blog/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
    lastModified: dateOf(`/blog/${slug}`),
  }))

  return [...staticRoutes, ...treatmentRoutes, ...blogRoutes]
}
