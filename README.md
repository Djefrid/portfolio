# Portfolio — Développeur Web Full-Stack

Portfolio professionnel moderne et bilingue (FR/EN) construit avec Next.js 14, Firebase et Tailwind CSS. Inclut un panneau d'administration complet pour gérer le contenu dynamiquement, un mode clair/sombre animé, et des animations au défilement.

---

## Table des matières

1. [Aperçu](#aperçu)
2. [Stack Technique](#stack-technique)
3. [Prérequis](#prérequis)
4. [Installation pas à pas](#installation-pas-à-pas)
5. [Configuration Firebase](#configuration-firebase)
6. [Variables d'environnement](#variables-denvironnement)
7. [Lancer le projet](#lancer-le-projet)
8. [Structure du projet](#structure-du-projet)
9. [Fonctionnalités](#fonctionnalités)
10. [Panneau Admin](#panneau-admin)
11. [API Routes](#api-routes)
12. [SEO et Référencement](#seo-et-référencement)
13. [Déploiement sur Vercel](#déploiement-sur-vercel)
14. [Sécurité](#sécurité)
15. [Dépannage](#dépannage)
16. [Commandes disponibles](#commandes-disponibles)

---

## Aperçu

| Site Public | Panneau Admin |
|-------------|---------------|
| Portfolio bilingue FR/EN | Interface d'édition sécurisée |
| Sections : Hero, À propos, Projets, Compétences, Contact | Éditeurs : Profil, Projets, Compétences |
| Mode clair / sombre animé (next-themes) | Traduction automatique FR→EN |
| Animations scroll bidirectionnelles (framer-motion) | Formulaire de contact (Resend) |
| Design responsive mobile/tablette/desktop | Données Firebase ou fallback statique |

---

## Stack Technique

| Catégorie | Technologies |
|-----------|-------------|
| **Framework** | Next.js 14.2.35 (App Router) |
| **Frontend** | React 18, TypeScript 5 |
| **Styling** | Tailwind CSS 3.4, framer-motion 12 |
| **Thème** | next-themes (mode clair / sombre) |
| **Composants UI** | Radix UI (Label, Slot), lucide-react, CVA |
| **Backend / BDD** | Firebase 12 (Authentication + Firestore) |
| **Emails** | Resend (formulaire de contact) |
| **Traduction** | MyMemory API (automatique FR↔EN) |
| **Linting** | ESLint 8 |
| **Déploiement** | Vercel (standalone output) |

---

## Prérequis

### 1. Node.js (v18.17 ou supérieur)

**Téléchargement** : [https://nodejs.org/](https://nodejs.org/)

```bash
node --version   # v18.17.0 ou supérieur
npm --version    # 9.0.0 ou supérieur
```

### 2. Git

**Téléchargement** : [https://git-scm.com/](https://git-scm.com/)

### 3. Compte Firebase (gratuit)

**Console** : [https://console.firebase.google.com/](https://console.firebase.google.com/)

### 4. Compte Resend (gratuit, optionnel — pour les emails)

**Site** : [https://resend.com/](https://resend.com/)

### 5. Compte Vercel (optionnel, pour le déploiement)

**Site** : [https://vercel.com/](https://vercel.com/)

---

## Installation pas à pas

### Étape 1 : Cloner le projet

```bash
git clone https://github.com/Djefrid/portfolio.git
cd portfolio
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

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

### Étape 4 : Configurer les variables d'environnement

Ouvrir `.env.local` et remplir avec vos valeurs (voir section [Variables d'environnement](#variables-denvironnement)).

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
2. Cliquer sur **"Créer un projet"**
3. Nommer le projet : `mon-portfolio`
4. Désactiver Google Analytics (optionnel)
5. Cliquer sur **"Créer le projet"**

### Étape 2 : Activer l'authentification Email/Mot de passe

1. **Build → Authentication → Get started**
2. Onglet **"Sign-in method"**
3. Activer **"E-mail/Mot de passe"**
4. Cliquer sur **"Enregistrer"**

### Étape 3 : Ajouter les domaines autorisés

> **Critique pour Vercel** : Sans cette étape, la connexion admin échouera en production.

1. **Authentication → Settings → Authorized domains**
2. Cliquer sur **"Add domain"** et ajouter votre domaine Vercel :
   - `votre-projet.vercel.app`

### Étape 4 : Créer un utilisateur admin

1. **Authentication → Users → Add user**
2. Entrer votre email et un mot de passe sécurisé (min 6 caractères)

### Étape 5 : Créer la base de données Firestore

1. **Build → Firestore Database → Créer une base de données**
2. Choisir **"Start in production mode"**
3. Sélectionner une région (ex: `nam5 (us-central)` pour le Canada)

### Étape 6 : Configurer les règles de sécurité Firestore

1. **Firestore → Règles**
2. Remplacer par :

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Lecture publique (site public)
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

3. Remplacer `VOTRE_EMAIL_ADMIN` par votre email
4. Cliquer sur **"Publier"**

### Étape 7 : Récupérer les clés Firebase

1. **Paramètres du projet (⚙️) → Vos applications → Web (`</>`)**
2. Nommer l'app `portfolio-web`
3. Copier les valeurs du bloc `firebaseConfig`

---

## Variables d'environnement

Ouvrir `.env.local` et remplir :

```env
# ================================
# Configuration Firebase
# ================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre-projet
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789

# ================================
# Configuration Admin
# ================================
NEXT_PUBLIC_ADMIN_EMAIL=votre@email.com

# ================================
# Configuration SEO
# ================================
NEXT_PUBLIC_SITE_URL=https://portfolio.djefrid.ca

# ================================
# Configuration Resend (emails de contact)
# ================================
# Clé API Resend — côté serveur uniquement (SANS préfixe NEXT_PUBLIC_)
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXX
CONTACT_EMAIL=votre@email.com
```

### Tableau récapitulatif

| Variable | Description | Visibilité |
|----------|-------------|------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Clé API Firebase | Client + Serveur |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Domaine d'authentification | Client + Serveur |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID du projet Firebase | Client + Serveur |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket de stockage | Client + Serveur |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ID sender | Client + Serveur |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ID de l'application | Client + Serveur |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Email autorisé pour l'admin | Client + Serveur |
| `NEXT_PUBLIC_SITE_URL` | URL du site en production | Client + Serveur |
| `RESEND_API_KEY` | Clé API Resend (emails) | **Serveur uniquement** |
| `CONTACT_EMAIL` | Email destinataire des contacts | **Serveur uniquement** |

> **Sécurité** : `RESEND_API_KEY` et `CONTACT_EMAIL` n'ont pas le préfixe `NEXT_PUBLIC_` — ils ne sont jamais exposés au navigateur.

---

## Lancer le projet

### Mode développement

```bash
npm run dev
```

- Site public : [http://localhost:3000](http://localhost:3000)
- Admin : [http://localhost:3000/admin](http://localhost:3000/admin)

### Mode production (test local)

```bash
npm run build
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
│   ├── layout.tsx                    # Layout racine — SEO metadata, Providers
│   ├── globals.css                   # Styles Tailwind + overrides mode clair
│   │
│   ├── (main)/                       # Groupe de routes — Site public
│   │   ├── layout.tsx                # Layout avec Header + Footer
│   │   └── page.tsx                  # Page d'accueil (/) → PortfolioWrapper
│   │
│   ├── admin/                        # Routes administration (protégées)
│   │   ├── layout.tsx                # Guard d'authentification Firebase
│   │   ├── page.tsx                  # Dashboard admin (onglets profil/projets/compétences)
│   │   └── login/
│   │       └── page.tsx              # Connexion admin (/admin/login)
│   │
│   ├── sitemap.ts                    # Génère /sitemap.xml dynamique (SEO)
│   ├── robots.ts                     # Génère /robots.txt (bloque /admin, /api/)
│   │
│   └── api/                          # API Routes serverless
│       ├── contact/
│       │   └── route.ts              # POST — Envoi email via Resend
│       ├── translate/
│       │   └── route.ts              # POST — Traduction FR↔EN via MyMemory
│       └── sync-data/
│           └── route.ts              # POST — Sync Firebase → portfolio-data.ts (dev)
│
├── components/                       # Composants React
│   │
│   ├── sections/                     # Sections du portfolio
│   │   ├── index.ts                  # Barrel exports
│   │   ├── Hero.tsx                  # Section hero (nom, titre, CTA, animations)
│   │   ├── About.tsx                 # Section à propos (accordion, points clés)
│   │   ├── Projects.tsx              # Section projets (carousel, modale détail)
│   │   ├── Skills.tsx                # Section compétences (carousel horizontal)
│   │   └── Contact.tsx               # Section contact (formulaire Resend + liens)
│   │
│   ├── admin/                        # Composants panneau d'administration
│   │   ├── index.ts                  # Barrel exports
│   │   ├── AdminHeader.tsx           # Header admin (navigation + déconnexion)
│   │   ├── ProfileEditor.tsx         # Éditeur profil bilingue
│   │   ├── ProjectsEditor.tsx        # Éditeur projets CRUD bilingue
│   │   └── SkillsEditor.tsx          # Éditeur catégories de compétences
│   │
│   ├── ui/                           # Composants UI réutilisables
│   │   ├── badge.tsx                 # Badge (CVA variants)
│   │   ├── input.tsx                 # Input (forwardRef)
│   │   ├── textarea.tsx              # Textarea (forwardRef)
│   │   ├── label.tsx                 # Label (Radix UI + CVA)
│   │   ├── ThemeToggle.tsx           # Bouton mode clair/sombre animé (framer-motion)
│   │   └── FadeInSection.tsx         # Wrapper animation scroll (useInView)
│   │
│   ├── Header.tsx                    # Navigation fixe (scroll, mobile, langue, thème)
│   ├── Footer.tsx                    # Pied de page (copyright, liens sociaux)
│   ├── Providers.tsx                 # Providers globaux (Theme, Language, Portfolio)
│   └── PortfolioWrapper.tsx          # Assemblage des sections du site public
│
├── context/                          # Contextes React (état global)
│   ├── LanguageContext.tsx           # FR/EN — localStorage, t() traductions
│   └── PortfolioContext.tsx          # Données portfolio — Firebase ou statique
│
├── hooks/                            # Hooks personnalisés
│   ├── index.ts                      # Barrel export
│   └── usePortfolioData.ts           # Chargement données + conversion bilingual
│
├── lib/                              # Bibliothèques et utilitaires
│   ├── utils.ts                      # cn() — clsx + tailwind-merge
│   └── firebase/
│       ├── index.ts                  # Barrel exports
│       ├── config.ts                 # Init Firebase, isFirebaseConfigured
│       ├── hooks.ts                  # useAuth() — signIn, signOut, isAdmin
│       ├── context.tsx               # AuthProvider, useAuthContext()
│       └── firestore.ts              # CRUD Firestore (profil, projets, compétences)
│
├── data/
│   └── portfolio-data.ts             # Données statiques bilingues (fallback Firebase)
│
├── types/
│   ├── index.ts                      # Types UI (Project, Skill, PersonalInfo, etc.)
│   └── firebase.ts                   # Types Firebase (BilingualText, ProfileData, etc.)
│
├── public/                           # Fichiers statiques publics
│   ├── favicon.svg                   # Icône du site
│   └── *.pdf                         # CV téléchargeable
│
├── .env.local                        # Variables d'environnement (NON COMMITÉ)
├── .env.local.example                # Modèle de configuration (commité, sans secrets)
├── .gitignore                        # Fichiers ignorés par Git
├── components.json                   # Config shadcn/ui
├── next.config.js                    # Config Next.js (standalone + headers sécurité)
├── tailwind.config.js                # Config Tailwind (couleurs primary/dark, polices)
├── tsconfig.json                     # Config TypeScript strict + alias @/*
├── package.json                      # Dépendances et scripts npm
└── README.md                         # Cette documentation
```

---

## Fonctionnalités

### Site Public

| Fonctionnalité | Description |
|----------------|-------------|
| **Bilingue FR/EN** | Changement instantané via boutons, persisté en localStorage |
| **Mode clair / sombre** | Toggle animé Moon↔Sun (next-themes, framer-motion) |
| **Animations scroll** | FadeIn bidirectionnel à l'entrée dans le viewport (framer-motion) |
| **Design responsive** | Mobile, tablette, desktop |
| **Hero** | Nom, titre animé, stack, badge "Open to Work", liens sociaux, CV |
| **À propos** | Accordion expand/collapse avec dégradé de fondu |
| **Projets** | Carousel + modale détail (stack, fonctionnalités, défis, liens) |
| **Compétences** | Carousel horizontal par catégorie |
| **Contact** | Formulaire d'envoi d'email via Resend + liens Email/GitHub/LinkedIn |
| **SEO** | Sitemap XML, robots.txt, OpenGraph, Twitter Card, canonical URL |

### Panneau Admin (`/admin`)

| Fonctionnalité | Description |
|----------------|-------------|
| **Auth sécurisée** | Connexion Firebase (email/password) |
| **Guard de route** | Redirection automatique si non connecté |
| **Éditeur Profil** | Nom, titre, bio, points clés, liens sociaux, "Open to Work" |
| **Éditeur Projets** | CRUD complet (ajouter, modifier, supprimer) |
| **Éditeur Compétences** | Gestion par catégories (créer, réordonner, supprimer) |
| **Traduction auto** | FR → EN automatique via MyMemory API |
| **Temps réel** | Modifications visibles immédiatement (Firestore listeners) |

---

## Panneau Admin

### Accéder à l'admin

1. Aller sur `/admin/login`
2. Entrer l'email et mot de passe créés dans Firebase Auth
3. Vous êtes redirigé vers le dashboard

### Sections d'édition

| Section | Ce qu'on peut modifier |
|---------|------------------------|
| **Profil** | Nom, titre, paragraphes "À propos", points clés, stack, liens sociaux |
| **Projets** | Titre, description, description longue, stack, fonctionnalités, défis, liens GitHub/démo |
| **Compétences** | Catégories et technologies par catégorie |

### Processus de sauvegarde

Quand vous cliquez sur **"Enregistrer"** :

1. ✏️ Vous modifiez le contenu en français
2. 🔄 L'API `/api/translate` traduit automatiquement en anglais (MyMemory)
3. 💾 Les données bilingues sont enregistrées dans Firebase Firestore
4. 🌐 Le site public est mis à jour en temps réel

---

## API Routes

### `POST /api/contact`

Envoi d'un email via Resend.

```json
// Requête
{ "name": "Jean", "email": "jean@example.com", "message": "Bonjour !" }

// Réponse succès
{ "success": true }
```

Variables requises : `RESEND_API_KEY`, `CONTACT_EMAIL`

---

### `POST /api/translate`

Traduction automatique FR↔EN via MyMemory API.

```json
// Requête
{
  "type": "profile",
  "data": { "title": "Développeur Full-Stack" },
  "sourceLang": "fr"
}

// Réponse
{ "success": true, "data": { "title": "Full-Stack Developer" } }
```

Caractéristiques :
- Découpage automatique en chunks de 450 caractères
- Délai de 100ms entre requêtes (anti rate-limiting)
- Nettoyage des entités HTML dans les réponses

---

### `POST /api/sync-data`

Synchronise les données Firebase vers `data/portfolio-data.ts` (dev uniquement — ignoré en production Vercel).

---

## SEO et Référencement

| Fichier | URL | Description |
|---------|-----|-------------|
| `app/sitemap.ts` | `/sitemap.xml` | Plan du site pour les moteurs de recherche |
| `app/robots.ts` | `/robots.txt` | Autorise `/`, bloque `/admin` et `/api/` |

### Métadonnées (app/layout.tsx)

- **Title** : "Djefrid Byli - Développeur Web Full-Stack Junior | Portfolio"
- **OpenGraph** : Aperçu pour LinkedIn, Facebook
- **Twitter Card** : Aperçu pour Twitter/X
- **Canonical URL** : évite le contenu dupliqué

### Variables SEO requises

```env
NEXT_PUBLIC_SITE_URL=https://portfolio.djefrid.ca
```

---

## Déploiement sur Vercel

### Étape 1 : Importer sur Vercel

1. Aller sur [https://vercel.com/](https://vercel.com/) → connecter avec GitHub
2. **"Add New... → Project"** → sélectionner le repository `portfolio`
3. Vercel détecte automatiquement Next.js

### Étape 2 : Configurer les variables d'environnement

Dans **Settings → Environment Variables** :

| Name | Description |
|------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Clé API Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Domaine d'auth Firebase |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID projet Firebase |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket storage Firebase |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID Firebase |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID Firebase |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Email admin |
| `NEXT_PUBLIC_SITE_URL` | URL du site (ex: `https://portfolio.djefrid.ca`) |
| `RESEND_API_KEY` | Clé API Resend |
| `CONTACT_EMAIL` | Email destinataire des contacts |

### Étape 3 : Autoriser le domaine dans Firebase

1. Firebase Console → Authentication → Settings → Authorized domains
2. Ajouter : `votre-projet.vercel.app`

### Étape 4 : Déployer

Cliquer sur **"Deploy"**. Chaque `git push` sur `main` déclenche un redéploiement automatique.

---

## Sécurité

- ✅ **Next.js 14.2.35** — CVE-2025-29927 corrigée (bypass d'autorisation middleware critique)
- ✅ **Headers HTTP** : HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- ✅ **Authentification Firebase** (email/password)
- ✅ **Règles Firestore** restrictives — écriture réservée à l'admin authentifié
- ✅ **Variables d'environnement** non commitées (`.gitignore`)
- ✅ **`RESEND_API_KEY`** côté serveur uniquement (jamais exposé au navigateur)
- ✅ **Domaines Firebase** autorisés explicitement
- ✅ **`.gitignore` renforcé** : certificats SSL (`*.pem`, `*.key`), clés Firebase Admin SDK, `.vercel/`
- ✅ **Dégradation gracieuse** : fonctionne sans Firebase (données statiques en fallback)

---

## Dépannage

### ❌ "Firebase non configuré"

Variables d'environnement manquantes ou incorrectes.

```bash
# Vérifier que .env.local existe et contient toutes les variables
# Redémarrer le serveur
npm run dev
```

---

### ❌ Cache Next.js corrompu

```bash
# Linux/Mac
rm -rf .next && npm run dev

# Windows PowerShell
Remove-Item -Recurse -Force .next; npm run dev
```

---

### ❌ Connexion admin échoue sur Vercel

Domaine Vercel non autorisé dans Firebase Auth.

1. Firebase Console → Authentication → Settings → Authorized domains
2. Ajouter : `votre-projet.vercel.app`

---

### ❌ Emails de contact non reçus

1. Vérifier `RESEND_API_KEY` dans les variables d'environnement Vercel
2. Vérifier que `CONTACT_EMAIL` est correct
3. Vérifier le dashboard Resend pour les logs d'envoi

---

### ❌ Traductions ne fonctionnent pas

L'API MyMemory peut être rate-limitée.

- Le texte est découpé automatiquement en chunks de 450 caractères
- Réessayer après quelques minutes

---

### ❌ Port 3000 déjà utilisé

```bash
npm run dev -- -p 3001
```

---

## Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement avec hot reload |
| `npm run build` | Build production optimisé |
| `npm run start` | Serveur de production |
| `npm run lint` | Vérification ESLint |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js 14.2.35)                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   SITE PUBLIC (/)              │    ADMIN (/admin)           │
│   ─────────────────            │    ──────────────           │
│   • Header (navigation,        │    • Guard Firebase Auth    │
│     langue, thème)             │    • Éditeurs bilingues     │
│   • Hero, About, Projects,     │      Profil / Projets /     │
│     Skills, Contact            │      Compétences            │
│   • Mode clair/sombre          │    • Traduction auto FR→EN  │
│   • Animations framer-motion   │    • CRUD Firestore         │
│   • Bilingue FR/EN             │                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    API ROUTES (Serverless)                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   /api/contact          /api/translate     /api/sync-data   │
│   ─────────────         ──────────────     ──────────────   │
│   • Resend API          • MyMemory API     • Dev only       │
│   • Email HTML          • Chunking auto    • Firebase →     │
│   • Validation          • Rate limiting      portfolio-     │
│     nom/email/msg         100ms delay        data.ts        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                          FIREBASE                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   AUTHENTICATION              │    FIRESTORE DATABASE        │
│   ──────────────              │    ──────────────────        │
│   • Email/Password            │    • settings/profile        │
│   • 1 admin autorisé          │    • settings/skills         │
│   • Domaines autorisés        │    • projects/{id}           │
│                               │    • Données FR/EN           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                              │
                       Fallback si absent
                              ↓
┌──────────────────────────────────────────────────────────────┐
│              DONNÉES STATIQUES (data/portfolio-data.ts)      │
│  Profil bilingue, 3 projets, 8 catégories de compétences     │
└──────────────────────────────────────────────────────────────┘
```

---

## Licence

MIT — Libre d'utilisation, modification et distribution.

---

## Contact

**Djefrid Byli Fotue Kuate** — Développeur Web Full-Stack Junior

- Email : [djeffkuate@gmail.com](mailto:djeffkuate@gmail.com)
- GitHub : [github.com/Djefrid](https://github.com/Djefrid)
- LinkedIn : [linkedin.com/in/djefrid-byli-fotue-kuate-a30633225](https://www.linkedin.com/in/djefrid-byli-fotue-kuate-a30633225/)

---

*Documentation mise à jour le 26 février 2026*
