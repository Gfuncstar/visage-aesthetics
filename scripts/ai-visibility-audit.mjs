/**
 * AI visibility watchdog — the daily agent for the AI answer layer.
 *
 * Runs every day from .github/workflows/ai-visibility-daily.yml. Two jobs:
 *
 *  1. WATCHDOG (read-only, against the live site). Confirms the things that
 *     make Visage easy for AI engines (ChatGPT, Claude, Perplexity, Gemini)
 *     to find and cite are still intact in production:
 *       - /llms.txt serves as plain text and still carries the key sections
 *         (summary, contact NAP, treatments)
 *       - robots.txt still ALLOWS the AI crawlers (a bad deploy could block them)
 *       - sitemap.xml still serves a healthy number of URLs
 *       - the homepage still emits Organization schema WITH the star rating
 *         and the sameAs entity links
 *     Any failure here is a regression in production — the workflow opens a
 *     GitHub issue so Giles is alerted. There is nothing to auto-fix in the
 *     repo (the code is fine; the live deploy regressed).
 *
 *  2. REVIEW SYNC (needs GOOGLE_PLACE_ID + GOOGLE_PLACES_API_KEY). The live
 *     rating/reviews already update automatically at runtime via ISR once the
 *     API is wired. This step keeps the committed *fallback* (the safety net
 *     used if the API call ever fails) in sync with the live count, by patching
 *     src/lib/google-reviews.ts when the number drifts. Deterministic and safe
 *     — it only ever changes two numbers. Curating WHICH reviews to feature in
 *     src/lib/reviews.ts stays an editorial task (see AGENTS.md), not this job.
 *
 * Pure Node (global fetch on Node 20) — no dependencies.
 *
 * Exit code is always 0; the workflow reads the GITHUB_OUTPUT flags
 * (`synced`, `regressions`) to decide whether to commit and/or alert.
 */

import { readFileSync, writeFileSync, appendFileSync } from 'node:fs'

const SITE = process.env.SITE_URL || 'https://www.vaclinic.co.uk'
const REVIEWS_FILE = 'src/lib/google-reviews.ts'

// The crawlers that feed AI recommendations. If any of these is blocked, the
// site stops being eligible for citation in that engine's answers.
const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-Web', 'Claude-User',
  'PerplexityBot', 'Google-Extended', 'Bingbot',
]

// Sections the llms.txt directory must always contain.
const LLMS_MARKERS = ['# Visage Aesthetics', '## Contact', '## Treatments', '395246', '## Locations']

// Entity links that should appear in the homepage Organization schema.
const SAMEAS_MARKERS = [
  'instagram.com/visageaestheticclinic',
  'google.com/maps?cid=',
  'lux-life.digital/winners/vaclinic',
]

const findings = [] // { level: 'ok' | 'regression', name, detail }
const ok = (name, detail) => findings.push({ level: 'ok', name, detail })
const fail = (name, detail) => findings.push({ level: 'regression', name, detail })

async function getText(path) {
  const res = await fetch(SITE + path, { headers: { 'User-Agent': 'visage-ai-visibility/1.0' } })
  return { status: res.status, ct: res.headers.get('content-type') || '', body: await res.text() }
}

// --- 1. Watchdog -----------------------------------------------------------

async function checkLlms() {
  try {
    const { status, ct, body } = await getText('/llms.txt')
    if (status !== 200) return fail('llms.txt', `expected 200, got ${status}`)
    if (!ct.includes('text/plain')) return fail('llms.txt', `expected text/plain, got "${ct}"`)
    const missing = LLMS_MARKERS.filter((m) => !body.includes(m))
    if (missing.length) return fail('llms.txt', `missing sections/markers: ${missing.join(', ')}`)
    ok('llms.txt', `200, text/plain, all ${LLMS_MARKERS.length} markers present`)
  } catch (e) {
    fail('llms.txt', `fetch error: ${e.message}`)
  }
}

// Parse robots.txt into groups so we can tell whether a given bot is allowed.
function parseRobots(text) {
  const groups = []
  let current = null
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const [k, ...rest] = line.split(':')
    const key = k.trim().toLowerCase()
    const val = rest.join(':').trim()
    if (key === 'user-agent') {
      if (!current || current.rules.length) { current = { agents: [], rules: [] }; groups.push(current) }
      current.agents.push(val)
    } else if (current && (key === 'allow' || key === 'disallow')) {
      current.rules.push({ type: key, path: val })
    }
  }
  return groups
}

function botAllowed(groups, bot) {
  // Use the bot's own group if present, else the catch-all '*'.
  const g = groups.find((x) => x.agents.includes(bot)) || groups.find((x) => x.agents.includes('*'))
  if (!g) return true // not mentioned and no catch-all = allowed by default
  // Blocked only if there is a bare `Disallow: /` with no overriding `Allow: /`.
  const fullBlock = g.rules.some((r) => r.type === 'disallow' && r.path === '/')
  const rootAllow = g.rules.some((r) => r.type === 'allow' && r.path === '/')
  return !fullBlock || rootAllow
}

async function checkRobots() {
  try {
    const { status, body } = await getText('/robots.txt')
    if (status !== 200) return fail('robots.txt', `expected 200, got ${status}`)
    const groups = parseRobots(body)
    const blocked = AI_BOTS.filter((b) => !botAllowed(groups, b))
    if (blocked.length) return fail('robots.txt', `AI crawlers BLOCKED: ${blocked.join(', ')}`)
    ok('robots.txt', `all ${AI_BOTS.length} AI crawlers allowed`)
  } catch (e) {
    fail('robots.txt', `fetch error: ${e.message}`)
  }
}

async function checkSitemap() {
  try {
    const { status, body } = await getText('/sitemap.xml')
    if (status !== 200) return fail('sitemap.xml', `expected 200, got ${status}`)
    const count = (body.match(/<loc>/g) || []).length
    if (count < 50) return fail('sitemap.xml', `only ${count} URLs (expected 50+) — possible regression`)
    ok('sitemap.xml', `${count} URLs`)
  } catch (e) {
    fail('sitemap.xml', `fetch error: ${e.message}`)
  }
}

async function checkHomepageSchema() {
  try {
    const { status, body } = await getText('/')
    if (status !== 200) return fail('homepage schema', `homepage returned ${status}`)
    const hasRating = body.includes('"AggregateRating"') && body.includes('"reviewCount"')
    if (!hasRating) fail('homepage schema', 'AggregateRating / reviewCount missing from JSON-LD')
    const missingSameAs = SAMEAS_MARKERS.filter((m) => !body.includes(m))
    if (missingSameAs.length) fail('homepage schema', `sameAs links missing: ${missingSameAs.join(', ')}`)
    if (hasRating && !missingSameAs.length) ok('homepage schema', 'AggregateRating + all sameAs links present')
  } catch (e) {
    fail('homepage schema', `fetch error: ${e.message}`)
  }
}

// --- 2. Review fallback sync ----------------------------------------------

function readFallback() {
  const src = readFileSync(REVIEWS_FILE, 'utf8')
  const m = src.match(/(return \{\s*\n\s*rating: )([\d.]+)(,\s*\n\s*total: )(\d+)(,)/)
  if (!m) throw new Error(`could not locate fallback block in ${REVIEWS_FILE}`)
  return { src, match: m, rating: Number(m[2]), total: Number(m[4]) }
}

async function syncReviewFallback() {
  const PLACE_ID = process.env.GOOGLE_PLACE_ID
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY
  if (!PLACE_ID || !API_KEY) {
    findings.push({ level: 'ok', name: 'review sync', detail: 'skipped — Google Places API not configured yet' })
    return false
  }
  let data
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}?fields=rating,userRatingCount`, {
      headers: { 'X-Goog-Api-Key': API_KEY, 'X-Goog-FieldMask': 'rating,userRatingCount' },
    })
    if (!res.ok) {
      fail('review sync', `Places API returned ${res.status} — check key / billing / quota`)
      return false
    }
    data = await res.json()
  } catch (e) {
    fail('review sync', `Places API error: ${e.message}`)
    return false
  }

  const liveRating = Number((data.rating ?? 0).toFixed(1))
  const liveTotal = Number(data.userRatingCount ?? 0)
  if (!liveTotal) {
    fail('review sync', 'Places API returned 0 reviews — not patching (likely a transient/quota issue)')
    return false
  }

  const { src, match, rating, total } = readFallback()
  if (rating === liveRating && total === liveTotal) {
    ok('review sync', `fallback already current (${liveRating}★, ${liveTotal} reviews)`)
    return false
  }

  const next = src.replace(match[0], `${match[1]}${liveRating}${match[3]}${liveTotal}${match[5]}`)
  writeFileSync(REVIEWS_FILE, next)
  ok('review sync', `fallback updated: ${rating}★/${total} → ${liveRating}★/${liveTotal} reviews`)
  return true
}

// --- run -------------------------------------------------------------------

async function main() {
  await checkLlms()
  await checkRobots()
  await checkSitemap()
  await checkHomepageSchema()
  const synced = await syncReviewFallback()

  const regressions = findings.filter((f) => f.level === 'regression')

  // Human-readable report (stdout + GitHub step summary + issue body file).
  const lines = [`# AI visibility report`, '', `Site: ${SITE}`, '']
  for (const f of findings) {
    lines.push(`- ${f.level === 'ok' ? '✅' : '❌'} **${f.name}** — ${f.detail}`)
  }
  if (regressions.length) {
    lines.push('', `**${regressions.length} regression(s) found in production — needs a human.**`)
  }
  const report = lines.join('\n')
  console.log(report)
  writeFileSync('ai-visibility-report.md', report + '\n')

  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n')
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `synced=${synced}\nregressions=${regressions.length}\n`)
  }
}

main().catch((e) => {
  console.error(e)
  // Surface as a regression rather than crashing the workflow silently.
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `synced=false\nregressions=1\n`)
  writeFileSync('ai-visibility-report.md', `# AI visibility report\n\n❌ audit script crashed: ${e.message}\n`)
})
