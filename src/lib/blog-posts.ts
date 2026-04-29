/**
 * Manifest of every published blog post.
 *
 * Each entry surfaces on /blog, in the JSON-LD ItemList of the blog
 * collection page, in the sitemap, and as related-post suggestions on
 * sibling articles.
 *
 * The auto-blog generator (scripts/generate-blog-post.ts) appends to
 * this array via the `
  {
    slug: 'tear-trough-filler-truth',
    category: "Dermal filler",
    title: "Tear trough filler: when it works and when it really doesn't",
    excerpt: "Under-eye filler suits a narrow group; for most, the anatomy works against it—here's how to tell which category you fall into.",
    readTime: "8 min read",
    datePublished: '2026-04-29',
    dateModified: '2026-04-29',
    image: '/images/og-home.jpg',
  },
// AUTO-BLOG-INSERT` marker — keep that comment
 * exactly where it is so new posts land cleanly.
 */
export type BlogPost = {
  slug: string
  category: string
  title: string
  excerpt: string
  readTime: string
  datePublished: string // ISO date
  dateModified?: string // ISO date
  /** Path under /public/images for the OG / card image */
  image?: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'consultation-questions-to-ask',
    category: 'Choosing a clinic',
    title: 'Ten questions to ask at any aesthetics consultation.',
    excerpt: 'A practical checklist before you let anyone put a needle in your face. The ten questions every aesthetics consultation should answer — and the red flags if they don\'t.',
    readTime: '8 min read',
    datePublished: '2026-04-26',
    dateModified: '2026-04-26',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'what-is-a-nurse-led-clinic',
    category: 'Choosing a clinic',
    title: 'What is a nurse-led aesthetics clinic — and why does it matter?',
    excerpt: 'In a largely unregulated UK aesthetics industry, "nurse-led" means something specific. What it is, what it isn\'t, and how to verify it.',
    readTime: '8 min read',
    datePublished: '2026-04-26',
    dateModified: '2026-04-26',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'how-long-does-profhilo-last',
    category: 'Skin quality',
    title: 'How long does Profhilo actually last?',
    excerpt: 'Profhilo lasts 6 to 9 months from a course of two — but the picture is more nuanced than that. The realistic timeline, the variables, and what to expect long-term.',
    readTime: '7 min read',
    datePublished: '2026-04-26',
    dateModified: '2026-04-26',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'lip-filler-aftercare-guide',
    category: 'Dermal filler',
    title: 'Lip filler aftercare: a complete guide.',
    excerpt: 'A calm walkthrough of the first 48 hours, the two-week settle, what to avoid, and when to actually worry. Bernadette Tobin RGN shares her aftercare checklist.',
    readTime: '7 min read',
    datePublished: '2026-04-26',
    dateModified: '2026-04-26',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'botox-vs-filler',
    category: 'Treatment guide',
    title: 'Botox vs filler: what is the actual difference?',
    excerpt: 'They are both injectable. They do completely different jobs. Bernadette Tobin RGN, MSc explains the real difference, when each is right, and how to avoid the over-treatment trap.',
    readTime: '8 min read',
    datePublished: '2026-04-20',
    dateModified: '2026-04-26',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'profhilo-vs-dermal-filler',
    category: 'Skin quality',
    title: 'Profhilo vs dermal filler: which one do you actually need?',
    excerpt: 'Both are injectable. Both contain hyaluronic acid. They do completely different jobs. A clear, jargon-free guide to choosing the right treatment for your skin and your goals.',
    readTime: '8 min read',
    datePublished: '2025-11-18',
    dateModified: '2026-04-01',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'natural-looking-filler',
    category: 'Dermal filler',
    title: 'How to get natural-looking dermal filler results.',
    excerpt: 'Why does some filler look obvious and other filler look like nothing at all? It comes down to the practitioner, the anatomy and a willingness to do less. Here is what actually matters.',
    readTime: '7 min read',
    datePublished: '2025-10-04',
    dateModified: '2026-04-01',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'first-botox-appointment',
    category: 'Anti-wrinkle',
    title: 'What to expect from your first Botox appointment.',
    excerpt: 'Nervous about your first anti-wrinkle treatment? A calm, honest walk-through of the consultation, the injections themselves, the first two weeks and the results you should expect.',
    readTime: '7 min read',
    datePublished: '2025-09-12',
    dateModified: '2026-04-01',
    image: '/images/og-home.jpg',
  },
  // AUTO-BLOG-INSERT — generator appends new posts immediately above this line. Do not delete this marker.
]

/** Most recent first */
export const blogPostsByDate = [...blogPosts].sort(
  (a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime(),
)
