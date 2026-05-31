'use client'

import { useEffect, useState } from 'react'
import { Bell, BellRing } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

type State = 'unsupported' | 'off' | 'on' | 'busy'

export default function NotificationToggle() {
  const [state, setState] = useState<State>('off')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setState('unsupported')
      return
    }
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => { if (sub) setState('on') })
      .catch(() => {})
  }, [])

  async function enable() {
    setState('busy')
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setState('off'); return }
      const { publicKey } = await (await fetch('/api/staff/assistant/push/subscribe')).json()
      if (!publicKey) { setState('off'); return }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      })
      const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
      await fetch('/api/staff/assistant/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      })
      setState('on')
    } catch {
      setState('off')
    }
  }

  if (state === 'unsupported') return null
  if (state === 'on') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-sage border border-sage/40 bg-sage/10 rounded-full px-3 py-1.5">
        <BellRing size={13} strokeWidth={1.75} /> Alerts on
      </span>
    )
  }
  return (
    <button
      onClick={enable}
      disabled={state === 'busy'}
      className="inline-flex items-center gap-1.5 text-xs rounded-full border border-gold/50 text-gold-deep hover:bg-gold/10 px-3 py-1.5 transition-colors disabled:opacity-50"
    >
      <Bell size={13} strokeWidth={1.75} /> {state === 'busy' ? 'Turning on…' : 'Turn on alerts'}
    </button>
  )
}
