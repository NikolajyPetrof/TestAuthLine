const cacheName = "DefaultCompany-LineAuthorization-1.0.2";
const contentToCache = [
    "Build/Test.loader.js",
    "Build/Test.framework.js",
    "Build/Test.data",
    "Build/Test.wasm",
    "TemplateData/style.css"

];

self.addEventListener("install", function (e) {
    console.log("[Service Worker] Install");
  
    e.waitUntil(
      (async function () {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter((name) => name !== cacheName)
            .map((name) => {
              console.log("[Service Worker] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
        const cache = await caches.open(cacheName);
        await cache.addAll(contentToCache);
      })()
    );
});

self.addEventListener("fetch", function (e) {
    e.respondWith(
        (async function () {
            // Check if the request URL matches any item in contentToCache
            const shouldCache = contentToCache.some(cacheItem => e.request.url.includes(cacheItem));

            if (shouldCache) {
                const cache = await caches.open(cacheName);
                const cachedResponse = await cache.match(e.request);

                if (cachedResponse) {
                    return cachedResponse;
                }

                try {
                    const networkResponse = await fetch(e.request);
                    if (networkResponse && (networkResponse.status === 200 ||  networkResponse.status === 204)) {
                        cache.put(e.request, networkResponse.clone());
                    }
                    return networkResponse;
                } catch (error) {
                    console.error(`[Service Worker] Fetch failed: ${e.request.url}`, error);
                    throw error;
                }
            } else {
                // For non-cached content, fetch from network without caching
                return fetch(e.request);
            }
        })()
    );
});

