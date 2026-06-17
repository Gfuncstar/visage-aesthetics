/**
 * Job-health check — the "is everything still running?" agent.
 *
 * Runs daily from .github/workflows/job-health-daily.yml. Asks the GitHub
 * Actions API about every OTHER scheduled workflow in this repo (auto-blog,
 * scout-opportunities, backup-medical, ai-visibility, …) and flags anything
 * that is quietly broken:
 *
 *   - latest run FAILED (failure / timed_out / startup_failure)
 *   - the workflow was DISABLED by GitHub for inactivity (this is the classic
 *     silent death — GitHub switches off scheduled workflows after 60 days of
 *     no repo activity)
 *   - the workflow has gone STALE (no run in a while) — a softer warning
 *
 * It does NOT judge job *content* — only whether each job ran and passed.
 * That's the whole point: it's the cheap, deterministic watchdog that makes
 * every other automation trustworthy.
 *
 * Pure Node (global fetch on Node 20). Auth + repo come from the Actions env
 * (GITHUB_TOKEN, GITHUB_REPOSITORY). Exit code is always 0; the workflow reads
 * the `unhealthy` output to decide whether to alert.
 */

import { writeFileSync, appendFileSync } from 'node:fs'

const TOKEN = process.env.GITHUB_TOKEN
const REPO = process.env.GITHUB_REPOSITORY // "owner/repo"
const SELF = process.env.SELF_WORKFLOW || 'job-health-daily.yml'
const STALE_DAYS = Number(process.env.STALE_DAYS || 10)

if (!TOKEN || !REPO) {
  console.error('Missing GITHUB_TOKEN or GITHUB_REPOSITORY')
  process.exit(0)
}

const api = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'visage-job-health/1.0',
    },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status} on ${path}: ${await res.text()}`)
  return res.json()
}

const daysAgo = (iso) => (Date.now() - new Date(iso).getTime()) / 86_400_000

async function main() {
  const broken = [] // hard problems → alert
  const warnings = [] // stale → soft note
  const healthy = []

  const { workflows } = await api(`/repos/${REPO}/actions/workflows`)

  for (const wf of workflows) {
    const file = wf.path.split('/').pop()
    if (file === SELF) continue // don't flag ourselves (our own run is mid-flight)

    // GitHub disabled it for inactivity — exactly the silent death we exist to catch.
    if (wf.state === 'disabled_inactivity') {
      broken.push(`**${wf.name}** — DISABLED by GitHub for inactivity (no longer running). Re-enable it on the Actions tab.`)
      continue
    }
    if (wf.state === 'disabled_manually') {
      healthy.push(`${wf.name} — disabled manually (skipped)`)
      continue
    }

    const { workflow_runs: runs } = await api(`/repos/${REPO}/actions/workflows/${wf.id}/runs?per_page=1`)
    if (!runs.length) {
      healthy.push(`${wf.name} — no runs yet`)
      continue
    }
    const run = runs[0]
    const when = `${Math.round(daysAgo(run.created_at))}d ago`

    if (run.status !== 'completed') {
      healthy.push(`${wf.name} — currently ${run.status}`)
      continue
    }
    if (['failure', 'timed_out', 'startup_failure'].includes(run.conclusion)) {
      broken.push(`**${wf.name}** — last run FAILED (${run.conclusion}, ${when}). ${run.html_url}`)
      continue
    }
    if (daysAgo(run.created_at) > STALE_DAYS) {
      warnings.push(`**${wf.name}** — no run in ${when} (last: ${run.conclusion}). Check it's still scheduled.`)
      continue
    }
    healthy.push(`${wf.name} — ${run.conclusion} (${when})`)
  }

  const lines = [`# Automation health report`, '', `Repo: ${REPO}`, '']
  if (broken.length) {
    lines.push(`## ❌ Needs attention (${broken.length})`, ...broken.map((b) => `- ${b}`), '')
  }
  if (warnings.length) {
    lines.push(`## ⚠️ Possibly stale (${warnings.length})`, ...warnings.map((w) => `- ${w}`), '')
  }
  lines.push(`## ✅ Healthy (${healthy.length})`, ...healthy.map((h) => `- ${h}`))
  const report = lines.join('\n')
  console.log(report)
  writeFileSync('job-health-report.md', report + '\n')

  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n')
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `unhealthy=${broken.length}\nwarnings=${warnings.length}\n`)
  }
}

main().catch((e) => {
  console.error(e)
  writeFileSync('job-health-report.md', `# Automation health report\n\n❌ health check itself crashed: ${e.message}\n`)
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `unhealthy=1\nwarnings=0\n`)
})
