// Microsoft Graph client for the clinic order inbox, using DELEGATED OAuth so it
// works with a personal Outlook.com mailbox (e.g. ber.parsons@outlook.com) as
// well as work/school accounts. App-only/client-credentials does NOT work for
// personal Microsoft accounts, which is why we use the authorisation-code flow:
// the owner signs in once and consents, we store the refresh token, and the
// poller reads the inbox unattended from then on.
//
// Required env (set in Vercel) to switch this on:
//   MS_GRAPH_CLIENT_ID, MS_GRAPH_CLIENT_SECRET   (Azure app registration that
//      allows "personal Microsoft accounts"; redirect URI = <site>/api/staff/
//      assistant/inbox/callback; delegated permissions Mail.Read + offline_access)
//   ASSISTANT_BASE_URL (optional) — overrides the redirect origin if needed.
//
// The refresh token is held in the RLS-locked inbox_tokens table.

import { select, insertMany } from './db'

const CLIENT_ID = process.env.MS_GRAPH_CLIENT_ID
const CLIENT_SECRET = process.env.MS_GRAPH_CLIENT_SECRET
const FOLDER = process.env.CLINIC_INBOX_FOLDER || 'Inbox'

// /common accepts both personal and work/school accounts.
const AUTHORITY = 'https://login.microsoftonline.com/common/oauth2/v2.0'
const SCOPES = 'openid offline_access Mail.Read'
const PROVIDER = 'microsoft'

/** Whether the Azure app credentials are present (does not check the token). */
export function graphConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET)
}

export function redirectUri(origin: string): string {
  const base = (process.env.ASSISTANT_BASE_URL || origin).replace(/\/$/, '')
  return `${base}/api/staff/assistant/inbox/callback`
}

export function buildAuthUrl(origin: string, state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID!,
    response_type: 'code',
    redirect_uri: redirectUri(origin),
    response_mode: 'query',
    scope: SCOPES,
    state,
  })
  return `${AUTHORITY}/authorize?${params}`
}

type TokenResponse = {
  access_token?: string
  refresh_token?: string
  scope?: string
  id_token?: string
  error_description?: string
}

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(`${AUTHORITY}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID!, client_secret: CLIENT_SECRET!, ...body }),
    cache: 'no-store',
  })
  const json = (await res.json()) as TokenResponse
  if (!res.ok || !json.access_token) {
    throw new Error(`Graph token error: ${json.error_description || res.status}`)
  }
  return json
}

function accountFromIdToken(idToken?: string): string | null {
  if (!idToken) return null
  try {
    const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString('utf8'))
    return payload.preferred_username || payload.email || payload.upn || null
  } catch {
    return null
  }
}

/** Exchange the auth code for tokens and persist the refresh token. */
export async function exchangeCode(code: string, origin: string): Promise<{ account: string | null }> {
  const tokens = await tokenRequest({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri(origin),
    scope: SCOPES,
  })
  const account = accountFromIdToken(tokens.id_token)
  await storeRefreshToken(tokens.refresh_token!, account, tokens.scope)
  return { account }
}

async function storeRefreshToken(refresh: string, account: string | null, scope?: string): Promise<void> {
  await insertMany(
    'inbox_tokens',
    [{ provider: PROVIDER, account, refresh_token: refresh, scope: scope ?? null, updated_at: new Date().toISOString() }],
    { onConflict: 'provider' },
  )
}

type StoredToken = { provider: string; account: string | null; refresh_token: string }

export async function inboxConnection(): Promise<{ connected: boolean; account: string | null }> {
  if (!graphConfigured()) return { connected: false, account: null }
  try {
    const rows = await select<StoredToken>('inbox_tokens', { provider: `eq.${PROVIDER}`, limit: 1 })
    if (rows.length === 0) return { connected: false, account: null }
    return { connected: true, account: rows[0].account }
  } catch {
    return { connected: false, account: null }
  }
}

/** Get a fresh access token from the stored refresh token, rotating it if Microsoft returns a new one. */
async function accessToken(): Promise<string> {
  const rows = await select<StoredToken>('inbox_tokens', { provider: `eq.${PROVIDER}`, limit: 1 })
  if (rows.length === 0) throw new Error('Inbox is not connected. Connect it from Orders first.')
  const tokens = await tokenRequest({
    grant_type: 'refresh_token',
    refresh_token: rows[0].refresh_token,
    scope: SCOPES,
  })
  if (tokens.refresh_token && tokens.refresh_token !== rows[0].refresh_token) {
    await storeRefreshToken(tokens.refresh_token, rows[0].account, tokens.scope)
  }
  return tokens.access_token!
}

export type GraphMessage = {
  id: string
  internetMessageId: string | null
  from: string
  subject: string
  bodyHtml: string
  bodyText: string
  receivedDateTime: string
}

type RawMessage = {
  id: string
  internetMessageId?: string
  subject?: string
  receivedDateTime?: string
  from?: { emailAddress?: { address?: string; name?: string } }
  body?: { contentType?: string; content?: string }
  bodyPreview?: string
}

/** Fetch recent messages from the connected inbox, newest first. */
export async function fetchRecentMessages(opts: { sinceIso?: string; top?: number } = {}): Promise<GraphMessage[]> {
  const token = await accessToken()
  const top = Math.min(opts.top ?? 25, 50)
  const params = new URLSearchParams({
    $top: String(top),
    $orderby: 'receivedDateTime desc',
    $select: 'id,internetMessageId,subject,from,receivedDateTime,body,bodyPreview',
  })
  if (opts.sinceIso) params.set('$filter', `receivedDateTime ge ${opts.sinceIso}`)

  const url = `https://graph.microsoft.com/v1.0/me/mailFolders/${encodeURIComponent(FOLDER)}/messages?${params}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Prefer: 'outlook.body-content-type="html"' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Graph messages failed (${res.status}): ${(await res.text()).slice(0, 200)}`)
  const j = (await res.json()) as { value?: RawMessage[] }

  return (j.value ?? []).map((m) => {
    const isHtml = (m.body?.contentType ?? '').toLowerCase() === 'html'
    const content = m.body?.content ?? ''
    return {
      id: m.id,
      internetMessageId: m.internetMessageId ?? null,
      from: m.from?.emailAddress?.address ?? m.from?.emailAddress?.name ?? '',
      subject: m.subject ?? '',
      bodyHtml: isHtml ? content : '',
      bodyText: isHtml ? '' : content || m.bodyPreview || '',
      receivedDateTime: m.receivedDateTime ?? new Date().toISOString(),
    }
  })
}

/** Heuristic: does this look like a supplier order / invoice email worth parsing? */
export function looksLikeOrder(subject: string, from: string, body: string): boolean {
  const hay = `${subject} ${from} ${body.slice(0, 400)}`.toLowerCase()
  return /order|invoice|dispatch|despatch|receipt|purchase|shipment|your purchase|payment received/.test(hay)
}
