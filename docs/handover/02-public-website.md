# 2 · The Public Marketing Website

The public site is a conventional Next.js 16 App Router site. Most pages are
static, generated at build time from **TypeScript data files** rather than a CMS.
To change content, you edit a `.ts` file and deploy.

## Routing map

All routes live under `src/app/`. Key groups:

| Area | Path(s) | Built from |
|------|---------|-----------|
| Home | `/` (`page.tsx`) | Components + `src/lib/treatments.ts`, `reviews.ts` |
| Treatments | `/treatments`, `/treatments/[slug]` | `src/lib/treatments.ts` (11 treatments) |
| Geo landing pages | `/{town}-{treatment}` e.g. `/chelmsford-botox` | `src/lib/geo-pages.ts` (13 town×treatment combos) |
| Blog | `/blog`, `/blog/[slug]` | `src/lib/blog-posts.ts` + one `page.tsx` per post |
| Comparisons | `/compare/*` | Static pages |
| Locations | `/locations` | `src/lib/geo-pages.ts` |
| Pricing / About / FAQ / Privacy / Results / Awards | `/pricing` etc. | Mostly static + small data files |
| Booking | `/book-online`, `/book/*` | See doc 3 |
| Contact / Gift | `/contact`, `/gift` | Forms → API → Resend |
| Search | `/search` | `src/lib/search-index.ts` + `/opensearch.xml` |

> **Layout:** `src/app/layout.tsx` sets global metadata, fonts (Cormorant +
> Inter), header/footer, the floating WhatsApp button and sticky booking bar.
> `HideOnStaff` strips the public chrome on `/staff` routes.

## Content model — the data files

These are the "CMS." Edit and redeploy:

- **`src/lib/treatments.ts`** — the treatment catalogue (name, slug, tagline,
  price, image). Drives `/treatments` and the home grid.
- **`src/lib/geo-pages.ts`** — the town×treatment SEO landing pages.
- **`src/lib/blog-posts.ts`** — blog index metadata. Each post also has its own
  `src/app/blog/<slug>/page.tsx` (the auto-blog creates these — see
  `BLOG_AUTOMATION.md`).
- **`src/lib/reviews.ts`** — the static fallback Google reviews (refresh process
  in `AGENTS.md`).
- **`src/lib/treatments.ts` / `before-after.ts` / `usp-videos.ts` / `award.ts`**
  — supporting content blocks.

## SEO — this site takes it seriously

Full detail is in **`SEO_PLAYBOOK.md`**. Headlines:

- 47 static+dynamic routes; geo pages and comparison pages for long-tail search.
- **Schema.org JSON-LD** nested across pages (MedicalClinic, Article,
  BreadcrumbList, FAQPage, etc.) — see `src/lib/metadata.ts`, `blog-jsonld.ts`.
- `metadataBase` + per-page `metadata` exports; canonical URLs; OG images.
- **Sitemap, RSS, OpenSearch, IndexNow** — `scripts/indexnow.mjs` pings on every
  build (`postbuild`).
- An **auto-blog** publishes a new SEO post every 2 days via GitHub Actions
  (`BLOG_AUTOMATION.md`), plus an **seo-monitor agent** (doc 5) that emails a
  weekly SEO report.

## The public forms (the only stateful public surface)

| Form | Route | API | Side effects |
|------|-------|-----|--------------|
| Contact | `/contact` | `src/app/api/contact/route.ts` | Resend email; Anthropic used to triage/summarise |
| Gift voucher | `/gift`, `/gift/confirm` | `src/app/api/gift/*` | Stripe pay + voucher email (`src/lib/gift/`) |
| Booking | `/book/*` | `src/app/api/book/*` | See doc 3 |

## Editing safely

- **British English, clinical/calm voice** — enforced by the pre-commit hook
  (`scripts/check-voice.mjs`, rules in `scripts/voice-guide.md`). If the hook
  rejects your commit, it's flagging off-brand wording, not a code error.
- The repo's `AGENTS.md` warns this Next.js has **breaking changes vs older
  versions** — check `node_modules/next/dist/docs/` before using an API you're
  unsure about.
