/**
 * IndexNow ping — tells Bing / Yandex / other IndexNow-supporting search
 * engines that the site has changed, so they recrawl within minutes
 * instead of days.
 *
 * Reads the live sitemap.xml, extracts every <loc>, POSTs the list to
 * the IndexNow API. Runs from `npm run indexnow` and from `postbuild`
 * so every Vercel deploy automatically pings the index.
 *
 * IndexNow ignores duplicate / unchanged URLs gracefully — there's no
 * harm in submitting the full sitemap on every deploy.
 *
 * Spec: https://www.indexnow.org/documentation
 */

const HOST = 'www.vaclinic.co.uk'
const KEY = 'c3f7a9b1d2e84f6a85d9c1e2f3a4b5c6'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const SITEMAP_URL = `https://${HOST}/sitemap.xml`
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'

async function fetchSitemapUrls() {
  const res = await fetch(SITEMAP_URL, { headers: { 'User-Agent': 'visage-aesthetics-indexnow/1.0' } })
  if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`)
  const xml = await res.text()
  const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/g)
  return Array.from(matches, (m) => m[1].trim()).filter((u) => u.includes(HOST))
}

async function pingIndexNow(urlList) {
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  })
  return { status: res.status, ok: res.ok }
}

async function main() {
  try {
    const urls = await fetchSitemapUrls()
    if (urls.length === 0) {
      console.log('[indexnow] no URLs in sitemap — skipping')
      return
    }
    // IndexNow accepts up to 10,000 URLs per request; we have ~70.
    const result = await pingIndexNow(urls)
    if (result.ok || result.status === 202) {
      console.log(`[indexnow] pinged ${urls.length} URLs (status ${result.status})`)
    } else {
      console.warn(`[indexnow] non-ok response: ${result.status}`)
    }
  } catch (err) {
    // Never fail the build over an IndexNow hiccup.
    console.warn('[indexnow] ping failed (non-fatal):', err?.message || err)
  }
}

main()
