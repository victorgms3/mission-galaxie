'use strict';
/* Démarrage de Mission Galaxie. */
(function demarrage() {
  Store.charger();
  Voix.choisir();

  // Ciel étoilé
  const ciel = document.getElementById('ciel');
  for (let i = 0; i < 90; i++) {
    const s = document.createElement('span');
    const taille = (Math.random() * 2 + 1).toFixed(1);
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${taille}px;height:${taille}px;` +
      `animation-delay:${(Math.random() * 4).toFixed(2)}s;animation-duration:${(2 + Math.random() * 3).toFixed(2)}s`;
    ciel.append(s);
  }

  if (Store.data.profil) Ecrans.carte();
  else Ecrans.config();

  // Fonctionnement hors ligne (quand l'app est servie en http/https)
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
