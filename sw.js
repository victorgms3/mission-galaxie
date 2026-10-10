/* Service worker : permet à Mission Galaxie de fonctionner sans connexion.
   La liste FICHIERS correspond exactement aux fichiers chargés par index.html (+ manifeste et icônes).
   Changer VERSION à chaque mise à jour pour que les tablettes rechargent les fichiers. */
const VERSION = 'mission-galaxie-v2-7';
const FICHIERS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/base.css',
  'css/resolution.css',
  'css/jeu.css',
  'js/core/ui.js',
  'js/core/storage.js',
  'js/core/icones.js',
  'js/core/voix.js',
  'js/core/sons.js',
  'js/art/art.js',
  'js/art/alvin.js',
  'js/problemes/moteur.js',
  'js/problemes/banques/plusmoins-1.js',
  'js/problemes/banques/plusmoins-2.js',
  'js/problemes/banques/paquets-1.js',
  'js/problemes/banques/paquets-2.js',
  'js/problemes/banques/marche-1.js',
  'js/problemes/banques/marche-2.js',
  // vague 2 : 'js/problemes/banques/tictac-1.js', 'js/problemes/banques/tictac-2.js',
  //           'js/problemes/banques/defi-1.js', 'js/problemes/banques/defi-2.js',
  'js/monde/mondes.js',
  'js/monde/mondes/plusmoins.js',
  'js/monde/mondes/paquets.js',
  'js/monde/mondes/marche.js',
  'js/monde/mondes/tictac.js',
  // vague 2 : 'js/monde/mondes/defi.js',
  'js/monde/moteur.js',
  'js/resolution/widgets.js',
  'js/resolution/resolution.js',
  'js/jeu/ecrans.js',
  'js/jeu/jeu.js',
  'js/jeu/app.js',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', e => {
  // addAll échoue si un seul fichier manque : on met en cache ce qui existe
  e.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.all(FICHIERS.map(f => c.add(f).catch(() => null))))
      .then(() => self.skipWaiting())
  );
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
