# 5 · The Autonomous Agents (scheduled jobs)

The Assistant includes a set of **scheduled, AI-backed agents** that run on a
cron, do work unattended (analyse data, draft content, audit records), write
results to Supabase, and usually **email a summary to the clinic**. They're how
the system "does admin overnight."

## Two separate schedulers — don't confuse them

| Scheduler | Defined in | Runs |
|-----------|-----------|------|
| **Vercel Cron** | `vercel.json` | The agents below + order poll + daily sync |
| **Supabase pg_cron** | inside Supabase | Ovatu calendar sync (15 min), stock push (daily) — see doc 4 |

This doc is the **Vercel Cron** set.

## The schedule (`vercel.json`)

| Route | Cron | When (UTC) | What it does |
|-------|------|-----------|--------------|
| `/api/staff/assistant/orders/poll` | `0 */6 * * *` | every 6h | Poll for new supplier-order emails/ingest to parse into stock |
| `/api/staff/assistant/sync` | `*/30 * * * *` | every 30 min | Incremental Ovatu clients/appointments upsert (NOTE: runs 48×/day, not daily) |
| `…/agents/seasonal-campaign` | `30 8 * * *` | daily 08:30 | Watch for seasonal/marketing moments, draft campaigns |
| `…/agents/stock-expiry` | `0 8 * * *` | daily 08:00 | Flag stock nearing expiry; email the clinic |
| `…/agents/review-sentiment` | `15 8 * * 1` | Mon 08:15 | Analyse recent Google reviews → themes, concerns, summary → `review_sentiment_log`; email if action needed |
| `…/agents/financial-summary` | `0 7 * * 1` | Mon 07:00 | Weekly revenue/profit summary emailed to the clinic |
| `…/agents/seo-monitor` | `0 7 * * 5` | Fri 07:00 | Weekly SEO report (keywords, competitors, award opportunities) → `seo_reports`; email |
| `…/agents/social-content` | `0 9 * * 5` | Fri 09:00 | Draft social posts from recent blog content → `social_drafts` |
| `…/agents/clinical-audit` | `0 9 1 * *` | 1st of month 09:00 | Audit clinical records for completeness/compliance; email findings |
| `…/agents/faq-updater` | `0 10 1 * *` | 1st of month 10:00 | Refresh site FAQ content from recent questions |
| `/api/book/reminders` | `0 * * * *` | hourly | 48h booking confirm + 24h/4h consent reminders |
| `/api/staff/assistant/integrity` | `0 6 * * *` | daily 06:00 | Booking-integrity check; emails only on drift |
| `/api/staff/assistant/weekly-summary` | `0 8 * * 2` | Tue 08:00 | Week-ahead + last week's numbers email |
| `…/agents/health-safety` | `30 19 * * *` | daily 19:30 | End-of-clinic compliance check + legal advisory email |
| `/api/staff/assistant/end-of-day-email` | `*/30 * * * *` | every 30 min (self-gating) | End-of-day takings email; fires once shortly after the last appointment ends |

> **Monitoring.** A GitHub Action — the **fleet overseer**
> (`.github/workflows/overseer-daily.yml`) — runs daily and gives the owner a
> single hands-off pulse: it checks the GitHub-side agents, confirms the nightly
> medical backup ran *and was encrypted*, and emails the clinic only when a human
> is needed. Each cron above now also writes a liveness **heartbeat**
> (`src/lib/assistant/heartbeat.ts` → `cron_heartbeats`), and the overseer alerts
> if any stops reporting. **Activation:** apply the migration
> `supabase/migrations/20260626120000_cron_heartbeats.sql` and redeploy — until
> then the heartbeat writes simply no-op. See `docs/AGENT_FLEET_BOOT_GUIDE.md`
> §5–6 for the full design.

> Drafts land in the staff UI at **`/staff/assistant/agents`** (the status route
> `…/agents/status` surfaces pending `social_drafts`, latest `review_sentiment`,
> latest `seo_report`). Social drafts are reviewed/approved there before posting.

## How they authenticate

Each agent route checks the **`CRON_SECRET`** bearer token (Vercel Cron sends
it), **not** the staff PIN. If an agent returns 401 in the cron logs, the
`CRON_SECRET` env var is missing or mismatched between Vercel's cron config and
the app env.

## What they depend on

- **`ANTHROPIC_API_KEY`** — every agent uses Claude for its reasoning/drafting.
  This account **has billing**; if it lapses, agents fail.
- **`RESEND_API_KEY`** + **`CLINIC_EMAIL`** — how they email the clinic.
- **Supabase** — where they read inputs and write outputs.
- **`GOOGLE_PLACE_ID` / `GOOGLE_PLACES_API_KEY`** — review-sentiment reads
  reviews (note: per `AGENTS.md`, the Places API path isn't billed live, so this
  may run against the fallback — verify before relying on it).

## Controlling them

- **Pause one:** remove/comment its entry in `vercel.json` and redeploy.
- **Change timing:** edit its `schedule` cron in `vercel.json`.
- **Run manually:** call the route with the `CRON_SECRET` bearer token (see the
  route source for the exact header), or trigger via the Vercel dashboard.
- **Separate from these:** the **auto-blog** is a *GitHub Action*, not a Vercel
  cron — see `BLOG_AUTOMATION.md`. The **opportunity scout**
  (`scripts/scout-opportunities.ts`) runs via `.github/workflows/scout-opportunities.yml`.

## If an agent misbehaves

1. Check **Vercel → the project → Logs / Cron** for the run and its error.
2. Confirm `CRON_SECRET`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY` are set.
3. The agent's logic is in its `route.ts` under
   `src/app/api/staff/assistant/agents/<name>/` — they're self-contained and
   readable top-to-bottom.
