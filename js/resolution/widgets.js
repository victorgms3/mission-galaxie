'use strict';
/*
 * Outils de la résolution guidée (Mission Galaxie v2).
 *  - calcul posé (+ − ×) avec retenues et saisie de droite à gauche, correction de la colonne fausse ;
 *  - calcul en ligne ; division en ligne avec l'aide « table de multiplication » ;
 *  - saisie d'une heure ou d'une durée « [ ] h [ ] min » et horloge plate (aide pour avancer / reculer le temps) ;
 *  - porte-monnaie (pièces et billets à toucher, total affiché) ;
 *  - icônes, portraits et étoiles de repli (si js/core/icones.js ou js/art/art.js ne sont pas chargés).
 * Chaque widget de calcul a la même interface :
 *   { el, type, saisir(ch), effacer(), valeur(), controle(), diagnostic(), indices(), marquer(), corriger(), juste() }
 */
const Widgets = (() => {
  const { h } = UI;
  const fmt = n => Problemes.fmtNombre(n);
  const F = (v, f) => Problemes.formater(v, f || 'nombre');
  const clic = () => { if (typeof Sons !== 'undefined') Sons.clic(); };

  // ---------------------------------------------------------------------------
  // Icônes (repli au trait si js/core/icones.js est absent)
  // ---------------------------------------------------------------------------
  const TRACES = {
    'haut-parleur': '<path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    ampoule: '<path d="M9.5 17.5h5M10.5 20.5h3"/><path d="M12 3.5a5.5 5.5 0 0 0-3.3 9.9c.6.5.9 1.1.9 1.9v.2h4.8v-.2c0-.8.3-1.4.9-1.9A5.5 5.5 0 0 0 12 3.5z"/>',
    croix: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    coche: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    valider: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    oreille: '<path d="M7.5 9.5a4.5 4.5 0 0 1 9 0c0 2.6-2.8 3.4-2.8 6.2a2.8 2.8 0 0 1-5 1.6"/><path d="M10.3 10a1.8 1.8 0 0 1 3.5 0"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.5"/><path d="M12 17h.01"/>',
    loupe: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
    boussole: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    schema: '<rect x="3" y="5" width="18" height="5" rx="1.5"/><rect x="3" y="14" width="10" height="5" rx="1.5"/><rect x="15" y="14" width="6" height="5" rx="1.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    calcul: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
    crayon: '<path d="M4.5 19.5l1-4L16 5l3 3L8.5 18.5z"/><path d="M14 7l3 3"/>',
    etoile: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    horloge: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    piece: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9a3.6 3.6 0 1 0 0 6M8 11h5.5M8 13.2h5.5"/>',
    livre: '<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5z"/><path d="M5 20.5V5.5M19 18v3H7.5"/>',
    retour: '<path d="M15 6l-6 6 6 6"/>',
    suivant: '<path d="M9 6l6 6-6 6"/>',
    effacer: '<path d="M9 5.5h11v13H9l-5.5-6.5z"/><path d="M12 9.5l4.5 5M16.5 9.5l-4.5 5"/>',
  };

  function icone(nom, taille = 24, classe = '') {
    if (typeof Icone !== 'undefined' && Icone.svg) {
      try { const s = Icone.svg(nom, taille, classe); if (s) return s; } catch (e) { /* repli */ }
    }
    const d = TRACES[nom];
    if (!d) return '';
    return `<svg class="icone ${classe}" width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  }
  const ic = (nom, taille = 24, classe = '') => h('span', { class: 'res-ic', 'aria-hidden': 'true', html: icone(nom, taille, classe) });

  // ---------------------------------------------------------------------------
  // Portraits (repli plat si js/art/art.js est absent)
  // ---------------------------------------------------------------------------
  function alvinRepli(humeur) {
    const content = humeur === 'content';
    const reflechit = humeur === 'reflechit';
    const triste = humeur === 'triste';
    const yeux = content
      ? '<path d="M33.5 50q6-7 12 0M54.5 50q6-7 12 0" fill="none" stroke="#3b4350" stroke-width="3.5" stroke-linecap="round"/>'
      : `<ellipse cx="39.5" cy="49" rx="6.5" ry="7.5" fill="#3fcf72" stroke="#2c9c55" stroke-width="1.5"/>
         <ellipse cx="60.5" cy="49" rx="6.5" ry="7.5" fill="#3fcf72" stroke="#2c9c55" stroke-width="1.5"/>
         <ellipse cx="${reflechit ? 41.5 : 39.5}" cy="${reflechit ? 46.5 : 49.5}" rx="2.6" ry="5" fill="#1f2630"/>
         <ellipse cx="${reflechit ? 62.5 : 60.5}" cy="${reflechit ? 46.5 : 49.5}" rx="2.6" ry="5" fill="#1f2630"/>
         <circle cx="37.6" cy="46" r="1.6" fill="#fff"/><circle cx="58.6" cy="46" r="1.6" fill="#fff"/>`;
    const bouche = content
      ? '<path d="M44 64q6 7 12 0z" fill="#c4486a" stroke="#4a515c" stroke-width="1.8" stroke-linejoin="round"/>'
      : triste
        ? '<path d="M45 67q5-4 10 0" fill="none" stroke="#4a515c" stroke-width="2" stroke-linecap="round"/>'
        : '<path d="M50 62q0 4-5 4.5M50 62q0 4 5 4.5" fill="none" stroke="#4a515c" stroke-width="2" stroke-linecap="round"/>';
    return `<svg class="portrait-alvin" viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="50" cy="96" rx="28" ry="3.5" fill="#2d2a32" opacity=".1"/>
      <path d="M24 97q0-21 26-21t26 21z" fill="#f4f1ea" stroke="#d8d0c2" stroke-width="2"/>
      <circle cx="50" cy="87" r="5" fill="#ef7b5a" stroke="#cf5c3c" stroke-width="1.5"/>
      <path d="M25 42L27.5 15L45 30z" fill="#9aa4af" stroke="#7d8793" stroke-width="2" stroke-linejoin="round"/>
      <path d="M75 42L72.5 15L55 30z" fill="#9aa4af" stroke="#7d8793" stroke-width="2" stroke-linejoin="round"/>
      <path d="M29.5 36L30.5 22L40 30z" fill="#f2a7b8"/><path d="M70.5 36L69.5 22L60 30z" fill="#f2a7b8"/>
      <ellipse cx="50" cy="51" rx="28.5" ry="25" fill="#9aa4af" stroke="#7d8793" stroke-width="2"/>
      <path d="M50 27v8M43.5 28l1.4 6.5M56.5 28l-1.4 6.5M23.5 47h6M23.5 53h5.5M76.5 47h-6M76.5 53h-5.5" stroke="#5f6874" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="50" cy="63" rx="12" ry="8" fill="#dfe4ea"/>
      ${yeux}
      <path d="M47 58.5h6l-3 3.5z" fill="#f2879f" stroke="#d96a84" stroke-width="1" stroke-linejoin="round"/>
      ${bouche}
      <circle cx="50" cy="51" r="39" fill="none" stroke="#cfe0ec" stroke-width="2.5"/>
      <path d="M20 40a31 31 0 0 1 18-21" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>
    </svg>`;
  }

  function portraitAlvin(humeur = 'normal') {
    if (typeof Art !== 'undefined' && Art.portraitAlvin) {
      try { const s = Art.portraitAlvin(humeur); if (s) return s; } catch (e) { /* repli */ }
    }
    return alvinRepli(humeur);
  }

  function portraitPNJ(pnj) {
    if (pnj && pnj.portrait) return pnj.portrait;
    const lettre = ((pnj && pnj.nom) || '?').trim().charAt(0).toUpperCase();
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="94" rx="26" ry="4" fill="#2d2a32" opacity=".1"/>
      <path d="M18 92q0-60 32-60t32 60z" fill="#7b6ee6" stroke="#5a4ec4" stroke-width="2"/>
      <circle cx="40" cy="56" r="7" fill="#fff"/><circle cx="60" cy="56" r="7" fill="#fff"/>
      <circle cx="41" cy="57" r="3.5" fill="#2d2a32"/><circle cx="61" cy="57" r="3.5" fill="#2d2a32"/>
      <path d="M43 71q7 5 14 0" fill="none" stroke="#2d2a32" stroke-width="2.5" stroke-linecap="round"/>
      <text x="50" y="27" text-anchor="middle" font-size="20" font-weight="700" fill="#5a4ec4" font-family="Fredoka, sans-serif">${lettre}</text></svg>`;
  }

  // Étoile plate (écran de fin)
  const etoile = () => '<svg viewBox="0 0 48 48" aria-hidden="true"><path class="etoile-forme" d="M24 4.5l5.9 12 13.2 1.9-9.6 9.3 2.3 13.2L24 34.7l-11.8 6.2 2.3-13.2-9.6-9.3 13.2-1.9z" stroke-linejoin="round"/></svg>';

  // Accolade étirable (pointe vers le haut ou vers le bas)
  function accolade(sens = 'bas') {
    const d = sens === 'haut'
      ? 'M1 19 Q1 11 9 11 H44 Q50 11 50 2 Q50 11 56 11 H91 Q99 11 99 19'
      : 'M1 1 Q1 9 9 9 H44 Q50 9 50 18 Q50 9 56 9 H91 Q99 9 99 1';
    return h('div', { class: 'accolade ' + sens, 'aria-hidden': 'true', html: `<svg viewBox="0 0 100 20" preserveAspectRatio="none"><path d="${d}" vector-effect="non-scaling-stroke"/></svg>` });
  }

  // ---------------------------------------------------------------------------
  // Horloge plate (SVG). minutes = minutes depuis minuit ; null = cadran sans aiguilles
  // ---------------------------------------------------------------------------
  function horloge(minutes, taille = 64, { inconnue = false, chiffres = false } = {}) {
    const pt = (angle, r) => {
      const a = (angle - 90) * Math.PI / 180;
      return [(50 + r * Math.cos(a)).toFixed(2), (50 + r * Math.sin(a)).toFixed(2)];
    };
    let s = `<svg class="horloge" width="${taille}" height="${taille}" viewBox="0 0 100 100" aria-hidden="true">`;
    s += '<circle class="horloge-cadran" cx="50" cy="50" r="45"/>';
    for (let i = 0; i < 60; i += 5) {
      const gros = i % 15 === 0;
      const [x1, y1] = pt(i * 6, gros ? 35 : 37.5);
      const [x2, y2] = pt(i * 6, 41);
      s += `<line class="horloge-trait${gros ? ' gros' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }
    if (chiffres) {
      for (let i = 1; i <= 12; i++) {
        const [x, y] = pt(i * 30, 29);
        s += `<text class="horloge-chiffre" x="${x}" y="${(+y + 3.6).toFixed(2)}" text-anchor="middle">${i}</text>`;
      }
    }
    if (inconnue) {
      s += '<text class="horloge-inconnue" x="50" y="64" text-anchor="middle">?</text>';
    } else if (minutes != null) {
      const m = ((minutes % 1440) + 1440) % 1440;
      const [hx, hy] = pt(((m / 60) % 12) * 30, chiffres ? 19 : 23);
      const [mx, my] = pt((m % 60) * 6, chiffres ? 31 : 34);
      s += `<line class="horloge-heure" x1="50" y1="50" x2="${hx}" y2="${hy}"/>`;
      s += `<line class="horloge-minute" x1="50" y1="50" x2="${mx}" y2="${my}"/>`;
      s += '<circle class="horloge-centre" cx="50" cy="50" r="4"/>';
    }
    return s + '</svg>';
  }

  // ---------------------------------------------------------------------------
  // Calcul posé : + et − (retenues « 1 » à toucher), × par un nombre à un chiffre (retenues à écrire)
  // ---------------------------------------------------------------------------
  const NOMS_COL = ['unités', 'dizaines', 'centaines', 'milliers', 'dizaines de mille', 'centaines de mille'];
  const LETTRES = ['u', 'd', 'c', 'm', 'dm', 'cm'];

  function explicationsColonnes(signe, H, B, n, Rs) {
    const chiffre = (s, j) => (j < s.length ? +s[s.length - 1 - j] : null);
    const textes = [];
    let ret = 0;
    textes.aRetenue = false; // vrai si au moins une colonne produit une retenue
    for (let j = 0; j < n; j++) {
      const nom = NOMS_COL[j] || 'chiffres';
      const a = chiffre(H, j), b = chiffre(B, j);
      let t;
      if (signe === '+') {
        if (a == null && b == null) t = ret ? `Colonne des ${nom} : il reste la retenue, j'écris ${ret}.` : `Colonne des ${nom} : il n'y a rien à écrire.`;
        else {
          const termes = [a, b].filter(x => x != null);
          const s = termes.reduce((x, y) => x + y, 0) + ret;
          t = `Colonne des ${nom} : ${termes.join(' + ')}${ret ? ` + ${ret} de retenue` : ''} = ${s}.`;
          t += s >= 10 ? ` J'écris ${s % 10} et je retiens ${Math.floor(s / 10)}.` : ` J'écris ${s}.`;
          ret = s >= 10 ? Math.floor(s / 10) : 0;
        }
      } else if (signe === '−') {
        const haut = a || 0, bas = b || 0;
        const x = haut - bas - ret;
        const debut = `Colonne des ${nom} : ${haut}${b != null ? ` − ${bas}` : ''}${ret ? ' − 1 de retenue' : ''}`;
        if (x < 0) {
          t = `${debut}, ce n'est pas possible : je prends une retenue. ${haut + 10}${b != null ? ` − ${bas}` : ''}${ret ? ' − 1' : ''} = ${x + 10}. J'écris ${x + 10}.`;
          ret = 1;
        } else {
          t = `${debut} = ${x}.` + (x === 0 && j >= Rs.length ? " Je n'écris rien." : ` J'écris ${x}.`);
          ret = 0;
        }
      } else {
        const m = +B;
        if (a == null) t = ret ? `Colonne des ${nom} : il reste la retenue, j'écris ${ret}.` : `Colonne des ${nom} : il n'y a rien à écrire.`;
        else {
          const p = a * m + ret;
          t = `Colonne des ${nom} : ${a} × ${m}${ret ? ` + ${ret} de retenue` : ''} = ${p}.`;
          t += p >= 10 ? ` J'écris ${p % 10} et je retiens ${Math.floor(p / 10)}.` : ` J'écris ${p}.`;
          ret = p >= 10 ? Math.floor(p / 10) : 0;
        }
      }
      if (ret) textes.aRetenue = true;
      textes.push(t);
    }
    return textes;
  }

  function pose(op, { verrou = () => false } = {}) {
    const signe = op.signe;
    let haut = op.g, bas = op.d;
    if (signe === '×' && String(haut).length < String(bas).length) [haut, bas] = [bas, haut];
    const H = String(haut), B = String(bas), Rs = String(op.r);
    const n = Math.max(H.length, B.length, Rs.length);
    const attendu = Rs.padStart(n, ' ');
    const explications = explicationsColonnes(signe, H, B, n, Rs);
    const grille = h('div', { class: 'pose', style: { gridTemplateColumns: `repeat(${n + 1}, var(--cellule))` } });
    const vide = () => h('span', { class: 'pose-vide' });

    // Noms des colonnes (u, d, c, m)
    grille.append(vide());
    for (let i = 0; i < n; i++) grille.append(h('span', { class: 'pose-entete col-' + (n - 1 - i) }, LETTRES[n - 1 - i]));
    // Retenues (au-dessus du premier nombre)
    let cibleRetenue = null;
    const retenues = [];
    grille.append(vide());
    for (let i = 0; i < n; i++) {
      if (i === n - 1) { grille.append(vide()); continue; }
      const r = h('button', { class: 'pose-retenue', type: 'button', 'aria-label': 'Retenue sur les ' + NOMS_COL[n - 1 - i] });
      r.addEventListener('click', () => {
        if (verrou()) return;
        clic();
        if (signe !== '×') { r.textContent = r.textContent ? '' : '1'; return; }
        if (r.textContent) { r.textContent = ''; }
        cibleRetenue = cibleRetenue === r ? null : r;
        retenues.forEach(x => x.classList.toggle('selection', x === cibleRetenue));
      });
      retenues.push(r);
      grille.append(r);
    }
    // Les deux nombres
    grille.append(vide());
    for (const ch of H.padStart(n, ' ')) grille.append(h('span', { class: 'pose-chiffre' }, ch.trim()));
    grille.append(h('span', { class: 'pose-signe' }, signe));
    for (const ch of B.padStart(n, ' ')) grille.append(h('span', { class: 'pose-chiffre' }, ch.trim()));
    grille.append(h('span', { class: 'pose-trait', style: { gridColumn: `1 / span ${n + 1}` } }));
    // Résultat : saisie de droite à gauche
    grille.append(vide());
    const cellules = [];
    let sel = n - 1;
    const selectionner = i => {
      sel = i;
      cellules.forEach((c, k) => c.classList.toggle('selection', k === i));
    };
    for (let i = 0; i < n; i++) {
      const c = h('button', { class: 'pose-resultat col-' + (n - 1 - i), type: 'button', 'aria-label': 'Chiffre des ' + NOMS_COL[n - 1 - i] });
      c.addEventListener('click', () => {
        if (verrou()) return;
        cibleRetenue = null;
        retenues.forEach(x => x.classList.remove('selection'));
        selectionner(i);
      });
      cellules.push(c);
      grille.append(c);
    }
    selectionner(n - 1);

    const differe = i => {
      const v = cellules[i].textContent;
      const a = attendu[i].trim();
      return !(v === a || (v === '0' && a === '' && i < n - 1));
    };
    // j = rang de la colonne (0 = unités) de la première colonne fausse ou vide, en partant de la droite
    const colonneAFaire = () => {
      for (let i = n - 1; i >= 0; i--) if (differe(i)) return n - 1 - i;
      return null;
    };

    return {
      el: h('div', { class: 'res-pose-cadre' }, grille),
      type: 'pose',
      aRetenue: explications.aRetenue, // le calcul a-t-il vraiment une retenue ?
      saisir(ch) {
        if (cibleRetenue) {
          cibleRetenue.textContent = ch;
          cibleRetenue.classList.remove('selection');
          cibleRetenue = null;
          return;
        }
        cellules[sel].textContent = ch;
        cellules[sel].classList.remove('faux', 'corrige');
        if (sel > 0) selectionner(sel - 1);
      },
      effacer() {
        if (cellules[sel].textContent) cellules[sel].textContent = '';
        else if (sel < n - 1) { selectionner(sel + 1); cellules[sel].textContent = ''; }
        cellules[sel].classList.remove('faux');
      },
      valeur() {
        const t = cellules.map(c => c.textContent || ' ').join('').trim();
        if (!t || /\s/.test(t)) return null;
        return parseInt(t, 10);
      },
      controle: () => null,
      diagnostic() {
        const j = colonneAFaire();
        return j == null ? null : `la colonne des ${NOMS_COL[j]}`;
      },
      indices() {
        return [
          'Calcule colonne par colonne, en commençant par les unités, tout à droite.',
          () => {
            const j = colonneAFaire();
            return j == null ? 'Ton calcul a l’air juste : appuie sur la coche verte !' : explications[j];
          },
        ];
      },
      marquer() {
        cellules.forEach((c, i) => c.classList.toggle('faux', differe(i)));
        for (let i = n - 1; i >= 0; i--) if (differe(i)) { selectionner(i); break; }
      },
      corriger() {
        cellules.forEach((c, i) => {
          c.classList.remove('faux', 'selection');
          if (differe(i)) { c.textContent = attendu[i].trim(); c.classList.add('corrige'); } else c.classList.add('juste');
        });
      },
      juste() { cellules.forEach(c => { c.classList.remove('selection', 'faux'); c.classList.add('juste'); }); },
    };
  }

  // ---------------------------------------------------------------------------
  // Calcul en ligne (petits nombres, tables, divisions)
  // ---------------------------------------------------------------------------
  function enLigne(op, { unite = '' } = {}) {
    let saisie = '';
    const boite = h('span', { class: 'res-boite-reponse', 'aria-label': 'Ta réponse' });
    const maj = () => { boite.textContent = saisie; };
    const { g, d, signe } = op;
    const fg = F(g, op.formats && op.formats.g), fd = F(d, op.formats && op.formats.d);
    return {
      el: h('div', { class: 'res-en-ligne' },
        h('span', { class: 'expr' }, `${fg} ${signe} ${fd} =`), boite,
        unite && unite.length <= 9 ? h('span', { class: 'unite' }, unite) : null),
      type: 'ligne',
      saisir(ch) { if (saisie.length < 6) { saisie += ch; maj(); boite.classList.remove('faux'); } },
      effacer() { saisie = saisie.slice(0, -1); maj(); },
      valeur() { return saisie ? parseInt(saisie, 10) : null; },
      controle: () => null,
      diagnostic: () => null,
      indices() {
        if (signe === '÷') {
          const q = op.r;
          const dz = Math.floor(q / 10) * 10, u = q % 10;
          return [
            `Combien de fois ${fd} dans ${fg} ? Cherche dans la table de ${fd} : ${fd} fois combien font ${fg} ?`,
            q <= 10 || !dz
              ? `Récite la table de ${fd} : ${[1, 2, 3, 4].map(i => fmt(d * i)).join(', ')}… jusqu'à trouver ${fg}.`
              : `${fd} × ${dz} = ${fmt(d * dz)}. Il reste ${fmt(g - d * dz)}${u ? `, et ${fmt(g - d * dz)} = ${fd} × ${u}` : ''}.`,
          ];
        }
        if (signe === '×') {
          const petit = Math.min(g, d), grand = Math.max(g, d);
          return [
            `Récite la table de ${fmt(grand)} : ${[1, 2, 3].map(i => fmt(grand * i)).join(', ')}…`,
            petit <= 6 ? `${fmt(petit)} fois ${fmt(grand)}, c'est ${Array(petit).fill(fmt(grand)).join(' + ')}.` : `Compte de ${fmt(grand)} en ${fmt(grand)}, ${fmt(petit)} fois.`,
          ];
        }
        if (signe === '+') return ['Tu peux compter dans ta tête ou sur tes doigts.', `Pars de ${fg} et avance de ${fd}.`];
        return ['Tu peux compter dans ta tête ou sur tes doigts.', `Pars de ${fg} et recule de ${fd}. Ou bien : combien faut-il ajouter à ${fd} pour arriver à ${fg} ?`];
      },
      marquer() { boite.classList.add('faux'); saisie = ''; maj(); },
      corriger() { boite.textContent = fmt(op.r); boite.className = 'res-boite-reponse corrige'; },
      juste() { boite.classList.add('juste'); },
    };
  }

  // ---------------------------------------------------------------------------
  // Heures et durées : « [ ] h [ ] min »
  // ---------------------------------------------------------------------------
  function horaire(op, { verrou = () => false } = {}) {
    const fr = op.formats || {};
    const val = { h: '', m: '' };
    let champ = 'h';
    const bH = h('button', { class: 'champ-temps champ-h', type: 'button', 'aria-label': 'Les heures' });
    const bM = h('button', { class: 'champ-temps champ-min', type: 'button', 'aria-label': 'Les minutes' });
    const choisir = c => { champ = c; bH.classList.toggle('selection', c === 'h'); bM.classList.toggle('selection', c === 'm'); };
    const maj = () => { bH.textContent = val.h; bM.textContent = val.m; };
    bH.addEventListener('click', () => { if (!verrou()) choisir('h'); });
    bM.addEventListener('click', () => { if (!verrou()) choisir('m'); });
    choisir('h');
    const att = { h: Math.floor(op.r / 60), m: op.r % 60 };
    const vH = () => (val.h ? +val.h : 0), vM = () => (val.m ? +val.m : 0);
    const fg = F(op.g, fr.g), fd = F(op.d, fr.d);
    const el = h('div', { class: 'res-temps' },
      h('div', { class: 'expr' }, `${fg} ${op.signe} ${fd} =`),
      h('div', { class: 'res-temps-saisie' }, bH, h('span', { class: 'res-temps-unite' }, 'h'), bM, h('span', { class: 'res-temps-unite' }, 'min')));

    return {
      el, type: 'temps',
      saisir(ch) {
        if (champ === 'h') {
          if (val.h.length >= 2) choisir('m');
          else {
            val.h += ch;
            bH.classList.remove('faux', 'corrige');
            if (val.h.length === 2 || +val.h >= 3 || val.h === '0') choisir('m');
            maj();
            return;
          }
        }
        if (val.m.length < 2) { val.m += ch; bM.classList.remove('faux', 'corrige'); }
        maj();
      },
      effacer() {
        if (champ === 'm' && !val.m) choisir('h');
        val[champ] = val[champ].slice(0, -1);
        maj();
      },
      valeur() {
        if (!val.h && !val.m) return null;
        if (fr.r === 'heure' && !val.h) return null;
        return vH() * 60 + vM();
      },
      controle() {
        if (val.m && vM() >= 60) return "Les minutes vont de 0 à 59. 60 minutes, c'est 1 heure : il faut ajouter 1 aux heures !";
        return null;
      },
      diagnostic() {
        const okH = vH() === att.h, okM = vM() === att.m;
        if (okH && !okM) return 'les minutes';
        if (!okH && okM) return 'les heures';
        return null;
      },
      indices() {
        if (op.signe === '+' && fr.r === 'heure') {
          return ["Une heure, c'est 60 minutes. Ajoute d'abord les heures, puis les minutes.", `Mets l'horloge sur ${F(fr.g === 'heure' ? op.g : op.d, 'heure')}, puis avance-la de ${F(fr.g === 'heure' ? op.d : op.g, 'duree')}.`];
        }
        if (op.signe === '−' && fr.r === 'duree') {
          return ['On cherche le temps qui passe entre les deux heures.', `Mets l'horloge sur ${F(op.d, 'heure')} et avance-la jusqu'à ${F(op.g, 'heure')}. Compte le temps qui passe.`];
        }
        if (op.signe === '−' && fr.r === 'heure') {
          return ['Cette fois, on remonte le temps.', `Mets l'horloge sur ${F(op.g, 'heure')} et recule-la de ${F(op.d, 'duree')}.`];
        }
        return ["Une heure, c'est 60 minutes.", "Calcule les heures avec les heures, et les minutes avec les minutes. Avec 60 minutes ou plus, on fait une heure de plus."];
      },
      marquer() {
        const okH = vH() === att.h, okM = vM() === att.m;
        bH.classList.toggle('faux', !okH);
        bM.classList.toggle('faux', !okM);
        choisir(okH ? 'm' : 'h');
      },
      corriger() {
        val.h = att.h || fr.r === 'heure' ? String(att.h) : '0';
        val.m = String(att.m).padStart(2, '0');
        maj();
        [bH, bM].forEach(b => { b.classList.remove('faux', 'selection'); b.classList.add('corrige'); });
      },
      juste() { [bH, bM].forEach(b => { b.classList.remove('selection', 'faux'); b.classList.add('juste'); }); },
    };
  }

  // Comment utiliser l'horloge pour ce calcul (ou null si l'horloge n'aide pas)
  function configHorloge(op) {
    const fr = op.formats || {};
    if (op.signe === '+' && fr.g === 'heure') return { depart: op.g, sens: 1 };
    if (op.signe === '+' && fr.d === 'heure') return { depart: op.d, sens: 1 };
    if (op.signe === '−' && fr.d === 'heure') return { depart: op.d, sens: 1 };   // fin − début : on avance du début à la fin
    if (op.signe === '−' && fr.g === 'heure') return { depart: op.g, sens: -1 };  // fin − durée : on recule
    return null;
  }

  function aideHorloge({ depart, sens }) {
    let courant = depart, ecoule = 0;
    const cadran = h('div', { class: 'res-horloge-grande' });
    const lHeure = h('b'), lEcoule = h('b');
    const maj = () => {
      cadran.innerHTML = horloge(courant, 156, { chiffres: true });
      lHeure.textContent = F(courant, 'heure');
      lEcoule.textContent = ecoule ? F(ecoule, 'duree') : '0 min';
    };
    const signe = sens > 0 ? '+' : '−';
    const boutons = [60, 30, 10, 5].map(p => h('button', {
      class: 'btn secondaire res-pas', type: 'button',
      onclick: () => {
        const suivant = courant + sens * p;
        if (suivant < 0 || suivant > 24 * 60) return;
        clic();
        courant = suivant;
        ecoule += p;
        maj();
      },
    }, `${signe} ${p === 60 ? '1 h' : p + ' min'}`));
    const el = h('div', { class: 'res-aide-horloge' },
      cadran,
      h('div', { class: 'res-aide-horloge-infos' },
        h('p', null, "L'horloge montre ", lHeure),
        h('p', null, sens > 0 ? "J'ai avancé de " : "J'ai reculé de ", lEcoule),
        h('div', { class: 'res-pas-boutons' }, boutons),
        h('button', { class: 'btn discret res-recommencer', type: 'button', onclick: () => { clic(); courant = depart; ecoule = 0; maj(); } }, 'Recommencer')));
    maj();
    return el;
  }

  // ---------------------------------------------------------------------------
  // Table de multiplication (aide pour × et ÷)
  // ---------------------------------------------------------------------------
  function tableMultiplication(n, jusqua = 10) {
    const fois = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    if (jusqua > 10) for (let k = 20; k <= Math.min(Math.ceil(jusqua / 10) * 10, 100); k += 10) fois.push(k);
    const grille = h('div', { class: 'res-table-grille' + (fois.length > 10 ? ' longue' : '') });
    for (const i of fois) {
      const b = h('button', {
        class: 'res-table-ligne', type: 'button',
        onclick: () => {
          clic();
          grille.querySelectorAll('.choisie').forEach(x => x.classList.remove('choisie'));
          b.classList.add('choisie');
        },
      }, `${fmt(n)} × ${i} = ${fmt(n * i)}`);
      grille.append(b);
    }
    return h('div', { class: 'res-table' }, h('p', { class: 'res-outil-titre' }, `La table de ${fmt(n)}`), grille);
  }

  // ---------------------------------------------------------------------------
  // Porte-monnaie : pièces et billets à toucher, total affiché
  // ---------------------------------------------------------------------------
  const ARGENT = {
    euros: [1, 2, 5, 10, 20, 50, 100].map(v => ({ v, type: v <= 2 ? 'piece' : 'billet', nom: v + ' €' })),
    centimes: [1, 2, 5, 10, 20, 50].map(v => ({ v, type: 'piece', nom: v + ' c' })).concat([{ v: 100, type: 'piece', nom: '1 €' }]),
  };

  function porteMonnaie(unite = '€') {
    const cts = unite === 'centimes';
    const liste = cts ? ARGENT.centimes : ARGENT.euros;
    let total = 0;
    const lTotal = h('b', { class: 'res-pm-total-valeur' });
    const vide = h('span', { class: 'res-pm-vide' }, 'Touche une pièce ou un billet pour le poser ici.');
    const plateau = h('div', { class: 'res-pm-plateau' }, vide);
    const jeton = m => h('span', { class: `res-argent ${m.type} v${m.v}${cts ? ' cts' : ''}` }, m.nom);
    const maj = () => {
      lTotal.textContent = cts ? `${fmt(total)} centimes` : `${fmt(total)} €`;
      if (!plateau.querySelector('.res-pm-jeton')) plateau.append(vide);
    };
    const ajouter = m => {
      if (plateau.querySelectorAll('.res-pm-jeton').length >= 40) return;
      clic();
      vide.remove();
      const t = h('button', { class: 'res-pm-jeton', type: 'button', 'aria-label': 'Retirer ' + m.nom }, jeton(m));
      t.addEventListener('click', () => { clic(); t.remove(); total -= m.v; maj(); });
      plateau.append(t);
      total += m.v;
      maj();
    };
    const reserve = h('div', { class: 'res-pm-reserve' }, liste.map(m => h('button', {
      class: 'res-pm-choix', type: 'button', 'aria-label': 'Ajouter ' + m.nom, onclick: () => ajouter(m),
    }, jeton(m))));
    maj();
    return h('div', { class: 'res-porte-monnaie' },
      h('div', { class: 'res-pm-entete' },
        h('p', { class: 'res-outil-titre' }, 'Le porte-monnaie'),
        h('div', { class: 'res-pm-total' }, h('span', null, 'Total : '), lTotal,
          h('button', {
            class: 'btn discret', type: 'button',
            onclick: () => { clic(); plateau.querySelectorAll('.res-pm-jeton').forEach(t => t.remove()); total = 0; maj(); },
          }, 'Tout enlever'))),
      reserve, plateau);
  }

  // ---------------------------------------------------------------------------
  // Choix du bon outil de calcul pour une opération
  // ---------------------------------------------------------------------------
  // op = { signe, g, d, r, formats } ; unite = unité du résultat ('€', 'centimes'…) ; tableDe = table à proposer pour ×
  function calcul(op, { unite = '', verrou, tableDe } = {}) {
    const fr = op.formats || {};
    const temps = [fr.g, fr.d, fr.r].some(f => f === 'heure' || f === 'duree');
    const outils = [];
    let widget;
    if (temps) {
      widget = horaire(op, { verrou });
      const cfg = configHorloge(op);
      if (cfg) outils.push({ id: 'horloge', icone: 'horloge', label: "L'horloge", creer: () => aideHorloge(cfg) });
    } else {
      const unChiffre = v => v < 10;
      if (op.signe === '÷') widget = enLigne(op, { unite });
      else if (op.signe === '×') widget = (unChiffre(op.g) !== unChiffre(op.d)) ? pose(op, { verrou }) : enLigne(op, { unite });
      else widget = Math.max(op.g, op.d) >= 10 ? pose(op, { verrou }) : enLigne(op, { unite });
      if (op.signe === '÷') {
        outils.push({ id: 'table', icone: 'livre', label: `La table de ${fmt(op.d)}`, creer: () => tableMultiplication(op.d, op.r) });
      } else if (op.signe === '×') {
        const n = widget.type === 'pose' ? Math.min(op.g, op.d) : (tableDe || op.d);
        outils.push({ id: 'table', icone: 'livre', label: `La table de ${fmt(n)}`, creer: () => tableMultiplication(n) });
      }
      if (unite === '€' || unite === 'centimes') outils.push({ id: 'monnaie', icone: 'piece', label: 'Le porte-monnaie', creer: () => porteMonnaie(unite) });
    }
    return { widget, outils };
  }

  return {
    icone, ic, portraitAlvin, portraitPNJ, etoile, accolade, horloge,
    pose, enLigne, horaire, aideHorloge, configHorloge, tableMultiplication, porteMonnaie, calcul,
    NOMS_COL,
  };
})();
