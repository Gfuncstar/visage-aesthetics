# Consent forms (own back-end replacement for Ovatu)

Goal: move the consent/intake forms that currently go out via **Ovatu** into the
clinic's own system. When someone books, the right form for that treatment is
linked from their confirmation email; they complete it online before they come
in; and the completed form is **saved in the staff back-end against the real
client**, replacing what Ovatu holds today.

This is built **in the wings**. Nothing in the live booking flow changes until
it is explicitly switched on (see "Going live" below).

## What is built

| Piece | File |
| --- | --- |
| Faithful form definitions (verbatim from Ovatu) | `src/lib/consent/forms.ts` |
| Public fillable form (token-gated, per booking) | `src/app/consent/[token]/` |
| Public fillable form (generic, per form — sent outside a booking) | `src/app/consent/form/[formId]/` |
| Submit + storage API (per booking) | `src/app/api/book/consent/[token]/route.ts` |
| Submit + storage API (standalone) | `src/app/api/consent/standalone/[formId]/route.ts` |
| Staff back-end: send a form + list + reader | `src/app/staff/assistant/consent/` |
| Staff list API | `src/app/api/staff/assistant/consent/route.ts` |
| Database table (run once) | `scripts/consent-submissions.sql` |
| Optional confirmation-email link (inert until passed) | `src/lib/booking-email.ts` |

The client opens `https://www.vaclinic.co.uk/consent/<manage_token>` (the
booking's existing unguessable token). The page looks up the booking, picks the
form for that treatment, shows the **verbatim** information and questions, and on
submit stores everything in `consent_submissions`. Staff read it at
**Assistant → Consent forms**.

## Sending a form outside the booking system

Not every form goes out with a booking — a client may book without one attached,
or simply not complete the one they were sent. **Assistant → Consent forms** has
a **Send a form** section with one card per form (Botox, Dermal Filler, Skin
Booster, Polynucleotide, B12). Each card gives a generic, reusable link
(`https://www.vaclinic.co.uk/consent/form/<form-id>`) that staff copy and send
however they like. The client fills in their own Personal Details, and the
completed form lands under **Completed forms** on the same page — matched to a
client record by the email they enter, where one exists. These submissions are
stored with no `booking_id` (standalone) via
`src/app/api/consent/standalone/[formId]/route.ts`.

## Forms captured so far (exact)

Transcribed verbatim from Ovatu (14 forms total in the account). **All 14 encoded:**

1. **Botox Consent Form**
2. **Dermal Filler Consent Form**
3. **Skin Booster Consent Form**
4. **Polynucleotide Consent Form**
5. **B12 Consent Form**
6. **NAD Consent Form**
7. **CryoPen Consent Form** — its own form, *not* the Dermal Filler one
8. **Micro-Needling Consent**
9. **Haytox Consent Form** — Botox for hay fever / rhinitis
10. **Hyalase Consent Form** — hyaluronidase / filler dissolving
11. **Profhilo Structura Consent Form** — its own form, *not* the Skin Booster one
12. **HarmonyCa** — its own form, *not* the Dermal Filler one
13. **HIFU Mini**
14. **Aqualyx Consent Form** — **adapted**, see below

### Faithfulness notes — please confirm at source
- **B12 and NAD declarations are truncated in Ovatu itself** — both end mid-word at
  "…about the treatment **deta**". Reproduced exactly (`declarationTruncated: true`,
  shared `TRUNCATED_DECLARATION` in `forms.ts`). **Fix the canonical wording at source.**
- Several forms carry stored typos, reproduced verbatim on purpose: Polynucleotide
  "**apperaance**"; NAD "**Prenicious Anemia**" / "**Immunosupression**"; HIFU
  "**Sclerroderma**"; HarmonyCa "**Strenious**" / "**foro**"; CryoPen "**risk-risk**";
  Profhilo Structura "**fat pats**"; "**Gillian Barre Syndrome**" across several.
- **CryoPen, HarmonyCa, Profhilo Structura** were previously mapped to a *fallback*
  form (Dermal Filler / Skin Booster). Now each has its own captured form and the
  mapping points to it.
- Every encoded Ovatu form uses a single **tick-to-agree** checkbox (no drawn
  signature). We capture name + date automatically and one agreement tick, to match.

### Aqualyx — adapted to our model
The Ovatu source for **Aqualyx (92394)** was structurally unlike the others: no
Personal Details section, no tick-to-agree declaration (Data Consent toggle off), two
fields both labelled "Aqualyx & Lidocaine", and the consent statements embedded as the
pre-filled default of a long-text box. Per Giles' decision it was **adapted** to fit
our model: the standard Personal Details block and standard tick-to-agree declaration
were added, and the verbatim treatment overview + "I understand / I agree" statements
are shown as the read-only intro. **Worth tidying the source form in Ovatu** so a future
recapture would be clean.

To add a form: append a `ConsentForm` object to `CONSENT_FORMS` in
`src/lib/consent/forms.ts` and, if needed, extend `consentFormForService()` so the
relevant service maps to it. Staff "Send a form" cards render automatically from
`CONSENT_FORMS`.

## Service → form mapping

`consentFormForService(slug, name)` in `src/lib/consent/forms.ts` maps a booking's
service to a form by keyword. **Order matters** — specific treatments are checked
before the broad buckets:

- haytox / hay fever / rhinitis → **Haytox**
- botox / anti-wrinkle / toxin / hyperhidrosis / migraine → **Botox**
- harmonyca → **HarmonyCa**
- cryopen / cryo → **CryoPen**
- hyalase / hyaluronidase → **Hyalase**
- structura → **Profhilo Structura**
- profhilo / skin booster / bio-remodelling → **Skin Booster**
- polynucleotide → **Polynucleotide**
- nad → **NAD**
- b12 / vitamin b → **B12**
- micro-needling / skin needling / dermapen → **Micro-Needling**
- hifu / focused ultrasound → **HIFU Mini**
- aqualyx / fat dissolving / deoxycholic → **Aqualyx**
- filler / lip / cheek / juvederm / restylane → **Dermal Filler**
- anything else → no form

## Going live (two switches — currently OFF)

The wiring is already in place in `src/app/api/book/create/route.ts` and
`src/app/api/book/deposit/confirm/route.ts`. The confirmation email adds the
consent link only when **both** are true: the booked treatment has a form, and
the feature flag is on. Two steps switch it on:

1. **Create the table:** run `scripts/consent-submissions.sql` against the
   `visage-aesthetics-clinic` Supabase project (project ref `yawclxvhgbtzacthstpr`).
   Until then the staff view shows "no consent forms yet" and submissions return
   a clear "not configured" message (nothing crashes).
2. **Set `CONSENT_FORMS_ENABLED=true`** in Vercel (production). With it unset or
   any other value, confirmation emails are byte-for-byte identical to today, so
   it is safe to merge before either switch is flipped.

Then smoke-test: make a test booking for one of the five treatments, open the
`/consent/<token>` link from the email, submit, and confirm it appears under
**Assistant → Consent forms**.
