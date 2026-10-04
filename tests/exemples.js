'use strict';
/*
 * Modèles d'EXEMPLE (un par structure). Ils servent :
 *  - de référence pour écrire les banques (js/problemes/banques/*.js),
 *  - de jeu d'essai pour tester l'interface de résolution (tests/resolution.html).
 * Ils ne sont PAS chargés dans le jeu.
 */
Problemes.ajouter('plusmoins', [
  {
    id: 'ex-CT', structure: 'CT', max: 200, themes: ['jeux'],
    texte: A => ({
      phrases: [`${A.n} a {a|billes rouges} et {b|billes bleues}.`],
      question: `Combien de billes ${A.n} a-t-${A.il} en tout ?`,
      labels: { tout: 'toutes les billes', p1: 'rouges', p2: 'bleues' },
      juste: `${A.n} a {r} billes en tout.`,
      fausses: [`${A.n} a {r} billes rouges.`, `${A.n} a {r} billes bleues.`],
    }),
  },
  {
    id: 'ex-TP', structure: 'TP', max: 200, themes: ['jeux'],
    texte: A => ({
      phrases: [`${A.n} a {a|billes}.`, `Pendant la partie, ${A.n} perd {b|billes}.`],
      question: `Combien de billes reste-t-il à ${A.n} ?`,
      labels: { tout: 'au début', p1: 'perdues', p2: 'qui restent' },
      juste: `Il reste {r} billes à ${A.n}.`,
      fausses: [`${A.n} a perdu {r} billes.`, `${A.n} avait {r} billes au début.`],
    }),
  },
  {
    id: 'ex-CE', structure: 'CE', max: 200, themes: ['jeux'],
    texte: (A, B) => ({
      phrases: [`${A.n} a {a|billes}.`, `${B.n} a {b|billes}.`],
      question: `Combien de billes ${B.n} a-t-${B.il} de plus ${A.que} ?`,
      labels: { grand: B.n, petit: A.n },
      juste: `${B.n} a {r} billes de plus ${A.que}.`,
      fausses: [`${B.n} a {r} billes.`, `${A.n} et ${B.n} ont {r} billes en tout.`],
    }),
  },
  {
    id: 'ex-CInvP', structure: 'CInvP', themes: ['jeux'],
    texte: (A, B) => ({
      phrases: [`${A.n} a {a|points}.`, `C'est {b|points} de plus ${B.que}.`],
      question: `Combien de points ${B.n} a-t-${B.il} ?`,
      labels: { grand: A.n, petit: B.n },
      juste: `${B.n} a {r} points.`,
      fausses: [`${A.n} a {r} points.`, `${B.n} a {r} points de plus ${A.que}.`],
    }),
  },
]);

Problemes.ajouter('paquets', [
  {
    id: 'ex-GT', structure: 'GT', themes: ['cuisine'],
    texte: A => ({
      phrases: [`${A.n} achète {a|boîtes} d'œufs.`, `Dans chaque boîte, il y a {b|œufs}.`],
      question: `Combien d'œufs ${A.n} a-t-${A.il} en tout ?`,
      labels: { total: 'tous les œufs', nb: 'boîtes', taille: 'œufs dans une boîte' },
      juste: `${A.n} a {r} œufs en tout.`,
      fausses: [`${A.n} a {r} boîtes.`, `Il y a {r} œufs dans une boîte.`],
    }),
  },
  {
    id: 'ex-GP', structure: 'GP', themes: ['fete'],
    texte: (A, B) => ({
      phrases: [`${A.n} a {a|bonbons}.`, `${A.Il} les partage équitablement entre {b|amis}.`],
      question: `Combien de bonbons chaque ami reçoit-il ?`,
      labels: { total: 'tous les bonbons', nb: 'amis', taille: 'pour un ami' },
      juste: `Chaque ami reçoit {r} bonbons.`,
      fausses: [`Il y a {r} amis.`, `${A.n} a {r} bonbons en tout.`],
    }),
  },
  {
    id: 'ex-GG', structure: 'GG', themes: ['rangement'],
    texte: A => ({
      phrases: [`${A.n} range {a|livres} sur des étagères.`, `Sur chaque étagère, ${A.il} met {b|livres}.`],
      question: `Combien d'étagères ${A.n} remplit-${A.il} ?`,
      labels: { total: 'tous les livres', nb: 'étagères', taille: 'livres sur une étagère' },
      juste: `${A.n} remplit {r} étagères.`,
      fausses: [`${A.n} met {r} livres sur chaque étagère.`, `${A.n} range {r} livres.`],
    }),
  },
  {
    id: 'ex-FP', structure: 'FP', themes: ['jeux'],
    texte: (A, B) => ({
      phrases: [`${A.n} a {a|cartes}.`, `${B.n} a {b} fois plus de cartes ${A.que}.`],
      question: `Combien de cartes ${B.n} a-t-${B.il} ?`,
      labels: { petit: A.n, grand: B.n },
      juste: `${B.n} a {r} cartes.`,
      fausses: [`${A.n} a {r} cartes.`, `${B.n} a {r} cartes de plus ${A.que}.`],
    }),
  },
]);

Problemes.ajouter('marche', [
  {
    id: 'ex-marche-TP', structure: 'TP', themes: ['jouets'],
    nombres: (niv, rnd) => {
      const prix = niv === 1 ? rnd(3, 18) : niv === 2 ? rnd(12, 45) : rnd(25, 95);
      const billet = [5, 10, 20, 50, 100].find(b => b > prix + 1);
      return { a: billet, b: prix };
    },
    texte: A => ({
      phrases: [`${A.n} achète une petite fusée qui coûte {b|€}.`, `${A.Il} paie avec un billet de {a|€}.`],
      question: `Combien la marchande rend-elle à ${A.n} ?`,
      labels: { tout: 'le billet', p1: 'le prix', p2: 'la monnaie' },
      juste: `La marchande rend {r} € à ${A.n}.`,
      fausses: [`La fusée coûte {r} €.`, `${A.n} paie {r} €.`],
      unite: '€',
    }),
  },
]);

Problemes.ajouter('tictac', [
  {
    id: 'ex-HF', structure: 'HF', themes: ['horaires'],
    texte: A => ({
      phrases: [`Le car ${A.de} part à {a}.`, `Le trajet dure {b}.`],
      question: `À quelle heure le car arrive-t-il ?`,
      labels: { debut: 'départ', duree: 'trajet', fin: 'arrivée' },
      juste: `Le car arrive à {r}.`,
      fausses: [`Le trajet dure {r}.`, `Le car part à {r}.`],
    }),
  },
  {
    id: 'ex-HD', structure: 'HD', themes: ['horaires'],
    texte: A => ({
      phrases: [`Le film commence à {a}.`, `Il se termine à {b}.`],
      question: `Combien de temps dure le film ?`,
      labels: { debut: 'début', duree: 'durée', fin: 'fin' },
      juste: `Le film dure {r}.`,
      fausses: [`Le film se termine à {r}.`, `Le film commence à {r}.`],
    }),
  },
  {
    id: 'ex-HI', structure: 'HI', themes: ['cuisine'],
    texte: A => ({
      phrases: [`Le gâteau ${A.de} doit cuire {b}.`, `${A.Il} veut le sortir du four à {a}.`],
      question: `À quelle heure ${A.n} doit-${A.il} mettre le gâteau au four ?`,
      labels: { debut: 'au four', duree: 'cuisson', fin: 'sortie' },
      juste: `${A.n} doit mettre le gâteau au four à {r}.`,
      fausses: [`Le gâteau cuit pendant {r}.`, `${A.n} sort le gâteau à {r}.`],
    }),
  },
  {
    id: 'ex-tictac-CT', structure: 'CT', max: 500, themes: ['bricolage'],
    texte: A => ({
      phrases: [`${A.n} a un ruban rouge de {a|cm} et un ruban bleu de {b|cm}.`, `${A.Il} les met bout à bout.`],
      question: `Quelle longueur mesurent les deux rubans ensemble ?`,
      labels: { tout: 'les deux rubans', p1: 'rouge', p2: 'bleu' },
      juste: `Les deux rubans mesurent {r} cm ensemble.`,
      fausses: [`Le ruban rouge mesure {r} cm.`, `Le ruban bleu mesure {r} cm.`],
      unite: 'cm',
    }),
  },
]);

Problemes.ajouter('defi', [
  {
    id: 'ex-D2', structure: 'D2', themes: ['jeux'],
    nombres: (niv, rnd) => niv === 1
      ? { a: rnd(20, 40), b: rnd(5, 15), c: rnd(3, 12) }
      : niv === 2 ? { a: rnd(120, 400), b: rnd(30, 150), c: rnd(20, 100) } : { a: rnd(1200, 4000), b: rnd(300, 1500), c: rnd(200, 1000) },
    etapes: [
      { signe: '+', g: 'a', d: 'b', res: 'x' },
      { signe: '−', g: 'x', d: 'c', res: 'r' },
    ],
    texte: A => ({
      phrases: [`${A.n} a {a|billes}.`, `Le matin, ${A.il} gagne {b|billes}.`, `L'après-midi, ${A.il} en perd {c}.`],
      question: `Combien de billes ${A.n} a-t-${A.il} le soir ?`,
      sousQuestion: `Combien de billes ${A.n} a-t-${A.il} à midi ?`,
      autresQuestions: [`Combien de billes ${A.n} a-t-${A.il} perdues ?`, `Combien de billes ${A.n} avait-${A.il} au début ?`],
      uniteX: 'billes',
      juste: `Le soir, ${A.n} a {r} billes.`,
      fausses: [`À midi, ${A.n} a {r} billes.`, `${A.n} a perdu {r} billes.`],
      unite: 'billes',
    }),
  },
  {
    id: 'ex-D2-produit', structure: 'D2', themes: ['achats'],
    nombres: (niv, rnd) => ({ a: rnd(2, niv > 1 ? 9 : 5), b: rnd(2, niv > 1 ? 9 : 5), c: niv === 1 ? rnd(2, 6) : rnd(3, 15) }),
    etapes: [
      { signe: '×', g: 'a', d: 'b', res: 'x' },
      { signe: '+', g: 'x', d: 'c', res: 'r' },
    ],
    texte: A => ({
      phrases: [`${A.n} achète {a|cahiers} à {b|€} chacun.`, `${A.Il} achète aussi une trousse à {c|€}.`],
      question: `Combien ${A.n} paie-t-${A.il} en tout ?`,
      sousQuestion: `Combien coûtent les cahiers ?`,
      autresQuestions: [`Combien coûte la trousse ?`, `Combien de cahiers ${A.n} achète-t-${A.il} ?`],
      uniteX: '€',
      juste: `${A.n} paie {r} € en tout.`,
      fausses: [`Les cahiers coûtent {r} €.`, `${A.n} achète {r} cahiers.`],
      unite: '€',
    }),
  },
]);
