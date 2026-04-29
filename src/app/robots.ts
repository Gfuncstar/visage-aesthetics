import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/staff/', '/staff'],
      },
    ],
    sitemap: 'https://www.vaclinic.co.uk/sitemap.xml',
    host: 'https://www.vaclinic.co.uk',
  }
}
