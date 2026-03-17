# Portfolio — Développeur Web Full-Stack

Portfolio professionnel moderne et bilingue (FR/EN) construit avec Next.js 14, Firebase et Tailwind CSS. Inclut un panneau d'administration complet pour gérer le contenu dynamiquement, un système de notes privées (style Apple Notes), un mode clair/sombre animé, et des animations au défilement.

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
11. [Système de Notes](#système-de-notes)
12. [API Routes](#api-routes)
13. [SEO et Référencement](#seo-et-référencement)
14. [Déploiement sur Vercel](#déploiement-sur-vercel)
15. [Sécurité](#sécurité)
16. [Dépannage](#dépannage)
17. [Commandes disponibles](#commandes-disponibles)

---

## Aperçu

| Site Public | Panneau Admin |
|-------------|---------------|
| Portfolio bilingue FR/EN | Interface d'édition sécurisée |
| Sections : Hero, À propos, Projets, Compétences, Contact | Éditeurs : Profil, Projets, Compétences, Notes |
| Mode clair / sombre animé (next-themes) | Traduction automatique FR→EN |
| Animations scroll bidirectionnelles (framer-motion) | Formulaire de contact (Resend) |
| Design responsive mobile/tablette/desktop | Données Firebase ou fallback statique |
| — | Notes privées style Apple Notes (dossiers, tags, smart folders) |

---

## Stack Technique

| Catégorie | Technologies |
|-----------|-------------|
| **Framework** | Next.js 14.2.35 (App Router) |
| **Frontend** | React 18, TypeScript 5 |
| **Styling** | Tailwind CSS 3.4, framer-motion 12 |
| **Thème** | next-themes (mode clair / sombre) |
| **Composants UI** | Radix UI (Label, Slot), lucide-react, CVA |
| **Backend / BDD** | Firebase 12 (Authentication + Firestore + Storage) |
| **Emails** | Resend (formulaire de contact) |
| **Traduction** | MyMemory API (automatique FR↔EN) |
| **Éditeur riche** | TipTap 3 (26 extensions — police, taille, retrait, espacement, LaTeX, symboles, rechercher/remplacer…) |
| **Dessin** | Excalidraw (modal plein écran, export PNG → Firebase Storage) |
| **Documents** | mammoth (DOCX→HTML), @turbodocx/html-to-docx (HTML→DOCX) |
| **PDF** | pdfjs-dist (extraction texte → insertion dans l'éditeur) |
| **Orthographe** | Correcteur natif du navigateur (`spellcheck="true"` sur le contenteditable) |
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

### Étape 3 : Activer l'authentification Google (optionnel)

Permet de se connecter à l'admin avec un compte Google.

1. **Authentication → Sign-in method**
2. Activer **"Google"**
3. Saisir un email de support projet
4. Cliquer sur **"Enregistrer"**

### Étape 4 : Ajouter les domaines autorisés

> **Critique pour Vercel** : Sans cette étape, la connexion admin échouera en production.

1. **Authentication → Settings → Authorized domains**
2. Cliquer sur **"Add domain"** et ajouter votre domaine Vercel :
   - `votre-projet.vercel.app`

### Étape 5 : Créer un utilisateur admin

1. **Authentication → Users → Add user**
2. Entrer votre email et un mot de passe sécurisé (min 6 caractères)

### Étape 6 : Créer la base de données Firestore

1. **Build → Firestore Database → Créer une base de données**
2. Choisir **"Start in production mode"**
3. Sélectionner une région (ex: `nam5 (us-central)` pour le Canada)

### Étape 7 : Configurer les règles de sécurité Firebase

> Les règles se gèrent directement dans la Firebase Console — aucun fichier local nécessaire.

#### Principe des règles — Défense en profondeur

Les règles Firebase sont la **dernière ligne de défense** côté serveur. Même si un attaquant contourne le code Next.js ou l'App Check, les règles Firestore/Storage bloquent toute opération non autorisée directement dans la base de données, côté Google.

**Ce que vérifient les règles :**
1. `request.auth != null` — l'utilisateur est bien connecté (token Firebase valide)
2. `request.auth.token.email_verified == true` — l'email est vérifié (pas un compte temporaire)
3. `request.auth.token.email in [...]` — l'email est dans la liste des admins autorisés

> **Pourquoi la liste d'emails dans les règles plutôt que dans le code ?**
> Le code Next.js s'exécute dans le navigateur — il peut être contourné par n'importe qui via les DevTools ou une requête directe à l'API Firebase. Les règles Firebase s'exécutent côté Google, hors de portée du client. C'est la seule protection infalsifiable.

#### Firestore — règles de sécurité

Dans **Firebase Console → Firestore → Règles**, remplacer tout le contenu par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Admins autorisés — ajouter/retirer des emails ici pour gérer les accès
    // Note : email_verified retiré des règles (inutile avec email/mdp Firebase)
    function isAdmin() {
      return request.auth != null
          && request.auth.token.email in [
               'VOTRE_EMAIL_ADMIN_1',
               'VOTRE_EMAIL_ADMIN_2'
             ];
    }

    // Données publiques du portfolio — lecture libre, écriture admin
    match /settings/{document}  { allow read: if true; allow write: if isAdmin(); }
    match /projects/{document}  { allow read: if true; allow write: if isAdmin(); }

    // Notes privées — accès complet admin uniquement, jamais public
    match /adminNotes/{document}   { allow read, write: if isAdmin(); }
    match /adminFolders/{document} { allow read, write: if isAdmin(); }
    match /adminTags/{document}    { allow read, write: if isAdmin(); }

    // Tout le reste refusé par défaut
    match /{document=**} { allow read, write: if false; }
  }
}
```

#### Storage — règles de sécurité

Dans **Firebase Console → Storage → Règles**, remplacer tout le contenu par :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Même liste d'admins que Firestore
    function isAdmin() {
      return request.auth != null
          && request.auth.token.email_verified == true
          && request.auth.token.email in [
               'VOTRE_EMAIL_ADMIN_1',
               'VOTRE_EMAIL_ADMIN_2'
             ];
    }

    // Images des notes — lecture publique (URLs directes), upload admin max 10 MB
    match /notes/images/{fileName} {
      allow read: if true;
      allow create: if isAdmin()
          && request.resource.size <= 10 * 1024 * 1024
          && request.resource.contentType.matches('image/.*');
      allow delete: if isAdmin();
    }

    // Fichiers des notes — admin uniquement, max 25 MB
    match /notes/files/{fileName} {
      allow read: if isAdmin();
      allow create: if isAdmin()
          && request.resource.size <= 25 * 1024 * 1024;
      allow delete: if isAdmin();
    }

    // Tout le reste refusé
    match /{allPaths=**} { allow read, write: if false; }
  }
}
```

Cliquer sur **"Publier"** dans chaque onglet.

### Étape 8 : Récupérer les clés Firebase

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

# ================================
# Firebase App Check — reCAPTCHA v3
# ================================
# Clé PUBLIQUE du site reCAPTCHA v3 (obtenir sur google.com/recaptcha/admin)
# Nécessaire pour que App Check génère des tokens d'attestation
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Les...votre_cle_ici
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
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Clé publique reCAPTCHA v3 (App Check) | Client + Serveur |
| `RESEND_API_KEY` | Clé API Resend (emails) | **Serveur uniquement** |
| `CONTACT_EMAIL` | Email destinataire des contacts | **Serveur uniquement** |

> **Sécurité** : `RESEND_API_KEY` et `CONTACT_EMAIL` n'ont pas le préfixe `NEXT_PUBLIC_` — ils ne sont jamais exposés au navigateur. Les clés Firebase `NEXT_PUBLIC_*` sont publiques par design — elles identifient le projet, pas l'authentifient. La sécurité réelle est dans les règles Firestore/Storage.

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
│   │   ├── page.tsx                  # Dashboard admin (4 onglets: profil/projets/compétences/notes)
│   │   └── login/
│   │       └── page.tsx              # Connexion admin — email/mdp + Google OAuth
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
│   │   ├── SkillsEditor.tsx          # Éditeur catégories de compétences
│   │   └── NotesEditor.tsx           # Notes privées style Apple Notes (3 panneaux)
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
│   ├── usePortfolioData.ts           # Chargement données + conversion bilingual
│   └── useAdminNotes.ts              # 3 subscriptions Firestore realtime (notes, dossiers, tags)
│
├── lib/                              # Bibliothèques et utilitaires
│   ├── utils.ts                      # cn() — clsx + tailwind-merge
│   ├── notes-service.ts              # CRUD Firestore : Note, Folder, SmartFolder, Tags
│   ├── upload-image.ts               # uploadNoteImage + uploadNoteFile (Firebase Storage)
│   ├── docx-utils.ts                 # importDocx (mammoth) + exportDocx (@turbodocx)
│   ├── pdf-utils.ts                  # extractTextFromPdf (extraction texte pdfjs-dist)
│   ├── tiptap-extensions/
│   │   ├── spell-check.ts            # SpellCheckExtension (LanguageTool + Decorations)
│   │   ├── ghost-text.ts             # GhostTextExtension (ghost text, Tab=accepter)
│   │   ├── indent.ts                 # Indent/Outdent (margin-left 40px, Tab/Shift-Tab hors listes)
│   │   └── font-size.ts              # FontSize custom (remplacé par @tiptap/extension-text-style)
│   └── firebase/
│       ├── index.ts                  # Barrel exports
│       ├── config.ts                 # Init Firebase, isFirebaseConfigured
│       ├── app-check.ts              # Firebase App Check reCAPTCHA v3 (initAppCheck)
│       ├── hooks.ts                  # useAuth() — signIn, signOut, signInWithGoogle, isAdmin
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
│   ├── icon-192.png                  # Icône PWA 192×192 (Chrome install prompt)
│   ├── icon-512.png                  # Icône PWA 512×512 (splash screen Android)
│   ├── sw.js                         # Service Worker PWA (Network First strategy)
│   └── *.pdf                         # CV téléchargeable
│
├── app/
│   └── manifest.ts                   # Manifest PWA → /manifest.webmanifest (Next.js 14)
├── middleware.ts                      # Sécurité : CSP nonce par requête + CSRF check /api/*
├── .env.local                        # Variables d'environnement (NON COMMITÉ)
├── .env.local.example                # Modèle de configuration (commité, sans secrets)
├── .gitignore                        # Fichiers ignorés par Git
├── components.json                   # Config shadcn/ui
├── next.config.js                    # Config Next.js (standalone + headers sécurité + CSP)
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
| **Respect prefers-reduced-motion** | WCAG 2.1 §2.3.3 — `useReducedMotion()` framer-motion : durée 0.15s, déplacement Y=0 si l'OS désactive les animations |
| **Design responsive** | Mobile, tablette, desktop |
| **Hero** | Nom, titre animé, stack, badge "Open to Work", liens sociaux, CV |
| **À propos** | Accordion expand/collapse avec dégradé de fondu |
| **Projets** | Carousel + modale détail (stack, fonctionnalités, défis, liens) |
| **Compétences** | Carousel horizontal par catégorie |
| **Contact** | Formulaire d'envoi d'email via Resend + liens Email/GitHub/LinkedIn |
| **SEO** | Sitemap XML, robots.txt, OpenGraph, Twitter Card, canonical URL, OG image |
| **PWA (Progressive Web App)** | Installable sur desktop et mobile — manifest.webmanifest + icônes PNG 192/512 + Service Worker (Network First) |
| **Accessibilité** | `aria-label` + `aria-hidden` SVGs décoratifs, `aria-live` formulaire contact, focus trap modal projets, skip link WCAG 2.4.1, navigation clavier carousel (←/→), `role="list/listitem"`, Ctrl+S/Ctrl+N dans les notes |

### Panneau Admin (`/admin`)

| Fonctionnalité | Description |
|----------------|-------------|
| **Auth Email/Mot de passe** | Connexion Firebase classique |
| **Auth Google OAuth** | Connexion en 1 clic via compte Google (signInWithPopup) |
| **Guard de route** | Redirection automatique si non connecté |
| **Éditeur Profil** | Nom, titre, bio, points clés, liens sociaux, "Open to Work" |
| **Éditeur Projets** | CRUD complet (ajouter, modifier, supprimer) |
| **Éditeur Compétences** | Gestion par catégories (créer, réordonner, supprimer) |
| **Éditeur Notes** | Notes privées style Apple Notes (voir section dédiée) |
| **Traduction auto** | FR → EN automatique via MyMemory API |
| **Temps réel** | Modifications visibles immédiatement (Firestore listeners) |

---

## Panneau Admin

### Accéder à l'admin

1. Aller sur `/admin/login`
2. Entrer l'email et mot de passe créés dans Firebase Auth
   **OU** cliquer sur "Continuer avec Google" (si Google Auth est activé dans Firebase)
3. Vous êtes redirigé vers le dashboard

### Sections d'édition

| Section | Ce qu'on peut modifier |
|---------|------------------------|
| **Profil** | Nom, titre, paragraphes "À propos", points clés, stack, liens sociaux |
| **Projets** | Titre, description, description longue, stack, fonctionnalités, défis, liens GitHub/démo |
| **Compétences** | Catégories et technologies par catégorie |
| **Notes** | Notes privées avec dossiers, tags, dossiers intelligents, autocomplete |

### Processus de sauvegarde (Profil / Projets / Compétences)

Quand vous cliquez sur **"Enregistrer"** :

1. ✏️ Vous modifiez le contenu en français
2. 🔄 L'API `/api/translate` traduit automatiquement en anglais (MyMemory)
3. 💾 Les données bilingues sont enregistrées dans Firebase Firestore
4. 🌐 Le site public est mis à jour en temps réel

---

## Système de Notes

L'onglet **Notes** est un système de prise de notes privées réservé à l'admin, inspiré d'Apple Notes et aussi puissant que Word. Il fonctionne en temps réel via Firestore.

### Interface 3 panneaux

```
┌─────────────────┬──────────────────┬───────────────────────────────────┐
│    SIDEBAR      │   LISTE NOTES    │           ÉDITEUR RICHE           │
│                 │                  │                                   │
│ • Toutes mes    │ 🔍 Recherche      │ ┌─[Accueil][Insertion][Para.][⤢]┐ │
│   notes         │   temps réel     │ │ Ribbon toolbar style Word     │ │
│ 🔍 Dossiers,    │   (Ctrl+F)       │ └───────────────────────────────┘ │
│   tags…         │ • Épinglées /    │ • Titre (avec autocomplete)       │
│ • Dossiers      │   Non épinglées  │ • Contenu TipTap riche            │
│ • Smart Folders │ • Jours restants │ • Autosave 1s après frappe        │
│ • Tags          │   (corbeille)    │ • Tags en bas de l'éditeur        │
│ • Corbeille     │                  │ • Mode focus plein écran centré   │
└─────────────────┴──────────────────┴───────────────────────────────────┘
```

> Les deux barres de recherche sont **indépendantes** :
> - 🔍 **Sidebar** (« Dossiers, tags… ») → liste plate des dossiers + tags correspondants (tous niveaux), disparaît à la sélection. Escape vide la recherche.
> - 🔍 **Liste notes** (Ctrl+F) → filtre uniquement les notes par titre + contenu.

### Collections Firestore

| Collection | Champs |
|------------|--------|
| `adminNotes` | `title`, `content`, `pinned`, `folderId`, `tags[]`, `deletedAt`, `createdAt`, `updatedAt` |
| `adminFolders` | `name`, `order`, `isSmart`, `filters?`, `createdAt`, `updatedAt` |
| `adminTags` | `name`, `createdAt` (ID = nom du tag, upsert-safe) |

### Fonctionnalités clés

| Fonctionnalité | Détail |
|----------------|--------|
| **Autosave** | Sauvegarde automatique 1 seconde après la dernière frappe |
| **Corbeille** | Soft delete → `deletedAt`, auto-purge après 30 jours |
| **Récupération** | Restauration depuis la corbeille vers "Toutes mes notes" |
| **Notes épinglées** | Séparateur visuel épinglées / non épinglées dans la liste |
| **Tri** | Par date de modification, date de création, ou titre |
| **Lecture seule** | Notes dans la corbeille non modifiables + badge orange |
| **Jours restants** | Affichés en orange dans la corbeille |
| **Sync temps réel** | 3 `onSnapshot` Firestore — notes, dossiers, tags — multi-appareils (guard focus éditeur) |
| **Recherche notes** | Filtre titre + contenu instantanément · `Ctrl+F` / `Escape` · compteur de résultats |
| **Recherche dossiers/tags** | Barre dédiée dans la sidebar → liste plate de tous les dossiers (tous niveaux) + tags correspondants · `Escape` pour vider · clic navigue et vide la recherche |
| **Animation suppression** | Ghost card vole vers la corbeille (framer-motion) · icône tremble à la réception · `AnimatePresence` sur la liste |
| **Corbeille permanente** | Toujours visible dans la sidebar, même vide — compteur masqué si 0 |
| **Persistance session** | Vue + note sélectionnée restaurées au rechargement (localStorage) |

### Éditeur riche TipTap (style Word)

La barre d'outils est un **Ribbon style Microsoft Word** — 4 onglets thématiques + bouton Focus toujours visible :
- **Accueil** : Historique · Famille de police · Taille · Style · Gras/Italic/Souligné/Barré/Exposant/Indice · Effacer · Casse · Surbrillance · Couleur texte
- **Insertion** : Tableau (grid picker) · Lien · Image · Fichier · Dessin (Excalidraw) · Équation LaTeX · Symboles spéciaux
- **Paragraphe** : Alignement · Retrait (Tab/Maj-Tab) · Interligne · Listes · Citation · Bloc de code · Séparateur
- **Outils** : Rechercher/Remplacer · Import/Export DOCX · Import PDF · Export Markdown · Imprimer/PDF

| Fonctionnalité | Détail |
|----------------|--------|
| **Formatage texte** | Gras, italique, souligné, barré, exposant, indice |
| **Famille de police** | 11 polices (Arial, Georgia, Courier New, Comic Sans, etc.) via `FontFamily` |
| **Taille de police** | 16 tailles (8pt → 72pt) via `FontSize` |
| **Effacer la mise en forme** | Supprime marques + retrait + interligne (un seul clic) |
| **Couleurs** | Grille 60 couleurs Word-style + surbrillance multicolore |
| **Changer la casse** | MAJUSCULES · minuscules · Chaque Mot · Première lettre |
| **Retrait** | Indent/Outdent par pas de 40 px (max 280 px) · Tab/Maj-Tab hors listes |
| **Interligne** | Normal · 1.0 · 1.15 · 1.5 · 2.0 · 2.5 · 3.0 (via `LineHeight`) |
| **Titres** | H1 · H2 · H3 via select ou slash command `/h1` |
| **Listes** | À puces, numérotées, cases à cocher (taskList nestée) |
| **Tableaux** | Grid picker 8×8, outils contextuels (ajout ligne/col, fusion, scission) |
| **Code** | Bloc de code avec coloration syntaxique (lowlight — 16 langages sélectifs : JS/TS/Python/CSS/HTML/Bash/JSON/SQL/Go/Rust/Java/PHP/C#/C++/Markdown/Plaintext), modal d'édition |
| **LaTeX / Équations** | `@tiptap/extension-mathematics` + KaTeX — rendu inline temps réel |
| **Symboles spéciaux** | Popup 66 caractères Unicode (©, ®, ™, flèches, maths, devises…) |
| **Rechercher / Remplacer** | Panneau intégré dans la toolbar — remplacement unique ou global (regex) |
| **Liens** | Insertion via toolbar et BubbleMenu au survol de sélection |
| **Images** | Upload Firebase Storage + coller depuis presse-papiers + drag & drop |
| **Fichiers joints** | Upload multi-types (PDF, DOCX, etc.) → lien cliquable dans la note |
| **Drag & drop multi-fichiers** | Glisser N fichiers depuis l'explorateur Windows → tous insérés en séquentiel |
| **BubbleMenu formatage** | Apparaît sur sélection de texte (gras, italique, lien) |
| **BubbleMenu tableau** | Apparaît dans les cellules (lignes, colonnes, fusion, en-tête) |
| **Barre contextuelle code** | S'affiche quand le curseur est dans un bloc de code (langage, copier, modifier) |
| **Slash commands** | `/` en début de paragraphe → menu 10 commandes filtrable |
| **Mode focus** | Plein écran (`Maximize2`/`Minimize2`) — zone d'édition centrée style Word (max-w-1080px, margin auto, scroll externe, sans dégradés latéraux) |
| **Compteur** | Mots + caractères en bas de l'éditeur |
| **SSR Next.js** | `immediatelyRender: false` — pas d'erreur d'hydratation (TipTap 3 best practice) |

### Dessin (Excalidraw)

- Bouton **Dessin** dans la toolbar → modal plein écran Excalidraw (thème sombre)
- Export PNG → Firebase Storage → inséré comme image dans la note
- Drag & drop d'un fichier `.excalidraw` → ouvre le dessin dans le modal

### Documents Word (DOCX)

| Action | Détail |
|--------|--------|
| **Import .docx** | Mammoth.js → HTML TipTap (styles Heading, Code préservés) |
| **Export .docx** | @turbodocx/html-to-docx → téléchargement `.docx` |

### PDF

| Action | Détail |
|--------|--------|
| **Import PDF (texte)** | `pdfjs-dist` → extraction du texte → inséré dans l'éditeur comme paragraphes |

### Correcteur orthographique

- Correcteur **natif du navigateur** (`spellcheck="true"` sur le contenteditable TipTap)
- Clic droit sur un mot souligné → suggestions natives du navigateur
- Aucune dépendance externe, aucun appel API

### Dossiers intelligents (Smart Folders)

Les **Smart Folders** (icône ⚡) filtrent dynamiquement les notes selon des critères :

- **Tags** : filtre par tag(s) avec logique AND ou OR
- **Épinglées** : affiche uniquement les notes épinglées
- **Créées dans** : notes créées dans les N derniers jours
- **Modifiées dans** : notes modifiées dans les N derniers jours

> Les notes ne bougent pas — le filtre est appliqué côté client en temps réel.

### Tags

- **Auto-extraction** : les `#hashtags` dans le contenu sont extraits automatiquement à chaque save
- **Création manuelle** : bouton `+` dans la sidebar
- **Suppression** : bouton `×` (hover) — uniquement les tags manuels
- **Vue filtrée** : clic sur un tag dans la sidebar → filtre la liste
- **Fréquence** : tags triés par nombre d'utilisations

### Autocomplete tags

L'éditeur propose une autocomplétion de tags en temps réel :

**Dans le contenu (TipTap) :**
| Déclencheur | Comportement |
|-------------|--------------|
| `#` seul | Affiche tous les tags disponibles |
| `#abc` | Fuzzy matching (`includes`) sur les tags existants |

**Dans le titre :**
- `#` seul ou `#partial` → fuzzy matching sur les tags (s'insère au curseur)
- Application intelligente au curseur : le tag partiel est remplacé, pas tout le titre

**Navigation popup :** ↑↓ · Tab (1er item) · Enter (item sélectionné) · Escape

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
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Clé publique reCAPTCHA v3 (App Check) |
| `RESEND_API_KEY` | Clé API Resend |
| `CONTACT_EMAIL` | Email destinataire des contacts |

### Étape 3 : Autoriser le domaine dans Firebase

1. Firebase Console → Authentication → Settings → Authorized domains
2. Ajouter : `votre-projet.vercel.app`

### Étape 4 : Déployer

Cliquer sur **"Deploy"**. Chaque `git push` sur `main` déclenche un redéploiement automatique.

---

## Sécurité

### Architecture de sécurité — Défense en profondeur

Le projet applique le principe de **défense en profondeur** : 5 couches indépendantes. Si l'une est contournée, les autres tiennent.

```
COUCHE 1 — Réseau / HTTP
  CSP nonce       → bloque tout script non autorisé (XSS)
  HSTS            → force HTTPS, empêche le downgrade
  X-Frame-Options → interdit les iframes (clickjacking)

COUCHE 2 — Middleware Next.js
  CSRF check      → Origin == Host sur tous les POST /api/*
  CSP dynamique   → nonce UUID aléatoire par requête

COUCHE 3 — Firebase App Check
  reCAPTCHA v3    → vérifie que les requêtes viennent d'un vrai navigateur
  Token Firebase  → joint à chaque appel Firestore/Auth/Storage

COUCHE 4 — Authentification Firebase
  Email/mot passe → signInWithEmailAndPassword (Firebase Auth)
  Google OAuth    → signInWithPopup (desktop) / signInWithRedirect (mobile)
  Email Enum Prot → erreurs génériques (auth/invalid-credential)
  Password Policy → min 8 chars + majuscule + chiffre
  Quota API       → max 1 000 req/min (anti brute-force)

COUCHE 5 — Règles Firestore/Storage (côté Google, infalsifiable)
  Liste email     → seuls ADMIN_EMAIL_1 et ADMIN_EMAIL_2 peuvent écrire
  Collections     → settings/projects publiques en lecture, notes privées
  Storage         → types MIME validés, taille max 10/25 MB
```

### Mesures en place (code)

| Mesure | Fichier | Détail |
|--------|---------|--------|
| ✅ **CSP nonce-based** | `middleware.ts` | Nonce UUID aléatoire par requête — élimine `unsafe-inline` pour scripts |
| ✅ **CSRF protection** | `middleware.ts` | Vérifie `Origin == Host` sur tous les `POST /api/*` — retourne 403 si mismatch |
| ✅ **worker-src 'self' blob:** | `middleware.ts` | Autorise le Service Worker (self) + les web workers Excalidraw (blob:) — interdit tout worker depuis un CDN externe |
| ✅ **frame-src firebaseapp.com** | `middleware.ts` | `*.firebaseapp.com` ajouté — requis par Firebase Auth popup handler |
| ✅ **apis.google.com script-src** | `middleware.ts` | Firebase `signInWithPopup` charge `apis.google.com/js/api.js` — bloqué sans cette entrée |
| ✅ **Hash script inline** | `middleware.ts` | Hash `sha256-C60N...` — autorise le script inline Vercel/Firebase sans `unsafe-inline` |
| ✅ **Headers HTTP** | `next.config.js` | HSTS 2 ans + preload, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| ✅ **COOP same-origin-allow-popups** | `next.config.js` | Autorise la communication popup ↔ opener — requis par `signInWithPopup` (Chrome 129+) |
| ✅ **frame-ancestors none** | `middleware.ts` | Interdit toute intégration en iframe — renforce X-Frame-Options |
| ✅ **upgrade-insecure-requests** | `middleware.ts` | Force HTTPS pour toutes les ressources |
| ✅ **App Check reCAPTCHA v3** | `lib/firebase/app-check.ts` | Token d'attestation joint à chaque requête Firebase — bloque bots et scripts externes |
| ✅ **CSP reCAPTCHA** | `middleware.ts` | `script-src`, `frame-src`, `connect-src` étendus pour `www.google.com` + `gstatic.com` |
| ✅ **Authentification Firebase** | `lib/firebase/hooks.ts` | Email/password + Google OAuth — `signInWithPopup` desktop, `signInWithRedirect` mobile |
| ✅ **Proxy Firebase Auth** | `next.config.js` | `/__/auth/*` proxifié vers `firebaseapp.com` — cookies first-party sur mobile (Safari/Chrome) |
| ✅ **authDomain same-origin** | `lib/firebase/config.ts` | `authDomain = portfolio.djefrid.ca` en prod — évite les cookies tiers bloqués sur mobile |
| ✅ **getRedirectResult** | `app/admin/login/page.tsx` | Traite le retour du redirect Google OAuth au montage de la page de login |
| ✅ **SW exclut /__/auth/*** | `public/sw.js` v4 | Le Service Worker ne cacheait pas les navigations `/__/auth/handler` — laisse le proxy Next.js traiter ces URLs sans interférence |
| ✅ **Vérification admin stricte** | `app/admin/layout.tsx` | Double garde : `isAdmin` (email dans liste `NEXT_PUBLIC_ADMIN_EMAIL` / `NEXT_PUBLIC_ADMIN_EMAIL_2`) ET utilisateur connecté |
| ✅ **Variables d'environnement** | `.env.local` / `.gitignore` | Non commitées — `RESEND_API_KEY` côté serveur uniquement |
| ✅ **XSS emails** | `app/api/contact/route.ts` | Données utilisateur échappées HTML avant insertion email Resend |

### Mesures en place (Firebase Console)

| Mesure | État | Détail |
|--------|------|--------|
| ✅ **Règles Firestore** | Actif | 2 emails admins autorisés, collections notes privées, catch-all deny |
| ✅ **Règles Storage** | Actif | 2 emails admins, types MIME validés, tailles max 10/25 MB |
| ✅ **App Check Monitor** | Actif | Storage + Firestore en surveillance — enforcement dans 24h |
| ✅ **Email Enumeration Protection** | Actif | Erreurs auth génériques (pas de `user-not-found`) |
| ✅ **Password Policy** | Actif | Min 8 chars + majuscule + minuscule + chiffre — mode "Exiger" |
| ✅ **Inscription publique désactivée** | Actif | `Activer la création` décoché — seul l'admin crée les comptes |
| ⏳ **App Check Enforcement** | Dans 24h | Activer après vérification métriques (>90% requêtes validées) |

### Actions manuelles restantes (dans 24h)

**App Check — Activer l'enforcement** une fois les métriques vérifiées :
> Firebase Console → App Check → API → pour chaque ligne :
> - **Storage** → `⋮` → **Appliquer**
> - **Cloud Firestore** → `⋮` → **Appliquer**
> - **Authentication** → `⋮` → **Appliquer**

**Quota identitytoolkit** (anti brute-force) :
> Google Cloud Console → APIs & Services → Identity Toolkit API → Quotas
> - `Queries per minute` → réduire à **1 000**
> - `Custom Token Sign In per minute` → réduire à **50**
> - `QueryUserInfo per minute` → réduire à **100**

### Règles Firestore expliquées ligne par ligne

```javascript
function isAdmin() {
  return request.auth != null                    // 1. Token Firebase présent
      && request.auth.token.email in [           // 2. Email dans la liste blanche
           'VOTRE_EMAIL_ADMIN_1',
           'VOTRE_EMAIL_ADMIN_2'
         ];
}
```

> **Note :** `email_verified` a été retiré des règles — inutile avec Firebase Auth email/password
> (l'inscription publique est désactivée dans la Console, seul l'admin crée les comptes).

| Condition | Ce qu'elle empêche |
|-----------|-------------------|
| `request.auth != null` | Accès anonyme sans connexion |
| `email in [...]` | Tout compte connecté qui n'est pas dans la liste — même un compte Firebase valide |

> **Pourquoi la liste dans les règles et pas seulement dans le code ?**
> Le code Next.js s'exécute dans le navigateur — n'importe qui peut faire une requête directe à l'API Firebase en utilisant tes clés publiques (normales, elles sont dans le bundle JS). Les règles Firestore s'exécutent côté Google — elles sont la seule barrière impossible à contourner côté client.

---

## PWA — Progressive Web App

Le portfolio est installable comme application native sur desktop (Chrome/Edge) et mobile (Android/iOS).

### Critères d'installation (Chrome)

| Critère | Fichier | État |
|---------|---------|------|
| Manifest valide | `app/manifest.ts` → `/manifest.webmanifest` | ✅ |
| Icône 192×192 PNG | `public/icon-192.png` | ✅ |
| Icône 512×512 PNG (maskable) | `public/icon-512.png` | ✅ |
| Service Worker actif | `public/sw.js` (enregistré dans `Providers.tsx`) | ✅ |
| HTTPS (ou localhost) | Vercel / dev | ✅ |

### Service Worker — stratégie Network First

- **Install** : pré-cache `'/'`, `'/favicon.svg'`, `'/icon-192.png'`, `'/icon-512.png'`
- **Fetch** : réseau prioritaire → cache en fallback offline
- **Exclusions** : `/__/auth/*` (proxy Firebase Auth), Firebase, Firestore, googleapis, google.com, gstatic.com, chrome-extension://, Vercel — jamais mis en cache
- **Activation** : `skipWaiting()` + `clients.claim()` — actif immédiatement sans fermer les onglets

### Vérifier le statut PWA (DevTools)

1. Chrome DevTools → onglet **Application**
2. Section **Service Workers** → vérifier `Status: activated and is running`
3. Section **Manifest** → vérifier que les champs sont chargés correctement

---

## Accessibilité

### Mesures WCAG implémentées

| Mesure | Standard | Fichier | Détail |
|--------|----------|---------|--------|
| **Skip link** | WCAG 2.4.1 (Bypass Blocks) | `app/layout.tsx` | Lien "Aller au contenu principal" visible au focus clavier — `href="#main-content"` |
| **prefers-reduced-motion** | WCAG 2.3.3 (Animation from Interactions) | `components/ui/FadeInSection.tsx`, `components/sections/Hero.tsx` | `useReducedMotion()` framer-motion : animations réduites à 0.15s, déplacement Y=0 si l'OS a "Réduire les animations" activé |
| **Carousel clavier** | WCAG 2.1.1 (Keyboard) | `components/sections/Projects.tsx` | `←` / `→` sur le carousel projets, `role="list"` + `role="listitem"`, `tabIndex={0}` |
| **aria-label SVGs** | WCAG 1.1.1 (Non-text Content) | `components/sections/Hero.tsx`, `Contact.tsx` | `aria-hidden="true"` sur SVGs décoratifs, `aria-label` sur liens fonctionnels |
| **aria-live formulaire** | WCAG 4.1.3 (Status Messages) | `components/sections/Contact.tsx` | `aria-live="polite" aria-atomic="true"` sur les messages de succès/erreur |
| **Focus trap modal** | WCAG 2.1.2 (No Keyboard Trap) | `components/sections/Projects.tsx` | Tab/Shift-Tab piégé dans la modale, focus restauré à la fermeture |
| **Pas de button imbriqué** | HTML spec | `components/admin/NotesEditor.tsx` | `<div role="button" tabIndex={0}>` sur les containers externes — `<button>` uniquement pour les contrôles internes |

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

### ❌ Connexion Google bloquée (desktop)

La popup Google est bloquée par le navigateur ou le domaine n'est pas autorisé dans Firebase.

1. Vérifier que Google est activé dans Firebase → Authentication → Sign-in method
2. Vérifier les domaines autorisés (localhost + votre domaine)
3. Autoriser les popups dans le navigateur pour votre domaine

---

### ❌ Connexion Google échoue sur mobile (Safari iOS / Chrome Android)

Sur mobile, `signInWithPopup` est bloqué par les navigateurs. Le projet utilise `signInWithRedirect` sur mobile. Pour que le redirect fonctionne, deux prérequis manuels :

**1. Google Cloud Console** → APIs & Services → Credentials → OAuth 2.0 Client ID "Web client" :
- **Origines JavaScript autorisées** → ajouter : `https://votre-domaine.com`
- **URI de redirection autorisées** → ajouter : `https://votre-domaine.com/__/auth/handler`

**2. Firebase Console** → Authentication → Settings → Domaines autorisés → ajouter : `votre-domaine.com`

> Sans ces étapes, `getRedirectResult()` retourne `null` et une page blanche s'affiche après le redirect Google.

> **Note :** Le Service Worker (sw.js v4) exclut explicitement `/__/auth/*` pour ne pas interférer avec le proxy Firebase Auth — si le SW interceptait ces URLs, le redirect échouait silencieusement.

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
| `ANALYZE=true npm run build` | Analyse des chunks JavaScript (bundle-analyzer) — ouvre un rapport HTML interactif |
| `npm run deploy:rules` | Déploiement des règles Firestore/Storage vers Firebase (lit `.env.local`, substitue `__ADMIN_EMAIL__`/`__PROJECT_ID__`, déploie, puis restaure les placeholders) |

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
│     langue, thème)             │    • Login Email/Google     │
│   • Hero, About, Projects,     │    • Éditeurs bilingues     │
│     Skills, Contact            │      Profil / Projets /     │
│   • Mode clair/sombre          │      Compétences / Notes    │
│   • Animations framer-motion   │    • Traduction auto FR→EN  │
│   • Bilingue FR/EN             │    • CRUD Firestore         │
│                                │    • Notes : dossiers,      │
│                                │      smart folders, tags,   │
│                                │      autocomplete           │
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
│   • Google OAuth              │    • settings/skills         │
│   • 1 admin autorisé          │    • projects/{id}           │
│   • Domaines autorisés        │    • adminNotes/{id}         │
│                               │    • adminFolders/{id}       │
│                               │    • adminTags/{name}        │
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

- Email : [VOTRE_EMAIL_ADMIN_1](mailto:VOTRE_EMAIL_ADMIN_1)
- GitHub : [github.com/Djefrid](https://github.com/Djefrid)
- LinkedIn : [linkedin.com/in/djefrid-byli-fotue-kuate-a30633225](https://www.linkedin.com/in/djefrid-byli-fotue-kuate-a30633225/)

---

*Documentation mise à jour le 16 mars 2026 — éditeur riche TipTap Word-style, dessin Excalidraw, drag & drop multi-fichiers, import/export DOCX, import PDF texte, correcteur natif navigateur, suggestions de tags (#), accessibilité ARIA complète, fix copier-coller (sync Firestore + VS Code HTML + Chrome image/png clipboard), layout Word centré en focusMode, toolbar Ribbon 4 onglets style Word, règles Firebase (2 admins), CSP nonce-based via middleware.ts, protection CSRF /api/*, Firebase App Check reCAPTCHA v3, CSP étendu (apis.google.com + *.firebaseapp.com + sha256 hash), COOP same-origin-allow-popups, proxy /__/auth/* Firebase Auth mobile, authDomain same-origin, signInWithRedirect mobile, Service Worker v4 (exclusion /__/auth/* pour fix Google OAuth mobile), Email Enumeration Protection, Password Policy, inscription publique désactivée, commentaires français sur tous les fichiers*
