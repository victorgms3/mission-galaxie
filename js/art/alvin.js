'use strict';
/* Alvin, le chat tigré gris aux yeux verts, en combinaison d'astronaute. */
const Alvin = (() => {
  const GRIS = '#9aa4af';
  const GRIS_TRAIT = '#7d8793';
  const RAYURE = '#5f6874';

  const oeil = (x, y) => `
    <g transform="translate(${x} ${y})">
      <g class="alv-paupiere">
        <ellipse rx="12" ry="13" fill="#3fcf72" stroke="#1d7f45" stroke-width="2.5"/>
        <ellipse class="alv-pupille" rx="5" ry="9" fill="#17202a"/>
        <circle cx="-4" cy="-5" r="3.2" fill="#fff"/>
        <circle cx="4" cy="5" r="1.5" fill="#fff" opacity=".7"/>
      </g>
    </g>`;

  const SVG = `
<svg class="alvin-svg" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="alv-verre" cx="38%" cy="30%" r="75%">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".38"/>
      <stop offset=".55" stop-color="#cfe9ff" stop-opacity=".1"/>
      <stop offset="1" stop-color="#8ccaff" stop-opacity=".32"/>
    </radialGradient>
  </defs>

  <g class="alv-queue">
    <path d="M136 226 C 176 228, 194 186, 172 160" fill="none" stroke="#8d97a3" stroke-width="15" stroke-linecap="round"/>
    <path d="M136 226 C 176 228, 194 186, 172 160" fill="none" stroke="${RAYURE}" stroke-width="15" stroke-dasharray="5 11" stroke-dashoffset="-8"/>
  </g>

  <g class="alv-corps">
    <path d="M50 252 C 48 204, 70 180, 100 180 C 130 180, 152 204, 150 252 Z" fill="#eef2f8" stroke="#c4ccdb" stroke-width="3"/>
    <rect x="80" y="200" width="40" height="28" rx="8" fill="#dfe5ef"/>
    <circle cx="100" cy="214" r="10" fill="#ff8a3d" stroke="#e06a1f" stroke-width="2"/>
    <path d="M100 207.5 l1.8 3.7 4.1.6-3 2.9.7 4.1-3.6-1.9-3.6 1.9.7-4.1-3-2.9 4.1-.6z" fill="#fff"/>
  </g>

  <g class="alv-tete">
    <path d="M60 82 L64 36 L96 62 Z" fill="${GRIS}" stroke="${GRIS_TRAIT}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M67 74 L69 48 L87 63 Z" fill="#f4a9bb"/>
    <path d="M140 82 L136 36 L104 62 Z" fill="${GRIS}" stroke="${GRIS_TRAIT}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M133 74 L131 48 L113 63 Z" fill="#f4a9bb"/>
    <path d="M56 110 L40 119 L58 127 Z" fill="${GRIS}" stroke="${GRIS_TRAIT}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M144 110 L160 119 L142 127 Z" fill="${GRIS}" stroke="${GRIS_TRAIT}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M52 106 C 50 72, 72 58, 100 58 C 128 58, 150 72, 148 106 C 147 132, 126 146, 100 146 C 74 146, 53 132, 52 106 Z" fill="${GRIS}" stroke="${GRIS_TRAIT}" stroke-width="2"/>

    <g stroke="${RAYURE}" stroke-width="5" stroke-linecap="round" fill="none">
      <path d="M100 62 L100 78"/><path d="M88 64 L91 77"/><path d="M112 64 L109 77"/>
      <path d="M55 96 L67 99"/><path d="M55 107 L66 107"/>
      <path d="M145 96 L133 99"/><path d="M145 107 L134 107"/>
    </g>

    <ellipse cx="100" cy="124" rx="23" ry="15" fill="#e3e8ee"/>
    <ellipse cx="69" cy="120" rx="8" ry="5" fill="#ff9fb2" opacity=".45"/>
    <ellipse cx="131" cy="120" rx="8" ry="5" fill="#ff9fb2" opacity=".45"/>

    <g class="alv-yeux">${oeil(80, 100)}${oeil(120, 100)}</g>
    <g class="alv-yeux-contents" stroke="#3b4350" stroke-width="4" stroke-linecap="round" fill="none">
      <path d="M69 103 Q80 90 91 103"/><path d="M109 103 Q120 90 131 103"/>
    </g>

    <path d="M94 113 Q100 111 106 113 L100 120 Z" fill="#f2879f" stroke="#d96a84" stroke-width="1.5" stroke-linejoin="round"/>
    <g class="alv-bouche" stroke="#4a515c" stroke-width="2.5" fill="none" stroke-linecap="round">
      <path d="M100 120 Q100 127 92 128"/><path d="M100 120 Q100 127 108 128"/>
    </g>
    <path class="alv-bouche-ouverte" d="M91 124 Q100 140 109 124 Q100 128 91 124 Z" fill="#c4486a" stroke="#4a515c" stroke-width="2" stroke-linejoin="round"/>

    <g stroke="#f4f7fa" stroke-width="1.8" stroke-linecap="round" opacity=".9">
      <path d="M78 121 L46 114"/><path d="M78 126 L45 129"/>
      <path d="M122 121 L154 114"/><path d="M122 126 L155 129"/>
    </g>
  </g>

  <g class="alv-casque">
    <line x1="100" y1="31" x2="100" y2="14" stroke="#c9d3e2" stroke-width="4" stroke-linecap="round"/>
    <circle class="alv-antenne" cx="100" cy="11" r="6.5" fill="#ffd23f" stroke="#e8b400" stroke-width="2"/>
    <circle cx="100" cy="102" r="72" fill="url(#alv-verre)" stroke="#d6ecff" stroke-width="4"/>
    <path d="M44 84 A 60 60 0 0 1 84 40" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>
    <path d="M152 126 A 60 60 0 0 1 140 148" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".35"/>
  </g>

  <ellipse cx="100" cy="176" rx="50" ry="12" fill="#c3cad8" stroke="#a5aec0" stroke-width="2.5"/>

  <g class="alv-bras-g">
    <path d="M70 196 Q 56 210 58 230" fill="none" stroke="#c4ccdb" stroke-width="19" stroke-linecap="round"/>
    <path d="M70 196 Q 56 210 58 230" fill="none" stroke="#eef2f8" stroke-width="14" stroke-linecap="round"/>
    <circle cx="58" cy="233" r="9" fill="${GRIS}" stroke="${GRIS_TRAIT}" stroke-width="2"/>
  </g>
  <g class="alv-bras-d">
    <path d="M130 196 Q 144 210 142 230" fill="none" stroke="#c4ccdb" stroke-width="19" stroke-linecap="round"/>
    <path d="M130 196 Q 144 210 142 230" fill="none" stroke="#eef2f8" stroke-width="14" stroke-linecap="round"/>
    <circle cx="142" cy="233" r="9" fill="${GRIS}" stroke="${GRIS_TRAIT}" stroke-width="2"/>
  </g>
</svg>`;

  function creer(taille = 120) {
    const el = document.createElement('div');
    el.className = 'alvin';
    el.style.width = taille + 'px';
    el.innerHTML = SVG;
    return el;
  }

  function humeur(el, h) {
    el.classList.remove('content', 'reflechit');
    if (h) el.classList.add(h);
  }

  function rejouer(el, classe) {
    el.classList.remove(classe);
    void el.offsetWidth;
    el.classList.add(classe);
  }

  return {
    creer,
    humeur,
    saute: el => rejouer(el, 'saute'),
    coucou: el => rejouer(el, 'coucou'),
  };
})();
