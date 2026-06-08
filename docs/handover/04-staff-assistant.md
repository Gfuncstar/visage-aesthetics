# 4 · The Staff Assistant (back-office)

The Assistant is a PIN-gated, phone-first (PWA) back-office that takes the admin
off the clinic. It lives under `/staff/assistant` and **complements Ovatu** —
Ovatu stays the booking/CRM system; the Assistant does the admin around it.

> The feature list and data wiring are authoritatively documented in
> **`docs/ASSISTANT_SETUP.md`** — read that first. This doc is the *developer's*
> map: how it's structured in code, so you can change it safely.

## What it does (summary)

Treatment write-ups → clinical notes + aftercare email; client records with a
before/after photo vault; "squeeze-in" request parsing; stock/reorder tracking;
order & expense capture (photo/paste via Claude vision); profit & accountant
pack; end-of-day nudges; push notifications. Plus the 10 agents (doc 5).

## Code structure

```
src/app/staff/assistant/          UI pages (diary, clients, money, orders,
                                  stock, rebook, reception, marketing, agents…)
src/app/api/staff/assistant/      The matching API routes (one folder per feature)
src/lib/assistant/                The business logic + data access
public/sw.js                      Service worker (PWA + web push)
```

### `src/lib/assistant/` — the engine room

| File | Responsibility |
|------|----------------|
| `db.ts` | **The only DB gateway.** Thin PostgREST wrapper using the Supabase service-role key. `select/insert/insertMany/update/remove/audit`. Read this first. |
| `types.ts` | Shared domain types |
| `ovatu.ts`, `ovatu-csv.ts` | Read the Ovatu appointment feed / import the reservations CSV |
| `slots.ts`, `rebook.ts`, `suppression.ts` | Diary gap-finding, rebooking, contact suppression |
| `order-parsers.ts`, `order-ingest.ts` | Parse supplier orders (Claude vision / regex) into stock |
| `stock.ts` | Stock levels vs upcoming demand; reorder logic |
| `finance.ts`, `reports.ts` | Profit, accountant pack, revenue trends |
| `consent.ts` | Consent enforcement helpers (see `docs/CONSENT_FORMS.md`) |
| `graph-inbox.ts` | Microsoft Graph — read the clinic Outlook inbox (parked, see setup doc) |
| `meta.ts` | Meta (Facebook/Instagram) page posting |
| `sms.ts` | Twilio SMS send |
| `messages.ts`, `notes.ts`, `notes-sheet.ts` | Client messaging, clinical notes, the legacy patient-notes Google Sheet bridge |
| `push.ts` | Web Push (VAPID keys live in the DB `app_config`, not Vercel) |
| `opportunities.ts`, `command.ts`, `format.ts`, `treatment-types.ts` | Marketing opportunities, the command bar, formatting helpers |

## The data layer — read this carefully

All Assistant data lives in a **dedicated Supabase project**
(`visage-aesthetics-clinic`, London / eu-west-2), separate from everything else
because it holds **special-category health data**.

- Every table has **Row Level Security ON with NO policies.** That means the
  public/anon key can read *nothing*. All access goes through **`db.ts`** using
  the **service-role key**, which bypasses RLS — and that only ever runs inside
  **PIN-gated server route handlers.** Never expose the service-role key to the
  browser. Never add a permissive RLS policy without understanding this.
- If `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are missing, the Assistant
  **degrades gracefully** (features return empty) rather than crashing —
  mirroring how broadcasts/notes behave without their keys.
- An **`audit_log`** table records actions (`db.audit(...)`) — fire-and-forget,
  never throws into the request path.

### Supabase-side automation (pg_cron — runs without Vercel)

| Job | Schedule | What |
|-----|----------|------|
| `ovatu-calendar-sync` | `*/15 * * * *` | Pull appointments from the Ovatu iCal feed via the `sync_ovatu_calendar` Postgres function (the iCal token is embedded in that function) |
| `stock-reorder-notify` | `0 12 * * *` | Push the reorder reminder when tomorrow's clients need stock |

> Note: these are **separate** from the Vercel crons (doc 5). If appointments
> stop refreshing, check Supabase pg_cron + the `sync_ovatu_calendar` function,
> not Vercel.

## Auth recap (detail in doc 1)

Single shared **`STAFF_PIN`** → 8-hour HMAC-signed cookie (`staff-auth.ts`).
Optional **WebAuthn** passkey on top for the installed app. Cron routes use
**`CRON_SECRET`**, not the PIN.

## Other staff surfaces (outside the Assistant)

- **`/staff/broadcasts`** — bulk email composer → Resend (`broadcast-email.ts`,
  `api/staff/broadcasts/*`). Image uploads go to Vercel Blob.
- **`/staff/notes`** — patient notes, bridged to a Google Sheet via a signed
  webhook (`STAFF_NOTES_WEBHOOK_URL/SECRET`).
- **`/staff`** — the PIN login landing.
