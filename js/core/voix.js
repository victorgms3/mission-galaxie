'use strict';
/* Lecture à voix haute avec la synthèse vocale du navigateur (voix française). */
const Voix = (() => {
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let voixChoisie = null;
  let jeton = 0;
  let enCours = null; // garde une référence (sinon Chrome peut perdre l'événement de fin)

  function voixFr() {
    return synth ? synth.getVoices().filter(v => /^fr([-_]|$)/i.test(v.lang)) : [];
  }

  function choisir() {
    const fr = voixFr();
    const pref = Store.data.reglages.voixNom;
    voixChoisie = fr.find(v => v.name === pref)
      || fr.find(v => /fr[-_]FR/i.test(v.lang) && /google/i.test(v.name))
      || fr.find(v => /fr[-_]FR/i.test(v.lang))
      || fr[0] || null;
  }

  if (synth) {
    choisir();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', choisir);
    else synth.onvoiceschanged = choisir;
  }

  function pourOral(t) {
    return t
      .replace(/(\d)[   ](?=\d{3}(\D|$))/g, '$1')
      .replace(/ − /g, ' moins ')
      .replace(/ \+ /g, ' plus ')
      .replace(/ = /g, ' égale ')
      .replace(/[«»]/g, '')
      .replace(/[\u{1F300}-\u{1FAFF}☀-➿️]/gu, '');
  }

  function stop() {
    jeton++;
    if (synth) synth.cancel();
  }

  // textes : une phrase ou une liste de phrases (lues l'une après l'autre)
  function dire(textes, { onSegment, onFin } = {}) {
    stop();
    const liste = (Array.isArray(textes) ? textes : [textes]).filter(Boolean);
    const mien = jeton;
    if (!synth || !liste.length) { if (onFin) setTimeout(onFin, 0); return; }
    let i = 0;
    const suivant = () => {
      if (mien !== jeton) return;
      if (i >= liste.length) {
        if (onSegment) onSegment(-1);
        if (onFin) onFin();
        return;
      }
      const idx = i++;
      const u = new SpeechSynthesisUtterance(pourOral(liste[idx]));
      enCours = u;
      u.lang = 'fr-FR';
      if (voixChoisie) u.voice = voixChoisie;
      u.rate = Store.data.reglages.vitesse || 0.9;
      u.pitch = 1.05;
      u.onstart = () => { if (mien === jeton && onSegment) onSegment(idx); };
      u.onend = suivant;
      u.onerror = suivant;
      synth.speak(u);
    };
    // petit délai : Chrome ignore parfois une phrase lancée juste après cancel()
    setTimeout(suivant, 60);
  }

  return { dire, stop, voixFr, choisir, disponible: !!synth };
})();
