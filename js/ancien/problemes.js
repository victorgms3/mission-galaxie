'use strict';
/*
 * Générateur de problèmes de la Planète Plus-ou-Moins (CE2).
 * Trois familles de problèmes additifs :
 *  - combinaison (deux parties forment un tout),
 *  - transformation (on gagne / on perd quelque chose),
 *  - comparaison (combien de plus / de moins).
 * Chaque problème se représente par un schéma en barres :
 *  - 'pt'  : partie-tout   -> slots { tout, p1, p2 }
 *  - 'cmp' : comparaison   -> slots { grand, petit, ecart }
 * Les slots indiquent quelle donnée va où : 'a', 'b' ou '?' (ce qu'on cherche).
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
  const fmt = UI.fmt;

  const PRENOMS = [
    { n: 'Léa', g: 'f' }, { n: 'Tom', g: 'm' }, { n: 'Inès', g: 'f' }, { n: 'Noah', g: 'm' },
    { n: 'Jade', g: 'f' }, { n: 'Malik', g: 'm' }, { n: 'Chloé', g: 'f' }, { n: 'Hugo', g: 'm' },
    { n: 'Zoé', g: 'f' }, { n: 'Sacha', g: 'm' }, { n: 'Lina', g: 'f' }, { n: 'Adam', g: 'm' },
    { n: 'Emma', g: 'f' }, { n: 'Yanis', g: 'm' },
  ];
  const ALVIN = { n: 'Alvin', g: 'm' };

  function perso(p) {
    const f = p.g === 'f';
    const voyelle = /^[aeiouhàâäéèêëîïôöûü]/i.test(p.n);
    return {
      n: p.n, g: p.g,
      il: f ? 'elle' : 'il',
      de: (voyelle ? "d'" : 'de ') + p.n,
      que: (voyelle ? "qu'" : 'que ') + p.n,
    };
  }
  function duo(A, B) {
    const f = A.g === 'f' && B.g === 'f';
    return { ils: f ? 'elles' : 'ils', eux: f ? 'elles' : 'eux' };
  }

  // Taille des nombres selon le grade
  const NIVEAUX = {
    1: { max: 99, min: 3, bas: 10 },
    2: { max: 999, min: 11, bas: 100 },
    3: { max: 9999, min: 40, bas: 1000 },
  };

  // Trois nombres p + q = s
  function triplet(niv, maxVariante) {
    const N = NIVEAUX[niv];
    const max = Math.min(N.max, maxVariante);
    const bas = Math.min(N.bas, Math.floor(max / 2));
    for (let essai = 0; essai < 60; essai++) {
      const s = rnd(Math.max(bas, 2 * N.min + 2), max);
      const p = rnd(N.min, s - N.min);
      const q = s - p;
      if (Math.abs(p - q) >= 2) return [p, q, s];
    }
    return [12, 7, 19];
  }

  // ---------------------------------------------------------------------------
  // Types de problèmes. {a|unité} = donnée a, {b|unité} = donnée b, {r} = réponse.
  // ---------------------------------------------------------------------------
  const TYPES = {
    // Combinaison : on cherche le tout
    CT: {
      niv: [1, 2, 3], forme: 'pt', slots: { tout: '?', p1: 'a', p2: 'b' },
      nombres: ([p, q, s]) => ({ a: p, b: q, r: s }),
      variantes: [
        A => ({
          max: 200,
          phrases: [`${A.n} a {a|billes rouges} et {b|billes bleues}.`],
          question: `Combien de billes ${A.n} a-t-${A.il} en tout ?`,
          labels: { tout: 'toutes les billes', p1: 'rouges', p2: 'bleues' },
          juste: `${A.n} a {r} billes en tout.`,
          fausses: [`${A.n} a {r} billes rouges.`, `${A.n} a {r} billes bleues.`],
        }),
        (A, B) => {
          const d = duo(A, B);
          return {
            max: 999,
            phrases: [`${A.n} a {a|cartes}.`, `${B.n} a {b|cartes}.`],
            question: `Combien de cartes ont-${d.ils} à ${d.eux} deux ?`,
            labels: { tout: `à ${d.eux} deux`, p1: A.n, p2: B.n },
            juste: `À ${d.eux} deux, ${A.n} et ${B.n} ont {r} cartes.`,
            fausses: [`${B.n} a {r} cartes de plus ${A.que}.`, `${A.n} a {r} cartes.`],
          };
        },
        () => ({
          max: 9999,
          phrases: [`La fusée d'Alvin parcourt {a|kilomètres} le matin et {b|kilomètres} l'après-midi.`],
          question: `Combien de kilomètres la fusée parcourt-elle dans la journée ?`,
          labels: { tout: 'toute la journée', p1: 'le matin', p2: "l'après-midi" },
          juste: `La fusée parcourt {r} kilomètres dans la journée.`,
          fausses: [`La fusée parcourt {r} kilomètres le matin.`, `La fusée parcourt {r} kilomètres l'après-midi.`],
        }),
        () => ({
          max: 9999,
          phrases: [`Samedi, {a|personnes} ont visité le musée de l'espace.`, `Dimanche, {b|personnes} ont visité le musée.`],
          question: `Combien de personnes ont visité le musée pendant le week-end ?`,
          labels: { tout: 'le week-end', p1: 'samedi', p2: 'dimanche' },
          juste: `{r} personnes ont visité le musée pendant le week-end.`,
          fausses: [`{r} personnes ont visité le musée samedi.`, `{r} personnes ont visité le musée dimanche.`],
        }),
        () => ({
          max: 9999,
          phrases: [`Sur la planète Zorg, Alvin ramasse {a|cristaux bleus} et {b|cristaux verts}.`],
          question: `Combien de cristaux Alvin a-t-il ramassés en tout ?`,
          labels: { tout: 'tous les cristaux', p1: 'bleus', p2: 'verts' },
          juste: `Alvin a ramassé {r} cristaux en tout.`,
          fausses: [`Alvin a ramassé {r} cristaux bleus.`, `Alvin a ramassé {r} cristaux verts.`],
        }),
        A => ({
          max: 9999,
          phrases: [`Au jeu de la galaxie, ${A.n} marque {a|points} à la première partie et {b|points} à la deuxième partie.`],
          question: `Combien de points ${A.n} a-t-${A.il} marqués en tout ?`,
          labels: { tout: 'en tout', p1: '1re partie', p2: '2e partie' },
          juste: `${A.n} a marqué {r} points en tout.`,
          fausses: [`${A.n} a marqué {r} points à la première partie.`, `${A.n} a marqué {r} points à la deuxième partie.`],
        }),
      ],
    },

    // Combinaison : on cherche une partie
    CP: {
      niv: [2, 3], forme: 'pt', slots: { tout: 'a', p1: 'b', p2: '?' },
      nombres: ([p, q, s]) => ({ a: s, b: p, r: q }),
      variantes: [
        () => ({
          max: 999,
          phrases: [`Dans le grand vaisseau, il y a {a|passagers}.`, `{b|passagers} dorment, les autres regardent les étoiles.`],
          question: `Combien de passagers regardent les étoiles ?`,
          labels: { tout: 'tous les passagers', p1: 'dorment', p2: 'regardent les étoiles' },
          juste: `{r} passagers regardent les étoiles.`,
          fausses: [`{r} passagers dorment.`, `Il y a {r} passagers dans le vaisseau.`],
        }),
        A => ({
          max: 200,
          phrases: [`${A.n} a {a|billes}.`, `{b|billes} sont rouges, les autres sont bleues.`],
          question: `Combien de billes bleues ${A.n} a-t-${A.il} ?`,
          labels: { tout: 'toutes les billes', p1: 'rouges', p2: 'bleues' },
          juste: `${A.n} a {r} billes bleues.`,
          fausses: [`${A.n} a {r} billes rouges.`, `${A.n} a {r} billes en tout.`],
        }),
        A => ({
          max: 9999,
          phrases: [`Pour gagner la coupe des étoiles, il faut {a|points}.`, `${A.n} a déjà {b|points}.`],
          question: `Combien de points ${A.n} doit-${A.il} encore marquer ?`,
          labels: { tout: 'pour gagner', p1: 'déjà', p2: 'encore' },
          juste: `${A.n} doit encore marquer {r} points.`,
          fausses: [`${A.n} a déjà {r} points.`, `Il faut {r} points pour gagner.`],
        }),
        A => ({
          max: 999,
          phrases: [`Le livre « Alvin sur la Lune » a {a|pages}.`, `${A.n} a déjà lu {b|pages}.`],
          question: `Combien de pages reste-t-il à lire ?`,
          labels: { tout: 'tout le livre', p1: 'déjà lues', p2: 'à lire' },
          juste: `Il reste {r} pages à lire.`,
          fausses: [`${A.n} a déjà lu {r} pages.`, `Le livre a {r} pages.`],
        }),
        () => ({
          max: 9999,
          phrases: [`Pour aller sur la planète Zorg, la fusée doit parcourir {a|kilomètres}.`, `La fusée a déjà parcouru {b|kilomètres}.`],
          question: `Combien de kilomètres la fusée doit-elle encore parcourir ?`,
          labels: { tout: 'tout le voyage', p1: 'déjà parcourus', p2: 'à parcourir' },
          juste: `La fusée doit encore parcourir {r} kilomètres.`,
          fausses: [`La fusée a déjà parcouru {r} kilomètres.`, `Le voyage fait {r} kilomètres.`],
        }),
      ],
    },

    // Transformation : on gagne, on cherche l'état final
    TG: {
      niv: [1, 2, 3], forme: 'pt', slots: { tout: '?', p1: 'a', p2: 'b' },
      nombres: ([p, q, s]) => ({ a: p, b: q, r: s }),
      variantes: [
        A => ({
          max: 200,
          phrases: [`${A.n} a {a|billes}.`, `À la récréation, ${A.n} gagne {b|billes}.`],
          question: `Combien de billes ${A.n} a-t-${A.il} maintenant ?`,
          labels: { tout: 'maintenant', p1: 'au début', p2: 'gagnées' },
          juste: `${A.n} a maintenant {r} billes.`,
          fausses: [`${A.n} a gagné {r} billes.`, `${A.n} avait {r} billes au début.`],
        }),
        (A, B) => ({
          max: 999,
          phrases: [`${A.n} a {a|autocollants} dans son album.`, `Pour son anniversaire, ${A.n} reçoit {b|autocollants} ${B.de}.`],
          question: `Combien d'autocollants ${A.n} a-t-${A.il} maintenant ?`,
          labels: { tout: 'maintenant', p1: 'au début', p2: 'reçus' },
          juste: `${A.n} a maintenant {r} autocollants.`,
          fausses: [`${B.n} offre {r} autocollants.`, `${A.n} avait {r} autocollants au début.`],
        }),
        () => ({
          max: 99,
          phrases: [`Dans la station spatiale, il y a {a|astronautes}.`, `Une navette amène {b|nouveaux astronautes}.`],
          question: `Combien d'astronautes y a-t-il maintenant dans la station ?`,
          labels: { tout: 'maintenant', p1: 'au début', p2: 'arrivés' },
          juste: `Il y a maintenant {r} astronautes dans la station.`,
          fausses: [`La navette amène {r} astronautes.`, `Il y avait {r} astronautes au début.`],
        }),
        A => ({
          max: 9999,
          phrases: [`${A.n} a {a|points} au jeu de la galaxie.`, `Ensuite, ${A.n} gagne {b|points}.`],
          question: `Combien de points ${A.n} a-t-${A.il} maintenant ?`,
          labels: { tout: 'maintenant', p1: 'au début', p2: 'gagnés' },
          juste: `${A.n} a maintenant {r} points.`,
          fausses: [`${A.n} a gagné {r} points.`, `${A.n} avait {r} points au début.`],
        }),
        () => ({
          max: 9999,
          phrases: [`Alvin a {a|cristaux} dans sa fusée.`, `Sur la Lune, Alvin ramasse {b|cristaux}.`],
          question: `Combien de cristaux Alvin a-t-il maintenant ?`,
          labels: { tout: 'maintenant', p1: 'au début', p2: 'ramassés' },
          juste: `Alvin a maintenant {r} cristaux.`,
          fausses: [`Alvin a ramassé {r} cristaux sur la Lune.`, `Alvin avait {r} cristaux au début.`],
        }),
      ],
    },

    // Transformation : on perd, on cherche l'état final
    TP: {
      niv: [1, 2, 3], forme: 'pt', slots: { tout: 'a', p1: 'b', p2: '?' },
      nombres: ([p, q, s]) => ({ a: s, b: p, r: q }),
      variantes: [
        A => ({
          max: 200,
          phrases: [`${A.n} a {a|billes}.`, `Pendant la partie, ${A.n} perd {b|billes}.`],
          question: `Combien de billes reste-t-il à ${A.n} ?`,
          labels: { tout: 'au début', p1: 'perdues', p2: 'qui restent' },
          juste: `Il reste {r} billes à ${A.n}.`,
          fausses: [`${A.n} a perdu {r} billes.`, `${A.n} avait {r} billes au début.`],
        }),
        (A, B) => ({
          max: 99,
          phrases: [`Dans le sachet ${A.de}, il y a {a|bonbons}.`, `${A.n} donne {b|bonbons} à ${B.n}.`],
          question: `Combien de bonbons reste-t-il dans le sachet ?`,
          labels: { tout: 'au début', p1: 'donnés', p2: 'qui restent' },
          juste: `Il reste {r} bonbons dans le sachet.`,
          fausses: [`${A.n} donne {r} bonbons à ${B.n}.`, `Il y avait {r} bonbons au début.`],
        }),
        () => ({
          max: 999,
          phrases: [`Le réservoir de la fusée contient {a|litres} de carburant.`, `Pour décoller, la fusée utilise {b|litres}.`],
          question: `Combien de litres de carburant reste-t-il dans le réservoir ?`,
          labels: { tout: 'au début', p1: 'utilisés', p2: 'qui restent' },
          juste: `Il reste {r} litres de carburant dans le réservoir.`,
          fausses: [`La fusée utilise {r} litres pour décoller.`, `Le réservoir contenait {r} litres au début.`],
        }),
        A => ({
          max: 9999,
          phrases: [`${A.n} a {a|points} au jeu de la galaxie.`, `${A.n} achète un vaisseau qui coûte {b|points}.`],
          question: `Combien de points reste-t-il à ${A.n} ?`,
          labels: { tout: 'au début', p1: 'dépensés', p2: 'qui restent' },
          juste: `Il reste {r} points à ${A.n}.`,
          fausses: [`Le vaisseau coûte {r} points.`, `${A.n} avait {r} points au début.`],
        }),
        () => ({
          max: 9999,
          phrases: [`Alvin a {a|cristaux}.`, `Pour réparer sa fusée, Alvin utilise {b|cristaux}.`],
          question: `Combien de cristaux reste-t-il à Alvin ?`,
          labels: { tout: 'au début', p1: 'utilisés', p2: 'qui restent' },
          juste: `Il reste {r} cristaux à Alvin.`,
          fausses: [`Alvin utilise {r} cristaux.`, `Alvin avait {r} cristaux au début.`],
        }),
      ],
    },

    // Transformation : on cherche ce qui a été gagné
    TTg: {
      niv: [2, 3], forme: 'pt', slots: { tout: 'b', p1: 'a', p2: '?' },
      nombres: ([p, q, s]) => ({ a: p, b: s, r: q }),
      variantes: [
        A => ({
          max: 200,
          phrases: [`Ce matin, ${A.n} avait {a|billes}.`, `Ce soir, ${A.n} a {b|billes}.`],
          question: `Combien de billes ${A.n} a-t-${A.il} gagnées aujourd'hui ?`,
          labels: { tout: 'ce soir', p1: 'ce matin', p2: 'gagnées' },
          juste: `${A.n} a gagné {r} billes aujourd'hui.`,
          fausses: [`${A.n} a {r} billes ce soir.`, `${A.n} avait {r} billes ce matin.`],
        }),
        A => ({
          max: 999,
          phrases: [`${A.n} a {a|cartes} de l'espace.`, `Sa collection complète compte {b|cartes}.`],
          question: `Combien de cartes manque-t-il à ${A.n} pour compléter sa collection ?`,
          labels: { tout: 'collection complète', p1: 'déjà', p2: 'manquantes' },
          juste: `Il manque {r} cartes à ${A.n}.`,
          fausses: [`${A.n} a {r} cartes.`, `La collection compte {r} cartes.`],
        }),
        A => ({
          max: 9999,
          phrases: [`Au début de la partie, ${A.n} avait {a|points}.`, `À la fin de la partie, ${A.n} a {b|points}.`],
          question: `Combien de points ${A.n} a-t-${A.il} gagnés pendant la partie ?`,
          labels: { tout: 'à la fin', p1: 'au début', p2: 'gagnés' },
          juste: `${A.n} a gagné {r} points pendant la partie.`,
          fausses: [`${A.n} a {r} points à la fin.`, `${A.n} avait {r} points au début.`],
        }),
      ],
    },

    // Transformation : on cherche ce qui a été perdu / utilisé
    TTp: {
      niv: [2, 3], forme: 'pt', slots: { tout: 'a', p1: '?', p2: 'b' },
      nombres: ([p, q, s]) => ({ a: s, b: p, r: q }),
      variantes: [
        A => ({
          max: 99,
          phrases: [`${A.n} avait {a|bonbons}.`, `Après le goûter, il reste {b|bonbons} à ${A.n}.`],
          question: `Combien de bonbons ${A.n} a-t-${A.il} mangés ?`,
          labels: { tout: 'au début', p1: 'mangés', p2: 'qui restent' },
          juste: `${A.n} a mangé {r} bonbons.`,
          fausses: [`Il reste {r} bonbons à ${A.n}.`, `${A.n} avait {r} bonbons au début.`],
        }),
        A => ({
          max: 999,
          phrases: [`${A.n} avait {a|perles}.`, `${A.n} fabrique un collier.`, `Il reste {b|perles} à ${A.n}.`],
          question: `Combien de perles ${A.n} a-t-${A.il} utilisées pour le collier ?`,
          labels: { tout: 'au début', p1: 'utilisées', p2: 'qui restent' },
          juste: `${A.n} a utilisé {r} perles pour le collier.`,
          fausses: [`Il reste {r} perles à ${A.n}.`, `${A.n} avait {r} perles au début.`],
        }),
        () => ({
          max: 9999,
          phrases: [`Alvin avait {a|cristaux}.`, `Après la réparation de sa fusée, il reste {b|cristaux} à Alvin.`],
          question: `Combien de cristaux Alvin a-t-il utilisés ?`,
          labels: { tout: 'au début', p1: 'utilisés', p2: 'qui restent' },
          juste: `Alvin a utilisé {r} cristaux.`,
          fausses: [`Il reste {r} cristaux à Alvin.`, `Alvin avait {r} cristaux au début.`],
        }),
      ],
    },

    // Transformation : on cherche l'état de départ (après un gain)
    TIg: {
      niv: [3], forme: 'pt', slots: { tout: 'b', p1: '?', p2: 'a' },
      nombres: ([p, q, s]) => ({ a: p, b: s, r: q }),
      variantes: [
        A => ({
          max: 9999,
          phrases: [`${A.n} vient de gagner {a|points} au jeu de la galaxie.`, `Maintenant, ${A.n} a {b|points}.`],
          question: `Combien de points ${A.n} avait-${A.il} avant ?`,
          labels: { tout: 'maintenant', p1: 'avant', p2: 'gagnés' },
          juste: `${A.n} avait {r} points avant.`,
          fausses: [`${A.n} vient de gagner {r} points.`, `${A.n} a maintenant {r} points.`],
        }),
        () => ({
          max: 9999,
          phrases: [`Sur Mars, Alvin a ramassé {a|cristaux}.`, `Maintenant, Alvin a {b|cristaux} dans sa fusée.`],
          question: `Combien de cristaux Alvin avait-il avant d'aller sur Mars ?`,
          labels: { tout: 'maintenant', p1: 'avant', p2: 'ramassés' },
          juste: `Alvin avait {r} cristaux avant d'aller sur Mars.`,
          fausses: [`Alvin a ramassé {r} cristaux sur Mars.`, `Alvin a maintenant {r} cristaux.`],
        }),
      ],
    },

    // Transformation : on cherche l'état de départ (après une perte)
    TIp: {
      niv: [3], forme: 'pt', slots: { tout: '?', p1: 'a', p2: 'b' },
      nombres: ([p, q, s]) => ({ a: p, b: q, r: s }),
      variantes: [
        A => ({
          max: 9999,
          phrases: [`${A.n} a dépensé {a|points} pour acheter un vaisseau.`, `Il reste {b|points} à ${A.n}.`],
          question: `Combien de points ${A.n} avait-${A.il} avant d'acheter le vaisseau ?`,
          labels: { tout: 'avant', p1: 'dépensés', p2: 'qui restent' },
          juste: `${A.n} avait {r} points avant d'acheter le vaisseau.`,
          fausses: [`${A.n} a dépensé {r} points.`, `Il reste {r} points à ${A.n}.`],
        }),
        () => ({
          max: 9999,
          phrases: [`Alvin a utilisé {a|cristaux} pour réparer sa fusée.`, `Il reste {b|cristaux} à Alvin.`],
          question: `Combien de cristaux Alvin avait-il avant la réparation ?`,
          labels: { tout: 'avant', p1: 'utilisés', p2: 'qui restent' },
          juste: `Alvin avait {r} cristaux avant la réparation.`,
          fausses: [`Alvin a utilisé {r} cristaux.`, `Il reste {r} cristaux à Alvin.`],
        }),
        () => ({
          max: 9999,
          phrases: [`La fusée a déjà parcouru {a|kilomètres}.`, `Pour arriver sur Jupiter, la fusée doit encore parcourir {b|kilomètres}.`],
          question: `Combien de kilomètres mesure le voyage jusqu'à Jupiter ?`,
          labels: { tout: 'tout le voyage', p1: 'déjà parcourus', p2: 'qui restent' },
          juste: `Le voyage jusqu'à Jupiter mesure {r} kilomètres.`,
          fausses: [`La fusée a déjà parcouru {r} kilomètres.`, `La fusée doit encore parcourir {r} kilomètres.`],
        }),
      ],
    },

    // Comparaison : on cherche l'écart
    CE: {
      niv: [2, 3], forme: 'cmp', slots: { grand: 'b', petit: 'a', ecart: '?' },
      nombres: ([p, q, s]) => ({ a: p, b: s, r: q }),
      variantes: [
        (A, B) => ({
          max: 200,
          phrases: [`${A.n} a {a|billes}.`, `${B.n} a {b|billes}.`],
          question: `Combien de billes ${B.n} a-t-${B.il} de plus ${A.que} ?`,
          labels: { grand: B.n, petit: A.n },
          juste: `${B.n} a {r} billes de plus ${A.que}.`,
          fausses: [`${B.n} a {r} billes.`, `${A.n} et ${B.n} ont {r} billes en tout.`],
        }),
        (A, B) => ({
          max: 9999,
          phrases: [`Au jeu de la galaxie, ${A.n} a marqué {a|points}.`, `${B.n} a marqué {b|points}.`],
          question: `Combien de points ${A.n} a-t-${A.il} de moins ${B.que} ?`,
          labels: { grand: B.n, petit: A.n },
          juste: `${A.n} a {r} points de moins ${B.que}.`,
          fausses: [`${A.n} a marqué {r} points.`, `${B.n} a {r} points de moins ${A.que}.`],
        }),
        () => ({
          max: 9999,
          phrases: [`La fusée rouge a parcouru {a|kilomètres}.`, `La fusée bleue a parcouru {b|kilomètres}.`],
          question: `Combien de kilomètres la fusée bleue a-t-elle parcourus de plus que la fusée rouge ?`,
          labels: { grand: 'la fusée bleue', petit: 'la fusée rouge' },
          juste: `La fusée bleue a parcouru {r} kilomètres de plus que la rouge.`,
          fausses: [`La fusée bleue a parcouru {r} kilomètres.`, `La fusée rouge a parcouru {r} kilomètres de plus que la bleue.`],
        }),
      ],
    },

    // Comparaison : on cherche la plus grande quantité (« de plus »)
    CPlus: {
      niv: [2, 3], forme: 'cmp', slots: { grand: '?', petit: 'a', ecart: 'b' },
      nombres: ([p, q, s]) => ({ a: p, b: q, r: s }),
      variantes: [
        (A, B) => ({
          max: 200,
          phrases: [`${A.n} a {a|billes}.`, `${B.n} a {b|billes} de plus ${A.que}.`],
          question: `Combien de billes ${B.n} a-t-${B.il} ?`,
          labels: { grand: B.n, petit: A.n },
          juste: `${B.n} a {r} billes.`,
          fausses: [`${A.n} a {r} billes.`, `${B.n} a {r} billes de plus ${A.que}.`],
        }),
        (A, B) => ({
          max: 9999,
          phrases: [`${A.n} a marqué {a|points}.`, `${B.n} a marqué {b|points} de plus ${A.que}.`],
          question: `Combien de points ${B.n} a-t-${B.il} marqués ?`,
          labels: { grand: B.n, petit: A.n },
          juste: `${B.n} a marqué {r} points.`,
          fausses: [`${A.n} a marqué {r} points.`, `${B.n} a marqué {r} points de plus ${A.que}.`],
        }),
        (A, B) => ({
          max: 999,
          phrases: [`Sur la carte du ciel ${A.de}, il y a {a|étoiles}.`, `Sur la carte du ciel ${B.de}, il y a {b|étoiles} de plus.`],
          question: `Combien d'étoiles y a-t-il sur la carte du ciel ${B.de} ?`,
          labels: { grand: B.n, petit: A.n },
          juste: `Il y a {r} étoiles sur la carte ${B.de}.`,
          fausses: [`Il y a {r} étoiles sur la carte ${A.de}.`, `Il y a {r} étoiles de plus sur la carte ${B.de}.`],
        }),
      ],
    },

    // Comparaison : on cherche la plus petite quantité (« de moins »)
    CMoins: {
      niv: [2, 3], forme: 'cmp', slots: { grand: 'a', petit: '?', ecart: 'b' },
      nombres: ([p, q, s]) => ({ a: s, b: p, r: q }),
      variantes: [
        (A, B) => ({
          max: 999,
          phrases: [`${A.n} a {a|cartes}.`, `${B.n} a {b|cartes} de moins ${A.que}.`],
          question: `Combien de cartes ${B.n} a-t-${B.il} ?`,
          labels: { grand: A.n, petit: B.n },
          juste: `${B.n} a {r} cartes.`,
          fausses: [`${A.n} a {r} cartes.`, `${B.n} a {r} cartes de moins ${A.que}.`],
        }),
        () => ({
          max: 9999,
          phrases: [`La fusée rouge a parcouru {a|kilomètres}.`, `La fusée bleue a parcouru {b|kilomètres} de moins que la fusée rouge.`],
          question: `Combien de kilomètres la fusée bleue a-t-elle parcourus ?`,
          labels: { grand: 'la fusée rouge', petit: 'la fusée bleue' },
          juste: `La fusée bleue a parcouru {r} kilomètres.`,
          fausses: [`La fusée rouge a parcouru {r} kilomètres.`, `La fusée bleue a parcouru {r} kilomètres de moins.`],
        }),
        (A, B) => ({
          max: 9999,
          phrases: [`${A.n} a {a|points} au jeu de la galaxie.`, `${B.n} a {b|points} de moins ${A.que}.`],
          question: `Combien de points ${B.n} a-t-${B.il} ?`,
          labels: { grand: A.n, petit: B.n },
          juste: `${B.n} a {r} points.`,
          fausses: [`${A.n} a {r} points.`, `${B.n} a {r} points de moins ${A.que}.`],
        }),
      ],
    },

    // Comparaison inversée (piège) : « C'est … de plus que … »
    CInvP: {
      niv: [3], forme: 'cmp', slots: { grand: 'a', petit: '?', ecart: 'b' },
      nombres: ([p, q, s]) => ({ a: s, b: p, r: q }),
      variantes: [
        (A, B) => ({
          max: 9999,
          phrases: [`${A.n} a {a|points}.`, `C'est {b|points} de plus ${B.que}.`],
          question: `Combien de points ${B.n} a-t-${B.il} ?`,
          labels: { grand: A.n, petit: B.n },
          juste: `${B.n} a {r} points.`,
          fausses: [`${A.n} a {r} points.`, `${B.n} a {r} points de plus ${A.que}.`],
        }),
        () => ({
          max: 9999,
          phrases: [`La fusée d'Alvin a parcouru {a|kilomètres}.`, `C'est {b|kilomètres} de plus que la fusée de Zorg.`],
          question: `Combien de kilomètres la fusée de Zorg a-t-elle parcourus ?`,
          labels: { grand: "la fusée d'Alvin", petit: 'la fusée de Zorg' },
          juste: `La fusée de Zorg a parcouru {r} kilomètres.`,
          fausses: [`La fusée d'Alvin a parcouru {r} kilomètres.`, `La fusée de Zorg a parcouru {r} kilomètres de plus.`],
        }),
      ],
    },

    // Comparaison inversée (piège) : « C'est … de moins que … »
    CInvM: {
      niv: [3], forme: 'cmp', slots: { grand: '?', petit: 'a', ecart: 'b' },
      nombres: ([p, q, s]) => ({ a: p, b: q, r: s }),
      variantes: [
        (A, B) => ({
          max: 9999,
          phrases: [`${A.n} a ramassé {a|cristaux}.`, `C'est {b|cristaux} de moins ${B.que}.`],
          question: `Combien de cristaux ${B.n} a-t-${B.il} ramassés ?`,
          labels: { grand: B.n, petit: A.n },
          juste: `${B.n} a ramassé {r} cristaux.`,
          fausses: [`${A.n} a ramassé {r} cristaux.`, `${B.n} a ramassé {r} cristaux de moins ${A.que}.`],
        }),
        (A, B) => ({
          max: 9999,
          phrases: [`${A.n} a marqué {a|points}.`, `C'est {b|points} de moins ${B.que}.`],
          question: `Combien de points ${B.n} a-t-${B.il} marqués ?`,
          labels: { grand: B.n, petit: A.n },
          juste: `${B.n} a marqué {r} points.`,
          fausses: [`${A.n} a marqué {r} points.`, `${B.n} a marqué {r} points de moins ${A.que}.`],
        }),
      ],
    },
  };

  // Phrases « pièges » avec un nombre inutile
  const DISTRACTEURS = [
    { f: P => `${P.n} a {d|crayons} dans sa trousse.`, v: () => rnd(5, 19) },
    { f: () => `La fusée a {d|hublots}.`, v: () => rnd(3, 12) },
    { f: () => `Alvin a {d|moustaches}.`, v: () => rnd(12, 20) },
    { f: P => `Dans la classe ${P.de}, il y a {d|élèves}.`, v: () => rnd(19, 29), sansAlvin: true },
    { f: () => `Le voyage dure {d|jours}.`, v: () => rnd(3, 28) },
    { f: P => `${P.n} a {d|ans}.`, v: () => rnd(7, 11), sansAlvin: true },
    { f: P => `${P.n} a {d|images} dans son album.`, meme: true },
  ];

  function personnages(ctx) {
    const enfant = ctx.enfant;
    const amis = (ctx.amis || []).filter(p => !enfant || p.n !== enfant.n);
    const reserve = () => (amis.length && Math.random() < 0.6 ? amis : PRENOMS);
    const A = enfant && Math.random() < 0.5 ? enfant : choix(reserve());
    let B = null;
    for (let essai = 0; essai < 20 && (!B || B.n === A.n); essai++) {
      B = Math.random() < 0.15 ? ALVIN : choix(reserve());
    }
    if (B.n === A.n) B = PRENOMS.find(p => p.n !== A.n);
    return [perso(A), perso(B)];
  }

  function segmenter(phrase, vals) {
    const segs = [];
    let dernier = 0;
    phrase.replace(/\{([abd])(?:\|([^}]*))?\}/g, (m, k, u, pos) => {
      if (pos > dernier) segs.push({ t: phrase.slice(dernier, pos) });
      segs.push({ k, v: vals[k], u: u || '' });
      dernier = pos + m.length;
      return m;
    });
    if (dernier < phrase.length) segs.push({ t: phrase.slice(dernier) });
    return segs;
  }
  const texteDonnee = s => fmt(s.v) + (s.u ? ' ' + s.u : '');
  const texteBrut = segs => segs.map(s => (s.t != null ? s.t : texteDonnee(s))).join('');

  function operation(schema, vals) {
    const s = schema.slots;
    let signe, g, d;
    if (schema.forme === 'pt') {
      if (s.tout === '?') { signe = '+'; g = s.p1; d = s.p2; }
      else { signe = '−'; g = s.tout; d = s.p1 === '?' ? s.p2 : s.p1; }
    } else if (s.grand === '?') { signe = '+'; g = s.petit; d = s.ecart; }
    else if (s.petit === '?') { signe = '−'; g = s.grand; d = s.ecart; }
    else { signe = '−'; g = s.grand; d = s.petit; }
    return { signe, g: vals[g], d: vals[d], r: vals.r };
  }

  function construire(typeId, niv, ctx, deja, avecPiege) {
    const type = TYPES[typeId];
    const N = NIVEAUX[niv];
    const [A, B] = personnages(ctx);
    const textes = type.variantes.map(v => v(A, B));
    let ids = textes.map((_, i) => i).filter(i => textes[i].max >= N.max);
    if (!ids.length) ids = textes.map((_, i) => i);
    const frais = ids.filter(i => !deja.has(typeId + i));
    const iv = choix(frais.length ? frais : ids);
    deja.add(typeId + iv);
    const t = textes[iv];
    const vals = type.nombres(triplet(niv, t.max));
    const phrases = t.phrases.slice();

    let distracteur = null;
    if (avecPiege) {
      const sujet = phrases.join(' ').includes(A.n) ? A : perso(ALVIN);
      const d = choix(DISTRACTEURS.filter(x => !(x.sansAlvin && sujet.n === 'Alvin') && !(x.meme && niv === 1)));
      let v;
      for (let essai = 0; essai < 20; essai++) {
        v = d.meme ? rnd(N.min, Math.min(N.max, t.max)) : d.v();
        if (![vals.a, vals.b, vals.r].includes(v)) break;
      }
      vals.d = v;
      // jamais juste avant une phrase qui dépend de la précédente (« C'est … de plus que … »)
      const places = [];
      for (let i = 1; i <= phrases.length; i++) if (!/^C'est/.test(phrases[i] || '')) places.push(i);
      phrases.splice(choix(places), 0, d.f(sujet));
      distracteur = 'd';
    }

    const toutes = [
      ...phrases.map(p => ({ segs: segmenter(p, vals), question: false })),
      { segs: segmenter(t.question, vals), question: true },
    ];
    const cartes = {};
    toutes.forEach(ph => ph.segs.forEach(s => { if (s.k && !cartes[s.k]) cartes[s.k] = texteDonnee(s); }));
    const schema = { forme: type.forme, slots: type.slots, labels: t.labels };
    const r = fmt(vals.r);

    return {
      type: typeId, variante: iv, niveau: niv,
      phrases: toutes,
      oral: toutes.map(ph => texteBrut(ph.segs)),
      question: texteBrut(toutes[toutes.length - 1].segs),
      vals, cartes, utiles: ['a', 'b'], distracteur,
      schema,
      op: operation(schema, vals),
      reponse: { juste: t.juste.replace('{r}', r), fausses: t.fausses.map(f => f.replace('{r}', r)) },
    };
  }

  function tirerTypes(niveau) {
    if (niveau <= 1) return melange(['CT', 'CT', 'TG', 'TG', 'TG', 'TP', 'TP', 'TP']);
    if (niveau === 2) return melange(['CP', 'TTg', 'TTp', 'CE', 'CPlus', 'CMoins', 'TG', 'TP', 'CT']);
    // Grade 3 : deux problèmes connus pour démarrer, puis les problèmes pièges
    return [
      ...melange(['CE', 'CPlus', 'CMoins', 'TTg', 'TTp', 'CP']).slice(0, 2),
      ...melange(['TIg', 'TIp', 'CInvP', 'CInvM', ...melange(['CE', 'TTg', 'TTp', 'CMoins', 'CPlus', 'CP', 'TG', 'TP']).slice(0, 2)]),
    ];
  }

  // Une mission : n problèmes adaptés au grade
  function serie(niveau, n, ctx) {
    let types;
    for (let essai = 0; essai < 50; essai++) {
      types = tirerTypes(niveau).slice(0, n);
      if (types.every((t, i) => i === 0 || t !== types[i - 1])) break;
    }
    const deja = new Set();
    const probaPiege = { 1: 0.25, 2: 0.45, 3: 0.6 }[niveau] || 0.3;
    // Les deux premiers problèmes utilisent des nombres plus petits pour se mettre en route
    return types.map((t, i) => construire(t, i < 2 && niveau > 1 ? niveau - 1 : niveau, ctx, deja, i >= 1 && Math.random() < probaPiege));
  }

  // Calcul mental d'échauffement
  function echauffement(niveau, n = 5) {
    const gens = {
      1: [
        () => [rnd(2, 9), '+', rnd(2, 9)],
        () => { const a = rnd(11, 19); return [a, '−', rnd(2, Math.min(9, a - 2))]; },
        () => [rnd(1, 8) * 10 + rnd(0, 9), '+', 10],
        () => [rnd(2, 9) * 10 + rnd(0, 9), '−', 10],
        () => [rnd(1, 5) * 10, '+', rnd(1, 4) * 10],
      ],
      2: [
        () => [rnd(2, 8) * 10 + rnd(3, 9), '+', rnd(3, 9)],
        () => [rnd(2, 9) * 10 + rnd(0, 5), '−', rnd(6, 9)],
        () => [rnd(1, 8) * 100 + rnd(0, 89), '+', 10],
        () => [rnd(1, 8) * 100 + rnd(0, 99), '+', 100],
        () => [rnd(2, 9) * 10, '+', rnd(2, 9) * 10],
      ],
      3: [
        () => [rnd(11, 59), '+', rnd(11, 39)],
        () => [rnd(2, 9) * 100 + rnd(0, 99), '−', 100],
        () => [rnd(1, 8) * 1000 + rnd(0, 999), '+', 1000],
        () => [100, '−', rnd(11, 89)],
        () => [rnd(2, 9) * 100, '+', rnd(2, 9) * 100],
      ],
    }[niveau] || [];
    return melange(gens).slice(0, n).map(gen => {
      const [g, signe, d] = gen();
      return { g, signe, d, r: signe === '+' ? g + d : g - d };
    });
  }

  return { serie, echauffement, texteDonnee, TYPES };
})();
