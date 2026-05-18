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

…the Google Places API path is **not** live (no billing on the Cloud project), so the homepage + treatment pages serve from a static fallback list. Refresh it manually:

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
5. **Update the total count** in `src/lib/google-reviews.ts` — change the `total:` value in the fallback `return { ... }` block to match what Google shows.
6. **Commit + push + open PR + squash-merge** — message style: `Refresh fallback Google reviews — N newest, substantive, varied`.
7. **Wait for both Vercel production deploys** (`visage-aesthetics` and `visage-aesthetics-ddxi`) to flip to Ready.

## Why this is manual

The full Google Places API integration is wired (`getGoogleReviews()` in `src/lib/google-reviews.ts` looks for `GOOGLE_PLACE_ID` and `GOOGLE_PLACES_API_KEY` env vars), but enabling it requires a Google Cloud project with billing (a card on file). Giles decided not to add the card — the static refresh takes ~5 minutes and is good enough for the cadence of new reviews.

If Giles ever changes his mind and adds billing, the env vars + place ID can be wired up and this manual step goes away.
