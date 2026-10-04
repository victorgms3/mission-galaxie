'use strict';
/* Petits sons générés (aucun fichier audio à télécharger). */
const Sons = (() => {
  let ctx = null;

  function audio() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function note(freq, debut, duree, type = 'sine', volume = 0.16) {
    const c = audio();
    if (!c) return;
    const t = c.currentTime + debut;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volume, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + duree + 0.05);
  }

  const actif = () => Store.data.reglages.sons;

  return {
    clic() { if (actif()) note(660, 0, 0.07, 'triangle', 0.06); },
    bien() { if (!actif()) return; note(880, 0, 0.22); note(1320, 0.09, 0.32); },
    oups() { if (!actif()) return; note(330, 0, 0.16, 'triangle', 0.1); note(262, 0.11, 0.24, 'triangle', 0.09); },
    etoile(i = 0) { if (actif()) note(1046 + i * 262, 0, 0.3, 'sine', 0.12); },
    victoire() { if (!actif()) return; [523, 659, 784, 1047].forEach((f, i) => note(f, i * 0.11, 0.38, 'triangle', 0.14)); },
  };
})();
