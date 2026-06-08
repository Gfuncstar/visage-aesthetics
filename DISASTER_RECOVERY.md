# Disaster Recovery & Access Continuity

**Plain-English guide. No passwords live in this file — on purpose.**

This document exists to solve one problem: right now, almost everything that
keeps the Visage Aesthetics website and systems running is held by one person
(Giles). If he were ever unreachable — illness, accident, or just away — the
business could be locked out. This is the plan that makes sure that never
happens, **without** the business owner needing to be technical.

---

## The idea in one minute

You should **never have to log into or operate any of these systems yourself.**
It works exactly like Overdue does today: if something goes wrong, you don't fix
it — you get the right person the access they need, and they fix it.

There are three moving parts, and only the first two involve you:

1. **A password manager** holds every login. It's filled in once and kept up to
   date. You are named on its *emergency access*, so if you can't reach Giles,
   you press one button, wait the set delay, and the whole vault opens.

2. **A backup developer** is the person you hand that vault to. They're your
   "someone to ring" — the website equivalent of Overdue.

3. **This document** is the map. It tells whoever picks it up what every system
   is, where the keys are, and what to do. That part is automatic — it stays in
   the code and gets refreshed.

That's the whole plan. **Your only jobs: keep the one emergency card safe, and
know who to call.**

---

## What the business owner does (and nothing more)

- **Hold one "break glass" card.** A single index card in a safe place (home
  safe, or with the accountant). It needs just **one** thing written on it: the
  **business email login**. That email is the master key — from it, a developer
  can reset their way into almost everything else.
- **Know the password manager's emergency-access step.** One button, then a
  short wait, then the vault opens. Written below.
- **Know who to call** — the backup developer (details below).

You do not need to understand anything else on this page. The rest is here for
the developer who steps in.

---

## Emergency access — step by step

> Password manager: **Bitwarden** (Premium — ~£10/year, the tier that includes
> emergency access). Full setup steps are in `docs/VAULT_SETUP.md`.
> Fill the personal blanks below in once, then leave them.

- **Emergency-access waiting period:** `[TODO: the wait Giles set, e.g. 7 days]`
- **To open the vault:** go to **https://vault.bitwarden.com**, sign in to
  your own free Bitwarden account, open **Settings → Emergency Access**, find
  Giles's name and choose **Request access**. After the waiting period above
  passes with no response from Giles, it unlocks automatically and you (or the
  backup developer) can read every login.
- **Break-glass card location:** `[TODO: e.g. home safe / with accountant]`

### Who to call (the backup developer)

- **Primary:** `[TODO: name]` — `[TODO: phone]` — `[TODO: email]`
- **Secondary (backup-of-backup):** `[TODO: name / phone]`

---

## The systems — what each one is

Everything below is reachable from the **password manager**. Most of these are
not "passwords" you'd ever type — they're API keys (long random strings) that
already live inside **Vercel** as environment variables. A developer logging
into Vercel can see them all. So the password manager really only needs the
**front-door account logins** for each service.

Ordered most-important first:

| # | System | What it is | Why it matters |
|---|--------|-----------|----------------|
| 1 | **Business email** | The inbox everything else resets to | Master key. Lose it and recovery gets hard. |
| 2 | **Vercel** | Hosts the website; holds every API key + image storage | The single biggest login. |
| 3 | **Supabase** | The database — client records & bookings | **Real client data — guard hardest (data protection).** |
| 4 | **GitHub** (`gfuncstar/visage-aesthetics`) | The source code | Where the site is built from. |
| 5 | **Stripe** | Payments & booking deposits | Money. |
| 6 | **Domain registrar** | The web address itself | If lost, the site name is gone. Should sit in the business's name. |
| 7 | **Google** | Business Profile (reviews) + Google Cloud project | Public listing & maps. |
| 8 | **Microsoft 365** | The clinic inbox the assistant reads | Email automation. |
| 9 | **Twilio** | Sends SMS to clients | Reminders & messages. |
| 10 | **Resend** | Sends the website's emails | Confirmations, broadcasts. |
| 11 | **Meta Business** | Facebook / Instagram page | Social posting. |
| 12 | **Ovatu** | The booking system | Appointments. |
| 13 | **Anthropic** | The AI behind the staff assistant | **Has billing attached.** |

> The internal secrets the app uses (staff PIN, cron secrets, webhook secrets,
> WebAuthn settings) are not separate accounts — they all live inside Vercel's
> environment variables alongside the API keys, and can be viewed or rotated
> from there.

---

## For the developer who steps in

If you're reading this in an emergency, here's the short version:

1. Open the **password manager** (emergency access above) — it has every login.
2. The **business email** (#1) lets you reset anything you can't otherwise reach.
3. The site runs on **Vercel** (#2) — that's where every API key/env var lives,
   and where deploys happen. The code is on **GitHub** (#4).
4. **Supabase** (#3) is the client database — treat as confidential patient data.
5. **Full developer handover docs are in [`docs/handover/`](docs/handover/)** —
   start at `docs/handover/README.md`. They give a detailed, project-by-project
   outline of the whole system (architecture, public site, booking engine, staff
   assistant, the autonomous agents, and every integration).
6. Day-to-day operational notes (deploys, the Google-reviews refresh) are in
   `AGENTS.md`, `docs/ASSISTANT_SETUP.md`, and the other markdown files.

---

## Keeping this fresh

This map is reviewed and updated **monthly** so it never drifts from reality —
if a new service is added, it gets a row here. The actual passwords stay in the
password manager only; **they are never written into this file or anywhere in
the code.**

_Last reviewed: 2026-06-08_
