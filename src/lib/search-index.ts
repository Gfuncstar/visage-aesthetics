/**
 * Lightweight in-repo search index for the simple /search page.
 *
 * Aggregated at build time from the blog manifest, treatments lib and
 * a small static list of authority pages. Used by both the search UI
 * and the WebSite SearchAction schema target.
 */
import { blogPosts } from './blog-posts'
import { treatments } from './treatments'

export type SearchResult = {
  title: string
  url: string
  description: string
  category: 'Treatment' | 'Blog' | 'Page' | 'Location'
}

const STATIC_PAGES: SearchResult[] = [
  { title: 'About Bernadette Tobin RGN, MSc', url: '/about', category: 'Page', description: 'Winner: Best Non-Surgical Aesthetics Clinic 2026, Essex. Aesthetic nurse with MSc Advanced Practice and 20+ years clinical experience.' },
  { title: 'Qualifications & Credentials', url: '/about/qualifications', category: 'Page', description: 'Full credential reference, NMC PIN, RCN membership, MSc Level 7, indemnity insurance.' },
  { title: 'Awards & Recognition', url: '/awards', category: 'Page', description: 'Best Non-Surgical Aesthetics Clinic 2026, Essex. Educator of the Year 2026 nominee.' },
  { title: 'Pricing', url: '/pricing', category: 'Page', description: 'Transparent prices for every treatment. Free consultation, no pressure.' },
  { title: 'Frequently Asked Questions', url: '/faq', category: 'Page', description: 'Common questions about aesthetic treatments at Visage Aesthetics.' },
  { title: 'Aftercare', url: '/aftercare', category: 'Page', description: 'Post-treatment care guidance for every treatment offered.' },
  { title: 'Visit / Contact', url: '/contact', category: 'Page', description: '17A Friars Lane, Braintree CM7 9BL. Free consultation booking.' },
  { title: 'Treatments', url: '/treatments', category: 'Page', description: 'All non-surgical aesthetic treatments offered at Visage Aesthetics.' },
  { title: 'Blog', url: '/blog', category: 'Page', description: 'Aesthetic insights from a registered nurse. New articles every two days.' },
]

const GEO_PAGES: SearchResult[] = [
  { title: 'Botox Braintree', url: '/braintree-botox', category: 'Location', description: 'Anti-wrinkle injections for Braintree clients at Visage Aesthetics.' },
  { title: 'Lip Filler Braintree', url: '/braintree-lip-filler', category: 'Location', description: 'Subtle lip filler in Braintree, Essex by a registered nurse.' },
  { title: 'Profhilo Braintree', url: '/braintree-profhilo', category: 'Location', description: 'Authentic IBSA Profhilo skin bio-remodelling in Braintree.' },
  { title: 'Botox Chelmsford', url: '/chelmsford-botox', category: 'Location', description: 'Anti-wrinkle for Chelmsford clients, 25 minutes via the A131.' },
  { title: 'Lip Filler Chelmsford', url: '/chelmsford-lip-filler', category: 'Location', description: 'Lip filler for Chelmsford clients, 25 minutes via the A131.' },
  { title: 'Profhilo Chelmsford', url: '/chelmsford-profhilo', category: 'Location', description: 'Profhilo for Chelmsford clients, 25 minutes via the A131.' },
  { title: 'Botox Halstead', url: '/halstead-botox', category: 'Location', description: 'Anti-wrinkle for Halstead clients, 12 minutes via the A131.' },
  { title: 'Profhilo Halstead', url: '/halstead-profhilo', category: 'Location', description: 'Profhilo for Halstead clients, 12 minutes via the A131.' },
  { title: 'Botox Witham', url: '/witham-botox', category: 'Location', description: 'Anti-wrinkle for Witham clients, 12 minutes via the B1018.' },
  { title: 'Botox Colchester', url: '/colchester-botox', category: 'Location', description: 'Anti-wrinkle for Colchester clients, 25 minutes via the A12.' },
  { title: 'Botox Maldon', url: '/maldon-botox', category: 'Location', description: 'Anti-wrinkle for Maldon clients, 25 minutes via the A414.' },
  { title: 'Botox Sudbury', url: '/sudbury-botox', category: 'Location', description: 'Anti-wrinkle for Sudbury clients, 25 minutes via the A131.' },
  { title: 'Botox Great Dunmow', url: '/great-dunmow-botox', category: 'Location', description: 'Anti-wrinkle for Great Dunmow clients, 15 minutes via the A120.' },
]

export const searchIndex: SearchResult[] = [
  ...STATIC_PAGES,
  ...GEO_PAGES,
  ...treatments.map((t) => ({
    title: t.name,
    url: t.href,
    description: `${t.tagline}. ${t.description}`,
    category: 'Treatment' as const,
  })),
  ...blogPosts.map((p) => ({
    title: p.title,
    url: `/blog/${p.slug}`,
    description: p.excerpt,
    category: 'Blog' as const,
  })),
]

export function searchSite(query: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const tokens = q.split(/\s+/).filter(Boolean)
  return searchIndex
    .map((r) => {
      const haystack = `${r.title} ${r.description} ${r.url} ${r.category}`.toLowerCase()
      let score = 0
      for (const t of tokens) {
        if (haystack.includes(t)) score += 1
        if (r.title.toLowerCase().includes(t)) score += 2
      }
      return { r, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 25)
    .map(({ r }) => r)
}
