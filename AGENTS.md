<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes, APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Recurring task — refresh Google reviews

When Giles says any of:

- "update the Google reviews"
- "refresh the reviews"
- "add the latest reviews"
- "update the review count"

**Review COUNT + RATING now update automatically.** Once `GOOGLE_PLACE_ID` and `GOOGLE_PLACES_API_KEY` are set (see `docs/ai-visibility-agent.md`), the live rating/count refresh at runtime via the Places API (revalidated every 6h), and the daily AI-visibility watchdog (`.github/workflows/ai-visibility-daily.yml`) keeps the committed fallback in sync. So you should **not** normally need to touch the count by hand.

What still needs a human is **editorial curation** — choosing *which* 6–8 reviews are featured in `src/lib/reviews.ts` (the live API returns whatever Google ranks "most relevant"; the curated list is hand-picked for substance and variety, and is also the safety-net shown if the API is ever down). Do that manually when Giles asks:

## What to do

1. **Open the live Google reviews page** in the Claude-in-Chrome extension:
   `https://www.google.com/search?si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOZUkfYTnOK0lVRldiWlmxsHsE5-Mku8g2mXUEMi-L7oaPpk2f8Q87z_1fhbFYidX4jcSnVByacdhL7xVWnRVfHVY5K5MOMJcXXQ5oarbEB3PM0e5bA%3D%3D&q=Visage+Aesthetics+Reviews`
2. **Sort by Newest** (click the radio button), then use the `get_page_text` Chrome tool — that returns reviewer name, relative time, and full text per review in plain text form.
3. **Note the total review count** ("X reviews" shown in the summary block at the top).
4. **Update `src/lib/reviews.ts`** — replace the `reviews` array with 6–8 of the newest substantive reviews. Curate for:
   - Recency (newest first)
   - Substance (skip one-liners like "Very professional 5 stars")
   - Variety of angle (results, professionalism, anxiety-handling, honesty, specific treatments)
   - Initialled names ("Patricia M.", not "Patricia Moore") matching the existing pattern. Single-name reviewers stay as-is ("Taylor").
   - Convert relative times to ISO `date` strings relative to today.
5. **Leave the count alone** — the `total:` in the `src/lib/google-reviews.ts` fallback is kept in sync automatically by the daily watchdog. Only touch it by hand if the API is known to be off.
6. **Commit + push + open PR + squash-merge** — message style: `Refresh featured Google reviews — N newest, substantive, varied`.
7. **Wait for both Vercel production deploys** (`visage-aesthetics` and `visage-aesthetics-ddxi`) to flip to Ready.

## The daily AI-visibility agent

`.github/workflows/ai-visibility-daily.yml` runs `scripts/ai-visibility-audit.mjs` every morning. It (a) checks the live site is still AI-discoverable — llms.txt serving, robots still allowing the AI crawlers, sitemap healthy, homepage schema still carrying the rating + sameAs links — opening a GitHub issue if anything regressed, and (b) syncs the review fallback to the live count, auto-publishing to main. Setup + the one-time Google Cloud steps are in `docs/ai-visibility-agent.md`.

---

# Backlog — optimisation & conversion (review 2026-06-23)

Findings from a site-wide SEO & conversion-rate review. Listed worst-first. Each
item names the files and the rationale so it can be picked up cold. Respect the
brand: it is deliberately understated and promises "no pressure, no countdown" —
so **no urgency/FOMO/countdown tactics**. CTAs are invitations, not pressure.

## SEO

1. **[High] Canonical fall-through to the homepage.** Seven standalone pages set
   no `alternates.canonical`, so they inherit the root layout's
   `alternates: { canonical: '/' }` (`src/app/layout.tsx`) and very likely emit a
   canonical pointing at the homepage — telling Google to fold them in. This
   violates the documented rule in `SEO_PLAYBOOK.md` §1.2 ("Don't rely on layout
   fall-through"). Add a self-referential canonical to each:
   `src/app/treatments/page.tsx`, `/about/page.tsx`, `/contact/page.tsx`,
   `/faq/page.tsx`, `/aftercare/page.tsx`, `/privacy/page.tsx`,
   `/cancellation-policy/page.tsx`. Verify in rendered page source after deploy.
   Guard rail: `grep -rL 'canonical' src/app --include='page.tsx'` (exclude
   staff/api/book/account/consent).
2. **[High] Treatment (11) and condition (5) pages have no OpenGraph/Twitter
   tags or OG image** — shared links render bare. Reuse the existing dynamic
   endpoint `src/app/og/route.tsx` (`/og?title=…&eyebrow=…`), exactly as the
   compare pages already do (see `src/app/compare/botox-vs-filler/page.tsx`).
   Consider doing this once via a shared metadata helper rather than 16 inline
   blocks (see item 6).
3. **[Medium] FAQ page schema is missing `BreadcrumbList`.** `src/app/faq/page.tsx`
   emits `FAQPage` only. Wrap it in a `@graph` alongside a breadcrumb, matching
   the pattern in the treatment/compare templates.
4. **[Low] Duplicated title suffix.** Three treatment titles read
   `… | Visage Aesthetics | Visage Aesthetics` — `dermal-filler`,
   `micro-needling`, `profhilo`. Trim to a single suffix. While there, a few
   titles exceed ~60 chars and truncate in SERPs.
5. **[Low] Sitemap blog list is a hand-maintained array** in `src/app/sitemap.ts`
   (with an `AUTO-BLOG-SITEMAP-INSERT` marker), separate from the
   `blogPostsByDate` source of truth in `src/lib/blog-posts.ts`. Currently in
   sync (38/38) but drift-prone — derive `blogRoutes` from `blogPostsByDate`.
6. **[Low] `src/lib/metadata.ts` (`generatePageMetadata`) is dead code** — no
   importers, and it omits canonical/OG. The handover doc
   (`docs/handover/02-public-website.md`) refers to it as a live helper, so the
   intent existed. Either delete it or, better, turn it into the real shared
   helper that emits canonical + OG (via `/og`) + Twitter, and adopt it for
   items 1–2.

## Conversion

7. **[High] Homepage hero has no booking CTA.** `src/components/sections/ScrollScrubHero.tsx`
   ends on trust signals; the only above-the-fold action on desktop is the small
   "Book" text link in the header. Add one elegant primary CTA in the hero. The
   CSS already anticipates it (`.scrub-panel .btn-primary` in `globals.css`).
8. **[High] Pricing page buries its CTA.** `src/app/pricing/page.tsx` shows no
   booking button until after the full table, with no trust signal up top. Add a
   hero CTA plus a short award/credentials reassurance line.
9. **[Medium] No persistent desktop CTA after scroll.** Mobile has the sticky
   bottom bar (`StickyBookingBar`); desktop only has the faint header "Book"
   link. Consider promoting it to a small filled button once scrolled.
10. **[Medium] Late deposit disclosure** in the booking flow — when a service
    requires a deposit, the user learns only after picking a time slot. Surface
    it at service selection (`src/app/book-online/*`).
11. **[Low] TreatmentFinder dead-ends into a two-step funnel** — it routes to a
    treatment page rather than offering a direct "Book a consultation" path for
    decision-ready users.
