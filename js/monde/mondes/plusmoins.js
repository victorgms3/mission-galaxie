'use strict';
/* Planète n°1 : Planète Plus-ou-Moins — additions, soustractions et comparaisons.
   Un désert doux couleur sable, coupé du nord au sud par une rivière turquoise.
   Zone 1 (sud-ouest)  : l'Oasis Turquoise, où atterrit la fusée.
   Zone 2 (nord-ouest) : le Village des Huttes, derrière le petit pont cassé (9,14)-(9,15).
   Zone 3 (nord-est)   : les Dunes aux Cactus, de l'autre côté du grand pont cassé (20,6)-(21,6).
   Zone 4 (sud-est)    : le Plateau des Palmiers et la cheffe Sabla, derrière la barrière (30,15).
   Légende : . sol · , sol variante · : chemin · f fleurs · ~ eau · = pont · # falaise · T palmier · R rocher
             C cristal · H hutte · X barrière · M cactus/palmier · B pont cassé · P barrière de zone. */
Mondes.ajouter({
  id: 'plusmoins', ordre: 1, notion: 'plusmoins', nom: 'Planète Plus-ou-Moins',
  description: 'Additions, soustractions et comparaisons',
  arrivee: "Nous voici sur la Planète Plus-ou-Moins ! Du sable tout doux, une oasis turquoise et des habitants qui ajoutent, enlèvent et comparent toute la journée. Allons les aider : on dit que la cheffe Sabla garde une pièce pour ma fusée !",

  //        0         1         2         3
  //        0123456789012345678901234567890123456789
  carte: [
    '#RR##TT#RR##TT##R#RT~~#RR##T#RRT##R#TT##', //  0
    '#.T..,...,.T...,..T.~~.,.M..C.,..T..M.,#', //  1
    '#..H.,..H...,.H..M..~~..H..,.XXXXXX..C.R', //  2
    'R..:::::::::::::.,.~~~..:.,..XMfMfX.,..#', //  3
    '#M..,.ff.:..T..,...~~~.,:..T.XffMfX..M.T', //  4
    '#..H..f..:.,..XXX.,.~~..:.,.:::::::.,..R', //  5
    'T.,::::::::..,..::::BB:::::::.,..C..T..#', //  6
    '#.R.,...:M:::::::.M.~~.M.,:..R..,..H..M#', //  7
    '#..T..,.:::..H..ff..~~~...:::..f...:.,.#', //  8
    'R.H...f..:.,.....R.,.~~.,C..:...M..:..CR', //  9
    '#...,....:..M..,....,~~...T.::::::::...#', // 10
    '#T...R.,::....T..,.T~~~.R..,..:..CC.,.T#', // 11
    '#.M.....:.,..f..M...~~..M...f.:....M...T', // 12
    '#...~~~~::..,..T...~~~,..T....:.R...,M.R', // 13
    '~~~~~~~~~B~~~.,.~~~~~~..,..###:###..f..#', // 14
    '~~~~,.R.~B~~~~~~~~~~~~########P#########', // 15
    'T.,..M...:.,.~~~.T.~~~########:#########', // 16
    '#.H.,....:...,..R..~~..T.,..M.:..R..,.T#', // 17
    '#.:..,...:.T.f.,...~~~..,....::...ff...R', // 18
    'R.::::::::..f~~~f.T.~~T...H..:.,.f~~~f.#', // 19
    '#.T.,...:..T~~~~~T.,~~~...::::..T~~~~~T#', // 20
    '#..M...::::f~~~~~f...~~.M..,.:..f~~~~~.#', // 21
    'R.,....:..:.f~~~fM...~~,..R..:H..f~~~f.R', // 22
    '#....,::..::::.f.T..~~~..T.:::::::.,.M.#', // 23
    'T.,..::..,...::::H..~~..,..:.....:..H..#', // 24
    '#..,...f..M...,....~~~T..M.:.fMf.::::..R', // 25
    '#T...,..R...T..M..,~~..,..::...,...T..,#', // 26
    '#.M.,.T...RR.ff..T.~~~.M..:.R..T.ff..M.T', // 27
    'R..T...,.T...M.....R~~...,...T...,....T#', // 28
    '#TR##RT##TT#R##RT#R#~~#RT##R#TT##R#T##R#', // 29
  ],

  depart: { x: 5, y: 24 }, fusee: { x: 4, y: 24 },

  zones: [
    { id: 1, nom: "L'Oasis Turquoise", requis: 0 },
    { id: 2, nom: 'Le Village des Huttes', requis: 8, portes: [[9, 14], [9, 15]],
      message: "Oh non, le petit pont est cassé ! Aide 2 habitants de l'oasis (8 problèmes) et ils le répareront." },
    { id: 3, nom: 'Les Dunes aux Cactus', requis: 20, portes: [[20, 6], [21, 6]],
      message: 'Le grand pont de la rivière est cassé ! Quand tu auras aidé 5 habitants (20 problèmes), le village le réparera.' },
    { id: 4, nom: 'Le Plateau des Palmiers', requis: 32, portes: [[30, 15]],
      message: "La barrière du plateau est fermée. La cheffe Sabla l'ouvrira quand tu auras aidé 8 habitants (32 problèmes)." },
  ],

  pnj: [
    // --- Zone 1 : l'Oasis Turquoise ---
    { id: 'tobo', nom: 'Tobo', g: 'm', role: 'champion de course des dunes', zone: 1, x: 8, y: 22, themes: ['sport', 'jeux'],
      apparence: { espece: 'robot', couleur: '#4fb3a9', accessoire: 'casquette' },
      bonjour: "Bip bip ! Je suis Tobo, le plus rapide des dunes. Mais quand je compte mes tours de course, mes circuits chauffent ! Tu m'aides ?",
      merci: 'Bip bip hourra ! Grâce à toi, mes circuits sont tout frais.', chef: false },
    { id: 'zubi', nom: 'Zubi', g: 'm', role: "jardinier de l'oasis", zone: 1, x: 12, y: 22, themes: ['nature', 'animaux'],
      apparence: { espece: 'bulle', couleur: '#8cc084', accessoire: 'chapeau' },
      bonjour: "Salut ! Moi, c'est Zubi. Je compte les fleurs de l'oasis, mais les papillons se posent dessus et je m'emmêle !",
      merci: 'Merci ! Mes fleurs sont bien comptées, et même les papillons sont contents.', chef: false },
    { id: 'pipa', nom: 'Pipa', g: 'f', role: 'collectionneuse de coquillages', zone: 1, x: 4, y: 18, themes: ['jeux', 'nature'],
      apparence: { espece: 'plume', couleur: '#ef9f7a', accessoire: 'noeud' },
      bonjour: "Coucou ! Je suis Pipa. Je ramasse les coquillages du désert, mais j'en trouve tellement que je ne sais plus combien j'en ai !",
      merci: 'Youpi ! Ma collection est bien rangée. Tu es un vrai trésor !', chef: false },

    // --- Zone 2 : le Village des Huttes ---
    { id: 'nouka', nom: 'Nouka', g: 'f', role: 'cuisinière du village', zone: 2, x: 5, y: 4, themes: ['cuisine', 'nature'],
      apparence: { espece: 'champi', couleur: '#d9825b', accessoire: 'tablier' },
      bonjour: 'Bonjour ! Je suis Nouka. Je prépare la soupe de dattes pour tout le village, mais ma recette est pleine de calculs !',
      merci: "Merci ! Ce soir, soupe de dattes pour tout le monde. Je t'en garde un grand bol.", chef: false },
    { id: 'kiko', nom: 'Kiko', g: 'm', role: "maître d'école", zone: 2, x: 12, y: 8, themes: ['ecole', 'jeux'],
      apparence: { espece: 'antenne', couleur: '#e3b04b', accessoire: 'lunettes' },
      bonjour: "Ah, une visite ! Je suis Kiko, le maître d'école. Mes élèves m'ont posé des problèmes, et j'ai oublié les réponses. Chut, ne le dis à personne !",
      merci: 'Bravo ! Tu mérites une étoile dorée sur ton cahier.', chef: false },
    { id: 'lalou', nom: 'Lalou', g: 'f', role: 'championne de billes', zone: 2, x: 17, y: 7, themes: ['jeux', 'sport'],
      apparence: { espece: 'etoile', couleur: '#e59aa6', accessoire: 'echarpe' },
      bonjour: "Hé ! Je suis Lalou, la championne de billes. On fait une partie ? Mais d'abord, aide-moi à compter mes points !",
      merci: 'Gagné ! Avec toi, je compte mes points sans me tromper. Tope là !', chef: false },

    // --- Zone 3 : les Dunes aux Cactus ---
    { id: 'pilou', nom: 'Pilou', g: 'm', role: 'gardien des cactus géants', zone: 3, x: 31, y: 6, themes: ['nature', 'animaux'],
      apparence: { espece: 'plume', couleur: '#79b8d9', accessoire: 'chapeau' },
      bonjour: "Doucement, ça pique ! Je suis Pilou, je veille sur les cactus géants. Ils poussent si vite que je n'arrive plus à les compter !",
      merci: 'Merci ! Mes cactus te font un câlin... enfin, de loin, parce que ça pique !', chef: false },
    { id: 'tika', nom: 'Tika', g: 'f', role: 'lanceuse de frisbee', zone: 3, x: 27, y: 9, themes: ['sport', 'jeux'],
      apparence: { espece: 'bulle', couleur: '#a596d9', accessoire: 'casquette' },
      bonjour: 'Attention, frisbee ! Oups, pardon. Je suis Tika. Je lance mon frisbee très loin, mais je me trompe toujours dans mes scores !',
      merci: 'Super lancer ! Avec toi, mes scores sont parfaits.', chef: false },
    { id: 'bobo', nom: 'Bobo', g: 'm', role: 'cuisinier de crêpes au cactus', zone: 3, x: 34, y: 9, themes: ['cuisine', 'voyage'],
      apparence: { espece: 'robot', couleur: '#b07aa1', accessoire: 'tablier' },
      bonjour: "Bzzz... Bonjour ! Je suis Bobo, le robot cuisinier. Mes crêpes au cactus sont délicieuses, mais mes calculs sont tout brûlés !",
      merci: 'Bzzz, merci ! Tiens, une crêpe au cactus. Ne crains rien, j’ai enlevé les piquants.', chef: false },

    // --- Zone 4 : le Plateau des Palmiers ---
    { id: 'yuna', nom: 'Yuna', g: 'f', role: 'astronome du plateau', zone: 4, x: 27, y: 19, themes: ['espace', 'ecole'],
      apparence: { espece: 'antenne', couleur: '#3fa39a', accessoire: 'lunettes' },
      bonjour: "Bonsoir... euh, bonjour ! Je suis Yuna. La nuit, je compte les étoiles. Le jour, je suis encore toute endormie. Tu m'aides ?",
      merci: 'Merci ! Cette nuit, je donnerai ton prénom à une étoile.', chef: false },
    { id: 'pako', nom: 'Pako', g: 'm', role: 'voyageur des sables', zone: 4, x: 34, y: 26, themes: ['voyage', 'animaux'],
      apparence: { espece: 'champi', couleur: '#7fae5e', accessoire: 'echarpe' },
      bonjour: 'Salut ! Je suis Pako. Je traverse le désert avec mes chameaux à six bosses. Mais combien de chemin me reste-t-il ?',
      merci: 'Merci ! Je ne me perdrai plus dans les dunes. Mes chameaux te disent merci aussi !', chef: false },
    { id: 'sabla', nom: 'Sabla', g: 'f', role: 'cheffe de la planète', zone: 4, x: 31, y: 22, themes: ['espace', 'voyage', 'jeux'],
      apparence: { espece: 'etoile', couleur: '#e76f51', accessoire: 'couronne' },
      bonjour: 'Bienvenue sur mon plateau ! Je suis Sabla, la cheffe de la planète. Je garde une pièce de fusée très précieuse. Résous mes problèmes, et elle sera à toi !',
      merci: "Tu as aidé toute ma planète ! Voici la pièce qui manquait à la fusée d'Alvin. Elle vous emmènera vers la planète suivante !", chef: true },
  ],

  coffres: [
    { id: 'c1', x: 18, y: 16, zone: 1, souvenir: { id: 'pm-coquillage', nom: 'Coquillage qui chante' } },  // caché derrière un palmier, au bord de l'eau
    { id: 'c2', x: 1, y: 12, zone: 2, souvenir: { id: 'pm-bille', nom: 'Bille turquoise' } },             // derrière un cactus, près du ruisseau
    { id: 'c3', x: 38, y: 1, zone: 3, souvenir: { id: 'pm-cristal', nom: 'Cristal des dunes' } },          // tout au nord-est, derrière un cristal
    { id: 'c4', x: 22, y: 28, zone: 4, souvenir: { id: 'pm-sablier', nom: 'Sablier magique' } },           // au bord de la rivière, au sud
  ],

  panneaux: [
    { id: 'p1', x: 3, y: 23, zone: 1, texte: 'Bienvenue sur la Planète Plus-ou-Moins ! Ici, on ajoute, on enlève et on compare. Attention, le sable chatouille les pattes.' },
    { id: 'p2', x: 10, y: 17, zone: 1, texte: "Conseil de l'oasis : lis bien la question ! Avant de calculer, demande-toi ce que tu cherches." },
    { id: 'p3', x: 7, y: 8, zone: 2, texte: 'Village des Huttes. Astuce : fais un schéma ! Le tout est toujours plus grand que chacune de ses parties.' },
    { id: 'p4', x: 22, y: 7, zone: 3, texte: 'Dunes aux Cactus. Les cactus piquent, mais les calculs, eux, ne piquent pas !' },
    { id: 'p5', x: 31, y: 13, zone: 3, texte: "Pour comparer deux nombres, cherche l'écart : combien l'un a-t-il de plus que l'autre ?" },
    { id: 'p6', x: 28, y: 24, zone: 4, texte: 'Place de la cheffe Sabla. Dernier conseil : quand tu as fini, relis ta réponse. A-t-elle du sens ?' },
  ],
});
