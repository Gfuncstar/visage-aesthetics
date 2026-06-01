// Posting to Meta (Facebook Page feed) via the Graph API. No SDK dependency.
// Only active when the page credentials are set, so the social feed is pre-built
// and switches on the moment a Page ID and access token are added.
//
// Required env to switch on:
//   META_PAGE_ID
//   META_PAGE_ACCESS_TOKEN   (a long-lived Page access token)

const GRAPH = 'https://graph.facebook.com/v19.0'

export function metaConfigured(): boolean {
  return Boolean(process.env.META_PAGE_ID && process.env.META_PAGE_ACCESS_TOKEN)
}

/** Publish a post to the clinic's Facebook Page. Returns the post id. */
export async function postToFacebook(message: string, link?: string | null): Promise<{ ok: boolean; id?: string; error?: string }> {
  const pageId = process.env.META_PAGE_ID
  const token = process.env.META_PAGE_ACCESS_TOKEN
  if (!pageId || !token) return { ok: false, error: 'Meta is not connected.' }

  const form = new URLSearchParams()
  form.set('message', message)
  if (link) form.set('link', link)
  form.set('access_token', token)

  try {
    const res = await fetch(`${GRAPH}/${pageId}/feed`, { method: 'POST', body: form })
    const data = (await res.json().catch(() => ({}))) as { id?: string; error?: { message?: string } }
    if (!res.ok) return { ok: false, error: data.error?.message || `Meta error (${res.status})` }
    return { ok: true, id: data.id }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Post failed' }
  }
}
