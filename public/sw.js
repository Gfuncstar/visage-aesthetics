// Service worker for the Visage Assistant installed app: shows push
// notifications and focuses the app when one is tapped.
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    data = {}
  }
  const title = data.title || 'Visage Assistant'
  const options = {
    body: data.body || '',
    icon: '/staff-app-icon.png',
    badge: '/staff-app-icon.png',
    data: { url: data.url || '/staff/assistant' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/staff/assistant'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes('/staff') && 'focus' in c) return c.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    }),
  )
})
