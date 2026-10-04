'use strict';
/*
 * Alvin, le chat tigré gris aux yeux verts, en combinaison d'astronaute blanche (écusson orange) et casque transparent.
 * Portrait en style plat (aplats, pas de dégradé ni d'ombre floue).
 *   Alvin.creer(taille)        → élément .alvin animé (classes CSS de css/base.css : .content, .reflechit, .saute, .coucou)
 *   Alvin.humeur(el, h)        → 'normal' | 'content' | 'reflechit' | 'triste'
 *   Alvin.saute(el), Alvin.coucou(el)
 *   Alvin.svg(humeur, cadre)   → '<svg …>' fixe ; cadre 'portrait' (tête et épaules, carré) ou 'entier' (200×250)
 * Repères conservés pour les animations : queue pivotant en (136, 226), bras droit en (130, 196).
 */
const Alvin = (() => {
  const C = {
    gris: '#9aa4af', grisF: '#86909c', rayure: '#5f6874', yeux: '#3fcf72', pupille: '#1d2b26', nez: '#f08aa0',
    oreille: '#f4a9bb', museau: '#ccd3db', combi: '#f6f7f9', combiF: '#d3d9e1', ecusson: '#f08a3c', col: '#cfd6df',
  };
  const HUMEURS = ['normal', 'content', 'reflechit', 'triste'];

  const queue = `
  <g class="alv-queue">
    <path d="M136 226 C 170 230, 190 200, 176 166" fill="none" stroke="${C.gris}" stroke-width="15" stroke-linecap="round"/>
    <path d="M136 226 C 170 230, 190 200, 176 166" fill="none" stroke="${C.rayure}" stroke-width="15" stroke-dasharray="7 11" stroke-dashoffset="-6"/>
    <circle cx="176" cy="166" r="7.5" fill="${C.rayure}"/>
  </g>`;

  const corps = `
  <g class="alv-corps">
    <path d="M50 252 C 50 206, 72 182, 100 182 C 128 182, 150 206, 150 252 Z" fill="${C.combi}"/>
    <path d="M120 187 C 140 196, 150 218, 150 252 L 132 252 C 134 224, 130 202, 120 187 Z" fill="${C.combiF}"/>
    <circle cx="78" cy="214" r="12" fill="${C.ecusson}"/>
    <path d="M78 206.5 l2.1 4.6 5 .5-3.8 3.3 1.1 4.9-4.4-2.6-4.4 2.6 1.1-4.9-3.8-3.3 5-.5z" fill="#fff3e4"/>
    <rect x="94" y="196" width="12" height="40" rx="6" fill="${C.combiF}"/>
  </g>`;

  const bras = (classe, x1, y1, x2, y2) => `
  <g class="${classe}">
    <path d="M${x1} ${y1} Q ${(x1 + x2) / 2 + (x2 > 100 ? 4 : -4)} ${(y1 + y2) / 2} ${x2} ${y2}" fill="none" stroke="${C.combiF}" stroke-width="20" stroke-linecap="round"/>
    <path d="M${x1} ${y1} Q ${(x1 + x2) / 2 + (x2 > 100 ? 4 : -4)} ${(y1 + y2) / 2} ${x2} ${y2}" fill="none" stroke="${C.combi}" stroke-width="15" stroke-linecap="round"/>
    <circle cx="${x2}" cy="${y2 + 3}" r="9.5" fill="${C.gris}"/>
  </g>`;

  const oeil = (x, y, dx = 0, dy = 0) => `
      <g transform="translate(${x} ${y})"><g class="alv-paupiere">
        <ellipse rx="12.5" ry="14" fill="${C.yeux}"/>
        <ellipse class="alv-pupille" cx="${dx}" cy="${dy + 1}" rx="5.2" ry="10" fill="${C.pupille}"/>
        <circle cx="${dx - 4}" cy="${dy - 5}" r="3.6" fill="#ffffff"/>
        <circle cx="${dx + 4}" cy="${dy + 6}" r="1.6" fill="#ffffff"/>
      </g></g>`;

  const yeuxContents = cls => `<g${cls ? ` class="${cls}"` : ''} stroke="${C.rayure}" stroke-width="5" stroke-linecap="round" fill="none">
      <path d="M69 108 Q80 95 91 108"/><path d="M109 108 Q120 95 131 108"/></g>`;
  const bouche = cls => `<path${cls ? ` class="${cls}"` : ''} d="M88 132 Q94 137 100 130 Q106 137 112 132" fill="none" stroke="${C.rayure}" stroke-width="3" stroke-linecap="round"/>`;
  const boucheOuverte = cls => `<path${cls ? ` class="${cls}"` : ''} d="M89 130 Q100 149 111 130 Q100 134 89 130 Z" fill="#c4566e"/>`;

  function tete(h, dynamique) {
    const regard = h === 'reflechit' ? [3, -4] : h === 'triste' ? [0, 3] : [0, 0];
    let yeux, extras = '';
    if (dynamique) {
      yeux = `<g class="alv-yeux">${oeil(80, 105)}${oeil(120, 105)}</g>${yeuxContents('alv-yeux-contents')}`;
      extras = `<g class="alv-bouche">${bouche('')}</g>${boucheOuverte('alv-bouche-ouverte')}`;
    } else if (h === 'content') {
      yeux = yeuxContents('');
      extras = boucheOuverte('');
    } else {
      yeux = `<g>${oeil(80, 105, ...regard)}${oeil(120, 105, ...regard)}</g>`;
      if (h === 'triste') {
        extras = `<path d="M90 137 Q100 129 110 137" fill="none" stroke="${C.rayure}" stroke-width="3" stroke-linecap="round"/>
      <g stroke="${C.rayure}" stroke-width="4.5" stroke-linecap="round"><path d="M70 90 L87 84"/><path d="M130 90 L113 84"/></g>`;
      } else if (h === 'reflechit') {
        extras = `<path d="M92 133 Q101 130 109 134" fill="none" stroke="${C.rayure}" stroke-width="3" stroke-linecap="round"/>`;
      } else extras = bouche('');
    }
    return `
  <g class="alv-tete">
    <path d="M57 94 L63 44 Q65 37 72 41 L99 64 Z" fill="${C.gris}"/>
    <path d="M66 82 L69 51 L88 66 Z" fill="${C.oreille}"/>
    <path d="M143 94 L137 44 Q135 37 128 41 L101 64 Z" fill="${C.gris}"/>
    <path d="M134 82 L131 51 L112 66 Z" fill="${C.oreille}"/>
    <ellipse cx="103" cy="111" rx="50" ry="46" fill="${C.grisF}"/>
    <ellipse cx="99.5" cy="107.5" rx="49" ry="45" fill="${C.gris}"/>
    <g stroke="${C.rayure}" stroke-width="6" stroke-linecap="round" fill="none">
      <path d="M100 65 L100 80"/><path d="M86 67 L89 79"/><path d="M114 67 L111 79"/>
      <path d="M52 102 L64 104"/><path d="M53 114 L64 113"/><path d="M147 102 L136 104"/><path d="M146 114 L136 113"/>
    </g>
    <ellipse cx="100" cy="128" rx="23" ry="14.5" fill="${C.museau}"/>
    <ellipse cx="66" cy="125" rx="8" ry="5" fill="${C.oreille}" opacity=".6"/>
    <ellipse cx="134" cy="125" rx="8" ry="5" fill="${C.oreille}" opacity=".6"/>
    ${yeux}
    <path d="M93 118.5 Q100 116 107 118.5 Q102.5 125.5 100 125.5 Q97.5 125.5 93 118.5 Z" fill="${C.nez}"/>
    ${extras}
    <g stroke="#eef1f4" stroke-width="2" stroke-linecap="round">
      <path d="M77 128 L50 123"/><path d="M77 133 L50 137"/><path d="M123 128 L150 123"/><path d="M123 133 L150 137"/>
    </g>
  </g>`;
  }

  const casque = `
  <ellipse cx="100" cy="180" rx="52" ry="11" fill="${C.col}"/>
  <g class="alv-casque">
    <circle cx="100" cy="103" r="76" fill="rgba(226,244,252,0.18)" stroke="#e8f5fc" stroke-width="4.5"/>
    <circle cx="100" cy="103" r="72.5" fill="none" stroke="rgba(150,186,208,0.5)" stroke-width="1.5"/>
    <path d="M42 86 A 60 60 0 0 1 78 46" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity=".9"/>
    <circle cx="90" cy="41" r="3.6" fill="#ffffff" opacity=".9"/>
  </g>`;

  // humeur : 'normal' | 'content' | 'reflechit' | 'triste' ; cadre : 'entier' (200×250) | 'portrait' (carré)
  function svg(humeur = 'normal', cadre = 'entier', dynamique = false) {
    const h = HUMEURS.includes(humeur) ? humeur : 'normal';
    const vb = cadre === 'portrait' ? '14 22 172 172' : '0 0 200 250';
    return `<svg class="alvin-svg" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${cadre === 'portrait' ? '' : queue}${corps}${casque.slice(0, casque.indexOf('<g'))}${tete(h, dynamique)}${casque.slice(casque.indexOf('<g'))}${bras('alv-bras-g', 70, 196, 58, 230)}${bras('alv-bras-d', 130, 196, 142, 230)}</svg>`;
  }

  function creer(taille = 120) {
    const el = document.createElement('div');
    el.className = 'alvin';
    el.style.width = taille + 'px';
    el.innerHTML = svg('normal', 'entier', true);
    el.dataset.rendu = 'anime';
    return el;
  }

  // Les humeurs « content » et « reflechit » passent par les classes CSS ; « triste » redessine le visage.
  function humeur(el, h) {
    if (!el) return;
    el.classList.remove('content', 'reflechit', 'triste');
    if (h && h !== 'normal') el.classList.add(h);
    const voulu = h === 'triste' ? 'triste' : 'anime';
    if (el.dataset.rendu !== voulu) {
      el.innerHTML = voulu === 'triste' ? svg('triste', 'entier', false) : svg('normal', 'entier', true);
      el.dataset.rendu = voulu;
    }
  }

  function rejouer(el, classe) {
    el.classList.remove(classe);
    void el.offsetWidth;
    el.classList.add(classe);
  }

  return {
    creer,
    humeur,
    svg,
    saute: el => rejouer(el, 'saute'),
    coucou: el => rejouer(el, 'coucou'),
  };
})();
