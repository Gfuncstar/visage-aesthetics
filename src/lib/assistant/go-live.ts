// Single source of truth for the clinic system "go-live" date.
//
// When the clinic switches to a new system, the live staff feeds — write-ups
// needed, consent chasing, the stock "ordered" state, and any future ones —
// should start fresh from the moment of the switch, NOT resurface the imported
// back-history as a giant to-do list. Every such feed measures "since" this
// date, so the day you cut over, the slate is clean.
//
// To reset everything at a switch, set ONE environment variable at cut-over:
//
//     GO_LIVE_DATE=YYYY-MM-DD
//
// That single value resets all the live feeds together. The per-feature
// overrides (WRITEUP_OVERDUE_SINCE, CONSENT_ENFORCE_FROM) still exist as an
// escape hatch for a one-off, but normally leave them unset so GO_LIVE_DATE
// governs the lot. See docs/GO_LIVE_RESET.md.

// Current production go-live. Until GO_LIVE_DATE is set, behaviour is unchanged.
const DEFAULT_GO_LIVE = '2026-06-05'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** The go-live date as an ISO date (YYYY-MM-DD). Falls back if unset/invalid. */
export function goLiveDate(): string {
  const v = process.env.GO_LIVE_DATE
  return v && DATE_RE.test(v) ? v : DEFAULT_GO_LIVE
}

/** The go-live moment as an ISO timestamp (start of that day, UTC). */
export function goLiveTimestamp(): string {
  return `${goLiveDate()}T00:00:00Z`
}
