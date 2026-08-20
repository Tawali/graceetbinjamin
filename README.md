# Grace & Benjamin — Invitation de mariage

Même principe que le logiciel de pointage : un petit serveur (`server.js`)
qui sert les pages et enregistre les réponses dans un fichier
(`data.json`). Pas de Firebase, pas de Google Sheet, pas de compte externe.

| Fichier | Rôle |
|---|---|
| `index.html` | L'invitation publique (formulaire RSVP) |
| `admin.html` | Espace privé, protégé par mot de passe, pour voir les réponses |
| `server.js` | Le petit serveur — sert les pages et gère les données |
| `data.json` | Les réponses RSVP, enregistrées ici automatiquement |
| `manifest.json` | Petit fichier technique pour l'icône du site |

```
Invité remplit le formulaire (index.html)
        │
        ▼
   server.js écrit directement dans data.json
        │
        ▼
Vous ouvrez admin.html → server.js lit data.json → vous voyez la réponse
```

Aucune étape intermédiaire, aucun service tiers — tout se passe entre
votre page et votre propre serveur.

---

## Étape 1 — Changer le mot de passe admin

Ouvrez `server.js`, ligne 15 environ :
```js
const ADMIN_KEY = 'change-moi';
```
Remplacez `'change-moi'` par le mot de passe de votre choix, avant de
déployer.

---

## Étape 2 — Tester en local (optionnel)

Si vous avez [Node.js](https://nodejs.org) installé sur votre PC :
```bash
node server.js
```
Puis ouvrez `http://localhost:3000` (invitation) et
`http://localhost:3000/admin.html` (espace admin) dans votre navigateur.

---

## Étape 3 — Mettre le site en ligne pour que les invités y accèdent

Contrairement au logiciel de pointage (utilisé sur un seul Wi-Fi, à
l'accueil), vos invités vont répondre depuis chez eux, sur internet — il
faut donc que `server.js` tourne sur un serveur accessible en ligne, pas
juste sur votre PC.

La façon la plus simple et gratuite : **Render.com**.

1. Créez un compte sur [render.com](https://render.com) (gratuit).
2. Mettez ce dossier sur GitHub (nouveau dépôt, puis glisser-déposer les
   fichiers via l'interface web de GitHub si vous ne connaissez pas Git).
3. Sur Render : **New +** → **Web Service** → connectez votre dépôt GitHub.
4. Render détecte un projet Node automatiquement. Vérifiez :
   - **Build Command** : laissez vide
   - **Start Command** : `node server.js`
   - **Plan** : Free
5. Cliquez **Create Web Service**. Après une minute ou deux, votre site
   est en ligne à une adresse du type :
   ```
   https://grace-benjamin.onrender.com
   ```
   C'est ce lien que vous partagez aux invités. L'admin est à
   `https://grace-benjamin.onrender.com/admin.html`.

**À savoir sur le plan gratuit de Render :**
- Le site "s'endort" après 15 minutes sans visite, et met ~30 secondes à
  se réveiller au premier visiteur suivant — normal, pas un bug.
- `data.json` reste intact tant que vous ne redéployez pas de nouvelle
  version du code. Si vous prévoyez de modifier le site après avoir
  commencé à recevoir des réponses, faites-moi signe : on ajoutera un
  petit export/sauvegarde avant chaque changement pour ne rien perdre.

---

## Dépannage

- **"Impossible de charger les réponses" dans l'admin** : le serveur
  n'est pas démarré, ou vous n'êtes pas sur la bonne adresse.
- **"Mot de passe incorrect"** : vérifiez `ADMIN_KEY` dans `server.js`
  (étape 1) — et que le serveur a bien redémarré après modification.
- **Le formulaire ne s'envoie pas** : ouvrez la console du navigateur
  (F12) pour voir le message d'erreur exact.
