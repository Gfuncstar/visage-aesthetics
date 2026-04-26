# Blog automation runbook

The site auto-publishes a new SEO-optimised blog post every 2 days. Here's how it works and how you control it.

## At a glance

- **Schedule**: every 2 days at 09:00 UTC (odd days of the month)
- **Mode**: PR-based by default (you review + merge), can be flipped to auto-publish
- **Topics**: drawn from `scripts/blog-topics.json` (16 evergreen topics queued)
- **Voice**: defined in `scripts/voice-guide.md` — clinical, calm, British English, conservative
- **Author byline**: Bernadette Tobin RGN, MSc Advanced Practice
- **Word count target**: 1,500-1,700 words per post
- **Schema**: every post gets `Article` + `BreadcrumbList` JSON-LD automatically

## Setup checklist (one-time)

1. **Add Anthropic API key**:
   - Go to https://console.anthropic.com → API Keys → create a new key
   - In GitHub: repo → **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `ANTHROPIC_API_KEY`
   - Value: paste your key
2. **Enable Actions** if not already on (Settings → Actions → General → "Allow all actions")
3. (Optional) **Auto-publish mode**: Settings → Secrets and variables → Actions → **Variables** tab → New repository variable → Name: `AUTO_PUBLISH`, Value: `true`. Without this, posts arrive as PRs for review.

That's it. The first run happens at the next scheduled odd-day-of-month at 09:00 UTC, or you can trigger manually right now (see below).

## Trigger a post manually

GitHub repo → **Actions** tab → **Auto-blog (Visage Aesthetics)** → **Run workflow** → optionally enter a topic slug from `scripts/blog-topics.json` (e.g. `lip-filler-aftercare-guide`) → **Run workflow**.

A PR will appear within ~2 minutes.

## Pause the automation

Two options:
- **Soft pause**: GitHub repo → Actions tab → Auto-blog → "..." menu → **Disable workflow**.
- **Hard pause**: delete or comment out the `schedule:` block in `.github/workflows/auto-blog.yml`.

Re-enable the same way.

## Change the cadence

Edit the `cron` line in `.github/workflows/auto-blog.yml`:

| Cadence | Cron |
|---|---|
| Every day 09:00 | `0 9 * * *` |
| Every 2 days 09:00 (current) | `0 9 1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31 * *` |
| Every Mon/Thu 09:00 | `0 9 * * 1,4` |
| Weekly Mondays 09:00 | `0 9 * * 1` |

## Add new topics to the bank

Open `scripts/blog-topics.json`. Add to the `evergreenTopics` array. Each topic needs:

```json
{
  "slug": "url-friendly-slug",
  "title": "The headline reader sees",
  "intent": "informational | commercial | informational/commercial",
  "targetKeywords": ["primary kw", "secondary kw"],
  "angle": "One sentence describing the take",
  "treatment": "/treatments/anti-wrinkle-injections"
}
```

The generator will avoid slugs that already exist in `src/app/blog/` so you can leave finished topics in the bank — they just won't be re-used.

## Tweak the voice

Edit `scripts/voice-guide.md`. The generator reads it before every draft.

If you find yourself editing every PR for the same reason ("too salesy", "missing the safety paragraph", "skipped the related-treatment cards"), update the voice guide so it stops happening.

## Safety / quality controls in place

1. **Build verification**: every generated post has to pass `npm run build` before the PR is opened. Broken builds fail the workflow.
2. **PR by default**: a human reads every post before it goes live (unless you flip `AUTO_PUBLISH`).
3. **Schema auto-applied**: posts always get full Article + BreadcrumbList JSON-LD via the template wrapper.
4. **Slug collision protection**: generator skips topics whose folder already exists.
5. **Word count check**: target 1,500-1,700; below 1,200 is rejected upstream by the voice guide rules.
6. **News-grounded but evergreen-safe**: the generator searches the last 60 days of UK aesthetics news for context. If nothing fresh applies, it writes evergreen instead.

## Cost

Each post run is roughly:
- 1 web search call (~$0.005)
- 1 drafting call (~8K output tokens × $15/M output ≈ $0.12)
- Total: **~$0.13 per post** at Anthropic API list price.

At every-2-days cadence: ~£12-15 per year. Negligible vs. SEO ROI.

## Files involved

```
.github/workflows/auto-blog.yml     ← cron + workflow
scripts/generate-blog-post.ts       ← generator script
scripts/blog-topics.json            ← topic bank
scripts/voice-guide.md              ← brand voice rules
src/app/blog/<slug>/page.tsx        ← output (one per post)
src/app/sitemap.ts                  ← updated automatically
src/lib/blog-jsonld.ts              ← Article + Breadcrumb helpers
```

## Troubleshooting

**Workflow ran but no PR appeared.** The generator probably found no remaining topics in the bank that haven't already been written. Add new entries to `scripts/blog-topics.json` or use `Run workflow → Force topic` to regenerate.

**PR has bad voice / wrong info.** Edit it directly in the PR (or close it) — the workflow will pick a different topic next time.

**API key error in the workflow log.** Re-add the `ANTHROPIC_API_KEY` secret — it might have expired or been revoked.

**News research fails.** The script falls back gracefully to evergreen drafting; you'll see "Web search unavailable" in the log. The post still ships.
