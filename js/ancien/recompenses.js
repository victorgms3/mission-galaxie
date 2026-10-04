'use strict';
/* Récompenses : autocollants à collectionner et fusée à construire (10 pièces). */
const Recompenses = (() => {
  const AUTOCOLLANTS = [
    { id: 'fusee', e: '🚀', nom: 'Fusée' },
    { id: 'soucoupe', e: '🛸', nom: 'Soucoupe' },
    { id: 'saturne', e: '🪐', nom: 'Saturne' },
    { id: 'lune', e: '🌙', nom: 'Croissant de lune' },
    { id: 'etoile', e: '⭐', nom: 'Étoile' },
    { id: 'brillante', e: '🌟', nom: 'Étoile brillante' },
    { id: 'comete', e: '☄️', nom: 'Comète' },
    { id: 'terre', e: '🌍', nom: 'La Terre' },
    { id: 'soleil', e: '☀️', nom: 'Soleil' },
    { id: 'alien', e: '👽', nom: 'Extraterrestre' },
    { id: 'satellite', e: '🛰️', nom: 'Satellite' },
    { id: 'telescope', e: '🔭', nom: 'Télescope' },
    { id: 'astronaute', e: '🧑‍🚀', nom: 'Astronaute' },
    { id: 'galaxie', e: '🌌', nom: 'Galaxie' },
    { id: 'filante', e: '🌠', nom: 'Étoile filante' },
    { id: 'pleine', e: '🌕', nom: 'Pleine lune' },
    { id: 'robot', e: '🤖', nom: 'Robot' },
    { id: 'monstre', e: '👾', nom: 'Petit monstre' },
    { id: 'chat', e: '🐱', nom: 'Alvin' },
    { id: 'arcenciel', e: '🌈', nom: 'Arc-en-ciel' },
    { id: 'eclair', e: '⚡', nom: 'Éclair' },
    { id: 'cristal', e: '💎', nom: 'Cristal' },
    { id: 'trophee', e: '🏆', nom: 'Trophée' },
    { id: 'couronne', e: '👑', nom: 'Couronne' },
  ];

  function nouvelAutocollant() {
    const D = Store.data;
    const restants = AUTOCOLLANTS.filter(a => !D.autocollants.includes(a.id));
    if (!restants.length) return null;
    const a = restants[Math.floor(Math.random() * restants.length)];
    D.autocollants.push(a.id);
    return a;
  }

  // Pièces de la fusée, dans l'ordre où on les gagne
  const NOMS_PIECES = ['', 'le corps', 'le nez', 'le hublot', "l'aileron gauche", "l'aileron droit", 'le réacteur', 'la bande orange', "l'étoile", 'Alvin au hublot', 'la flamme'];

  function fuseeSVG(pieces, nouvelle = 0) {
    const pc = (n, contenu) => `<g class="pc${n <= pieces ? '' : ' manquante'}${n === nouvelle ? ' nouvelle' : ''}">${contenu}</g>`;
    return `<svg class="fusee${pieces >= 10 ? ' complete' : ''}" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${pc(10, '<path class="flamme" d="M86 248 Q100 300 114 248 Z" fill="#ffb627"/><path class="flamme" d="M92 248 Q100 282 108 248 Z" fill="#fff1a8"/>')}
      ${pc(4, '<path d="M74 166 L38 224 L46 236 L74 214 Z" fill="#ff5d73" stroke="#c93a50" stroke-width="3" stroke-linejoin="round"/>')}
      ${pc(5, '<path d="M126 166 L162 224 L154 236 L126 214 Z" fill="#ff5d73" stroke="#c93a50" stroke-width="3" stroke-linejoin="round"/>')}
      ${pc(6, '<path d="M80 224 L120 224 L114 248 L86 248 Z" fill="#6b7280" stroke="#4b5260" stroke-width="3" stroke-linejoin="round"/>')}
      ${pc(1, '<rect x="72" y="104" width="56" height="122" rx="10" fill="#f3f5fb" stroke="#c4ccdb" stroke-width="3"/>')}
      ${pc(7, '<rect x="73.5" y="186" width="53" height="12" fill="#ff8a3d"/>')}
      ${pc(8, '<path d="M100 202 l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z" fill="#ffd23f" stroke="#e0a800" stroke-width="1"/>')}
      ${pc(2, '<path d="M72 112 C 72 72, 88 46, 100 28 C 112 46, 128 72, 128 112 Z" fill="#ff5d73" stroke="#c93a50" stroke-width="3" stroke-linejoin="round"/>')}
      ${pc(3, '<circle cx="100" cy="148" r="20" fill="#3aa0ff" stroke="#9aa4af" stroke-width="5"/>')}
      ${pc(9, '<path d="M89 147 L91 134 L98 141 Z M111 147 L109 134 L102 141 Z" fill="#9aa4af"/><circle cx="100" cy="151" r="11" fill="#9aa4af"/><circle cx="96" cy="150" r="2.6" fill="#3fcf72"/><circle cx="104" cy="150" r="2.6" fill="#3fcf72"/><path d="M98.4 154 L101.6 154 L100 156 Z" fill="#f2879f"/>')}
    </svg>`;
  }

  return { AUTOCOLLANTS, NOMS_PIECES, nouvelAutocollant, fuseeSVG };
})();
