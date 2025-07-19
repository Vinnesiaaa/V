self.addEventListener('install', event => {
  console.log('Vinnesia service worker installed.');
});
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});