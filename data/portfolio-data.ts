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
    id: "projet-fullstack",
    title: "Application Full-Stack Django + Vue.js",
    description: "Application web complète avec authentification, CRUD et API REST.",
    longDescription: "Une application full-stack moderne démontrant mes compétences en développement backend et frontend. L'architecture suit les meilleures pratiques avec une séparation claire des responsabilités.",
    stack: ["Django", "Django REST Framework", "Vue.js", "PostgreSQL", "Docker"],
    features: [
      "Authentification JWT sécurisée",
      "API RESTful complète",
      "Interface utilisateur réactive",
      "Gestion CRUD des données",
      "Base de données PostgreSQL",
      "Conteneurisation Docker"
    ],
    challenges: [
      "Implémentation de l'authentification JWT avec refresh tokens",
      "Optimisation des requêtes N+1 avec Django ORM",
      "Gestion du state côté frontend avec Pinia"
    ],
    githubUrl: "https://github.com/votre-username/projet-fullstack",
    demoUrl: "https://projet-fullstack-demo.vercel.app",
    image: "/projects/fullstack.png",
    featured: true
  },
  {
    id: "app-react-moderne",
    title: "Application React Moderne",
    description: "Application web React avec consommation d'API et state management.",
    longDescription: "Application frontend moderne construite avec React et Next.js, démontrant une maîtrise des concepts avancés de React et des bonnes pratiques de développement.",
    stack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "React Query"],
    features: [
      "Consommation d'API externes",
      "State management avec React Query",
      "Design responsive mobile-first",
      "Typage strict TypeScript",
      "Optimisation des performances"
    ],
    challenges: [
      "Gestion du cache et de l'invalidation avec React Query",
      "Implémentation du SSR avec Next.js",
      "Optimisation du bundle size"
    ],
    githubUrl: "https://github.com/votre-username/app-react",
    demoUrl: "https://app-react-demo.vercel.app",
    image: "/projects/react-app.png",
    featured: true
  },
  {
    id: "api-django-docker",
    title: "API Django Dockerisée avec CI/CD",
    description: "API REST Django avec pipeline CI/CD et documentation complète.",
    longDescription: "Projet démontrant mes compétences en DevOps et qualité logicielle. API Django conteneurisée avec tests automatisés et déploiement continu.",
    stack: ["Django", "Django REST Framework", "Docker", "GitHub Actions", "PostgreSQL"],
    features: [
      "API RESTful documentée avec Swagger",
      "Conteneurisation Docker complète",
      "Pipeline CI/CD avec GitHub Actions",
      "Tests unitaires et d'intégration",
      "Linting et formatage automatique"
    ],
    challenges: [
      "Configuration du multi-stage Docker build",
      "Mise en place des tests automatisés dans la CI",
      "Gestion des variables d'environnement sécurisées"
    ],
    githubUrl: "https://github.com/votre-username/api-django-docker",
    image: "/projects/api-docker.png",
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
