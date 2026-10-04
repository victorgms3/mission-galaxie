'use strict';
/* Plus ou moins — banque 2 : nature, espace, animaux, voyage (et un peu jeux).
 * Planètes extraterrestres (graines lumineuses, cristaux, fusées, stations spatiales, lunes…)
 * et nature terrestre (forêt, mer, ferme, zoo, migrations).
 *
 * Deux champs propres à cette banque, transformés en `nombres()` à la fin du fichier :
 *  - `plafonds: { 1: 99, 2: 900, 3: 6000 }` : plafond vraisemblable des nombres pour chaque grade
 *    (même tirage que le moteur, mais un plafond différent par grade) ;
 *  - `condition: v => …` : contrainte de vraisemblance sur { a, b, r } (ex. moins de bébés que d'adultes).
 * Tout est enfermé dans une fonction pour ne créer aucune variable globale.
 */
(() => {
  // Tirage « somme » du moteur (p + q = s), avec un plafond par grade
  const BAS = { 1: 10, 2: 100, 3: 1000 };
  const MINI = { 1: 3, 2: 11, 3: 40 };
  const MAXI = { 1: 99, 2: 999, 3: 9999 };

  function tirage(structure, plafonds, condition) {
    const map = Problemes.STRUCTURES[structure].map;
    return (niv, rnd) => {
      const m = Math.min(MAXI[niv], (plafonds && plafonds[niv]) || MAXI[niv]);
      const bas = Math.min(BAS[niv], Math.floor(m / 2));
      const mini = Math.min(MINI[niv], Math.max(1, Math.floor(m / 6)));
      for (let essai = 0; essai < 100; essai++) {
        const s = rnd(Math.max(bas, 2 * mini + 2), m);
        const p = rnd(mini, s - mini);
        const v = map({ p, q: s - p, s });
        if (!condition || condition(v)) return { a: v.a, b: v.b };
      }
      return { a: 0, b: 0 }; // tirage refusé par le moteur, qui recommence
    };
  }

  const modeles = [
    // =========================================================================
    // CT — deux parties, on cherche le tout (a + b)
    // =========================================================================
    { id: 'plusmoins-2-001', structure: 'CT', themes: ['nature', 'espace'], plafonds: { 1: 99, 2: 900, 3: 6000 },
      texte: A => ({
        phrases: [`Dans le grand champ des lumières, ${A.n} conduit la machine à semer.`, `La machine sème {a|graines bleues} et {b|graines dorées}.`],
        question: `Combien de graines la machine a-t-elle semées en tout ?`,
        labels: { tout: 'toutes les graines', p1: 'bleues', p2: 'dorées' },
        juste: `La machine a semé {r} graines en tout.`,
        fausses: [`La machine a semé {r} graines bleues.`, `La machine a semé {r} graines dorées.`],
      }) },

    { id: 'plusmoins-2-002', structure: 'CT', themes: ['voyage', 'espace'], plafonds: { 1: 99, 2: 900, 3: 5000 },
      texte: A => ({
        phrases: [`Lundi, la navette spatiale ${A.de} transporte {a|passagers}.`, `Mardi, la navette transporte {b|passagers}.`],
        question: `Combien de passagers la navette a-t-elle transportés en deux jours ?`,
        labels: { tout: 'les deux jours', p1: 'lundi', p2: 'mardi' },
        juste: `En deux jours, la navette a transporté {r} passagers.`,
        fausses: [`Lundi, la navette a transporté {r} passagers.`, `Mardi, la navette a transporté {r} passagers.`],
      }) },

    { id: 'plusmoins-2-003', structure: 'CT', themes: ['animaux'], plafonds: { 1: 99, 2: 950, 3: 8000 },
      texte: A => ({
        phrases: [`${A.n} aide le gardien du zoo à compter les visiteurs.`, `Le matin, {a|visiteurs} entrent au zoo.`, `L'après-midi, {b|visiteurs} arrivent encore.`],
        question: `Combien de visiteurs sont venus au zoo dans la journée ?`,
        labels: { tout: 'toute la journée', p1: 'le matin', p2: "l'après-midi" },
        juste: `Dans la journée, {r} visiteurs sont venus au zoo.`,
        fausses: [`Le matin, {r} visiteurs sont venus au zoo.`, `L'après-midi, {r} visiteurs sont venus au zoo.`],
      }) },

    { id: 'plusmoins-2-004', structure: 'CT', themes: ['nature', 'jeux'], niveaux: [1, 2], plafonds: { 1: 80, 2: 300 },
      texte: (A, B, AB) => ({
        phrases: [`Sur la plage, ${A.n} ramasse {a|coquillages}.`, `${B.n} ramasse {b|coquillages}.`],
        question: `Combien de coquillages ${A.n} et ${B.n} ont-${AB.ils} ramassés ensemble ?`,
        labels: { tout: 'ensemble', p1: A.n, p2: B.n },
        juste: `${A.n} et ${B.n} ont ramassé {r} coquillages ensemble.`,
        fausses: [`${A.n} a ramassé {r} coquillages.`, `${B.n} a ramassé {r} coquillages.`],
      }) },

    { id: 'plusmoins-2-005', structure: 'CT', themes: ['voyage'], plafonds: { 1: 99, 2: 900, 3: 2500 }, limites: { a: [15, 9999], b: [15, 9999] },
      texte: A => ({
        phrases: [`${A.n} voyage en train pendant deux jours.`, `Le premier jour, le train parcourt {a|km}.`, `Le deuxième jour, le train parcourt {b|km}.`],
        question: `Combien de kilomètres le train a-t-il parcourus en tout ?`,
        labels: { tout: 'tout le voyage', p1: '1er jour', p2: '2e jour' },
        juste: `Le train a parcouru {r} km en tout.`,
        fausses: [`Le premier jour, le train a parcouru {r} km.`, `Le deuxième jour, le train a parcouru {r} km.`],
        unite: 'km',
      }) },

    { id: 'plusmoins-2-006', structure: 'CT', themes: ['espace', 'nature'], plafonds: { 1: 99, 2: 900, 3: 5000 },
      texte: A => ({
        phrases: [`${A.n} visite la mine de cristaux.`, `Dans la première grotte, ${A.n} compte {a|cristaux roses}.`, `Dans la deuxième grotte, ${A.n} compte {b|cristaux verts}.`],
        question: `Combien de cristaux ${A.n} a-t-${A.il} comptés en tout ?`,
        labels: { tout: 'tous les cristaux', p1: 'roses', p2: 'verts' },
        juste: `${A.n} a compté {r} cristaux en tout.`,
        fausses: [`${A.n} a compté {r} cristaux roses.`, `${A.n} a compté {r} cristaux verts.`],
      }) },

    { id: 'plusmoins-2-007', structure: 'CT', themes: ['animaux', 'nature'], plafonds: { 1: 99, 2: 800, 3: 3000 },
      texte: A => ({
        phrases: [`${A.n} observe le grand lac avec des jumelles.`, `${A.Il} voit {a|flamants roses} et {b|canards}.`],
        question: `Combien d'oiseaux ${A.n} voit-${A.il} sur le lac ?`,
        labels: { tout: 'tous les oiseaux', p1: 'flamants roses', p2: 'canards' },
        juste: `${A.n} voit {r} oiseaux sur le lac.`,
        fausses: [`${A.n} voit {r} flamants roses.`, `${A.n} voit {r} canards.`],
      }) },

    { id: 'plusmoins-2-008', structure: 'CT', themes: ['jeux', 'espace'],
      texte: A => ({
        phrases: [`${A.n} joue à la course des comètes.`, `${A.Il} marque {a|points} à la première manche et {b|points} à la deuxième manche.`],
        question: `Combien de points ${A.n} a-t-${A.il} marqués en tout ?`,
        labels: { tout: 'les deux manches', p1: '1re manche', p2: '2e manche' },
        juste: `${A.n} a marqué {r} points en tout.`,
        fausses: [`${A.n} a marqué {r} points à la première manche.`, `${A.n} a marqué {r} points à la deuxième manche.`],
      }) },

    { id: 'plusmoins-2-009', structure: 'CT', themes: ['nature'], plafonds: { 1: 99, 2: 950, 3: 7000 }, limites: { a: [12, 9999], b: [12, 9999] },
      texte: A => ({
        phrases: [`${A.n} aide le garde forestier à compter les arbres.`, `Dans la forêt, il y a {a|chênes} et {b|sapins}.`],
        question: `Combien d'arbres y a-t-il dans la forêt ?`,
        labels: { tout: 'tous les arbres', p1: 'chênes', p2: 'sapins' },
        juste: `Il y a {r} arbres dans la forêt.`,
        fausses: [`Il y a {r} chênes dans la forêt.`, `Il y a {r} sapins dans la forêt.`],
      }) },

    { id: 'plusmoins-2-010', structure: 'CT', themes: ['espace', 'voyage'],
      texte: A => ({
        phrases: [`La fusée ${A.de} vole jusqu'à la lune Myrtille, à {a|km} de la planète.`, `Ensuite, la fusée continue jusqu'à la station spatiale, à {b|km} de la lune.`],
        question: `Combien de kilomètres la fusée parcourt-elle en tout ?`,
        labels: { tout: 'tout le trajet', p1: "jusqu'à la lune", p2: "jusqu'à la station" },
        juste: `La fusée parcourt {r} km en tout.`,
        fausses: [`La lune Myrtille est à {r} km de la planète.`, `La station spatiale est à {r} km de la lune.`],
        unite: 'km',
      }) },

    { id: 'plusmoins-2-011', structure: 'CT', themes: ['animaux', 'voyage'], plafonds: { 1: 99, 2: 600, 3: 2500 },
      texte: A => ({
        phrases: [`Sur la planète Océane, des poissons volants sautent au-dessus des vagues.`, `Avec le radar du bateau, ${A.n} compte {a|poissons} près du bateau et {b|poissons} près de l'île.`],
        question: `Combien de poissons volants ${A.n} a-t-${A.il} comptés ?`,
        labels: { tout: 'tous les poissons', p1: 'près du bateau', p2: "près de l'île" },
        juste: `${A.n} a compté {r} poissons volants.`,
        fausses: [`${A.n} a compté {r} poissons près du bateau.`, `${A.n} a compté {r} poissons près de l'île.`],
      }) },

    // =========================================================================
    // TG — on avait, on gagne, on cherche ce qu'on a après (a + b)
    // =========================================================================
    { id: 'plusmoins-2-012', structure: 'TG', themes: ['espace', 'nature'], niveaux: [1, 2], plafonds: { 1: 99, 2: 500 }, condition: v => v.b <= v.a,
      texte: A => ({
        phrases: [`${A.n} a {a|cailloux de comète} dans sa collection.`, `Pendant la balade, ${A.n} trouve {b|nouveaux cailloux}.`],
        question: `Combien de cailloux de comète ${A.n} a-t-${A.il} maintenant ?`,
        labels: { tout: 'maintenant', p1: 'au début', p2: 'trouvés' },
        juste: `${A.n} a maintenant {r} cailloux de comète.`,
        fausses: [`${A.n} a trouvé {r} cailloux pendant la balade.`, `Au début, ${A.n} avait {r} cailloux de comète.`],
      }) },

    { id: 'plusmoins-2-013', structure: 'TG', themes: ['animaux', 'voyage'], plafonds: { 1: 99, 2: 800, 3: 3000 },
      texte: A => ({
        phrases: [`${A.n} observe les cigognes du marais.`, `Au début du printemps, il y a {a|cigognes}.`, `Puis {b|cigognes} arrivent d'Afrique.`],
        question: `Combien de cigognes y a-t-il maintenant dans le marais ?`,
        labels: { tout: 'maintenant', p1: 'au début', p2: "arrivées d'Afrique" },
        juste: `Il y a maintenant {r} cigognes dans le marais.`,
        fausses: [`Au printemps, {r} cigognes sont arrivées d'Afrique.`, `Au début du printemps, il y avait {r} cigognes.`],
      }) },

    { id: 'plusmoins-2-014', structure: 'TG', themes: ['espace', 'voyage'], limites: { a: [20, 9999] },
      texte: A => ({
        phrases: [`Le compteur de la fusée ${A.de} indique {a|km}.`, `${A.n} part faire un voyage de {b|km}.`],
        question: `Combien de kilomètres le compteur indique-t-il à la fin du voyage ?`,
        labels: { tout: 'à la fin', p1: 'au départ', p2: 'le voyage' },
        juste: `À la fin du voyage, le compteur indique {r} km.`,
        fausses: [`Le voyage mesure {r} km.`, `Au départ, le compteur indique {r} km.`],
        unite: 'km',
      }) },

    { id: 'plusmoins-2-015', structure: 'TG', themes: ['nature'], plafonds: { 1: 99, 2: 999, 3: 6000 }, limites: { a: [30, 9999] },
      texte: () => ({
        phrases: [`Le matin, la citerne de la ferme contient {a|litres d'eau}.`, `Dans l'après-midi, un gros orage ajoute {b|litres d'eau} dans la citerne.`],
        question: `Combien de litres d'eau la citerne contient-elle le soir ?`,
        labels: { tout: 'le soir', p1: 'le matin', p2: "l'orage" },
        juste: `Le soir, la citerne contient {r} litres d'eau.`,
        fausses: [`L'orage a ajouté {r} litres d'eau.`, `Le matin, la citerne contenait {r} litres d'eau.`],
      }) },

    { id: 'plusmoins-2-016', structure: 'TG', themes: ['jeux', 'espace'],
      texte: A => ({
        phrases: [`Au jeu Chasse aux étoiles, ${A.n} a {a|points}.`, `${A.n} attrape une étoile magique qui rapporte {b|points}.`],
        question: `Combien de points ${A.n} a-t-${A.il} maintenant ?`,
        labels: { tout: 'maintenant', p1: 'avant', p2: "l'étoile magique" },
        juste: `${A.n} a maintenant {r} points.`,
        fausses: [`L'étoile magique rapporte {r} points.`, `Avant l'étoile magique, ${A.n} avait {r} points.`],
      }) },

    { id: 'plusmoins-2-017', structure: 'TG', themes: ['animaux', 'nature'], limites: { a: [20, 9999] },
      texte: A => ({
        phrases: [`${A.n} observe une fourmilière avec une loupe.`, `Il y a {a|fourmis} dans la fourmilière.`, `Au printemps, {b|petites fourmis} naissent.`],
        question: `Combien de fourmis y a-t-il maintenant dans la fourmilière ?`,
        labels: { tout: 'maintenant', p1: 'avant', p2: 'nouvelles fourmis' },
        juste: `Il y a maintenant {r} fourmis dans la fourmilière.`,
        fausses: [`Au printemps, {r} petites fourmis sont nées.`, `Avant le printemps, il y avait {r} fourmis.`],
      }) },

    { id: 'plusmoins-2-018', structure: 'TG', themes: ['voyage', 'espace'], niveaux: [1, 2], plafonds: { 1: 99, 2: 900 }, limites: { a: [15, 999] },
      texte: () => ({
        phrases: [`Le train des étoiles transporte {a|passagers}.`, `À la gare de la Lune, {b|passagers} montent et personne ne descend.`],
        question: `Combien de passagers y a-t-il maintenant dans le train ?`,
        labels: { tout: 'après la gare', p1: 'avant la gare', p2: 'montés' },
        juste: `Il y a maintenant {r} passagers dans le train.`,
        fausses: [`À la gare de la Lune, {r} passagers sont montés.`, `Avant la gare, il y avait {r} passagers dans le train.`],
      }) },

    { id: 'plusmoins-2-019', structure: 'TG', themes: ['nature'], plafonds: { 1: 99, 2: 950, 3: 6000 }, limites: { a: [25, 9999] }, condition: v => v.b < v.a,
      texte: A => ({
        phrases: [`Autour du village, il y a {a|arbres}.`, `Pour la fête de la forêt, ${A.n} et les habitants plantent {b|jeunes arbres}.`],
        question: `Combien d'arbres y a-t-il maintenant autour du village ?`,
        labels: { tout: 'maintenant', p1: 'avant la fête', p2: 'plantés' },
        juste: `Il y a maintenant {r} arbres autour du village.`,
        fausses: [`${A.n} et les habitants ont planté {r} arbres.`, `Avant la fête, il y avait {r} arbres autour du village.`],
      }) },

    { id: 'plusmoins-2-020', structure: 'TG', themes: ['espace'],
      texte: A => ({
        phrases: [`${A.n} visite l'observatoire de la planète.`, `Le grand télescope a déjà photographié {a|étoiles}.`, `Cette nuit, le télescope photographie encore {b|étoiles}.`],
        question: `Combien d'étoiles le télescope a-t-il photographiées maintenant ?`,
        labels: { tout: 'maintenant', p1: 'avant cette nuit', p2: 'cette nuit' },
        juste: `Le télescope a maintenant photographié {r} étoiles.`,
        fausses: [`Cette nuit, le télescope a photographié {r} étoiles.`, `Avant cette nuit, le télescope avait photographié {r} étoiles.`],
      }) },

    { id: 'plusmoins-2-021', structure: 'TG', themes: ['animaux'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: rnd(90, 130), b: rnd(150, 350) }),
      texte: A => ({
        phrases: [`${A.n} adore le bébé éléphant du zoo.`, `À sa naissance, le bébé éléphant pesait {a|kg}.`, `Pendant sa première année, il a pris {b|kg}.`],
        question: `Combien pèse le bébé éléphant à un an ?`,
        labels: { tout: 'à un an', p1: 'à la naissance', p2: 'pris en un an' },
        juste: `À un an, le bébé éléphant pèse {r} kg.`,
        fausses: [`À sa naissance, le bébé éléphant pesait {r} kg.`, `En un an, le bébé éléphant a pris {r} kg.`],
        unite: 'kg',
      }) },

    { id: 'plusmoins-2-022', structure: 'TG', themes: ['jeux', 'voyage'], plafonds: { 1: 99, 2: 900, 3: 4000 },
      texte: A => ({
        phrases: [`${A.n} joue aux pirates de l'espace.`, `Dans son coffre, ${A.n} a {a|pièces d'or}.`, `Sur une île, ${A.n} trouve un trésor de {b|pièces d'or} et le met dans son coffre.`],
        question: `Combien de pièces d'or y a-t-il maintenant dans le coffre ?`,
        labels: { tout: 'maintenant', p1: 'avant', p2: 'le trésor' },
        juste: `Il y a maintenant {r} pièces d'or dans le coffre.`,
        fausses: [`Le trésor contient {r} pièces d'or.`, `Avant, il y avait {r} pièces d'or dans le coffre.`],
      }) },

    // =========================================================================
    // TP — on avait, on perd, on cherche ce qui reste (a − b)
    // =========================================================================
    { id: 'plusmoins-2-023', structure: 'TP', themes: ['espace', 'voyage'], plafonds: { 1: 99, 2: 999, 3: 9000 },
      texte: A => ({
        phrases: [`Avant le départ, le réservoir de la fusée ${A.de} contient {a|litres de carburant}.`, `Pour décoller, la fusée brûle {b|litres de carburant}.`],
        question: `Combien de litres de carburant reste-t-il dans le réservoir ?`,
        labels: { tout: 'au départ', p1: 'brûlés', p2: 'qui restent' },
        juste: `Il reste {r} litres de carburant dans le réservoir.`,
        fausses: [`La fusée a brûlé {r} litres de carburant.`, `Au départ, il y avait {r} litres de carburant.`],
      }) },

    { id: 'plusmoins-2-024', structure: 'TP', themes: ['nature'], niveaux: [1, 2], plafonds: { 1: 99, 2: 600 }, limites: { a: [25, 999] },
      texte: () => ({
        phrases: [`Le grand pommier du verger porte {a|pommes}.`, `Pendant la tempête, le vent fait tomber {b|pommes}.`],
        question: `Combien de pommes reste-t-il sur le pommier ?`,
        labels: { tout: 'avant la tempête', p1: 'tombées', p2: 'qui restent' },
        juste: `Il reste {r} pommes sur le pommier.`,
        fausses: [`Le vent a fait tomber {r} pommes.`, `Avant la tempête, le pommier portait {r} pommes.`],
      }) },

    { id: 'plusmoins-2-025', structure: 'TP', themes: ['animaux', 'nature'], plafonds: { 1: 99, 2: 900, 3: 3000 },
      texte: A => ({
        phrases: [`Dans la mare, ${A.n} observe {a|têtards}.`, `Trois semaines plus tard, {b|têtards} sont devenus des grenouilles.`],
        question: `Combien de têtards reste-t-il dans la mare ?`,
        labels: { tout: 'au début', p1: 'devenus grenouilles', p2: 'encore têtards' },
        juste: `Il reste {r} têtards dans la mare.`,
        fausses: [`En trois semaines, {r} têtards sont devenus des grenouilles.`, `Au début, il y avait {r} têtards dans la mare.`],
      }) },

    { id: 'plusmoins-2-026', structure: 'TP', themes: ['voyage'], plafonds: { 1: 99, 2: 999, 3: 5000 }, limites: { a: [40, 9999] },
      texte: A => ({
        phrases: [`${A.n} part en croisière sur un bateau.`, `Au départ, il y a {a|passagers} à bord.`, `À la première escale, {b|passagers} quittent le bateau.`],
        question: `Combien de passagers reste-t-il à bord ?`,
        labels: { tout: 'au départ', p1: 'descendus', p2: 'encore à bord' },
        juste: `Il reste {r} passagers à bord.`,
        fausses: [`À l'escale, {r} passagers ont quitté le bateau.`, `Au départ, il y avait {r} passagers à bord.`],
      }) },

    { id: 'plusmoins-2-027', structure: 'TP', themes: ['jeux', 'espace'],
      texte: A => ({
        phrases: [`Au jeu des planètes, ${A.n} a {a|points}.`, `Le vaisseau ${A.de} tombe dans un trou noir et ${A.n} perd {b|points}.`],
        question: `Combien de points reste-t-il à ${A.n} ?`,
        labels: { tout: 'avant', p1: 'perdus', p2: 'qui restent' },
        juste: `Il reste {r} points à ${A.n}.`,
        fausses: [`${A.n} a perdu {r} points.`, `Avant le trou noir, ${A.n} avait {r} points.`],
      }) },

    { id: 'plusmoins-2-028', structure: 'TP', themes: ['nature', 'espace'], plafonds: { 1: 99, 2: 900, 3: 5000 },
      texte: A => ({
        phrases: [`${A.n} a un sac de {a|graines lumineuses}.`, `${A.n} sème {b|graines} dans le jardin de la station.`],
        question: `Combien de graines reste-t-il dans le sac ?`,
        labels: { tout: 'dans le sac', p1: 'semées', p2: 'qui restent' },
        juste: `Il reste {r} graines dans le sac.`,
        fausses: [`${A.n} a semé {r} graines.`, `Au début, le sac contenait {r} graines.`],
      }) },

    { id: 'plusmoins-2-029', structure: 'TP', themes: ['animaux', 'nature'], niveaux: [1, 2], plafonds: { 1: 99, 2: 600 }, limites: { a: [20, 999] },
      texte: A => ({
        phrases: [`${A.n} aide le berger à garder le troupeau.`, `Dans la prairie, il y a {a|moutons}.`, `Le soir, {b|moutons} rentrent à la bergerie.`],
        question: `Combien de moutons sont encore dans la prairie ?`,
        labels: { tout: 'tout le troupeau', p1: 'rentrés', p2: 'dans la prairie' },
        juste: `Il y a encore {r} moutons dans la prairie.`,
        fausses: [`Le soir, {r} moutons sont rentrés à la bergerie.`, `Le troupeau compte {r} moutons.`],
      }) },

    { id: 'plusmoins-2-030', structure: 'TP', themes: ['voyage', 'espace'], plafonds: { 1: 99, 2: 999, 3: 3000 }, condition: v => 2 * v.b <= v.a,
      texte: A => ({
        phrases: [`Après son voyage sur la planète Glagla, ${A.n} a {a|photos} dans son appareil.`, `${A.n} efface {b|photos} floues.`],
        question: `Combien de photos reste-t-il dans l'appareil ?`,
        labels: { tout: 'avant', p1: 'effacées', p2: 'qui restent' },
        juste: `Il reste {r} photos dans l'appareil.`,
        fausses: [`${A.n} a effacé {r} photos.`, `Avant, il y avait {r} photos dans l'appareil.`],
      }) },

    { id: 'plusmoins-2-031', structure: 'TP', themes: ['nature'], plafonds: { 1: 99, 2: 999, 3: 6000 }, limites: { a: [30, 9999] },
      texte: A => ({
        phrases: [`Dans le champ près de chez ${A.n}, il y a {a|tournesols}.`, `Pour la fête du village, les habitants cueillent {b|tournesols}.`],
        question: `Combien de tournesols reste-t-il dans le champ ?`,
        labels: { tout: 'avant la fête', p1: 'cueillis', p2: 'qui restent' },
        juste: `Il reste {r} tournesols dans le champ.`,
        fausses: [`Les habitants ont cueilli {r} tournesols.`, `Avant la fête, il y avait {r} tournesols dans le champ.`],
      }) },

    { id: 'plusmoins-2-032', structure: 'TP', themes: ['espace'], plafonds: { 1: 99, 2: 900, 3: 2500 },
      texte: () => ({
        phrases: [`Dans le hangar de la station spatiale, il y a {a|petits robots}.`, `Ce matin, {b|robots} partent explorer la planète rouge.`],
        question: `Combien de robots restent dans le hangar ?`,
        labels: { tout: 'au début', p1: 'partis', p2: 'dans le hangar' },
        juste: `Il reste {r} robots dans le hangar.`,
        fausses: [`Ce matin, {r} robots sont partis explorer la planète.`, `Au début, il y avait {r} robots dans le hangar.`],
      }) },

    { id: 'plusmoins-2-033', structure: 'TP', themes: ['jeux', 'espace'], niveaux: [1, 2], plafonds: { 1: 99, 2: 300 },
      texte: (A, B) => ({
        phrases: [`${A.n} a une collection de {a|autocollants} de planètes.`, `${A.n} donne {b|autocollants} ${B.a}.`],
        question: `Combien d'autocollants reste-t-il à ${A.n} ?`,
        labels: { tout: 'au début', p1: 'donnés', p2: 'qui restent' },
        juste: `Il reste {r} autocollants à ${A.n}.`,
        fausses: [`${B.n} a reçu {r} autocollants.`, `Au début, ${A.n} avait {r} autocollants.`],
      }) },

    // =========================================================================
    // CP — on connaît le tout et une partie, on cherche l'autre partie (a − b)
    // =========================================================================
    { id: 'plusmoins-2-034', structure: 'CP', themes: ['animaux'], plafonds: { 2: 999, 3: 4000 },
      texte: A => ({
        phrases: [`${A.n} visite le zoo de la planète Bleue.`, `Ce zoo accueille {a|animaux}.`, `Parmi tous ces animaux, il y a {b|oiseaux}.`],
        question: `Combien d'animaux du zoo ne sont pas des oiseaux ?`,
        labels: { tout: 'tous les animaux', p1: 'oiseaux', p2: 'les autres' },
        juste: `Dans ce zoo, {r} animaux ne sont pas des oiseaux.`,
        fausses: [`Il y a {r} oiseaux au zoo.`, `Le zoo accueille {r} animaux.`],
      }) },

    { id: 'plusmoins-2-035', structure: 'CP', themes: ['voyage', 'espace'],
      texte: A => ({
        phrases: [`Le trajet jusqu'à la station spatiale mesure {a|km}.`, `La fusée ${A.de} a déjà parcouru {b|km}.`],
        question: `Combien de kilomètres reste-t-il à parcourir ?`,
        labels: { tout: 'tout le trajet', p1: 'déjà parcourus', p2: 'qui restent' },
        juste: `Il reste {r} km à parcourir.`,
        fausses: [`La fusée a déjà parcouru {r} km.`, `Le trajet mesure {r} km en tout.`],
        unite: 'km',
      }) },

    { id: 'plusmoins-2-036', structure: 'CP', themes: ['nature'], plafonds: { 2: 999, 3: 9000 },
      texte: () => ({
        phrases: [`La forêt des Trois Lacs compte {a|arbres}.`, `Il y a {b|sapins} et tous les autres arbres sont des bouleaux.`],
        question: `Combien de bouleaux y a-t-il dans la forêt ?`,
        labels: { tout: 'tous les arbres', p1: 'sapins', p2: 'bouleaux' },
        juste: `Il y a {r} bouleaux dans la forêt.`,
        fausses: [`Il y a {r} sapins dans la forêt.`, `La forêt compte {r} arbres.`],
      }) },

    { id: 'plusmoins-2-037', structure: 'CP', themes: ['espace'], plafonds: { 2: 950, 3: 6000 },
      texte: A => ({
        phrases: [`Le robot mineur ${A.de} a rapporté {a|cristaux}.`, `Il y a {b|cristaux violets} et les autres cristaux sont jaunes.`],
        question: `Combien de cristaux jaunes le robot a-t-il rapportés ?`,
        labels: { tout: 'tous les cristaux', p1: 'violets', p2: 'jaunes' },
        juste: `Le robot a rapporté {r} cristaux jaunes.`,
        fausses: [`Le robot a rapporté {r} cristaux violets.`, `Le robot a rapporté {r} cristaux en tout.`],
      }) },

    { id: 'plusmoins-2-038', structure: 'CP', themes: ['animaux', 'nature'], plafonds: { 2: 950, 3: 5000 },
      texte: A => ({
        phrases: [`Dans le grand aquarium de la ville, il y a {a|poissons}.`, `${A.n} compte {b|poissons-clowns}.`],
        question: `Combien de poissons de l'aquarium ne sont pas des poissons-clowns ?`,
        labels: { tout: 'tous les poissons', p1: 'poissons-clowns', p2: 'les autres' },
        juste: `Dans l'aquarium, {r} poissons ne sont pas des poissons-clowns.`,
        fausses: [`Il y a {r} poissons-clowns dans l'aquarium.`, `Il y a {r} poissons dans l'aquarium.`],
      }) },

    { id: 'plusmoins-2-039', structure: 'CP', themes: ['jeux', 'espace'], plafonds: { 2: 999, 3: 3000 },
      texte: A => ({
        phrases: [`Le puzzle de la galaxie a {a|pièces}.`, `${A.n} a déjà posé {b|pièces}.`],
        question: `Combien de pièces reste-t-il à poser ?`,
        labels: { tout: 'tout le puzzle', p1: 'déjà posées', p2: 'à poser' },
        juste: `Il reste {r} pièces à poser.`,
        fausses: [`${A.n} a déjà posé {r} pièces.`, `Le puzzle a {r} pièces en tout.`],
      }) },

    { id: 'plusmoins-2-040', structure: 'CP', themes: ['voyage'], plafonds: { 2: 999, 3: 5000 }, condition: v => v.b > v.r,
      texte: () => ({
        phrases: [`Sur le grand bateau de croisière, il y a {a|passagers}.`, `Parmi les passagers, il y a {b|adultes}.`, `Tous les autres passagers sont des enfants.`],
        question: `Combien d'enfants y a-t-il sur le bateau ?`,
        labels: { tout: 'tous les passagers', p1: 'adultes', p2: 'enfants' },
        juste: `Il y a {r} enfants sur le bateau.`,
        fausses: [`Il y a {r} adultes sur le bateau.`, `Il y a {r} passagers sur le bateau.`],
      }) },

    // =========================================================================
    // TTg — on connaît avant et après, on cherche ce qui a été gagné (b − a)
    // =========================================================================
    { id: 'plusmoins-2-041', structure: 'TTg', themes: ['jeux'],
      texte: A => ({
        phrases: [`${A.n} joue au labyrinthe des étoiles.`, `Au début de la partie, ${A.n} a {a|points}.`, `À la fin de la partie, ${A.n} a {b|points}.`],
        question: `Combien de points ${A.n} a-t-${A.il} gagnés pendant la partie ?`,
        labels: { tout: 'à la fin', p1: 'au début', p2: 'gagnés' },
        juste: `${A.n} a gagné {r} points pendant la partie.`,
        fausses: [`À la fin de la partie, ${A.n} a {r} points.`, `Au début de la partie, ${A.n} avait {r} points.`],
      }) },

    { id: 'plusmoins-2-042', structure: 'TTg', themes: ['animaux'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: rnd(170, 200), b: rnd(280, 340) }),
      texte: () => ({
        phrases: [`À sa naissance, le bébé girafe du zoo mesurait {a|cm}.`, `Un an plus tard, le bébé girafe mesure {b|cm}.`],
        question: `De combien de centimètres le bébé girafe a-t-il grandi ?`,
        labels: { tout: 'à un an', p1: 'à la naissance', p2: 'grandi' },
        juste: `Le bébé girafe a grandi de {r} cm.`,
        fausses: [`À un an, le bébé girafe mesure {r} cm.`, `À sa naissance, le bébé girafe mesurait {r} cm.`],
        unite: 'cm',
      }) },

    { id: 'plusmoins-2-043', structure: 'TTg', themes: ['espace', 'nature'],
      texte: A => ({
        phrases: [`${A.n} compte les étoiles filantes avec un compteur magique.`, `Hier soir, le compteur indiquait {a|étoiles filantes}.`, `Ce matin, le compteur indique {b|étoiles filantes}.`],
        question: `Combien d'étoiles filantes sont passées pendant la nuit ?`,
        labels: { tout: 'ce matin', p1: 'hier soir', p2: 'cette nuit' },
        juste: `Pendant la nuit, {r} étoiles filantes sont passées.`,
        fausses: [`Ce matin, le compteur indique {r} étoiles filantes.`, `Hier soir, le compteur indiquait {r} étoiles filantes.`],
      }) },

    { id: 'plusmoins-2-044', structure: 'TTg', themes: ['nature', 'voyage'], niveaux: [3], limites: { r: [1000, 9999] },
      texte: A => ({
        phrases: [`${A.n} porte une montre qui compte les pas.`, `Avant la balade en forêt, la montre indique {a|pas}.`, `Après la balade, la montre indique {b|pas}.`],
        question: `Combien de pas ${A.n} a-t-${A.il} faits pendant la balade ?`,
        labels: { tout: 'après la balade', p1: 'avant', p2: 'pendant la balade' },
        juste: `${A.n} a fait {r} pas pendant la balade.`,
        fausses: [`Après la balade, la montre indique {r} pas.`, `Avant la balade, la montre indiquait {r} pas.`],
      }) },

    { id: 'plusmoins-2-045', structure: 'TTg', themes: ['animaux', 'nature'],
      texte: A => ({
        phrases: [`${A.n} observe une ruche de loin.`, `À midi, il y a {a|abeilles} dans la ruche.`, `Le soir, d'autres abeilles rentrent des fleurs.`, `Il y a maintenant {b|abeilles} dans la ruche.`],
        question: `Combien d'abeilles sont rentrées le soir ?`,
        labels: { tout: 'le soir', p1: 'à midi', p2: 'rentrées' },
        juste: `Le soir, {r} abeilles sont rentrées dans la ruche.`,
        fausses: [`À midi, il y avait {r} abeilles dans la ruche.`, `Le soir, il y a {r} abeilles dans la ruche.`],
      }) },

    { id: 'plusmoins-2-046', structure: 'TTg', themes: ['espace', 'voyage'],
      texte: A => ({
        phrases: [`Le réservoir de la fusée ${A.de} contient {a|litres de carburant}.`, `Pour partir vers la planète Jupiter, le réservoir doit contenir {b|litres de carburant}.`],
        question: `Combien de litres de carburant faut-il encore ajouter ?`,
        labels: { tout: 'pour partir', p1: 'déjà dedans', p2: 'à ajouter' },
        juste: `Il faut encore ajouter {r} litres de carburant.`,
        fausses: [`Le réservoir contient déjà {r} litres de carburant.`, `Pour partir, il faut {r} litres de carburant.`],
      }) },

    { id: 'plusmoins-2-047', structure: 'TTg', themes: ['animaux', 'voyage'], condition: v => 2 * v.r <= v.a, // au plus un poussin par couple
      texte: A => ({
        phrases: [`${A.n} part en voyage au pays des glaces.`, `Au début de l'hiver, la colonie de manchots compte {a|manchots}.`, `À la fin de l'hiver, après la naissance des poussins, la colonie compte {b|manchots}.`],
        question: `Combien de poussins sont nés pendant l'hiver ?`,
        labels: { tout: "fin de l'hiver", p1: "début de l'hiver", p2: 'poussins nés' },
        juste: `Pendant l'hiver, {r} poussins sont nés.`,
        fausses: [`À la fin de l'hiver, la colonie compte {r} manchots.`, `Au début de l'hiver, la colonie comptait {r} manchots.`],
      }) },

    // =========================================================================
    // TTp — on connaît avant et après, on cherche ce qui a été perdu (a − b)
    // =========================================================================
    { id: 'plusmoins-2-048', structure: 'TTp', themes: ['jeux'],
      texte: A => ({
        phrases: [`${A.n} joue au jeu des astéroïdes.`, `${A.n} commence la partie avec {a|points}.`, `À la fin, ${A.n} n'a plus que {b|points}.`],
        question: `Combien de points ${A.n} a-t-${A.il} perdus pendant la partie ?`,
        labels: { tout: 'au début', p1: 'perdus', p2: 'à la fin' },
        juste: `${A.n} a perdu {r} points pendant la partie.`,
        fausses: [`À la fin, ${A.n} a {r} points.`, `Au début, ${A.n} avait {r} points.`],
      }) },

    { id: 'plusmoins-2-049', structure: 'TTp', themes: ['espace', 'voyage'],
      texte: A => ({
        phrases: [`Au départ, le vaisseau ${A.de} a {a|cristaux d'énergie}.`, `Après la traversée des astéroïdes, il reste {b|cristaux d'énergie}.`],
        question: `Combien de cristaux d'énergie le vaisseau a-t-il utilisés ?`,
        labels: { tout: 'au départ', p1: 'utilisés', p2: 'qui restent' },
        juste: `Le vaisseau a utilisé {r} cristaux d'énergie.`,
        fausses: [`Après la traversée, il reste {r} cristaux d'énergie.`, `Au départ, le vaisseau avait {r} cristaux d'énergie.`],
      }) },

    { id: 'plusmoins-2-050', structure: 'TTp', themes: ['nature'],
      texte: () => ({
        phrases: [`Le matin, le cerisier du jardin a encore {a|feuilles}.`, `Le soir, après le grand vent, il ne reste que {b|feuilles} sur ses branches.`],
        question: `Combien de feuilles sont tombées dans la journée ?`,
        labels: { tout: 'le matin', p1: 'tombées', p2: 'le soir' },
        juste: `Dans la journée, {r} feuilles sont tombées.`,
        fausses: [`Le soir, il reste {r} feuilles sur le cerisier.`, `Le matin, le cerisier avait {r} feuilles.`],
      }) },

    { id: 'plusmoins-2-051', structure: 'TTp', themes: ['animaux', 'voyage'],
      texte: () => ({
        phrases: [`Un grand groupe d'oies sauvages part vers le sud.`, `Au départ, le groupe compte {a|oies}.`, `Des oies s'arrêtent en chemin.`, `À l'arrivée, le groupe ne compte plus que {b|oies}.`],
        question: `Combien d'oies se sont arrêtées en chemin ?`,
        labels: { tout: 'au départ', p1: 'arrêtées', p2: "à l'arrivée" },
        juste: `En chemin, {r} oies se sont arrêtées.`,
        fausses: [`À l'arrivée, le groupe compte {r} oies.`, `Au départ, le groupe comptait {r} oies.`],
      }) },

    { id: 'plusmoins-2-052', structure: 'TTp', themes: ['jeux', 'voyage'], condition: v => 4 * v.r >= v.a, // « beaucoup » partent
      texte: () => ({
        phrases: [`À midi, le parc d'attractions des planètes accueille {a|visiteurs}.`, `En fin d'après-midi, beaucoup de visiteurs rentrent chez eux.`, `Il reste alors {b|visiteurs} dans le parc.`],
        question: `Combien de visiteurs sont partis en fin d'après-midi ?`,
        labels: { tout: 'à midi', p1: 'partis', p2: 'encore là' },
        juste: `En fin d'après-midi, {r} visiteurs sont partis.`,
        fausses: [`Il reste {r} visiteurs dans le parc.`, `À midi, il y avait {r} visiteurs dans le parc.`],
      }) },

    { id: 'plusmoins-2-053', structure: 'TTp', themes: ['nature', 'jeux'], niveaux: [2], plafonds: { 2: 300 }, condition: v => 2 * v.b <= v.a, // il en reste « seulement »
      texte: A => ({
        phrases: [`Sur la plage, ${A.n} a rempli un seau avec {a|coquillages d'étoile}.`, `Sur le chemin du retour, le seau se renverse.`, `Il reste seulement {b|coquillages} dans le seau.`],
        question: `Combien de coquillages sont tombés du seau ?`,
        labels: { tout: 'au début', p1: 'tombés', p2: 'dans le seau' },
        juste: `Sur le chemin, {r} coquillages sont tombés du seau.`,
        fausses: [`Il reste {r} coquillages dans le seau.`, `Au début, il y avait {r} coquillages dans le seau.`],
      }) },

    { id: 'plusmoins-2-054', structure: 'TTp', themes: ['animaux', 'espace'], plafonds: { 2: 999, 3: 6000 },
      texte: A => ({
        phrases: [`Le sac de graines lumineuses ${A.de} contient {a|graines}.`, `${A.n} oublie le sac ouvert dans le jardin et les oiseaux-lunes passent par là.`, `Maintenant, il reste {b|graines} dans le sac.`],
        question: `Combien de graines les oiseaux-lunes ont-ils mangées ?`,
        labels: { tout: 'au début', p1: 'mangées', p2: 'qui restent' },
        juste: `Les oiseaux-lunes ont mangé {r} graines.`,
        fausses: [`Il reste {r} graines dans le sac.`, `Au début, le sac contenait {r} graines.`],
      }) },

    // =========================================================================
    // TIg — on connaît le gain et l'état après, on cherche l'état de départ (b − a)
    // Le mot « gagne » pousse à additionner : il faut soustraire.
    // =========================================================================
    { id: 'plusmoins-2-055', structure: 'TIg', themes: ['jeux'],
      texte: A => ({
        phrases: [`${A.n} joue à la course des comètes.`, `Pendant la partie, ${A.n} gagne {a|points}.`, `À la fin, ${A.n} a {b|points}.`],
        question: `Combien de points ${A.n} avait-${A.il} au début de la partie ?`,
        labels: { tout: 'à la fin', p1: 'au début', p2: 'gagnés' },
        juste: `Au début de la partie, ${A.n} avait {r} points.`,
        fausses: [`Pendant la partie, ${A.n} a gagné {r} points.`, `À la fin, ${A.n} a {r} points.`],
      }) },

    { id: 'plusmoins-2-056', structure: 'TIg', themes: ['animaux', 'nature'], plafonds: { 3: 9000 }, condition: v => v.a < v.r,
      texte: A => ({
        phrases: [`${A.n} visite l'île des Rochers en bateau.`, `Cette année, {a|bébés phoques} sont nés sur l'île.`, `Maintenant, il y a {b|phoques} sur l'île.`],
        question: `Avant les naissances, combien de phoques y avait-il sur l'île ?`,
        labels: { tout: 'maintenant', p1: 'avant', p2: 'bébés nés' },
        juste: `Avant les naissances, il y avait {r} phoques sur l'île.`,
        fausses: [`Cette année, {r} bébés phoques sont nés.`, `Maintenant, il y a {r} phoques sur l'île.`],
      }) },

    { id: 'plusmoins-2-057', structure: 'TIg', themes: ['espace', 'voyage'],
      texte: A => ({
        phrases: [`Avant le grand voyage, ${A.n} remplit le réservoir de sa fusée.`, `${A.n} ajoute {a|litres de carburant}.`, `Maintenant, le réservoir contient {b|litres de carburant}.`],
        question: `Combien de litres de carburant y avait-il dans le réservoir avant le plein ?`,
        labels: { tout: 'maintenant', p1: 'avant', p2: 'ajoutés' },
        juste: `Avant le plein, il y avait {r} litres de carburant dans le réservoir.`,
        fausses: [`${A.n} a ajouté {r} litres de carburant.`, `Maintenant, le réservoir contient {r} litres de carburant.`],
      }) },

    { id: 'plusmoins-2-058', structure: 'TIg', themes: ['nature', 'espace'], condition: v => v.a < v.r,
      texte: A => ({
        phrases: [`${A.n} s'occupe du jardin des étoiles.`, `Ce printemps, {a|nouvelles fleurs} ont poussé dans le jardin.`, `Maintenant, il y a {b|fleurs} dans le jardin des étoiles.`],
        question: `Combien de fleurs y avait-il dans le jardin avant le printemps ?`,
        labels: { tout: 'maintenant', p1: 'avant', p2: 'nouvelles fleurs' },
        juste: `Avant le printemps, il y avait {r} fleurs dans le jardin.`,
        fausses: [`Ce printemps, {r} nouvelles fleurs ont poussé.`, `Maintenant, il y a {r} fleurs dans le jardin.`],
      }) },

    { id: 'plusmoins-2-059', structure: 'TIg', themes: ['voyage', 'espace'],
      texte: A => ({
        phrases: [`Pendant son voyage vers la planète Glagla, la fusée ${A.de} parcourt {a|km}.`, `À l'arrivée, le compteur de la fusée indique {b|km}.`],
        question: `Combien de kilomètres le compteur indiquait-il au départ ?`,
        labels: { tout: "à l'arrivée", p1: 'au départ', p2: 'le voyage' },
        juste: `Au départ, le compteur indiquait {r} km.`,
        fausses: [`Pendant le voyage, la fusée a parcouru {r} km.`, `À l'arrivée, le compteur indique {r} km.`],
        unite: 'km',
      }) },

    { id: 'plusmoins-2-060', structure: 'TIg', themes: ['espace'], condition: v => v.a < v.r,
      texte: A => ({
        phrases: [`${A.n} aide le gardien du musée des étoiles.`, `Aujourd'hui, {a|visiteurs} sont venus au musée.`, `Ce soir, le compteur de l'entrée indique {b|visiteurs} depuis l'ouverture du musée.`],
        question: `Combien de visiteurs le compteur indiquait-il ce matin ?`,
        labels: { tout: 'ce soir', p1: 'ce matin', p2: "aujourd'hui" },
        juste: `Ce matin, le compteur indiquait {r} visiteurs.`,
        fausses: [`Aujourd'hui, {r} visiteurs sont venus au musée.`, `Ce soir, le compteur indique {r} visiteurs.`],
      }) },

    // =========================================================================
    // TIp — on connaît la perte et ce qui reste, on cherche l'état de départ (a + b)
    // Les mots « perd », « mange », « donne » poussent à soustraire : il faut additionner.
    // =========================================================================
    { id: 'plusmoins-2-061', structure: 'TIp', themes: ['jeux', 'espace'],
      texte: A => ({
        phrases: [`Au jeu des planètes, un astéroïde touche le vaisseau ${A.de}.`, `${A.n} perd {a|points}.`, `Il reste {b|points} à ${A.n}.`],
        question: `Combien de points ${A.n} avait-${A.il} avant le choc ?`,
        labels: { tout: 'avant le choc', p1: 'perdus', p2: 'qui restent' },
        juste: `Avant le choc, ${A.n} avait {r} points.`,
        fausses: [`${A.n} a perdu {r} points.`, `Il reste {r} points à ${A.n}.`],
      }) },

    { id: 'plusmoins-2-062', structure: 'TIp', themes: ['voyage', 'espace'], plafonds: { 3: 1200 },
      texte: () => ({
        phrases: [`À la gare de Saturne, {a|passagers} descendent du train des étoiles et personne ne monte.`, `Il reste alors {b|passagers} dans le train.`],
        question: `Avant la gare de Saturne, combien de passagers y avait-il dans le train ?`,
        labels: { tout: 'avant la gare', p1: 'descendus', p2: 'encore dans le train' },
        juste: `Avant la gare de Saturne, il y avait {r} passagers dans le train.`,
        fausses: [`À la gare de Saturne, {r} passagers sont descendus.`, `Après la gare, il reste {r} passagers dans le train.`],
      }) },

    { id: 'plusmoins-2-063', structure: 'TIp', themes: ['animaux', 'nature'], plafonds: { 3: 3000 },
      texte: () => ({
        phrases: [`En automne, un écureuil cache des noisettes dans la forêt.`, `Pendant l'hiver, l'écureuil mange {a|noisettes}.`, `Au printemps, il reste {b|noisettes} dans ses cachettes.`],
        question: `Combien de noisettes l'écureuil avait-il cachées en automne ?`,
        labels: { tout: 'cachées en automne', p1: 'mangées', p2: 'qui restent' },
        juste: `En automne, l'écureuil avait caché {r} noisettes.`,
        fausses: [`Pendant l'hiver, l'écureuil a mangé {r} noisettes.`, `Au printemps, il reste {r} noisettes dans les cachettes.`],
      }) },

    { id: 'plusmoins-2-064', structure: 'TIp', themes: ['espace', 'nature'],
      texte: (A, B) => ({
        phrases: [`${A.n} a un gros sac de minuscules graines lumineuses.`, `${A.n} donne {a|graines} ${B.a}.`, `Maintenant, il reste {b|graines} dans le sac.`],
        question: `Combien de graines y avait-il dans le sac au début ?`,
        labels: { tout: 'au début', p1: 'données', p2: 'qui restent' },
        juste: `Au début, il y avait {r} graines dans le sac.`,
        fausses: [`${A.n} a donné {r} graines ${B.a}.`, `Maintenant, il reste {r} graines dans le sac.`],
      }) },

    { id: 'plusmoins-2-065', structure: 'TIp', themes: ['animaux'], plafonds: { 3: 3000 }, condition: v => v.a < v.b,
      texte: A => ({
        phrases: [`${A.n} rend visite au berger de la montagne.`, `Cette année, le berger a vendu {a|moutons} à d'autres fermes.`, `Il reste maintenant {b|moutons} dans son troupeau.`],
        question: `Combien de moutons le troupeau comptait-il avant la vente ?`,
        labels: { tout: 'avant la vente', p1: 'vendus', p2: 'qui restent' },
        juste: `Avant la vente, le troupeau comptait {r} moutons.`,
        fausses: [`Le berger a vendu {r} moutons.`, `Il reste {r} moutons dans le troupeau.`],
      }) },

    { id: 'plusmoins-2-066', structure: 'TIp', themes: ['nature'], condition: v => v.a < v.b,
      texte: A => ({
        phrases: [`Pendant la grande tempête, {a|arbres} sont tombés dans la forêt.`, `Après la tempête, ${A.n} et le garde forestier comptent {b|arbres} encore debout.`],
        question: `Combien d'arbres y avait-il dans la forêt avant la tempête ?`,
        labels: { tout: 'avant la tempête', p1: 'tombés', p2: 'encore debout' },
        juste: `Avant la tempête, il y avait {r} arbres dans la forêt.`,
        fausses: [`Pendant la tempête, {r} arbres sont tombés.`, `Après la tempête, il reste {r} arbres debout.`],
      }) },

    // =========================================================================
    // CE — comparaison : on cherche l'écart (b − a)
    // =========================================================================
    { id: 'plusmoins-2-067', structure: 'CE', themes: ['espace', 'jeux'],
      texte: (A, B) => ({
        phrases: [`Pendant la course de fusées, la fusée ${A.de} a parcouru {a|km}.`, `La fusée ${B.de} a parcouru {b|km}.`],
        question: `Combien de kilomètres la fusée ${B.de} a-t-elle parcourus de plus que celle ${A.de} ?`,
        labels: { grand: B.n, petit: A.n },
        juste: `La fusée ${B.de} a parcouru {r} km de plus que celle ${A.de}.`,
        fausses: [`La fusée ${B.de} a parcouru {r} km.`, `Les deux fusées ont parcouru {r} km en tout.`],
        unite: 'km',
      }) },

    { id: 'plusmoins-2-068', structure: 'CE', themes: ['animaux'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(1400, 3000), b: rnd(3500, 6000) }),
      texte: A => ({
        phrases: [`Au zoo, ${A.n} lit les panneaux des animaux.`, `L'hippopotame pèse {a|kg}.`, `L'éléphant pèse {b|kg}.`],
        question: `De combien de kilos l'éléphant est-il plus lourd que l'hippopotame ?`,
        labels: { grand: "l'éléphant", petit: "l'hippopotame" },
        juste: `L'éléphant pèse {r} kg de plus que l'hippopotame.`,
        fausses: [`L'éléphant pèse {r} kg.`, `L'éléphant et l'hippopotame pèsent {r} kg ensemble.`],
        unite: 'kg',
      }) },

    { id: 'plusmoins-2-069', structure: 'CE', themes: ['voyage', 'nature'], plafonds: { 2: 900, 3: 2500 },
      texte: A => ({
        phrases: [`${A.n} hésite entre deux voyages.`, `La montagne est à {b|km} de chez ${A.n}.`, `La mer est à {a|km} de chez ${A.n}.`],
        question: `De combien de kilomètres la montagne est-elle plus loin que la mer ?`,
        labels: { grand: 'la montagne', petit: 'la mer' },
        juste: `La montagne est {r} km plus loin que la mer.`,
        fausses: [`La montagne est à {r} km de chez ${A.n}.`, `La mer est à {r} km de chez ${A.n}.`],
        unite: 'km',
      }) },

    { id: 'plusmoins-2-070', structure: 'CE', themes: ['nature', 'jeux'], niveaux: [2], plafonds: { 2: 950 }, limites: { a: [80, 999] },
      texte: (A, B) => ({
        phrases: [`Au concours des citrouilles géantes, la citrouille ${A.de} pèse {a|kg}.`, `La citrouille ${B.de} pèse {b|kg}.`],
        question: `Combien de kilos la citrouille ${B.de} pèse-t-elle de plus que celle ${A.de} ?`,
        labels: { grand: B.n, petit: A.n },
        juste: `La citrouille ${B.de} pèse {r} kg de plus que celle ${A.de}.`,
        fausses: [`La citrouille ${B.de} pèse {r} kg.`, `Les deux citrouilles pèsent {r} kg ensemble.`],
        unite: 'kg',
      }) },

    { id: 'plusmoins-2-071', structure: 'CE', themes: ['animaux', 'nature'], plafonds: { 2: 999, 3: 8000 },
      texte: A => ({
        phrases: [`Sur l'île du Nord, ${A.n} compte {b|mouettes}.`, `Sur l'île du Sud, ${A.n} compte {a|mouettes}.`],
        question: `Combien de mouettes y a-t-il de moins sur l'île du Sud ?`,
        labels: { grand: 'île du Nord', petit: 'île du Sud' },
        juste: `Il y a {r} mouettes de moins sur l'île du Sud.`,
        fausses: [`Il y a {r} mouettes sur l'île du Sud.`, `Il y a {r} mouettes sur les deux îles.`],
      }) },

    { id: 'plusmoins-2-072', structure: 'CE', themes: ['jeux'],
      texte: (A, B) => ({
        phrases: [`Au jeu des météorites, ${B.n} a {b|points}.`, `${A.n} a {a|points}.`],
        question: `Combien de points manque-t-il à ${A.n} pour avoir autant de points ${B.que} ?`,
        labels: { grand: B.n, petit: A.n },
        juste: `Il manque {r} points à ${A.n} pour rattraper ${B.n}.`,
        fausses: [`${A.n} a {r} points.`, `${B.n} a {r} points.`],
      }) },

    { id: 'plusmoins-2-073', structure: 'CE', themes: ['voyage', 'nature'],
      texte: A => ({
        phrases: [`Sur la planète des volcans, ${A.n} escalade deux volcans.`, `Le volcan Bleu mesure {a|mètres} de haut.`, `Le volcan Rouge mesure {b|mètres} de haut.`],
        question: `De combien de mètres le volcan Rouge est-il plus haut que le volcan Bleu ?`,
        labels: { grand: 'volcan Rouge', petit: 'volcan Bleu' },
        juste: `Le volcan Rouge est {r} mètres plus haut que le volcan Bleu.`,
        fausses: [`Le volcan Rouge mesure {r} mètres de haut.`, `Le volcan Bleu mesure {r} mètres de haut.`],
      }) },

    // =========================================================================
    // CPlus — « b de plus que » : on cherche le plus grand (a + b)
    // =========================================================================
    { id: 'plusmoins-2-074', structure: 'CPlus', themes: ['espace'],
      texte: (A, B) => ({
        phrases: [`Avec le télescope, ${A.n} a compté {a|étoiles}.`, `${B.n} a compté {b|étoiles} de plus ${A.que}.`],
        question: `Combien d'étoiles ${B.n} a-t-${B.il} comptées ?`,
        labels: { grand: B.n, petit: A.n },
        juste: `${B.n} a compté {r} étoiles.`,
        fausses: [`${A.n} a compté {r} étoiles.`, `${B.n} a compté {r} étoiles de plus ${A.que}.`],
      }) },

    { id: 'plusmoins-2-075', structure: 'CPlus', themes: ['animaux'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: rnd(150, 200), b: rnd(20, 80) }),
      texte: A => ({
        phrases: [`${A.n} pose des questions au soigneur des fauves.`, `Au zoo, le lion pèse {a|kg}.`, `Le tigre pèse {b|kg} de plus que le lion.`],
        question: `Combien pèse le tigre ?`,
        labels: { grand: 'le tigre', petit: 'le lion' },
        juste: `Le tigre pèse {r} kg.`,
        fausses: [`Le lion pèse {r} kg.`, `Le tigre pèse {r} kg de plus que le lion.`],
        unite: 'kg',
      }) },

    { id: 'plusmoins-2-076', structure: 'CPlus', themes: ['voyage'], limites: { a: [11, 1500] },
      texte: A => ({
        phrases: [`Pendant les vacances, ${A.n} fait un voyage en train et un voyage en avion.`, `Le voyage en train mesure {a|km}.`, `Le voyage en avion mesure {b|km} de plus que le voyage en train.`],
        question: `Combien de kilomètres mesure le voyage en avion ?`,
        labels: { grand: "l'avion", petit: 'le train' },
        juste: `Le voyage en avion mesure {r} km.`,
        fausses: [`Le voyage en train mesure {r} km.`, `Le voyage en avion mesure {r} km de plus que le voyage en train.`],
        unite: 'km',
      }) },

    { id: 'plusmoins-2-077', structure: 'CPlus', themes: ['nature'],
      texte: () => ({
        phrases: [`Cette année, le verger du village a donné {a|pommes}.`, `L'an dernier, le verger avait donné {b|pommes} de plus.`],
        question: `Combien de pommes le verger avait-il données l'an dernier ?`,
        labels: { grand: "l'an dernier", petit: 'cette année' },
        juste: `L'an dernier, le verger avait donné {r} pommes.`,
        fausses: [`Cette année, le verger a donné {r} pommes.`, `L'an dernier, le verger avait donné {r} pommes de plus.`],
      }) },

    { id: 'plusmoins-2-078', structure: 'CPlus', themes: ['espace', 'voyage'],
      texte: A => ({
        phrases: [`${A.n} prépare un voyage vers deux lunes.`, `La lune Pistache est à {a|km} de la planète.`, `La lune Cerise est {b|km} plus loin que la lune Pistache.`],
        question: `À combien de kilomètres de la planète se trouve la lune Cerise ?`,
        labels: { grand: 'lune Cerise', petit: 'lune Pistache' },
        juste: `La lune Cerise est à {r} km de la planète.`,
        fausses: [`La lune Pistache est à {r} km de la planète.`, `La lune Cerise est {r} km plus loin que la lune Pistache.`],
        unite: 'km',
      }) },

    { id: 'plusmoins-2-079', structure: 'CPlus', themes: ['animaux'],
      texte: () => ({
        phrases: [`Samedi, {a|visiteurs} sont venus voir les pandas du zoo.`, `Dimanche, il y a eu {b|visiteurs} de plus que samedi.`],
        question: `Combien de visiteurs sont venus voir les pandas dimanche ?`,
        labels: { grand: 'dimanche', petit: 'samedi' },
        juste: `Dimanche, {r} visiteurs sont venus voir les pandas.`,
        fausses: [`Samedi, {r} visiteurs sont venus voir les pandas.`, `Dimanche, il y a eu {r} visiteurs de plus que samedi.`],
      }) },

    // =========================================================================
    // CMoins — « b de moins que » : on cherche le plus petit (a − b)
    // =========================================================================
    { id: 'plusmoins-2-080', structure: 'CMoins', themes: ['jeux', 'espace'],
      texte: (A, B) => ({
        phrases: [`Au jeu des anneaux de Saturne, ${A.n} marque {a|points}.`, `${B.n} marque {b|points} de moins ${A.que}.`],
        question: `Combien de points ${B.n} marque-t-${B.il} ?`,
        labels: { grand: A.n, petit: B.n },
        juste: `${B.n} marque {r} points.`,
        fausses: [`${A.n} marque {r} points.`, `${B.n} marque {r} points de moins ${A.que}.`],
      }) },

    { id: 'plusmoins-2-081', structure: 'CMoins', themes: ['nature', 'voyage'], plafonds: { 2: 999, 3: 4000 },
      texte: A => ({
        phrases: [`${A.n} étudie la carte de la planète.`, `La rivière Argent mesure {a|km} de long.`, `La rivière Turquoise est plus courte de {b|km}.`],
        question: `Combien de kilomètres mesure la rivière Turquoise ?`,
        labels: { grand: 'rivière Argent', petit: 'rivière Turquoise' },
        juste: `La rivière Turquoise mesure {r} km de long.`,
        fausses: [`La rivière Argent mesure {r} km de long.`, `La rivière Turquoise est plus courte de {r} km.`],
        unite: 'km',
      }) },

    { id: 'plusmoins-2-082', structure: 'CMoins', themes: ['animaux', 'voyage'],
      texte: A => ({
        phrases: [`Dans la savane, ${A.n} voit un grand troupeau de {a|gnous}.`, `Le troupeau de zèbres a {b|animaux} de moins que le troupeau de gnous.`],
        question: `Combien de zèbres y a-t-il dans le troupeau ?`,
        labels: { grand: 'les gnous', petit: 'les zèbres' },
        juste: `Il y a {r} zèbres dans le troupeau.`,
        fausses: [`Il y a {r} gnous dans le troupeau.`, `Le troupeau de zèbres a {r} animaux de moins.`],
      }) },

    { id: 'plusmoins-2-083', structure: 'CMoins', themes: ['espace'],
      texte: A => ({
        phrases: [`${A.n} regarde l'écran de la station spatiale.`, `Le satellite Rouge tourne à {a|km} au-dessus de la planète.`, `Le satellite Vert tourne {b|km} plus bas.`],
        question: `À combien de kilomètres au-dessus de la planète tourne le satellite Vert ?`,
        labels: { grand: 'satellite Rouge', petit: 'satellite Vert' },
        juste: `Le satellite Vert tourne à {r} km au-dessus de la planète.`,
        fausses: [`Le satellite Rouge tourne à {r} km au-dessus de la planète.`, `Le satellite Vert tourne {r} km plus bas que le Rouge.`],
        unite: 'km',
      }) },

    { id: 'plusmoins-2-084', structure: 'CMoins', themes: ['voyage', 'nature'], niveaux: [3], limites: { a: [3000, 9999], r: [1000, 9999] },
      texte: A => ({
        phrases: [`Hier, pendant la randonnée, ${A.n} a fait {a|pas}.`, `Aujourd'hui, ${A.n} a fait {b|pas} de moins qu'hier.`],
        question: `Combien de pas ${A.n} a-t-${A.il} faits aujourd'hui ?`,
        labels: { grand: 'hier', petit: "aujourd'hui" },
        juste: `Aujourd'hui, ${A.n} a fait {r} pas.`,
        fausses: [`Hier, ${A.n} a fait {r} pas.`, `Aujourd'hui, ${A.n} a fait {r} pas de moins qu'hier.`],
      }) },

    { id: 'plusmoins-2-085', structure: 'CMoins', themes: ['animaux', 'nature'],
      texte: A => ({
        phrases: [`Dans le jardin ${A.de}, il y a deux ruches.`, `Dans la ruche jaune, il y a {a|abeilles}.`, `Dans la ruche verte, il y a {b|abeilles} de moins.`],
        question: `Combien d'abeilles y a-t-il dans la ruche verte ?`,
        labels: { grand: 'ruche jaune', petit: 'ruche verte' },
        juste: `Il y a {r} abeilles dans la ruche verte.`,
        fausses: [`Il y a {r} abeilles dans la ruche jaune.`, `Il y a {r} abeilles de moins dans la ruche verte.`],
      }) },

    // =========================================================================
    // CInvP — « a, c'est b de plus que… » : on cherche le plus petit (a − b)
    // Les mots « de plus » poussent à additionner : il faut soustraire.
    // =========================================================================
    { id: 'plusmoins-2-086', structure: 'CInvP', themes: ['espace', 'voyage'],
      texte: (A, B) => ({
        phrases: [`Cette semaine, la fusée ${A.de} a parcouru {a|km}.`, `C'est {b|km} de plus que la fusée ${B.de}.`],
        question: `Combien de kilomètres la fusée ${B.de} a-t-elle parcourus cette semaine ?`,
        labels: { grand: A.n, petit: B.n },
        juste: `Cette semaine, la fusée ${B.de} a parcouru {r} km.`,
        fausses: [`Cette semaine, la fusée ${A.de} a parcouru {r} km.`, `La fusée ${B.de} a parcouru {r} km de plus que la fusée ${A.de}.`],
        unite: 'km',
      }) },

    { id: 'plusmoins-2-087', structure: 'CInvP', themes: ['animaux'],
      texte: () => ({
        phrases: [`Cet été, le zoo du Nord a accueilli {a|visiteurs}.`, `C'est {b|visiteurs} de plus que le zoo du Sud.`],
        question: `Combien de visiteurs le zoo du Sud a-t-il accueillis cet été ?`,
        labels: { grand: 'zoo du Nord', petit: 'zoo du Sud' },
        juste: `Cet été, le zoo du Sud a accueilli {r} visiteurs.`,
        fausses: [`Cet été, le zoo du Nord a accueilli {r} visiteurs.`, `Le zoo du Sud a accueilli {r} visiteurs de plus que le zoo du Nord.`],
      }) },

    { id: 'plusmoins-2-088', structure: 'CInvP', themes: ['nature', 'espace'],
      texte: (A, B) => ({
        phrases: [`Avec sa machine à semer, ${A.n} a semé {a|graines lumineuses}.`, `C'est {b|graines} de plus ${B.que}.`],
        question: `Combien de graines ${B.n} a-t-${B.il} semées ?`,
        labels: { grand: A.n, petit: B.n },
        juste: `${B.n} a semé {r} graines.`,
        fausses: [`${A.n} a semé {r} graines.`, `${B.n} a semé {r} graines de plus ${A.que}.`],
      }) },

    { id: 'plusmoins-2-089', structure: 'CInvP', themes: ['voyage'],
      texte: () => ({
        phrases: [`Aujourd'hui, le train Éclair a transporté {a|voyageurs}.`, `C'est {b|voyageurs} de plus que le train Tortue.`],
        question: `Combien de voyageurs le train Tortue a-t-il transportés aujourd'hui ?`,
        labels: { grand: 'train Éclair', petit: 'train Tortue' },
        juste: `Aujourd'hui, le train Tortue a transporté {r} voyageurs.`,
        fausses: [`Aujourd'hui, le train Éclair a transporté {r} voyageurs.`, `Le train Tortue a transporté {r} voyageurs de plus que le train Éclair.`],
      }) },

    { id: 'plusmoins-2-090', structure: 'CInvP', themes: ['animaux', 'nature'],
      texte: A => ({
        phrases: [`${A.n} observe deux fourmilières.`, `La fourmilière rouge compte {a|fourmis}.`, `C'est {b|fourmis} de plus que la fourmilière noire.`],
        question: `Combien de fourmis la fourmilière noire compte-t-elle ?`,
        labels: { grand: 'fourmilière rouge', petit: 'fourmilière noire' },
        juste: `La fourmilière noire compte {r} fourmis.`,
        fausses: [`La fourmilière rouge compte {r} fourmis.`, `La fourmilière noire compte {r} fourmis de plus que la rouge.`],
      }) },

    // =========================================================================
    // CInvM — « a, c'est b de moins que… » : on cherche le plus grand (a + b)
    // Les mots « de moins » poussent à soustraire : il faut additionner.
    // =========================================================================
    { id: 'plusmoins-2-091', structure: 'CInvM', themes: ['jeux'],
      texte: (A, B) => ({
        phrases: [`Au jeu de la pêche aux étoiles, ${A.n} marque {a|points}.`, `C'est {b|points} de moins ${B.que}.`],
        question: `Combien de points ${B.n} marque-t-${B.il} ?`,
        labels: { grand: B.n, petit: A.n },
        juste: `${B.n} marque {r} points.`,
        fausses: [`${A.n} marque {r} points.`, `${B.n} marque {r} points de moins ${A.que}.`],
      }) },

    { id: 'plusmoins-2-092', structure: 'CInvM', themes: ['espace', 'voyage'],
      texte: () => ({
        phrases: [`Le phare spatial Bleu est à {a|km} de la planète.`, `C'est {b|km} de moins que le phare spatial Rose.`],
        question: `À combien de kilomètres de la planète se trouve le phare spatial Rose ?`,
        labels: { grand: 'phare Rose', petit: 'phare Bleu' },
        juste: `Le phare spatial Rose est à {r} km de la planète.`,
        fausses: [`Le phare spatial Bleu est à {r} km de la planète.`, `Le phare spatial Rose est {r} km plus près de la planète.`],
        unite: 'km',
      }) },

    { id: 'plusmoins-2-093', structure: 'CInvM', themes: ['animaux'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(400, 900), b: rnd(700, 2000) }),
      texte: A => ({
        phrases: [`${A.n} visite la maison des animaux de la rivière.`, `Le crocodile pèse {a|kg}.`, `C'est {b|kg} de moins que l'hippopotame.`],
        question: `Combien pèse l'hippopotame ?`,
        labels: { grand: "l'hippopotame", petit: 'le crocodile' },
        juste: `L'hippopotame pèse {r} kg.`,
        fausses: [`Le crocodile pèse {r} kg.`, `L'hippopotame pèse {r} kg de moins que le crocodile.`],
        unite: 'kg',
      }) },

    { id: 'plusmoins-2-094', structure: 'CInvM', themes: ['nature', 'voyage'],
      texte: A => ({
        phrases: [`${A.n} choisit une balade en forêt.`, `Le sentier du Lac mesure {a|mètres}.`, `C'est {b|mètres} de moins que le sentier de la Cascade.`],
        question: `Combien de mètres mesure le sentier de la Cascade ?`,
        labels: { grand: 'la Cascade', petit: 'le Lac' },
        juste: `Le sentier de la Cascade mesure {r} mètres.`,
        fausses: [`Le sentier du Lac mesure {r} mètres.`, `Le sentier de la Cascade est plus court de {r} mètres.`],
      }) },

    { id: 'plusmoins-2-095', structure: 'CInvM', themes: ['voyage'], plafonds: { 3: 4000 },
      texte: (A, B) => ({
        phrases: [`Pendant les vacances, ${A.n} a parcouru {a|km} en train.`, `C'est {b|km} de moins ${B.que}.`],
        question: `Combien de kilomètres ${B.n} a-t-${B.il} parcourus pendant les vacances ?`,
        labels: { grand: B.n, petit: A.n },
        juste: `${B.n} a parcouru {r} km pendant les vacances.`,
        fausses: [`${A.n} a parcouru {r} km pendant les vacances.`, `${B.n} a parcouru {r} km de moins ${A.que}.`],
        unite: 'km',
      }) },

    // =========================================================================
    // Compléments : petits nombres pour les grades 1-2, et quelques grade 2
    // =========================================================================
    { id: 'plusmoins-2-096', structure: 'CT', themes: ['animaux', 'nature'], niveaux: [1, 2], plafonds: { 1: 99, 2: 400 },
      texte: A => ({
        phrases: [`À la ferme, ${A.n} donne du grain aux poules et aux canards.`, `Il y a {a|poules} et {b|canards}.`],
        question: `Combien d'oiseaux ${A.n} nourrit-${A.il} en tout ?`,
        labels: { tout: 'tous les oiseaux', p1: 'poules', p2: 'canards' },
        juste: `${A.n} nourrit {r} oiseaux en tout.`,
        fausses: [`${A.n} nourrit {r} poules.`, `${A.n} nourrit {r} canards.`],
      }) },

    { id: 'plusmoins-2-097', structure: 'CT', themes: ['espace', 'voyage'], niveaux: [1, 2], plafonds: { 1: 99, 2: 400 },
      texte: A => ({
        phrases: [`Avant le décollage, ${A.n} range les provisions dans la fusée.`, `${A.Il} range {a|boîtes de soupe} et {b|boîtes de jus de fruits}.`],
        question: `Combien de boîtes ${A.n} range-t-${A.il} en tout ?`,
        labels: { tout: 'toutes les boîtes', p1: 'soupe', p2: 'jus de fruits' },
        juste: `${A.n} range {r} boîtes en tout.`,
        fausses: [`${A.n} range {r} boîtes de soupe.`, `${A.n} range {r} boîtes de jus de fruits.`],
      }) },

    { id: 'plusmoins-2-098', structure: 'TG', themes: ['nature'], niveaux: [1], plafonds: { 1: 60 },
      texte: A => ({
        phrases: [`${A.n} arrose le grand rosier du parc.`, `Le matin, le rosier a {a|roses}.`, `L'après-midi, {b|nouvelles roses} s'ouvrent au soleil.`],
        question: `Combien de roses le rosier a-t-il le soir ?`,
        labels: { tout: 'le soir', p1: 'le matin', p2: 'nouvelles roses' },
        juste: `Le soir, le rosier a {r} roses.`,
        fausses: [`L'après-midi, {r} nouvelles roses se sont ouvertes.`, `Le matin, le rosier avait {r} roses.`],
      }) },

    { id: 'plusmoins-2-099', structure: 'TP', themes: ['animaux', 'espace'], niveaux: [1, 2], plafonds: { 1: 99, 2: 250 },
      texte: () => ({
        phrases: [`Dans la fusée, le bol d'Alvin contient {a|croquettes}.`, `Alvin a très faim et mange {b|croquettes}.`],
        question: `Combien de croquettes reste-t-il dans le bol ?`,
        labels: { tout: 'dans le bol', p1: 'mangées', p2: 'qui restent' },
        juste: `Il reste {r} croquettes dans le bol.`,
        fausses: [`Alvin a mangé {r} croquettes.`, `Au début, le bol contenait {r} croquettes.`],
      }) },

    { id: 'plusmoins-2-100', structure: 'TP', themes: ['jeux'], niveaux: [1, 2], plafonds: { 1: 99, 2: 300 },
      texte: (A, B) => ({
        phrases: [`${A.n} a {a|billes de lune} dans son sac.`, `Pendant la partie contre ${B.n}, ${A.n} perd {b|billes}.`],
        question: `Combien de billes reste-t-il à ${A.n} ?`,
        labels: { tout: 'au début', p1: 'perdues', p2: 'qui restent' },
        juste: `Il reste {r} billes à ${A.n}.`,
        fausses: [`${A.n} a perdu {r} billes.`, `Au début, ${A.n} avait {r} billes.`],
      }) },

    { id: 'plusmoins-2-101', structure: 'TG', themes: ['animaux', 'espace'], niveaux: [1, 2], plafonds: { 1: 99, 2: 250 }, condition: v => v.b < v.a,
      texte: A => ({
        phrases: [`${A.n} aide au refuge des chats de l'espace.`, `Le refuge accueille {a|chats}.`, `Cette semaine, {b|chats} arrivent au refuge.`],
        question: `Combien de chats y a-t-il maintenant au refuge ?`,
        labels: { tout: 'maintenant', p1: 'avant', p2: 'arrivés' },
        juste: `Il y a maintenant {r} chats au refuge.`,
        fausses: [`Cette semaine, {r} chats sont arrivés au refuge.`, `Avant, il y avait {r} chats au refuge.`],
      }) },

    { id: 'plusmoins-2-102', structure: 'CT', themes: ['voyage'], niveaux: [1, 2], plafonds: { 1: 99, 2: 500 },
      texte: A => ({
        phrases: [`${A.n} aide le pilote à compter les passagers.`, `Dans l'avion, il y a {a|adultes} et {b|enfants}.`],
        question: `Combien de passagers y a-t-il dans l'avion ?`,
        labels: { tout: 'tous les passagers', p1: 'adultes', p2: 'enfants' },
        juste: `Il y a {r} passagers dans l'avion.`,
        fausses: [`Il y a {r} adultes dans l'avion.`, `Il y a {r} enfants dans l'avion.`],
      }) },

    { id: 'plusmoins-2-103', structure: 'TP', themes: ['animaux', 'nature'], niveaux: [1], plafonds: { 1: 60 },
      texte: () => ({
        phrases: [`Sur les branches du grand arbre, il y a {a|oiseaux}.`, `Alvin passe sous l'arbre et {b|oiseaux} s'envolent.`],
        question: `Combien d'oiseaux reste-t-il sur les branches ?`,
        labels: { tout: 'au début', p1: 'envolés', p2: 'qui restent' },
        juste: `Il reste {r} oiseaux sur les branches.`,
        fausses: [`Quand Alvin passe, {r} oiseaux s'envolent.`, `Au début, il y avait {r} oiseaux sur les branches.`],
      }) },

    { id: 'plusmoins-2-104', structure: 'TG', themes: ['espace'], niveaux: [1], plafonds: { 1: 40 },
      texte: () => ({
        phrases: [`Dans la station spatiale, il y a {a|astronautes}.`, `Une navette amène {b|nouveaux astronautes}.`],
        question: `Combien d'astronautes y a-t-il maintenant dans la station ?`,
        labels: { tout: 'maintenant', p1: 'avant', p2: 'arrivés' },
        juste: `Il y a maintenant {r} astronautes dans la station.`,
        fausses: [`La navette amène {r} astronautes.`, `Avant la navette, il y avait {r} astronautes dans la station.`],
      }) },

    { id: 'plusmoins-2-105', structure: 'CE', themes: ['jeux', 'espace'], niveaux: [2], plafonds: { 2: 400 },
      texte: (A, B) => ({
        phrases: [`${A.n} et ${B.n} collectionnent les cartes de planètes.`, `${A.n} a {a|cartes}.`, `${B.n} a {b|cartes}.`],
        question: `Combien de cartes ${B.n} a-t-${B.il} de plus ${A.que} ?`,
        labels: { grand: B.n, petit: A.n },
        juste: `${B.n} a {r} cartes de plus ${A.que}.`,
        fausses: [`${B.n} a {r} cartes.`, `${A.n} et ${B.n} ont {r} cartes en tout.`],
      }) },

    { id: 'plusmoins-2-106', structure: 'CPlus', themes: ['espace', 'ecole'], niveaux: [2], plafonds: { 2: 600 },
      texte: (A, B) => ({
        phrases: [`${A.n} a lu {a|pages} du grand livre des planètes.`, `${B.n} a lu {b|pages} de plus ${A.que}.`],
        question: `Combien de pages ${B.n} a-t-${B.il} lues ?`,
        labels: { grand: B.n, petit: A.n },
        juste: `${B.n} a lu {r} pages.`,
        fausses: [`${A.n} a lu {r} pages.`, `${B.n} a lu {r} pages de plus ${A.que}.`],
      }) },

    { id: 'plusmoins-2-107', structure: 'TTg', themes: ['jeux', 'voyage'], niveaux: [2], plafonds: { 2: 600 },
      texte: A => ({
        phrases: [`Au début des vacances, ${A.n} avait {a|cartes de planètes}.`, `Pendant les vacances, ${A.n} gagne des cartes en jouant avec ses amis.`, `À la fin des vacances, ${A.n} a {b|cartes de planètes}.`],
        question: `Combien de cartes ${A.n} a-t-${A.il} gagnées pendant les vacances ?`,
        labels: { tout: 'à la fin', p1: 'au début', p2: 'gagnées' },
        juste: `${A.n} a gagné {r} cartes pendant les vacances.`,
        fausses: [`À la fin des vacances, ${A.n} a {r} cartes.`, `Au début des vacances, ${A.n} avait {r} cartes.`],
      }) },

    { id: 'plusmoins-2-108', structure: 'TTp', themes: ['animaux', 'nature'], plafonds: { 2: 999, 3: 6000 },
      texte: () => ({
        phrases: [`Au printemps, le lac des Roseaux contient {a|poissons}.`, `Pendant l'été, les pélicans pêchent des poissons dans le lac.`, `À la fin de l'été, il reste {b|poissons} dans le lac.`],
        question: `Combien de poissons les pélicans ont-ils pêchés pendant l'été ?`,
        labels: { tout: 'au printemps', p1: 'pêchés', p2: "fin de l'été" },
        juste: `Pendant l'été, les pélicans ont pêché {r} poissons.`,
        fausses: [`À la fin de l'été, il reste {r} poissons dans le lac.`, `Au printemps, le lac contenait {r} poissons.`],
      }) },

    { id: 'plusmoins-2-109', structure: 'CMoins', themes: ['nature'],
      texte: A => ({
        phrases: [`Au printemps, ${A.n} admire deux cerisiers en fleurs.`, `Le cerisier rose a {a|fleurs}.`, `Le cerisier blanc a {b|fleurs} de moins.`],
        question: `Combien de fleurs le cerisier blanc a-t-il ?`,
        labels: { grand: 'cerisier rose', petit: 'cerisier blanc' },
        juste: `Le cerisier blanc a {r} fleurs.`,
        fausses: [`Le cerisier rose a {r} fleurs.`, `Le cerisier blanc a {r} fleurs de moins.`],
      }) },

    { id: 'plusmoins-2-110', structure: 'CP', themes: ['animaux'], niveaux: [2], plafonds: { 2: 400 },
      texte: () => ({
        phrases: [`Dans la grande volière du zoo, il y a {a|oiseaux}.`, `Parmi ces oiseaux, il y a {b|perruches}.`, `Tous les autres oiseaux sont des canaris.`],
        question: `Combien de canaris y a-t-il dans la volière ?`,
        labels: { tout: 'tous les oiseaux', p1: 'perruches', p2: 'canaris' },
        juste: `Il y a {r} canaris dans la volière.`,
        fausses: [`Il y a {r} perruches dans la volière.`, `Il y a {r} oiseaux dans la volière.`],
      }) },
  ];

  modeles.forEach(m => {
    if (m.plafonds || m.condition) m.nombres = tirage(m.structure, m.plafonds, m.condition);
  });
  Problemes.ajouter('plusmoins', modeles);

  // Phrases pièges (un nombre inutile) aux couleurs de l'espace
  Problemes.ajouterPieges('plusmoins', [
    { f: () => `Dans le ciel de cette planète, il y a {d|lunes}.`, v: (niv, rnd) => rnd(2, 7) },
    { f: () => `Il y a {d|cratères} sur la petite lune.`, v: (niv, rnd) => (niv === 1 ? rnd(12, 60) : niv === 2 ? rnd(120, 800) : rnd(1200, 6000)) },
    { f: () => `Alvin a déjà visité {d|planètes}.`, v: (niv, rnd) => rnd(3, 9) },
  ]);
})();
