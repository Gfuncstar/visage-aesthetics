# Resetting the live feeds at a system switch

When the clinic moves to a new system, the staff "live feeds" — the running
to-do lists the Assistant shows — should start fresh from the moment of the
switch. They must **not** resurface the imported back-history as a giant
backlog the day you cut over.

There is **one setting** that does this:

```
GO_LIVE_DATE=YYYY-MM-DD
```

Set it (in Vercel → Project → Settings → Environment Variables, on both
production projects) to the date you go live on the new system, then redeploy.
From that date forward, every live feed below measures only what's happened
**on or after** go-live.

## What the date resets

| Feed | What it shows | Effect of GO_LIVE_DATE |
| --- | --- | --- |
| **Write-ups needed** (Assistant home) | Clients seen with no clinical note yet — "overdue" + "to write up" | Visits before go-live are not chased |
| **Consent chasing** (Assistant home / Consent) | Booked clients with no consent form on file | Only bookings made on/after go-live are flagged |
| **Stock "ordered" state** (What to order) | Items marked ordered / awaiting delivery | A previous system's "ordered" marks don't carry over |

Anything added later that surfaces a backlog should import
`goLiveDate()` / `goLiveTimestamp()` from `src/lib/assistant/go-live.ts` and
floor its "since" at that value, so it's covered by the same single switch.

## What it deliberately does NOT reset

Historical **reporting** keeps full history on purpose — the money dashboard,
the month-end accountant pack, the orders/expenses log, and rebook reminders
(you still want to invite lapsed clients back from before the switch). These
are records, not to-do lists, so the cut-over date does not hide them.

## Notes

- The default (when `GO_LIVE_DATE` is unset) is `2026-06-05`, the current
  production go-live — so behaviour is unchanged until you set it.
- Per-feature escape hatches still exist (`WRITEUP_OVERDUE_SINCE`,
  `CONSENT_ENFORCE_FROM`) for a one-off, but normally leave them unset so the
  single `GO_LIVE_DATE` governs everything.
- The write-up "overdue" chase also has a rolling 14-day window, so even
  without changing anything it stops chasing old visits after two weeks.
