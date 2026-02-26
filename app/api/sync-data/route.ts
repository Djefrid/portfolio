import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// This API route updates the portfolio-data.ts file with new data from the admin panel
// It should only be called in development mode or with proper authentication

interface BilingualText {
  fr: string;
  en: string;
}

interface BilingualArray {
  fr: string[];
  en: string[];
}

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

function formatArray(arr: string[], indent: number): string {
  const indentStr = '  '.repeat(indent);
  if (arr.length === 0) return '[]';
  if (arr.length <= 3 && arr.every(s => s.length < 20)) {
    return `[${arr.map(s => `"${escapeString(s)}"`).join(', ')}]`;
  }
  const items = arr.map(s => `${indentStr}  "${escapeString(s)}"`).join(',\n');
  return `[\n${items}\n${indentStr}]`;
}

function escapeString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

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

function generateProjectsSection(projects: ProjectData[]): string {
  const generateProject = (project: ProjectData, lang: 'fr' | 'en') => {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // Skip file sync in production (Vercel has read-only filesystem)
    // Data is already saved to Firebase, this is just for local development
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      return NextResponse.json({
        success: true,
        message: 'Skipped file sync (production mode - data saved to Firebase only)'
      });
    }

    // Read the current file
    const filePath = path.join(process.cwd(), 'data', 'portfolio-data.ts');
    let content = await fs.readFile(filePath, 'utf-8');

    if (type === 'profile') {
      const profile = data as ProfileData;

      // Replace personalInfoBilingual section
      const personalInfoRegex = /export const personalInfoBilingual = \{[\s\S]*?\n\};/;
      const newPersonalInfo = generateProfileSection(profile);
      content = content.replace(personalInfoRegex, newPersonalInfo);

      // Replace aboutInfoBilingual section
      const aboutInfoRegex = /export const aboutInfoBilingual = \{[\s\S]*?\n\};/;
      const newAboutInfo = generateAboutSection(profile);
      content = content.replace(aboutInfoRegex, newAboutInfo);
    } else if (type === 'projects') {
      const projects = data as ProjectData[];

      // Replace projectsBilingual section
      const projectsRegex = /export const projectsBilingual = \{[\s\S]*?\n\};/;
      const newProjects = generateProjectsSection(projects);
      content = content.replace(projectsRegex, newProjects);
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Write the updated file
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
