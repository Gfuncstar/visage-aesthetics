/**
 * Manifest of every published blog post.
 *
 * Each entry surfaces on /blog, in the JSON-LD ItemList of the blog
 * collection page, in the sitemap, and as related-post suggestions on
 * sibling articles.
 *
 * The auto-blog generator (scripts/generate-blog-post.ts) appends to
 * this array via the marker comment near the end of the array. Keep
 * that marker exactly where it is so new posts land cleanly.
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
    excerpt: 'A practical checklist before you let anyone put a needle in your face. The ten questions every aesthetics consultation should answer, and the red flags if they don\'t.',
    readTime: '8 min read',
    datePublished: '2026-04-26',
    dateModified: '2026-04-26',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'what-is-a-nurse-led-clinic',
    category: 'Choosing a clinic',
    title: 'What is a nurse-led aesthetics clinic, and why does it matter?',
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
    excerpt: 'Profhilo lasts 6 to 9 months from a course of two, but the picture is more nuanced than that. The realistic timeline, the variables, and what to expect long-term.',
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
  {
    slug: 'tear-trough-filler-truth',
    category: 'Dermal filler',
    title: "Tear trough filler: when it works and when it really doesn't",
    excerpt: "Under-eye filler suits a narrow group; for most, the anatomy works against it-here's how to tell which category you fall into.",
    readTime: '8 min read',
    datePublished: '2026-04-29',
    dateModified: '2026-04-29',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'first-time-botox-mistakes',
    category: 'Anti-wrinkle',
    title: 'Five mistakes first-time Botox clients make',
    excerpt: 'Understanding why these errors occur helps first-time clients avoid them and approach their treatment with realistic expectations.',
    readTime: '9 min read',
    datePublished: '2026-04-29',
    dateModified: '2026-04-29',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'anti-wrinkle-aftercare',
    category: "Anti-wrinkle",
    title: "Anti-wrinkle aftercare: the first 24 hours",
    excerpt: "What you do in the first 24 hours after anti-wrinkle injections can affect how well the toxin binds, here's the hour-by-hour reasoning.",
    readTime: "10 min read",
    datePublished: '2026-04-29',
    dateModified: '2026-04-29',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'how-long-does-botox-last',
    category: "Anti-wrinkle",
    title: "How long does Botox actually last?",
    excerpt: "Most patients see results for three to four months, but your own timeline depends on dose, treatment area and metabolism-here's what the evidence shows.",
    readTime: "10 min read",
    datePublished: '2026-05-01',
    dateModified: '2026-05-01',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'exercise-and-botox-results',
    category: "Anti-wrinkle",
    title: "Exercise after Botox: how it affects your results",
    excerpt: "Understanding when you can safely return to the gym after anti-wrinkle injections, and why increased blood flow in those first 24 hours matters.",
    readTime: "9 min read",
    datePublished: '2026-05-02',
    dateModified: '2026-05-02',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'vitamin-b12-injections-when-they-work',
    category: "Wellness",
    title: "Vitamin B12 injections: when they actually work",
    excerpt: "B12 injections are essential for some and unnecessary for most—here's how to tell which applies to you.",
    readTime: "9 min read",
    datePublished: '2026-05-03',
    dateModified: '2026-05-03',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'natural-looking-aesthetics-essex',
    category: "Clinic",
    title: "How to find a natural-looking aesthetics clinic in Essex",
    excerpt: "A practical guide to vetting Essex aesthetics clinics, from prescriber credentials to consultation red flags worth knowing before you book.",
    readTime: "10 min read",
    datePublished: '2026-05-05',
    dateModified: '2026-05-05',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'hyperhidrosis-botox-explained',
    category: "Medical aesthetics",
    title: "Botox for excessive sweating: a medical use of an aesthetic treatment",
    excerpt: "Botulinum toxin can reduce underarm sweating by over 80 per cent for six months or longer—here is how the treatment works and who it may help.",
    readTime: "9 min read",
    datePublished: '2026-05-07',
    dateModified: '2026-05-07',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'men-aesthetics-guide',
    category: "Men",
    title: "Aesthetic treatment for men: what's different",
    excerpt: "Men require higher doses, different injection patterns, and a practitioner who understands that the male brow sits lower—get it wrong and the result looks feminised.",
    readTime: "9 min read",
    datePublished: '2026-05-09',
    dateModified: '2026-05-09',
    image: '/images/og-home.jpg',
  },







  // AUTO-BLOG-INSERT, generator appends new posts immediately above this line. Do not delete this marker.
]

/** Most recent first */
export const blogPostsByDate = [...blogPosts].sort(
  (a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime(),
)
