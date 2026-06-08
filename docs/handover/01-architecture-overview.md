# 1 · Architecture Overview

One Next.js 16 app, deployed once to Vercel, serving two very different audiences
from the same codebase.

```
                          ┌─────────────────────────────────────────────┐
                          │            Vercel (Next.js 16 app)           │
                          │                                              │
   Public visitors  ───▶  │  PUBLIC SITE                                 │
   (vaclinic.co.uk)       │   • marketing pages (treatments, geo, blog)  │
                          │   • native booking flow  ──▶ Stripe (deposit)│
                          │   • contact / gift vouchers ──▶ Resend (email)│
                          │                                              │
   Clinic staff    ───▶   │  STAFF BACK-OFFICE  (/staff/*, PIN-gated)    │
   (phone PWA)            │   • the "Assistant" (write-ups, diary, money)│
                          │   • broadcasts, patient notes, consent       │
                          │                                              │
   Vercel Cron     ───▶   │  10 AUTONOMOUS AGENTS (/api/.../agents/*)    │
                          │   • run on schedule, write to DB, email staff │
                          └──────────────┬───────────────────────────────┘
                                         │ service-role key (server only)
                                         ▼
                          ┌─────────────────────────────────────────────┐
                          │   Supabase (Postgres, eu-west-2 / London)    │
                          │   clinic records, bookings, stock, agents'   │
                          │   outputs. RLS on, NO policies → server-only │
                          │   + its own pg_cron (Ovatu sync, push)       │
                          └─────────────────────────────────────────────┘

   External services used server-side: Anthropic (AI), Twilio (SMS),
   Microsoft Graph (clinic inbox), Meta (social), Ovatu (read-only iCal feed).
```

## The two halves

### Public site (anonymous, cached, fast)
Marketing + lead generation. Mostly static/SSG pages built from TypeScript data
files (`src/lib/treatments.ts`, `geo-pages.ts`, `blog-posts.ts`). The only
stateful public surface is the **booking engine** (doc 3), the **contact form**,
and **gift vouchers** — these write to Supabase and send email via Resend.

### Staff back-office (`/staff/*`, authenticated)
Everything under `/staff` is gated by a **single shared PIN** (see Auth below)
and hidden from the public site chrome. This is the "Assistant" — see doc 4. It
reads and writes the **clinic Supabase database**, which holds *special-category
health data*. This is the sensitive heart of the system.

## Data stores — know which is which

| Store | Holds | Access |
|-------|-------|--------|
| **TypeScript data files** (in `src/lib`) | Treatments, geo pages, static reviews, blog index | Compiled into the build; edit + deploy to change |
| **Supabase Postgres** | Clients, bookings, clinical notes, stock, orders, agent outputs, audit log | Server-side only, via service-role key in `src/lib/assistant/db.ts` |
| **Vercel Blob** | Uploaded photos (before/after vault, broadcast images) | `BLOB_READ_WRITE_TOKEN` |
| **Ovatu** (external) | The booking/CRM system of record | **Read-only** — pulled in via an iCal feed by Supabase pg_cron. No write API. |

> **Important boundary:** Ovatu is still the clinic's real booking & CRM system.
> The Assistant *complements* it — it reads a live iCal feed of appointments but
> cannot write back. The native booking engine (doc 3) is a separate, newer path
> that writes to Supabase directly.

## Authentication

There is **no per-user login** for staff — it's a single shared secret:

- **`STAFF_PIN`** env var. On login (`/api/staff/login`) the PIN is checked with
  a constant-time HMAC compare (`src/lib/staff-auth.ts`), and an **8-hour signed
  session cookie** (`va_staff_session`, HMAC-signed with the PIN) is set.
- Every `/staff` page and `/api/staff/*` route checks `isStaffAuthed()` /
  `isAuthedFromRequest()`.
- **WebAuthn** (`src/lib/webauthn.ts`, `@simplewebauthn`) adds optional
  passkey/biometric unlock on top for the installed phone app.
- **Cron agents** authenticate with a separate **`CRON_SECRET`** bearer token,
  not the PIN (so Vercel Cron can call them).

## Deployment

- **Push to `main` → Vercel auto-deploys production.** There are two Vercel
  projects pointed at this repo (`visage-aesthetics` and `visage-aesthetics-ddxi`)
  — both must go green on a release (noted in `AGENTS.md`).
- `postbuild` pings **IndexNow** (`scripts/indexnow.mjs`) to nudge search engines.
- A **pre-commit hook** (husky + `scripts/check-voice.mjs`) lints staged files
  against the brand voice guide — don't be surprised when it speaks up.
- **Cron** is defined two places: **`vercel.json`** (the 10 agents + sync/poll)
  and **Supabase `pg_cron`** (Ovatu calendar sync every 15 min, push reminder
  daily). See doc 5.

## Where to look when something breaks

| Symptom | Look at |
|---------|---------|
| Public page wrong/missing | The relevant `src/lib/*.ts` data file + `src/app/.../page.tsx` |
| Booking failing | doc 3 + Stripe dashboard + `src/app/api/book/*` + Supabase |
| Staff back-office 500s | `SUPABASE_*` env vars set? + Supabase logs + `src/lib/assistant/db.ts` |
| An agent didn't run / emailed garbage | Vercel cron logs + `CRON_SECRET` + doc 5 |
| Emails not arriving | Resend dashboard + `RESEND_API_KEY` + the `*_FROM_EMAIL` vars |
