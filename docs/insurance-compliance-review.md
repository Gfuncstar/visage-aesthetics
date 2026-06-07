# Insurance compliance review

A deep dive into the clinic's medical malpractice policy, what it covers, where the
live offering sits against it, and the new in-clinic tool that lets the team check a
treatment before it is added.

Prepared from: **Beazley Medical Malpractice Insurance (Aesthetic Wording), policy
W004432-24E**, named insured **Bernadette Parsons**, 17A Friars Lane, Braintree.

> This document is decision support, not legal or insurance advice. The policy wording
> always governs. For anything material, confirm with the broker (James Hallam, Mikey
> Emin, Mikey.Emin@jameshallam.co.uk) before acting.

---

## 1. The policy at a glance

| Item | Detail |
| --- | --- |
| Insurer | Beazley Insurance Dac |
| Policy number | W004432-24E |
| Cover basis | Claims made and reported |
| Period | 22/09/2024 to 21/09/2025 |
| Retroactive date | 14/03/2015 |
| Aggregate limit | GBP 5,000,000 |
| Each-claim limit (malpractice / PI / public liability) | GBP 5,000,000 |
| Standard deductible | GBP 250 each claim (Band A excess: GBP 0) |
| Jurisdiction | Great Britain, Northern Ireland, Isle of Man, Channel Islands |
| Bands purchased | **Band A only.** Bands B to E are nil income and not purchased |
| Declared income | Band A GBP 30,000; aesthetics must stay over 50% of total income |

Insuring agreements bought: Medical Malpractice, Professional Indemnity, Public/General
Liability, Loss of Documents, Breach of Confidentiality, Libel and Slander, Inquest
Costs, Licensing Body Investigation Costs, plus the cyber/privacy extensions. **Product
Liability is NOT bought.**

### Two warranties that sit above everything

1. **Aesthetic only.** The Statement of Fact is explicit: "this policy will only cover
   you for aesthetic activities. It will not cover you for any other clinical activity."
2. **Premium and fair presentation.** Premium must be paid on time, and any new activity
   or change to the declared treatments or income must be told to the broker *before* it
   starts (material alterations clause). Cover for an undeclared change is not guaranteed.

---

## 2. What the policy positively covers (Band A)

The Treatment and Deductible Endorsement lists the Band A treatments at GBP 0 excess.
The full list is encoded in `src/lib/assistant/insurance-policy.ts`. The ones that match
the clinic's offering include:

- Injectables including facial skin needling and mesotherapy
- Facial skin needling and non-invasive hand-held pen / applicator
- Facial topical application including chemical peels up to 50% (excluding skin cancer)
- Non-invasive freezing therapy (aesthetic) and benign skin blemish removal
- PRF / PRP for face, neck, scalp, shoulder, back, abdomen
- Microsclerotherapy / sclerotherapy
- Minor surgery (see the dedicated list)
- Prescribing services
- Weight-loss prescribed injectables, and oral Rybelsus only
- Skin consultations (excluding skin cancer)
- Phlebotomy and sample taking (no interpretation)

Each of these still has to satisfy the relevant endorsement conditions in section 4.

---

## 3. What is never covered (the traps)

These are the named exclusions most likely to catch a new treatment:

| Trap | Where it comes from |
| --- | --- |
| **Aqualyx in facial skin needling** | Facial Needling Exclusions endorsement |
| **Botulax and Devil Lip** (any use) | Injectables Exclusions / Prescribing Endorsement |
| **On-selling or passing injectables** to other practitioners | Injectables Exclusions |
| **Oral weight-loss drugs** except Rybelsus | Weight Loss Drugs Exclusion |
| **Diagnostic and interpretation work** | Diagnostic and Interpretation Exclusion |
| **Skin cancer** assessment / treatment | Band A lines all carve out skin cancer |
| **Genitalia** (laser, RF, ultrasound, vacuum, topical) | Band A line carve-outs |
| **Ablative laser** (only non-ablative is in Band A) | Treatment and Deductible Endorsement |
| **Under-18 aesthetic injectables / prescribing** | Prescribing Endorsement |
| **Communicable disease** transmission | Healthcare Communicable Disease Exclusion |
| **Non-aesthetic clinical work, 111/999, out-of-hours, midwifery** | Nurses endorsement / Statement of Fact |
| **Product Liability** (a faulty product itself) | Not purchased |

---

## 4. The endorsement conditions (what you must do)

These are the "covered if" conditions. The bot applies them automatically; the headlines:

- **Injectables for aesthetic purposes.** Face-to-face prescribing only (no remote, no
  repeat). Recorded face-to-face assessment and consent. Prescriber details and their own
  indemnity on file. Licensed-brand or CE marked product. Client over 18.
- **Laser / IPL / LED.** Comply with the Local Rules, conform to EU directives, keep the
  documentation in a Certificated Laser Protection Adviser's file. Non-ablative only.
- **Patch test.** Done and recorded at least 24 hours before treatment when it is standard
  practice or the manufacturer specifies it, and a trigger applies (new course, new area,
  new device/brand mid-course, changed history, changed parameters).
- **Teeth whitening.** By a hygienist or therapist only on a dentist's prescription.
- **Tattoo / micropigmentation.** Approved pigments in use 2+ years, over-18s, signed
  consent, licensed premises, no neck/nose-bridge/genitalia. SPMU, black henna/PPD and
  laser are excluded under this endorsement.
- **Body piercing.** Approved jewellery, age limits with parental consent, signed consent,
  licensed premises. Scarification, beading and sub-dermal implants excluded.
- **Records and equipment (all treatments).** Records kept 10 years (a minor: 10 years
  after they turn 18). Anything contacting bodily fluid or penetrating tissue handled,
  stored and sterilised per the manufacturer and Department of Health guidance.

---

## 5. Live offering reviewed against the policy

The website lists treatments in `src/lib/treatments.ts`; the note-taking / control system
defines treatment types in `src/lib/assistant/treatment-types.ts`. Cross-checked against
the policy:

### Clear, with conditions

- **Anti-Wrinkle Injections, Dermal Filler, Profhilo, HarmonyCa, Polynucleotides** map to
  the injectables line. Covered subject to the aesthetic-injectables conditions in
  section 4 (face-to-face prescribing, recorded consent, prescriber on file, licensed/CE
  product, over 18). The brand check matters: **Botulax and Devil Lip are excluded**, so
  any toxin or filler brand must be confirmed against that.
- **Micro-Needling** is in Band A. Watch the Aqualyx carve-out; patch test where required.
- **Vitamin B12 (IM)** maps to intramuscular injections in the Minor Surgery list and the
  injectables cover. It is a wellness rather than aesthetic activity, so it counts toward
  the "aesthetics over 50% of income" test rather than against it.
- **Hyperhidrosis and Migraines (botulinum toxin).** Hyperhidrosis sits comfortably in the
  aesthetic/medical injectable space. **Migraine prevention is a clinical indication**, and
  the policy is aesthetic-only; this one is worth a broker note to confirm it is in scope.
- **Men's Aesthetics** is the same treatments tailored to men. No separate concern beyond
  the underlying treatments, except it markets Aqualyx (see below).

### Flagged for attention

- **AQUALYX (fat dissolving).** The **Facial Needling Exclusions** endorsement excludes any
  claim involving facial skin needling using Aqualyx. Aqualyx is also promoted for facial
  areas in the marketing copy. Body fat dissolving by injection may still fall under the
  injectables cover, but the named-product exclusion and the facial use need broker
  confirmation. **Recommendation: confirm with the broker, and make sure the website and
  consent forms do not offer Aqualyx for facial skin needling.**

- **Map My Mole (consultant dermatologist mole review).** Reviewing and interpreting moles
  and lesions is **diagnostic and interpretation work, which is excluded**, and skin-cancer
  assessment is carved out of the skin-consultation line. Sample taking is allowed only with
  no interpretation. **Recommendation: confirm who carries the professional indemnity for
  the reviewing dermatologist (this is their clinical act, not an aesthetic act of the
  insured), and make sure the clinic's own policy is not being relied on for the diagnosis.**

- **CryoPen.** Maps to non-invasive freezing therapy and benign blemish removal in Band A.
  Keep strictly to benign lesions. Anything suspicious is skin-cancer / diagnostic work and
  is excluded.

### Note-taking system

`treatment-types.ts` covers anti-wrinkle, filler, skin booster, polynucleotides,
microneedling, chemical peel and consultation. All map to Band A. The compliance-relevant
fields the clinical audit already tracks (consent, batch number, dose, review date, product
expiry) line up well with the policy's consent, records and equipment conditions. No gap
found there; the audit agent and this tool are complementary.

---

## 6. The compliance bot

A dedicated assistant now lives in the staff back end at **Assistant → Insurance check**
(`/staff/assistant/compliance`).

- **What it does.** The team types in a new treatment or product (with optional detail on
  brand, body area, who performs it). The bot assesses it against the full policy and
  returns a verdict: covered, covered with conditions, not covered, or check with broker,
  plus the conditions to meet, the exclusions that apply, the standing requirements, and the
  endorsements it relied on.
- **How it is grounded.** The whole policy (schedule, insuring agreements and every
  endorsement) is encoded in `src/lib/assistant/insurance-policy.ts` and fed to the model as
  its knowledge base. It answers only from the wording, and flags anything material for the
  broker rather than guessing.
- **Model.** Claude Opus 4.8 with adaptive thinking and structured output, behind the
  existing PIN-gated staff auth. Needs `ANTHROPIC_API_KEY` set (the same key the other
  agents use).
- **Live audit.** The page also shows a deterministic, rule-based audit of the current
  treatment list so the flags in section 5 surface without an API call.

### Keeping it current

At each renewal, re-check the schedule and endorsements against `insurance-policy.ts` and
update anything that has changed (limits, bands purchased, new or removed endorsements,
period dates). The file is the single source of truth for the bot.
