import type { PersonalInfo, AboutInfo, Project, SkillCategory } from '@/types';

export const personalInfo: PersonalInfo = {
  name: "Djefrid Byli Fotue Kuate",
  title: "Développeur Web / Full-Stack Junior et Technicien en Informatique",
  stack: [
    // Frontend
    "HTML",
    "CSS",
    "JavaScript",
    "Vue.js",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Bootstrap",

    // Backend
    "Django",
    "Django REST Framework",
    ".NET",
    "ASP.NET Core",

    // Bases de données
    "PostgreSQL",
    "MySQL",
    "SQL",
    "Firestore",

    // Authentification
    "Firebase Authentication",

    // DevOps / Systèmes
    "Docker",
    "Git",
    "GitHub",
    "GitHub Actions",
    "Linux (Ubuntu, Debian)",
    "Proxmox",
    "VMware",

    // Outils & Méthodologies
    "Postman",
    "VS Code",
    "Azure DevOps",
    "Jira",
    "Agile",
    "Scrum",
    "UML"
  ],
  email: "djeffkuate@gmail.com",
  github: "https://github.com/Djefrid",
  linkedin: "https://www.linkedin.com/in/djefrid-byli-fotue-kuate-a30633225/",
  cvUrl: "C:\Users\djeff\OneDrive\Documents\Copie de CVDJEFRID 2.pdf"
};


export const aboutInfo: AboutInfo = {
  paragraphs: [
    "Diplômé d’un DEC en technique de l’informatique, je possède un profil polyvalent combinant le développement web et les compétences techniques en informatique et systèmes. Mon parcours m’a permis d’acquérir une base solide en programmation, en gestion des environnements informatiques et une méthodologie de travail rigoureuse.",
    "Lors de mon stage en développement web, j’ai travaillé sur des projets concrets en PHP avec phpMyAdmin, incluant la manipulation de bases de données et la mise à jour de fonctionnalités existantes. J’ai également conçu et configuré un environnement de développement local complet (serveur web, base de données, outils de développement) afin de tester, valider et visualiser mes travaux efficacement.",
    "En tant que technicien en informatique, je maîtrise l’installation, la configuration et la maintenance d’environnements Windows et Linux, l’utilisation de machines virtuelles, ainsi que les bases des services réseau et des outils collaboratifs.",
    "Je m’intéresse particulièrement à la qualité du code, aux bonnes pratiques de développement, à l’architecture logicielle et à la stabilité des environnements. Curieux et motivé, je cherche continuellement à approfondir mes compétences autant en développement qu’en infrastructure informatique."
  ],
  highlights: [
    "DEC en informatique – programmation & systèmes.",
    "Stage en développement web avec bases de données et environnement local.",
    "Orientation full-stack, vision globale du projet.",
    "Qualité du code, bonnes pratiques et rigueur technique."
  ]
};

export const projects: Project[] = [
   {
    id: "facttrack-saas",
    title: "Facttrack — SaaS de gestion de factures (Django DRF + Vue 3)",
    description:
      "SaaS de facturation avec gestion clients, création/gestion de factures, génération PDF et envoi email.",
    longDescription:
      "Facttrack est une application full-stack orientée SaaS pour créer, gérer et envoyer des factures. Le backend est construit avec Django REST Framework (API sécurisée JWT), et le frontend avec Vue 3 + Vite + TypeScript. L’interface inclut un tableau de bord, une gestion des clients et des factures, ainsi qu’un flux de création de facture complet (lignes, totaux, statut, aperçu).",
    stack: [
      "Django",
      "Django REST Framework",
      "Vue 3",
      "Vite",
      "TypeScript",
      "JWT",
      "SQLite (dev) / PostgreSQL (prod)",
      "Docker"
    ],
    features: [
      "Authentification JWT (accès API sécurisé)",
      "Gestion des clients (CRUD)",
      "Création de factures (lignes, totaux, statuts)",
      "Génération de facture en PDF",
      "Envoi de facture par email (mode console en dev + SMTP/SendGrid possible)",
      "Interface responsive (desktop/mobile)",
      "Multi-langue FR/EN (i18n) et formats adaptés"
    ],
    challenges: [
      "Mise en place d’une architecture API propre (DRF + serializers + services)",
      "Gestion fiable des montants (Decimal côté backend, formatage côté frontend)",
      "Synchronisation état UI / API (stores, chargement user connecté, erreurs 401)",
      "Structuration du projet pour un déploiement simple (Docker + environnement)"
    ],
    githubUrl: "https://github.com/Djefrid/facttrack",
    demoUrl: "https://facttrack.ca",
    image: "/projects/facttrack.png",
    featured: true
  }
];

export const skills: SkillCategory[] = [
  {
    category: "Frontend",
    skills: [
      { name: "React" },
      { name: "Next.js" },
      { name: "Vue.js" },
      { name: "TypeScript" },
      { name: "JavaScript" },
      { name: "HTML5" },
      { name: "CSS3" },
      { name: "Tailwind CSS" }
    ]
  },
  {
    category: "Backend",
    skills: [
      { name: "Django" },
      { name: "Django REST Framework" },
      { name: "Python" },
      { name: "Node.js" },
      { name: "API REST" }
    ]
  },
  {
    category: "Bases de données",
    skills: [
      { name: "PostgreSQL" },
      { name: "MySQL" },
      { name: "SQLite" },
      { name: "Redis" }
    ]
  },
  {
    category: "DevOps / Environnement",
    skills: [
      { name: "Docker" },
      { name: "Git" },
      { name: "GitHub Actions" },
      { name: "Linux" },
      { name: "CI/CD" },
      { name: "VS Code" }
    ]
  }
];
