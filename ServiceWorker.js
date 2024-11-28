const cacheName = "DefaultCompany-LineAuthorization-1.0.25";
const contentToCache = [
    "Build/Test.loader.js",
    "Build/Test.framework.js",
    "Build/Test.data",
    "Build/Test.wasm",
    "TemplateData/style.css",
];

self.addEventListener("install", (e) => {
    console.log("[Service Worker] Installing...");

    e.waitUntil(
        (async () => {
            // Удаление всех существующих кешей
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map((name) => {
                    console.log(`[Service Worker] Deleting cache: ${name}`);
                    return caches.delete(name);
                })
            );

            // Кеширование нового контента
            const cache = await caches.open(cacheName);
            console.log("[Service Worker] Caching new content...");
            await cache.addAll(contentToCache);
        })()
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        (async () => {
            const cache = await caches.open(cacheName);
            const cachedResponse = await cache.match(e.request);

            // Отдаём кеш, если он существует
            if (cachedResponse) {
                return cachedResponse;
            }

            // Если кеша нет, запрашиваем из сети и сохраняем в кеш
            try {
                const networkResponse = await fetch(e.request);
                if (networkResponse && networkResponse.status === 200) {
                    cache.put(e.request, networkResponse.clone());
                }
                return networkResponse;
            } catch (error) {
                console.error(`[Service Worker] Fetch failed: ${e.request.url}`, error);
                throw error;
            }
        })()
    );
});