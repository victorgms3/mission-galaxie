'use strict';
/* Écrans hors mission : premier lancement, carte de l'espace, album, espace coach. */
const Ecrans = (() => {
  const { h, fmt } = UI;
  const R = () => Store.data.reglages;

  const PLANETES = [
    { id: 'plusmoins', nom: 'Planète Plus-ou-Moins', desc: 'Additions, soustractions et comparaisons', c1: '#ffc27a', c2: '#ff6a2b', anneau: '#ffe0b3', actif: true },
    { id: 'paquets', nom: 'Planète Paquets', desc: 'Multiplications et partages', c1: '#ffa8dc', c2: '#c4317f' },
    { id: 'marche', nom: 'Planète Marché', desc: 'La monnaie', c1: '#a6f2b9', c2: '#1f9e5a', anneau: '#d6ffe0' },
    { id: 'tictac', nom: 'Planète Tic-Tac', desc: 'Les mesures et les heures', c1: '#99d8ff', c2: '#2563c9' },
    { id: 'station', nom: 'Station Grand Défi', desc: 'Les problèmes à étapes', station: true },
  ];

  const POSITIONS = {
    paysage: { base: [9, 76], plusmoins: [28, 42], paquets: [46, 74], marche: [62, 34], tictac: [78, 70], station: [90, 24] },
    portrait: { base: [20, 89], plusmoins: [66, 73], paquets: [27, 56], marche: [70, 40], tictac: [30, 24], station: [72, 10] },
  };

  const REFLET = '<path d="M30 48 A 34 34 0 0 1 52 26" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".45"/>';

  function planeteSVG(p) {
    if (p.station) {
      return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="49" width="36" height="22" rx="3" fill="#3aa0ff" stroke="#cfe6ff" stroke-width="2"/>
        <path d="M18 49 V71 M30 49 V71 M6 60 H42" stroke="#cfe6ff" stroke-width="1.5"/>
        <rect x="78" y="49" width="36" height="22" rx="3" fill="#3aa0ff" stroke="#cfe6ff" stroke-width="2"/>
        <path d="M90 49 V71 M102 49 V71 M78 60 H114" stroke="#cfe6ff" stroke-width="1.5"/>
        <rect x="40" y="56" width="40" height="8" fill="#c9d3e2"/>
        <circle cx="60" cy="60" r="21" fill="#e6ebf5" stroke="#9aa4af" stroke-width="3"/>
        <circle cx="60" cy="60" r="9" fill="#ffd23f"/>
        <line x1="60" y1="39" x2="60" y2="24" stroke="#c9d3e2" stroke-width="3"/>
        <circle cx="60" cy="21" r="4.5" fill="#ff5d73"/>
      </svg>`;
    }
    const id = 'pg-' + p.id;
    const anneau = p.anneau || null;
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="${id}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="${p.c1}"/><stop offset="1" stop-color="${p.c2}"/></radialGradient></defs>
      ${anneau ? `<ellipse cx="60" cy="60" rx="57" ry="15" fill="none" stroke="${anneau}" stroke-width="7" transform="rotate(-18 60 60)" opacity=".9"/>` : ''}
      <circle cx="60" cy="60" r="38" fill="url(#${id})"/>
      <circle cx="46" cy="52" r="7" fill="#000" opacity=".12"/>
      <circle cx="71" cy="73" r="10" fill="#000" opacity=".1"/>
      <circle cx="74" cy="45" r="4" fill="#000" opacity=".12"/>
      ${REFLET}
      ${anneau ? `<path d="M3 60 A57 15 0 0 0 117 60" fill="none" stroke="${anneau}" stroke-width="7" transform="rotate(-18 60 60)"/>` : ''}
    </svg>`;
  }

  const TERRE_SVG = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="pg-terre" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#7cc8ff"/><stop offset="1" stop-color="#1d5fc4"/></radialGradient></defs>
    <circle cx="60" cy="60" r="38" fill="url(#pg-terre)"/>
    <path d="M36 46 q8 -12 20 -6 q8 6 -1 13 q-6 4 -3 11 q-11 3 -15 -8 q-3 -6 -1 -10z" fill="#3ccf7a"/>
    <path d="M66 66 q10 -7 19 1 q5 9 -4 15 q-9 5 -13 -2 q-6 -6 -2 -14z" fill="#3ccf7a"/>
    <path d="M70 32 q8 0 10 6 q-6 3 -11 -1z" fill="#3ccf7a"/>
    ${REFLET}
  </svg>`;

  // ---------------------------------------------------------------------------
  // Petits composants de formulaire
  // ---------------------------------------------------------------------------
  function segmente(options, valeur, surChoix) {
    const el = h('div', { class: 'segmente', role: 'group' });
    const rendre = v => {
      UI.vider(el);
      for (const o of options) {
        el.append(h('button', {
          class: o.v === v ? 'actif' : '', 'aria-pressed': String(o.v === v),
          onclick: () => { Sons.clic(); surChoix(o.v); rendre(o.v); },
        }, o.label));
      }
    };
    rendre(valeur);
    return el;
  }

  function interrupteur(label, valeur, surChange) {
    return h('label', { class: 'interrupteur' },
      h('span', { class: 'interrupteur-texte' }, label),
      h('input', { type: 'checkbox', checked: !!valeur, onchange: e => { surChange(e.target.checked); Store.sauver(); } }),
      h('span', { class: 'glissiere', 'aria-hidden': 'true' }));
  }

  function champ(label, input, aide) {
    return h('label', { class: 'champ-bloc' }, h('span', { class: 'champ-label' }, label), input, aide && h('span', { class: 'champ-aide' }, aide));
  }

  // ---------------------------------------------------------------------------
  // Premier lancement (pour un adulte)
  // ---------------------------------------------------------------------------
  function config() {
    let genre = 'f';
    const prenom = h('input', { class: 'champ', type: 'text', maxlength: '20', placeholder: 'Son prénom', autocomplete: 'off' });
    const code = h('input', { class: 'champ', type: 'text', inputmode: 'numeric', maxlength: '4', placeholder: '4 chiffres', autocomplete: 'off' });
    const message = h('p', { class: 'message-erreur', role: 'alert' });
    const valider = () => {
      const p = prenom.value.trim();
      const c = code.value.trim();
      if (!p) { message.textContent = "Écris le prénom de l'enfant."; prenom.focus(); return; }
      if (!/^\d{4}$/.test(c)) { message.textContent = 'Le code doit contenir exactement 4 chiffres.'; code.focus(); return; }
      Store.data.profil = { prenom: p, genre, code: c, amis: [] };
      Store.sauver();
      Sons.clic();
      carte();
    };
    UI.ecran('ecran-config', h('div', { class: 'config-carte carte-claire' },
      Alvin.creer(120),
      h('h1', null, 'Mission Galaxie'),
      h('p', { class: 'pour-adulte' }, '👋 Cet écran est à remplir par un adulte'),
      champ("Prénom de l'enfant", prenom, 'Il apparaîtra dans les histoires des problèmes.'),
      h('div', { class: 'champ-bloc' }, h('span', { class: 'champ-label' }, "L'enfant est"),
        segmente([{ v: 'f', label: 'une fille' }, { v: 'm', label: 'un garçon' }], genre, v => { genre = v; })),
      champ('Code coach', code, "Il protège les réglages et le suivi des progrès. Gardez-le pour vous !"),
      message,
      h('button', { class: 'btn principal grand', onclick: valider }, "Commencer l'aventure 🚀")));
  }

  // ---------------------------------------------------------------------------
  // Carte de l'espace
  // ---------------------------------------------------------------------------
  function carte() {
    const D = Store.data;
    const niveau = D.planetes.plusmoins.niveau;
    const avatar = h('div', { class: 'avatar' }, Alvin.creer(66));
    const entete = h('header', { class: 'entete-carte' },
      h('div', { class: 'identite' }, avatar,
        h('div', null,
          h('div', { class: 'titre-jeu' }, 'Mission Galaxie'),
          h('div', { class: 'sous-titre' }, `${Store.grade(niveau)} ${D.profil.prenom}`))),
      h('div', { class: 'compteurs' },
        h('span', { class: 'pastille-compteur', 'aria-label': `${D.etoiles} étoiles` }, '⭐ ', fmt(D.etoiles)),
        h('button', { class: 'btn secondaire', onclick: () => { Sons.clic(); album(); } }, '📒 Mon album'),
        h('button', { class: 'btn-rond', 'aria-label': 'Espace coach', onclick: () => { Sons.clic(); demanderCode(); } }, '⚙️')));
    const espace = h('div', { class: 'carte-espace' });
    UI.ecran('ecran-carte', entete, espace);

    function placer() {
      UI.vider(espace);
      const pos = POSITIONS[espace.clientWidth >= espace.clientHeight * 0.95 ? 'paysage' : 'portrait'];
      const ordre = ['base', ...PLANETES.map(p => p.id)];
      const points = ordre.map(id => pos[id].join(',')).join(' ');
      espace.insertAdjacentHTML('beforeend', `<svg class="chemin" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3" stroke-dasharray="7 10" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`);

      const [bx, by] = pos.base;
      espace.append(h('div', { class: 'planete base', style: { left: bx + '%', top: by + '%' } },
        h('span', { class: 'planete-visuel', html: TERRE_SVG }), h('span', { class: 'planete-nom' }, 'Base Terre')));

      for (const p of PLANETES) {
        const [x, y] = pos[p.id];
        espace.append(h('button', {
          class: 'planete ' + (p.actif ? 'active' : 'verrouillee'),
          style: { left: x + '%', top: y + '%' },
          'aria-label': p.nom + (p.actif ? '' : ' (bientôt)'),
          onclick: () => { Sons.clic(); if (p.actif) ouvrirPlanete(p); else bientot(p); },
        },
          h('span', { class: 'planete-visuel', html: planeteSVG(p) }),
          h('span', { class: 'planete-nom' }, p.nom),
          p.actif
            ? h('span', { class: 'planete-badge' }, '★'.repeat(niveau) + '☆'.repeat(3 - niveau))
            : h('span', { class: 'planete-badge verrou' }, '🔒 Bientôt'),
          p.actif && h('span', { class: 'chip-jouer' }, '▶ Jouer')));
      }
      const [ax, ay] = pos.plusmoins;
      espace.append(h('div', { class: 'alvin-carte', style: { left: `calc(${ax}% - 190px)`, top: `calc(${ay}% - 150px)` } }, Alvin.creer(80)));
    }
    requestAnimationFrame(placer);
    window.onresize = () => { if (document.body.contains(espace)) placer(); };

    if (!D.introVue) intro();
  }

  function intro() {
    const D = Store.data;
    const prenom = D.profil.prenom;
    const texte = `Bonjour ${prenom} ! Je m'appelle Alvin, je suis un chat astronaute. Ensemble, on va voyager de planète en planète en résolvant des problèmes de maths. Pour commencer, touche la Planète Plus-ou-Moins !`;
    const alvin = Alvin.creer(130);
    UI.modal({
      titre: `Bonjour ${prenom} !`,
      contenu: [alvin, h('p', null, texte.replace(`Bonjour ${prenom} ! `, ''))],
      boutons: [{ label: "C'est parti ! 🚀", classe: 'principal grand', action: () => Voix.stop() }],
      fermable: false,
    });
    setTimeout(() => Alvin.coucou(alvin), 300);
    D.introVue = true;
    Store.sauver();
    if (R().alvinParle) Voix.dire(texte);
  }

  function ouvrirPlanete(p) {
    const pl = Store.data.planetes[p.id];
    const n = pl.niveau;
    const reussis = pl.historique.slice(-10).reduce((a, b) => a + b, 0);
    UI.modal({
      titre: p.nom,
      contenu: [
        h('div', { class: 'modal-planete', html: planeteSVG(p) }),
        h('p', { class: 'modal-desc' }, p.desc),
        h('p', { class: 'modal-grade' }, `Ton grade : ${Store.grade(n)} `, h('span', { class: 'etoiles-grade' }, '★'.repeat(n) + '☆'.repeat(3 - n))),
        n < 3
          ? h('div', { class: 'progres-grade' },
            h('div', { class: 'barre-progres' }, h('span', { style: { width: Math.min(100, (reussis / 8) * 100) + '%' } })),
            h('p', { class: 'petit' }, `Réussis 8 des 10 derniers problèmes pour devenir ${Store.grade(n + 1)}.`))
          : h('p', { class: 'petit' }, 'Tu as atteint le plus haut grade. Bravo !'),
        h('p', { class: 'petit' }, '🔥 Échauffement + 8 problèmes'),
      ],
      boutons: [
        { label: 'Plus tard', classe: 'secondaire' },
        { label: 'Décoller ! 🚀', classe: 'principal grand', action: () => Mission.demarrer(p.id) },
      ],
    });
    if (R().alvinParle) Voix.dire(`${p.nom} ! ${Store.G('Prête', 'Prêt')} pour le décollage ?`);
  }

  function bientot(p) {
    UI.toast(`${p.nom} : bientôt disponible !`);
    if (R().alvinParle) Voix.dire(`La ${p.nom} n'est pas encore ouverte. Elle arrive bientôt !`);
  }

  // ---------------------------------------------------------------------------
  // Album : fusée + autocollants
  // ---------------------------------------------------------------------------
  function album() {
    const D = Store.data;
    const A = Recompenses.AUTOCOLLANTS;
    UI.ecran('ecran-album',
      h('header', { class: 'entete-simple' },
        h('button', { class: 'btn-rond', 'aria-label': 'Retour à la carte', onclick: () => { Sons.clic(); carte(); } }, '←'),
        h('h1', null, 'Mon album')),
      h('div', { class: 'album-grille' },
        h('section', { class: 'bloc carte-claire' },
          h('h2', null, '🚀 Ma fusée'),
          h('div', { class: 'fusee-cadre grand', html: Recompenses.fuseeSVG(D.pieces) }),
          h('p', { class: 'centre' }, D.pieces >= 10 ? 'Ta fusée est terminée, bravo !' : `${D.pieces} pièce${D.pieces > 1 ? 's' : ''} sur 10`),
          h('p', { class: 'petit centre' }, 'Chaque mission terminée ajoute une pièce.')),
        h('section', { class: 'bloc carte-claire' },
          h('h2', null, `✨ Mes autocollants (${D.autocollants.length} / ${A.length})`),
          h('div', { class: 'grille-autocollants' }, A.map(a => D.autocollants.includes(a.id)
            ? h('div', { class: 'autocollant' }, h('span', { class: 'emoji' }, a.e), h('span', { class: 'nom' }, a.nom))
            : h('div', { class: 'autocollant manquant' }, h('span', { class: 'emoji' }, '?'), h('span', { class: 'nom' }, '…')))))));
  }

  // ---------------------------------------------------------------------------
  // Espace coach (protégé par le code)
  // ---------------------------------------------------------------------------
  function demanderCode() {
    let saisie = '';
    const points = h('div', { class: 'code-points' }, [0, 1, 2, 3].map(() => h('span')));
    const maj = () => [...points.children].forEach((s, i) => s.classList.toggle('plein', i < saisie.length));
    let fenetre;
    const clavier = UI.clavier({
      chiffre: c => {
        if (saisie.length >= 4) return;
        saisie += c;
        maj();
        if (saisie.length === 4) {
          if (saisie === Store.data.profil.code) { fenetre.fermer(); coach(); }
          else { Sons.oups(); UI.secouer(points); saisie = ''; setTimeout(maj, 300); }
        }
      },
      effacer: () => { saisie = saisie.slice(0, -1); maj(); },
      valider: () => {},
    });
    // Code oublié : appui long de 5 secondes sur le cadenas
    let minuteur;
    const cadenas = h('div', { class: 'cadenas' }, '🔒');
    cadenas.addEventListener('pointerdown', () => { minuteur = setTimeout(() => UI.toast('Code coach : ' + Store.data.profil.code), 5000); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => cadenas.addEventListener(ev, () => clearTimeout(minuteur)));
    fenetre = UI.modal({
      titre: 'Espace coach',
      contenu: [cadenas, h('p', null, 'Entre le code coach.'), points, clavier],
      boutons: [{ label: 'Annuler', classe: 'secondaire' }],
      classe: 'modal-code',
    });
  }

  function coach() {
    const D = Store.data, prof = D.profil;
    const retour = h('button', { class: 'btn-rond', 'aria-label': 'Retour à la carte', onclick: () => { Sons.clic(); carte(); } }, '←');

    // Enfant
    const champPrenom = h('input', {
      class: 'champ', type: 'text', value: prof.prenom, maxlength: '20',
      onchange: e => { const v = e.target.value.trim(); if (v) { prof.prenom = v; Store.sauver(); UI.toast('Prénom enregistré'); } else e.target.value = prof.prenom; },
    });

    // Copains et famille
    const amis = h('div', { class: 'liste-amis' });
    const rendreAmis = () => {
      UI.vider(amis);
      prof.amis.forEach((a, i) => {
        amis.append(h('div', { class: 'ligne-ami' },
          h('input', { class: 'champ', type: 'text', value: a.n, maxlength: '20', placeholder: 'Prénom', onchange: e => { a.n = e.target.value.trim(); Store.sauver(); } }),
          segmente([{ v: 'f', label: 'Fille' }, { v: 'm', label: 'Garçon' }], a.g, v => { a.g = v; Store.sauver(); }),
          h('button', { class: 'btn-rond petit clair', 'aria-label': 'Supprimer ce prénom', onclick: () => { prof.amis.splice(i, 1); Store.sauver(); rendreAmis(); } }, '✕')));
      });
      if (prof.amis.length < 12) {
        amis.append(h('button', {
          class: 'btn secondaire',
          onclick: () => { prof.amis.push({ n: '', g: 'f' }); Store.sauver(); rendreAmis(); const champs = amis.querySelectorAll('input'); champs[champs.length - 1].focus(); },
        }, '+ Ajouter un prénom'));
      }
    };
    rendreAmis();

    // Voix
    const choixVoix = h('select', { class: 'champ', onchange: e => { R().voixNom = e.target.value; Store.sauver(); Voix.choisir(); } });
    const remplirVoix = () => {
      UI.vider(choixVoix);
      choixVoix.append(h('option', { value: '' }, 'Automatique'));
      for (const v of Voix.voixFr()) {
        const o = h('option', { value: v.name }, `${v.name} (${v.lang})`);
        if (v.name === R().voixNom) o.selected = true;
        choixVoix.append(o);
      }
    };
    remplirVoix();
    setTimeout(remplirVoix, 700);

    // Code
    const nouveauCode = h('input', { class: 'champ', type: 'text', inputmode: 'numeric', maxlength: '4', placeholder: 'Nouveau code', autocomplete: 'off' });

    UI.ecran('ecran-coach',
      h('header', { class: 'entete-simple' }, retour, h('h1', null, 'Espace coach')),
      h('div', { class: 'coach-grille' },
        h('section', { class: 'bloc carte-claire' },
          h('h2', null, '📈 Suivi'),
          suivi()),
        h('section', { class: 'bloc carte-claire' },
          h('h2', null, '🧒 Enfant'),
          champ('Prénom', champPrenom),
          h('div', { class: 'champ-bloc' }, h('span', { class: 'champ-label' }, "L'enfant est"),
            segmente([{ v: 'f', label: 'une fille' }, { v: 'm', label: 'un garçon' }], prof.genre, v => { prof.genre = v; Store.sauver(); })),
          h('h3', null, 'Copains, famille, animaux'),
          h('p', { class: 'petit' }, 'Ces prénoms apparaîtront dans les histoires des problèmes.'),
          amis),
        h('section', { class: 'bloc carte-claire' },
          h('h2', null, '🎯 Niveau'),
          h('p', { class: 'petit' }, "Le grade monte tout seul quand l'enfant réussit 8 des 10 derniers problèmes. Vous pouvez aussi le changer ici."),
          h('div', { class: 'champ-bloc' }, h('span', { class: 'champ-label' }, 'Planète Plus-ou-Moins'),
            segmente([1, 2, 3].map(n => ({ v: n, label: `${n} · ${Store.grade(n)}` })), D.planetes.plusmoins.niveau, v => {
              D.planetes.plusmoins.niveau = v;
              D.planetes.plusmoins.historique = [];
              Store.sauver();
            })),
          h('ul', { class: 'liste-niveaux petit' },
            h('li', null, '1 · nombres jusqu\'à 100, problèmes simples, toutes les étapes guidées'),
            h('li', null, '2 · nombres jusqu\'à 1 000, comparaisons, « combien manque-t-il ? »'),
            h('li', null, '3 · nombres jusqu\'à 10 000, problèmes pièges, schéma facultatif'))),
        h('section', { class: 'bloc carte-claire' },
          h('h2', null, '🔊 Voix et sons'),
          interrupteur("Alvin parle tout seul", R().alvinParle, v => { R().alvinParle = v; }),
          interrupteur('Lecture automatique des problèmes', R().lectureAuto, v => { R().lectureAuto = v; }),
          interrupteur('Petits sons', R().sons, v => { R().sons = v; }),
          h('div', { class: 'champ-bloc' }, h('span', { class: 'champ-label' }, 'Vitesse de la voix'),
            segmente([{ v: 0.75, label: 'Lente' }, { v: 0.9, label: 'Normale' }, { v: 1.05, label: 'Rapide' }], R().vitesse, v => { R().vitesse = v; Store.sauver(); })),
          champ('Voix', choixVoix),
          h('button', { class: 'btn secondaire', onclick: () => Voix.dire(`Bonjour ${prof.prenom} ! Je suis Alvin, le chat astronaute.`) }, '▶ Tester la voix'),
          !Voix.disponible && h('p', { class: 'message-erreur' }, "La synthèse vocale n'est pas disponible sur cet appareil.")),
        h('section', { class: 'bloc carte-claire' },
          h('h2', null, '🔒 Sécurité et données'),
          h('div', { class: 'ligne-code' }, nouveauCode, h('button', {
            class: 'btn secondaire',
            onclick: () => {
              const c = nouveauCode.value.trim();
              if (!/^\d{4}$/.test(c)) { UI.toast('Le code doit contenir 4 chiffres.'); return; }
              prof.code = c; Store.sauver(); nouveauCode.value = ''; UI.toast('Nouveau code enregistré');
            },
          }, 'Changer le code')),
          h('p', { class: 'petit' }, 'Les progrès sont enregistrés uniquement sur cet appareil.'),
          h('button', {
            class: 'btn danger',
            onclick: () => UI.modal({
              titre: 'Tout recommencer ?',
              contenu: h('p', null, 'Les étoiles, autocollants, pièces de fusée, grades et le suivi seront effacés. Le prénom et les réglages sont gardés.'),
              boutons: [
                { label: 'Annuler', classe: 'secondaire' },
                { label: 'Oui, effacer', classe: 'danger', action: () => { Store.reinitialiserProgression(); UI.toast('Progression remise à zéro'); coach(); } },
              ],
            }),
          }, 'Remettre la progression à zéro'))));
  }

  function suivi() {
    const D = Store.data;
    const J = D.journal.filter(j => j.planete === 'plusmoins').slice(-40);
    const resume = h('div', { class: 'stats' },
      stat('Missions', D.missions),
      stat('Problèmes', D.journal.length),
      stat('Étoiles', D.etoiles),
      stat('Moyenne', J.length ? (J.reduce((s, j) => s + j.etoiles, 0) / J.length).toFixed(1).replace('.', ',') + ' ★' : '–'));
    if (!J.length) return [resume, h('p', { class: 'petit' }, "Le détail apparaîtra après les premiers problèmes.")];
    const ETAPES = [
      ['question', 'Trouver la question'],
      ['infos', 'Trouver les infos utiles'],
      ['schema', 'Faire le schéma'],
      ['operation', "Choisir l'opération"],
      ['calcul', 'Calculer'],
      ['reponse', 'Choisir la phrase réponse'],
    ];
    const lignes = ETAPES.map(([k, nom]) => {
      const n = J.filter(j => j.erreurs && j.erreurs[k] > 0).length;
      const pct = Math.round((100 * n) / J.length);
      return h('div', { class: 'ligne-stat' },
        h('span', { class: 'ligne-stat-nom' }, nom),
        h('span', { class: 'barre-stat' }, h('span', { style: { width: pct + '%' } })),
        h('span', { class: 'ligne-stat-val' }, pct + ' %'));
    });
    return [resume,
      h('h3', null, `Où se trompe-t-${Store.G('elle', 'il')} ? (${J.length} derniers problèmes)`),
      h('p', { class: 'petit' }, "Part des problèmes avec au moins une erreur à l'étape :"),
      h('div', { class: 'lignes-stats' }, lignes)];
  }

  function stat(label, valeur) {
    return h('div', { class: 'stat' }, h('span', { class: 'stat-val' }, String(valeur)), h('span', { class: 'stat-label' }, label));
  }

  return { config, carte, album, coach };
})();
