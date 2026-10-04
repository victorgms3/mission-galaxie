'use strict';
/* Paquets — banque 2 : jardin, rangement, sport, animaux (pattes, nids, roues…), espace.
 * Multiplication (GT), partage (GP), groupement (GG) et « fois plus » (FP).
 * Grades : 1 = tables de 2 à 5 ; 2 = tables jusqu'à 9 ; 3 = un nombre à deux chiffres × un chiffre
 * (parfois une simple table, pour réviser). Les partages tombent toujours juste. */
(() => {
  // ---------------------------------------------------------------------------
  // Tirage des nombres : n groupes de t objets (produit p = n × t)
  // ---------------------------------------------------------------------------
  // Plages par défaut des grades 1 et 2 ; celles du grade 3 sont données par chaque type de problème.
  // Chaque modèle peut remplacer une plage : { n1, t1, n2, t2, n3, t3 } = [min, max] ou une valeur fixe.
  const PLAGES = { n1: [2, 5], t1: [2, 5], n2: [2, 9], t2: [2, 9] };
  const tire = (x, rnd) => (Array.isArray(x) ? rnd(x[0], x[1]) : x);

  function produit(niv, rnd, o) {
    let g = niv <= 1 ? 1 : niv === 2 ? 2 : 3;
    // Au grade 3, une fois sur quatre : une simple table (révision), sauf si le contexte l'interdit.
    if (g === 3 && !o.sansTables && rnd(1, 4) === 1) g = 2;
    const n = tire(o['n' + g] != null ? o['n' + g] : PLAGES['n' + g], rnd);
    const t = tire(o['t' + g] != null ? o['t' + g] : PLAGES['t' + g], rnd);
    return { n, t, p: n * t };
  }

  // GT : a groupes de b → total. Au grade 3, la taille d'un groupe a deux chiffres (par défaut).
  const nGT = (o = {}) => (niv, rnd) => {
    const v = produit(niv, rnd, { n3: [2, 9], t3: [11, 40], ...o });
    return { a: v.n, b: v.t };
  };
  // GP : a objets partagés en b parts égales → une part. Au grade 3 : on divise par un seul chiffre.
  const nGP = (o = {}) => (niv, rnd) => {
    const v = produit(niv, rnd, { n3: [2, 9], t3: [11, 30], ...o });
    return { a: v.p, b: v.n };
  };
  // GG : a objets rangés par b → nombre de groupes. Au grade 3 : on divise par un seul chiffre.
  const nGG = (o = {}) => (niv, rnd) => {
    const v = produit(niv, rnd, { n3: [11, 30], t3: [3, 9], ...o });
    return { a: v.p, b: v.t };
  };
  // FP : a, puis « b fois plus » (b de 2 à 5) → a × b.
  const nFP = (o = {}) => (niv, rnd) => {
    const v = produit(niv, rnd, { n3: [2, 5], t3: [11, 40], sansTables: true, ...o });
    return { a: v.t, b: v.n };
  };

  Problemes.ajouter('paquets', [
    // =========================================================================
    // GT — des groupes égaux : on cherche le total (a × b)
    // =========================================================================
    {
      id: 'paquets-2-001', structure: 'GT', themes: ['jardin'],
      nombres: nGT({ t3: [12, 30] }),
      texte: A => ({
        phrases: [`${A.n} plante des salades dans le potager.`, `${A.Il} fait {a|rangées} de {b|salades}.`],
        question: `Combien de salades ${A.n} plante-t-${A.il} en tout ?`,
        labels: { total: 'toutes les salades', nb: 'rangées', taille: 'salades par rangée' },
        juste: `${A.n} plante {r} salades en tout.`,
        fausses: [`${A.n} fait {r} rangées.`, `Il y a {r} salades dans chaque rangée.`],
      }),
    },
    {
      id: 'paquets-2-002', structure: 'GT', themes: ['jardin'],
      nombres: nGT({ t2: [4, 9], t3: [12, 50] }),
      texte: A => ({
        phrases: [`Au jardin, ${A.n} ouvre {a|sachets} de graines de tournesol.`, `Chaque sachet contient {b|graines}.`],
        question: `Combien de graines de tournesol ${A.n} a-t-${A.il} en tout ?`,
        labels: { total: 'toutes les graines', nb: 'sachets', taille: 'graines par sachet' },
        juste: `${A.n} a {r} graines de tournesol en tout.`,
        fausses: [`${A.n} ouvre {r} sachets.`, `Chaque sachet contient {r} graines.`],
      }),
    },
    {
      id: 'paquets-2-003', structure: 'GT', themes: ['jardin'],
      nombres: nGT({ t3: [11, 40] }),
      texte: A => ({
        phrases: [`Dans le verger, il y a {a|pommiers}.`, `Sur chaque pommier, ${A.n} cueille {b|pommes}.`],
        question: `Combien de pommes ${A.n} cueille-t-${A.il} ?`,
        labels: { total: 'toutes les pommes', nb: 'pommiers', taille: 'pommes par arbre' },
        juste: `${A.n} cueille {r} pommes.`,
        fausses: [`Il y a {r} pommiers dans le verger.`, `${A.n} cueille {r} pommes sur chaque pommier.`],
      }),
    },
    {
      id: 'paquets-2-004', structure: 'GT', themes: ['jardin'],
      nombres: nGT({ t1: [3, 5], t2: [3, 9], t3: [11, 20] }),
      texte: A => ({
        phrases: [`${A.n} a cueilli des fleurs dans le jardin.`, `Avec toutes ces fleurs, ${A.il} a fait {a|bouquets} de {b|fleurs}.`],
        question: `Combien de fleurs ${A.n} a-t-${A.il} cueillies ?`,
        labels: { total: 'toutes les fleurs', nb: 'bouquets', taille: 'fleurs par bouquet' },
        juste: `${A.n} a cueilli {r} fleurs.`,
        fausses: [`${A.n} a fait {r} bouquets.`, `Chaque bouquet a {r} fleurs.`],
      }),
    },
    {
      id: 'paquets-2-005', structure: 'GT', themes: ['jardin'], niveaux: [1, 2],
      nombres: nGT({ n2: [3, 8], t2: [3, 8] }),
      texte: A => ({
        phrases: [`Sur le balcon, il y a {a|jardinières}.`, `Dans chaque jardinière, ${A.n} plante {b|fleurs}.`],
        question: `Combien de fleurs ${A.n} plante-t-${A.il} sur le balcon ?`,
        labels: { total: 'toutes les fleurs', nb: 'jardinières', taille: 'fleurs par jardinière' },
        juste: `${A.n} plante {r} fleurs sur le balcon.`,
        fausses: [`Il y a {r} jardinières sur le balcon.`, `${A.n} plante {r} fleurs dans chaque jardinière.`],
      }),
    },
    {
      id: 'paquets-2-006', structure: 'GT', themes: ['jardin'],
      nombres: nGT({ t2: [4, 9], t3: [12, 30] }),
      texte: A => ({
        phrases: [`${A.n} a ramassé des fraises au jardin.`, `${A.Il} a rempli {a|barquettes}.`, `Dans chaque barquette, il y a {b|fraises}.`],
        question: `Combien de fraises ${A.n} a-t-${A.il} ramassées ?`,
        labels: { total: 'toutes les fraises', nb: 'barquettes', taille: 'fraises par barquette' },
        juste: `${A.n} a ramassé {r} fraises.`,
        fausses: [`${A.n} a rempli {r} barquettes.`, `Il y a {r} fraises dans chaque barquette.`],
      }),
    },
    {
      id: 'paquets-2-007', structure: 'GT', themes: ['jardin'],
      nombres: nGT({ n3: [11, 25], t3: [5, 9] }),
      texte: A => ({
        phrases: [`Pour arroser le potager, ${A.n} utilise {a|arrosoirs} pleins.`, `Chaque arrosoir contient {b|litres} d'eau.`],
        question: `Combien de litres d'eau ${A.n} verse-t-${A.il} sur le potager ?`,
        labels: { total: "toute l'eau", nb: 'arrosoirs', taille: 'un arrosoir' },
        juste: `${A.n} verse {r} litres d'eau sur le potager.`,
        fausses: [`${A.n} utilise {r} arrosoirs pleins.`, `Chaque arrosoir contient {r} litres d'eau.`],
        unite: 'litres',
      }),
    },
    {
      id: 'paquets-2-008', structure: 'GT', themes: ['rangement'],
      nombres: nGT({ t3: [11, 25] }),
      texte: A => ({
        phrases: [`${A.n} range ses petites voitures dans {a|boîtes}.`, `${A.Il} met {b|voitures} dans chaque boîte.`],
        question: `Combien de petites voitures ${A.n} range-t-${A.il} ?`,
        labels: { total: 'toutes les voitures', nb: 'boîtes', taille: 'voitures par boîte' },
        juste: `${A.n} range {r} petites voitures.`,
        fausses: [`${A.n} utilise {r} boîtes.`, `${A.n} met {r} voitures dans chaque boîte.`],
      }),
    },
    {
      id: 'paquets-2-009', structure: 'GT', themes: ['rangement', 'ecole'], niveaux: [2, 3],
      nombres: nGT({ n2: [3, 9], t2: [6, 9], t3: [15, 45] }),
      texte: () => ({
        phrases: [`La bibliothèque de l'école a {a|étagères}.`, `Sur chaque étagère, il y a {b|livres}.`],
        question: `Combien de livres y a-t-il dans la bibliothèque ?`,
        labels: { total: 'tous les livres', nb: 'étagères', taille: 'livres par étagère' },
        juste: `Il y a {r} livres dans la bibliothèque.`,
        fausses: [`La bibliothèque de l'école a {r} étagères.`, `Il y a {r} livres sur chaque étagère.`],
      }),
    },
    {
      id: 'paquets-2-010', structure: 'GT', themes: ['rangement'],
      nombres: nGT({ n1: [3, 5], n2: [3, 9], n3: [11, 40], t3: [4, 9] }),
      texte: A => ({
        phrases: [`${A.n} range ses cartes dans un classeur de {a|pages}.`, `Sur chaque page, il y a {b|cartes}.`],
        question: `Combien de cartes y a-t-il dans le classeur ?`,
        labels: { total: 'toutes les cartes', nb: 'pages', taille: 'cartes par page' },
        juste: `Il y a {r} cartes dans le classeur.`,
        fausses: [`Le classeur a {r} pages.`, `Il y a {r} cartes sur chaque page.`],
      }),
    },
    {
      id: 'paquets-2-011', structure: 'GT', themes: ['rangement', 'ecole'],
      nombres: nGT({ t1: [3, 5], t2: [4, 9], t3: [11, 30] }),
      texte: () => ({
        phrases: [`Dans le placard de la classe, il y a {a|piles} de cahiers.`, `Chaque pile a {b|cahiers}.`],
        question: `Combien de cahiers y a-t-il dans le placard ?`,
        labels: { total: 'tous les cahiers', nb: 'piles', taille: 'cahiers par pile' },
        juste: `Il y a {r} cahiers dans le placard.`,
        fausses: [`Il y a {r} piles de cahiers.`, `Chaque pile a {r} cahiers.`],
      }),
    },
    {
      id: 'paquets-2-012', structure: 'GT', themes: ['rangement'], niveaux: [1, 2],
      nombres: nGT({}),
      texte: A => ({
        phrases: [`Au grenier, ${A.n} trouve {a|cartons}.`, `Dans chaque carton, il y a {b|peluches}.`],
        question: `Combien de peluches ${A.n} trouve-t-${A.il} ?`,
        labels: { total: 'toutes les peluches', nb: 'cartons', taille: 'peluches par carton' },
        juste: `${A.n} trouve {r} peluches.`,
        fausses: [`${A.n} trouve {r} cartons.`, `Il y a {r} peluches dans chaque carton.`],
      }),
    },
    {
      id: 'paquets-2-013', structure: 'GT', themes: ['rangement'],
      nombres: nGT({ t1: [3, 5], t2: [3, 9], t3: [11, 25] }),
      texte: () => ({
        phrases: [`Dans l'atelier de peinture, chaque pot contient {b|pinceaux}.`, `Sur l'étagère, il y a {a|pots}.`],
        question: `Combien de pinceaux y a-t-il sur l'étagère ?`,
        labels: { total: 'tous les pinceaux', nb: 'pots', taille: 'pinceaux par pot' },
        juste: `Il y a {r} pinceaux sur l'étagère.`,
        fausses: [`Il y a {r} pots sur l'étagère.`, `Chaque pot contient {r} pinceaux.`],
      }),
    },
    {
      id: 'paquets-2-014', structure: 'GT', themes: ['sport'],
      nombres: nGT({ t1: [3, 5], t2: [4, 9], n3: [11, 32], t3: [5, 9] }),
      texte: () => ({
        phrases: [`Pour le tournoi de football, il y a {a|équipes}.`, `Chaque équipe a {b|joueurs}.`],
        question: `Combien de joueurs y a-t-il au tournoi ?`,
        labels: { total: 'tous les joueurs', nb: 'équipes', taille: 'joueurs par équipe' },
        juste: `Il y a {r} joueurs au tournoi.`,
        fausses: [`Il y a {r} équipes au tournoi.`, `Chaque équipe a {r} joueurs.`],
      }),
    },
    {
      id: 'paquets-2-015', structure: 'GT', themes: ['sport', 'ecole'], niveaux: [3],
      nombres: nGT({ n3: [3, 9], t3: [21, 95], sansTables: true }),
      texte: A => ({
        phrases: [`Le tour de la cour de l'école mesure {b|mètres}.`, `Pendant la séance de sport, ${A.n} fait {a|tours} en courant.`],
        question: `Combien de mètres ${A.n} court-${A.il} ?`,
        labels: { total: 'toute la course', nb: 'tours', taille: 'un tour' },
        juste: `${A.n} court {r} mètres.`,
        fausses: [`${A.n} fait {r} tours de la cour.`, `Un tour de la cour mesure {r} mètres.`],
        unite: 'mètres',
      }),
    },
    {
      id: 'paquets-2-016', structure: 'GT', themes: ['sport'],
      nombres: nGT({ t1: [3, 4], n2: [5, 9], t2: [3, 4], n3: [11, 40], t3: [3, 4] }),
      texte: () => ({
        phrases: [`Le club de tennis achète {a|tubes} de balles.`, `Dans un tube, il y a {b|balles}.`],
        question: `Combien de balles le club achète-t-il ?`,
        labels: { total: 'toutes les balles', nb: 'tubes', taille: 'balles par tube' },
        juste: `Le club achète {r} balles.`,
        fausses: [`Le club achète {r} tubes.`, `Il y a {r} balles dans un tube.`],
      }),
    },
    {
      id: 'paquets-2-017', structure: 'GT', themes: ['sport'],
      nombres: nGT({ t1: [2, 3], n2: [4, 9], t2: [2, 3], n3: [11, 25], t3: [2, 3] }),
      texte: A => ({
        phrases: [`Pendant le match, l'équipe ${A.de} marque {a|paniers} à {b|points}.`],
        question: `Combien de points l'équipe marque-t-elle avec ces paniers ?`,
        labels: { total: 'tous les points', nb: 'paniers', taille: 'points par panier' },
        juste: `L'équipe marque {r} points avec ces paniers.`,
        fausses: [`L'équipe marque {r} paniers.`, `Un panier rapporte {r} points.`],
      }),
    },
    {
      id: 'paquets-2-018', structure: 'GT', themes: ['sport'], niveaux: [3],
      nombres: (niv, rnd, choix) => ({ a: rnd(3, 9), b: choix([15, 20, 25, 50]) }),
      texte: A => ({
        phrases: [`À la piscine, le bassin mesure {b|mètres} de long.`, `${A.n} nage {a|longueurs} de bassin.`],
        question: `Combien de mètres ${A.n} nage-t-${A.il} ?`,
        labels: { total: 'toute la distance', nb: 'longueurs', taille: 'une longueur' },
        juste: `${A.n} nage {r} mètres.`,
        fausses: [`${A.n} nage {r} longueurs.`, `Le bassin mesure {r} mètres de long.`],
        unite: 'mètres',
      }),
    },
    {
      id: 'paquets-2-019', structure: 'GT', themes: ['sport'],
      nombres: nGT({ n3: [11, 30], t3: [5, 9] }),
      texte: () => ({
        phrases: [`Dans les gradins du gymnase, il y a {a|bancs}.`, `Sur chaque banc, {b|spectateurs} sont assis.`],
        question: `Combien de spectateurs sont assis sur les bancs ?`,
        labels: { total: 'tous les spectateurs', nb: 'bancs', taille: 'spectateurs par banc' },
        juste: `Il y a {r} spectateurs assis sur les bancs.`,
        fausses: [`Il y a {r} bancs dans les gradins.`, `Il y a {r} spectateurs sur chaque banc.`],
      }),
    },
    {
      // Piège : « distribue » fait penser à un partage, mais on cherche le total.
      id: 'paquets-2-020', structure: 'GT', themes: ['sport'], niveaux: [2, 3],
      nombres: nGT({ n3: [3, 9], t3: [11, 24] }),
      texte: A => ({
        phrases: [`Au tournoi, ${A.n} distribue {b|bouteilles} d'eau à chacune des {a|équipes}.`],
        question: `Combien de bouteilles d'eau ${A.n} distribue-t-${A.il} en tout ?`,
        labels: { total: 'toutes les bouteilles', nb: 'équipes', taille: 'pour une équipe' },
        juste: `${A.n} distribue {r} bouteilles d'eau en tout.`,
        fausses: [`Il y a {r} équipes au tournoi.`, `Chaque équipe reçoit {r} bouteilles d'eau.`],
      }),
    },
    {
      id: 'paquets-2-021', structure: 'GT', themes: ['animaux'], niveaux: [2, 3],
      nombres: nGT({ t2: 6, n3: [11, 40], t3: 6 }),
      texte: () => ({
        phrases: [`Une file de {a|fourmis} traverse le chemin.`, `Une fourmi a {b|pattes}.`],
        question: `Combien de pattes avancent sur le chemin ?`,
        labels: { total: 'toutes les pattes', nb: 'fourmis', taille: 'pattes par fourmi' },
        juste: `Sur le chemin, {r} pattes avancent.`,
        fausses: [`Il y a {r} fourmis sur le chemin.`, `Une fourmi a {r} pattes.`],
      }),
    },
    {
      id: 'paquets-2-022', structure: 'GT', themes: ['animaux'], niveaux: [1, 2],
      nombres: nGT({ t1: 4, n2: [5, 9], t2: 4 }),
      texte: A => ({
        phrases: [`${A.n} dessine {a|chats} qui ressemblent à Alvin.`, `Un chat a {b|pattes}.`],
        question: `Combien de pattes ${A.n} doit-${A.il} dessiner ?`,
        labels: { total: 'toutes les pattes', nb: 'chats', taille: 'pattes par chat' },
        juste: `${A.n} doit dessiner {r} pattes.`,
        fausses: [`${A.n} dessine {r} chats.`, `Un chat a {r} pattes.`],
      }),
    },
    {
      id: 'paquets-2-023', structure: 'GT', themes: ['animaux'],
      nombres: nGT({ t2: [2, 6], n3: [11, 30], t3: [3, 6] }),
      texte: () => ({
        phrases: [`Sous le toit de la ferme, il y a {a|nids} d'hirondelles.`, `Dans chaque nid, il y a {b|œufs}.`],
        question: `Combien d'œufs y a-t-il dans tous les nids ?`,
        labels: { total: 'tous les œufs', nb: 'nids', taille: 'œufs par nid' },
        juste: `Il y a {r} œufs dans tous les nids.`,
        fausses: [`Il y a {r} nids sous le toit.`, `Il y a {r} œufs dans chaque nid.`],
      }),
    },
    {
      id: 'paquets-2-024', structure: 'GT', themes: ['animaux'],
      nombres: nGT({ t1: [3, 5], t2: [4, 7], n3: [11, 40], t3: [4, 7] }),
      texte: () => ({
        phrases: [`À la ferme, chaque poule pond {b|œufs} par semaine.`, `Il y a {a|poules}.`],
        question: `Combien d'œufs les poules pondent-elles en une semaine ?`,
        labels: { total: 'tous les œufs', nb: 'poules', taille: 'œufs par poule' },
        juste: `Les poules pondent {r} œufs en une semaine.`,
        fausses: [`Il y a {r} poules à la ferme.`, `Une poule pond {r} œufs par semaine.`],
      }),
    },
    {
      id: 'paquets-2-025', structure: 'GT', themes: ['animaux', 'jardin'],
      nombres: nGT({ t2: [2, 7], n3: [11, 30], t3: [2, 7] }),
      texte: A => ({
        phrases: [`Sur le rosier, ${A.n} compte {a|coccinelles}.`, `Chaque coccinelle a {b|points} noirs sur le dos.`],
        question: `Combien de points noirs y a-t-il sur toutes ces coccinelles ?`,
        labels: { total: 'tous les points', nb: 'coccinelles', taille: 'points par coccinelle' },
        juste: `Il y a {r} points noirs sur toutes ces coccinelles.`,
        fausses: [`${A.n} compte {r} coccinelles.`, `Chaque coccinelle a {r} points noirs.`],
      }),
    },
    {
      id: 'paquets-2-026', structure: 'GT', themes: ['animaux'],
      nombres: nGT({ t3: [11, 30] }),
      texte: () => ({
        phrases: [`Le magasin d'animaux a {a|aquariums}.`, `Dans chaque aquarium nagent {b|poissons}.`],
        question: `Combien de poissons y a-t-il dans le magasin ?`,
        labels: { total: 'tous les poissons', nb: 'aquariums', taille: 'poissons par aquarium' },
        juste: `Il y a {r} poissons dans le magasin.`,
        fausses: [`Le magasin a {r} aquariums.`, `Il y a {r} poissons dans chaque aquarium.`],
      }),
    },
    {
      id: 'paquets-2-027', structure: 'GT', themes: ['animaux'], niveaux: [1, 2],
      nombres: nGT({ n2: [3, 9], t2: [2, 5] }),
      texte: A => ({
        phrases: [`${A.n} garde le lapin de sa voisine pendant {a|jours}.`, `Chaque jour, le lapin mange {b|carottes}.`],
        question: `Combien de carottes ${A.n} doit-${A.il} prévoir ?`,
        labels: { total: 'toutes les carottes', nb: 'jours', taille: 'carottes par jour' },
        juste: `${A.n} doit prévoir {r} carottes.`,
        fausses: [`${A.n} garde le lapin {r} jours.`, `Le lapin mange {r} carottes par jour.`],
      }),
    },
    {
      id: 'paquets-2-028', structure: 'GT', themes: ['espace'],
      nombres: nGT({ t3: [11, 33] }),
      texte: () => ({
        phrases: [`Sur la base spatiale, il y a {a|fusées}.`, `Chaque fusée a {b|moteurs}.`],
        question: `Combien de moteurs y a-t-il sur la base ?`,
        labels: { total: 'tous les moteurs', nb: 'fusées', taille: 'moteurs par fusée' },
        juste: `Il y a {r} moteurs sur la base.`,
        fausses: [`Il y a {r} fusées sur la base.`, `Chaque fusée a {r} moteurs.`],
      }),
    },
    {
      id: 'paquets-2-029', structure: 'GT', themes: ['espace'],
      nombres: nGT({ t3: [12, 40] }),
      texte: () => ({
        phrases: [`La navette emmène {a|astronautes}.`, `Chaque astronaute emporte {b|sachets} de nourriture.`],
        question: `Combien de sachets de nourriture y a-t-il dans la navette ?`,
        labels: { total: 'tous les sachets', nb: 'astronautes', taille: 'sachets par astronaute' },
        juste: `Il y a {r} sachets de nourriture dans la navette.`,
        fausses: [`La navette emmène {r} astronautes.`, `Chaque astronaute emporte {r} sachets.`],
      }),
    },
    {
      id: 'paquets-2-030', structure: 'GT', themes: ['espace'],
      nombres: nGT({ t3: [11, 30] }),
      texte: () => ({
        phrases: [`Autour d'une étoile tournent {a|planètes}.`, `Chaque planète a {b|lunes}.`],
        question: `Combien de lunes y a-t-il autour de ces planètes ?`,
        labels: { total: 'toutes les lunes', nb: 'planètes', taille: 'lunes par planète' },
        juste: `Il y a {r} lunes autour de ces planètes.`,
        fausses: [`Il y a {r} planètes autour de l'étoile.`, `Chaque planète a {r} lunes.`],
      }),
    },
    {
      id: 'paquets-2-031', structure: 'GT', themes: ['espace'],
      nombres: nGT({ t2: [4, 9], t3: [12, 50] }),
      texte: A => ({
        phrases: [`${A.n} explore une grotte de la planète.`, `${A.Il} remplit {a|sacs} de cristaux.`, `Chaque sac contient {b|cristaux}.`],
        question: `Combien de cristaux ${A.n} rapporte-t-${A.il} ?`,
        labels: { total: 'tous les cristaux', nb: 'sacs', taille: 'cristaux par sac' },
        juste: `${A.n} rapporte {r} cristaux.`,
        fausses: [`${A.n} remplit {r} sacs.`, `Chaque sac contient {r} cristaux.`],
      }),
    },
    {
      id: 'paquets-2-032', structure: 'GT', themes: ['espace', 'rangement'],
      nombres: nGT({ t1: [3, 5], t2: [3, 9], t3: [11, 20] }),
      texte: A => ({
        phrases: [`Au plafond de sa chambre, ${A.n} colle {a|constellations}.`, `Chaque constellation a {b|étoiles}.`],
        question: `Combien d'étoiles ${A.n} colle-t-${A.il} au plafond ?`,
        labels: { total: 'toutes les étoiles', nb: 'constellations', taille: 'étoiles par constellation' },
        juste: `${A.n} colle {r} étoiles au plafond.`,
        fausses: [`${A.n} colle {r} constellations.`, `Chaque constellation a {r} étoiles.`],
      }),
    },
    {
      id: 'paquets-2-033', structure: 'GT', themes: ['espace'], niveaux: [2, 3],
      nombres: nGT({ t2: 6, n3: [11, 30], t3: 6 }),
      texte: () => ({
        phrases: [`Sur la planète rouge, {a|robots} explorent le sol.`, `Chaque robot roule sur {b|roues}.`],
        question: `Combien de roues ont tous ces robots ?`,
        labels: { total: 'toutes les roues', nb: 'robots', taille: 'roues par robot' },
        juste: `Les robots ont {r} roues en tout.`,
        fausses: [`Il y a {r} robots sur la planète rouge.`, `Chaque robot a {r} roues.`],
      }),
    },
    {
      // Piège : « se partagent » fait penser à une division, mais on cherche le trésor entier.
      id: 'paquets-2-034', structure: 'GT', themes: ['espace'], niveaux: [2, 3],
      nombres: nGT({ n3: [3, 9], t3: [12, 50] }),
      texte: () => ({
        phrases: [`Des pirates de l'espace se partagent un trésor.`, `Il y a {a|pirates}.`, `Chaque pirate reçoit {b|pièces} d'or.`],
        question: `Combien de pièces d'or y avait-il dans le trésor ?`,
        labels: { total: 'le trésor', nb: 'pirates', taille: 'pour un pirate' },
        juste: `Il y avait {r} pièces d'or dans le trésor.`,
        fausses: [`Il y a {r} pirates.`, `Chaque pirate reçoit {r} pièces d'or.`],
      }),
    },
    {
      id: 'paquets-2-091', structure: 'GT', themes: ['animaux'], niveaux: [2, 3],
      nombres: nGT({ t2: 8, n3: [11, 15], t3: 8 }),
      texte: () => ({
        phrases: [`Dans le grand aquarium, il y a {a|pieuvres}.`, `Une pieuvre a {b|bras}.`],
        question: `Combien de bras y a-t-il dans le grand aquarium ?`,
        labels: { total: 'tous les bras', nb: 'pieuvres', taille: 'bras par pieuvre' },
        juste: `Il y a {r} bras dans le grand aquarium.`,
        fausses: [`Il y a {r} pieuvres dans le grand aquarium.`, `Une pieuvre a {r} bras.`],
      }),
    },
    {
      id: 'paquets-2-092', structure: 'GT', themes: ['sport'], niveaux: [1, 2],
      nombres: nGT({ t1: 3, t2: 3, n2: [4, 9] }),
      texte: () => ({
        phrases: [`Dans la cour de l'école maternelle, les petits font du tricycle.`, `Il y a {a|tricycles}.`, `Un tricycle a {b|roues}.`],
        question: `Combien de roues y a-t-il dans la cour ?`,
        labels: { total: 'toutes les roues', nb: 'tricycles', taille: 'roues par tricycle' },
        juste: `Il y a {r} roues dans la cour.`,
        fausses: [`Il y a {r} tricycles dans la cour.`, `Un tricycle a {r} roues.`],
      }),
    },

    // =========================================================================
    // GP — un partage en parts égales : on cherche une part (a ÷ b)
    // =========================================================================
    {
      id: 'paquets-2-035', structure: 'GP', themes: ['jardin'],
      nombres: nGP({ t3: [11, 40] }),
      texte: A => ({
        phrases: [`${A.n} sème {a|graines} de radis.`, `${A.Il} fait {b|rangées}, avec le même nombre de graines dans chaque rangée.`],
        question: `Combien de graines ${A.n} sème-t-${A.il} dans chaque rangée ?`,
        labels: { total: 'toutes les graines', nb: 'rangées', taille: 'graines par rangée' },
        juste: `${A.n} sème {r} graines dans chaque rangée.`,
        fausses: [`${A.n} sème {r} graines en tout.`, `${A.n} fait {r} rangées.`],
      }),
    },
    {
      id: 'paquets-2-036', structure: 'GP', themes: ['jardin'],
      nombres: nGP({ t3: [11, 25] }),
      texte: A => ({
        phrases: [`${A.n} a cueilli {a|tomates}.`, `${A.Il} les range dans {b|paniers}, avec autant de tomates dans chaque panier.`],
        question: `Combien de tomates y a-t-il dans chaque panier ?`,
        labels: { total: 'toutes les tomates', nb: 'paniers', taille: 'tomates par panier' },
        juste: `Il y a {r} tomates dans chaque panier.`,
        fausses: [`${A.n} a cueilli {r} tomates.`, `${A.n} utilise {r} paniers.`],
      }),
    },
    {
      id: 'paquets-2-037', structure: 'GP', themes: ['jardin'], niveaux: [1, 2],
      nombres: nGP({ t2: [3, 9] }),
      texte: (A, B, AB) => ({
        phrases: [`${A.n} et ${B.n} ont cueilli {a|tulipes}.`, `${AB.Ils} les mettent dans {b|vases}, autant dans chaque vase.`],
        question: `Combien de tulipes ${A.n} et ${B.n} mettent-${AB.ils} dans chaque vase ?`,
        labels: { total: 'toutes les tulipes', nb: 'vases', taille: 'tulipes par vase' },
        juste: `${AB.Ils} mettent {r} tulipes dans chaque vase.`,
        fausses: [`${AB.Ils} ont cueilli {r} tulipes.`, `${AB.Ils} utilisent {r} vases.`],
      }),
    },
    {
      id: 'paquets-2-038', structure: 'GP', themes: ['jardin'],
      nombres: nGP({ t3: [11, 40] }),
      texte: () => ({
        phrases: [`Le jardinier a {a|litres} d'eau dans sa réserve.`, `Il utilise toute cette eau pour arroser {b|arbres}.`, `Chaque arbre reçoit la même quantité d'eau.`],
        question: `Combien de litres d'eau chaque arbre reçoit-il ?`,
        labels: { total: "toute l'eau", nb: 'arbres', taille: 'pour un arbre' },
        juste: `Chaque arbre reçoit {r} litres d'eau.`,
        fausses: [`Le jardinier a {r} litres d'eau.`, `Le jardinier arrose {r} arbres.`],
        unite: 'litres',
      }),
    },
    {
      id: 'paquets-2-039', structure: 'GP', themes: ['rangement'],
      nombres: nGP({ t2: [3, 9], t3: [11, 40] }),
      texte: A => ({
        phrases: [`${A.n} range {a|livres} sur {b|étagères}.`, `${A.Il} met le même nombre de livres sur chaque étagère.`],
        question: `Combien de livres ${A.n} met-${A.il} sur chaque étagère ?`,
        labels: { total: 'tous les livres', nb: 'étagères', taille: 'livres par étagère' },
        juste: `${A.n} met {r} livres sur chaque étagère.`,
        fausses: [`${A.n} range {r} livres.`, `${A.n} utilise {r} étagères.`],
      }),
    },
    {
      id: 'paquets-2-040', structure: 'GP', themes: ['rangement', 'ecole'],
      nombres: nGP({ t2: [3, 9], t3: [11, 30] }),
      texte: () => ({
        phrases: [`La maîtresse a {a|crayons} de couleur.`, `Elle les répartit dans {b|pots}, avec autant de crayons dans chaque pot.`],
        question: `Combien de crayons la maîtresse met-elle dans chaque pot ?`,
        labels: { total: 'tous les crayons', nb: 'pots', taille: 'crayons par pot' },
        juste: `La maîtresse met {r} crayons dans chaque pot.`,
        fausses: [`La maîtresse a {r} crayons de couleur.`, `La maîtresse remplit {r} pots.`],
      }),
    },
    {
      id: 'paquets-2-041', structure: 'GP', themes: ['rangement'],
      nombres: nGP({ t3: [11, 40] }),
      texte: (A, B, AB) => ({
        phrases: [`${A.n} et ${B.n} rangent {a|cubes} dans {b|bacs}.`, `${AB.Ils} mettent le même nombre de cubes dans chaque bac.`],
        question: `Combien de cubes y a-t-il dans chaque bac ?`,
        labels: { total: 'tous les cubes', nb: 'bacs', taille: 'cubes par bac' },
        juste: `Il y a {r} cubes dans chaque bac.`,
        fausses: [`${A.n} et ${B.n} rangent {r} cubes.`, `${A.n} et ${B.n} remplissent {r} bacs.`],
      }),
    },
    {
      id: 'paquets-2-042', structure: 'GP', themes: ['rangement'], niveaux: [1, 2],
      nombres: nGP({ n1: [3, 5], n2: [3, 9], t2: [2, 6] }),
      texte: A => ({
        phrases: [`${A.n} colle {a|autocollants} dans un carnet de {b|pages}.`, `${A.Il} met le même nombre d'autocollants sur chaque page.`],
        question: `Combien d'autocollants ${A.n} colle-t-${A.il} sur chaque page ?`,
        labels: { total: 'tous les autocollants', nb: 'pages', taille: 'autocollants par page' },
        juste: `${A.n} colle {r} autocollants sur chaque page.`,
        fausses: [`Le carnet a {r} pages.`, `${A.n} colle {r} autocollants en tout.`],
      }),
    },
    {
      id: 'paquets-2-043', structure: 'GP', themes: ['sport', 'ecole'],
      nombres: nGP({ t1: [3, 5], t2: [3, 9], t3: [11, 30] }),
      texte: () => ({
        phrases: [`Pour la journée du sport, {a|élèves} viennent au stade.`, `On forme {b|groupes} avec le même nombre d'élèves dans chaque groupe.`],
        question: `Combien d'élèves y a-t-il dans chaque groupe ?`,
        labels: { total: 'tous les élèves', nb: 'groupes', taille: 'élèves par groupe' },
        juste: `Il y a {r} élèves dans chaque groupe.`,
        fausses: [`Il y a {r} élèves au stade.`, `On forme {r} groupes.`],
      }),
    },
    {
      id: 'paquets-2-044', structure: 'GP', themes: ['sport'],
      nombres: nGP({ t3: [11, 30] }),
      texte: () => ({
        phrases: [`Le professeur de sport a {a|balles}.`, `Il les répartit dans {b|seaux}, autant dans chaque seau.`],
        question: `Combien de balles y a-t-il dans chaque seau ?`,
        labels: { total: 'toutes les balles', nb: 'seaux', taille: 'balles par seau' },
        juste: `Il y a {r} balles dans chaque seau.`,
        fausses: [`Le professeur a {r} balles.`, `Le professeur remplit {r} seaux.`],
      }),
    },
    {
      id: 'paquets-2-045', structure: 'GP', themes: ['sport'], niveaux: [3],
      nombres: (niv, rnd) => { const n = rnd(3, 6), t = 5 * rnd(4, 19); return { a: n * t, b: n }; },
      texte: A => ({
        phrases: [`Pour la course de relais, l'équipe ${A.de} doit courir {a|mètres}.`, `Les {b|coureurs} de l'équipe courent tous la même distance.`],
        question: `Combien de mètres chaque coureur doit-il courir ?`,
        labels: { total: 'toute la course', nb: 'coureurs', taille: 'pour un coureur' },
        juste: `Chaque coureur doit courir {r} mètres.`,
        fausses: [`L'équipe doit courir {r} mètres en tout.`, `Il y a {r} coureurs dans l'équipe.`],
        unite: 'mètres',
      }),
    },
    {
      id: 'paquets-2-046', structure: 'GP', themes: ['sport'],
      nombres: nGP({ t3: [11, 25] }),
      texte: () => ({
        phrases: [`Le club de football offre {a|gourdes} à ses {b|équipes}.`, `Chaque équipe reçoit le même nombre de gourdes.`],
        question: `Combien de gourdes chaque équipe reçoit-elle ?`,
        labels: { total: 'toutes les gourdes', nb: 'équipes', taille: 'pour une équipe' },
        juste: `Chaque équipe reçoit {r} gourdes.`,
        fausses: [`Le club offre {r} gourdes.`, `Le club a {r} équipes.`],
      }),
    },
    {
      // Piège : « en tout » fait penser à une addition, mais il faut partager.
      id: 'paquets-2-047', structure: 'GP', themes: ['sport'], niveaux: [2, 3],
      nombres: nGP({ t2: [4, 9], t3: [11, 40] }),
      texte: A => ({
        phrases: [`L'équipe de basket ${A.de} a joué {b|matchs}.`, `En tout, l'équipe a marqué {a|points}.`, `À chaque match, l'équipe a marqué le même nombre de points.`],
        question: `Combien de points l'équipe a-t-elle marqués à chaque match ?`,
        labels: { total: 'tous les points', nb: 'matchs', taille: 'points par match' },
        juste: `L'équipe a marqué {r} points à chaque match.`,
        fausses: [`L'équipe a marqué {r} points en tout.`, `L'équipe a joué {r} matchs.`],
      }),
    },
    {
      id: 'paquets-2-048', structure: 'GP', themes: ['animaux', 'jardin'],
      nombres: nGP({ t2: [3, 9], t3: [11, 50] }),
      texte: A => ({
        phrases: [`${A.n} a {a|graines} pour les oiseaux.`, `${A.Il} les verse dans {b|mangeoires}, autant dans chaque mangeoire.`],
        question: `Combien de graines y a-t-il dans chaque mangeoire ?`,
        labels: { total: 'toutes les graines', nb: 'mangeoires', taille: 'graines par mangeoire' },
        juste: `Il y a {r} graines dans chaque mangeoire.`,
        fausses: [`${A.n} a {r} graines pour les oiseaux.`, `${A.n} remplit {r} mangeoires.`],
      }),
    },
    {
      id: 'paquets-2-049', structure: 'GP', themes: ['animaux'],
      nombres: nGP({ t3: [11, 30] }),
      texte: () => ({
        phrases: [`Alvin a {a|croquettes}.`, `Il les partage équitablement entre {b|chatons}.`],
        question: `Combien de croquettes chaque chaton reçoit-il ?`,
        labels: { total: 'toutes les croquettes', nb: 'chatons', taille: 'pour un chaton' },
        juste: `Chaque chaton reçoit {r} croquettes.`,
        fausses: [`Alvin a {r} croquettes.`, `Il y a {r} chatons.`],
      }),
    },
    {
      id: 'paquets-2-050', structure: 'GP', themes: ['animaux'],
      nombres: nGP({ t3: [11, 40] }),
      texte: () => ({
        phrases: [`Le berger a {a|moutons}.`, `Il met le même nombre de moutons dans chacun de ses {b|enclos}.`],
        question: `Combien de moutons y a-t-il dans chaque enclos ?`,
        labels: { total: 'tous les moutons', nb: 'enclos', taille: 'moutons par enclos' },
        juste: `Il y a {r} moutons dans chaque enclos.`,
        fausses: [`Le berger a {r} moutons.`, `Le berger a {r} enclos.`],
      }),
    },
    {
      id: 'paquets-2-051', structure: 'GP', themes: ['animaux'], niveaux: [1, 2],
      nombres: nGP({ n2: [2, 6], t2: [3, 9] }),
      texte: () => ({
        phrases: [`Au zoo, la soigneuse a {a|kilos} de poisson.`, `Elle partage ce poisson entre {b|phoques}, la même quantité pour chacun.`],
        question: `Combien de kilos de poisson chaque phoque reçoit-il ?`,
        labels: { total: 'tout le poisson', nb: 'phoques', taille: 'pour un phoque' },
        juste: `Chaque phoque reçoit {r} kilos de poisson.`,
        fausses: [`La soigneuse a {r} kilos de poisson.`, `Il y a {r} phoques au zoo.`],
        unite: 'kilos',
      }),
    },
    {
      id: 'paquets-2-052', structure: 'GP', themes: ['animaux'],
      nombres: nGP({ t3: [11, 40] }),
      texte: () => ({
        phrases: [`Les {b|écureuils} du parc ont trouvé {a|noisettes}.`, `Ils se les partagent équitablement.`],
        question: `Combien de noisettes chaque écureuil reçoit-il ?`,
        labels: { total: 'toutes les noisettes', nb: 'écureuils', taille: 'pour un écureuil' },
        juste: `Chaque écureuil reçoit {r} noisettes.`,
        fausses: [`Les écureuils ont trouvé {r} noisettes.`, `Il y a {r} écureuils dans le parc.`],
      }),
    },
    {
      id: 'paquets-2-053', structure: 'GP', themes: ['espace'],
      nombres: nGP({ n1: [3, 5], n2: [3, 9], n3: [3, 9], t3: [11, 40] }),
      texte: A => ({
        phrases: [`${A.n} part en expédition avec des amis.`, `Les {b|explorateurs} rapportent {a|cristaux} et se les partagent équitablement.`],
        question: `Combien de cristaux chaque explorateur reçoit-il ?`,
        labels: { total: 'tous les cristaux', nb: 'explorateurs', taille: 'pour un explorateur' },
        juste: `Chaque explorateur reçoit {r} cristaux.`,
        fausses: [`Les explorateurs rapportent {r} cristaux.`, `L'expédition compte {r} explorateurs.`],
      }),
    },
    {
      id: 'paquets-2-054', structure: 'GP', themes: ['espace'],
      nombres: nGP({ t3: [11, 30] }),
      texte: () => ({
        phrases: [`Le petit train de la base lunaire transporte {a|caisses}.`, `Il a {b|wagons}, avec le même nombre de caisses dans chaque wagon.`],
        question: `Combien de caisses y a-t-il dans chaque wagon ?`,
        labels: { total: 'toutes les caisses', nb: 'wagons', taille: 'caisses par wagon' },
        juste: `Il y a {r} caisses dans chaque wagon.`,
        fausses: [`Le train transporte {r} caisses.`, `Le train a {r} wagons.`],
      }),
    },
    {
      id: 'paquets-2-055', structure: 'GP', themes: ['espace'],
      nombres: nGP({ n2: [2, 7], n3: [2, 7], t3: [11, 40] }),
      texte: () => ({
        phrases: [`La station spatiale reçoit {a|repas}.`, `Il y a {b|astronautes} dans la station.`, `Chaque astronaute reçoit le même nombre de repas.`],
        question: `Combien de repas chaque astronaute reçoit-il ?`,
        labels: { total: 'tous les repas', nb: 'astronautes', taille: 'pour un astronaute' },
        juste: `Chaque astronaute reçoit {r} repas.`,
        fausses: [`La station reçoit {r} repas.`, `Il y a {r} astronautes dans la station.`],
      }),
    },
    {
      id: 'paquets-2-056', structure: 'GP', themes: ['espace'], niveaux: [1, 2],
      nombres: nGP({ t1: [3, 5], t2: [3, 8] }),
      texte: A => ({
        phrases: [`${A.n} construit {b|robots} avec {a|roues}.`, `Tous les robots ont le même nombre de roues.`],
        question: `Combien de roues chaque robot a-t-il ?`,
        labels: { total: 'toutes les roues', nb: 'robots', taille: 'roues par robot' },
        juste: `Chaque robot a {r} roues.`,
        fausses: [`${A.n} construit {r} robots.`, `${A.n} utilise {r} roues en tout.`],
      }),
    },
    {
      id: 'paquets-2-057', structure: 'GP', themes: ['jardin'], niveaux: [3],
      nombres: nGP({ t3: [11, 50], sansTables: true }),
      texte: A => ({
        phrases: [`Pour attacher ses tomates, ${A.n} coupe une ficelle de {a|cm}.`, `${A.Il} fait {b|morceaux} de la même longueur.`],
        question: `Combien mesure chaque morceau de ficelle ?`,
        labels: { total: 'la ficelle', nb: 'morceaux', taille: 'un morceau' },
        juste: `Chaque morceau de ficelle mesure {r} cm.`,
        fausses: [`La ficelle mesure {r} cm.`, `${A.n} fait {r} morceaux.`],
        unite: 'cm',
      }),
    },
    {
      // Piège : le mot « fois » fait penser à une multiplication, mais on cherche la longueur d'un seul tour.
      id: 'paquets-2-093', structure: 'GP', themes: ['sport'], niveaux: [3],
      nombres: (niv, rnd) => { const n = rnd(3, 6), t = 5 * rnd(10, 19); return { a: n * t, b: n }; },
      texte: A => ({
        phrases: [`${A.n} fait {b|fois} le tour du parc en courant.`, `En tout, ${A.n} parcourt {a|mètres}.`],
        question: `Combien de mètres mesure un tour du parc ?`,
        labels: { total: 'toute la course', nb: 'tours', taille: 'un tour' },
        juste: `Un tour du parc mesure {r} mètres.`,
        fausses: [`${A.n} parcourt {r} mètres en tout.`, `${A.n} fait {r} fois le tour du parc.`],
        unite: 'mètres',
      }),
    },

    // =========================================================================
    // GG — des groupes de b : on cherche le nombre de groupes (a ÷ b)
    // =========================================================================
    {
      id: 'paquets-2-058', structure: 'GG', themes: ['jardin'],
      nombres: nGG({ n3: [11, 30], t3: [4, 9] }),
      texte: A => ({
        phrases: [`${A.n} a {a|choux} à planter.`, `${A.Il} les plante en rangées de {b|choux}.`],
        question: `Combien de rangées ${A.n} peut-${A.il} faire ?`,
        labels: { total: 'tous les choux', nb: 'rangées', taille: 'une rangée' },
        juste: `${A.n} peut faire {r} rangées.`,
        fausses: [`${A.n} a {r} choux à planter.`, `Il y a {r} choux dans chaque rangée.`],
      }),
    },
    {
      id: 'paquets-2-059', structure: 'GG', themes: ['jardin'],
      nombres: nGG({ n3: [11, 20], t3: [4, 9] }),
      texte: A => ({
        phrases: [`${A.n} a cueilli {a|marguerites}.`, `${A.Il} fait des bouquets de {b|marguerites}.`],
        question: `Combien de bouquets ${A.n} peut-${A.il} faire ?`,
        labels: { total: 'toutes les marguerites', nb: 'bouquets', taille: 'un bouquet' },
        juste: `${A.n} peut faire {r} bouquets.`,
        fausses: [`${A.n} a cueilli {r} marguerites.`, `Chaque bouquet a {r} marguerites.`],
      }),
    },
    {
      id: 'paquets-2-060', structure: 'GG', themes: ['jardin'],
      nombres: nGG({ t2: [2, 5], n3: [11, 40], t3: [2, 5] }),
      texte: () => ({
        phrases: [`Le fermier a récolté {a|kilos} de pommes de terre.`, `Il les met dans des sacs de {b|kilos}.`],
        question: `Combien de sacs le fermier remplit-il ?`,
        labels: { total: 'la récolte', nb: 'sacs', taille: 'un sac' },
        juste: `Le fermier remplit {r} sacs.`,
        fausses: [`Le fermier a récolté {r} kilos de pommes de terre.`, `Chaque sac contient {r} kilos.`],
      }),
    },
    {
      // Piège : « combien de fois » fait penser à une multiplication, mais on cherche combien de fois b tient dans a.
      id: 'paquets-2-061', structure: 'GG', themes: ['jardin'],
      nombres: nGG({ t2: [4, 9], n3: [11, 30], t3: [5, 9] }),
      texte: A => ({
        phrases: [`Le réservoir du jardin contient {a|litres} d'eau.`, `L'arrosoir ${A.de} contient {b|litres}.`],
        question: `Combien de fois ${A.n} peut-${A.il} remplir son arrosoir avec l'eau du réservoir ?`,
        labels: { total: "l'eau du réservoir", nb: 'arrosoirs remplis', taille: 'un arrosoir' },
        juste: `${A.n} peut remplir son arrosoir {r} fois.`,
        fausses: [`Le réservoir contient {r} litres d'eau.`, `L'arrosoir contient {r} litres.`],
      }),
    },
    {
      id: 'paquets-2-062', structure: 'GG', themes: ['rangement', 'ecole'],
      nombres: nGG({ t2: [3, 9], n3: [11, 25], t3: [4, 9] }),
      texte: A => ({
        phrases: [`À la bibliothèque, ${A.n} aide à ranger {a|bandes dessinées}.`, `${A.Il} fait des piles de {b|bandes dessinées}.`],
        question: `Combien de piles ${A.n} fait-${A.il} ?`,
        labels: { total: 'toutes les bandes dessinées', nb: 'piles', taille: 'une pile' },
        juste: `${A.n} fait {r} piles.`,
        fausses: [`${A.n} range {r} bandes dessinées.`, `Chaque pile a {r} bandes dessinées.`],
      }),
    },
    {
      id: 'paquets-2-063', structure: 'GG', themes: ['rangement'],
      nombres: nGG({ n2: [3, 9], t2: 2, n3: [11, 20], t3: 2 }),
      texte: A => ({
        phrases: [`Après la lessive, il y a {a|chaussettes} dans le panier.`, `${A.n} les range par paires.`, `Une paire, c'est {b|chaussettes}.`],
        question: `Combien de paires ${A.n} peut-${A.il} faire ?`,
        labels: { total: 'toutes les chaussettes', nb: 'paires', taille: 'une paire' },
        juste: `${A.n} peut faire {r} paires.`,
        fausses: [`Il y a {r} chaussettes dans le panier.`, `Une paire compte {r} chaussettes.`],
      }),
    },
    {
      id: 'paquets-2-064', structure: 'GG', themes: ['rangement', 'ecole'],
      nombres: nGG({ t2: [4, 9], n3: [11, 30], t3: [6, 9] }),
      texte: () => ({
        phrases: [`La maîtresse a {a|feutres}.`, `Elle les range dans des trousses de {b|feutres}.`],
        question: `Combien de trousses la maîtresse peut-elle remplir ?`,
        labels: { total: 'tous les feutres', nb: 'trousses', taille: 'une trousse' },
        juste: `La maîtresse peut remplir {r} trousses.`,
        fausses: [`La maîtresse a {r} feutres.`, `Chaque trousse contient {r} feutres.`],
      }),
    },
    {
      id: 'paquets-2-065', structure: 'GG', themes: ['rangement'],
      nombres: nGG({ t2: [5, 9], n3: [11, 40], t3: [6, 9] }),
      texte: A => ({
        phrases: [`Pour déménager, la famille ${A.de} emballe {a|livres}.`, `On met {b|livres} dans chaque carton.`],
        question: `Combien de cartons faut-il pour tous ces livres ?`,
        labels: { total: 'tous les livres', nb: 'cartons', taille: 'un carton' },
        juste: `Il faut {r} cartons pour tous ces livres.`,
        fausses: [`La famille emballe {r} livres.`, `On met {r} livres dans chaque carton.`],
      }),
    },
    {
      id: 'paquets-2-066', structure: 'GG', themes: ['rangement'],
      nombres: nGG({ n3: [11, 30] }),
      texte: A => ({
        phrases: [`${A.n} a {a|billes}.`, `${A.Il} prépare des sachets de {b|billes} pour ses amis.`],
        question: `Combien de sachets ${A.n} peut-${A.il} préparer ?`,
        labels: { total: 'toutes les billes', nb: 'sachets', taille: 'un sachet' },
        juste: `${A.n} peut préparer {r} sachets.`,
        fausses: [`${A.n} a {r} billes.`, `Chaque sachet contient {r} billes.`],
      }),
    },
    {
      id: 'paquets-2-067', structure: 'GG', themes: ['sport'],
      nombres: nGG({ t2: [3, 9], n3: [11, 30], t3: [5, 9] }),
      texte: () => ({
        phrases: [`Au tournoi de l'école, il y a {a|joueurs}.`, `On fait des équipes de {b|joueurs}.`],
        question: `Combien d'équipes peut-on faire ?`,
        labels: { total: 'tous les joueurs', nb: 'équipes', taille: 'une équipe' },
        juste: `On peut faire {r} équipes.`,
        fausses: [`Il y a {r} joueurs au tournoi.`, `Chaque équipe a {r} joueurs.`],
      }),
    },
    {
      id: 'paquets-2-068', structure: 'GG', themes: ['sport'],
      nombres: nGG({ t2: [5, 9], n3: [11, 20], t3: [6, 9] }),
      texte: () => ({
        phrases: [`Pour aller au cross, {a|coureurs} prennent des minibus.`, `Chaque minibus emmène {b|coureurs}.`],
        question: `Combien de minibus faut-il pour emmener tous les coureurs ?`,
        labels: { total: 'tous les coureurs', nb: 'minibus', taille: 'un minibus' },
        juste: `Il faut {r} minibus pour emmener tous les coureurs.`,
        fausses: [`Il y a {r} coureurs qui vont au cross.`, `Chaque minibus emmène {r} coureurs.`],
      }),
    },
    {
      id: 'paquets-2-069', structure: 'GG', themes: ['sport'],
      nombres: nGG({ t2: [5, 9], n3: [11, 30], t3: [5, 9] }),
      texte: A => ({
        phrases: [`${A.n} veut faire {a|sauts} à la corde.`, `${A.Il} saute par séries de {b|sauts} et se repose entre deux séries.`],
        question: `Combien de séries ${A.n} doit-${A.il} faire ?`,
        labels: { total: 'tous les sauts', nb: 'séries', taille: 'une série' },
        juste: `${A.n} doit faire {r} séries.`,
        fausses: [`${A.n} veut faire {r} sauts.`, `Chaque série a {r} sauts.`],
      }),
    },
    {
      id: 'paquets-2-070', structure: 'GG', themes: ['sport'],
      nombres: nGG({ t2: [3, 9], n3: [11, 30], t3: [4, 9] }),
      texte: () => ({
        phrases: [`Pour la fête du sport, {a|enfants} défilent dans le stade.`, `Ils marchent en rangs de {b|enfants}.`],
        question: `Combien de rangs y a-t-il dans le défilé ?`,
        labels: { total: 'tous les enfants', nb: 'rangs', taille: 'un rang' },
        juste: `Il y a {r} rangs dans le défilé.`,
        fausses: [`Il y a {r} enfants dans le défilé.`, `Chaque rang a {r} enfants.`],
      }),
    },
    {
      id: 'paquets-2-071', structure: 'GG', themes: ['animaux'],
      nombres: nGG({ t2: 8, n3: [11, 20], t3: 8 }),
      texte: A => ({
        phrases: [`Au vivarium, ${A.n} compte {a|pattes} d'araignées.`, `Une araignée a {b|pattes}.`],
        question: `Combien d'araignées y a-t-il au vivarium ?`,
        labels: { total: 'toutes les pattes', nb: 'araignées', taille: 'une araignée' },
        juste: `Il y a {r} araignées au vivarium.`,
        fausses: [`${A.n} compte {r} pattes.`, `Une araignée a {r} pattes.`],
      }),
    },
    {
      id: 'paquets-2-072', structure: 'GG', themes: ['animaux'],
      nombres: nGG({ n2: [3, 9], t2: 2, n3: [11, 40], t3: 2 }),
      texte: A => ({
        phrases: [`Dans la basse-cour, il n'y a que des poules.`, `${A.n} compte {a|pattes}.`, `Une poule a {b|pattes}.`],
        question: `Combien de poules y a-t-il dans la basse-cour ?`,
        labels: { total: 'toutes les pattes', nb: 'poules', taille: 'une poule' },
        juste: `Il y a {r} poules dans la basse-cour.`,
        fausses: [`${A.n} compte {r} pattes.`, `Une poule a {r} pattes.`],
      }),
    },
    {
      id: 'paquets-2-073', structure: 'GG', themes: ['animaux', 'sport'],
      nombres: nGG({ t2: [4, 9], n3: [11, 20], t3: [6, 9] }),
      texte: () => ({
        phrases: [`Pour la course de traîneaux, {a|chiens} sont prêts à partir.`, `On attache {b|chiens} à chaque traîneau.`],
        question: `Combien de traîneaux peuvent partir ?`,
        labels: { total: 'tous les chiens', nb: 'traîneaux', taille: 'un traîneau' },
        juste: `Il y a {r} traîneaux qui peuvent partir.`,
        fausses: [`Il y a {r} chiens prêts à partir.`, `On attache {r} chiens à chaque traîneau.`],
      }),
    },
    {
      id: 'paquets-2-074', structure: 'GG', themes: ['animaux'],
      nombres: nGG({ n3: [11, 30] }),
      texte: () => ({
        phrases: [`Le soigneur a {a|carottes} pour les lapins.`, `Chaque lapin mange {b|carottes}.`],
        question: `Combien de lapins le soigneur peut-il nourrir ?`,
        labels: { total: 'toutes les carottes', nb: 'lapins', taille: 'pour un lapin' },
        juste: `Le soigneur peut nourrir {r} lapins.`,
        fausses: [`Le soigneur a {r} carottes.`, `Chaque lapin mange {r} carottes.`],
      }),
    },
    {
      id: 'paquets-2-075', structure: 'GG', themes: ['animaux'],
      nombres: nGG({ t2: [2, 6], n3: [11, 25], t3: [3, 6] }),
      texte: () => ({
        phrases: [`Le vendeur de l'animalerie a {a|poissons rouges}.`, `Il met {b|poissons} dans chaque bocal.`],
        question: `Combien de bocaux le vendeur remplit-il ?`,
        labels: { total: 'tous les poissons', nb: 'bocaux', taille: 'un bocal' },
        juste: `Le vendeur remplit {r} bocaux.`,
        fausses: [`Le vendeur a {r} poissons rouges.`, `Il y a {r} poissons dans chaque bocal.`],
      }),
    },
    {
      id: 'paquets-2-076', structure: 'GG', themes: ['espace', 'rangement'],
      nombres: nGG({ n3: [11, 40] }),
      texte: () => ({
        phrases: [`Alvin trouve {a|cristaux} dans une grotte.`, `Il les range dans des boîtes de {b|cristaux}.`],
        question: `Combien de boîtes Alvin remplit-il ?`,
        labels: { total: 'tous les cristaux', nb: 'boîtes', taille: 'une boîte' },
        juste: `Alvin remplit {r} boîtes.`,
        fausses: [`Alvin trouve {r} cristaux.`, `Chaque boîte contient {r} cristaux.`],
      }),
    },
    {
      id: 'paquets-2-077', structure: 'GG', themes: ['espace'],
      nombres: nGG({ t2: [4, 9], n3: [11, 30], t3: [5, 9] }),
      texte: () => ({
        phrases: [`À la gare spatiale, {a|touristes} attendent pour aller sur la Lune.`, `Chaque navette emmène {b|passagers}.`],
        question: `Combien de navettes faut-il pour emmener tous les touristes ?`,
        labels: { total: 'tous les touristes', nb: 'navettes', taille: 'une navette' },
        juste: `Il faut {r} navettes pour emmener tous les touristes.`,
        fausses: [`Il y a {r} touristes à la gare spatiale.`, `Chaque navette emmène {r} passagers.`],
      }),
    },
    {
      id: 'paquets-2-078', structure: 'GG', themes: ['espace'],
      nombres: nGG({ n3: [11, 40] }),
      texte: () => ({
        phrases: [`Le vaisseau emporte {a|repas} pour le voyage.`, `Chaque jour, l'équipage mange {b|repas}.`],
        question: `Combien de jours le voyage peut-il durer ?`,
        labels: { total: 'tous les repas', nb: 'jours', taille: 'repas par jour' },
        juste: `Le voyage peut durer {r} jours.`,
        fausses: [`Le vaisseau emporte {r} repas.`, `L'équipage mange {r} repas par jour.`],
      }),
    },
    {
      id: 'paquets-2-079', structure: 'GG', themes: ['espace'],
      nombres: nGG({ t2: [4, 9], n3: [11, 30], t3: [6, 9] }),
      texte: A => ({
        phrases: [`${A.n} a {a|boulons}.`, `Pour construire un robot, il faut {b|boulons}.`],
        question: `Combien de robots ${A.n} peut-${A.il} construire ?`,
        labels: { total: 'tous les boulons', nb: 'robots', taille: 'pour un robot' },
        juste: `${A.n} peut construire {r} robots.`,
        fausses: [`${A.n} a {r} boulons.`, `Il faut {r} boulons pour un robot.`],
      }),
    },
    {
      id: 'paquets-2-080', structure: 'GG', themes: ['espace'],
      nombres: nGG({ t2: [3, 9], n3: [11, 25], t3: [4, 9] }),
      texte: A => ({
        phrases: [`Sur sa carte du ciel, ${A.n} a dessiné {a|étoiles}.`, `Ces étoiles forment des constellations de {b|étoiles} chacune.`],
        question: `Combien de constellations ${A.n} a-t-${A.il} dessinées ?`,
        labels: { total: 'toutes les étoiles', nb: 'constellations', taille: 'une constellation' },
        juste: `${A.n} a dessiné {r} constellations.`,
        fausses: [`${A.n} a dessiné {r} étoiles.`, `Chaque constellation a {r} étoiles.`],
      }),
    },
    {
      // Piège : « chaque enfant reçoit » fait penser à une multiplication, mais on cherche le nombre d'enfants.
      id: 'paquets-2-094', structure: 'GG', themes: ['jardin', 'ecole'],
      nombres: nGG({ t2: [3, 9], n3: [11, 30], t3: [3, 9] }),
      texte: () => ({
        phrases: [`Le jardinier de l'école a {a|graines} de courge.`, `Il donne toutes ses graines aux enfants.`, `Chaque enfant reçoit {b|graines}.`],
        question: `Combien d'enfants reçoivent des graines ?`,
        labels: { total: 'toutes les graines', nb: 'enfants', taille: 'pour un enfant' },
        juste: `Il y a {r} enfants qui reçoivent des graines.`,
        fausses: [`Chaque enfant reçoit {r} graines.`, `Le jardinier a {r} graines de courge.`],
      }),
    },

    // =========================================================================
    // FP — « b fois plus » : on cherche la grande quantité (a × b)
    // =========================================================================
    {
      id: 'paquets-2-081', structure: 'FP', themes: ['jardin'],
      nombres: nFP({ t3: [21, 60] }),
      texte: (A, B) => ({
        phrases: [`Le tournesol ${A.de} mesure {a|cm}.`, `Le tournesol ${B.de} est {b} fois plus grand.`],
        question: `Combien mesure le tournesol ${B.de} ?`,
        labels: { petit: A.n, grand: B.n },
        juste: `Le tournesol ${B.de} mesure {r} cm.`,
        fausses: [`Le tournesol ${A.de} mesure {r} cm.`, `Le tournesol ${B.de} mesure {r} cm de plus que celui ${A.de}.`],
        unite: 'cm',
      }),
    },
    {
      id: 'paquets-2-082', structure: 'FP', themes: ['jardin'],
      nombres: nFP({ t3: [11, 40] }),
      texte: (A, B) => ({
        phrases: [`Cet été, ${A.n} a récolté {a|tomates} dans son potager.`, `${B.n} en a récolté {b} fois plus.`],
        question: `Combien de tomates ${B.n} a-t-${B.il} récoltées ?`,
        labels: { petit: A.n, grand: B.n },
        juste: `${B.n} a récolté {r} tomates.`,
        fausses: [`${A.n} a récolté {r} tomates.`, `${B.n} a récolté {r} tomates de plus ${A.que}.`],
      }),
    },
    {
      id: 'paquets-2-083', structure: 'FP', themes: ['sport'],
      nombres: nFP({ t3: [11, 40] }),
      texte: (A, B) => ({
        phrases: [`À la récréation, ${A.n} fait {a|sauts} à la corde sans s'arrêter.`, `${B.n} en fait {b} fois plus.`],
        question: `Combien de sauts ${B.n} fait-${B.il} ?`,
        labels: { petit: A.n, grand: B.n },
        juste: `${B.n} fait {r} sauts.`,
        fausses: [`${A.n} fait {r} sauts.`, `${A.n} et ${B.n} font {r} sauts ensemble.`],
      }),
    },
    {
      id: 'paquets-2-084', structure: 'FP', themes: ['sport'],
      nombres: (niv, rnd) => ({ a: 5 * rnd(3, 12), b: rnd(2, 5) }),
      texte: (A, B) => ({
        phrases: [`À la piscine, ${A.n} nage {a|mètres}.`, `${B.n} nage une distance {b} fois plus longue.`],
        question: `Combien de mètres ${B.n} nage-t-${B.il} ?`,
        labels: { petit: A.n, grand: B.n },
        juste: `${B.n} nage {r} mètres.`,
        fausses: [`${A.n} nage {r} mètres.`, `${B.n} nage {r} mètres de plus ${A.que}.`],
        unite: 'mètres',
      }),
    },
    {
      id: 'paquets-2-085', structure: 'FP', themes: ['animaux'],
      nombres: nFP({ t3: [11, 40] }),
      texte: () => ({
        phrases: [`Au zoo, il y a {a|flamants roses}.`, `Il y a {b} fois plus de manchots que de flamants roses.`],
        question: `Combien de manchots y a-t-il au zoo ?`,
        labels: { petit: 'flamants roses', grand: 'manchots' },
        juste: `Il y a {r} manchots au zoo.`,
        fausses: [`Il y a {r} flamants roses au zoo.`, `Il y a {r} manchots de plus que de flamants roses.`],
      }),
    },
    {
      id: 'paquets-2-086', structure: 'FP', themes: ['animaux'],
      nombres: nFP({ t3: [11, 40] }),
      texte: () => ({
        phrases: [`Le bébé éléphant boit {a|litres} d'eau par jour.`, `La maman éléphant boit {b} fois plus d'eau.`],
        question: `Combien de litres d'eau la maman éléphant boit-elle par jour ?`,
        labels: { petit: 'le bébé', grand: 'la maman' },
        juste: `La maman éléphant boit {r} litres d'eau par jour.`,
        fausses: [`Le bébé éléphant boit {r} litres d'eau par jour.`, `La maman éléphant boit {r} litres de plus que son bébé.`],
        unite: 'litres',
      }),
    },
    {
      id: 'paquets-2-087', structure: 'FP', themes: ['espace'],
      nombres: nFP({ t3: [11, 40] }),
      texte: () => ({
        phrases: [`La planète Tika a {a|volcans}.`, `La planète Zoum a {b} fois plus de volcans.`],
        question: `Combien de volcans la planète Zoum a-t-elle ?`,
        labels: { petit: 'Tika', grand: 'Zoum' },
        juste: `La planète Zoum a {r} volcans.`,
        fausses: [`La planète Tika a {r} volcans.`, `Les deux planètes ont {r} volcans en tout.`],
      }),
    },
    {
      id: 'paquets-2-088', structure: 'FP', themes: ['espace'],
      nombres: nFP({ n3: [2, 3], t3: [11, 35] }),
      texte: () => ({
        phrases: [`La fusée d'Alvin mesure {a|mètres} de haut.`, `La fusée géante de la base est {b} fois plus haute.`],
        question: `Combien de mètres mesure la fusée géante ?`,
        labels: { petit: "fusée d'Alvin", grand: 'fusée géante' },
        juste: `La fusée géante mesure {r} mètres de haut.`,
        fausses: [`La fusée d'Alvin mesure {r} mètres de haut.`, `La fusée géante mesure {r} mètres de plus que celle d'Alvin.`],
        unite: 'mètres',
      }),
    },
    {
      id: 'paquets-2-089', structure: 'FP', themes: ['rangement'],
      nombres: nFP({ t3: [11, 30] }),
      texte: A => ({
        phrases: [`Dans la chambre ${A.de}, la petite étagère contient {a|livres}.`, `La grande étagère en contient {b} fois plus.`],
        question: `Combien de livres la grande étagère contient-elle ?`,
        labels: { petit: 'petite étagère', grand: 'grande étagère' },
        juste: `La grande étagère contient {r} livres.`,
        fausses: [`La petite étagère contient {r} livres.`, `Les deux étagères contiennent {r} livres en tout.`],
      }),
    },
    {
      id: 'paquets-2-090', structure: 'FP', themes: ['espace'],
      nombres: nFP({ t3: [11, 50] }),
      texte: (A, B) => ({
        phrases: [`Pendant la mission, ${A.n} prend {a|photos} de la Lune.`, `${B.n} en prend {b} fois plus.`],
        question: `Combien de photos de la Lune ${B.n} prend-${B.il} ?`,
        labels: { petit: A.n, grand: B.n },
        juste: `${B.n} prend {r} photos de la Lune.`,
        fausses: [`${A.n} prend {r} photos de la Lune.`, `${B.n} prend {r} photos de plus ${A.que}.`],
      }),
    },
  ]);

  // Phrases pièges propres à cette banque (un nombre inutile glissé dans l'énoncé).
  Problemes.ajouterPieges('paquets', [
    { f: P => `${P.n} porte un maillot avec le numéro {d}.`, v: (niv, rnd) => rnd(2, 30), sansAlvin: true },
    { f: () => `Dans le ciel, on voit {d|nuages}.`, v: (niv, rnd) => rnd(3, 12) },
    { f: P => `La maison ${P.de} a {d|fenêtres}.`, v: (niv, rnd) => rnd(4, 14), sansAlvin: true },
  ]);
})();
