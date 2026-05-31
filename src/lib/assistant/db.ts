// Server-side data access for the Assistant section.
//
// The clinic's special-category health data lives in a dedicated Supabase
// project. Row Level Security is enabled with NO policies, so the public
// anon/publishable key can read nothing. All access goes through this module
// using the service-role key (which bypasses RLS) and only ever runs inside
// PIN-gated server route handlers.
//
// This is a thin, dependency-free wrapper over PostgREST (the same "fetch a
// configured external service" shape the rest of the back end already uses,
// e.g. the patient-notes sheet webhook). If the env vars are not set, the
// Assistant data features degrade gracefully rather than crash — matching how
// broadcasts/notes behave when their own keys are missing.

const URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export function assistantConfigured(): boolean {
  return Boolean(URL && SERVICE_KEY)
}

export class NotConfiguredError extends Error {
  constructor() {
    super('The clinic database is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).')
    this.name = 'NotConfiguredError'
  }
}

function base(): { url: string; key: string } {
  if (!URL || !SERVICE_KEY) throw new NotConfiguredError()
  return { url: URL.replace(/\/$/, ''), key: SERVICE_KEY }
}

type Query = Record<string, string | number | boolean | undefined>

function qs(params: Query): string {
  const parts: string[] = []
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
  }
  return parts.length ? `?${parts.join('&')}` : ''
}

async function rest<T>(
  table: string,
  init: RequestInit & { query?: Query } = {},
): Promise<T> {
  const { url, key } = base()
  const { query, headers, ...rest } = init
  const res = await fetch(`${url}/rest/v1/${table}${qs(query ?? {})}`, {
    ...rest,
    cache: 'no-store',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Database error (${res.status}): ${text.slice(0, 300)}`)
  }
  return (text ? JSON.parse(text) : null) as T
}

/** SELECT rows. `query` accepts PostgREST filters, e.g. { date: 'gte.2026-01-01', order: 'date.desc' }. */
export function select<T>(table: string, query: Query = {}): Promise<T[]> {
  return rest<T[]>(table, { method: 'GET', query: { select: '*', ...query } })
}

/** INSERT one row and return it. */
export async function insert<T>(table: string, row: Record<string, unknown>): Promise<T> {
  const out = await rest<T[]>(table, {
    method: 'POST',
    body: JSON.stringify(row),
    headers: { Prefer: 'return=representation' },
  })
  return out[0]
}

/**
 * INSERT many rows, returning the inserted set. Pass `onConflict` (a unique
 * column) to upsert instead of insert — used by the Ovatu sync to merge on
 * `ovatu_id` so it is safe to run repeatedly.
 */
export function insertMany<T>(
  table: string,
  rows: Record<string, unknown>[],
  opts: { onConflict?: string } = {},
): Promise<T[]> {
  if (rows.length === 0) return Promise.resolve([] as T[])
  const query: Query = {}
  let prefer = 'return=representation'
  if (opts.onConflict) {
    query.on_conflict = opts.onConflict
    prefer += ',resolution=merge-duplicates'
  }
  return rest<T[]>(table, {
    method: 'POST',
    query,
    body: JSON.stringify(rows),
    headers: { Prefer: prefer },
  })
}

/** UPDATE rows matching `match` (exact equality on each key). */
export async function update<T>(
  table: string,
  match: Record<string, string>,
  patch: Record<string, unknown>,
): Promise<T[]> {
  const query: Query = {}
  for (const [k, v] of Object.entries(match)) query[k] = `eq.${v}`
  return rest<T[]>(table, {
    method: 'PATCH',
    query,
    body: JSON.stringify(patch),
    headers: { Prefer: 'return=representation' },
  })
}

/** DELETE rows matching `match`. */
export async function remove(table: string, match: Record<string, string>): Promise<void> {
  const query: Query = {}
  for (const [k, v] of Object.entries(match)) query[k] = `eq.${v}`
  await rest<unknown>(table, { method: 'DELETE', query })
}

/** Fire-and-forget audit entry. Never throws into the caller's path. */
export async function audit(
  action: string,
  entity: string,
  entityId?: string,
  detail?: Record<string, unknown>,
): Promise<void> {
  try {
    await insert('audit_log', {
      action,
      entity,
      entity_id: entityId ?? null,
      detail: detail ?? null,
    })
  } catch (err) {
    console.error('[assistant] audit log failed', err)
  }
}
