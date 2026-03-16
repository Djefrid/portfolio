/**
 * ============================================================================
 * DONNÉES STATIQUES DU PORTFOLIO — portfolio-data.ts
 * ============================================================================
 *
 * Ce fichier contient TOUTES les données affichées sur le portfolio,
 * organisées en versions bilingues (français et anglais).
 *
 * Rôle dans l'architecture :
 * - Sert de FALLBACK si Firebase est indisponible ou non configuré
 * - Est automatiquement mis à jour par l'API /api/sync-data lorsque
 *   l'admin sauvegarde une modification (en développement local uniquement)
 * - En production (Vercel), Firebase est la source de vérité principale
 *
 * Structure :
 * - personalInfoBilingual : profil personnel (nom, titre, stack, liens)
 * - aboutInfoBilingual    : section "À propos" (paragraphes + points clés)
 * - projectsBilingual     : liste des projets avec description complète
 * - skillsBilingual       : catégories de compétences
 *
 * Les exports "legacy" en bas du fichier (personalInfo, aboutInfo, etc.)
 * sont conservés pour la compatibilité avec d'anciens imports.
 * ============================================================================
 */

import type { PersonalInfo, AboutInfo, Project, SkillCategory } from '@/types';

// ===== DONNÉES BILINGUES =====

/**
 * Informations personnelles du développeur, en français et en anglais.
 * Le champ `stack` liste toutes les technologies connues (utilisé dans la section Hero).
 * `openToWork` contrôle l'affichage du badge "Disponible" sur le Hero.
 */
export const personalInfoBilingual = {
  fr: {
    name: "Djefrid Byli Fotue Kuate",
    title: "Développeur Full-Stack | Support IT",
    stack: [
      "HTML",
      "CSS",
      "JavaScript",
      "Vue.js",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Bootstrap",
      "Django",
      "Django REST Framework",
      "Supabase",
      ".NET",
      "ASP.NET Core",
      "Entity framework",
      "PostgreSQL",
      "MySQL",
      "SQL",
      "Firestore",
      "Firebase Authentication",
      "Docker",
      "Git",
      "GitHub",
      "GitHub Actions",
      "Linux (Ubuntu/Debian)",
      "Proxmox",
      "VMware",
      "Postman",
      "VS Code",
      "Azure DevOps",
      "Jira",
      "Agile",
      "Scrum",
      "UML",
      "Vercel",
      "Hostinger",
      "Cloudflare (DNS)",
      "Domain & Subdomain Configuration",
      "SSL / HTTPS Configuration",
      "Google Search Console"
    ],
    email: "djeffkuate@gmail.com",
    github: "https://github.com/Djefrid",
    linkedin: "https://www.linkedin.com/in/djefrid-byli-fotue-kuate-a30633225/",
    cvUrl: "/CV_Developpeur_FullStack_Djefrid_Byli_ATS.pdf",
    location: "Montréal, QC",
    openToWork: true
  },
  en: {
    name: "Djefrid Byli Fotue Kuate",
    title: "Full-Stack Developer | IT Support",
    stack: [
      "HTML",
      "CSS",
      "JavaScript",
      "Vue.js",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Bootstrap",
      "Django",
      "Django REST Framework",
      "Supabase",
      ".NET",
      "ASP.NET Core",
      "Entity framework",
      "PostgreSQL",
      "MySQL",
      "SQL",
      "Firestore",
      "Firebase Authentication",
      "Docker",
      "Git",
      "GitHub",
      "GitHub Actions",
      "Linux (Ubuntu/Debian)",
      "Proxmox",
      "VMware",
      "Postman",
      "VS Code",
      "Azure DevOps",
      "Jira",
      "Agile",
      "Scrum",
      "UML",
      "Vercel",
      "Hostinger",
      "Cloudflare (DNS)",
      "Domain & Subdomain Configuration",
      "SSL / HTTPS Configuration",
      "Google Search Console"
    ],
    email: "djeffkuate@gmail.com",
    github: "https://github.com/Djefrid",
    linkedin: "https://www.linkedin.com/in/djefrid-byli-fotue-kuate-a30633225/",
    cvUrl: "/CV_Developpeur_FullStack_Djefrid_Byli_ATS.pdf",
    location: "Montreal, QC",
    openToWork: true
  }
};

/**
 * Contenu de la section "À propos" en français et en anglais.
 * - `paragraphs` : texte long présentant le parcours (affiché avec accordion)
 * - `highlights` : points clés résumés (affichés sous forme de liste à cocher)
 */
export const aboutInfoBilingual = {
  fr: {
    paragraphs: [
      "Développeur full-stack avec une double compétence en développement web et en systèmes informatiques, issue d'un DEC en informatique. Je construis des applications complètes — de l'interface jusqu'à l'infrastructure — avec une méthodologie rigoureuse et un souci constant de la qualité.\n\nMon stage en développement web m'a permis de travailler sur des projets concrets : manipulation de bases de données, évolution de fonctionnalités existantes et mise en place d'environnements de développement. Une expérience qui a confirmé mon goût pour les solutions robustes et le travail bien fait.\n\nCôté systèmes, je maîtrise l'installation et la maintenance d'environnements Windows et Linux, la virtualisation (Proxmox, VMware) et les bases des services réseau — ce qui me permet d'intervenir à tous les niveaux d'un projet.\n\nJ'intègre naturellement les outils d'IA générative dans mon workflow pour accélérer le développement sans sacrifier la qualité : automatisation, revue de code, documentation — toujours dans le respect des bonnes pratiques d'ingénierie logicielle.\n\nCurieux et autonome, je cherche continuellement à progresser, autant en développement web qu'en infrastructure."
    ],
    highlights: [
      "DEC en informatique – programmation & systèmes.\nStage en développement web avec bases de données.\nOrientation full-stack, vision globale du projet.\nQualité du code et bonnes pratiques."
    ]
  },
  en: {
    paragraphs: [
      "Full-stack developer with dual skills in web development and computer systems, stemming from a DEC in computer science. I build complete applications - from the interface to the infrastructure - with a rigorous methodology and a constant concern for quality.\n\nMy web development internship gave me the opportunity to work on real-life projects: handling databases, upgrading existing functionalities and setting up development environments. An experience that confirmed my taste for robust solutions and a job well done.\n\nAs far as systems are concerned, I've mastered the installation and maintenance of Windows and Linux environments, virtualization (Proxmox, VMware) and the basics of network services - which means I can intervene at all levels of a project.\n\nI naturally integrate generative AI tools into my workflow to speed up development without sacrificing quality: automation, code review, documentation - always respecting good software engineering practices.\n\nCurious and autonomous, I'm always looking to progress, both in web development and infrastructure."
    ],
    highlights: [
      "DEC in computer science - programming & systems.\nInternship in web development with databases.\nFull-stack orientation, global project vision.\nCode quality and best practices."
    ]
  }
};

/**
 * Liste des projets en français et en anglais.
 * Chaque projet contient :
 * - id         : identifiant Firestore (utilisé comme clé React)
 * - title      : nom du projet
 * - description: résumé court (affiché sur la carte)
 * - longDescription : description détaillée (affichée dans la modale)
 * - stack      : technologies utilisées (badges)
 * - features   : fonctionnalités principales (liste modale)
 * - challenges : défis techniques résolus (liste modale)
 * - githubUrl  : lien vers le dépôt GitHub
 * - demoUrl    : lien vers la démonstration en ligne (optionnel)
 * - image      : chemin de l'image (vide = pas d'image)
 * - featured   : true = mis en avant
 */
export const projectsBilingual = {
  fr: [
    {
      id: "rPXnbUjbyWR4pGtfteRW",
      title: "Portfolio — Next.js & Firebase",
      description: "Portfolio production-ready : CMS maison piloté par Firebase, système de notes privées style Apple Notes, contenu bilingue FR/EN, sécurité 5 couches, animations soignées et SEO complet — déployé en continu sur Vercel.",
      longDescription: "Conçu pour refléter mes compétences autant que les présenter, ce portfolio est une application Next.js 14 full-stack déployée sur Vercel. Il intègre un panneau d'administration complet piloté par Firebase, un éditeur de notes privées riche (style Word, TipTap 3), un système de traduction automatique FR/EN via DeepL, et une architecture de sécurité à 5 couches : CSP nonce-based, CSRF, Firebase App Check reCAPTCHA v3, Auth Firebase avec double garde admin (isAdmin), et règles Firestore/Storage strictes. Le tout avec SEO avancé, animations framer-motion et mode clair/sombre.",
      stack: [
        "Next.js 14 (App Router)",
        "TypeScript",
        "Tailwind CSS",
        "Firebase / Firestore",
        "Firebase Authentication (email + Google OAuth)",
        "Firebase App Check (reCAPTCHA v3)",
        "Framer Motion",
        "TipTap 3 (éditeur riche style Word)",
        "Resend (formulaire de contact)",
        "shadcn/ui",
        "next-themes",
        "DeepL API (traduction automatique FR↔EN)",
        "Vercel (déploiement continu)"
      ],
      features: [
        "Panneau d'administration sécurisé (Firebase Auth email + Google OAuth) — mise à jour sans toucher au code",
        "Système de notes privées style Apple Notes : dossiers, dossiers intelligents, tags, corbeille 30 jours",
        "Éditeur de notes riche TipTap 3 (style Word) : ribbon 4 onglets, polices, couleurs, tableaux, LaTeX, code highlight, Excalidraw",
        "Autocomplétion des tags dans l'éditeur (#) avec navigation clavier",
        "Recherche temps réel dans les notes (Ctrl+F) — filtre titre + contenu instantanément",
        "Architecture sécurité 5 couches : CSP nonce, CSRF Origin==Host, App Check reCAPTCHA v3, Auth Firebase, Firestore Rules",
        "Double garde admin côté client : utilisateur authentifié ET email dans la liste admin (isAdmin)",
        "Content-Security-Policy nonce-based par requête — élimine unsafe-inline pour les scripts",
        "Protection CSRF sur toutes les API Routes — rejet 403 si Origin ≠ Host",
        "Règles Firestore/Storage strictes : liste d'emails admin hardcodée, catch-all deny",
        "Contenu bilingue FR/EN avec traduction automatique DeepL à la sauvegarde",
        "SEO complet : JSON-LD Schema.org, Open Graph, Twitter Card, sitemap.xml, robots.txt, hreflang",
        "Formulaire de contact Resend avec protection anti-spam et validation côté serveur",
        "Mode clair/sombre animé (next-themes), animations scroll bidirectionnelles (framer-motion)",
        "Déploiement continu sur Vercel avec variables d'environnement sécurisées"
      ],
      challenges: [
        "Synchroniser Firebase Firestore avec le rendu SSR Next.js sans bloquer le LCP",
        "Éliminer le flash de thème à l'hydratation (suppressHydrationWarning + placeholder SSR)",
        "Architecturer un système bilingue acceptant deux formats de données Firebase (legacy et nouveau)",
        "Intégrer Firebase App Check reCAPTCHA v3 avec une CSP stricte nonce-based (frame-src, script-src, connect-src)",
        "Corriger le bug de copier-coller : Chrome ajoute image/png même pour du texte — détection hasText avant interception image",
        "Synchronisation Firestore vers état React sans écraser le contenu lors du focus éditeur",
        "Implémenter un éditeur riche TipTap 3 SSR-compatible avec immediatelyRender:false et setContent emitUpdate:false",
        "Créer une toolbar Ribbon 4 onglets style Word avec barre de progression upload intégrée"
      ],
      githubUrl: "https://github.com/Djefrid/portfolio",
      demoUrl: "https://portfolio.djefrid.ca",
      image: "",
      featured: true
    },
    {
      id: "rgFqPLVlfOPgyzgsmqOb",
      title: "Boutique en ligne — Next.js & Supabase",
      description: "E-commerce afro-minimaliste clé en main : catalogue géré via Sanity CMS, paiement Stripe avec Apple/Google Pay, panier persistant et prise de rendez-vous intégrée via Cal.com.",
      longDescription: "Projet e-commerce complet au design \"Afro-Minimaliste\", conçu pour offrir une expérience d'achat rapide et premium. Le frontend est développé avec Next.js (App Router) et Tailwind CSS pour un rendu performant, responsive et optimisé SEO. Le contenu (produits, catégories, images, tags, stock, recommandations) est administré via Sanity (Headless CMS), permettant une gestion de contenu autonome, sans toucher au code.\n\nLe checkout utilise Stripe Checkout, activant Apple Pay et Google Pay sur appareils compatibles, avec un parcours optimisé incluant un choix Livraison / Retrait magasin. Un webhook Stripe sécurise la confirmation des paiements et enregistre les commandes. Une page \"Rendez-vous\" intègre Cal.com pour réserver des créneaux de conseils personnalisés.\n\nLe projet inclut les pages légales indispensables (CGV, Confidentialité, Retours, Mentions légales) et une configuration prête au déploiement sur VPS via Docker.",
      stack: [
        "Next.js 14 (App Router)",
        "TypeScript",
        "Tailwind CSS",
        "Sanity.io",
        "Stripe",
        "Cal.com",
        "Docker",
        "Supabase"
      ],
      features: [
        "Catalogue produits dynamique (CMS Sanity)",
        "Recherche, filtres et tri (catégories, tags, prix)",
        "Page produit détaillée (origine, badges, stock)",
        "Recommandations “Souvent acheté avec” (cross-sell)",
        "Panier persistant (quantité, suppression, total)",
        "Checkout optimisé avec choix Livraison / Retrait magasin",
        "Paiement Stripe Checkout avec Apple Pay et Google Pay",
        "Webhook Stripe pour confirmation paiement et création de commande",
        "Prise de rendez-vous intégrée via Cal.com",
        "Pages légales complètes (CGV, Confidentialité, Retours, Mentions)",
        "SEO de base (metadata, OpenGraph, sitemap, robots)",
        "Déploiement VPS prêt via Docker"
      ],
      challenges: [
        "Intégration Stripe Checkout et gestion sécurisée des webhooks (signature)",
        "Modélisation des schémas Sanity (produits, catégories, commandes) et relations",
        "Gestion d’un panier fiable et persistant sans complexité excessive",
        "Optimisation performance/SEO avec App Router, Server Components et next/image",
        "Conception du parcours Livraison vs Retrait (validation des champs et UX)",
        "Déploiement Docker sur VPS (build, variables d’environnement, reverse proxy/HTTPS)"
      ],
      githubUrl: "https://github.com/Djefrid/onlinestoretemplate.git",
      demoUrl: "https://storetemplate.djefrid.ca/",
      image: "",
      featured: true
    },
    {
      id: "u2Pg23yoHgUtKV9GFG6n",
      title: "Facttrack — SaaS de facturation Vue.js & Django",
      description: "Outil SaaS full-stack pour professionnaliser sa facturation : gestion clients, factures PDF détaillées et envoi email — pensé pour les indépendants.",
      longDescription: "Facttrack est une application SaaS full-stack conçue pour les freelances et petites équipes qui veulent professionnaliser leur facturation sans complexité. L'outil couvre tout le cycle : gestion des clients, création de factures détaillées avec lignes de service et calcul automatique des totaux, export PDF prêt à envoyer et envoi direct par email depuis l'application.\n\nL'architecture repose sur un backend Django REST Framework sécurisé par JWT et un frontend Vue 3 + Vite + TypeScript, garantissant fiabilité, rapidité et précision financière (montants gérés en Decimal pour éviter les erreurs d'arrondi).",
      stack: [
        "Django",
        "Django REST Framework",
        "Vue 3",
        "Vite",
        "TypeScript",
        "JWT",
        "PostgreSQL",
        "Docker"
      ],
      features: [
        "Authentification JWT sécurisée",
        "Gestion complète des clients (CRUD)",
        "Création de factures détaillées avec lignes et totaux automatiques",
        "Export PDF professionnel prêt à envoyer",
        "Envoi de la facture par email depuis l'application",
        "Interface responsive",
        "Support bilingue FR/EN"
      ],
      challenges: [
        "Conception d'une API RESTful propre et maintenable avec DRF",
        "Précision financière : montants en Decimal pour éviter les erreurs d'arrondi",
        "Synchronisation temps réel entre l'état UI Vue 3 et l'API REST",
        "Conteneurisation complète avec Docker pour un déploiement reproductible"
      ],
      githubUrl: "https://github.com/Djefrid/facttrack",
      demoUrl: "https://facttrack.ca",
      image: "",
      featured: true
    },
    {
      id: "WZ6VfetH7uwUryGiNCnj",
      title: "FastCuts",
      description: "Transformez automatiquement vos vidéos longues en Shorts viraux grâce à l'IA.",
      longDescription: "FastCuts.app est une plateforme SaaS révolutionnaire conçue pour les créateurs de contenu et les marketeurs. Elle utilise l'intelligence artificielle pour analyser automatiquement des vidéos YouTube longues, identifier les moments les plus captivants, les recadrer au format vertical (9:16) et ajouter des sous-titres dynamiques style \"Hormozi\" pour maximiser la rétention et la viralité sur TikTok, Instagram Reels et YouTube Shorts.",
      stack: [
        "Next.js (React)",
        "TypeScript",
        "Tailwind CSS",
        "Shadcn/ui",
        "Prisma ORM",
        "PostgreSQL",
        "Stripe API",
        "Clerk Auth",
        "Python",
        "FFmpeg",
        "MediaPipe",
        "OpenAI API (GPT-4o)",
        "WhisperX",
        "Redis",
        "BullMQ",
        "Cloudflare R2"
      ],
      features: [
        "Analyse automatique de vidéos via URL YouTube.",
        "Détection IA des moments viraux (Hooks, contenu, conclusion).",
        "Recadrage intelligent (Smart Crop) pour suivre le locuteur en format 9:16.",
        "Sous-titres automatiques stylisés et synchronisés mot-par-mot.",
        "Éditeur en ligne pour personnaliser la police, la couleur et le style.",
        "Gestion des crédits et abonnements via Stripe."
      ],
      challenges: [
        "Contourner le GIL (Global Interpreter Lock) de Python pour le rendu FFmpeg parallèle.",
        "Implémenter le suivi de visage en temps réel avec MediaPipe pour le Smart Crop.",
        "Optimiser le temps de rendu vidéo en utilisant l'encodage GPU (NVENC).",
        "Gérer la file d'attente des tâches lourdes avec Redis et BullMQ.",
        "Générer des sous-titres .ass complexes à partir du JSON de WhisperX."
      ],
      githubUrl: "https://github.com/Djefrid/fastcuts",
      demoUrl: "https://fastcuts.ca",
      image: "",
      featured: true
    }
  ],
  en: [
    {
      id: "rPXnbUjbyWR4pGtfteRW",
      title: "Portfolio - Next.js & Firebase",
      description: "Portfolio production-ready: in-house CMS driven by Firebase, Apple Notes-style private notes system, bilingual FR/EN content, 5-layer security, polished animations and full SEO - deployed continuously on Vercel.",
      longDescription: "Designed to reflect my skills as much as present them, this portfolio is a full-stack Next.js 14 application deployed on Vercel. It features a full Firebase-driven administration panel, a rich private note editor (Word style, TipTap 3), automatic FR/EN translation via DeepL, and a 5-layer security architecture: nonce-based CSP, CSRF, Firebase App Check reCAPTCHA v3, Firebase Auth with double admin guard (isAdmin), and strict Firestore/Storage rules. All with advanced SEO, framer-motion animations and light/dark mode.",
      stack: [
        "Next.js 14 (App Router)",
        "TypeScript",
        "Tailwind CSS",
        "Firebase / Firestore",
        "Firebase Authentication (email + Google OAuth)",
        "Firebase App Check (reCAPTCHA v3)",
        "Framer Motion",
        "TipTap 3 (éditeur riche style Word)",
        "Resend (formulaire de contact)",
        "shadcn/ui",
        "next-themes",
        "DeepL API (traduction automatique FR↔EN)",
        "Vercel (déploiement continu)"
      ],
      features: [
        "Secure administration panel (Firebase Auth email + Google OAuth) - update without touching the code",
        "Apple Notes-style private note system: folders, smart folders, tags, 30-day recycle garbage can",
        "TipTap 3 rich note editor (Word style): 4-tab ribbon, fonts, colors, tables, LaTeX, code highlight, Excalidraw",
        "Autocomplete tags in editor (#) with keyboard navigation",
        "Real-time search in notes (Ctrl+F) - filter title + content instantly",
        "5-layer security architecture: CSP nonce, CSRF Origin==Host, App Check reCAPTCHA v3, Auth Firebase, Firestore Rules",
        "Double admin guard on client side: authenticated user AND email in admin list (isAdmin)",
        "Content-Security-Policy nonce-based per request - eliminates unsafe-inline for scripts",
        "CSRF protection on all API Routes - reject 403 if Origin ≠ Host",
        "Strict Firestore/Storage rules: hard-coded admin email list, catch-all deny",
        "Bilingual FR/EN content with automatic translation DeepL to save",
        "Full SEO: JSON-LD Schema.org, Open Graph, Twitter Card, sitemap.xml, robots.txt, hreflang",
        "Resend contact form with spam protection and server-side validation",
        "Animated light/dark mode (next-themes), bidirectional scroll animations (framer-motion)",
        "Continuous deployment on Vercel with secure environment variables"
      ],
      challenges: [
        "Synchronize Firebase Firestore with Next.js SSR rendering without blocking LCP",
        "Eliminate hydration theme flash (suppressHydrationWarning + placeholder SSR)",
        "Architect a bilingual system accepting two Firebase data formats (legacy and new)",
        "Integrate Firebase App Check reCAPTCHA v3 with strict nonce-based CSP (frame-src, script-src, connect-src)",
        "Fixed copy/paste bug: Chrome adds image/png even for text - hasText detection before image interception",
        "Firestore synchronization to React state without overwriting content during editor focus",
        "Implement a TipTap 3 SSR rich-editor compatible with immediatelyRender:false and setContent emitUpdate:false",
        "Create a Word-style 4-tab Ribbon toolbar with integrated upload progress bar"
      ],
      githubUrl: "https://github.com/Djefrid/portfolio",
      demoUrl: "https://portfolio.djefrid.ca",
      image: "",
      featured: true
    },
    {
      id: "rgFqPLVlfOPgyzgsmqOb",
      title: "Online store - Next.js & Supabase",
      description: "Turnkey afro-minimalist e-commerce: catalog managed via Sanity CMS, Stripe payment with Apple/Google Pay, persistent shopping cart and integrated appointment booking via Cal.com.",
      longDescription: "Complete e-commerce project with \"Afro-Minimalist\" design, designed to offer a fast, premium shopping experience. The frontend is developed with Next.js (App Router) and Tailwind CSS for high-performance, responsive, SEO-optimized rendering. Content (products, categories, images, tags, stock, recommendations) is managed via Sanity (Headless CMS), enabling autonomous content management without touching the code.\n\nCheckout uses Stripe Checkout, enabling Apple Pay and Google Pay on compatible devices, with an optimized checkout path including a Delivery / Store Pickup choice. A Stripe webhook secures payment confirmation and records orders. An \"Appointment\" page integrates Cal.com to book personalized advice slots.\n\nThe project includes the essential legal pages (GTC, Privacy, Returns, Legal) and a configuration ready for deployment on VPS via Docker.",
      stack: [
        "Next.js 14 (App Router)",
        "TypeScript",
        "Tailwind CSS",
        "Sanity.io",
        "Stripe",
        "Cal.com",
        "Docker",
        "Supabase"
      ],
      features: [
        "Dynamic product catalog (CMS Sanity)",
        "Search, filter and sort (categories, tags, prices)",
        "Detailed product page (origin, badges, stock)",
        "Often bought with\" (cross-sell) recommendations",
        "Persistent basket (quantity, deletion, total)",
        "Optimized checkout with choice of delivery / store pickup",
        "Stripe Checkout payment with Apple Pay and Google Pay",
        "Webhook Stripe for payment confirmation and order creation",
        "Integrated appointment booking via Cal.com",
        "Complete legal pages (GTC, Privacy, Returns, Disclaimer)",
        "Basic SEO (metadata, OpenGraph, sitemap, robots)",
        "Docker-ready VPS deployment"
      ],
      challenges: [
        "Stripe Checkout integration and secure webhook management (signature)",
        "Sanity schema modeling (products, categories, orders) and relationships",
        "Reliable, persistent basket management without excessive complexity",
        "Performance/SEO optimization with App Router, Server Components and next/image",
        "Design of delivery vs. pickup path (validation of fields and UX)",
        "Docker deployment on VPS (build, environment variables, reverse proxy/HTTPS)"
      ],
      githubUrl: "https://github.com/Djefrid/onlinestoretemplate.git",
      demoUrl: "https://storetemplate.djefrid.ca/",
      image: "",
      featured: true
    },
    {
      id: "u2Pg23yoHgUtKV9GFG6n",
      title: "Facttrack - Billing SaaS Vue.js & Django",
      description: "Full-stack SaaS tool for professional invoicing: customer management, detailed PDF invoices and email dispatch - designed for the self-employed.",
      longDescription: "Facttrack is a full-stack SaaS application designed for freelancers and small teams who want to professionalize their invoicing without complexity. The tool covers the entire cycle: customer management, creation of detailed invoices with service lines and automatic calculation of totals, ready-to-send PDF export and direct emailing from within the application.\n\nThe architecture is based on a Django REST Framework backend secured by JWT and a Vue 3 + Vite + TypeScript frontend, guaranteeing reliability, speed and financial accuracy (amounts managed in Decimal to avoid rounding errors).",
      stack: [
        "Django",
        "Django REST Framework",
        "Vue 3",
        "Vite",
        "TypeScript",
        "JWT",
        "PostgreSQL",
        "Docker"
      ],
      features: [
        "Secure JWT authentication",
        "Complete customer management (CRUD)",
        "Create detailed invoices with automatic lines and totals",
        "Ready-to-send professional PDF export",
        "Send invoice by email from the application",
        "Responsive interface",
        "Bilingual support FR/EN"
      ],
      challenges: [
        "Design a clean, maintainable RESTful API with DRF",
        "Financial precision: Decimal amounts to avoid rounding errors",
        "Real-time synchronization between UI Vue 3 status and REST API",
        "Full containerization with Docker for reproducible deployment"
      ],
      githubUrl: "https://github.com/Djefrid/facttrack",
      demoUrl: "https://facttrack.ca",
      image: "",
      featured: true
    },
    {
      id: "WZ6VfetH7uwUryGiNCnj",
      title: "FastCuts",
      description: "Automatically transform your long videos into viral shorts thanks to AI.",
      longDescription: "FastCuts.app is a revolutionary SaaS platform designed for content creators and marketers. It uses artificial intelligence to automatically analyze long YouTube videos, identify the most captivating moments, crop them to vertical format (9:16) and add dynamic \"Hormozi-style\" subtitles to maximize retention and virality on TikTok, Instagram Reels and YouTube Shorts.",
      stack: [
        "Next.js (React)",
        "TypeScript",
        "Tailwind CSS",
        "Shadcn/ui",
        "Prisma ORM",
        "PostgreSQL",
        "Stripe API",
        "Clerk Auth",
        "Python",
        "FFmpeg",
        "MediaPipe",
        "OpenAI API (GPT-4o)",
        "WhisperX",
        "Redis",
        "BullMQ",
        "Cloudflare R2"
      ],
      features: [
        "Automatic video analysis via YouTube URL.",
        "AI detection of viral moments (hooks, content, conclusion).",
        "Smart Crop to follow the speaker in 9:16 format.",
        "Stylized, word-by-word synchronized automatic subtitles.",
        "Online editor for customizing font, color and style.",
        "Manage credits and subscriptions via Stripe."
      ],
      challenges: [
        "Bypass Python's GIL (Global Interpreter Lock) for parallel FFmpeg rendering.",
        "Implement real-time face tracking with MediaPipe for Smart Crop.",
        "Optimize video rendering time using GPU encoding (NVENC).",
        "Manage heavy task queues with Redis and BullMQ.",
        "Generate complex .ass subtitles from WhisperX JSON."
      ],
      githubUrl: "https://github.com/Djefrid/fastcuts",
      demoUrl: "https://fastcuts.ca",
      image: "",
      featured: true
    }
  ]
};

/**
 * Catégories de compétences en français et en anglais.
 * Chaque catégorie contient un tableau de compétences { name }.
 * Les labels de catégorie sont traduits séparément car le nom de la compétence
 * (ex: "Docker", "React") reste identique dans les deux langues.
 */
export const skillsBilingual = {
  fr: [
    {
      category: "Frontend",
      skills: [
        { name: "HTML5" }, { name: "CSS3" }, { name: "JavaScript" }, { name: "TypeScript" },
        { name: "React" }, { name: "Next.js" }, { name: "Vue.js" }, { name: "Bootstrap" },
        { name: "Tailwind CSS" }, { name: "Sass" }, { name: "AJAX" }
      ]
    },
    {
      category: "Backend",
      skills: [
        { name: "Django" }, { name: "Django REST Framework" }, { name: "Python" },
        { name: "Node.js" }, { name: "PHP" }, { name: "C#" }, { name: ".NET" },
        { name: "ASP.NET" }, { name: "ASP.NET Core" }, { name: "API REST" }
      ]
    },
    {
      category: "Bases de données",
      skills: [
        { name: "PostgreSQL" }, { name: "MySQL" }, { name: "SQLite" }, { name: "SQL" },
        { name: "phpMyAdmin" }, { name: "MySQL Workbench" }, { name: "Microsoft SQL Server Management Studio" }
      ]
    },
    {
      category: "DevOps / Systèmes",
      skills: [
        { name: "Docker" }, { name: "Git" }, { name: "GitHub" }, { name: "GitHub Actions" },
        { name: "CI/CD" }, { name: "Linux (Ubuntu, Debian, Alpine)" }, { name: "Windows" },
        { name: "Windows Server" }, { name: "Proxmox" }, { name: "VMware" }
      ]
    },
    {
      category: "Réseaux / Serveurs",
      skills: [
        { name: "DHCP" }, { name: "DNS" }, { name: "Active Directory" }, { name: "SMB (fichiers & impression)" }
      ]
    },
    {
      category: "Scripts & Automatisation",
      skills: [
        { name: "PowerShell" }, { name: "Bash" }
      ]
    },
    {
      category: "Outils & Méthodologies",
      skills: [
        { name: "Postman" }, { name: "Visual Studio" }, { name: "VS Code" }, { name: "Azure DevOps" },
        { name: "Jira" }, { name: "UML" }, { name: "Agile" }, { name: "Scrum" }
      ]
    },
    {
      category: "Outils collaboratifs & CMS",
      skills: [
        { name: "WordPress" }, { name: "GLPI" }, { name: "Office 365" }, { name: "Microsoft Teams" },
        { name: "Zoom" }, { name: "OneDrive" }, { name: "Discord" }
      ]
    }
  ],
  en: [
    {
      category: "Frontend",
      skills: [
        { name: "HTML5" }, { name: "CSS3" }, { name: "JavaScript" }, { name: "TypeScript" },
        { name: "React" }, { name: "Next.js" }, { name: "Vue.js" }, { name: "Bootstrap" },
        { name: "Tailwind CSS" }, { name: "Sass" }, { name: "AJAX" }
      ]
    },
    {
      category: "Backend",
      skills: [
        { name: "Django" }, { name: "Django REST Framework" }, { name: "Python" },
        { name: "Node.js" }, { name: "PHP" }, { name: "C#" }, { name: ".NET" },
        { name: "ASP.NET" }, { name: "ASP.NET Core" }, { name: "REST API" }
      ]
    },
    {
      category: "Databases",
      skills: [
        { name: "PostgreSQL" }, { name: "MySQL" }, { name: "SQLite" }, { name: "SQL" },
        { name: "phpMyAdmin" }, { name: "MySQL Workbench" }, { name: "Microsoft SQL Server Management Studio" }
      ]
    },
    {
      category: "DevOps / Systems",
      skills: [
        { name: "Docker" }, { name: "Git" }, { name: "GitHub" }, { name: "GitHub Actions" },
        { name: "CI/CD" }, { name: "Linux (Ubuntu, Debian, Alpine)" }, { name: "Windows" },
        { name: "Windows Server" }, { name: "Proxmox" }, { name: "VMware" }
      ]
    },
    {
      category: "Networks / Servers",
      skills: [
        { name: "DHCP" }, { name: "DNS" }, { name: "Active Directory" }, { name: "SMB (files & print)" }
      ]
    },
    {
      category: "Scripts & Automation",
      skills: [
        { name: "PowerShell" }, { name: "Bash" }
      ]
    },
    {
      category: "Tools & Methodologies",
      skills: [
        { name: "Postman" }, { name: "Visual Studio" }, { name: "VS Code" }, { name: "Azure DevOps" },
        { name: "Jira" }, { name: "UML" }, { name: "Agile" }, { name: "Scrum" }
      ]
    },
    {
      category: "Collaboration Tools & CMS",
      skills: [
        { name: "WordPress" }, { name: "GLPI" }, { name: "Office 365" }, { name: "Microsoft Teams" },
        { name: "Zoom" }, { name: "OneDrive" }, { name: "Discord" }
      ]
    }
  ]
};

// ===== EXPORTS LEGACY (rétrocompatibilité) =====
// Ces exports pointent vers la version française par défaut.
// Ils sont gardés pour ne pas casser d'éventuels imports directs.

export const personalInfo: PersonalInfo = personalInfoBilingual.fr;
export const aboutInfo: AboutInfo = aboutInfoBilingual.fr;
export const projects: Project[] = projectsBilingual.fr;
export const skills: SkillCategory[] = skillsBilingual.fr;
