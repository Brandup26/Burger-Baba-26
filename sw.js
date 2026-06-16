const CACHE_NAME = 'burger-baba-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './images/logggo.jpg'
];

// تثبيت السيرفس وركر وكاش الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('🍔 [Burger Baba] كاش التثبيت جاهز وسلس');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// تفعيل وتحديث الكاش القديم فوراً
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 [Burger Baba] تنظيف الكاش القديم');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية التشغيل السريع: الكاش أولاً ثم الشبكة
self.addEventListener('fetch', (event) => {
  // لا تقم بكاش روابط شيت جوجل المتغيرة لضمان تحديث الأسعار فورا
  if (event.request.url.includes('docs.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // تحديث الكاش في الخلفية لضمان السرعة والتحديث المستمر
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* تجاهل خطأ الشبكة في الخلفية */});
        
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
