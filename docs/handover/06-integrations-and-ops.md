# 6 · Integrations, Environment & Operations

Every external service the app talks to, every environment variable, and the
day-to-day operational mechanics. This pairs with `/DISASTER_RECOVERY.md` (which
covers *who holds the logins*).

## External services

| Service | Used for | Keys / config | Where it's read |
|---------|----------|---------------|-----------------|
| **Vercel** | Hosting, builds, cron, Blob storage, **holds all env vars** | account login | the platform |
| **GitHub** | Source + auto-blog & scout Actions | account login | `.github/workflows/*` |
| **Supabase** | Clinic database (clients, bookings, stock, agent outputs) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | `src/lib/assistant/db.ts` |
| **Stripe** | Booking deposits, gift vouchers | `STRIPE_SECRET_KEY` (**live** in prod) | `src/lib/booking-engine/stripe.ts` |
| **Resend** | All transactional + broadcast email | `RESEND_API_KEY` + `*_FROM_EMAIL` | many routes |
| **Anthropic** | All AI (agents, parsing, drafting) — **has billing** | `ANTHROPIC_API_KEY` | agents, order-parsers, contact |
| **Twilio** | Client SMS | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `TWILIO_MESSAGING_SERVICE_SID` | `src/lib/assistant/sms.ts` |
| **Microsoft Graph** | Read the clinic Outlook inbox (order capture — parked) | `MS_GRAPH_CLIENT_ID`, `MS_GRAPH_CLIENT_SECRET`, `CLINIC_INBOX_FOLDER` | `src/lib/assistant/graph-inbox.ts` |
| **Meta** | Facebook Page posting + Instagram publishing | `META_PAGE_ID`, `META_PAGE_ACCESS_TOKEN`, `META_IG_USER_ID` (Instagram) | `src/lib/assistant/meta.ts` |
| **Ovatu** | Booking/CRM of record — **read-only** iCal feed | `OVATU_API_TOKEN`, `OVATU_API_BASE` (+ iCal token embedded in a Supabase function) | `src/lib/assistant/ovatu.ts` + Supabase pg_cron |
| **Google Places** | Live reviews (fallback used — not billed) | `GOOGLE_PLACE_ID`, `GOOGLE_PLACES_API_KEY` | `src/lib/google-reviews.ts` |
| **Vercel Blob** | Photo/image storage | `BLOB_READ_WRITE_TOKEN` | photo/broadcast upload routes |

## Environment variables — full list

All live in **Vercel → Project → Settings → Environment Variables** (production).
Copy them into `.env.local` for local dev. Grouped by purpose:

**Core data & auth**
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `STAFF_PIN` — the staff back-office passcode
- `CRON_SECRET` — bearer token for Vercel-cron agent routes
- `ANTHROPIC_API_KEY`

**Email (Resend)**
- `RESEND_API_KEY`
- `BOOKING_FROM_EMAIL`, `BROADCAST_FROM_EMAIL`, `CONTACT_FROM_EMAIL`,
  `CONTACT_TO_EMAIL`, `BROADCAST_REPLY_TO`, `CLINIC_EMAIL`, `GOOGLE_REVIEW_URL`

**Payments**
- `STRIPE_SECRET_KEY`

**SMS (Twilio)**
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`,
  `TWILIO_MESSAGING_SERVICE_SID`

**Inbox / social / booking feed**
- `MS_GRAPH_CLIENT_ID`, `MS_GRAPH_CLIENT_SECRET`, `CLINIC_INBOX_FOLDER`,
  `ASSISTANT_BASE_URL`
- `META_PAGE_ID`, `META_PAGE_ACCESS_TOKEN` (Facebook), `META_IG_USER_ID` (Instagram publishing — the IG Business account id linked to the Page; reuses the Page token)
- `OVATU_API_TOKEN`, `OVATU_API_BASE`

**Storage / reviews / webhooks**
- `BLOB_READ_WRITE_TOKEN`
- `GOOGLE_PLACE_ID`, `GOOGLE_PLACES_API_KEY`
- `STAFF_NOTES_WEBHOOK_URL`, `STAFF_NOTES_WEBHOOK_SECRET`
- `ORDER_INGEST_SECRET`

**Feature flags / WebAuthn / misc**
- `CONSENT_FORMS_ENABLED`, `CONSENT_ENFORCE_FROM`, `CONSENT_FORMS_ENABLED`
- `WEBAUTHN_RP_ID`, `WEBAUTHN_EXTRA_ORIGINS`

> Some keys are **not** in Vercel by design: the **VAPID push keys** and the
> **Ovatu iCal token** live inside the Supabase DB (`app_config` table / the
> `sync_ovatu_calendar` function), read server-side only. See `ASSISTANT_SETUP.md`.

> **GitHub Actions secrets** (separate from Vercel): the auto-blog needs
> `ANTHROPIC_API_KEY` set as a *repo* secret, and optional `AUTO_PUBLISH`
> variable — see `BLOG_AUTOMATION.md`.

## Deploys

- **Push to `main` → Vercel builds & deploys production automatically.**
- Two Vercel projects track this repo (`visage-aesthetics`,
  `visage-aesthetics-ddxi`) — wait for **both** to go Ready on a release.
- `postbuild` pings IndexNow. A husky pre-commit hook runs the brand-voice lint.

## Rotating a key (the common ops task)

1. Generate a new key in the service's own dashboard.
2. Update it in **Vercel → Environment Variables** (and GitHub Actions secrets if
   that key is used there too).
3. **Redeploy** (env changes need a new deploy to take effect).
4. Revoke the old key in the service dashboard.
5. Update the **Bitwarden vault** entry. Never commit keys to the repo.

## Health checklist when taking over

- [ ] Both Vercel projects deploying green from `main`?
- [ ] Supabase project healthy, pg_cron jobs running (Ovatu sync recent)?
- [ ] Stripe in live mode, webhooks/deposits succeeding?
- [ ] Resend domain verified, emails delivering?
- [ ] Anthropic account funded (agents depend on it)?
- [ ] Cron agents running without 401s (CRON_SECRET correct)?
- [ ] Auto-blog Action enabled with its repo secret?
