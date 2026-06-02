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
  {
    slug: 'micro-needling-results-timeline',
    category: "Skin quality",
    title: "Micro-needling: when you'll see results, and what to expect",
    excerpt: "Micro-needling triggers a staged healing response that unfolds over months, not days—here's what the evidence says about realistic timelines.",
    readTime: "9 min read",
    datePublished: '2026-05-11',
    dateModified: '2026-05-11',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'aqualyx-fat-dissolving-explained',
    category: "Body contouring",
    title: "AQUALYX fat dissolving: what to expect",
    excerpt: "A clear explanation of how AQUALYX destroys fat cells, what the treatment course involves, and the realistic results you can expect.",
    readTime: "9 min read",
    datePublished: '2026-05-13',
    dateModified: '2026-05-13',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'uk-aesthetics-regulation-2026',
    category: "Clinic",
    title: "UK aesthetics regulation in 2026: what's actually changing",
    excerpt: "A licensing scheme for Botox and filler practitioners has been discussed for years but remains unenacted—here is what the law actually requires today.",
    readTime: "9 min read",
    datePublished: '2026-05-15',
    dateModified: '2026-05-15',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'profhilo-treatment-guide',
    category: "Skin quality",
    title: "Profhilo: a no-nonsense treatment guide",
    excerpt: "A clear explanation of how Profhilo works, what it can realistically achieve, and why results require two treatment sessions.",
    readTime: "9 min read",
    datePublished: '2026-05-17',
    dateModified: '2026-05-17',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'harmonyca-vs-traditional-filler',
    category: "Hybrid filler",
    title: "HarmonyCa vs traditional dermal filler: when to choose which",
    excerpt: "A look at how hybrid injectables differ from standard hyaluronic acid fillers, and which clinical outcomes suit each approach.",
    readTime: "9 min read",
    datePublished: '2026-05-19',
    dateModified: '2026-05-19',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'preventative-botox-late-twenties',
    category: "Anti-wrinkle",
    title: "Preventative Botox in your late twenties: yes or no",
    excerpt: "A measured look at when early intervention is worth considering—and when your skin does not yet need it.",
    readTime: "9 min read",
    datePublished: '2026-05-21',
    dateModified: '2026-05-21',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'ozempic-face-volume-loss',
    category: "Dermal filler",
    title: "Ozempic face: aesthetic options for rapid weight-loss volume loss",
    excerpt: "Rapid weight loss can leave the face looking hollow and aged; here's what actually helps, and why timing matters more than most people realise.",
    readTime: "9 min read",
    datePublished: '2026-05-27',
    dateModified: '2026-05-27',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'masseter-botox-jawline-slimming',
    category: "Anti-wrinkle",
    title: "Masseter Botox: jawline slimming, bruxism and TMJ relief",
    excerpt: "Masseter botox can slim a wide jawline and ease bruxism or TMJ discomfort, but results depend on whether the muscle is truly enlarged.",
    readTime: "8 min read",
    datePublished: '2026-05-27',
    dateModified: '2026-05-27',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'brow-lift-with-botox',
    category: "Anti-wrinkle",
    title: "A chemical brow lift with Botox: what it can and can't do",
    excerpt: "A chemical brow lift can raise the outer brow by a few millimetres, but it won't correct significant skin laxity or true eyelid ptosis.",
    readTime: "9 min read",
    datePublished: '2026-05-29',
    dateModified: '2026-05-29',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'abcde-mole-check-guide',
    category: "Treatment guide",
    title: "When to worry about a mole: the ABCDE check",
    excerpt: "Learn the five warning signs that distinguish a harmless mole from one that needs a doctor's opinion, and when to seek help.",
    readTime: "10 min read",
    datePublished: '2026-05-31',
    dateModified: '2026-05-31',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'wedding-aesthetics-timeline',
    category: "Clinic",
    title: "Aesthetics before your wedding: a sensible 12-month timeline",
    excerpt: "Most pre-wedding mistakes happen in the final fortnight; the work that actually shows in photographs is decided twelve months earlier, and here is the timeline I use in clinic.",
    readTime: "8 min read",
    datePublished: '2026-06-01',
    dateModified: '2026-06-01',
    image: '/images/og-home.jpg',
  },
  {
    slug: 'chin-filler-for-jawline-projection',
    category: "Dermal filler",
    title: "Chin filler for jawline projection: a small change with big effect",
    excerpt: "Chin filler is the most underused 1–2ml in UK aesthetics: it lengthens the neck, sharpens the jaw, and quietly makes the nose look smaller without touching it.",
    readTime: "8 min read",
    datePublished: '2026-06-02',
    dateModified: '2026-06-02',
    image: '/images/og-home.jpg',
  },



















  // AUTO-BLOG-INSERT, generator appends new posts immediately above this line. Do not delete this marker.
]

/** Most recent first */
export const blogPostsByDate = [...blogPosts].sort(
  (a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime(),
)
