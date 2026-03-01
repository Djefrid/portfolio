/**
 * ============================================================================
 * API DE TRADUCTION - Route Next.js pour traduire les contenus FR ↔ EN
 * ============================================================================
 *
 * Cette API traduit automatiquement les textes du profil et des projets
 * en utilisant l'API DeepL (plan Free : 500 000 caractères/mois).
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
 * Avantages DeepL vs MyMemory :
 * - 500 000 chars/mois gratuits (vs ~1 000 mots/jour pour MyMemory)
 * - Meilleure qualité FR↔EN du marché
 * - Pas de découpage en chunks requis (jusqu'à 128KB par requête)
 * - Pas d'artefacts HTML dans les réponses
 * - Requête par clé API dans DEEPL_API_KEY (.env.local)
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

/** URL de l'API DeepL Free */
const DEEPL_API = 'https://api-free.deepl.com/v2/translate';

/** Résultat d'une traduction */
interface TranslationResult {
  translatedText: string;
  success: boolean;
}

/**
 * Traduit un texte via DeepL.
 * Conserve les sauts de ligne et la structure du texte original.
 */
async function translateText(text: string, from: 'fr' | 'en', to: 'fr' | 'en'): Promise<TranslationResult> {
  if (!text || text.trim() === '') {
    return { translatedText: '', success: true };
  }

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    console.error('DEEPL_API_KEY manquant dans .env.local');
    return { translatedText: text, success: false };
  }

  try {
    const targetLang = to === 'en' ? 'EN-US' : 'FR';

    const response = await fetch(DEEPL_API, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        source_lang: from.toUpperCase(),
        target_lang: targetLang,
      }),
    });

    const data = await response.json();

    if (data.translations && data.translations[0]?.text) {
      return { translatedText: data.translations[0].text, success: true };
    }

    console.error('DeepL API response:', data);
    return { translatedText: text, success: false };
  } catch (error) {
    console.error('Translation error:', error);
    return { translatedText: text, success: false };
  }
}

/**
 * Traduit un tableau de textes en une seule requête DeepL.
 * Plus efficace que plusieurs appels individuels.
 * traduction exelente
 */
async function translateArray(arr: string[], from: 'fr' | 'en', to: 'fr' | 'en'): Promise<string[]> {
  if (arr.length === 0) return [];

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    console.error('DEEPL_API_KEY manquant dans .env.local');
    return arr;
  }

  try {
    const targetLang = to === 'en' ? 'EN-US' : 'FR';

    const response = await fetch(DEEPL_API, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: arr,
        source_lang: from.toUpperCase(),
        target_lang: targetLang,
      }),
    });

    const data = await response.json();

    if (data.translations) {
      return data.translations.map((t: { text: string }) => t.text);
    }

    console.error('DeepL array response:', data);
    return arr;
  } catch (error) {
    console.error('Array translation error:', error);
    return arr;
  }
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
