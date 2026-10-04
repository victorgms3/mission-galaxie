'use strict';
/*
 * Une mission : échauffement de calcul mental, puis 8 problèmes résolus
 * avec la méthode guidée en étapes, puis le bilan et les récompenses.
 */
const Mission = (() => {
  const { h, fmt } = UI;

  const ETAPES = {
    lire: { icone: '👂', nom: 'Je lis' },
    question: { icone: '❓', nom: 'La question' },
    infos: { icone: '🔍', nom: 'Les infos' },
    schema: { icone: '📊', nom: 'Le schéma' },
    operation: { icone: '➕', nom: "L'opération" },
    calcul: { icone: '🧮', nom: 'Le calcul' },
    reponse: { icone: '✏️', nom: 'La réponse' },
  };
  const NB_PROBLEMES = 8;
  const NOMS = { plusmoins: 'Planète Plus-ou-Moins' };
  const BRAVO = ['Bravo !', 'Super !', 'Génial !', 'Bien joué !', 'Excellent !'];
  const choix = t => t[Math.floor(Math.random() * t.length)];
  const R = () => Store.data.reglages;

  let M = null; // mission en cours
  let P = null; // problème en cours
  let jeton = 0; // invalide les minuteurs quand on change d'écran

  function plusTard(fn, ms) {
    const j = jeton;
    setTimeout(() => { if (j === jeton) fn(); }, ms);
  }

  // ---------------------------------------------------------------------------
  // Alvin et sa bulle
  // ---------------------------------------------------------------------------
  function coinAlvin() {
    const alvin = Alvin.creer(104);
    const texte = h('p', { class: 'bulle-texte' });
    const btnIndice = h('button', { class: 'btn-indice', onclick: () => { if (P && P.indice && !P.verrou) P.indice(); } }, '💡 Un indice');
    const bulle = h('div', { class: 'bulle' }, texte, h('div', { class: 'bulle-actions' },
      h('button', { class: 'btn-rond petit violet', 'aria-label': 'Réécouter Alvin', onclick: () => Voix.dire(texte.textContent) }, '🔊'),
      btnIndice));
    alvin.addEventListener('click', () => { Alvin.saute(alvin); Voix.dire(texte.textContent); });
    return { el: h('div', { class: 'coin-alvin' }, alvin, bulle), alvin, texte, bulle, btnIndice };
  }

  function dit(message, { humeur = null, parler = true, indice = true } = {}) {
    const c = M && M.ui.coin;
    if (!c) return;
    c.texte.textContent = message;
    c.bulle.classList.remove('pop');
    void c.bulle.offsetWidth;
    c.bulle.classList.add('pop');
    Alvin.humeur(c.alvin, humeur);
    if (humeur === 'content') Alvin.saute(c.alvin);
    c.btnIndice.hidden = !indice;
    if (parler && R().alvinParle) Voix.dire(message);
  }

  // Alvin parle, puis on passe à la suite quand il a fini (ou après un délai)
  function ditPuis(message, opts, suite) {
    let fait = false;
    const go = () => { if (!fait) { fait = true; plusTard(suite, 250); } };
    dit(message, { ...opts, parler: false });
    if (R().alvinParle && Voix.disponible) {
      Voix.dire(message, { onFin: go });
      plusTard(go, 1500 + message.length * 85);
    } else {
      plusTard(go, 800 + message.length * 25);
    }
  }

  function erreur(etape) {
    P.erreurs[etape]++;
    Sons.oups();
  }

  // Indices progressifs : chaque appui donne un indice plus précis
  function donnerIndice(messages, aideFinale) {
    P.aides++;
    const n = Math.min(P.niveauIndice++, messages.length - 1);
    const m = messages[n];
    dit(typeof m === 'function' ? m() : m, { humeur: 'reflechit' });
    if (n === messages.length - 1 && aideFinale) aideFinale();
  }

  // ---------------------------------------------------------------------------
  // Barre du haut
  // ---------------------------------------------------------------------------
  function barreHaut(titre) {
    const piste = h('div', { class: 'piste', 'aria-label': 'Progression de la mission' });
    M.problemes.forEach((_, i) => {
      const res = M.resultats[i];
      const encours = M.enProbleme && i === M.index && !res;
      piste.append(h('span', { class: res ? 'fait' : encours ? 'encours' : '' }, res ? '★' : encours ? '🚀' : ''));
    });
    const compteur = h('b', null, String(M.etoiles));
    M.ui.compteur = compteur;
    return h('header', { class: 'barre-mission' },
      h('button', { class: 'btn-rond', 'aria-label': 'Quitter la mission', onclick: confirmerQuitter }, '✕'),
      h('div', { class: 'titre-mission' }, titre),
      piste,
      h('div', { class: 'pastille-compteur' }, '⭐ ', compteur));
  }

  function confirmerQuitter() {
    UI.modal({
      titre: 'Quitter la mission ?',
      contenu: h('p', null, 'Les étoiles déjà gagnées sont gardées.'),
      boutons: [
        { label: 'Quitter', classe: 'secondaire', action: quitter },
        { label: 'Continuer la mission', classe: 'principal' },
      ],
    });
  }

  function quitter() {
    jeton++;
    M = null;
    P = null;
    Ecrans.carte();
  }

  // ---------------------------------------------------------------------------
  // Démarrage et échauffement
  // ---------------------------------------------------------------------------
  function demarrer(planete) {
    jeton++;
    const niveau = Store.data.planetes[planete].niveau;
    M = {
      planete, niveau,
      problemes: Problemes.serie(niveau, NB_PROBLEMES, Store.contexte()),
      index: 0, etoiles: 0, resultats: [], enProbleme: false, ui: {},
    };
    echauffement();
  }

  function echauffement() {
    const calculs = Problemes.echauffement(M.niveau, 5);
    let i = 0, essais = 0, saisie = '', verrou = false;
    const expr = h('span', { class: 'expr' });
    const boite = h('span', { class: 'reponse-ligne' });
    const jauge = h('div', { class: 'jauge-moteur', 'aria-hidden': 'true' }, calculs.map(() => h('span')));
    const coin = coinAlvin();
    M.ui.coin = coin;

    const afficher = () => {
      const c = calculs[i];
      expr.textContent = `${fmt(c.g)} ${c.signe} ${fmt(c.d)} =`;
      boite.textContent = saisie;
    };
    const clavier = UI.clavier({
      chiffre: ch => { if (!verrou && saisie.length < 5) { saisie += ch; boite.textContent = saisie; } },
      effacer: () => { if (!verrou) { saisie = saisie.slice(0, -1); boite.textContent = saisie; } },
      valider,
    });
    const atelier = h('section', { class: 'atelier atelier-echauffement' },
      h('p', { class: 'consigne' }, '🔥 Échauffement : calcule de tête'),
      h('div', { class: 'en-ligne' }, expr, boite),
      clavier, jauge);

    UI.ecran('ecran-mission', barreHaut('Échauffement des moteurs'),
      h('div', { class: 'zone zone-echauffement' }, coin.el, atelier));
    afficher();
    dit("C'est parti ! On commence par échauffer les moteurs de la fusée. Calcule de tête.", { indice: false });

    function valider() {
      if (verrou || !saisie) return;
      const c = calculs[i];
      if (parseInt(saisie, 10) === c.r) {
        Sons.bien();
        boite.classList.add('juste');
        jauge.children[i].classList.add('pleine');
        verrou = true;
        dit(choix(BRAVO), { humeur: 'content', indice: false });
        plusTard(suivant, 1000);
        return;
      }
      essais++;
      Sons.oups();
      UI.secouer(boite);
      if (essais < 2) {
        saisie = '';
        boite.textContent = '';
        dit('Presque ! Essaie encore.', { humeur: 'reflechit', indice: false });
      } else {
        verrou = true;
        boite.textContent = fmt(c.r);
        boite.classList.add('corrige');
        jauge.children[i].classList.add('pleine');
        dit(`La réponse était ${fmt(c.r)}. On continue !`, { humeur: 'reflechit', indice: false });
        plusTard(suivant, 2600);
      }
    }

    function suivant() {
      i++;
      essais = 0;
      saisie = '';
      verrou = false;
      boite.className = 'reponse-ligne';
      if (i < calculs.length) { afficher(); return; }
      UI.vider(atelier);
      atelier.append(h('div', { class: 'atelier-centre' },
        h('div', { class: 'fusee-emoji' }, '🚀'),
        h('p', { class: 'consigne' }, 'Moteurs prêts !'),
        h('button', { class: 'btn principal grand', onclick: () => { Sons.clic(); probleme(); } }, 'Décoller ! 🚀')));
      dit(`Moteurs chauds ! Direction la ${NOMS[M.planete]} !`, { humeur: 'content', indice: false });
    }
  }

  // ---------------------------------------------------------------------------
  // Un problème
  // ---------------------------------------------------------------------------
  function probleme() {
    jeton++;
    M.enProbleme = true;
    const def = M.problemes[M.index];
    const etapes = ['lire', ...(M.niveau >= 2 ? [] : ['question']), 'infos', 'schema', 'operation', 'calcul', 'reponse'];
    P = {
      def, etapes, idx: 0,
      erreurs: { question: 0, infos: 0, schema: 0, operation: 0, calcul: 0, reponse: 0 },
      aides: 0, niveauIndice: 0, indice: null, verrou: false,
      trouvees: new Set(), schemaFait: false, schemaPasse: false, schemaForce: false,
    };
    const coin = coinAlvin();
    M.ui.coin = coin;
    const enonce = carteEnonce(def);
    const atelier = h('section', { class: 'atelier' });
    const stepper = h('ol', { class: 'etapes' });
    UI.ecran('ecran-mission',
      barreHaut(`Problème ${M.index + 1} / ${M.problemes.length}`),
      stepper,
      h('div', { class: 'zone' }, enonce.el, coin.el, atelier));
    Object.assign(M.ui, { enonce, atelier, stepper });
    lancerEtape();
  }

  function majEtapes() {
    const s = M.ui.stepper;
    UI.vider(s);
    P.etapes.forEach((id, i) => {
      const e = ETAPES[id];
      const etat = i < P.idx ? 'faite' : i === P.idx ? 'active' : '';
      s.append(h('li', { class: etat }, h('span', { class: 'pastille' }, i < P.idx ? '✓' : e.icone), h('span', { class: 'nom' }, e.nom)));
    });
  }

  function lancerEtape() {
    P.niveauIndice = 0;
    P.indice = null;
    P.verrou = false;
    M.ui.enonce.surTap = null;
    M.ui.enonce.reinitialiser();
    majEtapes();
    UI.vider(M.ui.atelier);
    const id = P.etapes[P.idx];
    ({ lire: etapeLire, question: etapeQuestion, infos: etapeInfos, schema: etapeSchema, operation: etapeOperation, calcul: etapeCalcul, reponse: etapeReponse })[id]();
  }

  function etapeSuivante() {
    P.idx++;
    if (P.idx >= P.etapes.length) finProbleme();
    else lancerEtape();
  }

  function consigne(icone, texte) {
    return h('p', { class: 'consigne' }, h('span', { class: 'consigne-icone' }, icone), texte);
  }

  // ---------- L'énoncé ----------
  function carteEnonce(def) {
    const corps = h('div', { class: 'enonce-texte' });
    const phrasesEls = def.phrases.map((ph, i) => {
      const el = h('span', { class: 'phrase' + (ph.question ? ' est-question' : ''), 'data-i': String(i) });
      for (const s of ph.segs) {
        if (s.t != null) el.append(s.t);
        else el.append(h('span', { class: 'donnee', 'data-k': s.k }, Problemes.texteDonnee(s)));
      }
      corps.append(el, ' ');
      return el;
    });
    const api = {
      phrasesEls,
      surTap: null,
      question: () => phrasesEls.find(p => p.classList.contains('est-question')),
      donnees: () => [...corps.querySelectorAll('.donnee')],
      lire(onFin) {
        Voix.dire(def.oral, {
          onSegment: i => phrasesEls.forEach((p, k) => p.classList.toggle('en-lecture', k === i)),
          onFin,
        });
      },
      reinitialiser() {
        phrasesEls.forEach(p => p.classList.remove('cliquable', 'clignote', 'en-lecture'));
        api.donnees().forEach(d => d.classList.remove('cliquable', 'clignote'));
      },
    };
    corps.addEventListener('click', e => { if (api.surTap) api.surTap(e); });
    api.el = h('article', { class: 'carte-enonce' },
      h('div', { class: 'enonce-entete' },
        h('span', { class: 'etiquette-enonce' }, '📜 Le problème'),
        h('button', { class: 'btn-rond violet', 'aria-label': 'Écouter le problème', onclick: () => api.lire() }, '🔊')),
      corps);
    return api;
  }

  // ---------- Étape 1 : je lis ----------
  function etapeLire() {
    M.ui.atelier.append(h('div', { class: 'atelier-centre' },
      consigne('👂', "Lis l'histoire ou écoute-la, puis imagine-la dans ta tête."),
      h('button', { class: 'btn secondaire grand', onclick: () => M.ui.enonce.lire() }, '🔊 Écouter le problème'),
      h('button', { class: 'btn principal grand', onclick: () => { Voix.stop(); Sons.clic(); etapeSuivante(); } }, "J'ai compris l'histoire ✓")));
    const message = M.index === 0
      ? "Voici le premier problème ! Écoute bien l'histoire. Tu peux la réécouter avec le bouton haut-parleur."
      : "Écoute bien l'histoire. Tu peux la réécouter autant de fois que tu veux.";
    dit(message, { indice: false, parler: !R().lectureAuto });
    if (R().lectureAuto) M.ui.enonce.lire();
  }

  // ---------- Étape 2 : je trouve la question ----------
  function etapeQuestion() {
    const E = M.ui.enonce;
    E.phrasesEls.forEach(p => p.classList.add('cliquable'));
    M.ui.atelier.append(h('div', { class: 'atelier-centre' },
      consigne('❓', 'Touche, dans le problème, la phrase qui pose la question.'),
      h('div', { class: 'astuce' }, 'Astuce : une question se termine par un point d\'interrogation « ? »')));
    dit('Où est la question ? Touche la phrase qui pose la question.');
    P.indice = () => donnerIndice([
      "La question, c'est la phrase qui demande quelque chose. Elle se termine par un point d'interrogation.",
      'Regarde la fin de chaque phrase. Laquelle se termine par un point d\'interrogation ?',
    ], () => E.question().classList.add('clignote'));
    E.surTap = e => {
      const ph = e.target.closest('.phrase');
      if (!ph || P.verrou) return;
      if (ph.classList.contains('est-question')) {
        Sons.bien();
        P.verrou = true;
        ph.classList.add('question-trouvee');
        E.reinitialiser();
        ditPuis(choix(BRAVO) + " C'est bien la question.", { humeur: 'content', indice: false }, etapeSuivante);
      } else {
        erreur('question');
        UI.secouer(ph);
        dit("Non, cette phrase raconte l'histoire, elle ne pose pas de question. Cherche le point d'interrogation.", { humeur: 'reflechit' });
      }
    };
  }

  // ---------- Étape 3 : je trouve les infos utiles ----------
  function plateauInfos(def, cles) {
    const el = h('div', { class: 'plateau-cartes' });
    const vide = h('span', { class: 'plateau-vide' }, 'Tes infos utiles apparaîtront ici.');
    if (cles.length) cles.forEach(k => el.append(carteInfo(def, k)));
    else el.append(vide);
    return {
      el,
      ajouter(k) { vide.remove(); el.append(carteInfo(def, k, 'apparait')); },
    };
  }

  function carteInfo(def, k, classe = '') {
    return h('span', { class: 'carte-info ' + classe + (k === '?' ? ' inconnue' : ''), 'data-k': k }, k === '?' ? '?' : def.cartes[k]);
  }

  function etapeInfos() {
    const E = M.ui.enonce;
    const def = P.def;
    let intro = '';
    if (!E.question().classList.contains('question-trouvee')) {
      E.question().classList.add('question-trouvee');
      intro = 'La question est en violet. ';
    }
    const besoin = new Set(def.utiles);
    E.donnees().forEach(d => { if (!d.classList.contains('trouvee') && !d.classList.contains('barree')) d.classList.add('cliquable'); });
    const plateau = plateauInfos(def, [...P.trouvees]);
    M.ui.atelier.append(consigne('🔍', 'Touche les nombres qui servent à répondre à la question.'), plateau.el);
    dit(intro + 'Quels nombres faut-il pour répondre à la question ? Touche-les dans le problème.');

    P.indice = () => donnerIndice([
      'Relis bien la question en violet. De quoi parle-t-elle ?',
      def.distracteur ? 'Il faut deux nombres. Attention : un des nombres du problème ne sert à rien !' : 'Il faut deux nombres pour répondre.',
    ], () => E.donnees().filter(d => besoin.has(d.dataset.k) && !d.classList.contains('trouvee')).forEach(d => d.classList.add('clignote')));

    E.surTap = e => {
      const d = e.target.closest('.donnee');
      if (!d || P.verrou || !d.classList.contains('cliquable')) return;
      const k = d.dataset.k;
      d.classList.remove('cliquable', 'clignote');
      if (besoin.has(k)) {
        P.trouvees.add(k);
        Sons.bien();
        d.classList.add('trouvee');
        plateau.ajouter(k);
        if (P.trouvees.size === besoin.size) {
          P.verrou = true;
          E.reinitialiser();
          ditPuis(choix(BRAVO) + ' Tu as trouvé les informations utiles.', { humeur: 'content', indice: false }, etapeSuivante);
        } else {
          dit('Oui ! Il manque encore un nombre.', { humeur: 'content' });
        }
      } else {
        erreur('infos');
        UI.secouer(d);
        d.classList.add('barree');
        dit('Attention ! Ce nombre ne sert pas à répondre à la question. On le barre !', { humeur: 'reflechit' });
      }
    };
  }

  // ---------- Étape 4 : je fais le schéma ----------
  function valeursSchema(def) {
    return { a: def.vals.a, b: def.vals.b, '?': def.vals.r };
  }

  function dessinerSchema(def, cases) {
    const S = def.schema;
    const val = valeursSchema(def);
    const segment = (slot, classe, etiquette) => {
      const c = h('div', { class: 'case', 'data-slot': slot });
      cases[slot] = c;
      return h('div', { class: 'segment ' + classe }, c, etiquette ? h('span', { class: 'etiquette-seg' }, etiquette) : null);
    };
    if (S.forme === 'pt') {
      const v1 = val[S.slots.p1], v2 = val[S.slots.p2];
      const p1 = segment('p1', 'seg-p1', S.labels.p1);
      const p2 = segment('p2', 'seg-p2', S.labels.p2);
      p1.style.flexGrow = Math.max(v1 / (v1 + v2), 0.32);
      p2.style.flexGrow = Math.max(v2 / (v1 + v2), 0.32);
      return h('div', { class: 'schema schema-pt' },
        h('div', { class: 'rangee-schema' }, segment('tout', 'seg-tout', S.labels.tout)),
        h('div', { class: 'accolade', 'aria-hidden': 'true' }),
        h('div', { class: 'rangee-schema' }, p1, p2));
    }
    const ratio = Math.min(Math.max(val[S.slots.petit] / val[S.slots.grand], 0.4), 0.7);
    const petit = segment('petit', 'seg-petit');
    const ecart = segment('ecart', 'seg-ecart', "l'écart");
    petit.style.flexGrow = ratio;
    ecart.style.flexGrow = 1 - ratio;
    return h('div', { class: 'schema schema-cmp' },
      h('div', { class: 'ligne-cmp' }, h('span', { class: 'nom-cmp' }, S.labels.grand), h('div', { class: 'rangee-schema' }, segment('grand', 'seg-grand'))),
      h('div', { class: 'ligne-cmp' }, h('span', { class: 'nom-cmp' }, S.labels.petit), h('div', { class: 'rangee-schema' }, petit, ecart)));
  }

  function schemaRempli(def) {
    const cases = {};
    const el = dessinerSchema(def, cases);
    for (const [slot, k] of Object.entries(def.schema.slots)) {
      cases[slot].classList.add('remplie');
      cases[slot].append(carteInfo(def, k, 'dans-case'));
    }
    el.classList.add('compact');
    return el;
  }

  function descriptionCase(S, slot) {
    const L = S.labels;
    if (S.forme === 'pt') return slot === 'tout' ? `le tout, en haut (${L.tout})` : `une partie, en bas (${L[slot]})`;
    if (slot === 'grand') return `la grande barre (${L.grand})`;
    if (slot === 'petit') return `la petite barre (${L.petit})`;
    return "l'écart, le morceau en pointillés";
  }

  function explicationSchema(S) {
    return S.forme === 'pt'
      ? "Le grand rectangle du haut, c'est le tout. Les deux morceaux du bas, ce sont les parties."
      : "Chaque barre montre une quantité. Le morceau en pointillés, c'est l'écart entre les deux.";
  }

  function etapeSchema() {
    if (M.niveau >= 3 && !P.schemaForce) {
      M.ui.atelier.append(h('div', { class: 'atelier-centre' },
        consigne('📊', 'Un schéma aide à bien comprendre le problème.'),
        h('div', { class: 'rangee-boutons' },
          h('button', { class: 'btn principal grand', onclick: () => { Sons.clic(); construireSchema(); } }, 'Je fais le schéma'),
          h('button', { class: 'btn secondaire grand', onclick: () => { Sons.clic(); P.schemaPasse = true; etapeSuivante(); } }, "J'ai compris, je passe"))));
      dit('Tu veux faire un schéma, ou tu as déjà bien compris ?', { indice: false });
      return;
    }
    construireSchema();
  }

  function construireSchema() {
    const atelier = M.ui.atelier;
    UI.vider(atelier);
    const def = P.def, S = def.schema;
    const cases = {}, placement = {}, cartes = {};
    const nbCases = Object.keys(S.slots).length;
    let selection = null, essais = 0;

    const schemaEl = dessinerSchema(def, cases);
    const plateau = h('div', { class: 'plateau-cartes' });
    for (const k of ['a', 'b', '?']) {
      const c = h('button', { class: 'carte-info glissable' + (k === '?' ? ' inconnue' : ''), 'data-k': k }, k === '?' ? '?' : def.cartes[k]);
      cartes[k] = c;
      plateau.append(c);
      brancherGlisser(c, { tap: () => selectionner(k), depot: slot => placer(k, slot) });
    }
    atelier.append(consigne('📊', 'Range les nombres et le « ? » dans le schéma.'), schemaEl,
      h('p', { class: 'aide-geste' }, 'Fais glisser une carte dans une case, ou touche la carte puis la case.'), plateau);
    dit(explicationSchema(S) + ' Place les nombres et le point d\'interrogation.');

    P.indice = () => donnerIndice([
      () => explicationSchema(S) + ' Le point d\'interrogation, c\'est ce que demande la question.',
      () => {
        const slot = Object.keys(S.slots).find(s => placement[s] !== S.slots[s]);
        return slot ? texteCase(slot) : 'Ton schéma est presque prêt !';
      },
    ], () => {
      const slot = Object.keys(S.slots).find(s => placement[s] !== S.slots[s]);
      if (slot) placer(S.slots[slot], slot);
    });

    schemaEl.addEventListener('click', e => {
      const c = e.target.closest('.case');
      if (!c || P.verrou) return;
      const slot = c.dataset.slot;
      if (selection) placer(selection, slot);
      else if (placement[slot]) { Sons.clic(); retirer(slot); }
    });

    function texteCase(slot) {
      const k = S.slots[slot];
      return (k === '?' ? "Le point d'interrogation, c'est ce qu'on cherche : il va dans " : `« ${def.cartes[k]} », ça va dans `) + descriptionCase(S, slot) + '.';
    }
    function selectionner(k) {
      if (P.verrou || cartes[k].classList.contains('posee')) return;
      Sons.clic();
      selection = selection === k ? null : k;
      Object.entries(cartes).forEach(([kk, el]) => el.classList.toggle('selection', kk === selection));
    }
    function majCase(slot) {
      const c = cases[slot];
      UI.vider(c);
      const k = placement[slot];
      c.classList.toggle('remplie', !!k);
      if (k) c.append(carteInfo(def, k, 'dans-case'));
    }
    function retirer(slot) {
      const k = placement[slot];
      delete placement[slot];
      if (k) cartes[k].classList.remove('posee');
      majCase(slot);
    }
    function placer(k, slot) {
      if (P.verrou) return;
      for (const s of Object.keys(placement)) if (placement[s] === k && s !== slot) retirer(s);
      if (placement[slot] && placement[slot] !== k) retirer(slot);
      placement[slot] = k;
      cartes[k].classList.add('posee');
      cartes[k].classList.remove('selection');
      selection = null;
      Sons.clic();
      majCase(slot);
      if (Object.keys(placement).length === nbCases) verifier();
    }
    function verifier() {
      const faux = Object.keys(S.slots).filter(s => placement[s] !== S.slots[s]);
      if (!faux.length) {
        P.verrou = true;
        P.schemaFait = true;
        Sons.bien();
        schemaEl.classList.add('reussi');
        ditPuis(choix(BRAVO) + ' Ton schéma est parfait !', { humeur: 'content', indice: false }, etapeSuivante);
        return;
      }
      essais++;
      erreur('schema');
      faux.forEach(s => UI.secouer(cases[s]));
      P.verrou = true;
      plusTard(() => {
        faux.forEach(retirer);
        P.verrou = false;
        if (essais >= 3) {
          for (const [slot, k] of Object.entries(S.slots)) { placement[slot] = k; cartes[k].classList.add('posee'); majCase(slot); }
          P.verrou = true;
          P.schemaFait = true;
          schemaEl.classList.add('reussi');
          ditPuis('Regarde bien : voici le bon schéma. On continue !', { humeur: 'reflechit', indice: false }, etapeSuivante);
          return;
        }
        dit(essais === 1 ? 'Pas tout à fait… ' + explicationSchema(S) : texteCase(faux[0]), { humeur: 'reflechit' });
      }, 650);
    }
  }

  // Glisser-déposer au doigt (avec repli sur « toucher puis toucher »)
  function brancherGlisser(carte, { tap, depot }) {
    let debut = null, fantome = null, survol = null;
    const caseSous = e => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      return el && el.closest('.case');
    };
    carte.addEventListener('pointerdown', e => {
      if (P.verrou || carte.classList.contains('posee')) return;
      debut = { x: e.clientX, y: e.clientY, id: e.pointerId };
      try { carte.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
    });
    carte.addEventListener('pointermove', e => {
      if (!debut || e.pointerId !== debut.id) return;
      if (!fantome && Math.hypot(e.clientX - debut.x, e.clientY - debut.y) > 10) {
        fantome = carte.cloneNode(true);
        fantome.classList.add('fantome');
        fantome.classList.remove('selection');
        document.body.append(fantome);
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
  }

  // ---------- Étape 5 : je choisis l'opération ----------
  function pourquoi(def) {
    const S = def.schema.slots;
    if (def.schema.forme === 'pt') {
      if (S.tout === '?') return "On cherche le tout : on rassemble les deux parties. C'est une addition !";
      return "On connaît le tout et une partie : on enlève la partie connue pour trouver l'autre. C'est une soustraction !";
    }
    if (S.grand === '?') return "On cherche la plus grande quantité : on ajoute l'écart à la petite. C'est une addition !";
    if (S.petit === '?') return "On cherche la plus petite quantité : on enlève l'écart à la grande. C'est une soustraction !";
    return "On cherche l'écart : on enlève la petite quantité à la grande. C'est une soustraction !";
  }

  function questionGuide(def) {
    return def.schema.forme === 'pt'
      ? 'Regarde ton schéma : le point d\'interrogation est-il sur le tout, ou sur une partie ?'
      : "Regarde ton schéma : cherche-t-on la grande barre, la petite barre, ou l'écart ?";
  }

  function etapeOperation() {
    const def = P.def, op = def.op;
    let essais = 0;
    const ligne = h('div', { class: 'ligne-operation' });
    const boutons = h('div', { class: 'choix-operation' });
    for (const s of ['+', '−']) {
      boutons.append(h('button', { class: 'btn-op', 'aria-label': s === '+' ? 'addition' : 'soustraction', onclick: e => choisir(s, e.currentTarget) }, s));
    }
    M.ui.atelier.append(
      consigne('➕', 'Quelle opération faut-il faire ?'),
      P.schemaFait ? schemaRempli(def) : plateauInfos(def, def.utiles).el,
      boutons, ligne);
    dit(P.schemaFait ? "Quelle opération faut-il faire ? Regarde ton schéma pour t'aider." : 'Quelle opération faut-il faire : une addition ou une soustraction ?');
    P.indice = () => donnerIndice([questionGuide(def), pourquoi(def)], () => {
      boutons.querySelectorAll('.btn-op').forEach(b => b.classList.toggle('clignote', b.textContent === op.signe));
    });

    function choisir(s, btn) {
      if (P.verrou) return;
      if (s === op.signe) {
        Sons.bien();
        P.verrou = true;
        btn.classList.remove('clignote');
        btn.classList.add('juste');
        ligne.textContent = `${fmt(op.g)} ${op.signe} ${fmt(op.d)} = ?`;
        ligne.classList.add('visible');
        ditPuis('Oui ! ' + pourquoi(def), { humeur: 'content', indice: false }, etapeSuivante);
        return;
      }
      erreur('operation');
      UI.secouer(btn);
      // Au grade 3, si le schéma a été sauté, on le fait pour mieux comprendre
      if (P.schemaPasse && !P.schemaFait) {
        P.verrou = true;
        P.schemaForce = true;
        ditPuis('Hmm… Faisons un schéma pour mieux comprendre !', { humeur: 'reflechit', indice: false }, () => {
          P.idx = P.etapes.indexOf('schema');
          lancerEtape();
        });
        return;
      }
      essais++;
      dit(essais === 1 ? 'Pas cette fois. ' + questionGuide(def) : pourquoi(def), { humeur: 'reflechit' });
    }
  }

  // ---------- Étape 6 : je calcule ----------
  const NOMS_COLONNES = ['unités', 'dizaines', 'centaines', 'milliers', 'dizaines de mille'];

  function widgetPose(op) {
    const G = String(op.g), D = String(op.d), Rs = String(op.r);
    const n = Math.max(G.length, D.length, Rs.length);
    const attendu = Rs.padStart(n, ' ');
    const grille = h('div', { class: 'pose', style: { gridTemplateColumns: `repeat(${n + 1}, var(--cellule))` } });
    const vide = () => h('span', { class: 'pose-vide' });

    grille.append(vide());
    for (let i = 0; i < n; i++) grille.append(h('span', { class: 'pose-entete' }, ['u', 'd', 'c', 'm', 'dm'][n - 1 - i]));
    grille.append(vide());
    for (let i = 0; i < n; i++) {
      if (i === n - 1) { grille.append(vide()); continue; }
      const r = h('button', { class: 'pose-retenue', 'aria-label': 'Retenue', onclick: () => { Sons.clic(); r.textContent = r.textContent ? '' : '1'; } });
      grille.append(r);
    }
    grille.append(vide());
    for (const ch of G.padStart(n, ' ')) grille.append(h('span', { class: 'pose-chiffre' }, ch.trim()));
    grille.append(h('span', { class: 'pose-signe' }, op.signe));
    for (const ch of D.padStart(n, ' ')) grille.append(h('span', { class: 'pose-chiffre' }, ch.trim()));
    grille.append(h('span', { class: 'pose-trait', style: { gridColumn: `1 / span ${n + 1}` } }));
    grille.append(vide());
    const cellules = [];
    for (let i = 0; i < n; i++) {
      const c = h('button', { class: 'pose-resultat', 'aria-label': 'Chiffre des ' + NOMS_COLONNES[n - 1 - i], onclick: () => { if (!P.verrou) selectionner(i); } });
      cellules.push(c);
      grille.append(c);
    }
    let sel = n - 1;
    function selectionner(i) {
      sel = i;
      cellules.forEach((c, k) => c.classList.toggle('selection', k === i));
    }
    selectionner(n - 1);
    const differe = i => {
      const v = cellules[i].textContent;
      const a = attendu[i].trim();
      return !(v === a || (v === '0' && a === '') || (v === '' && a === ''));
    };

    return {
      el: h('div', { class: 'pose-cadre' }, grille),
      saisir(ch) {
        cellules[sel].textContent = ch;
        cellules[sel].classList.remove('faux');
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
      colonneFausse() {
        for (let i = n - 1; i >= 0; i--) if (differe(i)) return NOMS_COLONNES[n - 1 - i];
        return null;
      },
      marquer() {
        cellules.forEach((c, i) => c.classList.toggle('faux', differe(i)));
        for (let i = n - 1; i >= 0; i--) if (differe(i)) { selectionner(i); break; }
      },
      corriger() {
        cellules.forEach((c, i) => {
          c.classList.remove('faux', 'selection');
          if (differe(i)) { c.textContent = attendu[i].trim(); c.classList.add('corrige'); }
          else c.classList.add('juste');
        });
      },
      juste() { cellules.forEach(c => { c.classList.remove('selection', 'faux'); c.classList.add('juste'); }); },
    };
  }

  function widgetEnLigne(op) {
    let saisie = '';
    const boite = h('span', { class: 'reponse-ligne' });
    return {
      el: h('div', { class: 'en-ligne' }, h('span', { class: 'expr' }, `${fmt(op.g)} ${op.signe} ${fmt(op.d)} =`), boite),
      saisir(ch) { if (saisie.length < 5) { saisie += ch; boite.textContent = saisie; boite.classList.remove('faux'); } },
      effacer() { saisie = saisie.slice(0, -1); boite.textContent = saisie; },
      valeur() { return saisie ? parseInt(saisie, 10) : null; },
      colonneFausse() { return null; },
      marquer() { boite.classList.add('faux'); saisie = ''; },
      corriger() { boite.textContent = fmt(op.r); boite.className = 'reponse-ligne corrige'; },
      juste() { boite.classList.add('juste'); },
    };
  }

  function etapeCalcul() {
    const op = P.def.op;
    const pose = Math.max(op.g, op.d) >= 10;
    const w = pose ? widgetPose(op) : widgetEnLigne(op);
    let essais = 0;
    const clavier = UI.clavier({
      chiffre: c => { if (!P.verrou) w.saisir(c); },
      effacer: () => { if (!P.verrou) w.effacer(); },
      valider,
    });
    M.ui.atelier.append(
      consigne('🧮', pose ? `Pose et calcule : ${fmt(op.g)} ${op.signe} ${fmt(op.d)}` : 'Calcule.'),
      h('div', { class: 'atelier-calcul' }, w.el, clavier));
    dit(pose ? "À toi de calculer ! Commence par les unités, tout à droite. Tu peux toucher les petites cases du haut pour noter tes retenues." : 'À toi de calculer !');
    P.indice = () => donnerIndice([
      pose ? 'Calcule colonne par colonne en commençant par les unités, à droite.' : 'Tu peux compter dans ta tête ou sur tes doigts.',
      op.signe === '+'
        ? 'Si une colonne fait 10 ou plus, écris les unités en bas et mets une retenue de 1 dans la colonne de gauche.'
        : "Si le chiffre du haut est trop petit, il faut casser une dizaine (ou une centaine) : c'est la retenue.",
    ]);

    function valider() {
      if (P.verrou) return;
      const v = w.valeur();
      if (v === null) {
        dit('Il manque des chiffres dans ton résultat.', { humeur: 'reflechit' });
        return;
      }
      if (v === op.r) {
        Sons.bien();
        w.juste();
        P.verrou = true;
        ditPuis(`${choix(BRAVO)} ${fmt(op.g)} ${op.signe} ${fmt(op.d)} = ${fmt(op.r)}.`, { humeur: 'content', indice: false }, etapeSuivante);
        return;
      }
      essais++;
      erreur('calcul');
      if (essais < 2) {
        const col = w.colonneFausse();
        w.marquer();
        dit(col ? `Presque ! Vérifie la colonne des ${col}.${op.signe === '+' ? " N'oublie pas les retenues !" : ''}` : 'Presque ! Vérifie ton calcul.', { humeur: 'reflechit' });
      } else {
        P.verrou = true;
        w.corriger();
        ditPuis(`Le bon résultat est ${fmt(op.r)}. Regarde bien la correction en vert.`, { humeur: 'reflechit', indice: false }, etapeSuivante);
      }
    }
  }

  // ---------- Étape 7 : je réponds par une phrase ----------
  function etapeReponse() {
    const def = P.def;
    const options = [{ t: def.reponse.juste, ok: true }, ...def.reponse.fausses.map(t => ({ t, ok: false }))];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    const liste = h('div', { class: 'choix-phrases' });
    for (const o of options) {
      const btn = h('button', { class: 'phrase-reponse', onclick: () => choisir(o, btn) }, o.t);
      liste.append(h('div', { class: 'ligne-reponse' }, btn,
        h('button', { class: 'btn-rond petit clair', 'aria-label': 'Écouter cette phrase', onclick: () => Voix.dire(o.t) }, '🔊')));
    }
    M.ui.atelier.append(
      consigne('✏️', 'Quelle phrase répond à la question ?'),
      h('div', { class: 'rappel-question' }, '❓ ', def.question),
      liste);
    dit('Quelle phrase répond à la question ? Tu peux écouter chaque phrase avec le haut-parleur.');
    P.indice = () => donnerIndice([
      'Relis la question : ' + def.question,
      'Cherche la phrase qui parle de la même chose que la question.',
    ], () => liste.querySelectorAll('.phrase-reponse').forEach(b => { if (b.textContent === def.reponse.juste) b.classList.add('clignote'); }));

    function choisir(o, btn) {
      if (P.verrou || btn.disabled) return;
      if (o.ok) {
        P.verrou = true;
        btn.classList.remove('clignote');
        btn.classList.add('juste');
        Sons.bien();
        plusTard(etapeSuivante, 700);
        return;
      }
      erreur('reponse');
      btn.classList.add('faux');
      btn.disabled = true;
      dit('Non, cette phrase ne répond pas à la question. Relis-la : ' + def.question, { humeur: 'reflechit' });
    }
  }

  // ---------- Fin d'un problème ----------
  function finProbleme() {
    const def = P.def, op = def.op;
    const fautes = Object.values(P.erreurs).reduce((a, b) => a + b, 0) + P.aides;
    const etoiles = fautes === 0 ? 3 : fautes <= 2 ? 2 : 1;
    M.etoiles += etoiles;
    M.resultats.push({ type: def.type, etoiles });
    Store.enregistrerProbleme({
      date: Date.now(), planete: M.planete, type: def.type, niveau: M.niveau,
      erreurs: { ...P.erreurs }, aides: P.aides, etoiles,
    });
    if (M.ui.compteur) M.ui.compteur.textContent = String(M.etoiles);

    const dernier = M.index >= M.problemes.length - 1;
    const titre = etoiles === 3 ? 'Parfait !' : etoiles === 2 ? 'Bravo !' : 'Problème résolu !';
    const encouragement = etoiles === 1 ? 'Tu as persévéré, c\'est comme ça qu\'on progresse !' : '';
    const alvin = Alvin.creer(120);
    Alvin.humeur(alvin, 'content');
    const etoilesEl = h('div', { class: 'etoiles-gagnees' },
      [1, 2, 3].map(i => h('span', { class: i <= etoiles ? 'pleine' : 'vide', style: { animationDelay: 0.2 + i * 0.25 + 's' } }, '★')));
    const bouton = h('button', {
      class: 'btn principal grand',
      onclick: () => { Sons.clic(); fond.remove(); problemeSuivant(); },
    }, dernier ? 'Voir mon bilan 🏁' : 'Problème suivant ➜');
    const fond = h('div', { class: 'modal-fond celebration' },
      h('div', { class: 'modal carte-victoire' },
        alvin,
        h('h2', null, titre),
        etoilesEl,
        h('p', { class: 'recap-op' }, `${fmt(op.g)} ${op.signe} ${fmt(op.d)} = ${fmt(op.r)}`),
        h('p', { class: 'recap-phrase' }, def.reponse.juste),
        encouragement && h('p', { class: 'petit' }, encouragement),
        bouton));
    document.body.append(fond);
    UI.confettis(fond);
    Alvin.saute(alvin);
    Sons.victoire();
    for (let i = 1; i <= etoiles; i++) setTimeout(() => Sons.etoile(i - 1), 450 + i * 250);
    if (R().alvinParle) Voix.dire(`${titre} ${def.reponse.juste} ${encouragement}`);
  }

  function problemeSuivant() {
    M.index++;
    if (M.index < M.problemes.length) probleme();
    else bilan();
  }

  // ---------- Bilan de la mission ----------
  function bilan() {
    jeton++;
    P = null;
    const D = Store.data;
    D.missions++;
    const autocollant = Recompenses.nouvelAutocollant();
    const avant = D.pieces;
    if (D.pieces < 10) D.pieces++;
    Store.sauver();
    const promu = Store.verifierPromotion(M.planete);
    const nouvellePiece = D.pieces > avant ? D.pieces : 0;
    const max = M.problemes.length * 3;
    const alvin = Alvin.creer(140);
    Alvin.humeur(alvin, 'content');

    const recompenses = h('div', { class: 'bilan-recompenses' },
      h('div', { class: 'bilan-bloc' },
        h('h2', null, autocollant ? 'Nouvel autocollant !' : 'Album complet !'),
        autocollant
          ? h('div', { class: 'autocollant gros brille' }, h('span', { class: 'emoji' }, autocollant.e), h('span', { class: 'nom' }, autocollant.nom))
          : h('p', null, 'Tu as tous les autocollants. Incroyable !')),
      h('div', { class: 'bilan-bloc' },
        h('h2', null, nouvellePiece ? 'Nouvelle pièce de fusée !' : 'Ta fusée est terminée !'),
        h('div', { class: 'fusee-cadre', html: Recompenses.fuseeSVG(D.pieces, nouvellePiece) }),
        h('p', null, nouvellePiece ? `Tu as gagné ${Recompenses.NOMS_PIECES[nouvellePiece]} (${D.pieces} / 10)` : 'Bravo, pilote !')));

    const grade = Store.grade(D.planetes[M.planete].niveau);
    const ecran = UI.ecran('ecran-bilan', h('div', { class: 'bilan' },
      alvin,
      h('h1', null, 'Mission accomplie !'),
      h('p', { class: 'bilan-etoiles' }, `⭐ ${M.etoiles} étoiles gagnées sur ${max}`),
      promu && h('div', { class: 'promotion' }, `🎖️ Promotion ! Tu deviens ${grade} sur la ${NOMS[M.planete]} !`),
      recompenses,
      h('button', { class: 'btn principal grand', onclick: () => { Sons.clic(); Ecrans.carte(); } }, 'Retour à la carte 🪐')));
    UI.confettis(ecran, 36);
    Alvin.saute(alvin);
    Sons.victoire();
    if (R().alvinParle) {
      Voix.dire(`Mission accomplie, ${D.profil.prenom} ! Tu as gagné ${M.etoiles} étoiles.` + (promu ? ` Et tu as une promotion : tu deviens ${grade} !` : ''));
    }
  }

  // debug() : état courant, utile pour tester l'app depuis la console
  return { demarrer, NOMS, debug: () => ({ M, P }) };
})();
