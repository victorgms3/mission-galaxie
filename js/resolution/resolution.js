'use strict';
/*
 * Résolution guidée d'un problème (Mission Galaxie v2).
 * Resolution.lancer({ probleme, niveau, pnj, surFin }) ouvre un panneau plein écran (<div id="resolution">) et conduit
 * l'enfant à travers les étapes :
 *   je lis → la question → les infos utiles → (le plan, pour les problèmes à deux étapes) → le schéma → l'opération
 *   → le calcul → la phrase réponse,
 * puis affiche les étoiles et appelle surFin({ erreurs, aides, etoiles }) en se retirant du DOM.
 * Méthode reprise de js/ancien/mission.js (indices progressifs, Alvin qui guide, glisser-déposer, calcul posé…),
 * généralisée à tous les schémas (pt, cmp, grp, fois, frise) et aux problèmes à deux étapes (D2).
 * Grade 1 : toutes les étapes ; grade 2 : la question est surlignée d'office ; grade 3 : schéma facultatif
 * (s'il est passé et que l'opération est fausse, le schéma devient obligatoire).
 */
const Resolution = (() => {
  const { h } = UI;
  const R = () => (typeof Store !== 'undefined' && Store.data && Store.data.reglages) || {};
  const F = (v, f) => Problemes.formater(v, f || 'nombre');
  const ic = (nom, taille = 24) => Widgets.ic(nom, taille);
  const BRAVO = ['Bravo !', 'Super !', 'Génial !', 'Bien joué !', 'Excellent !'];
  const choix = t => t[Math.floor(Math.random() * t.length)];
  const melange = t => {
    const a = t.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const son = nom => { if (typeof Sons !== 'undefined' && Sons[nom]) Sons[nom](); };
  // Ajoute des enfants à un élément existant (ignore null/false, aplatit les tableaux, comme UI.h)
  const garnir = (el, ...enfants) => {
    for (const e of enfants.flat(Infinity)) if (e != null && e !== false) el.append(e);
    return el;
  };
  // Typographie française à l'affichage : espace insécable avant ? ! : ; » (et après «), et mots à trait
  // d'union jamais coupés en fin de ligne (« a-t-elle », « après-midi »). typo() renvoie des nœuds pour UI.h / garnir.
  const espaces = t => String(t).replace(/ ([?!:;»])/g, ' $1').replace(/« /g, '« ');
  const typo = t => espaces(t).split(/(\S+-\S+)/)
    .map((m, i) => (i % 2 ? h('span', { class: 'insecable' }, m) : m))
    .filter(m => m !== '');

  const ETAPES = {
    lire: { icone: 'oreille', nom: 'Je lis' },
    question: { icone: 'question', nom: 'La question' },
    infos: { icone: 'loupe', nom: 'Les infos' },
    plan: { icone: 'boussole', nom: 'Le plan' },
    schema: { icone: 'schema', nom: 'Le schéma' },
    operation: { icone: 'plus', nom: "L'opération" },
    calcul: { icone: 'calcul', nom: 'Le calcul' },
    reponse: { icone: 'crayon', nom: 'La réponse' },
  };
  const NOMS_OP = { '+': 'addition', '−': 'soustraction', '×': 'multiplication', '÷': 'division' };
  const LABELS_DEFAUT = {
    pt: { tout: 'le tout', p1: 'une partie', p2: "l'autre partie" },
    cmp: { grand: 'le plus grand', petit: 'le plus petit' },
    grp: { total: 'le total', nb: 'groupes', taille: 'dans un groupe' },
    fois: { petit: 'une fois', grand: 'plusieurs fois' },
    frise: { debut: 'début', duree: 'durée', fin: 'fin' },
  };
  const NOMBRES = ['zéro', 'un', 'deux', 'trois', 'quatre'];

  let TEMPO = 1;  // multiplie tous les délais (les tests l'abaissent)
  let P = null;   // problème en cours
  let ui = null;  // éléments du panneau
  let jeton = 0;  // invalide les minuteurs quand le panneau change

  function plusTard(fn, ms) {
    const j = jeton;
    setTimeout(() => { if (j === jeton && P) fn(); }, ms * TEMPO);
  }

  // ---------------------------------------------------------------------------
  // Alvin et sa bulle
  // ---------------------------------------------------------------------------
  function coinAlvin() {
    const portrait = h('div', { class: 'res-alvin-portrait', role: 'button', 'aria-label': 'Réécouter Alvin', html: Widgets.portraitAlvin('normal') });
    const texte = h('p', { class: 'res-bulle-texte' });
    const btnIndice = h('button', {
      class: 'btn secondaire res-btn-indice', type: 'button', 'data-action': 'indice',
      onclick: () => { if (P && P.indice && !P.verrou) P.indice(); },
    }, ic('ampoule', 22), 'Un indice');
    const bulle = h('div', { class: 'res-bulle' }, texte, h('div', { class: 'res-bulle-actions' },
      h('button', { class: 'btn-rond petit', type: 'button', 'aria-label': 'Réécouter Alvin', onclick: () => parler(texte.textContent) }, ic('haut-parleur', 22)),
      btnIndice));
    portrait.addEventListener('click', () => { sauter(); parler(texte.textContent); });
    return { el: h('div', { class: 'res-alvin' }, portrait, bulle), portrait, texte, bulle, btnIndice, humeur: 'normal' };
  }

  function parler(texte, opts) {
    if (ui && ui.enonce) ui.enonce.finLecture(); // une nouvelle parole interrompt la lecture karaoké
    if (typeof Voix !== 'undefined') Voix.dire(texte, opts);
  }

  function sauter() {
    const p = ui && ui.coin.portrait;
    if (!p) return;
    p.classList.remove('saute');
    void p.offsetWidth;
    p.classList.add('saute');
  }

  function humeurAlvin(humeur) {
    const c = ui && ui.coin;
    if (!c) return;
    const hum = humeur || 'normal';
    if (c.humeur !== hum) {
      c.portrait.innerHTML = Widgets.portraitAlvin(hum);
      c.humeur = hum;
    }
    if (hum === 'content') sauter();
  }

  function dit(message, { humeur = null, parle = true, indice = true } = {}) {
    const c = ui && ui.coin;
    if (!c) return;
    UI.vider(c.texte);
    garnir(c.texte, typo(message));
    c.bulle.classList.remove('res-pop');
    void c.bulle.offsetWidth;
    c.bulle.classList.add('res-pop');
    humeurAlvin(humeur);
    c.btnIndice.hidden = !indice;
    if (parle && R().alvinParle) parler(message);
  }

  // Alvin parle, puis on passe à la suite quand il a fini (ou après un délai)
  function ditPuis(message, opts, suite) {
    let fait = false;
    const go = () => { if (!fait) { fait = true; plusTard(suite, 250); } };
    dit(message, { ...opts, parle: false });
    if (R().alvinParle && typeof Voix !== 'undefined' && Voix.disponible) {
      parler(message, { onFin: go });
      plusTard(go, 1500 + message.length * 85);
    } else {
      plusTard(go, 900 + message.length * 28);
    }
  }

  function erreur(etape) {
    P.erreurs[etape]++;
    son('oups');
  }

  // Indices progressifs : chaque appui donne un indice plus précis
  // Une fois tous les indices donnés, un nouvel appui redit le dernier sans compter d'aide en plus,
  // et le bouton se cache après le dernier indice (il revient si Alvin reparle après une erreur).
  function donnerIndice(messages, aideFinale) {
    const dernier = messages.length - 1;
    const n = Math.min(P.niveauIndice, dernier);
    if (P.niveauIndice <= dernier) { P.aides++; P.niveauIndice++; }
    const m = messages[n];
    dit(typeof m === 'function' ? m() : m, { humeur: 'reflechit', indice: n < dernier });
    if (n === dernier && aideFinale) aideFinale();
  }

  // ---------------------------------------------------------------------------
  // Ouverture / fermeture du panneau
  // ---------------------------------------------------------------------------
  function lancer({ probleme, niveau, pnj, surFin } = {}) {
    fermer();
    if (!probleme || !probleme.etapes || !probleme.etapes.length) throw new Error('Resolution.lancer : problème invalide');
    const niv = niveau || probleme.niveau || 1;
    const deux = probleme.etapes.length > 1;
    const etapes = [{ id: 'lire' }];
    if (niv < 2) etapes.push({ id: 'question' });
    etapes.push({ id: 'infos' });
    if (deux) {
      etapes.push({ id: 'plan' });
      probleme.etapes.forEach((e, i) => etapes.push({ id: 'operation', e: i }, { id: 'calcul', e: i }));
    } else {
      if (probleme.etapes[0].schema) etapes.push({ id: 'schema' });
      etapes.push({ id: 'operation', e: 0 }, { id: 'calcul', e: 0 });
    }
    etapes.push({ id: 'reponse' });
    P = {
      def: probleme, niveau: niv, deux, pnj: pnj || {}, surFin, etapes, idx: 0, compteur: 0, fin: false,
      erreurs: { question: 0, infos: 0, plan: 0, schema: 0, operation: 0, calcul: 0, reponse: 0 },
      aides: 0, outils: 0, niveauIndice: 0, indice: null, verrou: false,
      trouvees: new Set(), xTrouve: false, schemaFait: false, schemaPasse: false, schemaForce: false, placement: {},
    };
    construire();
    lancerEtape();
  }

  function fermer() {
    jeton++;
    // on ne coupe la voix que si un panneau était ouvert (le jeu appelle aussi fermer() à vide)
    if ((P || ui) && typeof Voix !== 'undefined') Voix.stop();
    document.querySelectorAll('.res-fantome').forEach(f => f.remove());
    if (ui && ui.racine) ui.racine.remove();
    const reste = document.getElementById('resolution');
    if (reste) reste.remove();
    ui = null;
    P = null;
  }

  function construire() {
    const pnj = P.pnj;
    const stepper = h('ol', { class: 'res-etapes', 'aria-label': 'Les étapes' });
    const haut = h('header', { class: 'res-haut' },
      h('button', { class: 'btn-rond res-quitter', type: 'button', 'aria-label': 'Quitter le problème', 'data-action': 'quitter', onclick: confirmerQuitter }, ic('croix')),
      h('div', { class: 'res-pnj' },
        h('span', { class: 'res-pnj-portrait', html: Widgets.portraitPNJ(pnj) }),
        h('span', { class: 'res-pnj-textes' }, h('b', null, pnj.nom || 'Un habitant'), h('span', null, 'a besoin de ton aide'))),
      stepper);
    const enonce = carteEnonce(P.def);
    const coin = coinAlvin();
    const atelier = h('section', { class: 'res-atelier' });
    const corps = h('div', { class: 'res-corps' }, enonce.el, coin.el, atelier);
    const racine = h('div', { id: 'resolution', class: 'res-grade-' + P.niveau, role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Résoudre le problème' }, haut, corps);
    document.body.append(racine);
    ui = { racine, stepper, enonce, coin, atelier, corps };
    if (P.niveau >= 2) enonce.question().classList.add('question-trouvee');
  }

  function confirmerQuitter() {
    if (!ui || ui.racine.querySelector('.res-confirmer')) return;
    son('clic');
    const nom = (P && P.pnj.nom) || "L'habitant";
    const fond = h('div', { class: 'res-fond res-confirmer' },
      h('div', { class: 'res-fenetre res-apparait', role: 'alertdialog' },
        h('h2', null, 'Quitter le problème ?'),
        h('p', null, `${nom} t'attendra : tu pourras revenir quand tu veux.`),
        h('div', { class: 'res-boutons' },
          h('button', {
            class: 'btn secondaire', type: 'button', 'data-action': 'quitter-oui',
            onclick: () => { son('clic'); const fn = P && P.surFin; fermer(); if (fn) fn(null); },
          }, 'Quitter'),
          h('button', { class: 'btn principal', type: 'button', 'data-action': 'quitter-non', onclick: () => { son('clic'); fond.remove(); } }, 'Je continue'))));
    ui.racine.append(fond);
  }

  // ---------------------------------------------------------------------------
  // Les étapes
  // ---------------------------------------------------------------------------
  function nomEtape(et) {
    const base = ETAPES[et.id].nom;
    return P.deux && (et.id === 'operation' || et.id === 'calcul') ? `${base} ${et.e + 1}` : base;
  }

  function majEtapes() {
    const s = ui.stepper;
    UI.vider(s);
    P.etapes.forEach((et, i) => {
      const faite = P.fin || i < P.idx;
      const active = !P.fin && i === P.idx;
      s.append(h('li', { class: faite ? 'faite' : active ? 'active' : '', title: nomEtape(et), 'aria-current': active ? 'step' : null },
        h('span', { class: 'pastille' }, ic(faite ? 'coche' : ETAPES[et.id].icone, 20)),
        h('span', { class: 'nom' }, nomEtape(et))));
    });
  }

  function lancerEtape() {
    if (!P) return;
    P.compteur++;
    P.niveauIndice = 0;
    P.indice = null;
    P.verrou = false;
    ui.enonce.surTap = null;
    ui.enonce.reinitialiser();
    majEtapes();
    UI.vider(ui.atelier);
    ui.atelier.scrollTop = 0;
    const et = P.etapes[P.idx];
    ({ lire: etapeLire, question: etapeQuestion, infos: etapeInfos, plan: etapePlan, schema: etapeSchema, operation: etapeOperation, calcul: etapeCalcul, reponse: etapeReponse })[et.id](et.e || 0);
  }

  function etapeSuivante() {
    P.idx++;
    if (P.idx >= P.etapes.length) finProbleme();
    else lancerEtape();
  }

  function consigne(icone, texte) {
    return h('p', { class: 'res-consigne' }, h('span', { class: 'res-consigne-icone' }, ic(icone, 26)), h('span', null, typo(texte)));
  }

  // Rappel d'une question (encadré lavande) : un titre en petites capitales puis la question
  function rappel(titre, question, classe = '') {
    return h('div', { class: 'res-rappel-question' + (classe ? ' ' + classe : '') },
      h('span', { class: 'res-rappel-titre' }, titre), h('span', null, typo(question)));
  }

  // ---------- L'énoncé ----------
  function carteEnonce(def) {
    const corps = h('div', { class: 'res-enonce-texte' });
    const phrasesEls = def.phrases.map((ph, i) => {
      const el = h('span', { class: 'phrase' + (ph.question ? ' est-question' : ''), 'data-i': String(i) });
      for (const s of ph.segs) {
        if (s.t != null) garnir(el, typo(s.t));
        else el.append(h('span', { class: 'donnee', 'data-k': s.k }, Problemes.texteDonnee(s)));
      }
      corps.append(el, ' ');
      return el;
    });
    const notes = h('div', { class: 'res-notes' });
    const btnEcouter = h('button', { class: 'btn-rond petit res-ecouter', type: 'button', 'aria-label': 'Écouter le problème', onclick: () => api.lire() }, ic('haut-parleur', 22));
    const api = {
      phrasesEls,
      surTap: null,
      question: () => phrasesEls.find(p => p.classList.contains('est-question')),
      donnees: () => [...corps.querySelectorAll('.donnee')],
      lire(onFin) {
        parler(def.oral, {
          onSegment: i => phrasesEls.forEach((p, k) => p.classList.toggle('en-lecture', k === i)),
          onFin: () => { api.finLecture(); if (onFin) onFin(); },
        });
        btnEcouter.classList.add('actif');
      },
      finLecture() {
        btnEcouter.classList.remove('actif');
        phrasesEls.forEach(p => p.classList.remove('en-lecture'));
      },
      reinitialiser() {
        api.finLecture();
        phrasesEls.forEach(p => p.classList.remove('cliquable', 'res-clignote'));
        api.donnees().forEach(d => d.classList.remove('cliquable', 'res-clignote'));
      },
      ajouterNote(question, carte) {
        notes.append(h('div', { class: 'res-note res-apparait' },
          h('span', { class: 'res-note-titre' }, ic('coche', 18), 'Étape 1'),
          h('span', { class: 'res-note-q' }, typo(question)),
          h('span', { class: 'res-carte x petite' }, carte)));
      },
    };
    corps.addEventListener('click', e => { if (api.surTap) api.surTap(e); });
    api.el = h('article', { class: 'res-enonce' },
      h('div', { class: 'res-enonce-entete' },
        h('span', { class: 'res-enonce-titre' }, ic('livre', 20), 'Le problème'),
        btnEcouter),
      corps, notes);
    return api;
  }

  // ---------- Je lis ----------
  function etapeLire() {
    const nom = P.pnj.nom || "L'habitant";
    ui.atelier.append(h('div', { class: 'res-centre' },
      consigne('oreille', "Lis l'histoire ou écoute-la. Imagine-la dans ta tête, comme un petit film."),
      h('div', { class: 'res-boutons colonne' },
        h('button', { class: 'btn secondaire grand', type: 'button', 'data-action': 'ecouter', onclick: () => ui.enonce.lire() }, ic('haut-parleur'), 'Écouter le problème'),
        h('button', { class: 'btn principal grand', type: 'button', 'data-action': 'compris', onclick: () => { if (typeof Voix !== 'undefined') Voix.stop(); son('clic'); etapeSuivante(); } }, ic('coche'), "J'ai compris l'histoire"))));
    const message = `${nom} a besoin de toi ! Lis bien son problème. Tu peux l'écouter avec le haut-parleur.`;
    const auto = R().alvinParle && R().lectureAuto;
    dit(message, { indice: false, parle: !auto });
    if (auto) ui.enonce.lire();
  }

  // ---------- La question ----------
  function etapeQuestion() {
    const E = ui.enonce;
    E.phrasesEls.forEach(p => p.classList.add('cliquable'));
    ui.atelier.append(h('div', { class: 'res-centre' },
      consigne('question', 'Touche, dans le problème, la phrase qui pose la question.'),
      h('div', { class: 'res-astuce' }, ic('ampoule', 22), h('span', null, 'Une question se termine par un point d’interrogation : ', h('b', { class: 'res-gros-signe' }, '?')))));
    dit('Où est la question ? Touche la phrase qui pose la question.');
    P.indice = () => donnerIndice([
      "La question, c'est la phrase qui demande quelque chose. Elle se termine par un point d'interrogation.",
      "Regarde la fin de chaque phrase. Laquelle se termine par un point d'interrogation ?",
    ], () => E.question().classList.add('res-clignote'));
    E.surTap = e => {
      const ph = e.target.closest('.phrase');
      if (!ph || P.verrou) return;
      if (ph.classList.contains('est-question')) {
        son('bien');
        P.verrou = true;
        E.reinitialiser();
        ph.classList.add('question-trouvee');
        ditPuis(choix(BRAVO) + " C'est bien la question. Elle est maintenant en violet.", { humeur: 'content', indice: false }, etapeSuivante);
      } else {
        erreur('question');
        UI.secouer(ph);
        dit("Non, cette phrase raconte l'histoire : elle ne pose pas de question. Cherche le point d'interrogation.", { humeur: 'reflechit' });
      }
    };
  }

  // ---------- Les infos utiles ----------
  // court = n'afficher que le nombre (case étroite : l'unité est rappelée par l'étiquette du schéma)
  function carteInfo(k, classe = '', court = false) {
    const def = P.def;
    const inconnue = k === '?';
    const texte = inconnue ? '?' : court ? F(def.vals[k], def.formats[k]) : def.cartes[k];
    return h('span', { class: 'res-carte ' + (inconnue ? 'inconnue ' : k === 'x' ? 'x ' : '') + classe, 'data-k': k }, texte);
  }

  function plateauInfos(cles, { vide = 'Tes infos utiles apparaîtront ici.', nouvelles = [] } = {}) {
    const el = h('div', { class: 'res-plateau' });
    const msg = h('span', { class: 'res-plateau-vide' }, vide);
    if (cles.length) cles.forEach(k => el.append(carteInfo(k, nouvelles.includes(k) ? 'nouvelle res-apparait' : '')));
    else el.append(msg);
    return { el, ajouter(k) { msg.remove(); el.append(carteInfo(k, 'res-apparait')); } };
  }

  function etapeInfos() {
    const E = ui.enonce;
    const def = P.def;
    let intro = '';
    if (!E.question().classList.contains('question-trouvee')) E.question().classList.add('question-trouvee');
    if (P.niveau >= 2) intro = 'La question est en violet. ';
    const besoin = new Set(def.utiles);
    E.donnees().forEach(d => { if (!d.classList.contains('trouvee') && !d.classList.contains('barree')) d.classList.add('cliquable'); });
    const plateau = plateauInfos([...P.trouvees]);
    ui.atelier.append(consigne('loupe', 'Touche, dans le problème, les nombres qui servent à répondre à la question.'), plateau.el);
    dit(intro + 'Quels nombres faut-il pour répondre à la question ? Touche-les dans le problème.');
    const combien = n => (n <= 4 ? NOMBRES[n] : String(n));

    P.indice = () => donnerIndice([
      'Relis bien la question en violet. De quoi parle-t-elle ?',
      `Il faut ${combien(besoin.size)} nombres pour répondre.` + (def.distracteur ? ' Attention : un des nombres du problème ne sert à rien !' : ''),
    ], () => E.donnees().filter(d => besoin.has(d.dataset.k) && !d.classList.contains('trouvee')).forEach(d => d.classList.add('res-clignote')));

    E.surTap = e => {
      const d = e.target.closest('.donnee');
      if (!d || P.verrou || !d.classList.contains('cliquable')) return;
      const k = d.dataset.k;
      d.classList.remove('cliquable', 'res-clignote');
      if (besoin.has(k)) {
        const deja = P.trouvees.has(k);
        P.trouvees.add(k);
        son('bien');
        // le même nombre peut apparaître deux fois dans l'énoncé : on marque toutes ses occurrences
        E.donnees().forEach(x => {
          if (x.dataset.k === k) { x.classList.remove('cliquable', 'res-clignote'); x.classList.add('trouvee'); }
        });
        if (!deja) plateau.ajouter(k);
        const reste = [...besoin].filter(x => !P.trouvees.has(x)).length;
        if (!reste) {
          P.verrou = true;
          E.reinitialiser();
          ditPuis(choix(BRAVO) + ' Tu as trouvé les informations utiles.', { humeur: 'content', indice: false }, etapeSuivante);
        } else {
          dit(`Oui ! Il manque encore ${reste === 1 ? 'un nombre' : combien(reste) + ' nombres'}.`, { humeur: 'content' });
        }
      } else {
        erreur('infos');
        UI.secouer(d);
        d.classList.add('barree');
        dit('Attention ! Ce nombre ne sert pas à répondre à la question. On le barre !', { humeur: 'reflechit' });
      }
    };
  }

  // ---------- Le plan (problèmes à deux étapes) ----------
  // Liste de phrases à choisir (plan, réponse) ; renvoie { el, bonne } (bonne = bouton de la bonne phrase)
  function listeChoix(options, classe, surChoix) {
    const el = h('div', { class: 'res-choix-phrases' });
    let bonne = null;
    for (const o of options) {
      const btn = h('button', { class: classe, type: 'button', onclick: () => surChoix(o, btn) }, typo(o.t));
      if (o.ok) bonne = btn;
      el.append(h('div', { class: 'res-ligne-choix' }, btn,
        h('button', { class: 'btn-rond petit', type: 'button', 'aria-label': 'Écouter cette phrase', onclick: () => parler(o.t) }, ic('haut-parleur', 20))));
    }
    return { el, bonne };
  }

  function etapePlan() {
    const def = P.def, e0 = def.etapes[0];
    const options = melange([{ t: e0.question, ok: true }, ...(e0.autresQuestions || []).map(t => ({ t, ok: false }))]);
    const liste = listeChoix(options, 'res-phrase-choix choix-plan', choisir);
    ui.atelier.append(
      consigne('boussole', "Que faut-il chercher d'abord ?"),
      rappel('La grande question', def.question),
      h('p', { class: 'res-explication' }, 'Ce problème se résout en deux étapes. Pour répondre à la grande question, il manque un nombre : il faut le trouver d’abord.'),
      liste.el);
    dit("Ce problème se fait en deux étapes ! Pour répondre à la grande question, il faut d'abord trouver autre chose. Que faut-il chercher d'abord ?");
    P.indice = () => donnerIndice([
      'Relis la grande question. Quel nombre te manque pour pouvoir y répondre ?',
      `Il faut d'abord savoir : ${e0.question}`,
    ], () => { if (liste.bonne) liste.bonne.classList.add('res-clignote'); });

    function choisir(o, btn) {
      if (P.verrou || btn.disabled) return;
      if (o.ok) {
        P.verrou = true;
        btn.classList.remove('res-clignote');
        btn.classList.add('juste');
        son('bien');
        ditPuis(`Oui ! D'abord, on cherche : ${e0.question}`, { humeur: 'content', indice: false }, etapeSuivante);
        return;
      }
      erreur('plan');
      btn.classList.add('faux');
      btn.disabled = true;
      UI.secouer(btn);
      dit("Non : cette question ne nous aide pas à répondre à la grande question. Cherche le nombre qui nous manque.", { humeur: 'reflechit' });
    }
  }

  // ---------- Le schéma ----------
  function labelsDe(S) { return { ...(LABELS_DEFAUT[S.forme] || {}), ...(S.labels || {}) }; }

  // Dessine le schéma vide ; renvoie { el, cases, maj(slot, k) } (maj = détails qui suivent la carte posée)
  function dessinerSchema(S) {
    const def = P.def;
    const L = labelsDe(S);
    const val = { a: def.vals.a, b: def.vals.b, c: def.vals.c, '?': def.vals.r };
    const cases = {};
    const extras = {};
    const courts = new Set(); // cases trop étroites pour la carte entière
    const caseEl = slot => { const c = h('div', { class: 'case', 'data-slot': slot }); cases[slot] = c; return c; };
    const etiquette = t => (t ? h('span', { class: 'etiquette-seg' }, t) : null);
    const segment = (slot, classe, label) => h('div', { class: 'segment ' + classe }, caseEl(slot), etiquette(label));
    let el;

    if (S.forme === 'pt') {
      const v1 = val[S.slots.p1], v2 = val[S.slots.p2];
      const p1 = segment('p1', 'seg-p1', L.p1);
      const p2 = segment('p2', 'seg-p2', L.p2);
      p1.style.flexGrow = Math.max(v1 / (v1 + v2), 0.34);
      p2.style.flexGrow = Math.max(v2 / (v1 + v2), 0.34);
      el = h('div', { class: 'res-schema schema-pt' },
        h('div', { class: 'rangee' }, segment('tout', 'seg-tout', L.tout)),
        Widgets.accolade('haut'),
        h('div', { class: 'rangee' }, p1, p2));
    } else if (S.forme === 'cmp') {
      const ratio = Math.min(Math.max(val[S.slots.petit] / val[S.slots.grand], 0.42), 0.68);
      const petit = segment('petit', 'seg-petit');
      const ecart = segment('ecart', 'seg-ecart', "l'écart");
      petit.style.flexGrow = ratio;
      ecart.style.flexGrow = 1 - ratio;
      el = h('div', { class: 'res-schema schema-cmp' },
        h('span', { class: 'nom-ligne' }, L.grand), h('div', { class: 'rangee' }, segment('grand', 'seg-grand')),
        h('span', { class: 'nom-ligne' }, L.petit), h('div', { class: 'rangee' }, petit, ecart));
    } else if (S.forme === 'grp') {
      const nbVal = S.slots.nb === '?' ? null : val[S.slots.nb];
      const k = nbVal && nbVal <= 10 ? nbVal : null;
      const nBoites = k || 4;
      // la 1re boîte ne montre que le nombre, comme les autres boîtes : l'unité est dans la légende
      // « ↑ … par … » juste en dessous (sinon « 2 cartes » est coupé au milieu du mot dès 5 boîtes)
      if (nBoites > 6 || (S.labels && S.labels.taille)) courts.add('taille');
      const boites = h('div', { class: 'rangee grp-boites' + (nBoites > 6 ? ' serrees' : '') });
      extras.copies = { taille: [] };
      for (let i = 0; i < nBoites; i++) {
        if (!k && i === nBoites - 1) boites.append(h('span', { class: 'grp-points', 'aria-hidden': 'true' }, '…'));
        const b = h('div', { class: 'segment grp-boite' + (i === 0 ? ' premiere' : '') });
        if (i === 0) b.append(caseEl('taille'));
        else { const c = h('span', { class: 'copie' }); extras.copies.taille.push(c); b.append(c); }
        boites.append(b);
      }
      el = h('div', { class: 'res-schema schema-grp' },
        h('div', { class: 'rangee' }, segment('total', 'seg-total', L.total)),
        boites,
        h('div', { class: 'grp-legende' }, h('span', { class: 'fleche', 'aria-hidden': 'true' }, '↑'), L.taille),
        Widgets.accolade('bas'),
        h('div', { class: 'grp-nb' }, caseEl('nb'), etiquette(L.nb)));
    } else if (S.forme === 'fois') {
      const kf = val[S.slots.fois];
      const k = Number.isInteger(kf) && kf >= 2 && kf <= 8 ? kf : 3;
      el = h('div', { class: 'res-schema schema-fois', style: { gridTemplateColumns: `minmax(64px, auto) repeat(${k}, minmax(0, 1fr)) auto` } });
      extras.copies = { petit: [] };
      el.append(h('span', { class: 'nom-ligne', style: { gridRow: '1', gridColumn: '1' } }, L.petit));
      const petit = segment('petit', 'seg-petit fois-barre');
      petit.style.gridRow = '1';
      petit.style.gridColumn = '2';
      el.append(petit);
      el.append(h('span', { class: 'nom-ligne', style: { gridRow: '2', gridColumn: '1' } }, L.grand));
      for (let i = 0; i < k; i++) {
        const c = h('span', { class: 'copie' });
        extras.copies.petit.push(c);
        el.append(h('div', { class: 'segment seg-copie fois-barre', style: { gridRow: '2', gridColumn: String(i + 2) } }, c));
      }
      el.append(h('div', { class: 'fois-case', style: { gridRow: '2', gridColumn: String(k + 2) } }, caseEl('fois'), h('span', { class: 'etiquette-seg' }, 'fois')));
      const acc = Widgets.accolade('bas');
      acc.style.gridRow = '3';
      acc.style.gridColumn = `2 / span ${k}`;
      el.append(acc);
      el.append(h('div', { class: 'fois-total', style: { gridRow: '4', gridColumn: `2 / span ${k}` } }, caseEl('grand')));
    } else if (S.forme === 'frise') {
      extras.horloges = {};
      const horlogeEl = slot => { const e = h('div', { class: 'frise-horloge', html: Widgets.horloge(null, 58) }); extras.horloges[slot] = e; return e; };
      el = h('div', { class: 'res-schema schema-frise' },
        h('div', { class: 'frise-duree' }, caseEl('duree'), etiquette(L.duree)),
        h('div', {
          class: 'frise-trait', 'aria-hidden': 'true',
          html: '<svg viewBox="0 0 300 70" preserveAspectRatio="none">'
            + '<path class="frise-arc" d="M50 52 Q150 -16 250 52" vector-effect="non-scaling-stroke"/>'
            + '<path class="frise-arc" d="M240 41 L250 52 L236 54" vector-effect="non-scaling-stroke"/>'
            + '<path class="frise-ligne" d="M8 60 H290 M282 54 L290 60 L282 66" vector-effect="non-scaling-stroke"/>'
            + '<path class="frise-repere" d="M50 51 V69 M250 51 V69" vector-effect="non-scaling-stroke"/></svg>',
        }),
        h('div', { class: 'frise-bout gauche' }, caseEl('debut'), etiquette(L.debut), horlogeEl('debut')),
        h('div', { class: 'frise-bout droite' }, caseEl('fin'), etiquette(L.fin), horlogeEl('fin')));
    } else {
      el = h('div', { class: 'res-schema' });
    }

    function maj(slot, k) {
      if (extras.copies && extras.copies[slot]) {
        const t = !k ? '' : k === '?' ? '?' : F(def.vals[k], def.formats[k]);
        extras.copies[slot].forEach(c => { c.textContent = t; });
      }
      if (extras.horloges && extras.horloges[slot]) {
        const f = k && k !== '?' ? def.formats[k] : null;
        extras.horloges[slot].innerHTML = k === '?' ? Widgets.horloge(null, 58, { inconnue: true })
          : f === 'heure' ? Widgets.horloge(def.vals[k], 58) : Widgets.horloge(null, 58);
      }
    }
    return { el, cases, maj, courts };
  }

  function schemaRempli(S) {
    const sch = dessinerSchema(S);
    for (const [slot, k] of Object.entries(S.slots)) {
      sch.cases[slot].classList.add('remplie');
      sch.cases[slot].append(carteInfo(k, 'dans-case', sch.courts.has(slot)));
      sch.maj(slot, k);
    }
    sch.el.classList.add('compact');
    return sch.el;
  }

  function descriptionCase(S, slot) {
    const L = labelsDe(S);
    switch (S.forme) {
      case 'pt': return slot === 'tout' ? `le tout, en haut (${L.tout})` : `une partie, en bas (${L[slot]})`;
      case 'cmp': return slot === 'grand' ? `la grande barre (${L.grand})` : slot === 'petit' ? `la petite barre (${L.petit})` : "l'écart, le morceau en pointillés";
      case 'grp': return slot === 'total' ? `la grande barre du haut : le total (${L.total})` : slot === 'taille' ? `la première boîte : ce qu'il y a dans un groupe (${L.taille})` : `sous l'accolade : le nombre de groupes (${L.nb})`;
      case 'fois': return slot === 'petit' ? `la petite barre (${L.petit})` : slot === 'fois' ? 'la case « fois » : combien de fois la petite barre' : `sous l'accolade : toute la grande barre (${L.grand})`;
      case 'frise': return slot === 'debut' ? `le début, à gauche (${L.debut})` : slot === 'fin' ? `la fin, à droite (${L.fin})` : `la durée, sur la flèche du haut (${L.duree})`;
      default: return 'cette case';
    }
  }

  function explicationSchema(S) {
    switch (S.forme) {
      case 'pt': return "Le grand rectangle du haut, c'est le tout. Les deux morceaux du bas, ce sont les parties.";
      case 'cmp': return "Chaque barre montre une quantité. Le morceau en pointillés, c'est l'écart entre les deux.";
      case 'grp': return "La barre du haut, c'est le total. En dessous, des groupes tous pareils : dans la première boîte, ce qu'il y a dans un groupe, et sous l'accolade, le nombre de groupes.";
      case 'fois': return "La petite barre, c'est une fois. La grande barre, c'est plusieurs fois la même petite barre.";
      case 'frise': return "C'est une ligne du temps : le début à gauche, la fin à droite, et la durée sur la flèche du haut.";
      default: return '';
    }
  }

  function etapeSchema() {
    const S = P.def.etapes[0].schema;
    if (!S) { etapeSuivante(); return; }
    if (P.niveau >= 3 && !P.schemaForce) {
      ui.atelier.append(h('div', { class: 'res-centre' },
        consigne('schema', 'Un schéma aide à bien comprendre le problème.'),
        h('div', { class: 'res-boutons' },
          h('button', { class: 'btn principal grand', type: 'button', 'data-action': 'faire-schema', onclick: () => { son('clic'); construireSchema(); } }, ic('schema'), 'Je fais le schéma'),
          h('button', { class: 'btn secondaire grand', type: 'button', 'data-action': 'passer-schema', onclick: () => { son('clic'); P.schemaPasse = true; etapeSuivante(); } }, "J'ai compris, je passe"))));
      dit('Tu veux faire un schéma, ou tu as déjà bien compris ?', { indice: false });
      return;
    }
    construireSchema();
  }

  function construireSchema() {
    const atelier = ui.atelier;
    UI.vider(atelier);
    const S = P.def.etapes[0].schema;
    const sch = dessinerSchema(S);
    const { cases } = sch;
    const placement = {};
    P.placement = placement;
    const cartes = {};
    const nbCases = Object.keys(S.slots).length;
    let selection = null, essais = 0;

    const plateau = h('div', { class: 'res-plateau' });
    for (const k of ['a', 'b', '?']) {
      const c = h('button', { class: 'res-carte glissable' + (k === '?' ? ' inconnue' : ''), type: 'button', 'data-k': k }, k === '?' ? '?' : P.def.cartes[k]);
      cartes[k] = c;
      plateau.append(c);
      brancherGlisser(c, { tap: () => selectionner(k), depot: slot => placer(k, slot) });
    }
    atelier.append(
      consigne('schema', 'Range les nombres et le « ? » dans le schéma.'),
      sch.el,
      h('p', { class: 'res-aide-geste' }, 'Fais glisser une carte dans une case, ou touche la carte puis la case.'),
      plateau);
    dit(explicationSchema(S) + " Place les nombres et le point d'interrogation.");

    const premiereFausse = () => Object.keys(S.slots).find(s => placement[s] !== S.slots[s]);
    P.indice = () => donnerIndice([
      () => explicationSchema(S) + " Le point d'interrogation, c'est ce que demande la question.",
      () => { const slot = premiereFausse(); return slot ? texteCase(slot) : 'Ton schéma est presque prêt !'; },
    ], () => { const slot = premiereFausse(); if (slot) placer(S.slots[slot], slot); });

    sch.el.addEventListener('click', e => {
      const c = e.target.closest('.case');
      if (!c || P.verrou) return;
      const slot = c.dataset.slot;
      if (selection) placer(selection, slot);
      else if (placement[slot]) { son('clic'); retirer(slot); }
    });

    function texteCase(slot) {
      const k = S.slots[slot];
      return (k === '?' ? "Le point d'interrogation, c'est ce qu'on cherche : il va dans " : `« ${P.def.cartes[k]} », ça va dans `) + descriptionCase(S, slot) + '.';
    }
    function selectionner(k) {
      if (P.verrou || cartes[k].classList.contains('posee')) return;
      son('clic');
      selection = selection === k ? null : k;
      Object.entries(cartes).forEach(([kk, el]) => el.classList.toggle('selection', kk === selection));
      sch.el.classList.toggle('attend', !!selection);
    }
    function majCase(slot) {
      const c = cases[slot];
      UI.vider(c);
      const k = placement[slot];
      c.classList.toggle('remplie', !!k);
      if (k) c.append(carteInfo(k, 'dans-case', sch.courts.has(slot)));
      sch.maj(slot, k);
    }
    function retirer(slot) {
      const k = placement[slot];
      delete placement[slot];
      if (k) cartes[k].classList.remove('posee');
      majCase(slot);
    }
    function placer(k, slot) {
      if (P.verrou || !cases[slot]) return;
      for (const s of Object.keys(placement)) if (placement[s] === k && s !== slot) retirer(s);
      if (placement[slot] && placement[slot] !== k) retirer(slot);
      placement[slot] = k;
      cartes[k].classList.add('posee');
      cartes[k].classList.remove('selection');
      selection = null;
      sch.el.classList.remove('attend');
      son('clic');
      majCase(slot);
      if (Object.keys(placement).length === nbCases) verifier();
    }
    function verifier() {
      const faux = Object.keys(S.slots).filter(s => placement[s] !== S.slots[s]);
      if (!faux.length) {
        P.verrou = true;
        P.schemaFait = true;
        son('bien');
        sch.el.classList.add('reussi');
        ditPuis(choix(BRAVO) + ' Ton schéma est parfait !', { humeur: 'content', indice: false }, etapeSuivante);
        return;
      }
      essais++;
      erreur('schema');
      faux.forEach(s => { cases[s].classList.add('fausse'); UI.secouer(cases[s]); });
      P.verrou = true;
      plusTard(() => {
        faux.forEach(s => { cases[s].classList.remove('fausse'); retirer(s); });
        P.verrou = false;
        if (essais >= 3) {
          for (const [slot, k] of Object.entries(S.slots)) { placement[slot] = k; cartes[k].classList.add('posee'); majCase(slot); }
          P.verrou = true;
          P.schemaFait = true;
          sch.el.classList.add('reussi');
          ditPuis('Regarde bien : voici le bon schéma. On continue !', { humeur: 'reflechit', indice: false }, etapeSuivante);
          return;
        }
        dit(essais === 1 ? 'Pas tout à fait… ' + explicationSchema(S) : texteCase(faux[0]), { humeur: 'reflechit' });
      }, 700);
    }
  }

  // Glisser-déposer au doigt (avec repli sur « toucher puis toucher »)
  function brancherGlisser(carte, { tap, depot }) {
    let debut = null, fantome = null, survol = null;
    const caseSous = e => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      return el && el.closest('#resolution .case');
    };
    carte.addEventListener('pointerdown', e => {
      if (!P || P.verrou || carte.classList.contains('posee')) return;
      debut = { x: e.clientX, y: e.clientY, id: e.pointerId };
      try { carte.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
    });
    carte.addEventListener('pointermove', e => {
      if (!debut || e.pointerId !== debut.id) return;
      if (!fantome && Math.hypot(e.clientX - debut.x, e.clientY - debut.y) > 10) {
        fantome = carte.cloneNode(true);
        fantome.classList.add('res-fantome');
        fantome.classList.remove('selection');
        (ui ? ui.racine : document.body).append(fantome);
        carte.classList.add('en-glisse');
      }
      if (fantome) {
        fantome.style.left = e.clientX + 'px';
        fantome.style.top = e.clientY + 'px';
        const c = caseSous(e);
        if (c !== survol) {
          if (survol) survol.classList.remove('survol');
          survol = c;
          if (survol) survol.classList.add('survol');
        }
      }
    });
    const fin = e => {
      if (!debut || e.pointerId !== debut.id) return;
      const glisse = !!fantome;
      if (fantome) { fantome.remove(); fantome = null; carte.classList.remove('en-glisse'); }
      if (survol) { survol.classList.remove('survol'); survol = null; }
      debut = null;
      if (glisse) {
        const c = e.type === 'pointerup' && caseSous(e);
        if (c) depot(c.dataset.slot);
      } else if (e.type === 'pointerup') {
        tap();
      }
    };
    carte.addEventListener('pointerup', fin);
    carte.addEventListener('pointercancel', fin);
    // Clavier (Entrée / Espace) : comme un toucher
    carte.addEventListener('click', e => { if (e.detail === 0) tap(); });
  }

  // ---------- L'opération ----------
  const carteDe = k => P.def.cartes[k] || '';
  const valeurDe = k => F(P.def.vals[k], P.def.formats[k]);
  const aUneUnite = k => carteDe(k) !== valeurDe(k);

  function pourquoi(et) {
    const S = et.schema;
    if (!S) return pourquoiSigne(et);
    const s = S.slots;
    switch (S.forme) {
      case 'pt':
        return s.tout === '?'
          ? "On cherche le tout : on rassemble les deux parties. C'est une addition !"
          : "On connaît le tout et une partie : on enlève la partie connue pour trouver l'autre. C'est une soustraction !";
      case 'cmp':
        if (s.grand === '?') return "On cherche la plus grande quantité : on ajoute l'écart à la petite. C'est une addition !";
        if (s.petit === '?') return "On cherche la plus petite quantité : on enlève l'écart à la grande. C'est une soustraction !";
        return "On cherche l'écart : on enlève la petite quantité à la grande. C'est une soustraction !";
      case 'grp': {
        if (s.total === '?') {
          const groupes = aUneUnite(s.nb) ? carteDe(s.nb) : `${valeurDe(s.nb)} groupes`;
          return `On cherche le total : ${groupes} de ${carteDe(s.taille)}, c'est ${valeurDe(s.nb)} fois ${valeurDe(s.taille)}. C'est une multiplication !`;
        }
        if (s.taille === '?') return `On partage ${carteDe(s.total)} en ${valeurDe(s.nb)} parts égales. C'est une division !`;
        return `On cherche combien de fois il y a ${carteDe(s.taille)} dans ${carteDe(s.total)}. C'est une division !`;
      }
      case 'fois':
        return `La grande barre, c'est ${valeurDe(s.fois)} fois la petite : ${valeurDe(s.fois)} fois ${carteDe(s.petit)}. C'est une multiplication !`;
      case 'frise':
        if (s.fin === '?') return "On connaît l'heure du début et la durée : on avance l'horloge de la durée. C'est une addition !";
        if (s.duree === '?') return "On cherche le temps qui passe entre le début et la fin : la fin moins le début. C'est une soustraction !";
        return "On connaît l'heure de la fin et la durée : on recule l'horloge de la durée. C'est une soustraction !";
      default: return pourquoiSigne(et);
    }
  }

  function pourquoiSigne(et) {
    const op = et.op;
    const cg = carteDe(op.gk) || F(op.g, op.formats.g), cd = carteDe(op.dk) || F(op.d, op.formats.d);
    switch (op.signe) {
      case '+': return `On ajoute ${cd} à ${cg}. C'est une addition !`;
      case '−': return `On enlève ${cd} à ${cg}. C'est une soustraction !`;
      case '×': return `On prend ${F(op.g, op.formats.g)} fois ${cd}. C'est une multiplication !`;
      default: return `On partage ${cg} en ${F(op.d, op.formats.d)} parts égales. C'est une division !`;
    }
  }

  // Indice intermédiaire : le sens du problème, sans dire le nom de l'opération
  function sensOperation(et) {
    const sansNom = t => t.replace(/\s*C['’]est une [a-zé]+ !\s*$/, '');
    const S = et.schema;
    if (S && P.schemaFait && !P.deux) {
      const slot = Object.keys(S.slots).find(s => S.slots[s] === '?');
      if (slot) return `Le point d'interrogation est sur ${descriptionCase(S, slot)}. ${sansNom(pourquoi(et))}`;
    }
    return sansNom(pourquoi(et));
  }

  function questionGuide(et) {
    const S = et.schema;
    if (S && P.schemaFait) {
      switch (S.forme) {
        case 'pt': return "Regarde ton schéma : le point d'interrogation est-il sur le tout, ou sur une partie ?";
        case 'cmp': return "Regarde ton schéma : cherche-t-on la grande barre, la petite barre, ou l'écart ?";
        case 'grp': return 'Regarde ton schéma : cherche-t-on le total, le nombre de groupes, ou ce qu’il y a dans un groupe ?';
        case 'fois': return 'Regarde ton schéma : la grande barre, c’est plusieurs fois la même petite barre.';
        case 'frise': return "Regarde ta ligne du temps : cherche-t-on l'heure de la fin, la durée, ou l'heure du début ?";
        default: break;
      }
    }
    if (P.def.notion === 'plusmoins') return "Relis la question. Est-ce qu'on rassemble, ou est-ce qu'on enlève ?";
    const q = et.question || P.def.question;
    return `Relis bien : « ${q} » On rassemble, on enlève, on répète la même quantité, ou on partage ?`;
  }

  function etapeOperation(e) {
    const def = P.def, et = def.etapes[e], op = et.op;
    let essais = 0;
    const ligne = h('div', { class: 'res-ligne-operation' });
    const signes = def.notion === 'plusmoins' ? ['+', '−'] : ['+', '−', '×', '÷'];
    const boutons = h('div', { class: 'res-choix-op' + (signes.length > 2 ? ' quatre' : '') });
    for (const s of signes) {
      boutons.append(h('button', {
        class: 'btn-op', type: 'button', 'data-signe': s, 'aria-label': NOMS_OP[s],
        onclick: ev => choisir(s, ev.currentTarget),
      }, h('span', { class: 'signe' }, s), h('span', { class: 'mot' }, NOMS_OP[s])));
    }
    let aide;
    if (P.deux) {
      const utilisees = new Set([def.etapes[0].op.gk, def.etapes[0].op.dk]);
      const cles = e === 0 ? def.utiles.slice() : ['x', ...def.utiles.filter(k => !utilisees.has(k))];
      aide = [
        rappel(e === 0 ? 'Étape 1 : on cherche' : 'Étape 2 : la grande question', et.question, e === 0 ? '' : 'grande'),
        plateauInfos(cles, { nouvelles: e === 0 ? [] : ['x'] }).el,
      ];
    } else {
      aide = P.schemaFait ? schemaRempli(et.schema) : plateauInfos(def.utiles).el;
    }
    garnir(ui.atelier, consigne('plus', 'Quelle opération faut-il faire ?'), aide, boutons, ligne);
    if (P.deux) dit(e === 0 ? `Pour savoir « ${et.question} », quelle opération faut-il faire ?` : 'Maintenant, la grande question ! Quelle opération faut-il faire ?');
    else if (P.schemaFait) dit("Quelle opération faut-il faire ? Regarde ton schéma pour t'aider.");
    else dit(signes.length === 2 ? 'Quelle opération faut-il faire : une addition ou une soustraction ?' : 'Quelle opération faut-il faire ?');

    // Trois indices : (1) la question guide, et la case « ? » du schéma clignote ;
    // (2) le sens (où est le « ? », ce qu'on fait) sans nommer l'opération ;
    // (3) l'explication complète, et le bon bouton clignote.
    const caseInconnue = !P.deux && P.schemaFait && aide.querySelector ? aide.querySelector('.res-carte.inconnue') : null;
    P.indice = () => donnerIndice([
      () => { if (caseInconnue) caseInconnue.classList.add('res-clignote'); return questionGuide(et); },
      () => sensOperation(et),
      () => { if (caseInconnue) caseInconnue.classList.remove('res-clignote'); return pourquoi(et); },
    ], () => {
      boutons.querySelectorAll('.btn-op').forEach(b => b.classList.toggle('res-clignote', b.dataset.signe === op.signe));
    });

    function choisir(s, btn) {
      if (P.verrou) return;
      if (s === op.signe) {
        son('bien');
        P.verrou = true;
        boutons.querySelectorAll('.btn-op').forEach(b => b.classList.remove('res-clignote'));
        btn.classList.add('juste');
        ligne.textContent = `${F(op.g, op.formats.g)} ${op.signe} ${F(op.d, op.formats.d)} = ?`;
        ligne.classList.add('visible');
        ditPuis('Oui ! ' + pourquoi(et), { humeur: 'content', indice: false }, etapeSuivante);
        return;
      }
      erreur('operation');
      UI.secouer(btn);
      // Grade 3 : si le schéma a été sauté, on le fait pour mieux comprendre
      if (P.schemaPasse && !P.schemaFait && et.schema) {
        P.verrou = true;
        P.schemaForce = true;
        ditPuis('Hmm… Faisons un schéma pour mieux comprendre !', { humeur: 'reflechit', indice: false }, () => {
          P.idx = P.etapes.findIndex(x => x.id === 'schema');
          lancerEtape();
        });
        return;
      }
      essais++;
      dit(essais === 1 ? 'Pas cette fois. ' + questionGuide(et) : pourquoi(et), { humeur: 'reflechit' });
    }
  }

  // ---------- Le calcul ----------
  function etapeCalcul(e) {
    const def = P.def, et = def.etapes[e], op = et.op;
    const S = et.schema;
    const tableDe = S && S.forme === 'fois' ? op.g : op.d;
    const { widget: w, outils } = Widgets.calcul(op, { unite: et.unite || '', verrou: () => !P || P.verrou, tableDe });
    let essais = 0;
    const expr = `${F(op.g, op.formats.g)} ${op.signe} ${F(op.d, op.formats.d)}`;
    const clavier = UI.clavier({
      chiffre: c => { if (P && !P.verrou) w.saisir(c); },
      effacer: () => { if (P && !P.verrou) w.effacer(); },
      valider,
    });
    clavier.classList.add('res-clavier');
    const zoneOutils = h('div', { class: 'res-outils' });
    const panneau = h('div', { class: 'res-outil-panneau', hidden: true });
    let outilOuvert = null;
    const boutonsOutils = outils.map(o => h('button', {
      class: 'btn secondaire res-btn-outil', type: 'button', 'data-outil': o.id,
      onclick: ev => basculerOutil(o, ev.currentTarget),
    }, ic(o.icone, 22), o.label));
    if (outils.length) zoneOutils.append(h('span', { class: 'res-outils-titre' }, 'Pour t’aider :'), ...boutonsOutils);

    function basculerOutil(o, btn) {
      son('clic');
      UI.vider(panneau);
      boutonsOutils.forEach(b => b.classList.remove('actif'));
      if (outilOuvert === o.id) { outilOuvert = null; panneau.hidden = true; return; }
      outilOuvert = o.id;
      P.outils++;
      btn.classList.add('actif');
      panneau.append(o.creer());
      panneau.hidden = false;
      setTimeout(() => { if (panneau.scrollIntoView) panneau.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 30);
    }
    function ouvrirOutil(id) {
      const i = outils.findIndex(o => o.id === id);
      if (i >= 0 && outilOuvert !== id) basculerOutil(outils[i], boutonsOutils[i]);
    }

    const titre = w.type === 'pose' ? `Pose et calcule : ${expr}` : w.type === 'temps' ? 'Calcule, puis écris les heures et les minutes.' : 'Calcule.';
    const sousTitre = P.deux ? rappel(`Étape ${e + 1}`, et.question, 'petite') : null;
    garnir(ui.atelier, consigne('calcul', titre), sousTitre,
      h('div', { class: 'res-calcul res-calcul-' + w.type }, w.el, clavier),
      zoneOutils, panneau);
    dit(w.type === 'pose'
      ? "À toi de calculer ! Commence par les unités, tout à droite. Tu peux toucher les petites cases du haut pour noter tes retenues."
      : w.type === 'temps' ? 'À toi de calculer ! Écris les heures, puis touche la case des minutes.' : 'À toi de calculer !');
    const outilIndice = outils.find(o => o.id === 'horloge' || o.id === 'table');
    P.indice = () => donnerIndice(w.indices(), outilIndice ? () => ouvrirOutil(outilIndice.id) : null);
    P.widget = w;

    function valider() {
      if (!P || P.verrou) return;
      const msg = w.controle();
      if (msg) { dit(msg, { humeur: 'reflechit' }); return; }
      const v = w.valeur();
      if (v === null) {
        dit(w.type === 'temps' ? 'Écris les heures et les minutes de ton résultat.' : 'Il manque des chiffres dans ton résultat.', { humeur: 'reflechit' });
        return;
      }
      if (v === op.r) {
        son('bien');
        w.juste();
        P.verrou = true;
        let message = `${choix(BRAVO)} ${expr} = ${F(op.r, op.formats.r)}.`;
        if (P.deux && e === 0) {
          P.xTrouve = true;
          ui.enonce.ajouterNote(et.question, def.cartes.x);
          message += ` On sait maintenant : ${def.cartes.x}.`;
        }
        ditPuis(message, { humeur: 'content', indice: false }, etapeSuivante);
        return;
      }
      essais++;
      erreur('calcul');
      if (essais < 2) {
        const diag = w.diagnostic();
        w.marquer();
        let m = diag ? `Presque ! Vérifie ${diag}.` : 'Presque ! Vérifie ton calcul.';
        // conseil seulement si le calcul a vraiment une retenue (sinon il pousserait à en inventer une)
        if (w.type === 'pose' && op.signe !== '−' && w.aRetenue) m += " N'oublie pas les retenues !";
        dit(m, { humeur: 'reflechit' });
      } else {
        P.verrou = true;
        w.corriger();
        ditPuis(`Le bon résultat est ${F(op.r, op.formats.r)}. Regarde bien la correction en vert.`, { humeur: 'reflechit', indice: false }, () => {
          if (P.deux && e === 0) { P.xTrouve = true; ui.enonce.ajouterNote(et.question, def.cartes.x); }
          etapeSuivante();
        });
      }
    }
  }

  // ---------- La phrase réponse ----------
  function etapeReponse() {
    const def = P.def;
    const der = def.etapes[def.etapes.length - 1];
    const options = melange([{ t: def.reponse.juste, ok: true }, ...def.reponse.fausses.map(t => ({ t, ok: false }))]);
    const liste = listeChoix(options, 'res-phrase-choix phrase-reponse', choisir);
    const unite = der.unite && der.op.formats.r === 'nombre' ? ' ' + der.unite : '';
    ui.atelier.append(
      consigne('crayon', 'Quelle phrase répond à la question ?'),
      rappel('La question', def.question),
      h('p', { class: 'res-resultat' }, 'Ton résultat : ', h('b', null, F(der.op.r, der.op.formats.r) + unite)),
      liste.el);
    dit('Quelle phrase répond à la question ? Tu peux écouter chaque phrase avec le haut-parleur.');
    P.indice = () => donnerIndice([
      'Relis la question : ' + def.question,
      'Cherche la phrase qui parle de la même chose que la question.',
    ], () => { if (liste.bonne) liste.bonne.classList.add('res-clignote'); });

    function choisir(o, btn) {
      if (P.verrou || btn.disabled) return;
      if (o.ok) {
        P.verrou = true;
        btn.classList.remove('res-clignote');
        btn.classList.add('juste');
        son('bien');
        plusTard(etapeSuivante, 700);
        return;
      }
      erreur('reponse');
      btn.classList.add('faux');
      btn.disabled = true;
      UI.secouer(btn);
      dit('Non, cette phrase ne répond pas à la question. Relis-la : ' + def.question, { humeur: 'reflechit' });
    }
  }

  // ---------- Fin du problème : les étoiles ----------
  function finProbleme() {
    const def = P.def;
    const fautes = Object.values(P.erreurs).reduce((a, b) => a + b, 0) + P.aides;
    const etoiles = fautes === 0 ? 3 : fautes <= 2 ? 2 : 1;
    P.fin = true;
    P.verrou = true;
    P.indice = null;
    P.resultat = { erreurs: { ...P.erreurs }, aides: P.aides, etoiles, outils: P.outils };
    majEtapes();
    ui.coin.btnIndice.hidden = true;

    const titre = etoiles === 3 ? 'Parfait !' : etoiles === 2 ? 'Bravo !' : 'Problème résolu !';
    const encouragement = etoiles === 1 ? "Tu as persévéré : c'est comme ça qu'on progresse !" : etoiles === 2 ? 'Encore un petit effort pour avoir les 3 étoiles !' : '';
    const merci = `${P.pnj.nom || "L'habitant"} te dit merci !`;
    const ops = def.etapes.map(e => `${F(e.op.g, e.op.formats.g)} ${e.op.signe} ${F(e.op.d, e.op.formats.d)} = ${F(e.op.r, e.op.formats.r)}`);
    const carte = h('div', { class: 'res-fenetre res-fin res-apparait', role: 'alertdialog', 'aria-label': titre },
      h('div', { class: 'res-fin-portraits' },
        h('span', { class: 'res-fin-alvin', html: Widgets.portraitAlvin('content') }),
        h('span', { class: 'res-fin-pnj', html: Widgets.portraitPNJ(P.pnj) })),
      h('h2', null, titre),
      h('div', { class: 'res-fin-etoiles', 'aria-label': `${etoiles} étoile${etoiles > 1 ? 's' : ''} sur 3` },
        [1, 2, 3].map(i => h('span', { class: 'res-etoile ' + (i <= etoiles ? 'pleine' : 'vide'), style: { animationDelay: (0.1 + i * 0.22) + 's' }, html: Widgets.etoile() }))),
      h('div', { class: 'res-fin-ops' }, ops.map(o => h('span', null, o))),
      h('p', { class: 'res-fin-phrase' }, typo(def.reponse.juste)),
      h('p', { class: 'res-fin-merci' }, merci + (encouragement ? ' ' + encouragement : '')),
      h('button', { class: 'btn principal grand', type: 'button', 'data-action': 'continuer', onclick: terminer }, 'Continuer', ic('suivant')));
    const fond = h('div', { class: 'res-fond res-fin-fond' }, carte);
    ui.racine.append(fond);
    dit(`${titre} ${def.reponse.juste}`, { humeur: 'content', indice: false, parle: false });
    confettis(fond, 26);
    son('victoire');
    for (let i = 1; i <= etoiles; i++) plusTard(() => son('etoile'), 420 + i * 230);
    if (R().alvinParle) parler(`${titre} ${def.reponse.juste} ${encouragement}`);
  }

  // Confettis plats aux couleurs de la palette (chacun se retire seul)
  function confettis(parent, n) {
    const couleurs = ['#e9b949', '#ef7b5a', '#2a9d8f', '#7b6ee6', '#8ecae6'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 220;
      const c = h('span', { class: 'confetti', style: { background: couleurs[i % couleurs.length], animationDelay: (Math.random() * 0.15).toFixed(2) + 's' } });
      c.style.setProperty('--x', (Math.cos(a) * d).toFixed(0) + 'px');
      c.style.setProperty('--y', (Math.sin(a) * d - 60).toFixed(0) + 'px');
      c.style.setProperty('--r', (Math.random() * 720 - 360).toFixed(0) + 'deg');
      parent.append(c);
      setTimeout(() => c.remove(), 1700);
    }
  }

  function terminer() {
    if (!P || !P.resultat) return;
    son('clic');
    const res = P.resultat;
    const fn = P.surFin;
    fermer();
    if (fn) fn(res);
  }

  // ---------------------------------------------------------------------------
  // Débogage et tests
  // ---------------------------------------------------------------------------
  function debug() {
    if (!P) return { actif: false };
    const et = P.etapes[P.idx] || {};
    return {
      actif: true,
      etape: P.fin ? 'fin' : et.id, e: et.e || 0, idx: P.idx, compteur: P.compteur,
      etapes: P.etapes.map(x => x.id + (x.e != null && P.deux ? x.e + 1 : '')),
      verrou: P.verrou, niveau: P.niveau, deux: P.deux,
      erreurs: { ...P.erreurs }, aides: P.aides, outils: P.outils,
      schemaFait: P.schemaFait, schemaPasse: P.schemaPasse, schemaForce: P.schemaForce,
      placement: { ...P.placement }, xTrouve: P.xTrouve,
      widget: P.widget ? P.widget.type : null,
      bulle: ui ? ui.coin.texte.textContent : '',
      resultat: P.resultat || null,
      probleme: P.def,
    };
  }

  return {
    lancer, fermer, debug,
    actif: () => !!P,
    // tempo multiplie tous les délais : 1 = normal, 0.05 = tests rapides, 0 = immédiat (tests en temps virtuel)
    regler({ tempo } = {}) { if (typeof tempo === 'number' && tempo >= 0 && Number.isFinite(tempo)) TEMPO = tempo; },
  };
})();
