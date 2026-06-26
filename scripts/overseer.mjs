/**
 * Fleet overseer — the single "is the whole thing OK?" seat (the chair).
 *
 * Runs daily from .github/workflows/overseer-daily.yml. Sits ABOVE the existing
 * watchers (job-health, ai-visibility) and gives the owner ONE hands-off pulse:
 *
 *   1. GitHub Actions fleet — every scheduled workflow ran recently and passed
 *      (failure / disabled-for-inactivity / stale), and no EXPECTED workflow has
 *      gone missing (deleted/renamed) — a gap plain job-health can't see.
 *   2. Medical backup — reads the latest `backup_log` row in Supabase and
 *      confirms a backup happened in the last day AND was `encrypted`. A backup
 *      that didn't run, or ran in cleartext, is the costliest silent failure in
 *      the fleet, so it is a hard alert here.
 *   3. Open automation issues — anything the other watchdogs already flagged
 *      (labels: automation-health, ai-visibility) is surfaced to the owner.
 *   4. Vercel crons — if a `cron_heartbeats` table exists (see boot guide §5)
 *      it is read and stale agents are flagged; if not, the gap is noted so it
 *      stays visible rather than silently uncovered.
 *
 * The new capability vs the existing watchers: it REACHES the owner. job-health
 * and ai-visibility only open GitHub issues; this emails the clinic (Resend)
 * when — and only when — a human is needed. Green days are silent; a short
 * "all healthy" pulse goes out once a week so the owner knows the seat is alive.
 *
 * Pure Node (global fetch on Node 20). Always exits 0; the workflow reads the
 * `needs_human` output to open/update a single deduped issue. No LLM, near-zero
 * cost — same deterministic philosophy as job-health.
 */

import { writeFileSync, appendFileSync } from 'node:fs'

const TOKEN = process.env.GITHUB_TOKEN
const REPO = process.env.GITHUB_REPOSITORY // "owner/repo"
const SELF = 'overseer-daily.yml'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RESEND_KEY = process.env.RESEND_API_KEY
const CLINIC_EMAIL = process.env.CLINIC_EMAIL

// Expected scheduled workflows + how stale (days) is too stale for each cadence.
// Doubles as the allow-list that catches a DELETED workflow: any name here with
// no matching workflow in the API response is flagged missing.
const EXPECTED = {
  'ai-visibility-daily.yml': { name: 'AI visibility watchdog', staleDays: 2 },
  'auto-blog.yml': { name: 'Auto-blog', staleDays: 5 },
  'backup-medical.yml': { name: 'Medical records backup', staleDays: 2 },
  'job-health-daily.yml': { name: 'Automation health check', staleDays: 2 },
  'scout-opportunities.yml': { name: 'Scout awards & press', staleDays: 5 },
}

if (!TOKEN || !REPO) {
  console.error('Missing GITHUB_TOKEN or GITHUB_REPOSITORY')
  process.exit(0)
}

const gh = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'visage-overseer/1.0',
    },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status} on ${path}: ${await res.text()}`)
  return res.json()
}

const sb = async (path) => {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  if (res.status === 404) return { __missing: true } // table doesn't exist
  if (!res.ok) throw new Error(`Supabase ${res.status} on ${path}: ${(await res.text()).slice(0, 200)}`)
  return res.json()
}

const daysAgo = (iso) => (Date.now() - new Date(iso).getTime()) / 86_400_000
const hoursAgo = (iso) => (Date.now() - new Date(iso).getTime()) / 3_600_000

async function checkGithubFleet(broken, warnings, healthy) {
  const { workflows } = await gh(`/repos/${REPO}/actions/workflows`)
  const seen = new Set()

  for (const wf of workflows) {
    const file = wf.path.split('/').pop()
    if (file === SELF) continue
    seen.add(file)
    if (!(file in EXPECTED)) continue // only judge the scheduled fleet

    const { name, staleDays } = EXPECTED[file]
    if (wf.state === 'disabled_inactivity') {
      broken.push(`**${name}** — DISABLED by GitHub for inactivity. Re-enable it on the Actions tab.`)
      continue
    }
    if (wf.state === 'disabled_manually') {
      healthy.push(`${name} — disabled manually (skipped)`)
      continue
    }
    const { workflow_runs: runs } = await gh(`/repos/${REPO}/actions/workflows/${wf.id}/runs?per_page=1`)
    if (!runs.length) {
      warnings.push(`**${name}** — no runs yet.`)
      continue
    }
    const run = runs[0]
    const when = `${Math.round(daysAgo(run.created_at))}d ago`
    if (run.status !== 'completed') {
      healthy.push(`${name} — currently ${run.status}`)
      continue
    }
    if (['failure', 'timed_out', 'startup_failure'].includes(run.conclusion)) {
      broken.push(`**${name}** — last run FAILED (${run.conclusion}, ${when}). ${run.html_url}`)
      continue
    }
    if (daysAgo(run.created_at) > staleDays) {
      warnings.push(`**${name}** — no run in ${when} (expected within ${staleDays}d). Check it's still scheduled.`)
      continue
    }
    healthy.push(`${name} — ${run.conclusion} (${when})`)
  }

  // A workflow we expect that GitHub no longer knows about = deleted/renamed.
  for (const [file, { name }] of Object.entries(EXPECTED)) {
    if (!seen.has(file)) broken.push(`**${name}** (\`${file}\`) — MISSING from the repo (deleted or renamed). Restore it or update the overseer.`)
  }
}

async function checkBackup(broken, healthy) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    healthy.push('Medical backup — not checked (no Supabase credentials configured for the overseer)')
    return
  }
  let rows
  try {
    rows = await sb('backup_log?select=backed_up_at,encrypted,total_rows,email_sent&order=backed_up_at.desc&limit=1')
  } catch (e) {
    broken.push(`**Medical backup** — could not read backup_log: ${e.message}`)
    return
  }
  if (rows?.__missing || !Array.isArray(rows) || rows.length === 0) {
    broken.push('**Medical backup** — no backup_log records found. The daily Dropbox backup may never have run.')
    return
  }
  const last = rows[0]
  if (hoursAgo(last.backed_up_at) > 30) {
    broken.push(`**Medical backup** — last backup was ${Math.round(hoursAgo(last.backed_up_at))}h ago (expected daily). The 02:00 UTC job may be failing.`)
    return
  }
  if (last.encrypted !== true) {
    broken.push(`**Medical backup** — last backup ran UNENCRYPTED (${Math.round(hoursAgo(last.backed_up_at))}h ago). Patient data may be in cleartext on Dropbox — set BACKUP_ENCRYPTION_KEY.`)
    return
  }
  healthy.push(`Medical backup — encrypted, ${last.total_rows ?? '?'} rows, ${Math.round(hoursAgo(last.backed_up_at))}h ago`)
}

async function checkOpenIssues(broken, healthy) {
  // Surface anything the other watchdogs already raised.
  const labels = ['automation-health', 'ai-visibility', 'fleet-overseer']
  const issues = await gh(`/repos/${REPO}/issues?state=open&per_page=20&labels=${labels.join(',')}`)
  const real = issues.filter((i) => !i.pull_request)
  if (!real.length) {
    healthy.push('No open automation/visibility issues')
    return
  }
  for (const i of real) {
    broken.push(`**Open issue #${i.number}** — ${i.title} (${Math.round(daysAgo(i.created_at))}d old). ${i.html_url}`)
  }
}

// The 15 Vercel crons + how stale (hours) each is allowed to get before it's a
// problem, derived from its schedule in vercel.json (cadence + a grace margin).
// This is also the allow-list: an expected agent with NO heartbeat row is flagged.
const EXPECTED_CRONS = {
  'orders-poll': 8, // every 6h
  'book-reminders': 3, // hourly
  sync: 2, // every 30 min
  integrity: 30, // daily 06:00
  'stock-expiry': 30, // daily 08:00
  'seasonal-campaign': 30, // daily 08:30
  'health-safety': 30, // daily 19:30
  'end-of-day-email': 2, // every 30 min (self-gating)
  'financial-summary': 192, // Mon (8d)
  'review-sentiment': 192, // Mon (8d)
  'seo-monitor': 192, // Fri (8d)
  'social-content': 192, // Fri (8d)
  'weekly-summary': 192, // Tue (8d)
  'clinical-audit': 792, // monthly (33d)
  'faq-updater': 792, // monthly (33d)
}

async function checkVercelHeartbeats(broken, warnings, healthy, notes) {
  // Graceful: only meaningful once the cron_heartbeats table exists. Until then,
  // keep the gap VISIBLE rather than pretending the Vercel crons are covered.
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    notes.push('Vercel crons (15): not monitored — overseer has no Supabase credentials.')
    return
  }
  let rows
  try {
    rows = await sb('cron_heartbeats?select=agent_name,last_ok,last_error')
  } catch (e) {
    notes.push(`Vercel crons: heartbeat read failed (${e.message}).`)
    return
  }
  if (rows?.__missing) {
    notes.push('Vercel crons (15): NOT monitored yet. Apply the cron_heartbeats migration and redeploy; the overseer then covers them automatically.')
    return
  }
  const seen = new Map((Array.isArray(rows) ? rows : []).map((r) => [r.agent_name, r]))
  let stale = 0
  for (const [name, maxH] of Object.entries(EXPECTED_CRONS)) {
    const r = seen.get(name)
    if (!r || !r.last_ok) {
      // No row yet is expected right after deploy — a soft warning, not an alarm.
      warnings.push(`**Vercel cron \`${name}\`** — no successful heartbeat yet (expected within ${maxH}h).`)
      stale++
      continue
    }
    const age = hoursAgo(r.last_ok)
    if (age > maxH) {
      broken.push(`**Vercel cron \`${name}\`** — no success in ${Math.round(age)}h (expected within ${maxH}h). It may have stopped firing.${r.last_error ? ` Last error: ${String(r.last_error).slice(0, 120)}` : ''}`)
      stale++
    }
  }
  if (!stale) healthy.push(`Vercel crons — all ${Object.keys(EXPECTED_CRONS).length} reporting healthy heartbeats`)
}

async function sendEmail(subject, html, text) {
  if (!RESEND_KEY) {
    console.warn('RESEND_API_KEY not set — skipping owner email.')
    return false
  }
  if (!CLINIC_EMAIL) {
    console.warn('CLINIC_EMAIL not set — skipping owner email (refusing to fall back to a personal address).')
    return false
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Visage Aesthetics <enquiries@vaclinic.co.uk>',
      to: [CLINIC_EMAIL],
      subject,
      html,
      text,
    }),
  })
  if (!res.ok) {
    console.error(`Resend failed: ${res.status} ${(await res.text()).slice(0, 200)}`)
    return false
  }
  return true
}

async function main() {
  const broken = [] // needs a human
  const warnings = [] // soft notes / stale
  const healthy = [] // all good
  const notes = [] // coverage notes (e.g. Vercel gap)

  await checkGithubFleet(broken, warnings, healthy)
  await checkBackup(broken, healthy)
  await checkOpenIssues(broken, healthy)
  await checkVercelHeartbeats(broken, warnings, healthy, notes)

  const needsHuman = broken.length > 0
  const stamp = new Date().toISOString().slice(0, 10)
  const lines = [`# Fleet overseer — ${stamp}`, '', `Repo: ${REPO}`, '']
  if (broken.length) lines.push(`## ❌ Needs you (${broken.length})`, ...broken.map((b) => `- ${b}`), '')
  if (warnings.length) lines.push(`## ⚠️ Worth a look (${warnings.length})`, ...warnings.map((w) => `- ${w}`), '')
  lines.push(`## ✅ Healthy (${healthy.length})`, ...healthy.map((h) => `- ${h}`), '')
  if (notes.length) lines.push(`## ℹ️ Coverage`, ...notes.map((n) => `- ${n}`), '')
  const report = lines.join('\n')
  console.log(report)
  writeFileSync('overseer-report.md', report + '\n')
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n')

  // Reach the owner — and only the owner-relevant signal.
  let emailed = false
  if (needsHuman) {
    const html = `<h2>Visage agent fleet — ${broken.length} thing(s) need you</h2><ul>${broken.map((b) => `<li>${b.replace(/\*\*/g, '')}</li>`).join('')}</ul>${warnings.length ? `<p><b>Also worth a look:</b></p><ul>${warnings.map((w) => `<li>${w.replace(/\*\*/g, '')}</li>`).join('')}</ul>` : ''}<p>Full report is in the GitHub Actions run and the open “fleet-overseer” issue.</p>`
    emailed = await sendEmail(`⚠️ Visage agent fleet — ${broken.length} need${broken.length === 1 ? 's' : ''} attention`, html, report)
  } else if (new Date().getUTCDay() === 1) {
    // Monday: a short "still alive, all healthy" pulse so silence is trustworthy.
    const html = `<h2>Visage agent fleet — all healthy ✅</h2><p>${healthy.length} checks passed; nothing needs you this week.</p>${notes.length ? `<p style="color:#888">${notes.join('<br>')}</p>` : ''}`
    emailed = await sendEmail('✅ Visage agent fleet — all healthy', html, report)
  }

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `needs_human=${broken.length}\nwarnings=${warnings.length}\nemailed=${emailed}\n`)
  }
}

main().catch((e) => {
  console.error(e)
  writeFileSync('overseer-report.md', `# Fleet overseer\n\n❌ the overseer itself crashed: ${e.message}\n`)
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `needs_human=1\nwarnings=0\nemailed=false\n`)
})
