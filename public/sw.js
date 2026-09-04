self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Pass through all requests to network
  // A real PWA might cache the app shell here, but for now we just want it to be installable.
});
