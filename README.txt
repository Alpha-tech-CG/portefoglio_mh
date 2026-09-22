DESIGN MH — Site + Back-office (Firebase)
=========================================

ARCHITECTURE
- Site 100% statique (index.html + styles.css + render.js + images/)
- Base de données : Firebase Firestore (projet "portfogliomh")
- Authentification admin : Firebase Auth (email/mot de passe)
- Les images sont servies depuis le dossier images/ ; les images ajoutées
  via le back-office sont compressées et stockées directement dans Firestore.

FICHIERS
- index.html / render.js : le site public (lit le contenu depuis Firestore)
- admin.html / admin.js  : le back-office (Firebase Auth + Firestore)
- styles.css             : styles du site
- images/                : photo, réalisations, arrière-plans
- data.json              : contenu initial (source du 1er import ; non utilisé en prod)
- server.py              : ANCIEN serveur local (plus nécessaire avec Firebase)

BACK-OFFICE
- Adresse : /admin.html
- Compte par défaut : admin@designmh.cg  /  mot de passe : DesignMH2026!
  (À CHANGER : Firebase Console > Authentication > Users, ou créer un nouvel utilisateur.)
- Permet de tout modifier : textes, réseaux, contact, services, compétences,
  chiffres, AJOUTER / RETIRER des réalisations (images), photo d'accueil, et AVIS.
- Clique « Enregistrer » : les changements sont écrits dans Firestore et
  apparaissent immédiatement sur le site (au rechargement).

DÉVELOPPEMENT LOCAL
- Sers le dossier en statique (les modules Firebase se chargent via https) :
    python -m http.server 8090
  puis ouvre http://localhost:8090
  (Ne pas ouvrir index.html en file:// — les modules ES ne s'y chargent pas.)

DÉPLOIEMENT (Vercel)
- Site déployé sur Vercel. Pour publier une mise à jour du CODE :
    npx vercel --prod
- Le CONTENU (textes, images, avis) se modifie via le back-office, sans redéploiement.

FIREBASE — INFOS PROJET
- Project ID : portfogliomh
- Firestore : collections config/site, services, projets, avis
- Règles : lecture publique, écriture réservée aux utilisateurs authentifiés (admin)

SÉCURITÉ
- La clé "apiKey" Firebase est publique (normal pour une app web) ; la sécurité
  est assurée par les règles Firestore + l'authentification.
- Change le mot de passe admin par défaut.
