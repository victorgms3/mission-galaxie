'use strict';
/* Icônes d'interface au trait (SVG) : 24 × 24, trait de 2 px, bouts arrondis, couleur = currentColor.
   Icone.svg(nom, taille, classe) → chaîne SVG ; Icone.creer(nom, taille, classe) → élément DOM. */
const Icone = (() => {
  // Petit point plein (pour « ? », « ÷ », calculatrice…)
  const point = (x, y, r = 1.3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;
  const ETOILE = 'M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z';

  // Contenu de chaque icône (dessiné sur une grille de 24)
  const DESSINS = {
    'haut-parleur': '<path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6"/><path d="M18.4 6.6a7.6 7.6 0 0 1 0 10.8"/>',
    muet: '<path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
    ampoule: '<path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2v1h5v-1c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/><path d="M9.5 19.5h5"/><path d="M10.5 22h3"/>',
    croix: '<path d="M6 6l12 12M18 6L6 18"/>',
    retour: '<path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/>',
    suivant: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
    valider: '<circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.8 2.8L16.2 9.6"/>',
    effacer: '<path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7z"/><path d="M12.2 9.5l5 5M17.2 9.5l-5 5"/>',
    etoile: `<path d="${ETOILE}" fill="currentColor"/>`,
    'etoile-vide': `<path d="${ETOILE}"/>`,
    carte: '<path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
    sac: '<path d="M5 8.5h14l-1 11.5H6z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>',
    engrenage: '<path d="M9.92 5.21L10.5 2.52A9.6 9.6 0 0 1 13.5 2.52L14.08 5.21A7.1 7.1 0 0 1 16.84 6.81L19.46 5.96A9.6 9.6 0 0 1 20.96 8.56L18.92 10.4A7.1 7.1 0 0 1 18.92 13.6L20.96 15.44A9.6 9.6 0 0 1 19.46 18.04L16.84 17.19A7.1 7.1 0 0 1 14.08 18.79L13.5 21.48A9.6 9.6 0 0 1 10.5 21.48L9.92 18.79A7.1 7.1 0 0 1 7.16 17.19L4.54 18.04A9.6 9.6 0 0 1 3.04 15.44L5.08 13.6A7.1 7.1 0 0 1 5.08 10.4L3.04 8.56A9.6 9.6 0 0 1 4.54 5.96L7.16 6.81A7.1 7.1 0 0 1 9.92 5.21Z"/><circle cx="12" cy="12" r="3"/>',
    cadenas: '<rect x="5" y="10.5" width="14" height="10.5" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2.5"/>',
    maison: '<path d="M3.5 11.5L12 4l8.5 7.5"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
    fusee: '<path d="M12 2.5c3 2.2 4.5 5.5 4.5 9.5v5.5h-9V12c0-4 1.5-7.3 4.5-9.5z"/><path d="M7.5 12.5l-3 3v3.5l3-1.5"/><path d="M16.5 12.5l3 3v3.5l-3-1.5"/><circle cx="12" cy="9.5" r="1.8"/><path d="M10.3 20.2c.3 1 .9 1.7 1.7 2.1.8-.4 1.4-1.1 1.7-2.1"/>',
    livre: '<path d="M12 6.5C10 5 7.5 4.5 3.5 4.5v13c4 0 6.5.5 8.5 2 2-1.5 4.5-2 8.5-2v-13c-4 0-6.5.5-8.5 2z"/><path d="M12 6.5v13"/>',
    question: `<circle cx="12" cy="12" r="9.5"/><path d="M9.4 9.4a2.6 2.6 0 1 1 3.7 2.4c-.7.4-1.1 1-1.1 1.8v.4"/>${point(12, 17.2)}`,
    loupe: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4l5.1 5.1"/>',
    oreille: '<path d="M7 9a5.5 5.5 0 0 1 11 0c0 2.2-1 3.4-2.2 4.4-1.1.9-1.8 1.8-1.8 3.3a3.3 3.3 0 0 1-6 1.8"/><path d="M10 9.5a2.5 2.5 0 0 1 5 0c0 1.1-.8 1.6-1.5 2"/>',
    schema: '<rect x="3" y="4.5" width="18" height="6" rx="1.5"/><rect x="3" y="13.5" width="10.5" height="6" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="6" rx="1.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    moins: '<path d="M5 12h14"/>',
    fois: '<path d="M7 7l10 10M17 7L7 17"/>',
    divise: `<path d="M5 12h14"/>${point(12, 6.5, 1.5)}${point(12, 17.5, 1.5)}`,
    egal: '<path d="M5 9h14M5 15h14"/>',
    calcul: `<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><rect x="8" y="5.5" width="8" height="3.5" rx="1"/>${point(9, 12.5, 1.1)}${point(12, 12.5, 1.1)}${point(15, 12.5, 1.1)}${point(9, 15.5, 1.1)}${point(12, 15.5, 1.1)}${point(15, 15.5, 1.1)}${point(9, 18.5, 1.1)}${point(12, 18.5, 1.1)}${point(15, 18.5, 1.1)}`,
    crayon: '<path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 0l.5.5a2.1 2.1 0 0 1 0 3L8.5 19z"/><path d="M13.5 7l3.5 3.5"/>',
    horloge: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    piece: '<circle cx="12" cy="12" r="9"/><path d="M15 8.8A4 4 0 1 0 15 15.2"/><path d="M7.4 10.9h5M7.4 13.3h5"/>',
    coffre: '<path d="M4 11V9a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/><rect x="4" y="11" width="16" height="9" rx="1.5"/><path d="M10.5 11v3h3v-3"/>',
    coche: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    pause: '<rect x="6.5" y="5" width="3.5" height="14" rx="1"/><rect x="14" y="5" width="3.5" height="14" rx="1"/>',
    lecture: '<path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.8l-10-6.5A1 1 0 0 0 8 5.5z"/>',
    coeur: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    boussole: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    main: '<path d="M9 15.5V5.5a1.5 1.5 0 0 1 3 0v6M12 11V9.5a1.5 1.5 0 0 1 3 0V12M15 11.5V11a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-.8a5 5 0 0 1-4.1-2.1l-2.8-3.8a1.5 1.5 0 0 1 2.3-1.9L9 15.5"/>',
    recommencer: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4v4.5H9"/>',
  };

  // Les noms demandés par le cahier des charges (les autres sont des bonus)
  const NOMS = ['haut-parleur', 'ampoule', 'croix', 'retour', 'suivant', 'valider', 'effacer', 'etoile', 'etoile-vide',
    'carte', 'sac', 'engrenage', 'cadenas', 'maison', 'fusee', 'livre', 'question', 'loupe', 'oreille', 'schema',
    'plus', 'moins', 'fois', 'divise', 'calcul', 'crayon', 'horloge', 'piece', 'coffre', 'coche', 'pause', 'lecture',
    'coeur', 'boussole', 'main'];

  const existe = nom => Object.prototype.hasOwnProperty.call(DESSINS, nom);

  function svg(nom, taille = 24, classe = '') {
    // Repli discret pour un nom inconnu : un petit cercle (jamais d'erreur)
    const dessin = existe(nom) ? DESSINS[nom] : '<circle cx="12" cy="12" r="4"/>';
    const t = Number(taille) || 24;
    const nomClasse = String(nom).replace(/[^a-z0-9-]/gi, '');
    return `<svg class="icone icone-${nomClasse}${classe ? ' ' + classe : ''}" width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${dessin}</svg>`;
  }

  const modele = document.createElement('template');
  function creer(nom, taille = 24, classe = '') {
    modele.innerHTML = svg(nom, taille, classe);
    return modele.content.firstElementChild;
  }

  return { svg, creer, existe, noms: NOMS, tous: Object.keys(DESSINS) };
})();
