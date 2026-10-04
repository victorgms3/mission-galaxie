'use strict';
/* Démarrage de Mission Galaxie. */
const App = (() => {
  // Premier écran : réglages (premier lancement), histoire de départ, ou écran titre
  function demarrer() {
    Store.charger();
    Voix.choisir();
    if (!Store.data.profil) Ecrans.config();
    else if (!Store.data.introVue) Ecrans.histoire();
    else Ecrans.titre();
  }

  // La progression est aussi enregistrée quand l'appli passe en arrière-plan (tablette en veille, autre appli)
  const sauver = () => { if (Store.data && Store.data.profil) Store.sauver(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) sauver(); });
  window.addEventListener('pagehide', sauver);

  // Fonctionnement hors ligne (quand l'app est servie en http/https)
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  demarrer();
  return { demarrer };
})();
