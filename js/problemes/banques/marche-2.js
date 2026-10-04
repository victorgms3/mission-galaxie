'use strict';
/* Marché — banque 2 : la monnaie « multiplicative » (prix de plusieurs objets identiques, partage d'une somme,
   combien d'objets avec une somme, « fois plus cher ») et, au grade 3 seulement, les centimes (additions,
   soustractions, comparaisons) et la conversion euros → centimes (1 € = 100 centimes).
   Thèmes : vetements, fete, cantine, jouets, espace. */
(() => {
  // Tire une valeur : [min, max] → entier au hasard ; [min, max, pas] → multiple de « pas » ; { l: [...] } → une valeur de la liste
  const tir = (d, rnd, choix) => {
    if (d.l) return choix(d.l);
    const pas = d[2] || 1;
    return pas * rnd(Math.ceil(d[0] / pas), Math.floor(d[1] / pas));
  };

  // Problèmes multiplicatifs : n = nombre d'objets (ou de parts), t = prix d'un objet (ou d'une part).
  // R = { 1: { n, t }, 2: { n, t }, 3: [{ n, t }, { n, t }] } ; plusieurs variantes pour un grade → l'une au hasard.
  const nt = (R, niv, rnd, choix) => {
    let v = R[niv] || R[3] || R[2];
    if (Array.isArray(v)) v = choix(v);
    return { n: tir(v.n, rnd, choix), t: tir(v.t, rnd, choix) };
  };
  // Correspondance avec les structures du moteur
  const prixTotal = R => (niv, rnd, choix) => { const { n, t } = nt(R, niv, rnd, choix); return { a: n, b: t }; };     // GT : a objets à b € → a × b
  const partage = R => (niv, rnd, choix) => { const { n, t } = nt(R, niv, rnd, choix); return { a: n * t, b: n }; };  // GP : a € en b parts → a ÷ b
  const combien = R => (niv, rnd, choix) => { const { n, t } = nt(R, niv, rnd, choix); return { a: n * t, b: t }; };  // GG : a €, b € l'objet → a ÷ b
  const foisPlus = R => (niv, rnd, choix) => { const { n, t } = nt(R, niv, rnd, choix); return { a: t, b: n }; };     // FP : a €, b fois plus cher → a × b

  // ===========================================================================
  // GT : prix de plusieurs objets identiques (a objets à b € l'un → a × b)
  // ===========================================================================
  Problemes.ajouter('marche', [
    { id: 'marche-2-001', structure: 'GT', themes: ['vetements'], niveaux: [1, 2], max: 81,
      nombres: prixTotal({ 1: { n: [2, 5], t: [2, 5] }, 2: { n: [2, 9], t: [2, 9] } }),
      texte: A => ({
        phrases: [`${A.n} achète {a|paires de chaussettes}.`, `Chaque paire coûte {b|€}.`],
        question: `Combien ${A.n} paie-t-${A.il} en tout ?`,
        labels: { total: 'prix total', nb: 'paires', taille: "prix d'une paire" },
        juste: `${A.n} paie {r} € en tout.`,
        fausses: [`Une paire de chaussettes coûte {r} €.`, `${A.n} achète {r} paires de chaussettes.`],
        unite: '€',
      }) },

    { id: 'marche-2-002', structure: 'GT', themes: ['vetements'], niveaux: [3], max: 300,
      nombres: prixTotal({ 3: { n: [18, 30], t: [3, 9] } }),
      texte: () => ({
        phrases: [`Pour la course de l'école, la maîtresse commande {a|T-shirts} jaunes.`, `Un T-shirt coûte {b|€}.`],
        question: `Combien la maîtresse paie-t-elle ?`,
        labels: { total: 'prix total', nb: 'T-shirts', taille: "prix d'un T-shirt" },
        juste: `La maîtresse paie {r} €.`,
        fausses: [`Un T-shirt coûte {r} €.`, `La maîtresse commande {r} T-shirts.`],
        unite: '€',
      }) },

    { id: 'marche-2-003', structure: 'GT', themes: ['vetements'], niveaux: [2, 3], max: 160,
      nombres: prixTotal({ 2: { n: [2, 6], t: [5, 9] }, 3: { n: [3, 8], t: [11, 19] } }),
      texte: A => ({
        phrases: [`Pour l'hiver, ${A.n} offre un bonnet à chacun de ses {a|cousins}.`, `Au marché, un bonnet coûte {b|€}.`],
        question: `Combien ${A.n} dépense-t-${A.il} pour les bonnets ?`,
        labels: { total: 'tous les bonnets', nb: 'bonnets', taille: "prix d'un bonnet" },
        juste: `${A.n} dépense {r} € pour les bonnets.`,
        fausses: [`Un bonnet coûte {r} €.`, `${A.n} a {r} cousins.`],
        unite: '€',
      }) },

    { id: 'marche-2-004', structure: 'GT', themes: ['vetements'], niveaux: [2, 3], max: 250,
      nombres: prixTotal({ 2: { n: [2, 4], t: [20, 50, 10] }, 3: { n: [2, 5], t: [25, 49] } }),
      texte: A => ({
        phrases: [`Au magasin de sport, une paire de baskets coûte {b|€}.`, `La famille ${A.de} achète {a|paires} identiques.`],
        question: `Combien la famille ${A.de} paie-t-elle ?`,
        labels: { total: 'prix total', nb: 'paires', taille: "prix d'une paire" },
        juste: `La famille ${A.de} paie {r} €.`,
        fausses: [`Une paire de baskets coûte {r} €.`, `La famille ${A.de} achète {r} paires de baskets.`],
        unite: '€',
      }) },

    { id: 'marche-2-005', structure: 'GT', themes: ['fete'], niveaux: [1, 2], max: 45,
      nombres: prixTotal({ 1: { n: [2, 5], t: [2, 5] }, 2: { n: [3, 9], t: [2, 5] } }),
      texte: A => ({
        phrases: [`Pour l'anniversaire ${A.de}, son papa achète {a|sachets de ballons}.`, `Un sachet coûte {b|€}.`],
        question: `Combien le papa ${A.de} paie-t-il ?`,
        labels: { total: 'prix total', nb: 'sachets', taille: "prix d'un sachet" },
        juste: `Le papa ${A.de} paie {r} €.`,
        fausses: [`Un sachet de ballons coûte {r} €.`, `Le papa ${A.de} achète {r} sachets.`],
        unite: '€',
      }) },

    { id: 'marche-2-006', structure: 'GT', themes: ['fete'], niveaux: [2, 3], max: 140,
      nombres: prixTotal({ 2: { n: [2, 9], t: [7, 9] }, 3: { n: [3, 9], t: [11, 15] } }),
      texte: A => ({
        phrases: [`${A.n} commande {a|pizzas} pour sa fête.`, `Chaque pizza coûte {b|€}.`],
        question: `Combien coûtent toutes les pizzas ?`,
        labels: { total: 'toutes les pizzas', nb: 'pizzas', taille: "prix d'une pizza" },
        juste: `Toutes les pizzas coûtent {r} €.`,
        fausses: [`Une pizza coûte {r} €.`, `${A.n} commande {r} pizzas.`],
        unite: '€',
      }) },

    { id: 'marche-2-007', structure: 'GT', themes: ['fete'], niveaux: [1, 2], max: 45,
      nombres: prixTotal({ 1: { n: [2, 5], t: [2, 5] }, 2: { n: [3, 9], t: [2, 5] } }),
      texte: A => ({
        phrases: [`À la fête foraine, un tour de manège coûte {b|€}.`, `${A.n} fait {a|tours}.`],
        question: `Combien ${A.n} dépense-t-${A.il} ?`,
        labels: { total: 'dépense totale', nb: 'tours', taille: "prix d'un tour" },
        juste: `${A.n} dépense {r} €.`,
        fausses: [`Un tour de manège coûte {r} €.`, `${A.n} fait {r} tours de manège.`],
        unite: '€',
      }) },

    { id: 'marche-2-008', structure: 'GT', themes: ['fete'], max: 160,
      nombres: prixTotal({ 1: { n: [2, 5], t: [2, 3] }, 2: { n: [4, 9], t: [2, 4] }, 3: { n: [12, 40], t: [2, 4] } }),
      texte: A => ({
        phrases: [`À la kermesse, ${A.n} vend des parts de gâteau à {b|€} la part.`, `${A.n} vend {a|parts}.`],
        question: `Combien d'argent ${A.n} gagne-t-${A.il} ?`,
        labels: { total: 'argent gagné', nb: 'parts vendues', taille: "prix d'une part" },
        juste: `${A.n} gagne {r} €.`,
        fausses: [`Une part de gâteau coûte {r} €.`, `${A.n} vend {r} parts de gâteau.`],
        unite: '€',
      }) },

    { id: 'marche-2-009', structure: 'GT', themes: ['cantine'], niveaux: [1], max: 25,
      nombres: prixTotal({ 1: { n: [2, 5], t: [2, 5] } }),
      texte: A => ({
        phrases: [`Un repas à la cantine coûte {b|€}.`, `Cette semaine, ${A.n} mange à la cantine pendant {a|jours}.`],
        question: `Combien les parents ${A.de} paient-ils pour la semaine ?`,
        labels: { total: 'la semaine', nb: 'jours', taille: "prix d'un repas" },
        juste: `Les parents ${A.de} paient {r} € pour la semaine.`,
        fausses: [`Un repas coûte {r} €.`, `${A.n} mange {r} jours à la cantine.`],
        unite: '€',
      }) },

    { id: 'marche-2-010', structure: 'GT', themes: ['cantine'], niveaux: [2, 3], max: 100,
      nombres: prixTotal({ 2: { n: [6, 9], t: [3, 5] }, 3: { n: [12, 20], t: [3, 5] } }),
      texte: A => ({
        phrases: [`Ce mois-ci, ${A.n} mange {a|fois} à la cantine.`, `Chaque repas coûte {b|€}.`],
        question: `Combien coûtent tous les repas du mois ?`,
        labels: { total: 'tout le mois', nb: 'repas', taille: "prix d'un repas" },
        juste: `Les repas du mois coûtent {r} €.`,
        fausses: [`Un repas coûte {r} €.`, `${A.n} mange {r} fois à la cantine.`],
        unite: '€',
      }) },

    { id: 'marche-2-011', structure: 'GT', themes: ['cantine'], niveaux: [2, 3], max: 300,
      nombres: prixTotal({ 2: { n: [2, 9], t: [6, 9] }, 3: [{ n: [11, 30], t: [6, 9] }, { n: [3, 9], t: [11, 18] }] }),
      texte: () => ({
        phrases: [`Le cuisinier de la cantine achète {a|cagettes de pommes}.`, `Une cagette coûte {b|€}.`],
        question: `Combien le cuisinier paie-t-il ?`,
        labels: { total: 'prix total', nb: 'cagettes', taille: "prix d'une cagette" },
        juste: `Le cuisinier paie {r} €.`,
        fausses: [`Une cagette de pommes coûte {r} €.`, `Le cuisinier achète {r} cagettes.`],
        unite: '€',
      }) },

    { id: 'marche-2-012', structure: 'GT', themes: ['jouets'], niveaux: [1, 2], max: 45,
      nombres: prixTotal({ 1: { n: [2, 5], t: [2, 5] }, 2: { n: [3, 9], t: [2, 5] } }),
      texte: A => ({
        phrases: [`Au magasin de jouets, un sachet de billes coûte {b|€}.`, `${A.n} achète {a|sachets}.`],
        question: `Combien ${A.n} paie-t-${A.il} ?`,
        labels: { total: 'prix total', nb: 'sachets', taille: "prix d'un sachet" },
        juste: `${A.n} paie {r} €.`,
        fausses: [`Un sachet de billes coûte {r} €.`, `${A.n} achète {r} sachets.`],
        unite: '€',
      }) },

    { id: 'marche-2-013', structure: 'GT', themes: ['jouets'], niveaux: [2, 3], max: 140,
      nombres: prixTotal({ 2: { n: [2, 9], t: [3, 9] }, 3: { n: [3, 9], t: [11, 15] } }),
      texte: A => ({
        phrases: [`${A.n} collectionne les figurines de dinosaures.`, `Une figurine coûte {b|€}.`, `Pour compléter sa collection, ${A.n} achète {a|figurines}.`],
        question: `Combien ${A.n} dépense-t-${A.il} ?`,
        labels: { total: 'prix total', nb: 'figurines', taille: "prix d'une figurine" },
        juste: `${A.n} dépense {r} €.`,
        fausses: [`Une figurine coûte {r} €.`, `${A.n} achète {r} figurines.`],
        unite: '€',
      }) },

    { id: 'marche-2-014', structure: 'GT', themes: ['jouets'], niveaux: [1, 2], max: 45,
      nombres: prixTotal({ 1: { n: [2, 5], t: [2, 5] }, 2: { n: [3, 9], t: [2, 5] } }),
      texte: A => ({
        phrases: [`${A.n} économise pour s'offrir un jouet.`, `Chaque fois qu'${A.il} aide au jardin, ${A.il} reçoit {b|€}.`, `Ce mois-ci, ${A.n} a aidé au jardin {a|fois}.`],
        question: `Combien d'euros ${A.n} a-t-${A.il} reçus ce mois-ci ?`,
        labels: { total: 'argent reçu', nb: 'fois', taille: 'pour une fois' },
        juste: `Ce mois-ci, ${A.n} a reçu {r} €.`,
        fausses: [`${A.n} reçoit {r} € chaque fois.`, `${A.n} a aidé au jardin {r} fois.`],
        unite: '€',
      }) },

    { id: 'marche-2-015', structure: 'GT', themes: ['espace'], max: 400,
      nombres: prixTotal({ 1: { n: [2, 5], t: [2, 5] }, 2: { n: [2, 9], t: [2, 9] }, 3: [{ n: [11, 25], t: [3, 9] }, { n: [3, 9], t: [12, 25] }] }),
      texte: () => ({
        phrases: [`Pour réparer sa fusée, Alvin achète {a|boîtes de boulons}.`, `Une boîte coûte {b|€}.`],
        question: `Combien Alvin paie-t-il ?`,
        labels: { total: 'prix total', nb: 'boîtes', taille: "prix d'une boîte" },
        juste: `Alvin paie {r} €.`,
        fausses: [`Une boîte de boulons coûte {r} €.`, `Alvin achète {r} boîtes de boulons.`],
        unite: '€',
      }) },

    { id: 'marche-2-016', structure: 'GT', themes: ['espace'], max: 300,
      nombres: prixTotal({ 1: { n: [3, 5], t: [2, 5] }, 2: { n: [4, 9], t: [4, 9] }, 3: { n: [12, 30], t: [4, 9] } }),
      texte: A => ({
        phrases: [`Le centre de loisirs ${A.de} emmène {a|enfants} au planétarium.`, `L'entrée coûte {b|€} par enfant.`],
        question: `Combien le centre de loisirs paie-t-il ?`,
        labels: { total: 'prix total', nb: 'enfants', taille: 'une entrée' },
        juste: `Le centre de loisirs paie {r} €.`,
        fausses: [`Une entrée coûte {r} €.`, `Le centre de loisirs emmène {r} enfants.`],
        unite: '€',
      }) },

    { id: 'marche-2-017', structure: 'GT', themes: ['espace'], niveaux: [1, 2], max: 45,
      nombres: prixTotal({ 1: { n: [2, 5], t: [2, 5] }, 2: { n: [3, 9], t: [2, 5] } }),
      texte: A => ({
        phrases: [`Une planche d'autocollants en forme d'étoiles coûte {b|€}.`, `${A.n} achète {a|planches} pour décorer sa chambre.`],
        question: `Combien ${A.n} paie-t-${A.il} ?`,
        labels: { total: 'prix total', nb: 'planches', taille: "prix d'une planche" },
        juste: `${A.n} paie {r} €.`,
        fausses: [`Une planche d'autocollants coûte {r} €.`, `${A.n} achète {r} planches.`],
        unite: '€',
      }) },

    { id: 'marche-2-018', structure: 'GT', themes: ['espace', 'cantine'], niveaux: [2, 3], max: 360,
      nombres: prixTotal({ 2: { n: [2, 9], t: [4, 9] }, 3: { n: [11, 40], t: [4, 9] } }),
      texte: () => ({
        phrases: [`Pour un long voyage, la capitaine de la fusée achète {a|repas en tube}.`, `Chaque repas coûte {b|€}.`],
        question: `Combien la capitaine paie-t-elle ?`,
        labels: { total: 'prix total', nb: 'repas', taille: "prix d'un repas" },
        juste: `La capitaine paie {r} €.`,
        fausses: [`Un repas en tube coûte {r} €.`, `La capitaine achète {r} repas en tube.`],
        unite: '€',
      }) },

    { id: 'marche-2-019', structure: 'GT', themes: ['vetements'], niveaux: [1, 2], max: 54,
      nombres: prixTotal({ 1: { n: [2, 5], t: [2, 5] }, 2: { n: [3, 9], t: [2, 6] } }),
      texte: A => ({
        phrases: [`${A.n} veut décorer sa veste en jean.`, `${A.Il} achète {a|écussons} à {b|€} chacun.`],
        question: `Combien ${A.n} dépense-t-${A.il} ?`,
        labels: { total: 'prix total', nb: 'écussons', taille: "prix d'un écusson" },
        juste: `${A.n} dépense {r} €.`,
        fausses: [`Un écusson coûte {r} €.`, `${A.n} achète {r} écussons.`],
        unite: '€',
      }) },

    { id: 'marche-2-020', structure: 'GT', themes: ['fete', 'vetements'], niveaux: [2, 3], max: 300,
      nombres: prixTotal({ 2: { n: [2, 9], t: [3, 9] }, 3: { n: [12, 30], t: [3, 8] } }),
      texte: () => ({
        phrases: [`Pour le carnaval, l'école loue {a|déguisements}.`, `La location d'un déguisement coûte {b|€}.`],
        question: `Combien l'école paie-t-elle ?`,
        labels: { total: 'prix total', nb: 'déguisements', taille: 'un déguisement' },
        juste: `L'école paie {r} €.`,
        fausses: [`La location d'un déguisement coûte {r} €.`, `L'école loue {r} déguisements.`],
        unite: '€',
      }) },

    { id: 'marche-2-021', structure: 'GT', themes: ['jouets'], niveaux: [2, 3], max: 180,
      nombres: prixTotal({ 2: { n: [2, 9], t: [5, 9] }, 3: { n: [3, 9], t: [11, 19] } }),
      texte: () => ({
        phrases: [`Le magasin de jouets vend des puzzles à {b|€}.`, `La maîtresse achète {a|puzzles} pour le coin jeux de la classe.`],
        question: `Combien la maîtresse dépense-t-elle ?`,
        labels: { total: 'prix total', nb: 'puzzles', taille: "prix d'un puzzle" },
        juste: `La maîtresse dépense {r} €.`,
        fausses: [`Un puzzle coûte {r} €.`, `La maîtresse achète {r} puzzles.`],
        unite: '€',
      }) },

    { id: 'marche-2-022', structure: 'GT', themes: ['fete'], max: 180,
      nombres: prixTotal({ 1: { n: [3, 5], t: [2, 5] }, 2: { n: [3, 9], t: [4, 9] }, 3: { n: [11, 20], t: [4, 9] } }),
      texte: A => ({
        phrases: [`Pour l'anniversaire ${A.de}, {a|enfants} vont au bowling.`, `Une partie coûte {b|€} par enfant.`],
        question: `Combien faut-il payer pour tous les enfants ?`,
        labels: { total: 'prix total', nb: 'enfants', taille: 'une partie' },
        juste: `Il faut payer {r} € pour tous les enfants.`,
        fausses: [`Une partie coûte {r} €.`, `Il y a {r} enfants au bowling.`],
        unite: '€',
      }) },

    { id: 'marche-2-023', structure: 'GT', themes: ['vetements'], niveaux: [2, 3], max: 150,
      nombres: prixTotal({ 2: { n: [2, 5], t: [6, 9] }, 3: { n: [3, 6], t: [11, 25] } }),
      texte: A => ({
        phrases: [`Au marché, ${A.n} choisit des écharpes à {b|€}.`, `${A.Il} achète {a|écharpes}, une pour chaque personne de sa famille.`],
        question: `Combien ${A.n} paie-t-${A.il} ?`,
        labels: { total: 'prix total', nb: 'écharpes', taille: "prix d'une écharpe" },
        juste: `${A.n} paie {r} €.`,
        fausses: [`Une écharpe coûte {r} €.`, `${A.n} achète {r} écharpes.`],
        unite: '€',
      }) },

    { id: 'marche-2-024', structure: 'GT', themes: ['jouets'], niveaux: [2, 3], max: 100,
      nombres: prixTotal({ 2: { n: [3, 9], t: [2, 5] }, 3: { n: [11, 20], t: [2, 5] } }),
      texte: A => ({
        phrases: [`${A.n} veut s'acheter un robot.`, `Pendant {a|semaines}, ${A.n} met {b|€} de côté chaque semaine.`],
        question: `Combien d'euros ${A.n} a-t-${A.il} économisés ?`,
        labels: { total: 'argent économisé', nb: 'semaines', taille: 'chaque semaine' },
        juste: `${A.n} a économisé {r} €.`,
        fausses: [`${A.n} met {r} € de côté chaque semaine.`, `${A.n} économise pendant {r} semaines.`],
        unite: '€',
      }) },
  ]);

  // ===========================================================================
  // GP : partager une somme équitablement, ou trouver le prix d'un objet (a € pour b objets → a ÷ b)
  // ===========================================================================
  Problemes.ajouter('marche', [
    { id: 'marche-2-025', structure: 'GP', themes: ['fete'], max: 150,
      nombres: partage({ 1: { n: [2, 5], t: { l: [2, 3, 4, 5, 10] } }, 2: { n: [2, 6], t: [3, 9] }, 3: { n: [2, 6], t: [11, 25] } }),
      texte: A => ({
        phrases: [`Pour Noël, la mamie ${A.de} a mis {a|€} de côté.`, `Elle partage cet argent équitablement entre ses {b|petits-enfants}.`],
        question: `Combien d'euros chaque petit-enfant reçoit-il ?`,
        labels: { total: "tout l'argent", nb: 'petits-enfants', taille: 'pour un enfant' },
        juste: `Chaque petit-enfant reçoit {r} €.`,
        fausses: [`La mamie ${A.de} a mis {r} € de côté.`, `La mamie ${A.de} a {r} petits-enfants.`],
        unite: '€',
      }) },

    { id: 'marche-2-026', structure: 'GP', themes: ['fete', 'jouets'], max: 120,
      nombres: partage({ 1: { n: [2, 5], t: [2, 5] }, 2: { n: [2, 6], t: [3, 9] }, 3: { n: [3, 6], t: [11, 16] } }),
      texte: A => ({
        phrases: [`Pour l'anniversaire ${A.de}, des amis achètent ensemble un jeu de société à {a|€}.`, `Ils sont {b|amis} et chacun paie la même somme.`],
        question: `Combien chaque ami paie-t-il ?`,
        labels: { total: 'prix du jeu', nb: 'amis', taille: 'pour un ami' },
        juste: `Chaque ami paie {r} €.`,
        fausses: [`Le jeu de société coûte {r} €.`, `Il y a {r} amis.`],
        unite: '€',
      }) },

    { id: 'marche-2-027', structure: 'GP', themes: ['cantine'], max: 100,
      nombres: partage({ 1: { n: [2, 5], t: [2, 5] }, 2: { n: [4, 9], t: [2, 5] }, 3: { n: [11, 20], t: [3, 5] } }),
      texte: A => ({
        phrases: [`${A.n} paie {a|€} pour {b|repas} à la cantine.`, `Tous les repas ont le même prix.`],
        question: `Combien coûte un repas ?`,
        labels: { total: 'prix payé', nb: 'repas', taille: "prix d'un repas" },
        juste: `Un repas coûte {r} €.`,
        fausses: [`${A.n} paie {r} € en tout.`, `${A.n} mange {r} repas.`],
        unite: '€',
      }) },

    { id: 'marche-2-028', structure: 'GP', themes: ['vetements'], niveaux: [2, 3], max: 120,
      nombres: partage({ 2: { n: [2, 6], t: [4, 9] }, 3: { n: [2, 6], t: [11, 19] } }),
      texte: A => ({
        phrases: [`La maman ${A.de} achète {b|T-shirts} identiques.`, `Elle paie {a|€} en tout.`],
        question: `Combien coûte un T-shirt ?`,
        labels: { total: 'prix payé', nb: 'T-shirts', taille: "prix d'un T-shirt" },
        juste: `Un T-shirt coûte {r} €.`,
        fausses: [`La maman ${A.de} paie {r} € en tout.`, `La maman ${A.de} achète {r} T-shirts.`],
        unite: '€',
      }) },

    { id: 'marche-2-029', structure: 'GP', themes: ['jouets'], max: 150,
      nombres: partage({ 1: { n: [3, 5], t: [2, 5] }, 2: { n: [3, 5], t: [6, 9] }, 3: { n: [3, 5], t: [11, 30] } }),
      texte: A => ({
        phrases: [`${A.n} et ses frères et sœurs vident leur tirelire commune.`, `Dans la tirelire, il y a {a|€}.`, `Les {b|enfants} se partagent l'argent équitablement pour acheter des jouets.`],
        question: `Combien d'euros chaque enfant reçoit-il ?`,
        labels: { total: 'la tirelire', nb: 'enfants', taille: 'pour un enfant' },
        juste: `Chaque enfant reçoit {r} €.`,
        fausses: [`La tirelire contient {r} €.`, `Il y a {r} enfants.`],
        unite: '€',
      }) },

    { id: 'marche-2-030', structure: 'GP', themes: ['jouets'], niveaux: [1, 2], max: 48,
      nombres: partage({ 1: { n: [2, 5], t: [2, 5] }, 2: { n: [3, 8], t: [2, 6] } }),
      texte: () => ({
        phrases: [`Au magasin de jouets, un lot de {b|petites voitures} coûte {a|€}.`, `Toutes les voitures du lot ont le même prix.`],
        question: `Combien coûte une petite voiture ?`,
        labels: { total: 'prix du lot', nb: 'voitures', taille: "prix d'une voiture" },
        juste: `Une petite voiture coûte {r} €.`,
        fausses: [`Le lot coûte {r} €.`, `Il y a {r} voitures dans le lot.`],
        unite: '€',
      }) },

    { id: 'marche-2-031', structure: 'GP', themes: ['espace'], niveaux: [2, 3], max: 300,
      nombres: partage({ 2: { n: [3, 9], t: [5, 9] }, 3: { n: [3, 9], t: [11, 30] } }),
      texte: () => ({
        phrases: [`Alvin et ses amis louent un petit vaisseau pour faire le tour de la Lune.`, `La location coûte {a|€}.`, `Ils sont {b|amis} et chacun paie la même somme.`],
        question: `Combien chaque ami paie-t-il ?`,
        labels: { total: 'la location', nb: 'amis', taille: 'pour un ami' },
        juste: `Chaque ami paie {r} €.`,
        fausses: [`La location coûte {r} €.`, `Il y a {r} amis.`],
        unite: '€',
      }) },

    { id: 'marche-2-032', structure: 'GP', themes: ['fete'], niveaux: [2, 3], max: 900,
      nombres: partage({ 2: { n: [2, 9], t: [10, 90, 10] }, 3: { n: [3, 9], t: [21, 99] } }),
      texte: () => ({
        phrases: [`À la kermesse, l'école gagne {a|€}.`, `La directrice partage cet argent équitablement entre {b|classes}.`],
        question: `Combien d'euros chaque classe reçoit-elle ?`,
        labels: { total: "l'argent gagné", nb: 'classes', taille: 'pour une classe' },
        juste: `Chaque classe reçoit {r} €.`,
        fausses: [`L'école gagne {r} € à la kermesse.`, `La directrice partage l'argent entre {r} classes.`],
        unite: '€',
      }) },

    { id: 'marche-2-033', structure: 'GP', themes: ['cantine'], niveaux: [2, 3], max: 540,
      nombres: partage({ 2: { n: [2, 5], t: { l: [10, 20, 30, 40, 50] } }, 3: { n: [3, 9], t: [12, 60] } }),
      texte: () => ({
        phrases: [`Le cuisinier de la cantine a {a|€} pour acheter des fruits.`, `Il doit dépenser la même somme chaque semaine, pendant {b|semaines}.`],
        question: `Combien d'euros le cuisinier peut-il dépenser chaque semaine ?`,
        labels: { total: "tout l'argent", nb: 'semaines', taille: 'pour une semaine' },
        juste: `Le cuisinier peut dépenser {r} € chaque semaine.`,
        fausses: [`Le cuisinier a {r} € en tout.`, `Le cuisinier achète des fruits pendant {r} semaines.`],
        unite: '€',
      }) },

    { id: 'marche-2-034', structure: 'GP', themes: ['vetements', 'jouets'], niveaux: [2, 3], max: 300,
      nombres: partage({ 2: { n: [2, 5], t: { l: [10, 20, 30] } }, 3: { n: [3, 9], t: [15, 35] } }),
      texte: A => ({
        phrases: [`Le club de foot ${A.de} paie {a|€} pour des maillots neufs.`, `Le club reçoit {b|maillots}, tous au même prix.`],
        question: `Combien coûte un maillot ?`,
        labels: { total: 'prix payé', nb: 'maillots', taille: "prix d'un maillot" },
        juste: `Un maillot coûte {r} €.`,
        fausses: [`Le club paie {r} € en tout.`, `Le club reçoit {r} maillots.`],
        unite: '€',
      }) },

    { id: 'marche-2-035', structure: 'GP', themes: ['fete'], niveaux: [2, 3], max: 360,
      nombres: partage({ 2: { n: [2, 9], t: { l: [10, 20] } }, 3: { n: [3, 9], t: [11, 40] } }),
      texte: () => ({
        phrases: [`Pour la fête du quartier, un magicien demande {a|€} pour son spectacle.`, `Les {b|familles} du quartier partagent ce prix équitablement.`],
        question: `Combien chaque famille paie-t-elle ?`,
        labels: { total: 'prix du magicien', nb: 'familles', taille: 'pour une famille' },
        juste: `Chaque famille paie {r} €.`,
        fausses: [`Le magicien demande {r} €.`, `Il y a {r} familles.`],
        unite: '€',
      }) },

    { id: 'marche-2-036', structure: 'GP', themes: ['jouets'], max: 150,
      nombres: partage({ 1: { n: [3, 5], t: [2, 5] }, 2: { n: [3, 9], t: [2, 9] }, 3: { n: [3, 6], t: [11, 25] } }),
      texte: A => ({
        phrases: [`${A.n} et ses amis gagnent le concours de cerfs-volants.`, `Ils reçoivent {a|€} en récompense.`, `Les {b|enfants} de l'équipe se partagent la somme équitablement.`],
        question: `Combien d'euros chaque enfant reçoit-il ?`,
        labels: { total: 'la récompense', nb: 'enfants', taille: 'pour un enfant' },
        juste: `Chaque enfant reçoit {r} €.`,
        fausses: [`Les enfants reçoivent {r} € en tout.`, `Il y a {r} enfants dans l'équipe.`],
        unite: '€',
      }) },

    { id: 'marche-2-037', structure: 'GP', themes: ['espace'], niveaux: [1, 2], max: 48,
      nombres: partage({ 1: { n: [2, 5], t: [2, 5] }, 2: { n: [3, 8], t: [2, 6] } }),
      texte: A => ({
        phrases: [`${A.n} achète {b|posters de planètes} pour sa chambre.`, `${A.n} paie {a|€} pour le tout.`, `Les posters ont tous le même prix.`],
        question: `Combien coûte un poster ?`,
        labels: { total: 'prix payé', nb: 'posters', taille: "prix d'un poster" },
        juste: `Un poster coûte {r} €.`,
        fausses: [`${A.n} paie {r} € pour le tout.`, `${A.n} achète {r} posters.`],
        unite: '€',
      }) },

    { id: 'marche-2-038', structure: 'GP', themes: ['vetements'], niveaux: [1, 2], max: 36,
      nombres: partage({ 1: { n: [2, 5], t: [2, 4] }, 2: { n: [3, 9], t: [2, 4] } }),
      texte: () => ({
        phrases: [`Au marché, la marchande vend des chaussettes par lots.`, `Un lot de {b|paires de chaussettes} coûte {a|€}.`, `Toutes les paires du lot ont le même prix.`],
        question: `Combien coûte une paire de chaussettes ?`,
        labels: { total: 'prix du lot', nb: 'paires', taille: "prix d'une paire" },
        juste: `Une paire de chaussettes coûte {r} €.`,
        fausses: [`Le lot coûte {r} €.`, `Il y a {r} paires dans le lot.`],
        unite: '€',
      }) },

    { id: 'marche-2-039', structure: 'GP', themes: ['cantine'], niveaux: [2, 3], max: 150,
      nombres: partage({ 2: { n: [2, 9], t: [3, 9] }, 3: { n: [11, 25], t: [3, 6] } }),
      texte: () => ({
        phrases: [`Pour la sortie au parc, le cuisinier de la cantine prépare {b|paniers de pique-nique} identiques.`, `En tout, les ingrédients coûtent {a|€}.`],
        question: `Combien coûte un panier de pique-nique ?`,
        labels: { total: 'tous les paniers', nb: 'paniers', taille: "prix d'un panier" },
        juste: `Un panier de pique-nique coûte {r} €.`,
        fausses: [`Les ingrédients coûtent {r} € en tout.`, `Le cuisinier prépare {r} paniers.`],
        unite: '€',
      }) },

    { id: 'marche-2-040', structure: 'GP', themes: ['fete'], max: 180,
      nombres: partage({ 1: { n: [2, 5], t: [2, 5] }, 2: { n: [2, 9], t: [2, 9] }, 3: { n: [3, 9], t: [11, 20] } }),
      texte: A => ({
        phrases: [`Pour le jeu de la kermesse, ${A.n} cache {a|€} dans des enveloppes.`, `${A.n} prépare {b|enveloppes} avec la même somme dans chacune.`],
        question: `Combien d'euros y a-t-il dans chaque enveloppe ?`,
        labels: { total: "tout l'argent", nb: 'enveloppes', taille: 'dans une enveloppe' },
        juste: `Il y a {r} € dans chaque enveloppe.`,
        fausses: [`${A.n} cache {r} € en tout.`, `${A.n} prépare {r} enveloppes.`],
        unite: '€',
      }) },
  ]);

  // ===========================================================================
  // GG : combien d'objets avec une somme, quand le compte tombe juste (a € dépensés, b € l'objet → a ÷ b)
  // ===========================================================================
  Problemes.ajouter('marche', [
    { id: 'marche-2-041', structure: 'GG', themes: ['vetements'], max: 140,
      nombres: combien({ 2: { n: [2, 9], t: [4, 9] }, 3: { n: [3, 9], t: [11, 15] } }),
      texte: A => ({
        phrases: [`${A.n} a {a|€} pour offrir des casquettes à son équipe.`, `Au marché, une casquette coûte {b|€}.`, `${A.n} dépense tout son argent.`],
        question: `Combien de casquettes ${A.n} achète-t-${A.il} ?`,
        labels: { total: "tout l'argent", nb: 'casquettes', taille: "prix d'une casquette" },
        juste: `${A.n} achète {r} casquettes.`,
        fausses: [`Une casquette coûte {r} €.`, `${A.n} dépense {r} € en tout.`],
        unite: 'casquettes',
      }) },

    { id: 'marche-2-042', structure: 'GG', themes: ['fete'], max: 120,
      nombres: combien({ 2: { n: [2, 9], t: [2, 3] }, 3: { n: [11, 30], t: [2, 3] } }),
      texte: A => ({
        phrases: [`À la fête de l'école, un ticket de tombola coûte {b|€}.`, `${A.n} dépense {a|€} en tickets.`],
        question: `Combien de tickets ${A.n} a-t-${A.il} achetés ?`,
        labels: { total: 'argent dépensé', nb: 'tickets', taille: "prix d'un ticket" },
        juste: `${A.n} a acheté {r} tickets.`,
        fausses: [`Un ticket coûte {r} €.`, `${A.n} a dépensé {r} €.`],
        unite: 'tickets',
      }) },

    { id: 'marche-2-043', structure: 'GG', themes: ['cantine'], max: 150,
      nombres: combien({ 2: { n: [2, 9], t: [2, 5] }, 3: { n: [11, 30], t: [3, 5] } }),
      texte: () => ({
        phrases: [`Le cuisinier de la cantine paie {a|€} pour des pastèques.`, `Une pastèque coûte {b|€}.`],
        question: `Combien de pastèques le cuisinier achète-t-il ?`,
        labels: { total: 'prix payé', nb: 'pastèques', taille: "prix d'une pastèque" },
        juste: `Le cuisinier achète {r} pastèques.`,
        fausses: [`Une pastèque coûte {r} €.`, `Le cuisinier paie {r} €.`],
        unite: 'pastèques',
      }) },

    { id: 'marche-2-044', structure: 'GG', themes: ['jouets'], max: 100,
      nombres: combien({ 2: { n: [2, 9], t: [2, 6] }, 3: { n: [11, 20], t: [2, 5] } }),
      texte: A => ({
        phrases: [`${A.n} veut acheter des petites voitures à {b|€}.`, `${A.n} a {a|€} et veut tout dépenser.`],
        question: `Combien de petites voitures ${A.n} peut-${A.il} acheter ?`,
        labels: { total: "l'argent", nb: 'voitures', taille: "prix d'une voiture" },
        juste: `${A.n} peut acheter {r} petites voitures.`,
        fausses: [`Une petite voiture coûte {r} €.`, `${A.n} a {r} €.`],
        unite: 'voitures',
      }) },

    { id: 'marche-2-045', structure: 'GG', themes: ['espace'], max: 180,
      nombres: combien({ 2: { n: [2, 9], t: [4, 9] }, 3: { n: [3, 9], t: [11, 19] } }),
      texte: A => ({
        phrases: [`À la boutique de la base lunaire, une lampe frontale coûte {b|€}.`, `${A.n} dépense {a|€} en lampes frontales pour son équipe.`],
        question: `Combien de lampes frontales ${A.n} achète-t-${A.il} ?`,
        labels: { total: 'argent dépensé', nb: 'lampes', taille: "prix d'une lampe" },
        juste: `${A.n} achète {r} lampes frontales.`,
        fausses: [`Une lampe frontale coûte {r} €.`, `${A.n} dépense {r} € en tout.`],
        unite: 'lampes',
      }) },

    { id: 'marche-2-046', structure: 'GG', themes: ['fete'], max: 120,
      nombres: combien({ 2: { n: [2, 9], t: [2, 4] }, 3: { n: [11, 30], t: [2, 4] } }),
      texte: A => ({
        phrases: [`Pour sa fête, ${A.n} achète des chapeaux pointus.`, `Un chapeau coûte {b|€}.`, `${A.n} paie {a|€} en tout.`],
        question: `Combien de chapeaux ${A.n} a-t-${A.il} achetés ?`,
        labels: { total: 'prix payé', nb: 'chapeaux', taille: "prix d'un chapeau" },
        juste: `${A.n} a acheté {r} chapeaux.`,
        fausses: [`Un chapeau coûte {r} €.`, `${A.n} a payé {r} € en tout.`],
        unite: 'chapeaux',
      }) },

    { id: 'marche-2-047', structure: 'GG', themes: ['vetements', 'fete'], max: 250,
      nombres: combien({ 2: { n: [2, 9], t: { l: [10, 20, 30] } }, 3: { n: [3, 9], t: [12, 25] } }),
      texte: A => ({
        phrases: [`Le club de danse ${A.de} achète des tutus pour le spectacle.`, `Un tutu coûte {b|€}.`, `Le club paie {a|€}.`],
        question: `Combien de tutus le club achète-t-il ?`,
        labels: { total: 'prix payé', nb: 'tutus', taille: "prix d'un tutu" },
        juste: `Le club achète {r} tutus.`,
        fausses: [`Un tutu coûte {r} €.`, `Le club paie {r} €.`],
        unite: 'tutus',
      }) },

    { id: 'marche-2-048', structure: 'GG', themes: ['cantine'], max: 125,
      nombres: combien({ 2: { n: [2, 9], t: [2, 5] }, 3: { n: [11, 25], t: [3, 5] } }),
      texte: A => ({
        phrases: [`Les parents ${A.de} donnent {a|€} pour la cantine.`, `Un repas coûte {b|€}.`],
        question: `Pour combien de repas cet argent suffit-il ?`,
        labels: { total: "l'argent donné", nb: 'repas', taille: "prix d'un repas" },
        juste: `Cet argent suffit pour {r} repas.`,
        fausses: [`Un repas coûte {r} €.`, `Les parents ${A.de} donnent {r} €.`],
        unite: 'repas',
      }) },

    { id: 'marche-2-049', structure: 'GG', themes: ['jouets'], max: 225,
      nombres: combien({ 2: { n: [2, 9], t: [6, 9] }, 3: { n: [3, 9], t: [11, 25] } }),
      texte: () => ({
        phrases: [`Le magasin de jouets vend des cerfs-volants à {b|€}.`, `Le centre de loisirs dépense {a|€} en cerfs-volants.`],
        question: `Combien de cerfs-volants le centre de loisirs achète-t-il ?`,
        labels: { total: 'argent dépensé', nb: 'cerfs-volants', taille: "prix d'un cerf-volant" },
        juste: `Le centre de loisirs achète {r} cerfs-volants.`,
        fausses: [`Un cerf-volant coûte {r} €.`, `Le centre de loisirs dépense {r} €.`],
        unite: 'cerfs-volants',
      }) },

    { id: 'marche-2-050', structure: 'GG', themes: ['espace', 'jouets'], max: 180,
      nombres: combien({ 2: { n: [2, 5], t: [6, 9] }, 3: { n: [2, 6], t: [12, 30] } }),
      texte: A => ({
        phrases: [`Une maquette de fusée coûte {b|€}.`, `${A.n} a économisé {a|€}.`, `${A.n} veut acheter des maquettes et dépenser tout son argent.`],
        question: `Combien de maquettes ${A.n} peut-${A.il} acheter ?`,
        labels: { total: "l'argent économisé", nb: 'maquettes', taille: "prix d'une maquette" },
        juste: `${A.n} peut acheter {r} maquettes.`,
        fausses: [`Une maquette coûte {r} €.`, `${A.n} a économisé {r} €.`],
        unite: 'maquettes',
      }) },

    { id: 'marche-2-051', structure: 'GG', themes: ['fete', 'cantine'], max: 120,
      nombres: combien({ 2: { n: [2, 9], t: [2, 3] }, 3: { n: [11, 40], t: [2, 3] } }),
      texte: A => ({
        phrases: [`À la kermesse, ${A.n} vend des crêpes à {b|€} chacune.`, `À la fin de la journée, ${A.n} a gagné {a|€}.`],
        question: `Combien de crêpes ${A.n} a-t-${A.il} vendues ?`,
        labels: { total: 'argent gagné', nb: 'crêpes', taille: "prix d'une crêpe" },
        juste: `${A.n} a vendu {r} crêpes.`,
        fausses: [`Une crêpe coûte {r} €.`, `${A.n} a gagné {r} €.`],
        unite: 'crêpes',
      }) },

    { id: 'marche-2-052', structure: 'GG', themes: ['vetements', 'fete'], max: 100,
      nombres: combien({ 2: { n: [2, 9], t: [2, 5] }, 3: { n: [11, 20], t: [3, 5] } }),
      texte: A => ({
        phrases: [`La mamie ${A.de} offre des chaussettes de Noël à toute la famille.`, `Une paire coûte {b|€}.`, `La mamie dépense {a|€}.`],
        question: `Combien de paires de chaussettes la mamie achète-t-elle ?`,
        labels: { total: 'argent dépensé', nb: 'paires', taille: "prix d'une paire" },
        juste: `La mamie achète {r} paires de chaussettes.`,
        fausses: [`Une paire coûte {r} €.`, `La mamie dépense {r} €.`],
        unite: 'paires',
      }) },

    { id: 'marche-2-053', structure: 'GG', themes: ['espace'], max: 270,
      nombres: combien({ 2: { n: [2, 9], t: [4, 9] }, 3: { n: [11, 30], t: [3, 9] } }),
      texte: () => ({
        phrases: [`Avant de décoller, Alvin fait le plein de sa fusée.`, `Un bidon de carburant coûte {b|€}.`, `Alvin paie {a|€} pour des bidons.`],
        question: `Combien de bidons Alvin achète-t-il ?`,
        labels: { total: 'prix payé', nb: 'bidons', taille: "prix d'un bidon" },
        juste: `Alvin achète {r} bidons de carburant.`,
        fausses: [`Un bidon coûte {r} €.`, `Alvin paie {r} €.`],
        unite: 'bidons',
      }) },

    { id: 'marche-2-054', structure: 'GG', themes: ['cantine'], max: 200,
      nombres: combien({ 2: { n: [4, 9], t: [4, 9] }, 3: { n: [11, 25], t: [3, 8] } }),
      texte: () => ({
        phrases: [`La cantine a {a|€} pour acheter des fromages.`, `Chaque fromage coûte {b|€}.`, `La cantine dépense tout l'argent.`],
        question: `Combien de fromages la cantine achète-t-elle ?`,
        labels: { total: "tout l'argent", nb: 'fromages', taille: "prix d'un fromage" },
        juste: `La cantine achète {r} fromages.`,
        fausses: [`Un fromage coûte {r} €.`, `La cantine a {r} €.`],
        unite: 'fromages',
      }) },
  ]);

  // ===========================================================================
  // FP (grade 3) : « b fois plus cher » (a € pour le moins cher, b entre 2 et 5 → a × b)
  // ===========================================================================
  Problemes.ajouter('marche', [
    { id: 'marche-2-055', structure: 'FP', themes: ['vetements'], max: 100,
      nombres: foisPlus({ 3: { n: [2, 5], t: [6, 20] } }),
      texte: () => ({
        phrases: [`Au magasin, une casquette coûte {a|€}.`, `Un blouson coûte {b} fois plus cher que la casquette.`],
        question: `Combien coûte le blouson ?`,
        labels: { petit: 'la casquette', grand: 'le blouson' },
        juste: `Le blouson coûte {r} €.`,
        fausses: [`La casquette coûte {r} €.`, `Le blouson coûte {r} € de plus que la casquette.`],
        unite: '€',
      }) },

    { id: 'marche-2-056', structure: 'FP', themes: ['jouets'], max: 200,
      nombres: foisPlus({ 3: { n: [2, 5], t: [11, 30] } }),
      texte: (A, B) => ({
        phrases: [`${A.n} et ${B.n} économisent pour acheter des jouets.`, `${A.n} a {a|€} dans sa tirelire.`, `${B.n} a {b} fois plus d'argent ${A.que}.`],
        question: `Combien d'euros ${B.n} a-t-${B.il} ?`,
        labels: { petit: A.n, grand: B.n },
        juste: `${B.n} a {r} €.`,
        fausses: [`${A.n} a {r} €.`, `${B.n} a {r} € de plus ${A.que}.`],
        unite: '€',
      }) },

    { id: 'marche-2-057', structure: 'FP', themes: ['fete'], max: 125,
      nombres: foisPlus({ 3: { n: [2, 5], t: [8, 25] } }),
      texte: () => ({
        phrases: [`Pour la fête, un petit gâteau coûte {a|€}.`, `Le grand gâteau à étages coûte {b} fois plus cher que le petit.`],
        question: `Combien coûte le grand gâteau ?`,
        labels: { petit: 'petit gâteau', grand: 'grand gâteau' },
        juste: `Le grand gâteau coûte {r} €.`,
        fausses: [`Le petit gâteau coûte {r} €.`, `Le grand gâteau coûte {r} € de plus que le petit.`],
        unite: '€',
      }) },

    { id: 'marche-2-058', structure: 'FP', themes: ['cantine'], max: 500,
      nombres: foisPlus({ 3: { n: [2, 5], t: [20, 99] } }),
      texte: () => ({
        phrases: [`Cette semaine, le cuisinier de la cantine dépense {a|€} pour les fruits.`, `Pour la viande, le cuisinier dépense {b} fois plus que pour les fruits.`],
        question: `Combien le cuisinier dépense-t-il pour la viande ?`,
        labels: { petit: 'les fruits', grand: 'la viande' },
        juste: `Le cuisinier dépense {r} € pour la viande.`,
        fausses: [`Le cuisinier dépense {r} € pour les fruits.`, `Le cuisinier dépense {r} € de plus pour la viande.`],
        unite: '€',
      }) },

    { id: 'marche-2-059', structure: 'FP', themes: ['espace', 'jouets'], max: 150,
      nombres: foisPlus({ 3: { n: [2, 5], t: [6, 30] } }),
      texte: () => ({
        phrases: [`Une petite maquette de fusée coûte {a|€}.`, `La grande maquette coûte {b} fois plus cher que la petite.`],
        question: `Combien coûte la grande maquette ?`,
        labels: { petit: 'petite maquette', grand: 'grande maquette' },
        juste: `La grande maquette coûte {r} €.`,
        fausses: [`La petite maquette coûte {r} €.`, `La grande maquette coûte {r} € de plus que la petite.`],
        unite: '€',
      }) },

    { id: 'marche-2-060', structure: 'FP', themes: ['vetements'], max: 60,
      nombres: foisPlus({ 3: { n: [2, 5], t: [5, 9] } }),
      texte: A => ({
        phrases: [`Au marché, ${A.n} achète une paire de chaussettes à {a|€}.`, `${A.Il} achète aussi des bottes de pluie qui coûtent {b} fois plus cher.`],
        question: `Combien coûtent les bottes de pluie ?`,
        labels: { petit: 'les chaussettes', grand: 'les bottes' },
        juste: `Les bottes de pluie coûtent {r} €.`,
        fausses: [`La paire de chaussettes coûte {r} €.`, `${A.n} paie {r} € en tout.`],
        unite: '€',
      }) },

    { id: 'marche-2-061', structure: 'FP', themes: ['jouets'], max: 100,
      nombres: foisPlus({ 3: { n: [3, 5], t: [10, 19] } }),
      texte: () => ({
        phrases: [`Au magasin de jouets, un ballon de foot coûte {a|€}.`, `Une trottinette coûte {b} fois plus cher que le ballon.`],
        question: `Combien coûte la trottinette ?`,
        labels: { petit: 'le ballon', grand: 'la trottinette' },
        juste: `La trottinette coûte {r} €.`,
        fausses: [`Le ballon coûte {r} €.`, `La trottinette coûte {r} € de plus que le ballon.`],
        unite: '€',
      }) },

    { id: 'marche-2-062', structure: 'FP', themes: ['fete'], max: 100,
      nombres: foisPlus({ 3: { n: [2, 5], t: [6, 20] } }),
      texte: (A, B, AB) => ({
        phrases: [`À la fête foraine, ${A.n} dépense {a|€}.`, `${B.n} dépense {b} fois plus ${A.que}.`],
        question: `Combien ${B.n} dépense-t-${B.il} ?`,
        labels: { petit: A.n, grand: B.n },
        juste: `${B.n} dépense {r} €.`,
        fausses: [`${A.n} dépense {r} €.`, `${A.n} et ${B.n} dépensent {r} € à ${AB.eux} deux.`],
        unite: '€',
      }) },

    { id: 'marche-2-063', structure: 'FP', themes: ['espace'], max: 60,
      nombres: foisPlus({ 3: { n: [2, 5], t: [5, 12] } }),
      texte: () => ({
        phrases: [`Une entrée au planétarium coûte {a|€}.`, `Un vol dans le simulateur de fusée coûte {b} fois plus cher que l'entrée.`],
        question: `Combien coûte un vol dans le simulateur ?`,
        labels: { petit: 'le planétarium', grand: 'le simulateur' },
        juste: `Un vol dans le simulateur coûte {r} €.`,
        fausses: [`Une entrée au planétarium coûte {r} €.`, `Le vol coûte {r} € de plus que l'entrée.`],
        unite: '€',
      }) },

    { id: 'marche-2-064', structure: 'FP', themes: ['cantine'], max: 200,
      nombres: foisPlus({ 3: { n: [2, 5], t: [12, 40] } }),
      texte: () => ({
        phrases: [`Pour sa cuisine, la cantine achète une petite marmite à {a|€}.`, `La grande marmite coûte {b} fois plus cher que la petite.`],
        question: `Combien coûte la grande marmite ?`,
        labels: { petit: 'petite marmite', grand: 'grande marmite' },
        juste: `La grande marmite coûte {r} €.`,
        fausses: [`La petite marmite coûte {r} €.`, `La grande marmite coûte {r} € de plus que la petite.`],
        unite: '€',
      }) },
  ]);

  // ===========================================================================
  // Grade 3 : les centimes (structures additives, montants entiers en centimes)
  // ===========================================================================
  const c5 = (lo, hi, rnd) => 5 * rnd(Math.ceil(lo / 5), Math.floor(hi / 5));   // prix « ronds » : multiple de 5 centimes

  Problemes.ajouter('marche', [
    { id: 'marche-2-065', structure: 'CT', themes: ['fete'], niveaux: [3], max: 200,
      nombres: (niv, rnd) => ({ a: c5(20, 90, rnd), b: c5(10, 50, rnd) }),
      texte: A => ({
        phrases: [`À la kermesse, ${A.n} achète une sucette à {a|centimes} et un caramel à {b|centimes}.`],
        question: `Combien ${A.n} paie-t-${A.il} en tout ?`,
        labels: { tout: 'en tout', p1: 'la sucette', p2: 'le caramel' },
        juste: `${A.n} paie {r} centimes en tout.`,
        fausses: [`La sucette coûte {r} centimes.`, `Le caramel coûte {r} centimes.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-066', structure: 'TP', themes: ['jouets'], niveaux: [3], max: 99,
      nombres: (niv, rnd) => ({ a: rnd(60, 99), b: c5(10, 50, rnd) }),
      texte: A => ({
        phrases: [`${A.n} a {a|centimes} dans sa poche.`, `${A.Il} achète une bille géante à {b|centimes}.`],
        question: `Combien de centimes reste-t-il à ${A.n} ?`,
        labels: { tout: 'au début', p1: 'la bille', p2: 'ce qui reste' },
        juste: `Il reste {r} centimes à ${A.n}.`,
        fausses: [`La bille géante coûte {r} centimes.`, `${A.n} avait {r} centimes au début.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-067', structure: 'CE', themes: ['fete'], niveaux: [3], max: 99,
      nombres: (niv, rnd) => ({ a: c5(20, 60, rnd), b: c5(65, 95, rnd) }),
      texte: () => ({
        phrases: [`Au stand des bonbons, une sucette coûte {a|centimes}.`, `Une barre de chocolat coûte {b|centimes}.`],
        question: `Combien de centimes de plus coûte la barre de chocolat ?`,
        labels: { grand: 'la barre', petit: 'la sucette' },
        juste: `La barre de chocolat coûte {r} centimes de plus que la sucette.`,
        fausses: [`La barre de chocolat coûte {r} centimes.`, `La sucette et la barre coûtent {r} centimes ensemble.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-068', structure: 'CPlus', themes: ['jouets'], niveaux: [3], max: 150,
      nombres: (niv, rnd) => ({ a: c5(10, 40, rnd), b: c5(20, 80, rnd) }),
      texte: () => ({
        phrases: [`Un autocollant coûte {a|centimes}.`, `Une balle rebondissante coûte {b|centimes} de plus que l'autocollant.`],
        question: `Combien coûte la balle rebondissante ?`,
        labels: { grand: 'la balle', petit: "l'autocollant" },
        juste: `La balle rebondissante coûte {r} centimes.`,
        fausses: [`L'autocollant coûte {r} centimes.`, `La balle coûte {r} centimes de plus que l'autocollant.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-069', structure: 'TG', themes: ['jouets'], niveaux: [3], max: 900,
      nombres: (niv, rnd) => ({ a: rnd(100, 500), b: rnd(20, 300) }),
      texte: A => ({
        phrases: [`${A.n} garde ses petites pièces pour s'acheter un jouet.`, `Dans la tirelire ${A.de}, il y a {a|centimes}.`, `La grand-mère ${A.de} ajoute {b|centimes} dans la tirelire.`],
        question: `Combien de centimes y a-t-il maintenant dans la tirelire ?`,
        labels: { tout: 'maintenant', p1: 'au début', p2: 'ajoutés' },
        juste: `Il y a maintenant {r} centimes dans la tirelire.`,
        fausses: [`La grand-mère ajoute {r} centimes.`, `Au début, il y avait {r} centimes dans la tirelire.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-070', structure: 'TTp', themes: ['fete'], niveaux: [3], max: 250,
      nombres: (niv, rnd) => { const a = rnd(80, 250); return { a, b: rnd(10, a - 20) }; },
      texte: A => ({
        phrases: [`Avant la fête, ${A.n} avait {a|centimes}.`, `${A.Il} achète des bonbons et il lui reste {b|centimes}.`],
        question: `Combien de centimes ${A.n} a-t-${A.il} dépensés ?`,
        labels: { tout: 'au début', p1: 'dépensés', p2: 'ce qui reste' },
        juste: `${A.n} a dépensé {r} centimes.`,
        fausses: [`Il reste {r} centimes à ${A.n}.`, `${A.n} avait {r} centimes au début.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-071', structure: 'TIp', themes: ['espace'], niveaux: [3], max: 200,
      nombres: (niv, rnd) => ({ a: c5(40, 95, rnd), b: rnd(5, 99) }),
      texte: () => ({
        phrases: [`Au distributeur de la station spatiale, Alvin achète un jus de comète à {a|centimes}.`, `Après l'achat, il reste {b|centimes} à Alvin.`],
        question: `Combien de centimes Alvin avait-il avant l'achat ?`,
        labels: { tout: 'avant', p1: 'le jus', p2: 'ce qui reste' },
        juste: `Alvin avait {r} centimes avant l'achat.`,
        fausses: [`Il reste {r} centimes à Alvin.`, `Le jus de comète coûte {r} centimes.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-072', structure: 'CInvM', themes: ['fete'], niveaux: [3], max: 100,
      nombres: (niv, rnd) => ({ a: c5(20, 60, rnd), b: c5(10, 35, rnd) }),
      texte: () => ({
        phrases: [`Pour la fête, un ballon de baudruche coûte {a|centimes}.`, `C'est {b|centimes} de moins qu'un sifflet.`],
        question: `Combien coûte le sifflet ?`,
        labels: { grand: 'le sifflet', petit: 'le ballon' },
        juste: `Le sifflet coûte {r} centimes.`,
        fausses: [`Le ballon de baudruche coûte {r} centimes.`, `Le sifflet coûte {r} centimes de moins que le ballon.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-073', structure: 'CInvP', themes: ['jouets'], niveaux: [3], max: 99,
      nombres: (niv, rnd) => ({ a: rnd(60, 99), b: rnd(10, 45) }),
      texte: (A, B) => ({
        phrases: [`${A.n} et ${B.n} comptent leurs pièces pour acheter des billes.`, `${A.n} a {a|centimes}.`, `C'est {b|centimes} de plus ${B.que}.`],
        question: `Combien de centimes ${B.n} a-t-${B.il} ?`,
        labels: { grand: A.n, petit: B.n },
        juste: `${B.n} a {r} centimes.`,
        fausses: [`${A.n} a {r} centimes.`, `${B.n} a {r} centimes de plus ${A.que}.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-074', structure: 'CP', themes: ['fete'], niveaux: [3], max: 600,
      nombres: (niv, rnd) => { const a = rnd(100, 600); return { a, b: rnd(40, a - 40) }; },
      texte: (A, B, AB) => ({
        phrases: [`Pour la fête de fin d'année, ${A.n} et ${B.n} mettent leurs petites pièces dans la cagnotte.`, `Ensemble, ${AB.ils} apportent {a|centimes}.`, `${A.n} apporte {b|centimes}.`],
        question: `Combien de centimes ${B.n} apporte-t-${B.il} ?`,
        labels: { tout: 'ensemble', p1: A.n, p2: B.n },
        juste: `${B.n} apporte {r} centimes.`,
        fausses: [`${A.n} apporte {r} centimes.`, `Ensemble, ${AB.ils} apportent {r} centimes.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-075', structure: 'CE', themes: ['vetements'], niveaux: [3], max: 99,
      nombres: (niv, rnd) => ({ a: c5(10, 40, rnd), b: c5(45, 95, rnd) }),
      texte: () => ({
        phrases: [`Au rayon couture, un bouton blanc coûte {a|centimes}.`, `Un bouton doré coûte {b|centimes}.`],
        question: `Combien de centimes de plus coûte le bouton doré ?`,
        labels: { grand: 'bouton doré', petit: 'bouton blanc' },
        juste: `Le bouton doré coûte {r} centimes de plus que le bouton blanc.`,
        fausses: [`Le bouton doré coûte {r} centimes.`, `Les deux boutons coûtent {r} centimes ensemble.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-076', structure: 'CMoins', themes: ['cantine'], niveaux: [3], max: 99,
      nombres: (niv, rnd) => { const a = c5(40, 90, rnd); return { a, b: c5(5, a - 20, rnd) }; },
      texte: () => ({
        phrases: [`Pour le goûter de la cantine, un yaourt aux fruits coûte {a|centimes}.`, `Une compote coûte {b|centimes} de moins que le yaourt.`],
        question: `Combien coûte la compote ?`,
        labels: { grand: 'le yaourt', petit: 'la compote' },
        juste: `La compote coûte {r} centimes.`,
        fausses: [`Le yaourt aux fruits coûte {r} centimes.`, `La compote coûte {r} centimes de moins que le yaourt.`],
        unite: 'centimes',
      }) },
  ]);

  // ===========================================================================
  // Grade 3 : convertir des euros en centimes (1 € = 100 centimes), formulé comme GT,
  // et compter des pièces en centimes
  // ===========================================================================
  Problemes.ajouter('marche', [
    { id: 'marche-2-077', structure: 'GT', themes: ['jouets'], niveaux: [3], max: 3000,
      nombres: (niv, rnd) => ({ a: rnd(2, 30), b: 100 }),
      texte: A => ({
        phrases: [`${A.n} a {a|€} dans sa tirelire pour s'acheter un jouet.`, `Un euro, c'est {b|centimes}.`],
        question: `Combien de centimes ${A.n} a-t-${A.il} ?`,
        labels: { total: 'en centimes', nb: 'euros', taille: 'centimes dans 1 €' },
        juste: `${A.n} a {r} centimes.`,
        fausses: [`${A.n} a {r} €.`, `Un euro vaut {r} centimes.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-078', structure: 'GT', themes: ['fete'], niveaux: [3], max: 900,
      nombres: (niv, rnd) => ({ a: rnd(2, 9), b: 100 }),
      texte: () => ({
        phrases: [`À la fête foraine, un tour de grande roue coûte {a|€}.`, `Rappel : dans 1 €, il y a {b|centimes}.`],
        question: `Combien de centimes coûte un tour de grande roue ?`,
        labels: { total: 'prix en centimes', nb: 'euros', taille: 'centimes dans 1 €' },
        juste: `Un tour de grande roue coûte {r} centimes.`,
        fausses: [`Un tour de grande roue coûte {r} €.`, `Dans 1 €, il y a {r} centimes.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-079', structure: 'GT', themes: ['espace'], niveaux: [3], max: 1500,
      nombres: (niv, rnd) => ({ a: rnd(3, 15), b: 100 }),
      texte: A => ({
        phrases: [`${A.n} veut acheter un écusson de fusée à {a|€}.`, `Le vendeur extraterrestre ne compte qu'en centimes.`, `Un euro vaut {b|centimes}.`],
        question: `Combien de centimes ${A.n} doit-${A.il} donner au vendeur ?`,
        labels: { total: 'prix en centimes', nb: 'euros', taille: 'centimes dans 1 €' },
        juste: `${A.n} doit donner {r} centimes au vendeur.`,
        fausses: [`L'écusson coûte {r} €.`, `Un euro vaut {r} centimes.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-080', structure: 'GT', themes: ['vetements'], niveaux: [3], max: 1900,
      nombres: (niv, rnd) => ({ a: rnd(5, 19), b: 100 }),
      texte: () => ({
        phrases: [`Au marché, un bonnet coûte {a|€}.`, `Un euro, c'est {b|centimes}.`],
        question: `Combien de centimes coûte le bonnet ?`,
        labels: { total: 'prix en centimes', nb: 'euros', taille: 'centimes dans 1 €' },
        juste: `Le bonnet coûte {r} centimes.`,
        fausses: [`Le bonnet coûte {r} €.`, `Un euro vaut {r} centimes.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-081', structure: 'GT', themes: ['cantine'], niveaux: [3], max: 500,
      nombres: (niv, rnd) => ({ a: rnd(2, 5), b: 100 }),
      texte: A => ({
        phrases: [`Un repas à la cantine coûte {a|€}.`, `${A.n} veut savoir combien cela fait en centimes.`, `Un euro vaut {b|centimes}.`],
        question: `Combien de centimes coûte un repas ?`,
        labels: { total: 'prix en centimes', nb: 'euros', taille: 'centimes dans 1 €' },
        juste: `Un repas coûte {r} centimes.`,
        fausses: [`Un repas coûte {r} €.`, `Un euro vaut {r} centimes.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-082', structure: 'GT', themes: ['fete'], niveaux: [3], max: 450,
      nombres: (niv, rnd, choix) => ({ a: rnd(3, 9), b: choix([10, 20, 50]) }),
      texte: A => ({
        phrases: [`Pour la kermesse, ${A.n} a {a|pièces} de {b|centimes}.`],
        question: `Combien de centimes ${A.n} a-t-${A.il} ?`,
        labels: { total: 'en tout', nb: 'pièces', taille: "valeur d'une pièce" },
        juste: `${A.n} a {r} centimes.`,
        fausses: [`${A.n} a {r} pièces.`, `Une pièce vaut {r} centimes.`],
        unite: 'centimes',
      }) },

    { id: 'marche-2-083', structure: 'GT', themes: ['fete'], niveaux: [3], max: 450,
      nombres: (niv, rnd, choix) => ({ a: rnd(2, 9), b: choix([20, 30, 40, 50]) }),
      texte: A => ({
        phrases: [`À la kermesse, un tour de pêche aux canards coûte {b|centimes}.`, `${A.n} joue {a|fois}.`],
        question: `Combien de centimes ${A.n} dépense-t-${A.il} ?`,
        labels: { total: 'dépense totale', nb: 'tours', taille: "prix d'un tour" },
        juste: `${A.n} dépense {r} centimes.`,
        fausses: [`Un tour coûte {r} centimes.`, `${A.n} joue {r} fois.`],
        unite: 'centimes',
      }) },
  ]);

  // Phrases pièges propres au marché (un nombre inutile, sans lien avec le calcul)
  Problemes.ajouterPieges('marche', [
    { f: () => `Il y a {d|stands} au marché ce matin.`, v: (niv, rnd) => rnd(6, 30) },
    { f: P => `${P.n} porte un sac à dos avec {d|poches}.`, v: (niv, rnd) => rnd(2, 6) },
    { f: () => `Le marché ouvre à {d} heures.`, v: (niv, rnd) => rnd(7, 9) },
  ]);
})();
