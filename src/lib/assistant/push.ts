// Web Push: send notifications to the installed staff app. VAPID keys live in
// the RLS-locked app_config table (read server-side via the service role), so
// nothing needs to be set in Vercel.

import { select, insert, remove } from './db'

type Config = { vapid_public: string; vapid_private: string; vapid_subject: string }
type ConfigRow = { key: string; value: string }
type SubRow = { id: string; endpoint: string; p256dh: string; auth: string }

async function readConfig(): Promise<Config | null> {
  const rows = await select<ConfigRow>('app_config', { key: 'in.(vapid_public,vapid_private,vapid_subject)', limit: 10 })
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  if (!map.vapid_public || !map.vapid_private) return null
  return {
    vapid_public: map.vapid_public,
    vapid_private: map.vapid_private,
    vapid_subject: map.vapid_subject || 'mailto:info@vaclinic.co.uk',
  }
}

export async function vapidPublicKey(): Promise<string | null> {
  try {
    const rows = await select<ConfigRow>('app_config', { key: 'eq.vapid_public', limit: 1 })
    return rows[0]?.value ?? null
  } catch {
    return null
  }
}

export async function saveSubscription(sub: { endpoint: string; keys: { p256dh: string; auth: string } }): Promise<void> {
  const existing = await select<SubRow>('push_subscriptions', { endpoint: `eq.${encodeURIComponent(sub.endpoint)}`, limit: 1 })
  if (existing.length > 0) return
  await insert('push_subscriptions', { endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth })
}

export async function removeSubscription(endpoint: string): Promise<void> {
  await remove('push_subscriptions', { endpoint })
}

export type PushPayload = { title: string; body: string; url?: string }

/** Send a payload to every subscribed device. Prunes dead subscriptions. */
export async function sendPush(payload: PushPayload): Promise<{ sent: number; removed: number }> {
  const config = await readConfig()
  if (!config) return { sent: 0, removed: 0 }
  const subs = await select<SubRow>('push_subscriptions', { limit: 500 })
  if (subs.length === 0) return { sent: 0, removed: 0 }

  const webpush = (await import('web-push')).default
  webpush.setVapidDetails(config.vapid_subject, config.vapid_public, config.vapid_private)

  let sent = 0
  let removed = 0
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload),
      )
      sent++
    } catch (err) {
      const code = (err as { statusCode?: number }).statusCode
      if (code === 404 || code === 410) {
        try { await remove('push_subscriptions', { id: s.id }) ; removed++ } catch { /* ignore */ }
      }
    }
  }))
  return { sent, removed }
}
