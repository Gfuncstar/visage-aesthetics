# Visage Aesthetics — Autonomous Agent Fleet: Hands-Off Boot Guide

> Generated from a fleet-wide audit (6 parallel reviewers + synthesis) on 2026-06-26.
> Scope: every scheduled agent across GitHub Actions, Vercel Cron, and Supabase pg_cron.

## 1. Executive summary

The fleet is **functionally healthy and impressively broad** — 20+ scheduled agents
across GitHub Actions and Vercel Cron, with genuinely good patterns in places (a
deterministic job-health watchdog, a read-only AI-visibility audit, human-review
gates before anything is published or submitted, and sound DB-level idempotency on
the data-sync paths). But it is **not yet safe to run truly hands-off**, for one
structural reason above all others: **nothing watches the 15 Vercel crons.** The one
watchdog you have stops at the GitHub API boundary, so if `CRON_SECRET` rotates wrong,
the Anthropic key lapses, or Vercel silently drops a schedule, the operationally-critical
agents (booking reminders, end-of-day email, clinical compliance) go dark with **zero
notification** — the clinic just quietly stops getting its emails.

Layered on top are three correctness/safety risks that each deserve a human's attention
now: **medical backups are written to Dropbox in cleartext even when encryption is "on"**
and silently truncate on partial failure; **auto-blog can push unreviewed, Haiku-written
clinical copy straight to main**; and **doc/cadence drift** (the `/sync` cron runs 48×
more often than the runbook claims) means anyone operating the fleet from the docs is
working from a wrong map. The single biggest lever is a **Vercel-cron heartbeat +
watchdog** (§5). With that plus the backup-encryption fix and the model/cadence
reconciliation, this fleet becomes genuinely self-running.

## 2. The fleet at a glance

Health key: ✅ sound · ⚠️ works but has a real gap · ❌ serious risk

### GitHub Actions (5 workflows)

| Agent | Cadence | Job | Health |
|---|---|---|---|
| AI-visibility watchdog | Daily 07:30 UTC | Checks live site stays AI-discoverable; syncs review count/rating to main | ⚠️ |
| Automation health check | Daily 10:00 UTC | Watches the *other* GH workflows; opens one deduped issue on failure | ⚠️ |
| Medical records backup | Daily 02:00 UTC | Exports all clinical+business tables to Dropbox as dated JSON | ❌ |
| Auto-blog | Every 3 days 09:00 UTC | Drafts 1,500-word SEO post (Haiku), schema+FAQ, commits/publishes | ❌ |
| Scout awards & press | Mon+Thu 08:00 UTC | Web-search scout for free awards/press; drafts entries for review | ⚠️ |

### Vercel Cron (15 scheduled + 2 on-demand)

| Agent | Cadence | Job | Health |
|---|---|---|---|
| orders/poll | Every 6h | LLM-parses supplier order emails into review queue | ✅ |
| book/reminders | Hourly | 48h confirm + 24h consent + 4h consent resend | ✅ |
| staff/assistant/sync | **Every 30 min** | Incremental Ovatu clients/appointments upsert | ⚠️ |
| staff/assistant/integrity | Daily 06:00 | Booking-integrity check; emails only on drift | ✅ |
| stock-expiry | Daily 08:00 | Alerts on batches expiring within 30 days | ⚠️ |
| financial-summary | Mon 07:00 | Weekly revenue/profit email + LLM insight | ⚠️ |
| clinical-audit | 1st of month 09:00 | Monthly NMC-style compliance audit email | ⚠️ |
| social-content | Fri 09:00 | Drafts IG/FB captions from recent posts | ⚠️ |
| seo-monitor | Fri 07:00 | Weekly competitive SEO report (≤15 web searches) | ⚠️ |
| seasonal-campaign | Daily 08:30 | Drafts campaign email when a date is exactly 42 days out | ⚠️ |
| review-sentiment | Mon 08:15 | Weekly review sentiment themes + summary | ⚠️ |
| faq-updater | 1st of month 10:00 | Clusters enquiries into draft FAQs | ⚠️ |
| weekly-summary | Tue 08:00 | Week-ahead + last week's numbers email | ⚠️ |
| health-safety | Daily 19:30 | End-of-clinic compliance check + legal advisory email | ⚠️ |
| end-of-day-email | **Every 30 min** | Self-gating end-of-day takings email | ⚠️ |
| agents/status | On-demand | Staff dashboard read feed | ✅ |
| social-drafts/[id] | On-demand | Staff PATCH to approve/dismiss a draft | ✅ |

## 3. What's well set up

- **A deterministic, LLM-free job-health watchdog** (`job-health-check.mjs`) that
  self-fails if it crashes (lines 113-117) and opens one deduped issue — exactly the
  right shape for a watchdog. Its weakness is scope (GitHub-only), not design.
- **A read-only AI-visibility audit** that never mutates production and revalidates the
  live site daily — good separation of "observe" from "act".
- **Human-review gates are real and consistent.** The scout never auto-submits;
  social-content, faq-updater, and seasonal-campaign write drafts for staff approval;
  nothing in the marketing/PR path goes out without a person. Right posture for a clinic.
- **DB-level idempotency on the data plane is sound.** `sync` upserts on `ovatu_id`;
  orders/poll dedupes on `source_email_id`; scout upserts `on_conflict=fingerprint`;
  book/reminders guards via `reminded_at is.null`. Overlapping runs don't corrupt data.
- **`end-of-day-email`'s odd 30-min cadence is intentional** — a self-gating poller that
  fires shortly after the last appointment ends, with an `app_config` send-once key.
- **Auth fails closed.** Every one of the 15 cron routes gates on `CRON_SECRET`; an unset
  secret yields 401s (jobs don't run) rather than an open endpoint.
- **Cost is genuinely low.** ~26 Claude calls/week + ~45 blog runs/yr + ~104 scout runs/yr.
  No runaway-cost risk anywhere.
- **`health-safety` already uses the current model** (`claude-opus-4-8`) — the target the
  rest of the fleet hasn't caught up to.

## 4. Top issues, worst-first

**1. [HIGH] Nothing monitors the 15 Vercel crons — the central hands-off blind spot.**
`scripts/job-health-check.mjs:56` enumerates only GitHub Actions workflows. The 15 Vercel
crons have **no health monitoring at all** — no heartbeat, no alert if one starts 500-ing
or Vercel stops scheduling it. Fix: heartbeat table + watchdog assertion (§5).

**2. [HIGH] Medical backups are cleartext in Dropbox even when encryption is "enabled,"
and truncate silently.** `scripts/backup-medical.ts`. (a) `BACKUP_ENCRYPTION_KEY` is
optional — unset → full patient records upload as cleartext (lines 232-235); (b) even with
the key set, the combined `MEDICAL-RECORDS-COMPLETE.json` (245-248) and manifest (218-221)
are cleartext — only per-table `.enc` files are encrypted. `fetchTable` (88-97) returns
rows-so-far on a non-OK response instead of throwing → **truncated backup reported as
complete**. Also: hard-coded scrypt salt (107), Dropbox 4h token (123) needs refresh flow,
no retention/pruning. Fix: mandatory encryption on *all* files; `fetchTable` throws on
non-OK; random per-file salt; refresh-token flow; retention.

**3. [HIGH] Auto-blog can push unreviewed, Haiku-written clinical copy straight to main.**
`.github/workflows/auto-blog.yml:78`. With `AUTO_PUBLISH` set, the only gate is
`npm run build`. Draft model is **Haiku 4.5** (`generate-blog-post.ts:45`). On a web-search
outage it drafts ungrounded clinical content and still auto-publishes. Fix: keep PR mode
for clinical posts, *or* upgrade `draftPost` off Haiku (Sonnet/Opus) + add a fact-check
gate before enabling `AUTO_PUBLISH`.

**4. [HIGH] `/sync` cadence drift: `vercel.json` runs it every 30 min; the runbook says
daily 05:30 — a 48× discrepancy.** `vercel.json:6` vs `docs/handover/05-autonomous-agents.md:22`.
`fetchClients()` pulls the **entire** Ovatu client list every run (`sync/route.ts:62`).
Fix: decide intended cadence, correct whichever doc is wrong; make `fetchClients`
incremental if keeping high frequency.

**5. [HIGH] Two GitHub agents auto-push to main with an identical unguarded, no-retry
pattern.** `ai-visibility-daily.yml:67-70` and `auto-blog.yml:83-92`. `git pull --rebase`
then `git push` with no retry on non-fast-forward → eventual collision drops a change
silently. Fix: shared commit-and-push-with-retry step.

**6. [HIGH] Fleet-wide model-id drift: 11 call sites on previous-gen `claude-opus-4-7`,
only 2 on current `claude-opus-4-8`.** 4.8 is current Opus, same $5/$25 pricing, drop-in.
On 4-7: `seasonal-campaign:119`, `faq-updater:81`, `clinical-audit:99`, `social-content:63`,
`review-sentiment:78`, `seo-monitor:135`, `financial-summary:83`, plus lib call sites. Id is
hard-coded inline in ~17 places. Fix: hoist to one exported `MODEL` constant; move fleet to
`claude-opus-4-8`.

**7. [HIGH] No double-send protection on the email agents.** `stock-expiry`,
`financial-summary`, `clinical-audit`, `weekly-summary`/`integrity`. No "already ran this
period" guard → a Vercel retry or a logged-in staff member hitting the URL re-sends.
`clinical-audit` writes an audit row (`route.ts:109`) but never reads it back. Fix: shared
period-keyed guard; for clinical-audit, gate on the existing row and write *after* send.

**8. [HIGH] Auth depends on `CRON_SECRET` being set, with no startup assertion.** Unset →
every cron 401s silently with no alert. Fix: verify `CRON_SECRET` in *both* deployments
(`visage-aesthetics` and `visage-aesthetics-ddxi`); fold into the §5 heartbeat assertion.

**9. [MEDIUM] Doc drift: handover-05 documents only 10 of 15 Vercel crons.** Missing:
`book/reminders`, `integrity`, `weekly-summary`, `end-of-day-email`, and **`health-safety`**
(the highest-stakes agent — emails legal/CQC/NMC findings). Fix: add all five.

**10. [MEDIUM] AI-visibility watchdog turns transient fetch failures into false production
incidents.** `scripts/ai-visibility-audit.mjs:228-233`. A network blip sets `regressions=1`,
opens an issue, and fails the run. Date-stamped titles open a new issue every day. Fix:
separate infra errors (retry/warn) from content regressions (hard-fail + deduped alert).

**11. [MEDIUM] Opus over-tiering: ~4 agents pay Opus rates for Haiku/Sonnet work.**
`social-content` (captions), `review-sentiment` (theme-tagging), `seasonal-campaign` (one
email) → Haiku 4.5 ($1/$5) handles fully. Fix: tier each agent to its task via the shared
constant.

**12. [MEDIUM] `seo-monitor` uses the basic web-search variant on a model that supports
dynamic filtering.** `seo-monitor/route.ts:137` uses `web_search_20250305`; its Opus model
supports `web_search_20260209` (server-side filtering — better accuracy, fewer tokens).
Same for scout once on Opus. Fix: switch non-Haiku search agents to `web_search_20260209`.

**13. [MEDIUM] Unpinned, runtime-installed SDK in two privileged workflows.**
`auto-blog.yml:52`, `scout-opportunities.yml:53` run `npm install --no-save
@anthropic-ai/sdk tsx` (latest) in a `contents:write` workflow. Fix: move both into pinned
`package.json` devDependencies (covered by cached `npm ci`).

**14. [MEDIUM] If the Anthropic key lapses, two agents fail with no human notification.**
`generate-blog-post.ts:49`, `scout-opportunities.ts` throw and exit non-zero with no issue/
alert. Fix: add failure-notification to both workflows.

**15. [MEDIUM] Inconsistent / personal fallback email recipients.** Agents disagree:
`health-safety:190`/`weekly-summary:22` use `bernadette.parsons@outlook.com`;
`seo-monitor:253`/`review-sentiment:144`/`integrity` use `ber.parsons@outlook.com`. If
`CLINIC_EMAIL` is unset in prod, **compliance/financial data routes to a personal inbox**.
Fix: centralise on one env-backed constant; make `CLINIC_EMAIL` required.

**16. [LOW] Smaller items for a sweep:** job-health has no hard-coded expected-workflow
allow-list (a deleted workflow vanishes silently); `STALE_DAYS=10` too coarse for the 3-day
blog; `orders/poll` re-pays LLM parsing because dedupe runs *after* `parseOrderEmail`; HTML
email cells interpolate DB strings unescaped; `faq-updater`'s PII strip misses free-text
bodies; no job timeout on the AI-visibility workflow.

## 5. The most productive change: a Vercel-cron health watchdog

**This is the one change that converts the fleet from "looks fine until it isn't" to
genuinely hands-off.** Everything else in §4 is a bug you fix once; this is the *standing
capability* that catches the next 20 bugs before they rot.

The asymmetry is stark: the cheap GitHub jobs are watched; the operationally-critical
Vercel agents (booking reminders, end-of-day takings, clinical compliance) are watched by
**nobody**.

Concrete implementation (mirrors what `job-health` already does for GitHub):

1. **Heartbeat table.** Add a `cron_heartbeats` Supabase table:
   `(agent_name text primary key, last_run timestamptz, last_ok timestamptz, last_error text)`.
   In the shared cron auth wrapper every `/api/.../agents/*` route already uses, write
   `last_run` on entry and `last_ok`/`last_error` on exit. ~10 lines; every cron inherits it.
   A legitimate no-op run (e.g. zero expiring stock) still writes `last_ok`.
2. **Expected-cadence map.** A static `agent_name → max staleness` table (hourly → 2h;
   daily → 26h; weekly → 8d; monthly → 32d). Also the allow-list that catches a *deleted*
   cron — a missing heartbeat row is an alert, not silence.
3. **Assert from the existing daily GitHub watchdog.** Extend `job-health-check.mjs` to read
   `cron_heartbeats` via Supabase REST and flag any agent whose `last_ok` is older than
   allowed, reusing the one-deduped-issue pattern.

The *assertion* runs on GitHub Actions (free, already monitored); only the *heartbeat
write* runs on Vercel — so watcher and watched don't share a failure domain. Closes
issues #1, #8, #14, and covers all 20+ agents instead of five.

## 6. The hands-off "overseer" cron

On top of the deterministic heartbeat (§5, "did each agent run?"), a **recurring
autonomous Claude session** answers the judgement question: "is anything *wrong* that a
human needs to see?" — and stays silent otherwise.

**Cadence:** Once daily, ~08:00 UTC (after the morning GitHub jobs at 07:30/10:00).

**What it checks each run (all read-only):**
- **GitHub Actions runs** — the last completed run of each of the 5 workflows; note any red.
- **Open automation issues** — `ai-visibility-regression` / `automation-health` / its own label.
- **Vercel cron heartbeats** — read `cron_heartbeats` (§5); flag stale/missing agents.
- **Two high-stakes confirmations:** did `backup-medical` succeed *and* encrypt; did today's
  `health-safety` compliance email send.

**Does itself (no human):** correlates signals (e.g. "scout red AND two Vercel LLM agents
stale → shared Anthropic-key problem, not three bugs"); resolves an issue it opened once the
signal clears; distinguishes a transient single red run from a 2+-day pattern.

**Escalates to Giles (only then):** opens/updates **one** issue + sends a single push/email
when something needs a human — a backup that failed or ran cleartext, a compliance email
that didn't send, an agent stale past budget, a workflow red 2 days running, a suspected key
lapse. Says what broke, likely cause, the one action.

**Stays silent on:** healthy runs; agents that correctly no-op; a single transient red run;
anything already covered by an open acknowledged issue. **No news is the default output.**

## 7. Quick wins vs. projects

**Quick wins (hours each, low risk):**
- Bump 11 `claude-opus-4-7` call sites to `claude-opus-4-8` via one shared `MODEL` constant.
- Reconcile the `/sync` cadence and document it; add the 5 missing crons to handover-05.
- Verify `CRON_SECRET` is set in **both** Vercel projects.
- Switch `seo-monitor` (and scout, once on Opus) to `web_search_20260209`.
- Centralise the clinic-email recipient on one env-backed constant; make it required.
- Move `@anthropic-ai/sdk`+`tsx` into pinned `package.json` devDependencies.
- Downgrade caption/sentiment/seasonal agents to Haiku/Sonnet.
- Make `clinical-audit` read its own audit row before sending.

**Projects (a focused day or two each, in order):**
1. **Vercel-cron heartbeat + watchdog assertion** (§5) — the keystone; unblocks hands-off.
2. **Backup hardening** — mandatory encryption on all files; `fetchTable` throws; random
   salt; Dropbox refresh-token; retention.
3. **The overseer daily session** (§6) — built on top of #1.
4. **Auto-blog safety** — upgrade draft model off Haiku + fact-check gate, or keep PR mode;
   failure-notification on both LLM workflows; shared push-with-retry step.
5. **Shared idempotency + email-failure handling** across the three email agents.
