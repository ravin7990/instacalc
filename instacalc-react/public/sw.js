/**
 * sw.js — InstaCalc Service Worker for offline capability & instant caching.
 * Uses Network-First for navigation and assets so updates apply instantly.
 */

const CACHE_NAME = "instacalc-v2";
const OFFLINE_URLS = [
  "/",
  "/favicon.ico",
  "/logo.png",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip analytics and external cross-origin requests
  if (!url.origin.includes(self.location.origin) && !url.origin.includes("gstatic.com")) {
    return;
  }

  // Network-First strategy: Always fetch fresh content from the network, fallback to cache when offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If offline and request failed, return cached response
        return caches.match(event.request);
      })
  );
});
