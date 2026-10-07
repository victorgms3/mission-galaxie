'use strict';
/*
 * Le jeu : une planète à explorer avec Alvin.
 * Habitants (4 problèmes chacun), zones qui s'ouvrent, coffres à calcul mental, fusée pour voyager.
 */
const Jeu = (() => {
  const { h } = UI;
  const R = () => Store.data.reglages;
  const PAR_PNJ = 4;

  let moteur = null;
  let monde = null;
  let etat = null;
  let ui = {};
  let minuteurSauvegarde = null;
  let minuteurPause = null;
  let minuteurBulle = null;
  let dialogueOuvert = null;
  let generation = 0;   // change à chaque fermeture de planète : les suites en attente s'arrêtent
  let chaine = 0;       // suites (dialogues, fenêtres, animations) en cours après un problème

  const ic = (nom, taille) => Ecrans.ic(nom, taille);
  const portraitPNJ = p => (typeof Art !== 'undefined' && Art.portraitPNJ ? Art.portraitPNJ(p.apparence) : '');
  const portraitAlvin = humeur => (typeof Art !== 'undefined' && Art.portraitAlvin ? Art.portraitAlvin(humeur) : '');
  const pnjDe = id => monde.pnj.find(p => p.id === id);
  const faitsDe = id => etat.pnj[id] || 0;
  const zoneOuverte = z => etat.zones.includes(z);
  const choix = t => t[Math.floor(Math.random() * t.length)];

  // Une planète n'est jouable que si sa notion a des problèmes (les banques arrivent par vagues)
  function planetePrete(m) {
    return !!m && (Problemes.BANQUES[m.notion] || []).length > 0;
  }

  function planeteSuivante() {
    const liste = Mondes.liste();
    return liste[liste.findIndex(m => m.id === monde.id) + 1] || null;
  }

  // ---------------------------------------------------------------------------
  // Ouvrir / fermer une planète
  // ---------------------------------------------------------------------------
  function ouvrirPlanete(id) {
    fermer();
    monde = Mondes.get(id);
    // une planète pas encore prête (problèmes à venir) ne s'ouvre jamais : on revient sur une planète jouable
    if (!planetePrete(monde)) monde = Mondes.liste().find(planetePrete) || Mondes.liste()[0];
    const D = Store.data;
    D.planeteActuelle = monde.id;
    if (!D.debloquees.includes(monde.id)) D.debloquees.push(monde.id);
    etat = Store.planete(monde.id);
    const premiereVisite = !etat.visitee;
    etat.visitee = true;
    Store.sauver();

    const canvas = h('canvas', { class: 'monde-canvas', 'aria-label': `Carte de la ${monde.nom}` });
    ui = construireHud();
    UI.ecran('ecran-jeu', canvas, ui.racine);

    moteur = Moteur.creer(canvas, monde, {
      etat: {
        portesOuvertes: etat.zones.slice(),
        coffresOuverts: etat.coffres.slice(),
        marques: marques(),
        pos: etat.pos || null,
      },
      surArrivee: interagir,
      surTouche: () => fermerBulle(),
      surDeplacement: (x, y) => {
        etat.pos = { x: Math.round(x), y: Math.round(y) };
        clearTimeout(minuteurSauvegarde);
        minuteurSauvegarde = setTimeout(() => { minuteurSauvegarde = null; Store.sauver(); }, 1500);
      },
    });
    moteur.demarrer();
    majHud();
    programmerPause();

    if (premiereVisite) raconter(monde.arrivee, 'content', 12000);
    else raconter(conseil(), 'normal', 7000);
  }

  function fermer() {
    generation++;
    chaine = 0;
    if (minuteurSauvegarde) { clearTimeout(minuteurSauvegarde); minuteurSauvegarde = null; Store.sauver(); }
    if (moteur) { moteur.arreter(); moteur = null; }
    clearTimeout(minuteurPause);
    clearTimeout(minuteurBulle);
    if (typeof Resolution !== 'undefined' && Resolution.fermer) Resolution.fermer();
    if (dialogueOuvert) dialogueOuvert.remove();
    dialogueOuvert = null;
  }

  function quitterVers(fn) {
    fermer();
    Store.sauver();
    fn();
  }

  function marques() {
    const m = {};
    for (const p of monde.pnj) {
      m[p.id] = faitsDe(p.id) >= PAR_PNJ ? 'ok' : zoneOuverte(p.zone) ? '!' : null;
    }
    return m;
  }

  function conseil() {
    const restants = monde.pnj.filter(p => zoneOuverte(p.zone) && faitsDe(p.id) < PAR_PNJ);
    if (etat.terminee) return 'Tous les habitants sont aidés ! Tu peux encore t’entraîner avec eux, ou prendre la fusée pour voyager.';
    if (restants.length) return `Va voir les habitants avec un point d'exclamation : ${restants.slice(0, 3).map(p => p.nom).join(', ')}…`;
    return 'Continue à explorer : un nouveau passage va bientôt s’ouvrir !';
  }

  // ---------------------------------------------------------------------------
  // Interface par-dessus la carte
  // ---------------------------------------------------------------------------
  function construireHud() {
    const titre = h('b', null, '');
    const sousTitre = h('span', null, '');
    const etoiles = h('span', { class: 'hud-etoiles-valeur' }, '0');
    const objectifTexte = h('span', { class: 'hud-objectif-texte' });
    const objectifBarre = h('span', { class: 'hud-objectif-barre' }, h('span'));
    const objectif = h('div', { class: 'hud-objectif' }, objectifTexte, objectifBarre);
    const bulleTexte = h('p', { class: 'hud-bulle-texte' });
    const bullePortrait = h('div', { class: 'hud-bulle-portrait' });
    const bulle = h('div', { class: 'hud-bulle', hidden: true },
      bullePortrait,
      bulleTexte,
      h('div', { class: 'hud-bulle-actions' },
        h('button', { class: 'btn-rond petit', 'aria-label': 'Réécouter', onclick: () => Voix.dire(bulleTexte.textContent) }, ic('haut-parleur', 20)),
        h('button', { class: 'btn-rond petit', 'aria-label': 'Fermer', onclick: fermerBulle }, ic('croix', 20))));
    const racine = h('div', { class: 'hud' },
      h('div', { class: 'hud-haut' },
        h('div', { class: 'hud-planete carte-papier' },
          h('span', { class: 'hud-vignette', html: typeof Art !== 'undefined' && Art.vignettePlanete ? Art.vignettePlanete(monde.id) : '' }),
          h('div', { class: 'hud-planete-textes' }, titre, sousTitre)),
        h('div', { class: 'hud-actions' },
          h('span', { class: 'hud-etoiles carte-papier', 'aria-label': 'Étoiles' }, ic('etoile', 22), etoiles),
          h('button', { class: 'btn-rond hud-bouton', 'aria-label': 'Mon carnet', onclick: () => { Sons.clic(); quitterVers(() => Ecrans.carnet(() => ouvrirPlanete(monde.id))); } }, ic('livre')),
          h('button', { class: 'btn-rond hud-bouton', 'aria-label': 'Voyager', onclick: () => { Sons.clic(); quitterVers(Ecrans.espace); } }, ic('fusee')),
          h('button', { class: 'btn-rond hud-bouton', 'aria-label': 'Menu', onclick: () => { Sons.clic(); quitterVers(Ecrans.titre); } }, ic('maison')))),
      objectif,
      bulle);
    return { racine, titre, sousTitre, etoiles, objectif, objectifTexte, objectifBarre, bulle, bulleTexte, bullePortrait };
  }

  function majHud() {
    if (!ui.racine || !monde) return;
    const aides = monde.pnj.filter(p => faitsDe(p.id) >= PAR_PNJ).length;
    ui.titre.textContent = monde.nom;
    ui.sousTitre.textContent = `${aides} / ${monde.pnj.length} habitants aidés`;
    ui.etoiles.textContent = UI.fmt(Store.data.etoiles);
    const prochaine = monde.zones.find(z => !zoneOuverte(z.id));
    if (prochaine) {
      const fait = Math.min(etat.resolus, prochaine.requis);
      ui.objectifTexte.textContent = `${prochaine.nom} : ${fait} / ${prochaine.requis} problèmes`;
      ui.objectifBarre.firstChild.style.width = Math.round((100 * fait) / prochaine.requis) + '%';
      ui.objectif.hidden = false;
    } else {
      ui.objectif.hidden = true;
    }
  }

  // Alvin raconte (bulle en bas de l'écran) ; surFinVoix : appelé quand il a fini de parler
  function raconter(texte, humeur = 'normal', duree = 9000, surFinVoix = null) {
    if (!ui.bulle) return;
    ui.bulleTexte.textContent = texte;
    ui.bullePortrait.innerHTML = portraitAlvin(humeur);
    ui.bulle.hidden = false;
    ui.bulle.classList.remove('apparait');
    void ui.bulle.offsetWidth;
    ui.bulle.classList.add('apparait');
    if (R().alvinParle) Voix.dire(texte, surFinVoix ? { onFin: surFinVoix } : undefined);
    clearTimeout(minuteurBulle);
    // une lectrice de 8 ans lit lentement : au moins 2,5 s + 0,45 s par mot (45 mots ≈ 23 s).
    // Toucher la carte ferme la bulle de toute façon (surTouche).
    const mots = String(texte).split(/\s+/).filter(Boolean).length;
    if (duree) minuteurBulle = setTimeout(fermerBulle, Math.max(duree, 2500 + mots * 450));
  }
  function fermerBulle() {
    if (ui.bulle) ui.bulle.hidden = true;
  }

  // ---------------------------------------------------------------------------
  // Dialogues avec les habitants
  // surFermer : appelé si l'enfant ferme le dialogue en touchant à côté (aucun bouton choisi)
  // ---------------------------------------------------------------------------
  function dialogue({ portrait, nom, role, texte, progres, boutons, surFermer = null }) {
    fermerDialogue();
    fermerBulle();
    if (moteur) moteur.bloquer(true);
    const boite = h('div', { class: 'dialogue carte-papier apparait', role: 'dialog', 'aria-label': nom },
      h('div', { class: 'dialogue-portrait', html: portrait || '' }),
      h('div', { class: 'dialogue-corps' },
        h('div', { class: 'dialogue-nom' }, h('b', null, nom), role && h('span', { class: 'dialogue-role' }, role)),
        h('p', { class: 'dialogue-texte' }, texte),
        progres && h('div', { class: 'dialogue-progres', 'aria-label': `${progres.fait} problèmes sur ${progres.total}` },
          Array.from({ length: progres.total }, (_, i) => h('span', { class: i < progres.fait ? 'fait' : '' }))),
        h('div', { class: 'dialogue-boutons' }, boutons.map(b => h('button', {
          class: 'btn ' + (b.classe || 'secondaire'),
          onclick: () => { Sons.clic(); fermerDialogue(); if (b.action) b.action(); },
        }, b.icone ? ic(b.icone, 22) : null, b.label)))),
      h('button', { class: 'btn-rond petit dialogue-ecouter', 'aria-label': 'Réécouter', onclick: () => Voix.dire(texte) }, ic('haut-parleur', 20)));
    const fond = h('div', { class: 'dialogue-fond' }, boite);
    fond.addEventListener('click', e => {
      if (e.target !== fond) return;
      fermerDialogue();
      if (surFermer) surFermer();
    });
    document.body.append(fond);
    dialogueOuvert = fond;
    if (R().alvinParle) Voix.dire(texte);
  }
  function fermerDialogue() {
    if (dialogueOuvert) { dialogueOuvert.remove(); dialogueOuvert = null; }
    Voix.stop();
    if (moteur) moteur.bloquer(false);
  }

  function interagir(ent) {
    if (!monde || dialogueOuvert || chaine) return;
    if (ent.type === 'pnj') parlerA(pnjDe(ent.id));
    else if (ent.type === 'coffre') coffre(monde.coffres.find(c => c.id === ent.id));
    else if (ent.type === 'panneau') panneau(monde.panneaux.find(p => p.id === ent.id));
    else if (ent.type === 'fusee') fusee();
    else if (ent.type === 'porte') porte(ent);
  }

  function parlerA(p) {
    if (!p) return;
    const fait = faitsDe(p.id);
    if (fait >= PAR_PNJ) {
      dialogue({
        portrait: portraitPNJ(p), nom: p.nom, role: p.role,
        texte: etat.terminee
          ? `${p.merci} Tu veux encore t'entraîner avec moi ?`
          : `${p.merci} Va vite aider les autres habitants !`,
        boutons: etat.terminee
          ? [{ label: 'Plus tard', classe: 'secondaire' }, { label: 'Un problème !', classe: 'principal', icone: 'crayon', action: () => lancerProbleme(p, true) }]
          : [{ label: 'À bientôt !', classe: 'principal' }],
      });
      return;
    }
    const texte = fait === 0 ? p.bonjour : choix([
      `Merci pour ton aide, ${Store.data.profil.prenom} ! J'ai encore un problème.`,
      'Tu reviens ! Tu veux bien m’aider encore une fois ?',
      'Super, te revoilà ! Voici mon problème suivant.',
    ]);
    dialogue({
      portrait: portraitPNJ(p), nom: p.nom, role: p.role, texte,
      progres: { fait, total: PAR_PNJ },
      boutons: [
        { label: 'Plus tard', classe: 'secondaire' },
        { label: `Aider ${p.nom}`, classe: 'principal', icone: 'crayon', action: () => lancerProbleme(p) },
      ],
    });
  }

  // ---------------------------------------------------------------------------
  // Un problème
  // ---------------------------------------------------------------------------
  function lancerProbleme(p, libre = false) {
    const niveau = Store.niveau(monde.notion);
    const probleme = Problemes.tirer(monde.notion, niveau, Store.contexte({ nom: p.nom, g: p.g }), {
      exclure: new Set(etat.vus || []),
      themes: p.themes,
      eviterStructure: etat.derniereStructure,
    });
    if (!probleme) { UI.toast('Aucun problème disponible pour le moment.'); return; }
    if (moteur) moteur.bloquer(true);
    const gen = generation;
    Resolution.lancer({
      probleme, niveau,
      pnj: { nom: p.nom, portrait: portraitPNJ(p) },
      surFin: res => {
        if (gen !== generation) return;
        if (moteur) moteur.bloquer(false);
        if (!res) { raconter(`${p.nom} t'attend quand tu veux !`, 'normal', 5000); return; }
        etat.vus = [...(etat.vus || []), probleme.id].slice(-200);
        etat.derniereStructure = probleme.structure;
        if (!libre) etat.pnj[p.id] = faitsDe(p.id) + 1;
        Store.enregistrerProbleme({
          date: Date.now(), notion: monde.notion, planete: monde.id, pnj: p.id,
          id: probleme.id, structure: probleme.structure, niveau,
          erreurs: res.erreurs, aides: res.aides, etoiles: res.etoiles,
        });
        apresProbleme(p, res, libre);
      },
    });
  }

  // Après un problème : l'état est mis à jour tout de suite (rien ne se perd si l'enfant quitte),
  // puis on montre dans l'ordre : remerciements et pièce de fusée, promotion, passages qui s'ouvrent,
  // planète sauvée, et enfin « on continue ? » (le problème suivant ne démarre qu'après tout cela).
  function apresProbleme(p, res, libre) {
    const D = Store.data;
    if (moteur) moteur.texteFlottant(p.x, p.y - 1, `+${res.etoiles} ★`, '#c7962a');
    majHud();
    const suite = [];
    const fait = faitsDe(p.id);
    const aide = !libre && fait >= PAR_PNJ;   // ce problème termine l'aide à cet habitant
    let ensuite = null;                        // action à la toute fin (problème suivant)

    if (aide) {
      if (moteur) moteur.majEntite(p.id, { marque: 'ok' });
      const cle = monde.id + ':' + p.id;
      if (!D.carnet.includes(cle)) D.carnet.push(cle);
      suite.push(fin => dialogue({
        portrait: portraitPNJ(p), nom: p.nom, role: p.role, texte: p.merci,
        progres: { fait: PAR_PNJ, total: PAR_PNJ },
        boutons: [{ label: 'Avec plaisir !', classe: 'principal', action: fin }],
        surFermer: fin,
      }));
      suite.push(fin => { UI.toast(`${p.nom} rejoint ton carnet d'amis !`); fin(); });
      if (p.chef) {
        const suivante = planeteSuivante();
        if (suivante && !D.debloquees.includes(suivante.id)) D.debloquees.push(suivante.id);
        suite.push(fin => pieceDeFusee(suivante, fin));
      }
    }

    if (Store.verifierPromotion(monde.notion)) {
      suite.push(fin => {
        Sons.victoire();
        const grade = Store.grade(Store.niveau(monde.notion));
        UI.modal({
          titre: 'Promotion !',
          contenu: [h('div', { class: 'portrait-modal', html: portraitAlvin('content') }),
            h('p', null, `Tu deviens ${grade} de la planète ${Ecrans.NOTIONS[monde.notion].nom} ! Les problèmes vont être un peu plus grands.`)],
          boutons: [{ label: 'Trop bien !', classe: 'principal', action: fin }],
          fermable: false,
        });
        if (R().alvinParle) Voix.dire(`Promotion ! Tu deviens ${grade} !`);
      });
    }

    for (const z of monde.zones) {
      if (!zoneOuverte(z.id) && etat.resolus >= z.requis) {
        etat.zones.push(z.id);
        suite.push(fin => {
          if (moteur) {
            moteur.ouvrirZone(z.id, true);   // la caméra montre le passage qui s'ouvre
            monde.pnj.filter(q => q.zone === z.id && faitsDe(q.id) < PAR_PNJ).forEach(q => moteur.majEntite(q.id, { marque: '!' }));
          }
          Sons.victoire();
          majHud();
          // on laisse le temps de voir le passage (et d'écouter Alvin) avant la suite
          const debut = Date.now();
          const parle = R().alvinParle && Voix.disponible;
          raconter(`Un passage s'ouvre vers « ${z.nom} » ! De nouveaux habitants t'attendent.`, 'content', 9000,
            () => setTimeout(fin, Math.max(300, 2400 - (Date.now() - debut))));
          setTimeout(fin, parle ? 9000 : 2400);
        });
      }
    }

    if (!etat.terminee && monde.pnj.every(q => faitsDe(q.id) >= PAR_PNJ)) {
      etat.terminee = true;
      suite.push(fin => {
        Sons.victoire();
        UI.modal({
          titre: 'Planète sauvée !',
          contenu: [h('div', { class: 'portrait-modal', html: portraitAlvin('content') }),
            h('p', null, `Tu as aidé tous les habitants de la ${monde.nom}. Ils peuvent encore te proposer des problèmes pour t'entraîner, et la fusée t'emmène vers d'autres planètes.`)],
          boutons: [{ label: 'Hourra !', classe: 'principal', action: fin }],
          fermable: false,
        });
        UI.confettis(document.body, 40);
      });
    }

    if (!aide) {
      suite.push(fin => dialogue({
        portrait: portraitPNJ(p), nom: p.nom, role: p.role,
        texte: libre
          ? 'Merci ! Tu veux encore t’entraîner avec moi ?'
          : choix(['Bravo, c’est exactement ça ! Tu en fais un autre ?', 'Merci beaucoup ! J’ai encore un problème, tu veux bien ?', 'Génial ! On continue ?']),
        progres: libre ? null : { fait, total: PAR_PNJ },
        boutons: [
          { label: 'Plus tard', classe: 'secondaire', action: fin },
          { label: 'Oui !', classe: 'principal', icone: 'crayon', action: () => { ensuite = () => lancerProbleme(p, libre); fin(); } },
        ],
        surFermer: fin,
      }));
    }

    Store.sauver();
    enchainer(suite, () => { if (ensuite) ensuite(); });
  }

  // Enchaîne des étapes (dialogues, fenêtres, animations) ; chacune appelle fin() une seule fois quand elle est finie.
  // Si la planète est fermée entre-temps, la suite s'arrête (l'état, lui, est déjà enregistré).
  function enchainer(etapes, final) {
    const gen = generation;
    chaine++;
    const suivante = () => {
      if (gen !== generation) return;
      const e = etapes.shift();
      if (!e) {
        chaine = Math.max(0, chaine - 1);
        majHud();
        if (final) final();
        return;
      }
      let fait = false;
      e(() => { if (!fait) { fait = true; suivante(); } });
    };
    suivante();
  }

  // Le chef donne la pièce de fusée qui ouvre la route vers la planète suivante (déjà débloquée dans l'état)
  function pieceDeFusee(suivante, fin) {
    const D = Store.data;
    Sons.victoire();
    if (!suivante) {
      UI.modal({
        titre: 'Mission accomplie !',
        contenu: [h('div', { class: 'portrait-modal', html: portraitAlvin('content') }),
          h('p', null, `Tu as aidé tous les chefs de la galaxie, ${D.profil.prenom} ! Tu es ${Store.G('une vraie héroïne', 'un vrai héros')} des maths. Tu peux revenir sur toutes les planètes pour t'entraîner encore.`)],
        boutons: [{ label: 'Merci Alvin !', classe: 'principal', action: fin }],
        fermable: false,
      });
      UI.confettis(document.body, 50);
      return;
    }
    const texte = planetePrete(suivante)
      ? `Grâce à cette pièce, ma fusée peut voler jusqu'à la ${suivante.nom} ! Retourne à la fusée quand tu veux partir.`
      : `Grâce à cette pièce, ma fusée pourra voler jusqu'à la ${suivante.nom}. Ses habitants préparent encore leurs problèmes : elle ouvrira très bientôt !`;
    UI.modal({
      titre: 'Une pièce pour la fusée !',
      contenu: [h('div', { class: 'portrait-modal', html: portraitAlvin('content') }), h('p', null, texte)],
      boutons: [{ label: 'Génial !', classe: 'principal', action: fin }],
      fermable: false,
      classe: 'modal-piece',
    });
    if (R().alvinParle) Voix.dire(texte);
  }

  // ---------------------------------------------------------------------------
  // Coffres : trois calculs de tête pour les ouvrir
  // ---------------------------------------------------------------------------
  function coffre(c) {
    if (!c) return;
    if (etat.coffres.includes(c.id)) {
      raconter(`Ce coffre est déjà ouvert. Tu y as trouvé : ${c.souvenir.nom}.`, 'normal', 5000);
      return;
    }
    if (moteur) moteur.bloquer(true);
    const gen = generation;
    const calculs = Problemes.calculMental(Store.niveau(monde.notion), monde.notion, 3);
    let i = 0, justes = 0, essais = 0, saisie = '', verrou = false;
    const expr = h('span', { class: 'expr' });
    const boite = h('span', { class: 'reponse-ligne' });
    const pastilles = h('div', { class: 'coffre-pastilles' }, calculs.map(() => h('span')));
    const message = h('p', { class: 'coffre-message' }, 'Ce coffre est fermé par un code magique : réussis 2 calculs sur 3 pour l’ouvrir !');
    const afficher = () => { const k = calculs[i]; expr.textContent = `${UI.fmt(k.g)} ${k.signe} ${UI.fmt(k.d)} =`; boite.textContent = saisie; };
    const clavier = UI.clavier({
      chiffre: ch => { if (!verrou && saisie.length < 5) { saisie += ch; boite.textContent = saisie; } },
      effacer: () => { if (!verrou) { saisie = saisie.slice(0, -1); boite.textContent = saisie; } },
      valider,
    });
    const fenetre = UI.modal({
      titre: 'Un coffre !',
      contenu: [message, h('div', { class: 'en-ligne' }, expr, boite), clavier, pastilles],
      boutons: [{ label: 'Plus tard', classe: 'secondaire', action: () => moteur && moteur.bloquer(false) }],
      classe: 'modal-coffre',
      fermable: false,
    });
    afficher();
    if (R().alvinParle) Voix.dire('Ce coffre est fermé par un code magique : réussis 2 calculs sur 3 pour l’ouvrir !');

    function valider() {
      if (verrou || !saisie) return;
      const k = calculs[i];
      const bon = parseInt(saisie, 10) === k.r;
      if (!bon && essais === 0) { essais++; Sons.oups(); UI.secouer(boite); saisie = ''; boite.textContent = ''; message.textContent = 'Presque ! Essaie encore.'; return; }
      verrou = true;
      if (bon) { justes++; Sons.bien(); boite.classList.add('juste'); pastilles.children[i].classList.add('juste'); message.textContent = 'Bravo !'; }
      else { boite.textContent = UI.fmt(k.r); boite.classList.add('corrige'); pastilles.children[i].classList.add('rate'); message.textContent = `C'était ${UI.fmt(k.r)}.`; }
      setTimeout(() => {
        if (gen !== generation || !document.body.contains(fenetre.fond)) return;   // fermé entre-temps (« Plus tard », départ)
        i++; essais = 0; saisie = ''; verrou = false; boite.className = 'reponse-ligne';
        if (i < calculs.length) { message.textContent = 'Calcul suivant :'; afficher(); return; }
        fenetre.fermer();
        if (moteur) moteur.bloquer(false);
        if (justes >= 2) ouvrirCoffre(c);
        else raconter('Le coffre résiste… Reviens le voir pour réessayer !', 'reflechit', 6000);
      }, bon ? 800 : 1800);
    }
  }

  function ouvrirCoffre(c) {
    etat.coffres.push(c.id);
    if (!Store.data.souvenirs.includes(c.souvenir.id)) Store.data.souvenirs.push(c.souvenir.id);
    Store.data.etoiles += 2;
    Store.sauver();
    if (moteur) {
      moteur.majEntite(c.id, { ouvert: true });
      moteur.texteFlottant(c.x, c.y - 1, '+2 ★', '#c7962a');
    }
    Sons.victoire();
    majHud();
    raconter(`Le coffre s'ouvre ! Tu as trouvé : ${c.souvenir.nom}. Il est rangé dans ton carnet.`, 'content', 8000);
  }

  // ---------------------------------------------------------------------------
  // Panneaux, passages fermés et fusée
  // ---------------------------------------------------------------------------
  function panneau(p) {
    if (!p) return;
    dialogue({
      portrait: typeof Icone !== 'undefined' ? Icone.svg('livre', 64) : '',
      nom: 'Panneau', texte: p.texte,
      boutons: [{ label: "D'accord", classe: 'principal' }],
    });
  }

  // Pont cassé ou barrière : Alvin explique ce qu'il faut faire pour l'ouvrir
  function porte(ent) {
    const z = monde.zones.find(q => q.id === ent.zone);
    if (!z || zoneOuverte(z.id)) return;
    const reste = Math.max(0, z.requis - etat.resolus);
    // pas de « Encore 8 problèmes » si le message vient déjà de dire « (8 problèmes) »
    const dejaDit = reste === z.requis && String(z.message || '').includes(`${z.requis} problème`);
    const encore = reste && !dejaDit ? ` Encore ${reste} problème${reste > 1 ? 's' : ''} à résoudre !` : '';
    raconter((z.message || 'Ce passage est encore fermé.') + encore, 'reflechit', 9000);
  }

  function fusee() {
    const D = Store.data;
    const autres = Mondes.liste().filter(m => D.debloquees.includes(m.id) && m.id !== monde.id);
    dialogue({
      portrait: portraitAlvin('content'), nom: 'Alvin', role: 'ta fusée',
      texte: autres.length ? 'Ma fusée est prête ! Tu veux voyager vers une autre planète ?' : "Ma fusée n'a pas encore de route ouverte. Aide le chef de cette planète pour obtenir une nouvelle pièce !",
      boutons: autres.length
        ? [{ label: 'Rester ici', classe: 'secondaire' }, { label: 'Voyager', classe: 'principal', icone: 'fusee', action: () => quitterVers(Ecrans.espace) }]
        : [{ label: "D'accord", classe: 'principal' }],
    });
  }

  // ---------------------------------------------------------------------------
  // Rappel de pause
  // ---------------------------------------------------------------------------
  // Le temps de jeu est compté depuis le début de la séance (il ne repart pas de zéro quand on passe par le carnet
  // ou le voyage) ; il repart de zéro après « Faire une pause », un long arrêt de l'appli ou un changement du réglage.
  let debutSeance = null;     // heure (ms) du début de la séance
  let prochainRappel = null;  // heure (ms) du prochain rappel
  let pauseReglee = null;     // réglage (minutes) utilisé pour la séance en cours
  let cacheeDepuis = null;
  function nouvelleSeance() { debutSeance = null; prochainRappel = null; }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cacheeDepuis = Date.now(); return; }
    if (cacheeDepuis && Date.now() - cacheeDepuis > 10 * 60000) { nouvelleSeance(); if (moteur) programmerPause(); }
    cacheeDepuis = null;
  });

  // delaiMin : rappel dans ce nombre de minutes (repousser) ; sinon selon le réglage depuis le début de la séance
  function programmerPause(delaiMin) {
    clearTimeout(minuteurPause);
    const reglage = R().pause;
    if (!reglage) { nouvelleSeance(); return; }
    const maintenant = Date.now();
    if (debutSeance === null || pauseReglee !== reglage) { debutSeance = maintenant; prochainRappel = null; pauseReglee = reglage; }
    if (delaiMin !== undefined) prochainRappel = maintenant + delaiMin * 60000;
    else if (prochainRappel === null) prochainRappel = debutSeance + reglage * 60000;
    minuteurPause = setTimeout(() => {
      // jamais au milieu d'un problème, d'un dialogue ou d'une fenêtre : on repousse un peu
      if (document.getElementById('resolution') || dialogueOuvert || chaine || document.querySelector('.modal-fond')) { programmerPause(1); return; }
      if (moteur) moteur.bloquer(true);
      const minutes = Math.max(1, Math.round((Date.now() - debutSeance) / 60000));
      UI.modal({
        titre: 'Une petite pause ?',
        contenu: [h('div', { class: 'portrait-modal', html: portraitAlvin('normal') }),
          h('p', null, `Tu joues depuis ${minutes} minute${minutes > 1 ? 's' : ''}, bravo ! Alvin propose de se dégourdir les pattes. Ta progression est sauvegardée.`)],
        boutons: [
          { label: 'Encore 10 minutes', classe: 'secondaire', action: () => { if (moteur) moteur.bloquer(false); programmerPause(10); } },
          { label: 'Faire une pause', classe: 'principal', action: () => { nouvelleSeance(); quitterVers(Ecrans.titre); } },
        ],
        fermable: false,
      });
      if (R().alvinParle) Voix.dire('Tu joues depuis un moment, bravo ! On fait une petite pause ?');
    }, Math.max(0, prochainRappel - maintenant));
  }

  return {
    ouvrirPlanete, fermer, planetePrete,
    // état courant (tests et débogage)
    debug: () => ({ moteur, monde, etat, chaine, dialogue: !!dialogueOuvert }),
  };
})();
