'use strict';
/* Démarrage de Mission Galaxie. */
(function demarrage() {
  Store.charger();
  Voix.choisir();

  if (!Store.data.profil) Ecrans.config();
  else if (!Store.data.introVue) Ecrans.histoire();
  else Ecrans.titre();

  // Fonctionnement hors ligne (quand l'app est servie en http/https)
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
