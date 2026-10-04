/* Service worker : permet à Mission Galaxie de fonctionner sans connexion. */
const VERSION = 'mission-galaxie-v1';
const FICHIERS = [
  './',
  'index.html',
  'css/style.css',
  'js/ui.js',
  'js/storage.js',
  'js/voix.js',
  'js/sons.js',
  'js/alvin.js',
  'js/problemes.js',
  'js/recompenses.js',
  'js/mission.js',
  'js/ecrans.js',
  'js/app.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(cles => Promise.all(cles.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function garder(requete, reponse) {
  if (reponse && (reponse.ok || reponse.type === 'opaque')) {
    const copie = reponse.clone();
    caches.open(VERSION).then(c => c.put(requete, copie));
  }
  return reponse;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    // Réseau d'abord (pour avoir la dernière version), sinon la copie gardée
    const delai = new Promise((_, refuse) => setTimeout(() => refuse(new Error('lent')), 4000));
    e.respondWith(
      Promise.race([fetch(req), delai])
        .then(rep => garder(req, rep))
        .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
    );
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    // Polices : la copie gardée d'abord
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(rep => garder(req, rep))));
  }
});
