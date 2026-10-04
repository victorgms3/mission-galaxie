'use strict';
/* Planète n°4 : Planète Tic-Tac — les mesures, les durées et les heures.
   Une planète givrée et bleutée. Au centre, un grand lac gelé entoure l'Île de la Grande Horloge,
   que l'on voit de partout. On fait le tour du lac comme les aiguilles d'une montre :
   Zone 1 (sud)              : la Gare des Petits Trains, où atterrit la fusée, au bord du lac.
   Zone 2 (ouest et nord)    : le Village des Ateliers, de l'autre côté de la rivière gelée (pont cassé (5,18)-(5,19)).
   Zone 3 (nord-est et est)  : le Stade du Lac Gelé, derrière la barrière du col dans la falaise (22,4).
   Zone 4 (centre)           : l'Île de la Grande Horloge et le Grand Horloger Orlo, par le pont cassé (26,13)-(27,13).
   Légende : . sol · , sol variante · : chemin · f fleurs de givre · ~ eau gelée · = pont · # falaise · T sapin givré
             R rocher · C cristal de glace · H maison · X barrière · M grande horloge · B pont cassé · P barrière de zone. */
Mondes.ajouter({
  id: 'tictac', ordre: 4, notion: 'tictac', nom: 'Planète Tic-Tac',
  description: 'Les mesures, les durées et les heures',
  arrivee: "Brrr, nous voici sur la Planète Tic-Tac ! Ici, tout est givré, et des horloges font tic-tac partout. Tu vois l'île au milieu du lac gelé ? C'est là que vit Orlo, le Grand Horloger. On dit qu'il garde une pièce pour ma fusée !",

  //        0         1         2         3
  //        0123456789012345678901234567890123456789
  carte: [
    'TTTTTTTRTTTTRTTTTTTTT###TTTTTTRTTTTRTTTT', //  0
    'T,TTTT..TTT.....TTTTT###TC...XXXXXXXX.TR', //  1
    'R,.T..ff.T..HHM....TT###T.ffMX::::::Xf.C', //  2   pâtisserie de Choko ; le stade et sa piste
    'TT..............ff..T###..f..X:,,,,:X.fR', //  3
    'T.f......:::::::..::::P:::...X::::::XT.T', //  4   barrière du col (zone 3)
    'T..f..::::.f...::::.T###.:::.XXX::XXX..T', //  5
    'CTHH.::.f.fT.TT.R..TT###...::::::..,,.CT', //  6
    'TT...:.f..T.T,,.~~~~~~~~~~.TT.:..,,,,,.T', //  7
    'T,...:.....,T,~~~~~~~~~~~~~~..::,,,,HH.T', //  8   atelier de Fila ; observatoire d'Orbi
    'T,..:::.HH.,,~~~~TR..TT~~~~~~..:::::,,CT', //  9
    'R.f.:M:::.T,~~~MC..M...Cf~~~~..:R,,,,.fT', // 10   horloge du village ; la Grande Horloge (19,10)
    'T...:::...T.~~...::::::..T~~..::..TT.C.T', // 11
    'T.....:.f..~~~T.::.ff.::..~~..:.ffT.R..T', // 12
    'T.HH..:.f.T~~~..:......:::BB:::.......RT', // 13   pont cassé de l'île (zone 4)
    'T...:::..TT.~~C.::.ff.::..~~.......CC..T', // 14
    'TT...::.....~~~..::::::.M~~~~T....C..C.T', // 15
    'TTTf.:..TT,C~~~~~f....f~~~~~~T.....C.C.T', // 16   bosquet de cristaux
    'TTT.f:...T,,~~~~~~~~~~~~~~~~.....T...CCT', // 17
    '~~~~~B~~~~~~~~TT.ff..ff,,,,.############', // 18   pont cassé de la rivière (zone 2)
    '~~~~~B~~~~~~~.T.f.....,f,,.R############', // 19   fusée (19,19)
    'TTT..:.HHM.........:...,,HH.RR.R......TT', // 20   la gare et son horloge
    'TT...:::::::...::::::::.........ff.ff.TT', // 21
    'T..f.......:::::......:::::.....ff.ff..T', // 22
    'T...f.XXXX..f:....TT.T....:...::::::::.T', // 23   jardin des fleurs de givre
    'T,~~....TT...::...T.R.....::::::ff.ff..R', // 24
    'R,~~~....TT...:....f.~~.TT..TT.:ff,ff,.C', // 25
    'T,,~~.......HHM,.T..f~~~.Tf....::::::,.R', // 26   atelier d'horlogerie de Pendo
    'T,ff..TT..ff,,,,.TT...~..fTT.T..ff,ff,.T', // 27
    'TT.T...TT..T,,,.T......TT.....T..,,,,T.T', // 28
    'CTTTRTTTTTTTTTTTTTTRTTTCTTTRTTTTTTTTTTTT', // 29
  ],

  depart: { x: 19, y: 20 }, fusee: { x: 19, y: 19 },

  zones: [
    { id: 1, nom: 'La Gare des Petits Trains', requis: 0 },
    { id: 2, nom: 'Le Village des Ateliers', requis: 8, portes: [[5, 18], [5, 19]],
      message: 'Oh non, le pont de la rivière gelée est cassé ! Aide 2 habitants de la gare (8 problèmes), et ils le répareront.' },
    { id: 3, nom: 'Le Stade du Lac Gelé', requis: 20, portes: [[22, 4]],
      message: 'La barrière de la falaise est fermée. Elle s’ouvrira quand tu auras aidé 5 habitants (20 problèmes).' },
    { id: 4, nom: "L'Île de la Grande Horloge", requis: 32, portes: [[26, 13], [27, 13]],
      message: "Le pont de l'île est cassé ! Orlo, le Grand Horloger, le fera réparer quand tu auras aidé 8 habitants (32 problèmes)." },
  ],

  pnj: [
    // --- Zone 1 : la Gare des Petits Trains ---
    { id: 'wagou', nom: 'Wagou', g: 'm', role: 'chef de gare des petits trains', zone: 1, x: 10, y: 20, themes: ['horaires', 'voyage'],
      apparence: { espece: 'antenne', couleur: '#d9714e', accessoire: 'casquette' },
      bonjour: "Tchou tchou ! Je suis Wagou, le chef de gare. Mes petits trains doivent partir à l'heure, mais je mélange toutes mes horloges ! Tu m'aides ?",
      merci: "Tchou tchou, merci ! Tous mes trains partent à l'heure. Même le train des escargots !", chef: false },
    { id: 'pendo', nom: 'Pendo', g: 'm', role: 'apprenti horloger', zone: 1, x: 13, y: 25, themes: ['ecole', 'horaires'],
      apparence: { espece: 'robot', couleur: '#c58b4e', accessoire: 'lunettes' },
      bonjour: "Tic, tac, bip ! Je suis Pendo, l'apprenti horloger. Maître Orlo m'a donné des devoirs sur les durées, et mes engrenages tournent à l'envers !",
      merci: 'Tic, tac, merci ! Mes engrenages tournent enfin dans le bon sens. Maître Orlo sera fier de moi.', chef: false },
    { id: 'nivi', nom: 'Nivi', g: 'f', role: 'jardinière des fleurs de givre', zone: 1, x: 34, y: 24, themes: ['jardin', 'horaires'],
      apparence: { espece: 'plume', couleur: '#8cc7a1', accessoire: 'chapeau' },
      bonjour: "Bonjour ! Je suis Nivi. Chacune de mes fleurs de givre s'ouvre à une heure précise. Mais quelle heure est-il ? Je suis toute perdue !",
      merci: "Merci ! Regarde, mes fleurs de givre s'ouvrent pile à l'heure. On dirait des petites étoiles !", chef: false },

    // --- Zone 2 : le Village des Ateliers ---
    { id: 'fila', nom: 'Fila', g: 'f', role: 'couturière du village', zone: 2, x: 9, y: 10, themes: ['bricolage', 'sport'],
      apparence: { espece: 'champi', couleur: '#e58fa6', accessoire: 'noeud' },
      bonjour: "Coucou ! Je suis Fila, la couturière. Je couds les maillots de l'équipe du stade, mais mon mètre ruban fait des nœuds partout !",
      merci: 'Merci ! Tous les maillots sont prêts. Je vais même en coudre un pour Alvin, avec un chat dessus !', chef: false },
    { id: 'vissou', nom: 'Vissou', g: 'm', role: 'bricoleur des ateliers', zone: 2, x: 2, y: 14, themes: ['bricolage', 'jardin'],
      apparence: { espece: 'bulle', couleur: '#e3b04b', accessoire: 'tablier' },
      bonjour: 'Salut ! Moi, c’est Vissou, le bricoleur. Je construis une cabane pour les pingouins des neiges, mais toutes mes planches sont de travers !',
      merci: 'Merci ! La cabane est bien droite. Les pingouins viennent d’emménager, ils sont ravis !', chef: false },
    { id: 'choko', nom: 'Choko', g: 'm', role: 'pâtissier', zone: 2, x: 13, y: 3, themes: ['cuisine', 'horaires'],
      apparence: { espece: 'etoile', couleur: '#b07a55', accessoire: 'chapeau' },
      bonjour: 'Bienvenue dans ma pâtisserie ! Je suis Choko. Mes gâteaux doivent cuire juste le bon temps. Sinon, ils deviennent durs comme des cailloux !',
      merci: 'Merci ! Mes gâteaux sont parfaits, ni trop cuits ni pas assez. Tiens, goûte une part !', chef: false },

    // --- Zone 3 : le Stade du Lac Gelé ---
    { id: 'zipo', nom: 'Zipo', g: 'm', role: 'entraîneur du stade', zone: 3, x: 32, y: 3, themes: ['sport', 'horaires'],
      apparence: { espece: 'robot', couleur: '#4fa39a', accessoire: 'casquette' },
      bonjour: "Un, deux ! Un, deux ! Je suis Zipo, l'entraîneur du stade. Je chronomètre mes coureurs, mais j'oublie toujours d'arrêter mon chrono !",
      merci: 'Bravo ! Grâce à toi, mon chrono est bien réglé. On fait un tour de piste pour fêter ça ?', chef: false },
    { id: 'lumi', nom: 'Lumi', g: 'f', role: 'patineuse du lac gelé', zone: 3, x: 28, y: 11, themes: ['sport', 'voyage'],
      apparence: { espece: 'etoile', couleur: '#a596e0', accessoire: 'echarpe' },
      bonjour: 'Wiii ! Je suis Lumi, la patineuse. Je glisse si vite sur le lac gelé que je ne sais plus combien de temps durent mes balades !',
      merci: 'Merci ! Regarde bien : je fais une pirouette rien que pour toi !', chef: false },
    { id: 'orbi', nom: 'Orbi', g: 'm', role: "guetteur d'étoiles", zone: 3, x: 36, y: 9, themes: ['espace', 'ecole'],
      apparence: { espece: 'bulle', couleur: '#5f74c9', accessoire: 'echarpe' },
      bonjour: "Chut... Je suis Orbi, le guetteur d'étoiles. Les étoiles filantes passent toujours pendant que je dors. Il faut que je calcule mes heures de veille !",
      merci: 'Merci ! Cette nuit, je verrai enfin une étoile filante. Je ferai un vœu pour toi.', chef: false },

    // --- Zone 4 : l'Île de la Grande Horloge ---
    { id: 'kadra', nom: 'Kadra', g: 'f', role: "horlogère de l'île", zone: 4, x: 15, y: 12, themes: ['horaires', 'bricolage'],
      apparence: { espece: 'champi', couleur: '#d98a54', accessoire: 'lunettes' },
      bonjour: 'Bonjour ! Je suis Kadra, l’horlogère. Chaque matin, je remonte les cent horloges de l’île. Mais certaines avancent et d’autres retardent !',
      merci: 'Merci ! Écoute bien : toutes les horloges font tic-tac en même temps. Quelle jolie musique !', chef: false },
    { id: 'timbo', nom: 'Timbo', g: 'm', role: 'facteur de la planète', zone: 4, x: 23, y: 15, themes: ['voyage', 'espace'],
      apparence: { espece: 'plume', couleur: '#e07a6a', accessoire: 'casquette' },
      bonjour: 'Ouf, une visite ! Je suis Timbo, le facteur. Avec le pont cassé, je suis resté coincé sur l’île avec mon sac de lettres. Tu m’aides à préparer ma tournée ?',
      merci: 'Merci ! Je vais livrer toutes mes lettres à l’heure. Il y en a même une pour toi : un dessin de Wagou !', chef: false },
    { id: 'orlo', nom: 'Orlo', g: 'm', role: 'Grand Horloger, chef de la planète', zone: 4, x: 19, y: 13, themes: ['horaires', 'espace', 'voyage'],
      apparence: { espece: 'antenne', couleur: '#7f68cf', accessoire: 'couronne' },
      bonjour: "Bienvenue au cœur de l'horloge ! Je suis Orlo, le Grand Horloger de la planète. Je garde une pièce de fusée très précieuse. Résous mes problèmes, et elle sera à toi !",
      merci: "Tic, tac, bravo ! Tu as aidé toute ma planète. Voici la pièce qui manquait à la fusée d'Alvin. Elle vous emmènera jusqu'à la Station Grand Défi, la dernière étape de votre voyage !", chef: true },
  ],

  coffres: [
    { id: 'c1', x: 1, y: 27, zone: 1, souvenir: { id: 'tt-sifflet', nom: 'Sifflet de train qui fait tchou-tchou' } },  // sud-ouest, derrière la mare gelée
    { id: 'c2', x: 1, y: 1, zone: 2, souvenir: { id: 'tt-bobine', nom: 'Bobine de fil arc-en-ciel' } },               // tout au nord-ouest, entre les sapins
    { id: 'c3', x: 38, y: 16, zone: 3, souvenir: { id: 'tt-patin', nom: 'Patin à glace doré' } },                      // caché derrière le bosquet de cristaux
    { id: 'c4', x: 19, y: 9, zone: 4, souvenir: { id: 'tt-cle', nom: "Clé d'or de la Grande Horloge" } },            // derrière la Grande Horloge
  ],

  panneaux: [
    { id: 'p1', x: 17, y: 20, zone: 1, texte: 'Bienvenue sur la Planète Tic-Tac ! Ici, les horloges ne dorment jamais. Attention, la glace fait glisser les pattes !' },
    { id: 'p2', x: 6, y: 20, zone: 1, texte: 'Conseil du chef de gare : lis bien la question ! Cherches-tu une heure ou une durée ?' },
    { id: 'p3', x: 7, y: 11, zone: 2, texte: 'Village des Ateliers. Astuce : 1 heure, c’est 60 minutes. Une demi-heure, c’est 30 minutes.' },
    { id: 'p4', x: 33, y: 6, zone: 3, texte: 'Stade du Lac Gelé. Record du tour de piste : 2 minutes. Record de la sieste : 3 heures !' },
    { id: 'p5', x: 29, y: 12, zone: 3, texte: "Pour trouver une durée, compte d'abord les heures entières, puis les minutes qui restent." },
    { id: 'p6', x: 24, y: 12, zone: 4, texte: "Île de la Grande Horloge. Dernier conseil : relis ta réponse. Un train peut-il arriver avant d'être parti ?" },
  ],
});
