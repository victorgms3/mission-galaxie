'use strict';
/*
 * Dessin de secours minimal (aplats) pour tests/moteur.html, utilisé seulement si js/art/art.js est absent.
 * Implémente l'API Art du cahier des charges (§7) avec des formes très simples.
 */
const Art = (() => {
  const TAU = Math.PI * 2;
  const base = { ombre: 'rgba(45,42,50,0.16)', bois: '#b07f52', boisFonce: '#8a5f39', blanc: '#fbf7ef' };
  const PALETTES = {
    plusmoins: { ...base, sol: '#ecd8ad', sol2: '#e4cd9c', chemin: '#f6e9cc', eau: '#72c4c4', eauFonce: '#58aeb0', falaise: '#cf9f72', falaiseFonce: '#ad7d53', vegetal: '#86b46f', vegetalFonce: '#668f52', accent: '#ef7b5a', fond: '#2b2a40', special: 'cactus' },
    paquets: { ...base, sol: '#c4dd9a', sol2: '#b8d48c', chemin: '#efe0b8', eau: '#82c6e2', eauFonce: '#64acca', falaise: '#ad9f8b', falaiseFonce: '#8c7f6c', vegetal: '#5f9f5c', vegetalFonce: '#477f45', accent: '#e8719a', fond: '#262a3f', special: 'cadeaux' },
    marche: { ...base, sol: '#efd2b0', sol2: '#e8c7a2', chemin: '#f7e7cf', eau: '#86c5d8', eauFonce: '#69abc0', falaise: '#c48f74', falaiseFonce: '#a06f56', vegetal: '#93b26a', vegetalFonce: '#738f50', accent: '#e9b949', fond: '#2d2838', special: 'etal' },
    tictac: { ...base, sol: '#cfe0e6', sol2: '#c2d7de', chemin: '#eee6d6', eau: '#7aaee0', eauFonce: '#5d91c6', falaise: '#9aa3b8', falaiseFonce: '#7a8399', vegetal: '#6aa88f', vegetalFonce: '#4f8a73', accent: '#7b6ee6', fond: '#22283a', special: 'horloge' },
    defi: { ...base, sol: '#ddd2ee', sol2: '#d3c6e8', chemin: '#f1e8dc', eau: '#8fb8e8', eauFonce: '#729bd0', falaise: '#a597c2', falaiseFonce: '#8577a3', vegetal: '#7fb09a', vegetalFonce: '#5f907b', accent: '#ef7b5a', fond: '#231f36', special: 'antenne' },
  };
  const hasard = g => { let s = g >>> 0 || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
  const rond = (ctx, x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
  const ellipse = (ctx, x, y, rx, ry, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill(); };
  const boite = (ctx, x, y, l, h, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(x, y, l, h, r); ctx.fill(); };
  const ombre = (ctx, cx, by, T, l = 0.34) => ellipse(ctx, cx, by - T * 0.1, T * l, T * l * 0.32, base.ombre);
  const eauOuPont = c => c === '~' || c === '=' || c === 'B';

  // ---------------------------------------------------------------------------
  // Sol
  // ---------------------------------------------------------------------------
  function dessinerSol(ctx, c, x, y, T, voisin, pal, graine) {
    const r = hasard(graine);
    if (eauOuPont(c)) {
      ctx.fillStyle = pal.eau; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = pal.sol;                                         // berges arrondies
      if (!eauOuPont(voisin(0, -1)) && voisin(0, -1) !== '#') ctx.fillRect(x, y, T, T * 0.12);
      if (!eauOuPont(voisin(0, 1)) && voisin(0, 1) !== '#') ctx.fillRect(x, y + T * 0.9, T, T * 0.1);
      if (!eauOuPont(voisin(-1, 0)) && voisin(-1, 0) !== '#') ctx.fillRect(x, y, T * 0.1, T);
      if (!eauOuPont(voisin(1, 0)) && voisin(1, 0) !== '#') ctx.fillRect(x + T * 0.9, y, T * 0.1, T);
      if (r() < 0.5) boite(ctx, x + T * (0.2 + r() * 0.4), y + T * (0.3 + r() * 0.4), T * 0.18, T * 0.05, T * 0.03, pal.eauFonce);
      if (c === '=' || c === 'B') {
        const horiz = !eauOuPont(voisin(0, -1)) || !eauOuPont(voisin(0, 1)) ? false : true;
        ctx.save();
        if (!horiz) { ctx.translate(x + T / 2, y + T / 2); ctx.rotate(Math.PI / 2); ctx.translate(-x - T / 2, -y - T / 2); }
        const n = 5;
        for (let i = 0; i < n; i++) {
          if (c === 'B' && (i === 2 || i === 3)) continue;
          boite(ctx, x + (i * T) / n + 1, y + T * 0.16, T / n - 2, T * 0.68, 3, i % 2 ? pal.bois : pal.boisFonce);
        }
        ctx.restore();
      }
      return;
    }
    if (c === '#') {
      ctx.fillStyle = pal.falaise; ctx.fillRect(x, y, T, T);
      if (voisin(0, 1) !== '#') { ctx.fillStyle = pal.falaiseFonce; ctx.fillRect(x, y + T * 0.62, T, T * 0.38); }
      if (r() < 0.6) boite(ctx, x + T * r() * 0.6, y + T * (0.15 + r() * 0.3), T * 0.3, T * 0.08, T * 0.04, pal.falaiseFonce);
      return;
    }
    ctx.fillStyle = c === ',' ? pal.sol2 : pal.sol;
    ctx.fillRect(x, y, T, T);
    if (c === ':') {
      const ch = q => q === ':' || q === '=' || q === 'B';
      const m = T * 0.14;
      boite(ctx, x + m, y + m, T - 2 * m, T - 2 * m, T * 0.2, pal.chemin);
      if (ch(voisin(-1, 0))) ctx.fillRect(x, y + m, T / 2, T - 2 * m);
      if (ch(voisin(1, 0))) ctx.fillRect(x + T / 2, y + m, T / 2, T - 2 * m);
      if (ch(voisin(0, -1))) ctx.fillRect(x + m, y, T - 2 * m, T / 2);
      if (ch(voisin(0, 1))) ctx.fillRect(x + m, y + T / 2, T - 2 * m, T / 2);
    } else if (c === 'f') {
      for (let i = 0; i < 4; i++) {
        const fx = x + T * (0.15 + r() * 0.7), fy = y + T * (0.15 + r() * 0.7);
        rond(ctx, fx, fy, T * 0.06, i % 2 ? pal.accent : base.blanc);
        rond(ctx, fx, fy, T * 0.025, '#e9b949');
      }
    } else if (r() < 0.35) {
      rond(ctx, x + T * (0.2 + r() * 0.6), y + T * (0.2 + r() * 0.6), T * 0.03, pal.vegetalFonce);
    }
  }

  // ---------------------------------------------------------------------------
  // Objets hauts
  // ---------------------------------------------------------------------------
  function dessinerObjet(ctx, c, cx, by, T, pal, t, graine) {
    const r = hasard(graine);
    const dx = (r() - 0.5) * T * 0.12;
    if (c === 'T') {
      ombre(ctx, cx, by, T, 0.38);
      boite(ctx, cx - T * 0.07, by - T * 0.5, T * 0.14, T * 0.42, 4, pal.bois);
      rond(ctx, cx + dx, by - T * 0.78, T * (0.36 + r() * 0.06), pal.vegetalFonce);
      rond(ctx, cx + dx - T * 0.06, by - T * 0.84, T * 0.28, pal.vegetal);
    } else if (c === 'R') {
      ombre(ctx, cx, by, T, 0.32);
      ellipse(ctx, cx + dx, by - T * 0.26, T * 0.3, T * 0.22, pal.falaiseFonce);
      ellipse(ctx, cx + dx - T * 0.04, by - T * 0.3, T * 0.22, T * 0.15, pal.falaise);
    } else if (c === 'C') {
      ombre(ctx, cx, by, T, 0.26);
      ctx.fillStyle = '#9b8cf0';
      ctx.beginPath(); ctx.moveTo(cx, by - T * 0.9); ctx.lineTo(cx + T * 0.2, by - T * 0.45); ctx.lineTo(cx, by - T * 0.14); ctx.lineTo(cx - T * 0.2, by - T * 0.45); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c4bbf7';
      ctx.beginPath(); ctx.moveTo(cx, by - T * 0.9); ctx.lineTo(cx - T * 0.2, by - T * 0.45); ctx.lineTo(cx, by - T * 0.4); ctx.closePath(); ctx.fill();
    } else if (c === 'H') {
      ombre(ctx, cx, by, T, 0.46);
      boite(ctx, cx - T * 0.38, by - T * 0.62, T * 0.76, T * 0.54, 8, '#efd9b4');
      ctx.fillStyle = pal.accent;
      ctx.beginPath(); ctx.moveTo(cx - T * 0.48, by - T * 0.58); ctx.quadraticCurveTo(cx, by - T * 1.35, cx + T * 0.48, by - T * 0.58); ctx.closePath(); ctx.fill();
      boite(ctx, cx - T * 0.1, by - T * 0.36, T * 0.2, T * 0.28, 6, pal.boisFonce);
    } else if (c === 'X') {
      ombre(ctx, cx, by, T, 0.42);
      boite(ctx, cx - T * 0.5, by - T * 0.48, T, T * 0.08, 3, pal.bois);
      boite(ctx, cx - T * 0.5, by - T * 0.3, T, T * 0.08, 3, pal.bois);
      for (const k of [-0.32, 0.32]) boite(ctx, cx + k * T - T * 0.05, by - T * 0.6, T * 0.1, T * 0.5, 3, pal.boisFonce);
    } else if (c === 'P') {
      ombre(ctx, cx, by, T, 0.44);
      for (const k of [-0.4, 0.4]) boite(ctx, cx + k * T - T * 0.06, by - T * 0.78, T * 0.12, T * 0.7, 4, pal.boisFonce);
      boite(ctx, cx - T * 0.46, by - T * 0.62, T * 0.92, T * 0.18, 5, base.blanc);
      ctx.fillStyle = pal.accent;
      for (let i = 0; i < 4; i++) ctx.fillRect(cx - T * 0.4 + i * T * 0.22, by - T * 0.62, T * 0.1, T * 0.18);
    } else if (c === 'M') {
      ombre(ctx, cx, by, T, 0.3);
      const s = pal.special;
      if (s === 'cadeaux') {
        boite(ctx, cx - T * 0.3, by - T * 0.42, T * 0.36, T * 0.34, 4, pal.accent);
        boite(ctx, cx - T * 0.02, by - T * 0.66, T * 0.3, T * 0.3, 4, '#7b6ee6');
        ctx.fillStyle = base.blanc; ctx.fillRect(cx - T * 0.14, by - T * 0.42, T * 0.05, T * 0.34); ctx.fillRect(cx + T * 0.11, by - T * 0.66, T * 0.05, T * 0.3);
      } else if (s === 'etal') {
        boite(ctx, cx - T * 0.4, by - T * 0.42, T * 0.8, T * 0.34, 4, pal.bois);
        ctx.fillStyle = pal.accent; ctx.fillRect(cx - T * 0.45, by - T * 0.86, T * 0.9, T * 0.18);
        for (let i = 0; i < 3; i++) rond(ctx, cx - T * 0.22 + i * T * 0.22, by - T * 0.46, T * 0.08, ['#ef7b5a', '#86b46f', '#e9b949'][i]);
      } else if (s === 'horloge') {
        boite(ctx, cx - T * 0.16, by - T * 0.5, T * 0.32, T * 0.42, 4, pal.bois);
        rond(ctx, cx, by - T * 0.72, T * 0.26, pal.boisFonce); rond(ctx, cx, by - T * 0.72, T * 0.2, base.blanc);
        ctx.strokeStyle = '#2d2a32'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, by - T * 0.72); ctx.lineTo(cx, by - T * 0.84); ctx.moveTo(cx, by - T * 0.72); ctx.lineTo(cx + T * 0.08, by - T * 0.72); ctx.stroke();
      } else if (s === 'antenne') {
        boite(ctx, cx - T * 0.05, by - T * 0.7, T * 0.1, T * 0.62, 3, '#8577a3');
        ellipse(ctx, cx, by - T * 0.76, T * 0.26, T * 0.1, '#c9c2e0'); rond(ctx, cx, by - T * 0.92, T * 0.06, pal.accent);
      } else {
        boite(ctx, cx - T * 0.12, by - T * 0.86, T * 0.24, T * 0.78, T * 0.12, pal.vegetal);
        boite(ctx, cx - T * 0.34, by - T * 0.62, T * 0.16, T * 0.3, T * 0.08, pal.vegetal);
        boite(ctx, cx + T * 0.18, by - T * 0.72, T * 0.16, T * 0.3, T * 0.08, pal.vegetal);
        rond(ctx, cx, by - T * 0.86, T * 0.05, pal.accent);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Entités
  // ---------------------------------------------------------------------------
  function bulleMarque(ctx, marque, cx, y, T) {
    if (!marque) return;
    rond(ctx, cx, y, T * 0.17, marque === 'ok' ? '#2a9d8f' : base.blanc);
    ctx.strokeStyle = marque === 'ok' ? base.blanc : '#ef7b5a';
    ctx.lineWidth = T * 0.05; ctx.lineCap = 'round';
    ctx.beginPath();
    if (marque === 'ok') { ctx.moveTo(cx - T * 0.07, y); ctx.lineTo(cx - T * 0.01, y + T * 0.06); ctx.lineTo(cx + T * 0.08, y - T * 0.06); }
    else { ctx.moveTo(cx, y - T * 0.09); ctx.lineTo(cx, y + T * 0.02); ctx.moveTo(cx, y + T * 0.08); ctx.lineTo(cx, y + T * 0.085); }
    ctx.stroke();
  }

  function yeux(ctx, cx, y, T, ecart = 0.1) {
    for (const k of [-1, 1]) { rond(ctx, cx + k * T * ecart, y, T * 0.07, base.blanc); rond(ctx, cx + k * T * ecart, y + T * 0.01, T * 0.035, '#2d2a32'); }
  }

  function dessinerEntite(ctx, ent, cx, by, T, pal, t) {
    if (ent.type === 'pnj') {
      const a = ent.apparence || {}, coul = a.couleur || pal.accent;
      ombre(ctx, cx, by, T, 0.3);
      const yc = by - T * 0.42;
      if (a.espece === 'robot') boite(ctx, cx - T * 0.28, yc - T * 0.3, T * 0.56, T * 0.6, T * 0.14, coul);
      else if (a.espece === 'antenne') {
        ctx.strokeStyle = coul; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx - T * 0.1, yc - T * 0.3); ctx.lineTo(cx - T * 0.16, yc - T * 0.56); ctx.moveTo(cx + T * 0.1, yc - T * 0.3); ctx.lineTo(cx + T * 0.16, yc - T * 0.56); ctx.stroke();
        rond(ctx, cx - T * 0.16, yc - T * 0.56, T * 0.05, coul); rond(ctx, cx + T * 0.16, yc - T * 0.56, T * 0.05, coul);
        ellipse(ctx, cx, yc - T * 0.04, T * 0.24, T * 0.36, coul);
      } else if (a.espece === 'champi') {
        ellipse(ctx, cx, yc + T * 0.08, T * 0.2, T * 0.24, '#f3e6cf');
        ellipse(ctx, cx, yc - T * 0.14, T * 0.36, T * 0.22, coul);
      } else rond(ctx, cx, yc, T * 0.3, coul);
      yeux(ctx, cx, yc + (a.espece === 'champi' ? T * 0.08 : 0), T);
      bulleMarque(ctx, ent.marque, cx, by - T * 1.12, T);
    } else if (ent.type === 'coffre') {
      ombre(ctx, cx, by, T, 0.34);
      boite(ctx, cx - T * 0.3, by - T * 0.48, T * 0.6, T * 0.38, 5, pal.boisFonce);
      if (ent.ouvert) { boite(ctx, cx - T * 0.3, by - T * 0.72, T * 0.6, T * 0.2, 5, pal.bois); rond(ctx, cx, by - T * 0.46, T * 0.1, '#e9b949'); }
      else { boite(ctx, cx - T * 0.32, by - T * 0.6, T * 0.64, T * 0.18, 5, pal.bois); boite(ctx, cx - T * 0.05, by - T * 0.48, T * 0.1, T * 0.12, 2, '#e9b949'); }
    } else if (ent.type === 'panneau') {
      ombre(ctx, cx, by, T, 0.22);
      boite(ctx, cx - T * 0.04, by - T * 0.66, T * 0.08, T * 0.58, 3, pal.boisFonce);
      boite(ctx, cx - T * 0.3, by - T * 0.86, T * 0.6, T * 0.32, 5, pal.bois);
      ctx.fillStyle = pal.boisFonce; ctx.fillRect(cx - T * 0.2, by - T * 0.76, T * 0.4, 2); ctx.fillRect(cx - T * 0.2, by - T * 0.66, T * 0.3, 2);
    } else if (ent.type === 'fusee') {
      ombre(ctx, cx, by, T, 0.42);
      for (const k of [-1, 1]) {
        ctx.fillStyle = pal.accent; ctx.beginPath();
        ctx.moveTo(cx + k * T * 0.2, by - T * 0.6); ctx.lineTo(cx + k * T * 0.42, by - T * 0.12); ctx.lineTo(cx + k * T * 0.16, by - T * 0.2); ctx.closePath(); ctx.fill();
      }
      ellipse(ctx, cx, by - T * 0.9, T * 0.26, T * 0.78, '#eeeae2');
      ctx.fillStyle = pal.accent; ctx.beginPath(); ctx.ellipse(cx, by - T * 1.5, T * 0.15, T * 0.22, 0, 0, TAU); ctx.fill();
      rond(ctx, cx, by - T * 1.0, T * 0.12, '#5a4ec4'); rond(ctx, cx, by - T * 1.0, T * 0.08, '#8ecae6');
    }
  }

  // ---------------------------------------------------------------------------
  // Alvin
  // ---------------------------------------------------------------------------
  function dessinerAlvin(ctx, cx, by, T, direction, phase, t) {
    const pas = phase ? Math.sin(phase * Math.PI * 2) : 0;
    const saut = phase ? Math.abs(pas) * T * 0.05 : 0;
    ombre(ctx, cx, by, T, 0.26);
    ellipse(ctx, cx - T * 0.1, by - T * 0.1 - Math.max(0, pas) * T * 0.04, T * 0.08, T * 0.05, '#d9d4cc');
    ellipse(ctx, cx + T * 0.1, by - T * 0.1 - Math.max(0, -pas) * T * 0.04, T * 0.08, T * 0.05, '#d9d4cc');
    const y = by - saut;
    ellipse(ctx, cx, y - T * 0.3, T * 0.2, T * 0.2, '#f4f1ea');
    rond(ctx, cx, y - T * 0.28, T * 0.06, '#ef7b5a');
    const hy = y - T * 0.66, dx = direction === 'gauche' ? -T * 0.06 : direction === 'droite' ? T * 0.06 : 0;
    ctx.fillStyle = '#9aa4af';
    for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + k * T * 0.24, hy - T * 0.08); ctx.lineTo(cx + k * T * 0.2, hy - T * 0.32); ctx.lineTo(cx + k * T * 0.06, hy - T * 0.2); ctx.closePath(); ctx.fill(); }
    rond(ctx, cx, hy, T * 0.25, '#9aa4af');
    ctx.fillStyle = '#5f6874';
    ctx.fillRect(cx - T * 0.03, hy - T * 0.25, T * 0.06, T * 0.1);
    if (direction !== 'haut') {
      for (const k of [-1, 1]) { rond(ctx, cx + dx + k * T * 0.1, hy, T * 0.065, '#3fcf72'); rond(ctx, cx + dx + k * T * 0.1, hy, T * 0.03, '#23263a'); }
      rond(ctx, cx + dx, hy + T * 0.08, T * 0.03, '#f29bb0');
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, hy - T * 0.02, T * 0.33, 0, TAU); ctx.stroke();
  }

  function dessinerCible(ctx, cx, cy, T, t, pal) {
    const s = Math.min(1, t * 6), p = 1 + Math.sin(t * 5) * 0.06;
    ctx.strokeStyle = (pal && pal.accent) || '#ef7b5a'; ctx.lineWidth = T * 0.05;
    ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.18, T * 0.26 * s * p, T * 0.13 * s * p, 0, 0, TAU); ctx.stroke();
    rond(ctx, cx, cy + T * 0.18, T * 0.05 * s, (pal && pal.accent) || '#ef7b5a');
  }

  // ---------------------------------------------------------------------------
  // Portraits (SVG très simples)
  // ---------------------------------------------------------------------------
  const portraitAlvin = () => '<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="55" r="34" fill="#9aa4af"/><circle cx="38" cy="52" r="7" fill="#3fcf72"/><circle cx="62" cy="52" r="7" fill="#3fcf72"/><circle cx="50" cy="64" r="3" fill="#f29bb0"/></svg>';
  const portraitPNJ = a => `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="55" r="34" fill="${(a && a.couleur) || '#ef7b5a'}"/><circle cx="40" cy="52" r="8" fill="#fbf7ef"/><circle cx="60" cy="52" r="8" fill="#fbf7ef"/><circle cx="40" cy="53" r="4" fill="#2d2a32"/><circle cx="60" cy="53" r="4" fill="#2d2a32"/></svg>`;
  const vignettePlanete = id => `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="40" fill="${(PALETTES[id] || PALETTES.plusmoins).sol}"/></svg>`;

  return { PALETTES, dessinerSol, dessinerObjet, dessinerEntite, dessinerAlvin, dessinerCible, portraitAlvin, portraitPNJ, vignettePlanete, factice: true };
})();
