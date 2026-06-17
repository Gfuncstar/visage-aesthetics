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
