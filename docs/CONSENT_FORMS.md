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
| Submit + storage API | `src/app/api/book/consent/[token]/route.ts` |
| Staff back-end list + reader | `src/app/staff/assistant/consent/` |
| Staff list API | `src/app/api/staff/assistant/consent/route.ts` |
| Database table (run once) | `scripts/consent-submissions.sql` |
| Optional confirmation-email link (inert until passed) | `src/lib/booking-email.ts` |

The client opens `https://www.vaclinic.co.uk/consent/<manage_token>` (the
booking's existing unguessable token). The page looks up the booking, picks the
form for that treatment, shows the **verbatim** information and questions, and on
submit stores everything in `consent_submissions`. Staff read it at
**Assistant → Consent forms**.

## Forms captured so far (exact)

Transcribed verbatim from Ovatu (14 forms total in the account):

1. **Botox Consent Form**
2. **Dermal Filler Consent Form** — Ovatu attaches this to **Filler** *and* **CryoPen**
3. **Skin Booster Consent Form**
4. **Polynucleotide Consent Form**
5. **B12 Consent Form**

### Faithfulness notes — please confirm at source
- **B12 declaration is truncated in Ovatu itself** — it ends mid-word at
  "…about the treatment **deta**". Reproduced exactly (`declarationTruncated: true`
  in `forms.ts`). **This should be fixed in the canonical wording.**
- **Polynucleotide** has a stored typo: "How often are you dissatisfied with your
  **apperaance**?" — reproduced verbatim on purpose.
- Every Ovatu form uses a single **tick-to-agree** checkbox (no drawn signature).
  We capture name + date automatically and one agreement tick, to match.

### Still to capture (NOT invented — do not ship without them)
- **NAD Consent Form** (capture was cut off mid-form)
- **Forms 7–14** were never reached (the browser extraction hit its spend limit)

To add each remaining form: append a `ConsentForm` object to `CONSENT_FORMS` in
`src/lib/consent/forms.ts` and, if needed, extend `consentFormForService()` so the
relevant service maps to it.

## Service → form mapping

`consentFormForService(slug, name)` in `src/lib/consent/forms.ts` maps a booking's
service to a form by keyword, mirroring Ovatu's attachments:

- botox / anti-wrinkle / toxin / hyperhidrosis / migraine → **Botox**
- profhilo / skin booster / bio-remodelling → **Skin Booster**
- polynucleotide → **Polynucleotide**
- b12 / vitamin b → **B12**
- filler / lip / cheek / harmonyca / **cryopen** → **Dermal Filler**
- anything else → no form yet (pending the remaining captures)

## Going live (when ready — currently OFF)

1. **Create the table:** run `scripts/consent-submissions.sql` against the clinic
   Supabase project. Until then the staff view shows "no consent forms yet" and
   submissions return a clear "not configured" message (nothing crashes).
2. **Switch on the email link:** in `src/app/api/book/create/route.ts`, where the
   confirmation email is built, pass the consent URL — gated by a flag so it is
   easy to toggle:

   ```ts
   const consentUrl =
     process.env.CONSENT_FORMS_ENABLED === 'true' && consentFormForService(service.slug, service.name)
       ? `${SITE}/consent/${booking.manage_token}`
       : undefined
   const mail = bookingConfirmationEmail({ /* …existing… */, consentUrl })
   ```

   With `CONSENT_FORMS_ENABLED` unset, `bookingConfirmationEmail` produces the
   exact same email as today.

3. Smoke-test with a real booking token at `/consent/<token>` and confirm it
   lands under Assistant → Consent forms.
