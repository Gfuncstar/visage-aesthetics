import type { MetadataRoute } from 'next'
import { treatments } from '@/lib/treatments'
import { geoPages } from '@/lib/geo-pages'

const SITE = 'https://www.vaclinic.co.uk'

/**
 * Per-route lastModified dates. Update these when the corresponding page
 * has substantive content changes, Google uses this signal to prioritise
 * recrawl. Bumping every page on every deploy (the old behaviour) trains
 * Google to ignore the signal.
 */
const PAGE_DATES: Record<string, string> = {
  '/': '2026-04-26',
  '/about': '2026-04-26',
  '/awards': '2026-04-26',
  '/awards/best-non-surgical-clinic-essex-2026': '2026-05-14',
  '/press': '2026-05-20',
  '/locations': '2026-05-14',
  '/compare': '2026-05-14',
  '/compare/botox-vs-filler': '2026-05-14',
  '/compare/profhilo-vs-dermal-filler': '2026-05-14',
  '/compare/botox-vs-profhilo': '2026-05-14',
  '/pricing': '2026-04-26',
  '/treatments': '2026-04-26',
  '/aftercare': '2026-04-26',
  '/faq': '2026-04-26',
  '/contact': '2026-04-26',
  '/blog': '2026-04-26',
  '/privacy': '2025-09-01',
  // Geo landing pages (local SEO)
  '/braintree-botox': '2026-04-26',
  '/braintree-lip-filler': '2026-04-26',
  '/braintree-profhilo': '2026-04-26',
  '/chelmsford-botox': '2026-04-26',
  '/chelmsford-lip-filler': '2026-04-26',
  '/halstead-botox': '2026-04-26',
  '/witham-botox': '2026-04-26',
  '/colchester-botox': '2026-04-26',
  '/maldon-botox': '2026-04-26',
  '/sudbury-botox': '2026-04-26',
  '/great-dunmow-botox': '2026-04-26',
  '/chelmsford-profhilo': '2026-04-26',
  '/halstead-profhilo': '2026-04-26',
  '/braintree-dermal-filler': '2026-05-14',
  '/halstead-lip-filler': '2026-05-14',
  '/witham-lip-filler': '2026-05-14',
  '/colchester-lip-filler': '2026-05-14',
  '/maldon-lip-filler': '2026-05-14',
  '/sudbury-lip-filler': '2026-05-14',
  '/witham-profhilo': '2026-05-14',
  '/colchester-profhilo': '2026-05-14',
  '/great-dunmow-profhilo': '2026-05-14',
  '/about/qualifications': '2026-04-26',
  '/author/bernadette-tobin': '2026-04-26',
  '/blog/botox-vs-filler': '2026-04-26',
  '/blog/how-long-does-profhilo-last': '2026-04-26',
  '/blog/what-is-a-nurse-led-clinic': '2026-04-26',
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
  '/treatments/map-my-mole': '2026-04-26',
  // Blog posts
  '/blog/first-botox-appointment': '2026-04-01',
  '/blog/natural-looking-filler': '2026-04-01',
  '/blog/profhilo-vs-dermal-filler': '2026-04-01',
  '/blog/harmonyca-vs-traditional-filler': '2026-05-19',
  '/blog/profhilo-treatment-guide': '2026-05-17',
  '/blog/uk-aesthetics-regulation-2026': '2026-05-15',
  '/blog/aqualyx-fat-dissolving-explained': '2026-05-13',
  '/blog/micro-needling-results-timeline': '2026-05-11',
  '/blog/men-aesthetics-guide': '2026-05-09',
  '/blog/hyperhidrosis-botox-explained': '2026-05-07',
  '/blog/natural-looking-aesthetics-essex': '2026-05-05',
  '/blog/vitamin-b12-injections-when-they-work': '2026-05-03',
  '/blog/exercise-and-botox-results': '2026-05-02',
  '/blog/how-long-does-botox-last': '2026-05-01',
  '/blog/anti-wrinkle-aftercare': '2026-04-29',
  '/blog/first-time-botox-mistakes': '2026-04-29',
  '/blog/tear-trough-filler-truth': '2026-04-29',
  '/blog/lip-filler-aftercare-guide': '2026-04-26',
  '/blog/consultation-questions-to-ask': '2026-04-26',
}

const dateOf = (path: string) => new Date(PAGE_DATES[path] ?? '2026-04-26')

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,                changeFrequency: 'weekly',  priority: 1.0,  lastModified: dateOf('/') },
    { url: `${SITE}/about`,           changeFrequency: 'monthly', priority: 0.9,  lastModified: dateOf('/about') },
    { url: `${SITE}/awards`,          changeFrequency: 'monthly', priority: 0.85, lastModified: dateOf('/awards') },
    { url: `${SITE}/awards/best-non-surgical-clinic-essex-2026`, changeFrequency: 'monthly', priority: 0.9, lastModified: dateOf('/awards/best-non-surgical-clinic-essex-2026') },
    { url: `${SITE}/press`,           changeFrequency: 'monthly', priority: 0.5,  lastModified: dateOf('/press') },
    { url: `${SITE}/locations`,                        changeFrequency: 'monthly', priority: 0.9,  lastModified: dateOf('/locations') },
    { url: `${SITE}/compare`,                          changeFrequency: 'monthly', priority: 0.8,  lastModified: dateOf('/compare') },
    { url: `${SITE}/compare/botox-vs-filler`,          changeFrequency: 'monthly', priority: 0.85, lastModified: dateOf('/compare/botox-vs-filler') },
    { url: `${SITE}/compare/profhilo-vs-dermal-filler`,changeFrequency: 'monthly', priority: 0.85, lastModified: dateOf('/compare/profhilo-vs-dermal-filler') },
    { url: `${SITE}/compare/botox-vs-profhilo`,        changeFrequency: 'monthly', priority: 0.85, lastModified: dateOf('/compare/botox-vs-profhilo') },
    { url: `${SITE}/pricing`,         changeFrequency: 'monthly', priority: 0.9,  lastModified: dateOf('/pricing') },
    { url: `${SITE}/treatments`,      changeFrequency: 'weekly',  priority: 0.95, lastModified: dateOf('/treatments') },
    { url: `${SITE}/aftercare`,       changeFrequency: 'monthly', priority: 0.6,  lastModified: dateOf('/aftercare') },
    { url: `${SITE}/faq`,             changeFrequency: 'monthly', priority: 0.6,  lastModified: dateOf('/faq') },
    { url: `${SITE}/contact`,         changeFrequency: 'monthly', priority: 0.85, lastModified: dateOf('/contact') },
    { url: `${SITE}/blog`,            changeFrequency: 'weekly',  priority: 0.8,  lastModified: dateOf('/blog') },
    { url: `${SITE}/privacy`,         changeFrequency: 'yearly',  priority: 0.2,  lastModified: dateOf('/privacy') },
    // Geo landing pages (auto-generated from registry)
    // Authority pages
    { url: `${SITE}/about/qualifications`, changeFrequency: 'yearly',  priority: 0.7,  lastModified: dateOf('/about/qualifications') },
    { url: `${SITE}/author/bernadette-tobin`, changeFrequency: 'monthly', priority: 0.75, lastModified: dateOf('/author/bernadette-tobin') },
    // Long-form blog posts
    { url: `${SITE}/blog/botox-vs-filler`,             changeFrequency: 'monthly', priority: 0.7, lastModified: dateOf('/blog/botox-vs-filler') },
    { url: `${SITE}/blog/how-long-does-profhilo-last`, changeFrequency: 'monthly', priority: 0.7, lastModified: dateOf('/blog/how-long-does-profhilo-last') },
    { url: `${SITE}/blog/what-is-a-nurse-led-clinic`,  changeFrequency: 'monthly', priority: 0.7, lastModified: dateOf('/blog/what-is-a-nurse-led-clinic') },
  ]

  const treatmentRoutes: MetadataRoute.Sitemap = treatments.map((t) => ({
    url: `${SITE}${t.href}`,
    changeFrequency: 'monthly',
    priority: 0.85,
    lastModified: dateOf(t.href),
  }))

  const geoRoutes: MetadataRoute.Sitemap = geoPages.map((g) => ({
    url: `${SITE}${g.href}`,
    changeFrequency: 'monthly',
    priority: g.slug.startsWith('braintree-') ? 0.9 : 0.85,
    lastModified: dateOf(g.href),
  }))

  const blogRoutes: MetadataRoute.Sitemap = [
    'first-botox-appointment',
    'natural-looking-filler',
    'profhilo-vs-dermal-filler',
    'botox-vs-filler',
    'lip-filler-aftercare-guide',
    'how-long-does-profhilo-last',
    'what-is-a-nurse-led-clinic',
    'consultation-questions-to-ask',
    'tear-trough-filler-truth',
    'first-time-botox-mistakes',    'anti-wrinkle-aftercare',    'how-long-does-botox-last',    'exercise-and-botox-results',    'vitamin-b12-injections-when-they-work',    'natural-looking-aesthetics-essex',    'hyperhidrosis-botox-explained',    'men-aesthetics-guide',    'micro-needling-results-timeline',    'aqualyx-fat-dissolving-explained',    'uk-aesthetics-regulation-2026',    'profhilo-treatment-guide',    'harmonyca-vs-traditional-filler',












    // AUTO-BLOG-SITEMAP-INSERT, generator appends new slugs immediately above this line. Do not delete this marker.
  ].map((slug) => ({
    url: `${SITE}/blog/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
    lastModified: dateOf(`/blog/${slug}`),
  }))

  return [...staticRoutes, ...treatmentRoutes, ...geoRoutes, ...blogRoutes]
}
