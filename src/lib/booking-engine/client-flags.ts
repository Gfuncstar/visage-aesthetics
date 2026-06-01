// Per-client booking flags, matched at booking time by name, email or phone.
//   blocked         -> the client silently sees no availability (fully booked)
//   requiresDeposit -> the client must pay a deposit to confirm

import { select } from '../assistant/db'

export type ClientFlags = { blocked: boolean; requiresDeposit: boolean }

export function normName(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}
export function normPhone(s: string): string {
  return (s ?? '').replace(/\D/g, '')
}

type Row = { blocked: boolean; requires_deposit: boolean }

/** Look up flags for a client identity. Any matching row contributes its flags. */
export async function lookupClientFlags(identity: {
  name?: string | null
  email?: string | null
  phone?: string | null
}): Promise<ClientFlags> {
  const name = identity.name ? normName(identity.name) : ''
  const email = identity.email ? identity.email.trim().toLowerCase() : ''
  const phone = normPhone(identity.phone ?? '')

  const queries: Promise<Row[]>[] = []
  if (name) queries.push(select<Row>('client_flags', { name_normalised: `eq.${name}`, limit: 1 }).catch(() => []))
  if (email) queries.push(select<Row>('client_flags', { email: `eq.${email}`, limit: 5 }).catch(() => []))
  if (phone) queries.push(select<Row>('client_flags', { phone: `eq.${phone}`, limit: 5 }).catch(() => []))
  if (queries.length === 0) return { blocked: false, requiresDeposit: false }

  const rows = (await Promise.all(queries)).flat()
  return {
    blocked: rows.some((r) => r.blocked),
    requiresDeposit: rows.some((r) => r.requires_deposit),
  }
}
