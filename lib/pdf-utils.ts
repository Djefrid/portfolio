'use client';

/* ─────────────────────────────────────────────────────────────────
   PDF Utilities
   - extractTextFromPdf  : extrait le texte brut d'un PDF (pdfjs-dist)
───────────────────────────────────────────────────────────────── */

// ── Extraction de texte ───────────────────────────────────────────
export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  // Web Worker (CDN)
  pdfjs.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lines   = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str as string)
      .join(' ')
      .trim();
    if (lines) pages.push(lines);
  }

  return pages.join('\n\n');
}
