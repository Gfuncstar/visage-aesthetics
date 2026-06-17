// Durable "I've handled this another way" dismissals for the write-up nudges.
// The overdue / to-write lists are re-derived from the diary every load, so a
// dismissal has to be persisted server-side (not just in the browser) to stay
// gone across app launches and devices.

import { select, insertMany } from './db'

/** One key per client per visit day — matches end-of-day's visitKey(). */
export function dismissalKey(name: string, date: string): string {
  return `${date}|${name.trim().toLowerCase()}`
}

/** All dismissed visit keys. Resilient: returns empty on any read failure. */
export async function loadDismissedKeys(): Promise<Set<string>> {
  try {
    const rows = await select<{ visit_key: string }>('writeup_dismissals', {
      select: 'visit_key',
      limit: 2000,
    })
    return new Set(rows.map((r) => r.visit_key))
  } catch {
    return new Set()
  }
}

/** Mark a visit's write-up reminder as dismissed. Idempotent (upsert on key). */
export async function recordDismissal(name: string, date: string): Promise<void> {
  await insertMany(
    'writeup_dismissals',
    [{ visit_key: dismissalKey(name, date), client_name: name.trim(), visit_date: date }],
    { onConflict: 'visit_key' },
  )
}
