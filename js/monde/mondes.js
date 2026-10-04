'use strict';
/* Registre des planètes. Chaque fichier js/monde/mondes/<id>.js appelle Mondes.ajouter({...}). */
const Mondes = (() => {
  const liste = {};

  // Vocabulaire commun des cartes (un caractère = une case de 64 px)
  const MARCHABLE = new Set(['.', ',', ':', 'f', '=']);
  const LEGENDE = {
    '.': 'sol', ',': 'sol2', ':': 'chemin', 'f': 'fleurs', '~': 'eau', '=': 'pont', '#': 'falaise',
    'T': 'arbre', 'R': 'rocher', 'C': 'cristal', 'H': 'maison', 'X': 'barriere', 'M': 'special',
    'B': 'pontCasse', 'P': 'porte',
  };
  // Ce que devient une porte quand sa zone s'ouvre
  const OUVERTURE = { B: '=', P: ':' };

  const ESPECES = ['bulle', 'antenne', 'robot', 'plume', 'champi', 'etoile'];
  const ACCESSOIRES = [null, 'chapeau', 'noeud', 'lunettes', 'echarpe', 'couronne', 'tablier', 'casquette'];
  const THEMES = {
    plusmoins: ['jeux', 'ecole', 'cuisine', 'sport', 'nature', 'espace', 'animaux', 'voyage'],
    paquets: ['cuisine', 'fete', 'ecole', 'jardin', 'rangement', 'sport', 'animaux', 'espace'],
    marche: ['fruits', 'boulangerie', 'jouets', 'librairie', 'vetements', 'fete', 'cantine', 'espace'],
    tictac: ['horaires', 'cuisine', 'sport', 'ecole', 'bricolage', 'jardin', 'voyage', 'espace'],
    defi: ['jeux', 'cuisine', 'achats', 'voyage', 'fete', 'ecole', 'sport', 'espace'],
  };

  return {
    LARGEUR: 40, HAUTEUR: 30, TUILE: 64,
    LEGENDE, MARCHABLE, OUVERTURE, ESPECES, ACCESSOIRES, THEMES,
    ajouter(m) { liste[m.id] = m; },
    get: id => liste[id],
    liste: () => Object.values(liste).sort((a, b) => a.ordre - b.ordre),
    marchable: c => MARCHABLE.has(c),
  };
})();
