// GBP currency and UK date formatting. All money is GBP; all dates UK format.

export function gbp(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

/** Plain number with two decimals, no symbol (for CSV cells). */
export function money2(amount: number): string {
  return (amount || 0).toFixed(2)
}

/** "31/05/2026" from an ISO date string (YYYY-MM-DD) or Date. */
export function ukDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return typeof value === 'string' ? value : ''
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/** "May 2026" label for a YYYY-MM month key. */
export function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  if (!y || !m) return monthKey
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  )
}

/** First and last day (inclusive) of a YYYY-MM month, as ISO date strings. */
export function monthBounds(monthKey: string): { start: string; end: string } {
  const [y, m] = monthKey.split('-').map(Number)
  const start = new Date(Date.UTC(y, m - 1, 1))
  const end = new Date(Date.UTC(y, m, 0))
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}

/** Current month as YYYY-MM. */
export function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7)
}

/** Recent month keys, newest first, e.g. last 6 months. */
export function recentMonthKeys(count: number): string[] {
  const out: string[] = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    out.push(d.toISOString().slice(0, 7))
  }
  return out
}
