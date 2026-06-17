# Daily AI-visibility agent

A GitHub Action (`.github/workflows/ai-visibility-daily.yml`) that runs every
morning to keep Visage Aesthetics as easy as possible for AI answer engines
(ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews) to find, understand
and cite. It runs in the cloud on a schedule — it does **not** need anyone's
laptop to be on.

## What it does each day

1. **Watchdog (read-only, against the live site).** Confirms the answer layer
   is still intact in production:
   - `/llms.txt` serves as plain text and still has its key sections
   - `robots.txt` still **allows** the AI crawlers (GPTBot, ClaudeBot,
     OAI-SearchBot, PerplexityBot, Google-Extended, Bingbot, …)
   - `sitemap.xml` still serves a healthy number of URLs
   - the homepage schema still carries the **star rating** and the **sameAs**
     entity links

   If any check fails (e.g. a deploy accidentally blocked a crawler or dropped
   the rating), the job **opens a GitHub issue** and fails loudly so it's seen.

2. **Review sync.** Reads the live Google rating + review count from the Places
   API and, if the committed *fallback* in `src/lib/google-reviews.ts` has
   drifted, patches it and **auto-publishes to `main`** (which deploys to
   production). The live numbers already update on the site automatically via
   the API; this just keeps the safety-net in sync.

What it deliberately does **not** do: editorial work. Choosing *which* reviews
to feature, rewording `llms.txt`, or adding new schema types needs human/Claude
judgment — see `AGENTS.md`. The daily agent maintains and guards; it doesn't
rewrite copy.

## One-time setup (≈10 minutes, Giles only)

The watchdog half runs with no setup. The **review-sync** half needs the Google
Places API. These steps involve a billing card and an API key, so they must be
done by the account owner — Claude can't enter payment details or create the key.

1. **Create / pick a Google Cloud project** at <https://console.cloud.google.com>.
2. **Enable billing** on it (Billing → link a card). The Places API has a large
   free monthly allowance; one lookup a day costs effectively nothing.
3. **Enable the "Places API (New)"** (APIs & Services → Library → search
   "Places API (New)" → Enable).
4. **Create an API key** (APIs & Services → Credentials → Create credentials →
   API key). Restrict it to the Places API (New) for safety.
5. **Get the Place ID** for the clinic using the Place ID Finder:
   <https://developers.google.com/maps/documentation/places/web-service/place-id>
   — search "Visage Aesthetics, 17A Friars Lane, Braintree" and copy the
   `ChIJ…` id. (The clinic's Google listing is `maps?cid=11343905217849105284`.)
6. **Add the key + id in two places:**
   - **Vercel** (both `visage-aesthetics` and `visage-aesthetics-ddxi`):
     Settings → Environment Variables → add `GOOGLE_PLACE_ID` and
     `GOOGLE_PLACES_API_KEY` (Production). This makes the live site show the
     real rating/reviews automatically.
   - **GitHub** (this repo): Settings → Secrets and variables → Actions →
     add the same two as repository secrets. This lets the daily agent sync the
     fallback.

That's it. Until the key is added, the daily agent still runs and the
watchdog half still protects you — the sync half just reports "skipped".

## Running it manually

Actions tab → "AI visibility watchdog" → **Run workflow**. Useful to confirm
setup worked right after adding the secrets.

## What this does and doesn't prove

This keeps the site maximally *legible and available* to AI engines, and alerts
you the moment that breaks. It does **not** measure whether AI is actually
recommending the clinic — that needs a brand-monitoring tool (e.g. Ahrefs Brand
Radar) and is a separate, ongoing exercise.
