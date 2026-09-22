/* Design MH — site public alimenté par Firebase Firestore */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDCfIqpnhc-DdEzSZQ7Ms5MGNjRhV3Yemo",
  authDomain: "portfogliomh.firebaseapp.com",
  projectId: "portfogliomh",
  storageBucket: "portfogliomh.firebasestorage.app",
  messagingSenderId: "421872589384",
  appId: "1:421872589384:web:cde874ff641c791caf567d"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

(async () => {
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);
  const el = (t, c) => { const e = document.createElement(t); if (c) e.className = c; return e; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const SOC = {
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-8h3l.5-4H13V7.5c0-1.1.3-1.9 1.9-1.9H17V2.1C16.6 2 15.5 2 14.3 2 11.7 2 10 3.6 10 6.5V10H7v4h3v8h3z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2.1 1.6 3.6 3.7 3.9v2.6c-1.3.1-2.5-.3-3.7-1v5.9c0 3.3-2.4 5.6-5.5 5.6-3 0-5.3-2.3-5.3-5.3 0-3.1 2.6-5.4 5.9-5V12c-.4-.1-.8-.2-1.2-.2-1.4 0-2.4 1-2.4 2.4 0 1.4 1 2.4 2.3 2.4 1.4 0 2.4-1 2.4-2.5V3H16z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.8.8-2.7-.2-.3A8 8 0 1 1 12 20z"/></svg>'
  };
  const SERV_IC = [
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>'
  ];
  const GEN_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l3 7 7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9z"/></svg>';
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  let data;
  try {
    const siteSnap = await getDoc(doc(db, 'config', 'site'));
    if (!siteSnap.exists()) throw new Error('config/site manquant');
    const site = siteSnap.data();
    const services = (await getDocs(query(collection(db, 'services'), orderBy('ordre')))).docs.map(d => d.data());
    const projets = (await getDocs(query(collection(db, 'projets'), orderBy('ordre')))).docs.map(d => d.data());
    const avis = (await getDocs(query(collection(db, 'avis'), orderBy('ordre')))).docs.map(d => d.data());
    data = Object.assign({}, site, { services, projets, avis });
  } catch (e) {
    console.error(e);
    document.body.insertAdjacentHTML('afterbegin', '<p style="padding:2rem;color:#fff">Impossible de charger les données. Réessayez plus tard.</p>');
    return;
  }

  const wa = 'https://wa.me/' + ((data.marque && data.marque.whatsapp) || '');

  function socials(container, mini) {
    container.innerHTML = '';
    const r = data.reseaux || {};
    const nets = [['facebook', r.facebook], ['instagram', r.instagram], ['tiktok', r.tiktok], ['whatsapp', wa]];
    nets.forEach(([n, href]) => {
      if (!href || href === '#') return;
      const a = el('a'); a.href = href; a.setAttribute('aria-label', n);
      if (href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
      a.innerHTML = SOC[n];
      if (mini) a.querySelector('svg').setAttribute('width', '18');
      container.appendChild(a);
    });
  }
  socials($('#socials-haut'), false);
  socials($('#socials-foot'), true);

  const hero = data.hero || {};
  $('#hero-salut-m').textContent = hero.salut || '';
  $('#hero-salut-d').textContent = hero.salut || '';
  $('#hero-titre').textContent = hero.titre || 'Je crée des';
  $('#hero-intro').textContent = hero.intro || '';
  if (hero.photo) $('#hero-photo').src = hero.photo;
  $('#hero-wa').href = wa;

  const ap = data.apropos || { stats: [] };
  $('#apropos-titre').textContent = ap.titre || '';
  $('#apropos-texte').textContent = ap.texte || '';
  const stats = ap.stats || [];
  const big = stats.find(s => s.big) || stats[0];
  if (big) { $('#ap-grand-val').dataset.compteur = big.valeur; $('#ap-grand-suf').textContent = big.suffixe || ''; $('#ap-grand-label').textContent = big.label; }
  const cg = $('#chiffres-grille'); cg.innerHTML = '';
  stats.filter(s => s !== big).forEach(s => {
    const d = el('div', 'chiffre revele');
    d.innerHTML = '<b><span data-compteur="' + s.valeur + '">0</span>' + esc(s.suffixe || '') + '</b><span>' + esc(s.label) + '</span>';
    cg.appendChild(d);
  });

  const compG = $('#comp-grille'); compG.innerHTML = '';
  (data.competences || []).forEach(col => {
    const c = el('div', 'comp-col revele');
    let h = '<h3>' + esc(col.titre) + '</h3>';
    (col.items || []).forEach(it => { const nom = it.nom, pct = it.pct; h += '<div class="barre"><div class="barre-tete"><span>' + esc(nom) + '</span><span>' + pct + '%</span></div><div class="rail"><i data-niveau="' + pct + '"></i></div></div>'; });
    c.innerHTML = h; compG.appendChild(c);
  });

  const sg = $('#serv-grille'); sg.innerHTML = '';
  (data.services || []).forEach((s, i) => {
    const a = el('article', 'serv revele');
    a.innerHTML =
      '<div class="serv-media" style="background-image:url(\'' + s.img + '\')"><span class="serv-num">' + String(i + 1).padStart(2, '0') + '</span></div>' +
      '<div class="serv-body"><div class="ic">' + (SERV_IC[i] || GEN_IC) + '</div>' +
      '<h3>' + esc(s.titre) + '</h3><p>' + esc(s.desc) + '</p>' +
      '<a href="#contact" class="serv-plus">En savoir plus ' + ARROW + '</a></div>';
    sg.appendChild(a);
  });
  const cta = el('article', 'serv serv-cta revele');
  cta.innerHTML = '<h3>Un projet en tête ?</h3><p>Décrivez votre besoin, recevez une proposition adaptée rapidement.</p><a href="#contact" class="btn ghost" style="align-self:flex-start;border-color:#fff;color:#fff">Me contacter</a>';
  sg.appendChild(cta);

  const mos = $('#mosaique'); mos.innerHTML = '';
  (data.projets || []).forEach(p => {
    const b = el('button', 'projet'); b.dataset.cat = p.cat || '';
    b.innerHTML = '<img loading="lazy" src="' + p.img + '" alt="' + esc(p.titre) + '">' +
      '<span class="projet-fleche" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17 17 7M8 7h9v9"/></svg></span>' +
      '<div class="projet-info"><span class="projet-cat">' + esc(p.label || p.cat || '') + '</span><strong>' + esc(p.titre) + '</strong></div>';
    mos.appendChild(b);
  });

  const piste = $('#piste'); piste.innerHTML = '';
  (data.avis || []).forEach(a => {
    const note = Math.max(0, Math.min(5, a.note || 5));
    const d = el('div', 'avis');
    d.innerHTML = '<div class="avis-carte"><div class="etoiles">' + '★'.repeat(note) + '<span style="opacity:.3">' + '★'.repeat(5 - note) + '</span></div>' +
      '<blockquote>' + esc(a.texte) + '</blockquote>' +
      '<div class="auteur"><div class="avatar">' + esc((a.nom || '?').trim().charAt(0).toUpperCase()) + '</div><div><strong>' + esc(a.nom) + '</strong><small>' + esc(a.role) + '</small></div></div></div>';
    piste.appendChild(d);
  });

  const tel = (data.marque && data.marque.tel) || '';
  $('#ct-tel').href = 'tel:' + tel.replace(/\s/g, '');
  $('#ct-tel-txt').textContent = tel;
  $('#ct-wa').href = wa;
  $('#ct-loc').textContent = (data.marque && data.marque.localisation) || '';
  $('#foot-tel').textContent = tel;
  $('#foot-loc').textContent = (data.marque && data.marque.localisation) || '';
  $('#wa-float').href = wa;
  $('#annee').textContent = new Date().getFullYear();

  /* ---------- Interactions ---------- */
  const mots = hero.mots && hero.mots.length ? hero.mots : ['logos'];
  const cible = $('#machine');
  let mi = 0, mj = 0, efface = false;
  (function taper() {
    if (reduit) { cible.textContent = mots[0]; return; }
    const mot = mots[mi];
    cible.textContent = mot.slice(0, mj);
    if (!efface && mj < mot.length) { mj++; setTimeout(taper, 90); }
    else if (!efface) { efface = true; setTimeout(taper, 1600); }
    else if (mj > 0) { mj--; setTimeout(taper, 45); }
    else { efface = false; mi = (mi + 1) % mots.length; setTimeout(taper, 300); }
  })();

  function compter(e2) {
    const fin = +e2.dataset.compteur, deb = performance.now();
    if (reduit) { e2.textContent = fin; return; }
    (function pas(t) { const pr = Math.min((t - deb) / 1800, 1); e2.textContent = Math.round(fin * (1 - Math.pow(1 - pr, 3))); if (pr < 1) requestAnimationFrame(pas); })(deb);
  }
  const obs = new IntersectionObserver(es => es.forEach(e2 => {
    if (!e2.isIntersecting) return;
    const t = e2.target;
    if (t.classList.contains('revele')) { t.classList.add('vu'); t.querySelectorAll('.rail i').forEach(b => b.style.width = b.dataset.niveau + '%'); }
    if (t.dataset.compteur) compter(t);
    obs.unobserve(t);
  }), { threshold: .15 });
  document.querySelectorAll('.revele,[data-compteur]').forEach(e2 => obs.observe(e2));

  const entete = $('#entete'), haut = $('#haut'), liens = document.querySelectorAll('.liens a');
  const secs = [...liens].map(a => document.querySelector(a.getAttribute('href')));
  addEventListener('scroll', () => {
    const y = scrollY;
    entete.classList.toggle('scrolle', y > 40);
    haut.classList.toggle('visible', y > 600);
    let act = 0; secs.forEach((s, k) => { if (s && s.offsetTop - 160 <= y) act = k; });
    liens.forEach((a, k) => a.classList.toggle('actif', k === act));
  }, { passive: true });
  haut.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

  const burger = $('#burger'), overlay = $('#overlay');
  const fermer = () => { overlay.classList.remove('ouvert'); burger.setAttribute('aria-expanded', false); document.body.style.overflow = ''; };
  burger.onclick = () => { const o = overlay.classList.toggle('ouvert'); burger.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; };
  overlay.querySelectorAll('a').forEach(a => a.onclick = fermer);

  const projets = [...document.querySelectorAll('.projet')];
  document.querySelectorAll('.filtres button').forEach(b => b.onclick = () => {
    document.querySelectorAll('.filtres button').forEach(x => x.classList.remove('actif'));
    b.classList.add('actif');
    projets.forEach(p => p.classList.toggle('cache', b.dataset.filtre !== 'tous' && p.dataset.cat !== b.dataset.filtre));
  });

  const vis = $('#visionneuse'), vImg = $('#v-img'), vTitre = $('#v-titre');
  let visibles = [], idx = 0;
  function montrer(k) { idx = (k + visibles.length) % visibles.length; const p = visibles[idx], im = p.querySelector('img'); vImg.src = im.src; vImg.alt = im.alt; vTitre.textContent = p.querySelector('strong').textContent + ' (' + (idx + 1) + '/' + visibles.length + ')'; }
  projets.forEach(p => p.onclick = () => { visibles = projets.filter(x => !x.classList.contains('cache')); montrer(visibles.indexOf(p)); vis.classList.add('ouverte'); document.body.style.overflow = 'hidden'; $('#v-fermer').focus(); });
  const fv = () => { vis.classList.remove('ouverte'); document.body.style.overflow = ''; };
  $('#v-fermer').onclick = fv;
  $('#v-prec').onclick = e2 => { e2.stopPropagation(); montrer(idx - 1); };
  $('#v-suiv').onclick = e2 => { e2.stopPropagation(); montrer(idx + 1); };
  vis.onclick = e2 => { if (e2.target === vis) fv(); };
  addEventListener('keydown', e2 => { if (!vis.classList.contains('ouverte')) return; if (e2.key === 'Escape') fv(); if (e2.key === 'ArrowLeft') montrer(idx - 1); if (e2.key === 'ArrowRight') montrer(idx + 1); });
  let x0 = null;
  vis.addEventListener('touchstart', e2 => x0 = e2.touches[0].clientX, { passive: true });
  vis.addEventListener('touchend', e2 => { if (x0 === null) return; const dx = e2.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) montrer(idx + (dx < 0 ? 1 : -1)); x0 = null; });

  const pisteC = $('#piste'), points = $('#points');
  const total = pisteC.children.length; let courant = 0, minuteur;
  points.innerHTML = '';
  for (let k = 0; k < total; k++) { const b = el('button'); b.setAttribute('aria-label', 'Témoignage ' + (k + 1)); b.onclick = () => { aller(k); relancer(); }; points.appendChild(b); }
  function aller(k) { courant = k; pisteC.style.transform = 'translateX(-' + (k * 100) + '%)'; [...points.children].forEach((b, n) => b.classList.toggle('actif', n === k)); }
  function relancer() { clearInterval(minuteur); if (!reduit && total > 1) minuteur = setInterval(() => aller((courant + 1) % total), 5500); }
  if (total) { aller(0); relancer(); }

  const form = $('#formulaire');
  form.onsubmit = e2 => {
    e2.preventDefault();
    const d = new FormData(form);
    const txt = 'Bonjour Design MH,%0A%0ANom : ' + encodeURIComponent(d.get('nom') || '') + '%0ATéléphone : ' + encodeURIComponent(d.get('tel') || '') + '%0AE-mail : ' + encodeURIComponent(d.get('email') || '') + '%0AProjet : ' + encodeURIComponent(d.get('sujet') || '') + '%0A%0A' + encodeURIComponent(d.get('message') || '');
    window.open(wa + '?text=' + txt, '_blank');
  };

  (function fond() {
    const fx = $('#fx'); if (!fx || reduit) return;
    const svgs = [
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 4C11 4 6 9 6 17l-2 3 3-2c8 0 13-5 13-14z"/><path d="M9 15c3 0 6-2 8-6"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2l3 7-3 3-3-3 3-7z"/><path d="M9 12l-4 8 8-4"/><circle cx="12" cy="19.5" r="1.2"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="4" height="4"/><rect x="17" y="17" width="4" height="4"/><path d="M5 7c0 8 12 2 12 10"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 7l3 3-7 7-3-3z"/><path d="M14 7l3-3 3 3-3 3z"/><path d="M4 20c2 0 3-1 3-3"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 3l14 7-6 2-2 6z"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 19l9-9"/><path d="M14 6l1-3 1 3 3 1-3 1-1 3-1-3-3-1z"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="9" y="9" width="6" height="6"/><path d="M4 4h3v3H4zM17 4h3v3h-3zM4 17h3v3H4zM17 17h3v3h-3z"/><path d="M7 5.5h10M7 18.5h10M5.5 7v10M18.5 7v10"/></svg>'
    ];
    const toks = ['</>', '{ }', '<div>', '#', 'px', 'CSS', 'HTML', 'JS', '{;}', '&&', 'rgb()', 'A+'];
    const cols = ['var(--or)', 'var(--or)', 'var(--or-clair)', '#ffffff', '#ffffff', 'var(--rose-clair)'];
    for (let n = 0; n < 28; n++) {
      const it = el('span', 'item');
      const txt = Math.random() < .42;
      if (txt) { it.classList.add('txt'); it.textContent = toks[(Math.random() * toks.length) | 0]; }
      else it.innerHTML = svgs[(Math.random() * svgs.length) | 0];
      const sz = txt ? (15 + Math.random() * 20) : (22 + Math.random() * 32);
      it.style.left = (Math.random() * 95) + '%';
      if (txt) it.style.fontSize = sz + 'px'; else { it.style.width = sz + 'px'; it.style.height = sz + 'px'; }
      it.style.color = cols[(Math.random() * cols.length) | 0];
      const dur = 16 + Math.random() * 22;
      it.style.animationDuration = dur + 's';
      it.style.animationDelay = (-Math.random() * dur) + 's';
      it.style.setProperty('--rot', (Math.random() * 320 - 160) + 'deg');
      it.style.opacity = (.10 + Math.random() * .11).toFixed(2);
      fx.appendChild(it);
    }
  })();
})();
