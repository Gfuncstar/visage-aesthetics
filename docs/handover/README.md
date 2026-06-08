# Developer Handover — Visage Aesthetics

**If you are a developer stepping in to maintain this project, start here.**

This folder is the technical companion to `/DISASTER_RECOVERY.md` (which covers
*access* — how to get the logins). This folder covers *the code* — what the
system is, how it's built, and how to keep it running.

The site is **https://www.vaclinic.co.uk** — the website for a nurse-led
aesthetics clinic in Essex (practitioner: Bernadette Tobin RGN). It is a single
**Next.js 16 (App Router)** application that is really **two systems in one**:

1. **A public marketing website** — treatment pages, location landing pages, an
   auto-generated blog, and a native online-booking flow with Stripe deposits.
2. **A private staff back-office** (the "Assistant") at `/staff/*` — PIN-gated,
   backed by a dedicated Supabase database of real client/clinical records, plus
   **10 autonomous AI agents** that run on a schedule.

## The stack in one breath

Next.js 16 + React 19 + TypeScript, Tailwind v4, deployed on **Vercel**, code on
**GitHub** (`Gfuncstar/visage-aesthetics`). Data in **Supabase** (Postgres).
Email via **Resend**, SMS via **Twilio**, payments via **Stripe**, AI via the
**Anthropic API**. Bookings/CRM of record is **Ovatu** (read-only iCal feed in).

## Read these in order

| # | Doc | What it covers |
|---|-----|----------------|
| 1 | [`01-architecture-overview.md`](./01-architecture-overview.md) | The whole system on one page: the two halves, data stores, request & deploy flow. |
| 2 | [`02-public-website.md`](./02-public-website.md) | The marketing site: routing, content model (treatments/geo/blog), SEO. |
| 3 | [`03-booking-engine.md`](./03-booking-engine.md) | Native booking: availability, Stripe deposits, reminders, manage links, consent. |
| 4 | [`04-staff-assistant.md`](./04-staff-assistant.md) | The PIN-gated back-office, the Supabase data layer, auth, the page/API map. |
| 5 | [`05-autonomous-agents.md`](./05-autonomous-agents.md) | The 10 scheduled cron agents — what each does and how to control them. |
| 6 | [`06-integrations-and-ops.md`](./06-integrations-and-ops.md) | Every external service, every env var, deploys, and how to rotate keys. |

## Existing operational docs (already in the repo — not duplicated here)

- `AGENTS.md` — house rules + the manual **Google reviews refresh** procedure.
- `docs/ASSISTANT_SETUP.md` — the Assistant's feature list and data wiring (authoritative).
- `docs/CONSENT_FORMS.md` — the in-house consent/intake form system.
- `BLOG_AUTOMATION.md` — the auto-blog GitHub Action.
- `SEO_PLAYBOOK.md` — everything done for SEO (reusable checklist).

## Day-one checklist for a new maintainer

1. Get the logins from the **Bitwarden vault** (see `/DISASTER_RECOVERY.md`).
2. Confirm access to: **GitHub**, **Vercel**, **Supabase**, **Stripe**, the
   **business email**.
3. Clone, `npm install`, copy the env vars from Vercel into `.env.local`
   (see doc 6 for the full list), `npm run dev`.
4. Read docs 1–6 in order. The Assistant (docs 4–5) is where the real
   complexity — and the real client data — lives. Treat it carefully.

_Last reviewed: 2026-06-08_
