// Ovatu API client (live revenue + client sync).
//
// Env to switch this on (set in Vercel):
//   OVATU_API_TOKEN   — the Ovatu API token / app key
//   OVATU_API_BASE    — API base URL (defaults to the Ovatu Next API)
//
// Ovatu's field names vary by account/version, so the mappers below are
// deliberately tolerant: they accept a range of likely property names and fall
// back gracefully. When the live API is wired and we see real payloads, the
// mappers can be tightened. Until then, the CSV import path covers the same need.

const TOKEN = process.env.OVATU_API_TOKEN
const BASE = (process.env.OVATU_API_BASE || 'https://api.ovatu.com/api/v1').replace(/\/$/, '')

export function ovatuConfigured(): boolean {
  return Boolean(TOKEN)
}

export type OvatuClient = { ovatu_id: string; first_name: string; last_name: string; email: string | null; phone: string | null }
export type OvatuAppointment = {
  ovatu_id: string
  client_name: string
  date: string
  service_name: string
  price: number
  status: 'completed' | 'cancelled' | 'no_show' | 'booked'
}

async function get<T>(path: string, query: Record<string, string> = {}): Promise<T> {
  if (!TOKEN) throw new Error('Ovatu API not configured')
  const qs = new URLSearchParams(query).toString()
  const res = await fetch(`${BASE}/${path.replace(/^\//, '')}${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Ovatu ${path} failed (${res.status}): ${(await res.text()).slice(0, 200)}`)
  return (await res.json()) as T
}

function pick<T>(obj: Record<string, unknown>, keys: string[], fallback: T): T {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k] as T
  }
  return fallback
}

function arrayFrom(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[]
  if (payload && typeof payload === 'object') {
    const o = payload as Record<string, unknown>
    for (const key of ['data', 'results', 'items', 'customers', 'appointments', 'bookings']) {
      if (Array.isArray(o[key])) return o[key] as Record<string, unknown>[]
    }
  }
  return []
}

function isoDate(v: unknown): string {
  const s = String(v ?? '')
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10)
}

function mapStatus(v: unknown): OvatuAppointment['status'] {
  const s = String(v ?? '').toLowerCase()
  if (/cancel/.test(s)) return 'cancelled'
  if (/no.?show/.test(s)) return 'no_show'
  if (/complet|attend|finish|checked.?out|paid/.test(s)) return 'completed'
  return 'booked'
}

export async function fetchClients(): Promise<OvatuClient[]> {
  const raw = arrayFrom(await get('customers'))
  return raw.map((c) => {
    const name = pick<string>(c, ['name', 'fullName', 'displayName'], '')
    const [fn, ...rest] = name.split(' ')
    return {
      ovatu_id: String(pick<string | number>(c, ['id', 'uid', 'customerId'], '')),
      first_name: pick<string>(c, ['firstName', 'first_name', 'givenName'], fn || ''),
      last_name: pick<string>(c, ['lastName', 'last_name', 'familyName'], rest.join(' ')),
      email: pick<string | null>(c, ['email', 'emailAddress'], null),
      phone: pick<string | null>(c, ['phone', 'mobile', 'phoneNumber'], null),
    }
  }).filter((c) => c.ovatu_id)
}

export async function fetchAppointments(sinceIso: string): Promise<OvatuAppointment[]> {
  // Try a couple of common date-range param spellings.
  const raw = arrayFrom(
    await get('appointments', { from: sinceIso, dateFrom: sinceIso, startDate: sinceIso }),
  )
  return raw.map((a) => {
    const client = (a.customer ?? a.client ?? {}) as Record<string, unknown>
    const clientName =
      pick<string>(a, ['customerName', 'clientName'], '') ||
      pick<string>(client, ['name', 'fullName'], '')
    const service = (a.service ?? {}) as Record<string, unknown>
    return {
      ovatu_id: String(pick<string | number>(a, ['id', 'uid', 'appointmentId', 'bookingId'], '')),
      client_name: clientName,
      date: isoDate(pick(a, ['date', 'startDate', 'start', 'startTime', 'datetime'], '')),
      service_name:
        pick<string>(a, ['serviceName', 'service_name', 'title'], '') ||
        pick<string>(service, ['name', 'title'], ''),
      price: Number(pick<number>(a, ['price', 'total', 'amount', 'cost'], 0)) || 0,
      status: mapStatus(pick(a, ['status', 'state'], '')),
    }
  }).filter((a) => a.ovatu_id)
}
