import type { PersonalInfo, AboutInfo, Project, SkillCategory } from '@/types';

// ===== BILINGUAL DATA =====

export const personalInfoBilingual = {
  fr: {
    name: "Djefrid Byli",
    title: "Développeur Web / Full-Stack Junior et Technicien en Informatique",
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
      ".NET",
      "ASP.NET Core",
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
      "UML"
    ],
    email: "djeffkuate@gmail.com",
    github: "https://github.com/Djefrid",
    linkedin: "https://www.linkedin.com/in/djefrid-byli-fotue-kuate-a30633225/",
    cvUrl: "/Copie de CVDJEFRID 2.pdf"
  },
  en: {
    name: "Djefrid Byli",
    title: "Junior Web Developer/ Full-Stack & IT Technician",
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
      ".NET",
      "ASP.NET Core",
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
      "UML"
    ],
    email: "djeffkuate@gmail.com",
    github: "https://github.com/Djefrid",
    linkedin: "https://www.linkedin.com/in/djefrid-byli-fotue-kuate-a30633225/",
    cvUrl: "/Copie de CVDJEFRID 2.pdf"
  }
};

export const aboutInfoBilingual = {
  fr: {
    paragraphs: [
      "Diplômé d'un DEC en technique de l'informatique, je possède un profil polyvalent combinant le développement web et les compétences techniques en informatique et systèmes. Mon parcours m'a permis d'acquérir une base solide en programmation, en gestion des environnements informatiques et une méthodologie de travail rigoureuse.\n\nLors de mon stage en développement web, j'ai travaillé sur des projets concrets en PHP avec phpMyAdmin, incluant la manipulation de bases de données et la mise à jour de fonctionnalités existantes. J'ai également conçu et configuré un environnement de développement local complet.\n\nEn tant que technicien en informatique, je maîtrise l'installation, la configuration et la maintenance d'environnements Windows et Linux, l'utilisation de machines virtuelles, ainsi que les bases des services réseau.\n\nCurieux et motivé, je cherche continuellement à approfondir mes compétences autant en développement qu'en infrastructure informatique."
    ],
    highlights: [
      "DEC en informatique – programmation & systèmes.\nStage en développement web avec bases de données.\nOrientation full-stack, vision globale du projet.\nQualité du code et bonnes pratiques."
    ]
  },
  en: {
    paragraphs: [
      "Graduated with a Dec in computer technology, I have a versatile profile combining web development and technical skills in computer science and systems. My background has allowed me to acquire a solid foundation in programming, management of IT environments and a rigorous working methodology. During my internship in web development, I worked on concrete PHP projects with phpMyAdmin, including database manipulation and updating existing features. I also designed and configured a complete local development environment. As an IT technician, I master the installation, configuration and maintenance of Windows and Linux environments, the use of virtual machines, as well as the basics of network services. Curious and motivated, I continually seek to deepen my skills in both development and IT infrastructure."
    ],
    highlights: [
      "Dec in Computer Science – Programming & Systems.\nInternship in web development with databases.\nFull-stack orientation, overall vision of the project.\nCode quality and best practices."
    ]
  }
};

export const projectsBilingual = {
  fr: [
    {
      id: "facttrack-saas",
      title: "Facttrack — SaaS de gestion de factures",
      description: "SaaS de facturation avec gestion clients, création/gestion de factures, génération PDF et envoi email.",
      longDescription: "Facttrack est une application full-stack orientée SaaS pour créer, gérer et envoyer des factures. Le backend est construit avec Django REST Framework (API sécurisée JWT), et le frontend avec Vue 3 + Vite + TypeScript.",
      stack: ["Django", "Django REST Framework", "Vue 3", "Vite", "TypeScript", "JWT", "PostgreSQL", "Docker"],
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
      image: "/projects/facttrack.png",
      featured: true
    }
  ],
  en: [
    {
      id: "facttrack-saas",
      title: "Facttrack — Invoice Management SaaS",
      description: "Billing SaaS with client management, invoice creation/management, PDF generation and email sending.",
      longDescription: "Facttrack is a full-stack SaaS-oriented application for creating, managing and sending invoices. The backend is built with Django REST Framework (JWT secured API), and the frontend with Vue 3 + Vite + TypeScript.",
      stack: ["Django", "Django REST Framework", "Vue 3", "Vite", "TypeScript", "JWT", "PostgreSQL", "Docker"],
      features: [
        "Secure JWT authentication",
        "Client management (CRUD)",
        "Invoice creation with lines and totals",
        "PDF invoice generation",
        "Email invoice sending",
        "Responsive interface",
        "Multi-language FR/EN"
      ],
      challenges: [
        "Clean API architecture with DRF",
        "Reliable amount handling (Decimal)",
        "UI / API state synchronization",
        "Docker deployment"
      ],
      githubUrl: "https://github.com/Djefrid/facttrack",
      demoUrl: "https://facttrack.ca",
      image: "/projects/facttrack.png",
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
