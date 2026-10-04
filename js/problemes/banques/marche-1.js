'use strict';
/* Marché — banque 1 : la monnaie « additive » en euros entiers (payer, rendre la monnaie, économiser, dépenser,
   comparer des prix). Structures : CT, TG, TP, CP, TTg, TTp, TIg, TIp, CE, CPlus, CMoins, CInvP, CInvM.
   Grade 1 : petits prix (1 à 20 €), totaux ≤ 100 €, billets de 5, 10, 20 et 50 €.
   Grade 2 : jusqu'à quelques centaines d'euros (vélo, console, commandes, recettes d'une journée).
   Grade 3 : grands montants plausibles (recettes d'un mois, camion d'occasion, budget d'une école…).
   Thèmes : fruits, boulangerie, jouets, librairie (parfois fete en plus). */
(() => {
  // Entier entre lo et hi, multiple de « pas »
  const entre = (rnd, lo, hi, pas = 1) => pas * rnd(Math.ceil(lo / pas), Math.floor(hi / pas));

  // Prix « de magasin » : rond, multiple de 5, terminé par 9 (149 €) ou quelconque
  const prixMagasin = (rnd, lo, hi) => {
    const t = rnd(1, 4);
    if (t === 1) return entre(rnd, lo, hi, 10);
    if (t === 2) return entre(rnd, lo, hi, 5);
    if (t === 3) return entre(rnd, lo + 1, hi + 1, 10) - 1;
    return rnd(lo, hi);
  };

  // Billet pour payer un petit prix : le plus petit billet qui suffit, parfois le suivant (maximum 50 €)
  const BILLETS = [5, 10, 20, 50];
  const billetPour = (prix, rnd) => {
    const possibles = BILLETS.filter(b => b > prix);
    if (!possibles.length) return 0;
    return possibles[rnd(1, 4) === 1 ? Math.min(1, possibles.length - 1) : 0];
  };

  // Somme « ronde » donnée pour payer un grand prix : la cinquantaine au-dessus, ou la suivante
  const sommeDonnee = (prix, rnd) => 50 * (Math.floor(prix / 50) + rnd(1, 2));

  Problemes.ajouter('marche', [
    // =========================================================================
    // GRADE 1 : petits achats (CT, TG, TP)
    // =========================================================================
    { id: 'marche-1-001', structure: 'CT', themes: ['fruits'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(5, 12), b: rnd(2, 5) }),
      texte: A => ({
        phrases: [`Au marché, ${A.n} achète un plateau de fraises à {a|€}.`, `${A.n} achète aussi un melon à {b|€}.`],
        question: `Combien ${A.n} paie-t-${A.il} en tout ?`,
        labels: { tout: 'en tout', p1: 'les fraises', p2: 'le melon' },
        juste: `${A.n} paie {r} € en tout.`,
        fausses: [`Le plateau de fraises coûte {r} €.`, `Le melon coûte {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-002', structure: 'CT', themes: ['boulangerie'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(14, 28), b: rnd(6, 12) }),
      texte: (A, B) => ({
        phrases: [`Pour l'anniversaire ${B.de}, ${A.n} commande un gâteau au chocolat à {a|€}.`, `${A.n} prend aussi une boîte de macarons à {b|€}.`],
        question: `Combien ${A.n} doit-${A.il} payer au boulanger ?`,
        labels: { tout: 'à payer', p1: 'le gâteau', p2: 'les macarons' },
        juste: `${A.n} doit payer {r} € au boulanger.`,
        fausses: [`Le gâteau au chocolat coûte {r} €.`, `La boîte de macarons coûte {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-003', structure: 'CT', themes: ['jouets'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(6, 15), b: rnd(3, 9) }),
      texte: A => ({
        phrases: [`Au magasin de jouets, ${A.n} choisit un ballon de football à {a|€}.`, `${A.n} prend aussi une corde à sauter à {b|€}.`],
        question: `Quel est le prix des deux jouets ensemble ?`,
        labels: { tout: 'les deux jouets', p1: 'le ballon', p2: 'la corde' },
        juste: `Les deux jouets coûtent {r} € ensemble.`,
        fausses: [`Le ballon de football coûte {r} €.`, `La corde à sauter coûte {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-004', structure: 'CT', themes: ['librairie'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(9, 16), b: rnd(5, 14) }),
      texte: A => ({
        phrases: [`À la librairie, ${A.n} achète une bande dessinée à {a|€}.`, `${A.n} achète aussi un livre de contes à {b|€}.`],
        question: `Combien ${A.n} dépense-t-${A.il} à la librairie ?`,
        labels: { tout: 'dépensé', p1: 'la bande dessinée', p2: 'les contes' },
        juste: `${A.n} dépense {r} € à la librairie.`,
        fausses: [`La bande dessinée coûte {r} €.`, `Le livre de contes coûte {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-005', structure: 'CT', themes: ['fruits'], niveaux: [1, 2],
      nombres: (niv, rnd) => (niv === 1 ? { a: rnd(25, 55), b: rnd(15, 40) } : { a: rnd(110, 320), b: rnd(100, 280) }),
      texte: () => ({
        phrases: [`Ce matin, la marchande de fruits a gagné {a|€} en vendant des pommes.`, `Elle a aussi gagné {b|€} en vendant des bananes.`],
        question: `Combien d'argent la marchande a-t-elle gagné ce matin ?`,
        labels: { tout: 'ce matin', p1: 'les pommes', p2: 'les bananes' },
        juste: `La marchande a gagné {r} € ce matin.`,
        fausses: [`La marchande a gagné {r} € avec les pommes.`, `La marchande a gagné {r} € avec les bananes.`],
        unite: '€',
      }) },

    { id: 'marche-1-006', structure: 'TP', themes: ['jouets'], niveaux: [1],
      nombres: (niv, rnd) => { const prix = rnd(3, 12); return { a: billetPour(prix, rnd), b: prix }; },
      texte: A => ({
        phrases: [`${A.n} achète une toupie à {b|€}.`, `${A.n} donne un billet de {a|€} au vendeur.`],
        question: `Combien le vendeur doit-il rendre à ${A.n} ?`,
        labels: { tout: 'le billet', p1: 'la toupie', p2: 'la monnaie' },
        juste: `Le vendeur doit rendre {r} € à ${A.n}.`,
        fausses: [`La toupie coûte {r} €.`, `${A.n} donne {r} € au vendeur.`],
        unite: '€',
      }) },

    { id: 'marche-1-007', structure: 'TP', themes: ['fruits'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(12, 30), b: rnd(4, 9) }),
      texte: A => ({
        phrases: [`${A.n} a {a|€} dans son porte-monnaie.`, `Au marché, ${A.n} achète un panier de cerises à {b|€}.`],
        question: `Combien d'argent reste-t-il à ${A.n} ?`,
        labels: { tout: 'au début', p1: 'les cerises', p2: 'qui reste' },
        juste: `Il reste {r} € à ${A.n}.`,
        fausses: [`${A.n} avait {r} € au début.`, `Le panier de cerises coûte {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-008', structure: 'TP', themes: ['boulangerie'], niveaux: [1],
      nombres: (niv, rnd) => { const prix = rnd(3, 9); return { a: billetPour(prix, rnd), b: prix }; },
      texte: A => ({
        phrases: [`Pour le petit déjeuner, ${A.n} achète des croissants pour {b|€}.`, `${A.n} paie avec un billet de {a|€}.`],
        question: `Combien d'argent le boulanger rend-il à ${A.n} ?`,
        labels: { tout: 'le billet', p1: 'les croissants', p2: 'la monnaie' },
        juste: `Le boulanger rend {r} € à ${A.n}.`,
        fausses: [`Les croissants coûtent {r} €.`, `${A.n} paie avec un billet de {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-009', structure: 'TP', themes: ['librairie'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(10, 25), b: rnd(3, 8) }),
      texte: A => ({
        phrases: [`${A.n} a {a|€} d'argent de poche.`, `À la librairie, ${A.n} achète un album de coloriage à {b|€}.`],
        question: `Après cet achat, combien d'argent ${A.n} a-t-${A.il} encore ?`,
        labels: { tout: 'argent de poche', p1: "l'album", p2: 'encore' },
        juste: `${A.n} a encore {r} €.`,
        fausses: [`${A.n} avait {r} € d'argent de poche.`, `L'album de coloriage coûte {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-010', structure: 'TG', themes: ['jouets'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(8, 45), b: entre(rnd, 10, 30, 5) }),
      texte: A => ({
        phrases: [`${A.n} économise pour s'acheter un jeu de construction.`, `Dans sa tirelire, ${A.n} a {a|€}.`, `Pour son anniversaire, ${A.n} reçoit {b|€}.`],
        question: `Combien d'argent ${A.n} a-t-${A.il} maintenant ?`,
        labels: { tout: 'maintenant', p1: 'la tirelire', p2: "l'anniversaire" },
        juste: `${A.n} a maintenant {r} €.`,
        fausses: [`${A.n} reçoit {r} € pour son anniversaire.`, `Avant son anniversaire, ${A.n} avait {r} € dans sa tirelire.`],
        unite: '€',
      }) },

    { id: 'marche-1-011', structure: 'CT', themes: ['librairie'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(20, 45), b: rnd(4, 12) }),
      texte: A => ({
        phrases: [`Pour la rentrée, ${A.n} achète un cartable à {a|€}.`, `${A.n} achète aussi une trousse à {b|€}.`],
        question: `Combien ${A.n} dépense-t-${A.il} pour la rentrée ?`,
        labels: { tout: 'en tout', p1: 'le cartable', p2: 'la trousse' },
        juste: `${A.n} dépense {r} € pour la rentrée.`,
        fausses: [`Le cartable coûte {r} €.`, `La trousse coûte {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-012', structure: 'CT', themes: ['jouets'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(8, 19), b: rnd(3, 9) }),
      texte: (A, B) => ({
        phrases: [`${A.n} achète une peluche et un jeu de cartes pour ${B.n}.`, `La peluche coûte {a|€} et le jeu de cartes coûte {b|€}.`],
        question: `Combien coûtent les deux cadeaux ensemble ?`,
        labels: { tout: 'les deux cadeaux', p1: 'la peluche', p2: 'le jeu de cartes' },
        juste: `Les deux cadeaux coûtent {r} € ensemble.`,
        fausses: [`La peluche coûte {r} €.`, `Le jeu de cartes coûte {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-013', structure: 'CT', themes: ['fruits'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(4, 9), b: rnd(2, 6) }),
      texte: A => ({
        phrases: [`Pour faire une salade de fruits, ${A.n} achète des mangues pour {a|€}.`, `${A.n} achète aussi des kiwis pour {b|€}.`],
        question: `Combien ${A.n} doit-${A.il} payer à la marchande ?`,
        labels: { tout: 'à payer', p1: 'les mangues', p2: 'les kiwis' },
        juste: `${A.n} doit payer {r} € à la marchande.`,
        fausses: [`Les mangues coûtent {r} €.`, `Les kiwis coûtent {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-014', structure: 'TP', themes: ['fruits'], niveaux: [1],
      nombres: (niv, rnd, choix) => ({ a: choix([10, 15, 20, 25, 30, 40, 50]), b: rnd(3, 14) }),
      texte: A => ({
        phrases: [`${A.n} va au marché avec {a|€}.`, `${A.n} dépense {b|€} pour acheter des pommes et des poires.`],
        question: `Avec combien d'argent ${A.n} rentre-t-${A.il} à la maison ?`,
        labels: { tout: 'au départ', p1: 'dépensé', p2: 'au retour' },
        juste: `${A.n} rentre à la maison avec {r} €.`,
        fausses: [`${A.n} dépense {r} € au marché.`, `${A.n} part au marché avec {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-015', structure: 'TP', themes: ['jouets'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(30, 70), b: rnd(15, 29) }),
      texte: A => ({
        phrases: [`${A.n} a {a|€} dans sa tirelire.`, `${A.n} achète une voiture télécommandée à {b|€}.`],
        question: `Combien d'argent reste-t-il dans la tirelire ${A.de} ?`,
        labels: { tout: 'la tirelire', p1: 'la voiture', p2: 'qui reste' },
        juste: `Il reste {r} € dans la tirelire ${A.de}.`,
        fausses: [`La voiture télécommandée coûte {r} €.`, `Avant son achat, ${A.n} avait {r} € dans sa tirelire.`],
        unite: '€',
      }) },

    { id: 'marche-1-016', structure: 'CT', themes: ['boulangerie', 'fete'], niveaux: [1, 2],
      nombres: (niv, rnd) => (niv === 1 ? { a: rnd(20, 50), b: rnd(15, 45) } : { a: rnd(110, 450), b: rnd(100, 400) }),
      texte: () => ({
        phrases: [`À la kermesse, le stand de gâteaux gagne {a|€} le matin.`, `L'après-midi, le stand de gâteaux gagne {b|€}.`],
        question: `Combien d'argent le stand de gâteaux gagne-t-il dans la journée ?`,
        labels: { tout: 'la journée', p1: 'le matin', p2: "l'après-midi" },
        juste: `Le stand de gâteaux gagne {r} € dans la journée.`,
        fausses: [`Le stand de gâteaux gagne {r} € le matin.`, `Le stand de gâteaux gagne {r} € l'après-midi.`],
        unite: '€',
      }) },

    { id: 'marche-1-017', structure: 'TG', themes: ['librairie'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(4, 15), b: rnd(2, 10) }),
      texte: (A, B) => ({
        phrases: [`${A.n} veut acheter un livre sur les dinosaures.`, `${A.n} a {a|€}.`, `${B.n} donne {b|€} ${A.a}.`],
        question: `Combien d'argent ${A.n} a-t-${A.il} maintenant ?`,
        labels: { tout: 'maintenant', p1: 'au début', p2: 'donné par ' + B.n },
        juste: `${A.n} a maintenant {r} €.`,
        fausses: [`${B.n} donne {r} € ${A.a}.`, `${A.n} avait {r} € au début.`],
        unite: '€',
      }) },

    { id: 'marche-1-018', structure: 'TP', themes: ['librairie'], niveaux: [1],
      nombres: (niv, rnd) => { const prix = rnd(11, 19); return { a: billetPour(prix, rnd), b: prix }; },
      texte: A => ({
        phrases: [`À la librairie, un livre de recettes coûte {b|€}.`, `${A.n} achète ce livre avec un billet de {a|€}.`],
        question: `Combien la libraire rend-elle à ${A.n} ?`,
        labels: { tout: 'le billet', p1: 'le livre', p2: 'la monnaie' },
        juste: `La libraire rend {r} € à ${A.n}.`,
        fausses: [`Le livre de recettes coûte {r} €.`, `${A.n} paie avec un billet de {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-019', structure: 'TP', themes: ['boulangerie'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(20, 40), b: rnd(8, 18) }),
      texte: A => ({
        phrases: [`En janvier, ${A.n} achète une galette des rois à {b|€}.`, `Avant cet achat, ${A.n} avait {a|€}.`],
        question: `Combien d'argent ${A.n} a-t-${A.il} maintenant ?`,
        labels: { tout: 'avant', p1: 'la galette', p2: 'maintenant' },
        juste: `${A.n} a maintenant {r} €.`,
        fausses: [`La galette des rois coûte {r} €.`, `${A.n} avait {r} € avant son achat.`],
        unite: '€',
      }) },

    { id: 'marche-1-020', structure: 'CT', themes: ['fruits'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(3, 7), b: rnd(4, 9) }),
      texte: A => ({
        phrases: [`La marchande vend un ananas à {a|€} et un sac d'oranges à {b|€}.`, `${A.n} achète l'ananas et le sac d'oranges.`],
        question: `Combien ${A.n} paie-t-${A.il} ?`,
        labels: { tout: 'à payer', p1: "l'ananas", p2: 'les oranges' },
        juste: `${A.n} paie {r} €.`,
        fausses: [`L'ananas coûte {r} €.`, `Le sac d'oranges coûte {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-021', structure: 'CT', themes: ['jouets'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(6, 15), b: rnd(2, 5) }),
      texte: A => ({
        phrases: [`Au vide-grenier, ${A.n} vend ses petites voitures pour {a|€}.`, `${A.n} vend aussi un vieux puzzle pour {b|€}.`],
        question: `Combien d'argent ${A.n} gagne-t-${A.il} au vide-grenier ?`,
        labels: { tout: 'en tout', p1: 'les voitures', p2: 'le puzzle' },
        juste: `${A.n} gagne {r} € au vide-grenier.`,
        fausses: [`${A.n} vend ses petites voitures pour {r} €.`, `${A.n} vend le puzzle pour {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-022', structure: 'TP', themes: ['librairie'], niveaux: [1],
      nombres: (niv, rnd) => { const prix = rnd(3, 8); return { a: billetPour(prix, rnd), b: prix }; },
      texte: A => ({
        phrases: [`Au kiosque, ${A.n} achète un magazine sur les animaux.`, `Le magazine coûte {b|€}.`, `${A.n} paie avec un billet de {a|€}.`],
        question: `Combien d'argent le marchand de journaux doit-il rendre à ${A.n} ?`,
        labels: { tout: 'le billet', p1: 'le magazine', p2: 'la monnaie' },
        juste: `Le marchand de journaux doit rendre {r} € à ${A.n}.`,
        fausses: [`Le magazine coûte {r} €.`, `${A.n} paie avec un billet de {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-023', structure: 'CT', themes: ['librairie'], niveaux: [1, 2],
      nombres: (niv, rnd) => (niv === 1 ? { a: rnd(20, 50), b: rnd(10, 40) } : { a: rnd(110, 350), b: rnd(60, 250) }),
      texte: () => ({
        phrases: [`Pour la classe, la maîtresse achète des cahiers pour {a|€}.`, `Elle achète aussi des crayons de couleur pour {b|€}.`],
        question: `Combien la maîtresse dépense-t-elle en tout ?`,
        labels: { tout: 'en tout', p1: 'les cahiers', p2: 'les crayons' },
        juste: `La maîtresse dépense {r} € en tout.`,
        fausses: [`Les cahiers coûtent {r} €.`, `Les crayons de couleur coûtent {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-024', structure: 'TG', themes: ['fruits'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(20, 70), b: rnd(3, 12) }),
      texte: () => ({
        phrases: [`Il y a {a|€} dans la caisse de la marchande de fruits.`, `Un client achète des fraises et paie {b|€}.`],
        question: `Combien d'argent y a-t-il maintenant dans la caisse ?`,
        labels: { tout: 'maintenant', p1: 'avant', p2: 'les fraises' },
        juste: `Il y a maintenant {r} € dans la caisse.`,
        fausses: [`Le client paie {r} €.`, `Avant, il y avait {r} € dans la caisse.`],
        unite: '€',
      }) },

    // =========================================================================
    // GRADE 2 : jusqu'à quelques centaines d'euros
    // =========================================================================
    { id: 'marche-1-025', structure: 'TG', themes: ['jouets'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: rnd(60, 250), b: entre(rnd, 20, 150, 10) }),
      texte: A => ({
        phrases: [`${A.n} économise pour acheter une trottinette électrique.`, `${A.n} a déjà {a|€} dans sa tirelire.`, `Pour Noël, ${A.n} reçoit {b|€}.`],
        question: `Combien d'argent ${A.n} a-t-${A.il} maintenant ?`,
        labels: { tout: 'maintenant', p1: 'économisé', p2: 'reçu à Noël' },
        juste: `${A.n} a maintenant {r} €.`,
        fausses: [`${A.n} reçoit {r} € pour Noël.`, `${A.n} avait {r} € avant Noël.`],
        unite: '€',
      }) },

    { id: 'marche-1-026', structure: 'CT', themes: ['jouets'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: prixMagasin(rnd, 120, 390), b: prixMagasin(rnd, 19, 65) }),
      texte: A => ({
        phrases: [`La famille ${A.de} achète un vélo à {a|€}.`, `La famille achète aussi un casque à {b|€}.`],
        question: `Combien la famille ${A.de} paie-t-elle en tout ?`,
        labels: { tout: 'en tout', p1: 'le vélo', p2: 'le casque' },
        juste: `La famille ${A.de} paie {r} € en tout.`,
        fausses: [`Le vélo coûte {r} €.`, `Le casque coûte {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-027', structure: 'CT', themes: ['jouets'], niveaux: [2, 3],
      nombres: (niv, rnd) => (niv === 2 ? { a: rnd(150, 520), b: rnd(130, 470) } : { a: rnd(1200, 4800), b: rnd(900, 4500) }),
      texte: () => ({
        phrases: [`Samedi, le magasin de jouets a gagné {a|€}.`, `Dimanche, le magasin a gagné {b|€}.`],
        question: `Combien le magasin de jouets a-t-il gagné pendant le week-end ?`,
        labels: { tout: 'le week-end', p1: 'samedi', p2: 'dimanche' },
        juste: `Le magasin de jouets a gagné {r} € pendant le week-end.`,
        fausses: [`Le magasin de jouets a gagné {r} € samedi.`, `Le magasin de jouets a gagné {r} € dimanche.`],
        unite: '€',
      }) },

    { id: 'marche-1-028', structure: 'CT', themes: ['librairie'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: rnd(120, 450), b: rnd(90, 380) }),
      texte: () => ({
        phrases: [`Pour la bibliothèque de l'école, le directeur commande des albums pour {a|€}.`, `Il commande aussi des dictionnaires pour {b|€}.`],
        question: `Combien coûte toute la commande ?`,
        labels: { tout: 'la commande', p1: 'les albums', p2: 'les dictionnaires' },
        juste: `Toute la commande coûte {r} €.`,
        fausses: [`Les albums coûtent {r} €.`, `Les dictionnaires coûtent {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-029', structure: 'TP', themes: ['jouets'], niveaux: [2], limites: { r: [2, 100] },
      nombres: (niv, rnd) => { const prix = prixMagasin(rnd, 180, 449); return { a: sommeDonnee(prix, rnd), b: prix }; },
      texte: A => ({
        phrases: [`${A.n} achète une console de jeux d'occasion à {b|€}.`, `${A.n} donne {a|€} au vendeur.`],
        question: `Combien le vendeur rend-il à ${A.n} ?`,
        labels: { tout: 'donné', p1: 'la console', p2: 'la monnaie' },
        juste: `Le vendeur rend {r} € à ${A.n}.`,
        fausses: [`La console coûte {r} €.`, `${A.n} donne {r} € au vendeur.`],
        unite: '€',
      }) },

    { id: 'marche-1-030', structure: 'TP', themes: ['librairie'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: entre(rnd, 300, 900, 50), b: prixMagasin(rnd, 120, 280) }),
      texte: () => ({
        phrases: [`La bibliothèque de l'école peut dépenser {a|€} pour acheter des livres.`, `La bibliothécaire choisit d'abord une encyclopédie à {b|€}.`],
        question: `Combien d'argent reste-t-il pour acheter d'autres livres ?`,
        labels: { tout: 'au début', p1: "l'encyclopédie", p2: 'qui reste' },
        juste: `Il reste {r} € pour acheter d'autres livres.`,
        fausses: [`L'encyclopédie coûte {r} €.`, `La bibliothèque peut dépenser {r} € en tout.`],
        unite: '€',
      }) },

    { id: 'marche-1-031', structure: 'TP', themes: ['fruits'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: entre(rnd, 300, 900, 10), b: prixMagasin(rnd, 90, 290) }),
      texte: () => ({
        phrases: [`La marchande de fruits a {a|€} d'économies.`, `La marchande achète une nouvelle balance à {b|€}.`],
        question: `Combien d'argent reste-t-il à la marchande ?`,
        labels: { tout: 'économies', p1: 'la balance', p2: 'qui reste' },
        juste: `Il reste {r} € à la marchande.`,
        fausses: [`La nouvelle balance coûte {r} €.`, `La marchande avait {r} € d'économies.`],
        unite: '€',
      }) },

    { id: 'marche-1-032', structure: 'CP', themes: ['librairie'], niveaux: [2],
      nombres: (niv, rnd) => { const b = prixMagasin(rnd, 45, 99), r = rnd(15, 35); return { a: b + r, b }; },
      texte: A => ({
        phrases: [`À la librairie, ${A.n} achète un globe terrestre et un atlas.`, `${A.n} paie {a|€} pour les deux.`, `Le globe terrestre coûte {b|€}.`],
        question: `Combien coûte l'atlas ?`,
        labels: { tout: 'les deux', p1: 'le globe', p2: "l'atlas" },
        juste: `L'atlas coûte {r} €.`,
        fausses: [`Le globe terrestre coûte {r} €.`, `${A.n} paie {r} € pour les deux.`],
        unite: '€',
      }) },

    { id: 'marche-1-033', structure: 'CP', themes: ['jouets'], niveaux: [2],
      nombres: (niv, rnd) => { const b = prixMagasin(rnd, 150, 390), r = prixMagasin(rnd, 60, 180); return { a: b + r, b }; },
      texte: A => ({
        phrases: [`Pour Noël, ${A.n} reçoit un trampoline et une balançoire.`, `Les deux cadeaux coûtent {a|€} en tout.`, `Le trampoline coûte {b|€}.`],
        question: `Quel est le prix de la balançoire ?`,
        labels: { tout: 'les deux cadeaux', p1: 'le trampoline', p2: 'la balançoire' },
        juste: `La balançoire coûte {r} €.`,
        fausses: [`Le trampoline coûte {r} €.`, `Les deux cadeaux coûtent {r} € en tout.`],
        unite: '€',
      }) },

    { id: 'marche-1-034', structure: 'CP', themes: ['boulangerie'], niveaux: [2],
      nombres: (niv, rnd) => { const b = rnd(300, 600), r = rnd(150, 390); return { a: b + r, b }; },
      texte: () => ({
        phrases: [`Aujourd'hui, le boulanger a gagné {a|€} en tout.`, `Le boulanger a gagné {b|€} en vendant du pain.`, `Le reste vient de la vente des gâteaux.`],
        question: `Combien le boulanger a-t-il gagné avec les gâteaux ?`,
        labels: { tout: 'en tout', p1: 'le pain', p2: 'les gâteaux' },
        juste: `Le boulanger a gagné {r} € avec les gâteaux.`,
        fausses: [`Le boulanger a gagné {r} € avec le pain.`, `Le boulanger a gagné {r} € en tout aujourd'hui.`],
        unite: '€',
      }) },

    { id: 'marche-1-035', structure: 'TTg', themes: ['jouets'], niveaux: [2],
      nombres: (niv, rnd) => { const a = entre(rnd, 50, 200, 10); return { a, b: a + rnd(150, 700) }; },
      texte: () => ({
        phrases: [`Ce matin, il y avait {a|€} dans la caisse du magasin de jouets.`, `Ce soir, il y a {b|€} dans la caisse.`],
        question: `Combien d'argent le magasin a-t-il gagné aujourd'hui ?`,
        labels: { tout: 'ce soir', p1: 'ce matin', p2: 'gagné' },
        juste: `Le magasin a gagné {r} € aujourd'hui.`,
        fausses: [`Ce soir, il y a {r} € dans la caisse.`, `Ce matin, il y avait {r} € dans la caisse.`],
        unite: '€',
      }) },

    { id: 'marche-1-036', structure: 'TTg', themes: ['fruits'], niveaux: [2],
      nombres: (niv, rnd) => { const a = rnd(40, 300); return { a, b: a + rnd(60, 250) }; },
      texte: A => ({
        phrases: [`Tout l'été, ${A.n} aide la marchande de fruits au marché.`, `Au début de l'été, ${A.n} avait {a|€}.`, `À la fin de l'été, ${A.n} a {b|€}.`],
        question: `Combien d'argent ${A.n} a-t-${A.il} gagné pendant l'été ?`,
        labels: { tout: "fin de l'été", p1: "début de l'été", p2: 'gagné' },
        juste: `${A.n} a gagné {r} € pendant l'été.`,
        fausses: [`${A.n} a {r} € à la fin de l'été.`, `${A.n} avait {r} € au début de l'été.`],
        unite: '€',
      }) },

    { id: 'marche-1-037', structure: 'TTp', themes: ['librairie'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: entre(rnd, 200, 600, 10), b: rnd(15, 140) }),
      texte: () => ({
        phrases: [`La maîtresse entre à la librairie avec {a|€} pour acheter les livres de la classe.`, `Quand la maîtresse sort de la librairie, il lui reste {b|€}.`],
        question: `Combien d'argent la maîtresse a-t-elle dépensé ?`,
        labels: { tout: 'en entrant', p1: 'dépensé', p2: 'en sortant' },
        juste: `La maîtresse a dépensé {r} €.`,
        fausses: [`Il reste {r} € à la maîtresse.`, `La maîtresse avait {r} € en entrant.`],
        unite: '€',
      }) },

    { id: 'marche-1-038', structure: 'TTp', themes: ['jouets'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: rnd(110, 300), b: rnd(12, 95) }),
      texte: A => ({
        phrases: [`Au début des vacances, ${A.n} a {a|€} dans sa tirelire.`, `Pendant les vacances, ${A.n} achète des jeux et des jouets.`, `À la fin des vacances, il reste {b|€} dans la tirelire.`],
        question: `Combien d'argent ${A.n} a-t-${A.il} dépensé pendant les vacances ?`,
        labels: { tout: 'au début', p1: 'dépensé', p2: 'à la fin' },
        juste: `${A.n} a dépensé {r} € pendant les vacances.`,
        fausses: [`Il reste {r} € dans la tirelire.`, `${A.n} avait {r} € au début des vacances.`],
        unite: '€',
      }) },

    { id: 'marche-1-039', structure: 'CE', themes: ['jouets'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: prixMagasin(rnd, 120, 260), b: prixMagasin(rnd, 280, 450) }),
      texte: () => ({
        phrases: [`Au magasin, une console de jeux coûte {b|€}.`, `Un vélo coûte {a|€}.`],
        question: `Combien la console coûte-t-elle de plus que le vélo ?`,
        labels: { grand: 'la console', petit: 'le vélo' },
        juste: `La console coûte {r} € de plus que le vélo.`,
        fausses: [`La console coûte {r} €.`, `La console et le vélo coûtent {r} € ensemble.`],
        unite: '€',
      }) },

    { id: 'marche-1-040', structure: 'CE', themes: ['librairie'], niveaux: [2],
      nombres: (niv, rnd) => { const a = rnd(40, 200); return { a, b: a + rnd(25, 300) }; },
      texte: (A, B) => ({
        phrases: [`Pour la foire aux livres, ${A.n} a économisé {a|€}.`, `${B.n} a économisé {b|€}.`],
        question: `Combien ${B.n} a-t-${B.il} économisé de plus ${A.que} ?`,
        labels: { grand: B.n, petit: A.n },
        juste: `${B.n} a économisé {r} € de plus ${A.que}.`,
        fausses: [`${B.n} a économisé {r} €.`, `${A.n} et ${B.n} ont économisé {r} € en tout.`],
        unite: '€',
      }) },

    { id: 'marche-1-041', structure: 'CE', themes: ['fruits'], niveaux: [2],
      nombres: (niv, rnd) => { const a = rnd(100, 400); return { a, b: a + rnd(40, 350) }; },
      texte: () => ({
        phrases: [`Samedi, au marché, la marchande de pommes a gagné {a|€}.`, `La marchande de cerises a gagné {b|€}.`],
        question: `Combien la marchande de cerises a-t-elle gagné de plus que la marchande de pommes ?`,
        labels: { grand: 'les cerises', petit: 'les pommes' },
        juste: `La marchande de cerises a gagné {r} € de plus que la marchande de pommes.`,
        fausses: [`La marchande de cerises a gagné {r} €.`, `Les deux marchandes ont gagné {r} € en tout.`],
        unite: '€',
      }) },

    { id: 'marche-1-042', structure: 'CPlus', themes: ['jouets'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: prixMagasin(rnd, 45, 120), b: prixMagasin(rnd, 130, 300) }),
      texte: () => ({
        phrases: [`Une paire de rollers coûte {a|€}.`, `Une trottinette électrique coûte {b|€} de plus que les rollers.`],
        question: `Combien coûte la trottinette électrique ?`,
        labels: { grand: 'la trottinette', petit: 'les rollers' },
        juste: `La trottinette électrique coûte {r} €.`,
        fausses: [`Les rollers coûtent {r} €.`, `La trottinette coûte {r} € de plus que les rollers.`],
        unite: '€',
      }) },

    { id: 'marche-1-043', structure: 'CPlus', themes: ['librairie'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: prixMagasin(rnd, 25, 60), b: prixMagasin(rnd, 90, 200) }),
      texte: () => ({
        phrases: [`À la librairie, un dictionnaire illustré coûte {a|€}.`, `Une grande encyclopédie des animaux coûte {b|€} de plus que le dictionnaire.`],
        question: `Quel est le prix de l'encyclopédie ?`,
        labels: { grand: "l'encyclopédie", petit: 'le dictionnaire' },
        juste: `L'encyclopédie coûte {r} €.`,
        fausses: [`Le dictionnaire coûte {r} €.`, `L'encyclopédie coûte {r} € de plus que le dictionnaire.`],
        unite: '€',
      }) },

    { id: 'marche-1-044', structure: 'CMoins', themes: ['boulangerie', 'fete'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: prixMagasin(rnd, 250, 600), b: prixMagasin(rnd, 80, 200) }),
      texte: () => ({
        phrases: [`Chez le pâtissier, une pièce montée pour un mariage coûte {a|€}.`, `Un gâteau d'anniversaire géant coûte {b|€} de moins.`],
        question: `Combien coûte le gâteau d'anniversaire géant ?`,
        labels: { grand: 'la pièce montée', petit: 'le gâteau géant' },
        juste: `Le gâteau d'anniversaire géant coûte {r} €.`,
        fausses: [`La pièce montée coûte {r} €.`, `Le gâteau géant coûte {r} € de moins que la pièce montée.`],
        unite: '€',
      }) },

    { id: 'marche-1-045', structure: 'CMoins', themes: ['jouets'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: rnd(120, 450), b: rnd(20, 100) }),
      texte: (A, B) => ({
        phrases: [`${A.n} et ${B.n} économisent pour s'acheter une console.`, `${A.n} a {a|€}.`, `${B.n} a {b|€} de moins ${A.que}.`],
        question: `Combien d'argent ${B.n} a-t-${B.il} ?`,
        labels: { grand: A.n, petit: B.n },
        juste: `${B.n} a {r} €.`,
        fausses: [`${A.n} a {r} €.`, `${B.n} a {r} € de moins ${A.que}.`],
        unite: '€',
      }) },

    { id: 'marche-1-046', structure: 'CE', themes: ['boulangerie'], niveaux: [2],
      nombres: (niv, rnd) => { const a = rnd(300, 600); return { a, b: a + rnd(80, 380) }; },
      texte: () => ({
        phrases: [`Lundi, la boulangerie a gagné {a|€}.`, `Dimanche, la boulangerie a gagné {b|€}.`],
        question: `Combien d'argent la boulangerie a-t-elle gagné de plus dimanche que lundi ?`,
        labels: { grand: 'dimanche', petit: 'lundi' },
        juste: `La boulangerie a gagné {r} € de plus dimanche que lundi.`,
        fausses: [`Dimanche, la boulangerie a gagné {r} €.`, `Lundi et dimanche, la boulangerie a gagné {r} € en tout.`],
        unite: '€',
      }) },

    { id: 'marche-1-047', structure: 'CT', themes: ['fruits'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: rnd(110, 380), b: rnd(90, 350) }),
      texte: () => ({
        phrases: [`Pour son stand du marché, la marchande achète des caisses de pommes pour {a|€}.`, `La marchande achète aussi des caisses de poires pour {b|€}.`],
        question: `Combien la marchande dépense-t-elle en tout ?`,
        labels: { tout: 'en tout', p1: 'les pommes', p2: 'les poires' },
        juste: `La marchande dépense {r} € en tout.`,
        fausses: [`Les caisses de pommes coûtent {r} €.`, `Les caisses de poires coûtent {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-048', structure: 'TP', themes: ['boulangerie', 'fete'], niveaux: [2], limites: { r: [2, 100] },
      nombres: (niv, rnd) => { const prix = prixMagasin(rnd, 120, 380); return { a: sommeDonnee(prix, rnd), b: prix }; },
      texte: A => ({
        phrases: [`Pour la fête du village, ${A.n} commande des tartes et des gâteaux.`, `La commande coûte {b|€}.`, `${A.n} donne {a|€} à la boulangère.`],
        question: `Combien d'argent la boulangère rend-elle à ${A.n} ?`,
        labels: { tout: 'donné', p1: 'la commande', p2: 'la monnaie' },
        juste: `La boulangère rend {r} € à ${A.n}.`,
        fausses: [`La commande coûte {r} €.`, `${A.n} donne {r} € à la boulangère.`],
        unite: '€',
      }) },

    { id: 'marche-1-049', structure: 'TP', themes: ['jouets'], niveaux: [1, 2],
      nombres: (niv, rnd) => (niv === 1 ? { a: rnd(25, 60), b: entre(rnd, 5, 15, 5) } : { a: prixMagasin(rnd, 90, 260), b: entre(rnd, 10, 80, 5) }),
      texte: () => ({
        phrases: [`Au magasin de jouets, un train électrique coûte {a|€}.`, `Pendant les soldes, le prix du train baisse de {b|€}.`],
        question: `Combien coûte le train électrique pendant les soldes ?`,
        labels: { tout: 'prix normal', p1: 'la baisse', p2: 'prix des soldes' },
        juste: `Pendant les soldes, le train électrique coûte {r} €.`,
        fausses: [`Le prix du train baisse de {r} €.`, `Avant les soldes, le train électrique coûte {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-050', structure: 'TG', themes: ['jouets'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: rnd(150, 700), b: prixMagasin(rnd, 60, 149) }),
      texte: () => ({
        phrases: [`À midi, il y a {a|€} dans la caisse du vendeur de jouets.`, `L'après-midi, le vendeur vend un grand château fort à {b|€}.`],
        question: `Combien d'argent y a-t-il maintenant dans la caisse ?`,
        labels: { tout: 'maintenant', p1: 'à midi', p2: 'le château fort' },
        juste: `Il y a maintenant {r} € dans la caisse.`,
        fausses: [`Le château fort coûte {r} €.`, `À midi, il y avait {r} € dans la caisse.`],
        unite: '€',
      }) },

    { id: 'marche-1-051', structure: 'CE', themes: ['jouets'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: prixMagasin(rnd, 25, 60), b: prixMagasin(rnd, 70, 160) }),
      texte: () => ({
        phrases: [`Au magasin de jouets, un robot qui parle coûte {b|€}.`, `Une poupée coûte {a|€}.`],
        question: `Quelle est la différence de prix entre le robot et la poupée ?`,
        labels: { grand: 'le robot', petit: 'la poupée' },
        juste: `La différence de prix est de {r} €.`,
        fausses: [`Le robot coûte {r} €.`, `Le robot et la poupée coûtent {r} € ensemble.`],
        unite: '€',
      }) },

    { id: 'marche-1-052', structure: 'CMoins', themes: ['librairie'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: prixMagasin(rnd, 150, 320), b: prixMagasin(rnd, 40, 120) }),
      texte: () => ({
        phrases: [`Une collection complète de bandes dessinées neuves coûte {a|€}.`, `La même collection d'occasion coûte {b|€} de moins.`],
        question: `Combien coûte la collection d'occasion ?`,
        labels: { grand: 'neuve', petit: "d'occasion" },
        juste: `La collection d'occasion coûte {r} €.`,
        fausses: [`La collection neuve coûte {r} €.`, `La collection d'occasion coûte {r} € de moins.`],
        unite: '€',
      }) },

    { id: 'marche-1-053', structure: 'CPlus', themes: ['fruits'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: rnd(110, 350), b: rnd(100, 450) }),
      texte: () => ({
        phrases: [`Lundi, la marchande de fruits a gagné {a|€}.`, `Samedi, jour du grand marché, la marchande a gagné {b|€} de plus que lundi.`],
        question: `Combien la marchande a-t-elle gagné samedi ?`,
        labels: { grand: 'samedi', petit: 'lundi' },
        juste: `Samedi, la marchande a gagné {r} €.`,
        fausses: [`Lundi, la marchande a gagné {r} €.`, `Samedi, la marchande a gagné {r} € de plus que lundi.`],
        unite: '€',
      }) },

    { id: 'marche-1-054', structure: 'TTg', themes: ['librairie', 'jouets'], niveaux: [2],
      nombres: (niv, rnd) => { const a = rnd(15, 120); return { a, b: a + rnd(25, 90) }; },
      texte: A => ({
        phrases: [`Avant le vide-grenier, ${A.n} a {a|€} dans sa tirelire.`, `Au vide-grenier, ${A.n} vend ses vieux livres et ses jouets.`, `Après le vide-grenier, ${A.n} a {b|€}.`],
        question: `Combien d'argent ${A.n} a-t-${A.il} gagné au vide-grenier ?`,
        labels: { tout: 'après', p1: 'avant', p2: 'gagné' },
        juste: `${A.n} a gagné {r} € au vide-grenier.`,
        fausses: [`Après le vide-grenier, ${A.n} a {r} €.`, `Avant le vide-grenier, ${A.n} avait {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-055', structure: 'TTp', themes: ['fruits'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: rnd(400, 950), b: rnd(40, 300) }),
      texte: () => ({
        phrases: [`Ce matin, il y a {a|€} dans la caisse de la marchande de fruits.`, `La marchande paie le livreur qui apporte ses caisses de fruits.`, `Ensuite, il reste {b|€} dans la caisse.`],
        question: `Combien la marchande a-t-elle payé au livreur ?`,
        labels: { tout: 'ce matin', p1: 'le livreur', p2: 'qui reste' },
        juste: `La marchande a payé {r} € au livreur.`,
        fausses: [`Il reste {r} € dans la caisse.`, `Ce matin, il y avait {r} € dans la caisse.`],
        unite: '€',
      }) },

    { id: 'marche-1-056', structure: 'CP', themes: ['jouets'], niveaux: [2],
      nombres: (niv, rnd) => { const b = prixMagasin(rnd, 49, 129), r = rnd(18, 45); return { a: b + r, b }; },
      texte: A => ({
        phrases: [`${A.n} achète un skateboard et des protections pour {a|€} en tout.`, `Le skateboard coûte {b|€}.`],
        question: `Combien coûtent les protections ?`,
        labels: { tout: 'en tout', p1: 'le skateboard', p2: 'les protections' },
        juste: `Les protections coûtent {r} €.`,
        fausses: [`Le skateboard coûte {r} €.`, `${A.n} paie {r} € en tout.`],
        unite: '€',
      }) },

    // =========================================================================
    // GRADE 3 : grands montants (recettes d'un mois, travaux, budgets)
    // =========================================================================
    { id: 'marche-1-057', structure: 'CT', themes: ['boulangerie'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(3000, 6000), b: rnd(1500, 3900) }),
      texte: () => ({
        phrases: [`En juillet, la boulangerie a gagné {a|€} en vendant du pain.`, `Pendant le même mois, la boulangerie a gagné {b|€} en vendant des glaces et des gâteaux.`],
        question: `Combien la boulangerie a-t-elle gagné en juillet ?`,
        labels: { tout: 'juillet', p1: 'le pain', p2: 'glaces et gâteaux' },
        juste: `La boulangerie a gagné {r} € en juillet.`,
        fausses: [`La boulangerie a gagné {r} € avec le pain.`, `La boulangerie a gagné {r} € avec les glaces et les gâteaux.`],
        unite: '€',
      }) },

    { id: 'marche-1-058', structure: 'CT', themes: ['librairie'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(1500, 4800), b: rnd(1200, 4500) }),
      texte: () => ({
        phrases: [`Le salon du livre de la ville dure deux jours.`, `Samedi, les libraires gagnent {a|€}.`, `Dimanche, les libraires gagnent {b|€}.`],
        question: `Combien d'argent les libraires gagnent-ils pendant tout le salon ?`,
        labels: { tout: 'tout le salon', p1: 'samedi', p2: 'dimanche' },
        juste: `Les libraires gagnent {r} € pendant tout le salon.`,
        fausses: [`Les libraires gagnent {r} € samedi.`, `Les libraires gagnent {r} € dimanche.`],
        unite: '€',
      }) },

    { id: 'marche-1-059', structure: 'TP', themes: ['librairie'], niveaux: [3],
      nombres: (niv, rnd) => { const a = entre(rnd, 2000, 6000, 100); return { a, b: rnd(900, a - 300) }; },
      texte: () => ({
        phrases: [`Cette année, l'école peut dépenser {a|€} pour sa bibliothèque.`, `Le directeur achète des livres pour {b|€}.`],
        question: `Combien d'argent reste-t-il pour la bibliothèque ?`,
        labels: { tout: 'au début', p1: 'les livres', p2: 'qui reste' },
        juste: `Il reste {r} € pour la bibliothèque.`,
        fausses: [`Les livres coûtent {r} €.`, `L'école peut dépenser {r} € en tout.`],
        unite: '€',
      }) },

    { id: 'marche-1-060', structure: 'TP', themes: ['fruits'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: entre(rnd, 5000, 9500, 100), b: entre(rnd, 3000, 8000, 50) }),
      texte: () => ({
        phrases: [`La marchande de fruits a économisé {a|€}.`, `La marchande achète un camion d'occasion à {b|€} pour transporter ses fruits.`],
        question: `Combien d'argent reste-t-il à la marchande ?`,
        labels: { tout: 'économies', p1: 'le camion', p2: 'qui reste' },
        juste: `Il reste {r} € à la marchande.`,
        fausses: [`Le camion d'occasion coûte {r} €.`, `La marchande avait économisé {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-061', structure: 'TP', themes: ['boulangerie'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: entre(rnd, 6000, 9900, 100), b: prixMagasin(rnd, 3500, 8900) }),
      texte: () => ({
        phrases: [`Le boulanger veut changer son vieux four.`, `Le boulanger a {a|€} d'économies.`, `Le nouveau four coûte {b|€}.`],
        question: `Combien d'argent restera-t-il au boulanger après l'achat du four ?`,
        labels: { tout: 'économies', p1: 'le four', p2: 'qui restera' },
        juste: `Il restera {r} € au boulanger.`,
        fausses: [`Le nouveau four coûte {r} €.`, `Le boulanger a {r} € d'économies.`],
        unite: '€',
      }) },

    { id: 'marche-1-062', structure: 'CP', themes: ['jouets'], niveaux: [3],
      nombres: (niv, rnd) => { const b = rnd(2500, 5500), r = rnd(1200, 3800); return { a: b + r, b }; },
      texte: () => ({
        phrases: [`En décembre, le magasin de jouets a gagné {a|€}.`, `Le magasin a gagné {b|€} avec les jeux de société.`, `Le reste vient de la vente des peluches.`],
        question: `Combien le magasin a-t-il gagné avec les peluches ?`,
        labels: { tout: 'décembre', p1: 'les jeux', p2: 'les peluches' },
        juste: `Le magasin a gagné {r} € avec les peluches.`,
        fausses: [`Le magasin a gagné {r} € avec les jeux de société.`, `Le magasin a gagné {r} € en décembre.`],
        unite: '€',
      }) },

    { id: 'marche-1-063', structure: 'CP', themes: ['boulangerie'], niveaux: [3],
      nombres: (niv, rnd) => { const b = prixMagasin(rnd, 1800, 4500), r = prixMagasin(rnd, 900, 2500); return { a: b + r, b }; },
      texte: () => ({
        phrases: [`La boulangère fait des travaux dans sa boutique.`, `Les travaux coûtent {a|€} en tout.`, `La nouvelle vitrine coûte {b|€}.`, `Le reste sert à repeindre les murs.`],
        question: `Combien coûte la peinture des murs ?`,
        labels: { tout: 'les travaux', p1: 'la vitrine', p2: 'la peinture' },
        juste: `La peinture des murs coûte {r} €.`,
        fausses: [`La nouvelle vitrine coûte {r} €.`, `Les travaux coûtent {r} € en tout.`],
        unite: '€',
      }) },

    { id: 'marche-1-064', structure: 'CP', themes: ['fruits'], niveaux: [3],
      nombres: (niv, rnd) => { const b = rnd(2000, 5000), r = rnd(1000, 3500); return { a: b + r, b }; },
      texte: () => ({
        phrases: [`Le fermier vend toute sa récolte de pommes et de poires pour {a|€}.`, `Avec les pommes, le fermier gagne {b|€}.`],
        question: `Combien le fermier gagne-t-il avec les poires ?`,
        labels: { tout: 'toute la récolte', p1: 'les pommes', p2: 'les poires' },
        juste: `Le fermier gagne {r} € avec les poires.`,
        fausses: [`Le fermier gagne {r} € avec les pommes.`, `Le fermier gagne {r} € avec toute sa récolte.`],
        unite: '€',
      }) },

    { id: 'marche-1-065', structure: 'TTg', themes: ['librairie'], niveaux: [3],
      nombres: (niv, rnd) => { const a = rnd(400, 2000); return { a, b: a + rnd(1500, 6000) }; },
      texte: () => ({
        phrases: [`Au début du mois de septembre, il y a {a|€} dans la caisse de la librairie.`, `C'est la rentrée et les clients achètent beaucoup de cahiers et de livres.`, `À la fin du mois, il y a {b|€} dans la caisse.`],
        question: `Combien d'argent la librairie a-t-elle gagné en septembre ?`,
        labels: { tout: 'fin du mois', p1: 'début du mois', p2: 'gagné' },
        juste: `La librairie a gagné {r} € en septembre.`,
        fausses: [`À la fin du mois, il y a {r} € dans la caisse.`, `Au début du mois, il y avait {r} € dans la caisse.`],
        unite: '€',
      }) },

    { id: 'marche-1-066', structure: 'TTg', themes: ['jouets', 'fete'], niveaux: [3],
      nombres: (niv, rnd) => { const a = rnd(300, 1500); return { a, b: a + rnd(800, 3500) }; },
      texte: () => ({
        phrases: [`Avant la kermesse, l'école a {a|€} dans sa caisse.`, `Pendant la kermesse, l'école organise des jeux et vend des jouets.`, `Après la kermesse, l'école a {b|€}.`],
        question: `Combien d'argent l'école a-t-elle gagné grâce à la kermesse ?`,
        labels: { tout: 'après', p1: 'avant', p2: 'la kermesse' },
        juste: `L'école a gagné {r} € grâce à la kermesse.`,
        fausses: [`Après la kermesse, l'école a {r} €.`, `Avant la kermesse, l'école avait {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-067', structure: 'TTp', themes: ['jouets'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: entre(rnd, 2000, 5000, 100), b: rnd(150, 900) }),
      texte: () => ({
        phrases: [`Au début de l'année, l'école a {a|€} pour acheter des jeux pour la cour de récréation.`, `L'école achète un toboggan, une cabane et des ballons.`, `Il reste ensuite {b|€}.`],
        question: `Combien d'argent l'école a-t-elle dépensé pour les jeux ?`,
        labels: { tout: 'au début', p1: 'dépensé', p2: 'qui reste' },
        juste: `L'école a dépensé {r} € pour les jeux.`,
        fausses: [`Il reste {r} € à l'école.`, `Au début de l'année, l'école avait {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-068', structure: 'TTp', themes: ['boulangerie'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: entre(rnd, 6000, 9900, 100), b: rnd(300, 2500) }),
      texte: () => ({
        phrases: [`Le boulanger a {a|€} d'économies.`, `Le boulanger achète une camionnette d'occasion pour livrer son pain.`, `Ensuite, il reste {b|€} au boulanger.`],
        question: `Combien le boulanger a-t-il payé la camionnette ?`,
        labels: { tout: 'économies', p1: 'la camionnette', p2: 'qui reste' },
        juste: `Le boulanger a payé la camionnette {r} €.`,
        fausses: [`Il reste {r} € au boulanger.`, `Le boulanger avait {r} € d'économies.`],
        unite: '€',
      }) },

    { id: 'marche-1-069', structure: 'TIg', themes: ['librairie'], niveaux: [3],
      nombres: (niv, rnd) => { const a = prixMagasin(rnd, 800, 3000); return { a, b: a + rnd(500, 4000) }; },
      texte: () => ({
        phrases: [`La libraire vend une collection de livres anciens pour {a|€}.`, `Après cette vente, il y a {b|€} dans la caisse.`],
        question: `Combien d'argent y avait-il dans la caisse avant la vente ?`,
        labels: { tout: 'après la vente', p1: 'avant la vente', p2: 'la collection' },
        juste: `Avant la vente, il y avait {r} € dans la caisse.`,
        fausses: [`Après la vente, il y a {r} € dans la caisse.`, `La libraire vend la collection pour {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-070', structure: 'TIg', themes: ['jouets'], niveaux: [3],
      nombres: (niv, rnd) => { const a = rnd(1500, 5000); return { a, b: a + rnd(800, 4000) }; },
      texte: () => ({
        phrases: [`Grâce aux ventes de Noël, le magasin de jouets gagne {a|€}.`, `Maintenant, le magasin a {b|€} dans son coffre-fort.`],
        question: `Combien d'argent le magasin avait-il avant Noël ?`,
        labels: { tout: 'maintenant', p1: 'avant Noël', p2: 'gagné à Noël' },
        juste: `Avant Noël, le magasin avait {r} €.`,
        fausses: [`Le magasin gagne {r} € à Noël.`, `Maintenant, le magasin a {r} € dans son coffre-fort.`],
        unite: '€',
      }) },

    { id: 'marche-1-071', structure: 'TIg', themes: ['fruits'], niveaux: [3],
      nombres: (niv, rnd) => { const a = rnd(1200, 4000); return { a, b: a + rnd(500, 5000) }; },
      texte: () => ({
        phrases: [`Le fermier vend ses cerises et gagne {a|€}.`, `Le fermier a maintenant {b|€} d'économies.`],
        question: `Combien d'argent le fermier avait-il avant de vendre ses cerises ?`,
        labels: { tout: 'maintenant', p1: 'avant', p2: 'les cerises' },
        juste: `Le fermier avait {r} € avant de vendre ses cerises.`,
        fausses: [`Le fermier gagne {r} € avec ses cerises.`, `Le fermier a maintenant {r} € d'économies.`],
        unite: '€',
      }) },

    { id: 'marche-1-072', structure: 'TIg', themes: ['boulangerie', 'fete'], niveaux: [3],
      nombres: (niv, rnd) => { const a = rnd(800, 2500); return { a, b: a + rnd(1000, 6000) }; },
      texte: () => ({
        phrases: [`Le boulanger prépare les gâteaux d'un grand mariage.`, `Pour ce travail, le boulanger reçoit {a|€}.`, `Après le mariage, le boulanger a {b|€} d'économies.`],
        question: `Combien d'argent le boulanger avait-il avant le mariage ?`,
        labels: { tout: 'après', p1: 'avant', p2: 'le mariage' },
        juste: `Avant le mariage, le boulanger avait {r} €.`,
        fausses: [`Le boulanger reçoit {r} € pour le mariage.`, `Après le mariage, le boulanger a {r} € d'économies.`],
        unite: '€',
      }) },

    { id: 'marche-1-073', structure: 'TIp', themes: ['jouets'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(2000, 6000), b: rnd(400, 3000) }),
      texte: () => ({
        phrases: [`Pour préparer Noël, le magasin de jouets dépense {a|€} en jouets neufs.`, `Ensuite, il reste {b|€} au magasin.`],
        question: `Combien d'argent le magasin avait-il avant ses achats ?`,
        labels: { tout: 'avant', p1: 'les achats', p2: 'qui reste' },
        juste: `Le magasin avait {r} € avant ses achats.`,
        fausses: [`Le magasin dépense {r} € en jouets neufs.`, `Il reste {r} € au magasin.`],
        unite: '€',
      }) },

    { id: 'marche-1-074', structure: 'TIp', themes: ['librairie'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(1500, 5000), b: rnd(500, 3000) }),
      texte: () => ({
        phrases: [`La bibliothèque de la ville achète des livres pour {a|€}.`, `Après cet achat, il reste {b|€} à la bibliothèque.`],
        question: `Combien d'argent la bibliothèque de la ville avait-elle avant cet achat ?`,
        labels: { tout: 'avant', p1: 'les livres', p2: 'qui reste' },
        juste: `Avant cet achat, la bibliothèque de la ville avait {r} €.`,
        fausses: [`Les livres coûtent {r} €.`, `Après cet achat, il reste {r} € à la bibliothèque.`],
        unite: '€',
      }) },

    { id: 'marche-1-075', structure: 'TIp', themes: ['boulangerie'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: prixMagasin(rnd, 1500, 4500), b: rnd(400, 3000) }),
      texte: () => ({
        phrases: [`Le boulanger paie {a|€} pour une nouvelle machine à pain.`, `Après cet achat, il reste {b|€} au boulanger.`],
        question: `Combien d'argent le boulanger avait-il avant d'acheter la machine ?`,
        labels: { tout: 'avant', p1: 'la machine', p2: 'qui reste' },
        juste: `Le boulanger avait {r} € avant d'acheter la machine.`,
        fausses: [`La machine à pain coûte {r} €.`, `Il reste {r} € au boulanger.`],
        unite: '€',
      }) },

    { id: 'marche-1-076', structure: 'TIp', themes: ['fruits'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: entre(rnd, 1500, 4500, 10), b: rnd(300, 2500) }),
      texte: () => ({
        phrases: [`Le fermier achète de jeunes pommiers pour {a|€}.`, `Il reste ensuite {b|€} au fermier.`],
        question: `Combien d'argent le fermier avait-il avant d'acheter les pommiers ?`,
        labels: { tout: 'avant', p1: 'les pommiers', p2: 'qui reste' },
        juste: `Le fermier avait {r} € avant d'acheter les pommiers.`,
        fausses: [`Les pommiers coûtent {r} €.`, `Il reste {r} € au fermier.`],
        unite: '€',
      }) },

    { id: 'marche-1-077', structure: 'CE', themes: ['jouets'], niveaux: [3],
      nombres: (niv, rnd) => { const a = rnd(1500, 4000); return { a, b: a + rnd(1000, 5000) }; },
      texte: () => ({
        phrases: [`En décembre, le magasin de jouets a gagné {b|€}.`, `En janvier, le magasin a gagné {a|€}.`],
        question: `Combien le magasin a-t-il gagné de plus en décembre qu'en janvier ?`,
        labels: { grand: 'décembre', petit: 'janvier' },
        juste: `Le magasin a gagné {r} € de plus en décembre qu'en janvier.`,
        fausses: [`Le magasin a gagné {r} € en décembre.`, `Le magasin a gagné {r} € en tout.`],
        unite: '€',
      }) },

    { id: 'marche-1-078', structure: 'CE', themes: ['fruits'], niveaux: [3],
      nombres: (niv, rnd) => { const a = rnd(1500, 4000); return { a, b: a + rnd(600, 4000) }; },
      texte: () => ({
        phrases: [`Cette année, le fermier a gagné {b|€} avec ses pommes.`, `Avec ses pêches, le fermier a gagné {a|€}.`],
        question: `Combien le fermier a-t-il gagné de plus avec ses pommes qu'avec ses pêches ?`,
        labels: { grand: 'les pommes', petit: 'les pêches' },
        juste: `Le fermier a gagné {r} € de plus avec ses pommes.`,
        fausses: [`Le fermier a gagné {r} € avec ses pommes.`, `Le fermier a gagné {r} € avec ses pêches.`],
        unite: '€',
      }) },

    { id: 'marche-1-079', structure: 'CE', themes: ['librairie'], niveaux: [3],
      nombres: (niv, rnd) => { const a = rnd(1200, 3500); return { a, b: a + rnd(400, 3000) }; },
      texte: () => ({
        phrases: [`Cette année, l'école des Tilleuls dépense {b|€} pour acheter des livres.`, `L'école des Lilas dépense {a|€}.`],
        question: `Combien l'école des Tilleuls dépense-t-elle de plus que l'école des Lilas ?`,
        labels: { grand: 'les Tilleuls', petit: 'les Lilas' },
        juste: `L'école des Tilleuls dépense {r} € de plus que l'école des Lilas.`,
        fausses: [`L'école des Tilleuls dépense {r} €.`, `Les deux écoles dépensent {r} € en tout.`],
        unite: '€',
      }) },

    { id: 'marche-1-080', structure: 'CPlus', themes: ['boulangerie'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(3000, 6000), b: rnd(400, 2500) }),
      texte: () => ({
        phrases: [`En mars, la boulangerie a gagné {a|€}.`, `En avril, grâce aux œufs en chocolat de Pâques, la boulangerie a gagné {b|€} de plus qu'en mars.`],
        question: `Combien la boulangerie a-t-elle gagné en avril ?`,
        labels: { grand: 'avril', petit: 'mars' },
        juste: `La boulangerie a gagné {r} € en avril.`,
        fausses: [`La boulangerie a gagné {r} € en mars.`, `La boulangerie a gagné {r} € de plus en avril.`],
        unite: '€',
      }) },

    { id: 'marche-1-081', structure: 'CPlus', themes: ['librairie'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(800, 3000), b: rnd(500, 3000) }),
      texte: () => ({
        phrases: [`Pour sa bibliothèque, l'école du village a dépensé {a|€}.`, `L'école de la ville a dépensé {b|€} de plus que l'école du village.`],
        question: `Combien l'école de la ville a-t-elle dépensé pour sa bibliothèque ?`,
        labels: { grand: 'la ville', petit: 'le village' },
        juste: `L'école de la ville a dépensé {r} € pour sa bibliothèque.`,
        fausses: [`L'école du village a dépensé {r} € pour sa bibliothèque.`, `L'école de la ville a dépensé {r} € de plus.`],
        unite: '€',
      }) },

    { id: 'marche-1-082', structure: 'CMoins', themes: ['jouets'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(5000, 9900), b: rnd(1500, 4500) }),
      texte: () => ({
        phrases: [`En décembre, le grand magasin de jouets a gagné {a|€}.`, `La petite boutique de jouets du village a gagné {b|€} de moins.`],
        question: `Combien la petite boutique a-t-elle gagné en décembre ?`,
        labels: { grand: 'le grand magasin', petit: 'la petite boutique' },
        juste: `La petite boutique a gagné {r} € en décembre.`,
        fausses: [`Le grand magasin a gagné {r} € en décembre.`, `La petite boutique a gagné {r} € de moins que le grand magasin.`],
        unite: '€',
      }) },

    { id: 'marche-1-083', structure: 'CMoins', themes: ['fruits'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(3000, 8000), b: rnd(500, 2500) }),
      texte: () => ({
        phrases: [`L'an dernier, le fermier a gagné {a|€} avec ses abricots.`, `Cette année, à cause de la grêle, le fermier a gagné {b|€} de moins.`],
        question: `Combien le fermier a-t-il gagné avec ses abricots cette année ?`,
        labels: { grand: "l'an dernier", petit: 'cette année' },
        juste: `Cette année, le fermier a gagné {r} € avec ses abricots.`,
        fausses: [`L'an dernier, le fermier a gagné {r} € avec ses abricots.`, `Cette année, le fermier a gagné {r} € de moins.`],
        unite: '€',
      }) },

    { id: 'marche-1-084', structure: 'CInvP', themes: ['jouets'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(3000, 9000), b: rnd(500, 2500) }),
      texte: () => ({
        phrases: [`En novembre, le magasin de jouets a gagné {a|€}.`, `C'est {b|€} de plus qu'en octobre.`],
        question: `Combien le magasin a-t-il gagné en octobre ?`,
        labels: { grand: 'novembre', petit: 'octobre' },
        juste: `En octobre, le magasin a gagné {r} €.`,
        fausses: [`En novembre, le magasin a gagné {r} €.`, `En octobre, le magasin a gagné {r} € de plus qu'en novembre.`],
        unite: '€',
      }) },

    { id: 'marche-1-085', structure: 'CInvP', themes: ['librairie'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(2000, 6000), b: rnd(300, 1500) }),
      texte: () => ({
        phrases: [`Cette année, la bibliothèque de la ville dépense {a|€} pour acheter des livres.`, `C'est {b|€} de plus que l'année dernière.`],
        question: `Combien la bibliothèque de la ville a-t-elle dépensé l'année dernière ?`,
        labels: { grand: 'cette année', petit: "l'année dernière" },
        juste: `L'année dernière, la bibliothèque de la ville a dépensé {r} €.`,
        fausses: [`Cette année, la bibliothèque dépense {r} €.`, `La bibliothèque dépense {r} € de plus cette année.`],
        unite: '€',
      }) },

    { id: 'marche-1-086', structure: 'CInvP', themes: ['boulangerie'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(1500, 3500), b: rnd(200, 900) }),
      texte: () => ({
        phrases: [`Ce mois-ci, le boulanger dépense {a|€} pour acheter de la farine.`, `C'est {b|€} de plus que le mois dernier.`],
        question: `Combien le boulanger a-t-il dépensé pour la farine le mois dernier ?`,
        labels: { grand: 'ce mois-ci', petit: 'le mois dernier' },
        juste: `Le mois dernier, le boulanger a dépensé {r} € pour la farine.`,
        fausses: [`Ce mois-ci, le boulanger dépense {r} € pour la farine.`, `Le boulanger dépense {r} € de plus ce mois-ci.`],
        unite: '€',
      }) },

    { id: 'marche-1-087', structure: 'CInvP', themes: ['fruits'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(2500, 7000), b: rnd(400, 2000) }),
      texte: () => ({
        phrases: [`Cet été, la marchande a gagné {a|€} en vendant des fraises.`, `C'est {b|€} de plus qu'avec les framboises.`],
        question: `Combien la marchande a-t-elle gagné avec les framboises cet été ?`,
        labels: { grand: 'les fraises', petit: 'les framboises' },
        juste: `Cet été, la marchande a gagné {r} € avec les framboises.`,
        fausses: [`Cet été, la marchande a gagné {r} € avec les fraises.`, `La marchande a gagné {r} € de plus avec les fraises.`],
        unite: '€',
      }) },

    { id: 'marche-1-088', structure: 'CInvM', themes: ['jouets'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(2000, 5000), b: rnd(1500, 4500) }),
      texte: () => ({
        phrases: [`En mai, le magasin de jouets de la gare a gagné {a|€}.`, `C'est {b|€} de moins que le magasin de jouets du centre-ville.`],
        question: `Combien le magasin du centre-ville a-t-il gagné en mai ?`,
        labels: { grand: 'le centre-ville', petit: 'la gare' },
        juste: `En mai, le magasin du centre-ville a gagné {r} €.`,
        fausses: [`En mai, le magasin de la gare a gagné {r} €.`, `Le magasin du centre-ville a gagné {r} € de moins.`],
        unite: '€',
      }) },

    { id: 'marche-1-089', structure: 'CInvM', themes: ['librairie'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(1000, 4000), b: rnd(400, 2500) }),
      texte: () => ({
        phrases: [`Au salon du livre, le stand des bandes dessinées a gagné {a|€}.`, `C'est {b|€} de moins que le stand des romans.`],
        question: `Combien le stand des romans a-t-il gagné ?`,
        labels: { grand: 'les romans', petit: 'les bandes dessinées' },
        juste: `Le stand des romans a gagné {r} €.`,
        fausses: [`Le stand des bandes dessinées a gagné {r} €.`, `Le stand des romans a gagné {r} € de moins.`],
        unite: '€',
      }) },

    { id: 'marche-1-090', structure: 'CInvM', themes: ['boulangerie'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(2500, 6000), b: rnd(500, 3000) }),
      texte: () => ({
        phrases: [`En janvier, la boulangerie du village a gagné {a|€}.`, `C'est {b|€} de moins que la boulangerie de la gare.`],
        question: `Combien la boulangerie de la gare a-t-elle gagné en janvier ?`,
        labels: { grand: 'la gare', petit: 'le village' },
        juste: `En janvier, la boulangerie de la gare a gagné {r} €.`,
        fausses: [`En janvier, la boulangerie du village a gagné {r} €.`, `La boulangerie de la gare a gagné {r} € de moins.`],
        unite: '€',
      }) },

    { id: 'marche-1-091', structure: 'CInvM', themes: ['fruits'], niveaux: [3],
      nombres: (niv, rnd) => ({ a: rnd(1000, 4000), b: rnd(300, 2000) }),
      texte: () => ({
        phrases: [`Cet été, le stand de fraises a gagné {a|€}.`, `C'est {b|€} de moins que le stand de melons.`],
        question: `Combien le stand de melons a-t-il gagné cet été ?`,
        labels: { grand: 'les melons', petit: 'les fraises' },
        juste: `Cet été, le stand de melons a gagné {r} €.`,
        fausses: [`Cet été, le stand de fraises a gagné {r} €.`, `Le stand de melons a gagné {r} € de moins.`],
        unite: '€',
      }) },

    { id: 'marche-1-092', structure: 'CT', themes: ['jouets', 'fete'], niveaux: [2, 3],
      nombres: (niv, rnd) => (niv === 2 ? { a: rnd(150, 500), b: rnd(120, 450) } : { a: rnd(1000, 3000), b: rnd(700, 2500) }),
      texte: () => ({
        phrases: [`À la fête de l'école, la tombola rapporte {a|€}.`, `Les stands de jeux rapportent {b|€}.`],
        question: `Combien d'argent la fête de l'école rapporte-t-elle en tout ?`,
        labels: { tout: 'en tout', p1: 'la tombola', p2: 'les jeux' },
        juste: `La fête de l'école rapporte {r} € en tout.`,
        fausses: [`La tombola rapporte {r} €.`, `Les stands de jeux rapportent {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-093', structure: 'TP', themes: ['jouets', 'fete'], niveaux: [3],
      nombres: (niv, rnd) => { const a = entre(rnd, 2000, 6000, 500); return { a, b: rnd(1200, a - 200) }; },
      texte: () => ({
        phrases: [`Pour Noël, la mairie a {a|€} pour offrir des jouets aux enfants du village.`, `La mairie achète des jouets pour {b|€}.`],
        question: `Combien d'argent reste-t-il à la mairie pour décorer le sapin ?`,
        labels: { tout: 'au début', p1: 'les jouets', p2: 'qui reste' },
        juste: `Il reste {r} € à la mairie pour décorer le sapin.`,
        fausses: [`Les jouets coûtent {r} €.`, `La mairie avait {r} € au début.`],
        unite: '€',
      }) },

    // =========================================================================
    // Compléments : encore des petits achats (grade 1) et des problèmes « entre amis » (grade 2)
    // =========================================================================
    { id: 'marche-1-094', structure: 'TP', themes: ['fruits'], niveaux: [1],
      nombres: (niv, rnd) => { const prix = rnd(12, 35); return { a: billetPour(prix, rnd), b: prix }; },
      texte: A => ({
        phrases: [`Au marché, un gros panier de fruits coûte {b|€}.`, `${A.n} achète le panier et donne un billet de {a|€} à la marchande.`],
        question: `Combien la marchande doit-elle rendre à ${A.n} ?`,
        labels: { tout: 'le billet', p1: 'le panier', p2: 'la monnaie' },
        juste: `La marchande doit rendre {r} € à ${A.n}.`,
        fausses: [`Le panier de fruits coûte {r} €.`, `${A.n} donne un billet de {r} € à la marchande.`],
        unite: '€',
      }) },

    { id: 'marche-1-095', structure: 'TG', themes: ['boulangerie'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(5, 30), b: rnd(2, 5) }),
      texte: A => ({
        phrases: [`${A.n} a {a|€} dans son porte-monnaie.`, `Samedi matin, ${A.n} aide le boulanger à ranger les croissants.`, `Pour dire merci, le boulanger donne {b|€} ${A.a}.`],
        question: `Combien d'argent ${A.n} a-t-${A.il} maintenant ?`,
        labels: { tout: 'maintenant', p1: 'avant', p2: 'donné par le boulanger' },
        juste: `${A.n} a maintenant {r} €.`,
        fausses: [`Le boulanger donne {r} € ${A.a}.`, `Avant samedi, ${A.n} avait {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-096', structure: 'CT', themes: ['jouets'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(5, 12), b: rnd(2, 6) }),
      texte: A => ({
        phrases: [`Au magasin de jouets, ${A.n} achète une boîte de pâte à modeler à {a|€}.`, `${A.n} achète aussi un sac de billes à {b|€}.`],
        question: `Combien ${A.n} dépense-t-${A.il} en tout ?`,
        labels: { tout: 'en tout', p1: 'la pâte à modeler', p2: 'les billes' },
        juste: `${A.n} dépense {r} € en tout.`,
        fausses: [`La boîte de pâte à modeler coûte {r} €.`, `Le sac de billes coûte {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-097', structure: 'CT', themes: ['librairie'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(8, 18), b: rnd(3, 9) }),
      texte: A => ({
        phrases: [`À la librairie, ${A.n} choisit un livre sur les planètes à {a|€}.`, `${A.n} prend aussi un poster du ciel étoilé à {b|€}.`],
        question: `Combien ${A.n} paie-t-${A.il} à la libraire ?`,
        labels: { tout: 'à payer', p1: 'le livre', p2: 'le poster' },
        juste: `${A.n} paie {r} € à la libraire.`,
        fausses: [`Le livre sur les planètes coûte {r} €.`, `Le poster coûte {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-098', structure: 'TP', themes: ['jouets'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(15, 40), b: rnd(6, 14) }),
      texte: A => ({
        phrases: [`Au magasin de jouets, un cerf-volant coûte {b|€}.`, `${A.n} a {a|€} dans sa poche.`, `${A.n} achète le cerf-volant.`],
        question: `Combien d'argent restera-t-il dans la poche ${A.de} ?`,
        labels: { tout: 'dans la poche', p1: 'le cerf-volant', p2: 'qui restera' },
        juste: `Il restera {r} € dans la poche ${A.de}.`,
        fausses: [`Le cerf-volant coûte {r} €.`, `${A.n} avait {r} € avant son achat.`],
        unite: '€',
      }) },

    { id: 'marche-1-099', structure: 'CT', themes: ['boulangerie'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(12, 22), b: rnd(3, 8) }),
      texte: A => ({
        phrases: [`Pour le goûter, ${A.n} achète une grande tarte aux fraises à {a|€}.`, `${A.n} achète aussi une brioche à {b|€}.`],
        question: `Combien ${A.n} dépense-t-${A.il} chez le boulanger ?`,
        labels: { tout: 'en tout', p1: 'la tarte', p2: 'la brioche' },
        juste: `${A.n} dépense {r} € chez le boulanger.`,
        fausses: [`La tarte aux fraises coûte {r} €.`, `La brioche coûte {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-100', structure: 'TP', themes: ['boulangerie'], niveaux: [1],
      nombres: (niv, rnd) => { const prix = rnd(15, 35); return { a: billetPour(prix, rnd), b: prix }; },
      texte: A => ({
        phrases: [`${A.n} achète un gâteau d'anniversaire à {b|€}.`, `${A.n} donne un billet de {a|€} à la boulangère.`],
        question: `Combien d'argent la boulangère rend-elle à ${A.n} ?`,
        labels: { tout: 'le billet', p1: 'le gâteau', p2: 'la monnaie' },
        juste: `La boulangère rend {r} € à ${A.n}.`,
        fausses: [`Le gâteau d'anniversaire coûte {r} €.`, `${A.n} donne un billet de {r} € à la boulangère.`],
        unite: '€',
      }) },

    { id: 'marche-1-101', structure: 'TG', themes: ['librairie'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(10, 40), b: rnd(4, 15) }),
      texte: A => ({
        phrases: [`Pour la foire aux livres, ${A.n} a {a|€}.`, `${A.n} vend ses vieilles bandes dessinées et gagne {b|€}.`],
        question: `Combien d'argent ${A.n} a-t-${A.il} maintenant pour la foire aux livres ?`,
        labels: { tout: 'maintenant', p1: 'au début', p2: 'les bandes dessinées' },
        juste: `${A.n} a maintenant {r} € pour la foire aux livres.`,
        fausses: [`${A.n} gagne {r} € avec ses bandes dessinées.`, `Au début, ${A.n} avait {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-102', structure: 'TP', themes: ['librairie'], niveaux: [1],
      nombres: (niv, rnd, choix) => ({ a: choix([30, 40, 50, 60]), b: rnd(12, 25) }),
      texte: () => ({
        phrases: [`La maîtresse a {a|€} pour acheter des livres pour la classe.`, `La maîtresse achète d'abord un dictionnaire à {b|€}.`],
        question: `Combien d'argent reste-t-il à la maîtresse ?`,
        labels: { tout: 'au début', p1: 'le dictionnaire', p2: 'qui reste' },
        juste: `Il reste {r} € à la maîtresse.`,
        fausses: [`Le dictionnaire coûte {r} €.`, `La maîtresse avait {r} € au début.`],
        unite: '€',
      }) },

    { id: 'marche-1-103', structure: 'CT', themes: ['fruits'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(3, 9), b: rnd(2, 8) }),
      texte: A => ({
        phrases: [`Au marché, ${A.n} achète des pêches pour {a|€}.`, `Puis ${A.n} achète des abricots pour {b|€}.`],
        question: `Combien d'argent ${A.n} a-t-${A.il} dépensé au marché ?`,
        labels: { tout: 'dépensé', p1: 'les pêches', p2: 'les abricots' },
        juste: `${A.n} a dépensé {r} € au marché.`,
        fausses: [`Les pêches coûtent {r} €.`, `Les abricots coûtent {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-104', structure: 'CT', themes: ['jouets'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(3, 9), b: rnd(2, 8) }),
      texte: (A, B) => ({
        phrases: [`${A.n} et ${B.n} achètent un ballon ensemble.`, `${A.n} donne {a|€} et ${B.n} donne {b|€}.`],
        question: `Combien coûte le ballon ?`,
        labels: { tout: 'le ballon', p1: 'donné par ' + A.n, p2: 'donné par ' + B.n },
        juste: `Le ballon coûte {r} €.`,
        fausses: [`${A.n} donne {r} €.`, `${B.n} donne {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-105', structure: 'TP', themes: ['jouets'], niveaux: [1],
      nombres: (niv, rnd) => ({ a: rnd(12, 40), b: rnd(3, 10) }),
      texte: (A, B) => ({
        phrases: [`${A.n} a {a|€}.`, `${B.n} veut acheter un jeu, mais il lui manque de l'argent.`, `${A.n} donne {b|€} à ${B.n}.`],
        question: `Combien d'argent reste-t-il à ${A.n} ?`,
        labels: { tout: 'au début', p1: 'donné', p2: 'qui reste' },
        juste: `Il reste {r} € à ${A.n}.`,
        fausses: [`${A.n} donne {r} € à ${B.n}.`, `${A.n} avait {r} € au début.`],
        unite: '€',
      }) },

    { id: 'marche-1-106', structure: 'CPlus', themes: ['jouets'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: rnd(40, 300), b: rnd(15, 200) }),
      texte: (A, B) => ({
        phrases: [`${A.n} et ${B.n} économisent pour acheter un jeu vidéo.`, `${A.n} a économisé {a|€}.`, `${B.n} a économisé {b|€} de plus ${A.que}.`],
        question: `Combien d'argent ${B.n} a-t-${B.il} économisé ?`,
        labels: { grand: B.n, petit: A.n },
        juste: `${B.n} a économisé {r} €.`,
        fausses: [`${A.n} a économisé {r} €.`, `${B.n} a économisé {r} € de plus ${A.que}.`],
        unite: '€',
      }) },

    { id: 'marche-1-107', structure: 'CE', themes: ['boulangerie', 'fete'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: rnd(25, 60), b: prixMagasin(rnd, 110, 300) }),
      texte: (A, B) => ({
        phrases: [`Pour son anniversaire, ${A.n} commande un gâteau à {a|€}.`, `Pour une grande fête, ${B.n} commande une pièce montée à {b|€}.`],
        question: `Combien ${B.n} paie-t-${B.il} de plus ${A.que} ?`,
        labels: { grand: B.n, petit: A.n },
        juste: `${B.n} paie {r} € de plus ${A.que}.`,
        fausses: [`${B.n} paie {r} €.`, `${A.n} et ${B.n} paient {r} € en tout.`],
        unite: '€',
      }) },

    { id: 'marche-1-108', structure: 'TTp', themes: ['boulangerie', 'fete'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: entre(rnd, 100, 300, 10), b: rnd(12, 60) }),
      texte: A => ({
        phrases: [`${A.n} part acheter les desserts de la fête avec {a|€}.`, `Au retour de la boulangerie, il reste {b|€} à ${A.n}.`],
        question: `Combien d'argent ${A.n} a-t-${A.il} dépensé à la boulangerie ?`,
        labels: { tout: 'au départ', p1: 'dépensé', p2: 'au retour' },
        juste: `${A.n} a dépensé {r} € à la boulangerie.`,
        fausses: [`Il reste {r} € à ${A.n}.`, `${A.n} est parti${A.e} avec {r} €.`],
        unite: '€',
      }) },

    { id: 'marche-1-109', structure: 'CMoins', themes: ['fruits'], niveaux: [2],
      nombres: (niv, rnd) => ({ a: rnd(120, 400), b: rnd(20, 100) }),
      texte: (A, B) => ({
        phrases: [`Cet été, ${A.n} a gagné {a|€} en aidant la marchande de fruits.`, `${B.n} a gagné {b|€} de moins ${A.que}.`],
        question: `Combien d'argent ${B.n} a-t-${B.il} gagné cet été ?`,
        labels: { grand: A.n, petit: B.n },
        juste: `Cet été, ${B.n} a gagné {r} €.`,
        fausses: [`Cet été, ${A.n} a gagné {r} €.`, `${B.n} a gagné {r} € de moins ${A.que}.`],
        unite: '€',
      }) },

    { id: 'marche-1-110', structure: 'CP', themes: ['fruits'], niveaux: [2],
      nombres: (niv, rnd) => { const b = rnd(100, 400), r = rnd(60, 300); return { a: b + r, b }; },
      texte: () => ({
        phrases: [`Ce matin, la marchande de fruits a gagné {a|€}.`, `La marchande a gagné {b|€} en vendant des fraises.`, `Le reste vient de la vente des melons.`],
        question: `Combien la marchande a-t-elle gagné avec les melons ?`,
        labels: { tout: 'ce matin', p1: 'les fraises', p2: 'les melons' },
        juste: `La marchande a gagné {r} € avec les melons.`,
        fausses: [`La marchande a gagné {r} € avec les fraises.`, `Ce matin, la marchande a gagné {r} € en tout.`],
        unite: '€',
      }) },

    // (fin des modèles)
  ]);

  // Phrases pièges propres au marché (nombres inutiles, jamais des euros)
  Problemes.ajouterPieges('marche', [
    { f: () => `Il y a {d|clients} dans la file d'attente.`, v: (niv, rnd) => rnd(3, 12) },
    { f: () => `La boutique a {d|vitrines}.`, v: (niv, rnd) => rnd(2, 5) },
    { f: () => `Le boulanger se lève à {d|heures} du matin.`, v: (niv, rnd) => rnd(3, 5) },
    { f: () => `La librairie a {d|étagères}.`, v: (niv, rnd) => rnd(8, 30) },
  ]);
})();
