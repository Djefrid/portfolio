'use client';

/**
 * Import un fichier .docx et retourne du HTML compatible TipTap
 */
export async function importDocx(file: File): Promise<string> {
  const mammoth = (await import('mammoth')).default;
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer }, {
    styleMap: [
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Code']      => pre > code:fresh",
    ],
  });
  if (result.messages.length) {
    console.warn('[mammoth] warnings:', result.messages.map(m => m.message));
  }
  return result.value || '<p></p>';
}

/**
 * Exporte le HTML TipTap en fichier .docx et le télécharge
 */
export async function exportDocx(html: string, filename = 'note'): Promise<void> {
  // Import dynamique — le bundle est lourd (~1 MB)
  const HTMLtoDOCX = (await import('@turbodocx/html-to-docx')).default;

  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;

  const blob = await HTMLtoDOCX(fullHtml, null, {
    table:  { row: { cantSplit: true } },
    footer: false,
    font:   'Calibri',
    fontSize: 24, // 12pt en demi-points
  }) as Blob;

  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = `${filename.replace(/[^a-zA-Z0-9_-]/g, '_') || 'note'}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
