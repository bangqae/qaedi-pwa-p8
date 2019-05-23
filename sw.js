var filesToCache = [ //membuat variabel untuk path apa saja yang akan di cache
  '.',
  'style/main.css',
  'images/still_life_medium.jpg',
  'index.html',
  'pages/offline.html',
  'pages/404.html'
];

var staticCacheName = 'pages-cache-v2'; //nama cache
self.addEventListener('install', function(event) { //fungsi install
  console.log('Attempting to install service worker and cache static assets'); //konsol log
  event.waitUntil(
    caches.open(staticCacheName)
    .then(function(cache) {
      return cache.addAll(filesToCache); //penambahan var filesToCache untuk di cache
    })
  );
});
  
self.addEventListener('fetch', function(event) { //fungsi fetch
  console.log('Fetch event for ', event.request.url);
  event.respondWith( //merespon event fetch
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log('Found ', event.request.url, ' in cache');
      return response;
      }
      console.log('Network request for ', event.request.url);
      return fetch(event.request)
      // TODO 4 - Add fetched files to the cache
      .then(function(response) { //menerima respon yang di return dari network request dan memasukkannya ke dalam cache
        // TODO 5 - Respond with custom 404 page
        if (response.status === 404) { //jika kode error 404 tampilkan 404.html
          return caches.match('pages/404.html');
        }
        return caches.open(staticCacheName).then(function(cache) {
          if (!(event.request.url.indexOf('https') === 0)) {
            cache.put(event.request.url, response.clone());
          }
          return response;
        });
      });
    }).catch(function(error) {
      // TODO 6 - Respond with custom offline page
      console.log('Error, ', error); //jika file yg di request tidak ada tampilkan offline.html
      return caches.match('pages/offline.html');
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('Activating new service worker...');
  var cacheWhitelist = [staticCacheName];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});