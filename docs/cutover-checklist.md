# Ovatu to in-house cutover

How to swap the clinic from Ovatu to the in-house booking system cleanly, front
end and back end, with nothing missed, nothing duplicated, and a one-step way
back if anything goes wrong.

> Live readiness page: **`/staff/assistant/preflight`**. It checks everything in
> this document automatically and shows green or red. Run it before, during and
> after the swap. It is read-only and changes nothing.

---

## 1. The one switch

The whole swap is driven by a single environment variable in Vercel:

```
NEXT_PUBLIC_CUTOVER = go
```

Setting it to `go` triggers a redeploy and swaps the clinic over end to end:

- **Front end:** every "Book" button stops opening the Ovatu widget and points at
  the in-house flow (`/book-online`).
- **Back end:** the daily Ovatu sync becomes a no-op, so the in-house system is
  the sole source of truth for clients, bookings and notes from that moment.
- **Consent:** consent forms are sent automatically at booking.

Anything other than `go` (or removing the variable) means "stay on Ovatu". That
is also the back door (see section 6).

The switch lives in `src/lib/assistant/go-live.ts`.

---

## 2. Before you flip the switch

Open **`/staff/assistant/preflight`** and get every item green. The blockers
(red) stop the swap; the warnings (amber) let you go live but run in a reduced
way until set.

### Blockers (must be green)

| Check | Why it blocks | Where to fix |
| --- | --- | --- |
| Clinic database connected | No database, no bookings | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Bookable treatments set up | Empty booking page | `services` table (active + online_bookable) |
| Opening hours set | Every day computes closed, no slots | `business_hours` table |
| Live slots in next 14 days | Proof a client can actually book | follows from the two above |

### Warnings (go live, but set soon)

| Check | What is reduced if unset | Where to fix |
| --- | --- | --- |
| Consent form per treatment | Those treatments book but send no consent link | `src/lib/consent/forms.ts` |
| Card deposits (Stripe) | Deposit clients hold as pending, pay manually | `STRIPE_SECRET_KEY` |
| Email confirmations + reminders | Bookings record, but no email goes out | `RESEND_API_KEY` |
| Text confirmations (optional) | Texts skipped, email used instead | `TWILIO_*` |
| Scheduler secret | Reminder + sync crons return 401 | `CRON_SECRET` |
| Ovatu booking turned off | Old Ovatu link could double-book | turn off in Ovatu (section 5) |
| Clients already booked in Ovatu | They cannot change in the new system yet | migrate them (section 4) |

---

## 3. The swap, step by step

1. Get the readiness page all green (amber is your call).
2. **Bring the existing bookings across** (section 4) while still on Ovatu, so
   nothing is waiting on the switch.
3. In Vercel, set `NEXT_PUBLIC_CUTOVER = go`. Wait for both production deploys
   (`visage-aesthetics` and `visage-aesthetics-ddxi`) to go Ready.
4. **Turn off online booking inside Ovatu** so the old link cannot take a
   clashing slot.
5. Re-check the readiness page. The switch should read **LIVE**.
6. Place one test booking on `/book-online` and confirm it lands in the diary and
   sends a confirmation.

---

## 4. Bringing the six weeks of existing bookings across

Clients booked in Ovatu do not exist in the new system, so they could not change
or cancel after the swap. The migration tool fixes that by turning each upcoming
Ovatu appointment into a real, changeable booking.

Tool: **`/staff/assistant/migrate`** ("Bring bookings across").

1. In Ovatu, export upcoming appointments as CSV. Make sure it includes, at
   least: **date, time, client name, treatment**. Include **email and mobile**
   so the client can manage online and get reminders.
2. Paste or upload the CSV.
3. Click **Preview**. It writes nothing and shows what would happen.
4. Click **Bring them across**. Each upcoming appointment becomes a native
   booking with its own manage link, and (if ticked) each client is emailed their
   account link.

Built-in safety:

- **Never double-books.** A row that already exists as a booking is skipped.
- **Never guesses.** Anything it cannot resolve safely is listed for you to
  handle by hand:
  - *Treatment name did not match* — add or rename it in `services`, or book by
    hand.
  - *No start time in the export* — re-export with a time column, or book by hand.
  - *Brought across, no email on file* — booked in the diary, but the client
    manages by phone through reception.

Run the preview as many times as you like. Re-running the real import is safe (it
skips duplicates).

---

## 5. What changes for clients

New bookings are unaffected: they simply use the new flow.

For existing clients, the experience stays similar with no password to deal with:

- **Ovatu logins retire.** Passwords cannot transfer and are not needed.
- **New account page: `/account`.** A client enters their email and gets a
  private one-tap link (no password). From there they see all their appointments,
  change or cancel any of them, and update their mobile. The link is also in every
  confirmation email.
- During the changeover, keep Ovatu's own manage links reachable until the last
  pre-swap appointment has passed, as a fallback for anyone not migrated cleanly.

Suggested line to clients: *"We have moved to a new booking system. There is no
password any more. To see or change your appointments, go to vaclinic.co.uk and
ask for your link, or use the link in your confirmation email."*

---

## 6. Back door: instant rollback

If anything goes wrong, go straight back to Ovatu with one change.

1. In Vercel, **remove `NEXT_PUBLIC_CUTOVER`** (or set it to anything other than
   `go`) and redeploy.
2. Re-open online booking in Ovatu.

What happens on rollback:

- Every "Book" button points back at the Ovatu widget.
- The Ovatu sync starts again, so Ovatu is the source of truth once more.
- Consent forms stop sending automatically at booking.
- **Nothing is lost either way.** Bookings taken in the new system while it was
  live stay in the diary and the reports, and all history is kept (the insurance
  policy needs records for ten years).

You are then exactly where you started.

---

## 7. After the swap (the two-week watch)

These were the drift risks that would otherwise creep in over the first
fortnight. Both are handled in code, but worth a glance:

- **Reporting stays fed.** Every native booking is mirrored into the
  `appointments` table (the one finance and the end-of-day reports read), keyed
  per booking so nothing is double-counted. Marking a booking *completed* in the
  diary sets its revenue.
- **Reminders fire.** An hourly cron sends the 24-hour reminder for confirmed
  bookings. It needs `CRON_SECRET` set (section 2).

Spot checks in the first two weeks:

- A completed booking shows revenue in Profit.
- A booking 24 hours out gets its reminder.
- The diary count matches reality (no missing or duplicated appointments).
- New online bookings do not clash with migrated ones.

---

## 8. Environment variables at a glance

| Variable | Purpose | Effect if unset |
| --- | --- | --- |
| `NEXT_PUBLIC_CUTOVER` | The swap switch (`go` = live) | Stays on Ovatu |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Clinic database | Booking unavailable |
| `STRIPE_SECRET_KEY` | Card deposits at booking | Deposit clients pay manually |
| `RESEND_API_KEY` | Confirmation / reminder / consent emails | No email sent |
| `TWILIO_*` | Text confirmations and reminders | Texts skipped (email used) |
| `CRON_SECRET` | Authorises the reminder + sync crons | Reminders never fire |
| `CONSENT_FORMS_ENABLED` | Force consent-at-booking on/off | Follows the cutover switch |
| `PORTAL_SECRET` | Signs client account links | Falls back to `STAFF_PIN` |

---

## 9. Where things live (for the developer)

| Piece | File |
| --- | --- |
| The cutover switch | `src/lib/assistant/go-live.ts` |
| Public "Book" link | `src/lib/booking.ts` |
| Readiness check | `src/lib/booking-engine/preflight.ts` |
| Reporting mirror | `src/lib/booking-engine/appointments-mirror.ts` |
| Booking migration | `src/lib/booking-engine/migrate.ts`, `src/lib/assistant/ovatu-csv.ts` |
| Client account portal | `src/app/account/`, `src/app/api/book/portal/` |
| Magic-link tokens | `src/lib/booking-engine/portal-token.ts` |
| Reminders cron | `src/app/api/book/reminders/route.ts` |
| Ovatu sync (off after cutover) | `src/app/api/staff/assistant/sync/route.ts` |
