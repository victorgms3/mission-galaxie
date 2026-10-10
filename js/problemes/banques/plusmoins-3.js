'use strict';
/*
 * Plus ou moins — banque 3 : des problèmes qu'on ne peut PAS résoudre en devinant l'opération d'après un mot-clé.
 *  - 001-013 : mot-piège (« gagne », « de plus », « perd »… mais il faut faire l'opération contraire) ;
 *  - 014-024 : réponses « Qui… ? » et « Oui / Non » (il faut calculer, puis comparer) ;
 *  - 025-031 : il manque une donnée (« On ne peut pas savoir ») ;
 *  - 032-044 : problèmes ordinaires, avec des phrases pièges dans la même unité (piegesContexte).
 * Les modèles à mot-piège sans nombres() sont aussi joués au grade 1 (nombres ≤ 30) : ils restent vraisemblables.
 */
(() => {
  // Nombre entier tiré selon le grade : g1, g2, g3 = [min, max]
  const selon = (g1, g2, g3) => (niv, rnd) => {
    const [lo, hi] = niv <= 1 ? g1 : niv === 2 ? g2 : (g3 || g2);
    return rnd(lo, hi);
  };

  Problemes.ajouter('plusmoins', [
    // =========================================================================
    // MOT-PIÈGE : le mot de l'énoncé fait penser à la mauvaise opération
    // =========================================================================
    // « gagne » mais on cherche l'état de départ : soustraction
    { id: 'plusmoins-3-001', structure: 'TIg', themes: ['jeux', 'ecole'], max: 200,
      piegesContexte: [
        { f: (A, B) => `${B.n} a {d|billes} dans sa poche.`, v: selon([4, 30], [12, 150], [12, 150]) },
        { f: A => `Le sac de billes ${A.de} peut contenir {d|billes}.`, v: selon([40, 60], [150, 200], [150, 200]) },
      ],
      texte: A => ({
        phrases: [`À la récré, ${A.n} gagne {a|billes}.`, `Après la récré, ${A.n} a {b|billes} dans son sac.`],
        question: `Combien de billes ${A.n} avait-${A.il} avant la récré ?`,
        labels: { tout: 'après', p1: 'avant', p2: 'gagnées' },
        juste: `Avant la récré, ${A.n} avait {r} billes.`,
        fausses: [`À la récré, ${A.n} a gagné {r} billes.`, `Après la récré, ${A.n} a {r} billes.`],
        unite: 'billes',
      }) },
    // « perd » mais on cherche l'état de départ : addition
    { id: 'plusmoins-3-002', structure: 'TIp', themes: ['jeux', 'espace'], max: 2000,
      piegesContexte: [
        { f: (A, B) => `${B.n} a {d|points} au jeu des planètes.`, v: selon([4, 30], [50, 900], [500, 2000]) },
        { f: () => `Pour gagner la partie, il faut {d|points}.`, v: selon([40, 50], [900, 999], [2000, 2500]) },
      ],
      texte: A => ({
        phrases: [`Au jeu des planètes, ${A.n} perd {a|points} en tombant dans un trou noir.`, `${A.n} a maintenant {b|points}.`],
        question: `Combien de points ${A.n} avait-${A.il} avant de tomber dans le trou noir ?`,
        labels: { tout: 'avant', p1: 'perdus', p2: 'maintenant' },
        juste: `Avant de tomber dans le trou noir, ${A.n} avait {r} points.`,
        fausses: [`Dans le trou noir, ${A.n} a perdu {r} points.`, `Maintenant, ${A.n} a {r} points.`],
        unite: 'points',
      }) },
    // « de plus » mais on cherche le plus petit : soustraction
    { id: 'plusmoins-3-003', structure: 'CInvP', themes: ['jeux'], max: 500,
      piegesContexte: [
        { f: () => `Au magasin de jouets, une pochette d'images coûte {d|€}.`, v: selon([2, 5], [2, 5], [2, 5]) },
        { f: A => `Le nouvel album ${A.de} peut contenir {d|images}.`, v: selon([40, 80], [400, 600], [500, 800]) },
      ],
      texte: (A, B) => ({
        phrases: [`${A.n} a {a|images} dans sa collection.`, `${A.n} a {b|images} de plus ${B.que}.`],
        question: `Combien d'images ${B.n} a-t-${B.il} ?`,
        labels: { grand: A.n, petit: B.n },
        juste: `${B.n} a {r} images.`,
        fausses: [`${B.n} a {r} images de plus ${A.que}.`, `${A.n} et ${B.n} ont {r} images en tout.`],
        unite: 'images',
      }) },
    // « de moins » mais on cherche le plus grand : addition
    { id: 'plusmoins-3-004', structure: 'CInvM', themes: ['sport'], max: 300,
      piegesContexte: [
        { f: A => `L'équipe ${A.de} a joué {d|matchs} cette saison.`, v: selon([5, 25], [10, 30], [10, 40]) },
        { f: () => `Le meilleur joueur du club a marqué {d|paniers} l'an dernier.`, v: selon([20, 40], [150, 300], [150, 300]) },
      ],
      texte: (A, B) => ({
        phrases: [`Au basket, ${A.n} a marqué {a|paniers} cette saison.`, `${A.n} a marqué {b|paniers} de moins ${B.que}.`],
        question: `Combien de paniers ${B.n} a-t-${B.il} marqués cette saison ?`,
        labels: { grand: B.n, petit: A.n },
        juste: `Cette saison, ${B.n} a marqué {r} paniers.`,
        fausses: [`Cette saison, ${A.n} a marqué {r} paniers.`, `${B.n} a marqué {r} paniers de moins ${A.que}.`],
        unite: 'paniers',
      }) },
    // « de plus » dans la question mais c'est une soustraction (comparaison)
    { id: 'plusmoins-3-005', structure: 'CE', themes: ['ecole'], max: 400,
      piegesContexte: [
        { f: () => `Le dictionnaire de la classe a {d|pages}.`, v: selon([40, 99], [400, 999], [500, 999]) },
        { f: A => `La maîtresse ${A.de} a lu {d|pages} pendant les vacances.`, v: selon([31, 60], [100, 400], [200, 400]) },
      ],
      texte: (A, B) => ({
        phrases: [`${A.n} a lu {a|pages} de son livre.`, `${B.n} a lu {b|pages} de son livre.`],
        question: `Combien de pages ${B.n} a-t-${B.il} lues de plus ${A.que} ?`,
        labels: { grand: B.n, petit: A.n },
        juste: `${B.n} a lu {r} pages de plus ${A.que}.`,
        fausses: [`${B.n} a lu {r} pages.`, `${A.n} et ${B.n} ont lu {r} pages en tout.`],
        unite: 'pages',
      }) },
    // « gagnés » mais on connaît le début et la fin : soustraction
    { id: 'plusmoins-3-006', structure: 'TTg', themes: ['jeux'], max: 500,
      piegesContexte: [
        { f: (A, B) => `${B.n} termine la partie avec {d|jetons}.`, v: selon([4, 30], [20, 500], [100, 500]) },
        { f: () => `La boîte du jeu contient {d|jetons} en tout.`, v: selon([50, 60], [500, 600], [500, 600]) },
      ],
      texte: A => ({
        phrases: [`${A.n} commence la partie avec {a|jetons}.`, `À la fin de la partie, ${A.n} a {b|jetons}.`],
        question: `Combien de jetons ${A.n} a-t-${A.il} gagnés pendant la partie ?`,
        labels: { tout: 'à la fin', p1: 'au début', p2: 'gagnés' },
        juste: `${A.n} a gagné {r} jetons pendant la partie.`,
        fausses: [`À la fin de la partie, ${A.n} a {r} jetons.`, `${A.n} commence la partie avec {r} jetons.`],
        unite: 'jetons',
      }) },
    // « reçoit » mais on cherche ce qu'il y avait avant : soustraction
    { id: 'plusmoins-3-007', structure: 'TIg', themes: ['ecole', 'jeux'], max: 120,
      piegesContexte: [
        { f: (A, B) => `${B.n} a {d|livres} dans sa chambre.`, v: selon([4, 30], [12, 120], [12, 120]) },
        { f: A => `L'étagère ${A.de} peut porter {d|livres}.`, v: selon([35, 50], [130, 150], [130, 150]) },
      ],
      texte: A => ({
        phrases: [`Pour son anniversaire, ${A.n} reçoit {a|livres}.`, `Maintenant, ${A.n} a {b|livres} dans sa chambre.`],
        question: `Combien de livres ${A.n} avait-${A.il} avant son anniversaire ?`,
        labels: { tout: 'maintenant', p1: 'avant', p2: 'reçus' },
        juste: `Avant son anniversaire, ${A.n} avait {r} livres.`,
        fausses: [`Pour son anniversaire, ${A.n} reçoit {r} livres.`, `Maintenant, ${A.n} a {r} livres.`],
        unite: 'livres',
      }) },
    // « mange », « il reste » mais on cherche le début : addition
    { id: 'plusmoins-3-008', structure: 'TIp', themes: ['cuisine'], max: 200,
      piegesContexte: [
        { f: () => `Le cerisier du voisin porte {d|cerises}.`, v: selon([40, 90], [200, 400], [200, 400]) },
        { f: (A, B) => `${B.n} a cueilli {d|cerises} dans le jardin de sa tante.`, v: selon([4, 30], [12, 150], [12, 150]) },
      ],
      texte: A => ({
        phrases: [`${A.n} mange {a|cerises}.`, `Il reste {b|cerises} dans le panier ${A.de}.`],
        question: `Combien de cerises y avait-il dans le panier au début ?`,
        labels: { tout: 'au début', p1: 'mangées', p2: 'qui restent' },
        juste: `Au début, il y avait {r} cerises dans le panier.`,
        fausses: [`${A.n} a mangé {r} cerises.`, `Il reste {r} cerises dans le panier.`],
        unite: 'cerises',
      }) },
    // « de moins » mais on cherche le plus grand : addition
    { id: 'plusmoins-3-009', structure: 'CInvM', themes: ['espace', 'voyage'], max: 2000,
      piegesContexte: [
        { f: () => `La fusée verte a parcouru {d|kilomètres}.`, v: selon([5, 30], [100, 999], [1000, 2000]) },
        { f: () => `Le réservoir de la fusée bleue contient {d|litres de carburant}.`, v: selon([10, 40], [100, 500], [500, 900]) },
      ],
      texte: () => ({
        phrases: [`La fusée bleue a parcouru {a|kilomètres}.`, `La fusée bleue a parcouru {b|kilomètres} de moins que la fusée rouge.`],
        question: `Combien de kilomètres la fusée rouge a-t-elle parcourus ?`,
        labels: { grand: 'fusée rouge', petit: 'fusée bleue' },
        juste: `La fusée rouge a parcouru {r} kilomètres.`,
        fausses: [`La fusée bleue a parcouru {r} kilomètres.`, `La fusée rouge a parcouru {r} kilomètres de moins que la fusée bleue.`],
        unite: 'kilomètres',
      }) },
    // « de plus » mais on cherche le plus léger : soustraction (grade 1, petits nombres)
    { id: 'plusmoins-3-010', structure: 'CInvP', themes: ['animaux'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(18, 35), b: rnd(5, 13) }),
      piegesContexte: [
        { f: A => `${A.n} pèse {d|kilos}.`, v: (niv, rnd) => rnd(24, 34) },
        { f: () => `Le sac de croquettes pèse {d|kilos}.`, v: (niv, rnd) => rnd(2, 15) },
      ],
      texte: A => ({
        phrases: [`Le chien ${A.de} pèse {a|kilos}.`, `Le chien pèse {b|kilos} de plus que le chat ${A.de}.`],
        question: `Combien de kilos pèse le chat ${A.de} ?`,
        labels: { grand: 'le chien', petit: 'le chat' },
        juste: `Le chat ${A.de} pèse {r} kilos.`,
        fausses: [`Le chat pèse {r} kilos de plus que le chien.`, `Le chien et le chat pèsent {r} kilos ensemble.`],
        unite: 'kilos',
      }) },
    // « ramassés » : on connaît avant et après, il faut soustraire
    { id: 'plusmoins-3-011', structure: 'TTg', themes: ['espace'], max: 2000,
      piegesContexte: [
        { f: () => `Sur Mars, le robot Bip a ramassé {d|cristaux}.`, v: selon([4, 30], [50, 900], [500, 2000]) },
        { f: () => `La soute de la fusée peut contenir {d|cristaux}.`, v: selon([50, 90], [1000, 1500], [2500, 3000]) },
      ],
      texte: () => ({
        phrases: [`Avant la promenade sur Mars, Alvin a {a|cristaux} dans sa fusée.`, `Après la promenade, Alvin a {b|cristaux} dans sa fusée.`],
        question: `Combien de cristaux Alvin a-t-il ramassés sur Mars ?`,
        labels: { tout: 'après', p1: 'avant', p2: 'ramassés' },
        juste: `Alvin a ramassé {r} cristaux sur Mars.`,
        fausses: [`Après la promenade, Alvin a {r} cristaux.`, `Avant la promenade, Alvin avait {r} cristaux.`],
        unite: 'cristaux',
      }) },
    { id: 'plusmoins-3-012', structure: 'CInvP', themes: ['ecole', 'nature'], max: 2000,
      piegesContexte: [
        { f: () => `La classe de CP a récolté {d|bouchons}.`, v: selon([4, 30], [50, 900], [500, 2000]) },
        { f: () => `Le grand carton de l'école peut contenir {d|bouchons}.`, v: selon([60, 90], [1000, 1500], [2500, 3000]) },
      ],
      texte: () => ({
        phrases: [`Pour une association, la classe de CE2 a récolté {a|bouchons}.`, `La classe de CE2 a récolté {b|bouchons} de plus que la classe de CM1.`],
        question: `Combien de bouchons la classe de CM1 a-t-elle récoltés ?`,
        labels: { grand: 'CE2', petit: 'CM1' },
        juste: `La classe de CM1 a récolté {r} bouchons.`,
        fausses: [`La classe de CM1 a récolté {r} bouchons de plus que la classe de CE2.`, `Les deux classes ont récolté {r} bouchons en tout.`],
        unite: 'bouchons',
      }) },
    // « montent » fait penser à + mais les places libres diminuent
    { id: 'plusmoins-3-013', structure: 'TP', themes: ['voyage'], max: 60, niveaux: [1, 2],
      piegesContexte: [
        { f: () => `Le chauffeur du bus travaille depuis {d|ans}.`, v: (niv, rnd) => rnd(3, 25) },
        { f: () => `À l'arrêt de la mairie, {d|voyageurs} attendent le bus numéro 5.`, v: selon([3, 12], [3, 12]) },
      ],
      texte: () => ({
        phrases: [`Dans le bus numéro 3, il reste {a|places libres}.`, `À l'arrêt de la mairie, {b|voyageurs} montent dans le bus numéro 3.`],
        question: `Combien de places libres reste-t-il dans le bus numéro 3 ?`,
        labels: { tout: 'avant', p1: 'montés', p2: 'libres après' },
        juste: `Il reste {r} places libres dans le bus numéro 3.`,
        fausses: [`Il y a {r} voyageurs qui montent dans le bus.`, `Avant l'arrêt, il restait {r} places libres.`],
        unite: 'places',
      }) },

    // =========================================================================
    // QUI… ? et OUI / NON : on calcule, puis on compare
    // =========================================================================
    { id: 'plusmoins-3-014', structure: 'CT', reponse: 'qui', max: 500, themes: ['jeux'],
      texte: (A, B) => ({
        phrases: [`Dans sa collection, ${A.n} a {a|cartes de foot} et {b|cartes de dinosaures}.`, `${B.n} a {c|cartes} dans sa collection.`],
        question: 'Qui a le plus de cartes ?',
        labels: { tout: `les cartes ${A.de}`, p1: 'foot', p2: 'dinosaures' },
        candidats: [
          { nom: A.n, k: 'r', phrase: `C'est ${A.n} qui a le plus de cartes : {r} cartes.` },
          { nom: B.n, k: 'c', phrase: `C'est ${B.n} qui a le plus de cartes : {c} cartes.` },
        ],
        plus: true,
        fausses: [`${A.n} et ${B.n} ont autant de cartes.`],
        unite: 'cartes',
      }) },
    // Le matin, A a plus de billes que B… mais après la partie ?
    { id: 'plusmoins-3-015', structure: 'TP', reponse: 'qui', max: 200, themes: ['jeux', 'ecole'],
      texte: (A, B) => ({
        phrases: [`Ce matin, ${A.n} avait {a|billes}.`, `À la récré, ${A.n} a perdu {b|billes}.`, `${B.n} a {c|billes}.`],
        question: 'Qui a le plus de billes maintenant ?',
        labels: { tout: 'ce matin', p1: 'perdues', p2: 'maintenant' },
        candidats: [
          { nom: A.n, k: 'r', phrase: `C'est ${A.n} qui a le plus de billes : {r} billes.` },
          { nom: B.n, k: 'c', phrase: `C'est ${B.n} qui a le plus de billes : {c} billes.` },
        ],
        plus: true,
        fausses: [`${A.n} et ${B.n} ont autant de billes.`],
        unite: 'billes',
      }) },
    { id: 'plusmoins-3-016', structure: 'CT', reponse: 'qui', themes: ['sport'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(5, 20), b: rnd(5, 20) }),
      texte: (A, B) => ({
        phrases: [`Samedi, ${A.n} nage {a|longueurs} à la piscine.`, `Dimanche, ${A.n} nage {b|longueurs}.`, `${B.n} nage {c|longueurs} pendant tout le week-end.`],
        question: 'Qui nage le plus de longueurs pendant le week-end ?',
        labels: { tout: 'le week-end', p1: 'samedi', p2: 'dimanche' },
        candidats: [
          { nom: A.n, k: 'r', phrase: `C'est ${A.n} qui nage le plus : {r} longueurs.` },
          { nom: B.n, k: 'c', phrase: `C'est ${B.n} qui nage le plus : {c} longueurs.` },
        ],
        plus: true,
        fausses: [`${A.n} et ${B.n} nagent autant de longueurs.`],
        unite: 'longueurs',
      }) },
    // Au mini-golf, c'est le plus PETIT nombre de coups qui gagne
    { id: 'plusmoins-3-017', structure: 'CT', reponse: 'qui', themes: ['jeux', 'sport'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(12, 30), b: rnd(12, 30) }),
      texte: (A, B) => ({
        phrases: [`Au mini-golf, le joueur qui fait le moins de coups gagne la partie.`, `${A.n} fait {a|coups} sur le parcours rouge et {b|coups} sur le parcours bleu.`, `${B.n} fait {c|coups} en tout sur les deux parcours.`],
        question: 'Qui gagne la partie de mini-golf ?',
        labels: { tout: `les coups ${A.de}`, p1: 'rouge', p2: 'bleu' },
        candidats: [
          { nom: A.n, k: 'r', phrase: `C'est ${A.n} qui gagne : ${A.n} fait {r} coups.` },
          { nom: B.n, k: 'c', phrase: `C'est ${B.n} qui gagne : ${B.n} fait {c} coups.` },
        ],
        plus: false,
        fausses: [`C'est celui qui fait le plus de coups qui gagne.`],
        unite: 'coups',
      }) },
    { id: 'plusmoins-3-018', structure: 'TP', reponse: 'ouinon', ouiSi: 'plus', themes: ['cuisine'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(12, 30), b: rnd(3, 9) }),
      texte: () => ({
        phrases: [`Le cuisinier de la cantine a {a|œufs}.`, `Pour faire une omelette, le cuisinier casse {b|œufs}.`, `Pour faire les gâteaux du goûter, il faut {c|œufs}.`],
        question: `Après l'omelette, le cuisinier a-t-il assez d'œufs pour faire les gâteaux du goûter ?`,
        labels: { tout: 'au début', p1: 'cassés', p2: 'qui restent' },
        etiquettes: { r: 'Les œufs qui restent', c: 'Pour les gâteaux' },
        oui: `Oui, il reste {r} œufs au cuisinier et il en faut {c} pour les gâteaux.`,
        non: `Non, il reste seulement {r} œufs au cuisinier et il en faut {c} pour les gâteaux.`,
        fausses: [`Le cuisinier casse {r} œufs pour l'omelette.`],
        unite: 'œufs',
      }) },
    { id: 'plusmoins-3-019', structure: 'CT', reponse: 'ouinon', ouiSi: 'moins', themes: ['sport', 'voyage'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(5, 14), b: rnd(5, 14) }),
      texte: A => ({
        phrases: [`Dans l'équipe de foot ${A.de}, il y a {a|filles} et {b|garçons}.`, `Le car du club a {c|places}.`],
        question: `Tous les joueurs de l'équipe ${A.de} peuvent-ils monter dans le car ?`,
        labels: { tout: "toute l'équipe", p1: 'filles', p2: 'garçons' },
        etiquettes: { r: 'Les joueurs', c: 'Les places' },
        oui: `Oui, il y a {r} joueurs et le car a {c} places.`,
        non: `Non, il y a {r} joueurs et le car a seulement {c} places.`,
        fausses: [`Il y a {r} filles dans l'équipe.`],
        unite: 'joueurs',
      }) },
    { id: 'plusmoins-3-020', structure: 'TG', reponse: 'ouinon', ouiSi: 'plus', max: 2000, themes: ['jeux'],
      texte: A => ({
        phrases: [`${A.n} a {a|points} au jeu de la galaxie.`, `En battant le dragon, ${A.n} gagne {b|points}.`, `Pour passer au niveau suivant, il faut {c|points}.`],
        question: `${A.n} peut-${A.il} passer au niveau suivant ?`,
        labels: { tout: 'maintenant', p1: 'au début', p2: 'gagnés' },
        etiquettes: { r: `Les points ${A.de}`, c: 'Points demandés' },
        oui: `Oui, ${A.n} a {r} points et il en faut {c}.`,
        non: `Non, ${A.n} a seulement {r} points et il en faut {c}.`,
        fausses: [`${A.n} gagne {r} points en battant le dragon.`],
        unite: 'points',
      }) },
    { id: 'plusmoins-3-021', structure: 'CE', reponse: 'ouinon', ouiSi: 'plus', max: 500, themes: ['jeux'],
      texte: (A, B) => ({
        phrases: [`${A.n} a {b|points}.`, `${B.n} a {a|points}.`],
        question: `${A.n} a-t-${A.il} plus de {c|points} d'avance sur ${B.n} ?`,
        labels: { grand: A.n, petit: B.n },
        etiquettes: { r: "L'avance", c: 'À comparer' },
        oui: `Oui, ${A.n} a {r} points d'avance : c'est plus que {c}.`,
        non: `Non, ${A.n} a {r} points d'avance : ce n'est pas plus que {c}.`,
        fausses: [`${A.n} et ${B.n} ont le même nombre de points.`],
        unite: 'points',
      }) },
    // « de plus » : il faut calculer les points des Étoiles avant de comparer
    { id: 'plusmoins-3-022', structure: 'CPlus', reponse: 'qui', max: 999, themes: ['sport', 'jeux'],
      texte: () => ({
        phrases: [`L'équipe des Comètes a {a|points}.`, `L'équipe des Étoiles a {b|points} de plus que l'équipe des Comètes.`, `L'équipe des Fusées a {c|points}.`],
        question: 'Quelle équipe a le plus de points : les Étoiles ou les Fusées ?',
        labels: { grand: 'les Étoiles', petit: 'les Comètes' },
        candidats: [
          { nom: 'les Étoiles', k: 'r', phrase: `Ce sont les Étoiles qui ont le plus de points : {r} points.` },
          { nom: 'les Fusées', k: 'c', phrase: `Ce sont les Fusées qui ont le plus de points : {c} points.` },
        ],
        plus: true,
        fausses: [`Ce sont les Comètes qui ont le plus de points.`],
        unite: 'points',
      }) },
    { id: 'plusmoins-3-023', structure: 'TP', reponse: 'qui', max: 80, niveaux: [1, 2], themes: ['voyage'],
      texte: () => ({
        phrases: [`Le bus rouge part avec {a|passagers}.`, `À la gare, {b|passagers} descendent du bus rouge.`, `Le bus vert transporte {c|passagers}.`],
        question: 'Quel bus transporte le moins de passagers après la gare ?',
        labels: { tout: 'au départ', p1: 'descendus', p2: 'après la gare' },
        candidats: [
          { nom: 'le bus rouge', k: 'r', phrase: `C'est le bus rouge qui transporte le moins de passagers : {r} passagers.` },
          { nom: 'le bus vert', k: 'c', phrase: `C'est le bus vert qui transporte le moins de passagers : {c} passagers.` },
        ],
        plus: false,
        fausses: [`Les deux bus transportent autant de passagers.`],
        unite: 'passagers',
      }) },
    { id: 'plusmoins-3-024', structure: 'TP', reponse: 'ouinon', ouiSi: 'moins', max: 200, themes: ['ecole'],
      texte: A => ({
        phrases: [`Le livre ${A.de} a {a|pages}.`, `${A.n} a déjà lu {b|pages}.`, `Ce soir, ${A.n} a le temps de lire {c|pages}.`],
        question: `${A.n} peut-${A.il} finir son livre ce soir ?`,
        labels: { tout: 'tout le livre', p1: 'déjà lues', p2: 'à lire' },
        etiquettes: { r: 'Les pages à lire', c: 'Les pages de ce soir' },
        oui: `Oui, il reste {r} pages à lire et ${A.n} a le temps d'en lire {c}.`,
        non: `Non, il reste {r} pages à lire et ${A.n} a seulement le temps d'en lire {c}.`,
        fausses: [`${A.n} a déjà lu {r} pages.`],
        unite: 'pages',
      }) },

    // =========================================================================
    // IL MANQUE UNE DONNÉE : on ne peut pas savoir
    // =========================================================================
    { id: 'plusmoins-3-025', structure: 'TG', reponse: 'impossible', max: 200, themes: ['jeux'],
      texte: (A, B) => ({
        phrases: [`${A.n} a {a|autocollants} dans son album.`, `Pour son anniversaire, ${B.n} offre des autocollants ${A.a}.`],
        question: `Combien d'autocollants ${A.n} a-t-${A.il} maintenant ?`,
        labels: { tout: 'maintenant', p1: 'au début', p2: 'offerts' },
        manque: `On ne sait pas combien d'autocollants ${B.n} offre ${A.a}.`,
        juste: `On ne peut pas savoir : il manque le nombre d'autocollants offerts par ${B.n}.`,
      }) },
    { id: 'plusmoins-3-026', structure: 'TP', reponse: 'impossible', max: 200, themes: ['cuisine'],
      texte: () => ({
        phrases: [`Ce matin, le boulanger a fait {a|croissants}.`, `Des clients achètent quelques croissants.`],
        question: 'Combien de croissants reste-t-il au boulanger ?',
        labels: { tout: 'au début', p1: 'achetés', p2: 'qui restent' },
        manque: 'On ne sait pas combien de croissants les clients achètent.',
        juste: 'On ne peut pas savoir : il manque le nombre de croissants achetés.',
      }) },
    { id: 'plusmoins-3-027', structure: 'CT', reponse: 'impossible', max: 60, themes: ['sport'],
      texte: A => ({
        phrases: [`À la piscine, ${A.n} nage quelques longueurs le matin.`, `L'après-midi, ${A.n} nage {b|longueurs}.`],
        question: `Combien de longueurs ${A.n} nage-t-${A.il} dans la journée ?`,
        labels: { tout: 'la journée', p1: 'le matin', p2: "l'après-midi" },
        manque: `On ne sait pas combien de longueurs ${A.n} nage le matin.`,
        juste: 'On ne peut pas savoir : il manque le nombre de longueurs du matin.',
      }) },
    { id: 'plusmoins-3-028', structure: 'CE', reponse: 'impossible', themes: ['ecole'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: rnd(115, 129), b: rnd(131, 145) }),
      texte: (A, B) => ({
        phrases: [`${A.n} mesure {b|centimètres}.`, `${B.n} est plus petit${B.e} ${A.que}.`],
        question: `De combien de centimètres ${A.n} est-${A.il} plus grand${A.e} ${B.que} ?`,
        labels: { grand: A.n, petit: B.n },
        manque: `On ne sait pas combien mesure ${B.n}.`,
        juste: `On ne peut pas savoir : il manque la taille ${B.de}.`,
      }) },
    { id: 'plusmoins-3-029', structure: 'TIp', reponse: 'impossible', max: 99, themes: ['jeux'],
      texte: A => ({
        phrases: [`Pendant la partie, ${A.n} perd des billes.`, `Maintenant, ${A.n} a {b|billes}.`],
        question: `Combien de billes ${A.n} avait-${A.il} au début de la partie ?`,
        labels: { tout: 'au début', p1: 'perdues', p2: 'maintenant' },
        manque: `On ne sait pas combien de billes ${A.n} a perdues.`,
        juste: 'On ne peut pas savoir : il manque le nombre de billes perdues.',
      }) },
    { id: 'plusmoins-3-030', structure: 'CPlus', reponse: 'impossible', max: 120, themes: ['espace'],
      texte: () => ({
        phrases: [`La tour de contrôle de la base mesure {a|mètres}.`, `La fusée d'Alvin est plus haute que la tour de contrôle.`],
        question: "Combien de mètres mesure la fusée d'Alvin ?",
        labels: { grand: 'la fusée', petit: 'la tour' },
        manque: 'On ne sait pas de combien de mètres la fusée dépasse la tour.',
        juste: 'On ne peut pas savoir : il manque de combien de mètres la fusée dépasse la tour.',
      }) },
    { id: 'plusmoins-3-031', structure: 'TTg', reponse: 'impossible', max: 200, themes: ['jeux'],
      texte: A => ({
        phrases: [`Au début de la partie, ${A.n} a {a|jetons}.`, `Pendant la partie, ${A.n} gagne des jetons.`],
        question: `Combien de jetons ${A.n} a-t-${A.il} gagnés pendant la partie ?`,
        labels: { tout: 'à la fin', p1: 'au début', p2: 'gagnés' },
        manque: `On ne sait pas combien de jetons ${A.n} a à la fin de la partie.`,
        juste: 'On ne peut pas savoir : il manque le nombre de jetons à la fin de la partie.',
      }) },

    // =========================================================================
    // PROBLÈMES ORDINAIRES avec des pièges dans la même unité
    // =========================================================================
    { id: 'plusmoins-3-032', structure: 'CT', themes: ['ecole', 'cuisine'], max: 400,
      piegesContexte: [
        { f: () => `La classe de CM1 a vendu {d|crêpes} dans la journée.`, v: selon([5, 40], [50, 400], [200, 400]) },
        { f: () => `Le stand de crêpes reste ouvert pendant {d|heures}.`, v: (niv, rnd) => rnd(3, 8) },
      ],
      texte: () => ({
        phrases: [`À la kermesse, la classe de CE2 vend {a|crêpes} le matin.`, `L'après-midi, la classe de CE2 vend {b|crêpes}.`],
        question: 'Peux-tu trouver combien de crêpes la classe de CE2 a vendues dans la journée ?',
        labels: { tout: 'la journée', p1: 'le matin', p2: "l'après-midi" },
        juste: 'La classe de CE2 a vendu {r} crêpes dans la journée.',
        fausses: [`La classe de CE2 a vendu {r} crêpes le matin.`, `La classe de CE2 a vendu {r} crêpes l'après-midi.`],
        unite: 'crêpes',
      }) },
    { id: 'plusmoins-3-033', structure: 'TG', themes: ['sport'], max: 300,
      piegesContexte: [
        { f: () => `Le club de foot a {d|ballons}.`, v: selon([5, 30], [20, 60], [20, 60]) },
        { f: A => `Dans le sac de sport ${A.de}, il y a {d|balles}.`, v: (niv, rnd) => rnd(3, 9) },
      ],
      texte: () => ({
        phrases: [`Le club de tennis a {a|balles}.`, `Le club de tennis achète {b|balles} neuves.`],
        question: 'Combien de balles le club de tennis a-t-il maintenant ?',
        labels: { tout: 'maintenant', p1: 'au début', p2: 'achetées' },
        juste: 'Le club de tennis a maintenant {r} balles.',
        fausses: [`Le club de tennis achète {r} balles neuves.`, `Au début, le club de tennis avait {r} balles.`],
        unite: 'balles',
      }) },
    { id: 'plusmoins-3-034', structure: 'TP', themes: ['espace'], max: 999,
      piegesContexte: [
        { f: (A, B) => `Le vaisseau ${B.de} transporte {d|caisses}.`, v: selon([5, 40], [50, 900], [100, 999]) },
        { f: () => `Sur la planète Zorg, un robot porte {d|caisses} à chaque voyage.`, v: (niv, rnd) => rnd(2, 6) },
      ],
      texte: A => ({
        phrases: [`Le vaisseau ${A.de} transporte {a|caisses de cristaux}.`, `Sur la planète Zorg, ${A.n} décharge {b|caisses}.`],
        question: `Combien de caisses reste-t-il dans le vaisseau ${A.de} ?`,
        labels: { tout: 'au départ', p1: 'déchargées', p2: 'qui restent' },
        juste: `Il reste {r} caisses dans le vaisseau ${A.de}.`,
        fausses: [`${A.n} décharge {r} caisses.`, `Au départ, le vaisseau transportait {r} caisses.`],
        unite: 'caisses',
      }) },
    // « en tout » dans l'énoncé, mais il faut soustraire
    { id: 'plusmoins-3-035', structure: 'CP', themes: ['ecole', 'cuisine'], max: 600,
      piegesContexte: [
        { f: () => `L'école du village voisin compte {d|élèves}.`, v: selon([15, 60], [100, 600], [300, 600]) },
        { f: () => `Le réfectoire de la cantine peut accueillir {d|élèves}.`, v: selon([40, 60], [400, 700], [600, 700]) },
      ],
      texte: A => ({
        phrases: [`En tout, l'école ${A.de} compte {a|élèves}.`, `À midi, {b|élèves} mangent à la cantine.`],
        question: `Combien d'élèves de l'école ${A.de} ne mangent pas à la cantine ?`,
        labels: { tout: 'tous les élèves', p1: 'à la cantine', p2: 'pas à la cantine' },
        juste: `Il y a {r} élèves qui ne mangent pas à la cantine.`,
        fausses: [`Il y a {r} élèves qui mangent à la cantine.`, `L'école compte {r} élèves en tout.`],
        unite: 'élèves',
      }) },
    { id: 'plusmoins-3-036', structure: 'CMoins', themes: ['sport'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(15, 35), b: rnd(3, 12) }),
      piegesContexte: [
        { f: () => `Le record de l'école est de {d|mètres}.`, v: (niv, rnd) => rnd(36, 45) },
        { f: () => `La piste de course mesure {d|mètres}.`, v: (niv, rnd) => 10 * rnd(5, 10) },
      ],
      texte: (A, B) => ({
        phrases: [`Au lancer de balle, ${A.n} lance à {a|mètres}.`, `${B.n} lance {b|mètres} moins loin ${A.que}.`],
        question: `À combien de mètres ${B.n} lance-t-${B.il} la balle ?`,
        labels: { grand: A.n, petit: B.n },
        juste: `${B.n} lance la balle à {r} mètres.`,
        fausses: [`${B.n} lance la balle {r} mètres plus loin ${A.que}.`, `${A.n} lance la balle à {r} mètres.`],
        unite: 'mètres',
      }) },
    { id: 'plusmoins-3-037', structure: 'CPlus', themes: ['espace'], max: 2000,
      piegesContexte: [
        { f: () => `Le satellite Bip tourne à {d|kilomètres} au-dessus des nuages.`, v: selon([20, 99], [100, 999], [1000, 2000]) },
        { f: () => `Hier, la fusée d'Alvin a parcouru {d|kilomètres}.`, v: selon([20, 99], [100, 999], [500, 2000]) },
      ],
      texte: () => ({
        phrases: [`La fusée d'Alvin vole à {a|kilomètres} de la Terre.`, `La station spatiale est {b|kilomètres} plus loin de la Terre que la fusée d'Alvin.`],
        question: 'À combien de kilomètres de la Terre se trouve la station spatiale ?',
        labels: { grand: 'la station', petit: 'la fusée' },
        juste: 'La station spatiale se trouve à {r} kilomètres de la Terre.',
        fausses: [`La fusée d'Alvin vole à {r} kilomètres de la Terre.`, `La station spatiale est {r} kilomètres plus près de la Terre.`],
        unite: 'kilomètres',
      }) },
    { id: 'plusmoins-3-038', structure: 'TG', themes: ['animaux', 'nature'], max: 200,
      piegesContexte: [
        { f: (A, B) => `Dans la ferme ${B.de}, il y a {d|moutons}.`, v: selon([5, 40], [20, 200], [50, 200]) },
        { f: A => `La ferme ${A.de} a {d|vaches}.`, v: (niv, rnd) => rnd(3, 15) },
      ],
      texte: A => ({
        phrases: [`Dans la ferme ${A.de}, il y a {a|moutons}.`, `Au printemps, {b|agneaux} naissent dans la ferme ${A.de}.`],
        question: `Combien de moutons et d'agneaux y a-t-il maintenant dans la ferme ${A.de} ?`,
        labels: { tout: 'maintenant', p1: 'moutons', p2: 'agneaux' },
        juste: `Maintenant, il y a {r} moutons et agneaux dans la ferme ${A.de}.`,
        fausses: [`Au printemps, {r} agneaux naissent.`, `Avant le printemps, il y avait {r} moutons.`],
        unite: 'animaux',
      }) },
    { id: 'plusmoins-3-039', structure: 'CT', themes: ['cuisine'], max: 60, niveaux: [1],
      piegesContexte: [
        { f: () => `La recette des crêpes demande {d|œufs}.`, v: (niv, rnd) => rnd(2, 6) },
        { f: A => `Hier, ${A.n} a mangé {d|crêpes} chez sa grand-mère.`, v: (niv, rnd) => rnd(2, 6) },
      ],
      texte: (A, B) => ({
        phrases: [`Pour le goûter, ${A.n} prépare {a|crêpes}.`, `${B.n} prépare {b|gaufres} pour le goûter.`],
        question: 'Combien de crêpes et de gaufres y a-t-il pour le goûter ?',
        labels: { tout: 'le goûter', p1: 'crêpes', p2: 'gaufres' },
        juste: 'Pour le goûter, il y a {r} crêpes et gaufres.',
        fausses: [`${A.n} prépare {r} crêpes.`, `${B.n} prépare {r} gaufres.`],
      }) },
    { id: 'plusmoins-3-040', structure: 'TP', themes: ['jeux'], max: 1000,
      piegesContexte: [
        { f: (A, B) => `Le puzzle ${B.de} a {d|pièces}.`, v: selon([20, 99], [100, 1000], [500, 1000]) },
        { f: A => `La boîte du puzzle ${A.de} mesure {d|centimètres} de long.`, v: (niv, rnd) => rnd(25, 50) },
      ],
      texte: A => ({
        phrases: [`Le puzzle ${A.de} a {a|pièces}.`, `${A.n} a déjà posé {b|pièces}.`],
        question: `Combien de pièces ${A.n} doit-${A.il} poser pour finir le puzzle ?`,
        labels: { tout: 'tout le puzzle', p1: 'posées', p2: 'à poser' },
        juste: `${A.n} doit encore poser {r} pièces.`,
        fausses: [`${A.n} a déjà posé {r} pièces.`, `Le puzzle a {r} pièces en tout.`],
        unite: 'pièces',
      }) },
    { id: 'plusmoins-3-041', structure: 'CT', themes: ['voyage'], max: 900,
      piegesContexte: [
        { f: () => `Le mercredi, le camion de livraison reste au garage pendant {d|heures}.`, v: (niv, rnd) => rnd(2, 9) },
        { f: A => `Le lundi, la voiture ${A.de} roule {d|kilomètres}.`, v: selon([5, 40], [20, 300], [50, 300]) },
      ],
      texte: () => ({
        phrases: [`Le lundi, le camion de livraison roule {a|kilomètres}.`, `Le mardi, le camion de livraison roule {b|kilomètres}.`],
        question: 'Quelle distance le camion de livraison parcourt-il en deux jours ?',
        labels: { tout: 'deux jours', p1: 'lundi', p2: 'mardi' },
        juste: 'En deux jours, le camion parcourt {r} kilomètres.',
        fausses: [`Le lundi, le camion parcourt {r} kilomètres.`, `Le mardi, le camion parcourt {r} kilomètres.`],
        unite: 'kilomètres',
      }) },
    // Question au début : variante avec pronoms (phrasesDebut)
    { id: 'plusmoins-3-042', structure: 'TG', themes: ['nature'], max: 200,
      piegesContexte: [
        { f: (A, B) => `${B.n} a {d|coquillages} dans son seau.`, v: selon([4, 30], [12, 200], [12, 200]) },
        { f: () => `Sur la plage, un panneau dit que la mer est à {d|degrés}.`, v: (niv, rnd) => rnd(17, 24) },
      ],
      texte: A => ({
        phrases: [`${A.n} a {a|coquillages} dans sa boîte.`, `À la plage, ${A.il} ramasse {b|coquillages}.`],
        question: `Combien de coquillages ${A.n} a-t-${A.il} maintenant ?`,
        phrasesDebut: [`Dans sa boîte, ${A.il} a {a|coquillages}.`, `À la plage, ${A.il} ramasse {b|coquillages}.`],
        labels: { tout: 'maintenant', p1: 'dans la boîte', p2: 'ramassés' },
        juste: `${A.n} a maintenant {r} coquillages.`,
        fausses: [`À la plage, ${A.n} ramasse {r} coquillages.`, `Dans sa boîte, ${A.n} avait {r} coquillages.`],
        unite: 'coquillages',
      }) },
    { id: 'plusmoins-3-043', structure: 'CMoins', themes: ['jeux'], max: 2000,
      piegesContexte: [
        { f: A => `${A.n} joue au jeu de la galaxie depuis {d|jours}.`, v: (niv, rnd) => rnd(3, 30) },
        { f: () => `Au jeu de la galaxie, la première étoile rapporte {d|points}.`, v: selon([5, 20], [10, 50], [50, 200]) },
      ],
      texte: (A, B) => ({
        phrases: [`Au jeu de la galaxie, le record ${A.de} est de {a|points}.`, `Le record ${B.de} est {b|points} plus bas que le record ${A.de}.`],
        question: `Quel est le record ${B.de} ?`,
        labels: { grand: A.n, petit: B.n },
        juste: `Le record ${B.de} est de {r} points.`,
        fausses: [`Le record ${A.de} est de {r} points.`, `Les deux records font {r} points ensemble.`],
        unite: 'points',
      }) },
    { id: 'plusmoins-3-044', structure: 'TP', themes: ['voyage'], max: 999,
      piegesContexte: [
        { f: () => `Sur le quai de Lyon, {d|voyageurs} attendent le train de Marseille.`, v: selon([5, 40], [20, 400], [50, 500]) },
        { f: () => `Le train de Paris a {d|wagons}.`, v: (niv, rnd) => rnd(6, 12) },
      ],
      texte: () => ({
        phrases: [`Le train de Paris part avec {a|voyageurs}.`, `À Lyon, {b|voyageurs} descendent du train de Paris.`],
        question: 'Combien de voyageurs restent dans le train de Paris après Lyon ?',
        labels: { tout: 'au départ', p1: 'descendus', p2: 'après Lyon' },
        juste: 'Après Lyon, il reste {r} voyageurs dans le train.',
        fausses: [`À Lyon, {r} voyageurs descendent du train.`, `Le train part avec {r} voyageurs.`],
        unite: 'voyageurs',
      }) },
  ]);
})();
