# Portfolio - Développeur Web Full-Stack Junior

Portfolio professionnel bilingue (FR/EN) présentant mes compétences, projets et parcours en développement web.

## Fonctionnalités

- **Bilingue** : Support français/anglais avec traduction automatique
- **Hero** : Présentation avec nom, titre, stack technique et liens sociaux
- **À propos** : Parcours professionnel et points clés
- **Projets** : Projets détaillés avec stack, fonctionnalités et défis techniques
- **Compétences** : Technologies maîtrisées par catégorie (Frontend, Backend, BDD, DevOps)
- **Contact** : Liens de contact (Email, GitHub, LinkedIn)
- **Admin** : Interface d'administration privée avec :
  - Édition en français uniquement (traduction anglaise automatique)
  - Synchronisation temps réel Firebase + fichier local
  - Header séparé de la page publique

## Stack Technique

| Catégorie | Technologies |
|-----------|--------------|
| Framework | Next.js 14, React 18 |
| Langage | TypeScript 5 |
| Styling | Tailwind CSS 3.4 |
| Backend | Firebase (Auth + Firestore) |
| Traduction | MyMemory API (automatique) |
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

- **Profil** : Modifier nom, titre, liens (édition en français, traduction auto en anglais)
- **À propos** : Modifier paragraphes et points clés
- **Projets** : Gérer les projets (CRUD) avec traduction automatique
- **Compétences** : Modifier les compétences par catégorie

### Fonctionnement de la synchronisation

Lors de l'enregistrement dans l'admin :
1. Les données sont automatiquement traduites (FR → EN)
2. Sauvegarde dans Firebase Firestore
3. Synchronisation dans `data/portfolio-data.ts` (fichier local)

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
├── app/                      # App Router Next.js
│   ├── layout.tsx            # Layout racine (Providers)
│   ├── globals.css           # Styles globaux Tailwind
│   ├── (main)/               # Route group site public
│   │   ├── layout.tsx        # Layout avec Header/Footer
│   │   └── page.tsx          # Page d'accueil
│   ├── admin/                # Pages administration
│   │   ├── layout.tsx        # Layout admin (sans Header public)
│   │   ├── page.tsx          # Dashboard admin
│   │   └── login/page.tsx    # Page de connexion
│   └── api/                  # API Routes
│       ├── sync-data/        # Sync Firebase → fichier local
│       └── translate/        # Traduction automatique FR↔EN
├── components/               # Composants React
│   ├── Header.tsx            # Navigation responsive (site public)
│   ├── Footer.tsx            # Pied de page
│   ├── PortfolioWrapper.tsx  # Wrapper avec contexte
│   ├── Providers.tsx         # Providers (Auth, Language)
│   ├── sections/             # Sections du portfolio
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Projects.tsx
│   │   ├── Skills.tsx
│   │   └── Contact.tsx
│   └── admin/                # Composants admin
│       ├── AdminHeader.tsx   # Header admin séparé
│       ├── ProfileEditor.tsx
│       ├── ProjectsEditor.tsx
│       └── SkillsEditor.tsx
├── lib/                      # Bibliothèques
│   └── firebase/             # Configuration Firebase
│       ├── config.ts         # Init Firebase
│       ├── hooks.ts          # Hook useAuth
│       ├── context.tsx       # AuthProvider
│       └── firestore.ts      # CRUD Firestore
├── hooks/                    # Hooks React
│   └── usePortfolioData.ts   # Données portfolio
├── context/                  # Contextes React
│   ├── PortfolioContext.tsx
│   └── LanguageContext.tsx   # Contexte langue FR/EN
├── data/                     # Données statiques/sync
│   └── portfolio-data.ts     # Données bilingues (fallback + sync)
├── types/                    # Types TypeScript
│   ├── index.ts
│   └── firebase.ts           # Types bilingues
├── public/                   # Fichiers statiques
│   ├── favicon.svg
│   └── *.pdf                 # CV
└── package.json
```

## Personnalisation

### Mode statique (sans Firebase)

Éditer `data/portfolio-data.ts` pour modifier le contenu.

### Mode dynamique (avec Firebase)

Utiliser l'interface `/admin` pour modifier le contenu en temps réel.
Les modifications sont synchronisées automatiquement dans le fichier local.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                    │
├─────────────────────────────────────────────────────────────┤
│  Site public (FR/EN)      │     Admin privé (/admin)        │
│  - Header avec nav         │    - Header admin séparé        │
│  - Lit Firestore/local    │    - Login Firebase             │
│  - Changement de langue   │    - Édition FR uniquement      │
│  - Fallback statique      │    - Traduction auto → EN       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Routes (Next.js)                        │
├─────────────────────────────────────────────────────────────┤
│  /api/translate           │    /api/sync-data               │
│  - MyMemory API           │    - Sync Firebase → fichier    │
│  - FR ↔ EN automatique    │    - portfolio-data.ts          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Firebase                             │
├─────────────────────────────────────────────────────────────┤
│  Authentication           │         Firestore               │
│  - Email/password         │    - settings/profile           │
│  - 1 admin seul           │    - settings/skills            │
│                           │    - projects/ (bilingue)       │
└─────────────────────────────────────────────────────────────┘
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
