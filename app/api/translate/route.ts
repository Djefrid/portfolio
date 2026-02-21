/**
 * ============================================================================
 * API DE TRADUCTION - Route Next.js pour traduire les contenus FR ↔ EN
 * ============================================================================
 *
 * Cette API traduit automatiquement les textes du profil et des projets
 * en utilisant l'API gratuite MyMemory (pas de clé API requise).
 *
 * Endpoint : POST /api/translate
 *
 * Body JSON attendu :
 *   {
 *     type: "profile" | "project",   // Type de données à traduire
 *     data: { ... },                  // Les données avec textes bilingues
 *     sourceLang: "fr" | "en"         // Langue source (traduit vers l'autre)
 *   }
 *
 * Limites de MyMemory :
 * - 500 caractères max par requête → le texte est découpé en chunks
 * - Délai de 100ms entre les requêtes pour éviter le rate limiting
 * - Nettoyage des balises HTML parasites dans les réponses
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

/** URL de l'API MyMemory (traduction gratuite, sans clé API) */
const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

/** Résultat d'une traduction */
interface TranslationResult {
  translatedText: string;
  success: boolean;
}

/**
 * Découpe un texte long en morceaux de 450 caractères max.
 * Essaie de couper aux limites de phrases pour garder un sens cohérent.
 */
function splitTextIntoChunks(text: string, maxLength: number = 450): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length + 1 <= maxLength) {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      // If single sentence is too long, split by newlines or just chunk it
      if (sentence.length > maxLength) {
        const parts = sentence.split('\n');
        for (const part of parts) {
          if (part.length <= maxLength) {
            chunks.push(part);
          } else {
            // Force split long text
            for (let i = 0; i < part.length; i += maxLength) {
              chunks.push(part.substring(i, i + maxLength));
            }
          }
        }
        currentChunk = '';
      } else {
        currentChunk = sentence;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.length > 0 ? chunks : [text.substring(0, maxLength)];
}

/** Traduit un seul morceau de texte via l'API MyMemory, avec nettoyage HTML */
async function translateSingleChunk(text: string, from: 'fr' | 'en', to: 'fr' | 'en'): Promise<string> {
  if (!text || text.trim() === '') {
    return '';
  }

  try {
    const langPair = `${from}|${to}`;
    const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      let translated = data.responseData.translatedText;
      // Clean up HTML tags that MyMemory sometimes adds
      translated = translated.replace(/<[^>]*>/g, '');
      // Decode common HTML entities
      translated = translated
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
      // Remove any remaining HTML-like artifacts
      translated = translated.replace(/<[^>]*>/g, '').trim();
      return translated;
    }

    console.error('Translation API response:', data);
    return text; // Return original if failed
  } catch (error) {
    console.error('Translation chunk error:', error);
    return text;
  }
}

/** Traduit un texte complet (découpe en chunks si nécessaire) */
async function translateText(text: string, from: 'fr' | 'en', to: 'fr' | 'en'): Promise<TranslationResult> {
  if (!text || text.trim() === '') {
    return { translatedText: '', success: true };
  }

  try {
    // Split long text into chunks
    const chunks = splitTextIntoChunks(text);

    // Translate each chunk with small delay to avoid rate limiting
    const translatedChunks: string[] = [];
    for (const chunk of chunks) {
      const translated = await translateSingleChunk(chunk, from, to);
      translatedChunks.push(translated);
      // Small delay between requests to avoid rate limiting
      if (chunks.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Join chunks and add line breaks after periods (sentence endings)
    let result = translatedChunks.join(' ');
    // Replace ". " (period + space) with ".\n" to create line breaks after each sentence
    result = result.replace(/\.\s+/g, '.\n');

    return {
      translatedText: result,
      success: true,
    };
  } catch (error) {
    console.error('Translation error:', error);
    return { translatedText: text, success: false };
  }
}

/** Traduit un tableau de textes (chaque élément traduit individuellement) */
async function translateArray(arr: string[], from: 'fr' | 'en', to: 'fr' | 'en'): Promise<string[]> {
  const results = await Promise.all(
    arr.map(async (item) => {
      const result = await translateText(item, from, to);
      return result.translatedText;
    })
  );
  return results;
}

/**
 * Handler POST /api/translate
 * Reçoit les données à traduire et retourne les données avec traductions ajoutées.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, sourceLang } = body;

    if (!sourceLang || (sourceLang !== 'fr' && sourceLang !== 'en')) {
      return NextResponse.json({ error: 'Invalid source language' }, { status: 400 });
    }

    const targetLang = sourceLang === 'fr' ? 'en' : 'fr';

    if (type === 'profile') {
      // Translate profile data
      const profile = data;

      // Translate title
      const translatedTitle = await translateText(
        profile.title[sourceLang],
        sourceLang,
        targetLang
      );
      profile.title[targetLang] = translatedTitle.translatedText;

      // Translate about paragraphs
      if (profile.about?.paragraphs) {
        const sourceParagraphs = profile.about.paragraphs[sourceLang] || [];
        profile.about.paragraphs[targetLang] = await translateArray(
          sourceParagraphs,
          sourceLang,
          targetLang
        );
      }

      // Translate about highlights
      if (profile.about?.highlights) {
        const sourceHighlights = profile.about.highlights[sourceLang] || [];
        profile.about.highlights[targetLang] = await translateArray(
          sourceHighlights,
          sourceLang,
          targetLang
        );
      }

      return NextResponse.json({ success: true, data: profile });
    } else if (type === 'project') {
      // Translate a single project
      const project = data;

      // Translate title
      const translatedTitle = await translateText(
        project.title[sourceLang],
        sourceLang,
        targetLang
      );
      project.title[targetLang] = translatedTitle.translatedText;

      // Translate description
      const translatedDesc = await translateText(
        project.description[sourceLang],
        sourceLang,
        targetLang
      );
      project.description[targetLang] = translatedDesc.translatedText;

      // Translate long description
      const translatedLongDesc = await translateText(
        project.longDescription[sourceLang],
        sourceLang,
        targetLang
      );
      project.longDescription[targetLang] = translatedLongDesc.translatedText;

      // Translate features
      if (project.features) {
        const sourceFeatures = project.features[sourceLang] || [];
        project.features[targetLang] = await translateArray(
          sourceFeatures,
          sourceLang,
          targetLang
        );
      }

      // Translate challenges
      if (project.challenges) {
        const sourceChallenges = project.challenges[sourceLang] || [];
        project.challenges[targetLang] = await translateArray(
          sourceChallenges,
          sourceLang,
          targetLang
        );
      }

      return NextResponse.json({ success: true, data: project });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Translation failed', details: String(error) },
      { status: 500 }
    );
  }
}
