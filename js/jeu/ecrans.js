'use strict';
/* Écrans hors exploration : premier lancement, titre, histoire, voyage entre planètes, carnet, espace coach. */
const Ecrans = (() => {
  const { h } = UI;
  const R = () => Store.data.reglages;

  const NOTIONS = {
    plusmoins: { nom: 'Plus-ou-Moins', detail: 'additions, soustractions, comparaisons' },
    paquets: { nom: 'Paquets', detail: 'multiplications et partages' },
    marche: { nom: 'Marché', detail: 'la monnaie' },
    tictac: { nom: 'Tic-Tac', detail: 'mesures, durées et heures' },
    defi: { nom: 'Grand Défi', detail: 'problèmes à deux étapes' },
  };

  // Notions jouables (leurs problèmes sont écrits) et planètes à montrer dans le carnet
  const notionsJouables = () => Object.entries(NOTIONS).filter(([id]) => (Problemes.BANQUES[id] || []).length > 0);
  const planetesVisitables = () => Mondes.liste().filter(m => Store.data.debloquees.includes(m.id) && Jeu.planetePrete(m));

  // Icône au trait (repli texte si le module n'est pas chargé)
  function ic(nom, taille = 24) {
    if (typeof Icone !== 'undefined') return Icone.creer(nom, taille);
    return h('span', { class: 'icone-repli', 'aria-hidden': 'true' }, '•');
  }
  function portraitAlvin(humeur = 'normal', classe = '') {
    if (typeof Art !== 'undefined' && Art.portraitAlvin) return h('div', { class: 'portrait ' + classe, html: Art.portraitAlvin(humeur) });
    return Alvin.creer(110);
  }

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

  // Typographie française : espace insécable avant ; : ! ? » et après « (pas de signe seul en début de ligne)
  const typo = t => String(t).replace(/ ([;:!?»])/g, ' $1').replace(/« /g, '« ');

  function interrupteur(label, valeur, surChange, aide) {
    return h('label', { class: 'interrupteur' },
      h('span', { class: 'interrupteur-texte' }, label, aide && h('span', { class: 'interrupteur-aide' }, typo(aide))),
      h('input', { type: 'checkbox', checked: !!valeur, onchange: e => { surChange(e.target.checked); Store.sauver(); } }),
      h('span', { class: 'glissiere', 'aria-hidden': 'true' }));
  }

  // ---------------------------------------------------------------------------
  // Interrupteur « assistant vocal » (barre du haut du jeu et du panneau de résolution)
  // Un seul toucher coupe ou rallume la voix automatique d'Alvin (Store.reglerAssistantVocal) ;
  // tous les boutons affichés se mettent à jour ensemble (événement « assistant-vocal »).
  // ---------------------------------------------------------------------------
  function majBoutonVoix(b) {
    const actif = Store.assistantVocal();
    b.classList.toggle('coupee', !actif);
    b.setAttribute('aria-pressed', String(actif));
    b.setAttribute('aria-label', actif ? 'Assistant vocal activé (toucher pour le couper)' : 'Assistant vocal coupé (toucher pour le rallumer)');
    b.title = actif ? 'Couper la voix d’Alvin' : 'Rallumer la voix d’Alvin';
  }
  function basculerVoix() {
    const actif = !Store.assistantVocal();
    Store.reglerAssistantVocal(actif);
    if (!actif && typeof Voix !== 'undefined') Voix.stop();
    document.querySelectorAll('.btn-voix').forEach(majBoutonVoix);
    document.dispatchEvent(new CustomEvent('assistant-vocal', { detail: { actif } }));
    UI.toast(actif ? 'Alvin parle de nouveau tout seul.' : 'Alvin ne parle plus tout seul. Touche un haut-parleur pour l’écouter.');
  }
  function boutonVoix(classe = '') {
    const b = h('button', { class: 'btn-rond btn-voix ' + classe, type: 'button', 'data-action': 'assistant-vocal', onclick: () => { Sons.clic(); basculerVoix(); } }, ic('haut-parleur'));
    majBoutonVoix(b);
    return b;
  }

  function champ(label, input, aide) {
    return h('label', { class: 'champ-bloc' }, h('span', { class: 'champ-label' }, label), input, aide && h('span', { class: 'champ-aide' }, aide));
  }

  function entete(titre, retour) {
    return h('header', { class: 'entete-simple' },
      h('button', { class: 'btn-rond', 'aria-label': 'Retour', onclick: () => { Sons.clic(); retour(); } }, ic('retour')),
      h('h1', null, titre));
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
      histoire();
    };
    UI.ecran('ecran-config', h('div', { class: 'config-carte carte-papier' },
      portraitAlvin('content', 'portrait-config'),
      h('h1', null, 'Mission Galaxie'),
      h('p', { class: 'pour-adulte' }, 'Cet écran est à remplir par un adulte'),
      champ("Prénom de l'enfant", prenom, 'Il apparaîtra dans les histoires des problèmes.'),
      h('div', { class: 'champ-bloc' }, h('span', { class: 'champ-label' }, "L'enfant est"),
        segmente([{ v: 'f', label: 'une fille' }, { v: 'm', label: 'un garçon' }], genre, v => { genre = v; })),
      champ('Code coach', code, 'Il protège les réglages et le suivi des progrès.'),
      message,
      h('button', { class: 'btn principal grand', onclick: valider }, "Commencer l'aventure")));
  }

  // ---------------------------------------------------------------------------
  // Écran titre
  // ---------------------------------------------------------------------------
  function titre() {
    const D = Store.data;
    let planete = Mondes.get(D.planeteActuelle);
    if (!Jeu.planetePrete(planete)) planete = Mondes.liste().find(Jeu.planetePrete) || Mondes.liste()[0];
    const vignette = id => h('span', { class: 'titre-planete titre-planete-' + id, 'aria-hidden': 'true', html: typeof Art !== 'undefined' && Art.vignettePlanete ? Art.vignettePlanete(id) : '' });
    UI.ecran('ecran-titre',
      // décor fixe : ciel étoilé et deux planètes en partie hors cadre
      h('div', { class: 'titre-decor', 'aria-hidden': 'true' }, decorEtoiles(14, 3), vignette('paquets'), vignette('marche')),
      h('div', { class: 'titre-contenu' },
        portraitAlvin('normal', 'portrait-titre'),
        h('h1', { class: 'titre-jeu' }, 'Mission Galaxie'),
        h('p', { class: 'titre-sous' }, `${Store.grade(Store.niveau(planete.notion))} ${D.profil.prenom}`),
        h('button', { class: 'btn principal grand', onclick: () => { Sons.clic(); Jeu.ouvrirPlanete(planete.id); } }, ic('lecture'), 'Jouer'),
        h('div', { class: 'titre-actions' },
          h('button', { class: 'btn secondaire', onclick: () => { Sons.clic(); espace(); } }, ic('fusee'), 'Voyager'),
          h('button', { class: 'btn secondaire', onclick: () => { Sons.clic(); carnet(titre); } }, ic('livre'), 'Mon carnet'),
          h('button', { class: 'btn-rond', 'aria-label': 'Espace coach', onclick: () => { Sons.clic(); demanderCode(titre); } }, ic('engrenage')))),
      h('p', { class: 'titre-etoiles' }, ic('etoile', 20), ` ${UI.fmt(D.etoiles)} étoiles`));
  }

  // ---------------------------------------------------------------------------
  // Histoire de départ
  // ---------------------------------------------------------------------------
  function histoire() {
    const prenom = Store.data.profil.prenom;
    const pages = [
      { humeur: 'content', texte: `Bonjour ${prenom} ! Je m'appelle Alvin. Je suis un chat astronaute, et je voyage de planète en planète.` },
      { humeur: 'content', texte: "Sur chaque planète vivent des habitants très gentils… qui ont plein de problèmes de maths à résoudre !" },
      { humeur: 'normal', texte: "Touche l'écran pour me faire marcher. Quand tu vois un point d'exclamation au-dessus d'un habitant, va lui parler : il a besoin d'aide." },
      { humeur: 'content', texte: "Chaque problème résolu ouvre de nouveaux chemins. Et quand tu aides le chef de la planète, ma fusée peut s'envoler vers la suivante. On y va ?" },
    ];
    let i = 0;
    const zone = h('div', { class: 'histoire-page' });
    const points = h('div', { class: 'histoire-points' }, pages.map(() => h('span')));
    const bouton = h('button', { class: 'btn principal grand', onclick: suivant });
    function afficher() {
      UI.vider(zone);
      zone.append(portraitAlvin(pages[i].humeur, 'portrait-histoire'), h('p', { class: 'histoire-texte' }, pages[i].texte));
      [...points.children].forEach((p, k) => p.classList.toggle('actif', k === i));
      UI.vider(bouton);
      bouton.append(i < pages.length - 1 ? 'Suivant' : "C'est parti !", ic(i < pages.length - 1 ? 'suivant' : 'fusee'));
      if (R().alvinParle) Voix.dire(pages[i].texte);
    }
    function suivant() {
      Sons.clic();
      if (i < pages.length - 1) { i++; afficher(); return; }
      Store.data.introVue = true;
      Store.sauver();
      Jeu.ouvrirPlanete(Store.data.planeteActuelle);
    }
    UI.ecran('ecran-histoire', h('div', { class: 'histoire carte-papier' }, zone, points, bouton));
    afficher();
  }

  // ---------------------------------------------------------------------------
  // Voyage entre les planètes
  // ---------------------------------------------------------------------------
  // Une carte de l'espace : les planètes le long d'une route en pointillés, sur un ciel étoilé.
  // Paysage : la route serpente de gauche à droite ; portrait : de haut en bas (positions en % de la scène).
  function positionsRoute(n) {
    const pts = (axe, travers) => Array.from({ length: n }, (_, i) => {
      const a = (100 * (i + (axe === 'y' ? 0.42 : 0.5))) / n, t = i % 2 ? travers[1] : travers[0];   // en portrait, un peu plus haut : le nom tient sous la dernière planète
      return axe === 'x' ? [a, t] : [t, a];
    });
    return { paysage: pts('x', [64, 32]), portrait: pts('y', [30, 70]) };
  }
  function cheminRoute(p, vertical) {
    let d = `M${p[0][0]} ${p[0][1]}`;
    for (let i = 1; i < p.length; i++) {
      const [x0, y0] = p[i - 1], [x1, y1] = p[i];
      // départ et arrivée à l'horizontale : la route ne traverse jamais le nom écrit sous une planète
      d += vertical ? ` C${x0 + (x1 - x0) * 0.9} ${y0} ${x1 - (x1 - x0) * 0.9} ${y1} ${x1} ${y1}` : ` C${(x0 + x1) / 2} ${y0} ${(x0 + x1) / 2} ${y1} ${x1} ${y1}`;
    }
    return d;
  }

  function espace() {
    const D = Store.data;
    const planetes = Mondes.liste();
    const pos = positionsRoute(planetes.length);
    const route = h('div', {
      class: 'espace-route', 'aria-hidden': 'true',
      html: '<svg viewBox="0 0 100 100" preserveAspectRatio="none">'
        + `<path class="route-paysage" d="${cheminRoute(pos.paysage, false)}" vector-effect="non-scaling-stroke"/>`
        + `<path class="route-portrait" d="${cheminRoute(pos.portrait, true)}" vector-effect="non-scaling-stroke"/></svg>`,
    });
    const liste = h('div', { class: 'espace-planetes' }, decorEtoiles(18, 7), route);
    planetes.forEach((m, i) => {
      const ouverte = D.debloquees.includes(m.id);
      const prete = Jeu.planetePrete(m);
      const et = D.planetes[m.id];
      const aides = et ? Object.values(et.pnj).filter(n => n >= 4).length : 0;
      const ici = D.planeteActuelle === m.id;
      liste.append(h('button', {
        class: 'espace-planete' + (ouverte && prete ? '' : ' fermee') + (ici ? ' ici' : ''),
        style: `--x:${pos.paysage[i][0]}%;--y:${pos.paysage[i][1]}%;--xp:${pos.portrait[i][0]}%;--yp:${pos.portrait[i][1]}%`,
        onclick: () => {
          Sons.clic();
          if (!prete) {
            UI.toast(`Les habitants de la ${m.nom} préparent encore leurs problèmes : bientôt disponible !`);
            return;
          }
          if (!ouverte) {
            const avant = planetes[i - 1];
            UI.toast(`Aide le chef de la ${avant ? avant.nom : 'planète précédente'} pour ouvrir cette route.`);
            return;
          }
          voyager(m);
        },
      },
        h('span', { class: 'espace-astre' },
          h('span', { class: 'espace-vignette', html: typeof Art !== 'undefined' && Art.vignettePlanete ? Art.vignettePlanete(m.id) : '' }),
          !(ouverte && prete) && h('span', { class: 'espace-cadenas' }, ic('cadenas', 22)),
          ici && h('span', { class: 'espace-alvin', html: typeof Art !== 'undefined' && Art.portraitAlvin ? Art.portraitAlvin('content') : '' })),
        h('span', { class: 'espace-nom' }, m.nom),
        h('span', { class: 'espace-detail' }, !prete ? 'Bientôt disponible' : ouverte ? `${aides} / ${m.pnj.length} habitants aidés` : 'Route fermée'),
        ici && h('span', { class: 'espace-ici' }, 'Tu es ici')));
    });
    UI.ecran('ecran-espace',
      entete('Voyager', () => Jeu.ouvrirPlanete(D.planeteActuelle)),
      h('p', { class: 'espace-intro' }, 'Choisis une planète. Les routes s’ouvrent quand tu aides le chef de chaque planète.'),
      liste);
  }

  // Petite étoile plate à 4 branches (SVG), couleur = currentColor
  function etoile() {
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1 Q11.3 8.7 19 10 Q11.3 11.3 10 19 Q8.7 11.3 1 10 Q8.7 8.7 10 1 Z" fill="currentColor"/></svg>';
  }
  // Ciel étoilé fixe (positions déterministes) : étoiles plates moutarde et papier, en % de la zone
  function decorEtoiles(n, graine = 1) {
    let a = graine * 9301 + 49297;
    const r = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
    const ciel = h('div', { class: 'ciel', 'aria-hidden': 'true' });
    for (let i = 0; i < n; i++) {
      const taille = 8 + Math.round(r() * 12);
      ciel.append(h('span', {
        class: 'ciel-etoile' + (r() < 0.45 ? ' moutarde' : ''),
        style: { left: (3 + r() * 94).toFixed(1) + '%', top: (3 + r() * 94).toFixed(1) + '%', width: taille + 'px', height: taille + 'px' },
        html: etoile(),
      }));
    }
    return ciel;
  }

  function voyager(m) {
    const D = Store.data;
    if (m.id === D.planeteActuelle) { Jeu.ouvrirPlanete(m.id); return; }
    const ecran = UI.ecran('ecran-voyage',
      h('div', { class: 'voyage' },
        h('div', { class: 'voyage-fusee' }, ic('fusee', 96)),
        h('p', { class: 'voyage-texte' }, `Direction : ${m.nom}`)));
    if (R().alvinParle) Voix.dire(`En route vers la ${m.nom} !`);
    Sons.victoire();
    setTimeout(() => { if (document.body.contains(ecran)) Jeu.ouvrirPlanete(m.id); }, 2400);
  }

  // ---------------------------------------------------------------------------
  // Carnet : amis aidés, souvenirs, grades
  // ---------------------------------------------------------------------------
  function carnet(retour) {
    const D = Store.data;
    const contenu = h('div', { class: 'carnet-contenu' });
    const onglets = [
      { id: 'amis', label: 'Mes amis', rendre: rendreAmis },
      { id: 'souvenirs', label: 'Souvenirs', rendre: rendreSouvenirs },
      { id: 'grades', label: 'Mes grades', rendre: rendreGrades },
    ];
    let actif = 'amis';
    const barre = h('div', { class: 'carnet-onglets segmente' });
    function afficher() {
      UI.vider(barre);
      onglets.forEach(o => barre.append(h('button', { class: o.id === actif ? 'actif' : '', onclick: () => { Sons.clic(); actif = o.id; afficher(); } }, o.label)));
      UI.vider(contenu);
      onglets.find(o => o.id === actif).rendre();
    }
    function rendreAmis() {
      for (const m of planetesVisitables()) {
        const grille = h('div', { class: 'carnet-grille' });
        m.pnj.forEach(p => {
          const connu = D.carnet.includes(m.id + ':' + p.id);
          grille.append(h('div', { class: 'carnet-ami' + (connu ? '' : ' inconnu') },
            // portrait recadré autour de l'habitant ; inconnu : sa silhouette grise
            h('div', { class: 'carnet-portrait', html: typeof Art !== 'undefined' ? Art.portraitPNJ(p.apparence).replace('viewBox="0 0 100 100"', 'viewBox="12 10 76 88"') : '' }),
            h('span', { class: 'carnet-nom' }, connu ? p.nom : '???'),
            h('span', { class: 'carnet-role' }, connu ? p.role : 'Pas encore rencontré')));
        });
        contenu.append(h('section', { class: 'carnet-section carte-papier' }, h('h2', null, m.nom), grille));
      }
    }
    function rendreSouvenirs() {
      for (const m of planetesVisitables()) {
        const grille = h('div', { class: 'carnet-grille' });
        m.coffres.forEach(c => {
          const trouve = D.souvenirs.includes(c.souvenir.id);
          grille.append(h('div', { class: 'carnet-souvenir' + (trouve ? '' : ' inconnu') },
            h('div', { class: 'carnet-portrait', html: trouve && typeof Art !== 'undefined' && Art.souvenir ? Art.souvenir(c.souvenir.id) : '' }, trouve && typeof Art !== 'undefined' && Art.souvenir ? null : ic(trouve ? 'coffre' : 'question', 36)),
            h('span', { class: 'carnet-nom' }, trouve ? c.souvenir.nom : 'Coffre à trouver')));
        });
        contenu.append(h('section', { class: 'carnet-section carte-papier' }, h('h2', null, m.nom), grille));
      }
    }
    function rendreGrades() {
      const liste = h('div', { class: 'carnet-grades' });
      for (const [id, n] of notionsJouables()) {
        const niveau = Store.niveau(id);
        const hist = D.notions[id].historique;
        const recents = hist.slice(-Store.PROMOTION.sur).reduce((a, b) => a + b, 0);
        const manque = Math.max(0, Store.PROMOTION.faits - hist.length);
        liste.append(h('div', { class: 'carnet-grade carte-papier' },
          h('div', { class: 'carnet-grade-titre' }, h('b', null, n.nom), h('span', null, n.detail)),
          h('div', { class: 'carnet-grade-etoiles' }, [1, 2, 3].map(k => ic(k <= niveau ? 'etoile' : 'etoile-vide', 22))),
          h('div', null, Store.grade(niveau)),
          niveau < 3 && h('div', { class: 'barre-progres' }, h('span', { style: { width: Math.min(100, Math.min(recents / Store.PROMOTION.reussis, hist.length / Store.PROMOTION.faits) * 100) + '%' } })),
          niveau < 3 && h('p', { class: 'petit' }, manque
            ? `Encore ${manque} problème${manque > 1 ? 's' : ''} au moins, et 8 réussis sur les 10 derniers, pour devenir ${Store.grade(niveau + 1)}.`
            : `Réussis 8 des 10 derniers problèmes (3 étoiles, ou 2 avec la bonne opération) pour devenir ${Store.grade(niveau + 1)}.`)));
      }
      contenu.append(liste);
    }
    UI.ecran('ecran-carnet', entete('Mon carnet', retour || titre), h('div', { class: 'carnet' }, barre, contenu));
    afficher();
  }

  // ---------------------------------------------------------------------------
  // Espace coach (protégé par le code)
  // ---------------------------------------------------------------------------
  function demanderCode(retour) {
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
          if (saisie === Store.data.profil.code) { fenetre.fermer(); coach(retour); }
          else { Sons.oups(); UI.secouer(points); saisie = ''; setTimeout(maj, 300); }
        }
      },
      effacer: () => { saisie = saisie.slice(0, -1); maj(); },
      valider: () => {},
    });
    // Code oublié : appui long de 5 secondes sur le cadenas
    let minuteur;
    const cadenas = h('div', { class: 'cadenas' }, ic('cadenas', 40));
    cadenas.addEventListener('pointerdown', () => { minuteur = setTimeout(() => UI.toast('Code coach : ' + Store.data.profil.code), 5000); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => cadenas.addEventListener(ev, () => clearTimeout(minuteur)));
    fenetre = UI.modal({
      titre: 'Espace coach',
      contenu: [cadenas, h('p', null, 'Entre le code coach.'), points, clavier],
      boutons: [{ label: 'Annuler', classe: 'secondaire' }],
      classe: 'modal-code',
    });
  }

  function coach(retour = titre) {
    const D = Store.data, prof = D.profil;

    const champPrenom = h('input', {
      class: 'champ', type: 'text', value: prof.prenom, maxlength: '20',
      onchange: e => { const v = e.target.value.trim(); if (v) { prof.prenom = v; Store.sauver(); UI.toast('Prénom enregistré'); } else e.target.value = prof.prenom; },
    });

    const amis = h('div', { class: 'liste-amis' });
    const rendreAmis = () => {
      UI.vider(amis);
      prof.amis.forEach((a, i) => {
        amis.append(h('div', { class: 'ligne-ami' },
          h('input', { class: 'champ', type: 'text', value: a.n, maxlength: '20', placeholder: 'Prénom', onchange: e => { a.n = e.target.value.trim(); Store.sauver(); } }),
          segmente([{ v: 'f', label: 'Fille' }, { v: 'm', label: 'Garçon' }], a.g, v => { a.g = v; Store.sauver(); }),
          h('button', { class: 'btn-rond petit', 'aria-label': 'Supprimer ce prénom', onclick: () => { prof.amis.splice(i, 1); Store.sauver(); rendreAmis(); } }, ic('croix', 18))));
      });
      if (prof.amis.length < 12) {
        amis.append(h('button', {
          class: 'btn secondaire',
          onclick: () => { prof.amis.push({ n: '', g: 'f' }); Store.sauver(); rendreAmis(); const c = amis.querySelectorAll('input'); c[c.length - 1].focus(); },
        }, ic('plus', 20), 'Ajouter un prénom'));
      }
    };
    rendreAmis();

    // Test de la voix avec diagnostic (pour comprendre une tablette muette)
    const diagnosticVoix = h('p', { class: 'diagnostic-voix petit', role: 'status' });
    const testerVoix = texte => {
      let demarre = false;
      diagnosticVoix.textContent = 'Test en cours…';
      const bilan = () => {
        const d = Voix.diagnostic ? Voix.diagnostic() : { journal: [] };
        return `Voix françaises trouvées : ${d.voixFr}. Voix choisie : ${d.choisie || 'aucune'}. Détail : ${d.journal.join(' · ') || 'rien'}.`;
      };
      Voix.dire(texte, {
        onSegment: i => { if (i === 0 && !demarre) { demarre = true; diagnosticVoix.textContent = 'La voix a démarré. Si tu n’entends rien, vérifie le volume « média » de la tablette. ' + bilan(); } },
        onFin: () => { if (!demarre) diagnosticVoix.textContent = 'Aucun son n’a démarré. ' + bilan(); },
      });
    };

    // Voix : liste triée par qualité
    const choixVoix =h('select', { class: 'champ', onchange: e => { R().voixNom = e.target.value; Store.sauver(); Voix.choisir(); } });
    const remplirVoix = () => {
      UI.vider(choixVoix);
      choixVoix.append(h('option', { value: '' }, 'Automatique (la meilleure)'));
      const liste = Voix.listeTriee ? Voix.listeTriee() : Voix.voixFr();
      const noms = { naturelle: 'naturelle', bonne: 'correcte', basique: 'robotique' };
      for (const v of liste) {
        const q = Voix.qualite ? noms[Voix.qualite(v)] : '';
        const o = h('option', { value: v.name }, `${v.name}${q ? ' — ' + q : ''}`);
        if (v.name === R().voixNom) o.selected = true;
        choixVoix.append(o);
      }
    };
    remplirVoix();
    setTimeout(remplirVoix, 800);

    const nouveauCode = h('input', { class: 'champ', type: 'text', inputmode: 'numeric', maxlength: '4', placeholder: 'Nouveau code', autocomplete: 'off' });

    // Assistant vocal : le même réglage que le bouton haut-parleur du jeu (alvinParle + lectureAuto)
    const caseLecture = interrupteur('Lecture automatique des problèmes', R().alvinParle && R().lectureAuto, v => { R().lectureAuto = v; },
      'Alvin lit l’énoncé à voix haute en ouvrant chaque problème.');
    const inputLecture = caseLecture.querySelector('input');
    const majLecture = () => { inputLecture.disabled = !R().alvinParle; inputLecture.checked = R().alvinParle && R().lectureAuto; };
    const caseAssistant = interrupteur('Assistant vocal (Alvin parle tout seul)', R().alvinParle, v => {
      Store.reglerAssistantVocal(v);
      if (!v && typeof Voix !== 'undefined') Voix.stop();
      majLecture();
    }, 'Coupé : Alvin ne parle plus de lui-même ; l’enfant peut toujours toucher un haut-parleur pour l’écouter. Le bouton haut-parleur en haut du jeu fait la même chose.');
    caseAssistant.classList.add('interrupteur-assistant');
    majLecture();

    UI.ecran('ecran-coach',
      entete('Espace coach', retour),
      h('div', { class: 'coach-grille' },
        h('section', { class: 'bloc carte-papier' }, h('h2', null, 'Suivi'), suivi()),
        h('section', { class: 'bloc carte-papier bloc-lecture' }, h('h2', null, `Lit-${Store.G('elle', 'il')} vraiment ?`), suiviLecture()),
        h('section', { class: 'bloc carte-papier' },
          h('h2', null, 'Enfant'),
          champ('Prénom', champPrenom),
          h('div', { class: 'champ-bloc' }, h('span', { class: 'champ-label' }, "L'enfant est"),
            segmente([{ v: 'f', label: 'une fille' }, { v: 'm', label: 'un garçon' }], prof.genre, v => { prof.genre = v; Store.sauver(); })),
          h('h3', null, 'Copains, famille, animaux'),
          h('p', { class: 'petit' }, 'Ces prénoms apparaîtront dans les histoires des problèmes.'),
          amis),
        h('section', { class: 'bloc carte-papier' },
          h('h2', null, 'Grades'),
          h('p', { class: 'petit' }, "Chaque grade monte tout seul après au moins 12 problèmes au grade actuel, si l'enfant en réussit 8 des 10 derniers (3 étoiles, ou 2 étoiles sans se tromper d'opération). Il redescend doucement d'un cran si 4 des 6 derniers problèmes n'ont eu qu'une étoile. Vous pouvez aussi le régler ici : 1 = nombres jusqu'à 100, 2 = jusqu'à 1 000, 3 = jusqu'à 10 000 avec problèmes pièges."),
          notionsJouables().map(([id, n]) => h('div', { class: 'champ-bloc' },
            h('span', { class: 'champ-label' }, `${n.nom} (${n.detail})`),
            segmente([1, 2, 3].map(k => ({ v: k, label: String(k) })), Store.niveau(id), v => {
              D.notions[id].niveau = v;
              D.notions[id].historique = [];
              D.notions[id].etoilesRecentes = [];
              Store.sauver();
            })))),
        h('section', { class: 'bloc carte-papier' },
          h('h2', null, 'Voix et sons'),
          caseAssistant,
          caseLecture,
          interrupteur('Petits sons', R().sons, v => { R().sons = v; }),
          h('div', { class: 'champ-bloc' }, h('span', { class: 'champ-label' }, 'Vitesse de la voix'),
            segmente([{ v: 0.8, label: 'Lente' }, { v: 0.95, label: 'Normale' }, { v: 1.1, label: 'Rapide' }], R().vitesse, v => { R().vitesse = v; Store.sauver(); })),
          champ('Voix', choixVoix),
          h('button', { class: 'btn secondaire', onclick: () => testerVoix(`Bonjour ${prof.prenom} ! Je suis Alvin, le chat astronaute. Le bus part à 8 h 05 et coûte 2 €.`) }, ic('haut-parleur', 20), 'Tester la voix'),
          diagnosticVoix,
          Voix.conseil && h('p', { class: 'conseil-voix petit' }, Voix.conseil()),
          !Voix.disponible && h('p', { class: 'message-erreur' }, "La synthèse vocale n'est pas disponible sur cet appareil.")),
        h('section', { class: 'bloc carte-papier' },
          h('h2', null, 'Temps de jeu'),
          h('p', { class: 'petit' }, 'Alvin propose une pause après ce temps de jeu.'),
          segmente([{ v: 0, label: 'Jamais' }, { v: 15, label: '15 min' }, { v: 25, label: '25 min' }, { v: 40, label: '40 min' }], R().pause, v => { R().pause = v; Store.sauver(); })),
        h('section', { class: 'bloc carte-papier' },
          h('h2', null, 'Sécurité et données'),
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
              contenu: h('p', null, 'Les étoiles, amis, souvenirs, planètes et grades seront effacés. Le prénom et les réglages sont gardés.'),
              boutons: [
                { label: 'Annuler', classe: 'secondaire' },
                { label: 'Oui, effacer', classe: 'danger', action: () => { Store.reinitialiserProgression(); UI.toast('Progression remise à zéro'); coach(retour); } },
              ],
            }),
          }, 'Remettre la progression à zéro'))));
  }

  function suivi() {
    const D = Store.data;
    const J = D.journal.slice(-60);
    const resume = h('div', { class: 'stats' },
      stat('Problèmes', D.journal.length),
      stat('Étoiles', D.etoiles),
      stat('Amis', D.carnet.length),
      stat('Moyenne', J.length ? (J.reduce((s, j) => s + j.etoiles, 0) / J.length).toFixed(1).replace('.', ',') + ' / 3' : '–'));
    if (!J.length) return [resume, h('p', { class: 'petit' }, 'Le détail apparaîtra après les premiers problèmes.')];
    const ETAPES = [
      ['question', 'Trouver la question'],
      ['infos', 'Trouver les infos utiles'],
      ['plan', 'Choisir la 1re étape (Grand Défi)'],
      ['schema', 'Faire le schéma'],
      ['operation', "Choisir l'opération"],
      ['calcul', 'Calculer'],
      ['reponse', 'Choisir la phrase réponse'],
    ].filter(([k]) => k !== 'plan' || notionsJouables().some(([id]) => id === 'defi'));   // le plan n'existe qu'au Grand Défi (vague 2)
    const lignes = ETAPES.map(([k, nom]) => {
      const n = J.filter(j => j.erreurs && j.erreurs[k] > 0).length;
      const pct = Math.round((100 * n) / J.length);
      return h('div', { class: 'ligne-stat' },
        h('span', { class: 'ligne-stat-nom' }, nom),
        h('span', { class: 'barre-stat' }, h('span', { style: { width: pct + '%' } })),
        h('span', { class: 'ligne-stat-val' }, pct + ' %'));
    });
    const parNotion = Object.entries(NOTIONS).map(([id, n]) => {
      const L = J.filter(j => j.notion === id);
      if (!L.length) return null;
      const moy = (L.reduce((s, j) => s + j.etoiles, 0) / L.length).toFixed(1).replace('.', ',');
      return h('div', { class: 'ligne-stat' }, h('span', { class: 'ligne-stat-nom' }, n.nom), h('span', { class: 'petit' }, `${L.length} problèmes`), h('span', { class: 'ligne-stat-val' }, moy + ' ★'));
    }).filter(Boolean);
    return [resume,
      h('h3', null, `Où se trompe-t-${Store.G('elle', 'il')} ? (${J.length} derniers problèmes)`),
      h('p', { class: 'petit' }, "Part des problèmes avec au moins une erreur à l'étape :"),
      h('div', { class: 'lignes-stats' }, lignes),
      h('h3', null, 'Par planète'),
      h('div', { class: 'lignes-stats' }, parNotion)];
  }

  // « Lit-elle vraiment ? » : réussite sur les problèmes qui obligent à lire (nombre piège, mot-piège,
  // information manquante) comparée aux problèmes ordinaires, temps avant de répondre, conseil pour l'adulte.
  // Seuls les problèmes enregistrés avec leurs mesures de lecture (res.lecture) sont comptés.
  function suiviLecture() {
    const D = Store.data;
    const J = D.journal.filter(j => j.lecture).slice(-60);
    const elle = Store.G('elle', 'il');
    if (J.length < 3) {
      return h('p', { class: 'petit' }, `Après quelques problèmes, vous verrez ici si ${elle} lit vraiment les énoncés : réussite sur les problèmes à piège comparée aux problèmes ordinaires, et temps de lecture.`);
    }
    const pct = L => (L.length ? Math.round((100 * L.filter(Store.reussi).length) / L.length) : null);
    const groupes = [
      ['Avec un nombre inutile', J.filter(j => j.pieges > 0)],
      ['Mot-piège (« gagne » pour une soustraction…)', J.filter(j => j.motPiege)],
      ['« Il manque une information »', J.filter(j => j.typeReponse === 'impossible')],
      ['Problèmes ordinaires', J.filter(j => !(j.pieges > 0) && !j.motPiege && (j.typeReponse || 'nombre') === 'nombre')],
    ];
    const lignes = groupes.map(([nom, L]) => {
      const p = pct(L);
      return h('div', { class: 'ligne-stat' },
        h('span', { class: 'ligne-stat-nom' }, typo(nom), h('span', { class: 'ligne-stat-nb' }, ` (${L.length})`)),
        h('span', { class: 'barre-stat reussite' }, h('span', { style: { width: (p || 0) + '%' } })),
        h('span', { class: 'ligne-stat-val' }, p == null ? '–' : p + ' %'));
    });
    const mesures = J.filter(j => typeof j.lecture.ms === 'number');
    const moyenne = mesures.length ? mesures.reduce((s, j) => s + j.lecture.ms, 0) / mesures.length / 1000 : null;
    const parMot = mesures.length ? mesures.reduce((s, j) => s + j.lecture.ms / Math.max(1, j.lecture.mots), 0) / mesures.length / 1000 : null;
    const rapides = J.filter(j => j.lecture.rapide).length;
    const devines = J.filter(Store.devine).length;
    const virgule = x => x.toFixed(1).replace('.', ',');

    // Conseil : le plus utile d'abord
    const [, pieges] = groupes[0], [, mots] = groupes[1], [, manque] = groupes[2], [, ordinaires] = groupes[3];
    const ecart = (L) => (L.length >= 3 && ordinaires.length >= 3 ? pct(ordinaires) - pct(L) : 0);
    let conseil;
    if (rapides / J.length > 0.3) conseil = `${Store.G('Elle', 'Il')} répond souvent avant d'avoir eu le temps de lire. Avant de toucher un nombre, demandez-lui de lire l'histoire à voix haute (ou de l'écouter jusqu'au bout), puis de la raconter avec ses mots.`;
    else if (ecart(mots) >= 20) conseil = `Les mots « gagne », « perd », « de plus » ${elle === 'elle' ? 'la' : 'le'} trompent : ${elle} choisit l'opération d'après un mot. Demandez-lui de raconter l'histoire et de dire qui a le plus, avant de choisir + ou −.`;
    else if (ecart(manque) >= 20) conseil = `Quand il manque une information, ${elle} calcule quand même. Prenez l'habitude de demander : « Est-ce qu'on a tout ce qu'il faut pour répondre ? »`;
    else if (ecart(pieges) >= 20) conseil = `${Store.G('Elle', 'Il')} utilise tous les nombres de l'énoncé. Demandez-lui, pour chaque nombre : « Est-ce qu'il sert à répondre à la question ? »`;
    else conseil = `${Store.G('Elle', 'Il')} lit bien les énoncés : les pièges ne ${elle === 'elle' ? 'la' : 'le'} gênent pas plus que les problèmes ordinaires. Continuez à l'encourager à lire jusqu'au bout.`;

    return [
      h('p', { class: 'petit' }, `Réussite (3 étoiles, ou 2 sans erreur d'opération) sur les ${J.length} derniers problèmes, selon le piège :`),
      h('div', { class: 'lignes-stats' }, lignes),
      h('div', { class: 'stats stats-lecture' },
        stat('Temps moyen avant de répondre', moyenne == null ? '–' : virgule(moyenne) + ' s'),
        stat('Par mot de l’énoncé', parMot == null ? '–' : virgule(parMot) + ' s'),
        stat('Réponses trop rapides', `${rapides} / ${J.length}`),
        stat('Résolus en devinant', `${devines} / ${J.length}`)),
      h('p', { class: 'conseil-lecture' }, h('b', null, 'Conseil : '), typo(conseil)),
    ];
  }

  function stat(label, valeur) {
    return h('div', { class: 'stat' }, h('span', { class: 'stat-val' }, String(valeur)), h('span', { class: 'stat-label' }, label));
  }

  return { config, titre, histoire, espace, carnet, coach, demanderCode, NOTIONS, ic, segmente, etoile, decorEtoiles, boutonVoix, basculerVoix };
})();
