/**
 * ShikshaIQ Service Worker
 * Version: shikshaiq-v1-static
 * Strategy:
 *  - Static Assets / Fonts / Icons: Cache-First with Network fallback
 *  - Navigation / App Shell: Network-First with Cache fallback
 *  - NEVER cache authenticated endpoints, API routes, or Supabase credentials
 */

const CACHE_NAME = "shikshaiq-v1-static";

// Static assets to pre-cache on install
const PRECACHE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/manifest.json",
  "/icons/icon.svg",
  "/favicon.ico",
];

// Paths that must NEVER be cached by the service worker
const NEVER_CACHE_PATTERNS = [
  /\/api\//,
  /\/auth\//,
  /supabase\.co/,
  /\/pending-approval/,
  /\/teacher/,
  /\/admin/,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Pre-cache partial warning:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("[SW] Deleting obsolete cache:", name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  // 2. Never cache private/authenticated API or auth endpoints
  if (NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname) || pattern.test(url.hostname))) {
    return;
  }

  // 3. For navigation requests: Network-First with Cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, copy);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback to cached root shell if exact navigation route is not in cache
            return caches.match("/");
          });
        })
    );
    return;
  }

  // 4. For static resources (Next.js static assets, css, fonts, images)
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          // If offline and not in cache, nothing to return
          return new Response("Offline asset unavailable", { status: 503, statusText: "Offline" });
        });
      })
    );
    return;
  }

  // Default: let standard fetch handle it
});
