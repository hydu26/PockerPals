const CACHE = 'pokerpals-v1'

const PRECACHE = [
  '/',
  '/manifest.json',
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)

  // Skip cross-origin, API, and Supabase requests — always go to network
  if (
    url.origin !== location.origin ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase')
  ) {
    return
  }

  // Static assets: cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(png|jpg|svg|ico|woff2?)$/)
  ) {
    e.respondWith(
      caches.match(request).then((hit) => hit ?? fetch(request).then((res) => {
        const clone = res.clone()
        caches.open(CACHE).then((c) => c.put(request, clone))
        return res
      }))
    )
    return
  }

  // Navigation: network-first with offline fallback to cached /
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(request, clone))
          return res
        })
        .catch(() => caches.match('/') ?? Response.error())
    )
  }
})
