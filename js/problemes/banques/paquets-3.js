'use strict';
/*
 * Paquets — banque 3 : des problèmes de multiplication et de division qu'on ne peut PAS résoudre en devinant.
 *  - 001-010 : mot-piège (« chaque », « fois », « partage », « en tout »… mais l'opération n'est pas celle qu'on croit) ;
 *  - 011-021 : réponses « Qui… ? » et « Oui / Non » (calculer, puis comparer) ;
 *  - 022-028 : il manque une donnée (« On ne peut pas savoir ») ;
 *  - 029-043 : problèmes ordinaires, avec des phrases pièges dans la même unité (piegesContexte).
 * Nombres : grade 1 tables 2 à 5 ; grade 2 tables jusqu'à 9 ; grade 3 : 2 chiffres × 1 chiffre (comme paquets-1).
 */
(() => {
  const parmi = (...valeurs) => ({ valeurs });
  const tire = (x, rnd, choix) => (x.valeurs ? choix(x.valeurs) : rnd(x[0], x[1]));
  const DEFAUT = { 1: { n: [2, 5], t: [2, 5] }, 2: { n: [2, 9], t: [2, 9] } };
  const DEFAUT3 = {
    GT: [{ n: [11, 30], t: [3, 9] }, { n: [3, 9], t: [11, 30] }],
    GP: { n: [2, 6], t: [11, 30] },
    GG: { n: [11, 30], t: [2, 6] },
    FP: [{ n: [2, 5], t: [11, 30] }, { n: [2, 5], t: [4, 9] }],
  };
  // n groupes de t objets : a et b selon la structure (voir paquets-1.js)
  function groupes(structure, plages) {
    return (niv, rnd, choix) => {
      let p = plages[niv] || (niv >= 3 ? DEFAUT3[structure] : DEFAUT[niv]);
      if (Array.isArray(p)) p = choix(p);
      const n = tire(p.n, rnd, choix), t = tire(p.t, rnd, choix);
      if (structure === 'GT') return { a: n, b: t };
      if (structure === 'GP') return { a: n * t, b: n };
      if (structure === 'GG') return { a: n * t, b: t };
      return { a: t, b: n };
    };
  }
  // Nombre entier tiré selon le grade : g1, g2, g3 = [min, max]
  const selon = (g1, g2, g3) => (niv, rnd) => {
    const [lo, hi] = niv <= 1 ? g1 : niv === 2 ? g2 : (g3 || g2);
    return rnd(lo, hi);
  };

  const modeles = [
    // =========================================================================
    // MOT-PIÈGE : le mot de l'énoncé fait penser à la mauvaise opération
    // =========================================================================
    // « chaque » fait penser à × : ici on cherche le nombre de boîtes (÷)
    { id: 'paquets-3-001', structure: 'GG', themes: ['cuisine', 'ecole'],
      plages: { 1: { n: [2, 5], t: parmi(6) }, 2: { n: [3, 9], t: parmi(6) }, 3: { n: [11, 30], t: parmi(6) } },
      piegesContexte: [
        { f: () => `Le frigo de la cantine contient {d|bouteilles de lait}.`, v: selon([3, 12], [10, 40], [20, 80]) },
        { f: () => `Pour une omelette, la cantinière casse {d|œufs} chaque mardi.`, v: selon([7, 20], [20, 50], [40, 120]) },
      ],
      texte: () => ({
        phrases: [`Chaque boîte peut contenir {b|œufs}.`, `Le cuisinier de la cantine a {a|œufs} à ranger.`],
        question: 'Combien de boîtes le cuisinier peut-il remplir ?',
        labels: { total: 'tous les œufs', nb: 'boîtes', taille: 'œufs par boîte' },
        juste: 'Le cuisinier peut remplir {r} boîtes.',
        fausses: [`Le cuisinier a {r} œufs à ranger.`, `Chaque boîte contient {r} œufs.`],
        unite: 'boîtes',
      }) },
    // « fois » fait penser à × : ici on cherche la taille d'un escalier (÷)
    { id: 'paquets-3-002', structure: 'GP', themes: ['sport', 'fete'],
      plages: { 1: { n: [2, 5], t: [3, 6] }, 2: { n: [2, 9], t: [4, 9] }, 3: { n: [2, 6], t: [11, 25] } },
      piegesContexte: [
        { f: () => `Le petit toboggan a {d|marches}.`, v: selon([2, 4], [2, 4], [5, 10]) },
        { f: (A, B) => `${B.n} glisse {d|fois} sur le petit toboggan.`, v: (niv, rnd) => rnd(2, 9) },
      ],
      texte: A => ({
        phrases: [`${A.n} monte {b|fois} l'escalier du grand toboggan.`, `En tout, ${A.n} grimpe {a|marches}.`],
        question: "Combien de marches a l'escalier du grand toboggan ?",
        labels: { total: 'toutes les marches', nb: 'montées', taille: 'marches par montée' },
        juste: "L'escalier du grand toboggan a {r} marches.",
        fausses: [`${A.n} monte {r} fois l'escalier.`, `En tout, ${A.n} grimpe {r} marches.`],
        unite: 'marches',
      }) },
    // « partage » fait penser à ÷ : ici on cherche le total (×)
    { id: 'paquets-3-003', structure: 'GT', themes: ['ecole', 'fete'],
      piegesContexte: [
        { f: (A, B) => `${B.n} a {d|billes} dans sa poche.`, v: selon([4, 25], [10, 80], [20, 200]) },
        { f: A => `Le sac de billes ${A.de} est usé depuis {d|mois}.`, v: (niv, rnd) => rnd(2, 11) },
      ],
      texte: A => ({
        phrases: [`${A.n} partage toutes ses billes entre {a|amis}.`, `Chaque ami reçoit {b|billes}.`],
        question: `Combien de billes ${A.n} avait-${A.il} ?`,
        labels: { total: 'toutes les billes', nb: 'amis', taille: 'billes par ami' },
        juste: `${A.n} avait {r} billes.`,
        fausses: [`Chaque ami reçoit {r} billes.`, `${A.n} partage ses billes entre {r} amis.`],
        unite: 'billes',
      }) },
    // « fois plus » fait penser à × : ici on cherche le plus petit (÷)
    { id: 'paquets-3-004', structure: 'GP', themes: ['ecole'], niveaux: [3],
      plages: { 3: { n: [2, 5], t: [6, 30] } },
      piegesContexte: [
        { f: () => `Un paquet de cartes neuf contient {d|cartes}.`, v: (niv, rnd) => rnd(30, 60) },
        { f: A => `Le classeur ${A.de} peut contenir {d|cartes}.`, v: (niv, rnd) => 10 * rnd(16, 30) },
      ],
      texte: (A, B) => ({
        phrases: [`${A.n} a {a|cartes} dans sa collection.`, `${A.n} a {b|fois} plus de cartes ${B.que}.`],
        question: `Combien de cartes ${B.n} a-t-${B.il} ?`,
        labels: { total: `cartes ${A.de}`, nb: 'fois', taille: `cartes ${B.de}` },
        juste: `${B.n} a {r} cartes.`,
        fausses: [`${B.n} a {r} cartes de plus ${A.que}.`, `${A.n} a {r} cartes.`],
        unite: 'cartes',
      }) },
    // « en tout » fait penser à + : ici on cherche le nombre d'équipes (÷)
    { id: 'paquets-3-005', structure: 'GG', themes: ['sport'],
      plages: { 1: { n: [2, 5], t: parmi(4, 5) }, 2: { n: [3, 9], t: parmi(4, 5, 6) }, 3: { n: [11, 24], t: parmi(5, 6, 7) } },
      piegesContexte: [
        { f: () => `Le tournoi de foot dure {d|heures}.`, v: (niv, rnd) => rnd(2, 6) },
        { f: () => `L'année dernière, {d|enfants} ont participé au tournoi de foot.`, v: selon([8, 30], [20, 60], [60, 200]) },
      ],
      texte: () => ({
        phrases: [`En tout, {a|enfants} participent au tournoi de foot.`, `Chaque équipe a {b|joueurs}.`],
        question: "Combien d'équipes y a-t-il dans le tournoi de foot ?",
        labels: { total: 'tous les enfants', nb: 'équipes', taille: 'joueurs par équipe' },
        juste: 'Il y a {r} équipes dans le tournoi.',
        fausses: [`Chaque équipe a {r} joueurs.`, `Il y a {r} enfants dans le tournoi.`],
        unite: 'équipes',
      }) },
    // « chaque » dans la question : ici on partage (÷)
    { id: 'paquets-3-006', structure: 'GP', themes: ['animaux', 'cuisine'],
      piegesContexte: [
        { f: () => `Dans le poulailler du fermier, il y a {d|poules}.`, v: selon([3, 12], [5, 20], [10, 40]) },
        { f: () => `Le fermier vend une boîte d'œufs {d|€}.`, v: (niv, rnd) => rnd(2, 4) },
      ],
      texte: () => ({
        phrases: [`Le fermier a {a|œufs}.`, `Le fermier range ses œufs dans {b|boîtes} : toutes les boîtes contiennent autant d'œufs.`],
        question: "Combien d'œufs y a-t-il dans chaque boîte ?",
        labels: { total: 'tous les œufs', nb: 'boîtes', taille: 'œufs par boîte' },
        juste: "Il y a {r} œufs dans chaque boîte.",
        fausses: [`Le fermier a {r} boîtes.`, `Le fermier a {r} œufs.`],
        unite: 'œufs',
      }) },
    // « répartit » fait penser à ÷ : ici on cherche le total (×)
    { id: 'paquets-3-007', structure: 'GT', themes: ['jardin'],
      piegesContexte: [
        { f: () => `Dans la serre, il reste {d|pots} vides.`, v: (niv, rnd) => rnd(2, 9) },
        { f: () => `Le sachet de graines de tomates contient {d|graines}.`, v: selon([10, 40], [30, 90], [100, 300]) },
      ],
      texte: () => ({
        phrases: [`Le jardinier répartit ses graines de fleurs dans {a|pots}.`, `Le jardinier met {b|graines} dans chaque pot.`],
        question: 'Combien de graines de fleurs le jardinier a-t-il réparties ?',
        labels: { total: 'toutes les graines', nb: 'pots', taille: 'graines par pot' },
        juste: 'Le jardinier a réparti {r} graines de fleurs.',
        fausses: [`Le jardinier a {r} pots.`, `Il y a {r} graines dans chaque pot.`],
        unite: 'graines',
      }) },
    // « à la fois » : on cherche le nombre de tours de bateau (÷)
    { id: 'paquets-3-008', structure: 'GG', themes: ['sport', 'fete'],
      plages: { 1: { n: [2, 5], t: [3, 6] }, 2: { n: [3, 9], t: [4, 9] }, 3: { n: [11, 25], t: [4, 8] } },
      piegesContexte: [
        { f: () => `Un tour de bateau sur le lac dure {d|minutes}.`, v: (niv, rnd) => 5 * rnd(2, 6) },
        { f: () => `Sur le lac, {d|canards} nagent près du bateau.`, v: selon([3, 12], [5, 20], [10, 30]) },
      ],
      texte: () => ({
        phrases: [`Le bateau du lac peut emmener {b|enfants} à la fois.`, `Au bord du lac, {a|enfants} attendent pour faire un tour de bateau.`],
        question: 'Combien de fois le bateau doit-il partir pour emmener tous les enfants ?',
        labels: { total: 'tous les enfants', nb: 'tours de bateau', taille: 'enfants par tour' },
        juste: 'Le bateau doit partir {r} fois.',
        fausses: [`Le bateau emmène {r} enfants à la fois.`, `Il y a {r} enfants au bord du lac.`],
        unite: 'fois',
      }) },
    // « fois moins » fait penser à ÷ : ici on cherche le plus grand (×)
    { id: 'paquets-3-009', structure: 'FP', themes: ['ecole'],
      piegesContexte: [
        { f: A => `Le classeur ${A.de} peut contenir {d|cartes}.`, v: (niv, rnd) => 10 * rnd(20, 40) },
        { f: () => `Un paquet de cartes neuf contient {d|cartes}.`, v: (niv, rnd) => rnd(30, 60) },
      ],
      texte: (A, B) => ({
        phrases: [`${B.n} a {a|cartes}.`, `${B.n} a {b|fois} moins de cartes ${A.que}.`],
        question: `Combien de cartes ${A.n} a-t-${A.il} ?`,
        labels: { petit: B.n, grand: A.n },
        juste: `${A.n} a {r} cartes.`,
        fausses: [`${B.n} a {r} cartes.`, `${A.n} a {r} cartes de moins ${B.que}.`],
        unite: 'cartes',
      }) },
    // « rapporte » fait penser à + : ici on cherche le nombre de voyages (÷)
    { id: 'paquets-3-010', structure: 'GG', themes: ['espace'],
      piegesContexte: [
        { f: () => `La fusée d'Alvin a {d|réacteurs}.`, v: (niv, rnd) => rnd(2, 4) },
        { f: () => `Hier, le robot Bip a rapporté {d|cristaux} à la base.`, v: selon([4, 25], [10, 80], [20, 150]) },
      ],
      texte: () => ({
        phrases: [`Alvin veut rapporter {a|cristaux} jusqu'à sa fusée.`, `À chaque voyage, Alvin porte {b|cristaux}.`],
        question: 'Combien de voyages Alvin doit-il faire ?',
        labels: { total: 'tous les cristaux', nb: 'voyages', taille: 'cristaux par voyage' },
        juste: 'Alvin doit faire {r} voyages.',
        fausses: [`Alvin porte {r} cristaux à chaque voyage.`, `Alvin veut rapporter {r} cristaux.`],
        unite: 'voyages',
      }) },

    // =========================================================================
    // QUI… ? et OUI / NON : on calcule, puis on compare
    // =========================================================================
    { id: 'paquets-3-011', structure: 'GT', reponse: 'qui', themes: ['ecole', 'fete'],
      texte: (A, B) => ({
        phrases: [`${A.n} achète {a|paquets} de {b|autocollants}.`, `${B.n} a {c|autocollants}.`],
        question: "Qui a le plus d'autocollants ?",
        labels: { total: `autocollants ${A.de}`, nb: 'paquets', taille: 'par paquet' },
        candidats: [
          { nom: A.n, k: 'r', phrase: `C'est ${A.n} qui a le plus d'autocollants : {r} autocollants.` },
          { nom: B.n, k: 'c', phrase: `C'est ${B.n} qui a le plus d'autocollants : {c} autocollants.` },
        ],
        plus: true,
        fausses: [`${A.n} et ${B.n} ont autant d'autocollants.`],
        unite: 'autocollants',
      }) },
    { id: 'paquets-3-012', structure: 'GT', reponse: 'qui', themes: ['cuisine'],
      plages: { 1: { n: [2, 5], t: [4, 6] }, 2: { n: [2, 5], t: [6, 9] }, 3: { n: [3, 6], t: [11, 20] } },
      texte: (A, B) => ({
        phrases: [`${A.n} prépare {a|plaques} de {b|cookies}.`, `${B.n} prépare {c|cookies}.`],
        question: 'Qui prépare le moins de cookies ?',
        labels: { total: `cookies ${A.de}`, nb: 'plaques', taille: 'par plaque' },
        candidats: [
          { nom: A.n, k: 'r', phrase: `C'est ${A.n} qui prépare le moins de cookies : {r} cookies.` },
          { nom: B.n, k: 'c', phrase: `C'est ${B.n} qui prépare le moins de cookies : {c} cookies.` },
        ],
        plus: false,
        fausses: [`${A.n} et ${B.n} préparent autant de cookies.`],
        unite: 'cookies',
      }) },
    { id: 'paquets-3-013', structure: 'GP', reponse: 'qui', themes: ['fete'],
      texte: (A, B) => ({
        phrases: [`${A.n} partage {a|bonbons} équitablement entre {b|amis}.`, `${B.n} donne {c|bonbons} à chacun de ses cousins.`],
        question: `Qui reçoit le plus de bonbons : un ami ${A.de} ou un cousin ${B.de} ?`,
        labels: { total: 'tous les bonbons', nb: 'amis', taille: 'pour un ami' },
        candidats: [
          { nom: `un ami ${A.de}`, k: 'r', phrase: `C'est un ami ${A.de} : il reçoit {r} bonbons.` },
          { nom: `un cousin ${B.de}`, k: 'c', phrase: `C'est un cousin ${B.de} : il reçoit {c} bonbons.` },
        ],
        plus: true,
        fausses: [`Un ami ${A.de} et un cousin ${B.de} reçoivent autant de bonbons.`],
        unite: 'bonbons',
      }) },
    { id: 'paquets-3-014', structure: 'FP', reponse: 'qui', themes: ['animaux'],
      texte: () => ({
        phrases: [`Le petit aquarium contient {a|poissons}.`, `Le grand aquarium contient {b|fois} plus de poissons que le petit aquarium.`, `Le bassin du jardin contient {c|poissons}.`],
        question: 'Où y a-t-il le plus de poissons : dans le grand aquarium ou dans le bassin ?',
        labels: { petit: 'petit aquarium', grand: 'grand aquarium' },
        candidats: [
          { nom: 'le grand aquarium', k: 'r', phrase: `C'est dans le grand aquarium : il y a {r} poissons.` },
          { nom: 'le bassin', k: 'c', phrase: `C'est dans le bassin : il y a {c} poissons.` },
        ],
        plus: true,
        fausses: [`C'est dans le petit aquarium qu'il y a le plus de poissons.`],
        unite: 'poissons',
      }) },
    { id: 'paquets-3-015', structure: 'GT', reponse: 'ouinon', ouiSi: 'plus', themes: ['cuisine', 'ecole'],
      plages: { 1: { n: [2, 5], t: parmi(4, 6) }, 2: { n: [3, 9], t: parmi(4, 6, 8) }, 3: { n: [11, 30], t: parmi(4, 6, 8) } },
      texte: () => ({
        phrases: [`La cantinière a {a|packs} de {b|yaourts}.`, `Ce midi, {c|enfants} mangent à la cantine.`],
        question: 'Y a-t-il assez de yaourts pour donner un yaourt à chaque enfant ?',
        labels: { total: 'tous les yaourts', nb: 'packs', taille: 'yaourts par pack' },
        etiquettes: { r: 'Les yaourts', c: 'Les enfants' },
        oui: 'Oui, il y a {r} yaourts pour {c} enfants.',
        non: 'Non, il y a seulement {r} yaourts pour {c} enfants.',
        fausses: [`La cantinière a {r} packs de yaourts.`],
        unite: 'yaourts',
      }) },
    { id: 'paquets-3-016', structure: 'GG', reponse: 'ouinon', ouiSi: 'moins', themes: ['ecole'],
      plages: { 1: { n: [2, 5], t: parmi(8, 10) }, 2: { n: [3, 9], t: parmi(8, 9) }, 3: { n: [11, 20], t: parmi(6, 8, 9) } },
      texte: () => ({
        phrases: [`Pour la sortie au zoo, {a|élèves} partent en minibus.`, `Chaque minibus emmène {b|élèves}.`, `L'école a réservé {c|minibus}.`],
        question: 'Les minibus réservés suffisent-ils pour emmener tous les élèves ?',
        labels: { total: 'tous les élèves', nb: 'minibus', taille: 'élèves par minibus' },
        etiquettes: { r: 'Minibus nécessaires', c: 'Minibus réservés' },
        oui: "Oui, il faut {r} minibus et l'école en a réservé {c}.",
        non: "Non, il faut {r} minibus et l'école en a réservé seulement {c}.",
        fausses: [`Chaque minibus emmène {r} élèves.`],
        unite: 'minibus',
      }) },
    { id: 'paquets-3-017', structure: 'GP', reponse: 'ouinon', ouiSi: 'plus', themes: ['fete'],
      plages: { 1: { n: [2, 4], t: [3, 6] }, 2: { n: [2, 6], t: [4, 9] }, 3: { n: [2, 6], t: [11, 20] } },
      texte: A => ({
        phrases: [`${A.n} distribue {a|cartes} à {b|joueurs}.`, `Tous les joueurs reçoivent le même nombre de cartes.`, `Pour jouer, chaque joueur doit avoir au moins {c|cartes}.`],
        question: 'Chaque joueur a-t-il assez de cartes pour jouer ?',
        labels: { total: 'toutes les cartes', nb: 'joueurs', taille: 'par joueur' },
        etiquettes: { r: 'Cartes par joueur', c: 'Minimum pour jouer' },
        oui: 'Oui, chaque joueur a {r} cartes et il en faut au moins {c}.',
        non: 'Non, chaque joueur a seulement {r} cartes et il en faut au moins {c}.',
        fausses: [`${A.n} distribue {r} cartes.`],
        unite: 'cartes',
      }) },
    { id: 'paquets-3-018', structure: 'FP', reponse: 'ouinon', ouiSi: 'plus', themes: ['jardin'],
      plages: { 3: { n: [2, 5], t: [3, 12] } },
      texte: A => ({
        phrases: [`Le petit bidon contient {a|litres d'eau}.`, `Le grand bidon contient {b|fois} plus d'eau que le petit bidon.`, `${A.n} veut remplir un bassin de {c|litres}.`],
        question: 'Le grand bidon plein suffit-il pour remplir le bassin ?',
        labels: { petit: 'petit bidon', grand: 'grand bidon' },
        etiquettes: { r: 'Le grand bidon', c: 'Le bassin' },
        oui: 'Oui, le grand bidon contient {r} litres et le bassin {c} litres.',
        non: 'Non, le grand bidon contient seulement {r} litres et le bassin {c} litres.',
        fausses: [`Le petit bidon contient {r} litres.`],
        unite: 'litres',
      }) },
    { id: 'paquets-3-019', structure: 'GG', reponse: 'qui', themes: ['rangement'],
      texte: (A, B) => ({
        phrases: [`${A.n} range {a|livres} en piles de {b|livres}.`, `${B.n} fait {c|piles} de livres.`],
        question: 'Qui fait le plus de piles de livres ?',
        labels: { total: 'tous les livres', nb: 'piles', taille: 'livres par pile' },
        candidats: [
          { nom: A.n, k: 'r', phrase: `C'est ${A.n} qui fait le plus de piles : {r} piles.` },
          { nom: B.n, k: 'c', phrase: `C'est ${B.n} qui fait le plus de piles : {c} piles.` },
        ],
        plus: true,
        fausses: [`${A.n} et ${B.n} font autant de piles.`],
        unite: 'piles',
      }) },
    { id: 'paquets-3-020', structure: 'GT', reponse: 'ouinon', ouiSi: 'plus', themes: ['espace'],
      texte: () => ({
        phrases: [`Alvin a {a|sacs} de {b|cristaux}.`, `Pour réparer sa fusée, Alvin a besoin de {c|cristaux}.`],
        question: 'Alvin a-t-il assez de cristaux pour réparer sa fusée ?',
        labels: { total: 'tous les cristaux', nb: 'sacs', taille: 'par sac' },
        etiquettes: { r: 'Les cristaux', c: 'Pour la fusée' },
        oui: 'Oui, Alvin a {r} cristaux et il en faut {c}.',
        non: 'Non, Alvin a seulement {r} cristaux et il en faut {c}.',
        fausses: [`Alvin a {r} sacs de cristaux.`],
        unite: 'cristaux',
      }) },
    { id: 'paquets-3-021', structure: 'GT', reponse: 'qui', themes: ['fete'],
      plages: { 1: { n: [2, 5], t: parmi(2, 5, 10) }, 2: { n: [2, 9], t: parmi(5, 10) }, 3: { n: [11, 20], t: parmi(5, 10) } },
      texte: (A, B) => ({
        phrases: [`Au chamboule-tout, ${A.n} fait tomber {a|boîtes} qui valent {b|points} chacune.`, `${B.n} marque {c|points} au chamboule-tout.`],
        question: 'Qui marque le plus de points au chamboule-tout ?',
        labels: { total: `points ${A.de}`, nb: 'boîtes', taille: 'points par boîte' },
        candidats: [
          { nom: A.n, k: 'r', phrase: `C'est ${A.n} qui marque le plus de points : {r} points.` },
          { nom: B.n, k: 'c', phrase: `C'est ${B.n} qui marque le plus de points : {c} points.` },
        ],
        plus: true,
        fausses: [`${A.n} et ${B.n} marquent autant de points.`],
        unite: 'points',
      }) },

    // =========================================================================
    // IL MANQUE UNE DONNÉE : on ne peut pas savoir
    // =========================================================================
    { id: 'paquets-3-022', structure: 'GT', reponse: 'impossible', themes: ['cuisine', 'ecole'],
      texte: A => ({
        phrases: [`Pour le goûter de la classe, ${A.n} achète des paquets de {b|gâteaux}.`],
        question: `Combien de gâteaux ${A.n} a-t-${A.il} achetés ?`,
        labels: { total: 'tous les gâteaux', nb: 'paquets', taille: 'gâteaux par paquet' },
        manque: `On ne sait pas combien de paquets ${A.n} achète.`,
        juste: 'On ne peut pas savoir : il manque le nombre de paquets.',
      }) },
    { id: 'paquets-3-023', structure: 'GP', reponse: 'impossible', themes: ['fete'],
      texte: A => ({
        phrases: [`${A.n} a un gros sac de bonbons.`, `${A.n} partage les bonbons du sac entre {b|amis}.`],
        question: 'Combien de bonbons chaque ami reçoit-il ?',
        labels: { total: 'tous les bonbons', nb: 'amis', taille: 'pour un ami' },
        manque: 'On ne sait pas combien de bonbons il y a dans le sac.',
        juste: 'On ne peut pas savoir : il manque le nombre de bonbons dans le sac.',
      }) },
    { id: 'paquets-3-024', structure: 'GG', reponse: 'impossible', themes: ['jardin'],
      texte: () => ({
        phrases: [`Le fleuriste a {a|roses}.`, `Le fleuriste fait des bouquets qui ont tous le même nombre de roses.`],
        question: 'Combien de bouquets le fleuriste peut-il faire ?',
        labels: { total: 'toutes les roses', nb: 'bouquets', taille: 'roses par bouquet' },
        manque: 'On ne sait pas combien de roses il y a dans un bouquet.',
        juste: 'On ne peut pas savoir : il manque le nombre de roses dans un bouquet.',
      }) },
    { id: 'paquets-3-025', structure: 'FP', reponse: 'impossible', themes: ['ecole'],
      texte: (A, B) => ({
        phrases: [`${B.n} a {a|billes}.`, `${A.n} a beaucoup plus de billes ${B.que}.`],
        question: `Combien de billes ${A.n} a-t-${A.il} ?`,
        labels: { petit: B.n, grand: A.n },
        manque: `On ne sait pas combien de fois plus de billes ${A.n} a.`,
        juste: `On ne peut pas savoir : il manque combien de fois plus de billes ${A.n} a.`,
      }) },
    { id: 'paquets-3-026', structure: 'GT', reponse: 'impossible', themes: ['sport'],
      texte: () => ({
        phrases: [`Au tournoi de handball, il y a {a|équipes}.`, `Toutes les équipes ont le même nombre de joueurs.`],
        question: 'Combien de joueurs participent au tournoi de handball ?',
        labels: { total: 'tous les joueurs', nb: 'équipes', taille: 'joueurs par équipe' },
        manque: 'On ne sait pas combien de joueurs il y a dans une équipe.',
        juste: 'On ne peut pas savoir : il manque le nombre de joueurs dans une équipe.',
      }) },
    { id: 'paquets-3-027', structure: 'GP', reponse: 'impossible', themes: ['cuisine'],
      texte: () => ({
        phrases: [`Le pâtissier a {a|cerises}.`, `Le pâtissier pose le même nombre de cerises sur chaque gâteau.`],
        question: 'Combien de cerises le pâtissier pose-t-il sur chaque gâteau ?',
        labels: { total: 'toutes les cerises', nb: 'gâteaux', taille: 'cerises par gâteau' },
        manque: 'On ne sait pas combien de gâteaux le pâtissier décore.',
        juste: 'On ne peut pas savoir : il manque le nombre de gâteaux.',
      }) },
    { id: 'paquets-3-028', structure: 'GG', reponse: 'impossible', themes: ['espace'],
      texte: () => ({
        phrases: [`Alvin doit transporter des caisses jusqu'à sa fusée.`, `À chaque voyage, Alvin porte {b|caisses}.`],
        question: 'Combien de voyages Alvin doit-il faire ?',
        labels: { total: 'toutes les caisses', nb: 'voyages', taille: 'caisses par voyage' },
        manque: 'On ne sait pas combien de caisses Alvin doit transporter.',
        juste: 'On ne peut pas savoir : il manque le nombre de caisses à transporter.',
      }) },

    // =========================================================================
    // PROBLÈMES ORDINAIRES avec des pièges dans la même unité
    // =========================================================================
    { id: 'paquets-3-029', structure: 'GT', themes: ['ecole'],
      piegesContexte: [
        { f: () => `Le paquet de feuilles neuf contient {d|feuilles}.`, v: selon([30, 60], [100, 200], [200, 500]) },
        { f: () => `À la fête de l'école, la chorale chante {d|chansons}.`, v: (niv, rnd) => rnd(3, 8) },
      ],
      texte: () => ({
        phrases: [`Dans le groupe de chant, il y a {a|élèves}.`, `La maîtresse donne {b|feuilles} de chansons à chaque élève du groupe.`],
        question: 'Combien de feuilles la maîtresse donne-t-elle en tout ?',
        labels: { total: 'toutes les feuilles', nb: 'élèves', taille: 'feuilles par élève' },
        juste: 'La maîtresse donne {r} feuilles en tout.',
        fausses: [`Il y a {r} élèves dans le groupe de chant.`, `Chaque élève reçoit {r} feuilles.`],
        unite: 'feuilles',
      }) },
    { id: 'paquets-3-030', structure: 'GP', themes: ['cuisine'],
      piegesContexte: [
        { f: (A, B) => `Dans le jardin ${B.de}, le fraisier a donné {d|fraises}.`, v: selon([5, 25], [10, 80], [30, 150]) },
        { f: (A, B) => `${B.n} a mangé {d|fraises} au goûter.`, v: (niv, rnd) => rnd(3, 12) },
      ],
      texte: A => ({
        phrases: [`${A.n} répartit {a|fraises} dans {b|coupes}.`, `Toutes les coupes ont autant de fraises.`],
        question: `Combien de fraises ${A.n} met-${A.il} dans chaque coupe ?`,
        labels: { total: 'toutes les fraises', nb: 'coupes', taille: 'fraises par coupe' },
        juste: `${A.n} met {r} fraises dans chaque coupe.`,
        fausses: [`${A.n} remplit {r} coupes.`, `${A.n} a {r} fraises en tout.`],
        unite: 'fraises',
      }) },
    { id: 'paquets-3-031', structure: 'GG', themes: ['fete'],
      piegesContexte: [
        { f: (A, B) => `${B.n} a apporté {d|guirlandes} pour la fête.`, v: (niv, rnd) => rnd(2, 9) },
        { f: A => `Pour la fête de l'an dernier, ${A.n} avait gonflé {d|ballons}.`, v: selon([5, 25], [10, 80], [30, 150]) },
      ],
      texte: A => ({
        phrases: [`Pour la fête, ${A.n} gonfle {a|ballons}.`, `${A.n} attache les ballons par grappes de {b|ballons}.`],
        question: `Combien de grappes de ballons ${A.n} fait-${A.il} ?`,
        labels: { total: 'tous les ballons', nb: 'grappes', taille: 'ballons par grappe' },
        juste: `${A.n} fait {r} grappes de ballons.`,
        fausses: [`${A.n} gonfle {r} ballons.`, `Il y a {r} ballons dans chaque grappe.`],
        unite: 'grappes',
      }) },
    { id: 'paquets-3-032', structure: 'FP', themes: ['jardin'],
      plages: { 3: { n: [2, 5], t: [11, 40] } },
      piegesContexte: [
        { f: () => `La rose du jardin mesure {d|centimètres}.`, v: (niv, rnd) => rnd(30, 80) },
        { f: A => `${A.n} mesure {d|centimètres}.`, v: (niv, rnd) => rnd(120, 140) },
      ],
      texte: () => ({
        phrases: [`Le petit tournesol mesure {a|centimètres}.`, `Le grand tournesol est {b|fois} plus haut que le petit tournesol.`],
        question: 'Combien de centimètres mesure le grand tournesol ?',
        labels: { petit: 'petit tournesol', grand: 'grand tournesol' },
        juste: 'Le grand tournesol mesure {r} centimètres.',
        fausses: [`Le petit tournesol mesure {r} centimètres.`, `Le grand tournesol mesure {r} centimètres de plus que le petit.`],
        unite: 'centimètres',
      }) },
    { id: 'paquets-3-033', structure: 'GT', themes: ['sport'],
      plages: { 1: { n: [2, 4], t: parmi(5) }, 2: { n: [3, 9], t: parmi(5, 6, 7) }, 3: { n: [11, 24], t: parmi(5, 6, 7) } },
      piegesContexte: [
        { f: () => `Le gymnase a {d|paniers} de basket.`, v: (niv, rnd) => rnd(2, 6) },
        { f: A => `L'équipe ${A.de} a gagné {d|matchs} cette année.`, v: (niv, rnd) => rnd(2, 15) },
      ],
      texte: () => ({
        phrases: [`Au tournoi de basket, il y a {a|équipes}.`, `Chaque équipe a {b|joueurs}.`],
        question: 'Combien de joueurs participent au tournoi de basket ?',
        labels: { total: 'tous les joueurs', nb: 'équipes', taille: 'joueurs par équipe' },
        juste: 'Il y a {r} joueurs au tournoi de basket.',
        fausses: [`Il y a {r} équipes au tournoi.`, `Chaque équipe a {r} joueurs.`],
        unite: 'joueurs',
      }) },
    { id: 'paquets-3-034', structure: 'GP', themes: ['espace', 'rangement'],
      piegesContexte: [
        { f: () => `Le robot d'Alvin garde {d|cristaux} dans son coffre.`, v: selon([5, 25], [10, 80], [30, 150]) },
        { f: () => `Dans la soute de la fusée, il reste {d|boîtes} vides.`, v: (niv, rnd) => rnd(2, 9) },
      ],
      texte: () => ({
        phrases: [`Alvin range {a|cristaux} dans {b|boîtes}.`, `Alvin met autant de cristaux dans chaque boîte.`],
        question: 'Combien de cristaux Alvin met-il dans une boîte ?',
        labels: { total: 'tous les cristaux', nb: 'boîtes', taille: 'cristaux par boîte' },
        juste: 'Alvin met {r} cristaux dans une boîte.',
        fausses: [`Alvin remplit {r} boîtes.`, `Alvin range {r} cristaux en tout.`],
        unite: 'cristaux',
      }) },
    { id: 'paquets-3-035', structure: 'GT', themes: ['jardin'],
      piegesContexte: [
        { f: () => `Dans le potager voisin, il y a {d|salades}.`, v: selon([5, 25], [10, 80], [30, 200]) },
        { f: () => `Le potager du jardinier a {d|rangées} de carottes.`, v: (niv, rnd) => rnd(2, 9) },
      ],
      texte: () => ({
        phrases: [`Le jardinier plante {a|rangées} de {b|salades}.`],
        question: 'Combien de salades le jardinier plante-t-il ?',
        labels: { total: 'toutes les salades', nb: 'rangées', taille: 'salades par rangée' },
        juste: 'Le jardinier plante {r} salades.',
        fausses: [`Le jardinier plante {r} rangées.`, `Il y a {r} salades dans chaque rangée.`],
        unite: 'salades',
      }) },
    { id: 'paquets-3-036', structure: 'GG', themes: ['rangement', 'ecole'],
      piegesContexte: [
        { f: (A, B) => `La trousse ${B.de} contient {d|crayons}.`, v: selon([5, 20], [8, 30], [10, 40]) },
        { f: A => `${A.n} a {d|feutres} dans sa trousse.`, v: (niv, rnd) => rnd(4, 15) },
      ],
      texte: A => ({
        phrases: [`${A.n} range {a|crayons} dans des pots.`, `${A.n} met {b|crayons} dans chaque pot.`],
        question: `Combien de pots ${A.n} remplit-${A.il} ?`,
        labels: { total: 'tous les crayons', nb: 'pots', taille: 'crayons par pot' },
        juste: `${A.n} remplit {r} pots.`,
        fausses: [`${A.n} met {r} crayons dans chaque pot.`, `${A.n} range {r} crayons.`],
        unite: 'pots',
      }) },
    { id: 'paquets-3-037', structure: 'GT', themes: ['animaux'],
      plages: { 1: { n: [2, 5], t: [3, 5] }, 2: { n: [3, 9], t: [4, 6] }, 3: { n: [11, 30], t: [4, 6] } },
      piegesContexte: [
        { f: () => `Sur la mare de la ferme, il y a {d|canards}.`, v: (niv, rnd) => rnd(2, 12) },
        { f: () => `Le fermier vend ses œufs par boîtes de {d|œufs}.`, v: (niv, rnd) => 6 * rnd(1, 2) },
      ],
      texte: () => ({
        phrases: [`Dans le poulailler, il y a {a|poules}.`, `Chaque poule pond {b|œufs} par semaine.`],
        question: "Combien d'œufs les poules pondent-elles en une semaine ?",
        labels: { total: 'tous les œufs', nb: 'poules', taille: 'œufs par poule' },
        juste: 'En une semaine, les poules pondent {r} œufs.',
        fausses: [`Il y a {r} poules dans le poulailler.`, `Chaque poule pond {r} œufs.`],
        unite: 'œufs',
      }) },
    { id: 'paquets-3-038', structure: 'GP', themes: ['fete'],
      piegesContexte: [
        { f: (A, B) => `${B.n} a apporté {d|sucettes} pour la fête.`, v: (niv, rnd) => rnd(3, 12) },
        { f: (A, B) => `${B.n} a mangé {d|bonbons} avant la fête.`, v: (niv, rnd) => rnd(2, 9) },
      ],
      texte: A => ({
        phrases: [`Pour la fête, ${A.n} a acheté {a|bonbons}.`, `${A.n} prépare {b|sachets} qui contiennent tous autant de bonbons.`],
        question: 'Combien de bonbons y a-t-il dans chaque sachet ?',
        labels: { total: 'tous les bonbons', nb: 'sachets', taille: 'bonbons par sachet' },
        juste: 'Il y a {r} bonbons dans chaque sachet.',
        fausses: [`${A.n} prépare {r} sachets.`, `${A.n} a acheté {r} bonbons.`],
        unite: 'bonbons',
      }) },
    { id: 'paquets-3-039', structure: 'FP', themes: ['sport'],
      plages: { 3: { n: [2, 5], t: [3, 9] } },
      piegesContexte: [
        { f: () => `Le record du club est de {d|tours de piste}.`, v: (niv, rnd) => rnd(50, 80) },
        { f: () => `La piste du stade mesure {d|mètres}.`, v: () => 400 },
      ],
      texte: (A, B) => ({
        phrases: [`${A.n} a couru {a|tours de piste}.`, `${B.n} a couru {b|fois} plus de tours ${A.que}.`],
        question: `Combien de tours de piste ${B.n} a-t-${B.il} courus ?`,
        labels: { petit: A.n, grand: B.n },
        juste: `${B.n} a couru {r} tours de piste.`,
        fausses: [`${A.n} a couru {r} tours de piste.`, `${B.n} a couru {r} tours de plus ${A.que}.`],
        unite: 'tours',
      }) },
    { id: 'paquets-3-040', structure: 'GT', themes: ['ecole', 'rangement'],
      plages: { 1: { n: [2, 5], t: parmi(10) }, 2: { n: [2, 9], t: parmi(10, 20) }, 3: { n: [3, 9], t: [12, 35] } },
      piegesContexte: [
        { f: () => `La bibliothèque du village a {d|étagères}.`, v: selon([6, 20], [10, 40], [20, 60]) },
        { f: A => `${A.n} a {d|livres} dans sa chambre.`, v: (niv, rnd) => rnd(5, 40) },
      ],
      texte: () => ({
        phrases: [`La bibliothèque de la classe a {a|étagères}.`, `Sur chaque étagère, il y a {b|livres}.`],
        question: 'Quel est le nombre total de livres dans la bibliothèque de la classe ?',
        labels: { total: 'tous les livres', nb: 'étagères', taille: 'livres par étagère' },
        juste: 'Il y a {r} livres en tout dans la bibliothèque de la classe.',
        fausses: [`La bibliothèque a {r} étagères.`, `Il y a {r} livres sur chaque étagère.`],
        unite: 'livres',
      }) },
    { id: 'paquets-3-041', structure: 'GG', themes: ['cuisine'],
      piegesContexte: [
        { f: () => `Ce matin, le boulanger a fait {d|baguettes}.`, v: selon([10, 40], [20, 80], [50, 200]) },
        { f: () => `Un client a commandé {d|croissants} pour demain.`, v: (niv, rnd) => rnd(3, 12) },
      ],
      texte: () => ({
        phrases: [`Le boulanger a {a|croissants}.`, `Le boulanger met ses croissants dans des sachets de {b|croissants}.`],
        question: 'Combien de sachets le boulanger remplit-il ?',
        labels: { total: 'tous les croissants', nb: 'sachets', taille: 'croissants par sachet' },
        juste: 'Le boulanger remplit {r} sachets.',
        fausses: [`Le boulanger met {r} croissants dans chaque sachet.`, `Le boulanger a {r} croissants.`],
        unite: 'sachets',
      }) },
    { id: 'paquets-3-042', structure: 'GP', themes: ['sport'],
      plages: { 1: { n: [2, 5], t: [3, 5] }, 2: { n: [2, 7], t: [5, 9] }, 3: { n: [2, 6], t: [11, 30] } },
      piegesContexte: [
        { f: A => `Le vélo ${A.de} a {d|vitesses}.`, v: (niv, rnd) => rnd(3, 7) },
        { f: (A, B) => `Pendant les vacances, ${B.n} parcourt {d|kilomètres} à vélo.`, v: selon([5, 25], [10, 60], [30, 150]) },
      ],
      texte: A => ({
        phrases: [`En {b|jours}, ${A.n} parcourt {a|kilomètres} à vélo.`, `${A.n} parcourt la même distance chaque jour.`],
        question: `Combien de kilomètres ${A.n} parcourt-${A.il} chaque jour ?`,
        labels: { total: 'tous les kilomètres', nb: 'jours', taille: 'kilomètres par jour' },
        juste: `${A.n} parcourt {r} kilomètres chaque jour.`,
        fausses: [`${A.n} roule pendant {r} jours.`, `${A.n} parcourt {r} kilomètres en tout.`],
        unite: 'kilomètres',
      }) },
    { id: 'paquets-3-043', structure: 'GT', themes: ['espace'],
      plages: { 3: { n: [11, 30], t: [3, 9] } },
      piegesContexte: [
        { f: () => `Le vaisseau cargo a {d|hublots}.`, v: (niv, rnd) => rnd(2, 9) },
        { f: () => `La station spatiale accueille {d|astronautes}.`, v: (niv, rnd) => rnd(3, 9) },
      ],
      texte: () => ({
        phrases: [`La station spatiale a {a|modules}.`, `Chaque module a {b|hublots}.`],
        question: 'Combien de hublots la station spatiale a-t-elle ?',
        labels: { total: 'tous les hublots', nb: 'modules', taille: 'hublots par module' },
        juste: 'La station spatiale a {r} hublots.',
        fausses: [`La station spatiale a {r} modules.`, `Chaque module a {r} hublots.`],
        unite: 'hublots',
      }) },
  ];

  // Les modèles sans nombres() sur mesure utilisent les plages (ou les plages par défaut).
  modeles.forEach(m => { if (!m.nombres) m.nombres = groupes(m.structure, m.plages || {}); });
  Problemes.ajouter('paquets', modeles);
})();
