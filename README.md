# Portfolio - Développeur Web Full-Stack

Portfolio professionnel moderne et bilingue (FR/EN) construit avec Next.js 14, Firebase et Tailwind CSS. Inclut un panneau d'administration complet pour gérer le contenu dynamiquement.

---

## Table des matières

1. [Apercu](#apercu)
2. [Stack Technique](#stack-technique)
3. [Prérequis](#prérequis)
4. [Installation pas à pas](#installation-pas-à-pas)
5. [Configuration Firebase](#configuration-firebase)
6. [Variables d'environnement](#variables-denvironnement)
7. [Lancer le projet](#lancer-le-projet)
8. [Structure du projet](#structure-du-projet)
9. [Fonctionnalités](#fonctionnalités)
10. [Panneau Admin](#panneau-admin)
11. [API de traduction](#api-de-traduction)
12. [SEO et Référencement](#seo-et-référencement)
13. [Déploiement sur Vercel](#déploiement-sur-vercel)
14. [Dépannage](#dépannage)
15. [Commandes disponibles](#commandes-disponibles)

---

## Apercu

| Site Public | Panneau Admin |
|-------------|---------------|
| Portfolio bilingue FR/EN | Interface d'édition sécurisée |
| Sections: Hero, À propos, Projets, Compétences, Contact | Éditeurs: Profil, Projets, Compétences |
| Design responsive | Traduction automatique FR→EN |

---

## Stack Technique

| Catégorie | Technologies |
|-----------|-------------|
| **Framework** | Next.js 14 (App Router) |
| **Frontend** | React 18, TypeScript 5 |
| **Styling** | Tailwind CSS 3.4 |
| **Backend/BDD** | Firebase (Authentication + Firestore) |
| **Traduction** | MyMemory API (automatique FR↔EN) |
| **Linting** | ESLint |
| **Déploiement** | Vercel |

---

## Prérequis

Avant de commencer, installer ces outils sur votre machine :

### 1. Node.js (v18.17 ou supérieur)

**Téléchargement** : [https://nodejs.org/](https://nodejs.org/)

Vérifier l'installation :
```bash
node --version
# Attendu : v18.17.0 ou supérieur
```

### 2. npm (inclus avec Node.js)

```bash
npm --version
# Attendu : 9.0.0 ou supérieur
```

### 3. Git

**Téléchargement** : [https://git-scm.com/](https://git-scm.com/)

```bash
git --version
```

### 4. Compte Firebase (gratuit)

**Console** : [https://console.firebase.google.com/](https://console.firebase.google.com/)

### 5. Compte Vercel (optionnel, pour le déploiement)

**Site** : [https://vercel.com/](https://vercel.com/)

### 6. Éditeur de code recommandé

**VS Code** : [https://code.visualstudio.com/](https://code.visualstudio.com/)

Extensions recommandées :
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- Prettier - Code formatter

---

## Installation pas à pas

### Étape 1 : Cloner le projet

```bash
# Cloner le repository
git clone https://github.com/Djefrid/portfolio.git

# Entrer dans le dossier
cd portfolio
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

> **Durée estimée** : 1-2 minutes selon votre connexion

### Étape 3 : Créer le fichier d'environnement

**Linux/Mac** :
```bash
cp .env.local.example .env.local
```

**Windows (PowerShell)** :
```powershell
Copy-Item .env.local.example .env.local
```

**Windows (CMD)** :
```cmd
copy .env.local.example .env.local
```

### Étape 4 : Configurer Firebase (voir section suivante)

### Étape 5 : Lancer le projet

```bash
npm run dev
```

Ouvrir : [http://localhost:3000](http://localhost:3000)

---

## Configuration Firebase

> **Important** : Le portfolio fonctionne sans Firebase avec des données statiques. Firebase est requis uniquement pour l'administration dynamique.

### Étape 1 : Créer un projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquer sur **"Créer un projet"** (ou "Add project")
3. Nommer le projet : `mon-portfolio` (ou autre nom)
4. **Google Analytics** : Désactiver (optionnel, non nécessaire)
5. Cliquer sur **"Créer le projet"**
6. Attendre la création (~30 secondes)
7. Cliquer sur **"Continuer"**

### Étape 2 : Activer l'authentification

1. Dans le menu de gauche : **Build → Authentication**
2. Cliquer sur **"Commencer"** (ou "Get started")
3. Onglet **"Sign-in method"**
4. Cliquer sur **"E-mail/Mot de passe"**
5. Activer **"E-mail/Mot de passe"** (premier toggle)
6. Cliquer sur **"Enregistrer"**

### Étape 3 : Ajouter les domaines autorisés

> **Critique pour Vercel** : Sans cette étape, la connexion admin échouera en production.

1. Rester dans **Authentication**
2. Aller dans l'onglet **"Settings"**
3. Section **"Authorized domains"**
4. Vérifier que ces domaines sont présents :
   - `localhost` (par défaut)
5. Cliquer sur **"Add domain"** et ajouter :
   - `votre-projet.vercel.app` (votre domaine Vercel)

### Étape 4 : Créer un utilisateur admin

1. Dans **Authentication → Users**
2. Cliquer sur **"Add user"**
3. Entrer :
   - **Email** : votre email (ex: `djeffkuate@gmail.com`)
   - **Password** : un mot de passe sécurisé (min 6 caractères)
4. Cliquer sur **"Add user"**

> **Important** : Notez cet email, il sera votre `NEXT_PUBLIC_ADMIN_EMAIL`

### Étape 5 : Créer la base de données Firestore

1. Dans le menu : **Build → Firestore Database**
2. Cliquer sur **"Créer une base de données"**
3. Choisir **"Start in production mode"**
4. Sélectionner une région :
   - Europe : `eur3 (europe-west)`
   - Amérique : `nam5 (us-central)`
5. Cliquer sur **"Activer"**

### Étape 6 : Configurer les règles de sécurité Firestore

1. Dans Firestore, aller à l'onglet **"Règles"** (ou "Rules")
2. **Supprimer** tout le contenu existant
3. **Coller** ces règles :

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Lecture publique pour tout le monde (site public)
    match /{document=**} {
      allow read: if true;
    }

    // Écriture uniquement pour l'admin authentifié
    match /settings/{document} {
      allow write: if request.auth != null
        && request.auth.token.email == 'VOTRE_EMAIL_ADMIN';
    }

    match /projects/{document} {
      allow write: if request.auth != null
        && request.auth.token.email == 'VOTRE_EMAIL_ADMIN';
    }
  }
}
```

4. **Remplacer** `VOTRE_EMAIL_ADMIN` par votre email (ex: `djeffkuate@gmail.com`)
5. Cliquer sur **"Publier"** (ou "Publish")

### Étape 7 : Récupérer les clés Firebase

1. Cliquer sur l'icône **engrenage** (⚙️) en haut à gauche
2. Sélectionner **"Paramètres du projet"**
3. Défiler vers le bas jusqu'à **"Vos applications"**
4. Cliquer sur l'icône **Web** (`</>`)
5. Nommer l'app : `portfolio-web`
6. **NE PAS** cocher "Firebase Hosting"
7. Cliquer sur **"Enregistrer l'application"**
8. Un bloc de code apparaît avec `firebaseConfig`

**Copier ces valeurs** (vous en aurez besoin) :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

---

## Variables d'environnement

Ouvrir le fichier `.env.local` et remplir avec vos valeurs :

```env
# ================================
# Configuration Firebase
# ================================

# Clé API (apiKey dans firebaseConfig)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Domaine d'authentification (authDomain)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com

# ID du projet (projectId)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre-projet

# Bucket de stockage (storageBucket)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com

# ID du sender de messagerie (messagingSenderId)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012

# ID de l'application (appId)
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789

# ================================
# Configuration Admin
# ================================

# Email autorisé pour l'administration (celui créé dans Firebase Auth)
NEXT_PUBLIC_ADMIN_EMAIL=votre@email.com

# ================================
# Configuration SEO
# ================================

# URL du site en production (utilisé pour le sitemap et les métadonnées)
NEXT_PUBLIC_SITE_URL=https://portfolio.djefrid.ca
```

### Tableau récapitulatif

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `FIREBASE_API_KEY` | Clé API Firebase | firebaseConfig → apiKey |
| `FIREBASE_AUTH_DOMAIN` | Domaine d'auth | firebaseConfig → authDomain |
| `FIREBASE_PROJECT_ID` | ID du projet | firebaseConfig → projectId |
| `FIREBASE_STORAGE_BUCKET` | Bucket storage | firebaseConfig → storageBucket |
| `FIREBASE_MESSAGING_SENDER_ID` | ID sender | firebaseConfig → messagingSenderId |
| `FIREBASE_APP_ID` | ID de l'app | firebaseConfig → appId |
| `ADMIN_EMAIL` | Email admin | Email créé dans Firebase Auth |
| `SITE_URL` | URL du site en production | Votre domaine (ex: `https://portfolio.djefrid.ca`) |

---

## Lancer le projet

### Mode développement

```bash
npm run dev
```

- Site : [http://localhost:3000](http://localhost:3000)
- Admin : [http://localhost:3000/admin](http://localhost:3000/admin)

### Mode production (test local)

```bash
# Construire le projet
npm run build

# Lancer le serveur de production
npm run start
```

### Vérifier le code (linting)

```bash
npm run lint
```

---

## Structure du projet

```
portfolio/
│
├── app/                              # Routes Next.js 14 (App Router)
│   ├── layout.tsx                    # Layout racine (Providers globaux)
│   ├── globals.css                   # Styles Tailwind globaux
│   │
│   ├── (main)/                       # Groupe de routes - Site public
│   │   ├── layout.tsx                # Layout avec Header + Footer
│   │   └── page.tsx                  # Page d'accueil (/)
│   │
│   ├── admin/                        # Routes administration (protégées)
│   │   ├── layout.tsx                # Layout admin (Header séparé)
│   │   ├── page.tsx                  # Dashboard admin (/admin)
│   │   └── login/
│   │       └── page.tsx              # Page connexion (/admin/login)
│   │
│   ├── sitemap.ts                    # Génère /sitemap.xml (SEO)
│   ├── robots.ts                     # Génère /robots.txt (SEO)
│   │
│   └── api/                          # API Routes (serverless)
│       ├── translate/
│       │   └── route.ts              # API traduction FR↔EN
│       └── sync-data/
│           └── route.ts              # Sync Firebase → fichier local
│
├── components/                       # Composants React réutilisables
│   │
│   ├── sections/                     # Sections du portfolio
│   │   ├── Hero.tsx                  # Section héro (nom, titre, liens)
│   │   ├── About.tsx                 # Section À propos
│   │   ├── Projects.tsx              # Section Projets
│   │   ├── Skills.tsx                # Section Compétences
│   │   └── Contact.tsx               # Section Contact
│   │
│   ├── admin/                        # Composants administration
│   │   ├── AdminHeader.tsx           # Header admin (séparé du public)
│   │   ├── ProfileEditor.tsx         # Éditeur de profil
│   │   ├── ProjectsEditor.tsx        # Éditeur de projets
│   │   └── SkillsEditor.tsx          # Éditeur de compétences
│   │
│   ├── Header.tsx                    # Navigation site public
│   ├── Footer.tsx                    # Pied de page
│   ├── Providers.tsx                 # Providers React (Auth, Language)
│   └── PortfolioWrapper.tsx          # Wrapper contexte portfolio
│
├── context/                          # Contextes React (state global)
│   ├── LanguageContext.tsx           # Gestion langue FR/EN
│   └── PortfolioContext.tsx          # Données portfolio
│
├── hooks/                            # Hooks React personnalisés
│   ├── index.ts                      # Exports
│   └── usePortfolioData.ts           # Hook chargement données
│
├── lib/                              # Librairies et configurations
│   └── firebase/                     # Configuration Firebase
│       ├── config.ts                 # Initialisation Firebase
│       ├── hooks.ts                  # Hook useAuth
│       ├── context.tsx               # AuthProvider
│       ├── firestore.ts              # Fonctions CRUD Firestore
│       └── index.ts                  # Exports
│
├── data/                             # Données statiques
│   └── portfolio-data.ts             # Données par défaut (fallback si pas Firebase)
│
├── types/                            # Types TypeScript
│   ├── index.ts                      # Types généraux
│   └── firebase.ts                   # Types données Firebase
│
├── public/                           # Fichiers statiques (accessibles via URL)
│   ├── favicon.svg                   # Favicon du site
│   └── *.pdf                         # CV téléchargeable
│
├── .env.local                        # Variables d'environnement (NON COMMITÉ)
├── .env.local.example                # Exemple de configuration
├── .gitignore                        # Fichiers ignorés par Git
├── next.config.mjs                   # Configuration Next.js
├── tailwind.config.ts                # Configuration Tailwind CSS
├── tsconfig.json                     # Configuration TypeScript
├── package.json                      # Dépendances et scripts npm
└── README.md                         # Cette documentation
```

---

## Fonctionnalités

### Site Public

| Fonctionnalité | Description |
|----------------|-------------|
| **Bilingue FR/EN** | Changement de langue instantané via boutons |
| **Design Responsive** | Adapté mobile, tablette, desktop |
| **Hero** | Nom, titre, stack technique, liens sociaux, CV |
| **À propos** | Paragraphes + points clés avec formatage automatique |
| **Projets** | Cards avec stack, fonctionnalités, défis, liens |
| **Compétences** | Technologies groupées par catégorie |
| **Contact** | Liens Email, GitHub, LinkedIn |
| **Formatage auto** | Sauts de ligne après chaque phrase |

### Panneau Admin

| Fonctionnalité | Description |
|----------------|-------------|
| **Auth sécurisée** | Connexion Firebase (email/password) |
| **Éditeur Profil** | Nom, titre, bio, liens sociaux |
| **Éditeur Projets** | CRUD complet (ajouter, modifier, supprimer, réordonner) |
| **Éditeur Compétences** | Gestion par catégories |
| **Traduction auto** | FR → EN automatique via MyMemory API |
| **Temps réel** | Modifications visibles immédiatement |

---

## Panneau Admin

### Accéder à l'admin

1. Aller sur `/admin/login`
2. Entrer l'email et mot de passe créés dans Firebase Auth
3. Cliquer sur **"Se connecter"**
4. Vous êtes redirigé vers le dashboard

### Sections d'édition

| Section | Ce qu'on peut modifier |
|---------|------------------------|
| **Profil** | Nom, titre, paragraphes "À propos", points clés, liens sociaux |
| **Projets** | Titre, description, stack technique, fonctionnalités, défis, liens |
| **Compétences** | Technologies par catégorie (Frontend, Backend, BDD, DevOps, etc.) |

### Processus de sauvegarde

Quand vous cliquez sur **"Enregistrer"** :

1. ✏️ **Édition** : Vous modifiez le texte en français
2. 🔄 **Traduction** : L'API `/api/translate` traduit automatiquement en anglais
3. 📝 **Formatage** : Sauts de ligne ajoutés après chaque phrase
4. 💾 **Sauvegarde** : Données enregistrées dans Firebase Firestore
5. 🌐 **Publication** : Site public mis à jour en temps réel

---

## API de traduction

### Endpoint

```
POST /api/translate
```

### Requête

```json
{
  "type": "text",
  "text": "Votre texte en français à traduire.",
  "from": "fr",
  "to": "en"
}
```

### Réponse

```json
{
  "translatedText": "Your French text to translate.",
  "success": true
}
```

### Caractéristiques

| Paramètre | Valeur |
|-----------|--------|
| **Service** | MyMemory API (gratuit) |
| **Limite par requête** | 450 caractères |
| **Chunking** | Automatique si texte trop long |
| **Délai entre chunks** | 100ms (anti rate-limiting) |
| **Formatage** | Ajout automatique de `\n\n` après chaque phrase |

---

## SEO et Référencement

Le portfolio est configuré pour un bon référencement sur les moteurs de recherche (Google, Bing, etc.).

### Fichiers SEO générés automatiquement

| Fichier | URL | Description |
|---------|-----|-------------|
| `app/sitemap.ts` | `/sitemap.xml` | Plan du site pour les moteurs de recherche |
| `app/robots.ts` | `/robots.txt` | Contrôle l'indexation (autorise `/`, bloque `/admin` et `/api`) |

### Métadonnées SEO (app/layout.tsx)

Le layout racine contient des métadonnées complètes :
- **Title** : "Djefrid Byli - Développeur Web Full-Stack Junior | Portfolio"
- **Description** : Description bilingue du portfolio
- **Keywords** : Mots-clés pertinents (développeur, Montréal, Canada, etc.)
- **Open Graph** : Aperçu pour Facebook, LinkedIn, etc.
- **Twitter Card** : Aperçu pour Twitter/X
- **Canonical URL** : URL canonique pour éviter le contenu dupliqué

### Configuration Google Search Console

1. Aller sur [Google Search Console](https://search.google.com/search-console/)
2. Ajouter la propriété : `https://portfolio.djefrid.ca`
3. Vérifier la propriété (méthode recommandée : enregistrement DNS ou balise HTML)
4. Si vérification par balise HTML, ajouter dans `app/layout.tsx` :
   ```tsx
   verification: {
     google: 'VOTRE_CODE_VERIFICATION',
   },
   ```
5. Soumettre le sitemap : `https://portfolio.djefrid.ca/sitemap.xml`

### Variable d'environnement requise

```env
NEXT_PUBLIC_SITE_URL=https://portfolio.djefrid.ca
```

> Cette variable est utilisée par `sitemap.ts` et les métadonnées pour générer les URLs correctes.

---

## Déploiement sur Vercel

### Étape 1 : Préparer le repository

```bash
# Ajouter tous les fichiers
git add .

# Créer un commit
git commit -m "Ready for deployment"

# Pousser vers GitHub
git push origin main
```

### Étape 2 : Importer sur Vercel

1. Aller sur [https://vercel.com/](https://vercel.com/)
2. Se connecter avec GitHub
3. Cliquer sur **"Add New..." → "Project"**
4. Sélectionner votre repository `portfolio`
5. Vercel détecte automatiquement Next.js

### Étape 3 : Configurer les variables d'environnement

Dans **Settings → Environment Variables**, ajouter chaque variable :

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | AIzaSyXXXXXXX... |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | votre-projet.firebaseapp.com |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | votre-projet |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | votre-projet.appspot.com |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 123456789012 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 1:123456789012:web:xxx |
| `NEXT_PUBLIC_ADMIN_EMAIL` | votre@email.com |
| `NEXT_PUBLIC_SITE_URL` | https://portfolio.djefrid.ca |

### Étape 4 : Autoriser le domaine dans Firebase

> **CRITIQUE** : Sans cette étape, la connexion admin ne fonctionnera PAS sur Vercel.

1. Firebase Console → Authentication → Settings → Authorized domains
2. Cliquer sur **"Add domain"**
3. Ajouter : `votre-projet.vercel.app`

### Étape 5 : Déployer

1. Retourner sur Vercel
2. Cliquer sur **"Deploy"**
3. Attendre la construction (~1-2 minutes)
4. Votre site est live !

### Redéploiements automatiques

Chaque `git push` sur la branche `main` déclenche automatiquement un nouveau déploiement.

---

## Dépannage

### ❌ "Firebase non configuré"

**Cause** : Variables d'environnement manquantes ou incorrectes.

**Solution** :
1. Vérifier que `.env.local` existe
2. Vérifier que toutes les variables sont remplies
3. Redémarrer le serveur :
   ```bash
   # Arrêter (Ctrl+C) puis relancer
   npm run dev
   ```

---

### ❌ "Could not find module in React Client Manifest"

**Cause** : Cache Next.js corrompu.

**Solution** :
```bash
# Supprimer le cache
rm -rf .next

# Relancer
npm run dev
```

**Windows PowerShell** :
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

---

### ❌ Connexion admin échoue sur Vercel

**Cause** : Domaine Vercel non autorisé dans Firebase.

**Solution** :
1. Firebase Console → Authentication → Settings
2. Onglet "Authorized domains"
3. Ajouter : `votre-projet.vercel.app`

---

### ❌ Traductions ne fonctionnent pas

**Cause** : API MyMemory rate-limitée ou texte trop long.

**Solution** :
- Le texte est automatiquement découpé en chunks de 450 caractères
- Un délai de 100ms est appliqué entre chaque requête
- Vérifier la console du navigateur (F12) pour les erreurs
- Réessayer après quelques minutes si rate-limited

---

### ❌ Données ne s'affichent pas

**Cause** : Firebase non connecté ou règles incorrectes.

**Solution** :
1. Vérifier les règles Firestore (lecture publique)
2. Vérifier la console du navigateur pour les erreurs
3. Les données de `data/portfolio-data.ts` s'affichent en fallback

---

### ❌ Port 3000 déjà utilisé

**Cause** : Une autre application utilise le port.

**Solution** :
```bash
# Utiliser un autre port
npm run dev -- -p 3001
```

Ou tuer le processus existant :

**Windows** :
```cmd
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

**Linux/Mac** :
```bash
lsof -i :3000
kill -9 <PID>
```

---

## Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement (hot reload) |
| `npm run build` | Construit l'application pour la production |
| `npm run start` | Lance le serveur de production |
| `npm run lint` | Vérifie le code avec ESLint |

---

## Architecture du projet

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   SITE PUBLIC (/)              │    ADMIN (/admin)              │
│   ─────────────────            │    ──────────────              │
│   • Header avec navigation     │    • Header admin séparé       │
│   • Sections: Hero, About,     │    • Login Firebase Auth       │
│     Projects, Skills, Contact  │    • Éditeurs: Profil,         │
│   • Changement langue FR/EN    │      Projets, Compétences      │
│   • Données Firebase/fallback  │    • Traduction auto FR→EN     │
│                                │                                 │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTES (Serverless)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   /api/translate               │    /api/sync-data              │
│   ────────────────             │    ──────────────              │
│   • Traduction FR ↔ EN         │    • Sync Firebase → Local     │
│   • MyMemory API               │    • Backup dans portfolio-    │
│   • Chunking auto (450 chars)  │      data.ts                   │
│   • Formatage sauts de ligne   │                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                          FIREBASE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   AUTHENTICATION              │    FIRESTORE DATABASE           │
│   ──────────────              │    ──────────────────           │
│   • Email/Password            │    • settings/profile           │
│   • 1 admin autorisé          │    • settings/skills            │
│   • Domaines autorisés        │    • projects/{id}              │
│                               │    • Données bilingues FR/EN    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sécurité

- ✅ Authentification Firebase (email/password)
- ✅ Règles Firestore restrictives (1 admin)
- ✅ Variables d'environnement (non commitées)
- ✅ Domaines autorisés explicites
- ✅ Pas de secrets côté client

---

## Licence

MIT - Libre d'utilisation, modification et distribution.

---

## Contact

**Djefrid Byli** - Développeur Web Full-Stack Junior

- 📧 Email: [djeffkuate@gmail.com](mailto:djeffkuate@gmail.com)
- 💻 GitHub: [github.com/Djefrid](https://github.com/Djefrid)
- 💼 LinkedIn: [linkedin.com/in/djefrid-byli-fotue-kuate-a30633225](https://www.linkedin.com/in/djefrid-byli-fotue-kuate-a30633225/)

---

*Documentation mise à jour le 13 février 2026*
