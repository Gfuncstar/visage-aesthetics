import type { MetadataRoute } from 'next'
import { treatments } from '@/lib/treatments'

const SITE = 'https://www.vaclinic.co.uk'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,         changeFrequency: 'weekly',  priority: 1.0, lastModified: now },
    { url: `${SITE}/about`,    changeFrequency: 'monthly', priority: 0.9, lastModified: now },
    { url: `${SITE}/treatments`, changeFrequency: 'weekly', priority: 0.95, lastModified: now },
    { url: `${SITE}/results`,  changeFrequency: 'monthly', priority: 0.7, lastModified: now },
    { url: `${SITE}/aftercare`,changeFrequency: 'monthly', priority: 0.6, lastModified: now },
    { url: `${SITE}/faq`,      changeFrequency: 'monthly', priority: 0.6, lastModified: now },
    { url: `${SITE}/contact`,  changeFrequency: 'monthly', priority: 0.85, lastModified: now },
    { url: `${SITE}/blog`,     changeFrequency: 'weekly',  priority: 0.8, lastModified: now },
    { url: `${SITE}/privacy`,  changeFrequency: 'yearly',  priority: 0.2, lastModified: now },
  ]

  const treatmentRoutes: MetadataRoute.Sitemap = treatments.map((t) => ({
    url: `${SITE}${t.href}`,
    changeFrequency: 'monthly',
    priority: 0.85,
    lastModified: now,
  }))

  const blogRoutes: MetadataRoute.Sitemap = [
    'first-botox-appointment',
    'natural-looking-filler',
    'profhilo-vs-dermal-filler',
  ].map((slug) => ({
    url: `${SITE}/blog/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
    lastModified: now,
  }))

  return [...staticRoutes, ...treatmentRoutes, ...blogRoutes]
}
