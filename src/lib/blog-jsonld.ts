/**
 * Generate Schema.org Article JSON-LD for a blog post.
 * Used in each blog post page to enable rich-result eligibility.
 */
export type BlogPostMeta = {
  slug: string
  title: string
  description: string
  datePublished: string // ISO date
  dateModified?: string // ISO date
  image?: string // path under /
  wordCount?: number
}

const SITE = 'https://www.vaclinic.co.uk'

export function articleJsonLd(post: BlogPostMeta) {
  const url = `${SITE}/blog/${post.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.image ? `${SITE}${post.image}` : `${SITE}/images/og-home.jpg`,
    datePublished: post.datePublished,
    dateModified: post.dateModified ?? post.datePublished,
    author: {
      '@type': 'Person',
      '@id': `${SITE}/author/bernadette-tobin#person`,
      name: 'Bernadette Tobin',
      jobTitle: 'Registered Nurse, MSc Advanced Practice',
      url: `${SITE}/author/bernadette-tobin`,
      identifier: { '@type': 'PropertyValue', propertyID: 'NMC PIN', value: '05G1755E' },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Visage Aesthetics',
      logo: { '@type': 'ImageObject', url: `${SITE}/icon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'en-GB',
    ...(post.wordCount ? { wordCount: post.wordCount } : {}),
  }
}

export function breadcrumbJsonLd(slug: string, title: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
      { '@type': 'ListItem', position: 3, name: title, item: `${SITE}/blog/${slug}` },
    ],
  }
}

/** FAQPage schema — eligible for the FAQ rich result and "People also ask". */
export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}
