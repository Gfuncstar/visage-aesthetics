# 3 · The Native Booking Engine

A self-contained online-booking flow that writes to Supabase and takes a deposit
via Stripe. It lives alongside — but is separate from — Ovatu (the clinic's CRM
of record). Code: `src/lib/booking-engine/` + `src/app/api/book/` +
`src/app/book/`.

## The flow

```
/book/<treatment>  ─▶  pick a slot          GET  /api/book/availability
       │                                    GET  /api/book/services
       ▼
   enter details   ─▶  create booking       POST /api/book/create   (status: pending)
       │                                          └─▶ Stripe deposit (PaymentIntent)
       ▼
   pay deposit     ─▶  confirm              POST /api/book/deposit/confirm (status: confirmed)
       │                                          └─▶ Resend confirmation email
       ▼                                          └─▶ (optional) consent form link
   /book/confirm   ─▶  manage later         /book/manage/[token]  +  /api/book/manage/[token]
```

## Key concepts

- **Services** (`booking-engine/types.ts` → `Service`): each bookable treatment
  has `duration_min`, `buffer_min`, `price_from`, `deposit`, `online_bookable`.
  Served from Supabase via `/api/book/services`.
- **Availability** (`booking-engine/availability.ts` + `time.ts`): computes free
  `Slot`s from business hours, existing bookings, and time-off. Default clinic
  hours **09:00–18:00** if not configured (noted in `ASSISTANT_SETUP.md`).
- **Booking** (`Booking` type): `status` is
  `pending → confirmed → completed | cancelled | no_show`. `source` is
  `online | staff`. Every booking gets an unguessable **`manage_token`** used for
  the client self-service page and (reused) for the consent form link.
- **Deposits via Stripe** (`booking-engine/stripe.ts`, `STRIPE_SECRET_KEY`): a
  booking is created `pending`, a PaymentIntent takes the deposit, and
  `/api/book/deposit/confirm` flips it to `confirmed` and emails the client.
- **Client flags** (`booking-engine/client-flags.ts`): risk/notes flags applied
  to bookings (e.g. deposit-required, do-not-contact).

## Emails (all via Resend)

Driven by `src/lib/booking-engine/notify.ts` + `src/lib/booking-email.ts`:
- Confirmation on deposit paid.
- **Reminders** — `POST /api/book/reminders` (also a manual/cron-able route)
  sweeps confirmed bookings and emails reminders, stamping `reminded_at`.
- Review request after completion (`review_requested_at`,
  `GOOGLE_REVIEW_URL`).

Relevant env vars: `BOOKING_FROM_EMAIL`, `BROADCAST_REPLY_TO`, `RESEND_API_KEY`,
`GOOGLE_REVIEW_URL`, `STRIPE_SECRET_KEY`.

## Consent gating (optional, off by default)

If `CONSENT_FORMS_ENABLED` is set, the confirmation email includes a link to the
right consent form for that treatment, completed at `/consent/<manage_token>`
before the appointment. **This is built but inert until switched on** — full
detail in `docs/CONSENT_FORMS.md`.

## Waitlist

`POST /api/book/waitlist` captures clients for fully-booked slots.

## Gotchas

- A booking can be **`pending` forever** if the client abandons before paying —
  these are real rows in the DB; don't treat `pending` as confirmed.
- The native engine does **not** sync back to Ovatu. If the clinic runs both,
  double-booking across systems is possible — confirm with the clinic which
  system is authoritative for which treatments before changing behaviour.
- Stripe is in **live** mode in production — test against Stripe test keys
  locally, never the live key.
