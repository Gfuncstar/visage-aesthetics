# SEO & Site Optimisation Playbook

A reusable playbook documenting everything done to optimise **Visage Aesthetics** (vaclinic.co.uk) for SEO. Use this as a checklist to bring another Next.js site to the same standard.

Stack assumed: **Next.js 16 (App Router), Vercel, GitHub, TypeScript**. Most of it transfers to other stacks with minor adjustments.

---

## Outcome at a glance

| Metric | Before | After |
|---|---|---|
| Static + dynamic routes | ~5 | **47** |
| Schema.org graph types | 1 (`MedicalClinic`) | **15+** types nested across pages |
| Geo landing pages | 0 | **13** (treatment × town combinations) |
| Long-form blog posts | 3 | **8** (+ auto-cron generating ~180/year) |
| NMC PIN / professional credentials displayed | Nowhere | Footer + about + JSON-LD + hero strip |
| Auto-content publishing | None | GitHub Actions cron, every 2 days |
| Discovery channels | Sitemap | Sitemap + RSS + OpenSearch + SearchAction |
| OG image | Missing | Branded 1200×630 |
| Lighthouse readiness | Unmeasured | All preloads, font weight trim, image audit done |

---

## Phase 1, Foundation (do first)

### 1.1 Set up `metadataBase` and a global `metadata` export

```ts
// src/app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://www.example.co.uk'),
  title: {
    default: '<Brand> | <Short USP>',
    template: '%s | <Brand>',
  },
  description: '<140-160 char description with primary keyword>',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'en-GB', siteName: '<Brand>', /* ... */ },
  twitter: { card: 'summary_large_image' /* ... */ },
  robots: { index: true, follow: true, googleBot: { 'max-image-preview': 'large', 'max-snippet': -1 } },
}

export const viewport = { themeColor: '#xxxxxx', width: 'device-width', initialScale: 1 }
```

### 1.2 Per-page metadata + canonicals

Every page exports its own metadata with `alternates: { canonical: '/<slug>' }`. Don't rely on layout fall-through.

For an existing repo, codemod:

```bash
# Find pages missing canonical
grep -rL 'alternates' src/app --include='page.tsx'
```

### 1.3 Sitemap with **per-page lastModified dates**

```ts
// src/app/sitemap.ts
const PAGE_DATES: Record<string, string> = {
  '/': '2026-04-26',
  '/about': '2026-04-26',
  // ...
}
const dateOf = (path: string) => new Date(PAGE_DATES[path] ?? '2026-04-26')
```

Don't bump every URL to `now` on every deploy, Google learns to ignore the signal.

### 1.4 Robots.txt

```ts
// src/app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/_next/'] }],
    sitemap: 'https://www.example.co.uk/sitemap.xml',
    host: 'https://www.example.co.uk',
  }
}
```

### 1.5 Branded 404 + viewport + theme-color

- `src/app/not-found.tsx` with `robots: { index: false }`
- `viewport` export (Next 16+ moved themeColor here from `metadata`)

---

## Phase 2, Schema / JSON-LD (the largest competitive wedge)

In most local-business niches, **almost no competitors emit schema**. Shipping a full graph is the single biggest technical-SEO differentiator.

### 2.1 Schema types we deployed

| Type | Where | Purpose |
|---|---|---|
| `Organization` / `MedicalBusiness` / `LocalBusiness` | Home `@graph` | NAP, hours, geo, areaServed, sameAs |
| `WebSite` + `SearchAction` | Home `@graph` | Sitelinks searchbox in SERPs |
| `Person` (with `identifier`, `memberOf`, `hasCredential`, `award`) | Layout, About, Author archive | E-E-A-T author entity |
| `OfferCatalog` (nested `Offer` + `MedicalProcedure`) | Home Organization | Service-card SERP enhancements |
| `MedicalProcedure` | Each treatment page | Procedure rich result |
| `BreadcrumbList` | Every non-home page | Breadcrumb in SERP |
| `FAQPage` | Treatment pages, /faq, geo pages | FAQ rich result |
| `Article` + `BlogPosting` | Each blog post | Article rich result |
| `Blog` + `ItemList` | Blog index | Collection rich result |
| `Award` | Awards page, Organization, Person | Honors / awards rich result |
| `NominateAction` | Awards page | Distinguishes nominees from winners |
| `ProfilePage` | Author archive | Person profile rich result |
| `AggregateRating` | Home Organization (when API connected) | ★★★★★ stars in SERP |

### 2.2 Reusable JSON-LD helpers

```ts
// src/lib/blog-jsonld.ts, shared by every blog post
export function articleJsonLd(post: BlogPostMeta) { /* ... */ }
export function breadcrumbJsonLd(slug: string, title: string) { /* ... */ }
```

### 2.3 Implementation pattern

Inside the page component, immediately after the `return (`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

Use a `@graph` array when emitting multiple types together, cleaner and Google handles it correctly.

### 2.4 Validate before shipping

- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org/

---

## Phase 3, Authority / E-E-A-T signals

For health, medical, financial, or legal sites (Google's YMYL category), authority signals matter more than for general sites.

### 3.1 Display professional registration sitewide

For a UK nurse-led clinic, that meant **NMC PIN 05G1755E** in:
- Footer (every page) as small text
- `/about` credentials grid
- `/about/qualifications` (dedicated reference page)
- `Person` JSON-LD `identifier` field
- Hero "trust strip" on home page

Adapt for: medical (GMC number), dental (GDC), legal (SRA / Bar Council), financial (FCA reference number), accountancy (ICAEW / ACCA).

### 3.2 Build a `/about/qualifications` page

Single reference page with every credential, link to public register for verification, indemnity insurer, training partners, recognition. **No competitors did this.**

### 3.3 Build an `/awards` page if applicable

- `Award` schema for wins
- `NominateAction` schema for nominees (don't conflate the two)
- Links from hero badge to the awards page

### 3.4 Author archive at `/author/<name>`

`ProfilePage` + `Person` schema + ItemList of every post by author. Critical for E-E-A-T, Google's medical/health ranking factor weights named expert authors heavily.

---

## Phase 4, Geo / Local SEO

### 4.1 Geo landing pages (treatment × town)

Pattern: `/{treatment}-{town}` or `/{town}-{treatment}`, pick one and stay consistent.

For each town within a 20-mile radius:
- Hero with travel time + town name in H1
- Why-here section (3 reasons)
- Credential block
- Town-specific FAQs (6+)
- Surrounding-areas list
- Full schema graph (`BreadcrumbList`, `MedicalProcedure`, `FAQPage`)

We shipped 13 of these via a reusable `GeoLandingTemplate` component. **Every additional geo page is another long-tail ranking opportunity.**

### 4.2 Reusable template

```tsx
// src/components/sections/GeoLandingTemplate.tsx
type GeoLandingProps = {
  slug: string; town: string; treatment: string;
  travel: string; positioningLine: string;
  reasons: { title: string; body: string }[]
  priceFrom: string; postcode: string;
  treatmentHref: string;
  faqs: { question: string; answer: string }[]
  alsoServes: string[]
}
```

Each individual page is then 30-50 lines of data + one `<GeoLandingTemplate {...props} />`.

### 4.3 Map embed accuracy

Geocode the actual address (right-click in Google Maps, copy lat/long). Use **exact coordinates** in:
- OSM iframe `marker=...` parameter
- `Person` / `Organization` JSON-LD `geo` block

Postcode centroids can be 1km off. Verify.

---

## Phase 5, Content depth (beat Nuovo-class competitors)

### 5.1 Treatment pages: 1,500+ words

Generic treatment pages are usually thin (~500 words). Deep ones rank better. Ours are now ~1,650 words each, structured as:

- Hero + breadcrumb (visual + schema)
- Overview (300+ words, internal links)
- Benefits list (8-9 items)
- Suitable / Not suitable for (parallel cards)
- What to expect: before / during / after (3 cards)
- Pricing block with link to /pricing
- 8-9 FAQs (also feeds FAQPage schema)
- Practitioner note
- Related treatments (3 cards)
- BookingCTA

### 5.2 Internal linking

Every treatment page links to:
- 3 related treatments (auto-computed)
- /pricing
- /awards
- /about/qualifications
- Geo landing pages where the treatment is offered
- Comparison blog posts (e.g. /blog/profhilo-vs-dermal-filler)

### 5.3 Long-form blog posts

Target word count: **1,500-1,700**.

Structure:
1. H1 matching exact target query
2. "Short version" / TL;DR in first 200 words
3. 4-6 H2 sections, each 2-4 paragraphs + a bulleted list
4. At least one safety / caveat paragraph
5. Free-consultation card before close
6. 2-card related-content grid

---

## Phase 6, Performance

### 6.1 Font optimisation

Trim weights to only those actually used:

```ts
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],   // only loaded weights
  style: ['normal', 'italic'],
  display: 'swap',
  preload: true,
})
```

Audit your CSS for `font-weight: <X>` references and load **only** those weights. Saves 20-50KB.

### 6.2 Resource hints in `<head>`

```tsx
<link rel="preload" as="image" href="/images/hero-poster.jpg" fetchPriority="high" />
<link rel="dns-prefetch" href="https://thirdparty1.com" />
<link rel="dns-prefetch" href="https://thirdparty2.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```

### 6.3 Image discipline

- All images via `next/image` (auto WebP/AVIF + responsive)
- Zero raw `<img>` tags, audit with `grep -rn "<img " src --include="*.tsx"`
- `priority` on the LCP image (hero); `loading="lazy"` (default) elsewhere
- `sizes` prop on every responsive image

### 6.4 Video

- `playsInline` on autoplay videos
- `preload="metadata"` (not `auto`) unless it's the LCP
- Respect `prefers-reduced-motion`, wrap autoplay videos in a client component that pauses on mount when the media query matches:

```tsx
useEffect(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    videoRef.current?.pause()
  }
}, [])
```

### 6.5 OG image

Generate a brand-true 1200×630 PNG/JPG. We used Pillow:

```bash
python3 -c "from PIL import Image, ImageDraw, ImageFont
# Black background + logo + brand name + award
" 
```

Reference it in metadata `openGraph.images`.

---

## Phase 7, Accessibility (also helps SEO)

### 7.1 Skip-to-main link in layout

```tsx
<a
  href="#main"
  className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] ..."
>
  Skip to main content
</a>
<main id="main">{children}</main>
```

### 7.2 Visual breadcrumbs (matching schema)

```tsx
<nav aria-label="Breadcrumb">
  <ol className="flex items-center gap-x-2">
    <li><Link href="/">Home</Link></li>
    <li aria-hidden>/</li>
    <li aria-current="page">Current page</li>
  </ol>
</nav>
```

Match the visible breadcrumbs to the `BreadcrumbList` JSON-LD exactly.

### 7.3 Reduced-motion CSS fallback

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Phase 8, Discovery channels beyond the sitemap

### 8.1 RSS feed at `/blog/rss.xml`

```ts
// src/app/blog/rss.xml/route.ts
export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>...`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml' } })
}
```

Submit to GSC alongside sitemap. Helps Google discover new content faster than sitemap polling.

### 8.2 OpenSearch description

`/opensearch.xml` route, lets browsers (and Google) register the site as a searchable target. Pairs with `WebSite.SearchAction` schema.

### 8.3 Site search at `/search`

Real `<form method="GET" action="/search">` with server-rendered keyword scoring across all content. Pages found in `searchIndex` should include treatments, blog posts, geo pages and authority pages.

---

## Phase 9, Auto-content pipeline

We built a GitHub Actions workflow that runs every 2 days:

1. **Generator** (`scripts/generate-blog-post.ts`) picks an unwritten topic from `scripts/blog-topics.json`
2. Calls Anthropic API with web-search tool to ground in fresh news
3. Drafts a 1,500-1,700 word post in a defined voice (`scripts/voice-guide.md`)
4. Writes the new file at `src/app/blog/<slug>/page.tsx`
5. Updates `src/lib/blog-posts.ts` manifest
6. Updates `src/app/sitemap.ts`
7. Pulls latest, commits, pushes to main
8. Vercel auto-deploys

Cost: ~£12-15/year at Anthropic API list price for ~180 posts/year.

Files:
- `.github/workflows/auto-blog.yml` (cron schedule)
- `scripts/generate-blog-post.ts` (the script)
- `scripts/blog-topics.json` (topic bank, start with 16 evergreen topics)
- `scripts/voice-guide.md` (brand voice rules)
- `src/lib/blog-posts.ts` (manifest with `// AUTO-BLOG-INSERT` marker)

Required GitHub secret: `ANTHROPIC_API_KEY`.

Quality safeguards:
- Build verified before push
- Slug collision prevention (skips already-written topics)
- Idempotent manifest insertion
- Falls back to evergreen if web search fails

---

## Phase 10, External setup

These can't be code-shipped. Done by the site owner.

### 10.1 Google Search Console

1. **Verify ownership**: HTML tag method is easiest in Next.js, add `verification: { google: '<token>' }` to layout metadata.
2. **Submit sitemap**: `https://www.example.co.uk/sitemap.xml`
3. **Submit RSS**: `https://www.example.co.uk/blog/rss.xml`
4. **Manual indexing**: Top 10 priority URLs via URL Inspection → Request Indexing. Spread across days due to quota.
5. **Set preferred domain** (apex vs www).

### 10.2 Bing Webmaster Tools

Same drill, verify, submit sitemap. ~5% of UK search traffic but often higher converting.

### 10.3 Google Business Profile (for local businesses)

- Complete every field
- ≥ 10 photos
- Weekly post (Maps Pack ranking signal)
- Reply to every review
- Q&A populated
- Same NAP (Name/Address/Phone) as the website footer

### 10.4 Local citations (for local businesses)

Consistent NAP across:
- Yell
- FreshaPro
- Treatwell
- Industry-specific directories (e.g. Save Face, JCCP for aesthetics)
- WhatClinic
- Bing Places, Apple Maps

### 10.5 Vercel Speed Insights + Analytics

One-click in Vercel dashboard. Real-User Core Web Vitals.

---

## Phase 11, Competitive audit method

Before deciding what to build, audit the actual competition:

1. Identify the geographic radius that matters (e.g. 20 miles)
2. Run 8 representative SERP queries via Google or `WebSearch`
3. Track the **distinct domains** appearing ≥ 2 times across queries
4. Crawl each top 8-12 with `WebFetch` and record:
   - Title tag pattern, meta description quality
   - Word count on a typical product/service page
   - Schema present (view-source for `application/ld+json`)
   - Internal-linking depth
   - Trust signals visible
   - Pricing transparency
   - Reviews on-page
   - Blog cadence
   - Mobile UX feel
5. Identify white-space gaps (things almost no competitor does)
6. **Build for the white space**, that's where rankings move fastest

---

## Phase 12, File structure (transferable)

Key files / paths to mirror in another project:

```
src/
├── app/
│   ├── layout.tsx              ← global metadata + JSON-LD
│   ├── page.tsx                ← home with @graph + OfferCatalog
│   ├── sitemap.ts              ← per-route lastModified
│   ├── robots.ts               ← rules + sitemap
│   ├── not-found.tsx           ← branded 404 (noindex)
│   ├── opensearch.xml/route.ts ← OpenSearch description
│   ├── search/page.tsx         ← site search
│   ├── awards/page.tsx         ← Award schema
│   ├── pricing/page.tsx        ← transparent pricing + schema
│   ├── about/qualifications/page.tsx ← credentials reference
│   ├── author/<name>/page.tsx  ← author archive (E-E-A-T)
│   ├── blog/
│   │   ├── page.tsx            ← Blog + BlogPosting + ItemList
│   │   ├── rss.xml/route.ts    ← RSS feed
│   │   └── <slug>/page.tsx     ← Article + Breadcrumb
│   ├── <treatment>/page.tsx    ← MedicalProcedure (or service)
│   └── <town>-<treatment>/page.tsx ← geo landing pages
├── components/
│   └── sections/
│       ├── TreatmentTemplate.tsx
│       └── GeoLandingTemplate.tsx
├── lib/
│   ├── blog-posts.ts           ← blog manifest
│   ├── blog-jsonld.ts          ← article + breadcrumb helpers
│   ├── search-index.ts         ← /search source data
│   └── booking.ts              ← single booking-URL constant
public/
├── google<token>.html          ← GSC file verification
├── og-home.jpg                 ← 1200×630 social card
└── icon.png                    ← favicon / logo
.github/workflows/
└── auto-blog.yml               ← every-2-days cron
scripts/
├── generate-blog-post.ts
├── blog-topics.json
└── voice-guide.md
```

---

## Phase 13, Order of execution

If you're starting from scratch on a new site, this is the order that compounds fastest:

1. **Foundation** (Phase 1), metadata, sitemap, robots, canonicals, 404
2. **Audit competitors** (Phase 11), know what you're building against
3. **Authority pages first** (Phase 3), about, qualifications, awards, author archive
4. **Schema everywhere** (Phase 2), graph on home + per-page types
5. **Content depth** (Phase 5), bring service/product pages to 1,500+ words
6. **Geo pages** (Phase 4), one per high-value town/service combination
7. **Performance polish** (Phase 6), fonts, images, preloads, OG
8. **Discovery channels** (Phase 8), RSS, search, OpenSearch
9. **Auto-content pipeline** (Phase 9), once site is good enough to amplify
10. **External setup** (Phase 10), GSC, Bing, GBP, citations
11. **Measure for 2-4 weeks before judging**, patience

---

## Common mistakes to avoid

- **Bumping every URL's `lastModified` on every deploy**, trains Google to ignore the signal.
- **Generic meta descriptions**, write each one to match search intent.
- **One H1 = one page**, never two H1s on a page.
- **Same canonical for paginated content**, each page gets its own canonical.
- **Missing breadcrumb schema** when you have visual breadcrumbs, Google wants both.
- **Using `<img>` instead of `next/image`**, kills Lighthouse and image-format optimisation.
- **Loading every font weight**, page-load tax for nothing. Audit and trim.
- **Branded 404 with `index: true`**, should always be noindex.
- **Submitting sitemap before pages are live**, wait until at least the top 10 pages can render.
- **Auto-publish blog without quality safeguards**, at minimum: build verification, slug collision check, content-length guard.

---

## What success looks like over 90 days

| Day | Expectation |
|---|---|
| 1-2 | First crawl wave. Most pages move from Discovered to Indexed in GSC. |
| 7 | Sitemap fully processed. Performance tab starts showing impressions. |
| 14 | First click data. Branded queries rank first. |
| 30 | Geo pages start appearing for `<treatment> <town>` queries. |
| 60 | Content depth pays off, informational queries (e.g. "how long does X last") start ranking. |
| 90 | Compete-for-real with established competitors on the main service queries. The auto-blog has compounded by 45 posts. |

---

## Credits

This playbook is the playbook used to build **vaclinic.co.uk** end-to-end, from a Squarespace migration to an SEO-saturated Next.js site, in a single intensive session.

Stack: Next.js 16, Vercel, GitHub Actions, Anthropic API.

License: do whatever you want with it.
