const CACHE_NAME = "elts-klipnova-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.webmanifest",
  "/icon.svg",
  "/favicon.ico",
  "/css/bootstrap.min.css",
  "/css/style.css",
  "/js/main.js",
  "/lib/animate/animate.min.css",
  "/lib/owlcarousel/assets/owl.carousel.min.css",
  "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Rubik:wght@400;500;600;700&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css",
  "https://code.jquery.com/jquery-3.4.1.min.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
];

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching shell assets");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interceptor
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Exclude Supabase API calls and WebSocket connections from caching
  if (
    requestUrl.origin !== self.location.origin ||
    event.request.method !== "GET" ||
    requestUrl.pathname.startsWith("/rest/v1") ||
    requestUrl.pathname.startsWith("/auth/v1")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background to update cache for next time
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch((err) => console.log("Background fetch failed:", err));
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cache successful static responses
        if (
          networkResponse.status === 200 &&
          (requestUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff2|webmanifest)$/) ||
            requestUrl.pathname.startsWith("/css/") ||
            requestUrl.pathname.startsWith("/js/") ||
            requestUrl.pathname.startsWith("/img/") ||
            requestUrl.pathname.startsWith("/lib/"))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((error) => {
        // For HTML requests/navigation, fall back to cached "/" (index) shell
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
        throw error;
      });
    })
  );
});
