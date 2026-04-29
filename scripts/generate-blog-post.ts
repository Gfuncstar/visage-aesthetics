/**
 * Auto-blog generator for Visage Aesthetics.
 *
 * Runs from a GitHub Actions cron every 2 days. Picks a topic, drafts a
 * 1,500-word post in Bernadette's voice using the Anthropic API + web
 * search, writes it to /src/app/blog/<slug>/page.tsx, updates the
 * sitemap, and commits the result. The workflow then opens a PR (or
 * pushes direct to main, controlled by AUTO_PUBLISH env var).
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY — your Claude API key
 *
 * Optional env vars:
 *   AUTO_PUBLISH=true — push direct to main instead of opening a PR
 *   FORCE_TOPIC=slug  — pick a specific topic from blog-topics.json
 */
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

type Topic = {
  slug: string
  title: string
  intent: string
  targetKeywords: string[]
  angle: string
  treatment: string
}

type TopicsFile = {
  evergreenTopics: Topic[]
  newsAngles: string[]
  voiceRules: string[]
}

const MODEL = 'claude-opus-4-5'

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required')
  const client = new Anthropic({ apiKey })

  const topicsFile = JSON.parse(
    readFileSync(join(ROOT, 'scripts/blog-topics.json'), 'utf-8'),
  ) as TopicsFile
  const voiceGuide = readFileSync(join(ROOT, 'scripts/voice-guide.md'), 'utf-8')

  // Pick a topic that hasn't been used yet
  const blogDir = join(ROOT, 'src/app/blog')
  const existing = new Set(readdirSync(blogDir).filter((d) => !d.endsWith('.tsx')))
  const forced = process.env.FORCE_TOPIC
  const candidates = forced
    ? topicsFile.evergreenTopics.filter((t) => t.slug === forced)
    : topicsFile.evergreenTopics.filter((t) => !existing.has(t.slug))
  if (candidates.length === 0) {
    console.log('No remaining topics. Exiting cleanly.')
    return
  }
  // Random pick to avoid always taking the first one
  const topic = candidates[Math.floor(Math.random() * candidates.length)]
  console.log(`Selected topic: ${topic.slug}`)

  // Phase 1: ground the post in fresh news with a web search call
  const newsContext = await researchNews(client, topic, topicsFile.newsAngles)
  console.log(`News context: ${newsContext.length} chars`)

  // Phase 2: draft the post
  const draft = await draftPost(client, topic, voiceGuide, newsContext)
  console.log(`Draft: ${draft.length} chars`)

  // Phase 3: write the file
  const today = new Date().toISOString().slice(0, 10)
  const wordCount = draft.split(/\s+/).length
  const filePath = join(blogDir, topic.slug, 'page.tsx')
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, renderPageFile(topic, draft, today, wordCount))
  console.log(`Wrote ${filePath}`)

  // Phase 4: update sitemap
  updateSitemap(topic.slug, today)
  console.log('Sitemap updated')

  // Phase 5: register the post in the blog manifest so it appears on /blog
  updateBlogManifest({
    slug: topic.slug,
    title: topic.title,
    excerpt: await summarise(client, topic, draft),
    category: deriveCategory(topic.treatment),
    datePublished: today,
    dateModified: today,
    readTime: estimateReadTime(wordCount),
  })
  console.log('Blog manifest updated')
}

async function researchNews(
  client: Anthropic,
  topic: Topic,
  newsAngles: string[],
): Promise<string> {
  const prompt = `You are a research assistant for an aesthetics clinic blog. Spend up to 5 web searches gathering verified facts for a blog post about: "${topic.title}".

Topic angle: ${topic.angle}
Target keywords: ${topic.targetKeywords.join(', ')}

You have two jobs:

1. **Topical news**: find any relevant UK news from the last 60 days that could give the post a current angle. Look for:
${newsAngles.map((a) => `- ${a}`).join('\n')}

2. **Fact verification**: gather authoritative sources that confirm or correct the standard clinical claims this topic will rely on (durations, dosing windows, mechanism of action, regulatory status, product names, indication boundaries). Prefer manufacturer SmPCs, MHRA, NHS, NICE, peer-reviewed journals, JCCP, BACN, Save Face. Where two sources disagree, flag the disagreement.

Return your output in this exact format:

## Topical news (last 60 days)
- [Headline / fact] — [date] — [source URL]
(or "No fresh news angle — write evergreen")

## Verified clinical facts
- [claim] — supported by [source URL] and [source URL]  ← cite at least 2 sources per non-obvious claim
- [claim] — supported by [source URL]

## Disputed / uncertain
- [claim] — sources disagree: [URL] says X, [URL] says Y
(or "None")

Do not write the post itself yet.`

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 2500,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 } as never],
      messages: [{ role: 'user', content: prompt }],
    })
    return res.content
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { type: string; text?: string }) => b.text ?? '')
      .join('\n')
  } catch (err) {
    console.warn('Web search unavailable, proceeding evergreen:', err)
    return 'No fresh news angle — write evergreen.'
  }
}

async function draftPost(
  client: Anthropic,
  topic: Topic,
  voiceGuide: string,
  newsContext: string,
): Promise<string> {
  const prompt = `You are drafting a long-form blog post for Visage Aesthetics, signed by Bernadette Tobin RGN, MSc.

Topic: ${topic.title}
Slug: ${topic.slug}
Search intent: ${topic.intent}
Target keywords: ${topic.targetKeywords.join(', ')}
Angle: ${topic.angle}
Most relevant treatment page: ${topic.treatment}

Research notes (topical news + verified clinical facts + disputed items):
${newsContext}

Fact discipline (non-negotiable):
- Every numeric claim (durations, doses, percentages, prices, timeframes) must be supported by the "Verified clinical facts" section above. If a number isn't in there, do not state it — speak in qualitative terms instead.
- Every regulatory or product-specific claim (MHRA status, licensing, JCCP rules, brand-specific facts) must come from the verified facts. If unverified, omit.
- For any item in "Disputed / uncertain", either reflect the disagreement honestly or skip the topic.
- Use the topical news angle only if it genuinely strengthens the post — never force.

Voice & style guide (follow strictly):
${voiceGuide}

Output the post as **JSX body content only** — no <html>, no <head>, no <body>, no top-level <article>. Start at the first <section> and end at the last </section>. Use the same component structure and class names as a typical post on the site:

- One <section className="relative bg-cream text-charcoal overflow-hidden pt-24 md:pt-28 pb-8 md:pb-12"> for the hero band, containing a "Back to all articles" link, a <span className="hairline hairline-left mb-8 bg-gold" />, an eyebrow, the H1, and the opening paragraph.
- Then a <section className="pb-6 md:pb-10"> with a max-w-3xl wrapper and the body content. Headings as <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">. Body paragraphs as <p className="text-body-lg text-ink-soft leading-relaxed mb-5">. Bulleted lists as <ul className="space-y-2 mb-6 text-body-lg text-ink-soft"> with each <li> prefixed with "· ".
- A "free consultation" card just before the closing related-link grid.
- A 2-card related-treatment grid linking to ${topic.treatment} and one logical companion treatment.

Length: 1,500-1,700 words of body copy.

Output ONLY the JSX. No prose explanation, no markdown fence, no JavaScript imports — just the JSX block.`

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  })
  return res.content
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { type: string; text?: string }) => b.text ?? '')
    .join('\n')
    .trim()
}

function renderPageFile(topic: Topic, body: string, today: string, wordCount: number): string {
  return `import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/blog-jsonld'

const POST = {
  slug: '${topic.slug}',
  title: ${JSON.stringify(topic.title)},
  description: ${JSON.stringify(autoDescription(topic))},
  datePublished: '${today}',
  dateModified: '${today}',
  image: '/images/og-home.jpg',
  wordCount: ${wordCount},
}

export const metadata: Metadata = {
  title: \`\${POST.title} | Visage Aesthetics\`,
  description: POST.description,
  alternates: { canonical: \`/blog/\${POST.slug}\` },
  openGraph: {
    type: 'article',
    title: POST.title,
    description: POST.description,
    url: \`https://www.vaclinic.co.uk/blog/\${POST.slug}\`,
    publishedTime: POST.datePublished,
    modifiedTime: POST.dateModified,
    authors: ['Bernadette Tobin'],
  },
}

export default function Post() {
  return (
    <article className="bg-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(POST)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(POST.slug, POST.title)) }} />
${body}
      <BookingCTA />
    </article>
  )
}
`
}

function autoDescription(topic: Topic): string {
  return `${topic.title} — written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic in Braintree, Essex.`.slice(0, 160)
}

async function summarise(client: Anthropic, topic: Topic, draft: string): Promise<string> {
  const prompt = `Below is the body of a new blog post titled "${topic.title}". Write a single-sentence excerpt (140-180 chars) that would make a reader click. British English, calm and clinical, no marketing fluff. Output the sentence only.

---
${draft.slice(0, 4000)}
---`
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = res.content
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { type: string; text?: string }) => b.text ?? '')
      .join('')
      .trim()
      .replace(/^"|"$/g, '')
    return text.slice(0, 200)
  } catch {
    return `${topic.angle.slice(0, 160)}`
  }
}

function deriveCategory(treatmentHref: string): string {
  const map: Record<string, string> = {
    '/treatments/anti-wrinkle-injections': 'Anti-wrinkle',
    '/treatments/dermal-filler': 'Dermal filler',
    '/treatments/profhilo': 'Skin quality',
    '/treatments/harmonyca': 'Hybrid filler',
    '/treatments/micro-needling': 'Skin quality',
    '/treatments/aqualyx': 'Body contouring',
    '/treatments/cryopen': 'Skin lesions',
    '/treatments/hyperhidrosis-migraines': 'Medical aesthetics',
    '/treatments/vitamin-b12': 'Wellness',
    '/treatments/mens-aesthetics': 'Men',
    '/about': 'Clinic',
    '/about/qualifications': 'Clinic',
  }
  return map[treatmentHref] ?? 'Treatment guide'
}

function estimateReadTime(wordCount: number): string {
  const minutes = Math.max(3, Math.round(wordCount / 220))
  return `${minutes} min read`
}

function updateBlogManifest(post: {
  slug: string
  title: string
  excerpt: string
  category: string
  datePublished: string
  dateModified: string
  readTime: string
}) {
  const path = join(ROOT, 'src/lib/blog-posts.ts')
  let src = readFileSync(path, 'utf-8')
  // Idempotency: skip if slug already present
  if (src.includes(`slug: '${post.slug}'`)) return
  const entry = `  {
    slug: '${post.slug}',
    category: ${JSON.stringify(post.category)},
    title: ${JSON.stringify(post.title)},
    excerpt: ${JSON.stringify(post.excerpt)},
    readTime: ${JSON.stringify(post.readTime)},
    datePublished: '${post.datePublished}',
    dateModified: '${post.dateModified}',
    image: '/images/og-home.jpg',
  },
`
  src = src.replace(
    /(\s*\/\/ AUTO-BLOG-INSERT[^\n]*\n)/,
    `\n${entry}$1`,
  )
  writeFileSync(path, src)
}

function updateSitemap(slug: string, isoDate: string) {
  const path = join(ROOT, 'src/app/sitemap.ts')
  let src = readFileSync(path, 'utf-8')
  const datesKey = `'/blog/${slug}'`
  if (src.includes(datesKey)) {
    src = src.replace(new RegExp(`(${datesKey}:\\s*)'[\\d-]+'`), `$1'${isoDate}'`)
  } else {
    src = src.replace(
      /(\/blog\/profhilo-vs-dermal-filler': '[\d-]+',)/,
      `$1\n  '/blog/${slug}': '${isoDate}',`,
    )
  }
  // Ensure the route is registered in blogRoutes too
  if (!src.includes(`'${slug}',`) && !src.includes(`'${slug}'\n`)) {
    src = src.replace(
      /(\['first-botox-appointment',\s*'natural-looking-filler',\s*'profhilo-vs-dermal-filler',)/,
      `$1\n    '${slug}',`,
    )
  }
  writeFileSync(path, src)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
