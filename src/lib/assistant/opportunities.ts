// Shared types + helpers for the visibility bot (awards + press scouting).
//
// The scout (scripts/scout-opportunities.ts) finds free-to-enter awards and
// relevant press / journalist opportunities, drafts an entry or pitch in
// Bernadette's voice, and stores them here for review. Nothing is ever
// submitted automatically: every row lands as 'new' and a human approves it.

export type OpportunityKind = 'award' | 'press'

export type OpportunityStatus = 'new' | 'shortlisted' | 'submitted' | 'dismissed'

export type Opportunity = {
  id: string
  kind: OpportunityKind
  title: string
  organisation: string | null
  url: string | null
  summary: string | null
  deadline: string | null // ISO date
  cost_note: string | null
  fit_reason: string | null
  draft: string | null
  status: OpportunityStatus
  fingerprint: string | null
  created_at: string
  updated_at: string
}

/**
 * A concise, true profile of the clinic. The scout passes this to the model so
 * it can judge fit and draft credible entries / pitches. Keep it factual: every
 * claim here is verifiable and already public on the site.
 */
export const CLINIC_PROFILE = `Visage Aesthetics is a private, nurse-led aesthetics clinic in Braintree, Essex (East of England).
Lead practitioner and founder: Bernadette Tobin, Registered General Nurse (NMC PIN 05G1755E), MSc Advanced Practice (Level 7), 20+ years clinical experience.
Awards held: Best Non-Surgical Aesthetics Clinic 2026, Essex (Health, Beauty & Wellness Awards / LUX Life). Educator of the Year 2026 nominee.
Positioning: medically-led, conservative, high clinical standards; complements (does not replace) regulated care; honest about an under-regulated industry.
Treatments: anti-wrinkle injections, dermal filler, Profhilo, HarmonyCa, microneedling, Aqualyx, CryoPen, hyperhidrosis and migraine treatment, vitamin B12, men's aesthetics.
Small independent business; single registered practitioner; not a chain.`

/**
 * Build a stable dedupe key so the same award / outlet is not re-added on every
 * run. Normalises case and punctuation across kind + title + organisation.
 */
export function fingerprint(kind: OpportunityKind, title: string, organisation: string | null): string {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .slice(0, 120)
  return `${kind}:${norm(title)}:${norm(organisation ?? '')}`.replace(/\s+/g, '-')
}
