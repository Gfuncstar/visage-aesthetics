# Visage Assistant — what it is, how it's wired, what's left

A staff-only "assistant" that takes the admin off the clinic. It sits inside the
existing back end at **`/staff/assistant`** (same PIN login as Patient Notes and
Broadcasts) and **complements Ovatu** — Ovatu stays the booking/CRM/consent
system; the Assistant does the admin around it. It's installable as a phone
home-screen app (PWA).

Status: **live in production** (deployed from `main`).

---

## What it does

- **Treatment write-up** — pick a client (today's Ovatu appointments pre-fill),
  tap areas, doses auto-total; product/batch/expiry/technique/consent/review
  carry forward. Generates an editable clinical note (saved to the clinic DB
  **and** the existing patient-notes Google Sheet) and a warm aftercare email
  pushed into Broadcasts. Voice "Dictate" on the notes field.
- **Client records** — search any client: visits, lifetime spend, treatment mix,
  clinical notes, appointment history, and a before/after **photo vault** (with
  consent recorded).
- **Squeeze-in** — say/type a "can you fit me in" request (mic or keyboard
  dictation). It extracts who/what/when/contact, finds the best free gap in the
  live diary, and drafts a ready-to-send reply with the booking link so the
  **client self-books in Ovatu** (one-tap "Send on WhatsApp"). Holds a to-book list.
- **What to order** — upcoming bookings vs logged stock; flags what to order
  with an "order by 3pm" reminder for next-day delivery. "Mark ordered" knocks an
  item off until the delivery is logged. Stock runs down as treatments are written up.
- **Orders & expenses** — log a supplier order by **photographing the delivery
  note / invoice** (Claude vision), **pasting the confirmation email**, or by
  hand. Batch numbers become stock that auto-fills write-ups. Review queue for
  unconfirmed parses.
- **Profit & accountant pack** — revenue by treatment, costs, net profit, margin,
  unpaid invoices, a revenue-vs-spend trend, and a copyable month pack + CSV.
- **End-of-day nudge** — at-a-glance tiles (seen / to write up / squeeze-ins);
  written-up clients drop off as she goes.
- **Push notifications** — installed app can pop up the daily reorder reminder.

---

## How it's wired (data & automation)

- **Database:** a dedicated **Supabase project** (`visage-aesthetics-clinic`,
  London / eu-west-2), separate from any other app. All tables have RLS enabled
  with **no policies**, so access is server-side only via the service-role key,
  behind the staff PIN. Special-category data stays isolated.
- **Live appointments:** pulled from the **Ovatu iCal "All Appointments" feed**
  by a Postgres function (`sync_ovatu_calendar`) on a **15-minute `pg_cron`
  schedule** — fully automatic, no app/Vercel involvement. Times included, so the
  squeeze-in finds real gaps. (Ovatu has no write API, so bookings still happen
  in Ovatu; this feed is read-only.)
- **Revenue history:** the 12-month Ovatu reservations CSV was imported once
  (822 completed appointments, ~£84.6k); the live feed keeps it current going forward.
- **Orders:** read by Claude vision (photo) or the LLM/regex parser (pasted
  text) → review queue. Batch numbers + expiry recorded as stock.
- **Push:** Web Push (`web-push`) with a service worker (`public/sw.js`). VAPID
  keys live in the RLS-locked `app_config` table (read server-side) — nothing in
  Vercel. A **daily `pg_cron`** (12:00 UTC / 1pm BST) calls the notify route,
  which pushes the reorder reminder when tomorrow's clients need stock.

### Scheduled jobs (Supabase `pg_cron`)
| job | schedule | what |
|---|---|---|
| `ovatu-calendar-sync` | `*/15 * * * *` | refresh appointments from the Ovatu iCal feed |
| `stock-reorder-notify` | `0 12 * * *` | push the reorder reminder when stock is short for tomorrow |

### Config locations
- **Vercel env** (production): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (set),
  plus the pre-existing `STAFF_PIN`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`,
  `BLOB_READ_WRITE_TOKEN`, `STAFF_NOTES_WEBHOOK_URL/SECRET`.
- **DB `app_config`** (no Vercel needed): `vapid_public`, `vapid_private`,
  `vapid_subject`, `push_cron_secret`.
- The Ovatu iCal token is embedded in the `sync_ovatu_calendar` function.

---

## What's left / parked

- **Supplier order auto-capture from email.** Parked by choice — Bernadette's
  order inbox is a personal Outlook.com account, and connecting it needs her
  one-time sign-in (Microsoft OAuth, or a Zapier rule to the `/orders/ingest`
  webhook with `ORDER_INGEST_SECRET`). Until then, **photograph or paste** the
  order — which also captures batch numbers from the delivery note.
- **Ovatu write-back.** Not possible (no API). The squeeze-in flow has the client
  self-book via the booking link instead.
- **Clinic hours** for the squeeze-in gap-finder default to 09:00–18:00; confirm
  her real hours if they differ (clinic has run later).
- **Stock quantities** use rough per-treatment estimates and lean toward "order";
  they get more accurate as real doses are written up (which decrement stock).

## Refreshing things
- **Appointments/revenue** stay live automatically. A fresh reservations CSV can
  be re-imported anytime to true up historical prices.
- **Reviews** (public site) are still refreshed via the separate process in
  `AGENTS.md`.
