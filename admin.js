/* Back-office Design MH — Firebase Auth + Firestore */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, orderBy, writeBatch } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDCfIqpnhc-DdEzSZQ7Ms5MGNjRhV3Yemo",
  authDomain: "portfogliomh.firebaseapp.com",
  projectId: "portfogliomh",
  storageBucket: "portfogliomh.firebasestorage.app",
  messagingSenderId: "421872589384",
  appId: "1:421872589384:web:cde874ff641c791caf567d"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = s => document.querySelector(s);
const e = (t, c, h) => { const x = document.createElement(t); if (c) x.className = c; if (h != null) x.innerHTML = h; return x; };
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2400); };
let D = null;

/* ---------- Auth ---------- */
$('#btn-login').onclick = async () => {
  const mail = $('#mail').value.trim(), mdp = $('#mdp').value;
  $('#login-err').textContent = 'Connexion…';
  try { await signInWithEmailAndPassword(auth, mail, mdp); }
  catch (err) { $('#login-err').textContent = err.code === 'auth/invalid-credential' ? 'E-mail ou mot de passe incorrect' : ('Erreur : ' + err.code); }
};
$('#mdp').addEventListener('keydown', ev => { if (ev.key === 'Enter') $('#btn-login').click(); });
$('#btn-logout').onclick = () => signOut(auth);

onAuthStateChanged(auth, async user => {
  if (user) {
    $('#login').style.display = 'none';
    $('#app').style.display = '';
    $('#statut').textContent = user.email;
    if (!D) { await load(); renderApp(); }
  } else {
    D = null;
    $('#app').style.display = 'none';
    $('#login').style.display = 'grid';
    $('#login-err').textContent = '';
  }
});

/* ---------- Chargement ---------- */
async function load() {
  const site = (await getDoc(doc(db, 'config', 'site'))).data() || {};
  const services = (await getDocs(query(collection(db, 'services'), orderBy('ordre')))).docs.map(d => ({ id: d.id, ...d.data() }));
  const projets = (await getDocs(query(collection(db, 'projets'), orderBy('ordre')))).docs.map(d => ({ id: d.id, ...d.data() }));
  const avis = (await getDocs(query(collection(db, 'avis'), orderBy('ordre')))).docs.map(d => ({ id: d.id, ...d.data() }));
  D = {
    marque: site.marque || {}, reseaux: site.reseaux || {},
    hero: site.hero || { mots: [] }, apropos: site.apropos || { stats: [] },
    competences: site.competences || [], services, projets, avis
  };
}

/* ---------- Champs ---------- */
function champ(label, val, on, type) {
  const w = e('div', 'champ'); w.appendChild(e('label', '', label));
  const i = type === 'area' ? e('textarea') : e('input');
  if (type && type !== 'area') i.type = type;
  i.value = val == null ? '' : val; i.onchange = () => on(i.value);
  w.appendChild(i); return w;
}

async function compressImage(file, max, type, quality) {
  return new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.width, h = img.height;
      if (w > max) { h = Math.round(h * max / w); w = max; }
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      res(c.toDataURL(type || 'image/jpeg', quality || 0.72));
    };
    img.onerror = rej; img.src = url;
  });
}

function fichier(label, cb, opts) {
  opts = opts || {};
  const w = e('div', 'champ');
  const btn = e('label', 'btn ' + (opts.big ? 'or' : 'ghost') + ' mini'); btn.textContent = label; btn.style.display = 'inline-block';
  const inp = e('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.style.display = 'none';
  inp.onchange = async () => {
    if (!inp.files[0]) return;
    btn.textContent = 'Traitement…';
    try {
      const durl = opts.png
        ? await compressImage(inp.files[0], 900, 'image/png')
        : await compressImage(inp.files[0], 1400, 'image/jpeg', 0.72);
      cb(durl); toast('Image prête (sera enregistrée avec « Enregistrer »)');
    } catch (err) { toast('Erreur image'); }
    btn.textContent = label; inp.value = '';
  };
  btn.appendChild(inp); w.appendChild(btn); return w;
}

/* ---------- Rendu ---------- */
function renderApp() {
  const app2 = $('#app'); app2.innerHTML = '';

  // Général
  let b = e('div', 'bloc'); b.appendChild(e('h2', '', 'Général & réseaux'));
  let g = e('div', 'grille');
  g.appendChild(champ('Nom', D.marque.nom, v => D.marque.nom = v));
  g.appendChild(champ('Localisation', D.marque.localisation, v => D.marque.localisation = v));
  g.appendChild(champ('Téléphone (affiché)', D.marque.tel, v => D.marque.tel = v));
  g.appendChild(champ('WhatsApp (chiffres)', D.marque.whatsapp, v => D.marque.whatsapp = v.replace(/\D/g, '')));
  g.appendChild(champ('Lien Facebook', D.reseaux.facebook, v => D.reseaux.facebook = v));
  g.appendChild(champ('Lien Instagram', D.reseaux.instagram, v => D.reseaux.instagram = v));
  g.appendChild(champ('Lien TikTok', D.reseaux.tiktok, v => D.reseaux.tiktok = v));
  b.appendChild(g); app2.appendChild(b);

  // Accueil
  b = e('div', 'bloc'); b.appendChild(e('h2', '', 'Accueil (hero)'));
  b.appendChild(champ('Sur-titre', D.hero.salut, v => D.hero.salut = v));
  b.appendChild(champ('Titre', D.hero.titre, v => D.hero.titre = v));
  b.appendChild(champ('Mots animés (un par ligne)', (D.hero.mots || []).join('\n'), v => D.hero.mots = v.split('\n').map(s => s.trim()).filter(Boolean), 'area'));
  b.appendChild(champ("Texte d'introduction", D.hero.intro, v => D.hero.intro = v, 'area'));
  b.appendChild(e('label', '', 'Photo (portrait)'));
  const apI = e('img', 'apercu'); apI.src = D.hero.photo || ''; b.appendChild(apI);
  b.appendChild(fichier('Changer la photo', p => { D.hero.photo = p; apI.src = p; }, { png: true }));
  app2.appendChild(b);

  // À propos
  b = e('div', 'bloc'); b.appendChild(e('h2', '', 'À propos & chiffres'));
  b.appendChild(champ('Titre', D.apropos.titre, v => D.apropos.titre = v));
  b.appendChild(champ('Texte', D.apropos.texte, v => D.apropos.texte = v, 'area'));
  b.appendChild(e('label', '', 'Chiffres (coche « mis en avant » pour la grande carte)'));
  (D.apropos.stats || []).forEach((s, i) => {
    const li = e('div', 'ligne-item'); const gg = e('div', 'grille');
    gg.appendChild(champ('Valeur', s.valeur, v => s.valeur = parseInt(v) || 0, 'number'));
    gg.appendChild(champ('Suffixe', s.suffixe, v => s.suffixe = v));
    li.appendChild(gg);
    li.appendChild(champ('Libellé', s.label, v => s.label = v));
    const lb = e('label', '', '<input type="checkbox" ' + (s.big ? 'checked' : '') + '> Mis en avant');
    lb.querySelector('input').onchange = ev => { D.apropos.stats.forEach(x => x.big = false); s.big = ev.target.checked; };
    li.appendChild(lb);
    const rm = e('button', 'btn danger mini sup', 'Suppr'); rm.onclick = () => { D.apropos.stats.splice(i, 1); renderApp(); };
    li.appendChild(rm); b.appendChild(li);
  });
  const addStat = e('button', 'btn ghost mini row-add', '+ Ajouter un chiffre'); addStat.onclick = () => { D.apropos.stats.push({ valeur: 0, suffixe: '', label: 'Nouveau', big: false }); renderApp(); };
  b.appendChild(addStat); app2.appendChild(b);

  // Compétences
  b = e('div', 'bloc'); b.appendChild(e('h2', '', 'Compétences'));
  (D.competences || []).forEach((col, ci) => {
    const li = e('div', 'ligne-item');
    li.appendChild(champ('Colonne', col.titre, v => col.titre = v));
    (col.items || []).forEach((it, ii) => {
      const gg = e('div', 'grille');
      gg.appendChild(champ('Outil', it.nom, v => it.nom = v));
      gg.appendChild(champ('Niveau %', it.pct, v => it.pct = Math.max(0, Math.min(100, parseInt(v) || 0)), 'number'));
      const rm = e('button', 'btn danger mini', 'Retirer'); rm.onclick = () => { col.items.splice(ii, 1); renderApp(); };
      li.appendChild(gg); li.appendChild(rm);
    });
    const addI = e('button', 'btn ghost mini row-add', '+ Outil'); addI.onclick = () => { col.items.push({ nom: 'Nouvel outil', pct: 70 }); renderApp(); };
    li.appendChild(addI);
    const rmc = e('button', 'btn danger mini sup', 'Suppr colonne'); rmc.onclick = () => { D.competences.splice(ci, 1); renderApp(); };
    li.appendChild(rmc); b.appendChild(li);
  });
  const addCol = e('button', 'btn ghost mini row-add', '+ Ajouter une colonne'); addCol.onclick = () => { D.competences.push({ titre: 'Nouvelle', items: [{ nom: 'Outil', pct: 70 }] }); renderApp(); };
  b.appendChild(addCol); app2.appendChild(b);

  // Services
  b = e('div', 'bloc'); b.appendChild(e('h2', '', 'Services'));
  D.services.forEach((s, i) => {
    const li = e('div', 'ligne-item'); const gg = e('div', 'grille');
    const left = e('div');
    left.appendChild(champ('Titre', s.titre, v => s.titre = v));
    left.appendChild(champ('Description', s.desc, v => s.desc = v, 'area'));
    const right = e('div');
    const ap2 = e('img', 'apercu'); ap2.style.height = '110px'; ap2.src = s.img || ''; right.appendChild(ap2);
    right.appendChild(fichier("Changer l'image", p => { s.img = p; ap2.src = p; }));
    gg.appendChild(left); gg.appendChild(right); li.appendChild(gg);
    const rm = e('button', 'btn danger mini sup', 'Suppr'); rm.onclick = () => { D.services.splice(i, 1); renderApp(); };
    li.appendChild(rm); b.appendChild(li);
  });
  const addServ = e('button', 'btn ghost mini row-add', '+ Ajouter un service'); addServ.onclick = () => { D.services.push({ titre: 'Nouveau service', desc: '', img: 'images/bg-web.jpg' }); renderApp(); };
  b.appendChild(addServ); app2.appendChild(b);

  // Réalisations
  b = e('div', 'bloc'); b.appendChild(e('h2', '', 'Réalisations (galerie)'));
  b.appendChild(fichier('+ Ajouter une image de réalisation', p => { D.projets.unshift({ img: p, cat: 'pub', label: 'Publicité', titre: 'Nouveau projet' }); renderApp(); }, { big: true }));
  const gal = e('div', 'gal');
  const CATS = [['pub', 'Publicité'], ['evenement', 'Événements'], ['anniv', 'Anniversaires'], ['packaging', 'Packaging']];
  D.projets.forEach((p, i) => {
    const it = e('div', 'item'); const img = e('img'); img.src = p.img || ''; it.appendChild(img);
    const c = e('div', 'corps');
    const sel = e('select');
    CATS.forEach(([v, t]) => { const o = e('option', '', t); o.value = v; if (p.cat === v) o.selected = true; sel.appendChild(o); });
    sel.onchange = () => { p.cat = sel.value; const f = CATS.find(x => x[0] === sel.value); p.label = f ? f[1] : sel.value; };
    c.appendChild(sel);
    const ti = e('input'); ti.value = p.titre || ''; ti.placeholder = 'Titre'; ti.onchange = () => p.titre = ti.value; c.appendChild(ti);
    const rm = e('button', 'btn danger mini', 'Retirer'); rm.style.width = '100%'; rm.onclick = () => { D.projets.splice(i, 1); renderApp(); };
    c.appendChild(rm); it.appendChild(c); gal.appendChild(it);
  });
  b.appendChild(gal); app2.appendChild(b);

  // Avis
  b = e('div', 'bloc'); b.appendChild(e('h2', '', 'Avis clients'));
  D.avis.forEach((a, i) => {
    const li = e('div', 'ligne-item'); const gg = e('div', 'grille');
    gg.appendChild(champ('Nom', a.nom, v => a.nom = v));
    gg.appendChild(champ('Rôle / entreprise', a.role, v => a.role = v));
    li.appendChild(gg);
    li.appendChild(champ('Note (1 à 5)', a.note, v => a.note = Math.max(1, Math.min(5, parseInt(v) || 5)), 'number'));
    li.appendChild(champ('Témoignage', a.texte, v => a.texte = v, 'area'));
    const rm = e('button', 'btn danger mini sup', 'Suppr'); rm.onclick = () => { D.avis.splice(i, 1); renderApp(); };
    li.appendChild(rm); b.appendChild(li);
  });
  const addAvis = e('button', 'btn ghost mini row-add', '+ Ajouter un avis'); addAvis.onclick = () => { D.avis.push({ note: 5, texte: '', nom: 'Client', role: 'Entreprise, Brazzaville' }); renderApp(); };
  b.appendChild(addAvis); app2.appendChild(b);
}

/* ---------- Enregistrement ---------- */
async function replaceCollection(name, arr, mapFn) {
  const existing = await getDocs(collection(db, name));
  const batch = writeBatch(db);
  existing.forEach(d => batch.delete(d.ref));
  arr.forEach((item, i) => batch.set(doc(collection(db, name)), mapFn(item, i)));
  await batch.commit();
}

$('#btn-save').onclick = async () => {
  if (!D) return;
  $('#statut').textContent = 'Enregistrement…';
  try {
    await setDoc(doc(db, 'config', 'site'), {
      marque: D.marque, reseaux: D.reseaux, hero: D.hero, apropos: D.apropos, competences: D.competences
    });
    await replaceCollection('services', D.services, (s, i) => ({ ordre: i + 1, titre: s.titre || '', desc: s.desc || '', img: s.img || '' }));
    await replaceCollection('projets', D.projets, (p, i) => ({ ordre: i + 1, cat: p.cat || 'pub', label: p.label || '', titre: p.titre || '', img: p.img || '' }));
    await replaceCollection('avis', D.avis, (a, i) => ({ ordre: i + 1, note: a.note || 5, texte: a.texte || '', nom: a.nom || '', role: a.role || '' }));
    $('#statut').textContent = 'Enregistré ✓ ' + new Date().toLocaleTimeString();
    toast('Modifications enregistrées');
    await load();
  } catch (err) {
    console.error(err);
    $('#statut').textContent = '';
    toast('Erreur : ' + (err.code || err.message || ''));
  }
};
