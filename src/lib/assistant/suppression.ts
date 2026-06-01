// Outbound suppression: clients who must never receive any correspondence.
//
// Every send path (Broadcasts, the Rebooker email / WhatsApp / copy) checks
// this before contacting anyone. The list lives in the do_not_contact table so
// it survives mailing-list re-imports and can be extended without a deploy, but
// a small hardcoded floor guarantees key suppressions hold even if the database
// read ever fails.

import { select } from './db'

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

// Hard floor: always suppressed, regardless of the database.
const STATIC_NAMES = new Set<string>(['rachael leedham'])
const STATIC_EMAILS = new Set<string>(['rachael2276@hotmail.com'])

export type SuppressionSets = { names: Set<string>; emails: Set<string> }

let cache: { sets: SuppressionSets; at: number } | null = null
const TTL_MS = 60_000

/** Load the suppression sets (static floor merged with the database list). */
export async function loadSuppression(): Promise<SuppressionSets> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.sets
  const names = new Set(STATIC_NAMES)
  const emails = new Set(STATIC_EMAILS)
  try {
    const rows = await select<{ name_normalised: string | null; full_name: string | null; email: string | null }>(
      'do_not_contact',
      { limit: 2000 },
    )
    for (const r of rows) {
      if (r.name_normalised) names.add(norm(r.name_normalised))
      else if (r.full_name) names.add(norm(r.full_name))
      if (r.email) emails.add(r.email.trim().toLowerCase())
    }
  } catch {
    /* database optional here; the static floor still applies */
  }
  cache = { sets: { names, emails }, at: Date.now() }
  return cache.sets
}

/** True if either the name or the email is on the suppression list. */
export async function isSuppressed(name?: string | null, email?: string | null): Promise<boolean> {
  const { names, emails } = await loadSuppression()
  if (name && names.has(norm(name))) return true
  if (email && emails.has(email.trim().toLowerCase())) return true
  return false
}

/** Drop any suppressed addresses from a list of recipient emails. */
export async function filterSuppressedEmails(targets: string[]): Promise<string[]> {
  const { emails } = await loadSuppression()
  return targets.filter((t) => !emails.has(t.trim().toLowerCase()))
}
