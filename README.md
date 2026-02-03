# Portfolio - Développeur Web Full-Stack Junior

Portfolio professionnel présentant mes compétences, projets et parcours en développement web.

## Description

Ce portfolio est une application web moderne développée avec Next.js 14 et TypeScript. Il présente :

- **Hero** : Présentation avec nom, titre, stack technique et liens sociaux
- **À propos** : Parcours professionnel et points clés
- **Projets** : 3 projets détaillés avec stack, fonctionnalités et défis techniques
- **Compétences** : Technologies maîtrisées par catégorie (Frontend, Backend, BDD, DevOps)
- **Contact** : Liens de contact (Email, GitHub, LinkedIn)
- **Admin** : Interface d'administration privée pour modifier le contenu en temps réel

## Stack Technique

| Catégorie | Technologies |
|-----------|--------------|
| Framework | Next.js 14, React 18 |
| Langage | TypeScript 5 |
| Styling | Tailwind CSS 3.4 |
| Backend | Firebase (Auth + Firestore) |
| Linting | ESLint |
| Déploiement | Vercel (recommandé) |

## Installation

### Prérequis

- Node.js 18+ (testé avec Node.js 22)
- npm ou yarn
- Compte Firebase (optionnel, pour l'admin)

### Étapes

1. **Cloner le repository**
   ```bash
   git clone https://github.com/votre-username/portfolio.git
   cd portfolio
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Firebase (optionnel)**

   Copier `.env.local.example` en `.env.local` et remplir avec vos valeurs Firebase :
   ```bash
   cp .env.local.example .env.local
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

5. **Ouvrir dans le navigateur**
   ```
   http://localhost:3000
   ```

## Configuration Firebase (Optionnel)

Le portfolio fonctionne sans Firebase (données statiques). Pour activer l'administration :

### 1. Créer un projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Créer un nouveau projet
3. Activer **Authentication** (Email/Password)
4. Activer **Firestore Database**

### 2. Configurer les variables d'environnement

Créer `.env.local` :
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_ADMIN_EMAIL=ton@email.com
```

### 3. Configurer les règles Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Lecture publique
    match /{document=**} {
      allow read: if true;
    }
    // Écriture réservée à l'admin
    match /{document=**} {
      allow write: if request.auth != null
        && request.auth.token.email == "ton@email.com";
    }
  }
}
```

### 4. Créer l'utilisateur admin

Dans Firebase Console > Authentication > Users > Add user

## Administration

Accéder à `/admin` pour :

- Modifier le profil (nom, titre, liens)
- Modifier la section À propos
- Gérer les projets (CRUD)
- Modifier les compétences

Les changements sont **instantanés** grâce aux listeners temps réel Firestore.

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Compile le projet pour la production |
| `npm run start` | Lance le serveur de production |
| `npm run lint` | Vérifie le code avec ESLint |

## Structure du Projet

```
portfolio/
├── app/                    # App Router Next.js
│   ├── layout.tsx          # Layout principal avec SEO
│   ├── page.tsx            # Page d'accueil
│   ├── globals.css         # Styles globaux Tailwind
│   └── admin/              # Pages administration
│       ├── layout.tsx      # Layout admin avec auth
│       ├── page.tsx        # Dashboard admin
│       └── login/
│           └── page.tsx    # Page de connexion
├── components/             # Composants React
│   ├── Header.tsx          # Navigation responsive
│   ├── Footer.tsx          # Pied de page
│   ├── PortfolioWrapper.tsx # Wrapper avec contexte
│   ├── sections/           # Sections du portfolio
│   └── admin/              # Composants admin
│       ├── ProfileEditor.tsx
│       ├── ProjectsEditor.tsx
│       └── SkillsEditor.tsx
├── lib/                    # Bibliothèques
│   └── firebase/           # Configuration Firebase
│       ├── config.ts       # Init Firebase
│       ├── hooks.ts        # Hook useAuth
│       ├── context.tsx     # AuthProvider
│       └── firestore.ts    # CRUD Firestore
├── hooks/                  # Hooks React
│   └── usePortfolioData.ts # Données portfolio
├── context/                # Contextes React
│   └── PortfolioContext.tsx
├── data/                   # Données statiques (fallback)
│   └── portfolio-data.ts
├── types/                  # Types TypeScript
│   ├── index.ts
│   └── firebase.ts
├── public/                 # Fichiers statiques
│   └── favicon.svg
└── package.json
```

## Personnalisation

### Mode statique (sans Firebase)

Éditer `data/portfolio-data.ts` pour modifier le contenu.

### Mode dynamique (avec Firebase)

Utiliser l'interface `/admin` pour modifier le contenu en temps réel.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (Next.js)             │
├─────────────────────────────────────────────────┤
│  Portfolio public    │    Admin privé (/admin)  │
│  - Lit Firestore     │    - Login Firebase      │
│  - Fallback static   │    - CRUD contenu        │
└─────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│                    Firebase                     │
├─────────────────────────────────────────────────┤
│  Authentication      │    Firestore             │
│  - Email/password    │    - settings/profile    │
│  - 1 admin seul      │    - settings/skills     │
│                      │    - projects/           │
└─────────────────────────────────────────────────┘
```

## Sécurité

- Authentification Firebase (email/password)
- Règles Firestore restrictives
- Un seul utilisateur admin autorisé
- Pas de secrets côté client

## Licence

MIT

---

Développé avec Next.js, React, TypeScript et Firebase.
