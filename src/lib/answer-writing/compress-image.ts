/**
 * Shrinks a photographed answer page on the device before it is uploaded.
 *
 * A phone photo of an A4 page is 3–8 MB; a 20-page booklet is then 100 MB on a
 * mobile connection, most of it sensor noise. Re-encoded at 2200 px on the long
 * edge — about 190 dpi on A4, comfortably legible handwriting — the same page is
 * typically 400–900 KB.
 *
 * Browser-only. Every failure falls back to the original file: an upload that
 * is larger than it needed to be is better than no upload at all. PDFs are
 * passed through untouched — re-rendering one would rasterise it.
 */

const MAX_EDGE = 2200;
const QUALITY = 0.82;
/** A JPEG this small and already within the edge limit is not worth re-encoding. */
const SMALL_ENOUGH = 1.2 * 1024 * 1024;

export async function compressForUpload(file: File): Promise<File> {
  if (file.type !== "image/jpeg" && file.type !== "image/png") return file;
  if (typeof createImageBitmap !== "function") return file;

  let bitmap: ImageBitmap | null = null;

  try {
    // `from-image` applies the EXIF rotation, so a portrait photo stays upright.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.type === "image/jpeg" && file.size <= SMALL_ENOUGH) return file;

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const blob = await encodeJpeg(bitmap, width, height);
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}

async function encodeJpeg(bitmap: ImageBitmap, width: number, height: number): Promise<Blob | null> {
  // Off the main thread's canvas where the browser has one, so a burst of
  // twenty pages does not stall the page.
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");
    if (!context) return null;

    paint(context, bitmap, width, height);
    return canvas.convertToBlob({ type: "image/jpeg", quality: QUALITY });
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return null;

  paint(context, bitmap, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
}

function paint(
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  bitmap: ImageBitmap,
  width: number,
  height: number,
) {
  // JPEG has no transparency: a transparent PNG would otherwise turn black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);
}
