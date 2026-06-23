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
 *   ANTHROPIC_API_KEY: your Claude API key
 *
 * Optional env vars:
 *   AUTO_PUBLISH=true: push direct to main instead of opening a PR
 *   FORCE_TOPIC=slug:  pick a specific topic from blog-topics.json
 *
 * Behaviour when the topic list is exhausted:
 *   Rather than exiting, the generator refreshes the oldest published post,
 *   bumping its dateModified and sitemap lastmod so the site keeps signalling
 *   freshness on its regular cron. Set NO_REFRESH=true to disable this.
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

const MODEL = 'claude-haiku-4-5-20251001'

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
    // Topic list exhausted. Keep the site fresh by refreshing the oldest post
    // instead of exiting, so the regular cron always does useful work.
    if (process.env.NO_REFRESH === 'true') {
      console.log('No remaining topics and NO_REFRESH set. Exiting cleanly.')
      return
    }
    await refreshOldestPost()
    return
  }
  // Random pick to avoid always taking the first one
  const topic = candidates[Math.floor(Math.random() * candidates.length)]
  console.log(`Selected topic: ${topic.slug}`)

  // Build the internal-link menu from posts already on the site, so each new
  // post can link out to relevant existing articles (topic-cluster SEO).
  const internalLinks = topicsFile.evergreenTopics
    .filter((t) => existing.has(t.slug))
    .map((t) => ({ slug: t.slug, title: t.title }))

  // Phase 1: ground the post in fresh news with a web search call
  const newsContext = await researchNews(client, topic, topicsFile.newsAngles)
  console.log(`News context: ${newsContext.length} chars`)

  // Phase 2: draft the post
  const rawDraft = await draftPost(client, topic, voiceGuide, newsContext, internalLinks)
  const draft = scrubDashes(rawDraft)
  const dashesRemoved = (rawDraft.match(/[—–]/g) ?? []).length
  console.log(`Draft: ${draft.length} chars (scrubbed ${dashesRemoved} em/en-dashes)`)

  // Phase 3: generate FAQs (FAQPage schema + "People also ask" eligibility)
  const faqs = await generateFaqs(client, topic, draft)
  console.log(`FAQs: ${faqs.length} questions`)

  // Phase 4: write the file
  const today = new Date().toISOString().slice(0, 10)
  const wordCount = draft.split(/\s+/).length
  const filePath = join(blogDir, topic.slug, 'page.tsx')
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, renderPageFile(topic, draft, today, wordCount, faqs))
  console.log(`Wrote ${filePath}`)

  // Phase 5: update sitemap
  updateSitemap(topic.slug, today)
  console.log('Sitemap updated')

  // Phase 6: register the post in the blog manifest so it appears on /blog
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

  // Phase 7: draft a native social caption for review (never auto-posted).
  await saveSocialDraft(client, topic, draft, `https://www.vaclinic.co.uk/blog/${topic.slug}`)
}

/**
 * Draft a native Instagram/Facebook caption teasing the new post and save it as
 * a Marketing draft (status 'draft') for a human to review and post. Best
 * effort: needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, otherwise skipped.
 */
async function saveSocialDraft(client: Anthropic, topic: Topic, draft: string, url: string): Promise<void> {
  const supaUrl = process.env.SUPABASE_URL
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supaUrl || !supaKey) {
    console.log('No Supabase env, skipping social draft.')
    return
  }
  let caption = ''
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Write a short, native Instagram and Facebook caption for a UK nurse-led aesthetics clinic, teasing a new blog post titled "${topic.title}".

Rules:
- 2 to 4 short lines. Open with a hook or a real question, NOT the headline.
- Warm, calm, clinical. British English. First person where natural.
- No em-dashes or en-dashes anywhere. No marketing hype words. Do not refer to the practitioner in the third person.
- At most one or two tasteful hashtags.
- End with: Read more: ${url}

Output the caption only.

Post body for context:
---
${draft.slice(0, 2000)}
---`,
      }],
    })
    caption = res.content
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { type: string; text?: string }) => b.text ?? '')
      .join('')
      .trim()
  } catch (err) {
    console.warn('Social caption draft failed:', err)
    return
  }
  caption = scrubDashes(caption)
  if (!caption) return
  try {
    const res = await fetch(`${supaUrl.replace(/\/$/, '')}/rest/v1/marketing_activity`, {
      method: 'POST',
      headers: {
        apikey: supaKey,
        Authorization: `Bearer ${supaKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ channel: 'social', title: caption.slice(0, 120), detail: caption, url, status: 'draft' }),
    })
    if (!res.ok) console.warn('Social draft insert failed:', res.status, (await res.text()).slice(0, 200))
    else console.log('Social draft saved for review.')
  } catch (err) {
    console.warn('Social draft insert threw:', err)
  }
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
- [Headline / fact] :: [date] :: [source URL]
(or "No fresh news angle, write evergreen")

## Verified clinical facts
- [claim] :: supported by [source URL] and [source URL]  (cite at least 2 sources per non-obvious claim)
- [claim] :: supported by [source URL]

## Disputed / uncertain
- [claim] :: sources disagree: [URL] says X, [URL] says Y
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
    return 'No fresh news angle, write evergreen.'
  }
}

async function draftPost(
  client: Anthropic,
  topic: Topic,
  voiceGuide: string,
  newsContext: string,
  internalLinks: { slug: string; title: string }[],
): Promise<string> {
  const linkMenu = internalLinks.length
    ? internalLinks.map((l) => `- "${l.title}" -> /blog/${l.slug}`).join('\n')
    : '(no other posts published yet, skip internal blog links)'
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
- Every numeric claim (durations, doses, percentages, prices, timeframes) must be supported by the "Verified clinical facts" section above. If a number isn't in there, do not state it. Speak in qualitative terms instead.
- Every regulatory or product-specific claim (MHRA status, licensing, JCCP rules, brand-specific facts) must come from the verified facts. If unverified, omit.
- For any item in "Disputed / uncertain", either reflect the disagreement honestly or skip the topic.
- Use the topical news angle only if it genuinely strengthens the post. Never force.

Internal linking (helps readers and topic-cluster SEO):
Where it reads naturally, link to 1-3 of these existing articles using a <Link href="/blog/...">. Never force a link, and never invent a slug that is not in this list.
${linkMenu}

Voice & style guide (follow strictly):
${voiceGuide}

Output the post as **JSX body content only**, with no <html>, no <head>, no <body>, and no top-level <article>. Start at the first <section> and end at the last </section>. Use the same component structure and class names as a typical post on the site:

- One <section className="relative bg-cream text-charcoal overflow-hidden pt-24 md:pt-28 pb-8 md:pb-12"> for the hero band, containing a "Back to all articles" link, a <span className="hairline hairline-left mb-8 bg-gold" />, an eyebrow, the H1, and the opening paragraph.
- Then a <section className="pb-6 md:pb-10"> with a max-w-3xl wrapper and the body content. Headings as <h2 className="font-display italic text-h2 text-charcoal mt-10 mb-5">. Body paragraphs as <p className="text-body-lg text-ink-soft leading-relaxed mb-5">. Bulleted lists as <ul className="space-y-2 mb-6 text-body-lg text-ink-soft"> with each <li> prefixed with "· ".
- A "free consultation" card just before the closing related-link grid.
- A 2-card related-treatment grid linking to ${topic.treatment} and one logical companion treatment.

Length: 1,500-1,700 words of body copy.

Output ONLY the JSX. No prose explanation, no markdown fence, no JavaScript imports. Just the JSX block.`

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

function renderPageFile(
  topic: Topic,
  body: string,
  today: string,
  wordCount: number,
  faqs: { q: string; a: string }[],
): string {
  const hasFaqs = faqs.length > 0
  const faqConst = hasFaqs ? `\nconst FAQS = ${JSON.stringify(faqs, null, 2)}\n` : ''
  const faqImport = hasFaqs ? ', faqJsonLd' : ''
  const faqSchemaScript = hasFaqs
    ? `      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }} />\n`
    : ''
  const faqSection = hasFaqs
    ? `      <section className="pb-12 md:pb-16">
        <div className="max-w-3xl mx-auto px-5 md:px-0">
          <h2 className="font-display italic text-h2 text-charcoal mt-4 mb-6">Common questions</h2>
          <div className="divide-y divide-line border-t border-line">
            {FAQS.map((f) => (
              <div key={f.q} className="py-5">
                <h3 className="text-charcoal font-medium mb-2">{f.q}</h3>
                <p className="text-body-lg text-ink-soft leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
`
    : ''
  return `import type { Metadata } from 'next'
import Link from 'next/link'
import BookingCTA from '@/components/sections/BookingCTA'
import { articleJsonLd, breadcrumbJsonLd${faqImport} } from '@/lib/blog-jsonld'

const POST = {
  slug: '${topic.slug}',
  title: ${JSON.stringify(topic.title)},
  description: ${JSON.stringify(autoDescription(topic))},
  datePublished: '${today}',
  dateModified: '${today}',
  image: '/images/og-home.jpg',
  wordCount: ${wordCount},
}
${faqConst}

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
${faqSchemaScript}${body}
${faqSection}      <BookingCTA />
    </article>
  )
}
`
}

function autoDescription(topic: Topic): string {
  return `${topic.title}, written by Bernadette Tobin RGN, MSc Advanced Practice. Award-winning nurse-led clinic in Braintree, Essex.`.slice(0, 160)
}

/**
 * Strip em-dashes and en-dashes from any model output before it touches disk.
 * Hard brand rule: em-dashes are an AI-tell and must never ship in published copy.
 * Replacement strategy: an em/en dash flanked by spaces (sentence-level) becomes a comma+space;
 * one without spaces (e.g. inside a hyphenated compound the model invented) becomes a hyphen.
 */
function scrubDashes(input: string): string {
  return input
    .replace(/\s+[—–]\s+/g, ', ')
    .replace(/[—–]/g, '-')
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

/**
 * Generate 4-6 frequently-asked questions for the post. These power the
 * on-page "Common questions" block and the FAQPage schema. Answers stay
 * tight (2-3 sentences), British English, and obey the same fact discipline
 * and dash rules as the body.
 */
async function generateFaqs(
  client: Anthropic,
  topic: Topic,
  draft: string,
): Promise<{ q: string; a: string }[]> {
  const prompt = `Below is the body of a blog post titled "${topic.title}" for a UK nurse-led aesthetics clinic.

Write 4 to 6 frequently-asked questions a prospective patient would type into Google about this topic, each with a concise answer (2 to 3 sentences, British English, calm and clinical).

Rules:
- Only state facts that are supported by the post body below. Do not introduce new numbers, doses or claims.
- No em-dashes or en-dashes. No marketing fluff. Never refer to Bernadette in the third person.
- Questions should be genuinely distinct from each other and suited to the "People also ask" box.

Return ONLY a JSON array, no prose, no markdown fence, in this exact shape:
[{"q":"...","a":"..."}]

---
${draft.slice(0, 6000)}
---`
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = res.content
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { type: string; text?: string }) => b.text ?? '')
      .join('')
      .trim()
    const jsonStart = text.indexOf('[')
    const jsonEnd = text.lastIndexOf(']')
    if (jsonStart === -1 || jsonEnd === -1) return []
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as { q: string; a: string }[]
    return parsed
      .filter((f) => f && typeof f.q === 'string' && typeof f.a === 'string')
      .map((f) => ({ q: scrubDashes(f.q.trim()), a: scrubDashes(f.a.trim()) }))
      .slice(0, 6)
  } catch (err) {
    console.warn('FAQ generation failed, shipping without FAQs:', err)
    return []
  }
}

/**
 * When every topic has been published, keep the regular cron useful by
 * refreshing the oldest post: bump its dateModified (in the page and the
 * manifest) and its sitemap lastmod. This signals freshness to search
 * engines without fabricating new pages.
 */
async function refreshOldestPost(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10)
  const manifestPath = join(ROOT, 'src/lib/blog-posts.ts')
  const manifest = readFileSync(manifestPath, 'utf-8')

  // Collect every auto-managed post (slug + dateModified) from the manifest.
  const entryRe = /slug:\s*'([^']+)'[\s\S]*?dateModified:\s*'([\d-]+)'/g
  const posts: { slug: string; dateModified: string }[] = []
  let m: RegExpExecArray | null
  while ((m = entryRe.exec(manifest)) !== null) {
    posts.push({ slug: m[1], dateModified: m[2] })
  }
  if (posts.length === 0) {
    console.log('No posts found to refresh. Exiting cleanly.')
    return
  }

  // Oldest by dateModified, but never refresh one already touched today.
  const stale = posts
    .filter((p) => p.dateModified !== today)
    .sort((a, b) => a.dateModified.localeCompare(b.dateModified))
  if (stale.length === 0) {
    console.log('Every post already refreshed today. Exiting cleanly.')
    return
  }
  const target = stale[0]
  console.log(`Refreshing oldest post: ${target.slug} (was ${target.dateModified})`)

  // 1. Bump dateModified in the post page.tsx
  const pagePath = join(ROOT, 'src/app/blog', target.slug, 'page.tsx')
  if (existsSync(pagePath)) {
    let page = readFileSync(pagePath, 'utf-8')
    page = page.replace(/(dateModified:\s*')[\d-]+(')/, `$1${today}$2`)
    writeFileSync(pagePath, page)
  }

  // 2. Bump dateModified in the manifest for that slug only
  const updatedManifest = manifest.replace(
    new RegExp(`(slug:\\s*'${target.slug}'[\\s\\S]*?dateModified:\\s*')[\\d-]+(')`),
    `$1${today}$2`,
  )
  writeFileSync(manifestPath, updatedManifest)

  // 3. Bump sitemap lastmod
  updateSitemap(target.slug, today)
  console.log(`Refreshed ${target.slug} to ${today}`)
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
  // blogRoutes is derived from the blog-posts.ts manifest in sitemap.ts, so a
  // new post is registered automatically once the manifest is updated above.
  writeFileSync(path, src)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
