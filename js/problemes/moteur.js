'use strict';
/*
 * Moteur de problèmes de Mission Galaxie.
 *  - Les banques (js/problemes/banques/*.js) décrivent des MODÈLES de problèmes : un texte + une structure.
 *  - Les STRUCTURES décrivent les mathématiques : tirage des nombres, schéma, opération.
 *  - instancier() fabrique un problème prêt à résoudre (texte découpé, valeurs, étapes de calcul).
 * Voir docs : cahier des charges (SPEC.md) fourni aux contributeurs.
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
  const S = {
    // Additives : partie-tout (pt) et comparaison (cmp)
    CT: { niv: [1, 2, 3], forme: 'pt', slots: { tout: '?', p1: 'a', p2: 'b' }, gen: 'somme', map: v => ({ a: v.p, b: v.q, r: v.s }) },
    CP: { niv: [2, 3], forme: 'pt', slots: { tout: 'a', p1: 'b', p2: '?' }, gen: 'somme', map: v => ({ a: v.s, b: v.p, r: v.q }) },
    TG: { niv: [1, 2, 3], forme: 'pt', slots: { tout: '?', p1: 'a', p2: 'b' }, gen: 'somme', map: v => ({ a: v.p, b: v.q, r: v.s }) },
    TP: { niv: [1, 2, 3], forme: 'pt', slots: { tout: 'a', p1: 'b', p2: '?' }, gen: 'somme', map: v => ({ a: v.s, b: v.p, r: v.q }) },
    TTg: { niv: [2, 3], forme: 'pt', slots: { tout: 'b', p1: 'a', p2: '?' }, gen: 'somme', map: v => ({ a: v.p, b: v.s, r: v.q }) },
    TTp: { niv: [2, 3], forme: 'pt', slots: { tout: 'a', p1: '?', p2: 'b' }, gen: 'somme', map: v => ({ a: v.s, b: v.p, r: v.q }) },
    TIg: { niv: [3], forme: 'pt', slots: { tout: 'b', p1: '?', p2: 'a' }, gen: 'somme', map: v => ({ a: v.p, b: v.s, r: v.q }) },
    TIp: { niv: [3], forme: 'pt', slots: { tout: '?', p1: 'a', p2: 'b' }, gen: 'somme', map: v => ({ a: v.p, b: v.q, r: v.s }) },
    CE: { niv: [2, 3], forme: 'cmp', slots: { grand: 'b', petit: 'a', ecart: '?' }, gen: 'somme', map: v => ({ a: v.p, b: v.s, r: v.q }) },
    CPlus: { niv: [2, 3], forme: 'cmp', slots: { grand: '?', petit: 'a', ecart: 'b' }, gen: 'somme', map: v => ({ a: v.p, b: v.q, r: v.s }) },
    CMoins: { niv: [2, 3], forme: 'cmp', slots: { grand: 'a', petit: '?', ecart: 'b' }, gen: 'somme', map: v => ({ a: v.s, b: v.p, r: v.q }) },
    CInvP: { niv: [3], forme: 'cmp', slots: { grand: 'a', petit: '?', ecart: 'b' }, gen: 'somme', map: v => ({ a: v.s, b: v.p, r: v.q }) },
    CInvM: { niv: [3], forme: 'cmp', slots: { grand: '?', petit: 'a', ecart: 'b' }, gen: 'somme', map: v => ({ a: v.p, b: v.q, r: v.s }) },

    // Multiplicatives : groupes égaux (grp) et « fois plus » (fois)
    GT: { niv: [1, 2, 3], forme: 'grp', slots: { total: '?', nb: 'a', taille: 'b' }, gen: 'produit', map: v => ({ a: v.n, b: v.t, r: v.p }) },
    GP: { niv: [1, 2, 3], forme: 'grp', slots: { total: 'a', nb: 'b', taille: '?' }, gen: 'produit', map: v => ({ a: v.p, b: v.n, r: v.t }) },
    GG: { niv: [2, 3], forme: 'grp', slots: { total: 'a', nb: '?', taille: 'b' }, gen: 'produit', map: v => ({ a: v.p, b: v.t, r: v.n }) },
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
    { f: () => `La fusée d'Alvin a {d|hublots}.`, v: () => rnd(3, 12) },
    { f: () => `Alvin a {d|moustaches}.`, v: () => rnd(12, 20) },
    { f: P => `Dans la classe ${P.de}, il y a {d|élèves}.`, v: () => rnd(19, 29), sansAlvin: true },
    { f: P => `${P.n} a {d|ans}.`, v: () => rnd(7, 11), sansAlvin: true },
    { f: () => `Il fait beau depuis {d|jours}.`, v: () => rnd(3, 15) },
    { f: P => `${P.n} a {d|images} dans son album.`, v: niv => rnd(NIV[niv].min, Math.min(NIV[niv].max, 500)), memeOrdre: true },
  ];

  // Une phrase « dépend » de la précédente si elle contient un pronom de rappel (il, elle, les, en…) :
  // on n'insère jamais la phrase piège juste avant elle.
  function dependDuContexte(phrase) {
    const p = phrase
      .replace(/\b[Ii]l (y a|y avait|y aura|reste|restait|restera|faut|fallait|faudra|manque|manquait|fait|pleut)\b/g, '')
      .replace(/-t-(il|elle|ils|elles|on)\b/g, '')
      .replace(/-(il|elle|ils|elles|on)\b/g, '');
    return /^C'est\b/.test(p) || /\b(il|elle|ils|elles|Il|Elle|Ils|Elles|en|les|lui|leur|leurs|eux|celle|celui|celles|ceux)\b/.test(p);
  }

  // ---------------------------------------------------------------------------
  // Mise en texte
  // ---------------------------------------------------------------------------
  const RE_TROU = /\{([abcdx])(?:\|([^}]*))?\}/g;

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
  const remplir = (t, vals, formats) => t.replace(/\{([abcdrx])(?:\|([^}]*))?\}/g, (m, k, u) => formater(vals[k], formats[k] || 'nombre') + (u ? ' ' + u : ''));

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
  const niveauxDe = m => m.niveaux || S[m.structure].niv;

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
    const formats = { ...(st.formats || {}), ...(modele.formats || {}) };
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

  function tirerNombres(modele, st, niv) {
    for (let essai = 0; essai < 400; essai++) {
      let vals;
      if (modele.nombres) vals = { ...modele.nombres(niv, rnd, choix) };
      else vals = st.map(GEN[st.gen](niv, modele.max || Infinity));
      const v = calculerEtapes(modele, st, vals);
      if (valeursValides(modele, st, v, niv)) return v;
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Instanciation d'un modèle
  // ---------------------------------------------------------------------------
  const PROBA_PIEGE = { 1: 0.25, 2: 0.4, 3: 0.55 };

  function instancier(modele, notion, niv, ctx = {}, options = {}) {
    const st = S[modele.structure];
    const v = tirerNombres(modele, st, niv);
    if (!v) return null;
    const [A, B] = personnages(ctx);
    const t = modele.texte(A, B, duo(A, B));
    const formats = { ...(st.formats || {}), ...(modele.formats || {}) };
    const phrases = t.phrases.slice();

    // Phrase piège
    let distracteur = null;
    const veutPiege = options.piege != null ? options.piege : Math.random() < (PROBA_PIEGE[niv] || 0.3);
    if (veutPiege && !modele.sansPiege) {
      const sujet = phrases.join(' ').includes(A.n) ? A : perso(ALVIN);
      const liste = [...PIEGES_COMMUNS, ...(PIEGES[notion] || [])].filter(p => !(p.sansAlvin && sujet.n === 'Alvin'));
      const p = choix(liste);
      let d = null;
      for (let essai = 0; essai < 30; essai++) {
        const c = p.v(niv, rnd);
        if (!Object.values(v).includes(c)) { d = c; break; }
      }
      const places = [];
      for (let i = 1; i <= phrases.length; i++) {
        const suivante = i < phrases.length ? phrases[i] : t.question;
        if (!dependDuContexte(suivante)) places.push(i);
      }
      if (d != null && places.length) {
        v.d = d;
        phrases.splice(choix(places), 0, p.f(sujet));
        distracteur = 'd';
      }
    }

    const toutes = [
      ...phrases.map(p => ({ segs: segmenter(p, v, formats), question: false })),
      { segs: segmenter(t.question, v, formats), question: true },
    ];
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
      const ux = t.uniteX ? ' ' + t.uniteX : '';
      cartes.x = formater(v.x, formats.x || 'nombre') + ux;
      etapes = modele.etapes.map((e, i) => ({
        schema: null,
        op: { signe: e.signe, g: v[e.g], d: v[e.d], r: v[e.res], gk: e.g, dk: e.d, rk: e.res, formats: { g: formats[e.g] || 'nombre', d: formats[e.d] || 'nombre', r: formats[e.res] || 'nombre' } },
        question: i === 0 ? t.sousQuestion : texteBrut(toutes[toutes.length - 1].segs),
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

    const utiles = [...presentes].filter(k => k !== 'd' && k !== 'x').sort();
    return {
      id: modele.id, notion, structure: modele.structure, niveau: niv,
      phrases: toutes,
      oral: toutes.map(ph => texteBrut(ph.segs)),
      question: texteBrut(toutes[toutes.length - 1].segs),
      vals: v, formats, cartes, utiles, distracteur,
      etapes,
      reponse: { juste: remplir(t.juste, v, formats), fausses: t.fausses.map(f => remplir(f, v, formats)) },
    };
  }

  // ---------------------------------------------------------------------------
  // Tirer un problème pour une notion et un grade
  // ---------------------------------------------------------------------------
  function tirer(notion, niv, ctx = {}, options = {}) {
    const banque = BANQUES[notion] || [];
    const exclure = options.exclure || new Set();
    let candidats = banque.filter(m => niveauxDe(m).includes(niv) && (!options.structures || options.structures.includes(m.structure)));
    if (!candidats.length) candidats = banque.filter(m => niveauxDe(m).includes(niv));
    if (!candidats.length) candidats = banque.slice();
    if (!candidats.length) return null;
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
  };
})();
