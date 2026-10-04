'use strict';
/* Planète n°2 : Planète Paquets — multiplications, partages et groupements.
   Prairie rose bonbon, grand lac bleu au centre, piles de paquets cadeaux, fabrique de boîtes, vergers en rangées.
   Les 4 zones tournent autour du lac :
     1. Prairie Bonbon (en bas à gauche, atterrissage)  → pont cassé vers l'est
     2. Vergers en Rangées (en bas à droite)            → barrière dans la falaise vers le nord
     3. Fabrique de Boîtes (en haut à droite)           → pont cassé vers l'ouest
     4. Colline des Fêtes (en haut à gauche, la reine)  */
Mondes.ajouter({
  id: 'paquets', ordre: 2, notion: 'paquets', nom: 'Planète Paquets',
  description: 'Multiplications et partages',
  arrivee: "Waouh, une prairie toute rose qui sent la fraise ! Sur la Planète Paquets, on range tout par paquets et on partage tout en parts égales. Allons voir si les habitants ont besoin d'aide !",

  //          x : 0         1         2         3
  //              0123456789012345678901234567890123456789
  carte: [
    'TTRTTTTTTRTTTTTTTTT~~TTTTT##TTTTTRTTTTTT', // 0
    'TT,H,..H.,TTf..T,..~~.,.T..HH.H...MMM.MT', // 1
    'T..:...:.TT.f.....,~~.T..f.:..:..,....RT', // 2
    'T.f:...:,.T.......,~~......:::::..MM.MMT', // 3
    'T..:::::.,..:::::::BB:::::::.,.:......TT', // 4   pont cassé vers la Colline des Fêtes
    'T.,.f..:..T.:...,..~~.,..T...f.:..XXX.TT', // 5
    'TM....f::::::.T.,..~~T..,.H.H..:...f.,.T', // 6
    'T.f....:..f..TT....~~TT...::::::..~~.T.T', // 7
    'T.,M:::::::M...T,..~~.T.f..C...:.~~~..TT', // 8
    'Tf.f:::::::f.,.T..~~~~..T.,....:..~~.f.T', // 9   Place des Fêtes (la reine au centre)
    'TT.M:::::::M..T,.~~~~~~..TT..:::.,..T.TT', // 10
    'T.T..f.....f.,..~~~~~~~~.,T..:.f.T..,TTT', // 11
    'T..TT...,..TT..~~~~~~~~~~####:##########', // 12
    'TT..f.,.T..f...~~~~MM~~~~####P##########', // 13  barrière de la Fabrique ; île aux cadeaux
    '###############~~~~~~~~~~~.,.:.f.T..,T.T', // 14
    '###############~~~~~~~~~~.f..:....R...,T', // 15
    'T.T.,.f..TT.,.T.~~~~~~~~..,..:.T.T.T.T.T', // 16  vergers : 4 rangées de 4 arbres
    'T.TT.H..H...H..f.~~~~~~.f....:..,...,..T', // 17  village de la prairie
    'T..T.:..:...:.,.T.~~~~..,.T.::.T.T.T.T.T', // 18
    'T..,.::::::::::f...~~.XXX...:....,....fT', // 19
    'Tf.M..f:.,.T..:.,..~~,,,,..f:..T.T.T.T.T', // 20  terrain d'entraînement
    'T...,..:..~~..:f.T.~~,,,.::::...,...,..T', // 21
    'TT.f...:.~~~~.:...,~~.XXX:..,..T.T.T.T.T', // 22
    'T.,....:..~~~.:....~~..f.:...f..,..R...T', // 23
    'T...f..:..,.f.:::::BB::::::::::.~~~.T..T', // 24  pont cassé vers les vergers
    'T.,.::::.f...T..f..~~.T..,M....~~~~~.T.T', // 25  fusée en (3, 25)
    'Tf...,..f..TT.,....~~..f.MM.,..~~~~..T.T', // 26
    'T..f..M..,TMTT..R..~~T..,..T..f.~~.,.T.T', // 27
    'TT..,..T..TTT..,.T.~~TT..T..,.....f.TT.T', // 28
    'TTTTRTTTTTTTRTTTTTT~~TTTTTTRTTTTTTTTRTTT', // 29
  ],

  depart: { x: 4, y: 25 }, fusee: { x: 3, y: 25 },

  zones: [
    { id: 1, nom: 'Prairie Bonbon', requis: 0 },
    { id: 2, nom: 'Vergers en Rangées', requis: 8, portes: [[19, 24], [20, 24]],
      message: "Oh non, le pont est cassé ! Aide 2 habitants de la Prairie Bonbon (8 problèmes), et ils viendront le réparer." },
    { id: 3, nom: 'Fabrique de Boîtes', requis: 20, portes: [[29, 13]],
      message: "La barrière de la Fabrique de Boîtes est fermée. Elle s'ouvrira quand tu auras résolu 20 problèmes en tout." },
    { id: 4, nom: 'Colline des Fêtes', requis: 32, portes: [[19, 4], [20, 4]],
      message: "Ce pont mène à la Colline des Fêtes, mais il lui manque des planches. Résous 32 problèmes en tout pour le réparer." },
  ],

  pnj: [
    // --- Zone 1 : Prairie Bonbon ---
    { id: 'mabou', nom: 'Mabou', g: 'f', role: 'pâtissière de cookies', zone: 1, x: 8, y: 23, themes: ['cuisine', 'fete'],
      apparence: { espece: 'bulle', couleur: '#f29bb5', accessoire: 'tablier' },
      bonjour: "Coucou, petit chat de l'espace ! J'ai cuit des montagnes de cookies, mais je ne sais plus combien en mettre dans chaque boîte.",
      merci: "Toutes mes boîtes de cookies sont prêtes ! Tu sens cette bonne odeur ? C'est l'odeur de la réussite.", chef: false },
    { id: 'tiplo', nom: 'Tiplo', g: 'm', role: 'jardinier des fleurs bonbons', zone: 1, x: 10, y: 18, themes: ['jardin', 'animaux'],
      apparence: { espece: 'champi', couleur: '#7fcfb0', accessoire: 'chapeau' },
      bonjour: "Bonjour ! Moi, je plante mes fleurs en rangées bien droites. Mais à force de compter, j'ai le tournis !",
      merci: "Mes rangées sont parfaites ! Les abeilles roses vont adorer. Merci, Alvin !", chef: false },
    { id: 'rondo', nom: 'Rondo', g: 'm', role: 'robot emballeur de colis', zone: 1, x: 16, y: 23, themes: ['rangement', 'ecole'],
      apparence: { espece: 'robot', couleur: '#86b6e0', accessoire: 'noeud' },
      bonjour: "Bip bip ! Je suis Rondo, le robot emballeur. J'ai des colis à préparer, mais mon calculateur fait des bulles.",
      merci: "Bip ! Colis prêts, rubans noués. Mon calculateur ne fait plus de bulles. Merci !", chef: false },

    // --- Zone 2 : Vergers en Rangées ---
    { id: 'pirli', nom: 'Pirli', g: 'f', role: 'jardinière des vergers', zone: 2, x: 30, y: 17, themes: ['jardin', 'cuisine'],
      apparence: { espece: 'plume', couleur: '#f2c25e', accessoire: 'echarpe' },
      bonjour: "Cui ! Je suis Pirli. Mes arbres donnent des pommes bleues, et je dois les ranger dans des paniers. Tu m'aides ?",
      merci: "Cui cui ! Tous mes paniers sont pleins. Je vais faire une tarte aux pommes bleues pour fêter ça !", chef: false },
    { id: 'boumi', nom: 'Boumi', g: 'm', role: 'entraîneur des équipes', zone: 2, x: 24, y: 21, themes: ['sport', 'ecole'],
      apparence: { espece: 'antenne', couleur: '#ef8f7a', accessoire: 'casquette' },
      bonjour: "Hop, hop, hop ! Je suis Boumi, l'entraîneur. Je dois faire des équipes égales, sinon tout le monde se dispute !",
      merci: "Des équipes parfaites, et plus personne ne se dispute ! Tu as gagné la médaille d'or du calcul.", chef: false },
    { id: 'nalou', nom: 'Nalou', g: 'f', role: 'soigneuse des canards bleus', zone: 2, x: 30, y: 25, themes: ['animaux', 'jardin'],
      apparence: { espece: 'etoile', couleur: '#9ad1e8', accessoire: 'chapeau' },
      bonjour: "Chut, mes canards font la sieste… Je suis Nalou. Je dois partager leurs graines sans en oublier un seul.",
      merci: "Coin coin, disent mes canards : ça veut dire merci ! Chacun a eu sa part, ils sont ravis.", chef: false },

    // --- Zone 3 : Fabrique de Boîtes ---
    { id: 'kizou', nom: 'Kizou', g: 'm', role: 'plieur de boîtes', zone: 3, x: 26, y: 3, themes: ['rangement', 'espace'],
      apparence: { espece: 'robot', couleur: '#b49ae0', accessoire: 'lunettes' },
      bonjour: "Bienvenue à la Fabrique de Boîtes ! Je suis Kizou. Je plie des boîtes toute la journée, mais je ne sais jamais combien il en faut.",
      merci: "Toutes les boîtes sont pliées et bien comptées. Tu peux venir travailler à la fabrique quand tu veux !", chef: false },
    { id: 'wapi', nom: 'Wapi', g: 'f', role: 'trieuse de rubans', zone: 3, x: 32, y: 5, themes: ['fete', 'rangement'],
      apparence: { espece: 'etoile', couleur: '#f5a3c7', accessoire: 'echarpe' },
      bonjour: "Oh là là, mes rubans sont tout emmêlés ! Je suis Wapi. Il faut les partager entre tous les paquets cadeaux.",
      merci: "Mes rubans sont démêlés et bien partagés. Regarde comme les paquets sont jolis maintenant !", chef: false },
    { id: 'fliko', nom: 'Fliko', g: 'm', role: 'livreur de colis de l’espace', zone: 3, x: 28, y: 11, themes: ['espace', 'ecole'],
      apparence: { espece: 'antenne', couleur: '#6fc3c0', accessoire: null },
      bonjour: "Salut ! Je suis Fliko, je livre des colis dans toute la galaxie. Mais charger ma soucoupe, c'est un vrai casse-tête !",
      merci: "Ma soucoupe est chargée ! Je file livrer mes colis. Si tu vois une étoile filante, c'est moi.", chef: false },

    // --- Zone 4 : Colline des Fêtes ---
    { id: 'sazou', nom: 'Sazou', g: 'f', role: 'organisatrice de fêtes', zone: 4, x: 14, y: 3, themes: ['fete', 'sport'],
      apparence: { espece: 'bulle', couleur: '#f7b27a', accessoire: 'noeud' },
      bonjour: "Une grande fête se prépare sur la colline ! Je suis Sazou. Il me faut des ballons, des jeux, des guirlandes… et des calculs !",
      merci: "Tout est prêt pour la fête ! Tu es invité, bien sûr. Tu seras même l'invité d'honneur.", chef: false },
    { id: 'douma', nom: 'Douma', g: 'm', role: 'pâtissier des gâteaux géants', zone: 4, x: 5, y: 3, themes: ['cuisine', 'fete'],
      apparence: { espece: 'champi', couleur: '#e58fa6', accessoire: 'tablier' },
      bonjour: "Je suis Douma, le pâtissier ! Mon gâteau est si grand qu'il faut le partager en parts égales… mais en combien ?",
      merci: "Chaque invité aura sa part de gâteau, pas une miette de plus ! Tiens, goûte la cerise du dessus.", chef: false },
    { id: 'pompa', nom: 'Pompa', g: 'f', role: 'reine de la Planète Paquets', zone: 4, x: 7, y: 9, themes: ['fete', 'espace', 'animaux'],
      apparence: { espece: 'plume', couleur: '#d8739f', accessoire: 'couronne' },
      bonjour: "Bonjour, Alvin ! Je suis la reine Pompa. On m'a dit que tu aides tout le monde. Résous mes problèmes, et je te ferai une belle surprise !",
      merci: "Bravo, Alvin ! Tu as aidé toute la Planète Paquets. Voici ma surprise : une pièce pour ta fusée, emballée avec un ruban doré. Avec elle, tu pourras voler jusqu'à la planète suivante !",
      chef: true },
  ],

  coffres: [
    { id: 'c1', x: 1, y: 16, zone: 1, souvenir: { id: 'pq-ruban', nom: "Ruban qui ne s'emmêle jamais" } },
    { id: 'c2', x: 38, y: 28, zone: 2, souvenir: { id: 'pq-pomme', nom: 'Pomme bleue du verger' } },
    { id: 'c3', x: 37, y: 1, zone: 3, souvenir: { id: 'pq-boite', nom: 'Minuscule boîte à musique' } },
    { id: 'c4', x: 1, y: 11, zone: 4, souvenir: { id: 'pq-bougie', nom: 'Bougie qui chante joyeux anniversaire' } },
  ],

  panneaux: [
    { id: 'p1', x: 5, y: 24, zone: 1, texte: 'Bienvenue sur la Planète Paquets ! Ici, tout se range par paquets égaux.' },
    { id: 'p2', x: 17, y: 25, zone: 1, texte: "Conseil d'Alvin : lis bien la question jusqu'au bout. C'est elle qui te dit ce qu'il faut chercher !" },
    { id: 'p3', x: 29, y: 19, zone: 2, texte: 'Les vergers : 4 rangées de 4 arbres. Pas besoin de tout compter : 4 fois 4, ça fait 16 !' },
    { id: 'p4', x: 29, y: 25, zone: 2, texte: 'Lac des canards bleus. Ne leur donne pas de gâteau : ils en redemandent toujours !' },
    { id: 'p5', x: 23, y: 5, zone: 3, texte: "Fabrique de Boîtes. Règle d'or : dans chaque boîte, le même nombre d'objets !" },
    { id: 'p6', x: 8, y: 7, zone: 4, texte: 'Place des Fêtes. Avant de partager, fais un schéma : chaque invité aura la même part !' },
  ],
});
