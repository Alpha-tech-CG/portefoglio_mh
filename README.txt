DESIGN MH — Site + Back-office
==============================

CONTENU DU DOSSIER
- index.html      : le site public (se remplit depuis data.json)
- admin.html      : le back-office (pour tout modifier)
- render.js       : moteur d'affichage du site
- admin.js        : logique du back-office
- styles.css      : styles du site
- data.json       : TON CONTENU (textes, services, projets, avis...) — modifié par l'admin
- data.backup.json: sauvegarde automatique avant chaque enregistrement
- images/         : toutes les images (photo, réalisations, arrière-plans)
- server.py       : mini-serveur local

DÉMARRER (Windows)
1. Ouvre un terminal dans ce dossier (clic droit > "Ouvrir dans le terminal")
2. Tape :  python server.py
3. Ouvre dans ton navigateur :
   - Site   : http://localhost:8000
   - Admin  : http://localhost:8000/admin.html

BACK-OFFICE
- Mot de passe par défaut : designmh2026
  (à changer dans server.py, ligne MOT_DE_PASSE)
- Tu peux : modifier tous les textes, le téléphone/WhatsApp, les réseaux,
  les services, les compétences, les chiffres, AJOUTER / RETIRER des images
  de réalisations, changer la photo d'accueil, et gérer les AVIS.
- Clique "Enregistrer" pour sauvegarder. Recharge le site pour voir le résultat.

METTRE EN LIGNE PLUS TARD
- Le site (index.html + styles.css + render.js + data.json + images/) est
  100 % statique : il peut être hébergé gratuitement (Netlify, Vercel, GitHub Pages...).
- Le back-office actuel fonctionne en LOCAL (avec server.py). Pour un back-office
  en ligne accessible à distance, il faudra un hébergement avec backend + une
  authentification renforcée (on pourra le faire ensuite).

IMPORTANT
- Ne supprime pas le dossier images/ ni data.json.
- Change le mot de passe avant toute mise en ligne.
