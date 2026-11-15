import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { pdfVersion } from "@/lib/notes/version";
import { watermarkPdf } from "@/lib/notes/watermark";
import { getStudyNote } from "@/lib/sanity/queries";

/**
 * `/notes/<slug>/pdf` — the note's PDF as students download it: the file the
 * editor uploaded to Sanity, with the VidyantIAS watermark stamped on every
 * page. Editors upload a plain PDF; nothing needs watermarking by hand.
 *
 * Links carry `?v=<asset hash>` (see `pdfDownloadHref`), so a new upload gets
 * a new URL and each version can be cached at the CDN for good.
 */
export async function GET(request: Request, { params }: RouteContext<"/[lang]/notes/[slug]/pdf">) {
  const { lang, slug } = await params;
  const note = await getStudyNote(slug, isLocale(lang) ? lang : DEFAULT_LOCALE);
  if (!note) return new Response("Not found", { status: 404 });

  // The PDF can pass the 2 MB data-cache limit; the response is CDN-cached instead.
  const source = await fetch(note.pdfUrl, { cache: "no-store" });
  if (!source.ok) return new Response("PDF unavailable", { status: 502 });

  let body: Uint8Array;
  try {
    body = await watermarkPdf(await source.arrayBuffer());
  } catch (error) {
    // A PDF pdf-lib cannot parse still reaches the student, unstamped.
    console.error("[notes] watermark failed", slug, error);
    return Response.redirect(`${note.pdfUrl}?dl=${encodeURIComponent(`${slug}.pdf`)}`, 302);
  }

  return new Response(body as BodyInit, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${slug}.pdf"`,
      // Only a URL naming the current upload is cacheable for good; a bare or
      // stale one must pick up a replaced PDF soon.
      "cache-control":
        new URL(request.url).searchParams.get("v") === pdfVersion(note.pdfUrl)
          ? "public, max-age=86400, s-maxage=31536000, immutable"
          : "public, max-age=300, s-maxage=300",
    },
  });
}
