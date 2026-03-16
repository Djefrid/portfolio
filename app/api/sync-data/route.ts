/**
 * ============================================================================
 * API SYNCHRONISATION DONNÉES — app/api/sync-data/route.ts
 * ============================================================================
 *
 * Route API qui met à jour le fichier `data/portfolio-data.ts` avec les
 * nouvelles données sauvegardées depuis le panneau d'administration.
 *
 * Endpoint : POST /api/sync-data
 *
 * Body JSON attendu :
 *   {
 *     type: "profile" | "projects",  // Type de données à synchroniser
 *     data: ProfileData | ProjectData[]  // Les données à écrire
 *   }
 *
 * Pourquoi synchroniser avec un fichier local ?
 *   En développement, Firebase est la source de vérité principale.
 *   Mais le fichier portfolio-data.ts sert de fallback statique.
 *   La synchronisation garantit que le fallback reste à jour avec Firebase.
 *
 * Comportement en production :
 *   En production (Vercel), le système de fichiers est en lecture seule.
 *   Cette API retourne donc immédiatement un succès sans rien écrire.
 *   Les données sont déjà sauvegardées dans Firebase par le caller.
 *
 * Fonctionnement technique :
 *   1. Lit le contenu actuel de portfolio-data.ts
 *   2. Remplace les sections concernées via des regex
 *   3. Réécrit le fichier avec le nouveau contenu
 *
 * Sécurité :
 *   - Uniquement disponible en développement local
 *   - Pas d'authentification car ce n'est accessible que localement
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Texte bilingue : la même information en français et en anglais.
 */
interface BilingualText {
  fr: string;
  en: string;
}

/**
 * Tableau bilingue : une liste d'éléments en français et en anglais.
 */
interface BilingualArray {
  fr: string[];
  en: string[];
}

/**
 * Structure d'un profil telle qu'attendue par cette API.
 * Correspond au format bilingue sauvegardé dans Firestore.
 */
interface ProfileData {
  name: string;
  title: BilingualText;
  stack: string[];
  email: string;
  github: string;
  linkedin: string;
  cvUrl: string;
  location?: string;
  openToWork?: boolean;
  about: {
    paragraphs: BilingualArray;
    highlights: BilingualArray;
  };
}

/**
 * Structure d'un projet tel qu'attendu par cette API.
 */
interface ProjectData {
  id?: string;
  title: BilingualText;
  description: BilingualText;
  longDescription: BilingualText;
  stack: string[];
  features: BilingualArray;
  challenges: BilingualArray;
  githubUrl: string;
  demoUrl?: string;
  image: string;
  featured: boolean;
  order: number;
  published: boolean;
}

/**
 * Formate un tableau de chaînes en code TypeScript lisible.
 * - Tableau court (≤3 éléments, tous courts) → format inline : ["a", "b", "c"]
 * - Tableau long → format multiligne avec indentation
 *
 * @param arr    - Le tableau à formatter
 * @param indent - Niveau d'indentation (en unités de 2 espaces)
 */
function formatArray(arr: string[], indent: number): string {
  const indentStr = '  '.repeat(indent);
  if (arr.length === 0) return '[]';
  if (arr.length <= 3 && arr.every(s => s.length < 20)) {
    return `[${arr.map(s => `"${escapeString(s)}"`).join(', ')}]`;
  }
  const items = arr.map(s => `${indentStr}  "${escapeString(s)}"`).join(',\n');
  return `[\n${items}\n${indentStr}]`;
}

/**
 * Échappe les caractères spéciaux dans une chaîne pour l'inclure dans du code TypeScript.
 * - Backslash → double backslash (pour que les chemins restent valides)
 * - Guillemets → échappés (pour ne pas casser les strings TypeScript)
 * - Sauts de ligne → \n (pour les textes multi-paragraphes)
 *
 * @param s - La chaîne à échapper
 */
function escapeString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

/**
 * Génère le code TypeScript de la section `personalInfoBilingual`
 * à partir des données du profil.
 *
 * @param profile - Données du profil avec titre et stack bilingues
 */
function generateProfileSection(profile: ProfileData): string {
  const locationLine = profile.location ? `,\n    location: "${escapeString(profile.location)}"` : '';
  const openToWorkLine = profile.openToWork !== undefined ? `,\n    openToWork: ${profile.openToWork}` : '';
  return `export const personalInfoBilingual = {
  fr: {
    name: "${escapeString(profile.name)}",
    title: "${escapeString(profile.title.fr)}",
    stack: ${formatArray(profile.stack, 2)},
    email: "${escapeString(profile.email)}",
    github: "${escapeString(profile.github)}",
    linkedin: "${escapeString(profile.linkedin)}",
    cvUrl: "${escapeString(profile.cvUrl)}"${locationLine}${openToWorkLine}
  },
  en: {
    name: "${escapeString(profile.name)}",
    title: "${escapeString(profile.title.en)}",
    stack: ${formatArray(profile.stack, 2)},
    email: "${escapeString(profile.email)}",
    github: "${escapeString(profile.github)}",
    linkedin: "${escapeString(profile.linkedin)}",
    cvUrl: "${escapeString(profile.cvUrl)}"${locationLine}${openToWorkLine}
  }
};`;
}

/**
 * Génère le code TypeScript de la section `aboutInfoBilingual`.
 * Gère les paragraphes et points clés en français et en anglais.
 *
 * @param profile - Données du profil contenant la section `about`
 */
function generateAboutSection(profile: ProfileData): string {
  const frParagraphs = profile.about.paragraphs.fr.map(p => `      "${escapeString(p)}"`).join(',\n');
  const enParagraphs = profile.about.paragraphs.en.map(p => `      "${escapeString(p)}"`).join(',\n');
  const frHighlights = profile.about.highlights.fr.map(h => `      "${escapeString(h)}"`).join(',\n');
  const enHighlights = profile.about.highlights.en.map(h => `      "${escapeString(h)}"`).join(',\n');

  return `export const aboutInfoBilingual = {
  fr: {
    paragraphs: [
${frParagraphs}
    ],
    highlights: [
${frHighlights}
    ]
  },
  en: {
    paragraphs: [
${enParagraphs}
    ],
    highlights: [
${enHighlights}
    ]
  }
};`;
}

/**
 * Génère le code TypeScript de la section `projectsBilingual`.
 * Crée les versions FR et EN de chaque projet.
 *
 * @param projects - Tableau de projets avec textes bilingues
 */
function generateProjectsSection(projects: ProjectData[]): string {
  /**
   * Génère le code d'un projet pour une langue donnée.
   * Extrait les textes bilingues pour la langue spécifiée.
   */
  const generateProject = (project: ProjectData, lang: 'fr' | 'en') => {
    // Extraction des textes selon le format (bilingue ou legacy)
    const title = typeof project.title === 'object' ? project.title[lang] : project.title;
    const description = typeof project.description === 'object' ? project.description[lang] : project.description;
    const longDescription = typeof project.longDescription === 'object' ? project.longDescription[lang] : project.longDescription;
    const features = typeof project.features === 'object' && 'fr' in project.features
      ? (project.features as BilingualArray)[lang]
      : project.features as string[];
    const challenges = typeof project.challenges === 'object' && 'fr' in project.challenges
      ? (project.challenges as BilingualArray)[lang]
      : project.challenges as string[];

    return `    {
      id: "${escapeString(project.id || '')}",
      title: "${escapeString(title as string)}",
      description: "${escapeString(description as string)}",
      longDescription: "${escapeString(longDescription as string)}",
      stack: ${formatArray(project.stack, 3)},
      features: [
${features.map((f: string) => `        "${escapeString(f)}"`).join(',\n')}
      ],
      challenges: [
${challenges.map((c: string) => `        "${escapeString(c)}"`).join(',\n')}
      ],
      githubUrl: "${escapeString(project.githubUrl)}",
      ${project.demoUrl ? `demoUrl: "${escapeString(project.demoUrl)}",` : ''}
      image: "${escapeString(project.image)}",
      featured: ${project.featured}
    }`;
  };

  const frProjects = projects.map(p => generateProject(p, 'fr')).join(',\n');
  const enProjects = projects.map(p => generateProject(p, 'en')).join(',\n');

  return `export const projectsBilingual = {
  fr: [
${frProjects}
  ],
  en: [
${enProjects}
  ]
};`;
}

/**
 * Handler POST /api/sync-data
 * Reçoit les données et met à jour les sections correspondantes dans portfolio-data.ts.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // En production (Vercel), le système de fichiers est en lecture seule.
    // Les données ont déjà été sauvegardées dans Firebase par le caller.
    // On retourne un succès sans écrire.
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      return NextResponse.json({
        success: true,
        message: 'Skipped file sync (production mode - data saved to Firebase only)'
      });
    }

    // Lecture du fichier portfolio-data.ts actuel
    const filePath = path.join(process.cwd(), 'data', 'portfolio-data.ts');
    let content = await fs.readFile(filePath, 'utf-8');

    if (type === 'profile') {
      const profile = data as ProfileData;

      // Remplacement de la section personalInfoBilingual par la nouvelle version
      const personalInfoRegex = /export const personalInfoBilingual = \{[\s\S]*?\n\};/;
      const newPersonalInfo = generateProfileSection(profile);
      content = content.replace(personalInfoRegex, newPersonalInfo);

      // Remplacement de la section aboutInfoBilingual par la nouvelle version
      const aboutInfoRegex = /export const aboutInfoBilingual = \{[\s\S]*?\n\};/;
      const newAboutInfo = generateAboutSection(profile);
      content = content.replace(aboutInfoRegex, newAboutInfo);

    } else if (type === 'projects') {
      const projects = data as ProjectData[];

      // Remplacement de la section projectsBilingual par la nouvelle version
      const projectsRegex = /export const projectsBilingual = \{[\s\S]*?\n\};/;
      const newProjects = generateProjectsSection(projects);
      content = content.replace(projectsRegex, newProjects);

    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Écriture du fichier mis à jour
    await fs.writeFile(filePath, content, 'utf-8');

    return NextResponse.json({ success: true, message: 'Data synced to portfolio-data.ts' });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync data', details: String(error) },
      { status: 500 }
    );
  }
}
