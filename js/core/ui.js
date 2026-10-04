'use strict';
/* Petits outils d'interface : création d'éléments, écrans, fenêtres, clavier numérique. */
const UI = (() => {
  function h(tag, attrs, ...enfants) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'html') el.innerHTML = v;
        else if (k in el && typeof v !== 'string') el[k] = v;
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    ajouter(el, enfants);
    return el;
  }

  function ajouter(el, enfants) {
    for (const e of [enfants].flat(Infinity)) {
      if (e == null || e === false) continue;
      el.append(e instanceof Node ? e : document.createTextNode(String(e)));
    }
  }

  function vider(el) {
    while (el.firstChild) el.firstChild.remove();
  }

  function ecran(classe, ...enfants) {
    Voix.stop();
    document.querySelectorAll('.modal-fond').forEach(m => m.remove());
    window.onresize = null;
    const app = document.getElementById('app');
    vider(app);
    const el = h('div', { class: 'ecran ' + classe }, ...enfants);
    app.append(el);
    window.scrollTo(0, 0);
    return el;
  }

  function modal({ titre, contenu, boutons = [], fermable = true, classe = '' }) {
    const boite = h('div', { class: 'modal ' + classe, role: 'dialog', 'aria-modal': 'true' });
    const fond = h('div', { class: 'modal-fond' }, boite);
    const fermer = () => fond.remove();
    if (titre) boite.append(h('h2', null, titre));
    if (contenu) ajouter(boite, contenu);
    if (boutons.length) {
      boite.append(h('div', { class: 'modal-boutons' }, boutons.map(b => h('button', {
        class: 'btn ' + (b.classe || 'secondaire'),
        onclick: () => { Sons.clic(); fermer(); if (b.action) b.action(); },
      }, b.label))));
    }
    if (fermable) fond.addEventListener('click', e => { if (e.target === fond) fermer(); });
    document.body.append(fond);
    return { fermer, boite, fond };
  }

  let minuteurToast;
  function toast(message) {
    const t = document.getElementById('toast');
    t.textContent = message;
    t.classList.add('visible');
    clearTimeout(minuteurToast);
    minuteurToast = setTimeout(() => t.classList.remove('visible'), 2600);
  }

  function secouer(el) {
    el.classList.remove('secoue');
    void el.offsetWidth;
    el.classList.add('secoue');
  }

  function confettis(parent, n = 24) {
    const couleurs = ['#ffd23f', '#ff8a3d', '#7c5cff', '#22b573', '#3aa0ff', '#ff5d73'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('span');
      c.className = 'confetti';
      const angle = Math.random() * Math.PI * 2;
      const distance = 120 + Math.random() * 220;
      c.style.setProperty('--x', Math.cos(angle) * distance + 'px');
      c.style.setProperty('--y', Math.sin(angle) * distance - 60 + 'px');
      c.style.setProperty('--r', Math.random() * 720 - 360 + 'deg');
      c.style.background = couleurs[i % couleurs.length];
      c.style.animationDelay = Math.random() * 0.15 + 's';
      parent.append(c);
      setTimeout(() => c.remove(), 1700);
    }
  }

  // Nombres à la française : 1 250
  const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  // Clavier numérique (le dernier créé reçoit aussi les touches du clavier physique)
  let clavierActif = null;
  document.addEventListener('keydown', e => {
    if (!clavierActif || !document.body.contains(clavierActif.el)) return;
    if (e.target.matches && e.target.matches('input, select, textarea')) return;
    if (/^[0-9]$/.test(e.key)) { clavierActif.chiffre(e.key); e.preventDefault(); }
    else if (e.key === 'Backspace') { clavierActif.effacer(); e.preventDefault(); }
    else if (e.key === 'Enter') { clavierActif.valider(); e.preventDefault(); }
  });

  function clavier({ chiffre, effacer, valider }) {
    const el = h('div', { class: 'clavier' });
    const touche = (texte, classe, action, label) => h('button', {
      class: 'touche ' + classe, 'aria-label': label || texte,
      onclick: () => { Sons.clic(); action(); },
    }, texte);
    for (const c of '123456789') el.append(touche(c, '', () => chiffre(c)));
    el.append(touche('⌫', 'effacer', effacer, 'Effacer'));
    el.append(touche('0', '', () => chiffre('0')));
    el.append(touche('✓', 'valider', valider, 'Valider'));
    clavierActif = { el, chiffre, effacer, valider };
    return el;
  }

  return { h, vider, ecran, modal, toast, secouer, confettis, fmt, clavier };
})();
