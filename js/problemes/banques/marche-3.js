'use strict';
/*
 * Marché — banque 3 : des problèmes d'argent qu'on ne peut PAS résoudre en devinant l'opération.
 *  - 001-011 : mot-piège (« dépense », « de plus », « gagne », « rend »… mais il faut faire l'opération contraire) ;
 *  - 012-022 : réponses « Qui… ? » et « Oui / Non » (« A-t-elle assez d'argent ? », « Qui dépense le plus ? ») ;
 *  - 023-029 : il manque une donnée (le prix d'un objet n'est pas donné…) ;
 *  - 030-042 : problèmes ordinaires, avec des phrases pièges en euros (piegesContexte).
 * Euros entiers. Grade 1 : petits prix (≤ 30 € pour les modèles à mot-piège) ; grades 2 et 3 : prix plus grands.
 * Thèmes : fruits, boulangerie, jouets, librairie, fete, vetements, cantine, espace.
 */
(() => {
  // Nombre entier tiré selon le grade : g1, g2, g3 = [min, max]
  const selon = (g1, g2, g3) => (niv, rnd) => {
    const [lo, hi] = niv <= 1 ? g1 : niv === 2 ? g2 : (g3 || g2);
    return rnd(lo, hi);
  };
  const tirer = (niv, rnd, g1, g2, g3) => selon(g1, g2, g3)(niv, rnd);

  Problemes.ajouter('marche', [
    // =========================================================================
    // MOT-PIÈGE : le mot de l'énoncé fait penser à la mauvaise opération
    // =========================================================================
    // « dépense », « il reste » mais on cherche ce qu'il y avait avant : addition
    { id: 'marche-3-001', structure: 'TIp', themes: ['fruits'], max: 100,
      piegesContexte: [
        { f: (A, B) => `${B.n} a {d|€} dans son porte-monnaie.`, v: selon([3, 30], [10, 100], [10, 100]) },
        { f: (A, B) => `Au marché, ${B.n} achète un melon à {d|€}.`, v: (niv, rnd) => rnd(2, 5) },
      ],
      texte: A => ({
        phrases: [`${A.n} dépense {a|€} au marché.`, `Il reste {b|€} dans le porte-monnaie ${A.de}.`],
        question: `Combien d'argent ${A.n} avait-${A.il} avant d'aller au marché ?`,
        labels: { tout: 'avant', p1: 'dépensé', p2: 'qui reste' },
        juste: `Avant d'aller au marché, ${A.n} avait {r} €.`,
        fausses: [`${A.n} dépense {r} € au marché.`, `Il reste {r} € dans le porte-monnaie ${A.de}.`],
        unite: '€',
      }) },
    // « reçoit » mais on cherche ce qu'il y avait avant : soustraction
    { id: 'marche-3-002', structure: 'TIg', themes: ['jouets', 'fete'], max: 200,
      piegesContexte: [
        { f: (A, B) => `La tirelire ${B.de} contient {d|€}.`, v: selon([3, 30], [12, 200], [12, 200]) },
        { f: () => `Le jeu de société préféré de la famille coûte {d|€}.`, v: selon([15, 40], [20, 60], [20, 60]) },
      ],
      texte: A => ({
        phrases: [`Pour son anniversaire, ${A.n} reçoit {a|€} de sa grand-mère.`, `Maintenant, ${A.n} a {b|€} dans sa tirelire.`],
        question: `Combien d'argent ${A.n} avait-${A.il} dans sa tirelire avant son anniversaire ?`,
        labels: { tout: 'maintenant', p1: 'avant', p2: 'reçu' },
        juste: `Avant son anniversaire, ${A.n} avait {r} € dans sa tirelire.`,
        fausses: [`${A.n} reçoit {r} € de sa grand-mère.`, `Maintenant, ${A.n} a {r} € dans sa tirelire.`],
        unite: '€',
      }) },
    // « de plus » mais on cherche le prix le plus petit : soustraction
    { id: 'marche-3-003', structure: 'CInvP', themes: ['librairie'], max: 60,
      piegesContexte: [
        { f: () => `À la librairie, le dictionnaire coûte {d|€}.`, v: selon([20, 35], [20, 45], [20, 45]) },
        { f: (A, B) => `${B.n} a acheté un cahier à {d|€}.`, v: (niv, rnd) => rnd(2, 5) },
      ],
      texte: () => ({
        phrases: [`À la librairie, le livre de contes coûte {a|€}.`, `Le livre de contes coûte {b|€} de plus que la bande dessinée.`],
        question: 'Combien coûte la bande dessinée ?',
        labels: { grand: 'le livre de contes', petit: 'la bande dessinée' },
        juste: 'La bande dessinée coûte {r} €.',
        fausses: [`La bande dessinée coûte {r} € de plus que le livre de contes.`, `Les deux livres coûtent {r} € ensemble.`],
        unite: '€',
      }) },
    // « de moins » mais on cherche le prix le plus grand : addition
    { id: 'marche-3-004', structure: 'CInvM', themes: ['jouets'], max: 120,
      piegesContexte: [
        { f: () => `Au magasin de jouets, le casque de vélo coûte {d|€}.`, v: selon([10, 30], [15, 60], [15, 60]) },
        { f: (A, B) => `${B.n} a déjà des rollers depuis {d|ans}.`, v: (niv, rnd) => rnd(2, 4) },
      ],
      texte: () => ({
        phrases: [`Au magasin de jouets, le ballon coûte {a|€}.`, `Le ballon coûte {b|€} de moins que les rollers.`],
        question: 'Combien coûtent les rollers ?',
        labels: { grand: 'les rollers', petit: 'le ballon' },
        juste: 'Les rollers coûtent {r} €.',
        fausses: [`Le ballon coûte {r} €.`, `Les rollers coûtent {r} € de moins que le ballon.`],
        unite: '€',
      }) },
    // « de plus » dans la question mais c'est une soustraction (comparaison)
    { id: 'marche-3-005', structure: 'CE', themes: ['jouets'], max: 900, sansGrade1: true,   // un vélo à moins de 30 € : invraisemblable
      piegesContexte: [
        { f: () => `Au magasin Rouge, ce vélo coûte {d|€}.`, v: selon([5, 30], [100, 900], [450, 900]) },
        { f: () => `Au magasin Bleu, le casque de vélo coûte {d|€}.`, v: selon([5, 25], [15, 60], [20, 90]) },
      ],
      texte: () => ({
        phrases: [`Au magasin Bleu, le vélo coûte {b|€}.`, `Au magasin Vert, le même vélo coûte {a|€}.`],
        question: "Combien d'euros de plus le vélo coûte-t-il au magasin Bleu ?",
        labels: { grand: 'magasin Bleu', petit: 'magasin Vert' },
        juste: 'Au magasin Bleu, le vélo coûte {r} € de plus.',
        fausses: [`Au magasin Bleu, le vélo coûte {r} €.`, `Les deux vélos coûtent {r} € ensemble.`],
        unite: '€',
      }) },
    // « gagné » mais on connaît le matin et le soir : soustraction
    { id: 'marche-3-006', structure: 'TTg', themes: ['boulangerie'], max: 2000,
      piegesContexte: [
        { f: () => `Le soir, la caisse de la fleuriste contient {d|€}.`, v: selon([5, 30], [100, 999], [1000, 2000]) },
        { f: () => `À la boulangerie, une baguette coûte {d|€}.`, v: () => 1 },
      ],
      texte: () => ({
        phrases: [`Au début de la journée, la caisse de la boulangerie contient {a|€}.`, `Le soir, la caisse de la boulangerie contient {b|€}.`],
        question: "Combien d'argent la boulangère a-t-elle gagné dans la journée ?",
        labels: { tout: 'le soir', p1: 'le matin', p2: 'gagné' },
        juste: 'Dans la journée, la boulangère a gagné {r} €.',
        fausses: [`Le soir, la caisse contient {r} €.`, `Le matin, la caisse contenait {r} €.`],
        unite: '€',
      }) },
    { id: 'marche-3-007', structure: 'CInvP', themes: ['vetements'], max: 80,
      piegesContexte: [
        { f: () => `Dans ce magasin, le bonnet rouge coûte {d|€}.`, v: selon([5, 15], [8, 25], [8, 25]) },
        { f: (A, B) => `${B.n} a acheté un pull à {d|€} l'hiver dernier.`, v: selon([10, 30], [15, 60], [15, 60]) },
      ],
      texte: () => ({
        phrases: [`Le pull rouge coûte {a|€}.`, `Le pull rouge coûte {b|€} de plus que le pull vert.`],
        question: 'Quel est le prix du pull vert ?',
        labels: { grand: 'pull rouge', petit: 'pull vert' },
        juste: 'Le pull vert coûte {r} €.',
        fausses: [`Le pull rouge coûte {r} €.`, `Le pull vert coûte {r} € de plus que le pull rouge.`],
        unite: '€',
      }) },
    // « gagne » mais on cherche ce qu'il y avait avant : soustraction
    { id: 'marche-3-008', structure: 'TIg', themes: ['fruits'], max: 500,
      piegesContexte: [
        { f: () => `Le marchand de fromages a {d|€} dans sa caisse.`, v: selon([5, 30], [50, 500], [100, 500]) },
        { f: () => `Au marché, un kilo de pommes coûte {d|€}.`, v: (niv, rnd) => rnd(2, 4) },
      ],
      texte: () => ({
        phrases: [`La marchande de fruits vend toutes ses pommes et gagne {a|€}.`, `Maintenant, la caisse de la marchande de fruits contient {b|€}.`],
        question: 'Combien y avait-il dans la caisse de la marchande de fruits avant la vente des pommes ?',
        labels: { tout: 'maintenant', p1: 'avant', p2: 'gagné' },
        juste: 'Avant la vente des pommes, il y avait {r} € dans la caisse.',
        fausses: [`La marchande gagne {r} € avec les pommes.`, `Maintenant, la caisse contient {r} €.`],
        unite: '€',
      }) },
    { id: 'marche-3-009', structure: 'CInvM', themes: ['boulangerie', 'fete'], max: 120,
      piegesContexte: [
        { f: () => `À la boulangerie, la tarte aux fraises coûte {d|€}.`, v: selon([8, 25], [10, 40], [10, 40]) },
        { f: () => `Le boulanger prépare {d|gâteaux} chaque samedi.`, v: selon([5, 30], [20, 60], [20, 60]) },
      ],
      texte: () => ({
        phrases: [`À la boulangerie, le gâteau d'anniversaire coûte {a|€}.`, `Le gâteau d'anniversaire coûte {b|€} de moins que la pièce montée.`],
        question: 'Combien coûte la pièce montée ?',
        labels: { grand: 'la pièce montée', petit: 'le gâteau' },
        juste: 'La pièce montée coûte {r} €.',
        fausses: [`Le gâteau d'anniversaire coûte {r} €.`, `La pièce montée coûte {r} € de moins que le gâteau.`],
        unite: '€',
      }) },
    // « rend » fait penser à + : ici on cherche le prix (billet − monnaie)
    { id: 'marche-3-010', structure: 'TTp', themes: ['jouets'], niveaux: [1, 2],
      nombres: (niv, rnd, choix) => {
        const a = niv === 1 ? choix([10, 20]) : choix([50, 100]);
        return { a, b: niv === 1 ? rnd(1, a - 3) : rnd(3, a - 10) };
      },
      piegesContexte: [
        { f: (A, B) => `${B.n} achète un yoyo à {d|€}.`, v: (niv, rnd) => rnd(2, 6) },
        { f: () => `Le magasin de jouets ouvre à {d|heures}.`, v: (niv, rnd) => rnd(9, 10) },
      ],
      texte: A => ({
        phrases: [`${A.n} paie un jeu avec un billet de {a|€}.`, `La vendeuse rend {b|€} ${A.a}.`],
        question: 'Combien coûte le jeu ?',
        labels: { tout: 'le billet', p1: 'le prix', p2: 'la monnaie' },
        juste: 'Le jeu coûte {r} €.',
        fausses: [`La vendeuse rend {r} € ${A.a}.`, `${A.n} paie avec un billet de {r} €.`],
        unite: '€',
      }) },
    { id: 'marche-3-011', structure: 'TIp', themes: ['espace'], max: 500, sansGrade1: true,   // un télescope à moins de 30 € : invraisemblable
      piegesContexte: [
        { f: () => `Au magasin de l'espace, une carte du ciel coûte {d|€}.`, v: selon([3, 10], [5, 20], [5, 20]) },
        { f: (A, B) => `${B.n} a {d|€} dans sa tirelire.`, v: selon([3, 30], [12, 300], [50, 500]) },
      ],
      texte: () => ({
        phrases: [`Alvin achète un télescope à {a|€}.`, `Après cet achat, il reste {b|€} à Alvin.`],
        question: "Combien d'argent Alvin avait-il avant d'acheter le télescope ?",
        labels: { tout: 'avant', p1: 'le télescope', p2: 'qui reste' },
        juste: "Avant d'acheter le télescope, Alvin avait {r} €.",
        fausses: [`Le télescope coûte {r} €.`, `Il reste {r} € à Alvin.`],
        unite: '€',
      }) },

    // =========================================================================
    // QUI… ? et OUI / NON : on calcule, puis on compare
    // =========================================================================
    { id: 'marche-3-012', structure: 'TG', reponse: 'ouinon', ouiSi: 'plus', themes: ['jouets'], niveaux: [1, 2],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [5, 20], [20, 60]), b: tirer(niv, rnd, [3, 10], [10, 40]) }),
      texte: A => ({
        phrases: [`${A.n} a {a|€} dans sa tirelire.`, `En aidant ses voisins, ${A.n} gagne {b|€}.`],
        question: `${A.n} peut-${A.il} acheter un jeu de construction à {c|€} ?`,
        labels: { tout: 'tout son argent', p1: 'la tirelire', p2: 'gagné' },
        etiquettes: { r: `L'argent ${A.de}`, c: 'Le prix du jeu' },
        oui: `Oui, ${A.n} a {r} € et le jeu coûte {c} €.`,
        non: `Non, ${A.n} a seulement {r} € et le jeu coûte {c} €.`,
        fausses: [`${A.n} gagne {r} € en aidant ses voisins.`],
        unite: '€',
      }) },
    { id: 'marche-3-013', structure: 'CT', reponse: 'ouinon', ouiSi: 'moins', themes: ['librairie'], niveaux: [1, 2],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [6, 15], [12, 25]), b: tirer(niv, rnd, [2, 5], [3, 8]) }),
      texte: A => ({
        phrases: [`${A.n} veut acheter un livre à {a|€} et un stylo à {b|€}.`, `${A.n} a {c|€} dans son porte-monnaie.`],
        question: `${A.n} a-t-${A.il} assez d'argent pour acheter le livre et le stylo ?`,
        labels: { tout: 'le livre et le stylo', p1: 'le livre', p2: 'le stylo' },
        etiquettes: { r: 'Le prix des deux', c: `L'argent ${A.de}` },
        oui: `Oui, le livre et le stylo coûtent {r} € et ${A.n} a {c} €.`,
        non: `Non, le livre et le stylo coûtent {r} € et ${A.n} a seulement {c} €.`,
        fausses: [`Le livre coûte {r} €.`],
        unite: '€',
      }) },
    { id: 'marche-3-014', structure: 'TP', reponse: 'ouinon', ouiSi: 'plus', themes: ['jouets'], niveaux: [1, 2],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [15, 30], [30, 80]), b: tirer(niv, rnd, [4, 12], [10, 30]) }),
      texte: A => ({
        phrases: [`${A.n} a {a|€}.`, `Au magasin de jouets, ${A.n} achète une poupée à {b|€}.`],
        question: `Après cet achat, ${A.n} peut-${A.il} acheter un puzzle à {c|€} ?`,
        labels: { tout: 'au début', p1: 'la poupée', p2: 'qui reste' },
        etiquettes: { r: 'Ce qui reste', c: 'Le prix du puzzle' },
        oui: `Oui, il reste {r} € ${A.a} et le puzzle coûte {c} €.`,
        non: `Non, il reste seulement {r} € ${A.a} et le puzzle coûte {c} €.`,
        fausses: [`La poupée coûte {r} €.`],
        unite: '€',
      }) },
    { id: 'marche-3-015', structure: 'CT', reponse: 'qui', themes: ['librairie'], niveaux: [1, 2],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [2, 6], [3, 9]), b: tirer(niv, rnd, [5, 12], [8, 20]) }),
      texte: (A, B) => ({
        phrases: [`À la librairie, ${A.n} achète un cahier à {a|€} et une trousse à {b|€}.`, `${B.n} achète un cartable à {c|€}.`],
        question: 'Qui dépense le plus ?',
        labels: { tout: `achats ${A.de}`, p1: 'le cahier', p2: 'la trousse' },
        candidats: [
          { nom: A.n, k: 'r', phrase: `C'est ${A.n} qui dépense le plus : {r} €.` },
          { nom: B.n, k: 'c', phrase: `C'est ${B.n} qui dépense le plus : {c} €.` },
        ],
        plus: true,
        fausses: [`${A.n} et ${B.n} dépensent autant.`],
        unite: '€',
      }) },
    { id: 'marche-3-016', structure: 'TP', reponse: 'qui', themes: ['boulangerie'], niveaux: [1, 2],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [10, 30], [30, 90]), b: tirer(niv, rnd, [3, 9], [10, 30]) }),
      texte: (A, B) => ({
        phrases: [`Ce matin, ${A.n} avait {a|€}.`, `${A.n} a dépensé {b|€} à la boulangerie.`, `${B.n} a {c|€}.`],
        question: "Qui a le moins d'argent maintenant ?",
        labels: { tout: 'ce matin', p1: 'dépensé', p2: 'qui reste' },
        candidats: [
          { nom: A.n, k: 'r', phrase: `C'est ${A.n} qui a le moins d'argent : {r} €.` },
          { nom: B.n, k: 'c', phrase: `C'est ${B.n} qui a le moins d'argent : {c} €.` },
        ],
        plus: false,
        fausses: [`${A.n} et ${B.n} ont autant d'argent.`],
        unite: '€',
      }) },
    // Le moins cher : il faut additionner les deux prix du magasin Soleil
    { id: 'marche-3-017', structure: 'CT', reponse: 'qui', themes: ['jouets'], niveaux: [1, 2],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [8, 15], [15, 30]), b: tirer(niv, rnd, [3, 8], [5, 12]) }),
      texte: () => ({
        phrases: [`Au magasin Soleil, un ballon coûte {a|€} et une pompe coûte {b|€}.`, `Au magasin Lune, le ballon et la pompe sont vendus ensemble pour {c|€}.`],
        question: 'Dans quel magasin le ballon et la pompe coûtent-ils le moins cher ?',
        labels: { tout: 'au magasin Soleil', p1: 'le ballon', p2: 'la pompe' },
        candidats: [
          { nom: 'au magasin Soleil', k: 'r', phrase: `C'est au magasin Soleil : le ballon et la pompe coûtent {r} €.` },
          { nom: 'au magasin Lune', k: 'c', phrase: `C'est au magasin Lune : le ballon et la pompe coûtent {c} €.` },
        ],
        plus: false,
        fausses: [`Le ballon et la pompe coûtent le même prix dans les deux magasins.`],
        unite: '€',
      }) },
    { id: 'marche-3-018', structure: 'GT', reponse: 'ouinon', ouiSi: 'moins', themes: ['librairie'], niveaux: [1, 2],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [2, 5], [3, 9]), b: tirer(niv, rnd, [2, 5], [2, 9]) }),
      texte: A => ({
        phrases: [`${A.n} veut acheter {a|cahiers} à {b|€} chacun.`, `${A.n} a {c|€} dans son porte-monnaie.`],
        question: `${A.n} a-t-${A.il} assez d'argent pour payer les cahiers ?`,
        labels: { total: 'le prix des cahiers', nb: 'cahiers', taille: "prix d'un cahier" },
        etiquettes: { r: 'Le prix des cahiers', c: `L'argent ${A.de}` },
        oui: `Oui, les cahiers coûtent {r} € et ${A.n} a {c} €.`,
        non: `Non, les cahiers coûtent {r} € et ${A.n} a seulement {c} €.`,
        fausses: [`${A.n} achète {r} cahiers.`],
        unite: '€',
      }) },
    { id: 'marche-3-019', structure: 'GT', reponse: 'qui', themes: ['boulangerie'], niveaux: [1, 2],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [2, 5], [3, 9]), b: tirer(niv, rnd, [2, 5], [2, 6]) }),
      texte: (A, B) => ({
        phrases: [`À la boulangerie, ${A.n} achète {a|paquets} de biscuits à {b|€} le paquet.`, `${B.n} achète une grande tarte à {c|€}.`],
        question: 'Qui dépense le plus à la boulangerie ?',
        labels: { total: `achats ${A.de}`, nb: 'paquets', taille: "prix d'un paquet" },
        candidats: [
          { nom: A.n, k: 'r', phrase: `C'est ${A.n} qui dépense le plus : {r} €.` },
          { nom: B.n, k: 'c', phrase: `C'est ${B.n} qui dépense le plus : {c} €.` },
        ],
        plus: true,
        fausses: [`${A.n} et ${B.n} dépensent autant.`],
        unite: '€',
      }) },
    { id: 'marche-3-020', structure: 'CT', reponse: 'ouinon', ouiSi: 'moins', themes: ['fete'],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [5, 15], [15, 60], [100, 400]), b: tirer(niv, rnd, [3, 10], [10, 40], [50, 300]) }),
      texte: () => ({
        phrases: [`Pour la fête de l'école, la maîtresse dépense {a|€} en ballons et {b|€} en guirlandes.`, `Le budget de la fête est de {c|€}.`],
        question: 'La maîtresse a-t-elle dépensé moins que le budget de la fête ?',
        labels: { tout: 'tout ce qui est dépensé', p1: 'les ballons', p2: 'les guirlandes' },
        etiquettes: { r: 'Les dépenses', c: 'Le budget' },
        oui: 'Oui, la maîtresse a dépensé {r} € et le budget est de {c} €.',
        non: 'Non, la maîtresse a dépensé {r} € et le budget est seulement de {c} €.',
        fausses: [`Les ballons coûtent {r} €.`],
        unite: '€',
      }) },
    { id: 'marche-3-021', structure: 'TG', reponse: 'qui', themes: ['jouets', 'fete'], niveaux: [1, 2],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [5, 20], [20, 80]), b: tirer(niv, rnd, [5, 15], [10, 50]) }),
      texte: (A, B) => ({
        phrases: [`${A.n} a {a|€} dans sa tirelire.`, `Pour son anniversaire, ${A.n} reçoit {b|€}.`, `${B.n} a {c|€} dans sa tirelire.`],
        question: "Qui a le plus d'argent maintenant ?",
        labels: { tout: 'maintenant', p1: 'la tirelire', p2: 'reçu' },
        candidats: [
          { nom: A.n, k: 'r', phrase: `C'est ${A.n} qui a le plus d'argent : {r} €.` },
          { nom: B.n, k: 'c', phrase: `C'est ${B.n} qui a le plus d'argent : {c} €.` },
        ],
        plus: true,
        fausses: [`${A.n} et ${B.n} ont autant d'argent.`],
        unite: '€',
      }) },
    { id: 'marche-3-022', structure: 'TP', reponse: 'ouinon', ouiSi: 'plus', themes: ['vetements'], niveaux: [1, 2],
      nombres: (niv, rnd, choix) => (niv === 1 ? { a: choix([20, 30]), b: rnd(5, 15) } : { a: choix([50, 100]), b: rnd(12, 40) }),
      texte: A => ({
        phrases: [`${A.n} a un bon d'achat de {a|€}.`, `Avec ce bon d'achat, ${A.n} achète un tee-shirt à {b|€}.`],
        question: `Reste-t-il plus de {c|€} sur le bon d'achat ${A.de} ?`,
        labels: { tout: "le bon d'achat", p1: 'le tee-shirt', p2: 'qui reste' },
        etiquettes: { r: 'Ce qui reste', c: 'À comparer' },
        oui: `Oui, il reste {r} € sur le bon d'achat : c'est plus que {c} €.`,
        non: `Non, il reste {r} € sur le bon d'achat : ce n'est pas plus que {c} €.`,
        fausses: [`Le tee-shirt coûte {r} €.`],
        unite: '€',
      }) },

    // =========================================================================
    // IL MANQUE UNE DONNÉE : on ne peut pas savoir
    // =========================================================================
    { id: 'marche-3-023', structure: 'CT', reponse: 'impossible', themes: ['boulangerie', 'fete'], niveaux: [1, 2],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [8, 25], [20, 60]), b: rnd(2, 5) }),
      texte: A => ({
        phrases: [`À la boulangerie, ${A.n} achète un gâteau à {a|€} et des bougies.`],
        question: `Combien ${A.n} paie-t-${A.il} en tout ?`,
        labels: { tout: 'en tout', p1: 'le gâteau', p2: 'les bougies' },
        manque: 'On ne sait pas combien coûtent les bougies.',
        juste: 'On ne peut pas savoir : il manque le prix des bougies.',
      }) },
    { id: 'marche-3-024', structure: 'TP', reponse: 'impossible', themes: ['librairie'], niveaux: [1, 2],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [10, 30], [30, 80]), b: tirer(niv, rnd, [3, 9], [8, 25]) }),
      texte: A => ({
        phrases: [`${A.n} a {a|€}.`, `À la librairie, ${A.n} achète un livre sur les dinosaures.`],
        question: `Combien d'argent reste-t-il à ${A.n} ?`,
        labels: { tout: 'au début', p1: 'le livre', p2: 'qui reste' },
        manque: 'On ne sait pas combien coûte le livre sur les dinosaures.',
        juste: 'On ne peut pas savoir : il manque le prix du livre.',
      }) },
    { id: 'marche-3-025', structure: 'TG', reponse: 'impossible', themes: ['fruits'], max: 500,
      texte: () => ({
        phrases: [`Le matin, la marchande de fruits a {a|€} dans sa caisse.`, `Dans la journée, la marchande vend beaucoup de fruits.`],
        question: "Combien d'argent y a-t-il dans la caisse de la marchande le soir ?",
        labels: { tout: 'le soir', p1: 'le matin', p2: 'gagné' },
        manque: "On ne sait pas combien d'argent la marchande gagne dans la journée.",
        juste: "On ne peut pas savoir : il manque l'argent gagné dans la journée.",
      }) },
    { id: 'marche-3-026', structure: 'GT', reponse: 'impossible', themes: ['librairie'], niveaux: [1, 2],
      texte: A => ({
        phrases: [`Pour la rentrée, ${A.n} achète {a|cahiers}.`, `Tous les cahiers ont le même prix.`],
        question: `Combien ${A.n} paie-t-${A.il} pour les cahiers ?`,
        labels: { total: 'le prix des cahiers', nb: 'cahiers', taille: "prix d'un cahier" },
        manque: 'On ne sait pas combien coûte un cahier.',
        juste: "On ne peut pas savoir : il manque le prix d'un cahier.",
      }) },
    { id: 'marche-3-027', structure: 'CE', reponse: 'impossible', themes: ['jouets'], max: 200,
      texte: () => ({
        phrases: [`Au magasin de jouets, le robot coûte {b|€}.`, `La voiture téléguidée est moins chère que le robot.`],
        question: 'Combien le robot coûte-t-il de plus que la voiture téléguidée ?',
        labels: { grand: 'le robot', petit: 'la voiture' },
        manque: 'On ne sait pas combien coûte la voiture téléguidée.',
        juste: 'On ne peut pas savoir : il manque le prix de la voiture téléguidée.',
      }) },
    { id: 'marche-3-028', structure: 'TP', reponse: 'impossible', themes: ['jouets'], niveaux: [1, 2],
      nombres: (niv, rnd, choix) => {
        const a = niv === 1 ? choix([10, 20, 50]) : choix([50, 100]);
        return { a, b: rnd(2, a - 3) };
      },
      texte: A => ({
        phrases: [`${A.n} paie un puzzle avec un billet de {a|€}.`, `La vendeuse rend la monnaie.`],
        question: `Combien la vendeuse rend-elle ${A.a} ?`,
        labels: { tout: 'le billet', p1: 'le puzzle', p2: 'la monnaie' },
        manque: 'On ne sait pas combien coûte le puzzle.',
        juste: 'On ne peut pas savoir : il manque le prix du puzzle.',
      }) },
    { id: 'marche-3-029', structure: 'GP', reponse: 'impossible', themes: ['fete'], niveaux: [1, 2],
      nombres: (niv, rnd) => { const n = rnd(2, 5), t = tirer(niv, rnd, [3, 8], [5, 12]); return { a: n * t, b: n }; },
      texte: A => ({
        phrases: [`Une pizza géante coûte {a|€}.`, `${A.n} et ses amis partagent ce prix en parts égales.`],
        question: 'Combien chaque enfant doit-il payer ?',
        labels: { total: 'le prix de la pizza', nb: 'enfants', taille: 'pour un enfant' },
        manque: `On ne sait pas combien d'enfants partagent le prix de la pizza.`,
        juste: "On ne peut pas savoir : il manque le nombre d'enfants.",
      }) },

    // =========================================================================
    // PROBLÈMES ORDINAIRES avec des pièges en euros
    // =========================================================================
    { id: 'marche-3-030', structure: 'CT', themes: ['fruits'], niveaux: [1, 2],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [3, 12], [12, 40]), b: tirer(niv, rnd, [2, 9], [10, 30]) }),
      piegesContexte: [
        { f: (A, B) => `${B.n} achète un ananas à {d|€}.`, v: (niv, rnd) => rnd(2, 5) },
        { f: (A, B) => `Au marché, ${B.n} paie ses tomates {d|€}.`, v: selon([2, 9], [5, 20]) },
      ],
      texte: A => ({
        phrases: [`Au marché, ${A.n} achète des cerises pour {a|€}.`, `${A.n} achète des abricots pour {b|€}.`],
        question: `Quel est le prix total des fruits ${A.de} ?`,
        labels: { tout: 'tous les fruits', p1: 'les cerises', p2: 'les abricots' },
        juste: `Les fruits ${A.de} coûtent {r} € en tout.`,
        fausses: [`Les cerises coûtent {r} €.`, `Les abricots coûtent {r} €.`],
        unite: '€',
      }) },
    { id: 'marche-3-031', structure: 'TP', themes: ['boulangerie'], niveaux: [1, 2],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [10, 30], [30, 90]), b: tirer(niv, rnd, [3, 9], [8, 30]) }),
      piegesContexte: [
        { f: (A, B) => `${B.n} a {d|€} dans son porte-monnaie.`, v: selon([5, 30], [10, 90]) },
        { f: (A, B) => `Ce matin, ${B.n} a acheté une tarte à {d|€}.`, v: selon([5, 15], [8, 25]) },
      ],
      texte: A => ({
        phrases: [`${A.n} a {a|€}.`, `À la boulangerie, ${A.n} achète un gâteau à {b|€}.`],
        question: `Combien d'argent reste-t-il à ${A.n} ?`,
        labels: { tout: 'au début', p1: 'le gâteau', p2: 'qui reste' },
        juste: `Il reste {r} € à ${A.n}.`,
        fausses: [`Le gâteau coûte {r} €.`, `Au début, ${A.n} avait {r} €.`],
        unite: '€',
      }) },
    { id: 'marche-3-032', structure: 'GT', themes: ['jouets'], niveaux: [1, 2],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [2, 5], [3, 9]), b: tirer(niv, rnd, [2, 5], [2, 9]) }),
      piegesContexte: [
        { f: (A, B) => `${B.n} achète un camion à {d|€}.`, v: selon([6, 15], [8, 30]) },
        { f: () => `Le garage en plastique du magasin coûte {d|€}.`, v: selon([15, 30], [20, 45]) },
      ],
      texte: A => ({
        phrases: [`${A.n} achète {a|petites voitures} à {b|€} chacune.`],
        question: `Combien ${A.n} paie-t-${A.il} ?`,
        labels: { total: 'le prix total', nb: 'voitures', taille: "prix d'une voiture" },
        juste: `${A.n} paie {r} €.`,
        fausses: [`${A.n} achète {r} petites voitures.`, `Une petite voiture coûte {r} €.`],
        unite: '€',
      }) },
    { id: 'marche-3-033', structure: 'GP', themes: ['fete'],
      nombres: (niv, rnd) => {
        const n = tirer(niv, rnd, [2, 5], [2, 6], [3, 9]), t = tirer(niv, rnd, [3, 9], [5, 15], [11, 30]);
        return { a: n * t, b: n };
      },
      piegesContexte: [
        { f: A => `Le gâteau d'anniversaire ${A.de} a coûté {d|€} à ses parents.`, v: selon([10, 30], [15, 40], [20, 60]) },
        { f: A => `La carte d'anniversaire ${A.de} a coûté {d|€} à sa maîtresse.`, v: (niv, rnd) => rnd(2, 5) },
      ],
      texte: A => ({
        phrases: [`Pour l'anniversaire ${A.de}, {b|amis} achètent ensemble un cadeau à {a|€}.`, `Les amis partagent le prix en parts égales.`],
        question: 'Combien chaque ami paie-t-il ?',
        labels: { total: 'le prix du cadeau', nb: 'amis', taille: 'pour un ami' },
        juste: 'Chaque ami paie {r} €.',
        fausses: [`Le cadeau coûte {r} €.`, `Il y a {r} amis.`],
        unite: '€',
      }) },
    // « en tout » dans l'énoncé, mais il faut soustraire
    { id: 'marche-3-034', structure: 'CP', themes: ['librairie'], niveaux: [1, 2],
      nombres: (niv, rnd) => {
        const b = tirer(niv, rnd, [1, 3], [2, 5]), livre = tirer(niv, rnd, [5, 20], [12, 40]);
        return { a: b + livre, b };
      },
      piegesContexte: [
        { f: (A, B) => `${B.n} achète un album à {d|€}.`, v: selon([5, 15], [10, 30]) },
        { f: () => `À la librairie, un crayon coûte {d|€}.`, v: () => 1 },
      ],
      texte: A => ({
        phrases: [`À la librairie, ${A.n} achète un livre et un marque-page.`, `${A.n} paie {a|€} en tout.`, `Le marque-page coûte {b|€}.`],
        question: 'Combien coûte le livre ?',
        labels: { tout: 'en tout', p1: 'le marque-page', p2: 'le livre' },
        juste: 'Le livre coûte {r} €.',
        fausses: [`${A.n} paie {r} € en tout.`, `Le marque-page coûte {r} €.`],
        unite: '€',
      }) },
    { id: 'marche-3-035', structure: 'CMoins', themes: ['vetements'], niveaux: [1, 2, 3],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [20, 35], [40, 120], [100, 300]), b: tirer(niv, rnd, [5, 15], [15, 50], [40, 150]) }),
      piegesContexte: [
        { f: () => `Dans ce magasin, le bonnet coûte {d|€}.`, v: selon([5, 12], [8, 20], [10, 40]) },
        { f: (A, B) => `${B.n} a acheté des gants à {d|€}.`, v: selon([5, 15], [8, 25], [10, 40]) },
      ],
      texte: () => ({
        phrases: [`Le manteau coûte {a|€}.`, `L'écharpe coûte {b|€} de moins que le manteau.`],
        question: "Combien coûte l'écharpe ?",
        labels: { grand: 'le manteau', petit: "l'écharpe" },
        juste: "L'écharpe coûte {r} €.",
        fausses: [`Le manteau coûte {r} €.`, `L'écharpe coûte {r} € de plus que le manteau.`],
        unite: '€',
      }) },
    { id: 'marche-3-036', structure: 'GT', themes: ['cantine'],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [2, 5], [4, 9], [11, 20]), b: tirer(niv, rnd, [2, 5], [3, 5], [3, 6]) }),
      piegesContexte: [
        { f: () => `Le goûter du mercredi au centre de loisirs coûte {d|€}.`, v: (niv, rnd) => rnd(2, 4) },
        { f: (A, B) => `Ce mois-ci, ${B.n} mange à la cantine {d|jours}.`, v: selon([2, 5], [4, 9], [11, 20]) },
      ],
      texte: A => ({
        phrases: [`Un repas à la cantine coûte {b|€}.`, `Ce mois-ci, ${A.n} mange à la cantine {a|jours}.`],
        question: `Combien coûtent les repas ${A.de} ce mois-ci ?`,
        labels: { total: 'tous les repas', nb: 'jours', taille: "prix d'un repas" },
        juste: `Ce mois-ci, les repas ${A.de} coûtent {r} €.`,
        fausses: [`Un repas coûte {r} €.`, `${A.n} mange {r} jours à la cantine.`],
        unite: '€',
      }) },
    { id: 'marche-3-037', structure: 'CT', themes: ['espace'],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [20, 60], [100, 500], [1000, 3000]), b: tirer(niv, rnd, [10, 30], [50, 300], [300, 1500]) }),
      piegesContexte: [
        { f: A => `${A.n} achète des bottes de l'espace à {d|€}.`, v: selon([10, 30], [50, 200], [200, 900]) },
        { f: () => `Le vendeur du magasin de l'espace travaille depuis {d|ans}.`, v: (niv, rnd) => rnd(3, 20) },
      ],
      texte: () => ({
        phrases: [`Au magasin de l'espace, Alvin achète une combinaison à {a|€}.`, `Au magasin de l'espace, Alvin achète un casque à {b|€}.`],
        question: 'Combien Alvin dépense-t-il en tout ?',
        labels: { tout: 'en tout', p1: 'la combinaison', p2: 'le casque' },
        juste: 'Alvin dépense {r} € en tout.',
        fausses: [`La combinaison coûte {r} €.`, `Le casque coûte {r} €.`],
        unite: '€',
      }) },
    { id: 'marche-3-038', structure: 'TG', themes: ['fruits'], max: 900,
      piegesContexte: [
        { f: () => `Le marchand de poissons a {d|€} dans sa caisse.`, v: selon([5, 40], [50, 500], [100, 900]) },
        { f: () => `Au marché, un kilo de carottes coûte {d|€}.`, v: (niv, rnd) => rnd(2, 3) },
      ],
      texte: () => ({
        phrases: [`Le matin, la marchande de légumes a {a|€} dans sa caisse.`, `L'après-midi, la marchande de légumes vend des légumes pour {b|€}.`],
        question: "Combien d'argent la marchande de légumes a-t-elle dans sa caisse le soir ?",
        labels: { tout: 'le soir', p1: 'le matin', p2: 'vendu' },
        juste: 'Le soir, la marchande a {r} € dans sa caisse.',
        fausses: [`L'après-midi, la marchande vend des légumes pour {r} €.`, `Le matin, la marchande a {r} € dans sa caisse.`],
        unite: '€',
      }) },
    { id: 'marche-3-039', structure: 'GG', themes: ['jouets'],
      nombres: (niv, rnd) => {
        const n = tirer(niv, rnd, [2, 5], [2, 9], [11, 30]), t = tirer(niv, rnd, [2, 5], [2, 9], [2, 6]);
        return { a: n * t, b: t };
      },
      piegesContexte: [
        { f: () => `Au magasin, le circuit de petites voitures coûte {d|€}.`, v: selon([20, 40], [30, 90], [60, 150]) },
        { f: (A, B) => `${B.n} a {d|petites voitures} dans sa chambre.`, v: selon([3, 20], [5, 40], [10, 80]) },
      ],
      texte: A => ({
        phrases: [`${A.n} a {a|€}.`, `Au magasin, les petites voitures coûtent {b|€} chacune.`],
        question: `Combien de petites voitures ${A.n} peut-${A.il} acheter avec tout son argent ?`,
        labels: { total: `l'argent ${A.de}`, nb: 'voitures', taille: "prix d'une voiture" },
        juste: `${A.n} peut acheter {r} petites voitures.`,
        fausses: [`Une petite voiture coûte {r} €.`, `${A.n} a {r} €.`],
        unite: 'petites voitures',
      }) },
    { id: 'marche-3-040', structure: 'CPlus', themes: ['librairie'], niveaux: [1, 2],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [4, 9], [5, 12]), b: tirer(niv, rnd, [5, 15], [10, 30]) }),
      piegesContexte: [
        { f: () => `À la librairie, la bande dessinée coûte {d|€}.`, v: selon([8, 15], [10, 20]) },
        { f: (A, B) => `${B.n} a offert un livre à {d|€} à sa sœur.`, v: selon([5, 15], [8, 25]) },
      ],
      texte: () => ({
        phrases: [`À la librairie, un livre de poche coûte {a|€}.`, `Le grand livre illustré coûte {b|€} de plus que le livre de poche.`],
        question: 'Combien coûte le grand livre illustré ?',
        labels: { grand: 'le livre illustré', petit: 'le livre de poche' },
        juste: 'Le grand livre illustré coûte {r} €.',
        fausses: [`Le livre de poche coûte {r} €.`, `Le livre de poche coûte {r} € de plus que le grand livre.`],
        unite: '€',
      }) },
    { id: 'marche-3-041', structure: 'TP', themes: ['vetements'],
      nombres: (niv, rnd) => ({ a: tirer(niv, rnd, [20, 40], [40, 120], [100, 250]), b: tirer(niv, rnd, [3, 10], [10, 30], [20, 80]) }),
      piegesContexte: [
        { f: () => `Dans ce magasin, les sandales coûtent {d|€}.`, v: selon([10, 25], [15, 50], [30, 90]) },
        { f: () => `Les soldes du magasin durent {d|jours}.`, v: (niv, rnd) => rnd(10, 30) },
      ],
      texte: () => ({
        phrases: [`Le prix des baskets est de {a|€}.`, `Pendant les soldes, le magasin baisse le prix des baskets de {b|€}.`],
        question: 'Quel est le nouveau prix des baskets ?',
        labels: { tout: 'ancien prix', p1: 'la baisse', p2: 'nouveau prix' },
        juste: 'Le nouveau prix des baskets est de {r} €.',
        fausses: [`Le magasin baisse le prix de {r} €.`, `Avant les soldes, les baskets coûtaient {r} €.`],
        unite: '€',
      }) },
    { id: 'marche-3-042', structure: 'FP', themes: ['jouets'],
      nombres: (niv, rnd) => ({ a: rnd(2, 9), b: rnd(2, 5) }),
      piegesContexte: [
        { f: () => `Au magasin de sport, un ballon de basket coûte {d|€}.`, v: (niv, rnd) => rnd(12, 30) },
        { f: (A, B) => `${B.n} a acheté un sifflet à {d|€}.`, v: (niv, rnd) => rnd(1, 4) },
      ],
      texte: () => ({
        phrases: [`Au magasin de sport, une balle en mousse coûte {a|€}.`, `Un ballon de foot coûte {b|fois} plus cher que la balle en mousse.`],
        question: 'Combien coûte le ballon de foot ?',
        labels: { petit: 'la balle', grand: 'le ballon' },
        juste: 'Le ballon de foot coûte {r} €.',
        fausses: [`La balle en mousse coûte {r} €.`, `Le ballon de foot coûte {r} € de plus que la balle.`],
        unite: '€',
      }) },
  ]);
})();
