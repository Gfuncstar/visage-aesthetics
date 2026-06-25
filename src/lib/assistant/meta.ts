// Posting to Meta (Facebook Page feed + Instagram) via the Graph API. No SDK
// dependency. Only active when the relevant credentials are set, so the feature
// is pre-built and switches on the moment the tokens are added.
//
// Required env to switch on Facebook:
//   META_PAGE_ID
//   META_PAGE_ACCESS_TOKEN   (a long-lived Page access token)
//
// Required env to switch on Instagram (in addition to the Page token above):
//   META_IG_USER_ID          (the Instagram Business account id linked to the Page)

const GRAPH = 'https://graph.facebook.com/v19.0'

export function metaConfigured(): boolean {
  return Boolean(process.env.META_PAGE_ID && process.env.META_PAGE_ACCESS_TOKEN)
}

export function instagramConfigured(): boolean {
  return Boolean(process.env.META_IG_USER_ID && process.env.META_PAGE_ACCESS_TOKEN)
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

/**
 * Publish a single image to the clinic's Instagram Business account. Two-step
 * Graph API flow: create a media container with a publicly reachable image_url,
 * then publish it. `imageUrl` MUST be publicly fetchable by Meta's servers.
 * Returns the published media id.
 */
export async function postToInstagram(caption: string, imageUrl: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const igUserId = process.env.META_IG_USER_ID
  const token = process.env.META_PAGE_ACCESS_TOKEN
  if (!igUserId || !token) return { ok: false, error: 'Instagram is not connected.' }

  try {
    // 1) Create the media container.
    const create = new URLSearchParams()
    create.set('image_url', imageUrl)
    create.set('caption', caption)
    create.set('access_token', token)
    const cRes = await fetch(`${GRAPH}/${igUserId}/media`, { method: 'POST', body: create })
    const cData = (await cRes.json().catch(() => ({}))) as { id?: string; error?: { message?: string } }
    if (!cRes.ok || !cData.id) return { ok: false, error: cData.error?.message || `Instagram error (${cRes.status})` }

    // 2) Publish the container.
    const publish = new URLSearchParams()
    publish.set('creation_id', cData.id)
    publish.set('access_token', token)
    const pRes = await fetch(`${GRAPH}/${igUserId}/media_publish`, { method: 'POST', body: publish })
    const pData = (await pRes.json().catch(() => ({}))) as { id?: string; error?: { message?: string } }
    if (!pRes.ok || !pData.id) return { ok: false, error: pData.error?.message || `Instagram publish error (${pRes.status})` }

    return { ok: true, id: pData.id }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Instagram post failed' }
  }
}
