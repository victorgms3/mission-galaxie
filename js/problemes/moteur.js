'use strict';
/*
 * Moteur de problèmes de Mission Galaxie.
 *  - Les banques (js/problemes/banques/*.js) décrivent des MODÈLES de problèmes : un texte + une structure.
 *  - Les STRUCTURES décrivent les mathématiques : tirage des nombres, schéma, opération.
 *  - instancier() fabrique un problème prêt à résoudre (texte découpé, valeurs, étapes de calcul).
 * Voir docs : cahier des charges (SPEC.md) fourni aux contributeurs.
 *
 * Pour que l'enfant LISE l'énoncé (et ne devine pas l'opération d'après un mot-clé) :
 *  - la question est placée à la fin (≈ 50 %), au début (≈ 30 %) ou au milieu (≈ 20 %) de l'énoncé, quand le texte
 *    le permet (voir placerQuestion ; modèle : questionFin, texte().questionDebut, texte().phrasesDebut) ;
 *  - phrases pièges (nombres inutiles) : 1 problème sur 2 au grade 1, 2 sur 3 aux grades 2-3 (jusqu'à 2 pièges, clés d et e),
 *    de préférence dans la même unité que les données (modèle : piegesContexte, sinon « Hugo, un ami de Léa, a 9 billes. ») ;
 *  - structures à mot-clé trompeur (motPiege) ouvertes dès le grade 1 (≈ 1 problème sur 4) ;
 *  - types de réponse (modèle : reponse) : 'nombre' (défaut), 'qui', 'ouinon', 'impossible' (il manque une donnée).
 */
const Problemes = (() => {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const choix = t => t[Math.floor(Math.random() * t.length)];
  const melange = t => {
    const a = t.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const NOTIONS = ['plusmoins', 'paquets', 'marche', 'tictac', 'defi'];
  const BANQUES = {};
  const PIEGES = {};
  NOTIONS.forEach(n => { BANQUES[n] = []; PIEGES[n] = []; });

  // ---------------------------------------------------------------------------
  // Formats d'affichage
  // ---------------------------------------------------------------------------
  const fmtNombre = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const fmtHeure = m => {
    const h = Math.floor(m / 60), mm = m % 60;
    return h + ' h' + (mm ? ' ' + String(mm).padStart(2, '0') : '');
  };
  const fmtDuree = m => {
    const h = Math.floor(m / 60), mm = m % 60;
    if (!h) return mm + ' min';
    if (!mm) return h + ' h';
    return h + ' h ' + mm + ' min';
  };
  const formater = (v, format) => (format === 'heure' ? fmtHeure(v) : format === 'duree' ? fmtDuree(v) : fmtNombre(v));

  // ---------------------------------------------------------------------------
  // Personnages
  // ---------------------------------------------------------------------------
  const PRENOMS = [
    { n: 'Léa', g: 'f' }, { n: 'Tom', g: 'm' }, { n: 'Inès', g: 'f' }, { n: 'Noah', g: 'm' },
    { n: 'Jade', g: 'f' }, { n: 'Malik', g: 'm' }, { n: 'Chloé', g: 'f' }, { n: 'Hugo', g: 'm' },
    { n: 'Zoé', g: 'f' }, { n: 'Sacha', g: 'm' }, { n: 'Lina', g: 'f' }, { n: 'Adam', g: 'm' },
    { n: 'Emma', g: 'f' }, { n: 'Yanis', g: 'm' }, { n: 'Rose', g: 'f' }, { n: 'Lucas', g: 'm' },
    { n: 'Nour', g: 'f' }, { n: 'Gabin', g: 'm' }, { n: 'Mila', g: 'f' }, { n: 'Rayan', g: 'm' },
  ];
  const ALVIN = { n: 'Alvin', g: 'm' };

  function perso(p) {
    const f = p.g === 'f';
    const voyelle = /^[aeiouhàâäéèêëîïôöûüœ]/i.test(p.n);
    return {
      n: p.n, g: p.g,
      il: f ? 'elle' : 'il',
      Il: f ? 'Elle' : 'Il',
      e: f ? 'e' : '',
      de: (voyelle ? "d'" : 'de ') + p.n,
      que: (voyelle ? "qu'" : 'que ') + p.n,
      a: 'à ' + p.n,
    };
  }

  function duo(A, B) {
    const f = A.g === 'f' && B.g === 'f';
    return { ils: f ? 'elles' : 'ils', Ils: f ? 'Elles' : 'Ils', eux: f ? 'elles' : 'eux' };
  }

  function personnages(ctx = {}) {
    const enfant = ctx.enfant || null;
    const pnj = ctx.pnj || null;
    const amis = (ctx.amis || []).filter(p => p.n && (!enfant || p.n !== enfant.n));
    const reserve = () => (amis.length && Math.random() < 0.5 ? amis : PRENOMS);
    let A;
    const tirage = Math.random();
    if (pnj && tirage < 0.45) A = pnj;
    else if (enfant && tirage < 0.7) A = enfant;
    else A = choix(reserve());
    let B = null;
    for (let essai = 0; essai < 30 && (!B || B.n === A.n); essai++) {
      const t = Math.random();
      B = pnj && A !== pnj && t < 0.25 ? pnj : t < 0.35 ? ALVIN : choix(reserve());
    }
    if (B.n === A.n) B = PRENOMS.find(p => p.n !== A.n);
    return [perso(A), perso(B)];
  }

  // ---------------------------------------------------------------------------
  // Structures mathématiques
  // ---------------------------------------------------------------------------
  // gen 'somme'   -> { p, q, s } avec p + q = s
  // gen 'produit' -> { n, t, p } avec n × t = p (n = nombre de groupes, t = taille d'un groupe)
  // gen 'horaire' -> { d, u, f } avec d + u = f (minutes depuis minuit ; u = durée)
  // niv1 : ouverte aussi au grade 1 (voir niveauxDe) ; plafond1 : plus grand nombre tiré au grade 1 ;
  // motPiege : structure où le mot-clé de l'énoncé trompe (« gagne » mais il faut soustraire…)
  const S = {
    // Additives : partie-tout (pt) et comparaison (cmp)
    CT: { niv: [1, 2, 3], forme: 'pt', slots: { tout: '?', p1: 'a', p2: 'b' }, gen: 'somme', map: v => ({ a: v.p, b: v.q, r: v.s }) },
    CP: { niv: [2, 3], niv1: true, plafond1: 50, forme: 'pt', slots: { tout: 'a', p1: 'b', p2: '?' }, gen: 'somme', map: v => ({ a: v.s, b: v.p, r: v.q }) },
    TG: { niv: [1, 2, 3], forme: 'pt', slots: { tout: '?', p1: 'a', p2: 'b' }, gen: 'somme', map: v => ({ a: v.p, b: v.q, r: v.s }) },
    TP: { niv: [1, 2, 3], forme: 'pt', slots: { tout: 'a', p1: 'b', p2: '?' }, gen: 'somme', map: v => ({ a: v.s, b: v.p, r: v.q }) },
    TTg: { niv: [2, 3], motPiege: true, plafond1: 30, forme: 'pt', slots: { tout: 'b', p1: 'a', p2: '?' }, gen: 'somme', map: v => ({ a: v.p, b: v.s, r: v.q }) },
    TTp: { niv: [2, 3], motPiege: true, plafond1: 30, forme: 'pt', slots: { tout: 'a', p1: '?', p2: 'b' }, gen: 'somme', map: v => ({ a: v.s, b: v.p, r: v.q }) },
    TIg: { niv: [3], motPiege: true, plafond1: 30, forme: 'pt', slots: { tout: 'b', p1: '?', p2: 'a' }, gen: 'somme', map: v => ({ a: v.p, b: v.s, r: v.q }) },
    TIp: { niv: [3], motPiege: true, plafond1: 30, forme: 'pt', slots: { tout: '?', p1: 'a', p2: 'b' }, gen: 'somme', map: v => ({ a: v.p, b: v.q, r: v.s }) },
    CE: { niv: [2, 3], niv1: true, motPiege: true, plafond1: 30, forme: 'cmp', slots: { grand: 'b', petit: 'a', ecart: '?' }, gen: 'somme', map: v => ({ a: v.p, b: v.s, r: v.q }) },
    CPlus: { niv: [2, 3], forme: 'cmp', slots: { grand: '?', petit: 'a', ecart: 'b' }, gen: 'somme', map: v => ({ a: v.p, b: v.q, r: v.s }) },
    CMoins: { niv: [2, 3], forme: 'cmp', slots: { grand: 'a', petit: '?', ecart: 'b' }, gen: 'somme', map: v => ({ a: v.s, b: v.p, r: v.q }) },
    CInvP: { niv: [3], motPiege: true, plafond1: 30, forme: 'cmp', slots: { grand: 'a', petit: '?', ecart: 'b' }, gen: 'somme', map: v => ({ a: v.s, b: v.p, r: v.q }) },
    CInvM: { niv: [3], motPiege: true, plafond1: 30, forme: 'cmp', slots: { grand: '?', petit: 'a', ecart: 'b' }, gen: 'somme', map: v => ({ a: v.p, b: v.q, r: v.s }) },

    // Multiplicatives : groupes égaux (grp) et « fois plus » (fois)
    GT: { niv: [1, 2, 3], forme: 'grp', slots: { total: '?', nb: 'a', taille: 'b' }, gen: 'produit', map: v => ({ a: v.n, b: v.t, r: v.p }) },
    GP: { niv: [1, 2, 3], forme: 'grp', slots: { total: 'a', nb: 'b', taille: '?' }, gen: 'produit', map: v => ({ a: v.p, b: v.n, r: v.t }) },
    GG: { niv: [2, 3], niv1: true, plafond1: 50, forme: 'grp', slots: { total: 'a', nb: '?', taille: 'b' }, gen: 'produit', map: v => ({ a: v.p, b: v.t, r: v.n }) },
    FP: { niv: [3], forme: 'fois', slots: { petit: 'a', fois: 'b', grand: '?' }, gen: 'produit', map: v => ({ a: v.t, b: v.n, r: v.p }), limites: { b: [2, 5] } },

    // Horaires : frise du temps (début + durée = fin)
    HF: { niv: [1, 2, 3], forme: 'frise', slots: { debut: 'a', duree: 'b', fin: '?' }, gen: 'horaire', map: v => ({ a: v.d, b: v.u, r: v.f }), formats: { a: 'heure', b: 'duree', r: 'heure' } },
    HD: { niv: [2, 3], forme: 'frise', slots: { debut: 'a', duree: '?', fin: 'b' }, gen: 'horaire', map: v => ({ a: v.d, b: v.f, r: v.u }), formats: { a: 'heure', b: 'heure', r: 'duree' } },
    HI: { niv: [3], forme: 'frise', slots: { debut: '?', duree: 'b', fin: 'a' }, gen: 'horaire', map: v => ({ a: v.f, b: v.u, r: v.d }), formats: { a: 'heure', b: 'duree', r: 'heure' } },

    // Deux étapes (Grand Défi) : les étapes sont décrites par le modèle
    D2: { niv: [1, 2, 3], forme: null, deuxEtapes: true },
  };

  // Nombres par grade (structures additives)
  const NIV = {
    1: { max: 99, min: 3, bas: 10 },
    2: { max: 999, min: 11, bas: 100 },
    3: { max: 9999, min: 40, bas: 1000 },
  };

  const GEN = {
    somme(niv, max) {
      const N = NIV[niv];
      const m = Math.min(N.max, max);
      const bas = Math.min(N.bas, Math.floor(m / 2));
      const mini = Math.min(N.min, Math.max(1, Math.floor(m / 6)));
      const s = rnd(Math.max(bas, 2 * mini + 2), m);
      const p = rnd(mini, s - mini);
      return { p, q: s - p, s };
    },
    produit(niv) {
      let n, t;
      if (niv <= 1) { n = rnd(2, 5); t = rnd(2, 5); }
      else if (niv === 2) { n = rnd(2, 9); t = rnd(2, 9); }
      else if (Math.random() < 0.35) { n = rnd(3, 9); t = rnd(3, 9); }
      else if (Math.random() < 0.5) { n = rnd(2, 9); t = rnd(11, 60); }
      else { n = rnd(11, 40); t = rnd(2, 9); }
      return { n, t, p: n * t };
    },
    horaire(niv) {
      let d, u;
      if (niv <= 1) {
        d = rnd(7, 17) * 60 + choix([0, 30]);
        u = choix([30, 60, 90, 120, 180]);
      } else if (niv === 2) {
        d = rnd(7, 18) * 60 + 5 * rnd(0, 9);
        u = 5 * rnd(2, 11 - (d % 60) / 5);
        if (Math.random() < 0.25) u = 60 * rnd(1, 3);
      } else {
        d = rnd(7, 18) * 60 + 5 * rnd(0, 11);
        u = 5 * rnd(3, 27);
      }
      return { d, u, f: d + u };
    },
  };

  const OPS = {
    '+': (g, d) => g + d,
    '−': (g, d) => g - d,
    '×': (g, d) => g * d,
    '÷': (g, d) => (d !== 0 && g % d === 0 ? g / d : NaN),
  };

  // Opération déduite du schéma : quel calcul fait trouver le « ? »
  function opDepuisSchema(forme, s) {
    if (forme === 'pt') {
      if (s.tout === '?') return { signe: '+', g: s.p1, d: s.p2 };
      return { signe: '−', g: s.tout, d: s.p1 === '?' ? s.p2 : s.p1 };
    }
    if (forme === 'cmp') {
      if (s.grand === '?') return { signe: '+', g: s.petit, d: s.ecart };
      if (s.petit === '?') return { signe: '−', g: s.grand, d: s.ecart };
      return { signe: '−', g: s.grand, d: s.petit };
    }
    if (forme === 'grp') {
      if (s.total === '?') return { signe: '×', g: s.nb, d: s.taille };
      if (s.taille === '?') return { signe: '÷', g: s.total, d: s.nb };
      return { signe: '÷', g: s.total, d: s.taille };
    }
    if (forme === 'fois') return { signe: '×', g: s.petit, d: s.fois };
    if (forme === 'frise') {
      if (s.fin === '?') return { signe: '+', g: s.debut, d: s.duree };
      if (s.duree === '?') return { signe: '−', g: s.fin, d: s.debut };
      return { signe: '−', g: s.fin, d: s.duree };
    }
    throw new Error('forme inconnue : ' + forme);
  }

  // ---------------------------------------------------------------------------
  // Pièges (phrases avec un nombre inutile)
  // ---------------------------------------------------------------------------
  const PIEGES_COMMUNS = [
    { f: P => `${P.n} a {d|crayons} dans sa trousse.`, v: () => rnd(5, 19) },
    { f: () => `La fusée d'Alvin a {d|hublots}.`, v: () => 4 },          // faits fixes sur Alvin : l'histoire reste la même d'un problème à l'autre
    { f: () => `Alvin a {d|moustaches}.`, v: () => 12 },
    { f: P => `Dans la classe ${P.de}, il y a {d|élèves}.`, v: () => rnd(19, 29), sansAlvin: true },
    { f: P => `${P.n} a {d|ans}.`, v: () => rnd(7, 11), sansAlvin: true },
    { f: () => `Il fait beau depuis {d|jours}.`, v: () => rnd(3, 15) },
    { f: P => `${P.n} a {d|images} dans son album.`, v: niv => rnd(NIV[niv].min, Math.min(NIV[niv].max, 500)), memeOrdre: true },
  ];

  // Une phrase « dépend » de la précédente si elle contient un pronom de rappel (il, elle, en, les, lui…),
  // commence par « C'est » ou par un mot de liaison (Ensuite, Puis…) : on n'insère jamais une phrase piège
  // juste avant elle, et la question n'est déplacée (début, milieu) que si rien ne se retrouve sans son antécédent.
  // Heuristique prudente : dans le doute, la phrase est déclarée dépendante.
  const IMPERSONNELS = 'y a|y avait|y aura|y aurait|reste|restait|restera|faut|fallait|faudra|manque|manquait|manquera|fait|pleut';
  const RE_IMPERS = new RegExp(`\\b[Ii]l (?:${IMPERSONNELS})\\b`, 'g');
  const RE_IMPERS_INV = new RegExp(`\\b(?:${IMPERSONNELS})(?:-t)?-il\\b`, 'g');
  const RE_INVERSION = /([\p{L}]+)-(?:t-)?(il|elle|ils|elles|on)\b/gu;
  const DETERMINANTS = /^(le|la|l'|l’|les|un|une|chaque|ce|cet|cette|ces|son|sa|ses|mon|ma|mes|ton|ta|tes|notre|nos|votre|vos|tout|toute|tous|toutes)$/i;
  const MOTS_DEBUT = /^(Combien|Quel|Quelle|Quels|Quelles|Où|Quand|Comment|Pourquoi|À|A|Au|Aux|En|Dans|Pour|Sur|Sous|Avec|Après|Avant|Pendant|Chez|Depuis|Le|La|Les|L|Un|Une|Ce|Cet|Cette|Ces|Hier|Demain|Ce|Chaque|Tous|Toutes|Tout|De|Des|Du|Sa|Son|Ses|Mon|Ma|Mes|Leur|Leurs|Il|Elle|Ils|Elles|On|Si|Lors|Par|Entre|Vers|Ici|Là|Aujourd|Maintenant|Cette)$/;
  const LIAISONS = /^(Ensuite|Puis|Alors|Mais|Et|Enfin|Finalement|Plus tard|Le lendemain|Donc|Pourtant|Cependant|Au total|En tout|Ensemble|Lui|Elle aussi|Lui aussi|Eux|Cela|Ça|Celui|Celle|Ceux|Celles)\b/;
  // vrai sujet nominal avant le verbe inversé (« Léa a-t-elle », « le car part-il », « chaque ami reçoit-il »)
  function sujetNominal(avant) {
    const mots = avant.trim().split(/[\s'’]+/).filter(Boolean);
    return mots.some(m => DETERMINANTS.test(m) || (/^[A-ZÀ-Ý]/.test(m) && !MOTS_DEBUT.test(m)));
  }
  function dependDuContexte(phrase) {
    let p = String(phrase).trim();
    if (/^C['’]est\b/.test(p) || LIAISONS.test(p)) return true;
    p = p.replace(RE_IMPERS, '').replace(RE_IMPERS_INV, '');
    // inversion du sujet : redondante après un sujet nominal, sinon le pronom inversé est le vrai sujet
    p = p.replace(RE_INVERSION, (m, verbe, pron, pos, tout) => (sujetNominal(tout.slice(0, pos)) ? verbe : verbe + ' ' + pron));
    if (/\b(il|elle|ils|elles|Il|Elle|Ils|Elles|lui|Lui|leur|leurs|Leur|Leurs|eux|celle|celui|celles|ceux|aussi|encore|autre|autres|même|cela|ça)\b/.test(p)) return true;
    // « chacun » sujet renvoie au contexte (« chacun reçoit… »), pas « à 4 € chacun. » en fin de phrase
    if (/\bchacun(e)?\b(?!\s*[.!?]?\s*$)/.test(p)) return true;
    const mots = p.split(/\s+/);
    for (let i = 0; i < mots.length; i++) {
      const m = mots[i].replace(/[.,;:!?]+$/, '');
      const avant = i ? mots[i - 1].replace(/[.,;:!?]+$/, '') : '';
      const apres = (mots[i + 1] || '').replace(/[.,;:!?]+$/, '');
      const sujet = /^(il|elle|ils|elles|on|ne|n'|n’|y|nous|vous|je|tu)$/i.test(avant)
        || (/^[A-ZÀ-Ý]/.test(avant) && !MOTS_DEBUT.test(avant.split(/['’]/)[0]));
      // « en » pronom : « Léa en gagne », « Combien en a-t-elle », « il y en a » (mais pas « en tout », « en bus »)
      if (m === 'en' && (sujet || /^(combien|Combien|pour|sans)$/.test(avant))) return true;
      // « les », « la », « l' » pronoms : après un sujet, ou devant un infinitif (« pour les ranger »)
      if (/^(les|la)$/.test(m) && (sujet || (/^(pour|de|sans|à)$/i.test(avant) && /(er|ir|re|oir)$/.test(apres)))) return true;
      if (/^l['’]/.test(m) && sujet) return true;   // « Léa l'achète »
      if (/^(d['’]en|y)$/.test(m) && sujet) return true;
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // Mise en texte
  // ---------------------------------------------------------------------------
  const RE_TROU = /\{([abcdex])(?:\|([^}]*))?\}/g;

  function segmenter(phrase, vals, formats) {
    const segs = [];
    let dernier = 0;
    phrase.replace(RE_TROU, (m, k, u, pos) => {
      if (pos > dernier) segs.push({ t: phrase.slice(dernier, pos) });
      segs.push({ k, v: vals[k], u: u || '', f: formats[k] || 'nombre' });
      dernier = pos + m.length;
      return m;
    });
    if (dernier < phrase.length) segs.push({ t: phrase.slice(dernier) });
    return segs;
  }
  const texteDonnee = s => formater(s.v, s.f) + (s.u ? ' ' + s.u : '');
  const texteBrut = segs => segs.map(s => (s.t != null ? s.t : texteDonnee(s))).join('');
  const remplir = (t, vals, formats) => t.replace(/\{([abcderx])(?:\|([^}]*))?\}/g, (m, k, u) => formater(vals[k], formats[k] || 'nombre') + (u ? ' ' + u : ''));

  // ---------------------------------------------------------------------------
  // Banques
  // ---------------------------------------------------------------------------
  function ajouter(notion, modeles) {
    if (!BANQUES[notion]) throw new Error('notion inconnue : ' + notion);
    for (const m of modeles) {
      if (!S[m.structure]) throw new Error(`${m.id} : structure inconnue ${m.structure}`);
      if (BANQUES[notion].some(x => x.id === m.id)) throw new Error('identifiant en double : ' + m.id);
      BANQUES[notion].push(m);
    }
  }
  function ajouterPieges(notion, liste) { PIEGES[notion].push(...liste); }
  // niv1 : structure ouverte aussi au grade 1 (partie cherchée, comparaison, groupement), avec de petits nombres,
  // pour les modèles sans grade imposé dont le contexte reste vraisemblable avec des nombres < 100 (pas de max > 2 000,
  // ni de tirage propre borné par un max : ces modèles-là sont pensés pour les grades 2 et 3).
  // motPiege : les structures où le mot-clé trompe (TTg, TTp, TIg, TIp, CE, CInvP, CInvM) sont ouvertes aux grades 1
  // et 2 (nombres ≤ 30 au grade 1) pour les modèles à tirage automatique (sans nombres(), sans limites, max ≤ 2 000)
  // dont les grades imposés comprennent le grade 2. Un modèle peut refuser le grade 1 avec sansGrade1: true.
  const ouvertMotsPieges = (m, st) => !!st.motPiege && !m.sansGrade1 && !m.nombres && !m.limites
    && (!m.max || m.max <= 2000) && (!m.niveaux || m.niveaux.includes(2));
  const niveauxDe = m => {
    const st = S[m.structure];
    let n;
    if (m.niveaux) n = m.niveaux.slice();
    else n = st.niv1 && !m.sansGrade1 && (!m.max || (!m.nombres && m.max <= 2000)) ? [1, ...st.niv] : st.niv.slice();
    if (ouvertMotsPieges(m, st)) {
      for (const g of [1, 2]) if (!n.includes(g)) n.push(g);
      n.sort((x, y) => x - y);
    }
    return n;
  };
  const estMotPiege = m => !!(S[m.structure] && S[m.structure].motPiege);
  const TYPES_REPONSE = ['nombre', 'qui', 'ouinon', 'impossible'];
  const typeDe = m => m.reponse || 'nombre';
  const aComparer = m => m.reponse === 'qui' || m.reponse === 'ouinon';
  // formats des nombres : ceux de la structure, puis ceux du modèle ; la valeur à comparer (c) prend le format du résultat
  function formatsDe(modele, st) {
    const f = { ...(st.formats || {}), ...(modele.formats || {}) };
    if (aComparer(modele) && !f.c && f.r) f.c = f.r;
    return f;
  }

  // ---------------------------------------------------------------------------
  // Tirage des nombres + validation
  // ---------------------------------------------------------------------------
  function dansLimites(vals, limites) {
    for (const [k, [lo, hi]] of Object.entries(limites || {})) {
      if (vals[k] == null) continue;
      if (vals[k] < lo || vals[k] > hi) return false;
    }
    return true;
  }

  function calculerEtapes(modele, st, vals) {
    if (st.deuxEtapes) {
      const v = { ...vals };
      for (const e of modele.etapes) {
        v[e.res] = OPS[e.signe](v[e.g], v[e.d]);
      }
      return v;
    }
    const op = opDepuisSchema(st.forme, st.slots);
    const v = { ...vals };
    if (v.r == null) v.r = OPS[op.signe](v[op.g], v[op.d]);
    return v;
  }

  function valeursValides(modele, st, v, niv) {
    const formats = formatsDe(modele, st);
    const cles = ['a', 'b', 'c', 'x', 'r'].filter(k => v[k] != null);
    for (const k of cles) {
      if (!Number.isInteger(v[k]) || v[k] < 1) return false;
      const f = formats[k] || 'nombre';
      if (f === 'nombre' && modele.max && v[k] > modele.max) return false;
      if (f === 'heure' && (v[k] < 6 * 60 || v[k] > 22 * 60)) return false;
    }
    // données toutes différentes, et différentes du résultat
    if (new Set(cles.map(k => v[k])).size !== cles.length) return false;
    if (!dansLimites(v, st.limites) || !dansLimites(v, modele.limites)) return false;
    if (st.deuxEtapes) {
      for (const e of modele.etapes) {
        if (e.signe === '−' && v[e.g] <= v[e.d]) return false;
      }
    }
    return true;
  }

  // Valeur à comparer au résultat (types 'qui' et 'ouinon') : proche du résultat, au-dessus ou en dessous
  // (une chance sur deux), pour qu'on ne puisse pas répondre sans calculer.
  function valeurAComparer(r, f, niv) {
    let d;
    if (f === 'heure' || f === 'duree') {
      const pas = niv <= 1 ? 30 : niv === 2 ? 15 : 5;
      d = pas * rnd(1, niv <= 1 ? 2 : 4);
    } else {
      d = rnd(1, Math.max(3, Math.round(r * 0.25)));
    }
    const enDessous = Math.random() < 0.5 || (f === 'nombre' && r + d > NIV[niv].max);
    return enDessous && r - d >= 1 ? r - d : r + d;
  }

  function tirerNombres(modele, st, niv) {
    const formats = formatsDe(modele, st);
    const plafond = niv === 1 && st.plafond1 && st.gen === 'somme' ? st.plafond1 : Infinity;
    for (let essai = 0; essai < 400; essai++) {
      let vals;
      if (modele.nombres) vals = { ...modele.nombres(niv, rnd, choix) };
      else vals = st.map(GEN[st.gen](niv, Math.min(modele.max || Infinity, plafond)));
      const v = calculerEtapes(modele, st, vals);
      if (aComparer(modele) && v.c == null && v.r != null) v.c = valeurAComparer(v.r, formats.r || 'nombre', niv);
      if (valeursValides(modele, st, v, niv)) return v;
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Instanciation d'un modèle
  // ---------------------------------------------------------------------------
  // Nombre de phrases pièges : grade 1 → un problème sur deux (une phrase) ; grades 2-3 → deux problèmes sur trois
  // (une ou deux phrases). options.piege : true (au moins une), false (aucune) ou un nombre exact (0, 1 ou 2).
  function nombreDePieges(niv, opt, modele) {
    if (modele.sansPiege) return 0;
    const max = typeDe(modele) === 'impossible' ? 1 : 2;  // problème « il manque une info » : court
    let n;
    if (typeof opt === 'number') n = opt;
    else if (opt === false) n = 0;
    else if (opt === true) n = niv <= 1 ? 1 : (Math.random() < 0.4 ? 2 : 1);
    else {
      const x = Math.random();
      n = niv <= 1 ? (x < 0.5 ? 1 : 0) : x < 1 / 3 ? 0 : x < 0.75 ? 1 : 2;
    }
    return Math.max(0, Math.min(max, n));
  }

  // Pièges « dans la même unité » fabriqués d'après l'énoncé, pour les modèles sans piegesContexte :
  // si l'énoncé dit « Léa a {a|billes} » et que la question nomme Léa (ou l'autre personnage), on ajoute
  // « Hugo, un ami de Léa, a {d|billes}. » (un troisième personnage, absent de la question).
  function piegesUnite(t, A, B, v, formats, modele, ctx) {
    if (typeDe(modele) === 'qui') return [];   // un 3e personnage changerait la réponse à « Qui… ? »
    const q = t.question;
    if (!q.includes(A.n) && !q.includes(B.n)) return [];
    const trouves = [];
    const vus = new Set();
    for (const ph of t.phrases) {
      const re = /(\S+) (?:a|avait) \{([abc])\|([^}]+)\}/g;
      let m;
      while ((m = re.exec(ph))) {
        const [, nom, k, u] = m;
        const X = nom === A.n ? A : nom === B.n ? B : null;
        if (!X || (formats[k] || 'nombre') !== 'nombre' || vus.has(u) || /fois/.test(u)) continue;
        vus.add(u);
        trouves.push({ u, X });
      }
    }
    if (!trouves.length) return [];
    const pris = new Set([A.n, B.n, ctx.enfant && ctx.enfant.n].filter(Boolean));
    const C = perso(choix(PRENOMS.filter(p => !pris.has(p.n))));
    const donnees = ['a', 'b', 'c'].filter(k => v[k] != null && (formats[k] || 'nombre') === 'nombre').map(k => v[k]);
    const lo = Math.max(1, Math.floor(Math.min(...donnees) * 0.5));
    let hi = Math.max(lo + 4, Math.ceil(Math.max(...donnees) * 1.3));
    if (modele.max) hi = Math.max(lo, Math.min(hi, modele.max));
    return trouves.map(({ u, X }) => ({
      phrase: () => choix([`${C.n} a {d|${u}}.`, `${C.n}, ${C.g === 'f' ? 'une amie' : 'un ami'} ${X.de}, a {d|${u}}.`]),
      v: () => rnd(lo, hi),
    }));
  }

  // Place de la question : à la fin (≈ 50 %), au début (≈ 30 %) ou au milieu (≈ 20 %) de l'énoncé.
  // Début : la question (ou questionDebut) ne doit pas dépendre du contexte, ni la 1re phrase (sauf phrasesDebut).
  // Milieu : la question ne dépend pas du contexte, et la phrase qui la suit non plus.
  // questionFin: true dans le modèle : toujours à la fin.
  const POIDS_POSITION = { fin: 0.5, debut: 0.3, milieu: 0.2 };
  function placerQuestion(modele, t, forcee) {
    const possibles = { fin: [t.phrases.length] };
    if (!modele.questionFin && t.phrases.length) {
      const qLibre = !!t.questionDebut || !dependDuContexte(t.question);
      if (qLibre && (t.phrasesDebut || !dependDuContexte(t.phrases[0]))) possibles.debut = [0];
      const milieux = [];
      for (let i = 1; i < t.phrases.length; i++) if (!dependDuContexte(t.phrases[i])) milieux.push(i);
      if (qLibre && milieux.length) possibles.milieu = milieux;
    }
    let position = forcee && possibles[forcee] ? forcee : null;
    if (!position) {
      const cles = Object.keys(possibles);
      let x = Math.random() * cles.reduce((s, k) => s + POIDS_POSITION[k], 0);
      position = cles.find(k => (x -= POIDS_POSITION[k]) < 0) || 'fin';
    }
    return { position, index: choix(possibles[position]), possibles: Object.keys(possibles) };
  }

  function ouiOuNon(modele, v) {
    const s = modele.ouiSi || 'plus';
    if (typeof s === 'function') return !!s(v);
    return s === 'moins' ? v.r < v.c : v.r > v.c;
  }

  // options : piege (true | false | 0-2), position ('fin' | 'debut' | 'milieu', si le modèle le permet)
  function instancier(modele, notion, niv, ctx = {}, options = {}) {
    const st = S[modele.structure];
    const type = typeDe(modele);
    const v = tirerNombres(modele, st, niv);
    if (!v) return null;
    const [A, B] = personnages(ctx);
    const D = duo(A, B);
    const t = modele.texte(A, B, D);
    const formats = formatsDe(modele, st);

    // 1. La question, à sa place
    const place = placerQuestion(modele, t, options.position);
    let items;
    if (place.position === 'debut') {
      items = [{ t: t.questionDebut || t.question, q: true }, ...(t.phrasesDebut || t.phrases).map(p => ({ t: p, q: false }))];
    } else {
      items = t.phrases.map(p => ({ t: p, q: false }));
      items.splice(place.index, 0, { t: place.position === 'fin' ? t.question : (t.questionDebut || t.question), q: true });
    }

    // 2. Les phrases pièges (un nombre inutile), de préférence dans la même unité que les données
    const distracteurs = [];
    const nb = nombreDePieges(niv, options.piege, modele);
    if (nb) {
      const sujet = items.map(x => x.t).join(' ').includes(A.n) ? A : perso(ALVIN);
      let proches = (modele.piegesContexte || []).map(p => ({ phrase: () => p.f(A, B, D), v: p.v }));
      if (!proches.length) proches = piegesUnite(t, A, B, v, formats, modele, ctx);
      const generiques = [...PIEGES_COMMUNS, ...(PIEGES[notion] || [])]
        .filter(p => !(p.sansAlvin && sujet.n === 'Alvin'))
        .map(p => ({ phrase: () => p.f(sujet), v: p.v }));
      const pris = new Set(Object.values(v));
      for (let i = 0; i < nb; i++) {
        const k = distracteurs.length ? 'e' : 'd';
        const prefere = proches.length && Math.random() < (i === 0 ? 0.85 : 0.5);
        const reserve = prefere || !generiques.length ? proches : generiques;
        if (!reserve.length) break;
        const p = choix(reserve);
        reserve.splice(reserve.indexOf(p), 1);   // jamais deux fois la même phrase
        let d = null;
        for (let essai = 0; essai < 30; essai++) {
          const c = p.v(niv, rnd);
          if (Number.isInteger(c) && c >= 1 && !pris.has(c)) { d = c; break; }
        }
        const places = [];
        for (let j = 1; j <= items.length; j++) {
          if (j < items.length ? !dependDuContexte(items[j].t) : !items[items.length - 1].q) places.push(j);
        }
        if (d == null || !places.length) continue;
        let phrase = p.phrase();
        if (k === 'e') phrase = phrase.replace(/\{d([|}])/g, '{e$1');
        pris.add(d);
        v[k] = d;
        items.splice(choix(places), 0, { t: phrase, q: false });
        distracteurs.push(k);
      }
    }

    const toutes = items.map(x => ({ segs: segmenter(x.t, v, formats), question: x.q }));
    const question = texteBrut(toutes.find(x => x.question).segs);
    const cartes = {};
    const presentes = new Set();
    toutes.forEach(ph => ph.segs.forEach(s => {
      if (!s.k) return;
      presentes.add(s.k);
      if (!cartes[s.k]) cartes[s.k] = texteDonnee(s);
    }));

    // Étapes de calcul
    let etapes;
    if (st.deuxEtapes) {
      const ux = t.uniteX ? ' ' + t.uniteX : '';
      cartes.x = formater(v.x, formats.x || 'nombre') + ux;
      etapes = modele.etapes.map((e, i) => ({
        schema: null,
        op: { signe: e.signe, g: v[e.g], d: v[e.d], r: v[e.res], gk: e.g, dk: e.d, rk: e.res, formats: { g: formats[e.g] || 'nombre', d: formats[e.d] || 'nombre', r: formats[e.res] || 'nombre' } },
        question: i === 0 ? t.sousQuestion : question,
        autresQuestions: i === 0 ? (t.autresQuestions || []).slice() : [],
        unite: i === 0 ? t.uniteX || '' : t.unite || '',
      }));
    } else {
      const op = opDepuisSchema(st.forme, st.slots);
      etapes = [{
        schema: { forme: st.forme, slots: { ...st.slots }, labels: { ...(t.labels || {}) } },
        op: { signe: op.signe, g: v[op.g], d: v[op.d], r: v.r, gk: op.g, dk: op.d, rk: 'r', formats: { g: formats[op.g] || 'nombre', d: formats[op.d] || 'nombre', r: formats.r || 'nombre' } },
        unite: t.unite || '',
      }];
    }

    // La réponse attendue, selon le type
    const R = x => remplir(x, v, formats);
    const texteDe = k => cartes[k] || formater(v[k], formats[k] || 'nombre')
      + (k === 'r' && t.unite && (formats.r || 'nombre') === 'nombre' ? ' ' + t.unite : '');
    let reponse;
    if (type === 'qui') {
      const plus = t.plus !== false;
      const cands = (t.candidats || []).map(c => ({ ...c, valeur: v[c.k] }));
      const gagnant = cands.reduce((g, c) => ((plus ? c.valeur > g.valeur : c.valeur < g.valeur) ? c : g), cands[0]);
      reponse = {
        type, plus, gagnant: gagnant.nom,
        juste: R(gagnant.phrase),
        fausses: [...cands.filter(c => c !== gagnant).map(c => R(c.phrase)), ...(t.fausses || []).map(R)],
        comparaison: cands.map(c => ({ label: c.nom, k: c.k, valeur: c.valeur, texte: texteDe(c.k) })),
      };
    } else if (type === 'ouinon') {
      const oui = ouiOuNon(modele, v);
      const et = t.etiquettes || {};
      reponse = {
        type, oui,
        juste: R(oui ? t.oui : t.non),
        fausses: [R(oui ? t.non : t.oui), ...(t.fausses || []).map(R)],
        comparaison: [
          { label: et.r || 'Ton résultat', k: 'r', valeur: v.r, texte: texteDe('r') },
          { label: et.c || 'À comparer', k: 'c', valeur: v.c, texte: texteDe('c') },
        ],
      };
    } else if (type === 'impossible') {
      const cles = etapes.flatMap(e => [e.op.gk, e.op.dk]);
      const manquantes = [...new Set(cles)].filter(k => /^[abc]$/.test(k) && !presentes.has(k));
      reponse = { type, juste: R(t.juste), fausses: (t.fausses || []).map(R), manque: t.manque ? R(t.manque) : '', manquantes };
    } else {
      reponse = { type: 'nombre', juste: R(t.juste), fausses: t.fausses.map(R) };
    }

    const utiles = [...presentes].filter(k => k !== 'd' && k !== 'e' && k !== 'x').sort();
    return {
      id: modele.id, notion, structure: modele.structure, niveau: niv,
      typeReponse: type, position: place.position, positionsPossibles: place.possibles,
      phrases: toutes,
      oral: toutes.map(ph => texteBrut(ph.segs)),
      question,
      vals: v, formats, cartes, utiles,
      distracteur: distracteurs[0] || null, distracteurs,
      etapes,
      reponse,
    };
  }

  // ---------------------------------------------------------------------------
  // Tirer un problème pour une notion et un grade
  // ---------------------------------------------------------------------------
  // Grade 1 : environ un problème sur 4 a une structure où le mot-clé trompe (voir motPiege)
  const PROBA_MOT_PIEGE = 0.25;
  function tirer(notion, niv, ctx = {}, options = {}) {
    const banque = BANQUES[notion] || [];
    const exclure = options.exclure || new Set();
    let candidats = banque.filter(m => niveauxDe(m).includes(niv) && (!options.structures || options.structures.includes(m.structure)));
    if (!candidats.length) candidats = banque.filter(m => niveauxDe(m).includes(niv));
    if (!candidats.length) candidats = banque.slice();
    if (!candidats.length) return null;
    if (niv === 1 && !options.structures) {
      const veut = Math.random() < (options.probaMotPiege != null ? options.probaMotPiege : PROBA_MOT_PIEGE);
      const groupe = candidats.filter(m => estMotPiege(m) === veut);
      if (groupe.length) candidats = groupe;
    }
    const neufs = candidats.filter(m => !exclure.has(m.id));
    let reserve = neufs.length ? neufs : candidats;
    if (options.themes && options.themes.length && Math.random() < 0.75) {
      const th = reserve.filter(m => (m.themes || []).some(x => options.themes.includes(x)));
      if (th.length >= 2) reserve = th;
    }
    if (options.eviterStructure) {
      const autres = reserve.filter(m => m.structure !== options.eviterStructure);
      if (autres.length) reserve = autres;
    }
    for (let essai = 0; essai < 25; essai++) {
      const m = choix(reserve);
      const p = instancier(m, notion, niv, ctx, options);
      if (p) return p;
    }
    return null;
  }

  // Calcul mental (coffres, échauffements)
  function calculMental(niv, notion, n = 3) {
    const gens = [
      () => [rnd(2, 9) + (niv > 1 ? 10 * rnd(1, 5) : 0), '+', rnd(2, 9)],
      () => { const a = rnd(11, 19) + (niv > 1 ? 10 * rnd(1, 7) : 0); return [a, '−', rnd(2, 9)]; },
      () => [10 * rnd(1, 8), '+', 10 * rnd(1, 9)],
      () => [rnd(1, 8) * (niv > 2 ? 100 : 10) + rnd(0, 9), '+', niv > 2 ? 100 : 10],
    ];
    if (notion === 'paquets' || niv > 1) gens.push(() => [rnd(2, niv > 1 ? 9 : 5), '×', rnd(2, niv > 1 ? 9 : 5)]);
    if (notion === 'paquets') gens.push(() => { const t = rnd(2, 5), n2 = rnd(2, 9); return [t * n2, '÷', t]; });
    return melange(gens.concat(gens)).slice(0, n).map(gen => {
      const [g, signe, d] = gen();
      return { g, signe, d, r: OPS[signe](g, d) };
    });
  }

  return {
    NOTIONS, STRUCTURES: S, BANQUES,
    ajouter, ajouterPieges, instancier, tirer, calculMental,
    formater, fmtNombre, fmtHeure, fmtDuree, texteDonnee, perso, PRENOMS,
    niveauxDe, opDepuisSchema,
    TYPES_REPONSE, typeDe, estMotPiege, dependDuContexte,
  };
})();
