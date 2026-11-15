/**
 * A short id for one uploaded PDF: Sanity names a file asset by its content
 * hash (`…/files/<project>/<dataset>/<sha1>.pdf`), so a new upload changes it.
 */
export function pdfVersion(pdfUrl: string) {
  return pdfUrl.split("/").pop()?.replace(/\.pdf$/i, "").slice(0, 12) ?? "";
}
