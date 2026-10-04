'use strict';
/* Sauvegarde locale (sur la tablette) : profil, réglages, progression dans les mondes. */
const Store = (() => {
  const CLE = 'missionGalaxie.v2';
  const ANCIENNE_CLE = 'missionGalaxie.v1';
  const NOTIONS = ['plusmoins', 'paquets', 'marche', 'tictac', 'defi'];

  const defaut = () => ({
    version: 2,
    profil: null, // { prenom, genre: 'f' | 'm', code, amis: [{ n, g }] }
    reglages: { alvinParle: true, lectureAuto: true, vitesse: 0.95, sons: true, voixNom: '', pause: 25 },
    notions: Object.fromEntries(NOTIONS.map(n => [n, { niveau: 1, historique: [] }])),
    planetes: {}, // id -> état de la planète (voir planete())
    planeteActuelle: 'plusmoins',
    debloquees: ['plusmoins'],
    etoiles: 0,
    carnet: [], // amis aidés : 'planete:pnj'
    souvenirs: [], // objets trouvés dans les coffres
    journal: [], // un résultat par problème résolu
    introVue: false,
  });

  function fusion(base, obj) {
    for (const k of Object.keys(obj || {})) {
      const b = base[k], o = obj[k];
      if (b && o && typeof b === 'object' && typeof o === 'object' && !Array.isArray(b) && !Array.isArray(o)) fusion(b, o);
      else base[k] = o;
    }
    return base;
  }

  const S = { data: defaut(), NOTIONS };

  function migrerV1(v1) {
    const d = defaut();
    if (v1.profil) d.profil = { amis: [], ...v1.profil };
    if (v1.reglages) Object.assign(d.reglages, v1.reglages);
    d.etoiles = v1.etoiles || 0;
    d.journal = Array.isArray(v1.journal) ? v1.journal.map(j => ({ ...j, notion: 'plusmoins' })) : [];
    if (v1.planetes && v1.planetes.plusmoins) d.notions.plusmoins.niveau = v1.planetes.plusmoins.niveau || 1;
    d.introVue = false; // on présente le nouveau monde
    return d;
  }

  S.charger = () => {
    try {
      const brut = localStorage.getItem(CLE);
      if (brut) S.data = fusion(defaut(), JSON.parse(brut));
      else {
        const ancien = localStorage.getItem(ANCIENNE_CLE);
        if (ancien) { S.data = migrerV1(JSON.parse(ancien)); S.sauver(); }
      }
    } catch (e) {
      S.data = defaut();
    }
    return S.data;
  };

  S.sauver = () => {
    try { localStorage.setItem(CLE, JSON.stringify(S.data)); } catch (e) { /* stockage indisponible */ }
  };

  S.reinitialiserProgression = () => {
    const { profil, reglages } = S.data;
    S.data = defaut();
    S.data.profil = profil;
    S.data.reglages = reglages;
    S.data.introVue = true;
    S.sauver();
  };

  // Accords fille / garçon pour l'enfant
  S.G = (f, m) => (S.data.profil && S.data.profil.genre === 'm' ? m : f);
  S.grade = n => [S.G('Cadette', 'Cadet'), 'Pilote', S.G('Commandante', 'Commandant')][n - 1];

  // Personnages utilisables dans les énoncés (le pnj est ajouté par le jeu)
  S.contexte = pnj => {
    const p = S.data.profil || {};
    return {
      enfant: p.prenom ? { n: p.prenom, g: p.genre || 'f' } : null,
      amis: (p.amis || []).filter(a => a.n && a.n.trim()).map(a => ({ n: a.n.trim(), g: a.g })),
      pnj: pnj ? { n: pnj.nom, g: pnj.g || 'm' } : null,
    };
  };

  // État d'une planète (créé à la première visite)
  S.planete = id => {
    if (!S.data.planetes[id]) {
      S.data.planetes[id] = { resolus: 0, pnj: {}, coffres: [], zones: [1], pos: null, terminee: false };
    }
    return S.data.planetes[id];
  };

  S.niveau = notion => S.data.notions[notion].niveau;

  // Un problème résolu : journal, grade de la notion, étoiles, avancée de la planète
  S.enregistrerProbleme = res => {
    const D = S.data;
    D.journal.push(res);
    if (D.journal.length > 800) D.journal.splice(0, D.journal.length - 800);
    const n = D.notions[res.notion];
    if (n) {
      n.historique.push(res.etoiles >= 2 ? 1 : 0);
      if (n.historique.length > 20) n.historique.shift();
    }
    D.etoiles += res.etoiles;
    if (res.planete) S.planete(res.planete).resolus++;
    S.sauver();
  };

  // Promotion : 8 problèmes réussis sur les 10 derniers de la notion
  S.verifierPromotion = notion => {
    const n = S.data.notions[notion];
    if (!n || n.niveau >= 3) return false;
    const recents = n.historique.slice(-10);
    if (recents.length >= 10 && recents.reduce((a, b) => a + b, 0) >= 8) {
      n.niveau++;
      n.historique = [];
      S.sauver();
      return true;
    }
    return false;
  };

  return S;
})();
