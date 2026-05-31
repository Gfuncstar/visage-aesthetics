/**
 * Visibility scout for Visage Aesthetics — awards + press.
 *
 * Runs from a GitHub Actions cron (weekly). Uses the Anthropic API + web
 * search to find:
 *   1. Free-to-enter awards the clinic genuinely qualifies for (aesthetics,
 *      nurse-led, small-business, regional Essex / East of England), with an
 *      open deadline.
 *   2. Relevant press / journalist opportunities where Bernadette is a
 *      credible expert source.
 *
 * For each find it drafts an entry or pitch in Bernadette's voice and stores
 * it in the `opportunities` table with status 'new'. NOTHING is submitted or
 * emailed: a human reviews every item in the Assistant and submits it.
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional:
 *   SCOUT_ONLY=award|press   restrict to one kind
 *   DRY_RUN=true             log finds, do not write to the database
 */
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CLINIC_PROFILE, fingerprint, type OpportunityKind } from '../src/lib/assistant/opportunities.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const MODEL = 'claude-opus-4-7'

type Find = {
  kind: OpportunityKind
  title: string
  organisation: string | null
  url: string | null
  summary: string | null
  deadline: string | null
  cost_note: string | null
  fit_reason: string | null
}

async function main() {
  const apiKey = required('ANTHROPIC_API_KEY')
  const supaUrl = required('SUPABASE_URL').replace(/\/$/, '')
  const supaKey = required('SUPABASE_SERVICE_ROLE_KEY')
  const client = new Anthropic({ apiKey })
  const only = process.env.SCOUT_ONLY as OpportunityKind | undefined
  const dryRun = process.env.DRY_RUN === 'true'

  const voiceGuide = readFileSync(join(ROOT, 'scripts/voice-guide.md'), 'utf-8')
  const today = new Date().toISOString().slice(0, 10)

  // Pull existing fingerprints so we never re-add the same opportunity.
  const existing = await loadFingerprints(supaUrl, supaKey)
  console.log(`Known opportunities: ${existing.size}`)

  const finds: Find[] = []
  if (only !== 'press') finds.push(...(await scout(client, 'award', today)))
  if (only !== 'award') finds.push(...(await scout(client, 'press', today)))
  console.log(`Raw finds: ${finds.length}`)

  // Dedupe + keep only genuinely free items.
  const fresh = finds.filter((f) => {
    if (!f.title) return false
    const fp = fingerprint(f.kind, f.title, f.organisation)
    if (existing.has(fp)) return false
    existing.add(fp)
    return true
  })
  console.log(`New after dedupe: ${fresh.length}`)

  let written = 0
  for (const f of fresh) {
    const draft = await draftFor(client, f, voiceGuide)
    const row = {
      kind: f.kind,
      title: f.title.slice(0, 300),
      organisation: f.organisation?.slice(0, 200) ?? null,
      url: f.url?.slice(0, 1000) ?? null,
      summary: f.summary?.slice(0, 1000) ?? null,
      deadline: /^\d{4}-\d{2}-\d{2}$/.test(String(f.deadline)) ? f.deadline : null,
      cost_note: f.cost_note?.slice(0, 200) ?? null,
      fit_reason: f.fit_reason?.slice(0, 1000) ?? null,
      draft: scrubDashes(draft).slice(0, 6000),
      status: 'new',
      fingerprint: fingerprint(f.kind, f.title, f.organisation),
      raw: f as unknown as Record<string, unknown>,
    }
    if (dryRun) {
      console.log(`[dry-run] ${f.kind}: ${f.title} (${f.organisation ?? 'n/a'}) deadline=${row.deadline ?? 'n/a'}`)
      continue
    }
    await insertOpportunity(supaUrl, supaKey, row)
    written++
    console.log(`Saved ${f.kind}: ${f.title}`)
  }
  console.log(`Done. ${written} new opportunit${written === 1 ? 'y' : 'ies'} saved.`)
}

function required(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`${name} is required`)
  return v
}

async function loadFingerprints(url: string, key: string): Promise<Set<string>> {
  const res = await fetch(`${url}/rest/v1/opportunities?select=fingerprint`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Load fingerprints failed (${res.status}): ${(await res.text()).slice(0, 200)}`)
  const rows = (await res.json()) as { fingerprint: string | null }[]
  return new Set(rows.map((r) => r.fingerprint).filter((f): f is string => Boolean(f)))
}

async function insertOpportunity(url: string, key: string, row: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${url}/rest/v1/opportunities?on_conflict=fingerprint`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(row),
  })
  if (!res.ok) throw new Error(`Insert failed (${res.status}): ${(await res.text()).slice(0, 200)}`)
}

async function scout(client: Anthropic, kind: OpportunityKind, today: string): Promise<Find[]> {
  const brief =
    kind === 'award'
      ? `Find UK awards that this clinic genuinely qualifies for and that are FREE TO ENTER (no entry fee, no paid "winner package" required to enter), with an entry deadline that is still open as of ${today}.
Look across: aesthetics / medical-aesthetics industry awards, nursing and clinical excellence awards, small-business and independent-business awards, and regional Essex / East of England business awards.
Exclude anything with an entry fee, anything already closed, and anything where the clinic plainly does not qualify. It is better to return fewer, well-matched awards than to pad the list.`
      : `Find genuine, current press / PR opportunities where the clinic's lead nurse would be a credible expert source, as of ${today}.
Look across: journalist source-request services (for example #journorequest leads, Featured/HARO-style requests, Qwoted-style calls), relevant UK health/beauty editorial calls, and local Essex press that covers independent businesses.
Only include opportunities that are open and a real fit for a registered nurse in medical aesthetics. Skip anything paid-placement or advertorial.`

  const prompt = `You are a PR and awards researcher for a UK clinic. Use up to 6 web searches to gather REAL, current opportunities. Do not invent anything; every item must come from a source you actually found.

The clinic:
${CLINIC_PROFILE}

Your brief:
${brief}

Return ONLY a JSON array (no prose, no markdown fence). Each item:
{"kind":"${kind}","title":string,"organisation":string|null,"url":string|null,"summary":string|null,"deadline":"YYYY-MM-DD"|null,"cost_note":string|null,"fit_reason":string|null}
- title: the award or opportunity name.
- organisation: the awarding body / publication / outlet.
- url: the entry page or request URL you found.
- summary: one or two plain sentences on what it is.
- deadline: entry/response deadline if stated, else null.
- cost_note: confirm it is free to enter (for awards) or note any cost; if you cannot confirm it is free, say so here.
- fit_reason: one sentence on why this clinic specifically qualifies.
Return between 0 and 8 items. If you find nothing solid, return [].`

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 6 } as never],
      messages: [{ role: 'user', content: prompt }],
    })
    const text = res.content
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { type: string; text?: string }) => b.text ?? '')
      .join('\n')
    const start = text.indexOf('[')
    const end = text.lastIndexOf(']')
    if (start === -1 || end === -1) return []
    const arr = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>[]
    return arr
      .map((o) => ({
        kind,
        title: String(o.title ?? '').trim(),
        organisation: o.organisation ? String(o.organisation).trim() : null,
        url: o.url ? String(o.url).trim() : null,
        summary: o.summary ? String(o.summary).trim() : null,
        deadline: o.deadline ? String(o.deadline).trim() : null,
        cost_note: o.cost_note ? String(o.cost_note).trim() : null,
        fit_reason: o.fit_reason ? String(o.fit_reason).trim() : null,
      }))
      .filter((f) => f.title)
  } catch (err) {
    console.warn(`Scout (${kind}) failed:`, err)
    return []
  }
}

async function draftFor(client: Anthropic, f: Find, voiceGuide: string): Promise<string> {
  const task =
    f.kind === 'award'
      ? `Draft a concise award entry for "${f.title}"${f.organisation ? ` (${f.organisation})` : ''}. Write the core submission text a judge would read: roughly 200 to 350 words covering what makes the clinic stand out, evidence of clinical standards, and why it deserves the award. First person, Bernadette's voice. Do not invent figures, testimonials, or claims that are not in the clinic profile.`
      : `Draft a short, sendable pitch responding to "${f.title}"${f.organisation ? ` (${f.organisation})` : ''}. 90 to 150 words offering Bernadette as an expert source: who she is, the angle she can speak to, and a line of genuinely useful insight. End with a single sentence offering a quote or a call. Do not invent claims.`

  const prompt = `You are drafting on behalf of Bernadette Tobin, lead nurse at Visage Aesthetics.

Clinic profile (only use facts from here):
${CLINIC_PROFILE}

Opportunity:
- ${f.kind}: ${f.title}
- Body/outlet: ${f.organisation ?? 'n/a'}
- About: ${f.summary ?? 'n/a'}
- Why it fits: ${f.fit_reason ?? 'n/a'}

Voice & style guide (follow strictly, especially the dash and AI-tell rules):
${voiceGuide}

Task: ${task}

Output ONLY the draft text. No preamble, no headings, no markdown fence.`

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    })
    return res.content
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { type: string; text?: string }) => b.text ?? '')
      .join('\n')
      .trim()
  } catch (err) {
    console.warn('Draft failed, storing without a draft:', err)
    return ''
  }
}

/** Same hard brand rule as the blog bot: no em/en-dashes ever ship. */
function scrubDashes(input: string): string {
  return input.replace(/\s+[—–]\s+/g, ', ').replace(/[—–]/g, '-')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
