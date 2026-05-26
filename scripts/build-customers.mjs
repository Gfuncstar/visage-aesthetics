#!/usr/bin/env node
// Refresh src/lib/customers.ts from a Cliniko CSV export.
// Usage:  node scripts/build-customers.mjs path/to/customers.csv
// Output: src/lib/customers.ts (deduped, no bounced, no unsubscribed)

import fs from 'node:fs'
import path from 'node:path'

const input = process.argv[2]
if (!input) {
  console.error('Usage: node scripts/build-customers.mjs <path-to-csv>')
  process.exit(1)
}

const text = fs.readFileSync(input, 'utf8')

function parseCSV(src) {
  const rows = []
  let row = [], cell = '', inQuotes = false
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (inQuotes) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; continue }
      if (c === '"') { inQuotes = false; continue }
      cell += c
      continue
    }
    if (c === '"') { inQuotes = true; continue }
    if (c === ',') { row.push(cell); cell = ''; continue }
    if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; continue }
    if (c === '\r') continue
    cell += c
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows
}

const rows = parseCSV(text)
const headers = rows[0]
const records = rows.slice(1).filter((r) => r.length === headers.length)
const idx = (name) => headers.indexOf(name)
const I = {
  firstName: idx('firstName'),
  lastName: idx('lastName'),
  email: idx('email'),
  emailBounced: idx('emailBounced'),
  unsub: idx('massEmailUnsubscribed'),
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const seen = new Set()
const valid = []
const skipped = { noEmail: 0, bounced: 0, unsubscribed: 0, duplicate: 0, invalid: 0 }

for (const r of records) {
  const email = (r[I.email] || '').trim().toLowerCase()
  if (!email) { skipped.noEmail++; continue }
  if (!EMAIL_RE.test(email)) { skipped.invalid++; continue }
  if ((r[I.emailBounced] || '').toLowerCase() === 'true') { skipped.bounced++; continue }
  if ((r[I.unsub] || '').toLowerCase() === 'true') { skipped.unsubscribed++; continue }
  if (seen.has(email)) { skipped.duplicate++; continue }
  seen.add(email)
  valid.push({
    email,
    firstName: (r[I.firstName] || '').trim(),
    lastName: (r[I.lastName] || '').trim(),
  })
}

valid.sort((a, b) => a.email.localeCompare(b.email))

const out = `// Customer mailing list — sourced from Cliniko export
// Filtered: deduplicated, no bounced addresses, no unsubscribed contacts.
// To refresh: re-export from Cliniko, run \`node scripts/build-customers.mjs <path-to-csv>\`.

export type Customer = {
  email: string
  firstName: string
  lastName: string
}

export const customers: Customer[] = ${JSON.stringify(valid, null, 2)}

export function customerEmails(): string[] {
  return customers.map((c) => c.email)
}
`

const dest = path.join(process.cwd(), 'src/lib/customers.ts')
fs.writeFileSync(dest, out)
console.log(`Wrote ${valid.length} customers → ${dest}`)
console.log('Skipped:', skipped)
