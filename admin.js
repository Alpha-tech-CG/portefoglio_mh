/* Back-office Design MH */
(() => {
  const $ = s => document.querySelector(s);
  const e = (t, c, h) => { const x = document.createElement(t); if (c) x.className = c; if (h != null) x.innerHTML = h; return x; };
  let D = null;
  const auth = () => sessionStorage.getItem('mh_auth') || '';

  /* ---- Login ---- */
  const login = $('#login');
  function tryLogin(pwd) {
    // vérifie le mot de passe via un POST vide protégé
    return fetch('/api/data', { method: 'POST', headers: { 'X-Auth': pwd, 'Content-Type': 'application/json' }, body: 'null' })
      .then(r => r.status !== 401);
  }
  $('#btn-login').onclick = async () => {
    const pwd = $('#mdp').value;
    $('#login-err').textContent = 'Vérification…';
    // On teste le mot de passe avec un vrai enregistrement neutre : on recharge d'abord les données
    const okData = await fetch('/api/data').then(r => r.json()).catch(() => null);
    if (!okData) { $('#login-err').textContent = "Serveur introuvable. Lancez : python server.py"; return; }
    // test auth : renvoyer les données telles quelles (POST) — si 401, mauvais mdp
    const res = await fetch('/api/data', { method: 'POST', headers: { 'X-Auth': pwd, 'Content-Type': 'application/json' }, body: JSON.stringify(okData) });
    if (res.status === 401) { $('#login-err').textContent = 'Mot de passe incorrect'; return; }
    sessionStorage.setItem('mh_auth', pwd);
    D = okData;
    login.style.display = 'none';
    $('#app').style.display = '';
    renderApp();
  };
  $('#mdp').addEventListener('keydown', ev => { if (ev.key === 'Enter') $('#btn-login').click(); });

  /* ---- Upload ---- */
  function upload(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = async () => {
        const r = await fetch('/api/upload', { method: 'POST', headers: { 'X-Auth': auth(), 'Content-Type': 'application/json' }, body: JSON.stringify({ name: file.name, dataUrl: fr.result }) });
        const j = await r.json();
        if (j.path) resolve(j.path); else reject(j.error || 'Erreur');
      };
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  /* ---- Helpers de champ ---- */
  function champ(label, val, on, type) {
    const w = e('div', 'champ');
    w.appendChild(e('label', '', label));
    const i = type === 'area' ? e('textarea') : e('input');
    if (type && type !== 'area') i.type = type;
    i.value = val == null ? '' : val;
    i.onchange = () => on(i.value);
    w.appendChild(i);
    return w;
  }

  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2200); }

  /* ---- Rendu ---- */
  function renderApp() {
    const app = $('#app'); app.innerHTML = '';

    /* Général */
    let b = e('div', 'bloc'); b.appendChild(e('h2', '', 'Général & réseaux'));
    let g = e('div', 'grille');
    g.appendChild(champ('Nom', D.marque.nom, v => D.marque.nom = v));
    g.appendChild(champ('Localisation', D.marque.localisation, v => D.marque.localisation = v));
    g.appendChild(champ('Téléphone (affiché)', D.marque.tel, v => D.marque.tel = v));
    g.appendChild(champ('WhatsApp (chiffres, ex 242066469382)', D.marque.whatsapp, v => D.marque.whatsapp = v.replace(/\D/g, '')));
    g.appendChild(champ('Lien Facebook', D.reseaux.facebook, v => D.reseaux.facebook = v));
    g.appendChild(champ('Lien Instagram', D.reseaux.instagram, v => D.reseaux.instagram = v));
    g.appendChild(champ('Lien TikTok', D.reseaux.tiktok, v => D.reseaux.tiktok = v));
    b.appendChild(g); app.appendChild(b);

    /* Accueil */
    b = e('div', 'bloc'); b.appendChild(e('h2', '', 'Accueil (hero)'));
    b.appendChild(champ('Sur-titre', D.hero.salut, v => D.hero.salut = v));
    b.appendChild(champ('Titre', D.hero.titre, v => D.hero.titre = v));
    b.appendChild(champ('Mots animés (un par ligne)', (D.hero.mots || []).join('\n'), v => D.hero.mots = v.split('\n').map(s => s.trim()).filter(Boolean), 'area'));
    b.appendChild(champ('Texte d\'introduction', D.hero.intro, v => D.hero.intro = v, 'area'));
    b.appendChild(e('label', '', 'Photo (portrait détouré recommandé)'));
    const ap = e('img', 'apercu'); ap.src = D.hero.photo; b.appendChild(ap);
    b.appendChild(fichier('Changer la photo', p => { D.hero.photo = p; ap.src = p + '?' + Date.now(); }));
    app.appendChild(b);

    /* À propos */
    b = e('div', 'bloc'); b.appendChild(e('h2', '', 'À propos & chiffres'));
    b.appendChild(champ('Titre', D.apropos.titre, v => D.apropos.titre = v));
    b.appendChild(champ('Texte', D.apropos.texte, v => D.apropos.texte = v, 'area'));
    b.appendChild(e('label', '', 'Chiffres (cochez « mis en avant » pour la grande carte)'));
    D.apropos.stats.forEach((s, i) => {
      const li = e('div', 'ligne-item');
      const gg = e('div', 'grille');
      gg.appendChild(champ('Valeur', s.valeur, v => s.valeur = parseInt(v) || 0, 'number'));
      gg.appendChild(champ('Suffixe (ex +)', s.suffixe, v => s.suffixe = v));
      li.appendChild(gg);
      li.appendChild(champ('Libellé', s.label, v => s.label = v));
      const lb = e('label', '', '<input type="checkbox" ' + (s.big ? 'checked' : '') + '> Mis en avant (grande carte)');
      lb.querySelector('input').onchange = ev => { D.apropos.stats.forEach(x => x.big = false); s.big = ev.target.checked; };
      li.appendChild(lb);
      const rm = e('button', 'btn danger mini sup', 'Suppr'); rm.onclick = () => { D.apropos.stats.splice(i, 1); renderApp(); };
      li.appendChild(rm);
      b.appendChild(li);
    });
    const addStat = e('button', 'btn ghost mini row-add', '+ Ajouter un chiffre'); addStat.onclick = () => { D.apropos.stats.push({ valeur: 0, suffixe: '', label: 'Nouveau', big: false }); renderApp(); };
    b.appendChild(addStat); app.appendChild(b);

    /* Compétences */
    b = e('div', 'bloc'); b.appendChild(e('h2', '', 'Compétences'));
    D.competences.forEach((col, ci) => {
      const li = e('div', 'ligne-item');
      li.appendChild(champ('Colonne', col.titre, v => col.titre = v));
      col.items.forEach((it, ii) => {
        const gg = e('div', 'grille');
        gg.appendChild(champ('Outil', it[0], v => it[0] = v));
        gg.appendChild(champ('Niveau %', it[1], v => it[1] = Math.max(0, Math.min(100, parseInt(v) || 0)), 'number'));
        const rm = e('button', 'btn danger mini', 'Retirer cet outil'); rm.onclick = () => { col.items.splice(ii, 1); renderApp(); };
        li.appendChild(gg); li.appendChild(rm);
      });
      const addI = e('button', 'btn ghost mini row-add', '+ Outil'); addI.onclick = () => { col.items.push(['Nouvel outil', 70]); renderApp(); };
      li.appendChild(addI);
      const rmc = e('button', 'btn danger mini sup', 'Suppr colonne'); rmc.onclick = () => { D.competences.splice(ci, 1); renderApp(); };
      li.appendChild(rmc);
      b.appendChild(li);
    });
    const addCol = e('button', 'btn ghost mini row-add', '+ Ajouter une colonne'); addCol.onclick = () => { D.competences.push({ titre: 'Nouvelle', items: [['Outil', 70]] }); renderApp(); };
    b.appendChild(addCol); app.appendChild(b);

    /* Services */
    b = e('div', 'bloc'); b.appendChild(e('h2', '', 'Services'));
    D.services.forEach((s, i) => {
      const li = e('div', 'ligne-item');
      const gg = e('div', 'grille');
      const left = e('div');
      left.appendChild(champ('Titre', s.titre, v => s.titre = v));
      left.appendChild(champ('Description', s.desc, v => s.desc = v, 'area'));
      const right = e('div');
      const ap2 = e('img', 'apercu'); ap2.style.height = '110px'; ap2.src = s.img; right.appendChild(ap2);
      right.appendChild(fichier('Changer l\'image', p => { s.img = p; ap2.src = p + '?' + Date.now(); }));
      gg.appendChild(left); gg.appendChild(right); li.appendChild(gg);
      const rm = e('button', 'btn danger mini sup', 'Suppr'); rm.onclick = () => { D.services.splice(i, 1); renderApp(); };
      li.appendChild(rm); b.appendChild(li);
    });
    const addServ = e('button', 'btn ghost mini row-add', '+ Ajouter un service'); addServ.onclick = () => { D.services.push({ titre: 'Nouveau service', desc: '', img: 'images/bg-web.jpg' }); renderApp(); };
    b.appendChild(addServ); app.appendChild(b);

    /* Réalisations */
    b = e('div', 'bloc'); b.appendChild(e('h2', '', 'Réalisations (galerie)'));
    b.appendChild(fichier('+ Ajouter une image de réalisation', p => { D.projets.unshift({ img: p, cat: 'pub', label: 'Publicité', titre: 'Nouveau projet' }); renderApp(); }, true));
    const gal = e('div', 'gal');
    const CATS = [['pub', 'Publicité'], ['evenement', 'Événements'], ['anniv', 'Anniversaires'], ['packaging', 'Packaging']];
    D.projets.forEach((p, i) => {
      const it = e('div', 'item');
      const img = e('img'); img.src = p.img; it.appendChild(img);
      const c = e('div', 'corps');
      const sel = e('select');
      CATS.forEach(([v, t]) => { const o = e('option', '', t); o.value = v; if (p.cat === v) o.selected = true; sel.appendChild(o); });
      sel.onchange = () => { p.cat = sel.value; const found = CATS.find(x => x[0] === sel.value); p.label = found ? found[1] : sel.value; };
      c.appendChild(sel);
      const ti = e('input'); ti.value = p.titre || ''; ti.placeholder = 'Titre'; ti.onchange = () => p.titre = ti.value; c.appendChild(ti);
      const rm = e('button', 'btn danger mini', 'Retirer'); rm.style.width = '100%'; rm.onclick = () => { D.projets.splice(i, 1); renderApp(); };
      c.appendChild(rm); it.appendChild(c); gal.appendChild(it);
    });
    b.appendChild(gal); app.appendChild(b);

    /* Avis */
    b = e('div', 'bloc'); b.appendChild(e('h2', '', 'Avis clients'));
    D.avis.forEach((a, i) => {
      const li = e('div', 'ligne-item');
      const gg = e('div', 'grille');
      gg.appendChild(champ('Nom', a.nom, v => a.nom = v));
      gg.appendChild(champ('Rôle / entreprise', a.role, v => a.role = v));
      li.appendChild(gg);
      li.appendChild(champ('Note (1 à 5)', a.note, v => a.note = Math.max(1, Math.min(5, parseInt(v) || 5)), 'number'));
      li.appendChild(champ('Témoignage', a.texte, v => a.texte = v, 'area'));
      const rm = e('button', 'btn danger mini sup', 'Suppr'); rm.onclick = () => { D.avis.splice(i, 1); renderApp(); };
      li.appendChild(rm); b.appendChild(li);
    });
    const addAvis = e('button', 'btn ghost mini row-add', '+ Ajouter un avis'); addAvis.onclick = () => { D.avis.push({ note: 5, texte: '', nom: 'Client', role: 'Entreprise, Brazzaville' }); renderApp(); };
    b.appendChild(addAvis); app.appendChild(b);
  }

  /* champ fichier (upload) */
  function fichier(label, cb, big) {
    const w = e('div', 'champ');
    const btn = e('label', 'btn ' + (big ? 'or' : 'ghost') + ' mini'); btn.textContent = label; btn.style.display = 'inline-block';
    const inp = e('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.style.display = 'none';
    inp.onchange = async () => {
      if (!inp.files[0]) return;
      btn.textContent = 'Envoi…';
      try { const p = await upload(inp.files[0]); cb(p); toast('Image ajoutée'); }
      catch (err) { toast('Erreur : ' + err); }
      btn.textContent = label; inp.value = '';
    };
    btn.appendChild(inp); w.appendChild(btn);
    return w;
  }

  /* ---- Enregistrer ---- */
  $('#btn-save').onclick = async () => {
    $('#statut').textContent = 'Enregistrement…';
    try {
      const r = await fetch('/api/data', { method: 'POST', headers: { 'X-Auth': auth(), 'Content-Type': 'application/json' }, body: JSON.stringify(D) });
      if (r.status === 401) { $('#statut').textContent = ''; toast('Session expirée, reconnectez-vous'); sessionStorage.removeItem('mh_auth'); location.reload(); return; }
      const j = await r.json();
      if (j.ok) { $('#statut').textContent = 'Enregistré ✓ ' + new Date().toLocaleTimeString(); toast('Modifications enregistrées'); }
      else { $('#statut').textContent = ''; toast('Erreur : ' + (j.error || '')); }
    } catch (err) { $('#statut').textContent = ''; toast('Serveur injoignable'); }
  };

  // Auto-login si session déjà ouverte
  if (auth()) {
    fetch('/api/data').then(r => r.json()).then(d => { D = d; login.style.display = 'none'; $('#app').style.display = ''; renderApp(); }).catch(() => {});
  }
})();
