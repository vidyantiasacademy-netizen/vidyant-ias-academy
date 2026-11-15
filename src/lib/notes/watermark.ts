import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { PDFDocument } from "pdf-lib";

/**
 * The VidyantIAS logo with its tagline, on a transparent background
 * (`src/assets/note-watermark.png`). Read once per server instance.
 */
let watermarkPng: Promise<Buffer> | null = null;
const loadWatermark = () =>
  (watermarkPng ??= readFile(join(process.cwd(), "src/assets/note-watermark.png")));

/** Share of the page width the logo spans. */
const WIDTH_SHARE = 0.72;
/**
 * The PNG is already pale (its alpha carries the fade); this keeps it under
 * the text when printed, so the note stays easy to read.
 */
const OPACITY = 0.55;

/**
 * Stamps the logo across the middle of every page of a note PDF. Drawn over
 * the content, not under it: many PDFs paint a white page background, which
 * would hide a watermark placed beneath.
 */
export async function watermarkPdf(source: ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(source, { ignoreEncryption: true });
  const logo = await pdf.embedPng(await loadWatermark());

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const w = width * WIDTH_SHARE;
    const h = (logo.height / logo.width) * w;
    page.drawImage(logo, {
      x: (width - w) / 2,
      y: (height - h) / 2,
      width: w,
      height: h,
      opacity: OPACITY,
    });
  }

  return pdf.save();
}
