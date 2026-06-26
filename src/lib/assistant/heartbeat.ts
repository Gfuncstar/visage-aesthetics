/**
 * Cron heartbeat — liveness signal for the scheduled Vercel agents.
 *
 * The fleet overseer (.github/workflows/overseer-daily.yml) watches the GitHub
 * Actions directly, but it cannot see whether the 15 Vercel crons are still
 * firing. Each cron route wraps its work in `withHeartbeat(name, run)`, which
 * upserts a row into `cron_heartbeats` (last_run + last_ok / last_error). The
 * overseer then alerts if any agent stops reporting.
 *
 * Hard rule: a heartbeat must NEVER break the agent it monitors. Every failure
 * here — missing env, table absent, Supabase down — is swallowed. Until the
 * `cron_heartbeats` migration is applied the writes simply no-op.
 */

const URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function recordHeartbeat(agent: string, ok: boolean, error?: string): Promise<void> {
  try {
    if (!URL || !SERVICE_KEY) return
    const now = new Date().toISOString()
    const row: Record<string, unknown> = { agent_name: agent, last_run: now, updated_at: now }
    if (ok) {
      row.last_ok = now
      row.last_error = null // clear a stale error once the agent recovers
    } else {
      row.last_error = (error ?? 'unknown').slice(0, 500)
    }
    await fetch(`${URL.replace(/\/$/, '')}/rest/v1/cron_heartbeats?on_conflict=agent_name`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(row),
    })
  } catch {
    // Never let monitoring break the thing it monitors.
  }
}

/**
 * Wrap a cron route's work. Records last_ok when it returns < 500, last_error
 * when it throws or returns >= 500. Returns/re-throws exactly what `fn` did, so
 * behaviour is unchanged.
 */
export async function withHeartbeat<T extends Response>(agent: string, fn: () => Promise<T>): Promise<T> {
  try {
    const res = await fn()
    await recordHeartbeat(agent, res.status < 500, res.status >= 500 ? `HTTP ${res.status}` : undefined)
    return res
  } catch (err) {
    await recordHeartbeat(agent, false, err instanceof Error ? err.message : String(err))
    throw err
  }
}
