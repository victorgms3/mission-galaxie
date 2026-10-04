'use strict';
/*
 * Art de Mission Galaxie : tout le dessin du monde vu de dessus, en style « livre illustré » plat.
 *  - aplats de couleurs, palette douce par planète (+ 1-2 accents), formes arrondies légèrement irrégulières ;
 *  - aucune image externe, aucun dégradé, aucun halo, aucune ombre floue, aucun contour noir ;
 *  - ombre portée = ellipse plate semi-transparente sous les objets hauts, les habitants et Alvin.
 * Un même « crayon » sert au canvas (le monde) et au SVG (portraits) : les habitants sont identiques partout.
 *
 *   Art.PALETTES[id]                                    palettes : plusmoins, paquets, marche, tictac, defi
 *   Art.dessinerSol(ctx, c, x, y, T, voisin, pal, graine)
 *   Art.dessinerObjet(ctx, c, cx, by, T, pal, t, graine)
 *   Art.dessinerEntite(ctx, ent, cx, by, T, pal, t)
 *   Art.dessinerAlvin(ctx, cx, by, T, direction, phase, t)
 *   Art.dessinerCible(ctx, cx, cy, T, t, pal)
 *   Art.portraitAlvin(humeur) / Art.portraitPNJ(apparence) / Art.vignettePlanete(id)  → '<svg …>'
 */
const Art = (() => {
  const TAU = Math.PI * 2;
  const K = 0.5523;                                   // arcs de cercle en courbes de Bézier

  // ---------------------------------------------------------------------------
  // Hasard déterministe (une graine par case) et couleurs
  // ---------------------------------------------------------------------------
  function hasard(graine) {
    let a = (graine >>> 0) || 1;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const entre = (r, a, b) => a + r() * (b - a);
  const hacher = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };

  const memo = new Map();
  const versRgb = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const versHex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const valide = c => (typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c) ? c : '#ef7b5a');
  function melange(a, b, k) {                          // a → b, k ∈ [0, 1]
    const cle = a + b + k;
    let v = memo.get(cle);
    if (!v) {
      const p = versRgb(valide(a)), q = versRgb(valide(b));
      v = versHex(p.map((x, i) => x + (q[i] - x) * k));
      memo.set(cle, v);
    }
    return v;
  }
  const fonce = (c, k = 0.24) => melange(c, '#3a2c4a', k);       // on fonce vers une encre violette, jamais vers le noir
  const clair = (c, k = 0.4) => melange(c, '#ffffff', k);
  const transparent = (c, a) => { const [r, g, b] = versRgb(valide(c)); return `rgba(${r},${g},${b},${a})`; };

  // ---------------------------------------------------------------------------
  // Palettes (tons doux et désaturés + 1-2 accents)
  // ---------------------------------------------------------------------------
  const COMMUN = { encre: '#2d2a32', blanc: '#fbf7ef', joue: '#f4a3b4', or: '#e9b949', orFonce: '#c7962a', corail: '#ef7b5a', sarcelle: '#2a9d8f' };
  const PALETTES = {
    plusmoins: { ...COMMUN, nom: 'désert et oasis', fond: '#3b3346',
      sol: '#efdcb6', sol2: '#e9d2a6', solPoint: '#d7bd8e', herbe: '#adb877',
      chemin: '#f8ecd3', cheminBord: '#e2cb9f', cheminPoint: '#e6d3ae',
      eau: '#62bdb9', eauClair: '#a6ded7', eauFonce: '#4aa3a2', berge: '#dcc193',
      falaise: '#e3ad7f', falaiseFace: '#c98b5f', falaiseFonce: '#ad714b',
      vegetal: '#86b26b', vegetalFonce: '#679552', vegetalClair: '#abcd88',
      tronc: '#bb8b5d', troncFonce: '#9a6c43', bois: '#c79766', boisFonce: '#a1724a',
      roche: '#dab792', rocheFonce: '#bd9570', rocheClair: '#ecd2b2',
      toit: '#df8262', toitFonce: '#c0644a', mur: '#f4e2c2', murFonce: '#dcc296',
      cristal: '#ef9f9a', cristalFonce: '#d77f7b', cristalClair: '#f8cdc8',
      fleur1: '#ef7b5a', fleur2: '#fbf7ef', coeurFleur: '#e9b949',
      accent: '#ef7b5a', accent2: '#e9b949', ombre: 'rgba(122,78,40,0.2)',
      arbre: 'palmier', maison: 'hutte', special: 'cactus', detail: 'touffes' },
    paquets: { ...COMMUN, nom: 'prairie rose bonbon', fond: '#3d2c47',
      sol: '#f5cdd6', sol2: '#f0c0cd', solPoint: '#e2a5b7', herbe: '#dc8ea8',
      chemin: '#fdf0de', cheminBord: '#eed0c2', cheminPoint: '#f2dccb',
      eau: '#86c2e6', eauClair: '#c3e3f4', eauFonce: '#6aa8d2', berge: '#e7b1c0',
      falaise: '#d9a7c2', falaiseFace: '#bd84a5', falaiseFonce: '#a06a8b',
      vegetal: '#8cc7a0', vegetalFonce: '#6aa883', vegetalClair: '#b5dfc1',
      tronc: '#bb8875', troncFonce: '#9b6a5b', bois: '#d6a07f', boisFonce: '#b47e60',
      roche: '#e6c6d2', rocheFonce: '#cba3b5', rocheClair: '#f3dee6',
      toit: '#8f7fc8', toitFonce: '#7060ab', mur: '#fdf3e8', murFonce: '#ecd6c8',
      cristal: '#a99be8', cristalFonce: '#8676d0', cristalClair: '#d3cbf6',
      fleur1: '#fbf7ef', fleur2: '#f6cf6a', coeurFleur: '#ef8a6a',
      accent: '#d9577f', accent2: '#f2b84b', ombre: 'rgba(140,60,96,0.18)',
      arbre: 'fruitier', maison: 'maison', special: 'cadeaux', detail: 'touffes' },
    marche: { ...COMMUN, nom: 'vallée verte et marché', fond: '#2c3342',
      sol: '#c3da98', sol2: '#b7d08b', solPoint: '#a2c077', herbe: '#8db262',
      chemin: '#f2e4c6', cheminBord: '#d9c497', cheminPoint: '#e3d2ad',
      eau: '#73bdd4', eauClair: '#ade0eb', eauFonce: '#579fbb', berge: '#a8c37f',
      falaise: '#acc982', falaiseFace: '#c2976c', falaiseFonce: '#9f7753',
      vegetal: '#6fa860', vegetalFonce: '#558c4b', vegetalClair: '#95c47b',
      tronc: '#a97a50', troncFonce: '#87603c', bois: '#cc9c69', boisFonce: '#a67b4d',
      roche: '#cdc6b2', rocheFonce: '#ada591', rocheClair: '#e3decd',
      toit: '#e0805f', toitFonce: '#c06246', mur: '#f7ebd4', murFonce: '#e2d0b0',
      cristal: '#9fd3e0', cristalFonce: '#78b4c6', cristalClair: '#d0ecf3',
      fleur1: '#f29db0', fleur2: '#fbf7ef', coeurFleur: '#e9b949',
      accent: '#e9a93a', accent2: '#ef7b5a', ombre: 'rgba(52,84,34,0.2)',
      arbre: 'feuillu', maison: 'maison', special: 'etal', detail: 'touffes' },
    tictac: { ...COMMUN, nom: 'planète givrée aux horloges cuivrées', fond: '#262c42',
      sol: '#dfeaf0', sol2: '#d3e2eb', solPoint: '#bccfdc', herbe: '#a7c2d3',
      chemin: '#efe6d6', cheminBord: '#d4c7b1', cheminPoint: '#e0d4c0',
      eau: '#9cc8e4', eauClair: '#d3eaf6', eauFonce: '#7cafd3', berge: '#c0d4e1',
      falaise: '#bccadb', falaiseFace: '#93a4bd', falaiseFonce: '#7a8ba6',
      vegetal: '#6e9ea2', vegetalFonce: '#557f87', vegetalClair: '#f4f8fa',
      tronc: '#9d7b63', troncFonce: '#7d604c', bois: '#c48d61', boisFonce: '#9f6c45',
      roche: '#c6cfdb', rocheFonce: '#a5b0c0', rocheClair: '#e5ebf2',
      toit: '#c97d4f', toitFonce: '#a7613b', mur: '#f6f0e7', murFonce: '#ddd3c5',
      cristal: '#b7dbf2', cristalFonce: '#8dbde0', cristalClair: '#e8f5fc',
      fleur1: '#ffffff', fleur2: '#c3b6ee', coeurFleur: '#8fb8de',
      accent: '#c97a45', accent2: '#7b6ee6', cuivre: '#d08b54', cuivreFonce: '#a9693c', ombre: 'rgba(58,78,120,0.18)',
      arbre: 'sapin', maison: 'maison', special: 'horloge', detail: 'givre', neige: true },
    defi: { ...COMMUN, nom: 'astéroïde lavande et lune', fond: '#221e36',
      sol: '#ddd4ec', sol2: '#d3c8e6', solPoint: '#bfb1d9', herbe: '#ad9fcf',
      chemin: '#f4ede3', cheminBord: '#dccfe0', cheminPoint: '#e6dce6',
      eau: '#8fb3e8', eauClair: '#c4d7f4', eauFonce: '#7097d3', berge: '#c5b8de',
      falaise: '#b6a6d4', falaiseFace: '#9585ba', falaiseFonce: '#7b6ca2',
      vegetal: '#7ec0a8', vegetalFonce: '#5ea18b', vegetalClair: '#ade0cf',
      tronc: '#a28cba', troncFonce: '#846e9f', bois: '#c79e79', boisFonce: '#a27c58',
      roche: '#c6badc', rocheFonce: '#a698c3', rocheClair: '#e3dcef',
      toit: '#f09f78', toitFonce: '#d4805b', mur: '#f7f2fa', murFonce: '#ddd3ea',
      cristal: '#f1b2cf', cristalFonce: '#d68fb2', cristalClair: '#fbd9e8',
      fleur1: '#f6d77a', fleur2: '#fbf7ef', coeurFleur: '#ef7b5a',
      accent: '#ef7b5a', accent2: '#f6d77a', ombre: 'rgba(72,52,112,0.2)',
      arbre: 'bulbe', maison: 'dome', special: 'antenne', detail: 'crateres' },
  };
  const palette = p => (p && p.sol ? p : PALETTES.plusmoins);

  // ---------------------------------------------------------------------------
  // Crayons : la même description de formes pour le canvas et pour le SVG
  // Chemins = listes de commandes ['M',x,y] ['L',x,y] ['Q',cx,cy,x,y] ['C',…] ['Z']
  // ---------------------------------------------------------------------------
  function cmdsBoite(x, y, l, h, r) {
    const R = Array.isArray(r) ? r : [r, r, r, r];
    const m = Math.min(l, h) / 2;
    const [a, b, c, d] = R.map(v => Math.max(0, Math.min(v || 0, m)));
    return [
      ['M', x + a, y], ['L', x + l - b, y], ['C', x + l - b + b * K, y, x + l, y + b - b * K, x + l, y + b],
      ['L', x + l, y + h - c], ['C', x + l, y + h - c + c * K, x + l - c + c * K, y + h, x + l - c, y + h],
      ['L', x + d, y + h], ['C', x + d - d * K, y + h, x, y + h - d + d * K, x, y + h - d],
      ['L', x, y + a], ['C', x, y + a - a * K, x + a - a * K, y, x + a, y], ['Z'],
    ];
  }
  // Tache irrégulière et douce (n points, rayons variables) : buissons, rochers, taches de sol
  function cmdsTache(cx, cy, rx, ry, r, n = 6, var_ = 0.18, rot = 0) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = rot + (i / n) * TAU + (r() - 0.5) * 0.5, k = 1 - var_ + r() * var_ * 2;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    const mil = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const d = [['M', ...mil(pts[n - 1], pts[0])]];
    for (let i = 0; i < n; i++) d.push(['Q', ...pts[i], ...mil(pts[i], pts[(i + 1) % n])]);
    d.push(['Z']);
    return d;
  }

  function crayonCanvas(ctx) {
    const tracer = d => {
      ctx.beginPath();
      for (const c of d) {
        switch (c[0]) {
          case 'M': ctx.moveTo(c[1], c[2]); break;
          case 'L': ctx.lineTo(c[1], c[2]); break;
          case 'Q': ctx.quadraticCurveTo(c[1], c[2], c[3], c[4]); break;
          case 'C': ctx.bezierCurveTo(c[1], c[2], c[3], c[4], c[5], c[6]); break;
          default: ctx.closePath();
        }
      }
    };
    return {
      ctx, svg: false,
      cercle(x, y, r, f) { ctx.fillStyle = f; ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, TAU); ctx.fill(); },
      ellipse(x, y, rx, ry, f, rot = 0) { ctx.fillStyle = f; ctx.beginPath(); ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, TAU); ctx.fill(); },
      rect(x, y, l, h, f) { ctx.fillStyle = f; ctx.fillRect(x, y, l, h); },
      boite(x, y, l, h, r, f) { ctx.fillStyle = f; tracer(cmdsBoite(x, y, l, h, r)); ctx.fill(); },
      forme(d, f) { ctx.fillStyle = f; tracer(d); ctx.fill(); },
      trait(d, c, ep) { ctx.strokeStyle = c; ctx.lineWidth = ep; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; tracer(d); ctx.stroke(); },
      anneau(x, y, r, c, ep) { ctx.strokeStyle = c; ctx.lineWidth = ep; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); },
      groupe(alpha, fn) { const a = ctx.globalAlpha; ctx.globalAlpha = a * alpha; fn(); ctx.globalAlpha = a; },
    };
  }
  const crayons = new WeakMap();
  const crayon = ctx => { let p = crayons.get(ctx); if (!p) { p = crayonCanvas(ctx); crayons.set(ctx, p); } return p; };

  function crayonSvg() {
    const morceaux = [];
    const n = v => Math.round(v * 10) / 10;
    const d = cmds => cmds.map(c => c[0] + c.slice(1).map(n).join(' ')).join('');
    let ouvert = 0;
    return {
      svg: true, morceaux,
      cercle(x, y, r, f) { morceaux.push(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${f}"/>`); },
      ellipse(x, y, rx, ry, f, rot = 0) {
        morceaux.push(`<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rx)}" ry="${n(ry)}" fill="${f}"${rot ? ` transform="rotate(${n(rot * 180 / Math.PI)} ${n(x)} ${n(y)})"` : ''}/>`);
      },
      rect(x, y, l, h, f) { morceaux.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(l)}" height="${n(h)}" fill="${f}"/>`); },
      boite(x, y, l, h, r, f) { morceaux.push(`<path d="${d(cmdsBoite(x, y, l, h, r))}" fill="${f}"/>`); },
      forme(c, f) { morceaux.push(`<path d="${d(c)}" fill="${f}"/>`); },
      trait(c, coul, ep) { morceaux.push(`<path d="${d(c)}" fill="none" stroke="${coul}" stroke-width="${n(ep)}" stroke-linecap="round" stroke-linejoin="round"/>`); },
      anneau(x, y, r, c, ep) { morceaux.push(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="none" stroke="${c}" stroke-width="${n(ep)}"/>`); },
      groupe(alpha, fn) { morceaux.push(`<g opacity="${alpha}">`); ouvert++; fn(); morceaux.push('</g>'); ouvert--; },
      fin: (vb = '0 0 100 100') => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${morceaux.join('')}</svg>`,
    };
  }

  // Ombre portée : ellipse plate semi-transparente
  const ombre = (P, cx, by, T, l, pal, h = 0.3) => P.ellipse(cx, by - T * 0.1, T * l, T * l * h, palette(pal).ombre);

  // ---------------------------------------------------------------------------
  // Sol
  // ---------------------------------------------------------------------------
  const EAU = q => q === '~' || q === '=' || q === 'B';
  const CHEMIN = q => q === ':' || q === '=' || q === 'B';
  const FALAISE = q => q === '#';

  // Région arrondie qui se raccorde à ses voisines : centre + bras vers les cases liées,
  // coins extérieurs arrondis (R), coins rentrants adoucis (f) ou comblés si la diagonale est liée.
  // Tout est rempli en UN seul chemin (sous-chemins dans le sens horaire) : aucune couture d'anticrénelage.
  function region(P, x, y, l, h, lie, m, R, f, coul) {
    const { n, s, e, o } = lie, j = 1, k = 1 - K;
    const d = cmdsBoite(x + m, y + m, l - 2 * m, h - 2 * m, [!n && !o ? R : 0, !n && !e ? R : 0, !s && !e ? R : 0, !s && !o ? R : 0]);
    const rect = (rx, ry, rl, rh) => d.push(['M', rx, ry], ['L', rx + rl, ry], ['L', rx + rl, ry + rh], ['L', rx, ry + rh], ['Z']);
    if (n) rect(x + m, y, l - 2 * m, m + j);
    if (s) rect(x + m, y + h - m - j, l - 2 * m, m + j);
    if (o) rect(x, y + m, m + j, h - 2 * m);
    if (e) rect(x + l - m - j, y + m, m + j, h - 2 * m);
    const coin = (a, b, diag, px, py, sx, sy) => {                 // (px, py) = coin rentrant ; (sx, sy) = vers le coin de la case
      if (!a || !b) return;
      if (diag) { rect(Math.min(px, px + sx * m), Math.min(py, py + sy * m), m, m); return; }   // jamais au-delà de la case
      const g = Math.min(f, m), A = [px, py + sy * g], B = [px + sx * g, py];
      if (sx * sy > 0) d.push(['M', ...A], ['L', px, py], ['L', ...B], ['C', px + sx * g * k, py, px, py + sy * g * k, ...A], ['Z']);
      else d.push(['M', ...B], ['L', px, py], ['L', ...A], ['C', px, py + sy * g * k, px + sx * g * k, py, ...B], ['Z']);
    };
    coin(n, o, lie.no, x + m, y + m, -1, -1);
    coin(n, e, lie.ne, x + l - m, y + m, 1, -1);
    coin(s, o, lie.so, x + m, y + h - m, -1, 1);
    coin(s, e, lie.se, x + l - m, y + h - m, 1, 1);
    P.forme(d, coul);
  }
  const liens = (voisin, test) => ({
    n: test(voisin(0, -1)), s: test(voisin(0, 1)), e: test(voisin(1, 0)), o: test(voisin(-1, 0)),
    ne: test(voisin(1, -1)), no: test(voisin(-1, -1)), se: test(voisin(1, 1)), so: test(voisin(-1, 1)),
  });

  // Petits détails du sol : touffes, cailloux, cratères, givre
  function touffe(P, x, y, T, coul) {
    const e = T * 0.026;
    P.trait([['M', x - T * 0.05, y - T * 0.035], ['Q', x - T * 0.03, y, x - T * 0.012, y]], coul, e);
    P.trait([['M', x, y - T * 0.065], ['L', x, y]], coul, e);
    P.trait([['M', x + T * 0.05, y - T * 0.035], ['Q', x + T * 0.03, y, x + T * 0.012, y]], coul, e);
  }
  function detailsSol(P, x, y, T, pal, r, variante) {
    const d = r();
    const px = x + T * entre(r, 0.18, 0.82), py = y + T * entre(r, 0.22, 0.86);
    if (pal.detail === 'crateres' && d < 0.16) {
      const rr = T * entre(r, 0.07, 0.11);
      P.ellipse(px, py, rr, rr * 0.72, pal.solPoint);
      P.ellipse(px, py + rr * 0.16, rr * 0.78, rr * 0.5, variante ? pal.sol2 : pal.sol);
    } else if (d < 0.36) {
      touffe(P, px, py, T, pal.herbe);
      if (r() < 0.4) touffe(P, px + T * 0.1, py + T * 0.04, T * 0.75, pal.herbe);
    } else if (d < 0.56) {
      const k = 2 + (r() * 2 | 0);
      for (let i = 0; i < k; i++) P.ellipse(px + T * entre(r, -0.08, 0.08), py + T * entre(r, -0.05, 0.05), T * entre(r, 0.016, 0.03), T * entre(r, 0.012, 0.022), pal.solPoint);
    } else if (pal.detail === 'givre' && d < 0.66) {
      const e = T * 0.018;
      P.trait([['M', px - T * 0.04, py], ['L', px + T * 0.04, py], ['M', px, py - T * 0.04], ['L', px, py + T * 0.04]], pal.blanc, e);
    }
  }

  const PLACES_FLEURS = [[0.26, 0.28], [0.72, 0.24], [0.48, 0.52], [0.22, 0.76], [0.76, 0.72]];
  function fleurs(P, x, y, T, pal, r) {
    const n = 3 + (r() * 3 | 0), dep = (r() * 5) | 0;
    for (let i = 0; i < n; i++) {
      const [px, py] = PLACES_FLEURS[(dep + i) % 5];
      const fx = x + T * (px + entre(r, -0.06, 0.06)), fy = y + T * (py + entre(r, -0.05, 0.05));
      const coul = i % 2 ? pal.fleur2 : pal.fleur1, rp = T * entre(r, 0.034, 0.042), a0 = r() * TAU;
      P.ellipse(fx - T * 0.05, fy + T * 0.05, T * 0.045, T * 0.02, pal.vegetalFonce, 0.5);
      P.ellipse(fx + T * 0.05, fy + T * 0.055, T * 0.045, T * 0.02, pal.vegetal, -0.5);
      for (let k = 0; k < 5; k++) { const a = a0 + (k / 5) * TAU; P.cercle(fx + Math.cos(a) * rp * 1.15, fy + Math.sin(a) * rp * 1.15, rp, coul); }
      P.cercle(fx, fy, rp * 0.85, pal.coeurFleur);
    }
  }

  function dessinerEau(P, x, y, T, voisin, pal, r) {
    const lie = liens(voisin, EAU);
    region(P, x, y, T, T, lie, T * 0.05, T * 0.36, T * 0.14, pal.berge);
    region(P, x, y, T, T, lie, T * 0.11, T * 0.3, T * 0.13, pal.eauClair);
    region(P, x, y, T, T, lie, T * 0.145, T * 0.27, T * 0.12, pal.eau);
    if (r() < 0.55) {                                                 // reflets : petits tirets arrondis
      const lx = x + T * entre(r, 0.24, 0.62), ly = y + T * entre(r, 0.28, 0.72), lg = T * entre(r, 0.12, 0.2);
      P.boite(lx, ly, lg, T * 0.035, T * 0.0175, pal.eauClair);
      if (r() < 0.5) P.boite(lx + lg * 0.4, ly + T * 0.08, lg * 0.55, T * 0.03, T * 0.015, pal.eauClair);
    }
  }

  function dessinerPont(P, x, y, T, voisin, pal, r, casse) {
    const ctx = P.ctx, ouvert = q => q === '~';
    const horiz = ouvert(voisin(0, -1)) && ouvert(voisin(0, 1)) ? true
      : ouvert(voisin(-1, 0)) && ouvert(voisin(1, 0)) ? false
        : (voisin(-1, 0) === '=' || voisin(-1, 0) === 'B' || voisin(1, 0) === '=' || voisin(1, 0) === 'B');
    const debut = horiz ? voisin(-1, 0) : voisin(0, -1), fin = horiz ? voisin(1, 0) : voisin(0, 1);
    const accroche = q => !(q === '~' || q === 'B');
    ctx.save();
    ctx.translate(x + T / 2, y + T / 2);
    if (!horiz) ctx.rotate(Math.PI / 2);
    ctx.translate(-T / 2, -T / 2);
    const n = 5, lp = T / n, aD = accroche(debut), aF = accroche(fin), nG = aD && aF ? 2 : 3;
    const garde = i => i >= 0 && i < n && (!casse || (aD && i < nG) || (aF && i >= n - nG));
    P.rect(0, T * 0.8, T, T * 0.07, transparent(pal.eauFonce, 0.55));                         // ombre du tablier sur l'eau
    for (let i = 0; i < n; i++) {
      if (!garde(i)) continue;
      const bout = casse && i > 0 && i < n - 1 && (!garde(i + 1) || !garde(i - 1));        // planche cassée au bord du trou
      const h = T * (0.6 + r() * 0.04) * (bout ? 0.7 : 1);
      const coul = r() < 0.5 ? pal.bois : melange(pal.bois, pal.boisFonce, 0.3);
      P.boite(i * lp + T * 0.012, T * 0.2 + (bout ? T * 0.12 : 0) + r() * T * 0.02, lp - T * 0.024, h, T * 0.03, coul);
    }
    for (const yy of [0.16, 0.78]) {                                                            // garde-corps
      if (!casse) P.boite(0, T * yy, T, T * 0.07, T * 0.03, pal.boisFonce);
      else {
        if (aD) P.boite(0, T * yy, lp * (nG - 0.3), T * 0.07, T * 0.03, pal.boisFonce);
        if (aF) P.boite(T - lp * (nG - 0.3), T * yy, lp * (nG - 0.3), T * 0.07, T * 0.03, pal.boisFonce);
      }
    }
    if (casse && !(aD && aF)) {                                                                 // planche qui flotte dans le trou
      ctx.translate(aD ? T * 0.8 : aF ? T * 0.2 : T * 0.5, T * 0.52); ctx.rotate(aD ? 0.5 : -0.5);
      P.boite(-lp * 0.4, -T * 0.16, lp * 0.8, T * 0.32, T * 0.03, melange(pal.bois, pal.eau, 0.25));
    }
    ctx.restore();
  }

  function dessinerFalaise(P, x, y, T, voisin, pal, r) {
    const lie = liens(voisin, FALAISE);
    const m = T * 0.05, R = T * 0.26;
    if (!lie.s) {
      const mo = lie.o ? 0 : m, me = lie.e ? 0 : m;
      P.boite(x + mo, y + T * 0.42, T - mo - me, T * 0.58, [0, 0, lie.e ? 0 : R * 0.6, lie.o ? 0 : R * 0.6], pal.falaiseFace);
      const k = 1 + (r() * 2 | 0);                                   // strates
      for (let i = 0; i < k; i++) {
        const sx = x + T * entre(r, 0.12, 0.5), sl = T * entre(r, 0.18, 0.34);
        P.boite(sx, y + T * (0.74 + i * 0.1 + r() * 0.04), sl, T * 0.04, T * 0.02, pal.falaiseFonce);
      }
      region(P, x, y, T, T * 0.7, { ...lie, s: false, se: false, so: false }, m, R, T * 0.12, pal.falaise);
    } else {
      region(P, x, y, T, T, lie, m, R, T * 0.12, pal.falaise);
    }
    const d = r();                                                   // détails du dessus
    if (d < 0.45) {
      const px = x + T * entre(r, 0.25, 0.7), py = y + T * entre(r, 0.2, 0.45);
      if (pal.special === 'etal') touffe(P, px, py, T, pal.vegetalFonce);
      else { P.ellipse(px, py, T * 0.05, T * 0.03, pal.falaiseFace); P.ellipse(px + T * 0.1, py + T * 0.06, T * 0.025, T * 0.018, pal.falaiseFace); }
    }
  }

  function dessinerChemin(P, x, y, T, voisin, pal, r) {
    const lie = liens(voisin, CHEMIN);
    region(P, x, y, T, T, lie, T * 0.1, T * 0.32, T * 0.16, pal.cheminBord);
    region(P, x, y, T, T, lie, T * 0.135, T * 0.29, T * 0.14, pal.chemin);
    if (r() < 0.45) {
      const k = 1 + (r() * 3 | 0);
      for (let i = 0; i < k; i++) P.ellipse(x + T * entre(r, 0.25, 0.75), y + T * entre(r, 0.25, 0.75), T * entre(r, 0.018, 0.03), T * entre(r, 0.013, 0.022), pal.cheminPoint);
    }
  }

  function dessinerSol(ctx, c, x, y, T, voisin, pal, graine) {
    pal = palette(pal);
    const P = crayon(ctx), r = hasard(graine);
    voisin = typeof voisin === 'function' ? voisin : () => c;
    P.rect(x, y, T, T, pal.sol);
    if (c === ',') P.forme(cmdsTache(x + T * entre(r, 0.42, 0.58), y + T * entre(r, 0.42, 0.58), T * 0.3, T * 0.23, r, 7, 0.16, r() * TAU), pal.sol2);
    if (c === '#') { dessinerFalaise(P, x, y, T, voisin, pal, r); return; }
    if (EAU(c)) {
      dessinerEau(P, x, y, T, voisin, pal, r);
      if (c !== '~') dessinerPont(P, x, y, T, voisin, pal, r, c === 'B');
    } else if (c === ':') dessinerChemin(P, x, y, T, voisin, pal, r);
    else if (c === 'f') fleurs(P, x, y, T, pal, r);
    else detailsSol(P, x, y, T, pal, r, c === ',');
    if (FALAISE(voisin(0, -1))) P.rect(x, y, T, T * 0.12, pal.ombre);                    // ombre plate au pied de la falaise
  }

  // ---------------------------------------------------------------------------
  // Objets hauts : T arbre · R rocher · C cristal · H maison · X barrière · M objet typique · P barrière de zone
  // ---------------------------------------------------------------------------
  function arbre(P, cx, by, T, pal, r) {
    const k = entre(r, 0.9, 1.08), dx = T * entre(r, -0.05, 0.05);
    const sorte = pal.arbre;
    if (sorte === 'palmier') {
      const pente = T * entre(r, 0.08, 0.2) * (r() < 0.5 ? -1 : 1);
      ombre(P, cx + pente * 0.5, by, T, 0.36, pal);
      const x0 = cx, y0 = by - T * 0.1, x1 = cx + pente, y1 = by - T * 1.0 * k, qx = cx - pente * 0.15, qy = (y0 + y1) / 2;
      const w0 = T * 0.08, w1 = T * 0.045;
      P.forme([['M', x0 - w0, y0], ['Q', qx - (w0 + w1) / 2, qy, x1 - w1, y1], ['L', x1 + w1, y1], ['Q', qx + (w0 + w1) / 2, qy, x0 + w0, y0], ['Z']], pal.tronc);
      for (let i = 1; i < 6; i++) {                                    // anneaux du tronc
        const u = i / 6, v = 1 - u, bx = v * v * x0 + 2 * v * u * qx + u * u * x1, byy = v * v * y0 + 2 * v * u * qy + u * u * y1, w = (w0 + (w1 - w0) * u) * 0.85;
        P.trait([['M', bx - w, byy - T * 0.012], ['Q', bx, byy + T * 0.02, bx + w, byy - T * 0.012]], pal.troncFonce, T * 0.02);
      }
      const palme = (a, L, coul) => {
        const dx_ = Math.cos(a), dy_ = Math.sin(a), w = T * 0.12;
        const tipx = x1 + dx_ * L, tipy = y1 + dy_ * L * 0.55 + L * 0.32;
        const sx = x1 + dx_ * L * 0.5, sy = y1 + dy_ * L * 0.3 - L * 0.16;
        const nx = -(tipy - y1) / L, ny = (tipx - x1) / L;
        P.forme([['M', x1, y1], ['Q', sx + nx * w, sy + ny * w, tipx, tipy], ['Q', sx - nx * w * 0.7, sy - ny * w * 0.7, x1, y1], ['Z']], coul);
      };
      const a0 = entre(r, -0.2, 0.2);
      for (const a of [-2.5, -1.57, -0.64]) palme(a + a0, T * 0.44, pal.vegetalFonce);
      for (const a of [-3.0, 0.15, -0.25, 2.95]) palme(a + a0, T * entre(r, 0.44, 0.52), pal.vegetal);
      P.cercle(x1 - T * 0.045, y1 + T * 0.05, T * 0.05, pal.troncFonce);
      P.cercle(x1 + T * 0.04, y1 + T * 0.065, T * 0.045, pal.troncFonce);
      for (const a of [-0.2, 0.25]) palme(Math.PI / 2 + a + a0, T * 0.3, pal.vegetalClair);
      return;
    }
    if (sorte === 'sapin') {
      ombre(P, cx, by, T, 0.34, pal);
      P.boite(cx - T * 0.06, by - T * 0.3, T * 0.12, T * 0.24, T * 0.03, pal.troncFonce);
      for (let i = 0; i < 3; i++) {
        const w = T * (0.4 - i * 0.09) * k, yb = by - T * (0.24 + i * 0.27) * k, yt = yb - T * 0.42 * k;
        P.forme([['M', cx + dx * 0.3, yt], ['L', cx - w, yb - T * 0.02], ['Q', cx, yb + T * 0.08, cx + w, yb - T * 0.02], ['Z']], pal.vegetal);
        P.forme([['M', cx + dx * 0.3, yt], ['L', cx + w, yb - T * 0.02], ['Q', cx + w * 0.5, yb + T * 0.05, cx + dx * 0.3, yb + T * 0.03], ['Z']], pal.vegetalFonce);
        if (pal.neige) {
          const yn = yt + (yb - yt) * 0.38, wn = w * 0.42;
          P.forme([['M', cx + dx * 0.3, yt - T * 0.01], ['L', cx - wn, yn], ['Q', cx - wn * 0.5, yn + T * 0.05, cx, yn], ['Q', cx + wn * 0.5, yn + T * 0.05, cx + wn, yn], ['Z']], pal.vegetalClair);
        }
      }
      return;
    }
    if (sorte === 'bulbe') {
      ombre(P, cx, by, T, 0.3, pal);
      const tiges = [[-0.13, 0.62, 0.13], [0.12, 0.84, 0.16], [0.01, 0.46, 0.1]];
      for (const [ox, h, rb] of tiges) {
        const hx = cx + T * ox + dx, hy = by - T * h * k;
        P.trait([['M', cx + T * ox * 0.4, by - T * 0.1], ['Q', cx + T * ox * 1.3, by - T * h * 0.5, hx, hy]], pal.vegetalFonce, T * 0.05);
        P.cercle(hx, hy, T * rb, pal.vegetal);
        P.cercle(hx + T * rb * 0.25, hy + T * rb * 0.2, T * rb * 0.62, pal.vegetalFonce);
        P.cercle(hx - T * rb * 0.1, hy - T * rb * 0.05, T * rb * 0.62, pal.vegetal);
        P.cercle(hx - T * rb * 0.35, hy - T * rb * 0.35, T * rb * 0.22, pal.vegetalClair);
      }
      P.forme(cmdsTache(cx, by - T * 0.1, T * 0.2, T * 0.07, r, 6, 0.15), pal.vegetalFonce);
      return;
    }
    // feuillu (et fruitier) : tronc + feuillage en deux tons
    ombre(P, cx, by, T, 0.38, pal);
    P.boite(cx - T * 0.065, by - T * 0.46, T * 0.13, T * 0.4, T * 0.05, pal.tronc);
    P.boite(cx + T * 0.005, by - T * 0.46, T * 0.06, T * 0.4, [0, T * 0.05, T * 0.05, 0], pal.troncFonce);
    const fx = cx + dx, fy = by - T * 0.8 * k, rf = T * 0.4 * k;
    P.forme(cmdsTache(fx + T * 0.03, fy + T * 0.06, rf, rf * 0.86, r, 7, 0.1), pal.vegetalFonce);
    P.forme(cmdsTache(fx - T * 0.02, fy - T * 0.02, rf * 0.88, rf * 0.76, r, 7, 0.1), pal.vegetal);
    P.cercle(fx - rf * 0.36, fy - rf * 0.34, rf * 0.2, pal.vegetalClair);
    P.cercle(fx - rf * 0.08, fy - rf * 0.5, rf * 0.11, pal.vegetalClair);
    if (sorte === 'fruitier') {
      const n = 3 + (r() * 3 | 0);
      for (let i = 0; i < n; i++) {
        const a = r() * TAU, d = rf * entre(r, 0.25, 0.62), px = fx + Math.cos(a) * d, py = fy + Math.sin(a) * d * 0.8;
        P.cercle(px, py, T * 0.05, i % 3 === 2 ? pal.accent2 : pal.accent);
        P.cercle(px - T * 0.015, py - T * 0.017, T * 0.014, pal.blanc);
      }
    }
  }

  function rocher(P, cx, by, T, pal, r) {
    const dx = T * entre(r, -0.06, 0.06), k = entre(r, 0.88, 1.08);
    ombre(P, cx + dx, by, T, 0.32 * k, pal);
    P.forme(cmdsTache(cx + dx, by - T * 0.22 * k, T * 0.33 * k, T * 0.24 * k, r, 7, 0.1), pal.rocheFonce);
    P.forme(cmdsTache(cx + dx - T * 0.03, by - T * 0.29 * k, T * 0.27 * k, T * 0.17 * k, r, 6, 0.1), pal.roche);
    P.ellipse(cx + dx - T * 0.11 * k, by - T * 0.34 * k, T * 0.08 * k, T * 0.04 * k, pal.rocheClair, -0.2);
    if (r() < 0.5) {
      const px = cx + dx + T * (r() < 0.5 ? -0.32 : 0.3);
      P.ellipse(px, by - T * 0.11, T * 0.09, T * 0.06, pal.rocheFonce);
      P.ellipse(px - T * 0.01, by - T * 0.13, T * 0.07, T * 0.04, pal.roche);
    }
  }

  function cristal(P, cx, by, T, pal, r) {
    const ctx = P.ctx;
    ombre(P, cx, by, T, 0.28, pal);
    const prismes = [[-0.02, 0.8, 0.13, 0.04], [-0.19, 0.48, 0.1, -0.32], [0.17, 0.42, 0.09, 0.36]];
    for (const [ox, h, w, a] of prismes) {
      const hh = T * h * entre(r, 0.88, 1.1), ww = T * w;
      ctx.save();
      ctx.translate(cx + T * ox, by - T * 0.12);
      ctx.rotate(a * entre(r, 0.7, 1.1));
      P.forme([['M', -ww, 0], ['L', -ww, -hh + ww], ['L', 0, -hh], ['L', 0, 0], ['Z']], pal.cristalClair);
      P.forme([['M', 0, 0], ['L', 0, -hh], ['L', ww, -hh + ww], ['L', ww, 0], ['Z']], pal.cristal);
      P.forme([['M', -ww, 0], ['L', ww, 0], ['L', ww, -ww * 0.5], ['L', -ww, -ww * 0.3], ['Z']], pal.cristalFonce);
      ctx.restore();
    }
    P.forme(cmdsTache(cx, by - T * 0.1, T * 0.24, T * 0.06, r, 6, 0.15), pal.rocheFonce);
  }

  function maison(P, cx, by, T, pal, r) {
    const sorte = pal.maison;
    ombre(P, cx, by, T, 0.48, pal, 0.26);
    if (sorte === 'dome') {
      T *= 1.25;                                                     // le dôme est bas : on l'agrandit un peu
      const dome = (dx, dy, k, coul) => P.forme([['M', cx - T * 0.42 * k + dx, by - T * 0.1], ['C', cx - T * 0.42 * k + dx, by - T * 0.98 * k + dy, cx + T * 0.42 * k + dx, by - T * 0.98 * k + dy, cx + T * 0.42 * k + dx, by - T * 0.1], ['Z']], coul);
      P.trait([['M', cx + T * 0.1, by - T * 0.72], ['L', cx + T * 0.18, by - T * 0.95]], pal.murFonce, T * 0.03);
      P.cercle(cx + T * 0.18, by - T * 0.96, T * 0.04, pal.accent2);
      dome(0, 0, 1, pal.murFonce);
      dome(-T * 0.05, -T * 0.02, 0.86, pal.mur);
      P.boite(cx - T * 0.42, by - T * 0.3, T * 0.84, T * 0.09, T * 0.03, pal.toit);
      P.boite(cx - T * 0.1, by - T * 0.36, T * 0.2, T * 0.26, [T * 0.1, T * 0.1, T * 0.02, T * 0.02], pal.toitFonce);
      P.cercle(cx - T * 0.22, by - T * 0.55, T * 0.085, pal.toitFonce);
      P.cercle(cx - T * 0.22, by - T * 0.55, T * 0.06, pal.cristalClair);
      return;
    }
    if (sorte === 'hutte') {
      P.boite(cx - T * 0.36, by - T * 0.6, T * 0.72, T * 0.5, [T * 0.1, T * 0.1, T * 0.06, T * 0.06], pal.mur);
      P.boite(cx + T * 0.14, by - T * 0.6, T * 0.22, T * 0.5, [0, T * 0.1, T * 0.06, 0], pal.murFonce);
      const toit = (k, dx, coul) => P.forme([['M', cx - T * 0.46 * k + dx, by - T * 0.54], ['C', cx - T * 0.46 * k + dx, by - T * 1.14 * k, cx + T * 0.46 * k + dx, by - T * 1.14 * k, cx + T * 0.46 * k + dx, by - T * 0.54], ['Q', cx + dx, by - T * 0.47, cx - T * 0.46 * k + dx, by - T * 0.54], ['Z']], coul);
      toit(1, 0, pal.toitFonce);
      toit(0.86, -T * 0.05, pal.toit);
      for (const [ox, oy, l] of [[-0.18, 0.78, 0.16], [0.06, 0.86, 0.14], [-0.04, 0.66, 0.2]]) {
        P.trait([['M', cx + T * ox, by - T * oy], ['Q', cx + T * (ox + l / 2), by - T * (oy - 0.03), cx + T * (ox + l), by - T * oy]], pal.toitFonce, T * 0.025);
      }
      P.boite(cx - T * 0.09, by - T * 0.38, T * 0.18, T * 0.28, [T * 0.09, T * 0.09, T * 0.02, T * 0.02], pal.boisFonce);
      P.cercle(cx - T * 0.24, by - T * 0.38, T * 0.05, pal.boisFonce);
      return;
    }
    // maison à toit pointu
    P.boite(cx - T * 0.37, by - T * 0.62, T * 0.74, T * 0.52, T * 0.05, pal.mur);
    P.boite(cx + T * 0.15, by - T * 0.62, T * 0.22, T * 0.52, [0, T * 0.05, T * 0.05, 0], pal.murFonce);
    if (r() < 0.6) P.boite(cx + T * 0.16, by - T * 1.08, T * 0.1, T * 0.24, T * 0.025, pal.murFonce);
    const yb = by - T * 0.56, yt = by - T * 1.16;
    P.forme([['M', cx - T * 0.5, yb], ['L', cx - T * 0.05, yt + T * 0.02], ['Q', cx, yt - T * 0.02, cx + T * 0.05, yt + T * 0.02], ['L', cx + T * 0.5, yb], ['Q', cx + T * 0.52, yb + T * 0.07, cx + T * 0.44, yb + T * 0.07], ['L', cx - T * 0.44, yb + T * 0.07], ['Q', cx - T * 0.52, yb + T * 0.07, cx - T * 0.5, yb], ['Z']], pal.toit);
    P.forme([['M', cx, yt], ['Q', cx + T * 0.03, yt - T * 0.005, cx + T * 0.05, yt + T * 0.02], ['L', cx + T * 0.5, yb], ['Q', cx + T * 0.52, yb + T * 0.07, cx + T * 0.44, yb + T * 0.07], ['L', cx, yb + T * 0.07], ['Z']], pal.toitFonce);
    if (pal.neige) {
      const yn = yt + T * 0.22;
      P.forme([['M', cx, yt - T * 0.015], ['L', cx - T * 0.19, yn], ['Q', cx - T * 0.1, yn + T * 0.06, cx, yn], ['Q', cx + T * 0.1, yn + T * 0.06, cx + T * 0.19, yn], ['Z']], pal.blanc);
    }
    P.boite(cx - T * 0.1, by - T * 0.38, T * 0.2, T * 0.28, [T * 0.1, T * 0.1, T * 0.02, T * 0.02], pal.boisFonce);
    P.cercle(cx + T * 0.05, by - T * 0.23, T * 0.017, pal.or);
    P.boite(cx - T * 0.31, by - T * 0.45, T * 0.15, T * 0.14, T * 0.03, pal.murFonce);
    P.boite(cx - T * 0.295, by - T * 0.435, T * 0.12, T * 0.11, T * 0.02, pal.cristalClair);
    P.rect(cx - T * 0.24, by - T * 0.435, T * 0.014, T * 0.11, pal.mur);
  }

  function barriere(P, cx, by, T, pal, r) {
    ombre(P, cx, by, T, 0.46, pal, 0.18);
    P.boite(cx - T * 0.5, by - T * 0.53, T, T * 0.08, T * 0.035, pal.bois);
    P.boite(cx - T * 0.5, by - T * 0.33, T, T * 0.08, T * 0.035, pal.bois);
    for (const k of [-0.3, 0.3]) {
      const px = cx + T * k + T * entre(r, -0.02, 0.02);
      P.boite(px - T * 0.055, by - T * 0.66, T * 0.11, T * 0.58, [T * 0.055, T * 0.055, T * 0.02, T * 0.02], pal.boisFonce);
      P.boite(px + T * 0.005, by - T * 0.66, T * 0.05, T * 0.58, [0, T * 0.05, T * 0.02, 0], fonce(pal.boisFonce, 0.12));
      if (pal.neige) P.ellipse(px, by - T * 0.64, T * 0.07, T * 0.035, pal.blanc);
    }
  }

  function porteZone(P, cx, by, T, pal) {
    const ctx = P.ctx;
    ombre(P, cx, by, T, 0.48, pal, 0.2);
    for (const k of [-0.4, 0.4]) {
      P.boite(cx + T * k - T * 0.07, by - T * 0.86, T * 0.14, T * 0.78, [T * 0.06, T * 0.06, T * 0.02, T * 0.02], pal.boisFonce);
      P.cercle(cx + T * k, by - T * 0.88, T * 0.075, pal.or);
    }
    P.boite(cx - T * 0.44, by - T * 0.36, T * 0.88, T * 0.08, T * 0.035, pal.bois);
    const bx = cx - T * 0.46, byy = by - T * 0.68, bl = T * 0.92, bh = T * 0.19;
    P.boite(bx, byy, bl, bh, T * 0.09, pal.blanc);
    ctx.save();
    ctx.beginPath(); ctx.rect(bx, byy, bl, bh); ctx.clip();
    for (let i = 0; i < 6; i++) {
      const sx = bx + i * T * 0.2 - T * 0.05;
      P.forme([['M', sx, byy + bh], ['L', sx + T * 0.09, byy], ['L', sx + T * 0.18, byy], ['L', sx + T * 0.09, byy + bh], ['Z']], pal.accent);
    }
    ctx.restore();
    // cadenas
    P.trait([['M', cx - T * 0.055, by - T * 0.47], ['L', cx - T * 0.055, by - T * 0.53], ['Q', cx - T * 0.055, by - T * 0.61, cx, by - T * 0.61], ['Q', cx + T * 0.055, by - T * 0.61, cx + T * 0.055, by - T * 0.53], ['L', cx + T * 0.055, by - T * 0.47]], pal.orFonce, T * 0.035);
    P.boite(cx - T * 0.1, by - T * 0.5, T * 0.2, T * 0.17, T * 0.045, pal.or);
    P.cercle(cx, by - T * 0.43, T * 0.025, pal.orFonce);
  }

  function cactus(P, cx, by, T, pal, r) {
    const fleur = (x, y, k) => {
      for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; P.cercle(x + Math.cos(a) * T * 0.035 * k, y + Math.sin(a) * T * 0.035 * k, T * 0.03 * k, '#f29bb0'); }
      P.cercle(x, y, T * 0.025 * k, pal.or);
    };
    if (r() < 0.6) {
      ombre(P, cx, by, T, 0.3, pal);
      const h = T * entre(r, 0.82, 0.98);
      P.boite(cx - T * 0.3, by - T * 0.5, T * 0.24, T * 0.11, T * 0.055, pal.vegetal);
      P.boite(cx - T * 0.3, by - T * 0.76, T * 0.11, T * 0.36, T * 0.055, pal.vegetal);
      P.boite(cx + T * 0.06, by - T * 0.62, T * 0.22, T * 0.1, T * 0.05, pal.vegetalFonce);
      P.boite(cx + T * 0.17, by - T * 0.86, T * 0.11, T * 0.34, T * 0.055, pal.vegetalFonce);
      P.boite(cx - T * 0.115, by - h, T * 0.23, h - T * 0.08, [T * 0.115, T * 0.115, T * 0.05, T * 0.05], pal.vegetal);
      P.boite(cx + T * 0.02, by - h, T * 0.095, h - T * 0.08, [0, T * 0.1, T * 0.05, 0], pal.vegetalFonce);
      P.trait([['M', cx - T * 0.045, by - h + T * 0.12], ['L', cx - T * 0.045, by - T * 0.16]], pal.vegetalClair, T * 0.022);
      fleur(cx, by - h + T * 0.02, 1);
    } else {
      ombre(P, cx, by, T, 0.34, pal);
      for (const [ox, rr] of [[-0.15, 0.17], [0.14, 0.14], [0.0, 0.2]]) {
        const x = cx + T * ox, y = by - T * 0.1 - T * rr;
        P.ellipse(x, y, T * rr, T * rr * 0.95, pal.vegetalFonce);
        P.ellipse(x - T * rr * 0.12, y - T * rr * 0.05, T * rr * 0.8, T * rr * 0.86, pal.vegetal);
        P.trait([['M', x - T * rr * 0.35, y - T * rr * 0.6], ['Q', x - T * rr * 0.5, y, x - T * rr * 0.3, y + T * rr * 0.6]], pal.vegetalClair, T * 0.018);
        fleur(x, y - T * rr * 0.88, 0.75);
      }
    }
  }

  function cadeaux(P, cx, by, T, pal, r) {
    ombre(P, cx, by, T, 0.38, pal);
    const couleurs = [pal.accent, pal.toit, '#7ec8b5', pal.accent2, '#8ab6e8'];
    const pioche = () => couleurs[(r() * couleurs.length) | 0];
    const boite = (x, y, l, h, c, ruban, noeud) => {
      P.boite(x, y, l, h, T * 0.04, c);
      P.boite(x + l * 0.72, y, l * 0.28, h, [0, T * 0.04, T * 0.04, 0], fonce(c, 0.14));
      P.rect(x + l * 0.42, y, l * 0.14, h, ruban);
      P.rect(x, y + h * 0.42, l, h * 0.16, ruban);
      if (noeud) {
        P.ellipse(x + l * 0.4, y - T * 0.04, T * 0.07, T * 0.045, ruban, -0.5);
        P.ellipse(x + l * 0.58, y - T * 0.04, T * 0.07, T * 0.045, ruban, 0.5);
        P.cercle(x + l * 0.49, y - T * 0.02, T * 0.03, fonce(ruban, 0.12));
      }
    };
    const c1 = pioche();
    let c2 = pioche(); if (c2 === c1) c2 = couleurs[(couleurs.indexOf(c1) + 2) % couleurs.length];
    boite(cx - T * 0.32, by - T * 0.46, T * 0.6, T * 0.36, c1, pal.blanc, false);
    boite(cx - T * 0.2 + T * entre(r, -0.05, 0.05), by - T * 0.78, T * 0.42, T * 0.32, c2, c1 === pal.accent2 ? pal.blanc : pal.accent2, true);
    if (r() < 0.5) boite(cx + T * 0.24, by - T * 0.3, T * 0.22, T * 0.2, couleurs[(couleurs.indexOf(c2) + 1) % couleurs.length], pal.blanc, false);
  }

  function etal(P, cx, by, T, pal, r) {
    ombre(P, cx, by, T, 0.48, pal, 0.24);
    for (const k of [-0.4, 0.4]) P.boite(cx + T * k - T * 0.03, by - T * 1.0, T * 0.06, T * 0.92, T * 0.03, pal.boisFonce);
    P.boite(cx - T * 0.46, by - T * 0.46, T * 0.92, T * 0.34, T * 0.04, pal.bois);
    P.boite(cx - T * 0.46, by - T * 0.22, T * 0.92, T * 0.1, [0, 0, T * 0.04, T * 0.04], pal.boisFonce);
    const fruits = ['#ef7b5a', '#86b46f', '#e9b949', '#f29bb0', '#a77bd1'];
    const f1 = fruits[(r() * 5) | 0], f2 = fruits[((r() * 4 | 0) + 1 + fruits.indexOf(f1)) % 5];
    for (let i = 0; i < 4; i++) P.cercle(cx - T * 0.32 + i * T * 0.085, by - T * 0.5, T * 0.05, f1);
    for (let i = 0; i < 3; i++) P.cercle(cx - T * 0.275 + i * T * 0.085, by - T * 0.58, T * 0.05, f1);
    P.boite(cx + T * 0.06, by - T * 0.6, T * 0.32, T * 0.14, T * 0.05, pal.boisFonce);
    for (let i = 0; i < 3; i++) P.cercle(cx + T * 0.12 + i * T * 0.1, by - T * 0.62, T * 0.048, f2);
    const ay = by - T * 1.06, ah = T * 0.2, n = 5, lw = T * 1.04 / n;
    for (let i = 0; i < n; i++) {
      const c = i % 2 ? pal.blanc : pal.accent, x0 = cx - T * 0.52 + i * lw;
      P.rect(x0, ay, lw + 0.5, ah, c);
      P.forme([['M', x0, ay + ah - 1], ['Q', x0 + lw / 2, ay + ah + T * 0.1, x0 + lw, ay + ah - 1], ['Z']], c);
    }
    P.boite(cx - T * 0.54, ay - T * 0.04, T * 1.08, T * 0.07, T * 0.035, fonce(pal.accent, 0.12));
  }

  function horloge(P, cx, by, T, pal, t, r) {
    const cu = pal.cuivre || '#d08b54', cuf = pal.cuivreFonce || '#a9693c';
    ombre(P, cx, by, T, 0.34, pal);
    P.boite(cx - T * 0.22, by - T * 0.3, T * 0.44, T * 0.22, T * 0.05, cuf);
    P.boite(cx - T * 0.15, by - T * 0.88, T * 0.3, T * 0.62, T * 0.06, cu);
    P.boite(cx + T * 0.05, by - T * 0.88, T * 0.1, T * 0.62, [0, T * 0.06, T * 0.06, 0], cuf);
    P.boite(cx - T * 0.085, by - T * 0.66, T * 0.17, T * 0.3, T * 0.07, '#3d4660');
    const a = Math.sin(t * 2.6) * 0.32, px = cx, py = by - T * 0.64;
    const ex = px + Math.sin(a) * T * 0.17, ey = py + Math.cos(a) * T * 0.17;
    P.trait([['M', px, py], ['L', ex, ey]], pal.or, T * 0.02);
    P.cercle(ex, ey, T * 0.04, pal.or);
    const fx = cx, fy = by - T * 1.08;
    P.cercle(fx, fy - T * 0.25, T * 0.07, cuf);
    P.cercle(fx, fy - T * 0.33, T * 0.035, pal.accent2);
    P.cercle(fx, fy, T * 0.26, cuf);
    P.cercle(fx - T * 0.015, fy - T * 0.015, T * 0.245, cu);
    P.cercle(fx, fy, T * 0.195, pal.blanc);
    for (let i = 0; i < 12; i++) {
      const b = (i / 12) * TAU, rr = i % 3 ? T * 0.012 : T * 0.022;
      P.cercle(fx + Math.cos(b) * T * 0.155, fy + Math.sin(b) * T * 0.155, rr, i % 3 ? '#b9b2c4' : cuf);
    }
    const d0 = r() * TAU, am = d0 + t * TAU / 20, ah = d0 * 0.5 + t * TAU / 240;
    P.trait([['M', fx, fy], ['L', fx + Math.sin(ah) * T * 0.09, fy - Math.cos(ah) * T * 0.09]], '#3e3a48', T * 0.032);
    P.trait([['M', fx, fy], ['L', fx + Math.sin(am) * T * 0.14, fy - Math.cos(am) * T * 0.14]], '#3e3a48', T * 0.022);
    P.cercle(fx, fy, T * 0.026, cuf);
  }

  function antenne(P, cx, by, T, pal, t, r) {
    ombre(P, cx, by, T, 0.32, pal);
    for (const k of [-1, 1]) P.trait([['M', cx, by - T * 0.48], ['L', cx + k * T * 0.2, by - T * 0.1]], pal.rocheFonce, T * 0.05);
    P.boite(cx - T * 0.04, by - T * 0.8, T * 0.08, T * 0.7, T * 0.035, pal.falaiseFonce);
    const ang = -0.45 + Math.sin(t * 0.6 + r() * 6) * 0.25, ctx = P.ctx;
    ctx.save();
    ctx.translate(cx, by - T * 0.86); ctx.rotate(ang);
    P.ellipse(0, 0, T * 0.32, T * 0.17, pal.rocheFonce);
    P.ellipse(0, -T * 0.025, T * 0.29, T * 0.13, pal.rocheClair);
    P.ellipse(0, -T * 0.01, T * 0.17, T * 0.07, pal.roche);
    P.trait([['M', 0, 0], ['L', 0, -T * 0.24]], pal.falaiseFonce, T * 0.03);
    P.cercle(0, -T * 0.26, T * 0.045, (t % 1.6) < 0.8 ? pal.accent : fonce(pal.accent, 0.35));
    ctx.restore();
  }

  function dessinerObjet(ctx, c, cx, by, T, pal, t, graine) {
    pal = palette(pal);
    t = t || 0;
    const P = crayon(ctx), r = hasard(graine);
    switch (c) {
      case 'T': arbre(P, cx, by, T, pal, r); break;
      case 'R': rocher(P, cx, by, T, pal, r); break;
      case 'C': cristal(P, cx, by, T, pal, r); break;
      case 'H': maison(P, cx, by, T, pal, r); break;
      case 'X': barriere(P, cx, by, T, pal, r); break;
      case 'P': porteZone(P, cx, by, T, pal); break;
      case 'M': {
        const s = pal.special;
        if (s === 'cadeaux') cadeaux(P, cx, by, T, pal, r);
        else if (s === 'etal') etal(P, cx, by, T, pal, r);
        else if (s === 'horloge') horloge(P, cx, by, T, pal, t, r);
        else if (s === 'antenne') antenne(P, cx, by, T, pal, t, r);
        else cactus(P, cx, by, T * 1.12, pal, r);
        break;
      }
      default: rocher(P, cx, by, T, pal, r);
    }
  }

  // ---------------------------------------------------------------------------
  // Habitants : 6 espèces, couleur principale + accessoire (même dessin sur canvas et en SVG)
  // ---------------------------------------------------------------------------
  const ENCRE = '#2d2a32';
  const distance = (a, b) => { const p = versRgb(valide(a)), q = versRgb(valide(b)); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };

  function visage(P, cx, y, ec, T, c, o) {
    const joue = melange(c, '#f47c9a', 0.5);
    if (!o.sansJoues) for (const k of [-1, 1]) P.ellipse(cx + k * (ec + T * 0.055), y + T * 0.065, T * 0.045, T * 0.027, joue);
    for (const k of [-1, 1]) {
      const x = cx + k * ec;
      if (o.ferme) P.trait([['M', x - T * 0.04, y + T * 0.005], ['Q', x, y - T * 0.03, x + T * 0.04, y + T * 0.005]], o.yeux || ENCRE, T * 0.024);
      else {
        P.ellipse(x, y, T * 0.047, T * 0.06, o.yeux || ENCRE);
        P.cercle(x - T * 0.015 + (o.regard || 0) * T * 0.01, y - T * 0.022, T * 0.019, '#ffffff');
        P.cercle(x + T * 0.016, y + T * 0.022, T * 0.008, '#ffffff');
      }
    }
    if (!o.sansBouche) P.trait([['M', cx - T * 0.045, y + T * 0.08], ['Q', cx, y + T * 0.125, cx + T * 0.045, y + T * 0.08]], o.yeux || ENCRE, T * 0.024);
  }

  function etoileChemin(cx, cy, R, r, rot = -Math.PI / 2) {
    const pts = [];
    for (let i = 0; i < 10; i++) { const a = rot + (i / 10) * TAU, d = i % 2 ? r : R; pts.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d]); }
    const lerp = (p, q, s) => [p[0] + (q[0] - p[0]) * s, p[1] + (q[1] - p[1]) * s];
    const d = [];
    for (let i = 0; i < 10; i++) {
      const p = pts[i], av = pts[(i + 9) % 10], ap = pts[(i + 1) % 10], s = i % 2 ? 0.16 : 0.3;
      const A = lerp(p, av, s), B = lerp(p, ap, s);
      d.push([i ? 'L' : 'M', ...A], ['Q', ...p, ...B]);
    }
    d.push(['Z']);
    return d;
  }

  function corps(P, esp, c, cx, by, T, t, o) {
    const cf = fonce(c, 0.2), cc = clair(c, 0.5);
    switch (esp) {
      case 'antenne': {
        const b = Math.sin(t * 2.2 + (o.graine || 0)) * T * 0.015, boule = melange(c, '#ffe08a', 0.65);
        for (const k of [-1, 1]) {
          P.trait([['M', cx + k * T * 0.07, by - T * 0.74], ['Q', cx + k * T * 0.1, by - T * 0.88, cx + k * T * 0.18, by - T * 0.96 + b * k]], cf, T * 0.032);
          P.cercle(cx + k * T * 0.18, by - T * 0.96 + b * k, T * 0.052, boule);
        }
        for (const k of [-1, 1]) P.ellipse(cx + k * T * 0.1, by - T * 0.065, T * 0.075, T * 0.045, cf);
        for (const k of [-1, 1]) P.ellipse(cx + k * T * 0.215, by - T * 0.4, T * 0.05, T * 0.1, cf, k * 0.45);
        P.boite(cx - T * 0.19, by - T * 0.79, T * 0.42, T * 0.72, T * 0.21, cf);
        P.boite(cx - T * 0.215, by - T * 0.8, T * 0.4, T * 0.71, T * 0.2, c);
        P.ellipse(cx - T * 0.015, by - T * 0.27, T * 0.13, T * 0.15, cc);
        return { tete: by - T * 0.79, lt: T * 0.17, yeux: by - T * 0.56, ec: T * 0.085, cou: by - T * 0.45, lc: T * 0.205, ventre: by - T * 0.42, lv: T * 0.15, bas: by - T * 0.13, marque: by - T * 1.22 };
      }
      case 'robot': {
        const allume = o.svg || (t % 2.4) < 1.6;
        P.trait([['M', cx, by - T * 0.76], ['L', cx, by - T * 0.88]], cf, T * 0.03);
        P.cercle(cx, by - T * 0.9, T * 0.045, allume ? '#ff9a76' : melange('#ff9a76', cf, 0.5));
        for (const k of [-1, 1]) P.boite(cx + k * T * 0.12 - T * 0.065, by - T * 0.13, T * 0.13, T * 0.09, T * 0.035, fonce(c, 0.38));
        P.boite(cx - T * 0.27, by - T * 0.77, T * 0.57, T * 0.66, T * 0.14, cf);
        P.boite(cx - T * 0.29, by - T * 0.78, T * 0.55, T * 0.65, T * 0.13, c);
        P.boite(cx - T * 0.21, by - T * 0.69, T * 0.4, T * 0.29, T * 0.08, '#34405a');
        const ecran = '#8ff0c8';
        visage(P, cx - T * 0.01, by - T * 0.56, T * 0.085, T, c, { ...o, yeux: ecran, sansJoues: true });
        P.boite(cx - T * 0.12, by - T * 0.34, T * 0.22, T * 0.13, T * 0.04, cc);
        P.cercle(cx - T * 0.06, by - T * 0.275, T * 0.022, '#ef7b5a');
        P.cercle(cx + T * 0.03, by - T * 0.275, T * 0.022, '#e9b949');
        for (const k of [-1, 1]) P.cercle(cx - T * 0.01 + k * T * 0.225, by - T * 0.42, T * 0.022, cc);
        return { tete: by - T * 0.78, lt: T * 0.22, yeux: by - T * 0.56, ec: T * 0.085, cou: by - T * 0.4, lc: T * 0.28, ventre: by - T * 0.39, lv: T * 0.2, bas: by - T * 0.13, marque: by - T * 1.14, visageFait: true };
      }
      case 'plume': {
        const bec = '#f2a54a', battement = Math.sin(t * 3 + (o.graine || 0)) * 0.12;
        for (const k of [-1, 1]) P.ellipse(cx + k * T * 0.08, by - T * 0.055, T * 0.065, T * 0.032, bec);
        for (const [ox, a] of [[-0.06, -0.45], [0, 0], [0.06, 0.45]]) P.ellipse(cx + T * ox, by - T * 0.71, T * 0.035, T * 0.085, cf, a);
        for (const k of [-1, 1]) P.ellipse(cx + k * T * 0.27, by - T * 0.35, T * 0.075, T * 0.14, cf, k * (0.35 + battement));
        P.ellipse(cx + T * 0.02, by - T * 0.36, T * 0.29, T * 0.31, cf);
        P.ellipse(cx - T * 0.005, by - T * 0.375, T * 0.28, T * 0.3, c);
        P.ellipse(cx, by - T * 0.23, T * 0.18, T * 0.14, cc);
        visage(P, cx, by - T * 0.47, T * 0.1, T, c, { ...o, sansBouche: true });
        P.forme([['M', cx - T * 0.05, by - T * 0.395], ['L', cx, by - T * 0.43], ['L', cx + T * 0.05, by - T * 0.395], ['L', cx, by - T * 0.33], ['Z']], bec);
        P.forme([['M', cx - T * 0.05, by - T * 0.395], ['L', cx, by - T * 0.43], ['L', cx + T * 0.05, by - T * 0.395], ['Z']], '#f8c879');
        return { tete: by - T * 0.68, lt: T * 0.18, yeux: by - T * 0.47, ec: T * 0.1, cou: by - T * 0.3, lc: T * 0.27, ventre: by - T * 0.3, lv: T * 0.15, bas: by - T * 0.1, marque: by - T * 1.08, visageFait: true };
      }
      case 'champi': {
        const pied = '#f3e6d2', piedF = '#e2cfb3';
        for (const k of [-1, 1]) P.ellipse(cx + k * T * 0.09, by - T * 0.06, T * 0.075, T * 0.045, melange(piedF, c, 0.25));
        P.boite(cx - T * 0.19, by - T * 0.58, T * 0.38, T * 0.52, [T * 0.12, T * 0.12, T * 0.18, T * 0.18], piedF);
        P.boite(cx - T * 0.2, by - T * 0.59, T * 0.35, T * 0.51, [T * 0.12, T * 0.12, T * 0.17, T * 0.17], pied);
        const chapeau = (k, dx, dy, coul) => P.forme([['M', cx - T * 0.42 * k + dx, by - T * 0.53 + dy], ['C', cx - T * 0.42 * k + dx, by - T * 1.1 * k + dy, cx + T * 0.42 * k + dx, by - T * 1.1 * k + dy, cx + T * 0.42 * k + dx, by - T * 0.53 + dy], ['Q', cx + dx, by - T * 0.45 + dy, cx - T * 0.42 * k + dx, by - T * 0.53 + dy], ['Z']], coul);
        chapeau(1, 0, 0, cf);
        chapeau(0.92, -T * 0.03, -T * 0.025, c);
        for (const [ox, oy, rr] of [[-0.2, 0.74, 0.06], [0.05, 0.88, 0.07], [0.25, 0.68, 0.045], [-0.04, 0.66, 0.035]]) P.cercle(cx + T * ox, by - T * oy, T * rr, '#fbf7ef');
        return { tete: by - T * 0.93, lt: T * 0.2, yeux: by - T * 0.36, ec: T * 0.085, cou: by - T * 0.5, lc: T * 0.19, ventre: by - T * 0.25, lv: T * 0.13, bas: by - T * 0.09, marque: by - T * 1.3 };
      }
      case 'etoile': {
        for (const k of [-1, 1]) P.ellipse(cx + k * T * 0.2, by - T * 0.08, T * 0.07, T * 0.04, cf);
        P.forme(etoileChemin(cx + T * 0.02, by - T * 0.4, T * 0.4, T * 0.235), cf);
        P.forme(etoileChemin(cx, by - T * 0.415, T * 0.39, T * 0.23), c);
        P.ellipse(cx, by - T * 0.31, T * 0.12, T * 0.085, cc);
        return { tete: by - T * 0.8, lt: T * 0.1, yeux: by - T * 0.46, ec: T * 0.085, cou: by - T * 0.33, lc: T * 0.2, ventre: by - T * 0.36, lv: T * 0.12, bas: by - T * 0.17, marque: by - T * 1.18 };
      }
      default: {                                                         // bulle
        for (const k of [-1, 1]) P.ellipse(cx + k * T * 0.11, by - T * 0.065, T * 0.08, T * 0.048, cf);
        P.trait([['M', cx, by - T * 0.66], ['Q', cx + T * 0.01, by - T * 0.76, cx + T * 0.08, by - T * 0.78]], cf, T * 0.035);
        P.cercle(cx + T * 0.025, by - T * 0.37, T * 0.3, cf);
        P.cercle(cx - T * 0.01, by - T * 0.385, T * 0.29, c);
        P.ellipse(cx, by - T * 0.24, T * 0.17, T * 0.1, cc);
        return { tete: by - T * 0.67, lt: T * 0.19, yeux: by - T * 0.43, ec: T * 0.1, cou: by - T * 0.27, lc: T * 0.26, ventre: by - T * 0.3, lv: T * 0.16, bas: by - T * 0.11, marque: by - T * 1.02 };
      }
    }
  }

  function accessoire(P, acc, g, c, cx, T) {
    switch (acc) {
      case 'chapeau':
        P.ellipse(cx, g.tete + T * 0.015, g.lt + T * 0.09, T * 0.05, '#46527f');
        P.boite(cx - T * 0.13, g.tete - T * 0.2, T * 0.26, T * 0.21, [T * 0.07, T * 0.07, T * 0.02, T * 0.02], '#5a69a1');
        P.rect(cx - T * 0.13, g.tete - T * 0.075, T * 0.26, T * 0.05, '#ef7b5a');
        break;
      case 'casquette':
        P.ellipse(cx + T * 0.13, g.tete + T * 0.035, T * 0.13, T * 0.04, '#1f7a6f');
        P.forme([['M', cx - T * 0.18, g.tete + T * 0.05], ['C', cx - T * 0.18, g.tete - T * 0.15, cx + T * 0.18, g.tete - T * 0.15, cx + T * 0.18, g.tete + T * 0.05], ['Z']], '#2a9d8f');
        P.cercle(cx, g.tete - T * 0.1, T * 0.025, '#1f7a6f');
        break;
      case 'couronne': {
        const y = g.tete + T * 0.01;
        P.forme([['M', cx - T * 0.15, y], ['L', cx - T * 0.16, y - T * 0.15], ['L', cx - T * 0.08, y - T * 0.08], ['L', cx, y - T * 0.19], ['L', cx + T * 0.08, y - T * 0.08], ['L', cx + T * 0.16, y - T * 0.15], ['L', cx + T * 0.15, y], ['Z']], '#e9b949');
        P.boite(cx - T * 0.16, y - T * 0.05, T * 0.32, T * 0.065, T * 0.02, '#c7962a');
        P.cercle(cx, y - T * 0.19, T * 0.025, '#ef7b5a');
        P.cercle(cx - T * 0.16, y - T * 0.15, T * 0.02, '#2a9d8f');
        P.cercle(cx + T * 0.16, y - T * 0.15, T * 0.02, '#2a9d8f');
        break;
      }
      case 'noeud': {
        const coul = distance(c, '#ef7b5a') < 90 ? '#7b6ee6' : '#ef7b5a';
        const x = cx + g.lt * 0.75, y = g.tete + T * 0.05;
        P.ellipse(x - T * 0.065, y, T * 0.075, T * 0.05, coul, -0.45);
        P.ellipse(x + T * 0.065, y, T * 0.075, T * 0.05, coul, 0.45);
        P.cercle(x, y, T * 0.032, fonce(coul, 0.15));
        break;
      }
      case 'lunettes': {
        for (const k of [-1, 1]) {
          P.cercle(cx + k * g.ec, g.yeux, T * 0.068, 'rgba(255,255,255,0.28)');
          P.anneau(cx + k * g.ec, g.yeux, T * 0.068, '#3e3a48', T * 0.022);
        }
        P.trait([['M', cx - g.ec + T * 0.068, g.yeux], ['Q', cx, g.yeux - T * 0.03, cx + g.ec - T * 0.068, g.yeux]], '#3e3a48', T * 0.02);
        break;
      }
      case 'echarpe': {
        const coul = distance(c, '#e9b949') < 90 ? '#2a9d8f' : '#e9b949', rayure = fonce(coul, 0.18);
        P.boite(cx + g.lc * 0.3, g.cou, T * 0.09, T * 0.2, T * 0.04, rayure);
        P.boite(cx - g.lc, g.cou - T * 0.045, g.lc * 2, T * 0.095, T * 0.047, coul);
        for (const k of [-0.5, 0, 0.5]) P.rect(cx + g.lc * k - T * 0.012, g.cou - T * 0.045, T * 0.024, T * 0.095, rayure);
        break;
      }
      case 'tablier': {
        const h = g.bas - g.ventre;
        P.trait([['M', cx - g.lv * 0.75, g.ventre + T * 0.01], ['L', cx - g.lv * 0.55, g.ventre - T * 0.07]], '#fbf7ef', T * 0.025);
        P.trait([['M', cx + g.lv * 0.75, g.ventre + T * 0.01], ['L', cx + g.lv * 0.55, g.ventre - T * 0.07]], '#fbf7ef', T * 0.025);
        P.boite(cx - g.lv, g.ventre, g.lv * 2, h, [T * 0.03, T * 0.03, T * 0.07, T * 0.07], '#fbf7ef');
        P.boite(cx - T * 0.065, g.ventre + h * 0.42, T * 0.13, h * 0.32, T * 0.025, '#ece2d0');
        break;
      }
      default:
    }
  }

  function habitant(P, a, cx, by, T, t, o = {}) {
    a = a || {};
    const c = valide(a.couleur), esp = a.espece || 'bulle';
    const ferme = !o.svg && ((t + (o.graine || 0) % 7) % 4.3) < 0.13;
    const opts = { ...o, ferme };
    const g = corps(P, esp, c, cx, by, T, t, opts);
    if (!g.visageFait) visage(P, cx, g.yeux, g.ec, T, c, opts);
    if (a.accessoire) accessoire(P, a.accessoire, g, c, cx, T);
    return g;
  }

  function marque(P, m, cx, y, T, t) {
    if (!m) return;
    const ok = m === 'ok', yy = y + (ok ? 0 : Math.sin(t * 3.2) * T * 0.03);
    const fondB = ok ? '#2a9d8f' : '#fbf7ef', bord = ok ? '#1f7a6f' : '#e3d9c8';
    P.forme([['M', cx - T * 0.06, yy + T * 0.12], ['L', cx + T * 0.06, yy + T * 0.12], ['L', cx, yy + T * 0.23], ['Z']], bord);
    P.cercle(cx, yy + T * 0.025, T * 0.17, bord);
    P.forme([['M', cx - T * 0.06, yy + T * 0.1], ['L', cx + T * 0.06, yy + T * 0.1], ['L', cx, yy + T * 0.2], ['Z']], fondB);
    P.cercle(cx, yy, T * 0.17, fondB);
    if (ok) P.trait([['M', cx - T * 0.075, yy + T * 0.005], ['L', cx - T * 0.018, yy + T * 0.06], ['L', cx + T * 0.08, yy - T * 0.06]], '#fbf7ef', T * 0.05);
    else {
      P.boite(cx - T * 0.03, yy - T * 0.115, T * 0.06, T * 0.135, T * 0.03, '#ef7b5a');
      P.cercle(cx, yy + T * 0.08, T * 0.034, '#ef7b5a');
    }
  }

  // ---------------------------------------------------------------------------
  // Coffre, panneau, fusée
  // ---------------------------------------------------------------------------
  function etincelle(P, x, y, s, coul) {
    P.forme([['M', x, y - s], ['Q', x, y, x + s, y], ['Q', x, y, x, y + s], ['Q', x, y, x - s, y], ['Q', x, y, x, y - s], ['Z']], coul);
  }

  function coffre(P, ouvert, cx, by, T, pal, t) {
    const b = pal.bois, bf = pal.boisFonce, or = COMMUN.or, orf = COMMUN.orFonce;
    ombre(P, cx, by, T, 0.38, pal, 0.26);
    if (ouvert) {
      P.boite(cx - T * 0.33, by - T * 0.86, T * 0.66, T * 0.24, [T * 0.1, T * 0.1, T * 0.03, T * 0.03], fonce(bf, 0.12));
      P.boite(cx - T * 0.29, by - T * 0.82, T * 0.58, T * 0.17, [T * 0.08, T * 0.08, T * 0.02, T * 0.02], '#6b4a35');
    }
    P.boite(cx - T * 0.33, by - T * 0.52, T * 0.66, T * 0.42, [T * 0.04, T * 0.04, T * 0.08, T * 0.08], b);
    P.boite(cx - T * 0.33, by - T * 0.22, T * 0.66, T * 0.12, [0, 0, T * 0.08, T * 0.08], bf);
    if (ouvert) {
      P.boite(cx - T * 0.29, by - T * 0.58, T * 0.58, T * 0.1, T * 0.03, '#5a3d2a');
      for (const [ox, oy] of [[-0.14, 0.58], [0.0, 0.63], [0.13, 0.57], [-0.05, 0.55]]) { P.cercle(cx + T * ox, by - T * oy, T * 0.065, orf); P.cercle(cx + T * ox - T * 0.008, by - T * oy - T * 0.008, T * 0.055, or); }
      P.forme([['M', cx + T * 0.2, by - T * 0.7], ['L', cx + T * 0.26, by - T * 0.62], ['L', cx + T * 0.2, by - T * 0.54], ['L', cx + T * 0.14, by - T * 0.62], ['Z']], pal.cristal);
      const s = 0.6 + 0.4 * Math.sin(t * 4);
      etincelle(P, cx - T * 0.22, by - T * 0.8, T * 0.05 * s, '#ffffff');
      etincelle(P, cx + T * 0.3, by - T * 0.9, T * 0.04 * (1.4 - s), '#ffffff');
    } else {
      P.boite(cx - T * 0.35, by - T * 0.72, T * 0.7, T * 0.25, [T * 0.12, T * 0.12, T * 0.03, T * 0.03], clair(b, 0.08));
      P.boite(cx - T * 0.35, by - T * 0.53, T * 0.7, T * 0.06, T * 0.02, bf);
    }
    for (const k of [-0.2, 0.2]) P.rect(cx + T * k - T * 0.03, ouvert ? by - T * 0.52 : by - T * 0.72, T * 0.06, ouvert ? T * 0.42 : T * 0.62, or);
    if (!ouvert) {
      P.boite(cx - T * 0.065, by - T * 0.56, T * 0.13, T * 0.15, T * 0.035, or);
      P.cercle(cx, by - T * 0.5, T * 0.022, orf);
    }
  }

  function panneau(P, cx, by, T, pal) {
    ombre(P, cx, by, T, 0.26, pal, 0.26);
    P.boite(cx - T * 0.045, by - T * 0.62, T * 0.09, T * 0.54, T * 0.03, pal.boisFonce);
    P.boite(cx - T * 0.34, by - T * 0.9, T * 0.68, T * 0.36, T * 0.07, pal.boisFonce);
    P.boite(cx - T * 0.34, by - T * 0.92, T * 0.68, T * 0.33, T * 0.07, pal.bois);
    for (const [y, l] of [[0.84, 0.42], [0.76, 0.34], [0.68, 0.38]]) P.boite(cx - T * 0.22, by - T * y, T * l, T * 0.035, T * 0.0175, pal.boisFonce);
    for (const k of [-1, 1]) P.cercle(cx + k * T * 0.27, by - T * 0.86, T * 0.018, pal.boisFonce);
  }

  function fusee(P, cx, by, T, pal) {
    const coque = '#f4efe6', coqueF = '#e0d8cb', ac = pal.accent || '#ef7b5a', acf = fonce(ac, 0.18), metal = '#8f97aa';
    ombre(P, cx, by, T, 0.5, pal, 0.28);
    for (const k of [-1, 1]) {
      P.trait([['M', cx + k * T * 0.18, by - T * 0.55], ['L', cx + k * T * 0.36, by - T * 0.12]], metal, T * 0.06);
      P.ellipse(cx + k * T * 0.37, by - T * 0.1, T * 0.08, T * 0.035, fonce(metal, 0.15));
    }
    P.forme([['M', cx - T * 0.22, by - T * 0.95], ['Q', cx - T * 0.52, by - T * 0.66, cx - T * 0.47, by - T * 0.26], ['L', cx - T * 0.2, by - T * 0.42], ['Z']], ac);
    P.forme([['M', cx + T * 0.22, by - T * 0.95], ['Q', cx + T * 0.52, by - T * 0.66, cx + T * 0.47, by - T * 0.26], ['L', cx + T * 0.2, by - T * 0.42], ['Z']], acf);
    P.boite(cx - T * 0.15, by - T * 0.36, T * 0.3, T * 0.14, T * 0.05, metal);
    const corpsF = [['M', cx - T * 0.27, by - T * 0.32], ['C', cx - T * 0.32, by - T * 1.2, cx - T * 0.2, by - T * 1.85, cx, by - T * 2.2], ['C', cx + T * 0.2, by - T * 1.85, cx + T * 0.32, by - T * 1.2, cx + T * 0.27, by - T * 0.32], ['Q', cx, by - T * 0.24, cx - T * 0.27, by - T * 0.32], ['Z']];
    P.forme(corpsF, coque);
    P.forme([['M', cx + T * 0.08, by - T * 2.05], ['C', cx + T * 0.22, by - T * 1.8, cx + T * 0.32, by - T * 1.2, cx + T * 0.27, by - T * 0.32], ['Q', cx + T * 0.2, by - T * 0.27, cx + T * 0.13, by - T * 0.265], ['C', cx + T * 0.18, by - T * 1.1, cx + T * 0.16, by - T * 1.7, cx + T * 0.08, by - T * 2.05], ['Z']], coqueF);
    P.forme([['M', cx - T * 0.18, by - T * 1.74], ['Q', cx - T * 0.1, by - T * 2.04, cx, by - T * 2.2], ['Q', cx + T * 0.1, by - T * 2.04, cx + T * 0.18, by - T * 1.74], ['Q', cx, by - T * 1.67, cx - T * 0.18, by - T * 1.74], ['Z']], ac);
    P.boite(cx - T * 0.28, by - T * 0.62, T * 0.56, T * 0.09, T * 0.045, pal.accent2 || COMMUN.or);
    P.cercle(cx, by - T * 1.26, T * 0.16, '#cfc6b8');
    P.cercle(cx, by - T * 1.26, T * 0.115, '#8ecae6');
    P.ellipse(cx - T * 0.04, by - T * 1.3, T * 0.045, T * 0.028, '#d6f0fa', -0.6);
    P.forme(etoileChemin(cx, by - T * 0.88, T * 0.075, T * 0.034), pal.accent2 || COMMUN.or);
    P.ellipse(cx, by - T * 0.4, T * 0.05, T * 0.2, acf);
  }

  function dessinerEntite(ctx, ent, cx, by, T, pal, t) {
    pal = palette(pal);
    t = t || 0;
    const P = crayon(ctx);
    if (!ent) return;
    if (ent.type === 'pnj') {
      const graine = hacher(String(ent.id || '') + (ent.apparence && ent.apparence.couleur)), Te = T * 1.1;
      ombre(P, cx, by, Te, 0.3, pal, 0.3);
      const g = habitant(P, ent.apparence, cx, by, Te, t, { graine: (graine % 1000) / 100 });
      marque(P, ent.marque, cx, g.marque, T, t);
    } else if (ent.type === 'coffre') coffre(P, !!ent.ouvert, cx, by, T, pal, t);
    else if (ent.type === 'panneau') panneau(P, cx, by, T, pal);
    else if (ent.type === 'fusee') fusee(P, cx, by, T, pal);
    else ombre(P, cx, by, T, 0.3, pal);
    if (ent.type !== 'pnj' && ent.marque) marque(P, ent.marque, cx, by - T * 1.2, T, t);
  }

  // ---------------------------------------------------------------------------
  // Alvin dans le monde (vue de dessus 3/4, proportions « chibi »)
  // ---------------------------------------------------------------------------
  const AL = {
    gris: '#9aa4af', grisF: '#86909c', rayure: '#5f6874', yeux: '#3fcf72', pupille: '#1d2b26', nez: '#f08aa0', oreille: '#f4a9bb',
    museau: '#c9d0d8', combi: '#f6f7f9', combiF: '#d3d9e1', semelle: '#b9c1cc', ecusson: '#f08a3c', col: '#cfd6df', sac: '#e3e7ed',
  };

  function queueAlvin(P, x0, y0, x1, y1, cxq, cyq, T) {
    const ctx = P.ctx, d = [['M', x0, y0], ['Q', cxq, cyq, x1, y1]];
    P.trait(d, AL.gris, T * 0.075);
    ctx.save();
    ctx.setLineDash([T * 0.035, T * 0.055]);
    ctx.lineDashOffset = -T * 0.04;
    P.trait(d, AL.rayure, T * 0.075);
    ctx.restore();
    P.cercle(x1, y1, T * 0.037, AL.rayure);
  }

  function teteAlvin(P, cx, hy, T, vue, t) {
    const r = T * 0.232;
    const cligne = ((t + 1.3) % 3.9) < 0.12;
    const oreille = (s, bx1, tx, ty, bx2, interieur) => {
      P.forme([['M', cx + s * bx1, hy - T * 0.05], ['L', cx + s * (tx - 0.01 * T), ty + T * 0.03], ['Q', cx + s * tx, ty - T * 0.01, cx + s * (tx + 0.035 * T), ty + T * 0.02], ['L', cx + s * bx2, hy - T * 0.19], ['Z']], AL.gris);
      if (interieur) P.forme([['M', cx + s * (bx1 - 0.03 * T), hy - T * 0.1], ['L', cx + s * (tx + 0.002 * T), ty + T * 0.06], ['L', cx + s * (bx2 + 0.05 * T), hy - T * 0.17], ['Z']], interieur);
    };
    if (vue === 'gauche') {
      oreille(1, T * 0.06, T * 0.1, hy - T * 0.27, T * 0.21, AL.grisF);
      oreille(-1, T * 0.2, T * 0.12, hy - T * 0.28, -T * 0.02, AL.oreille);
    } else {
      for (const s of [-1, 1]) oreille(s, T * 0.21, T * 0.16, hy - T * 0.28, T * 0.04, vue === 'haut' ? AL.grisF : AL.oreille);
    }
    P.cercle(cx + T * 0.012, hy + T * 0.01, r, AL.grisF);
    P.cercle(cx - T * 0.004, hy - T * 0.004, r * 0.97, AL.gris);
    const raie = (x1, y1, x2, y2) => P.trait([['M', cx + x1 * T, hy + y1 * T], ['L', cx + x2 * T, hy + y2 * T]], AL.rayure, T * 0.034);
    if (vue === 'haut') {                                            // l'arrière de la tête : rayures de chat tigré
      raie(0, -0.215, 0, -0.08);
      for (const s of [-1, 1]) {
        raie(s * 0.075, -0.2, s * 0.06, -0.1);
        raie(s * 0.215, -0.05, s * 0.12, -0.02);
        raie(s * 0.21, 0.05, s * 0.12, 0.055);
        raie(s * 0.15, 0.14, s * 0.08, 0.12);
      }
      raie(0, 0.06, 0, 0.17);
      return;
    }
    const dx = vue === 'gauche' ? -T * 0.06 : 0;
    if (vue === 'gauche') {
      raie(0.06, -0.2, 0.06, -0.12); raie(0.13, -0.15, 0.1, -0.08);
      raie(0.2, -0.04, 0.13, -0.02); raie(0.2, 0.05, 0.13, 0.05);
    } else {
      raie(0, -0.215, 0, -0.14); raie(-0.07, -0.2, -0.055, -0.135); raie(0.07, -0.2, 0.055, -0.135);
      for (const s of [-1, 1]) { raie(s * 0.225, -0.005, s * 0.165, 0.005); raie(s * 0.215, 0.06, s * 0.165, 0.055); }
    }
    P.ellipse(cx + dx * 1.3, hy + T * 0.095, T * (vue === 'gauche' ? 0.085 : 0.095), T * 0.06, AL.museau);
    const oeil = (x, rx) => {
      if (cligne) { P.trait([['M', x - rx, hy + T * 0.005], ['Q', x, hy + T * 0.03, x + rx, hy + T * 0.005]], AL.rayure, T * 0.022); return; }
      P.ellipse(x, hy, rx, T * 0.064, AL.yeux);
      P.ellipse(x + dx * 0.15, hy + T * 0.004, rx * 0.4, T * 0.045, AL.pupille);
      P.cercle(x - rx * 0.32, hy - T * 0.024, T * 0.015, '#ffffff');
    };
    if (vue === 'gauche') { oeil(cx - T * 0.11, T * 0.05); oeil(cx + T * 0.03, T * 0.042); }
    else { oeil(cx - T * 0.085, T * 0.054); oeil(cx + T * 0.085, T * 0.054); }
    const nx = cx + dx * 1.6;
    P.forme([['M', nx - T * 0.026, hy + T * 0.058], ['L', nx + T * 0.026, hy + T * 0.058], ['Q', nx + T * 0.006, hy + T * 0.09, nx, hy + T * 0.09], ['Q', nx - T * 0.006, hy + T * 0.09, nx - T * 0.026, hy + T * 0.058], ['Z']], AL.nez);
    P.trait([['M', nx - T * 0.034, hy + T * 0.11], ['Q', nx - T * 0.017, hy + T * 0.128, nx, hy + T * 0.1], ['Q', nx + T * 0.017, hy + T * 0.128, nx + T * 0.034, hy + T * 0.11]], AL.rayure, T * 0.016);
  }

  function casqueAlvin(P, cx, cy, T) {
    const R = T * 0.335;
    P.cercle(cx, cy, R, 'rgba(226,244,252,0.2)');
    P.anneau(cx, cy, R, 'rgba(236,248,255,0.95)', T * 0.03);
    P.anneau(cx, cy, R - T * 0.02, 'rgba(150,186,208,0.55)', T * 0.01);
    const p = a => [cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8];
    const a1 = Math.PI * 1.12, a2 = Math.PI * 1.36, am = (a1 + a2) / 2, k = 1 / Math.cos((a2 - a1) / 2);
    P.trait([['M', ...p(a1)], ['Q', cx + Math.cos(am) * R * 0.8 * k, cy + Math.sin(am) * R * 0.8 * k, ...p(a2)]], 'rgba(255,255,255,0.9)', T * 0.036);
    P.cercle(...p(Math.PI * 1.46), T * 0.02, 'rgba(255,255,255,0.9)');
  }

  function dessinerAlvin(ctx, cx, by, T, direction, phase, t) {
    t = t || 0;
    T *= 1.12;                                                       // le héros, un peu plus grand que les habitants
    const P = crayon(ctx), marche = phase > 0;
    const pas = marche ? Math.sin(phase * Math.PI) : 0;
    const rebond = marche ? Math.abs(Math.sin(phase * Math.PI)) * T * 0.035 : (Math.sin(t * 2.2) + 1) * T * 0.004;
    const vue = direction === 'haut' ? 'haut' : direction === 'gauche' || direction === 'droite' ? 'gauche' : 'bas';
    P.ellipse(cx, by - T * 0.08, T * 0.23 - rebond * 0.6, T * 0.072, 'rgba(45,42,60,0.2)');
    ctx.save();
    if (direction === 'droite') { ctx.translate(cx, 0); ctx.scale(-1, 1); ctx.translate(-cx, 0); }
    const y0 = by - rebond, sw = Math.sin(t * 3.1) * T * 0.035;
    // pieds
    const botte = (x, y) => { P.ellipse(x, y, T * 0.068, T * 0.048, AL.semelle); P.ellipse(x - T * 0.005, y - T * 0.012, T * 0.06, T * 0.038, AL.combi); };
    if (vue === 'gauche') {
      botte(cx + T * 0.04 + pas * T * 0.08, by - T * 0.075 - Math.max(0, -pas) * T * 0.035);
      botte(cx - T * 0.04 - pas * T * 0.08, by - T * 0.075 - Math.max(0, pas) * T * 0.035);
    } else {
      botte(cx - T * 0.085, by - T * 0.075 - Math.max(0, pas) * T * 0.045);
      botte(cx + T * 0.085, by - T * 0.075 - Math.max(0, -pas) * T * 0.045);
    }
    // queue derrière
    if (vue === 'bas') queueAlvin(P, cx + T * 0.1, y0 - T * 0.15, cx + T * 0.3 + sw, y0 - T * 0.4, cx + T * 0.34, y0 - T * 0.15, T);
    if (vue === 'gauche') queueAlvin(P, cx + T * 0.12, y0 - T * 0.15, cx + T * 0.34 + sw, y0 - T * 0.36, cx + T * 0.36, y0 - T * 0.12, T);
    // bras
    const bras = (x, y, coulBras) => { P.ellipse(x, y, T * 0.05, T * 0.075, coulBras); P.cercle(x, y + T * 0.06, T * 0.034, AL.gris); };
    if (vue === 'gauche') bras(cx + T * 0.06 + pas * T * 0.06, y0 - T * 0.25, AL.combiF);
    else for (const s of [-1, 1]) bras(cx + s * T * 0.175, y0 - T * 0.25 + s * pas * T * 0.025, AL.combi);
    // corps (combinaison)
    P.boite(cx - T * 0.165, y0 - T * 0.39, T * 0.34, T * 0.31, [T * 0.13, T * 0.13, T * 0.1, T * 0.1], AL.combiF);
    P.boite(cx - T * 0.17, y0 - T * 0.395, T * 0.32, T * 0.3, [T * 0.13, T * 0.13, T * 0.1, T * 0.1], AL.combi);
    if (vue === 'haut') {
      P.boite(cx - T * 0.12, y0 - T * 0.4, T * 0.24, T * 0.23, T * 0.06, AL.sac);
      P.rect(cx - T * 0.12, y0 - T * 0.3, T * 0.24, T * 0.04, AL.ecusson);
      for (const s of [-1, 1]) P.cercle(cx + s * T * 0.06, y0 - T * 0.215, T * 0.018, AL.combiF);
    } else {
      const ex = vue === 'gauche' ? cx - T * 0.08 : cx - T * 0.06;
      P.cercle(ex, y0 - T * 0.24, T * 0.045, AL.ecusson);
      P.forme(etoileChemin(ex, y0 - T * 0.243, T * 0.027, T * 0.012), '#fff3e4');
    }
    if (vue === 'gauche') bras(cx - T * 0.02 - pas * T * 0.07, y0 - T * 0.25, AL.combi);
    // queue devant (vue de dos)
    if (vue === 'haut') queueAlvin(P, cx + T * 0.02, y0 - T * 0.12, cx + T * 0.24 + sw, y0 - T * 0.32, cx + T * 0.22, y0 - T * 0.06, T);
    // col, tête, casque
    P.ellipse(cx, y0 - T * 0.38, T * 0.17, T * 0.045, AL.col);
    const hy = y0 - T * 0.6;
    teteAlvin(P, cx, hy, T, vue, t);
    casqueAlvin(P, cx, hy - T * 0.03, T);
    ctx.restore();
  }

  function dessinerCible(ctx, cx, cy, T, t, pal) {
    const P = crayon(ctx), ac = (pal && pal.accent) || '#ef7b5a';
    t = Math.max(0, t || 0);
    const u = Math.min(1, t / 0.25), s = 1 + 2.7 * (u - 1) ** 3 + 1.7 * (u - 1) ** 2;      // petit rebond
    const p = 1 + Math.sin(t * 5) * 0.05;
    ctx.save();
    ctx.translate(cx, cy + T * 0.22);
    ctx.scale(1, 0.5);
    P.anneau(0, 0, T * 0.25 * s * p, ac, T * 0.06);
    P.cercle(0, 0, T * 0.075 * s, ac);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Portraits et vignettes (SVG)
  // ---------------------------------------------------------------------------
  function portraitAlvin(humeur = 'normal') {
    if (typeof Alvin !== 'undefined' && Alvin.svg) {
      try { const s = Alvin.svg(humeur, 'portrait'); if (s) return s; } catch (e) { /* repli ci-dessous */ }
    }
    const P = crayonSvg();
    P.boite(18, 78, 64, 30, 22, AL.combi);
    P.cercle(36, 90, 6, AL.ecusson);
    for (const s of [-1, 1]) P.forme([['M', 50 + s * 30, 42], ['L', 50 + s * 26, 10], ['L', 50 + s * 6, 26], ['Z']], AL.gris);
    P.cercle(50, 48, 30, AL.gris);
    for (const s of [-1, 1]) { P.ellipse(50 + s * 12, 46, 7, 8, AL.yeux); P.ellipse(50 + s * 12, 47, 3, 6, AL.pupille); }
    P.forme([['M', 46, 56], ['L', 54, 56], ['L', 50, 61], ['Z']], AL.nez);
    P.anneau(50, 46, 42, 'rgba(236,248,255,0.95)', 3);
    return P.fin();
  }

  function portraitPNJ(apparence) {
    const P = crayonSvg(), T = 76, cx = 50, by = 95;
    P.ellipse(cx, by - T * 0.07, T * 0.32, T * 0.06, 'rgba(45,42,50,0.12)');
    habitant(P, apparence || {}, cx, by, T, 0, { svg: true });
    return P.fin();
  }

  function vignettePlanete(id) {
    const pal = PALETTES[id] || PALETTES.plusmoins, P = crayonSvg(), r = hasard(hacher(String(id)));
    const cx = 48, cy = 50;
    if (id === 'defi') { P.cercle(84, 20, 9, pal.rocheFonce); P.cercle(83, 19, 8, pal.rocheClair); P.cercle(80, 17, 2, pal.roche); }
    P.cercle(50, 52, 40, melange(pal.sol, pal.falaiseFace, 0.55));
    P.cercle(cx, cy, 37, pal.sol);
    switch (id) {
      case 'paquets':
        P.forme(cmdsTache(40, 58, 15, 10, r, 7, 0.12), pal.eau);
        P.boite(56, 30, 16, 14, 3, pal.accent); P.rect(62.5, 30, 3, 14, pal.blanc); P.rect(56, 35.5, 16, 3, pal.blanc);
        P.cercle(30, 34, 5, pal.vegetal); P.cercle(66, 62, 4, pal.vegetal);
        break;
      case 'marche':
        P.trait([['M', 14, 46], ['Q', 40, 34, 52, 56], ['Q', 60, 72, 80, 70]], pal.eau, 7);
        P.cercle(30, 64, 6, pal.vegetal); P.cercle(62, 30, 6, pal.vegetal); P.cercle(70, 42, 4, pal.vegetalFonce);
        P.rect(38, 22, 14, 5, pal.accent); P.rect(40, 27, 10, 6, pal.bois);
        break;
      case 'tictac': {
        P.forme(cmdsTache(30, 66, 12, 7, r, 6, 0.12), pal.eau);
        P.cercle(56, 42, 15, pal.cuivreFonce); P.cercle(55, 41, 13, pal.cuivre); P.cercle(56, 42, 10, pal.blanc);
        P.trait([['M', 56, 42], ['L', 56, 35]], '#3e3a48', 2.2); P.trait([['M', 56, 42], ['L', 61, 44]], '#3e3a48', 2.2);
        P.forme(etoileChemin(26, 36, 5, 2), pal.vegetalClair === '#f4f8fa' ? '#ffffff' : pal.blanc);
        break;
      }
      case 'defi':
        for (const [x, y, rr] of [[36, 38, 9], [60, 60, 7], [62, 32, 4.5], [32, 64, 5]]) { P.cercle(x, y, rr, pal.solPoint); P.cercle(x + rr * 0.15, y + rr * 0.2, rr * 0.72, pal.sol2); }
        P.forme(etoileChemin(52, 48, 4, 1.8), pal.accent2);
        break;
      default:
        P.trait([['M', 18, 40], ['Q', 34, 32, 50, 40], ['Q', 64, 47, 80, 40]], pal.sol2, 5);
        P.trait([['M', 22, 62], ['Q', 40, 54, 58, 62]], pal.sol2, 5);
        P.forme(cmdsTache(58, 58, 12, 8, r, 7, 0.12), pal.eau);
        P.cercle(40, 30, 5, pal.vegetal); P.cercle(66, 46, 4, pal.vegetal);
    }
    return P.fin();
  }

  return { PALETTES, dessinerSol, dessinerObjet, dessinerEntite, dessinerAlvin, dessinerCible, portraitAlvin, portraitPNJ, vignettePlanete,
    outils: { hasard, melange, fonce, clair, crayonSvg, crayon, cmdsBoite, cmdsTache, etoileChemin, couleursAlvin: AL } };
})();
