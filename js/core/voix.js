'use strict';
/* Lecture à voix haute avec la synthèse vocale du navigateur.
   - choisit automatiquement la meilleure voix française (voix neuronales d'abord, voix robotiques en dernier) ;
   - adapte le texte à l'oral (heures, durées, unités, euros, symboles, grands nombres) ;
   - découpe en phrases courtes (les voix « en ligne » coupent les textes longs) ;
   - contourne les blocages connus de Chrome / Edge / Android (fin perdue, voix figée, lecture refusée avant le premier toucher).
   API : Voix.dire(textes, { onSegment, onFin }), Voix.stop(), Voix.voixFr(), Voix.choisir(), Voix.disponible,
         Voix.qualite(voix), Voix.listeTriee(), Voix.conseil(), Voix.pourOral(texte), Voix.decouper(texte), Voix.actuelle(). */
const Voix = (() => {
  const ORIGINE = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let synth = ORIGINE;
  let Enonce = window.SpeechSynthesisUtterance || null;

  const ua = navigator.userAgent || '';
  const plateforme = {
    android: /Android/i.test(ua),
    apple: /iPhone|iPad|iPod|Macintosh/i.test(ua),
    edge: /Edg(A|iOS)?\//.test(ua),
  };
  const PLATEFORME_REELLE = { ...plateforme };

  let voixChoisie = null;
  // Voix qui ont échoué, avec l'heure jusqu'à laquelle on les évite (ex. voix en ligne sans internet)
  const enPanne = new Map();
  const estEnPanne = v => !!v && (enPanne.get(v.name) || 0) > Date.now();
  function signalerPanne(voix) {
    const maintenant = Date.now();
    if (voix.localService) { enPanne.set(voix.name, maintenant + 600000); return; }
    // Une voix en ligne échoue : souvent plus d'internet, donc on évite toutes les voix en ligne pendant 2 minutes
    for (const v of voixFr()) if (!v.localService) enPanne.set(v.name, maintenant + 120000);
    enPanne.set(voix.name, maintenant + 120000);
  }
  let jeton = 0; // change à chaque nouvelle lecture ou arrêt : les anciennes lectures se taisent
  let enCours = null; // garde une référence sur l'énoncé en cours (sinon Chrome peut perdre l'événement de fin)
  const surveillances = new Set();

  const reglages = () => (typeof Store !== 'undefined' && Store.data && Store.data.reglages) || {};
  const vitesse = () => {
    const v = Number(reglages().vitesse);
    return v >= 0.5 && v <= 2 ? v : 0.95;
  };

  // ---------------------------------------------------------------------------
  // Qualité et classement des voix
  // ---------------------------------------------------------------------------
  const RE_NATURELLE = /natural|neural|neuronal|online|premium|enhanced|amélior|wavenet|studio|r[ée]seau|network/i;
  const RE_ROBOTIQUE = /microsoft|hortense|julie|\bpaul\b|desktop|espeak|mbrola|\bpico\b/i;
  // Voix neuronales françaises de Microsoft Edge, de la plus agréable à la moins agréable (petit bonus)
  const PREFEREES = ['denise', 'henri', 'vivienne', 'eloise', 'remy', 'rémy', 'josephine', 'yves', 'brigitte', 'coralie'];

  const texteVoix = v => `${(v && v.name) || ''} ${(v && v.voiceURI) || ''}`;
  const estFr = v => /^fra?([-_]|$)/i.test((v && v.lang) || '');

  // 'naturelle' (neuronale / en ligne), 'bonne' (Google, Android, Apple…) ou 'basique' (SAPI robotique)
  function qualite(v) {
    const t = texteVoix(v);
    if (RE_NATURELLE.test(t)) return 'naturelle';
    if (RE_ROBOTIQUE.test(t)) return 'basique';
    return 'bonne';
  }

  function score(v) {
    const q = qualite(v);
    const nom = ((v && v.name) || '').toLowerCase();
    const lang = ((v && v.lang) || '').replace('_', '-').toLowerCase();
    let s = { naturelle: 300, bonne: 200, basique: 100 }[q];
    s += lang === 'fr-fr' ? 40 : lang === 'fr' || lang === 'fra' ? 25 : 10; // français de France d'abord
    if (/google/.test(nom)) s += 20; // voix Google : la meilleure après les voix neuronales
    if (/^[a-z]{2,3}-[a-z]{2,3}-x-/.test(nom)) s += 5; // voix Google d'Android (fr-fr-x-…)
    if (q === 'naturelle' && /microsoft/.test(nom)) s += 10; // voix neuronales d'Edge
    const p = PREFEREES.findIndex(n => nom.includes(n));
    if (p >= 0) s += 9 - Math.min(p, 8);
    if (/multiling/.test(nom)) s -= 3; // « Multilingual » / « Multilingue » : un peu moins naturelles en français
    if (v && v.localService) s += 1; // à égalité, une voix locale marche aussi hors ligne
    if (estEnPanne(v)) s -= 1000;
    return s;
  }

  function voixFr(liste) {
    const toutes = liste || (synth ? synth.getVoices() : []);
    return Array.from(toutes || []).filter(estFr);
  }

  // Voix françaises de la meilleure à la moins bonne (pour l'écran coach)
  function listeTriee(liste) {
    return voixFr(liste)
      .map((v, i) => ({ v, i, s: score(v) }))
      .sort((a, b) => b.s - a.s || a.i - b.i)
      .map(o => o.v);
  }

  function choisir() {
    const liste = listeTriee();
    const utilisables = liste.filter(v => !estEnPanne(v));
    const pref = reglages().voixNom;
    voixChoisie = (pref && utilisables.find(v => v.name === pref)) || utilisables[0] || liste[0] || null;
    return voixChoisie;
  }

  const nomCourt = v => String(v.name || '')
    .replace(/^Microsoft\s+/i, '')
    .replace(/(\s+(Online|Multilingual|Multilingue))*\s*\((Natural|Neural)\).*$/i, '')
    .replace(/\s+-\s+.*$/, '')
    .trim();

  // Texte d'aide pour l'espace coach
  function conseil() {
    if (!synth) {
      return "La synthèse vocale n'est pas disponible dans ce navigateur. Sur tablette, utilisez Google Chrome ; sur ordinateur, Microsoft Edge.";
    }
    const liste = listeTriee();
    const v = voixChoisie || liste[0] || null;
    const q = v ? qualite(v) : null;
    const actuelle = v
      ? `Voix utilisée : « ${nomCourt(v)} » (${{ naturelle: 'voix naturelle', bonne: 'voix correcte', basique: 'voix robotique' }[q]}). `
      : '';
    const android = "Paramètres > Gestion générale (ou Système) > Langue et saisie > Synthèse vocale : choisissez le moteur Google, " +
      "puis Installer les données vocales > Français (France) et prenez une voix « réseau » si elle est proposée. Relancez ensuite le jeu.";
    if (plateforme.android) {
      if (!liste.length) return "Aucune voix française n'est installée sur la tablette. " + android;
      if (q === 'naturelle') return actuelle + 'Parfait. Les voix « réseau » utilisent internet ; sans connexion, la tablette reprend sa voix intégrée.';
      return actuelle + 'Pour une voix plus naturelle : ' + android;
    }
    if (plateforme.apple) {
      if (q === 'naturelle') return actuelle + 'Parfait.';
      return actuelle + 'Pour une voix plus naturelle : Réglages > Accessibilité > Contenu énoncé > Voix > Français, téléchargez une voix « améliorée » ou « premium ».';
    }
    if (!liste.length) {
      return "Aucune voix française n'est installée. Ouvrez le jeu avec Microsoft Edge (voix naturelles en ligne) ou ajoutez une voix française dans Paramètres Windows > Heure et langue > Voix.";
    }
    if (q === 'naturelle') {
      return actuelle + (plateforme.edge ? "Les voix naturelles d'Edge utilisent internet ; hors connexion, une voix plus simple prend le relais." : 'Parfait.');
    }
    if (plateforme.edge) {
      return actuelle + "Microsoft Edge propose des voix naturelles (Denise, Henri, Eloise) quand l'ordinateur est connecté à internet : vérifiez la connexion puis rouvrez l'espace coach.";
    }
    return actuelle + 'Sur ordinateur, ouvrez plutôt le jeu avec Microsoft Edge : ses voix naturelles (Denise, Henri, Eloise) sont bien plus agréables et sont choisies automatiquement.';
  }

  // ---------------------------------------------------------------------------
  // Texte pour l'oral
  // ---------------------------------------------------------------------------
  const nombre = s => parseFloat(String(s).replace(',', '.'));
  const accord = (n, sing, plur) => (Math.abs(nombre(n)) >= 2 ? plur : sing);
  const heures = h => `${parseInt(h, 10)} ${accord(h, 'heure', 'heures')}`;
  const minutes = m => `${parseInt(m, 10)} ${accord(m, 'minute', 'minutes')}`;

  // [symbole, singulier, pluriel] : le symbole doit suivre un nombre
  const UNITES = [
    ['km/h', 'kilomètre par heure', 'kilomètres par heure'],
    ['mm', 'millimètre', 'millimètres'], ['cm', 'centimètre', 'centimètres'], ['dm', 'décimètre', 'décimètres'],
    ['km', 'kilomètre', 'kilomètres'], ['m', 'mètre', 'mètres'],
    ['mg', 'milligramme', 'milligrammes'], ['kg', 'kilogramme', 'kilogrammes'], ['g', 'gramme', 'grammes'],
    ['mL', 'millilitre', 'millilitres'], ['ml', 'millilitre', 'millilitres'], ['cL', 'centilitre', 'centilitres'],
    ['cl', 'centilitre', 'centilitres'], ['dL', 'décilitre', 'décilitres'], ['dl', 'décilitre', 'décilitres'],
    ['L', 'litre', 'litres'], ['l', 'litre', 'litres'],
    ['min', 'minute', 'minutes'], ['s', 'seconde', 'secondes'],
    ['cts', 'centime', 'centimes'], ['ct', 'centime', 'centimes'],
    ['°C', 'degré', 'degrés'], ['°', 'degré', 'degrés'], ['%', 'pour cent', 'pour cent'],
  ].map(([sym, sing, plur]) => ({
    re: new RegExp(`(\\d+(?:,\\d+)?) ?${sym.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}(?![\\p{L}\\d'])`, 'gu'),
    sing, plur,
  }));

  const ORDINAUX = ['', 'premier', 'deuxième', 'troisième', 'quatrième', 'cinquième', 'sixième', 'septième', 'huitième',
    'neuvième', 'dixième', 'onzième', 'douzième', 'treizième', 'quatorzième', 'quinzième', 'seizième', 'dix-septième',
    'dix-huitième', 'dix-neuvième', 'vingtième'];
  const FRACTIONS = { 2: ['demi', 'demis'], 3: ['tiers', 'tiers'], 4: ['quart', 'quarts'] };

  function pourOral(texte) {
    let t = String(texte == null ? '' : texte);
    t = t
      // espaces insécables et fines → espace normale ; apostrophes typographiques
      .replace(/[     ]/g, ' ')
      .replace(/[’‘ʼ]/g, "'")
      // emojis, pictogrammes, guillemets, puces
      .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]/gu, '')
      .replace(/[✓✔✗✘★☆✦✧•●○◆◇■□▪▫►▶◀◁▷]/g, ' ')
      .replace(/[«»“”„‟"‹›]/g, ' ')
      // grands nombres : « 1 250 » → « 1250 »
      .replace(/(^|[^\d,.])(\d{1,3})((?: \d{3})+)(?![\d])/g, (m, avant, tete, reste) => avant + tete + reste.replace(/ /g, ''))
      // durées « 1 h 30 min » → « 1 heure 30 minutes »
      .replace(/(\d+) ?h ?(\d{1,2}) ?min(?![\p{L}\d'])/gu, (m, h, mn) => {
        if (!parseInt(h, 10)) return minutes(mn);
        return parseInt(mn, 10) ? `${heures(h)} ${minutes(mn)}` : heures(h);
      })
      // heures « 8 h 05 » → « 8 heures 5 » ; « 14 h 00 » → « 14 heures »
      .replace(/(\d+) ?h ?(\d{2})(?![\p{L}\d'])/gu, (m, h, mn) => (parseInt(mn, 10) ? `${heures(h)} ${parseInt(mn, 10)}` : heures(h)))
      // « 8:05 » → « 8 heures 5 »
      .replace(/(^|[^\d:])(\d{1,2}):(\d{2})(?![\d:])/g, (m, avant, h, mn) => avant + (parseInt(mn, 10) ? `${heures(h)} ${parseInt(mn, 10)}` : heures(h)))
      // heures ou durées rondes « 3 h » → « 3 heures »
      .replace(/(\d+) ?h(?![\p{L}\d'])/gu, (m, h) => heures(h))
      // prix au kilo, au litre
      .replace(/€ ?\/ ?kg(?![\p{L}])/gu, '€ le kilo')
      .replace(/€ ?\/ ?[lL](?![\p{L}])/gu, '€ le litre')
      // euros : « 2 € » → « 2 euros », « 3,50 € » → « 3 euros 50 », « 0,20 € » → « 20 centimes »
      .replace(/(\d+)(?:,(\d{1,2}))? ?€/g, (m, e, c) => {
        const euros = parseInt(e, 10);
        const cent = c ? parseInt(c.length === 1 ? c + '0' : c, 10) : 0;
        const motEuro = euros >= 2 ? 'euros' : 'euro';
        if (!cent) return `${e} ${motEuro}`;
        if (!euros) return `${cent} ${cent >= 2 ? 'centimes' : 'centime'}`;
        return cent < 10 ? `${euros} ${motEuro} et ${cent} ${cent >= 2 ? 'centimes' : 'centime'}` : `${euros} ${motEuro} ${cent}`;
      })
      .replace(/€/g, ' euros ')
      // ordinaux : 1er, 1re, 2e…
      .replace(/(^|[^\p{L}\d])1(er)(?![\p{L}\d])/gu, '$1premier')
      .replace(/(^|[^\p{L}\d])1(re|ère)(?![\p{L}\d])/gu, '$1première')
      .replace(/(^|[^\p{L}\d])(\d+)(e|è|ème|eme)(?![\p{L}\d])/gu, (m, avant, n) => avant + (ORDINAUX[+n] || `${n}ième`));
    // unités de mesure
    for (const u of UNITES) t = t.replace(u.re, (m, n) => `${n} ${accord(n, u.sing, u.plur)}`);
    t = t
      // fractions : « 1/2 » → « 1 demi », « 3/4 » → « 3 quarts », « 2/5 » → « 2 sur 5 »
      .replace(/(\d+) ?\/ ?(\d+)/g, (m, a, b) => (FRACTIONS[b] ? `${a} ${+a >= 2 ? FRACTIONS[b][1] : FRACTIONS[b][0]}` : `${a} sur ${b}`))
      // opérations
      .replace(/−/g, ' moins ')
      .replace(/(\d) - (?=\d)/g, '$1 moins ')
      .replace(/\+/g, ' plus ')
      .replace(/×/g, ' fois ')
      .replace(/(\d) ?[xX] ?(?=\d)/g, '$1 fois ')
      .replace(/÷/g, ' divisé par ')
      .replace(/(\d) : (?=\d)/g, '$1 divisé par ')
      .replace(/≠/g, " n'est pas égal à ")
      .replace(/≤/g, ' est plus petit ou égal à ')
      .replace(/≥/g, ' est plus grand ou égal à ')
      .replace(/</g, ' est plus petit que ')
      .replace(/>/g, ' est plus grand que ')
      .replace(/≈/g, ' environ ')
      .replace(/=/g, ' égale ')
      .replace(/&/g, ' et ')
      // le « ? » d'une opération à trous : « 35 + ? = 50 » → « 35 plus combien égale 50 »
      .replace(/(plus|moins|fois|par|égale)\s+\?/g, '$1 combien')
      .replace(/\?\s+(?=plus|moins|fois|divisé|égale)/g, 'combien ')
      // tirets de dialogue ou d'incise, flèches, symboles inutiles
      .replace(/(^|\s)[–—](\s|$)/g, ', ')
      .replace(/[→⇒➜⟶]/g, ', ')
      .replace(/[#*_|~^\\[\]{}/]/g, ' ')
      // espaces
      .replace(/\s+/g, ' ')
      .replace(/ ([,.])/g, '$1')
      .replace(/,(\s*,)+/g, ',')
      .replace(/^[\s,]+|[\s,]+$/g, '');
    return t;
  }

  // Découpe en phrases courtes (les voix « en ligne » coupent ou se bloquent sur les textes longs)
  function decouper(texte, max = 170) {
    const t = String(texte == null ? '' : texte).replace(/\s+/g, ' ').trim();
    if (!t) return [];
    const phrases = t.split(/(?<=[.!?…])\s+(?=\S)/);
    // On regroupe les tout petits morceaux (« Oh ! ») avec le suivant
    const groupes = [];
    for (const p of phrases) {
      const dernier = groupes[groupes.length - 1];
      if (dernier && dernier.length < 25 && dernier.length + 1 + p.length <= max) groupes[groupes.length - 1] = dernier + ' ' + p;
      else groupes.push(p);
    }
    // Les phrases trop longues sont coupées à une virgule (sinon à une espace)
    const res = [];
    for (let p of groupes) {
      while (p.length > max) {
        const zone = p.slice(0, max);
        let coupe = Math.max(zone.lastIndexOf(', '), zone.lastIndexOf('; '), zone.lastIndexOf(' : '));
        if (coupe < max / 3) coupe = zone.lastIndexOf(' ');
        if (coupe < 1) coupe = max;
        const signe = /[,;:]/.test(p[coupe]) ? 1 : p[coupe + 1] === ':' ? 2 : 0;
        res.push(p.slice(0, coupe + signe).trim());
        p = p.slice(coupe + signe).trim();
      }
      if (p) res.push(p);
    }
    return res;
  }

  // ---------------------------------------------------------------------------
  // Lecture
  // ---------------------------------------------------------------------------
  function nettoyer() {
    for (const s of surveillances) clearInterval(s);
    surveillances.clear();
  }

  function stop() {
    jeton++;
    nettoyer();
    enCours = null;
    if (synth) { try { synth.cancel(); } catch (e) { /* rien */ } }
  }

  // Chrome refuse de parler avant le premier toucher de l'enfant : on relira au premier toucher
  let enAttente = null;
  let ecouteDeblocage = false;
  function bloque(liste) {
    enAttente = { liste, quand: Date.now(), jeton };
    if (ecouteDeblocage) return;
    ecouteDeblocage = true;
    const debloquer = () => setTimeout(() => {
      const a = enAttente;
      enAttente = null;
      if (a && a.jeton === jeton && Date.now() - a.quand < 15000 && synth && !synth.speaking) dire(a.liste);
    }, 40);
    for (const type of ['click', 'keydown']) document.addEventListener(type, debloquer, true);
  }

  // textes : une phrase ou une liste de phrases (lues l'une après l'autre).
  // onSegment(i) au début de la phrase i, puis onSegment(-1) et onFin() à la fin (pas d'appel si on l'interrompt).
  function dire(textes, { onSegment, onFin } = {}) {
    stop();
    const liste = (Array.isArray(textes) ? textes : [textes]).filter(t => t != null && String(t).trim());
    const mien = jeton;
    if (!synth || !Enonce || !liste.length) { if (onFin) setTimeout(onFin, 0); return; }
    choisir(); // voix arrivées tard, pannes terminées, réglage modifié

    const morceaux = [];
    liste.forEach((texte, i) => decouper(pourOral(texte)).forEach((m, k) => morceaux.push({ i, texte: m, premier: k === 0 })));
    let n = 0;

    const fin = () => {
      if (mien !== jeton) return;
      nettoyer();
      enCours = null;
      if (onSegment) onSegment(-1);
      if (onFin) onFin();
    };
    const suivant = () => {
      if (mien !== jeton) return;
      if (n >= morceaux.length) { fin(); return; }
      lire(morceaux[n++], 0);
    };

    const lire = (m, essai) => {
      const voix = voixChoisie;
      const u = new Enonce(m.texte);
      u.lang = voix ? voix.lang : 'fr-FR';
      if (voix) { try { u.voice = voix; } catch (e) { /* voix refusée : voix par défaut de la langue */ } }
      u.rate = vitesse();
      u.pitch = 1;
      u.volume = 1;
      let demarre = false;
      let termine = false;
      const debut = Date.now();
      const limite = 8000 + (m.texte.length * 150) / u.rate;
      // Chrome sur ordinateur coupe les voix Google en ligne après ~15 s : pause / reprise régulière
      const entretien = !plateforme.android && voix && /google/i.test(voix.name) && !voix.localService;
      let dernierEntretien = debut;
      let surv = null;

      const annoncer = () => {
        if (m.premier && !m.annonce && mien === jeton) { m.annonce = true; if (onSegment) onSegment(m.i); }
      };
      const arreterSurveillance = () => { clearInterval(surv); surveillances.delete(surv); };
      const terminer = () => {
        if (termine) return;
        termine = true;
        arreterSurveillance();
        suivant();
      };
      // Voix en panne (souvent : voix en ligne sans internet) → on réessaie avec la suivante
      const changerDeVoix = () => {
        if (!voix || essai >= 2) return false;
        signalerPanne(voix);
        choisir();
        if (!voixChoisie || voixChoisie === voix) return false;
        termine = true;
        arreterSurveillance();
        setTimeout(() => { if (mien === jeton) lire(m, essai + 1); }, 80);
        return true;
      };

      u.onstart = () => { if (mien !== jeton) return; demarre = true; annoncer(); };
      u.onend = () => { if (mien === jeton) terminer(); };
      u.onerror = e => {
        if (mien !== jeton || termine) return;
        const err = (e && e.error) || '';
        if (err === 'not-allowed') { termine = true; arreterSurveillance(); bloque(liste); fin(); return; }
        if (err === 'interrupted' || err === 'canceled') { terminer(); return; }
        if (!demarre && changerDeVoix()) return;
        terminer();
      };

      enCours = u;
      try {
        if (synth.paused) synth.resume(); // Chrome reste parfois figé en pause
        synth.speak(u);
      } catch (e) {
        terminer();
        return;
      }

      // Surveillance : événements perdus, voix muette, lecture figée
      let vuParler = false;
      let silence = 0;
      surv = setInterval(() => {
        if (mien !== jeton || termine) { arreterSurveillance(); return; }
        const t = Date.now() - debut;
        if (synth.speaking) vuParler = true;
        if (!demarre && vuParler && t > 700) annoncer(); // onstart parfois absent : on surligne quand même
        // onend perdu : plus rien ne parle depuis deux tours de surveillance
        silence = (demarre || vuParler) && !synth.speaking && !synth.pending ? silence + 1 : 0;
        if (silence >= 2) { terminer(); return; }
        if (!demarre && !vuParler && t > 5000) {
          // rien ne sort : on essaie une autre voix, sinon on abandonne la lecture (sans bloquer le jeu)
          try { synth.cancel(); } catch (e) { /* rien */ }
          if (changerDeVoix()) return;
          termine = true;
          arreterSurveillance();
          fin();
          return;
        }
        if (t > limite) { try { synth.cancel(); } catch (e) { /* rien */ } terminer(); return; }
        if (entretien && synth.speaking && Date.now() - dernierEntretien > 10000) {
          dernierEntretien = Date.now();
          synth.pause();
          synth.resume();
        }
      }, 250);
      surveillances.add(surv);
    };

    // petit délai : Chrome ignore parfois une phrase lancée juste après cancel()
    setTimeout(suivant, 80);
  }

  // ---------------------------------------------------------------------------
  // Démarrage
  // ---------------------------------------------------------------------------
  function brancher() {
    if (!synth) return;
    choisir();
    const surChangement = () => choisir();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', surChangement);
    else synth.onvoiceschanged = surChangement;
  }
  if (synth) {
    try { synth.cancel(); } catch (e) { /* lecture restée d'une page précédente */ }
    brancher();
    // certains navigateurs (Android) ne signalent pas l'arrivée des voix
    for (const ms of [300, 1000, 2500, 5000]) setTimeout(() => { if (!voixChoisie) choisir(); }, ms);
    // Chrome continue de parler après un rechargement de page
    window.addEventListener('pagehide', () => { try { synth.cancel(); } catch (e) { /* rien */ } });
  }

  // Réservé aux pages de test : remplace le moteur de synthèse (null = moteur réel)
  function _injecter(faux, options = {}) {
    stop();
    synth = faux || ORIGINE;
    Enonce = options.Enonce || window.SpeechSynthesisUtterance || null;
    for (const k of Object.keys(plateforme)) plateforme[k] = k in options ? !!options[k] : PLATEFORME_REELLE[k];
    enPanne.clear();
    voixChoisie = null;
    if (synth) choisir();
  }

  return {
    dire, stop, voixFr, choisir, qualite, listeTriee, conseil, pourOral, decouper, score, _injecter,
    actuelle: () => voixChoisie,
    enPanne: () => [...enPanne.keys()].filter(nom => (enPanne.get(nom) || 0) > Date.now()),
    get disponible() { return !!synth; },
  };
})();
