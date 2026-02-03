import type { PersonalInfo, AboutInfo, Project, SkillCategory } from '@/types';

export const personalInfo: PersonalInfo = {
  name: "Djefrid Byli Fotue Kuate",
  title: "Développeur Web / Full-Stack Junior",
  stack: ["Django", "Vue.js", "React", "Next.js"],
  email: "djeffkuate@gmail.com",
  github: "https://github.com/votre-username",
  linkedin: "https://www.linkedin.com/in/djefrid-byli-fotue-kuate-a30633225/",
  cvUrl: "/cv.pdf"
};

export const aboutInfo: AboutInfo = {
  paragraphs: [
    "Diplômé d'un DEC en informatique, je suis passionné par le développement web et les technologies modernes. Mon parcours m'a permis d'acquérir une solide base en programmation et une méthodologie de travail rigoureuse.",
    "Durant mon stage en développement web, j'ai eu l'opportunité de travailler sur des projets concrets utilisant Django et Vue.js, renforçant ainsi mes compétences en développement full-stack.",
    "Je m'intéresse particulièrement à la qualité du code, aux bonnes pratiques de développement et à l'architecture logicielle. Je cherche continuellement à améliorer mes compétences et à apprendre de nouvelles technologies."
  ],
  highlights: [
    "Formation DEC en informatique",
    "Stage en développement web",
    "Passion pour le full-stack",
    "Focus sur la qualité et les bonnes pratiques"
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
