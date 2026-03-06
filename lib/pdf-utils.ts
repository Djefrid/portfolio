'use client';

/* ─────────────────────────────────────────────────────────────────
   PDF Utilities
   - extractTextFromPdf  : extrait le texte brut d'un PDF (pdfjs-dist)
   - fillAndDownloadPdf  : remplit les champs AcroForm (pdf-lib)
   - signAndDownloadPdf  : ajoute une signature manuscrite (pdf-lib)
───────────────────────────────────────────────────────────────── */

// ── Extraction de texte ───────────────────────────────────────────
export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  // Web Worker (copié dans /public via next.config)
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

// ── Lire les champs d'un formulaire PDF ──────────────────────────
export async function readPdfFormFields(file: File): Promise<{ name: string; type: string; value: string }[]> {
  const { PDFDocument } = await import('pdf-lib');
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const form   = pdfDoc.getForm();
  const fields = form.getFields();

  return fields.map(f => ({
    name:  f.getName(),
    type:  f.constructor.name.replace('PDF', '').replace('Field', ''),
    value: (() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const v = (f as any).getText?.() ?? (f as any).isChecked?.() ?? '';
        return String(v);
      } catch { return ''; }
    })(),
  }));
}

// ── Remplir + télécharger un formulaire PDF ──────────────────────
export async function fillAndDownloadPdf(
  file: File,
  formData: Record<string, string>,
  filename = 'formulaire_rempli',
): Promise<void> {
  const { PDFDocument } = await import('pdf-lib');
  const bytes  = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const form   = pdfDoc.getForm();

  for (const [fieldName, value] of Object.entries(formData)) {
    try {
      const field = form.getField(fieldName);
      const type  = field.constructor.name;
      if (type.includes('Text'))     (field as import('pdf-lib').PDFTextField).setText(value);
      else if (type.includes('CheckBox') && value === 'true')
        (field as import('pdf-lib').PDFCheckBox).check();
      else if (type.includes('Dropdown'))
        (field as import('pdf-lib').PDFDropdown).select(value);
    } catch { /* champ inexistant ou type incompatible */ }
  }

  const filledBytes = await pdfDoc.save();
  downloadBytes(filledBytes, `${filename}.pdf`, 'application/pdf');
}

// ── Signer + télécharger un PDF ──────────────────────────────────
export async function signAndDownloadPdf(
  file: File,
  signatureDataUrl: string,
  position: { x: number; y: number; width: number; height: number; page: number },
  filename = 'document_signé',
): Promise<void> {
  const { PDFDocument } = await import('pdf-lib');
  const bytes  = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  // Convertir le dataURL PNG en bytes
  const pngBase64 = signatureDataUrl.split(',')[1];
  const pngBytes  = Uint8Array.from(atob(pngBase64), c => c.charCodeAt(0));
  const pngImage  = await pdfDoc.embedPng(pngBytes);

  const pages = pdfDoc.getPages();
  const page  = pages[Math.min(position.page, pages.length - 1)] ?? pages[0];
  const { height: pageHeight } = page.getSize();

  page.drawImage(pngImage, {
    x:      position.x,
    y:      pageHeight - position.y - position.height, // PDF coords = bas de page
    width:  position.width,
    height: position.height,
    opacity: 0.95,
  });

  const signedBytes = await pdfDoc.save();
  downloadBytes(signedBytes, `${filename}.pdf`, 'application/pdf');
}

// ── Helper téléchargement ─────────────────────────────────────────
function downloadBytes(bytes: Uint8Array<ArrayBufferLike>, filename: string, mime: string) {
  const blob = new Blob([new Uint8Array(bytes)], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
