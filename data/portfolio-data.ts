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
      "Linux (Ubuntu",
      "Debian)",
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
    location: "Levis, QC",
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
      "Linux (Ubuntu",
      "Debian)",
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
    location: "Levis, QC",
    openToWork: true
  }
};

export const aboutInfoBilingual = {
  fr: {
    paragraphs: [
      "Diplômé d'un DEC en technique de l'informatique, je possède un profil polyvalent combinant le développement web et les compétences techniques en informatique et systèmes. Mon parcours m'a permis d'acquérir une base solide en programmation, en gestion des environnements informatiques et une méthodologie de travail rigoureuse.\n\nLors de mon stage en développement web, j'ai travaillé sur des projets concrets en PHP avec phpMyAdmin, incluant la manipulation de bases de données et la mise à jour de fonctionnalités existantes. J'ai également conçu et configuré un environnement de développement local complet.\n\nEn tant que technicien en informatique, je maîtrise l'installation, la configuration et la maintenance d'environnements Windows et Linux, l'utilisation de machines virtuelles, ainsi que les bases des services réseau.\n\nJ’utilise activement des outils d’intelligence artificielle générative pour améliorer la productivité ,\naccélérer le développement, optimiser la qualité du code, automatiser la documentation et assister\nla résolution de problèmes techniques tout en respectant les bonnes pratiques d’ingénierie\nlogicielle.\n\nCurieux et motivé, je cherche continuellement à approfondir mes compétences autant en développement qu'en infrastructure informatique."
    ],
    highlights: [
      "DEC en informatique – programmation & systèmes.\nStage en développement web avec bases de données.\nOrientation full-stack, vision globale du projet.\nQualité du code et bonnes pratiques."
    ]
  },
  en: {
    paragraphs: [
      "Graduated with a Dec in computer technology, I have a versatile profile combining web development and technical skills in computer science and systems.\nMy background has allowed me to acquire a solid foundation in programming, management of IT environments and a rigorous working methodology.\nDuring my internship in web development, I worked on concrete PHP projects with phpMyAdmin, including database manipulation and updating existing features.\nI also designed and configured a complete local development environment.\nAs an IT technician, I master the installation, configuration and maintenance of Windows and Linux environments, the use of virtual machines, as well as the basics of network services.\nI actively use generative artificial intelligence tools to improve productivity ,\naccelerate development, optimize code quality, automate documentation, and assist\nsolving technical problems while adhering to good engineering practices\nsoftware.\nCurious and motivated, I continually seek to deepen my skills in both development and IT infrastructure."
    ],
    highlights: [
      "Dec in Computer Science – Programming & Systems.\nInternship in web development with databases.\nFull-stack orientation, overall vision of the project.\nCode quality and best practices."
    ]
  }
};

export const projectsBilingual = {
  fr: [
    {
      id: "u2Pg23yoHgUtKV9GFG6n",
      title: "Facttrack — SaaS de gestion de factures",
      description: "SaaS de facturation avec gestion clients, création/gestion de factures, génération PDF et envoi email.",
      longDescription: "Facttrack est une application full-stack orientée SaaS pour créer, gérer et envoyer des factures. Le backend est construit avec Django REST Framework (API sécurisée JWT), et le frontend avec Vue 3 + Vite + TypeScript.",
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
        "Gestion des clients (CRUD)",
        "Création de factures avec lignes et totaux",
        "Génération de facture en PDF",
        "Envoi de facture par email",
        "Interface responsive",
        "Multi-langue FR/EN"
      ],
      challenges: [
        "Architecture API propre avec DRF",
        "Gestion fiable des montants (Decimal)",
        "Synchronisation état UI / API",
        "Déploiement Docker"
      ],
      githubUrl: "https://github.com/Djefrid/facttrack",
      demoUrl: "https://facttrack.ca",
      image: "",
      featured: true
    },
    {
      id: "rgFqPLVlfOPgyzgsmqOb",
      title: "Boutique Africaine – E-commerce Afro-Minimaliste",
      description: "Boutique en ligne moderne pour produits africains : catalogue dynamique, filtres, panier persistant, paiement Stripe (Apple Pay/Google Pay) et prise de rendez-vous via Cal.com.",
      longDescription: "Projet e-commerce complet au design “Afro-Minimaliste”, conçu pour offrir une expérience d’achat rapide et premium. Le frontend est développé avec Next.js (App Router) et Tailwind CSS pour un rendu performant, responsive et optimisé SEO. Le contenu (produits, catégories, images, tags, stock, recommandations) est administré via Sanity (Headless CMS) afin de permettre une gestion simple sans maintenance serveur.\nLe checkout utilise Stripe Checkout, activant Apple Pay et Google Pay sur appareils compatibles, avec un parcours optimisé incluant un choix Livraison / Retrait magasin. Un webhook Stripe sécurise la confirmation des paiements et permet l’enregistrement des commandes. Une page “Rendez-vous” intègre Cal.com pour réserver des créneaux de conseils personnalisés.\nLe projet inclut les pages légales indispensables (CGV, Confidentialité, Retours, Mentions légales) et une configuration prête au déploiement sur VPS via Docker.",
      stack: [
        "Next.js 14 (App Router)",
        "TypeScript",
        "Tailwind CSS",
        "Sanity.io",
        "Stripe",
        "Cal.com",
        "Docker"
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
      
      image: "",
      featured: true
    },
    {
      id: "x477YU9WNE9D3XXX2hGd",
      title: "test",
      description: "",
      longDescription: "",
      stack: [],
      features: [

      ],
      challenges: [

      ],
      githubUrl: "",
      
      image: "",
      featured: true
    }
  ],
  en: [
    {
      id: "u2Pg23yoHgUtKV9GFG6n",
      title: "Facttrack — Invoice Management SaaS",
      description: "Invoicing SaaS with customer management, invoice creation/management, PDF generation and emailing.",
      longDescription: "Facttrack is a full-stack SaaS-oriented application for creating, managing and sending invoices.\nThe backend is built with Django rest Framework (JWT Secure API), and the frontend with Vue 3 + Quick + TypeScript.",
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
        "&lt;html&gt;&lt;center&gt;Customers' Management&lt;/center&gt;&lt;/html&gt;",
        "Creating invoices with lines and totals",
        "PDF Invoice Generation",
        "Sending invoice via e-mail",
        "Responsive multilingual web",
        "Multi-language FR/EN"
      ],
      challenges: [
        "Clean API architecture with DRF",
        "Reliable Amount Management (Decimal)",
        "UI / API status synchronization",
        "Docker deployment"
      ],
      githubUrl: "https://github.com/Djefrid/facttrack",
      demoUrl: "https://facttrack.ca",
      image: "",
      featured: true
    },
    {
      id: "rgFqPLVlfOPgyzgsmqOb",
      title: "African Shop – Afro-Minimalist E-commerce",
      description: "Modern online store for African products: dynamic catalog, filters, persistent cart, Stripe payment (Apple Pay/Google Pay) and appointment booking via Cal.com.",
      longDescription: "Complete e-commerce project with an \"Afro-Minimalist\" design, designed to offer a fast and premium shopping experience.\nThe frontend is developed with Next.js (App Router) and Tailwind CSS for efficient, responsive and SEO optimized rendering.\nThe content (products, categories, images, tags, stock, recommendations) is administered via Sanity (Headless CMS) to allow simple management without server maintenance.\nThe checkout uses Stripe Checkout, activating Apple Pay and Google Pay on compatible devices, with an optimized journey including a choice of Delivery / Pickup store.\nA Stripe webhook secures payment confirmation and allows orders to be registered.\nAn “Appointment” page integrates Cal.com to book personalized advice slots.\nThe project includes the essential legal pages (GTCs, Privacy, Returns, Legal Notice) and a configuration ready for deployment on VPS via Docker.",
      stack: [
        "Next.js 14 (App Router)",
        "TypeScript",
        "Tailwind CSS",
        "Sanity.io",
        "Stripe",
        "Cal.com",
        "Docker"
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
      
      image: "",
      featured: true
    },
    {
      id: "x477YU9WNE9D3XXX2hGd",
      title: "",
      description: "",
      longDescription: "",
      stack: [],
      features: [

      ],
      challenges: [

      ],
      githubUrl: "",
      
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
