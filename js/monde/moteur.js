'use strict';
/*
 * Moteur du monde de Mission Galaxie : la planète vue de dessus, dessinée sur un canvas.
 *  - Sol mis en cache par blocs de cases, rendus à l'échelle exacte de l'écran (net sur écran haute densité).
 *  - Objets hauts (arbres, maisons…), habitants, coffres, fusée et Alvin triés en profondeur (par le bas de leur case).
 *  - Toucher → chemin A* en 4 directions → Alvin marche (~4 cases/s) ; toucher un habitant → Alvin va à côté puis surArrivee().
 *  - Caméra douce bornée à la carte, zones qui s'ouvrent avec une petite animation, textes flottants, marqueur de cible.
 * Le dessin lui-même est fait par Art (js/art/art.js) : ce fichier place, trie, anime et gère le toucher.
 *
 *   const jeu = Moteur.creer(canvas, monde, { etat, surTouche(entite), surArrivee(entite), surDeplacement(x, y) });
 *   jeu.demarrer(); jeu.arreter(); jeu.redimensionner(); jeu.bloquer(bool); jeu.ouvrirZone(id, anime);
 *   jeu.majEntite(id, patch); jeu.texteFlottant(x, y, texte, couleur); jeu.allerVers(x, y); jeu.joueur; jeu.camera
 *
 * Toucher une porte fermée (pont cassé, barrière) : Alvin va devant puis surArrivee({ type: 'porte', zone, nom, message, … }).
 */
const Moteur = (() => {
  const MO = typeof Mondes !== 'undefined' ? Mondes : null;
  const T = (MO && MO.TUILE) || 64;                                         // taille d'une case (px du monde)
  const MARCHABLE = (MO && MO.MARCHABLE) || new Set(['.', ',', ':', 'f', '=']);
  const OUVERTURE = (MO && MO.OUVERTURE) || { B: '=', P: ':' };
  const OBJETS = new Set(['T', 'R', 'C', 'H', 'X', 'M', 'P']);             // objets hauts, triés en profondeur

  const BLOC = 5;                 // côté d'un bloc de sol en cache (cases)
  const VITESSE = 4;              // cases par seconde
  const DPR_MAX = 2;              // netteté plafonnée (mémoire et vitesse sur tablette)
  const MEMOIRE_SOL = 64e6;       // octets visés pour le cache du sol
  const CASES_PAYSAGE = 14;       // cases visibles en largeur (paysage)
  const CASES_PORTRAIT = 9.5;     // cases visibles en largeur (portrait)
  const CASES_HAUTEUR_MIN = 7.5;  // au moins autant de cases en hauteur (téléphone couché)
  const SEUIL_GLISSER = 14;       // px : au-delà, l'appui est un glisser, pas un tap
  const DUREE_TAP = 1500;         // ms : un appui plus long n'est pas un tap
  const DUREE_TEXTE = 1.8;        // s
  const DUREE_PORTE = 0.9;        // s
  const DUREE_FOCUS = 2.2;        // s : la caméra montre le passage qui s'ouvre
  const IMAGES_BLOQUE = 1 / 20;   // s : rendu ralenti pendant un dialogue (sauf animation en cours)
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const HAUTEUR_ENTITE = { pnj: 1.6, coffre: 1.1, panneau: 1.4, fusee: 2.6 };   // zone touchable (cases, vers le haut)

  const borne = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lisser = (k, dt) => 1 - Math.exp(-k * dt);
  const directionVers = (dx, dy) => (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'droite' : 'gauche') : dy > 0 ? 'bas' : 'haut');
  // Graine déterministe par case (variété des dessins sans répétition mécanique)
  const graineCase = (x, y) => {
    let h = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  };
  // Sol dessiné sous un objet haut (la barrière de zone est posée sur un chemin)
  const solSous = c => (c === 'P' ? ':' : OBJETS.has(c) ? '.' : c);

  // Dessin de secours si Art est absent ou incomplet (le jeu reste jouable)
  const REPLI = {
    PALETTE: { fond: '#23263a', sol: '#d8dfb4', sol2: '#cfd8a8', chemin: '#efe2c0', eau: '#7cc3e0', falaise: '#a99a86', vegetal: '#6a9f5b', accent: '#ef7b5a', ombre: 'rgba(40,30,50,0.18)' },
    dessinerSol(ctx, c, x, y, T_, v, pal) {
      const coul = { '~': pal.eau, B: pal.eau, '#': pal.falaise, ':': pal.chemin, '=': '#b78b5e', ',': pal.sol2, f: pal.sol2 };
      ctx.fillStyle = coul[c] || pal.sol;
      ctx.fillRect(x, y, T_, T_);
    },
    dessinerObjet(ctx, c, cx, by, T_, pal) {
      ctx.fillStyle = c === 'T' || c === 'M' ? pal.vegetal : c === 'P' ? pal.accent : pal.falaise;
      ctx.beginPath(); ctx.arc(cx, by - T_ * 0.45, T_ * 0.38, 0, Math.PI * 2); ctx.fill();
    },
    dessinerEntite(ctx, ent, cx, by, T_, pal) {
      ctx.fillStyle = (ent.apparence && ent.apparence.couleur) || (ent.type === 'fusee' ? '#eeeeee' : pal.accent);
      ctx.beginPath(); ctx.arc(cx, by - T_ * 0.4, T_ * 0.32, 0, Math.PI * 2); ctx.fill();
    },
    dessinerAlvin(ctx, cx, by, T_) {
      ctx.fillStyle = '#9aa4af';
      ctx.beginPath(); ctx.arc(cx, by - T_ * 0.42, T_ * 0.3, 0, Math.PI * 2); ctx.fill();
    },
    dessinerCible(ctx, cx, cy, T_, t, pal) {
      ctx.strokeStyle = pal.accent; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(cx, cy + T_ * 0.2, T_ * 0.28, T_ * 0.14, 0, 0, Math.PI * 2); ctx.stroke();
    },
  };

  // File de priorité minimale (tas binaire) pour A*
  function creerTas() {
    const cles = [], vals = [];
    return {
      vide: () => vals.length === 0,
      pousser(cle, val) {
        let i = vals.length;
        cles.push(cle); vals.push(val);
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (cles[p] <= cle) break;
          cles[i] = cles[p]; vals[i] = vals[p]; i = p;
        }
        cles[i] = cle; vals[i] = val;
      },
      extraire() {
        const v = vals[0];
        const dk = cles.pop(), dv = vals.pop();
        const n = vals.length;
        if (n) {
          let i = 0;
          for (;;) {
            let f = 2 * i + 1;
            if (f >= n) break;
            if (f + 1 < n && cles[f + 1] < cles[f]) f++;
            if (cles[f] >= dk) break;
            cles[i] = cles[f]; vals[i] = vals[f]; i = f;
          }
          cles[i] = dk; vals[i] = dv;
        }
        return v;
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Création d'une partie sur une planète
  // ---------------------------------------------------------------------------
  function creer(canvas, monde, opts = {}) {
    const H = monde.carte.length, W = monde.carte[0].length, N = W * H;
    const grille = monde.carte.map(l => l.split(''));          // copie : la carte du monde n'est jamais modifiée
    const etat = opts.etat || {};
    const ctx = canvas.getContext('2d', { alpha: false });

    const A = typeof Art !== 'undefined' ? Art : {};
    if (typeof Art === 'undefined') console.warn('[Moteur] Art absent : dessin de secours.');
    const art = {};
    for (const k of ['dessinerSol', 'dessinerObjet', 'dessinerEntite', 'dessinerAlvin', 'dessinerCible']) {
      art[k] = typeof A[k] === 'function' ? A[k].bind(A) : REPLI[k];
    }
    const pal = (() => {
      const P = A.PALETTES || {};
      return Object.assign({}, REPLI.PALETTE, P[monde.id] || P[monde.notion] || P[Object.keys(P)[0]] || {});
    })();

    const dedans = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
    const caseEn = (x, y) => (dedans(x, y) ? grille[y][x] : null);

    // --- Entités : fusée, habitants, coffres, panneaux (une par case, elles bloquent le passage)
    const entites = [];
    const occupe = new Int16Array(N).fill(-1);
    const infos = new Map();                                   // entité → { phase, rebond }
    const marques = etat.marques || {};
    const coffresOuverts = etat.coffresOuverts || [];
    function ajouterEntite(ent) {
      if (!dedans(ent.x, ent.y)) return;
      entites.push(ent);
      infos.set(ent, { phase: (graineCase(ent.x, ent.y) % 628) / 100, rebond: -10 });
    }
    function majOccupation() {
      occupe.fill(-1);
      entites.forEach((e, i) => { if (dedans(e.x, e.y)) occupe[e.y * W + e.x] = i; });
    }
    if (monde.fusee) ajouterEntite({ type: 'fusee', id: 'fusee', x: monde.fusee.x, y: monde.fusee.y, marque: null });
    for (const p of monde.pnj || []) {
      ajouterEntite({ type: 'pnj', id: p.id, nom: p.nom, x: p.x, y: p.y, zone: p.zone, chef: !!p.chef,
        apparence: p.apparence, marque: marques[p.id] || null });
    }
    for (const c of monde.coffres || []) {
      ajouterEntite({ type: 'coffre', id: c.id, x: c.x, y: c.y, zone: c.zone, ouvert: coffresOuverts.includes(c.id), marque: null });
    }
    for (const p of monde.panneaux || []) ajouterEntite({ type: 'panneau', id: p.id, x: p.x, y: p.y, zone: p.zone, marque: null });
    majOccupation();
    const entiteEn = (x, y) => (dedans(x, y) && occupe[y * W + x] >= 0 ? entites[occupe[y * W + x]] : null);
    const passable = (x, y) => dedans(x, y) && MARCHABLE.has(grille[y][x]) && occupe[y * W + x] < 0;

    // --- Portes des zones déjà ouvertes
    const portesOuvertes = [];
    const zoneDePorte = (x, y) => (monde.zones || []).find(z => (z.portes || []).some(([px, py]) => px === x && py === y));
    function changerPortes(z) {
      const changees = [];
      for (const [x, y] of z.portes || []) {
        const c = caseEn(x, y);
        if (!OUVERTURE[c]) continue;
        grille[y][x] = OUVERTURE[c];
        changees.push({ x, y, ancien: c });
      }
      return changees;
    }
    for (const id of etat.portesOuvertes || []) {
      const z = (monde.zones || []).find(q => q.id === id);
      if (z) { changerPortes(z); portesOuvertes.push(id); }
    }

    // --- Alvin
    const joueur = { x: 0, y: 0, direction: 'bas' };
    (() => {
      const essais = [etat.pos, monde.depart].filter(Boolean);
      let p = essais.find(q => passable(q.x, q.y));
      if (!p) {                                               // repli : la case libre la plus proche du départ
        const d = monde.depart || { x: W >> 1, y: H >> 1 };
        let best = Infinity;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const s = (x - d.x) ** 2 + (y - d.y) ** 2;
          if (passable(x, y) && s < best) { best = s; p = { x, y }; }
        }
      }
      joueur.x = p.x; joueur.y = p.y;
    })();

    // --- État de la partie
    const camera = { x: joueur.x + 0.5, y: joueur.y + 0.5, zoom: 1 };
    let chemin = [];              // cases restantes à parcourir (la prochaine en premier)
    let interaction = null;       // entité à rejoindre (surArrivee à l'arrivée)
    let cible = null;             // { x, y, t0 } : marqueur de destination
    let phase = 0;                // avancement de la marche (cases parcourues), 0 = immobile
    let tempsMarche = 0;
    let bloque = false;
    let focus = null;             // { x, y, fin } : la caméra montre un endroit
    let temps = 0;                // horloge du jeu (s), arrêtée quand l'onglet est caché
    const textes = [];
    const particules = [];
    const ouvertures = [];        // portes en train de s'ouvrir { x, y, ancien, t0 }

    // --- Affichage
    let largeur = 0, hauteur = 0, dpr = 1, echelle = 1;      // px CSS, densité, px écran par px du monde
    let ox = 0, oy = 0;                                       // décalage écran (px écran) de l'origine du monde
    const blocs = new Map();
    let maxBlocs = 24;
    const nbBx = Math.ceil(W / BLOC), nbBy = Math.ceil(H / BLOC);
    let numImage = 0;

    // --- Boucle, écouteurs, statistiques
    let actif = false, raf = 0, derniere = null, enPause = false, erreur = null;
    let minuteurOrientation = 0, observateur = null, redimAFaire = false;
    const ecouteurs = [];
    const stats = { images: 0, total: 0, max: 0, blocsRendus: 0 };

    function appeler(fn, ...args) {
      if (typeof fn !== 'function') return;
      try { fn(...args); } catch (e) { console.error('[Moteur] rappel', e); }
    }

    // -------------------------------------------------------------------------
    // Chemins
    // -------------------------------------------------------------------------
    // A* en 4 directions vers l'une des cases « buts ». Coût 10 par pas + 1 par virage (chemins moins zigzagants).
    // Renvoie la liste des cases (départ exclu, but inclus) ou null.
    function aEtoile(dep, buts) {
      if (!buts.length) return null;
      const di = dep.y * W + dep.x;
      const estBut = new Uint8Array(N);
      for (const b of buts) if (dedans(b.x, b.y)) estBut[b.y * W + b.x] = 1;
      if (estBut[di]) return [];
      const h = i => {
        const x = i % W, y = (i / W) | 0;
        let m = Infinity;
        for (const b of buts) m = Math.min(m, Math.abs(b.x - x) + Math.abs(b.y - y));
        return m * 10;
      };
      const g = new Int32Array(N * 5).fill(0x3fffffff);
      const parent = new Int32Array(N * 5).fill(-1);
      const ferme = new Uint8Array(N * 5);
      const tas = creerTas();
      const s0 = di * 5 + 4;                                  // 4 = pas encore de direction
      g[s0] = 0;
      tas.pousser(h(di), s0);
      while (!tas.vide()) {
        const s = tas.extraire();
        if (ferme[s]) continue;
        ferme[s] = 1;
        const i = (s / 5) | 0, d = s % 5;
        if (estBut[i]) {
          const liste = [];
          for (let k = s; parent[k] !== -1; k = parent[k]) {
            const j = (k / 5) | 0;
            liste.push({ x: j % W, y: (j / W) | 0 });
          }
          return liste.reverse();
        }
        const x = i % W, y = (i / W) | 0;
        for (let k = 0; k < 4; k++) {
          const nx = x + DIRS[k][0], ny = y + DIRS[k][1];
          if (!passable(nx, ny)) continue;
          const ni = ny * W + nx, ns = ni * 5 + k;
          const ng = g[s] + 10 + (d !== 4 && d !== k ? 1 : 0);
          if (ng < g[ns]) { g[ns] = ng; parent[ns] = s; tas.pousser(ng + h(ni), ns); }
        }
      }
      return null;
    }

    // Distances (en pas) depuis une case vers toutes les cases accessibles (-1 = inaccessible)
    function distances(dep) {
      const dist = new Int32Array(N).fill(-1);
      const file = new Int32Array(N);
      let deb = 0, fin = 0;
      dist[dep.y * W + dep.x] = 0;
      file[fin++] = dep.y * W + dep.x;
      while (deb < fin) {
        const i = file[deb++], x = i % W, y = (i / W) | 0;
        for (const [dx, dy] of DIRS) {
          const nx = x + dx, ny = y + dy, ni = ny * W + nx;
          if (passable(nx, ny) && dist[ni] < 0) { dist[ni] = dist[i] + 1; file[fin++] = ni; }
        }
      }
      return dist;
    }

    // Case accessible la plus proche d'un point (à égalité : la plus proche à pied)
    function plusProcheAccessible(dep, tx, ty) {
      const dist = distances(dep);
      let mieux = dep, score = Infinity;
      for (let i = 0; i < N; i++) {
        if (dist[i] < 0) continue;
        const x = i % W, y = (i / W) | 0;
        const s = ((x - tx) ** 2 + (y - ty) ** 2) * 1000 + dist[i];
        if (s < score) { score = s; mieux = { x, y }; }
      }
      return mieux;
    }

    const caseJoueur = () => ({ x: Math.round(joueur.x), y: Math.round(joueur.y) });
    // Pendant un pas, on repart de la case vers laquelle Alvin se dirige
    const caseDeDepart = () => (chemin.length ? { x: chemin[0].x, y: chemin[0].y } : caseJoueur());
    const casesDe = ent => ent.cases || [{ x: ent.x, y: ent.y }];
    const estAdjacent = (c, ent) => casesDe(ent).some(q => Math.abs(q.x - c.x) + Math.abs(q.y - c.y) === 1);

    function tournerVers(ent) {
      const c = caseJoueur();
      const q = casesDe(ent).find(k => Math.abs(k.x - c.x) + Math.abs(k.y - c.y) === 1) || casesDe(ent)[0];
      if (q.x !== c.x || q.y !== c.y) joueur.direction = directionVers(q.x - c.x, q.y - c.y);
    }

    function suivre(liste, ent, but) {
      if (!liste) return null;
      if (chemin.length) {
        const B = chemin[0];
        const A = { x: B.x - Math.sign(B.x - joueur.x), y: B.y - Math.sign(B.y - joueur.y) };
        // demi-tour : Alvin est entre A et B, il retourne directement vers A
        chemin = liste.length && liste[0].x === A.x && liste[0].y === A.y ? liste : [B, ...liste];
      } else {
        chemin = liste;
      }
      interaction = ent || null;
      cible = chemin.length ? { x: but.x, y: but.y, t0: temps } : null;
      if (!chemin.length) finDeMarche();
      return { x: but.x, y: but.y, pas: chemin.length, entite: ent || null };
    }

    function allerVersEntite(ent, dep) {
      if (!chemin.length && estAdjacent(dep, ent)) {          // déjà à côté : interaction immédiate
        tournerVers(ent);
        cible = null;
        interaction = null;
        appeler(opts.surArrivee, ent);
        return { x: dep.x, y: dep.y, pas: 0, entite: ent };
      }
      const voisins = [];
      for (const c of casesDe(ent)) {
        for (const [dx, dy] of DIRS) {
          const v = { x: c.x + dx, y: c.y + dy };
          if (passable(v.x, v.y) || (v.x === dep.x && v.y === dep.y)) voisins.push(v);
        }
      }
      const liste = aEtoile(dep, voisins);
      if (liste) return suivre(liste, ent, liste.length ? liste[liste.length - 1] : dep);
      const but = plusProcheAccessible(dep, ent.x, ent.y);    // inaccessible (zone fermée) : on s'approche
      return suivre(aEtoile(dep, [but]), null, but);
    }

    function porteFermee(x, y) {
      if (!OUVERTURE[caseEn(x, y)]) return null;
      const z = zoneDePorte(x, y);
      if (!z) return null;
      const cases = (z.portes || []).filter(([px, py]) => OUVERTURE[caseEn(px, py)]).map(([px, py]) => ({ x: px, y: py }));
      return { type: 'porte', id: 'zone-' + z.id, zone: z.id, nom: z.nom, message: z.message || '', x, y, cases };
    }

    // Aller vers une case (ou l'entité qui s'y trouve)
    function aller(x, y, ent = null) {
      if (bloque) return null;
      focus = null;
      x = borne(Math.round(x), 0, W - 1);
      y = borne(Math.round(y), 0, H - 1);
      const dep = caseDeDepart();
      ent = ent || entiteEn(x, y) || porteFermee(x, y);
      if (ent) return allerVersEntite(ent, dep);
      if (passable(x, y)) {
        const liste = aEtoile(dep, [{ x, y }]);
        if (liste) return suivre(liste, null, { x, y });
      }
      // case bloquée ou zone fermée : la case accessible la plus proche
      const but = plusProcheAccessible(dep, x, y);
      if (but.x === dep.x && but.y === dep.y && !chemin.length && (x !== dep.x || y !== dep.y)) {
        joueur.direction = directionVers(x - dep.x, y - dep.y);
      }
      return suivre(aEtoile(dep, [but]), null, but);
    }

    // -------------------------------------------------------------------------
    // Marche
    // -------------------------------------------------------------------------
    function marcher(dt) {
      if (!chemin.length) return;
      tempsMarche += dt;
      const c0 = chemin[0];
      const restant = Math.abs(c0.x - joueur.x) + Math.abs(c0.y - joueur.y) + chemin.length - 1;
      // départ et arrivée en douceur
      const v = VITESSE * Math.min(1, 0.45 + tempsMarche / 0.18) * Math.min(1, 0.5 + restant / 0.7);
      let pas = v * dt;
      while (pas > 0 && chemin.length) {
        const c = chemin[0];
        const dx = c.x - joueur.x, dy = c.y - joueur.y, d = Math.abs(dx) + Math.abs(dy);
        if (d > 1e-9) joueur.direction = directionVers(dx, dy);
        if (d <= pas) {
          joueur.x = c.x; joueur.y = c.y;
          pas -= d; phase += d;
          chemin.shift();
          appeler(opts.surDeplacement, c.x, c.y);
        } else {
          joueur.x += (dx / d) * pas; joueur.y += (dy / d) * pas;
          phase += pas; pas = 0;
        }
      }
      if (!chemin.length) finDeMarche();
    }

    function finDeMarche() {
      phase = 0;
      tempsMarche = 0;
      cible = null;
      const ent = interaction;
      interaction = null;
      if (ent && estAdjacent(caseJoueur(), ent)) {
        tournerVers(ent);
        appeler(opts.surArrivee, ent);
      }
    }

    // -------------------------------------------------------------------------
    // Mise à jour
    // -------------------------------------------------------------------------
    function cibleCamera() {
      if (focus && temps < focus.fin) return [focus.x, focus.y, 2.6];
      focus = null;
      return [joueur.x + 0.5, joueur.y + 0.35, 4.5];
    }
    function bornerCamera(cx, cy) {
      const vw = largeur / (T * camera.zoom), vh = hauteur / (T * camera.zoom);
      return [vw >= W ? W / 2 : borne(cx, vw / 2, W - vw / 2), vh >= H ? H / 2 : borne(cy, vh / 2, H - vh / 2)];
    }
    function placerCamera() {
      const [tx, ty] = cibleCamera();
      [camera.x, camera.y] = bornerCamera(tx, ty);
    }

    function mettreAJour(dt) {
      temps += dt;
      marcher(dt);
      const [cx, cy, k] = cibleCamera();
      const [tx, ty] = bornerCamera(cx, cy);
      const f = lisser(k, dt);
      camera.x += (tx - camera.x) * f;
      camera.y += (ty - camera.y) * f;
      for (let i = textes.length - 1; i >= 0; i--) if (temps - textes[i].t0 > DUREE_TEXTE) textes.splice(i, 1);
      for (let i = ouvertures.length - 1; i >= 0; i--) if (temps - ouvertures[i].t0 > DUREE_PORTE) ouvertures.splice(i, 1);
      for (let i = particules.length - 1; i >= 0; i--) {
        const p = particules[i];
        p.vie -= dt;
        if (p.vie <= 0) { particules.splice(i, 1); continue; }
        p.vy += 5 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
    }

    function animationEnCours() {
      if (chemin.length || textes.length || ouvertures.length || particules.length || focus) return true;
      const [cx, cy] = cibleCamera();
      const [tx, ty] = bornerCamera(cx, cy);
      return Math.abs(tx - camera.x) + Math.abs(ty - camera.y) > 0.01;
    }

    // -------------------------------------------------------------------------
    // Rendu du sol par blocs
    // -------------------------------------------------------------------------
    function voisinSol(x, y) {
      return solSous(grille[borne(y, 0, H - 1)][borne(x, 0, W - 1)]);
    }
    function dessinerCaseSol(c2, x, y, car) {
      c2.save();
      art.dessinerSol(c2, car || solSous(grille[y][x]), x * T, y * T, T, (dx, dy) => voisinSol(x + dx, y + dy), pal, graineCase(x, y));
      c2.restore();
    }

    function rendreBloc(bx, by) {
      const cle = by * nbBx + bx;
      const cx0 = bx * BLOC, cy0 = by * BLOC, cx1 = Math.min(W, cx0 + BLOC), cy1 = Math.min(H, cy0 + BLOC);
      const px0 = Math.floor(cx0 * T * echelle), py0 = Math.floor(cy0 * T * echelle);
      const lw = Math.floor(cx1 * T * echelle) - px0, lh = Math.floor(cy1 * T * echelle) - py0;
      let b = blocs.get(cle);
      const cv = b ? b.canvas : document.createElement('canvas');
      cv.width = lw; cv.height = lh;
      const c2 = cv.getContext('2d', { alpha: false });
      c2.setTransform(1, 0, 0, 1, 0, 0);
      c2.fillStyle = pal.sol;
      c2.fillRect(0, 0, lw, lh);
      c2.setTransform(echelle, 0, 0, echelle, -px0, -py0);
      // Une case de marge autour du bloc, dans l'ordre de lecture : ce qui déborde d'une case voisine est bien là
      for (let y = Math.max(0, cy0 - 1); y <= Math.min(H - 1, cy1); y++) {
        for (let x = Math.max(0, cx0 - 1); x <= Math.min(W - 1, cx1); x++) dessinerCaseSol(c2, x, y);
      }
      b = { canvas: cv, px0, py0, vu: numImage, sale: false };
      blocs.set(cle, b);
      stats.blocsRendus++;
      return b;
    }

    function salirAutour(x, y) {
      for (let by = Math.max(0, Math.floor((y - 2) / BLOC)); by <= Math.min(nbBy - 1, Math.floor((y + 2) / BLOC)); by++) {
        for (let bx = Math.max(0, Math.floor((x - 2) / BLOC)); bx <= Math.min(nbBx - 1, Math.floor((x + 2) / BLOC)); bx++) {
          const b = blocs.get(by * nbBx + bx);
          if (b) b.sale = true;
        }
      }
    }

    function viderBlocs() {
      for (const b of blocs.values()) { b.canvas.width = 0; b.canvas.height = 0; }
      blocs.clear();
    }

    function evincerBlocs() {
      if (blocs.size <= maxBlocs) return;
      const vieux = [...blocs.entries()].filter(([, b]) => b.vu < numImage).sort((a, b) => a[1].vu - b[1].vu);
      for (const [cle, b] of vieux) {
        if (blocs.size <= maxBlocs) break;
        b.canvas.width = 0; b.canvas.height = 0;
        blocs.delete(cle);
      }
    }

    // -------------------------------------------------------------------------
    // Rendu d'une image
    // -------------------------------------------------------------------------
    const reserve = [];
    const items = [];
    let nbItems = 0;
    function item(k, o, genre, a, b, c) {
      const it = reserve[nbItems] || (reserve[nbItems] = {});
      it.k = k; it.o = o; it.genre = genre; it.a = a; it.b = b; it.c = c;
      items[nbItems++] = it;
    }
    const parProfondeur = (p, q) => p.k - q.k || p.o - q.o;

    function dessiner() {
      if (!largeur || !actif) return;
      numImage++;
      const e = echelle, Wd = canvas.width, Hd = canvas.height;
      ox = Math.round(camera.x * T * e - Wd / 2);
      oy = Math.round(camera.y * T * e - Hd / 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      if (ox < 0 || oy < 0 || ox + Wd > Math.floor(W * T * e) || oy + Hd > Math.floor(H * T * e)) {
        ctx.fillStyle = pal.fond;
        ctx.fillRect(0, 0, Wd, Hd);
      }

      // 1. Sol (blocs en cache)
      const tb = BLOC * T * e;
      const bx0 = borne(Math.floor((ox - 1) / tb), 0, nbBx - 1), bx1 = borne(Math.floor((ox + Wd + 1) / tb), 0, nbBx - 1);
      const by0 = borne(Math.floor((oy - 1) / tb), 0, nbBy - 1), by1 = borne(Math.floor((oy + Hd + 1) / tb), 0, nbBy - 1);
      let rendus = 0;
      for (let by = by0; by <= by1; by++) {
        for (let bx = bx0; bx <= bx1; bx++) {
          let b = blocs.get(by * nbBx + bx);
          if (!b || b.sale) { b = rendreBloc(bx, by); rendus++; }
          b.vu = numImage;
          ctx.drawImage(b.canvas, b.px0 - ox, b.py0 - oy);
        }
      }
      // Prépare un bloc voisin par image quand rien d'autre n'a été rendu (pas d'à-coup en marchant)
      if (!rendus && blocs.size < maxBlocs) {
        prerendu:
        for (let by = Math.max(0, by0 - 1); by <= Math.min(nbBy - 1, by1 + 1); by++) {
          for (let bx = Math.max(0, bx0 - 1); bx <= Math.min(nbBx - 1, bx1 + 1); bx++) {
            const b = blocs.get(by * nbBx + bx);
            if (!b || b.sale) { rendreBloc(bx, by).vu = numImage; break prerendu; }
          }
        }
      }
      evincerBlocs();

      // 2. Le monde (coordonnées en px du monde)
      ctx.setTransform(e, 0, 0, e, -ox, -oy);
      for (const o of ouvertures) {                            // l'ancien pont cassé s'efface
        if (OBJETS.has(o.ancien)) continue;
        const p = (temps - o.t0) / DUREE_PORTE;
        ctx.save();
        ctx.globalAlpha = borne(1 - p * p, 0, 1);
        dessinerCaseSol(ctx, o.x, o.y, o.ancien);
        ctx.restore();
      }
      if (cible) {
        ctx.save();
        art.dessinerCible(ctx, (cible.x + 0.5) * T, (cible.y + 0.5) * T, T, temps - cible.t0, pal);
        ctx.restore();
      }

      // 3. Objets hauts, entités et Alvin triés par profondeur
      const cT = T * e;
      const cx0 = Math.floor(ox / cT) - 1, cx1 = Math.floor((ox + Wd) / cT) + 1;
      const cy0 = Math.floor(oy / cT) - 1, cy1 = Math.floor((oy + Hd) / cT) + 2;
      nbItems = 0;
      for (let y = Math.max(0, cy0); y <= Math.min(H - 1, cy1); y++) {
        const ligne = grille[y];
        for (let x = Math.max(0, cx0); x <= Math.min(W - 1, cx1); x++) {
          if (OBJETS.has(ligne[x])) item((y + 1) * T, x, 0, x, y, ligne[x]);
        }
      }
      for (const o of ouvertures) if (OBJETS.has(o.ancien)) item((o.y + 1) * T, o.x, 3, o, 0, 0);
      for (const ent of entites) {
        if (ent.x >= cx0 - 1 && ent.x <= cx1 + 1 && ent.y >= cy0 && ent.y <= cy1 + 2) item((ent.y + 1) * T + 0.25, ent.x, 1, ent, 0, 0);
      }
      item((joueur.y + 1) * T + 0.5, joueur.x, 2, 0, 0, 0);
      items.length = nbItems;
      items.sort(parProfondeur);
      for (let i = 0; i < nbItems; i++) dessinerItem(items[i]);

      // 4. Étincelles et textes flottants
      for (const p of particules) {
        ctx.globalAlpha = borne(p.vie / 0.5, 0, 1);
        ctx.fillStyle = p.couleur;
        ctx.beginPath();
        ctx.arc(p.x * T, p.y * T, T * 0.07 * (0.5 + p.vie), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (const tx of textes) dessinerTexte(tx);
    }

    function dessinerItem(it) {
      ctx.save();
      if (it.genre === 0) {
        art.dessinerObjet(ctx, it.c, (it.a + 0.5) * T, (it.b + 1) * T, T, pal, temps, graineCase(it.a, it.b));
      } else if (it.genre === 1) {
        const ent = it.a, inf = infos.get(ent);
        const cx = (ent.x + 0.5) * T, by = (ent.y + 1) * T;
        let sx = 1, sy = 1;
        if (ent.type === 'pnj') {                              // respiration
          const s = Math.sin(temps * 2.4 + inf.phase);
          sx = 1 - 0.012 * s; sy = 1 + 0.024 * s;
        }
        const r = (temps - inf.rebond) / 0.45;                 // petit rebond quand l'entité change
        if (r >= 0 && r < 1) {
          const k = Math.sin(r * Math.PI) * (1 - r) * 0.3;
          sx *= 1 - k * 0.5; sy *= 1 + k;
        }
        if (sx !== 1 || sy !== 1) { ctx.translate(cx, by); ctx.scale(sx, sy); ctx.translate(-cx, -by); }
        art.dessinerEntite(ctx, ent, cx, by, T, pal, temps);
      } else if (it.genre === 2) {
        art.dessinerAlvin(ctx, (joueur.x + 0.5) * T, (joueur.y + 1) * T, T, joueur.direction, chemin.length ? Math.max(phase, 0.001) : 0, temps);
      } else {                                                  // barrière qui s'abaisse et s'efface
        const o = it.a, p = borne((temps - o.t0) / DUREE_PORTE, 0, 1);
        const cx = (o.x + 0.5) * T, by = (o.y + 1) * T;
        const saut = p < 0.25 ? Math.sin((p / 0.25) * Math.PI) * 0.08 : 0;
        ctx.globalAlpha = 1 - p * p;
        ctx.translate(cx, by);
        ctx.scale(1 + saut, Math.max(0.02, (1 - p) * (1 + saut)));
        ctx.translate(-cx, -by);
        art.dessinerObjet(ctx, o.ancien, cx, by, T, pal, temps, graineCase(o.x, o.y));
      }
      ctx.restore();
    }

    function dessinerTexte(tx) {
      const p = (temps - tx.t0) / DUREE_TEXTE;
      const monte = 1 - (1 - p) ** 3;
      const s = p < 0.12 ? 0.7 + 0.3 * Math.sin((p / 0.12) * Math.PI / 2) : 1;
      ctx.save();
      ctx.globalAlpha = p < 0.6 ? 1 : borne(1 - (p - 0.6) / 0.4, 0, 1);
      ctx.translate((tx.x + 0.5) * T, (tx.y + 0.5) * T - monte * T * 0.9);
      ctx.scale(s, s);
      ctx.font = `600 ${Math.round(T * 0.44)}px Fredoka, Andika, 'Trebuchet MS', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = T * 0.1;
      ctx.strokeStyle = '#fbf7ef';
      ctx.strokeText(tx.texte, 0, 0);
      ctx.fillStyle = tx.couleur;
      ctx.fillText(tx.texte, 0, 0);
      ctx.restore();
    }

    // -------------------------------------------------------------------------
    // Boucle d'animation
    // -------------------------------------------------------------------------
    function image(dt) {
      const debut = performance.now();
      try {
        if (redimAFaire) { redimAFaire = false; redimensionner(); }
        mettreAJour(dt);
        dessiner();
      } catch (e) {
        if (!erreur) { erreur = e; console.error('[Moteur]', e); }
      }
      const duree = performance.now() - debut;
      stats.images++; stats.total += duree; stats.max = Math.max(stats.max, duree);
    }

    function boucle(ms) {
      raf = requestAnimationFrame(boucle);
      const s = ms / 1000;
      if (derniere === null) derniere = s;
      const dt = s - derniere;
      if (bloque && dt < IMAGES_BLOQUE && !animationEnCours()) return;   // économie pendant un dialogue
      derniere = s;
      image(Math.min(dt, 0.1));
    }

    function lancerBoucle() {
      if (!actif || raf || document.hidden) return;
      derniere = null;
      raf = requestAnimationFrame(boucle);
    }

    // -------------------------------------------------------------------------
    // Toucher
    // -------------------------------------------------------------------------
    let appui = null;               // { id, x, y, t, glisse, multi }
    function surBas(e) {
      if (e.button > 0) return;
      if (appui && appui.id !== e.pointerId) { appui.multi = true; return; }   // deux doigts : pas un tap
      e.preventDefault();
      appui = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), glisse: false, multi: false };
      try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* événement simulé */ }
    }
    function surBouge(e) {
      if (appui && e.pointerId === appui.id && Math.hypot(e.clientX - appui.x, e.clientY - appui.y) > SEUIL_GLISSER) appui.glisse = true;
    }
    function surHaut(e) {
      if (!appui || e.pointerId !== appui.id) return;
      const a = appui;
      appui = null;
      if (a.glisse || a.multi || performance.now() - a.t > DUREE_TAP || bloque) return;
      const r = canvas.getBoundingClientRect();
      toucher(e.clientX - r.left, e.clientY - r.top);
    }
    function surAnnule(e) { if (appui && e.pointerId === appui.id) appui = null; }

    // Point écran (px CSS) → coordonnées en cases (flottantes)
    const versCases = (px, py) => [(px * dpr + ox) / (T * echelle), (py * dpr + oy) / (T * echelle)];
    // Centre d'une case → point écran (px CSS)
    const versEcran = (x, y) => [((x + 0.5) * T * echelle - ox) / dpr, ((y + 0.5) * T * echelle - oy) / dpr];

    // L'entité touchée : sa case, ou sa silhouette qui dépasse vers le haut (tête, fusée)
    function entiteSous(wx, wy) {
      const directe = entiteEn(Math.floor(wx), Math.floor(wy));
      if (directe) return directe;
      let mieux = null;
      for (const ent of entites) {
        const haut = HAUTEUR_ENTITE[ent.type] || 1.2, marge = ent.type === 'fusee' ? 0.3 : 0.08;
        if (wx >= ent.x - marge && wx <= ent.x + 1 + marge && wy >= ent.y + 1 - haut && wy <= ent.y + 1) {
          if (!mieux || ent.y > mieux.y) mieux = ent;
        }
      }
      return mieux;
    }

    function toucher(px, py) {
      if (bloque || !largeur) return null;
      const [wx, wy] = versCases(px, py);
      const ent = entiteSous(wx, wy);
      appeler(opts.surTouche, ent || null);
      if (bloque) return null;
      return aller(Math.floor(wx), Math.floor(wy), ent);
    }

    // -------------------------------------------------------------------------
    // Dimensions
    // -------------------------------------------------------------------------
    function redimensionner() {
      const r = canvas.getBoundingClientRect();
      const l = Math.round(r.width) || window.innerWidth, h = Math.round(r.height) || window.innerHeight;
      const d = Math.min(DPR_MAX, window.devicePixelRatio || 1);
      if (l === largeur && h === hauteur && d === dpr && canvas.width === Math.round(l * d)) return false;
      largeur = l; hauteur = h; dpr = d;
      canvas.width = Math.round(l * d);
      canvas.height = Math.round(h * d);
      const zoomVoulu = Math.min(l / ((l >= h ? CASES_PAYSAGE : CASES_PORTRAIT) * T), h / (CASES_HAUTEUR_MIN * T));
      // Une case = un nombre entier de pixels écran : les bords des cases tombent pile sur les pixels (aucune couture)
      const e = Math.max(8, Math.round(T * zoomVoulu * d)) / T;
      camera.zoom = e / d;
      if (e !== echelle) { echelle = e; viderBlocs(); }
      const octets = (BLOC * T * e) ** 2 * 4;
      const visibles = (Math.ceil(l / (T * camera.zoom) / BLOC) + 1) * (Math.ceil(h / (T * camera.zoom) / BLOC) + 1);
      maxBlocs = Math.max(visibles + 4, Math.floor(MEMOIRE_SOL / octets));
      [camera.x, camera.y] = bornerCamera(camera.x, camera.y);
      if (actif) dessiner();                                  // pas d'écran vide après un changement de taille
      return true;
    }

    function surVisibilite() {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        enPause = true;
        appui = null;
      } else {
        enPause = false;
        lancerBoucle();
      }
    }
    function surResize() { redimensionner(); }
    function surOrientation() {
      redimensionner();
      clearTimeout(minuteurOrientation);
      minuteurOrientation = setTimeout(redimensionner, 350);  // certaines tablettes donnent la taille en retard
    }
    const empecher = e => e.preventDefault();

    function ecouter(cibleEv, type, fn, o) {
      cibleEv.addEventListener(type, fn, o);
      ecouteurs.push([cibleEv, type, fn, o]);
    }

    // -------------------------------------------------------------------------
    // API
    // -------------------------------------------------------------------------
    function demarrer() {
      if (actif) return;
      actif = true;
      canvas.style.touchAction = 'none';
      ecouter(canvas, 'pointerdown', surBas, { passive: false });
      ecouter(canvas, 'pointermove', surBouge);
      ecouter(canvas, 'pointerup', surHaut);
      ecouter(canvas, 'pointercancel', surAnnule);
      ecouter(canvas, 'contextmenu', empecher);
      ecouter(window, 'resize', surResize);
      ecouter(window, 'orientationchange', surOrientation);
      ecouter(document, 'visibilitychange', surVisibilite);
      if (typeof ResizeObserver !== 'undefined') {
        observateur = new ResizeObserver(() => { redimAFaire = true; });
        observateur.observe(canvas);
      }
      largeur = 0;
      redimensionner();
      placerCamera();
      dessiner();
      enPause = !!document.hidden;
      lancerBoucle();
    }

    function arreter() {
      actif = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      for (const [c2, type, fn, o] of ecouteurs) c2.removeEventListener(type, fn, o);
      ecouteurs.length = 0;
      if (observateur) { observateur.disconnect(); observateur = null; }
      clearTimeout(minuteurOrientation);
      viderBlocs();
      chemin = []; interaction = null; cible = null; appui = null;
      textes.length = 0; particules.length = 0; ouvertures.length = 0;
    }

    function bloquer(b) {
      bloque = !!b;
      if (bloque) {
        appui = null;
        interaction = null;
        cible = null;
        if (chemin.length) chemin = [chemin[0]];              // Alvin finit son pas et s'arrête
      }
    }

    function ouvrirZone(zoneId, anime = true) {
      const z = (monde.zones || []).find(q => q.id === zoneId);
      if (!z) return 0;
      if (!portesOuvertes.includes(zoneId)) portesOuvertes.push(zoneId);
      const changees = changerPortes(z);
      for (const c of changees) {
        salirAutour(c.x, c.y);
        if (!anime) continue;
        ouvertures.push({ x: c.x, y: c.y, ancien: c.ancien, t0: temps });
        const couleurs = [pal.accent, '#fbf7ef', '#e9b949'];
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * Math.PI * 2 + (graineCase(c.x, i) % 100) / 100;
          particules.push({ x: c.x + 0.5, y: c.y + 0.5, vx: Math.cos(a) * 1.6, vy: Math.sin(a) * 1.2 - 2, vie: 0.7 + (i % 3) * 0.12, couleur: couleurs[i % 3] });
        }
      }
      if (anime && changees.length) {
        const mx = changees.reduce((s, c) => s + c.x, 0) / changees.length + 0.5;
        const my = changees.reduce((s, c) => s + c.y, 0) / changees.length + 0.5;
        focus = { x: mx, y: my, fin: temps + DUREE_FOCUS };
      }
      if (actif) dessiner();
      return changees.length;
    }

    function majEntite(id, patch) {
      const ent = entites.find(e => e.id === id);
      if (!ent) return false;
      const bouge = 'x' in patch || 'y' in patch;
      Object.assign(ent, patch);
      if (bouge) majOccupation();
      infos.get(ent).rebond = temps;
      return true;
    }

    function texteFlottant(x, y, texte, couleur = '#2d2a32') {
      textes.push({ x, y, texte: String(texte), couleur, t0: temps });
    }

    // Pour les tests et outils : avancer le temps sans requestAnimationFrame
    function simuler(secondes, pas = 1 / 60) {
      for (let s = 0; s < secondes - 1e-9; s += pas) mettreAJour(pas);
      dessiner();
    }

    const jeu = {
      demarrer, arreter, redimensionner, bloquer, ouvrirZone, majEntite, texteFlottant,
      allerVers: (x, y) => aller(x, y),
      joueur, camera, entites,
      // outils (tests, débogage)
      toucherEcran: toucher, versEcran, versCases, simuler, dessiner,
      caseEn, passable,
      cheminVers: (x, y) => aEtoile(caseDeDepart(), [{ x, y }]),
      distances: () => distances(caseDeDepart()),
      debug: () => ({
        actif, enPause, bloque, enMarche: chemin.length > 0,
        chemin: chemin.map(c => ({ x: c.x, y: c.y })), interaction: interaction && interaction.id, cible: cible && { x: cible.x, y: cible.y },
        portesOuvertes: portesOuvertes.slice(), focus: !!focus,
        largeur, hauteur, dpr, zoom: camera.zoom, echelle,
        casesVisibles: { l: largeur / (T * camera.zoom), h: hauteur / (T * camera.zoom) },
        blocs: blocs.size, maxBlocs, blocsRendus: stats.blocsRendus,
        textes: textes.length, ouvertures: ouvertures.length, particules: particules.length,
        ecouteurs: ecouteurs.length, boucle: !!raf, temps,
        images: stats.images, tempsMoyenMs: stats.images ? stats.total / stats.images : 0, tempsMaxMs: stats.max,
        erreur: erreur ? String(erreur && erreur.stack || erreur) : null,
      }),
    };
    return jeu;
  }

  return { creer, TUILE: T, BLOC, VITESSE };
})();
