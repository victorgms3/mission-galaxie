'use strict';
/* Planète n°3 : Planète Marché — la monnaie : acheter, payer, rendre.
   Une vallée verte traversée par la Rivière Verte, qui arrive de l'ouest puis tourne vers le sud.
   Au nord-est, la Colline de la Banque domine la vallée du haut de ses falaises.
   Les 4 zones se visitent dans le sens des aiguilles d'une montre :
     1. La Ferme aux Fruits (sud-est, atterrissage) : vergers, ferme de Pomi, cantine.
     2. La Grande Place du Marché (sud-ouest) : étals colorés autour de la fontaine,
        derrière le pont cassé (19,23)-(20,23).
     3. La Rue des Boutiques (nord-ouest) : boulangerie, librairie, magasin de jouets,
        de l'autre côté du pont cassé (10,12)-(10,13).
     4. La Colline de la Banque (nord-est) : la banque et la place de la cheffe Doria,
        derrière la barrière du col (23,5).
   Légende : . sol · , sol variante · : chemin · f fleurs · ~ eau · = pont · # falaise · T arbre fruitier
             R rocher · C cristal · H maison/boutique · X barrière · M étal de marché · B pont cassé · P barrière de zone. */
Mondes.ajouter({
  id: 'marche', ordre: 3, notion: 'marche', nom: 'Planète Marché',
  description: 'La monnaie : acheter, payer, rendre',
  arrivee: "Bienvenue sur la Planète Marché ! Ici, dans cette vallée toute verte, on achète, on paie et on rend la monnaie. Aidons les habitants à compter leurs sous : la cheffe Doria, tout en haut de la colline, garde une pièce pour ma fusée !",

  //        0         1         2         3
  //        0123456789012345678901234567890123456789
  carte: [
    'TTRTTTTTTRTTTTTRTTTTTR###TTRTTTCTTTRTTCT', //  0
    'T.T,..T.ff.,T..f.,T..T###.,T..,..T.f.,.T', //  1
    'T.T.,..,.T..,.T...,.T####T..,.HHH..C.C.R', //  2   la banque
    'R..,HH.f.H.,.f..HH.f..###.f..:::..f.M.,T', //  3   boulangerie, magasin de jouets
    'T..M.:...:..,...:..,.T###..T.:...,....fT', //  4
    'T.:::::::::::::::::::::P::::::.,...,:.,T', //  5   la Rue des Boutiques et le col de la colline
    'T,..f.:...:.:.M.,.:.f.###,..T::::::::.TR', //  6
    'T.T.,.H.f.:.HH..T.H.,.###.T.,..Cf:ff.C,T', //  7   librairie ; place de la cheffe
    'T..ff..,T.:,..f..,..T.####.,.T.f.::.f..R', //  8
    'T,T..T...,:.T..,T.f..R###T..,..ff...ff.T', //  9
    '~~~~~.,T..:..R.,..T.,#####T..,..ff.ff.TR', // 10
    '~~~~~~~~~.:f.~~~~~~~~#####.,T..C.,...C.T', // 11
    'T,.f.~~~~~B~~~~~~~~~~####R.T.,.T.,.T.,.R', // 12  pont cassé vers la Rue des Boutiques
    'T..,.T..,~B~~.,.T..~~#####.,.R##f.R.,T.#', // 13
    'T.T.,.H.f.:.f.H.,.T~~###################', // 14  falaises de la Colline de la Banque
    'T,..H.,...:..,..H.f~~###################', // 15
    'R.f.T.,.f.:.f.,.T..~~R.,.R.f##.R..,#.T.T', // 16
    'T.,..f:::::::::f.,.T~~.T.T.T.,..f.HH.,.T', // 17  Grande Place ; ferme de Pomi
    'T..T.:M:M:::M:M:..f.~~,.f.f.f.,::::.f..R', // 18
    'T,..,:::::::::::,.T.~~T.T.T.T..:.,.ff.,T', // 19
    'R.f..::::~~:::::.,..~~.f.,.f.,.:...fMf.T', // 20  fontaine de la place
    'T..,.::::~~:::::.T.~~..T.T.T..,:.f.,.T.R', // 21
    'Tf..T:::::::::::..,~~..,::::::::..f.,..T', // 22
    'T.,..:M:M:::M:M::::BB::::.,:.M.::::..f.R', // 23  pont cassé vers la Grande Place
    'R..f.f:::::::::f.,.~~..f.,.:.f....:...,T', // 24  fusée en (36, 24)
    'T.T.,.H.f.:.,H..T..~~T..T.,:..f.,...f..T', // 25
    'T,.T..,...:...f.,.~~.,.T.f.:.,.T..f.,.TT', // 26
    'T.T.f.T.,.:.T..T.T~~T..f.,.HH..,.T..R..T', // 27  cantine de Gribo
    'T.TT.,.fT.H.,.T.,.~~T...,.T..f..T.,..f.T', // 28
    'TRTTTRTTTTRTTTRTTT~~TTRTTTTRTTTTRTTTTRTT', // 29
  ],

  depart: { x: 35, y: 24 }, fusee: { x: 36, y: 24 },

  zones: [
    { id: 1, nom: 'La Ferme aux Fruits', requis: 0 },
    { id: 2, nom: 'La Grande Place du Marché', requis: 8, portes: [[19, 23], [20, 23]],
      message: 'Oh non, le pont de la Grande Place est cassé ! Aide 2 habitants de la ferme (8 problèmes), et ils viendront le réparer.' },
    { id: 3, nom: 'La Rue des Boutiques', requis: 20, portes: [[10, 12], [10, 13]],
      message: 'Ce pont mène à la Rue des Boutiques, mais il lui manque des planches. Quand tu auras aidé 5 habitants (20 problèmes), les marchands le répareront.' },
    { id: 4, nom: 'La Colline de la Banque', requis: 32, portes: [[23, 5]],
      message: "La barrière de la Colline de la Banque est fermée à clé. La cheffe Doria l'ouvrira quand tu auras aidé 8 habitants (32 problèmes)." },
  ],

  pnj: [
    // --- Zone 1 : la Ferme aux Fruits ---
    { id: 'tilou', nom: 'Tilou', g: 'm', role: 'petit client avec sa tirelire', zone: 1, x: 32, y: 24, themes: ['jouets', 'fete'],
      apparence: { espece: 'bulle', couleur: '#f2b84b', accessoire: 'casquette' },
      bonjour: "Salut ! Moi, c'est Tilou. J'ai cassé ma tirelire pour acheter des cadeaux. Mais est-ce que j'ai assez de pièces ? Je n'arrive pas à compter mes sous !",
      merci: "Youpi ! Je sais ce que je peux acheter, et même ce qu'il me restera. Je vais remettre la monnaie dans ma tirelire... dès que je l'aurai recollée !", chef: false },
    { id: 'pomi', nom: 'Pomi', g: 'f', role: 'fermière des vergers', zone: 1, x: 35, y: 18, themes: ['fruits', 'cantine'],
      apparence: { espece: 'champi', couleur: '#e2725b', accessoire: 'chapeau' },
      bonjour: "Bonjour ! Je suis Pomi, la fermière. Mes arbres croulent sous les pommes et les prunes bleues. Mais quand je les vends, je m'embrouille dans les sous !",
      merci: 'Merci ! Mes fruits sont vendus et ma caisse est juste. Tiens, croque cette pomme : c’est cadeau !', chef: false },
    { id: 'gribo', nom: 'Gribo', g: 'm', role: 'cuisinier de la cantine', zone: 1, x: 26, y: 26, themes: ['cantine', 'fruits'],
      apparence: { espece: 'robot', couleur: '#8fb8d0', accessoire: 'tablier' },
      bonjour: 'Bip bip ! Je suis Gribo, le robot cuisinier de la cantine. Je dois faire les courses pour tous les enfants, mais mon porte-monnaie fait des étincelles !',
      merci: "Bip ! Les courses sont faites et le repas est prêt. Aujourd'hui, au menu : purée de calculs et compote de réussite !", chef: false },

    // --- Zone 2 : la Grande Place du Marché ---
    { id: 'nabou', nom: 'Nabou', g: 'f', role: 'marchande de vêtements', zone: 2, x: 13, y: 18, themes: ['vetements', 'fete'],
      apparence: { espece: 'etoile', couleur: '#c792d8', accessoire: 'echarpe' },
      bonjour: 'Approchez, approchez ! Je suis Nabou. Je vends des bonnets, des écharpes et des chaussettes à six orteils. Mais rendre la monnaie, quel casse-tête !',
      merci: 'Merci ! Maintenant, je rends la monnaie sans me tromper. Tiens, une écharpe pour toi... et une toute petite pour ta queue !', chef: false },
    { id: 'zebo', nom: 'Zébo', g: 'm', role: 'vendeur de ballons et de cotillons', zone: 2, x: 7, y: 23, themes: ['fete', 'jouets'],
      apparence: { espece: 'antenne', couleur: '#f29ab0', accessoire: 'chapeau' },
      bonjour: 'Ballons, guirlandes, chapeaux pointus ! Je suis Zébo. Ce soir, c’est la fête du marché, et tout le monde veut acheter en même temps !',
      merci: 'Tout est vendu, et ma caisse est juste ! Ce soir, viens à la fête : tu seras à la place d’honneur.', chef: false },
    { id: 'moka', nom: 'Moka', g: 'f', role: 'cliente gourmande', zone: 2, x: 11, y: 21, themes: ['boulangerie', 'fruits'],
      apparence: { espece: 'plume', couleur: '#e0a46e', accessoire: null },
      bonjour: "Bonjour ! Je suis Moka. J'ai une longue liste de courses et un tout petit porte-monnaie. Tu m'aides à savoir combien je vais payer ?",
      merci: 'Merci ! J’ai tout acheté, et il me reste même une pièce pour faire un vœu dans la fontaine.', chef: false },

    // --- Zone 3 : la Rue des Boutiques ---
    { id: 'farou', nom: 'Farou', g: 'm', role: 'boulanger', zone: 3, x: 6, y: 4, themes: ['boulangerie', 'cantine'],
      apparence: { espece: 'champi', couleur: '#e3b36b', accessoire: 'tablier' },
      bonjour: 'Bonjour ! Je suis Farou, le boulanger. Mes croissants sont si légers qu’ils s’envolent ! Mais à la caisse, c’est moi qui suis dans les nuages.',
      merci: "Merci ! Ma caisse est en ordre. Tiens, un croissant tout chaud... Attrape-le vite avant qu'il ne s'envole !", chef: false },
    { id: 'lirka', nom: 'Lirka', g: 'f', role: 'libraire', zone: 3, x: 11, y: 6, themes: ['librairie', 'espace'],
      apparence: { espece: 'antenne', couleur: '#8d87d9', accessoire: 'lunettes' },
      bonjour: 'Chut, ici on lit ! Je suis Lirka, la libraire. Je connais toutes les histoires par cœur, mais les prix de mes livres, je les oublie tout le temps.',
      merci: 'Merci ! Mes comptes sont aussi bien rangés que mes étagères. Reviens quand tu veux, je te prêterai mon livre préféré.', chef: false },
    { id: 'toupi', nom: 'Toupi', g: 'm', role: 'marchand de jouets', zone: 3, x: 18, y: 4, themes: ['jouets', 'fete'],
      apparence: { espece: 'robot', couleur: '#d96f8c', accessoire: 'casquette' },
      bonjour: 'Vroum vroum ! Je suis Toupi, le marchand de jouets. Toupies, robots, fusées en bois... Tout le monde veut jouer, mais personne ne sait compter les sous !',
      merci: 'Bip vroum ! Tous mes jouets ont trouvé une maison. Tu comptes les sous à la perfection !', chef: false },

    // --- Zone 4 : la Colline de la Banque ---
    { id: 'dorlo', nom: 'Dorlo', g: 'm', role: 'banquier de la planète', zone: 4, x: 32, y: 3, themes: ['espace', 'fete'],
      apparence: { espece: 'etoile', couleur: '#4fa89a', accessoire: 'noeud' },
      bonjour: "Bienvenue à la banque ! Je suis Dorlo, le banquier. Je garde les pièces de toute la planète. Mais j'en ai tant que je ne sais plus combien il y en a !",
      merci: 'Merci ! Toutes les pièces sont comptées, et pas une ne manque. Tu pourrais travailler à la banque !', chef: false },
    { id: 'vega', nom: 'Véga', g: 'f', role: "marchande de souvenirs de l'espace", zone: 4, x: 36, y: 4, themes: ['espace', 'vetements'],
      apparence: { espece: 'bulle', couleur: '#7fb6e0', accessoire: 'echarpe' },
      bonjour: "Coucou ! Je suis Véga. Je vends des souvenirs de toute la galaxie : cailloux de lune, poussière d'étoile, bonnets de comète. Mais les prix me font tourner la tête !",
      merci: 'Merci ! Tiens, un caillou de lune en souvenir. Il ne vaut pas un sou, mais il brille la nuit !', chef: false },
    { id: 'doria', nom: 'Doria', g: 'f', role: 'cheffe de la Planète Marché', zone: 4, x: 34, y: 9, themes: ['fete', 'espace', 'jouets'],
      apparence: { espece: 'plume', couleur: '#e9b949', accessoire: 'couronne' },
      bonjour: "Bonjour, Alvin ! Je suis Doria, la cheffe de la Planète Marché. Tout le monde parle de toi sur la place ! J'ai gardé une pièce pour ta fusée. Résous mes problèmes, et elle sera à toi.",
      merci: "Bravo ! Grâce à toi, toute la Planète Marché sait compter ses sous. Voici la pièce qui manquait à ta fusée. Pas une pièce de monnaie, hein : une vraie pièce de fusée ! Elle t'emmènera vers la planète suivante.",
      chef: true },
  ],

  coffres: [
    { id: 'c1', x: 38, y: 16, zone: 1, souvenir: { id: 'ma-pomme', nom: 'Pomme dorée du verger' } },             // au pied de la falaise, derrière un arbre
    { id: 'c2', x: 1, y: 28, zone: 2, souvenir: { id: 'ma-piece', nom: 'Pièce porte-bonheur de la fontaine' } }, // tout au sud-ouest, derrière les arbres
    { id: 'c3', x: 1, y: 1, zone: 3, souvenir: { id: 'ma-toupie', nom: 'Toupie qui danse toute seule' } },       // derrière la boulangerie, dans le coin
    { id: 'c4', x: 38, y: 13, zone: 4, souvenir: { id: 'ma-tirelire', nom: 'Tirelire en forme de fusée' } },     // au bord de la falaise, derrière un arbre
  ],

  panneaux: [
    { id: 'p1', x: 35, y: 23, zone: 1, texte: 'Bienvenue sur la Planète Marché ! Ici, on paie avec des pièces et des billets, et on rend toujours la monnaie avec le sourire.' },
    { id: 'p2', x: 22, y: 22, zone: 1, texte: 'Conseil de la vallée : lis bien la question ! Cherches-tu ce que l’on paie, ou ce que l’on te rend ?' },
    { id: 'p3', x: 17, y: 22, zone: 2, texte: 'Grande Place du Marché. Pour connaître le prix de plusieurs choses, on ajoute tous les prix.' },
    { id: 'p4', x: 8, y: 21, zone: 2, texte: 'Fontaine des vœux. Une pièce dans l’eau, un vœu dans la tête… mais garde assez de sous pour tes courses !' },
    { id: 'p5', x: 9, y: 6, zone: 3, texte: 'Rue des Boutiques. Astuce : pour savoir combien on te rend, pars du prix et avance jusqu’à la somme donnée.' },
    { id: 'p6', x: 26, y: 4, zone: 4, texte: 'Colline de la Banque. Dernier conseil : relis ta réponse. On ne peut jamais te rendre plus que ce que tu as donné !' },
  ],
});
