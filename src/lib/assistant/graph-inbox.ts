// Microsoft Graph client for monitoring the clinic order inbox (Outlook / M365).
//
// Uses app-only (client-credentials) auth, so it runs unattended on a schedule.
// Required env (set in Vercel) to switch this on:
//   MS_GRAPH_TENANT_ID, MS_GRAPH_CLIENT_ID, MS_GRAPH_CLIENT_SECRET
//   CLINIC_INBOX_USER   (the mailbox UPN or object id, e.g. orders@vaclinic.co.uk)
//   CLINIC_INBOX_FOLDER (optional mail folder, defaults to Inbox)
//
// The app registration needs the application permission Mail.Read (admin
// consented). Nothing here sends mail; it only reads.

const TENANT = process.env.MS_GRAPH_TENANT_ID
const CLIENT_ID = process.env.MS_GRAPH_CLIENT_ID
const CLIENT_SECRET = process.env.MS_GRAPH_CLIENT_SECRET
const MAILBOX = process.env.CLINIC_INBOX_USER
const FOLDER = process.env.CLINIC_INBOX_FOLDER || 'Inbox'

export function graphConfigured(): boolean {
  return Boolean(TENANT && CLIENT_ID && CLIENT_SECRET && MAILBOX)
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

async function token(): Promise<string> {
  const res = await fetch(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Graph token failed (${res.status}): ${(await res.text()).slice(0, 200)}`)
  const j = (await res.json()) as { access_token?: string }
  if (!j.access_token) throw new Error('Graph token missing from response')
  return j.access_token
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

/** Fetch recent messages from the clinic inbox, newest first. */
export async function fetchRecentMessages(opts: { sinceIso?: string; top?: number } = {}): Promise<GraphMessage[]> {
  if (!graphConfigured()) throw new Error('Microsoft Graph is not configured.')
  const t = await token()
  const top = Math.min(opts.top ?? 25, 50)

  const params = new URLSearchParams({
    $top: String(top),
    $orderby: 'receivedDateTime desc',
    $select: 'id,internetMessageId,subject,from,receivedDateTime,body,bodyPreview',
  })
  if (opts.sinceIso) {
    params.set('$filter', `receivedDateTime ge ${opts.sinceIso}`)
  }

  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(MAILBOX!)}/mailFolders/${encodeURIComponent(FOLDER)}/messages?${params}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${t}`, Prefer: 'outlook.body-content-type="html"' },
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
