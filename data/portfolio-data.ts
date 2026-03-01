import type { PersonalInfo, AboutInfo, Project, SkillCategory } from '@/types';

// ===== BILINGUAL DATA =====

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
    location: "Montréal, QC",
    openToWork: true
  }
};

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
      "Full-stack developer with a dual background in web development and IT systems, built through a DEC in Computer Technology. I build complete applications — from UI to infrastructure — with a rigorous approach and a constant focus on quality.\n\nDuring my web development internship, I worked on real-world projects: database work, feature improvements, and setting up full local development environments. That experience reinforced my commitment to clean, reliable solutions.\n\nOn the systems side, I'm comfortable installing and maintaining Windows and Linux environments, working with virtualization tools (Proxmox, VMware), and handling network service fundamentals — giving me a full-stack perspective at every level of a project.\n\nI naturally integrate generative AI tools into my workflow to move faster without cutting corners: automation, code review, documentation — always grounded in solid engineering practices.\n\nSelf-driven and curious, I'm constantly looking to grow, whether in web development or IT infrastructure."
    ],
    highlights: [
      "DEC in Computer Technology – programming & systems.\nWeb development internship with real database projects.\nFull-stack mindset, end-to-end project ownership.\nCode quality and software engineering best practices."
    ]
  }
};

export const projectsBilingual = {
  fr: [
    {
      id: "rPXnbUjbyWR4pGtfteRW",
      title: "Portfolio — Next.js & Firebase",
      description: "Site portfolio production-ready : CMS maison piloté par Firebase, contenu bilingue FR/EN, animations soignées et SEO complet — déployé en continu sur Vercel.",
      longDescription: "Conçu pour refléter mes compétences autant que les présenter, ce portfolio est une application Next.js 14 full-stack déployée en production sur Vercel. Toutes les données (projets, compétences, profil) sont stockées dans Firebase Firestore et administrées via un panneau sécurisé — aucune modification de code requise pour mettre le contenu à jour.\n\nL'interface est entièrement bilingue FR/EN avec traduction automatique des nouveaux contenus via une API interne. Chaque décision d'architecture vise la performance : chargement Firebase en parallèle, fallback statique si Firebase est indisponible, et thème sombre/clair persistant sans flash d'hydratation (CLS ≈ 0).\n\nLe SEO est traité en profondeur : image Open Graph 1200×630 générée dynamiquement via Edge Runtime, balisage JSON-LD Schema.org, hreflang FR/EN, sitemap et robots.txt dynamiques. Le formulaire de contact intègre trois couches de protection anti-spam : honeypot invisible, vérification du timing et rate limiting par IP.",
      stack: [
        "Next.js 14 (App Router)",
        "TypeScript",
        "Tailwind CSS",
        "Firebase / Firestore",
        "Firebase Authentication",
        "Framer Motion",
        "lucide-react",
        "clsx",
        "i18n (custom)",
        "next-themes",
        "shadcn/ui",
        "Resend",
        "Vercel Analytics",
        "Vercel"
      ],
      features: [
        "Panneau d'administration sécurisé (Firebase Auth) — mise à jour du contenu sans toucher au code",
        "Contenu bilingue FR/EN avec traduction automatique via API interne",
        "Thème sombre/clair persistant sans flash d'hydratation (next-themes + SSR)",
        "Formulaire de contact anti-spam 3 couches : honeypot, timing check, rate limiting par IP",
        "Animations Framer Motion : entrées au scroll, hover spring sur les cartes, menu mobile animé",
        "Image Open Graph 1200×630 générée dynamiquement (Next.js Edge Runtime)",
        "SEO complet : JSON-LD Schema.org, hreflang FR/EN, sitemap et robots.txt dynamiques",
        "Fallback statique automatique si Firebase est indisponible"
      ],
      challenges: [
        "Synchroniser Firebase Firestore avec le rendu SSR Next.js sans bloquer le LCP",
        "Éliminer le flash de thème à l'hydratation (suppressHydrationWarning + placeholder SSR)",
        "Architecturer un système bilingue acceptant deux formats de données Firebase (legacy et nouveau)",
        "Sécuriser le formulaire contre les bots sans CAPTCHA intrusif",
        "Générer une OG image dynamique performante via Edge Runtime avec inline styles uniquement"
      ],
      githubUrl: "https://github.com/Djefrid/portfolio",
      demoUrl: "https://portfolio.djefrid.ca",
      image: "",
      featured: true
    },
    {
      id: "rgFqPLVlfOPgyzgsmqOb",
      title: "Boutique Africaine – E-commerce Afro-Minimaliste",
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
      title: "Facttrack — Application SaaS de facturation full-stack",
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
    }
  ],
  en: [
    {
      id: "rPXnbUjbyWR4pGtfteRW",
      title: "Portfolio — Next.js & Firebase",
      description: "Production-ready portfolio site: in-house Firebase-powered CMS, bilingual FR/EN content, polished animations and complete SEO — continuously deployed on Vercel.",
      longDescription: "Designed to reflect my skills as much as to present them, this portfolio is a full-stack Next.js 14 application deployed in production on Vercel. All data (projects, skills, profile) is stored in Firebase Firestore and managed via a secure admin panel — no code changes required to update content.\n\nThe interface is fully bilingual FR/EN with automatic translation of new content via an internal API. Every architectural decision targets performance: parallel Firebase loading, static fallback if Firebase is unavailable, and persistent dark/light theme without hydration flash (CLS ≈ 0).\n\nSEO is handled in depth: Open Graph 1200×630 image generated dynamically via Edge Runtime, JSON-LD Schema.org markup, hreflang FR/EN, sitemap and dynamic robots.txt. The contact form includes three layers of spam protection: invisible honeypot, timing check, and IP rate limiting.",
      stack: [
        "Next.js 14 (App Router)",
        "TypeScript",
        "Tailwind CSS",
        "Firebase / Firestore",
        "Firebase Authentication",
        "Framer Motion",
        "lucide-react",
        "clsx",
        "i18n (custom)",
        "next-themes",
        "shadcn/ui",
        "Resend",
        "Vercel Analytics",
        "Vercel"
      ],
      features: [
        "Secure admin panel (Firebase Auth) — update content without touching code",
        "Bilingual FR/EN content with automatic translation via internal API",
        "Persistent dark/light theme without hydration flash (next-themes + SSR)",
        "3-layer anti-spam contact form: honeypot, timing check, IP rate limiting",
        "Framer Motion animations: scroll entries, hover spring on cards, animated mobile menu",
        "Dynamically generated Open Graph 1200×630 image (Next.js Edge Runtime)",
        "Full SEO: JSON-LD Schema.org, hreflang FR/EN, sitemap and dynamic robots.txt",
        "Automatic static fallback if Firebase is unavailable"
      ],
      challenges: [
        "Synchronize Firebase Firestore with Next.js SSR rendering without blocking LCP",
        "Eliminate theme flash at hydration (suppressHydrationWarning + SSR placeholder)",
        "Architect a bilingual system supporting two Firebase data formats (legacy and new)",
        "Secure the form against bots without intrusive CAPTCHA",
        "Generate a high-performance dynamic OG image via Edge Runtime with inline styles only"
      ],
      githubUrl: "https://github.com/Djefrid/portfolio",
      demoUrl: "https://portfolio.djefrid.ca",
      image: "",
      featured: true
    },
    {
      id: "rgFqPLVlfOPgyzgsmqOb",
      title: "African Shop – Afro-Minimalist E-commerce",
      description: "Afro-minimalist e-commerce turnkey: catalogue managed via Sanity CMS, Stripe payment with Apple/Google Pay, persistent shopping cart and integrated appointment booking via Cal.com.",
      longDescription: "Complete e-commerce project with an \"Afro-Minimalist\" design, built to offer a fast and premium shopping experience. The frontend is developed with Next.js (App Router) and Tailwind CSS for performant, responsive, and SEO-optimized rendering. Content (products, categories, images, tags, stock, recommendations) is managed via Sanity (Headless CMS), enabling autonomous content updates without touching code.\n\nThe checkout uses Stripe Checkout, enabling Apple Pay and Google Pay on compatible devices, with an optimized flow including a Delivery / In-store Pickup choice. A Stripe webhook secures payment confirmation and records orders. An \"Appointments\" page integrates Cal.com for booking personalized consultation slots.\n\nThe project includes all essential legal pages (T&Cs, Privacy, Returns, Legal Notice) and a configuration ready for VPS deployment via Docker.",
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
        "Dynamic Product Catalog (Sanity CMS)",
        "Search, filters and sorting (categories, tags, prices)",
        "Detailed product page (origin, badges, stock)",
        "Recommendations “Often bought with” (cross-sell)",
        "Persistent basket (quantity, deletion, total)",
        "Optimized checkout with choice Delivery / Pickup store",
        "Stripe Checkout Payment with Apple Pay and Google Pay",
        "Stripe webhook for payment confirmation and order creation",
        "Integrated appointment booking via Cal.com",
        "Complete legal pages (GTCs, Privacy, Returns, Mentions)",
        "Basic SEO (metadata, OpenGraph, sitemap, bots)",
        "VPS deployment ready via Docker"
      ],
      challenges: [
        "Stripe Checkout integration and secure webhook management (signature)",
        "Modeling of Sanity schemas (products, categories, orders) and relationships",
        "Managing a reliable and persistent basket without undue complexity",
        "Performance/SEO optimization with App Router, Server Components and next/image",
        "Delivery vs Withdrawal journey design (field validation and UX)",
        "Docker deployment on VPS (build, environment variables, reverse proxy/HTTPS)"
      ],
      githubUrl: "https://github.com/Djefrid/onlinestoretemplate.git",
      demoUrl: "https://storetemplate.djefrid.ca/",
      image: "",
      featured: true
    },
    {
      id: "u2Pg23yoHgUtKV9GFG6n",
      title: "Facttrack — Full-stack billing SaaS application",
      description: "Full-stack SaaS tool to professionalize your invoicing: customer management, detailed PDF invoices and email sending — designed for freelancers.",
      longDescription: "Facttrack is a full-stack SaaS application designed for freelancers and small teams who want to professionalize their invoicing without complexity.\nThe tool covers the entire cycle: customer management, creation of detailed invoices with service lines and automatic calculation of totals, PDF export ready to send and direct sending by email from the application.\nThe architecture is based on a Django rest Framework backend secured by JWT and a Vue 3 + Vite + TypeScript frontend, guaranteeing reliability, speed and financial accuracy (amounts managed in Decimal to avoid rounding errors).",
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
        "Complete client management",
        "Create detailed invoices with service lines and automatic totals",
        "Professional PDF export ready to send",
        "Sending the invoice by email from the application",
        "Responsive interface",
        "Bilingual support FR/EN"
      ],
      challenges: [
        "Design of a clean and maintainable RESTful API with DRF",
        "Financial accuracy: amounts in Decimal to avoid rounding errors",
        "Real-time synchronization between Vue 3 UI state and the REST API",
        "Full containerization with Docker for repeatable deployment"
      ],
      githubUrl: "https://github.com/Djefrid/facttrack",
      demoUrl: "https://facttrack.ca",
      image: "",
      featured: true
    }
  ]
};

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

// ===== LEGACY EXPORTS (for compatibility) =====

export const personalInfo: PersonalInfo = personalInfoBilingual.fr;
export const aboutInfo: AboutInfo = aboutInfoBilingual.fr;
export const projects: Project[] = projectsBilingual.fr;
export const skills: SkillCategory[] = skillsBilingual.fr;
